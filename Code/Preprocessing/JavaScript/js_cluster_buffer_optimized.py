"""
SimHash fingerprint extraction and clustering directly from the raw crawl DB.

UPSTREAM STAGE -- NOT PART OF THE ARTIFACT CLAIM SCRIPTS.

This script streams JavaScript responses out of the raw PostgreSQL crawl
database, joins them against a precomputed content_hash -> SimHash map, and
clusters them. It therefore requires:

  - a populated PostgreSQL crawl database (connection string via --dsn or the
    PGDSN environment variable), and
  - the psycopg2 driver, which is intentionally NOT part of requirements.txt
    because the evaluation container has no database.

Reviewers do not need to run this. The frozen fingerprint export it produces
(02_Data/ecosystem/simhashes_24112025.csv) ships with the artifact, and
Claim 2 starts from that file via
Code/Analysis/ecosystem/ecosystem_analysis_pipeline.py.

The script is kept in the repository so the path from raw crawl data to the
frozen fingerprints is auditable.

Example (requires DB access):

  python Code/Preprocessing/JavaScript/js_cluster_buffer_optimized.py \
    --dsn "user=... password=... host=... port=5432 dbname=..." \
    --browser-id openwpm_native_eu_1_omaticall \
    --hash-csv 02_Data/js_hashes/EU1_hashes.csv \
    --output out/JavaScript_Cluster_EU1.csv
"""

import argparse
import logging
import os
import sys

import pandas as pd
from tqdm import tqdm

REPO_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..')
)

# simhash2_optimized lives with the ecosystem analysis code.
sys.path.insert(0, os.path.join(REPO_ROOT, 'Code', 'Analysis', 'ecosystem'))
from simhash2_optimized import Simhash, SimhashIndex, build_simhash_clusters  # noqa: E402

DEFAULT_HASH_CSV = os.path.join('02_Data', 'js_hashes', 'EU1_hashes.csv')
DEFAULT_OUTPUT = os.path.join('out', 'JavaScript_Cluster_EU1.csv')
DEFAULT_BROWSER_ID = "openwpm_native_eu_1_omaticall"

logger = logging.getLogger(__name__)


def setup_logging(log_file: str) -> None:
    formatter = logging.Formatter(
        '%(asctime)s %(levelname)-8s %(funcName)-30s %(message)s'
    )
    fh = logging.FileHandler(log_file)
    fh.setLevel(logging.DEBUG)
    fh.setFormatter(formatter)
    sh = logging.StreamHandler()
    sh.setFormatter(formatter)
    sh.setLevel(logging.ERROR)
    logger.addHandler(fh)
    logger.addHandler(sh)
    logger.setLevel(logging.DEBUG)
    logger.propagate = False


def resolve(path: str) -> str:
    """Interpret relative paths against the repository root."""
    return path if os.path.isabs(path) else os.path.join(REPO_ROOT, path)


def _require_psycopg2():
    """Import psycopg2 lazily so --help works without a database driver."""
    try:
        import psycopg2  # noqa: F401
        return psycopg2
    except ImportError:
        print(
            "ERROR: psycopg2 is not installed.\n"
            "This script talks to the raw PostgreSQL crawl database and is an "
            "upstream stage, not part of the artifact claim scripts. The "
            "evaluation container deliberately ships without a database "
            "driver. Install psycopg2-binary manually if you intend to "
            "re-run the extraction against your own crawl database.",
            file=sys.stderr
        )
        raise SystemExit(2)


########################## DB HANDLER ######################
def getJavaScriptsBuffered(dsn, query, batch_size=5000):
    """
    Stream the SQL rows in batches via a server-side cursor.
    Yields one row tuple at a time.
    """
    psycopg2 = _require_psycopg2()
    conn = psycopg2.connect(dsn)
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


def getExpectedRows(dsn, browser_id):
    psycopg2 = _require_psycopg2()
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    cur.execute(getCountQuery(browser_id))
    total_rows = cur.fetchone()[0]
    cur.close()
    conn.close()
    logger.info("Expecting %d JavaScript rows", total_rows)
    return total_rows


def getCountQuery(browser_id):
    return f"SELECT COUNT(*) FROM ({getJavaScriptsQuery(browser_id)}) AS sub;"


def getJavaScriptsQuery(browser_id):
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
          AND req.browser_id = '{browser_id}'
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
    Load the CSV that maps content_hash -> simhash.
    Expects columns 'content_hash' and 'simhash_hex'. The simhash column may be
    hexadecimal strings (with or without '0x' prefix) or integers.
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
        logger.error("CSV must contain 'content_hash' and 'simhash_hex' columns")
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


def getBenchmarks(benchmark_data):
    """
    Convert a benchmark dict into a list of (benchmark_url, Simhash_instance).
    Returns an empty list when no benchmarks are provided; benchmarks are
    optional and the published run did not use them.
    """
    if not benchmark_data:
        return []

    bench_urls = benchmark_data.get("bench_urls", [])
    bench_hashes = benchmark_data.get("bench_hashes", [])

    if len(bench_urls) != len(bench_hashes):
        logger.error("Mismatch in benchmark dataset lengths")
        return []

    return [(str(bu), bh) for bu, bh in zip(bench_urls, bench_hashes)]
############################################################


def parse_args(argv=None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract and cluster JavaScript SimHashes from the raw crawl "
                    "database (upstream stage; requires PostgreSQL access)."
    )
    parser.add_argument(
        '--dsn', default=os.environ.get('PGDSN', ''),
        help="PostgreSQL connection string, e.g. "
             "\"user=u password=p host=h port=5432 dbname=d\". "
             "Defaults to the PGDSN environment variable."
    )
    parser.add_argument(
        '--browser-id', default=DEFAULT_BROWSER_ID,
        help=f"Crawl profile to extract (default: {DEFAULT_BROWSER_ID})."
    )
    parser.add_argument(
        '--hash-csv', default=DEFAULT_HASH_CSV,
        help=f"content_hash -> simhash_hex map (default: {DEFAULT_HASH_CSV})."
    )
    parser.add_argument(
        '--output', default=DEFAULT_OUTPUT,
        help=f"Output cluster file (default: {DEFAULT_OUTPUT})."
    )
    parser.add_argument(
        '--k', type=int, default=2,
        help="Hamming distance tolerance for this extraction pass (default: 2). "
             "Note the published cross-profile clustering uses k=8; see "
             "Code/Analysis/ecosystem/ecosystem_analysis_pipeline.py."
    )
    parser.add_argument(
        '--f', type=int, default=64,
        help="Fingerprint bit width (default: 64)."
    )
    parser.add_argument(
        '--batch-size', type=int, default=5000,
        help="Server-side cursor batch size (default: 5000)."
    )
    parser.add_argument(
        '--log-file', default=None,
        help="Log file path (default: <output>.log)."
    )
    return parser.parse_args(argv)


########################## MAIN ############################
def main(argv=None) -> int:
    args = parse_args(argv)

    hash_csv = resolve(args.hash_csv)
    output_file = resolve(args.output)
    log_file = resolve(args.log_file) if args.log_file else output_file + '.log'

    os.makedirs(os.path.dirname(output_file) or '.', exist_ok=True)
    setup_logging(log_file)

    if not args.dsn:
        print(
            "ERROR: no PostgreSQL connection string given.\n"
            "Pass --dsn or set PGDSN. This script is an upstream stage that "
            "reads the raw crawl database; it is not part of the artifact "
            "claim scripts. See the module docstring.",
            file=sys.stderr
        )
        return 2

    # 1) Load the CSV hash map
    hash_map = load_hash_map(hash_csv)
    if not hash_map:
        print(
            f"ERROR: could not load a content_hash -> simhash map from {hash_csv}\n"
            "Run ./install.sh first (see README, section 'Installation').",
            file=sys.stderr
        )
        return 2

    # 2) Count & stream JavaScript rows from DB
    total_rows = getExpectedRows(args.dsn, args.browser_id)
    query = getJavaScriptsQuery(args.browser_id) + ';'
    js_rows = getJavaScriptsBuffered(args.dsn, query, batch_size=args.batch_size)

    # 3) Build the raw (url, Simhash) generator
    raw_obj_iter = getObjList_from_iterator(js_rows, hash_map)

    # 4) Wrap *that* so len() works
    sized_obj_iter = SizedIterator(raw_obj_iter, total_rows)

    # 5) Benchmarks are optional and unused in the published run
    benchmarks = getBenchmarks(None)

    # 6) Now pass the *sized* iterator into SimhashIndex
    index = SimhashIndex(sized_obj_iter, f=args.f, k=args.k, benchmarks=benchmarks)
    logger.info("Index built with %d items", len(index))

    # 7) Cluster & persist
    clusters = build_simhash_clusters(index)
    logger.info("Found %d clusters", len(clusters))
    with open(output_file, "w", encoding='utf-8', newline='\n') as fout:
        for i, cluster in enumerate(clusters, 1):
            fout.write(f"{i};{sorted(cluster)}\n")
    logger.info("Script completed successfully. Output: %s", output_file)
    print(f"Wrote {len(clusters)} clusters to {output_file}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
