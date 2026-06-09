#!/usr/bin/env python3
"""
FP-Growth Pattern Mining for Tracking URL Analysis
Mines frequent itemsets separately for tracking (positive) and non-tracking (negative) URLs,
computes per-class supports, lift metrics, Fisher's exact test p-values, and generates
CSV tables into outputs/. Plotting is handled by plot_and_sort_results.py.
"""

import os
from typing import List, Tuple, Dict, Iterable

import numpy as np
import pandas as pd
from scipy.stats import fisher_exact
from mlxtend.frequent_patterns import fpgrowth


# -----------------------------
# Utility and data preparation
# -----------------------------

def ensure_dir(path: str) -> None:
    if path and not os.path.exists(path):
        os.makedirs(path, exist_ok=True)


def load_feature_data(positive_csv: str, negative_csv: str) -> Tuple[pd.DataFrame, pd.DataFrame, List[str]]:
    """
    Load datasets and extract binary feature columns starting with 'has_'.
    Non-binary/non-feature columns (e.g., raw URL) are ignored.
    """
    # Discover feature columns without loading full CSVs
    pos_cols = pd.read_csv(positive_csv, nrows=0).columns
    neg_cols = pd.read_csv(negative_csv, nrows=0).columns
    feature_cols = [c for c in pos_cols if c.startswith('has_')]

    if not feature_cols:
        raise ValueError("No feature columns starting with 'has_' were found.")

    # Ensure both datasets have identical feature columns and ordering
    missing_in_neg = [c for c in feature_cols if c not in neg_cols]
    if missing_in_neg:
        raise ValueError(f"Negative dataset missing feature columns: {missing_in_neg[:5]} ...")

    dtype_map = {col: "uint8" for col in feature_cols}

    pos = pd.read_csv(positive_csv, usecols=feature_cols, dtype=dtype_map)
    neg = pd.read_csv(negative_csv, usecols=feature_cols, dtype=dtype_map)

    # Cast to boolean for mlxtend
    pos_feat = pos.astype(bool)
    neg_feat = neg.astype(bool)

    return pos_feat, neg_feat, feature_cols


def itemset_to_str(items: Iterable[str]) -> str:
    """Stable, readable itemset string."""
    return " & ".join(sorted(items))


# -----------------------------
# Core analytics
# -----------------------------

def mine_itemsets_per_class(df_bool: pd.DataFrame, min_support: float, max_len: int = 4) -> pd.DataFrame:
    """
    Run FP-Growth on a boolean one-hot DataFrame and return itemsets with support.
    Columns: ['itemsets', 'support'] where itemsets are frozensets of feature names.
    Limited to max_len items per itemset to prevent combinatorial explosion.
    
    Args:
        df_bool: Boolean DataFrame with features
        min_support: Minimum support threshold
        max_len: Maximum number of items per itemset (default: 4)
    """
    if df_bool.empty:
        return pd.DataFrame(columns=['itemsets', 'support'])
    res = fpgrowth(df_bool, min_support=min_support, use_colnames=True, max_len=max_len)
    print(f"fpgrowth is done (max_len={max_len})")
    # Ensure itemsets are frozenset for set operations later
    if not res.empty:
        res['itemsets'] = res['itemsets'].apply(lambda s: frozenset(s))
    return res


def compute_support_for_itemset(df_bool: pd.DataFrame, itemset: Iterable[str]) -> Tuple[float, int]:
    """
    Compute support (fraction) and count for an itemset on the given boolean DF.
    """
    if not itemset:
        return 0.0, 0
    cols = list(itemset)
    present = df_bool[cols].all(axis=1)
    count = int(present.sum())
    support = count / float(len(df_bool)) if len(df_bool) > 0 else 0.0
    return support, count


def analyze_threshold(
    pos_bool: pd.DataFrame,
    neg_bool: pd.DataFrame,
    min_support: float,
    eps: float = 1e-6,
    max_depth: int = 4,
) -> pd.DataFrame:
    """
    For a given min_support, mine itemsets per class, compute per-class supports,
    lift metrics, Fisher's exact test p-values. Return a consolidated DataFrame.
    
    Args:
        pos_bool: Boolean DataFrame for positive class
        neg_bool: Boolean DataFrame for negative class
        min_support: Minimum support threshold
        eps: Small epsilon value for lift ratio calculation
        max_depth: Maximum number of items per itemset (default: 4)
    """
    pos_sets = mine_itemsets_per_class(pos_bool, min_support, max_len=max_depth)
    neg_sets = mine_itemsets_per_class(neg_bool, min_support, max_len=max_depth)

    pos_itemsets = set(pos_sets['itemsets']) if not pos_sets.empty else set()
    neg_itemsets = set(neg_sets['itemsets']) if not neg_sets.empty else set()
    all_itemsets = sorted(pos_itemsets.union(neg_itemsets), key=lambda s: (len(s), tuple(sorted(s))))

    records = []
    n_pos = len(pos_bool)
    n_neg = len(neg_bool)

    for items in all_itemsets:
        support_pos, count_pos = compute_support_for_itemset(pos_bool, items)
        support_neg, count_neg = compute_support_for_itemset(neg_bool, items)

        # Lift metrics
        lift_ratio = (support_pos + eps) / (support_neg + eps)
        log2_lift = np.log2(lift_ratio)

        # Fisher's exact test
        a = count_pos
        b = n_pos - count_pos
        c = count_neg
        d = n_neg - count_neg
        try:
            _, p_value = fisher_exact([[a, b], [c, d]], alternative='two-sided')
        except Exception:
            p_value = np.nan

        records.append(
            {
                'itemset': itemset_to_str(items),
                'itemset_frozenset': items,
                'length': len(items),
                'support_pos': support_pos,
                'support_neg': support_neg,
                'count_pos': count_pos,
                'count_neg': count_neg,
                'lift_ratio': lift_ratio,
                'log2_lift': log2_lift,
                'p_value': p_value,
            }
        )

    df = pd.DataFrame.from_records(records)
    if not df.empty:
        # Sort strictly by descending lift ratio
        df.sort_values('lift_ratio', ascending=False, inplace=True)
        # Drop helper column before returning/saving
    return df


# -----------------------------
# Pipeline orchestration
# -----------------------------

def run_pipeline(
    positive_csv: str,
    negative_csv: str,
    output_dir: str = 'outputs',
    support_thresholds: List[float] = [0.01, 0.02, 0.05],
    top_k: int = 50,
    max_depth: int = 4,
) -> None:
    ensure_dir(output_dir)

    print("Loading data and preparing features...")
    pos_bool, neg_bool, feature_cols = load_feature_data(positive_csv, negative_csv)
    print(f"Tracking rows: {len(pos_bool):,}, Non-tracking rows: {len(neg_bool):,}")
    print(f"Num features: {len(feature_cols)}")

    summary_lines = []

    for thr in support_thresholds:
        print(f"\n=== Analyzing min_support={thr}, max_depth={max_depth} ===")
        df = analyze_threshold(pos_bool, neg_bool, thr, eps=1e-6, max_depth=max_depth)

        # Save CSV
        csv_path = os.path.join(output_dir, f"itemsets_minsup_{thr}.csv")
        # Convert frozenset to string for CSV
        if not df.empty and 'itemset_frozenset' in df.columns:
            df = df.drop(columns=['itemset_frozenset'])
        df.to_csv(csv_path, index=False)
        print(f"Saved: {csv_path} ({len(df)} rows)")

        # Note: Plotting is now handled by plot_and_sort_results.py

        # Summary
        n_sig = int(((df['p_value'] < 0.05) & (np.abs(df['log2_lift']) > 1.0)).sum()) if not df.empty else 0
        summary_lines.append(f"min_support={thr}: {len(df)} itemsets, {n_sig} significant (p<0.05 & |log2_lift|>1)")

    # Write summary
    summary_path = os.path.join(output_dir, 'summary_stats.txt')
    with open(summary_path, 'w') as f:
        for line in summary_lines:
            f.write(line + "\n")
    print(f"Summary saved: {summary_path}")


def main():
    positive_csv = os.path.join('features_data', 'positive_train_with_query_keys_positive_161.csv')
    negative_csv = os.path.join('features_data', 'negative_train_with_query_keys_positive_161.csv')

    if not os.path.exists(positive_csv):
        print(f"Error: Missing file {positive_csv}")
        return
    if not os.path.exists(negative_csv):
        print(f"Error: Missing file {negative_csv}")
        return

    run_pipeline(
        positive_csv=positive_csv,
        negative_csv=negative_csv,
        output_dir='outputs_max_depth_3_161',
        support_thresholds=[0.001],
        top_k=161,
        max_depth=3,
    )


if __name__ == '__main__':
    main()


