#!/usr/bin/env python3
"""
Extract query-parameter keys from a URL CSV and generate two plots (PDF).

Outputs (two files):
1) Query key distribution plot (rank vs frequency, log-y)
2) Cumulative distribution plot with Pareto cutoffs (N80 / N90)

Example:
  python analyze_query_keys_to_csv_plots.py \
    --input-csv data_small/negative_train.csv \
    --url-column url \
    --output-dir out
"""

from __future__ import annotations

import argparse
import os
from collections import Counter
from pathlib import Path
from typing import List
from urllib.parse import parse_qs, urlparse
from matplotlib import rcParams
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")  # non-interactive backend
import matplotlib.pyplot as plt


def extract_query_keys(url: str) -> List[str]:
    """Return sorted list of unique query parameter keys for a URL."""
    if pd.isna(url) or not url or not isinstance(url, str):
        return []

    try:
        parsed = urlparse(url)
        query_params = parse_qs(parsed.query)
        return sorted(query_params.keys())
    except Exception:
        return []


def build_key_counter(input_csv: str, url_column: str, chunksize: int) -> Counter:
    """Scan CSV in chunks and count query-parameter keys."""
    key_counter: Counter = Counter()

    total_rows = 0
    chunk_iter = pd.read_csv(input_csv, chunksize=chunksize, low_memory=False)
    for chunk_idx, chunk in enumerate(chunk_iter, start=1):
        if url_column not in chunk.columns:
            raise ValueError(
                f"Column '{url_column}' not found in {input_csv}. "
                f"Available columns: {list(chunk.columns)}"
            )

        # Update counter per row (streaming-friendly).
        for url in chunk[url_column]:
            key_counter.update(extract_query_keys(url))

        total_rows += len(chunk)
        if chunk_idx % 10 == 0:
            print(f"Processed {chunk_idx} chunks, {total_rows:,} rows...")

    print(f"Finished scanning {total_rows:,} rows.")
    print(f"Found {len(key_counter):,} unique query keys.")
    return key_counter


def _counts_desc(key_counter: Counter) -> List[int]:
    """Counts sorted descending (rank-frequency series)."""
    return sorted((int(v) for v in key_counter.values()), reverse=True)


def plot_key_distribution(counts_desc: List[int], output_path: str) -> None:
    """Rank-frequency plot (log-y), like the 'Query Key Distribution' view."""
    if not counts_desc:
        raise ValueError("No query keys found; cannot plot distribution.")

    x = np.arange(1, len(counts_desc) + 1)
    y = np.array(counts_desc, dtype=float)

    # 16:9-ish layout + higher readability, black/white styling.
    #plt.figure(figsize=(16, 3))
    rcParams['figure.figsize'] = 16,8
    plt.plot(x, y, color="black", linewidth=2.5, alpha=0.9)
    plt.yscale("log")
    plt.grid(True, color="0.85", linewidth=1, alpha=1.0)

    plt.xlabel(
        "Query Key Rank (1 = most frequent)",
        fontsize=28,
    )
    plt.ylabel(
        "Frequency (log scale)",
        fontsize=28,
    )
    # No title (paper-friendly); rely on caption in LaTeX.
    plt.tick_params(axis="both", which="major", labelsize=20)
    plt.tight_layout()
    # plt.show()
    plt.savefig(output_path, bbox_inches="tight", dpi=600, format='pdf')
    plt.close()


def plot_cumulative_pareto(counts_desc: List[int], output_path: str) -> tuple[int, int]:
    """Cumulative distribution with N95/N99 cutoffs."""
    if not counts_desc:
        raise ValueError("No query keys found; cannot plot Pareto curve.")

    counts = np.array(counts_desc, dtype=float)
    cumsum = np.cumsum(counts)
    cumsum_pct = (cumsum / cumsum[-1]) * 100.0
    x = np.arange(1, len(cumsum_pct) + 1)

    n95 = int(np.argmax(cumsum_pct >= 95.0) + 1)
    n99 = int(np.argmax(cumsum_pct >= 99.0) + 1)

    # Match the 16:9-ish styling used for the distribution plot.
    #plt.figure(figsize=(18, 4))
    rcParams['figure.figsize'] = 16, 8
    # Keep Pareto plot colored for readability in papers/presentations.
    plt.plot(x, cumsum_pct, color="tab:red", linewidth=2.5, alpha=0.9)
    plt.grid(True, color="0.85", linewidth=1, alpha=1.0)
    plt.ylim(0, 100)
    plt.xlim(1, len(cumsum_pct))
    plt.xlabel("Number of Top Keys", fontsize=28)
    plt.ylabel("Cumulative % of Total Occurrences", fontsize=28)
    # No title (paper-friendly); rely on caption in LaTeX.
    plt.tick_params(axis="both", which="major", labelsize=20)

    # Cutoff lines + markers.
    plt.axvline(x=n95, color="tab:orange", linestyle="--", alpha=0.9, linewidth=2, label=f"N95 = {n95} keys")
    plt.axvline(x=n99, color="tab:purple", linestyle="--", alpha=0.9, linewidth=2, label=f"N99 = {n99} keys")
    plt.axhline(y=95, color="0.6", linestyle=":", alpha=0.8)
    plt.axhline(y=99, color="0.6", linestyle=":", alpha=0.8)
    plt.plot([n95], [95], "o", color="tab:orange", markersize=7)
    plt.plot([n99], [99], "o", color="tab:purple", markersize=7)

    plt.legend(loc="lower right", fontsize=18, frameon=False)
    plt.tight_layout()
    plt.savefig(output_path, bbox_inches="tight", dpi=600, format='pdf')
    plt.close()

    return n95, n99


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Extract query keys and generate two plots (PDF)."
    )
    p.add_argument("--input-csv", required=True, help="Path to input CSV containing URLs.")
    p.add_argument("--url-column", default="url", help="Name of the URL column. Default: url")
    p.add_argument(
        "--chunksize",
        type=int,
        default=10_000,
        help="Rows per chunk when reading CSV. Default: 10000",
    )
    p.add_argument(
        "--output-dir",
        default=".",
        help="Directory to write output plot files. Default: current directory",
    )
    p.add_argument(
        "--output-prefix",
        default=None,
        help="Prefix for output file names. Default: input CSV stem",
    )
    return p.parse_args()


def main() -> None:
    args = parse_args()

    input_csv = args.input_csv
    url_column = args.url_column
    chunksize = args.chunksize
    output_dir = args.output_dir

    if not os.path.exists(input_csv):
        raise FileNotFoundError(f"Input CSV not found: {input_csv}")

    Path(output_dir).mkdir(parents=True, exist_ok=True)
    prefix = args.output_prefix or Path(input_csv).stem

    print("=" * 80)
    print("QUERY KEY PLOTS (DISTRIBUTION + PARETO)")
    print("=" * 80)
    print(f"Input: {input_csv}")
    print(f"URL column: {url_column}")
    print(f"Chunksize: {chunksize}")
    print(f"Output dir: {output_dir}")

    key_counter = build_key_counter(input_csv=input_csv, url_column=url_column, chunksize=chunksize)

    distribution_pdf = os.path.join(output_dir, f"{prefix}_query_key_distribution.pdf")
    pareto_pdf = os.path.join(output_dir, f"{prefix}_query_key_cumulative_pareto.pdf")

    counts_desc = _counts_desc(key_counter)
    print(f"\nSaving distribution plot to {distribution_pdf} ...")
    plot_key_distribution(counts_desc, distribution_pdf)

    print(f"Saving Pareto plot to {pareto_pdf} ...")
    n95, n99 = plot_cumulative_pareto(counts_desc, pareto_pdf)
    print(f"\nPareto cutoffs: N95={n95} keys, N99={n99} keys")

    print("\nDone.")


if __name__ == "__main__":
    main()

