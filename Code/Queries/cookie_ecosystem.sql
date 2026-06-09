--- 1.0
    SELECT
  MIN(number_of_cookies) min,
  MAX(number_of_cookies) max,
  AVG(number_of_cookies) mean,
  STDDEV(number_of_cookies) SD,
  APPROX_QUANTILES(number_of_cookies, 100)[
OFFSET
  (50)] AS median_approx
FROM (
  SELECT
    ARRAY_LENGTH(cookies_per_cluster) number_of_cookies
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`)


--- 1.1
SELECT
  cookie,
  COUNT(cluster_id) in_cluster
FROM (
  SELECT
    cluster_id,
    cookie
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cookie_cluster`,
    UNNEST(cookies) AS cookie)
GROUP BY
  cookie
ORDER BY in_cluster DESC;

--- 1.2: Cluster with more than one cookie
SELECT COUNT(*)
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`
WHERE ARRAY_LENGTH(cookies_per_cluster) > 1;

---- 1.3: cookies in clusters with one cookie
    SELECT cookie, count(cluster) c, (count(cluster)/24914)*100 FROM (SELECT cluster, cookie
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`,
  UNNEST(cookies_per_cluster) cookie
WHERE ARRAY_LENGTH(cookies_per_cluster) = 1) GROUP BY cookie order by c desc;

--- 1.4: cluster with one cookie w/o tp scripts
    SELECT count(cluster) FROM (
    SELECT DISTINCT
      cluster, cluster_size, cookie, third_party_script, first_party_script
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`,
      UNNEST(cookies_per_cluster) cookie
    WHERE ARRAY_LENGTH(cookies_per_cluster) = 1
    ORDER BY cluster_size DESC) WHERE third_party_script = 0


--- 1.4.1: cluster with one cookie w/o fp scripts
    SELECT count(distinct cluster) FROM (SELECT DISTINCT
  cluster, cluster_size, cookie, third_party_script, first_party_script
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`,
  UNNEST(cookies_per_cluster) cookie
WHERE ARRAY_LENGTH(cookies_per_cluster) = 1
ORDER BY cluster_size DESC)
WHERE first_party_script = 0


--- 1.5: Cluster with more than one cookie w/o tp scripts
        SELECT c, (c/24914)*100 FROM (SELECT count(distinct cluster) c FROM (
    SELECT DISTINCT
      cluster, cluster_size, cookie, third_party_script, first_party_script
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`,
      UNNEST(cookies_per_cluster) cookie
    WHERE ARRAY_LENGTH(cookies_per_cluster) > 1
    ORDER BY cluster_size DESC) WHERE third_party_script = 0)

--- 1.6: differnece b/t third and first-party scripts
    SELECT avg(difference_bt_tp_fp)
FROM
  (
    SELECT *, SAFE_DIVIDE(tp_occurency, fp_occurency) difference_bt_tp_fp
    FROM
      (
        SELECT
          cookie,
          COUNTIF(dominance = "tp_dominant") tp_occurency,
          COUNTIF(dominance = "fp_dominant") fp_occurency
        FROM
          (
            SELECT
              cluster,
              cookie,
              CASE
                WHEN third_party_script > first_party_script
                  THEN "tp_dominant"
                ELSE "fp_dominant"
                END AS dominance
            FROM
              `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`,
              UNNEST(cookies_cleaned_1) cookie
            WHERE ARRAY_LENGTH(cookies_cleaned_1) > 1
          )
        GROUP BY cookie
      )
  )

---- 1.6: removing id from cookkie name
    SELECT sum(diff)
FROM
  (
    SELECT *, (raw - cleaned) AS diff
    FROM
      (
        SELECT
          cluster,
          ARRAY_LENGTH(cookies_per_cluster) raw,
          ARRAY_LENGTH(cookies_cleaned_1) cleaned
        FROM `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`
      )
  )

--- 1.7: cluster size with one cookie
    SELECT cluster_size, count(distinct cluster) c FROM (SELECT distinct cluster, cookie, cluster_size
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`,
  UNNEST(cookies_cleaned_1) cookie
WHERE ARRAY_LENGTH(cookies_per_cluster) = 1) GROUP BY cluster_size ORDER BY c;




--- 1.8: cluster with more than one cookie and tp+fp scripts
    SELECT count(DISTINCT cluster)
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`
    WHERE
      ARRAY_LENGTH(cookies_per_cluster) > 1
      AND third_party_script != 0
      AND first_party_script != 0


---- 1.9 Number of Sites and Pages w/ one cookie
    SELECT COUNT(DISTINCT sites) total_sites, COUNT(DISTINCT pages) total_pages
FROM
  (
    SELECT DISTINCT cluster, sites, pages
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`,
      UNNEST(visited_sites) sites,
      UNNEST(visited_pages) pages
    WHERE
      ARRAY_LENGTH(cookies_per_cluster) = 1
      AND third_party_script != 0
      AND first_party_script != 0
  )
--- 1.9.1
SELECT COUNT(DISTINCT sites) total_sites, COUNT(DISTINCT pages) total_pages
FROM
  (
    SELECT DISTINCT cluster, sites, pages
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`,
      UNNEST(visited_sites) sites,
      UNNEST(visited_pages) pages
    WHERE
      ARRAY_LENGTH(cookies_per_cluster) = 1
  )


---- 2.0 Number of Sites and Pages w/ more cookies
SELECT COUNT(DISTINCT sites) total_sites
FROM
  (
    SELECT DISTINCT cluster, sites
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`,
      UNNEST(visited_sites) sites
    WHERE
      ARRAY_LENGTH(cookies_per_cluster) > 1
      AND third_party_script != 0
      AND first_party_script != 0
  ),
SELECT COUNT(DISTINCT pages) total_pages
FROM
  (
    SELECT DISTINCT cluster, pages
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`,
      UNNEST(visited_pages) pages
    WHERE
      ARRAY_LENGTH(cookies_per_cluster) > 1
      AND third_party_script != 0
      AND first_party_script != 0
  )





--- Create data
CREATE OR REPLACE TABLE `magnetic-signer-465314-q4.server_side_tracking.cookie_cluster` AS
SELECT
  cluster_id,
  ARRAY_AGG(DISTINCT cookies
  ORDER BY
    cookies) AS cookies
FROM (
  SELECT
    CLUSTER AS cluster_id,
    cookies
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cluster_test`,
    UNNEST(cookies_per_cluster) cookies)
GROUP BY
  cluster_id;

--- Top Cookie Pairs
WITH combos AS (
  SELECT
    a AS cookie1,
    b AS cookie2
  FROM  `magnetic-signer-465314-q4.server_side_tracking.cookie_cluster`,
  UNNEST(cookies) AS a WITH OFFSET i
  JOIN UNNEST(cookies) AS b WITH OFFSET j
    ON j > i
)
SELECT
  cookie1,
  cookie2,
  COUNT(*) AS cluster_count
FROM combos
GROUP BY cookie1, cookie2;

--- Top Triplets
WITH combos AS (
  SELECT
    a AS cookie1,
    b AS cookie2,
    c AS cookie3
  FROM `magnetic-signer-465314-q4.server_side_tracking.cookie_cluster`,
  UNNEST(cookies) AS a WITH OFFSET i
  JOIN UNNEST(cookies) AS b WITH OFFSET j ON j > i
  JOIN UNNEST(cookies) AS c WITH OFFSET k ON k > j
)
SELECT
  cookie1, cookie2, cookie3,
  COUNT(*) AS cluster_count
FROM combos
GROUP BY cookie1, cookie2, cookie3
ORDER BY cluster_count DESC, cookie1, cookie2, cookie3;







--- Create Data Ground for quadruplets and triplets
-- ============================================
-- Parameter
-- ============================================
DECLARE DS STRING DEFAULT 'magnetic-signer-465314-q4.server_side_tracking';
DECLARE SRC_TABLE STRING DEFAULT FORMAT('%s.cookie_cluster', DS);  -- cluster_id STRING, cookies ARRAY<STRING>

-- Mindest-Supports (# unterschiedlicher Cluster)
DECLARE MIN_COOKIE_SUPPORT INT64 DEFAULT 1000;   -- Singles
DECLARE MIN_PAIR_SUPPORT   INT64 DEFAULT 500;    -- Paare
DECLARE MIN_TRIP_SUPPORT   INT64 DEFAULT 200;    -- Triplets
DECLARE MIN_QUAD_SUPPORT   INT64 DEFAULT 100;    -- Quadruplets (optional)

-- Max. Clustergröße zur Vermeidung der Kombinations-Explosion
DECLARE MAX_CLUSTER_SIZE   INT64 DEFAULT 200;

-- ============================================
-- 0) Stage: pro Cluster eindeutige Cookies (dedupliziert, gekappt)
-- ============================================
EXECUTE IMMEDIATE FORMAT('DROP TABLE IF EXISTS `%s._cookies_per_cluster`', DS);

EXECUTE IMMEDIATE FORMAT("""
  CREATE TABLE `%s._cookies_per_cluster`
  CLUSTER BY cluster_id AS
  WITH cleaned AS (
    SELECT cluster_id, cookie
    FROM `%s`
    CROSS JOIN UNNEST(cookies) AS cookie
    WHERE cookie IS NOT NULL AND cookie != ''
  ),
  per AS (
    SELECT
      cluster_id,
      ARRAY_AGG(DISTINCT cookie ORDER BY cookie) AS cookies
    FROM cleaned
    GROUP BY cluster_id
  )
  SELECT *
  FROM per
  ---WHERE ARRAY_LENGTH(cookies) BETWEEN 2 AND %d
""", DS, SRC_TABLE, MAX_CLUSTER_SIZE);

-- ============================================
-- 0b) Invertierter Index: Cookie → Cluster
-- ============================================
EXECUTE IMMEDIATE FORMAT('DROP TABLE IF EXISTS `%s._cookie_to_cluster`', DS);

EXECUTE IMMEDIATE FORMAT("""
  CREATE TABLE `%s._cookie_to_cluster`
  CLUSTER BY cookie AS
  SELECT
    cookie,
    cluster_id
  FROM `%s._cookies_per_cluster`,
  UNNEST(cookies) AS cookie
""", DS, DS);

-- ============================================
-- 1) Singles: Cookie-Support (Clusterzählung je Cookie)
-- ============================================
EXECUTE IMMEDIATE FORMAT('DROP TABLE IF EXISTS `%s.cookie_support`', DS);

EXECUTE IMMEDIATE FORMAT("""
  CREATE TABLE `%s.cookie_support`
  CLUSTER BY cookie AS
  SELECT
    cookie,
    COUNT(DISTINCT cluster_id) AS cluster_count
  FROM `%s._cookie_to_cluster`
  GROUP BY cookie
  ---HAVING cluster_count >= %d
""", DS, DS, MIN_COOKIE_SUPPORT);

-- ============================================
-- 2) Häufige Paare (nur aus häufigen Singles)
-- ============================================
EXECUTE IMMEDIATE FORMAT('DROP TABLE IF EXISTS `%s.cookie_pairs`', DS);

EXECUTE IMMEDIATE FORMAT("""
  CREATE TABLE `%s.cookie_pairs`
  CLUSTER BY cookie1, cookie2 AS
  WITH pairs AS (
    SELECT
      p.cluster_id,
      a AS cookie1,
      b AS cookie2
    FROM `%s._cookies_per_cluster` p,
    UNNEST(p.cookies) AS a WITH OFFSET i
    JOIN UNNEST(p.cookies) AS b WITH OFFSET j ON j > i
    JOIN `%s.cookie_support` s1 ON s1.cookie = a
    JOIN `%s.cookie_support` s2 ON s2.cookie = b
  )
  SELECT
    cookie1,
    cookie2,
    COUNT(DISTINCT cluster_id) AS cluster_count
  FROM pairs
  GROUP BY cookie1, cookie2
  HAVING cluster_count >= %d
""", DS, DS, DS, DS, MIN_PAIR_SUPPORT);

-- ============================================
-- 3) Triplet-Kandidaten via Apriori: (x,y) ⋈ (x,z) → (x,y,z), y<z
-- ============================================
EXECUTE IMMEDIATE FORMAT('DROP TABLE IF EXISTS `%s.cookie_triplet_candidates`', DS);

EXECUTE IMMEDIATE FORMAT("""
  CREATE TABLE `%s.cookie_triplet_candidates` AS
  SELECT
    p1.cookie1 AS c1,
    p1.cookie2 AS c2,
    p2.cookie2 AS c3
  FROM `%s.cookie_pairs` p1
  JOIN `%s.cookie_pairs` p2
    ON p1.cookie1 = p2.cookie1
  WHERE p1.cookie2 < p2.cookie2
""", DS, DS, DS);

-- ============================================
-- 4) Triplets zählen (Mengen-Intersektion über invertierten Index)
-- ============================================
EXECUTE IMMEDIATE FORMAT('DROP TABLE IF EXISTS `%s.cookie_triplets`', DS);

EXECUTE IMMEDIATE FORMAT("""
  CREATE TABLE `%s.cookie_triplets`
  CLUSTER BY cookie1, cookie2, cookie3 AS
  SELECT
    t.c1 AS cookie1,
    t.c2 AS cookie2,
    t.c3 AS cookie3,
    COUNT(*) AS cluster_count
  FROM `%s.cookie_triplet_candidates` t
  JOIN `%s._cookie_to_cluster` i1 ON i1.cookie = t.c1
  JOIN `%s._cookie_to_cluster` i2
    ON i2.cookie = t.c2 AND i2.cluster_id = i1.cluster_id
  JOIN `%s._cookie_to_cluster` i3
    ON i3.cookie = t.c3 AND i3.cluster_id = i1.cluster_id
  GROUP BY cookie1, cookie2, cookie3
  HAVING cluster_count >= %d
""", DS, DS, DS, DS, DS, MIN_TRIP_SUPPORT);

-- ============================================
-- 5) (Optional) Quadruplet-Kandidaten: (a,b,c) ⋈ (a,b,d) → (a,b,c,d), c<d
-- ============================================
EXECUTE IMMEDIATE FORMAT('DROP TABLE IF EXISTS `%s.cookie_quad_candidates`', DS);

EXECUTE IMMEDIATE FORMAT("""
  CREATE TABLE `%s.cookie_quad_candidates` AS
  SELECT
    t1.cookie1 AS a,
    t1.cookie2 AS b,
    t1.cookie3 AS c,
    t2.cookie3 AS d
  FROM `%s.cookie_triplets` t1
  JOIN `%s.cookie_triplets` t2
    ON t1.cookie1 = t2.cookie1
   AND t1.cookie2 = t2.cookie2
  WHERE t1.cookie3 < t2.cookie3
""", DS, DS, DS);

-- ============================================
-- 6) (Optional) Quadruplets zählen (4-fache Intersektion)
-- ============================================
EXECUTE IMMEDIATE FORMAT('DROP TABLE IF EXISTS `%s.cookie_quadruplets`', DS);

EXECUTE IMMEDIATE FORMAT("""
  CREATE TABLE `%s.cookie_quadruplets`
  CLUSTER BY cookie1, cookie2, cookie3, cookie4 AS
  SELECT
    q.a AS cookie1,
    q.b AS cookie2,
    q.c AS cookie3,
    q.d AS cookie4,
    COUNT(*) AS cluster_count
  FROM `%s.cookie_quad_candidates` q
  JOIN `%s._cookie_to_cluster` i1 ON i1.cookie = q.a
  JOIN `%s._cookie_to_cluster` i2
    ON i2.cookie = q.b AND i2.cluster_id = i1.cluster_id
  JOIN `%s._cookie_to_cluster` i3
    ON i3.cookie = q.c AND i3.cluster_id = i1.cluster_id
  JOIN `%s._cookie_to_cluster` i4
    ON i4.cookie = q.d AND i4.cluster_id = i1.cluster_id
  GROUP BY cookie1, cookie2, cookie3, cookie4
  HAVING cluster_count >= %d
""",
  DS,  -- %s.cookie_quadruplets
  DS,  -- %s.cookie_quad_candidates
  DS,  -- %s._cookie_to_cluster (i1)
  DS,  -- %s._cookie_to_cluster (i2)
  DS,  -- %s._cookie_to_cluster (i3)
  DS,  -- %s._cookie_to_cluster (i4)
  MIN_QUAD_SUPPORT  -- %d
);


----- Get pairs
 CREATE OR REPLACE TABLE `magnetic-signer-465314-q4.server_side_tracking._cookies_per_cluster`
  CLUSTER BY cluster_id AS
  WITH cleaned AS (
    SELECT cluster, cookie
    FROM `magnetic-signer-465314-q4.server_side_tracking.cookie_cluster`
    WHERE cookie IS NOT NULL AND cookie != ''
  ),
  per AS (
    SELECT
      cluster_id,
      ARRAY_AGG(DISTINCT cookie ORDER BY cookie) AS cookies
    FROM cleaned
    GROUP BY cluster_id
  )
  SELECT *
  FROM per;

CREATE OR REPLACE TABLE `magnetic-signer-465314-q4.server_side_tracking._cookie_to_cluster`
  CLUSTER BY cookie AS
  SELECT
    cookie,
    cluster_id
  FROM `magnetic-signer-465314-q4.server_side_tracking._cookies_per_cluster`,
  UNNEST(cookies) AS cookie;

CREATE OR REPLACE TABLE `magnetic-signer-465314-q4.server_side_tracking.cookie_support`
  CLUSTER BY cookie AS
  SELECT
    cookie,
    COUNT(DISTINCT cluster_id) AS cluster_count
  FROM `magnetic-signer-465314-q4.server_side_tracking._cookie_to_cluster`
  GROUP BY cookie;


  CREATE OR REPLACE TABLE `magnetic-signer-465314-q4.server_side_tracking.cookie_pairs`
  CLUSTER BY cookie1, cookie2 AS
  WITH pairs AS (
    SELECT
      p.cluster_id,
      a AS cookie1,
      b AS cookie2
    FROM `magnetic-signer-465314-q4.server_side_tracking._cookies_per_cluster` p,
    UNNEST(p.cookies) AS a WITH OFFSET i
    JOIN UNNEST(p.cookies) AS b WITH OFFSET j ON j > i
    JOIN `magnetic-signer-465314-q4.server_side_tracking.cookie_support` s1 ON s1.cookie = a
    JOIN `magnetic-signer-465314-q4.server_side_tracking.cookie_support` s2 ON s2.cookie = b
  )
  SELECT
    cookie1,
    cookie2,
    COUNT(DISTINCT cluster_id) AS cluster_count
  FROM pairs
  GROUP BY cookie1, cookie2;

---- Create table top 10 pairs
SELECT *
FROM `magnetic-signer-465314-q4.server_side_tracking.cookie_pairs`
ORDER BY cluster_count DESC
LIMIT 10


---- calc sites

WITH cookie_pairs AS (
  SELECT 1 AS pair_id, '_ga' AS c1, '_gcl_au' AS c2 UNION ALL
  SELECT 2, '_fbp', '_ga' UNION ALL
  SELECT 3, 'OptanonConsent', '_gcl_au' UNION ALL
  SELECT 4, '_fbp', '_gcl_au' UNION ALL
  SELECT 5, 'OptanonConsent', '_ga' UNION ALL
  SELECT 6, 'AMCV', '_gcl_au' UNION ALL
  SELECT 7, 'AWSALB', '_gcl_au' UNION ALL
  SELECT 8, '_abck', '_gcl_au' UNION ALL
  SELECT 9, 'PHPSESSID', '_ga' UNION ALL
  SELECT 10, '_gcl_au', '_vwo_uuid_v2'
),
cluster_sites AS (
  SELECT DISTINCT
    cluster,
    sites,
    cookies_cleaned_1
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`,
    UNNEST(visited_sites) AS sites
)

SELECT
  cp.pair_id,
  FORMAT('(%s, %s)', cp.c1, cp.c2) AS cookie_pair,
  COUNT(DISTINCT cs.sites) AS distinct_sites
FROM
  cookie_pairs AS cp
JOIN
  cluster_sites AS cs
ON
  cp.c1 IN UNNEST(cs.cookies_cleaned_1)
  AND cp.c2 IN UNNEST(cs.cookies_cleaned_1)
GROUP BY
  cp.pair_id,
  cookie_pair
ORDER BY
  cp.pair_id;


----------- fix cookies:
CREATE TABLE `magnetic-signer-465314-q4.server_side_tracking.cluster_cleaned_cookies` AS
WITH
  known_cookies AS (
    SELECT cookie_name
    FROM UNNEST(['_ga', '_gat_gtag', 'AMCV', 'AMP']) AS cookie_name
  ),
  cookies_from_cluster AS (
    SELECT
      cluster,
      cookies
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`,
      UNNEST(cookies_per_cluster) AS cookies
  )
SELECT cluster, ARRAY_AGG(distinct cookie) AS cookies_cleaned
FROM
  (
    SELECT
      c.cluster,
      IFNULL(
        (
          SELECT k.cookie_name
          FROM known_cookies k
          WHERE c.cookies LIKE CONCAT(k.cookie_name, '%')
          LIMIT 1
        ),
        c.cookies) AS cookie
    FROM cookies_from_cluster AS c
  )
GROUP BY cluster;


---- top 10 table:
SELECT
  cookie,
  COUNT(DISTINCT cluster) c,
  SUM(third_party_script) accessed_tp,
  SUM(first_party_script) accessed_fp
FROM
  (
    SELECT cluster, cookie, third_party_script, first_party_script
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.cluster_k8`,
      UNNEST(cookies_per_cluster) cookie
  )
GROUP BY cookie
ORDER BY c DESC
LIMIT 10



