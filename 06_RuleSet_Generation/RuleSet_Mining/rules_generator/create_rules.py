#!/usr/bin/env python3
"""
Create more compact regex rules from FP-Growth itemsets using lookaheads.

Instead of generating one rule per permutation of query parameters, this script
builds ONE regex per itemset that checks "set membership" via positive lookaheads, e.g.:

  /[\?&](?=[^#]*\bif=)(?=[^#]*\br=)(?=[^#]*\bv=)[^#]*/

for the itemset "has_if & has_r & has_v".

CONFIG:
  - PATTERN_CSV should point to a CSV with at least columns:
        itemset,length,support_pos,support_neg,count_pos,count_neg,lift_ratio,...
  - MIN_LIFT filters itemsets by lift_ratio >= MIN_LIFT.
  - MAX_PARAMS limits how many query keys per itemset we convert (to avoid huge rules).

Usage example:

  python evaluation/create_rules3.py \
    --input /home/ubuntu/Desktop/SST/contrastiv_pattern_mining_2.0/outputs_max_depth_3_161/itemsets_minsup_0.001.csv \
    --output evaluation/rules_keys161_lookahead.txt \
    --min-lift 10 \
    --max-params 3
"""

import argparse
import csv
import re
from pathlib import Path
from typing import Iterable, List


def extract_params(itemset: str) -> List[str]:
    """
    Extract param names from strings like:
      "has_if & has_r & has_v"
    Returns ["if", "r", "v"] (deduped, order-preserving).
    """
    parts = [p.strip() for p in itemset.split("&")]
    params: List[str] = []
    for p in parts:
        if p.startswith("has_"):
            name = p[len("has_"):].strip()
            if name:
                params.append(name)

    seen = set()
    out: List[str] = []
    for x in params:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out


def safe_literal(s: str) -> str:
    """Escape anything that could be regex-special (very conservative)."""
    return re.escape(s)


def build_lookahead_rule(params: Iterable[str]) -> str:
    """
    Build a single regex rule using positive lookaheads to ensure that
    ALL of the given params appear somewhere in the query string, in ANY order.

    For example, params = ["if", "r", "v"] becomes:
      /[\?&](?=[^#]*\bif=)(?=[^#]*\br=)(?=[^#]*\bv=)[^#]*/
    """
    params = list(params)
    if not params:
        return ""

    # Single key: simple pattern without lookaheads
    if len(params) == 1:
        p = safe_literal(params[0])
        return rf"/[\?&]{p}=/"

    # Multi-key: lookaheads for each param, then consume until end or '#'
    lookaheads = []
    for p in params:
        lit = safe_literal(p)
        lookaheads.append(rf"(?=[^#]*\b{lit}=)")

    # Prefix '[\?&]' to anchor at query start or additional param,
    # then all lookaheads, then any chars up to a fragment.
    return "/[\\?&]" + "".join(lookaheads) + "[^#]*/"


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Create compact regex rules from itemsets using lookaheads."
    )
    parser.add_argument(
        "--input",
        required=True,
        help="Path to itemsets CSV (with columns: itemset, lift_ratio, ...).",
    )
    parser.add_argument(
        "--output",
        required=True,
        help="Path to output rules file.",
    )
    parser.add_argument(
        "--min-lift",
        type=float,
        default=2.0,
        help="Minimum lift_ratio threshold (default: 2.0).",
    )
    parser.add_argument(
        "--max-params",
        type=int,
        default=4,
        help="Maximum number of query keys per itemset to convert (default: 4).",
    )
    args = parser.parse_args()

    in_path = Path(args.input)
    out_path = Path(args.output)

    if not in_path.exists():
        raise SystemExit(f"Input not found: {in_path.resolve()}")

    # Ensure output directory exists (handles outputs like "evaluation/xyz.txt")
    if out_path.parent and str(out_path.parent) not in [".", ""]:
        out_path.parent.mkdir(parents=True, exist_ok=True)

    rules: List[str] = []
    total_patterns = 0
    kept_patterns = 0
    skipped_too_many = 0

    with in_path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            itemset_str = (row.get("itemset") or "").strip()
            if not itemset_str:
                continue

            try:
                lift = float(row.get("lift_ratio", "nan"))
            except ValueError:
                continue

            total_patterns += 1

            # Filter by minimum lift
            if lift < args.min_lift:
                continue

            params = extract_params(itemset_str)
            if not params:
                continue

            if len(params) > args.max_params:
                skipped_too_many += 1
                continue

            rule = build_lookahead_rule(params)
            if rule:
                rules.append(rule)
                kept_patterns += 1

    # Deduplicate while preserving order
    seen = set()
    deduped: List[str] = []
    for r in rules:
        if r not in seen:
            seen.add(r)
            deduped.append(r)
    rules = deduped

    out_path.write_text("\n".join(rules) + ("\n" if rules else ""), encoding="utf-8")

    print(f"Itemsets scanned:            {total_patterns:,}")
    print(f"Itemsets kept (lift >= {args.min_lift}): {kept_patterns:,}")
    print(f"Rules written (deduped):     {len(rules):,} -> {out_path.resolve()}")
    if skipped_too_many:
        print(
            f"Skipped patterns with > {args.max_params} params: "
            f"{skipped_too_many:,}"
        )


if __name__ == "__main__":
    main()

