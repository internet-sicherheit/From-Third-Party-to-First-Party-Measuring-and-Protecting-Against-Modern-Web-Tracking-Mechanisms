# Dataset and Intermediate File Schemas

Column schemas for every file a reviewer touches when running the claim
scripts, plus the upstream BigQuery tables the frozen exports were derived
from.

The canonical raw-table definitions live in
[`01_MultiCrawl/database_schema/bigquery.md`](../01_MultiCrawl/database_schema/bigquery.md)
(BigQuery) and
[`01_MultiCrawl/database_schema/postgres.sql`](../01_MultiCrawl/database_schema/postgres.sql)
(PostgreSQL). This document covers the exported CSVs.

---

## 1. Files tracked in Git (no download needed)

These ship with the repository, so Claims 2 and 3 run directly from a clone.

### `02_Data/ecosystem/simhashes_24112025.csv`

Input to Claim 2, stage 1. 26,605 rows.

| Column | Type | Description |
|---|---|---|
| `simhash_hex` | string | 64-bit SimHash of a JavaScript file, lower-case hex, 16 digits, no `0x` prefix. Doubles as the object identifier during clustering. |

### `02_Data/js_hashes/simhash_to_profile_export.csv`

Maps fingerprints to the crawl profile that observed them.

| Column | Type | Description |
|---|---|---|
| `browser_id` | string | Crawl profile, e.g. `openwpm_native_eu_1_omaticall`. |
| `simhash_hex` | string | 64-bit SimHash, hex. Joins to `simhashes_24112025.csv`. |

### `Code/Analysis/ecosystem/cluster_script_url_etlds_{fp,tp}_party.csv`

Input to Claim 2, stage 2. 16,114 rows (fp) / 16,153 rows (tp).

| Column | Type | Description |
|---|---|---|
| `cluster` | integer | Cluster id assigned by stage 1. |
| `script_url_etld` | string | eTLD+1 of the script URL, the key looked up in the WhoTracksMe TrackerDB. |
| `fp_script` | integer | 1 if the script was served first-party relative to the visited page, else 0. |

### `06_RuleSet_Generation/RuleSet_Mining/data_02022026/*.csv`

URL corpora for rule mining. `positive*` are tracking URLs, `negative*`
non-tracking. `*_train.csv` / `*_test.csv` are a 90/10 split produced by
`split_data_02022026.py` with `--seed 42`.

| Column | Type | Description |
|---|---|---|
| `url` | string | Absolute request URL. |

Row counts: `positive.csv` / `negative.csv` 86,831 each; `*_train.csv` 78,147;
`*_test.csv` 8,684.

### `06_RuleSet_Generation/RuleSet_Mining/fpg_outputs_max_depth__161/itemsets_minsup_0.001.csv`

Input to Claim 3. 456 frequent itemsets mined by `fpgrowth_pipeline.py` over
the top-161 query-key feature set at `min_support = 0.001`, `max_depth = 3`.

| Column | Type | Description |
|---|---|---|
| `itemset` | string | Feature conjunction, e.g. `has_f & has_u & has_vn`. Each `has_<key>` means the URL carries query parameter `<key>`. |
| `length` | integer | Number of items in the itemset. |
| `support_pos` | float | Support in the positive (tracking) corpus, in [0,1]. |
| `support_neg` | float | Support in the negative corpus, in [0,1]. |
| `count_pos` | integer | Absolute positive occurrences. |
| `count_neg` | integer | Absolute negative occurrences. |
| `lift_ratio` | float | `support_pos / support_neg`, capped when `support_neg = 0`. The rule generator keeps itemsets with `lift_ratio >= 10`. |
| `log2_lift` | float | `log2(lift_ratio)`. |
| `p_value` | float | Fisher's exact test, two-sided. |

### `02_Data/whotracksme/`

Node.js wrapper plus a vendored `@ghostery/trackerdb` **1.0.683** under
`node_modules/`. The tracker database is pinned deliberately: its contents
determine the attribution output, so resolving it fresh would change Claim 2's
result.

### `02_Data/ecosystem/cleaned/sst_ecosystem_analysis_*.csv`

Cookie/script join used for the ecosystem analysis.

| Column | Type | Description |
|---|---|---|
| `browser_id` | string | Crawl profile. |
| `visit_id` | string | Page visit identifier. |
| `top_level_url` | string | URL of the visited page. |
| `document_url` | string | URL of the document that set the cookie. |
| `script_url` | string | URL of the script performing the cookie operation. |
| `name` | string | Cookie name. |
| `path` | string | Cookie path attribute. |
| `value` | string | Cookie value as observed by the crawler. |
| `content_hash` | string | Content hash of the script; joins to the fingerprint tables. |

---

## 2. Files distributed via Zenodo

Excluded from Git by size (see `.gitignore`). Claim 1 needs the first of
these; the rest support the wider analysis.

### `02_Data/potential_first_party_tracking_cookies/potential_tracking_cookies_*.csv`

Input to Claim 1. 100 shards, ~20 GB total, ~216 MB per shard. Cookie rows
joined against the JavaScript table, pre-filtered on C1 and C2.

Columns consumed by the heuristic:

| Column | Type | Description |
|---|---|---|
| `name` | string | Cookie name. |
| `value` | string | Cookie value. Compared pairwise across profiles for C3/C4. |
| `browser_id` | string | Crawl profile. A cookie is only evaluated when it was seen under more than one profile. |
| `top_level_url_etld` | string | eTLD+1 of the visited page; the grouping key. **Named `top_level_etld` in the older export the published output came from** — `cookie_heuristik_opti.py` auto-detects either, and `--etld-column` forces a choice. |

Criterion columns materialized upstream:

| Column | Type | Description |
|---|---|---|
| `valid_entropy` | boolean | **C2**: `LENGTH(value) >= 8`. |
| `valid_expires_date` | boolean | **C1**: `expiry - time_stamp >= 90 days`. |
| `hold_id` | boolean | Result of a previous heuristic run, where present. |
| `is_session` | boolean | Session cookie flag (no `Expires`/`Max-Age`). |
| `first_party_domain` | boolean | Cookie host matches the visited site's eTLD+1. |
| `first_party_script` | boolean | Setting script served first-party. |

Remaining columns carry the full cookie record (`host`, `path`, `expiry`,
`same_site`, `is_secure`, `is_http_only`, `site_rank`, …) and the joined
JavaScript record (`script_url`, `symbol`, `operation`, `func_name`,
`document_url`, …). See `bigquery.md` for those.

### `02_Data/potential_tracking_cookies/*.csv`

Same idea without the first-party restriction. 80 shards, ~3.1 GB. Uses
`etld` instead of `top_level_url_etld` and omits the JavaScript join.

### `02_Data/js_hashes/{EU1,EU2,US1,US2}_hashes.csv`

Per-profile fingerprint maps, 113–166 MB each (above GitHub's 100 MB limit).

| Column | Type | Description |
|---|---|---|
| `site_id` | integer | Site identifier. |
| `content_hash` | string | Script content hash. |
| `simhash_hex` | string | 64-bit SimHash, hex. |

### `02_Data/ecosystem/full_data/`, `02_Data/ecosystem/network_graph/`, `02_Data/pbdata/`

Full per-profile ecosystem exports (~105 GB), cluster payloads for the
network-graph figures (~3.8 GB), and page-breakage screenshots (~12 GB).
Not required by any claim script.

---

## 3. Outputs produced by the claim scripts

Written to `out/` and compared byte for byte against `claims/expected/`.

### `out/rules_generated.txt` — Claim 3

One filter rule per line, 181 lines. Adblock-style regex with positive
lookaheads, e.g.

```
/[\?&](?=[^#]*\bif=)(?=[^#]*\br=)(?=[^#]*\bv=)[^#]*/
```

Single-key itemsets emit the simpler form `/[\?&]key=/`.

### `out/claim1_holding_ids.csv` — Claim 1

One row per (cookie name, eTLD) pair evaluated within a shard.

| Column | Type | Description |
|---|---|---|
| `cookie_name` | string | Cookie name. |
| `top_level_etld` | string | eTLD+1 of the visited page. |
| `hold_id` | boolean | **True only when every value pair passed both C3 and C4.** The paper's FPT classification. |
| `unique_ok` | boolean | C3 diagnostic. See the caveat below. |
| `similarity_ok` | boolean | C4 diagnostic. See the caveat below. |
| `passed_checkin` | boolean | True when at least one of the two diagnostics is set. |
| `source_file` | string | Shard the row came from. |

> **Caveat on the secondary flags.** `analyzer()` stops at the first failing
> pair, so when the C3 length check fails the C4 similarity of that pair is
> never computed and `similarity_ok` can still read True. `hold_id` is
> unaffected — it requires both checks to have passed for every pair. The
> behaviour is documented inline in `Code/Heuristik/cookie_heuristik_opti.py`
> and left unchanged so the published outputs stay reproducible.

### `out/clusters_k8.txt` — Claim 2, stage 1

One Python dict literal per line, 24,914 lines:

```
{'cluster_size': 2, 'cluster_1': '0317b25b1df34d7f', 'cluster_2': '0d5e0cb7188ef72b'}
```

`cluster_size` is the member count; `cluster_1 … cluster_N` are the member
fingerprints. Members and lines are sorted, so runs are byte-identical
regardless of `PYTHONHASHSEED`.

### `out/attribution.csv` — Claim 2, stage 2

One row per cluster, 11,380 rows. Organizations are ranked by how many of the
cluster's scripts they serve, widest first.

| Column | Type | Description |
|---|---|---|
| `cluster` | integer | Cluster id. |
| `domain_i` | string | i-th ranked organization, from the TrackerDB. |
| `value_i` | integer | Scripts in this cluster served by that organization. |
| `share_i` | float | `value_i` divided by the cluster's attributable script count. |

Unattributable scripts (`organization = "Unknown"`) are dropped before the
shares are computed. Clusters with no attributable script yield a row with
only `cluster` filled; trailing columns are empty strings. The widest cluster
has 13 ranked organizations, so the file carries `domain_0 … domain_12`.

### `out/attribution_store.csv` — Claim 2, stage 2 (intermediate)

The per-script lookup table: the `cluster_script_url_etlds_fp_party.csv`
columns plus `category` and `organization` resolved from the TrackerDB.
16,114 rows, of which 1,038 resolve to one of 177 distinct organizations.

---

## 4. Upstream BigQuery stage

The frozen CSVs above were exported from a private BigQuery project
(`server_side_tracking` dataset). The SQL is in `Code/Queries/`; the project
id is hardcoded and the tables are not public, so this stage cannot be re-run
by reviewers. It is included for auditability.

| Table | Produced by | Feeds |
|---|---|---|
| `cookies` | crawl ingest, then `Code/Queries/Preprocessing/cookie_table.sql` | C1/C2 flags |
| `javascript` | crawl ingest | cookie/script join |
| `requests`, `responses` | crawl ingest | EasyList classification, fingerprints |
| `cookie_id_analysis` | `cookie_heuristik_opti.py`, re-imported | `hold_id` on `cookies` |
| `cluster_k8` | clustering output, re-imported and joined | paper-level cluster aggregates |
| `cookie_cluster` | `Code/Queries/cookie_ecosystem.sql` | Table 5 figures |

`cookie_table.sql` is written in PostgreSQL dialect and its
`is_first_party_cookie` statement is truncated mid-expression; it documents
the intent of the C1/C2 stage rather than being directly executable.
