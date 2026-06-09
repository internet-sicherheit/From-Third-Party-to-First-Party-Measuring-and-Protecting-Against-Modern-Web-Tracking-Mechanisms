# From Third-Party to First-Party: Measuring and Protecting Against Modern Web Tracking Mechanisms
This repository includes the documentation for collecting, preprocessing, and analyzing the data used in the submitted paper. Please note that at this point, we do not make the dataset publicly available. Regarding the missing method for hosting 1.3 TB of fully anonymized data, we were unable to apply it. After the paper is accepted, we will provide the data at the following link: [dataset].

## Repository Structure
- **01_MultiCrawl (Framework)** contains the framework necessary to conduct the large-scale measurement presented in the paper. It can be utilized for extensive Web measurements, including crawling multiple websites simultaneously with various browser configurations (e.g., different user agents, extensions, etc.).
- **02_Data'** hosts a subset of the collected and preprocessed measurement data. Please note that we are not able to provide the data in a fully anonymous form.
- **Code** provides Jupyter Notebooks and scripts for generating plots and calculating statistics, as presented in our paper. 
- **04_Page_Breakage** contains the framework necessary to conduct the page breakage analysis.
- **05_Resources** contains all neseccary resources (e.g., easylists, adblock plus extension, tranco list)
- **06_RuleSet_generation** contains the framework for pattern mining and filter rule generation from tracking URLs.

## Table of Contents
- [Introduction](#Introduction)
- [Installation](#Installation)
- [Using BigQuery](#Using-BigQuery)
- [Data Collection](#Data-Collection)
  - [Technical Setup](#Technical-Setup)
  - [Collectable Data](#Collectable-Data)
  - [Disclaimer](#Disclaimer)
  - [MultiCrawl](#MultiCrawl)
  - [Getting Started](#getting-started)
  - [Installation \& Configuration](#installation--configuration)
  - [Running the Framework](#running-the-framework)
  - [Acknowledgements](#acknowledgements)
- [Preprocessing](#Preprocessing)
  - [Cookiepedia](#Cookiepedia)
  - [EasyList](#easylist)
  -  [Clustering](#clustering)
  - [Heuristic](#Heuristic)
- [Pattern Mining](#Pattern-Mining)
  - [Feature Extraction](#Feature-Extraction)
  - [FP-Growth Pattern Mining](#FP-Growth-Pattern-Mining)
  - [Rule Generation](#Rule-Generation)
  - [Rule Evaluation](#Rule-Evaluation)
- [Analysis](#Analysis)
  - [Overview](#overview)
  - [Ecosystem](#ecosystem)
  - [Disclaimer](#disclaimer-1)

## Introduction
The main purpose of this project is
1. Collecting data with MultiCrawl
2. Pushing the traffic to the database server (e.g., BigQuery, PostgreSQL)
3. Analyse requests
4. Build filter rules
5. Perform page breakage analysis

## Installation
```
Git clone
cd 
pip install -r requirements.txt
```

## Using BigQuery
For using BigQuery as a database, store the key as JSON under

```
/resources/google_bkp.json
```

## Data Collection
For the data collection, we use MultiCrawl. In [the folder](01_MultiCrawl), we provide the source code to use to reproduce our crawl. Please use the [README](01_MultiCrawl/README.md) in the folder to install MultiCrawl. For our measurement, we made some changes to the MultiCrawl implementation that you can find [here](technical_settings.md).

### Technical Setup
To perform the measurement, we used four virtual machines. Each of them has at least:
- 4 CPUs
- 8 GB of RAM
- 500GB storage
- Ubuntu 20.04
- Access to the internet
- NordVPN installed and connected

### Collectable Data
- HTTP Traffic
- Cookies
- JavaScripts

### Disclaimer
Please note that our MultiCrawl approach does not store data in BigQuery. Instead, we store data on a filesystem. By capturing JavaScripts and all necessary data described in the paper, the crawl can store up to 500 GB of data. Further, a subscription to [NorthVPN](https://nordvpn.com/) is necessary to reproduce the original setup.

### MultiCrawl
MultiCrawl is a framework for running web measurements with different crawling setups across multiple machines, enabling near-real-time website crawling with browsers like Firefox and Chrome. MultiCrawl also automates interactions with consent banners on websites and recognizes tracking requests. All measurement data is pushed to BigQuery for analysis.

**Supported Browsers**: Chrome, Firefox

**Collectable Data Types**:
- Cookies
- LocalStorage
- Requests
- Responses
- JavaScript calls

#### Getting Started

Before diving into the installation process, ensure you have the prerequisites ready:
- PostgreSQL database
- Authentication JSON for Google Cloud API
- Sites to visit (e.g., Tranco list)
- A VM (e.g., Ubuntu 20.04) setup

#### Installation & Configuration

1. Initialize your PostgreSQL database using the `/resources/posgres.sql` script.
2. Update the PostgreSQL connection string in the `/DBOps.py` file.
3. Save your Google Cloud API's `authentication JSON` as `google.json` in `/resources` ([Guide](https://cloud.google.com/docs/authentication/getting-started)).
4. Import your list into the `sites` table of PostgreSQL.
5. Use `/Commander_extract_Subpages.py` to extract subpages from your imported list.
6. Prepare your BigQuery dataset with the tables `requests`, `responses`, `cookies`, and `localstorage`. For column definitions, refer to `resources/bigquery.md`.

#### Running the Framework

1. Set up an Ubuntu 20.04 VM.
2. Install the required packages from `/req-pip.txt` and `/req-conda.txt`.
3. Execute `install.sh` for OpenWPM installation.
4. Configure a VPN connection on your VM (if needed).
5. Name your VMs according to the `getMode()` function in `/setup.py`.
6. Adjust the crawling preferences in the `getConfig()` function  in `/setup.py`
7. Execute `restart.sh` on every VM to initiate the measurement.

#### Acknowledgements

This repository incorporates files from [OpenWPM](https://github.com/openwpm/OpenWPM), utilizing OpenWPM (v0.28) for Firefox operations.


## Preprocessing
We use different methods for preprocessing. For some preprocessing steps, a time span of up to 3 months is required. We provide the preprocessing code in the [folder](Code/Preprocessing).

### Cookiepedia
We classfy cookies using [Cookiepedia](https://cookiepedia.co.uk/), therefore we use a [script](Code/Preprocessing/cookie_classification/classify.py) that
crawls (friendly) the Cookiepedia API.

To run the script and modify the input CSV in the source code.
```
python classify.py
```
After classifying the cookies, the database has to be updated. Therefore, run the following [script](Code/Queries/Preprocessing/cookie_table.sql) in the BigQuery console. The script also classifies the cookie values for the first two steps of the [heuristic](#heuristic).

### EasyList
We classify our URLs with EasyList and EasyPrivacy. Therefore, we use a [Rust script](Code/Preprocessing/EasyList_Classification/rust_approach), testing a URL against the rules of the filter lists. To run the Rust script, execute:
```
# Optimize build
cargo run --release
```
After classifying the URLs, run the [script](Code/Queries/requests.sql) to update the BigQuery database. Also run
the [query](Code/Queries/Preprocessing/request_table.sql) to update if a request is third- or first-party.

### Clustering
To build the cluster, we use a [script](Code/Preprocessing/JavaScript) based on Simhashes. Before we do this, we extract the Simhashes for each JavaScript directly from the raw measurement data. 
```
python js_cluster_buffer_optimized.py
```
Please note that running the script can take a long time and requires a machine with up to 120 GB of RAM for successful batchwise computation.

### Heuristic
To obtain the data for the heuristic, run the [query](Code/Queries/hold_id.sql) in the BigQuery console.
We use a [script](Code/Heuristik) to perform the heuristic check. To get the data, we perform some queries
directly in BigQuery.
```
# Run script for heuristic
python cookie_heuristik_opti.py
```
Please note that running this script consumes a lot of time (~1 week) and needs a machine with up to 120GB RAM.

## Pattern Mining
We use FP-Growth pattern mining to identify frequent patterns in tracking URLs and generate filter rules. The framework is provided in the [06_RuleSet_generation](06_RuleSet_generation) folder.

### Feature Extraction
We extract query parameters and path segments from URLs to create binary features. The feature extraction is performed using the [script](06_RuleSet_generation/RuleSet_Mining/analyze_query_keys.py) that processes URLs and generates feature columns for the most frequent query keys.

To extract features from your dataset:
```
python analyze_query_keys.py
```

The script processes positive (tracking) and negative (non-tracking) URL datasets separately and generates feature CSV files with binary columns indicating the presence of specific query parameters.

### FP-Growth Pattern Mining
We use FP-Growth algorithm to mine frequent itemsets from tracking and non-tracking URLs separately. The [FP-Growth pipeline](06_RuleSet_generation/RuleSet_Mining/fpgrowth_pipeline.py) computes support metrics, lift ratios, and Fisher's exact test p-values for each itemset.

To run the pattern mining pipeline:
```
python fpgrowth_pipeline.py
```

The pipeline generates CSV files with frequent itemsets and their statistical metrics. You can configure the minimum support threshold and maximum itemset depth in the script.

### Rule Generation
From the mined patterns, we generate compact regex rules using positive lookaheads. The [rule generator script](06_RuleSet_generation/RuleSet_Mining/rules_generator/create_rules.py) converts frequent itemsets into adblocker-compatible rules.

To generate rules from mined patterns:
```
python create_rules.py --input <itemsets_csv> --output <rules_file> --min-lift <threshold> --max-params <max_params>
```

The script filters itemsets by lift ratio and generates regex rules that check for the presence of multiple query parameters in any order.

### Rule Evaluation
We evaluate the generated rules against EasyList and EasyPrivacy to measure coverage and distinct blocking capabilities. The [evaluation script](06_RuleSet_generation/Rules_evaluation/evaluate_blocking.py) compares blocking performance across different rule sets.

To evaluate rules:
```
python evaluate_blocking.py
```

The evaluation generates statistics on coverage percentages and distinct blocks for each rule set (EasyList, EasyPrivacy, and custom generated rules).

For running the complete workflow with different experimental configurations, use the [orchestration script](06_RuleSet_generation/RuleSet_Mining/run_experiments.py):
```
python run_experiments.py
```

## Analysis
In the following, we provide an overview of our analysis.
Please note that BQ credits and access to the non-public dataset are necessary to perform the analysis.

### Overview
To capture all data for our overview, run the [script](Code/Queries/measurement_dataset_overview.sql) in a BigQuery console.
- [Overview JavaScript](Code/Queries/javascript.sql)
- [Overview Cookies](Code/Queries/cookies.sql)

To generate the UpSet plot, we use a Jupyter notebook: [script](Code/Analysis/JavaScript/overview.ipynb). To get information on the sizes and number of JavaScript files per profile, run the [script](Code/Analysis/JavaScript/js_script_size.py) on each VM to collect the data.

### Ecosystem
To perform the analysis for the ecosystem, there are multiple scripts with queries to use:
- **[cookie ecosystem](Code/Queries/cookie_ecosystem.sql)** performs all analysis from chapter *Usage of Server-Site Tracking Cookies* based on the
cookies in different clusters
- **[Ecosystem](Code/Queries/ecosystem_clustering_data.sql)** the script contains all statements for the ecosystem analysis.
- **[Top Cluster](Code/Queries/top_cluster.sql)** contains all statements for the analysis of the top 10 clusters.

Besides BigQuery queries we have multiple Python scripts:
- **[Overview](Code/Analysis/ecosystem/overview.ipynb)** contains the distribution function of cluster by size.
- **[Pipeline](Code/Analysis/ecosystem/ecosystem_analysis_pipeline.py)** contains the pipeline to analyse and create the SimhashIndex clustering.
- **[Attribution](Code/Analysis/ecosystem/attribute_scripts.py)** contains the attribution process with whotracksme data.
- **[Top 10 Attribution](Code/Analysis/ecosystem/top_cluster/attribution.ipynb)** contains an overview of the attribution from the top clusters.
- **[Network Graph Figure](Code/Analysis/ecosystem/network_graph/network_graph_paper.ipynb)** creates the figure from the paper based on the top 5 clusters
- **[Network Graph Analysis](Code/Analysis/ecosystem/network_graph/graph_analysis.ipynb)** contains all analysis made for the complete graph

### Disclaimer
Some of the used data (.csv-files) are not included in the Github repository regarding the size of the files or the number
of files that are needed. Hence we are not able to push them into a Github repository. We will provide access to those file
after the paper get accepted.

