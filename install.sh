#!/usr/bin/env bash
# ACSAC 2026 artifact — installation
set -euo pipefail
cd "$(dirname "$0")"

DATASET_URL="${DATASET_URL:-https://zenodo.org/record/<TODO>/files/frozen_dataset.tar.gz}"
DATASET_SHA256="<TODO>"

echo "[1/3] Building Docker image..."
docker compose build base

echo "[2/3] Downloading frozen dataset (~<SIZE> GB)..."
if [ ! -d 02_Data ] || [ -z "$(ls -A 02_Data 2>/dev/null)" ]; then
  curl -L -o frozen_dataset.tar.gz "$DATASET_URL"
  echo "${DATASET_SHA256}  frozen_dataset.tar.gz" | sha256sum -c -
  tar xzf frozen_dataset.tar.gz
  rm frozen_dataset.tar.gz
else
  echo "02_Data/ exists and is non-empty - skipping download."
fi

echo "[3/3] Smoke test (claim 3, runs in seconds)..."
docker compose run --rm claim3

echo "Installation complete. Run claims via: docker compose run --rm claim{1,2,3}"
