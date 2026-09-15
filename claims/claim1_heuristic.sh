#!/usr/bin/env bash
# Claim 1 (scaled down): the four-criterion FPT cookie heuristic.
#
# C1 (lifetime > 90 days) and C2 (value length >= 8 bytes) are applied in the
# upstream SQL stage and are already materialized in the shipped shards as the
# columns valid_expires_date and valid_entropy (see docs/schema.md). This
# script re-runs the two criteria that are implemented in Python:
#
#   C3  uniqueness   -> relative value-length difference <= 0.25 across profiles
#   C4  similarity   -> Ratcliff/Obershelp <= 0.6
#
# WHAT THIS VERIFIES
#   That the shipped heuristic implementation, run on the shipped candidate
#   shards, deterministically reproduces the classification recorded in
#   claims/expected/claim1_reference.csv.
#
# WHAT THIS DOES NOT VERIFY
#   The paper's Section 4 aggregate counts. Those were computed over a
#   different, larger export (fp_cookies_holding_id_candidates_*.csv) that is
#   not part of this artifact. Because the heuristic groups cookies per shard,
#   its output depends on how rows are distributed across shard files, so the
#   published aggregates cannot be recomputed from the shards shipped here.
#   See README, section "Scope of reproduction".
#
# A full-scale run takes roughly a week and ~120 GB RAM. The default of two
# shards finishes in well under a minute.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out

SHARDS="${SHARDS:-2}"
INPUT_DIR="${INPUT_DIR:-02_Data/potential_first_party_tracking_cookies}"
REFERENCE="claims/expected/claim1_reference.csv"
GENERATED="out/claim1_holding_ids.csv"

if [ ! -d "$INPUT_DIR" ] || [ -z "$(ls -A "$INPUT_DIR" 2>/dev/null)" ]; then
  echo "ERROR: dataset not found or empty: $INPUT_DIR" >&2
  echo "Run ./install.sh first (see README, section 'Installation')." >&2
  exit 2
fi

if [ ! -f "$REFERENCE" ]; then
  echo "ERROR: reference output not found: $REFERENCE" >&2
  echo "This file is tracked in Git; the repository appears to be incomplete." >&2
  exit 2
fi

echo "== Claim 1: FPT cookie heuristic (C3/C4) =="
echo "Input    : $INPUT_DIR (first $SHARDS shard(s))"
echo "Reference: $REFERENCE"
echo

python Code/Heuristik/cookie_heuristik_opti.py \
  --input-dir "$INPUT_DIR" \
  --num-shards "$SHARDS" \
  --output "$GENERATED" \
  --fresh

echo

if cmp -s "$GENERATED" "$REFERENCE"; then
  python - "$GENERATED" << 'PY'
import sys
import pandas as pd
df = pd.read_csv(sys.argv[1])
total = len(df)
hold = int(df["hold_id"].sum())
names = df.loc[df["hold_id"], "cookie_name"].nunique()
print(f"CLAIM 1 PASS: output byte-identical to the reference.")
print(f"              {hold} of {total} (cookie_name, eTLD) pairs classified "
      f"hold_id=True,")
print(f"              spanning {names} distinct cookie names.")
PY
else
  echo "CLAIM 1 FAIL: output differs from ${REFERENCE}." >&2
  echo "First differing lines:" >&2
  diff "$GENERATED" "$REFERENCE" | head -20 >&2
  exit 1
fi
