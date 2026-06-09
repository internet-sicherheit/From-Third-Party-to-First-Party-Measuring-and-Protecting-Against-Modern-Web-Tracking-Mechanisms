"""
Heuristic for Cookie Values (restart-safe, file-by-file processing).

Context:
- Step 1 & 2 (entropy and valid expires date) are assumed done upstream in BQ.
- Step 3: Length difference (method: is_length_difference_valid)
- Step 4: Similarity based on Ratcliff-Obershelp (ratcliff_obershelp_similarity)

Key properties of this rewrite:
- Avoids "killed" (OOM) by not concatenating all CSVs into memory.
- Processes one CSV at a time and immediately appends its analysis to 'cookies_holding_ids.csv'.
- Maintains a checkpoint file 'processed_files.txt' to skip files already finished.
- Adds structured logging to 'analysis.log' (success/skip/failure).
"""

import os
import sys
import logging
import pandas as pd
from difflib import SequenceMatcher
from itertools import combinations
from tqdm import tqdm

# -----------------------
# Configuration
# -----------------------
BASE_DIR = os.getcwd()
PATH = os.path.join(BASE_DIR, '..', '..', '02_Data', 'cookie_may_holding_ids')
OUTPUT_FILE = os.path.join(BASE_DIR, 'cookies_holding_ids.csv')
PROCESSED_LIST = os.path.join(BASE_DIR, 'processed_files.txt')   # checkpoint for completed files
LOG_FILE = os.path.join(BASE_DIR, 'analysis.log')

SIMILARITY_THRESHOLD = 0.6

# -----------------------
# Logging
# -----------------------
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
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
def analyze_file(input_path: str, source_filename: str) -> pd.DataFrame:
    """
    Load one CSV, filter rows with cookie name, group by top_level_url_etld and cookie name,
    and run the analyzer per cookie within that file.
    Returns a dataframe of results for this file with an added 'source_file' column.
    """
    usecols = ['name', 'top_level_etld', 'value', 'browser_id']
    df = pd.read_csv(
        input_path,
        usecols=usecols,
        dtype={'name': 'string', 'top_level_etld': 'string', 'value': 'string', 'browser_id': 'string'}
    )

    df = df[df['name'].notna() & (df['name'].str.len() > 0)]
    if df.empty:
        return pd.DataFrame(columns=['cookie_name', 'top_level_etld', 'hold_id', 'source_file'])

    results = []
    for top_level_url_etld, g_etld in df.groupby('top_level_etld', dropna=True):
        if g_etld['browser_id'].nunique() <= 1:
            continue

        for cookie_name, g_cookie in g_etld.groupby('name', dropna=True):
            res = analyzer(str(cookie_name), str(top_level_url_etld), g_cookie)
            res['source_file'] = source_filename
            results.append(res)

    return pd.DataFrame(results, columns=['cookie_name', 'top_level_etld', 'hold_id', 'unique_ok', 'similarity_ok', 'passed_checkin', 'source_file'])

# -----------------------
# Main
# -----------------------
def main():
    try:
        files = list_input_files(PATH)
        processed = read_checkpoint(PROCESSED_LIST)

        if not files:
            log_and_print('warning', f'No CSV files found in: {PATH}')
            return

        log_and_print('info', f'Found {len(files)} files. Already processed: {len(processed)}.')

        for fname in tqdm(files, total=len(files), desc='Analyzing files'):
            if fname in processed:
                log_and_print('info', f'SKIP (already processed): {fname}')
                continue

            fpath = os.path.join(PATH, fname)
            try:
                per_file_results = analyze_file(fpath, fname)

                if not per_file_results.empty:
                    append_results(per_file_results, OUTPUT_FILE)

                append_checkpoint(PROCESSED_LIST, fname)
                log_and_print('info', f'DONE (processed): {fname} | rows: {len(per_file_results)}')

            except Exception as e:
                log_and_print('error', f'FAIL (processing): {fname} | error: {e}')

        log_and_print('info', 'Completed iteration over all files.')

    except KeyboardInterrupt:
        log_and_print('warning', 'Interrupted by user.')
        sys.exit(130)

if __name__ == '__main__':
    main()
