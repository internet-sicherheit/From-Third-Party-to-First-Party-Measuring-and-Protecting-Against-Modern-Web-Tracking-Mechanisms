"""
Entity attribution for JavaScript clusters (paper Section 5, Claim 2).

Maps the script-serving eTLD+1 of every cluster member to an organization and
a category using the WhoTracksMe TrackerDB, then aggregates per cluster: which
organizations serve the scripts in this cluster, and in what proportion.

Two files are produced:

  <output>            per-cluster organization shares, one row per cluster,
                      columns: cluster, domain_0, value_0, share_0, domain_1, ...
  <store-output>      the per-script lookup table (input rows plus the resolved
                      'category' and 'organization' columns)

The TrackerDB is queried through a small Node.js wrapper
(02_Data/whotracksme/trackerdb_wrapper.js), so Node.js must be available on
PATH. The evaluation container ships with it.

Determinism: clusters are processed in sorted order so repeated runs produce
byte-identical output.

Example:

  python Code/Analysis/ecosystem/attribute_scripts.py \
    --input Code/Analysis/ecosystem/cluster_script_url_etlds_fp_party.csv \
    --trackerdb 02_Data/whotracksme \
    --output out/attribution.csv
"""

import argparse
import os
import shutil
import sys

import pandas as pd
from tqdm import tqdm

tqdm.pandas()

REPO_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..')
)

DEFAULT_TRACKERDB = os.path.join('02_Data', 'whotracksme')
HERE = os.path.dirname(os.path.abspath(__file__))

# Per-party defaults. The published run attributed first-party ('fp') and
# third-party ('tp') script sets separately from the same code path.
PARTY_INPUTS = {
    'fp': os.path.join('Code', 'Analysis', 'ecosystem', 'cluster_script_url_etlds_fp_party.csv'),
    'tp': os.path.join('Code', 'Analysis', 'ecosystem', 'cluster_script_url_etlds_tp_party.csv'),
}

UNKNOWN = "Unknown"


def resolve(path: str) -> str:
    """Interpret relative paths against the repository root."""
    return path if os.path.isabs(path) else os.path.join(REPO_ROOT, path)


def make_lookups(database):
    """Build memoized category/organization lookups over the TrackerDB."""
    cache = {}

    def lookup(domain):
        if domain in cache:
            return cache[domain]
        try:
            result = database.match_domain(domain)
            pattern = result[0]['pattern']
            value = (pattern['category'], pattern['organization'])
        except (IndexError, KeyError, TypeError):
            value = (UNKNOWN, UNKNOWN)
        cache[domain] = value
        return value

    return lookup


def attribute(df: pd.DataFrame, lookup) -> pd.DataFrame:
    """Add 'category' and 'organization' columns resolved from the TrackerDB."""
    resolved = df['script_url_etld'].progress_apply(lookup)
    df = df.copy()
    df['category'] = [c for c, _ in resolved]
    df['organization'] = [o for _, o in resolved]
    return df


def aggregate_per_cluster(df: pd.DataFrame) -> pd.DataFrame:
    """
    For each cluster, rank the organizations serving its scripts by frequency
    and record absolute counts plus shares. Clusters whose scripts are all
    unattributable are emitted with only the 'cluster' column filled.
    """
    grouped = df.groupby('cluster')
    output = []

    # sorted() rather than set iteration: keeps row order stable across runs.
    for cluster_id in tqdm(sorted(grouped.groups), desc='Grouping cluster...'):
        res = {'cluster': cluster_id}

        _df = grouped.get_group(cluster_id)
        _df = _df.drop(_df[_df['organization'] == UNKNOWN].index)
        counts = _df['organization'].value_counts().to_dict()
        total = sum(counts.values())

        for i, (org, count) in enumerate(counts.items()):
            res[f'domain_{i}'] = org
            res[f'value_{i}'] = count
            res[f'share_{i}'] = count / total

        output.append(res)

    return pd.DataFrame(output).fillna('')


def parse_args(argv=None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Attribute JavaScript clusters to entities via WhoTracksMe."
    )
    parser.add_argument(
        '--party', choices=('fp', 'tp'), default='fp',
        help="Which script set to attribute: first-party (fp, default) or "
             "third-party (tp). Selects the default --input."
    )
    parser.add_argument(
        '--input', default=None,
        help="Cluster-to-script-eTLD CSV with columns cluster, script_url_etld, "
             "fp_script. Defaults to the file matching --party."
    )
    parser.add_argument(
        '--trackerdb', default=DEFAULT_TRACKERDB,
        help=f"Directory holding the WhoTracksMe wrapper (default: {DEFAULT_TRACKERDB})."
    )
    parser.add_argument(
        '--output', default=None,
        help="Per-cluster attribution CSV (default: out/<party>_cluster_attribution.csv)."
    )
    parser.add_argument(
        '--store-output', default=None,
        help="Per-script lookup table CSV (default: <output> with a "
             "'_store' suffix)."
    )
    parser.add_argument(
        '--node', default='node',
        help="Path to the Node.js executable (default: 'node')."
    )
    return parser.parse_args(argv)


def main(argv=None) -> int:
    args = parse_args(argv)

    input_path = resolve(args.input) if args.input else resolve(PARTY_INPUTS[args.party])
    output_path = resolve(args.output) if args.output \
        else os.path.join(REPO_ROOT, 'out', f'{args.party}_cluster_attribution.csv')
    if args.store_output:
        store_path = resolve(args.store_output)
    else:
        base, ext = os.path.splitext(output_path)
        store_path = f"{base}_store{ext}"

    trackerdb_dir = resolve(args.trackerdb)

    if not os.path.exists(input_path):
        print(
            f"ERROR: cluster/script input not found: {input_path}\n"
            "The frozen dataset does not appear to be present. "
            "Run ./install.sh first (see README, section 'Installation').",
            file=sys.stderr
        )
        return 2

    if not os.path.isdir(trackerdb_dir):
        print(
            f"ERROR: WhoTracksMe TrackerDB not found at {trackerdb_dir}\n"
            "Run ./install.sh first (see README, section 'Installation').",
            file=sys.stderr
        )
        return 2

    if shutil.which(args.node) is None:
        print(
            f"ERROR: Node.js executable '{args.node}' not found on PATH.\n"
            "Entity attribution queries the WhoTracksMe TrackerDB through a "
            "Node.js wrapper. Use the provided container "
            "(docker compose run --rm claim2), which ships Node.js, or pass "
            "--node /path/to/node.",
            file=sys.stderr
        )
        return 2

    sys.path.insert(0, trackerdb_dir)
    try:
        from trackerdb import TrackerDB
    except ImportError as exc:
        print(
            f"ERROR: could not import the TrackerDB wrapper from {trackerdb_dir} ({exc}).\n"
            "Run ./install.sh first (see README, section 'Installation').",
            file=sys.stderr
        )
        return 2

    database = TrackerDB(node_path=args.node)
    lookup = make_lookups(database)

    df = pd.read_csv(input_path)
    missing = {'cluster', 'script_url_etld'} - set(df.columns)
    if missing:
        print(
            f"ERROR: {input_path} is missing required column(s): "
            f"{', '.join(sorted(missing))}",
            file=sys.stderr
        )
        return 2

    df = attribute(df, lookup)

    os.makedirs(os.path.dirname(store_path) or '.', exist_ok=True)
    df.to_csv(store_path, index=False, lineterminator='
')
    print(f"Wrote per-script attribution store to {store_path}")

    output_df = aggregate_per_cluster(df)
    os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)
    output_df.to_csv(output_path, index=False, lineterminator='
')
    print(f"Wrote per-cluster attribution for {len(output_df)} clusters to {output_path}")

    attributed = int((df['organization'] != UNKNOWN).sum())
    print(
        f"Attributed {attributed} of {len(df)} scripts to a known organization "
        f"({df.loc[df['organization'] != UNKNOWN, 'organization'].nunique()} distinct organizations)."
    )
    return 0


if __name__ == '__main__':
    sys.exit(main())
