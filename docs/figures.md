# Paper Figures

Where each figure of the paper comes from, what it reads, and whether it can
be regenerated from a clone of this repository without BigQuery access or the
Zenodo dataset.

"Reproducible offline" means: the plotting code is committed, every input it
reads is tracked in Git, and we re-ran it on 2026-09-16 against the tracked
files. Figures are not covered by the byte-exact claim scripts; the frozen
PDFs next to each notebook are the reference renderings.

**One-stop notebook.**
[`Code/Figures/reproduce_figures.ipynb`](../Code/Figures/reproduce_figures.ipynb)
ports the cells identified below into a single notebook that regenerates
Figures 2–6 from the tracked files in about a minute and writes the PDFs to
`Code/Figures/output/`. It is committed with its outputs, so the reference
renderings can be inspected without running it. Dependencies are pinned in
[`Code/Figures/requirements-figures.txt`](../Code/Figures/requirements-figures.txt),
separate from the claim scripts' `requirements.txt`:

```bash
pip install -r Code/Figures/requirements-figures.txt
jupyter nbconvert --to notebook --execute --inplace Code/Figures/reproduce_figures.ipynb
```

The notebook derives the Figure 2 profile labels from `browser_id` rather than
from file names (see [Figure 2](#figure-2)) and asserts the N99 = 161 cutoff of
Figures 5 and 6. The table below still refers to the original source cells.

| Figure | Script | Input data | Reproducible offline | Notes |
|---|---|---|---|---|
| 1 — Concept diagram (SST/CST) | N/A (hand-drawn) | — | N/A | Drawn in diagrams.net; source file `Code/Analysis/Figures/SST_CST.drawio`. No generating script. |
| 2 — Exclusive intersections of observed scripts across the four profiles (UpSet) | [`Code/Analysis/JavaScript/overview.ipynb`](../Code/Analysis/JavaScript/overview.ipynb), cell 11 → `upset_plot.pdf`; cell 15 → `upset_plot_tracking_scripts.pdf` | cell 11: `02_Data/js_hashes/all_hashes - {EU1,EU2,US1,US2}.csv` (**not in the repository, not documented for Zenodo**); cell 15: `02_Data/js_hashes/simhash_to_profile_export.csv` (tracked) | **blocked** (all-scripts variant) / **yes** (tracking-scripts variant) | See [Figure 2 details](#figure-2). |
| 3 — CDF of cluster size by unique scripts and by URLs | [`Code/Analysis/ecosystem/overview.ipynb`](../Code/Analysis/ecosystem/overview.ipynb), cell 5 → `cluster_sizes_cdf.pdf` | `Code/Analysis/ecosystem/cluster_sizes_raw_27112025.csv` (blue line, 24,914 clusters by number of unique SimHashes), `Code/Analysis/ecosystem/cluster_sizes_27112025.csv` (orange line, 24,914 clusters by `number_of_site_data`); both tracked | **yes** | Run cell 5 on its own. Cells 2, 3, 7 and 9–12 are abandoned drafts and fail (undefined variable, `ax.yscale`, missing `cluster_sizes.csv` / `raw_cluster_sizes.csv`). The input CSVs are frozen BigQuery exports of the `cluster_k8` join ([`Code/Queries/ecosystem_clustering_data.sql`](../Code/Queries/ecosystem_clustering_data.sql)); the raw sizes could also be recounted from the Claim 2 output `cluster_27112025_k8.txt`. No PDF of this figure is committed. |
| 4 — Network graph of the top-5 clusters by site data (red = cookies, grey = clusters) | [`Code/Analysis/ecosystem/network_graph/network_graph_paper.ipynb`](../Code/Analysis/ecosystem/network_graph/network_graph_paper.ipynb), cells 0–3 → `Ecosystem_Top_5_Cluster.pdf`; cell 4 → `Ecosystem_Top_5_Cluster_diff_layout.pdf` | `Code/Analysis/ecosystem/network_graph/top5_cluster_to_cookies.csv` (tracked; 5 clusters, 978 cookies, 2,744 edges) | **yes** | Both layout variants are committed as PDFs in the same directory; cells 0–3 (free spring layout) is the primary one, cell 4 pins the five cluster nodes on a circle. `spring_layout` is seeded (`seed=3113794652`), so the layout is deterministic for a given NetworkX version (pinned 3.4.2). The input is a frozen BigQuery export ([`Code/Queries/top_cluster.sql`](../Code/Queries/top_cluster.sql)). The notebook does **not** read the 3.8 GB `02_Data/ecosystem/network_graph/` payloads; nothing in the repository does. ~45 s. |
| 5 — Rank-frequency distribution of query keys (log scale) | [`06_RuleSet_Generation/RuleSet_Mining/generate_features&plots.py`](../06_RuleSet_Generation/RuleSet_Mining/generate_features&plots.py), `plot_key_distribution()` → `<prefix>_query_key_distribution.pdf` | `06_RuleSet_Generation/RuleSet_Mining/data_02022026/positive.csv` (tracked; 86,831 URLs, 940 distinct keys) | **yes** | See [Figures 5 and 6](#figures-5-and-6) for the exact command. ~3 s. |
| 6 — Cumulative coverage curve of the identity keys (N95 / N99 cutoffs) | same script, `plot_cumulative_pareto()` → `<prefix>_query_key_cumulative_pareto.pdf` | same as Figure 5 | **yes** | Prints `N95=40 keys, N99=161 keys`. N99 = 161 is the key count baked into the downstream file names (`fpg_outputs_max_depth__161/`, `*_with_query_keys_positive_161.csv`), which is how we identified `positive.csv` as the paper's input. |

## Figure 2

`Code/Analysis/JavaScript/overview.ipynb` contains two UpSet plots with the
same layout:

- **Cell 11, `upset_plot.pdf`** — intersections over *all* observed script
  SimHashes (902,628 distinct). It globs
  `02_Data/js_hashes/all_hashes - *.csv` and derives the profile label from
  the file name. These four files are not tracked and are not referenced
  anywhere else in the repository, including `.gitignore` and
  `docs/schema.md`, which together list the Zenodo contents. The similarly named
  per-profile exports `02_Data/js_hashes/{EU1,EU2,US1,US2}_hashes.csv` (on
  Zenodo, see `docs/schema.md`) carry the same SimHash sets, but with the
  **EU/US labels swapped** relative to the notebook's cached output:

  | cached notebook label (`all_hashes - *.csv`) | rows | distinct SimHashes | matching file on Zenodo |
  |---|---|---|---|
  | EU1 | 1,877,173 | 569,844 | `US1_hashes.csv` |
  | EU2 | 1,848,169 | 574,498 | `US2_hashes.csv` |
  | US1 | 1,277,279 | 455,226 | `EU1_hashes.csv` |
  | US2 | 1,278,299 | 454,750 | `EU2_hashes.csv` |

  The `{profile}_hashes.csv` labels agree with the `browser_id`-labelled
  `simhash_to_profile_export.csv` (every tracking SimHash of profile *P* is
  contained in `P_hashes.csv`, and only ~87–94 % in the other files), so the
  Zenodo files are the trustworthy labelling. Whether the paper's Figure 2
  carries the swapped labels of the cached `upset_plot.pdf` has to be checked
  against the camera-ready PDF. Re-running cell 11 on the Zenodo files after
  renaming them to `all_hashes - <profile>.csv` regenerates the plot with the
  corrected labels; the set sizes and intersections are unchanged.

- **Cell 15, `upset_plot_tracking_scripts.pdf`** — the same plot restricted to
  the 26,606 tracking-script fingerprints (union of all four profiles; identical to the set in `simhashes_24112025.csv`) (EU1 21,119 / EU2 19,092 /
  US1 9,862 / US2 11,437 distinct). Reads the tracked
  `02_Data/js_hashes/simhash_to_profile_export.csv` and reproduces offline
  in under a second.

Also note that cell 8 of this notebook has a syntax error (empty values in
the `js_us1` dictionary), so "Run all" stops before either plot. Run the
cells individually.

## Figures 5 and 6

```bash
cd 06_RuleSet_Generation/RuleSet_Mining
python "generate_features&plots.py" \
    --input-csv data_02022026/positive.csv \
    --output-dir plots
# -> plots/positive_query_key_distribution.pdf       (Figure 5)
# -> plots/positive_query_key_cumulative_pareto.pdf  (Figure 6)
```

The docstring example in the script uses `negative_train.csv`; that is just an
example and not the paper's input. Running on `positive_train.csv` (the
12 MB split) gives 902 keys and N99 = 160, i.e. a visibly different curve.

## Dependencies

The Docker image installs only `requirements.txt`, which covers Figures 3–6
(`matplotlib`, `networkx`, `pandas`, `numpy`). Regenerating the notebooks
additionally needs a Jupyter kernel or `nbconvert`, and Figure 2 needs
`upsetplot`; both are pinned in `Code/Figures/requirements-figures.txt`
(upsetplot 0.9.0, jupyter 1.1.1). Cell 7 of
`Code/Analysis/ecosystem/overview.ipynb` imports `seaborn`, but that cell is
not part of any paper figure.

Reference outputs committed next to the notebooks:
`Code/Analysis/JavaScript/upset_plot.pdf`,
`Code/Analysis/JavaScript/upset_plot_tracking_scripts.pdf`,
`Code/Analysis/ecosystem/network_graph/Ecosystem_Top_5_Cluster.pdf`,
`Code/Analysis/ecosystem/network_graph/Ecosystem_Top_5_Cluster_diff_layout.pdf`.
