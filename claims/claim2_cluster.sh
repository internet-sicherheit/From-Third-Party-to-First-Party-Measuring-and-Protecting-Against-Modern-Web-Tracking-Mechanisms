#!/usr/bin/env bash
# Claim 2: SimHash clustering (64-bit fingerprints, Hamming distance k=8) of
# the JavaScript corpus, followed by entity attribution via WhoTracksMe.
#
# Stage 1  cluster 26,606 frozen fingerprints -> 24,914 clusters
# Stage 2  attribute cluster scripts to organizations -> 11,380 clusters
#
# WHAT THIS VERIFIES
#   That clustering and attribution are deterministic and reproduce the frozen
#   reference outputs in claims/expected/ exactly.
#
# WHAT THIS DOES NOT VERIFY
#   The 860-cluster figure reported in the paper. That number is produced by a
#   BigQuery join of the clustering against the cookie and script tables, a
#   stage that requires the authors' private BigQuery project and is not part
#   of this artifact. See README, section "Scope of reproduction".
#
# Stage 1 takes about a minute. Stage 2 queries the WhoTracksMe TrackerDB
# through a Node.js subprocess per distinct domain and takes longer
# (~5,800 lookups); set SKIP_ATTRIBUTION=1 to run stage 1 only.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out

FINGERPRINTS="${FINGERPRINTS:-02_Data/ecosystem/simhashes_24112025.csv}"
TRACKERDB="${TRACKERDB:-02_Data/whotracksme}"
ATTRIBUTION_INPUT="Code/Analysis/ecosystem/cluster_script_url_etlds_fp_party.csv"

CLUSTER_REF="claims/expected/cluster_reference_k8.txt"
ATTRIBUTION_REF="claims/expected/attribution_reference.csv"

if [ ! -f "$FINGERPRINTS" ]; then
  echo "ERROR: dataset not found: $FINGERPRINTS" >&2
  echo "Run ./install.sh first (see README, section 'Installation')." >&2
  exit 2
fi

if [ ! -f "$CLUSTER_REF" ]; then
  echo "ERROR: reference output not found: $CLUSTER_REF" >&2
  echo "This file is tracked in Git; the repository appears to be incomplete." >&2
  exit 2
fi

echo "== Claim 2, stage 1: SimHash clustering (f=64, k=8) =="
echo "Fingerprints: $FINGERPRINTS"
echo "Reference   : $CLUSTER_REF"
echo

python Code/Analysis/ecosystem/ecosystem_analysis_pipeline.py \
  --input "$FINGERPRINTS" \
  --f 64 --k 8 \
  --output out/clusters_k8.txt

n=$(wc -l < out/clusters_k8.txt)
echo

if cmp -s out/clusters_k8.txt "$CLUSTER_REF"; then
  echo "Stage 1 PASS: ${n} clusters, byte-identical to the reference."
else
  echo "CLAIM 2 FAIL (clustering): ${n} clusters; diff against ${CLUSTER_REF}:" >&2
  diff out/clusters_k8.txt "$CLUSTER_REF" | head -20 >&2
  exit 1
fi

if [ "${SKIP_ATTRIBUTION:-0}" = "1" ]; then
  echo
  echo "SKIP_ATTRIBUTION=1 set - stopping after stage 1."
  exit 0
fi

echo
echo "== Claim 2, stage 2: entity attribution (WhoTracksMe) =="
echo "Scripts  : $ATTRIBUTION_INPUT"
echo "TrackerDB: $TRACKERDB"
echo "Reference: $ATTRIBUTION_REF"
echo

if [ ! -d "$TRACKERDB" ]; then
  echo "ERROR: WhoTracksMe TrackerDB not found: $TRACKERDB" >&2
  echo "Run ./install.sh first (see README, section 'Installation')." >&2
  exit 2
fi

if [ ! -f "$ATTRIBUTION_REF" ]; then
  echo "ERROR: reference output not found: $ATTRIBUTION_REF" >&2
  echo "This file is tracked in Git; the repository appears to be incomplete." >&2
  exit 2
fi

python Code/Analysis/ecosystem/attribute_scripts.py \
  --party fp \
  --input "$ATTRIBUTION_INPUT" \
  --trackerdb "$TRACKERDB" \
  --output out/attribution.csv

echo

if cmp -s out/attribution.csv "$ATTRIBUTION_REF"; then
  echo "CLAIM 2 PASS: clustering and attribution both byte-identical to the"
  echo "              frozen references."
else
  echo "CLAIM 2 FAIL (attribution): output differs from ${ATTRIBUTION_REF}:" >&2
  diff out/attribution.csv "$ATTRIBUTION_REF" | head -20 >&2
  exit 1
fi
