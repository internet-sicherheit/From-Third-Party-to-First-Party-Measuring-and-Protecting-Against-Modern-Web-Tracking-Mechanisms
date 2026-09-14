# Data Provenance

This document describes how the dataset accompanying the paper *"From
Third-Party to First-Party: Measuring and Protecting Against Modern Web
Tracking Mechanisms"* (ACSAC 2026) was collected, where, and when.

## Collection Period

The crawl was conducted in <CRAWL_START> -- <CRAWL_END> (all four
measurement profiles ran simultaneously).

## Site Selection

- Source list: Tranco list `QG4V4`, generated on **April 2nd, 2025**
  (https://tranco-list.eu/list/QG4V4/1000000).
- Sampling: the **top 5,000** sites, plus **5,000 randomly sampled**
  sites from each of the following rank buckets: 5,001--10,000,
  10,001--50,000, 50,001--250,000, and 250,001--500,000 — **25,000
  sites** in total.
- Page selection: for each site, up to **25 pages** were visited.

## Crawling Infrastructure

- Crawler: **MultiCrawl** measurement framework, based on **OpenWPM**
  (Firefox). Firefox was configured to **block third-party cookies**,
  so classic third-party tracking was not possible by design.
- Anti-bot measures: best practices were applied to conceal the use of
  OpenWPM as crawling technology.
- Consent handling: the **Consent-O-Matic** browser extension, modified
  to **accept all cookies**, was used to interact with consent banners.
- Profiles: **four measurement profiles** (EU1, EU2, US1, US2) ran
  simultaneously on four virtual machines (Ubuntu 20.04). All VMs were
  physically located in Germany and connected via **NordVPN**: two to
  gateways in Germany, two to gateways in the United States. NordVPN's
  integrated ad-blocking mechanism was deactivated.
- Browser state: crawls used fresh, stateless browser profiles; no
  accounts, logins, or real user interaction were involved.

## Dataset Scale

| Metric | Value |
|---|---|
| Sites successfully visited (avg. per profile) | 24,616 (98.5%) |
| Pages visited (avg. per profile) | 189,740 |
| Pages visited (total, all profiles) | 758,960 |
| Distinct URLs visited | 17,796,709 |
| HTTP requests observed | > 82,263,123 |
| Distinct cookie names (keys) | 309,887 |
| Distinct cookies (name, path, origin) | 577,963 |
| First-party cookies | 477,231 |
| Third-party cookies | 151,395 |
| Raw data volume | > 3 TB |

Two cookies were excluded due to a missing host field.

## Preprocessing

All raw data was ingested into a Google BigQuery database. Requests
were classified against the **EasyList** and **EasyPrivacy** filter
lists (both version `202505191305`) as a baseline for known tracking
resources. The frozen dataset shipped with this artifact is an export
of the preprocessed BigQuery tables; the export schema is documented
in `docs/schema.md`.

## Known Provenance Caveats

- The dataset is a **snapshot**: observed cookies, scripts, and site
  behavior reflect the collection period and will differ from the
  current state of the Web.
- The four profiles are designed to yield a representative dataset,
  not to isolate regulatory effects (e.g., GDPR vs. non-GDPR
  jurisdictions).