--- 0.0: Build data
CREATE OR REPLACE TABLE `magnetic-signer-465314-q4.server_side_tracking.top_10_cluster` AS
SELECT
  *
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cluster`
ORDER BY
  number_of_site_data DESC
LIMIT 10;


---1.0: Get distincct URLs
SELECT
  DISTINCT url
FROM (
  SELECT
    JSON_VALUE(urls, '$.url') AS url
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.top_10_cluster`,
    UNNEST(JSON_EXTRACT_ARRAY(DATA)) urls);


--- List top cluster
SELECT
  *
FROM
  `magnetic-signer-465314-q4.server_side_tracking.top_10_cluster`
ORDER BY
  number_of_site_data DESC;

--- Get Script URLs and Top-Level URLs
SELECT
  JSON_VALUE(urls, '$.top_level_etld') AS top_level_etld,
  JSON_VALUE(urls, '$.script_url') AS script_url,
FROM
  `magnetic-signer-465314-q4.server_side_tracking.top_10_cluster`,
  UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls
WHERE
  data_size = 39757;


---- Check FP status
DECLARE sizes ARRAY<INT64> DEFAULT [
187050,
88790,
60830,
45150,
35446,
33904,
32033,
30876,
29375,
25522
];

FOR sz IN (
  SELECT s AS v FROM UNNEST(sizes) AS s
) DO
  WITH url_data AS (
    SELECT
      COALESCE(LOWER(NET.REG_DOMAIN(NET.HOST(url_with_scheme))) = LOWER(top_level_etld), FALSE) AS fp
    FROM (
      SELECT
        JSON_VALUE(urls, '$.top_level_etld') AS top_level_etld,
        JSON_VALUE(urls, '$.script_url')     AS script_url,
        CASE
          WHEN REGEXP_CONTAINS(JSON_VALUE(urls, '$.script_url'), r'^[a-zA-Z][a-zA-Z0-9+\-.]*://')
            THEN JSON_VALUE(urls, '$.script_url')
          ELSE CONCAT('http://', JSON_VALUE(urls, '$.script_url'))
        END AS url_with_scheme
      FROM `magnetic-signer-465314-q4.server_side_tracking.top_10_cluster`,
           UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls
      WHERE data_size = sz.v
    )
  )
  SELECT
    sz.v AS data_size,
    fp,
    COUNT(*) AS cnt
  FROM url_data
  GROUP BY data_size, fp
  ORDER BY fp;
END FOR;

---- sites
DECLARE sizes ARRAY<INT64> DEFAULT [
  39757,
  36650,
  35659,
  31577,
  28845,
  27192,
  20557,
  20355,
  19292,
  19097
];

FOR sz IN (
  SELECT s AS v
  FROM UNNEST(sizes) AS s
) DO
  SELECT
    sz.v AS data_size,
    COUNT(DISTINCT top_level_etld) AS distinct_etlds
  FROM (
    SELECT
      JSON_VALUE(urls, '$.top_level_etld') AS top_level_etld,
      JSON_VALUE(urls, '$.script_url') AS script_url
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.top_10_cluster`,
      UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls
    WHERE
      data_size = sz.v
  );
END FOR;

--- pages
DECLARE sizes ARRAY<INT64> DEFAULT [
  39757,
  36650,
  35659,
  31577,
  28845,
  27192,
  20557,
  20355,
  19292,
  19097
];

FOR sz IN (
  SELECT s AS v
  FROM UNNEST(sizes) AS s
) DO
WITH
  top_level_url_data AS (
  SELECT
    JSON_VALUE(urls, '$.top_level_etld') AS top_level_etld,
    JSON_VALUE(urls, '$.script_url') AS script_url
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.top_10_cluster`,
    UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls
  WHERE
    data_size = sz.v),
  pages AS (
  SELECT
    browser_id,
    visit_id AS visited_subpage
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.requests`
  WHERE
    top_level_etld IN (
    SELECT
      DISTINCT top_level_etld
    FROM
      top_level_url_data))
SELECT
  count(distinct pages.visited_subpage)
FROM
  pages;
END FOR;


--- distinct JavaScripts
DECLARE
  sizes ARRAY<INT64> DEFAULT [ 39757,
  36650,
  35659,
  31577,
  28845,
  27192,
  20557,
  20355,
  19292,
  19097 ]; FOR sz IN (
  SELECT
    s AS v
  FROM
    UNNEST(sizes) AS s ) DO
SELECT
  COUNT(DISTINCT script_url)
FROM (
  SELECT
    JSON_VALUE(urls, '$.top_level_etld') AS top_level_etld,
    JSON_VALUE(urls, '$.script_url') AS script_url
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.top_10_cluster`,
    UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls
  WHERE
    data_size = sz);
END
  FOR;

--- top etld in tracking scripts
DECLARE
  sizes ARRAY<INT64> DEFAULT [ 39757,
  36650,
  35659,
  31577,
  28845,
  27192,
  20557,
  20355,
  19292,
  19097 ]; FOR sz IN (
  SELECT
    s AS v
  FROM
    UNNEST(sizes) AS s ) DO
WITH
  url_data AS (
  SELECT
    script_url,
    COALESCE(LOWER(NET.REG_DOMAIN(NET.HOST(url_with_scheme))) = LOWER(top_level_etld), FALSE) AS fp
  FROM (
    SELECT
      JSON_VALUE(urls, '$.top_level_etld') AS top_level_etld,
      JSON_VALUE(urls, '$.script_url') AS script_url,
      CASE
        WHEN REGEXP_CONTAINS(JSON_VALUE(urls, '$.script_url'), r'^[a-zA-Z][a-zA-Z0-9+\-.]*://') THEN JSON_VALUE(urls, '$.script_url')
        ELSE CONCAT('http://', JSON_VALUE(urls, '$.script_url'))
    END
      AS url_with_scheme
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.top_10_cluster`,
      UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls
    WHERE
      data_size = sz.v ) )
SELECT
  s_u,
  COUNT(*) c
FROM (
  SELECT
    NET.REG_DOMAIN(script_url) s_u
  FROM (
    SELECT
      *
    FROM
      url_data
    WHERE
      fp = FALSE))
GROUP BY
  s_u
ORDER BY
  c DESC;
END
  FOR;

--- total google
  WITH
  url_data AS (
  SELECT
    script_url,
    COALESCE(LOWER(NET.REG_DOMAIN(NET.HOST(url_with_scheme))) = LOWER(top_level_etld), FALSE) AS fp
  FROM (
    SELECT
      JSON_VALUE(urls, '$.top_level_etld') AS top_level_etld,
      JSON_VALUE(urls, '$.script_url') AS script_url,
      CASE
        WHEN REGEXP_CONTAINS(JSON_VALUE(urls, '$.script_url'), r'^[a-zA-Z][a-zA-Z0-9+\-.]*://') THEN JSON_VALUE(urls, '$.script_url')
        ELSE CONCAT('http://', JSON_VALUE(urls, '$.script_url'))
    END
      AS url_with_scheme
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.top_10_cluster`,
      UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls) ),
  all_data AS (
  SELECT
    s_u,
    COUNT(*) c
  FROM (
    SELECT
      NET.REG_DOMAIN(script_url) s_u
    FROM (
      SELECT
        *
      FROM
        url_data
      WHERE
        fp = FALSE))
  GROUP BY
    s_u
  ORDER BY
    c DESC),
  sum_data AS (
  SELECT
    SUM(c) s
  FROM (
    SELECT
      c
    FROM
      all_data) )
SELECT
  (SUM(c) / s)*100 as percentage_of_google_etlds
FROM (
  SELECT
    s_u,
    c,
    s
  FROM
    all_data,
    sum_data
  WHERE
    s_u LIKE '%google%'
  GROUP BY
    s_u,
    c,
    s)
    GROUP BY s;

--- total scripts:
DECLARE
  sizes ARRAY<INT64> DEFAULT [ 39757,
  36650,
  35659,
  31577,
  28845,
  27192,
  20557,
  20355,
  19292,
  19097 ]; FOR sz IN (
  SELECT
    s AS v
  FROM
    UNNEST(sizes) AS s ) DO
SELECT
  tracking_etld,
  COUNT(*) c
FROM (
  SELECT
    LOWER(NET.REG_DOMAIN(NET.HOST(url_with_scheme))) tracking_etld
  FROM (
    SELECT
      JSON_VALUE(urls, '$.top_level_etld') AS top_level_etld,
      JSON_VALUE(urls, '$.script_url') AS script_url,
      CASE
        WHEN REGEXP_CONTAINS(JSON_VALUE(urls, '$.script_url'), r'^[a-zA-Z][a-zA-Z0-9+\-.]*://') THEN JSON_VALUE(urls, '$.script_url')
        ELSE CONCAT('http://', JSON_VALUE(urls, '$.script_url'))
    END
      AS url_with_scheme
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.top_10_cluster`,
      UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls
    WHERE
      data_size = sz.v))
GROUP BY
  tracking_etld
ORDER BY
  c DESC;
END
  FOR;


  ------ TABLE
  WITH
  req_data AS (
  SELECT
    browser_id,
    visit_id AS visited_subpage
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.requests`)
SELECT
  number_of_scripts,
  CLUSTER,
  COUNT(DISTINCT top_level_etld) AS sites,
  "" AS pages,
  COUNTIF(fp=TRUE) first_party,
  COUNTIF(fp=FALSE) third_party,
  COUNT(DISTINCT script_url) AS unique_script_urls
FROM ( (
    SELECT
      *,
      COALESCE(LOWER(NET.REG_DOMAIN(NET.HOST(script_url_with_scheme))) = LOWER(NET.REG_DOMAIN(top_level_url_with_scheme)), FALSE) AS fp,

    FROM (
      SELECT
        number_of_site_data AS CLUSTER,
        cluster_size AS number_of_scripts,
        NET.REG_DOMAIN(JSON_VALUE(urls, '$.top_level_url')) AS top_level_etld,
        JSON_VALUE(urls, '$.url') AS script_url,
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
        `magnetic-signer-465314-q4.server_side_tracking.top_10_cluster`,
        UNNEST(JSON_EXTRACT_ARRAY(DATA)) urls )))
GROUP BY
  CLUSTER,
  number_of_scripts
ORDER BY
  CLUSTER DESC;

--- Pages
DECLARE sizes ARRAY<INT64> DEFAULT [
180419,
121947,
78915,
77918,
73910,
54318,
50187,
43323,
23819,
20001,
];

FOR sz IN (
  SELECT s AS v
  FROM UNNEST(sizes) AS s
) DO
WITH
  top_level_url_data AS (
  SELECT
    CASE
      WHEN REGEXP_CONTAINS(JSON_VALUE(urls, '$.top_level_url'), r'^[a-zA-Z][a-zA-Z0-9+\-.]*://') THEN JSON_VALUE(urls, '$.top_level_url')
      ELSE CONCAT('http://', JSON_VALUE(urls, '$.top_level_url'))
  END
    AS top_level_etld
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.top_10_cluster`,
    UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls
  WHERE
    number_of_site_data = sz.v),
  pages AS (
  SELECT
    browser_id,
    visit_id AS visited_subpage
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.requests`
  WHERE
    top_level_etld IN (
    SELECT
      DISTINCT NET.REG_DOMAIN(top_level_etld)
    FROM
      top_level_url_data))
SELECT
sz,
  COUNT(DISTINCT pages.visited_subpage)
FROM
  pages ;
END FOR;


--- 1.1 tp share
SELECT
  fp_share,
  fp_share / (fp_share+tp_share) fp_share_in_percent,
  tp_share,
  tp_share / (fp_share+tp_share) tp_share_in_percent
FROM (
  SELECT
    SUM(first_party_script) fp_share,
    SUM(third_party_script) tp_share
  FROM (
    SELECT
      CLUSTER,
      first_party_script,
      third_party_script
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.top_10_cluster`));


--- get distinct etlds from script urls
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
      `magnetic-signer-465314-q4.server_side_tracking.top_10_cluster`,
      UNNEST(JSON_EXTRACT_ARRAY(DATA)) AS urls
    GROUP BY
      CLUSTER,
      number_of_site_data,
      urls))
WHERE
  fp_script = FALSE
ORDER BY
  cluster


---- new table:
SELECT
  "" AS attribution,
  number_of_scripts AS scripts,
  COUNT(DISTINCT script_url) AS unique_script_urls,
  size,
  sites,
  pages,
  COUNTIF(fp=TRUE) first_party,
  COUNTIF(fp=FALSE) third_party,
  cookies
FROM ( (
    SELECT
      *,
      COALESCE(LOWER(NET.REG_DOMAIN(NET.HOST(script_url_with_scheme))) = LOWER(NET.REG_DOMAIN(top_level_url_with_scheme)), FALSE) AS fp,
    FROM (
      SELECT
        number_of_site_data AS size,
        cluster_size AS number_of_scripts,
        NET.REG_DOMAIN(JSON_VALUE(urls, '$.top_level_url')) AS top_level_etld,
        JSON_VALUE(urls, '$.url') AS script_url,
        CASE
          WHEN REGEXP_CONTAINS(JSON_VALUE(urls, '$.url'), r'^[a-zA-Z][a-zA-Z0-9+\-.]*://') THEN JSON_VALUE(urls, '$.url')
          ELSE CONCAT('http://', JSON_VALUE(urls, '$.url'))
      END
        AS script_url_with_scheme,
        CASE
          WHEN REGEXP_CONTAINS(JSON_VALUE(urls, '$.top_level_url'), r'^[a-zA-Z][a-zA-Z0-9+\-.]*://') THEN JSON_VALUE(urls, '$.top_level_url')
          ELSE CONCAT('http://', JSON_VALUE(urls, '$.top_level_url'))
      END
        AS top_level_url_with_scheme,
        ARRAY_LENGTH(cookies_per_cluster) as cookies,
        number_of_visited_sites as sites,
        number_of_visited_pages as pages
      FROM
        `magnetic-signer-465314-q4.server_side_tracking.top_10_cluster_k8`,
        UNNEST(JSON_EXTRACT_ARRAY(DATA)) urls )))
GROUP BY
  attribution,
  size,
  sites,
  pages,
  number_of_scripts,
  cookies
ORDER BY
  size DESC;


--- 3.0: comparing to total
SELECT
  COUNT(DISTINCT sites) number_of_sites
FROM
  `magnetic-signer-465314-q4.server_side_tracking.top_10_cluster_k8`,
  UNNEST(visited_sites) sites;

SELECT
  COUNT(DISTINCT pages) number_of_pages
FROM
  `magnetic-signer-465314-q4.server_side_tracking.top_10_cluster_k8`,
  UNNEST(visited_pages) pages;

SELECT
  COUNT(DISTINCT sites) number_of_sites
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`,
  UNNEST(visited_sites) sites;

SELECT
  COUNT(DISTINCT pages) number_of_pages
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`,
  UNNEST(visited_pages) pages;


--- table accross al profiles
WITH
  total_requests AS (
    SELECT SUM(number_of_site_data) AS total_requests,
    FROM `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`
  ),
  total_cookies AS (
    SELECT COUNT(cookies) total_cookies
    FROM
      (
        SELECT DISTINCT cookies
        FROM
          `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`,
          UNNEST(cookies_per_cluster) cookies
      )
  ),
  total_sites AS (
    SELECT COUNT(sites) total_sites
    FROM
      (
        SELECT DISTINCT sites
        FROM
          `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`,
          UNNEST(visited_sites) sites
      )
  ),
  total_pages AS (
    SELECT COUNT(pages) total_pages
    FROM
      (
        SELECT DISTINCT pages
        FROM
          `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`,
          UNNEST(visited_pages) pages
      )
  ),
  total_fp_requests AS (
    SELECT SUM(first_party_script) total_fp_requests
    FROM `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`
  ),
  total_tp_requests AS (
    SELECT SUM(third_party_script) total_tp_requests
    FROM `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`
  ),
  total_script_urls AS (
    SELECT COUNT(script_url) total_script_urls
    FROM
      (
        SELECT DISTINCT JSON_VALUE(urls, '$.url') AS script_url
        FROM
          `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`,
          UNNEST(JSON_EXTRACT_ARRAY(DATA)) urls
      )
  )
SELECT
  total_sites,
  total_pages,
  total_cookies,
  total_script_urls,
  total_requests,
  total_fp_requests,
  total_tp_requests
FROM
  total_sites,
  total_pages,
  total_requests,
  total_cookies,
  total_fp_requests,
  total_tp_requests,
  total_script_urls
