"""
SimHash clustering of the JavaScript corpus (paper Section 5, Claim 2).

Reads 64-bit SimHash fingerprints of the collected JavaScript files and groups
them into clusters of near-duplicates using a Hamming-distance threshold
(k=8 in the paper). Clusters are the unit of the entity-attribution step
implemented in attribute_scripts.py.

Output format: one Python-dict literal per line, e.g.

    {'cluster_size': 2, 'cluster_1': '0317b25b1df34d7f', 'cluster_2': '...'}

Determinism: cluster membership comes out of a set, whose iteration order is
not stable across interpreter runs (PYTHONHASHSEED). Members within a cluster
and the clusters themselves are therefore sorted before writing, so repeated
runs produce byte-identical output. This changes only the ordering of the
output file, never the clustering itself.

Example:

  python Code/Analysis/ecosystem/ecosystem_analysis_pipeline.py \
    --input 02_Data/ecosystem/simhashes_24112025.csv \
    --k 8 --output out/clusters_k8.txt
"""

import argparse
import csv
import logging
import os
import sys
from collections import Counter
from glob import glob

import pandas as pd
from tqdm import tqdm

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from simhash2_optimized import Simhash, SimhashIndex, build_simhash_clusters  # noqa: E402

tqdm.pandas()

REPO_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..')
)

DEFAULT_INPUT = os.path.join('02_Data', 'ecosystem', 'simhashes_24112025.csv')
DEFAULT_OUTPUT = os.path.join('out', 'clusters_k8.txt')
DEFAULT_BENCHMARKS = os.path.join('02_Data', 'ecosystem', 'benchmark_files', 'benchmarks.csv')

HASH_COLUMN = 'simhash_hex'

logger = logging.getLogger("ecosystem_analysis_pipeline")


def setup_logging(log_file: str) -> None:
    logger.setLevel(logging.INFO)
    logger.propagate = False
    fmt = logging.Formatter('%(asctime)s %(levelname)-7s %(funcName)-28s %(message)s')
    if log_file:
        fh = logging.FileHandler(log_file)
        fh.setLevel(logging.INFO)
        fh.setFormatter(fmt)
        logger.addHandler(fh)
    sh = logging.StreamHandler(sys.stdout)
    sh.setLevel(logging.ERROR)
    sh.setFormatter(fmt)
    logger.addHandler(sh)


def resolve(path: str) -> str:
    """Interpret relative paths against the repository root."""
    return path if os.path.isabs(path) else os.path.join(REPO_ROOT, path)


def load_benchmarks(path: str) -> dict:
    """
    Load the optional benchmark fingerprint set.

    Benchmarks are reference scripts inserted into the index as controls. They
    are entirely optional: the paper's clustering run did not use them (the
    index is built with benchmarks=[]). Loading therefore never fails hard, and
    in particular never runs at import time.
    """
    benchmarks = {}
    if not path or not os.path.exists(path):
        logger.info("No benchmark file at %s - continuing without benchmarks.", path)
        return benchmarks
    try:
        with open(path, mode='r', encoding='utf-8') as f:
            for row in csv.DictReader(f):
                benchmarks[row['script_name']] = row['script']
        logger.info("Built benchmark set for %d hashes", len(benchmarks))
    except (OSError, KeyError) as exc:
        logger.warning("Could not read benchmarks from %s (%s) - continuing without.", path, exc)
        return {}
    return benchmarks


def list_input_files(input_path: str) -> list:
    """Accept either a single CSV or a directory of CSVs."""
    if os.path.isdir(input_path):
        return sorted(glob(os.path.join(input_path, '*.csv')))
    return [input_path]


def process_data(input_files: list) -> list:
    """Load fingerprints and return a list of (obj_id, Simhash) tuples."""
    records = []
    for file in tqdm(input_files, total=len(input_files), desc="Processing files"):
        records.extend(pd.read_csv(file).to_dict(orient='records'))

    df = pd.DataFrame.from_records(records)
    if HASH_COLUMN not in df.columns:
        raise ValueError(
            f"Input is missing the '{HASH_COLUMN}' column. "
            f"Found columns: {', '.join(df.columns)}"
        )

    df['simhash_obj'] = df[HASH_COLUMN].progress_apply(Simhash)
    return list(df[[HASH_COLUMN, 'simhash_obj']].itertuples(index=False, name=None))


def write_clusters(clusters: list, output_file: str) -> None:
    """
    Write clusters in the historical dict-literal format, sorted for
    determinism (members within a cluster, then clusters themselves).
    """
    lines = []
    for cluster in clusters:
        members = sorted(cluster)
        d = {'cluster_size': len(members)}
        for j, member in enumerate(members, 1):
            d[f'cluster_{j}'] = member
        lines.append(str(d))

    lines.sort()
    os.makedirs(os.path.dirname(output_file) or '.', exist_ok=True)
    with open(output_file, 'w', encoding='utf-8', newline='\n') as f:
        for line in lines:
            f.write(line + '\n')


def parse_args(argv=None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Cluster JavaScript SimHash fingerprints (paper Claim 2)."
    )
    parser.add_argument(
        '--input', default=DEFAULT_INPUT,
        help=f"Fingerprint CSV or directory of CSVs (default: {DEFAULT_INPUT})."
    )
    parser.add_argument(
        '--output', default=DEFAULT_OUTPUT,
        help=f"Output cluster file (default: {DEFAULT_OUTPUT})."
    )
    parser.add_argument(
        '--k', type=int, default=8,
        help="Hamming distance tolerance (default: 8, the paper configuration)."
    )
    parser.add_argument(
        '--f', type=int, default=64,
        help="Fingerprint bit width (default: 64, the paper configuration)."
    )
    parser.add_argument(
        '--benchmarks', default=DEFAULT_BENCHMARKS,
        help="Optional benchmark CSV. Silently skipped when absent "
             "(the paper's run used no benchmarks)."
    )
    parser.add_argument(
        '--use-benchmarks', action='store_true',
        help="Insert benchmark fingerprints into the index. Off by default to "
             "match the published clustering."
    )
    parser.add_argument(
        '--log-file', default=None,
        help="Log file path (default: <output>.log)."
    )
    return parser.parse_args(argv)


def main(argv=None) -> int:
    args = parse_args(argv)

    input_path = resolve(args.input)
    output_file = resolve(args.output)
    log_file = resolve(args.log_file) if args.log_file else output_file + '.log'

    os.makedirs(os.path.dirname(output_file) or '.', exist_ok=True)
    setup_logging(log_file)

    if not os.path.exists(input_path):
        print(
            f"ERROR: fingerprint input not found: {input_path}\n"
            "The frozen dataset does not appear to be present. "
            "Run ./install.sh first (see README, section 'Installation').",
            file=sys.stderr
        )
        return 2

    input_files = list_input_files(input_path)
    if not input_files:
        print(
            f"ERROR: no CSV files found in {input_path}\n"
            "Run ./install.sh first (see README, section 'Installation').",
            file=sys.stderr
        )
        return 2

    try:
        objs = process_data(input_files)
    except ValueError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

    benchmark_dataset = load_benchmarks(resolve(args.benchmarks)) if args.use_benchmarks else {}
    benchmarks_list = [(k, Simhash(v)) for k, v in benchmark_dataset.items()]

    print(f"Indexing {len(objs)} fingerprints (f={args.f}, k={args.k})...")
    index = SimhashIndex(objs, f=args.f, k=args.k, benchmarks=benchmarks_list)

    clusters = build_simhash_clusters(index)

    sizes = [len(c) for c in clusters]
    print(f"Clusters: {len(clusters)} | min size: {min(sizes)} | max size: {max(sizes)}")
    print("Cluster size distribution (size: count):")
    for size, count in sorted(Counter(sizes).items())[:10]:
        print(f"  {size}: {count}")

    write_clusters(clusters, output_file)
    print(f"Wrote {len(clusters)} clusters to {output_file}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
