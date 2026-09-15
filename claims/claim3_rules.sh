#!/usr/bin/env bash
# Claim 3: the rule generator derives exactly the 181 filter rules published in
# Section 5.5 from the frozen FP-Growth itemset table.
#
# Everything this needs is tracked in Git -- no dataset download required.
# Runs offline in a few seconds.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out

ITEMSETS="06_RuleSet_Generation/RuleSet_Mining/fpg_outputs_max_depth__161/itemsets_minsup_0.001.csv"
REFERENCE="claims/expected/rules_181.txt"
GENERATED="out/rules_generated.txt"

for f in "$ITEMSETS" "$REFERENCE"; do
  if [ ! -f "$f" ]; then
    echo "ERROR: required input not found: $f" >&2
    echo "This file is tracked in Git; the repository appears to be incomplete." >&2
    exit 2
  fi
done

echo "== Claim 3: filter rule generation =="
echo "Itemsets : $ITEMSETS"
echo "Reference: $REFERENCE"
echo

# --min-lift 10 and --max-params 3 are the defaults, passed explicitly so the
# paper configuration is visible in the evaluation log.
python 06_RuleSet_Generation/RuleSet_Mining/rules_generator/create_rules.py \
  --input "$ITEMSETS" \
  --min-lift 10 --max-params 3 \
  --output "$GENERATED"

n=$(wc -l < "$GENERATED")
echo

if cmp -s "$GENERATED" "$REFERENCE"; then
  echo "CLAIM 3 PASS: ${n} rules generated, byte-identical to the reference"
  echo "              (paper Section 5.5: 181 rules)."
else
  echo "CLAIM 3 FAIL: ${n} rules generated; diff against ${REFERENCE}:" >&2
  diff "$GENERATED" "$REFERENCE" | head -20 >&2
  exit 1
fi
