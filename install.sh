#!/usr/bin/env bash
# ACSAC 2026 artifact -- installation
#
# Builds the evaluation container and runs a smoke test.
#
# Claims 2 and 3 need nothing beyond this repository: their inputs are tracked
# in Git. Only Claim 1 needs the bulk dataset from Zenodo, so the download is
# optional and can be skipped with --no-dataset.
set -euo pipefail
cd "$(dirname "$0")"

DATASET_URL="${DATASET_URL:-https://zenodo.org/record/<TODO>/files/frozen_dataset.tar.gz}"
DATASET_SHA256="${DATASET_SHA256:-<TODO>}"

# Directory Claim 1 reads; its presence decides whether we download.
CLAIM1_DIR="02_Data/potential_first_party_tracking_cookies"

WANT_DATASET=1
for arg in "$@"; do
  case "$arg" in
    --no-dataset) WANT_DATASET=0 ;;
    -h|--help)
      echo "Usage: ./install.sh [--no-dataset]"
      echo "  --no-dataset  Build the image and verify Claims 2 and 3 only."
      echo "                Skips the Zenodo download that Claim 1 needs."
      exit 0
      ;;
    *) echo "Unknown option: $arg (try --help)" >&2; exit 2 ;;
  esac
done

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker not found on PATH. See README, section 'Requirements'." >&2
  exit 2
fi

echo "[1/3] Building the evaluation image..."
docker compose build base

echo
echo "[2/3] Dataset for Claim 1..."
if [ -d "$CLAIM1_DIR" ] && [ -n "$(ls -A "$CLAIM1_DIR" 2>/dev/null)" ]; then
  echo "      $CLAIM1_DIR is present - skipping download."
elif [ "$WANT_DATASET" = "0" ]; then
  echo "      --no-dataset given - skipping. Claim 1 will not be runnable;"
  echo "      Claims 2 and 3 do not need it."
elif [[ "$DATASET_URL" == *"<TODO>"* ]]; then
  echo "      WARNING: the Zenodo record is not yet published, so the dataset" >&2
  echo "      URL in this script is still a placeholder. Claims 2 and 3 run" >&2
  echo "      without it. To run Claim 1, obtain the dataset and extract it to" >&2
  echo "      $CLAIM1_DIR, or re-run with DATASET_URL=... DATASET_SHA256=..." >&2
else
  echo "      Downloading frozen dataset..."
  curl -L -o frozen_dataset.tar.gz "$DATASET_URL"
  echo "${DATASET_SHA256}  frozen_dataset.tar.gz" | sha256sum -c -
  tar xzf frozen_dataset.tar.gz
  rm frozen_dataset.tar.gz
fi

echo
echo "[3/3] Smoke test: Claim 3 (offline, runs in seconds)..."
docker compose run --rm claim3

echo
echo "Installation complete."
echo
echo "Run the claims with:"
echo "  docker compose run --rm claim3   # ~5 seconds, no dataset needed"
echo "  docker compose run --rm claim2   # ~15 minutes, no dataset needed"
echo "  docker compose run --rm claim1   # ~1 minute, needs the Zenodo dataset"
echo
echo "Faster Claim 2 (skips the ~12 min attribution stage):"
echo "  docker compose run --rm -e SKIP_ATTRIBUTION=1 claim2"
