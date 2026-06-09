import os
import csv
import logging
import psycopg2
import pandas as pd

from simhash2_optimized import Simhash, SimhashIndex, build_simhash_clusters
from tqdm import tqdm

########################## Logging #########################
formatter = logging.Formatter(
    '%(asctime)s %(levelname)-8s %(funcName)-30s %(message)s'
)
fh = logging.FileHandler(f"{os.path.basename(__file__)}.log")
sh = logging.StreamHandler()
fh.setLevel(logging.DEBUG)
fh.setFormatter(formatter)
sh.setFormatter(formatter)
sh.setLevel(logging.ERROR)
logger = logging.getLogger(__name__)
logger.addHandler(fh)
logger.addHandler(sh)
logger.setLevel(logging.DEBUG)
logger.propagate = False
############################################################

########################## VARIABLES #######################
CONSTRING = "user=  password= host= port= dbname="
DATA_PATH       = os.path.join(os.getcwd(), '..', '..', '..', '02_Data', 'js_hashes')
HASH_CSV_PATH   = os.path.join(DATA_PATH, "all_hashes - EU1.csv")
BENCHMARK_FILE  = os.path.join(DATA_PATH, "benchmarks.csv")
OUTPUT_FILE     = os.path.join(DATA_PATH, "JavaScript_Cluster_EU1.csv")

BROWSER_ID      = "openwpm_native_eu_1_omaticall"
BENCHMARK_DATASET = {}   # same as before...
############################################################

########################## DB HANDLER ######################
def getJavaScriptsBuffered(query, batch_size=5000):
    """
    Stream the SQL rows in batches via a server-side cursor.
    Yields one row tuple at a time.
    """
    conn = psycopg2.connect(CONSTRING)
    # name= makes it a server-side cursor
    cur = conn.cursor(name="js_stream_cursor")
    cur.itersize = batch_size
    cur.execute(query)
    i = 0
    while True:
        rows = cur.fetchmany(batch_size)
        if not rows:
            break
        for row in rows:
            i += 1
            yield row
    cur.close()
    conn.close()
    logger.debug(f"Read {i} rows from query")

def getExpectedRows():
    conn = psycopg2.connect(CONSTRING)
    cur = conn.cursor()
    cur.execute(getCountQuery())
    total_rows = cur.fetchone()[0]
    cur.close()
    conn.close()
    logging.info("Expecting %d JavaScript rows", total_rows)
    return total_rows

def getCountQuery():
    return f"SELECT COUNT(*) FROM ({getJavaScriptsQuery()}) AS sub;"

def getJavaScriptsQuery():
    return f"""
        SELECT DISTINCT
            req.browser_id,
            req.visit_id,
            req.top_level_url,
            res.url AS response_url,
            req.url AS request_url,
            res.content_hash
        FROM responses res
        JOIN requests req
          ON req.visit_id = res.visit_id
         AND req.browser_id = res.browser_id
        WHERE is_javascript = TRUE
          AND res.content_hash IS NOT NULL
          AND req.browser_id = '{BROWSER_ID}'
          AND req.is_third_party_channel = 0;
    """

class SizedIterator:
    """
    Wrap an iterator so that len(wrapped)==known_length,
    and iter(wrapped) yields exactly that sequence of items.
    """
    def __init__(self, iterator, length):
        self._it = iterator
        self._length = length

    def __iter__(self):
        return self._it

    def __len__(self):
        return self._length
############################################################

########################## PATH & HASH MAP #################
def load_hash_map(csv_path):
    """
    Load the CSV that maps content_hash → simhash.
    Expect columns: 'content_hash' and 'simhash'. The 'simhash' column
    may be hexadecimal strings (with or without '0x' prefix) or integers.
    Returns a dict: { content_hash (str) : simhash_int }.
    """
    if not os.path.isfile(csv_path):
        logger.error(f"Hash-CSV not found: {csv_path}")
        return {}

    try:
        df = pd.read_csv(csv_path, dtype=str)
    except Exception:
        logger.exception(f"Failed to read CSV: {csv_path}")
        return {}

    if 'content_hash' not in df.columns or 'simhash_hex' not in df.columns:
        logger.error("CSV must contain 'content_hash' and 'simhash' columns")
        return {}

    hash_map = {}
    for idx, row in df.iterrows():
        ch = row['content_hash']
        sh_val = row['simhash_hex'].strip()

        # Determine if simhash is hex or decimal
        try:
            if sh_val.lower().startswith("0x"):
                sim_int = int(sh_val, 16)
            else:
                # Try interpreting as hex without '0x'
                # If that fails, fall back to int decimal
                try:
                    sim_int = int(sh_val, 16)
                except ValueError:
                    sim_int = int(sh_val)
        except Exception:
            logger.exception(f"Invalid simhash '{sh_val}' at row {idx}")
            continue

        hash_map[ch] = sim_int

    logger.info("Loaded %d entries from hash CSV", len(hash_map))
    return hash_map
############################################################

###################### OBJECT GENERATOR ####################
def getObjList_from_iterator(rows_iter, hash_map):
    """
    Given a row iterator and the prebuilt hash_map,
    yield (response_url, Simhash_instance) for each match.
    """
    for row in rows_iter:
        content_hash = str(row[5])
        sim_int = hash_map.get(content_hash)
        if sim_int is None:
            continue
        yield (str(row[3]), Simhash(sim_int))

def getBenchmarks(benchmark_data=BENCHMARK_DATASET):
    """
    Convert the global BENCHMARK_DATASET dict into a list of
    (benchmark_url_string, Simhash_instance). Returns an empty list
    if no benchmarks are provided.
    """
    bench_urls = benchmark_data.get("bench_urls", [])
    bench_hashes = benchmark_data.get("bench_hashes", [])

    if len(bench_urls) != len(bench_hashes):
        logger.error("Mismatch in BENCHMARK_DATASET lengths")
        return []

    benchmarks = []
    for bu, bh in zip(bench_urls, bench_hashes):
        benchmarks.append((str(bu), bh))
    return benchmarks
############################################################

########################## MAIN ############################
if __name__ == "__main__":
    # 1) Load the CSV hash map
    hash_map = load_hash_map(HASH_CSV_PATH)
    if not hash_map:
        logger.error("Hash map is empty. Exiting.")
        exit(1)

    # 2) Count & stream JavaScript rows from DB
    total_rows = getExpectedRows()
    query = getJavaScriptsQuery() + ';'
    js_rows = getJavaScriptsBuffered(query, batch_size=5000)

    # 3) Build the raw (url, Simhash) generator
    raw_obj_iter = getObjList_from_iterator(js_rows, hash_map)

    # 4) Wrap *that* so len() works
    sized_obj_iter = SizedIterator(raw_obj_iter, total_rows)

    # 5) Load benchmarks if any
    benchmarks = getBenchmarks(BENCHMARK_DATASET) if BENCHMARK_DATASET else []

    # 6) Now pass the *sized* iterator into SimhashIndex
    index = SimhashIndex(sized_obj_iter, f=64, k=2, benchmarks=benchmarks)
    logger.info("Index built with %d items", len(index))

    # 7) Cluster & persist
    clusters = build_simhash_clusters(index)
    logger.info("Found %d clusters", len(clusters))
    with open(OUTPUT_FILE, "w") as fout:
        for i, cluster in enumerate(clusters, 1):
            fout.write(f"{i};{cluster}\n")
    logger.info("Script completed successfully.")
