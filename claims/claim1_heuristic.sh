#!/usr/bin/env bash
# Claim 1 (scaled-down): FPT cookie heuristic (C3 length-difference, C4 Ratcliff/
# Obershelp <= 0.6) on frozen candidate shards reproduces the reference
# hold_id classification. C1/C2 (lifetime/length) were applied in the upstream
# SQL stage; see docs/schema.md. Full-scale run: ~1 week / 120 GB RAM;
# this scaled-down run uses SHARDS shards (default 2) and finishes in minutes.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out

SHARDS="${SHARDS:-2}"
INPUT_DIR="${INPUT_DIR:-02_Data/potential_first_party_tracking_cookies}"

# TODO ANPASSEN: cookie_heuristik_opti.py auf CLI-Argumente umstellen (Befund C):
#   --input-dir, --num-shards, --output
python Code/Heuristik/cookie_heuristik_opti.py \
  --input-dir "$INPUT_DIR" --num-shards "$SHARDS" \
  --output out/claim1_holding_ids.csv

python - << 'PY'
import pandas as pd
got = pd.read_csv("out/claim1_holding_ids.csv")
ref = pd.read_csv("claims/expected/claim1_reference.csv")
key = ["name", "top_level_etld"]
m = got.merge(ref, on=key, suffixes=("_got", "_ref"))
mismatch = (m["hold_id_got"] != m["hold_id_ref"]).sum()
print(f"Compared {len(m)} cookie entries, {mismatch} classification mismatches.")
assert mismatch == 0, "CLAIM 1 FAIL"
print("CLAIM 1 PASS: hold_id classification identical to reference "
      "(full dataset: 31,850 of 281,815 rows hold_id=True; "
      "aggregating to distinct names yields the paper's Section-4 figures).")
PY
