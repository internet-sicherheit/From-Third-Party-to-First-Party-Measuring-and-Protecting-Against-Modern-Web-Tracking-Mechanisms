#!/usr/bin/env bash
# Claim 2: SimHash clustering (f=64, k=8) on the frozen fingerprint set
# (simhashes_24112025.csv, 26,605 hashes) reproduces the reference clustering
# (24,914 clusters), and entity attribution reproduces the frozen attribution
# results (492 providers).
# NOTE: paper-level aggregates (Table 2/5) require the BigQuery join stage;
# see README section "Scope of reproduction".
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out

# TODO ANPASSEN: Pipeline auf CLI-Argumente umstellen (Befunde E/F):
#   Benchmark-Import optional machen, Input/Output als Argumente
python Code/Analysis/ecosystem/ecosystem_analysis_pipeline.py \
  --input 02_Data/ecosystem/simhashes_24112025.csv \
  --k 8 --output out/clusters_k8.txt

n=$(wc -l < out/clusters_k8.txt)
diff <(sort out/clusters_k8.txt) <(sort claims/expected/cluster_reference_k8.txt) >/dev/null \
  && echo "Clustering: ${n} clusters, identical to reference (24,914)." \
  || { echo "CLAIM 2 FAIL (clustering diff)"; exit 1; }

python Code/Analysis/ecosystem/attribute_scripts.py \
  --input out/clusters_k8.txt \
  --trackerdb 02_Data/whotracksme \
  --output out/attribution.csv

diff <(sort out/attribution.csv) <(sort claims/expected/attribution_reference.csv) >/dev/null \
  && echo "CLAIM 2 PASS: attribution identical to reference (492 providers)." \
  || { echo "CLAIM 2 FAIL (attribution diff)"; exit 1; }
