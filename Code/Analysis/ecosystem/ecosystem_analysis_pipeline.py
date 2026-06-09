import os
import pandas as pd
import logging
import sys
import csv
import ndjson
from tqdm import tqdm
from glob import glob
from simhash2_optimized import Simhash, SimhashIndex, build_simhash_clusters
#from simhash2 import Simhash, SimhashIndex

tqdm.pandas()

# ------------------------------ logging --------------------------------
def setup_logging() -> logging.Logger:
    logger = logging.getLogger("batch_simhash_pipeline")
    logger.setLevel(logging.INFO)
    logger.propagate = False
    fmt = logging.Formatter('%(asctime)s %(levelname)-7s %(funcName)-28s %(message)s')
    fh = logging.FileHandler("batch_simhash_pipeline.log")
    fh.setLevel(logging.INFO)
    fh.setFormatter(fmt)
    sh = logging.StreamHandler(sys.stdout)
    sh.setLevel(logging.ERROR)
    sh.setFormatter(fmt)
    if not logger.handlers:
        logger.addHandler(fh)
        logger.addHandler(sh)
    return logger

logger = setup_logging()

# ----------------------------- paths ------------------------------
BASE_DATA          = os.path.join(os.getcwd(), '..', '..', '..', '02_Data')
ECOSYSTEM_DATA     = os.path.join(BASE_DATA, 'ecosystem')
INPUT_FILE         = glob(os.path.join(ECOSYSTEM_DATA, '*.csv'))

BENCHMARK_FILE    = os.path.join(ECOSYSTEM_DATA, 'benchmark_files', "benchmarks.csv")  # optional

BENCHMARK_DATASET = {}
with open(BENCHMARK_FILE, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        BENCHMARK_DATASET[row['script_name']] = row['script']
if len(BENCHMARK_DATASET) > 0:
    logger.info("Built benchmark set for %d hashes", len(BENCHMARK_DATASET))
# ----------------------------- helper ------------------------------
def read_file(file:str) -> dict:
    """
    Read a file and return it as a dict
    :param file: file in csv format
    :return: data as dict
    """
    # Read csv
    df = pd.read_csv(file)
    return df.to_dict(orient='records')

def getBenchmarks(benchmark_data=BENCHMARK_DATASET):
    """
    Convert the global BENCHMARK_DATASET dict into a list of
    (benchmark_url_string, Simhash_instance). Returns an empty list
    if no benchmarks are provided.
    """
    benchmarks = []
    for bu, bh in BENCHMARK_DATASET.items():
        benchmarks.append((str(bu), Simhash(bh)))
    return benchmarks

def process_data() -> list:
    data = list()

    def convert_simhash_obj(simhash) -> Simhash:
        return Simhash(simhash)

    # Load data from files
    for file in tqdm(INPUT_FILE, total=len(INPUT_FILE), desc="Processing files"):
        data.extend(read_file(file))

    # Build df from records
    df = pd.DataFrame.from_records(data)

    df['simhash_obj'] = df['simhash_hex'].progress_apply(convert_simhash_obj)

    objs = list(df.itertuples(index=False, name=None))

    return objs

def main():
    objs = process_data()

    benchmarks_list = [(k, Simhash(v)) for k, v in BENCHMARK_DATASET.items()]

    index = SimhashIndex(objs, f=64, k=8, benchmarks=[])

    clusters = build_simhash_clusters(index)

    length_cluster = list()

    # print("Cluster, Length, Elements")
    for i, cluster in enumerate(clusters, 1):
    #     print(i, len(cluster), cluster)
        length_cluster.append(len(cluster))

    print("min:", min(length_cluster), "max:", max(length_cluster))

    from collections import Counter

    print("Skript - Occurency")
    for k, v in sorted(Counter(length_cluster).items()):
        print(k, v)

    output = list()
    for i, cluster in enumerate(clusters, 1):
        cluster = list(cluster)
        d = {'cluster_size': len(cluster)}
        for j, c in enumerate(cluster, 1):
            d[f'cluster_{j}'] = c
        output.append(d)

    with open("cluster_27112025_k8.txt", 'w') as f:
        for l in output:
            f.write(str(l))
            f.write('\n')




    # with open("cluster_24112025.txt", 'w') as f:
    #     for i, cluster in enumerate(clusters, 1):
    #         cluster = list(cluster)
    #         cluster_1 = cluster[0]
    #         try:
    #             cluster_2 = cluster[1]
    #         except IndexError:
    #             cluster_2 = ''
    #         try:
    #             cluster_3 = cluster[2]
    #         except IndexError:
    #             cluster_3 = ''
            # try:
            #     cluster_4 = cluster[3]
            # except IndexError:
            #     cluster_4 = ''
            # try:
            #     cluster_5 = cluster[4]
            # except IndexError:
            #     cluster_5 = ''
            # try:
            #     cluster_6 = cluster[5]
            # except IndexError:
            #     cluster_6 = ''
            # try:
            #     cluster_7 = cluster[6]
            # except IndexError:
            #     cluster_7 = ''
            # line = "{'cluster_size':" + str(len(cluster))
            # line += f", 'cluster_{1}': '{cluster_1}'"
            # line += f", 'cluster_{2}': '{cluster_2}'"
            # line += f", 'cluster_{3}': '{cluster_3}'"
            # line += f", 'cluster_{4}': '{cluster_4}'"
            # line += f", 'cluster_{5}': '{cluster_5}'"
            # line += f", 'cluster_{6}': '{cluster_6}'"
            # line += f", 'cluster_{7}': '{cluster_7}'"
            # line +=  "}\n"
            # f.write(line)


if __name__ == "__main__":
    main()
