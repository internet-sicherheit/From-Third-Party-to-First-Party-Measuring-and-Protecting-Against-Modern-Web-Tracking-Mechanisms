#!/usr/bin/env python3
"""
Compare blocking statistics for a classified CSV with columns:
  - blocked_easylist
  - blocked_easyprivacy
  - blocked_fpg

Usage example (ratio 2, 341 keys):

  python evaluation/compare_blocking_stats.py \
    --csv evaluation/ratio2/set1_classified_keys341_small.csv \
    --label "ratio2, keys341_small"

You can run the same for ratio4 and/or for the 163-key experiments.
"""

import argparse
import os
from typing import Optional

import pandas as pd


def bool_col(df: pd.DataFrame, name: str) -> pd.Series:
    """Return a boolean Series, robust to 0/1, True/False, 'true'/'false'."""
    if df[name].dtype == bool:
        return df[name]
    return df[name].astype(str).str.lower().isin(["1", "true", "t", "yes"])


def summarize_single_csv(
    path: str,
    label: Optional[str] = None,
    blocked_out: Optional[str] = None,
) -> None:
    if not os.path.exists(path):
        raise FileNotFoundError(f"CSV not found: {path}")

    print("=" * 80)
    print(f"FILE: {path}")
    if label:
        print(f"LABEL: {label}")
    print("=" * 80)

    df = pd.read_csv(path)
    required_cols = ["blocked_easylist", "blocked_easyprivacy", "blocked_fpg"]
    for c in required_cols:
        if c not in df.columns:
            raise ValueError(f"Column '{c}' not found in CSV {path}")

    el = bool_col(df, "blocked_easylist")
    ep = bool_col(df, "blocked_easyprivacy")
    fp = bool_col(df, "blocked_fpg")

    n = len(df)
    print(f"Total URLs: {n:,}")

    def pct(x: int) -> float:
        return 100.0 * x / n if n > 0 else 0.0

    # Marginal stats
    n_el = int(el.sum())
    n_ep = int(ep.sum())
    n_fp = int(fp.sum())

    print("\n=== Marginal blocking rates ===")
    print(f"EasyList:        {n_el:7,} ({pct(n_el):5.2f}%)")
    print(f"EasyPrivacy:     {n_ep:7,} ({pct(n_ep):5.2f}%)")
    print(f"FP-Growth rules: {n_fp:7,} ({pct(n_fp):5.2f}%)")

    # Baseline union (EasyList ∪ EasyPrivacy)
    base = el | ep
    n_base = int(base.sum())
    print("\n=== Baseline union (EasyList ∪ EasyPrivacy) ===")
    print(f"Blocked by baseline: {n_base:7,} ({pct(n_base):5.2f}%)")

    # Overlaps
    print("\n=== Overlaps between systems ===")
    both_el_ep = int((el & ep).sum())
    both_el_fp = int((el & fp).sum())
    both_ep_fp = int((ep & fp).sum())
    all_three = int((el & ep & fp).sum())

    print(f"EasyList ∩ EasyPrivacy: {both_el_ep:7,} ({pct(both_el_ep):5.2f}%)")
    print(f"EasyList ∩ FP-Growth:   {both_el_fp:7,} ({pct(both_el_fp):5.2f}%)")
    print(f"EasyPrivacy ∩ FP-Growth:{both_ep_fp:7,} ({pct(both_ep_fp):5.2f}%)")
    print(f"All three:              {all_three:7,} ({pct(all_three):5.2f}%)")

    # FP-Growth vs baseline
    fp_only = int((fp & ~base).sum())
    base_only = int((base & ~fp).sum())
    both_base_fp = int((fp & base).sum())

    print("\n=== FP-Growth vs baseline (EasyList ∪ EasyPrivacy) ===")
    print(f"Blocked by FP-Growth only:              {fp_only:7,} ({pct(fp_only):5.2f}%)")
    print(f"Blocked by baseline only:               {base_only:7,} ({pct(base_only):5.2f}%)")
    print(f"Blocked by both baseline and FP-Growth: {both_base_fp:7,} ({pct(both_base_fp):5.2f}%)")

    # Optionally write all URLs blocked by FP-Growth to a separate file
    if blocked_out is not None:
        blocked_df = df[fp].copy()
        blocked_df.to_csv(blocked_out, index=False)
        print(f"\nBlocked-by-FP-Growth URLs written to: {blocked_out}")

    print("\nDone.\n")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Compare blocking stats for EasyList, EasyPrivacy, and FP-Growth rules."
    )
    parser.add_argument(
        "--csv",
        required=True,
        help=(
            "Path to classified CSV "
            "(e.g., evaluation/ratio2/set1_classified_keys341_small.csv)"
        ),
    )
    parser.add_argument(
        "--label",
        default=None,
        help="Optional label for this run (printed in the summary).",
    )
    parser.add_argument(
        "--blocked-out",
        default=None,
        help=(
            "Optional path to write only the URLs where blocked_fpg == True "
            "(e.g., evaluation/blocked_fpg_794_500.csv)"
        ),
    )
    args = parser.parse_args()
    summarize_single_csv(args.csv, args.label, args.blocked_out)


if __name__ == "__main__":
    main()


