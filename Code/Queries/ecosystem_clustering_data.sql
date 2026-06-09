--- Create first table
CREATE OR REPLACE TABLE `magnetic-signer-465314-q4.server_side_tracking.tmp_ecosystem_candidates` AS
SELECT
    res.browser_id,
    res.visit_id,
    res.url response_url,
    req.url request_url,
    req.top_level_url,
    res.content_hash,
FROM `magnetic-signer-465314-q4.server_side_tracking.responses`  res
JOIN `magnetic-signer-465314-q4.server_side_tracking.requests` req
ON res.browser_id =req.browser_id
AND res.visit_id = req.visit_id
AND res.request_id = req.request_id
WHERE res.content_hash IS NOT NULL;

--- Create candidates
CREATE OR REPLACE TABLE
  `magnetic-signer-465314-q4.server_side_tracking.tmp_test_ecosystem_candidates` AS
WITH
  cookies_holding_ids AS (
  SELECT
    name
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cookies`
  WHERE
    hold_id = TRUE )
SELECT
  *,
  NET.REG_DOMAIN(script_url_with_scheme) = NET.REG_DOMAIN(top_level_url_with_scheme) AS first_party_script
FROM (
  SELECT
    browser_id,
    visit_id,
    request_url,
    response_url,
    content_hash,
    top_level_url,
    script_url,
    value,
    cookie_name,
    TRUE AS hold_id,
    CASE
      WHEN REGEXP_CONTAINS(script_url, r'^[a-zA-Z][a-zA-Z0-9+\-.]*://') THEN script_url
      ELSE CONCAT('http://', script_url)
  END
    AS script_url_with_scheme,
    CASE
      WHEN REGEXP_CONTAINS(top_level_url, r'^[a-zA-Z][a-zA-Z0-9+\-.]*://') THEN top_level_url
      ELSE CONCAT('http://', top_level_url)
  END
    AS top_level_url_with_scheme
  FROM (
    SELECT
      DISTINCT d.*,
      j.script_url,
      j.value,
      REPLACE(SUBSTRING(raw_cookie_name, 0, INSTR(raw_cookie_name, '=')), '=', '') cookie_name
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.tmp_ecosystem_candidates` d
    JOIN
      `magnetic-signer-465314-q4.server_side_tracking.javascript` j
    ON
      d.browser_id = j.browser_id
      AND d.visit_id = j.visit_id
      AND d.response_url = j.script_url
    CROSS JOIN
      UNNEST(SPLIT(j.value, ';')) AS raw_cookie_name
    WHERE
      j.symbol = 'window.document.cookie'
      AND j.value != ''
    ORDER BY
      j.value)
  WHERE
    cookie_name IN (
    SELECT
      *
    FROM
      cookies_holding_ids))


----- map with tracking cookies
CREATE OR REPLACE TABLE
  `magnetic-signer-465314-q4.server_side_tracking.tmp_test_ecosystem_candidates` AS
SELECT
  t.*,
  (t.cookie_name IN (SELECT
    name
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cookies`
  WHERE
    hold_id = TRUE)) AS hold_id
FROM
  `magnetic-signer-465314-q4.server_side_tracking.tmp_test_ecosystem_candidates` t


---- Update simhashes
--- Update EU1
UPDATE
  `magnetic-signer-465314-q4.server_side_tracking.tmp_test_ecosystem_candidates` eco
SET
  eco.simhash_hex = eu1.simhash_hex
FROM
  `magnetic-signer-465314-q4.server_side_tracking.simhashes_eu1` eu1
WHERE
  eco.browser_id = "openwpm_native_eu_1_omaticall"
  AND eco.content_hash = eu1.content_hash
  AND CAST(SPLIT(eco.visit_id, '_')[OFFSET(0)] AS int64) = eu1.site_id;
--- Update EU2
UPDATE
  `magnetic-signer-465314-q4.server_side_tracking.tmp_test_ecosystem_candidates` eco
SET
  eco.simhash_hex = eu2.simhash_hex
FROM
  `magnetic-signer-465314-q4.server_side_tracking.simhashes_eu2` eu2
WHERE
  eco.browser_id = "openwpm_native_eu_2_omaticall"
  AND eco.content_hash = eu2.content_hash
  AND CAST(SPLIT(eco.visit_id, '_')[OFFSET(0)] AS int64) = eu2.site_id;
--- Update US1
UPDATE
  `magnetic-signer-465314-q4.server_side_tracking.tmp_test_ecosystem_candidates` eco
SET
  eco.simhash_hex = us1.simhash_hex
FROM
  `magnetic-signer-465314-q4.server_side_tracking.simhashes_us1` us1
WHERE
  eco.browser_id = "openwpm_native_us_1_omaticall"
  AND eco.content_hash = us1.content_hash
  AND CAST(SPLIT(eco.visit_id, '_')[OFFSET(0)] AS int64) = us1.site_id;
--- Update US2
UPDATE
  `magnetic-signer-465314-q4.server_side_tracking.tmp_test_ecosystem_candidates` eco
SET
  eco.simhash_hex = us2.simhash_hex
FROM
  `magnetic-signer-465314-q4.server_side_tracking.simhashes_us2` us2
WHERE
  eco.browser_id = "openwpm_native_us_2_omaticall"
  AND eco.content_hash = us2.content_hash
  AND CAST(SPLIT(eco.visit_id, '_')[OFFSET(0)] AS int64) = us2.site_id;


--- Delete all rows where not hold_id or no simhash_hex exists
CREATE OR REPLACE TABLE `magnetic-signer-465314-q4.server_side_tracking.ecosystem_candidates` AS
SELECT
  distinct *
FROM
  `magnetic-signer-465314-q4.server_side_tracking.tmp_test_ecosystem_candidates`
WHERE
  hold_id = TRUE
  AND simhash_hex IS NOT NULL;



---- Create IDs
 CREATE OR REPLACE TABLE  `magnetic-signer-465314-q4.server_side_tracking.cluster` AS
SELECT
  GENERATE_UUID() AS id,
  t.*
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cluster` AS t;

---- Update URLs and Cookies
CREATE OR REPLACE TABLE `magnetic-signer-465314-q4.server_side_tracking.cluster` AS
WITH dedup AS (
  SELECT DISTINCT
    res.id AS cluster,
    res.cluster_size,
    res.cluster_1,
    res.cluster_2,
    res.cluster_3,
    eco.response_url url,
    eco.top_level_url,
    eco.cookie_name,
    -- mark which cluster slot this row matched
    CASE
      WHEN res.cluster_1 = eco.simhash_hex THEN 'cluster_1'
      WHEN res.cluster_2 = eco.simhash_hex THEN 'cluster_2'
      WHEN res.cluster_3 = eco.simhash_hex THEN 'cluster_3'
    END AS slot
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cluster` AS res
  JOIN
    `magnetic-signer-465314-q4.server_side_tracking.ecosystem_candidates` AS eco
  ON
       res.cluster_1 = eco.simhash_hex
    OR res.cluster_2 = eco.simhash_hex
    OR res.cluster_3 = eco.simhash_hex
)
SELECT
  CLUSTER,
  cluster_size,
  cluster_1,
  cluster_2,
  cluster_3,

  -- your original JSON payload
  TO_JSON_STRING(ARRAY_AGG(STRUCT(
      url AS url,
      top_level_url AS top_level_url,
      cookie_name
    ) ORDER BY url, top_level_url)) AS DATA,

 TO_JSON_STRING(STRUCT(
  ARRAY_AGG(
    DISTINCT IF(slot = 'cluster_1', url, NULL)
    IGNORE NULLS
    ORDER BY IF(slot = 'cluster_1', url, NULL)
  ) AS cluster_1,
  ARRAY_AGG(
    DISTINCT IF(slot = 'cluster_2', url, NULL)
    IGNORE NULLS
    ORDER BY IF(slot = 'cluster_2', url, NULL)
  ) AS cluster_2,
  ARRAY_AGG(
    DISTINCT IF(slot = 'cluster_3', url, NULL)
    IGNORE NULLS
    ORDER BY IF(slot = 'cluster_3', url, NULL)
  ) AS cluster_3
)) AS cluster_to_urls,

--- cookies
ARRAY_AGG(distinct cookie_name) cookies_per_cluster

FROM dedup
GROUP BY
  CLUSTER, cluster_size,
  cluster_1, cluster_2, cluster_3
ORDER BY CLUSTER;

---- UPDATE url length
UPDATE
  `magnetic-signer-465314-q4.server_side_tracking.cluster`
SET
  number_of_site_data = ARRAY_LENGTH(JSON_EXTRACT_ARRAY(`DATA`))
  WHERE 1=1;

---- Update cookie length
UPDATE
  `magnetic-signer-465314-q4.server_side_tracking.cluster`
SET
  number_of_cookies = ARRAY_LENGTH(cookies_per_cluster)
  WHERE 1=1;

--- Update fp and tp share
UPDATE
  `magnetic-signer-465314-q4.server_side_tracking.cluster` foo
SET foo.first_party_script = bar.first_party_script,
foo.third_party_script = bar.third_party_script
FROM(
SELECT
  CLUSTER,
  COUNTIF(fp_script=True) AS first_party_script,
  COUNTIF(fp_script=False) AS third_party_script
FROM (
  SELECT
    CLUSTER,
    NET.REG_DOMAIN(script_url_with_scheme) = NET.REG_DOMAIN(top_level_url_with_scheme) AS fp_script
  FROM (
    SELECT
      CLUSTER,
      CASE
        WHEN REGEXP_CONTAINS(JSON_VALUE(urls, '$.url'), r'^[a-zA-Z][a-zA-Z0-9+\-.]*://') THEN JSON_VALUE(urls, '$.url')
        ELSE CONCAT('http://', JSON_VALUE(urls, '$.url'))
    END
      AS script_url_with_scheme,
      CASE
        WHEN REGEXP_CONTAINS(JSON_VALUE(urls, '$.top_level_url'), r'^[a-zA-Z][a-zA-Z0-9+\-.]*://') THEN JSON_VALUE(urls, '$.top_level_url')
        ELSE CONCAT('http://', JSON_VALUE(urls, '$.top_level_url'))
    END
      AS top_level_url_with_scheme
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.cluster`,
      UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls))
GROUP BY
  CLUSTER
ORDER BY
  cluster desc)bar
  WHERE foo.cluster = bar.cluster;

-----

    CREATE OR REPLACE TABLE
  `magnetic-signer-465314-q4.server_side_tracking.cluster_k8` AS
WITH
  dedup AS (
  SELECT
    DISTINCT res.id AS CLUSTER,
    res.cluster_size,
    res.cluster_1,
    res.cluster_2,
    res.cluster_3,
    res.cluster_4,
    res.cluster_5,
    res.cluster_6,
    res.cluster_7,
    res.cluster_8,
    res.cluster_9,
    res.cluster_10,
    res.cluster_11,
    res.cluster_12,
    res.cluster_13,
    res.cluster_14,
    res.cluster_15,
    res.cluster_16,
    res.cluster_17,
    res.cluster_18,
    res.cluster_19,
    res.cluster_20,
    res.cluster_21,
    res.cluster_22,
    res.cluster_23,
    res.cluster_24,
    res.cluster_25,
    res.cluster_26,
    res.cluster_27,
    res.cluster_28,
    res.cluster_29,
    res.cluster_30,
    res.cluster_31,
    res.cluster_32,
    res.cluster_33,
    res.cluster_34,
    res.cluster_35,
    res.cluster_36,
    res.cluster_37,
    res.cluster_38,
    res.cluster_39,
    res.cluster_40,
    res.cluster_41,
    res.cluster_42,
    res.cluster_43,
    res.cluster_44,
    res.cluster_45,
    res.cluster_46,
    res.cluster_47,
    res.cluster_48,
    res.cluster_49,
    res.cluster_50,
    res.cluster_51,
    res.cluster_52,
    res.cluster_53,
    res.cluster_54,
    res.cluster_55,
    res.cluster_56,
    res.cluster_57,
    res.cluster_58,
    res.cluster_59,
    res.cluster_60,
    res.cluster_61,
    res.cluster_62,
    res.cluster_63,
    res.cluster_64,
    res.cluster_65,
    res.cluster_66,
    res.cluster_67,
    eco.response_url url,
    eco.top_level_url,
    eco.cookie_name,
    CASE
      WHEN res.cluster_1 = eco.simhash_hex THEN 'cluster_1'
      WHEN res.cluster_2 = eco.simhash_hex THEN 'cluster_2'
      WHEN res.cluster_3 = eco.simhash_hex THEN 'cluster_3'
      WHEN res.cluster_4 = eco.simhash_hex THEN 'cluster_4'
      WHEN res.cluster_5 = eco.simhash_hex THEN 'cluster_5'
      WHEN res.cluster_6 = eco.simhash_hex THEN 'cluster_6'
      WHEN res.cluster_7 = eco.simhash_hex THEN 'cluster_7'
      WHEN res.cluster_8 = eco.simhash_hex THEN 'cluster_8'
      WHEN res.cluster_9 = eco.simhash_hex THEN 'cluster_9'
      WHEN res.cluster_10 = eco.simhash_hex THEN 'cluster_10'
      WHEN res.cluster_11 = eco.simhash_hex THEN 'cluster_11'
      WHEN res.cluster_12 = eco.simhash_hex THEN 'cluster_12'
      WHEN res.cluster_13 = eco.simhash_hex THEN 'cluster_13'
      WHEN res.cluster_14 = eco.simhash_hex THEN 'cluster_14'
      WHEN res.cluster_15 = eco.simhash_hex THEN 'cluster_15'
      WHEN res.cluster_16 = eco.simhash_hex THEN 'cluster_16'
      WHEN res.cluster_17 = eco.simhash_hex THEN 'cluster_17'
      WHEN res.cluster_18 = eco.simhash_hex THEN 'cluster_18'
      WHEN res.cluster_19 = eco.simhash_hex THEN 'cluster_19'
      WHEN res.cluster_20 = eco.simhash_hex THEN 'cluster_20'
      WHEN res.cluster_21 = eco.simhash_hex THEN 'cluster_21'
      WHEN res.cluster_22 = eco.simhash_hex THEN 'cluster_22'
      WHEN res.cluster_23 = eco.simhash_hex THEN 'cluster_23'
      WHEN res.cluster_24 = eco.simhash_hex THEN 'cluster_24'
      WHEN res.cluster_25 = eco.simhash_hex THEN 'cluster_25'
      WHEN res.cluster_26 = eco.simhash_hex THEN 'cluster_26'
      WHEN res.cluster_27 = eco.simhash_hex THEN 'cluster_27'
      WHEN res.cluster_28 = eco.simhash_hex THEN 'cluster_28'
      WHEN res.cluster_29 = eco.simhash_hex THEN 'cluster_29'
      WHEN res.cluster_30 = eco.simhash_hex THEN 'cluster_30'
      WHEN res.cluster_31 = eco.simhash_hex THEN 'cluster_31'
      WHEN res.cluster_32 = eco.simhash_hex THEN 'cluster_32'
      WHEN res.cluster_33 = eco.simhash_hex THEN 'cluster_33'
      WHEN res.cluster_34 = eco.simhash_hex THEN 'cluster_34'
      WHEN res.cluster_35 = eco.simhash_hex THEN 'cluster_35'
      WHEN res.cluster_36 = eco.simhash_hex THEN 'cluster_36'
      WHEN res.cluster_37 = eco.simhash_hex THEN 'cluster_37'
      WHEN res.cluster_38 = eco.simhash_hex THEN 'cluster_38'
      WHEN res.cluster_39 = eco.simhash_hex THEN 'cluster_39'
      WHEN res.cluster_40 = eco.simhash_hex THEN 'cluster_40'
      WHEN res.cluster_41 = eco.simhash_hex THEN 'cluster_41'
      WHEN res.cluster_42 = eco.simhash_hex THEN 'cluster_42'
      WHEN res.cluster_43 = eco.simhash_hex THEN 'cluster_43'
      WHEN res.cluster_44 = eco.simhash_hex THEN 'cluster_44'
      WHEN res.cluster_45 = eco.simhash_hex THEN 'cluster_45'
      WHEN res.cluster_46 = eco.simhash_hex THEN 'cluster_46'
      WHEN res.cluster_47 = eco.simhash_hex THEN 'cluster_47'
      WHEN res.cluster_48 = eco.simhash_hex THEN 'cluster_48'
      WHEN res.cluster_49 = eco.simhash_hex THEN 'cluster_49'
      WHEN res.cluster_50 = eco.simhash_hex THEN 'cluster_50'
      WHEN res.cluster_51 = eco.simhash_hex THEN 'cluster_51'
      WHEN res.cluster_52 = eco.simhash_hex THEN 'cluster_52'
      WHEN res.cluster_53 = eco.simhash_hex THEN 'cluster_53'
      WHEN res.cluster_54 = eco.simhash_hex THEN 'cluster_54'
      WHEN res.cluster_55 = eco.simhash_hex THEN 'cluster_55'
      WHEN res.cluster_56 = eco.simhash_hex THEN 'cluster_56'
      WHEN res.cluster_57 = eco.simhash_hex THEN 'cluster_57'
      WHEN res.cluster_58 = eco.simhash_hex THEN 'cluster_58'
      WHEN res.cluster_59 = eco.simhash_hex THEN 'cluster_59'
      WHEN res.cluster_60 = eco.simhash_hex THEN 'cluster_60'
      WHEN res.cluster_61 = eco.simhash_hex THEN 'cluster_61'
      WHEN res.cluster_62 = eco.simhash_hex THEN 'cluster_62'
      WHEN res.cluster_63 = eco.simhash_hex THEN 'cluster_63'
      WHEN res.cluster_64 = eco.simhash_hex THEN 'cluster_64'
      WHEN res.cluster_65 = eco.simhash_hex THEN 'cluster_65'
      WHEN res.cluster_66 = eco.simhash_hex THEN 'cluster_66'
      WHEN res.cluster_67 = eco.simhash_hex THEN 'cluster_67'
  END
    AS slot,
    eco.visit_id,
    SPLIT(eco.visit_id, '_')[OFFSET(0)] as site_id
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cluster_k8` AS res
  JOIN
    `magnetic-signer-465314-q4.server_side_tracking.ecosystem_candidates` AS eco
  ON
    res.cluster_1 = eco.simhash_hex
    OR res.cluster_2 = eco.simhash_hex
    OR res.cluster_3 = eco.simhash_hex
    OR res.cluster_4 = eco.simhash_hex
    OR res.cluster_5 = eco.simhash_hex
    OR res.cluster_6 = eco.simhash_hex
    OR res.cluster_7 = eco.simhash_hex
    OR res.cluster_8 = eco.simhash_hex
    OR res.cluster_9 = eco.simhash_hex
    OR res.cluster_10 = eco.simhash_hex
    OR res.cluster_11 = eco.simhash_hex
    OR res.cluster_12 = eco.simhash_hex
    OR res.cluster_13 = eco.simhash_hex
    OR res.cluster_14 = eco.simhash_hex
    OR res.cluster_15 = eco.simhash_hex
    OR res.cluster_16 = eco.simhash_hex
    OR res.cluster_17 = eco.simhash_hex
    OR res.cluster_18 = eco.simhash_hex
    OR res.cluster_19 = eco.simhash_hex
    OR res.cluster_20 = eco.simhash_hex
    OR res.cluster_21 = eco.simhash_hex
    OR res.cluster_22 = eco.simhash_hex
    OR res.cluster_23 = eco.simhash_hex
    OR res.cluster_24 = eco.simhash_hex
    OR res.cluster_25 = eco.simhash_hex
    OR res.cluster_26 = eco.simhash_hex
    OR res.cluster_27 = eco.simhash_hex
    OR res.cluster_28 = eco.simhash_hex
    OR res.cluster_29 = eco.simhash_hex
    OR res.cluster_30 = eco.simhash_hex
    OR res.cluster_31 = eco.simhash_hex
    OR res.cluster_32 = eco.simhash_hex
    OR res.cluster_33 = eco.simhash_hex
    OR res.cluster_34 = eco.simhash_hex
    OR res.cluster_35 = eco.simhash_hex
    OR res.cluster_36 = eco.simhash_hex
    OR res.cluster_37 = eco.simhash_hex
    OR res.cluster_38 = eco.simhash_hex
    OR res.cluster_39 = eco.simhash_hex
    OR res.cluster_40 = eco.simhash_hex
    OR res.cluster_41 = eco.simhash_hex
    OR res.cluster_42 = eco.simhash_hex
    OR res.cluster_43 = eco.simhash_hex
    OR res.cluster_44 = eco.simhash_hex
    OR res.cluster_45 = eco.simhash_hex
    OR res.cluster_46 = eco.simhash_hex
    OR res.cluster_47 = eco.simhash_hex
    OR res.cluster_48 = eco.simhash_hex
    OR res.cluster_49 = eco.simhash_hex
    OR res.cluster_50 = eco.simhash_hex
    OR res.cluster_51 = eco.simhash_hex
    OR res.cluster_52 = eco.simhash_hex
    OR res.cluster_53 = eco.simhash_hex
    OR res.cluster_54 = eco.simhash_hex
    OR res.cluster_55 = eco.simhash_hex
    OR res.cluster_56 = eco.simhash_hex
    OR res.cluster_57 = eco.simhash_hex
    OR res.cluster_58 = eco.simhash_hex
    OR res.cluster_59 = eco.simhash_hex
    OR res.cluster_60 = eco.simhash_hex
    OR res.cluster_61 = eco.simhash_hex
    OR res.cluster_62 = eco.simhash_hex
    OR res.cluster_63 = eco.simhash_hex
    OR res.cluster_64 = eco.simhash_hex
    OR res.cluster_65 = eco.simhash_hex
    OR res.cluster_66 = eco.simhash_hex
    OR res.cluster_67 = eco.simhash_hex )
SELECT
*,
ARRAY_LENGTH(JSON_EXTRACT_ARRAY(data)) as number_of_site_data
FROM (SELECT
  CLUSTER,
  cluster_size,
  cluster_1,
  cluster_2,
  cluster_3,
  cluster_4,
  cluster_5,
  cluster_6,
  cluster_7,
  cluster_8,
  cluster_9,
  cluster_10,
  cluster_11,
  cluster_12,
  cluster_13,
  cluster_14,
  cluster_15,
  cluster_16,
  cluster_17,
  cluster_18,
  cluster_19,
  cluster_20,
  cluster_21,
  cluster_22,
  cluster_23,
  cluster_24,
  cluster_25,
  cluster_26,
  cluster_27,
  cluster_28,
  cluster_29,
  cluster_30,
  cluster_31,
  cluster_32,
  cluster_33,
  cluster_34,
  cluster_35,
  cluster_36,
  cluster_37,
  cluster_38,
  cluster_39,
  cluster_40,
  cluster_41,
  cluster_42,
  cluster_43,
  cluster_44,
  cluster_45,
  cluster_46,
  cluster_47,
  cluster_48,
  cluster_49,
  cluster_50,
  cluster_51,
  cluster_52,
  cluster_53,
  cluster_54,
  cluster_55,
  cluster_56,
  cluster_57,
  cluster_58,
  cluster_59,
  cluster_60,
  cluster_61,
  cluster_62,
  cluster_63,
  cluster_64,
  cluster_65,
  cluster_66,
  cluster_67,
  ARRAY_AGG(site_id) as visited_sites,
  ARRAY_AGG(visit_id) as visited_pages,
  TO_JSON_STRING(ARRAY_AGG(STRUCT( url AS url,
        top_level_url AS top_level_url,
        cookie_name )
    ORDER BY
      url, top_level_url)) AS DATA,
  TO_JSON_STRING(STRUCT( ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_1', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_1', url, NULL) ) AS cluster_1,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_2', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_2', url, NULL) ) AS cluster_2,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_3', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_3', url, NULL) ) AS cluster_3,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_4', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_4', url, NULL) ) AS cluster_4,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_5', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_5', url, NULL) ) AS cluster_5,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_6', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_6', url, NULL) ) AS cluster_6,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_7', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_7', url, NULL) ) AS cluster_7,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_8', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_8', url, NULL) ) AS cluster_8,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_9', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_9', url, NULL) ) AS cluster_9,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_10', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_10', url, NULL) ) AS cluster_10,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_11', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_11', url, NULL) ) AS cluster_11,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_12', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_12', url, NULL) ) AS cluster_12,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_13', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_13', url, NULL) ) AS cluster_13,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_14', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_14', url, NULL) ) AS cluster_14,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_15', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_15', url, NULL) ) AS cluster_15,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_16', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_16', url, NULL) ) AS cluster_16,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_17', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_17', url, NULL) ) AS cluster_17,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_18', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_18', url, NULL) ) AS cluster_18,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_19', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_19', url, NULL) ) AS cluster_19,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_20', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_20', url, NULL) ) AS cluster_20,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_21', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_21', url, NULL) ) AS cluster_21,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_22', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_22', url, NULL) ) AS cluster_22,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_23', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_23', url, NULL) ) AS cluster_23,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_24', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_24', url, NULL) ) AS cluster_24,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_25', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_25', url, NULL) ) AS cluster_25,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_26', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_26', url, NULL) ) AS cluster_26,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_27', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_27', url, NULL) ) AS cluster_27,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_28', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_28', url, NULL) ) AS cluster_28,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_29', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_29', url, NULL) ) AS cluster_29,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_30', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_30', url, NULL) ) AS cluster_30,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_31', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_31', url, NULL) ) AS cluster_31,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_32', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_32', url, NULL) ) AS cluster_32,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_33', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_33', url, NULL) ) AS cluster_33,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_34', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_34', url, NULL) ) AS cluster_34,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_35', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_35', url, NULL) ) AS cluster_35,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_36', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_36', url, NULL) ) AS cluster_36,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_37', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_37', url, NULL) ) AS cluster_37,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_38', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_38', url, NULL) ) AS cluster_38,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_39', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_39', url, NULL) ) AS cluster_39,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_40', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_40', url, NULL) ) AS cluster_40,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_41', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_41', url, NULL) ) AS cluster_41,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_42', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_42', url, NULL) ) AS cluster_42,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_43', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_43', url, NULL) ) AS cluster_43,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_44', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_44', url, NULL) ) AS cluster_44,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_45', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_45', url, NULL) ) AS cluster_45,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_46', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_46', url, NULL) ) AS cluster_46,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_47', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_47', url, NULL) ) AS cluster_47,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_48', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_48', url, NULL) ) AS cluster_48,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_49', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_49', url, NULL) ) AS cluster_49,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_50', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_50', url, NULL) ) AS cluster_50,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_51', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_51', url, NULL) ) AS cluster_51,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_52', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_52', url, NULL) ) AS cluster_52,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_53', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_53', url, NULL) ) AS cluster_53,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_54', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_54', url, NULL) ) AS cluster_54,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_55', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_55', url, NULL) ) AS cluster_55,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_56', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_56', url, NULL) ) AS cluster_56,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_57', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_57', url, NULL) ) AS cluster_57,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_58', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_58', url, NULL) ) AS cluster_58,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_59', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_59', url, NULL) ) AS cluster_59,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_60', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_60', url, NULL) ) AS cluster_60,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_61', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_61', url, NULL) ) AS cluster_61,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_62', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_62', url, NULL) ) AS cluster_62,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_63', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_63', url, NULL) ) AS cluster_63,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_64', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_64', url, NULL) ) AS cluster_64,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_65', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_65', url, NULL) ) AS cluster_65,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_66', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_66', url, NULL) ) AS cluster_66,
      ARRAY_AGG( DISTINCT
      IF
        (slot = 'cluster_67', url, NULL) IGNORE NULLS
      ORDER BY
      IF
        (slot = 'cluster_67', url, NULL) ) AS cluster_67 )) AS cluster_to_urls,
  ARRAY_AGG(DISTINCT cookie_name) cookies_per_cluster
FROM
  dedup
GROUP BY
  CLUSTER,
  cluster_size,
  cluster_1,
  cluster_2,
  cluster_3,
  cluster_4,
  cluster_5,
  cluster_6,
  cluster_7,
  cluster_8,
  cluster_9,
  cluster_10,
  cluster_11,
  cluster_12,
  cluster_13,
  cluster_14,
  cluster_15,
  cluster_16,
  cluster_17,
  cluster_18,
  cluster_19,
  cluster_20,
  cluster_21,
  cluster_22,
  cluster_23,
  cluster_24,
  cluster_25,
  cluster_26,
  cluster_27,
  cluster_28,
  cluster_29,
  cluster_30,
  cluster_31,
  cluster_32,
  cluster_33,
  cluster_34,
  cluster_35,
  cluster_36,
  cluster_37,
  cluster_38,
  cluster_39,
  cluster_40,
  cluster_41,
  cluster_42,
  cluster_43,
  cluster_44,
  cluster_45,
  cluster_46,
  cluster_47,
  cluster_48,
  cluster_49,
  cluster_50,
  cluster_51,
  cluster_52,
  cluster_53,
  cluster_54,
  cluster_55,
  cluster_56,
  cluster_57,
  cluster_58,
  cluster_59,
  cluster_60,
  cluster_61,
  cluster_62,
  cluster_63,
  cluster_64,
  cluster_65,
  cluster_66,
  cluster_67
ORDER BY
  CLUSTER)
  ;



--- 1.0
SELECT count(distinct cluster) FROM `magnetic-signer-465314-q4.server_side_tracking.tmp_cluster_results`;

--- 1.1
WITH
  per_cluster AS (
  SELECT
    ARRAY_LENGTH(JSON_EXTRACT_ARRAY(DATA, '$')) AS number_of_elements
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cluster` )
SELECT
  AVG(number_of_elements) AS mean,
  MIN(number_of_elements) AS min,
  MAX(number_of_elements) AS max,
  STDDEV(number_of_elements) AS sd,
  APPROX_QUANTILES(number_of_elements, 100)[
OFFSET
  (50)] AS median_approx
FROM
  per_cluster;

--- 1.2
SELECT
  cluster_size,
  COUNT(cluster_size),
  (COUNT(cluster_size) / (
    SELECT
      COUNT(0)
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.cluster`)) * 100 AS percentage
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cluster`
GROUP BY
  cluster_size
ORDER BY
  cluster_size;

--- 1.3
SELECT
  number_of_site_data,
  COUNT(number_of_site_data) c,
  (COUNT(number_of_site_data) / (SELECT
    COUNT(0)
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cluster`))*100 AS percentage
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cluster`
GROUP BY
  number_of_site_data
ORDER BY
  number_of_site_data;

---1.4
SELECT
  SUM(percentage)
FROM (
  SELECT
    number_of_site_data,
    COUNT(number_of_site_data) c,
    (COUNT(number_of_site_data) / (
      SELECT
        COUNT(0)
      FROM
        `magnetic-signer-465314-q4.server_side_tracking.cluster`))*100 AS percentage
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cluster`
  GROUP BY
    number_of_site_data
  ORDER BY
    number_of_site_data)
WHERE
  number_of_site_data > 62;

--- 1.5
    SELECT
  distinct JSON_VALUE(urls, '$.url') script_url
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`,
  UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls;

--- Get all distinct etlds fro Script URLs
SELECT
  distinct cluster,
  NET.REG_DOMAIN(script_url_with_scheme) script_url_etld,
  fp_script
FROM (
  SELECT
    CLUSTER,
    number_of_site_data,
    script_url_with_scheme,
    NET.REG_DOMAIN(script_url_with_scheme) = NET.REG_DOMAIN(top_level_url_with_scheme) AS fp_script
  FROM (
    SELECT
      CLUSTER,
      number_of_site_data,
      CASE
        WHEN REGEXP_CONTAINS(JSON_VALUE(urls, '$.url'), r'^[a-zA-Z][a-zA-Z0-9+\-.]*://') THEN JSON_VALUE(urls, '$.url')
        ELSE CONCAT('http://', JSON_VALUE(urls, '$.url'))
    END
      AS script_url_with_scheme,
      CASE
        WHEN REGEXP_CONTAINS(JSON_VALUE(urls, '$.top_level_url'), r'^[a-zA-Z][a-zA-Z0-9+\-.]*://') THEN JSON_VALUE(urls, '$.top_level_url')
        ELSE CONCAT('http://', JSON_VALUE(urls, '$.top_level_url'))
    END
      AS top_level_url_with_scheme
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.cluster`,
      UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls
    GROUP BY
      CLUSTER,
      number_of_site_data,
      urls))
WHERE
  fp_script = FALSE
ORDER BY
  cluster;

--- 2.0 tp share
SELECT count(distinct cluster) FROM `magnetic-signer-465314-q4.server_side_tracking.cluster` WHERE third_party_script = 0


--- Update Clusters
UPDATE `magnetic-signer-465314-q4.server_side_tracking.cluster` foo
SET foo.attribution = bar.string_field_1
FROM  `magnetic-signer-465314-q4.server_side_tracking.tmp_cluster_attribution` bar
WHERE foo.cluster = bar.string_field_0
AND foo.attribution IS NULL;

---- 2.1: tp clusters attributed
SELECT attribution, count(*) FROM `magnetic-signer-465314-q4.server_side_tracking.cluster_k8` GROUP BY attribution;

---- 2.2: attributed cluster share

SELECT
  distinct JSON_VALUE(urls, '$.url') script_url
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`,
  UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls
WHERE attribution IS NOT NULL;

--- 3.0: Attribution Overview
SELECT attribution, count(*) occurency FROM `magnetic-signer-465314-q4.server_side_tracking.cluster_k8` WHERE attribution IS NOT NULL GROUP BY attribution ORDER BY occurency DESC;

--- 3.1: top 10 attribution
SELECT
  SUM(occurency)
FROM (
  SELECT
    attribution,
    COUNT(*) occurency
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`
  WHERE
    attribution IS NOT NULL
  GROUP BY
    attribution
  ORDER BY
    occurency DESC
  LIMIT
    10)

--- top 10 attribution with site and page share
SELECT
  attribution,
  COUNT(DISTINCT cluster) occurency,
  COUNT(DISTINCT sites) sites#,
 # COUNT(DISTINCT pages) pages
FROM
  (
    SELECT DISTINCT
      attribution,
      cluster,
      sites,
      #pages
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`,
      UNNEST(visited_sites) sites#,
      #UNNEST(visited_pages) pages
    WHERE
      attribution IS NOT NULL
  )
GROUP BY
  attribution
ORDER BY
  occurency DESC
LIMIT
  10
--- update site
UPDATE `magnetic-signer-465314-q4.server_side_tracking.cluster_k8` foo
SET foo.number_of_sites = bar.s
FROM
  (
    SELECT cluster, COUNT(DISTINCT sites) s
    FROM
      (
        SELECT cluster, sites
        FROM
          `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`,
          UNNEST(visited_sites) sites
      )
    GROUP BY cluster
  ) as bar
WHERE foo.cluster = bar.cluster


----4.0: Profile related
WITH
  raw_data AS (
    SELECT
      t.cluster,
      t.cluster_size,
      JSON_VALUE(elem, '$.browser_id') AS browser_id,
      JSON_VALUE(elem, '$.script_url') AS script_url,
      JSON_VALUE(elem, '$.top_level_url') AS top_level_url
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.cluster_k8` AS t,
      UNNEST(t.profile_data) AS pd,
      UNNEST(JSON_EXTRACT_ARRAY(pd)) AS elem
  )
SELECT
  cluster,
  cluster_size,
  countif(browser_id = 'openwpm_native_eu_1_omaticall') AS eu1,
  countif(browser_id = 'openwpm_native_eu_2_omaticall') AS eu2,
  countif(browser_id = 'openwpm_native_us_1_omaticall') AS us1,
  countif(browser_id = 'openwpm_native_us_2_omaticall') AS us2
FROM raw_data
GROUP BY cluster, cluster_size
ORDER BY cluster
