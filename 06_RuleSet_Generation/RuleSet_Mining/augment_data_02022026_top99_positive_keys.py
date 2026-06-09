#!/usr/bin/env python3
"""
Augment data_02022026 CSVs with binary query-key features (has_<key>).

Key selection:
  - Compute query-key frequencies from the POSITIVE dataset (default: data_02022026/positive.csv)
  - Choose the smallest Top-N set that covers 99% of all key occurrences (N99)

Then augment ALL matching datasets found in data_02022026/:
  - positive.csv, negative.csv
  - positive_train.csv, positive_test.csv
  - negative_train.csv, negative_test.csv

Outputs:
  - Written under features_data/data_02022026/ with names like:
      positive_train_with_query_keys_positive_N99_<N>.csv
  - Also writes a key list file:
      features_data/data_02022026/most_common_queryKeys_positive_N99_<N>.txt

Run:
  venv/bin/python augment_data_02022026_top99_positive_keys.py
"""

from __future__ import annotations

import os
from collections import Counter
from pathlib import Path
from typing import Dict, Iterable, List, Sequence
from urllib.parse import parse_qs, urlparse

import numpy as np
import pandas as pd


DATA_DIR = "data_02022026"
OUT_DIR = os.path.join("features_data", "data_02022026")

POSITIVE_SOURCE_CSV = os.path.join(DATA_DIR, "positive.csv")
URL_COLUMN = "url"

CHUNKSIZE = 10_000
COVERAGE_TARGET = 99.0  # percent


def extract_query_keys(url: str) -> List[str]:
    if pd.isna(url) or not url or not isinstance(url, str):
        return []
    try:
        parsed = urlparse(url)
        return list(parse_qs(parsed.query).keys())
    except Exception:
        return []


def build_key_counter(input_csv: str, url_column: str, chunksize: int) -> Counter:
    counter: Counter = Counter()
    total_rows = 0
    for chunk in pd.read_csv(input_csv, chunksize=chunksize, low_memory=False):
        if url_column not in chunk.columns:
            raise ValueError(
                f"Column '{url_column}' not found in {input_csv}. "
                f"Available columns: {list(chunk.columns)}"
            )
        for url in chunk[url_column]:
            counter.update(extract_query_keys(url))
        total_rows += len(chunk)
    print(f"Scanned {total_rows:,} rows from {input_csv}")
    print(f"Found {len(counter):,} unique query keys in positives.")
    return counter


def n_for_coverage(counter: Counter, target_pct: float) -> int:
    counts = np.array(sorted(counter.values(), reverse=True), dtype=float)
    if counts.size == 0:
        return 0
    cumsum_pct = np.cumsum(counts) / counts.sum() * 100.0
    n = int(np.argmax(cumsum_pct >= target_pct) + 1)
    return n


def ensure_dir(path: str) -> None:
    Path(path).mkdir(parents=True, exist_ok=True)


def write_key_list(path: str, keys: Sequence[str], counter: Dict[str, int]) -> None:
    with open(path, "w", encoding="utf-8") as f:
        f.write("Query Parameter Key Rankings\n")
        f.write("=" * 50 + "\n")
        f.write(f"Source: positive, Coverage target: {COVERAGE_TARGET:.0f}%\n")
        f.write(f"Selected keys (Top-N): {len(keys)}\n")
        f.write("=" * 50 + "\n\n")
        for i, k in enumerate(keys, 1):
            f.write(f"{i:4d}. {k}: {counter.get(k, 0):,} occurrences\n")


def augment_csv(
    input_csv: str,
    output_csv: str,
    url_column: str,
    keys: Sequence[str],
    chunksize: int = 10_000,
) -> None:
    print(f"\nAugmenting {input_csv} -> {output_csv}")
    total_rows = 0
    first = True

    for chunk in pd.read_csv(input_csv, chunksize=chunksize, low_memory=False):
        if url_column not in chunk.columns:
            raise ValueError(f"Column '{url_column}' not found in {input_csv}")

        # Parse keys once per URL in this chunk
        key_sets = [set(extract_query_keys(u)) for u in chunk[url_column].tolist()]

        feat = {
            f"has_{k}": [1 if k in s else 0 for s in key_sets]
            for k in keys
        }
        feat_df = pd.DataFrame(feat)
        out_chunk = pd.concat([chunk.reset_index(drop=True), feat_df], axis=1)

        if first:
            out_chunk.to_csv(output_csv, index=False)
            first = False
        else:
            out_chunk.to_csv(output_csv, mode="a", header=False, index=False)

        total_rows += len(chunk)
        if total_rows % (chunksize * 10) == 0:
            print(f"  Processed {total_rows:,} rows...")

    print(f"  Done. Wrote {total_rows:,} rows with {len(keys)} features.")


def main() -> None:
    if not os.path.exists(POSITIVE_SOURCE_CSV):
        raise FileNotFoundError(f"Missing positive source CSV: {POSITIVE_SOURCE_CSV}")

    ensure_dir(OUT_DIR)

    # 1) Compute N99 keys from positive.csv
    print("=" * 80)
    print("SELECTING TOP KEYS FROM POSITIVE DATASET (N99)")
    print("=" * 80)
    counter = build_key_counter(POSITIVE_SOURCE_CSV, URL_COLUMN, CHUNKSIZE)
    n99 = n_for_coverage(counter, COVERAGE_TARGET)
    if n99 <= 0:
        raise RuntimeError("No query keys found; cannot select N99.")

    top_keys = [k for k, _ in counter.most_common(n99)]
    print(f"N{int(COVERAGE_TARGET)} cutoff: {n99} keys")

    keys_out = os.path.join(OUT_DIR, f"most_common_queryKeys_positive_N99_{n99}.txt")
    write_key_list(keys_out, top_keys, dict(counter))
    print(f"Wrote key list: {keys_out}")

    # 2) Find datasets to augment
    candidates = [
        "positive.csv",
        "negative.csv",
        "positive_train.csv",
        "positive_test.csv",
        "negative_train.csv",
        "negative_test.csv",
    ]
    existing = [f for f in candidates if os.path.exists(os.path.join(DATA_DIR, f))]
    if not existing:
        raise RuntimeError(f"No known dataset CSVs found in {DATA_DIR}/")

    # 3) Augment each dataset
    print("=" * 80)
    print("AUGMENTING DATASETS WITH has_<key> FEATURES")
    print("=" * 80)
    for fname in existing:
        in_path = os.path.join(DATA_DIR, fname)
        stem = Path(fname).stem  # e.g., positive_train
        out_path = os.path.join(
            OUT_DIR, f"{stem}_with_query_keys_positive_N99_{n99}.csv"
        )
        augment_csv(in_path, out_path, URL_COLUMN, top_keys, chunksize=CHUNKSIZE)

    print("\nAll done.")
    print(f"Outputs written under: {OUT_DIR}/")


if __name__ == "__main__":
    main()

