--- 1.0: Classified Cookies
SELECT browser_id, count(*) FROM cookie WHERE category != '';

---- 1.1: Purpose
SELECT browser_id, category, count(*) FROM cookie GROUP BY browser_id, category;

--- 1.2: Cookies in first--party context
SELECT browser_id, category, count(*)
        FROM cookie c
        JOIN request r
            ON c.browser_id = r.browser_id
            AND c.visit_id = r.visit_id
WHERE r.top_level_url == r.url
GROUP BY browser_id, category;

--- 1.3:  Cookies in first- and third-party context
SELECT browser_id, category, count(*)
        FROM cookie c
        JOIN request r
            ON c.browser_id = r.browser_id
            AND c.visit_id = r.visit_id
WHERE r.top_level_url != r.url
GROUP BY browser_id, category;

--- 2.0: FP cookies classified by Cookiepedia
SELECT
  COUNT(*)
FROM (
  SELECT
    DISTINCT name,
    path,
    value
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cookies`
  WHERE
    first_party_cookie
    AND category != '')


---- JavaScripts setting tracking cookies
CREATE TABLE
  `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem` AS
SELECT
  c.category,
  c.browser_id,
  c.visit_id,
  path,
  site_rank,
  in_cookiejar,
  c.time_stamp,
  store_id,
  first_party_domain,
  same_site,
  c.value,
  name,
  is_secure,
  record_type,
  c.event_ordinal,
  is_session,
  c.sqlite_browser_id,
  host,
  c.extension_session_uuid,
  change_cause,
  is_http_only,
  c.site_id,
  is_host_only,
  top_level_etld,
  first_party_cookie,
  contains_multiple_values,
  set_first_party_cookies,
  first_party_script,
  top_level_url_etld,
  document_url_etld,
  window_id,
  func_name,
  j.time_stamp as js_time_stamp,
  script_url_etld,
  top_level_url,
  symbol,
  script_col,
  script_url,
  frame_id,
  operation,
  page_scoped_event_ordinal,
  incognito,
  script_loc_eval,
  j.event_ordinal js_event_ordinal,
  tab_id,
  arguments,
  script_line,
  call_stack,
  document_url,
  subpage_id,
  j.value as js_value
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cookies` c
JOIN
  `magnetic-signer-465314-q4.server_side_tracking.javascript` j
ON
  c.browser_id = j.browser_id
  AND c.visit_id = j.visit_id
  AND c.event_ordinal = j.page_scoped_event_ordinal
  AND c.sqlite_visit_id = j.sqlite_visit_id
WHERE
  c.hold_id
  AND c.first_party_cookie;

--- Create Analysis Table
CREATE TABLE `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis` AS
SELECT
  eco.*,
  res.content_hash
FROM
  `magnetic-signer-465314-q4.server_side_tracking.responses` res
JOIN `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem` eco
ON res.browser_id = eco.browser_id
AND res.visit_id = eco.visit_id;



---- Update Tables:
CREATE OR REPLACE TABLE
  `magnetic-signer-465314-q4.server_side_tracking.eu1_hash` AS
SELECT
  string_field_0 AS content_hash,
  string_field_1 AS simhash_hex
FROM
  `magnetic-signer-465314-q4.server_side_tracking.eu1_hash`;

----
  UPDATE
  `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis` eco
SET
  eco.simhash_hex = eu1.simhash_hex
FROM
  `magnetic-signer-465314-q4.server_side_tracking.simhashes_eu1` eu1
WHERE
  eco.browser_id = 'openwpm_native_eu_1_omaticall'
  AND eco.content_hash = eu1.content_hash
  AND eco.site_id = eu1.site_id;

UPDATE
  `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis` eco
SET
  eco.simhash_hex = eu2.simhash_hex
FROM
  `magnetic-signer-465314-q4.server_side_tracking.simhashes_eu2` eu2
WHERE
  eco.browser_id = 'openwpm_native_eu_2_omaticall'
  AND eco.content_hash = eu2.content_hash
  AND eco.site_id = eu2.site_id;


  UPDATE
  `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis` eco
SET
  eco.simhash_hex = us1.simhash_hex
FROM
  `magnetic-signer-465314-q4.server_side_tracking.simhashes_us1` us1
WHERE
  eco.browser_id = 'openwpm_native_us_1_omaticall'
  AND eco.content_hash = us1.content_hash
  AND eco.site_id = us1.site_id;

UPDATE
  `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis` eco
SET
  eco.simhash_hex = us2.simhash_hex
FROM
  `magnetic-signer-465314-q4.server_side_tracking.simhashes_us2` us2
WHERE
  eco.browser_id = 'openwpm_native_us_2_omaticall'
  AND eco.content_hash = us2.content_hash
  AND eco.site_id = us2.site_id;



------------- Create Analysis Data:
CREATE TABLE `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_distinct` AS
SELECT
  *
FROM
  `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis`
WHERE
  simhash_hex IS NOT NULL --- filter ~15k out

--- Get distinct simhashes
SELECT
  distinct simhash_hex
FROM
  `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes`;

------ Create ID
  CREATE OR REPLACE TABLE `magnetic-signer-465314-q4.server_side_tracking.eco_results_2` AS
SELECT
  GENERATE_UUID() AS id,
  t.*
FROM
  `magnetic-signer-465314-q4.server_side_tracking.eco_results_2` AS t;
----
CREATE OR REPLACE TABLE `magnetic-signer-465314-q4.server_side_tracking.eco_res_mapped` As
WITH dedup AS (
  SELECT DISTINCT
    res.id AS cluster,
    eco.top_level_etld,
    eco.top_level_url_etld,
    eco.set_first_party_cookies,
    eco.first_party_script,
    eco.script_url,
    eco.script_url_etld
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.eco_results_2` AS res
  JOIN
    `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` AS eco
  #TABLESAMPLE SYSTEM (0.001 PERCENT)
  ON
    res.cluster_1 = eco.simhash_hex
    OR res.cluster_2 = eco.simhash_hex
    OR res.cluster_3 = eco.simhash_hex
    OR res.cluster_4 = eco.simhash_hex
    OR res.cluster_5 = eco.simhash_hex
    OR res.cluster_6 = eco.simhash_hex
)
SELECT
  cluster,
  TO_JSON_STRING(
    ARRAY_AGG(
      STRUCT(
        top_level_etld           AS top_level_etld,
        top_level_url_etld       AS top_level_url_etld,
        set_first_party_cookies  AS set_first_party_cookies,
        first_party_script       AS first_party_script,
        script_url               AS script_url,
        script_url_etld          AS script_url_etld
      )
      ORDER BY top_level_etld, script_url
    )
  ) AS data
FROM dedup
GROUP BY cluster
ORDER BY cluster;

--- upgrade with cluster ordering
CREATE OR REPLACE TABLE
  `magnetic-signer-465314-q4.server_side_tracking.cluster` AS
WITH dedup AS (
  SELECT DISTINCT
    res.id AS CLUSTER,
    res.cluster_size,
    res.cluster_1,
    res.cluster_2,
    res.cluster_3,
    res.cluster_4,
    res.cluster_5,
    res.cluster_6,
    eco.top_level_etld,
    eco.top_level_url_etld,
    eco.set_first_party_cookies,
    eco.first_party_script,
    eco.script_url,
    eco.script_url_etld,
    -- mark which cluster slot this row matched
    CASE
      WHEN res.cluster_1 = eco.simhash_hex THEN 'cluster_1'
      WHEN res.cluster_2 = eco.simhash_hex THEN 'cluster_2'
      WHEN res.cluster_3 = eco.simhash_hex THEN 'cluster_3'
      WHEN res.cluster_4 = eco.simhash_hex THEN 'cluster_4'
      WHEN res.cluster_5 = eco.simhash_hex THEN 'cluster_5'
      WHEN res.cluster_6 = eco.simhash_hex THEN 'cluster_6'
    END AS slot
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cluster_res` AS res
  JOIN
    `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` AS eco
  ON
       res.cluster_1 = eco.simhash_hex
    OR res.cluster_2 = eco.simhash_hex
    OR res.cluster_3 = eco.simhash_hex
    OR res.cluster_4 = eco.simhash_hex
    OR res.cluster_5 = eco.simhash_hex
    OR res.cluster_6 = eco.simhash_hex
)
SELECT
  CLUSTER,
  cluster_size,
  cluster_1,
  cluster_2,
  cluster_3,
  cluster_4,
  cluster_5,
  cluster_6,

  -- your original JSON payload
  TO_JSON_STRING(ARRAY_AGG(STRUCT(
      top_level_etld         AS top_level_etld,
      top_level_url_etld     AS top_level_url_etld,
      set_first_party_cookies AS set_first_party_cookies,
      first_party_script     AS first_party_script,
      script_url             AS script_url,
      script_url_etld        AS script_url_etld
    ) ORDER BY top_level_etld, script_url)) AS DATA,

 TO_JSON_STRING(STRUCT(
  ARRAY_AGG(
    DISTINCT IF(slot = 'cluster_1', script_url, NULL)
    IGNORE NULLS
    ORDER BY IF(slot = 'cluster_1', script_url, NULL)
  ) AS cluster_1,
  ARRAY_AGG(
    DISTINCT IF(slot = 'cluster_2', script_url, NULL)
    IGNORE NULLS
    ORDER BY IF(slot = 'cluster_2', script_url, NULL)
  ) AS cluster_2,
  ARRAY_AGG(
    DISTINCT IF(slot = 'cluster_3', script_url, NULL)
    IGNORE NULLS
    ORDER BY IF(slot = 'cluster_3', script_url, NULL)
  ) AS cluster_3,
  ARRAY_AGG(
    DISTINCT IF(slot = 'cluster_4', script_url, NULL)
    IGNORE NULLS
    ORDER BY IF(slot = 'cluster_4', script_url, NULL)
  ) AS cluster_4,
  ARRAY_AGG(
    DISTINCT IF(slot = 'cluster_5', script_url, NULL)
    IGNORE NULLS
    ORDER BY IF(slot = 'cluster_5', script_url, NULL)
  ) AS cluster_5,
  ARRAY_AGG(
    DISTINCT IF(slot = 'cluster_6', script_url, NULL)
    IGNORE NULLS
    ORDER BY IF(slot = 'cluster_6', script_url, NULL)
  ) AS cluster_6
)) AS cluster_to_script_urls


FROM dedup
GROUP BY
  CLUSTER, cluster_size,
  cluster_1, cluster_2, cluster_3, cluster_4, cluster_5, cluster_6
ORDER BY CLUSTER;



----- 3.0: cluster
WITH per_cluster AS (
  SELECT
    ARRAY_LENGTH(JSON_EXTRACT_ARRAY(DATA, '$')) AS number_of_elements
  FROM `magnetic-signer-465314-q4.server_side_tracking.eco_res_mapped`
)
SELECT
  AVG(number_of_elements)  AS mean,
  MIN(number_of_elements)  AS min,
  MAX(number_of_elements)  AS max,
  STDDEV(number_of_elements) AS sd,
  APPROX_QUANTILES(number_of_elements, 100)[OFFSET(50)] AS median_approx
FROM per_cluster;

----- 3.1: quantitiy of cluster
SELECT
  number_of_elements,
  COUNT(*) c
FROM (
  SELECT
    ARRAY_LENGTH(JSON_EXTRACT_ARRAY(DATA, '$')) AS number_of_elements
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.eco_res_mapped`)
GROUP BY
  number_of_elements
HAVING
  number_of_elements = 1;


---- Coookies per cluster:
SELECT
  id,
  ARRAY_AGG(cookie_name) cookies_per_cluster
FROM (
  SELECT
    DISTINCT res.id AS id,
    eco.name AS cookie_name
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.eco_results` res,
    `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` eco
  WHERE
    res.cluster_1 = eco.simhash_hex
    OR res.cluster_2 = eco.simhash_hex
    OR res.cluster_3 = eco.simhash_hex
    OR res.cluster_4 = eco.simhash_hex
    OR res.cluster_5 = eco.simhash_hex
    OR res.cluster_6 = eco.simhash_hex
  ORDER BY
    id)
GROUP BY
  id;

---- 3.2: Scripts per cluster:
    SELECT
  cluster_size,
  COUNT(cluster_size),
  (COUNT(cluster_size) / (SELECT count(0) FROM `magnetic-signer-465314-q4.server_side_tracking.eco_results_2`)) * 100 as percentage
FROM
  `magnetic-signer-465314-q4.server_side_tracking.eco_results_2`
GROUP BY
  cluster_size;


---- 4.0: Cookies stats:
SELECT
  AVG(cookie_length) AS mean,
  MIN(cookie_length) AS min,
  MAX(cookie_length) AS max,
  STDDEV(cookie_length) AS sd,
  APPROX_QUANTILES(cookie_length, 100)[
OFFSET
  (50)] AS median_approx
FROM (
  SELECT
    id,
    cookies_per_cluster,
    ARRAY_LENGTH(cookies_per_cluster) cookie_length
  FROM (
    SELECT
      id,
      ARRAY_AGG(cookie_name) cookies_per_cluster
    FROM (
      SELECT
        DISTINCT res.id AS id,
        eco.name AS cookie_name
      FROM
        `magnetic-signer-465314-q4.server_side_tracking.eco_results_2` res,
        `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` eco
      WHERE
        res.cluster_1 = eco.simhash_hex
    OR res.cluster_2 = eco.simhash_hex
    OR res.cluster_3 = eco.simhash_hex
    OR res.cluster_4 = eco.simhash_hex
    OR res.cluster_5 = eco.simhash_hex
    OR res.cluster_6 = eco.simhash_hex
      ORDER BY
        id)
    GROUP BY
      id));




---- 4.0: cookies per simhash in cluster
SELECT
  res.id AS id,
  res.cluster_1 AS CLUSTER,
  eco.name AS cookie_name
FROM
  `magnetic-signer-465314-q4.server_side_tracking.eco_results_2` AS res
JOIN
  `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` AS eco
ON
  res.cluster_1 = eco.simhash_hex
UNION ALL
SELECT
  res.id AS id,
  res.cluster_2 AS CLUSTER,
  eco.name AS cookie_name
FROM
  `magnetic-signer-465314-q4.server_side_tracking.eco_results_2` AS res
JOIN
  `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` AS eco
ON
  res.cluster_2 = eco.simhash_hex
UNION ALL
SELECT
  res.id AS id,
  res.cluster_3 AS CLUSTER,
  eco.name AS cookie_name
FROM
  `magnetic-signer-465314-q4.server_side_tracking.eco_results_2` AS res
JOIN
  `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` AS eco
ON
  res.cluster_3 = eco.simhash_hex
UNION ALL
SELECT
  res.id AS id,
  res.cluster_4 AS CLUSTER,
  eco.name AS cookie_name
FROM
  `magnetic-signer-465314-q4.server_side_tracking.eco_results_2` AS res
JOIN
  `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` AS eco
ON
  res.cluster_4 = eco.simhash_hex
UNION ALL
SELECT
  res.id AS id,
  res.cluster_5 AS CLUSTER,
  eco.name AS cookie_name
FROM
  `magnetic-signer-465314-q4.server_side_tracking.eco_results_2` AS res
JOIN
  `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` AS eco
ON
  res.cluster_5 = eco.simhash_hex
UNION ALL
SELECT
  res.id AS id,
  res.cluster_6 AS CLUSTER,
  eco.name AS cookie_name
FROM
  `magnetic-signer-465314-q4.server_side_tracking.eco_results_2` AS res
JOIN
  `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` AS eco
ON
  res.cluster_6 = eco.simhash_hex


--- Cookies in table:
CREATE OR REPLACE TABLE
  `magnetic-signer-465314-q4.server_side_tracking.eco_res_mapped_w_cookies` AS
SELECT
  foo.id,
  bar.data,
  ARRAY_AGG(DISTINCT cookie_name IGNORE NULLS
  ORDER BY
    cookie_name) AS cookies_per_cluster
FROM (
  SELECT
    DISTINCT res.id AS id,
    eco.name AS cookie_name
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.eco_results_2` AS res
  JOIN
    `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` AS eco
  ON
    res.cluster_1 = eco.simhash_hex
    OR res.cluster_2 = eco.simhash_hex
    OR res.cluster_3 = eco.simhash_hex
    OR res.cluster_4 = eco.simhash_hex
    OR res.cluster_5 = eco.simhash_hex
    OR res.cluster_6 = eco.simhash_hex ) foo,
  `magnetic-signer-465314-q4.server_side_tracking.eco_res_mapped` bar
WHERE
  bar.cluster = foo.id
GROUP BY
  foo.id,
  bar.data;

--- upgrade statement
    CREATE OR REPLACE TABLE
  `magnetic-signer-465314-q4.server_side_tracking.cluster` AS

-- Use the current cluster table as the base to retain all existing data
WITH base AS (
  SELECT * FROM `magnetic-signer-465314-q4.server_side_tracking.cluster`
),

-- Match cookies to clusters and tag which slot matched
cookie_base AS (
  SELECT DISTINCT
    b.cluster           AS cluster_id,
    eco.name            AS cookie_name,
    CASE
      WHEN b.cluster_1 = eco.simhash_hex THEN 'cluster_1'
      WHEN b.cluster_2 = eco.simhash_hex THEN 'cluster_2'
      WHEN b.cluster_3 = eco.simhash_hex THEN 'cluster_3'
      WHEN b.cluster_4 = eco.simhash_hex THEN 'cluster_4'
      WHEN b.cluster_5 = eco.simhash_hex THEN 'cluster_5'
      WHEN b.cluster_6 = eco.simhash_hex THEN 'cluster_6'
    END AS slot
  FROM base b
  JOIN `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` eco
    ON b.cluster_1 = eco.simhash_hex
    OR b.cluster_2 = eco.simhash_hex
    OR b.cluster_3 = eco.simhash_hex
    OR b.cluster_4 = eco.simhash_hex
    OR b.cluster_5 = eco.simhash_hex
    OR b.cluster_6 = eco.simhash_hex
),

-- Aggregate per cluster and per slot
cookie_agg AS (
  SELECT
    cluster_id,

    -- 1) distinct cookies for the whole cluster
    ARRAY_AGG(
      DISTINCT cookie_name
      IGNORE NULLS
      ORDER BY cookie_name
    ) AS cookies_per_cluster,

    -- 2) cookies per slot (typed STRUCT, not JSON)
    STRUCT(
      ARRAY_AGG(
        DISTINCT IF(slot = 'cluster_1', cookie_name, NULL)
        IGNORE NULLS
        ORDER BY IF(slot = 'cluster_1', cookie_name, NULL)
      ) AS cluster_1,
      ARRAY_AGG(
        DISTINCT IF(slot = 'cluster_2', cookie_name, NULL)
        IGNORE NULLS
        ORDER BY IF(slot = 'cluster_2', cookie_name, NULL)
      ) AS cluster_2,
      ARRAY_AGG(
        DISTINCT IF(slot = 'cluster_3', cookie_name, NULL)
        IGNORE NULLS
        ORDER BY IF(slot = 'cluster_3', cookie_name, NULL)
      ) AS cluster_3,
      ARRAY_AGG(
        DISTINCT IF(slot = 'cluster_4', cookie_name, NULL)
        IGNORE NULLS
        ORDER BY IF(slot = 'cluster_4', cookie_name, NULL)
      ) AS cluster_4,
      ARRAY_AGG(
        DISTINCT IF(slot = 'cluster_5', cookie_name, NULL)
        IGNORE NULLS
        ORDER BY IF(slot = 'cluster_5', cookie_name, NULL)
      ) AS cluster_5,
      ARRAY_AGG(
        DISTINCT IF(slot = 'cluster_6', cookie_name, NULL)
        IGNORE NULLS
        ORDER BY IF(slot = 'cluster_6', cookie_name, NULL)
      ) AS cluster_6
    ) AS cookies_per_cluster_slots
  FROM cookie_base
  GROUP BY cluster_id
)

-- Rebuild the cluster table: all prior columns + the two new cookie columns
SELECT
  b.*,
  ca.cookies_per_cluster,
  ca.cookies_per_cluster_slots
FROM base b
LEFT JOIN cookie_agg ca
  ON ca.cluster_id = b.cluster
ORDER BY b.cluster;



--- 5.0 Cookie Cluster Analysis
WITH
  cookies_per_cluster AS (
  SELECT
    id,
    cookie
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.eco_res_mapped_w_cookies`,
    UNNEST(cookies_per_cluster) AS cookie)
SELECT
  cookie,
  COUNT(*) occurency_in_clusters,
  count(*) / (SELECT )
FROM
  cookies_per_cluster
GROUP BY
  cookie
ORDER BY
  occurency_in_clusters DESC;


------ cookies from js that sets fp cookies:
SELECT
  id,
  ARRAY_AGG(cookie_name) fp_cookies_set_by_js_per_cluster,
  ARRAY_LENGTH(ARRAY_AGG(cookie_name)) fp_cookie_len
FROM (
  SELECT
    res.id AS id,
    res.cluster_1 AS CLUSTER,
    eco.name AS cookie_name
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.eco_results_2` AS res
  JOIN
    `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` AS eco
  ON
    res.cluster_1 = eco.simhash_hex
  WHERE
    first_party_cookie
  UNION ALL
  SELECT
    res.id AS id,
    res.cluster_2 AS CLUSTER,
    eco.name AS cookie_name
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.eco_results_2` AS res
  JOIN
    `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` AS eco
  ON
    res.cluster_2 = eco.simhash_hex
  WHERE
    first_party_cookie
  UNION ALL
  SELECT
    res.id AS id,
    res.cluster_3 AS CLUSTER,
    eco.name AS cookie_name
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.eco_results_2` AS res
  JOIN
    `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` AS eco
  ON
    res.cluster_3 = eco.simhash_hex
  WHERE
    first_party_cookie
  UNION ALL
  SELECT
    res.id AS id,
    res.cluster_4 AS CLUSTER,
    eco.name AS cookie_name
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.eco_results_2` AS res
  JOIN
    `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` AS eco
  ON
    res.cluster_4 = eco.simhash_hex
  WHERE
    first_party_cookie
  UNION ALL
  SELECT
    res.id AS id,
    res.cluster_5 AS CLUSTER,
    eco.name AS cookie_name
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.eco_results_2` AS res
  JOIN
    `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` AS eco
  ON
    res.cluster_5 = eco.simhash_hex
  WHERE
    first_party_cookie
  UNION ALL
  SELECT
    res.id AS id,
    res.cluster_6 AS CLUSTER,
    eco.name AS cookie_name
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.eco_results_2` AS res
  JOIN
    `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` AS eco
  ON
    res.cluster_6 = eco.simhash_hex
  WHERE
    first_party_cookie)
GROUP BY
  id;

---- Get cookies:

with data AS (
SELECT
  id,
  ARRAY_AGG(cookie_name) fp_cookies_set_by_js_per_cluster,
  ARRAY_LENGTH(ARRAY_AGG(cookie_name)) fp_cookie_len
FROM (
  SELECT
    DISTINCT id,
    cookie_name
  FROM (
    FROM (
      SELECT
        res.id AS id,
        res.cluster_1 AS CLUSTER,
        eco.name AS cookie_name
      FROM
        `magnetic-signer-465314-q4.server_side_tracking.eco_results_2` AS res
      JOIN
        `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` AS eco
      ON
        res.cluster_1 = eco.simhash_hex
      WHERE
        first_party_cookie
      UNION ALL
      SELECT
        res.id AS id,
        res.cluster_2 AS CLUSTER,
        eco.name AS cookie_name
      FROM
        `magnetic-signer-465314-q4.server_side_tracking.eco_results_2` AS res
      JOIN
        `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` AS eco
      ON
        res.cluster_2 = eco.simhash_hex
      WHERE
        first_party_cookie
      UNION ALL
      SELECT
        res.id AS id,
        res.cluster_3 AS CLUSTER,
        eco.name AS cookie_name
      FROM
        `magnetic-signer-465314-q4.server_side_tracking.eco_results_2` AS res
      JOIN
        `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` AS eco
      ON
        res.cluster_3 = eco.simhash_hex
      WHERE
        first_party_cookie
      UNION ALL
      SELECT
        res.id AS id,
        res.cluster_4 AS CLUSTER,
        eco.name AS cookie_name
      FROM
        `magnetic-signer-465314-q4.server_side_tracking.eco_results_2` AS res
      JOIN
        `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` AS eco
      ON
        res.cluster_4 = eco.simhash_hex
      WHERE
        first_party_cookie
      UNION ALL
      SELECT
        res.id AS id,
        res.cluster_5 AS CLUSTER,
        eco.name AS cookie_name
      FROM
        `magnetic-signer-465314-q4.server_side_tracking.eco_results_2` AS res
      JOIN
        `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` AS eco
      ON
        res.cluster_5 = eco.simhash_hex
      WHERE
        first_party_cookie
      UNION ALL
      SELECT
        res.id AS id,
        res.cluster_6 AS CLUSTER,
        eco.name AS cookie_name
      FROM
        `magnetic-signer-465314-q4.server_side_tracking.eco_results_2` AS res
      JOIN
        `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` AS eco
      ON
        res.cluster_6 = eco.simhash_hex
      WHERE
        first_party_cookie)))
GROUP BY
  id)

SELECT cookies, count(*) FROM data, UNNEST(fp_cookies_set_by_js_per_cluster) as cookies GROUP BY cookies


---------------------
---- cookies and cookie-pedia
--- 2.1: HTTP Cookies
SELECT
 DISTINCT name
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cookies`
WHERE
  is_http_only = 1
  AND name NOT IN (
  SELECT
    DISTINCT name
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cookies`
  WHERE
    is_http_only = 0
    AND first_party_cookie)
  AND first_party_cookie;


---- 2.2: JS Cookies:
SELECT
  DISTINCT name
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cookies` c
JOIN
  `magnetic-signer-465314-q4.server_side_tracking.javascript` j
ON
  c.browser_id = j.browser_id
  AND c.visit_id = j.visit_id
  AND c.event_ordinal = j.page_scoped_event_ordinal
  AND c.sqlite_visit_id = j.sqlite_visit_id
WHERE
   c.first_party_cookie;





--------- 3.0: well-known scripts "Google"
--- all
SELECT
  *
FROM (
  SELECT
    id,
    ARRAY_LENGTH(JSON_EXTRACT_ARRAY(DATA)) AS cluster_size,
    JSON_EXTRACT(urls, '$.script_url') AS script_url
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.eco_res_mapped_w_cookies`,
    UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls)
WHERE
  script_url LIKE '%gtag/js?id=%';

--- distinct URLs
SELECT
  count(distinct script_url)
FROM (
  SELECT
    id,
    JSON_EXTRACT(urls, '$.script_url') AS script_url
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.eco_res_mapped_w_cookies`,
    UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls)
WHERE
  script_url LIKE '%gtag/js?id=%';

--- 3.1: in clusters
SELECT
  count(distinct id)
FROM (
  SELECT
    id,
    JSON_EXTRACT(urls, '$.script_url') AS script_url
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.eco_res_mapped_w_cookies`,
    UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls)
WHERE
  script_url LIKE '%gtag/js?id=%';

---3.2: not included from google fp
SELECT
  #count(distinct script_url)
  *
FROM (
  SELECT
    id,
    JSON_EXTRACT(urls, '$.script_url') AS script_url
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.eco_res_mapped_w_cookies`,
    UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls)
WHERE
  script_url LIKE '%gtag/js?id=%'
  AND NET.REG_DOMAIN(script_url) NOT LIKE 'google%';

---- 3.3: Analytics
SELECT
  *
FROM (
  SELECT
    id,
    ARRAY_LENGTH(JSON_EXTRACT_ARRAY(DATA)) AS cluster_size,
    JSON_EXTRACT(urls, '$.script_url') AS script_url
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.eco_res_mapped_w_cookies`,
    UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls)
WHERE
  script_url LIKE '%analytics.js%'
  OR script_url LIKE '%analytics.min.js%'

--- URLs
SELECT
  count(distinct script_url)
FROM (
  SELECT
    id,
    JSON_EXTRACT(urls, '$.script_url') AS script_url
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.eco_res_mapped_w_cookies`,
    UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls)
WHERE
  script_url LIKE '%analytics.js%'
  OR script_url LIKE '%analytics.min.js%';
--- 3.4: clusters
SELECT
  count(distinct id)
FROM (
  SELECT
    id,
    JSON_EXTRACT(urls, '$.script_url') AS script_url
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.eco_res_mapped_w_cookies`,
    UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls)
WHERE
  script_url LIKE '%analytics.js%'
  OR script_url LIKE '%analytics.min.js%';

--- 3.5 not from google
SELECT
  DISTINCT script_url,
  NET.REG_DOMAIN(script_url) etld
FROM (
  SELECT
    id,
    JSON_EXTRACT(urls, '$.script_url') AS script_url
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.eco_res_mapped_w_cookies`,
    UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls)
WHERE
  (script_url LIKE '%analytics.js%'
  OR script_url LIKE '%analytics.min.js%')
  AND NET.REG_DOMAIN(script_url) NOT LIKE 'google%';


---- 3.6 fbevents
SELECT
  *
FROM (
  SELECT
    id,
    ARRAY_LENGTH(JSON_EXTRACT_ARRAY(DATA)) AS cluster_size,
    JSON_EXTRACT(urls, '$.script_url') AS script_url
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.eco_res_mapped_w_cookies`,
    UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls)
WHERE
  script_url LIKE '%fbevents.js%'

--- URLS
SELECT
  count(distinct script_url)
FROM (
  SELECT
    id,
    JSON_EXTRACT(urls, '$.script_url') AS script_url
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.eco_res_mapped_w_cookies`,
    UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls)
WHERE
  script_url LIKE '%fbevents.js%';


--- 3.7 cluster
  SELECT
  count(distinct id)
FROM (
  SELECT
    id,
    JSON_EXTRACT(urls, '$.script_url') AS script_url
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.eco_res_mapped_w_cookies`,
    UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls)
WHERE
  script_url LIKE '%fbevents.js%';

--- 3.8: belongs to meta
SELECT
  count(distinct script_url)
FROM (
  SELECT
    id,
    JSON_EXTRACT(urls, '$.script_url') AS script_url
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.eco_res_mapped_w_cookies`,
    UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls)
WHERE
  script_url LIKE '%fbevents.js%'
  AND NET.REG_DOMAIN(script_url) NOT LIKE '%facebook%';

---- TABLE ID -> Script_url
CREATE OR REPLACE TABLE `magnetic-signer-465314-q4.server_side_tracking.cluster_id_url` AS
SELECT
  id,
  JSON_VALUE(urls, '$.script_url') AS script_url
FROM
  `magnetic-signer-465314-q4.server_side_tracking.eco_res_mapped_w_cookies`,
  UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls;

---- Update table for google domains in cluster
UPDATE
  `magnetic-signer-465314-q4.server_side_tracking.eco_res_mapped_w_cookies`
SET
  contains_google_urls = (id IN (
    SELECT
      DISTINCT id
    FROM (
      SELECT
        id,
        JSON_VALUE(urls, '$.script_url') AS script_url
      FROM
        `magnetic-signer-465314-q4.server_side_tracking.eco_res_mapped_w_cookies`,
        UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls)
    WHERE
      NET.REG_DOMAIN(script_url) LIKE '%google%'))
WHERE
  1=1;

--- 4.0: Google Cluster
SELECT
  cookies_per_cluster
FROM
  `magnetic-signer-465314-q4.server_side_tracking.eco_res_mapped_w_cookies`
WHERE
 contains_google_urls;

--- 4.1: Google Cluster w cookies from other tracking
SELECT
  cookies_per_cluster
FROM
  `magnetic-signer-465314-q4.server_side_tracking.eco_res_mapped_w_cookies`
WHERE
 contains_google_urls
  AND
  (
    SELECT COUNT(DISTINCT cookie)
    FROM UNNEST(cookies_per_cluster) AS cookie
    WHERE cookie IN ('_fbp', '_ga', '_ttp')
  ) = 3;

---- 4.2: No Google w cookies from tracking
SELECT
  cookies_per_cluster
FROM
  `magnetic-signer-465314-q4.server_side_tracking.eco_res_mapped_w_cookies`
WHERE
 contains_google_urls = False
  AND
  (
    SELECT COUNT(DISTINCT cookie)
    FROM UNNEST(cookies_per_cluster) AS cookie
    WHERE cookie IN ('_fbp', '_ga', '_ttp')
  ) = 3;

----- new table
    CREATE OR REPLACE TABLE
  `magnetic-signer-465314-q4.server_side_tracking.cluster_test` AS

-- 0) Snapshot current table
WITH base AS (
  SELECT * FROM `magnetic-signer-465314-q4.server_side_tracking.cluster`
),

-- 1) Row-level matches: cluster, slot, script_url, cookie
matches AS (
  SELECT DISTINCT
    b.cluster AS cluster_id,
    CASE
      WHEN b.cluster_1 = eco.simhash_hex THEN 'cluster_1'
      WHEN b.cluster_2 = eco.simhash_hex THEN 'cluster_2'
      WHEN b.cluster_3 = eco.simhash_hex THEN 'cluster_3'
      WHEN b.cluster_4 = eco.simhash_hex THEN 'cluster_4'
      WHEN b.cluster_5 = eco.simhash_hex THEN 'cluster_5'
      WHEN b.cluster_6 = eco.simhash_hex THEN 'cluster_6'
    END            AS slot,
    eco.script_url AS script_url,
    eco.name       AS cookie_name
  FROM base b
  JOIN `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` eco
    ON b.cluster_1 = eco.simhash_hex
    OR b.cluster_2 = eco.simhash_hex
    OR b.cluster_3 = eco.simhash_hex
    OR b.cluster_4 = eco.simhash_hex
    OR b.cluster_5 = eco.simhash_hex
    OR b.cluster_6 = eco.simhash_hex
),

-- 2) Aggregate per (cluster, slot, script_url) → cookies[]
url_cookie_pairs AS (
  SELECT
    cluster_id,
    slot,
    script_url,
    ARRAY_AGG(
      DISTINCT cookie_name
      IGNORE NULLS
      ORDER BY cookie_name
    ) AS cookies
  FROM matches
  GROUP BY cluster_id, slot, script_url
),

-- 3) Build arrays per slot in one grouped pass (no correlated subqueries)
slot_arrays AS (
  SELECT
    cluster_id,
    ARRAY_AGG(
      IF(slot = 'cluster_1', STRUCT(script_url, cookies), NULL)
      IGNORE NULLS
      ORDER BY IF(slot = 'cluster_1', script_url, NULL)
    ) AS cluster_1,
    ARRAY_AGG(
      IF(slot = 'cluster_2', STRUCT(script_url, cookies), NULL)
      IGNORE NULLS
      ORDER BY IF(slot = 'cluster_2', script_url, NULL)
    ) AS cluster_2,
    ARRAY_AGG(
      IF(slot = 'cluster_3', STRUCT(script_url, cookies), NULL)
      IGNORE NULLS
      ORDER BY IF(slot = 'cluster_3', script_url, NULL)
    ) AS cluster_3,
    ARRAY_AGG(
      IF(slot = 'cluster_4', STRUCT(script_url, cookies), NULL)
      IGNORE NULLS
      ORDER BY IF(slot = 'cluster_4', script_url, NULL)
    ) AS cluster_4,
    ARRAY_AGG(
      IF(slot = 'cluster_5', STRUCT(script_url, cookies), NULL)
      IGNORE NULLS
      ORDER BY IF(slot = 'cluster_5', script_url, NULL)
    ) AS cluster_5,
    ARRAY_AGG(
      IF(slot = 'cluster_6', STRUCT(script_url, cookies), NULL)
      IGNORE NULLS
      ORDER BY IF(slot = 'cluster_6', script_url, NULL)
    ) AS cluster_6
  FROM url_cookie_pairs
  GROUP BY cluster_id
)

-- 4) Final: keep everything; add the single new column with NAMED fields
SELECT
  b.*,
  STRUCT(
    COALESCE(sa.cluster_1, ARRAY<STRUCT<script_url STRING, cookies ARRAY<STRING>>>[]) AS cluster_1,
    COALESCE(sa.cluster_2, ARRAY<STRUCT<script_url STRING, cookies ARRAY<STRING>>>[]) AS cluster_2,
    COALESCE(sa.cluster_3, ARRAY<STRUCT<script_url STRING, cookies ARRAY<STRING>>>[]) AS cluster_3,
    COALESCE(sa.cluster_4, ARRAY<STRUCT<script_url STRING, cookies ARRAY<STRING>>>[]) AS cluster_4,
    COALESCE(sa.cluster_5, ARRAY<STRUCT<script_url STRING, cookies ARRAY<STRING>>>[]) AS cluster_5,
    COALESCE(sa.cluster_6, ARRAY<STRUCT<script_url STRING, cookies ARRAY<STRING>>>[]) AS cluster_6
  ) AS script_urls_cookies_per_slot
FROM base b
LEFT JOIN slot_arrays sa
  ON sa.cluster_id = b.cluster
ORDER BY b.cluster;


---- 5: Ecosystem Simhashes
---- 5.0: distinct simhashes
    SELECT
  COUNT(DISTINCT simhash_hex)
FROM
  `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes`

---- 5.1: party context
    WITH
  norm AS (
  SELECT
    simhash_hex,
    script_url,
    top_level_etld,
    CASE
      WHEN REGEXP_CONTAINS(script_url, r'^[a-zA-Z][a-zA-Z0-9+\-.]*://') THEN script_url
      ELSE CONCAT('http://', script_url)
  END
    AS url_with_scheme
FROM
    `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes` )
SELECT
  fp,
  COUNT(*)
FROM (
  SELECT
    DISTINCT simhash_hex,
    COALESCE( LOWER(NET.REG_DOMAIN(NET.HOST(url_with_scheme))) = LOWER(top_level_etld), FALSE ) AS fp
  FROM
    norm)
GROUP BY
  fp;

---- 6: Top Cluster
---- 6.0:

