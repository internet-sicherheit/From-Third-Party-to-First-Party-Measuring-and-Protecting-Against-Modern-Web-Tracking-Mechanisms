"""
Heuristic for Cookie Values (restart-safe, file-by-file processing).

This implements the second half of the four-criterion first-party tracking
(FPT) cookie heuristic described in the paper:

- C1 (lifetime > 90 days) and C2 (value length >= 8 bytes) are applied
  upstream in the SQL stage and materialize as the boolean columns
  `valid_expires_date` and `valid_entropy`. See docs/schema.md.
- C3 (uniqueness, operationalized as a relative value-length difference
  <= 0.25 across browser profiles): is_length_difference_valid()
- C4 (Ratcliff/Obershelp similarity <= 0.6): ratcliff_obershelp_similarity()

Key properties:
- Avoids OOM kills by not concatenating all CSVs into memory. Processes one
  CSV at a time and immediately appends its analysis to the output file.
- Maintains a checkpoint file so interrupted runs resume where they stopped.
- Writes structured logs (success/skip/failure).

Scope note for artifact evaluation: a full-scale run over all shards takes
roughly a week and needs ~120 GB of RAM. Use --num-shards to run a
scaled-down subset; see claims/claim1_heuristic.sh.

Example:

  python Code/Heuristik/cookie_heuristik_opti.py \
    --input-dir 02_Data/potential_first_party_tracking_cookies \
    --num-shards 2 \
    --output out/claim1_holding_ids.csv
"""

import argparse
import logging
import os
import sys
from difflib import SequenceMatcher
from itertools import combinations

import pandas as pd
from tqdm import tqdm

# Repository root, derived from this file's location rather than the current
# working directory, so the script can be invoked from anywhere.
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))

DEFAULT_INPUT_DIR = os.path.join('02_Data', 'potential_first_party_tracking_cookies')
DEFAULT_OUTPUT = os.path.join('out', 'cookies_holding_ids.csv')

# Candidate names for the effective-top-level-domain column. Different export
# vintages of the frozen dataset use different names for the same field.
ETLD_COLUMN_CANDIDATES = ('top_level_etld', 'top_level_url_etld')

SIMILARITY_THRESHOLD = 0.6

logger = logging.getLogger(__name__)


def log_and_print(level: str, msg: str) -> None:
    print(msg)
    getattr(logger, level)(msg)


# -----------------------
# I/O helpers
# -----------------------
def list_input_files(directory: str):
    if not os.path.isdir(directory):
        raise FileNotFoundError(f"Input directory not found: {directory}")
    return sorted([f for f in os.listdir(directory) if f.lower().endswith('.csv')])


def read_checkpoint(path: str):
    if not os.path.exists(path):
        return set()
    with open(path, 'r', encoding='utf-8') as f:
        return set(line.strip() for line in f if line.strip())


def append_checkpoint(path: str, filename: str):
    with open(path, 'a', encoding='utf-8') as f:
        f.write(filename + '\n')


def append_results(df: pd.DataFrame, outfile: str):
    header_needed = not os.path.exists(outfile)
    df.to_csv(outfile, mode='a', header=header_needed, index=False)


def detect_etld_column(input_path: str, override: str = None) -> str:
    """
    Determine which column holds the top-level eTLD+1 of the visited page.

    The frozen shards ship this field as 'top_level_url_etld', while the
    reference output was produced from an earlier export that named it
    'top_level_etld'. Auto-detect unless the caller forces a name.
    """
    header = pd.read_csv(input_path, nrows=0).columns.tolist()
    if override:
        if override not in header:
            raise ValueError(
                f"Column '{override}' not present in {input_path}. "
                f"Available columns: {', '.join(header[:20])}..."
            )
        return override
    for candidate in ETLD_COLUMN_CANDIDATES:
        if candidate in header:
            return candidate
    raise ValueError(
        f"None of the expected eTLD columns {ETLD_COLUMN_CANDIDATES} found in "
        f"{input_path}. Use --etld-column to name it explicitly."
    )


# -----------------------
# Heuristic functions
# -----------------------
def is_length_difference_valid(s1: str, s2: str) -> bool:
    # Guard for empty strings
    if not s1 and not s2:
        return True
    if not s1 or not s2:
        return False
    length_diff = abs(len(s1) - len(s2))
    max_length = max(len(s1), len(s2))
    return (length_diff / max_length) <= 0.25


def ratcliff_obershelp_similarity(s1: str, s2: str) -> float:
    return SequenceMatcher(None, s1, s2).ratio()


def analyzer(cookie_name: str, top_level_url_etld: str, df: pd.DataFrame) -> dict:
    """
    For a single cookie (fixed name within a top_level_url_etld), compare value pairs across browser_ids.
    Decide if the cookie 'holds an id' under the given heuristics.
    """
    res = {
        'cookie_name': cookie_name,
        'top_level_etld': top_level_url_etld,
        'hold_id': False,
        'unique_ok': False,
        'similarity_ok': False,
        'passed_checkin': False
    }

    if df.empty:
        return res

    # Only keep necessary columns and ensure strings
    sub = df[['value', 'browser_id']].copy()
    sub['value'] = sub['value'].fillna('').astype(str)
    sub['browser_id'] = sub['browser_id'].astype(str)

    # If the cookie appears only once, we cannot compare pairs
    if len(sub) < 2:
        return res

    # Pairwise comparisons without duplicating order (combinations -> O(n^2)/2)
    all_length_ok = True
    all_similarity_ok = True

    # KNOWN BEHAVIOUR -- DELIBERATELY NOT FIXED.
    # The loop below breaks on the first failing length check, before the
    # Ratcliff/Obershelp similarity of that pair is ever computed. As a
    # consequence 'all_similarity_ok' can still be True at the point where the
    # length check already failed, and the branch further down then reports
    # similarity_ok=True for a cookie whose similarity was never fully
    # evaluated.
    #
    # Effect on results:
    #   - hold_id            UNAFFECTED. It requires all_length_ok AND
    #                        all_similarity_ok; a break always sets one of the
    #                        two to False, so hold_id can never be True unless
    #                        every pair passed both checks.
    #   - unique_ok,         AFFECTED. These secondary diagnostic flags may be
    #     similarity_ok,     True even though the corresponding criterion was
    #     passed_checkin     not evaluated for every pair.
    #
    # The published numbers and the frozen reference outputs in claims/expected/
    # were produced with exactly this behaviour. Correcting it here would change
    # the secondary columns and invalidate the references, so the code is kept
    # as-is for reproduction and the deviation is documented instead.
    for (_, row1), (_, row2) in combinations(sub.iterrows(), 2):
        v1, v2 = row1['value'], row2['value']

        length_ok = is_length_difference_valid(v1, v2)
        if not length_ok:
            all_length_ok = False
            break

        sim = ratcliff_obershelp_similarity(v1, v2)
        if not (sim <= SIMILARITY_THRESHOLD):
            all_similarity_ok = False
            break

    if all_length_ok and all_similarity_ok:
        res['hold_id'] = True
        res['unique_ok'] = True
        res['similarity_ok'] = True
        res['passed_checkin'] = True
    elif all_length_ok and not all_similarity_ok:
        res['unique_ok'] = True
        res['passed_checkin'] = True
    elif not all_length_ok and all_similarity_ok:
        res['similarity_ok'] = True
        res['passed_checkin'] = True

    return res


# -----------------------
# Per-file analysis
# -----------------------
def analyze_file(input_path: str, source_filename: str, etld_column: str) -> pd.DataFrame:
    """
    Load one CSV, filter rows with cookie name, group by the eTLD column and cookie name,
    and run the analyzer per cookie within that file.
    Returns a dataframe of results for this file with an added 'source_file' column.

    Note that grouping is per-file by design (this is what keeps memory bounded).
    Results therefore depend on how rows are distributed across shards.
    """
    usecols = ['name', etld_column, 'value', 'browser_id']
    df = pd.read_csv(
        input_path,
        usecols=usecols,
        dtype={'name': 'string', etld_column: 'string', 'value': 'string', 'browser_id': 'string'}
    )

    df = df[df['name'].notna() & (df['name'].str.len() > 0)]
    if df.empty:
        return pd.DataFrame(columns=['cookie_name', 'top_level_etld', 'hold_id', 'source_file'])

    results = []
    for top_level_url_etld, g_etld in df.groupby(etld_column, dropna=True):
        if g_etld['browser_id'].nunique() <= 1:
            continue

        for cookie_name, g_cookie in g_etld.groupby('name', dropna=True):
            res = analyzer(str(cookie_name), str(top_level_url_etld), g_cookie)
            res['source_file'] = source_filename
            results.append(res)

    return pd.DataFrame(results, columns=['cookie_name', 'top_level_etld', 'hold_id', 'unique_ok', 'similarity_ok', 'passed_checkin', 'source_file'])


# -----------------------
# CLI
# -----------------------
def resolve(path: str) -> str:
    """Interpret relative paths against the repository root."""
    return path if os.path.isabs(path) else os.path.join(REPO_ROOT, path)


def parse_args(argv=None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Apply the C3/C4 FPT cookie heuristic to frozen candidate shards."
    )
    parser.add_argument(
        '--input-dir', default=DEFAULT_INPUT_DIR,
        help=f"Directory of candidate CSV shards (default: {DEFAULT_INPUT_DIR})."
    )
    parser.add_argument(
        '--num-shards', type=int, default=0,
        help="Process only the first N shards (0 = all, the default). "
             "Use a small value for a scaled-down evaluation run."
    )
    parser.add_argument(
        '--output', default=DEFAULT_OUTPUT,
        help=f"Output CSV path (default: {DEFAULT_OUTPUT})."
    )
    parser.add_argument(
        '--checkpoint', default=None,
        help="Checkpoint file listing completed shards "
             "(default: <output>.processed_files.txt)."
    )
    parser.add_argument(
        '--log-file', default=None,
        help="Log file path (default: <output>.analysis.log)."
    )
    parser.add_argument(
        '--etld-column', default=None,
        help="Name of the top-level eTLD column. Auto-detected from "
             f"{ETLD_COLUMN_CANDIDATES} when omitted."
    )
    parser.add_argument(
        '--similarity-threshold', type=float, default=SIMILARITY_THRESHOLD,
        help=f"C4 Ratcliff/Obershelp threshold (default: {SIMILARITY_THRESHOLD})."
    )
    parser.add_argument(
        '--fresh', action='store_true',
        help="Ignore an existing checkpoint and overwrite the output file."
    )
    return parser.parse_args(argv)


def main(argv=None) -> int:
    global SIMILARITY_THRESHOLD
    args = parse_args(argv)

    input_dir = resolve(args.input_dir)
    output_file = resolve(args.output)
    checkpoint = resolve(args.checkpoint) if args.checkpoint else output_file + '.processed_files.txt'
    log_file = resolve(args.log_file) if args.log_file else output_file + '.analysis.log'
    SIMILARITY_THRESHOLD = args.similarity_threshold

    os.makedirs(os.path.dirname(output_file) or '.', exist_ok=True)
    logging.basicConfig(
        filename=log_file,
        level=logging.INFO,
        format='%(asctime)s [%(levelname)s] %(message)s'
    )

    if not os.path.isdir(input_dir):
        print(
            f"ERROR: input directory not found: {input_dir}\n"
            "The frozen dataset does not appear to be present. "
            "Run ./install.sh first (see README, section 'Installation').",
            file=sys.stderr
        )
        return 2

    if args.fresh:
        for stale in (output_file, checkpoint):
            if os.path.exists(stale):
                os.remove(stale)

    try:
        files = list_input_files(input_dir)

        if not files:
            print(
                f"ERROR: no CSV shards found in {input_dir}\n"
                "The frozen dataset appears to be incomplete. "
                "Run ./install.sh first (see README, section 'Installation').",
                file=sys.stderr
            )
            return 2

        if args.num_shards > 0:
            files = files[:args.num_shards]

        etld_column = detect_etld_column(os.path.join(input_dir, files[0]), args.etld_column)
        processed = read_checkpoint(checkpoint)

        log_and_print('info', f"Input directory: {input_dir}")
        log_and_print('info', f"eTLD column: '{etld_column}'")
        log_and_print('info', f"Processing {len(files)} shard(s). Already processed: {len(processed)}.")

        for fname in tqdm(files, total=len(files), desc='Analyzing files'):
            if fname in processed:
                log_and_print('info', f'SKIP (already processed): {fname}')
                continue

            fpath = os.path.join(input_dir, fname)
            try:
                per_file_results = analyze_file(fpath, fname, etld_column)

                if not per_file_results.empty:
                    append_results(per_file_results, output_file)

                append_checkpoint(checkpoint, fname)
                log_and_print('info', f'DONE (processed): {fname} | rows: {len(per_file_results)}')

            except Exception as e:
                log_and_print('error', f'FAIL (processing): {fname} | error: {e}')

        log_and_print('info', f'Completed iteration over all files. Output: {output_file}')
        return 0

    except FileNotFoundError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 2
    except ValueError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 2
    except KeyboardInterrupt:
        log_and_print('warning', 'Interrupted by user.')
        return 130


if __name__ == '__main__':
    sys.exit(main())
