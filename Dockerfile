FROM python:3.12-slim

# Node.js for WhoTracksMe attribution (Code/Analysis/ecosystem/attribute_scripts.py)
RUN apt-get update && apt-get install -y --no-install-recommends \
    nodejs npm git curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /artifact
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Bake the WhoTracksMe TrackerDB into the image, outside /artifact/02_Data.
#
# Entity attribution spawns one Node process per distinct domain (~5,800 of
# them). Resolving node_modules over the bind-mounted 02_Data costs roughly 2 s
# per spawn on Docker Desktop for Windows/macOS, turning a 12-minute stage into
# a 9+ hour one. Reading from the image filesystem avoids that entirely.
#
# The pinned @ghostery/trackerdb 1.0.683 is a scientific input: its contents
# determine the attribution output, so it is vendored rather than installed.
COPY 02_Data/whotracksme /opt/trackerdb
ENV TRACKERDB=/opt/trackerdb

COPY . .
RUN chmod +x claims/*.sh install.sh || true

# Bulk data is mounted, not baked in (see compose.yaml)
ENTRYPOINT ["/bin/bash"]
