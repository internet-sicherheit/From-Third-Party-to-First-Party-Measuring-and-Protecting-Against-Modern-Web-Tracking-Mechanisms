# From Third-Party to First-Party: Measuring and Protecting Against Modern Web Tracking Mechanisms

Research artifact for the ACSAC 2026 paper of the same name.

- [Overview](#overview)
- [Requirements](#requirements)
- [Installation](#installation)
- [Running the claims](#running-the-claims)
- [Scope of reproduction](#scope-of-reproduction)
- [Repository layout](#repository-layout)
- [Pipeline details](#pipeline-details)
- [Documentation](#documentation)
- [License and citation](#license-and-citation)

## Overview

The paper studies how web tracking has moved from third-party to first-party
contexts, and how that shift can be detected and blocked. The artifact packages
the analysis pipeline behind three claims:

| Claim | What it covers | Needs the Zenodo dataset? | Runtime |
|---|---|---|---|
| **1** | Four-criterion first-party tracking (FPT) cookie heuristic | yes | ~1 min |
| **2** | SimHash clustering (64-bit, k=8) + entity attribution | no | ~15 min |
| **3** | Generation of the 181 filter rules from Section 5.5 | no | ~5 s |

Claims 2 and 3 run straight from a clone. Everything they read is tracked in
Git. Only Claim 1 needs the bulk cookie shards, which are too large for a
repository and are published separately.

Each claim script regenerates its output and compares it **byte for byte**
against a frozen reference in [`claims/expected/`](claims/expected/). There is
no tolerance window: a claim passes only on an exact match.

## Requirements

- Docker >= 24 with the Compose plugin (tested on Docker 29 / Compose v5)
- x86-64 Linux host recommended; also tested via WSL2
- ~8 GB RAM and ~4 CPU cores for Claims 2 and 3
- ~2 GB disk for the repository; additionally ~20 GB if you run Claim 1

Everything else — Python 3.12, the pinned Python packages, and Node.js for the
tracker-database lookups — is installed inside the image.

Running outside Docker is possible (`pip install -r requirements.txt`, plus
Node.js on `PATH`), but the container is the supported path.

## Installation

```bash
git clone <this repository>
cd From-Third-Party-to-First-Party-Measuring-and-Protecting-Against-Modern-Web-Tracking-Mechanisms
./install.sh
```

`install.sh` builds the image, fetches the Claim 1 dataset if a Zenodo record
is configured, and finishes by running Claim 3 as a smoke test.

To skip the dataset and evaluate only the two self-contained claims:

```bash
./install.sh --no-dataset
```

## Running the claims

```bash
docker compose run --rm claim3    # ~5 seconds
docker compose run --rm claim2    # ~15 minutes
docker compose run --rm claim1    # ~1 minute, needs the dataset
```

Claim 2 spends most of its time on per-domain tracker-database lookups. To
verify the clustering stage alone:

```bash
docker compose run --rm -e SKIP_ATTRIBUTION=1 claim2   # ~1 minute
```

Claim 1 defaults to two dataset shards. Raise the count with `SHARDS`, but note
that the reference output covers the first two shards only, so any other value
will report a mismatch by construction:

```bash
docker compose run --rm -e SHARDS=5 claim1
```

Outputs are written to `out/`, which is mounted from the host.

Each script prints `CLAIM n PASS` or `CLAIM n FAIL` and exits non-zero on
failure. If the dataset is missing, the script says so and points back at
`install.sh` instead of raising a traceback.

## Scope of reproduction

We state plainly what this artifact does and does not establish.

### Fully reproducible

**Claim 3 — filter rule generation.** Every input is tracked in Git.
`create_rules.py` derives 181 rules from the frozen FP-Growth itemset table
using the published configuration (minimum lift ratio 10, at most 3 query keys
per rule). The output is byte-identical to the rule set shipped with the paper.

**Claim 2 — clustering and attribution.** Both stages reproduce their frozen
references exactly, and the clustering is stable across interpreter runs.

### Reproducible against frozen intermediates

**Claim 1 — FPT cookie heuristic.** C1 (lifetime > 90 days) and C2 (value
length >= 8 bytes) are applied in the upstream BigQuery stage and arrive in the
dataset pre-materialized as the columns `valid_expires_date` and
`valid_entropy`. The claim script re-runs the two criteria implemented in
Python, C3 (uniqueness) and C4 (Ratcliff/Obershelp similarity <= 0.6).

It verifies that the shipped implementation reproduces the classification we
publish for the shipped shards. **It does not reproduce the paper's Section 4
aggregate counts.** Those were computed over a different, larger export
(`fp_cookies_holding_id_candidates_*.csv`), which survives in this repository
only as its result,
[`Code/Heuristik/cookies_holding_ids.csv`](Code/Heuristik/cookies_holding_ids.csv)
(281,815 rows, 31,850 with `hold_id=True`). The heuristic groups cookie values
per shard file, so its output depends on how rows are distributed across
shards; re-running it on the shards published here disagrees with that frozen
output on roughly 31% of the overlapping cookies.

**Cluster-level paper figures.** Clustering yields 24,914 clusters over 26,605
fingerprints. The cluster counts reported in the paper come from a downstream
BigQuery join of the clustering against the cookie and script tables. That
stage needs the authors' private BigQuery project and is not part of this
artifact.

### Available, not reproducible

**Raw data collection.** The crawl used four VMs on VPN-based vantage points
over several weeks and produced more than 3 TB. Re-running it yields different
data: the web changes. The crawler is included in
[`01_MultiCrawl/`](01_MultiCrawl/) so the collection method can be inspected,
and the page-breakage harness in [`04_Page_Breakage/`](04_Page_Breakage/).

**BigQuery preprocessing.** The SQL in [`Code/Queries/`](Code/Queries/)
hardcodes a private project id (`server_side_tracking` dataset) and was run
from the BigQuery console. It is included for auditability. The frozen CSV
exports it produced are what the claim scripts consume; their schemas are in
[`docs/schema.md`](docs/schema.md).

### Known deviations

- `analyzer()` in the cookie heuristic stops at the first failing value pair,
  so when the C3 length check fails, C4 is never evaluated for that pair and
  the secondary flag `similarity_ok` can read `True` regardless. `hold_id`, the
  classification the paper uses, is unaffected: it requires both checks to pass
  for every pair. The behaviour is documented inline and deliberately left
  unchanged, because correcting it would invalidate the frozen references.
- `06_RuleSet_Generation/Rules_evaluation/src/main.rs` (the adblock-engine
  evaluation of the generated rules against EasyList/EasyPrivacy) ships without
  a `Cargo.toml` and is not wired into any claim script.
- `Code/Queries/Preprocessing/cookie_table.sql` is written in PostgreSQL
  dialect and its `is_first_party_cookie` statement is truncated mid-expression.
  It documents the intent of the C1/C2 stage rather than being executable.

## Repository layout

```
claims/                 Claim scripts and frozen reference outputs
docs/                   Provenance, ethics, and file schemas
metadata.toml           ACSAC artifact metadata
Dockerfile              Evaluation image
compose.yaml            Service per claim
install.sh              Build + optional dataset download + smoke test
requirements.txt        Pinned Python dependencies

01_MultiCrawl/          MultiCrawl measurement framework (OpenWPM-based)
02_Data/                Frozen dataset; bulk exports come from Zenodo
04_Page_Breakage/       Page-breakage measurement harness
05_Resources/           EasyList/EasyPrivacy, Tranco list, extensions
06_RuleSet_Generation/  Feature extraction, FP-Growth mining, rule generation
07_Evaluiation/         Extended cookie mapping table
Code/
  Heuristik/            FPT cookie heuristic (Claim 1)
  Preprocessing/        Cookie classification, EasyList tagging, fingerprints
  Analysis/             Clustering, attribution, figures (Claim 2)
  Queries/              BigQuery SQL for the preprocessing and analysis stages
```

Paths under `02_Data/` that exceed GitHub's limits are listed in
[`.gitignore`](.gitignore) with their sizes; all of them are in the Zenodo
record.

## Pipeline details

This section documents the full path from crawl to results. Only the parts
described above are reproducible by reviewers.

### Data collection

[`01_MultiCrawl/`](01_MultiCrawl/) crawls many sites in parallel across browser
configurations, drives consent banners, and records requests, responses,
cookies, localStorage, and JavaScript calls. Setup instructions are in
[`01_MultiCrawl/README.md`](01_MultiCrawl/README.md); the deltas we applied for
this paper are in [`technical_settings.md`](technical_settings.md).

Database schemas:
[`01_MultiCrawl/database_schema/postgres.sql`](01_MultiCrawl/database_schema/postgres.sql)
(crawl-side) and
[`01_MultiCrawl/database_schema/bigquery.md`](01_MultiCrawl/database_schema/bigquery.md)
(analysis-side).

Collection period, site sampling, and vantage points: [`docs/provenance.md`](docs/provenance.md).

### Preprocessing

- **Cookie classification** against Cookiepedia:
  [`Code/Preprocessing/cookie_classification/classify.py`](Code/Preprocessing/cookie_classification/classify.py).
  Results ship as frozen CSVs in the same directory; the service is not
  re-queried.
- **Filter-list tagging** of request URLs against EasyList and EasyPrivacy
  (both version `202505191305`):
  [`Code/Preprocessing/EasyList_Classification/ablock_check_f.py`](Code/Preprocessing/EasyList_Classification/ablock_check_f.py).
- **JavaScript fingerprints**:
  [`Code/Preprocessing/JavaScript/js_cluster_buffer_optimized.py`](Code/Preprocessing/JavaScript/js_cluster_buffer_optimized.py)
  streams script bodies from the raw crawl database and emits SimHashes. This
  needs PostgreSQL access; its frozen output,
  `02_Data/ecosystem/simhashes_24112025.csv`, is what Claim 2 starts from.
- **Cookie heuristic C1/C2**:
  [`Code/Queries/Preprocessing/cookie_table.sql`](Code/Queries/Preprocessing/cookie_table.sql)
  and [`Code/Queries/hold_id.sql`](Code/Queries/hold_id.sql).

### Rule mining

[`06_RuleSet_Generation/RuleSet_Mining/`](06_RuleSet_Generation/RuleSet_Mining/):
`analyze_query_keys.py` turns URLs into binary query-key features,
`fpgrowth_pipeline.py` mines frequent itemsets with support, lift, and Fisher's
exact p-values, and `rules_generator/create_rules.py` converts the surviving
itemsets into lookahead regex rules.

The frozen itemset table (`fpg_outputs_max_depth__161/`) is what Claim 3 uses,
so the feature-extraction and mining stages do not need to be re-run.
`Rules_evaluation/evaluate_blocking.py` summarizes blocking coverage from a
CSV of per-URL verdicts produced by the Rust adblock harness in
`Rules_evaluation/src/`.

### Analysis

Clustering and attribution live in
[`Code/Analysis/ecosystem/`](Code/Analysis/ecosystem/) and are covered by
Claim 2. The notebooks alongside them reproduce the paper's figures from the
frozen CSVs: `overview.ipynb` (cluster size distribution),
`network_graph/network_graph_paper.ipynb` (top-5 cluster graph),
`top_cluster/attribution.ipynb` (top-10 attribution), and
[`Code/Analysis/JavaScript/overview.ipynb`](Code/Analysis/JavaScript/overview.ipynb)
(UpSet plot). Notebooks depending on `02_Data/ecosystem/network_graph/` need
that directory from Zenodo.

## Documentation

| Document | Contents |
|---|---|
| [`docs/provenance.md`](docs/provenance.md) | Collection period, site sampling, infrastructure, dataset scale |
| [`docs/ethics.md`](docs/ethics.md) | Ethical considerations and responsible-use statement |
| [`docs/schema.md`](docs/schema.md) | Column schemas for every file the claim scripts touch |
| [`claims/expected/README.md`](claims/expected/README.md) | Provenance of each frozen reference output |
| [`metadata.toml`](metadata.toml) | ACSAC artifact metadata |

## License and citation

Licensed under the Apache License 2.0; see [`LICENSE`](LICENSE).

`01_MultiCrawl/` and `04_Page_Breakage/` incorporate
[OpenWPM](https://github.com/openwpm/OpenWPM) (v0.28) under its own license.
`02_Data/whotracksme/` vendors
[`@ghostery/trackerdb`](https://github.com/ghostery/trackerdb) 1.0.683, pinned
because its contents determine the attribution results.

```bibtex
@inproceedings{boettger.2026.acsac,
  author    = {B\"{o}ttger, Christian and Khouja, Tareq and Pohlmann, Norbert
               and Demir, Nurullah and Urban, Tobias},
  title     = {From Third-Party to First-Party: Measuring and Protecting
               Against Modern Web Tracking Mechanisms},
  booktitle = {Proceedings of the 42nd Annual Computer Security Applications
               Conference (ACSAC)},
  year      = {2026},
  note      = {To appear}
}
```
