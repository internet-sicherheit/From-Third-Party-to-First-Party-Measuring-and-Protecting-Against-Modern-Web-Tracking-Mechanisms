FROM python:3.12-slim

# Node.js for WhoTracksMe attribution (Code/Analysis/ecosystem/attribute_scripts.py)
RUN apt-get update && apt-get install -y --no-install-recommends \
    nodejs npm git curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /artifact
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN chmod +x claims/*.sh install.sh || true

# Data is mounted, not baked in (see compose.yaml)
ENTRYPOINT ["/bin/bash"]
