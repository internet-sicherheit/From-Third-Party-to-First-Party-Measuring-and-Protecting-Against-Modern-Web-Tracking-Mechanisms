#!/usr/bin/env bash
# Claim 3: rule generation derives exactly 181 filter rules from frozen itemsets.
# All inputs are in Git; runs offline in seconds.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out

# TODO ANPASSEN: exakte CLI von create_rules.py verifizieren (--min-lift 10 --max-params 3)
python 06_RuleSet_Generation/RuleSet_Mining/rules_generator/create_rules.py \
  --input 06_RuleSet_Generation/RuleSet_Mining/fpg_outputs_max_depth__161/itemsets_minsup_0.001.csv \
  --min-lift 10 --max-params 3 \
  --output out/rules_generated.txt

n=$(wc -l < out/rules_generated.txt)
if diff <(sort out/rules_generated.txt) <(sort claims/expected/rules_181.txt) >/dev/null; then
  echo "CLAIM 3 PASS: ${n} rules, identical to reference (paper Section 5.5: 181 rules)."
else
  echo "CLAIM 3 FAIL: ${n} rules generated, diff against claims/expected/rules_181.txt:"
  diff <(sort out/rules_generated.txt) <(sort claims/expected/rules_181.txt) | head -20
  exit 1
fi
