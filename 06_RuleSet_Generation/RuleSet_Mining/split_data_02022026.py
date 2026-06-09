#!/usr/bin/env python3
"""
Split positive/negative CSVs into train/test sets with a 90/10 ratio.

Default inputs:
  data_02022026/positive.csv
  data_02022026/negative.csv

Default outputs (written to --out-dir):
  positive_train.csv
  positive_test.csv
  negative_train.csv
  negative_test.csv

The split is reproducible via --seed and shuffles rows before splitting.
"""

import argparse
import os
from typing import Tuple

import pandas as pd


def split_df(
    df: pd.DataFrame, train_ratio: float = 0.9, seed: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    if not 0.0 < train_ratio < 1.0:
        raise ValueError("--train-ratio must be between 0 and 1.")
    df_shuffled = df.sample(frac=1.0, random_state=seed).reset_index(drop=True)
    n_train = int(len(df_shuffled) * train_ratio)
    return df_shuffled.iloc[:n_train].copy(), df_shuffled.iloc[n_train:].copy()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Split positive.csv and negative.csv into 90/10 train/test sets."
    )
    parser.add_argument(
        "--pos",
        default="data_02022026/positive.csv",
        help="Path to positive CSV (default: data_02022026/positive.csv).",
    )
    parser.add_argument(
        "--neg",
        default="data_02022026/negative.csv",
        help="Path to negative CSV (default: data_02022026/negative.csv).",
    )
    parser.add_argument(
        "--out-dir",
        default="data_02022026",
        help="Output directory for train/test CSVs (default: data_02022026).",
    )
    parser.add_argument(
        "--train-ratio",
        type=float,
        default=0.9,
        help="Train split ratio (default: 0.9).",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for reproducible shuffle (default: 42).",
    )
    args = parser.parse_args()

    if not os.path.exists(args.pos):
        raise FileNotFoundError(f"Positive CSV not found: {args.pos}")
    if not os.path.exists(args.neg):
        raise FileNotFoundError(f"Negative CSV not found: {args.neg}")

    os.makedirs(args.out_dir, exist_ok=True)

    print(f"Loading positive CSV: {args.pos}")
    pos_df = pd.read_csv(args.pos)
    print(f"Loading negative CSV: {args.neg}")
    neg_df = pd.read_csv(args.neg)

    pos_train, pos_test = split_df(pos_df, train_ratio=args.train_ratio, seed=args.seed)
    neg_train, neg_test = split_df(neg_df, train_ratio=args.train_ratio, seed=args.seed)

    pos_train_path = os.path.join(args.out_dir, "positive_train.csv")
    pos_test_path = os.path.join(args.out_dir, "positive_test.csv")
    neg_train_path = os.path.join(args.out_dir, "negative_train.csv")
    neg_test_path = os.path.join(args.out_dir, "negative_test.csv")

    pos_train.to_csv(pos_train_path, index=False)
    pos_test.to_csv(pos_test_path, index=False)
    neg_train.to_csv(neg_train_path, index=False)
    neg_test.to_csv(neg_test_path, index=False)

    print("Done.")
    print(f"  Positive: {len(pos_df):,} total -> {len(pos_train):,} train, {len(pos_test):,} test")
    print(f"    - {pos_train_path}")
    print(f"    - {pos_test_path}")
    print(f"  Negative: {len(neg_df):,} total -> {len(neg_train):,} train, {len(neg_test):,} test")
    print(f"    - {neg_train_path}")
    print(f"    - {neg_test_path}")


if __name__ == "__main__":
    main()

