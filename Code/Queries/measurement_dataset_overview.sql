--- 1.0: Distinct sites eTLDs
SELECT browser_id, count(distinct etld) FROM requests GROUP BY browser_id;

SELECT
  MIN(visited_sites) min,
  MAX(visited_sites) max,
  AVG(visited_sites) mean,
  STDDEV(visited_sites) SD
FROM (
  SELECT
    browser_id,
    COUNT(DISTINCT site_id) AS visited_sites
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.requests`
  GROUP BY
    browser_id);

--- 1.1: Visited pages
SELECT browser_id, count(url) FROM requests GROUP BY browser_id;

--- 1.2: Distinct URLs
SELECT
    count(distinct url)
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.requests`


SELECT browser_id, count(distinct url) FROM requests GROUP BY browser_id;

SELECT AVG(distinct_pages) avg FROM (SELECT browser_id, count(distinct url) distinct_pages FROM `magnetic-signer-465314-q4.server_side_tracking.requests` GROUP BY browser_id);

--- 1.3: MIN, MAX, SD pages per Side
SELECT
  MIN(number_of_subpages) AS min,
  MAX(number_of_subpages) AS max,
  AVG(number_of_subpages) AS mean,
  STDDEV(number_of_subpages) AS SD
FROM (
  SELECT
    browser_id,
    site_id,
    COUNT(number_of_subpages) number_of_subpages
  FROM (
    SELECT
      browser_id,
      site_id,
      subpage_id,
      COUNT(DISTINCT subpage_id) AS number_of_subpages
    FROM
      requests
    GROUP BY
      browser_id,
      site_id,
      subpage_id
    ORDER BY
      browser_id,
      site_id,
      subpage_id)
  GROUP BY
    browser_id,
    site_id
  ORDER BY
    browser_id,
    site_id);

--- 2.0: Total requests
SELECT count(*) FROM requests GROUP BY browser_id;
SELECT browser_id, count(*) FROM requests GROUP BY browser_id;

--- 2.1: Total responses
SELECT browser_id, count(*) FROM responses GROUP BY browser_id;

--- 3.0: Table
WITH
  visited_sites AS (
  SELECT
    browser_id,
    COUNT(DISTINCT site_id) AS visited_sites
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.requests`
  GROUP BY
    browser_id),
  visited_subpages AS (
  SELECT
    browser_id,
    COUNT(DISTINCT visit_id) AS visited_subpage
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.requests`
  GROUP BY
    browser_id),
  requests AS (
  SELECT
    browser_id,
    COUNT(*) requests_total
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.requests`
  GROUP BY
    browser_id),
  responses AS (
  SELECT
    browser_id,
    COUNT(*) responses_total
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.responses`
  GROUP BY
    browser_id),
  cookies AS (
  SELECT
    browser_id,
    COUNT(*) cookies
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cookies`
  GROUP BY
    browser_id ),
  known_tracker AS (
  SELECT
    browser_id,
    COUNT(*) AS tracker
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.requests`
  WHERE
    is_tracker
  GROUP BY
    browser_id)
SELECT
  vs.browser_id,
  vs.visited_sites,
  vp.visited_subpage,
  req.requests_total,
  res.responses_total,
  c.cookies,
  kt.tracker
FROM
  visited_subpages vp
JOIN
  visited_sites vs
ON
  vs.browser_id = vp.browser_id
JOIN requests req
ON req.browser_id = vs.browser_id
JOIN responses res
ON res.browser_id = vs.browser_id
JOIN
  cookies c
ON
  vs.browser_id = c.browser_id
JOIN
  known_tracker kt
ON
  vs.browser_id = kt.browser_id;
---- 3.1: Visited sites
SELECT browser_id, count(distinct site_id) as visited_sites FROM `magnetic-signer-465314-q4.server_side_tracking.requests` GROUP BY browser_id;

SELECT AVG(visited_sites) avg, MIN(visited_sites) min, MAX(visited_sites) max, STDDEV(visited_sites) SD FROM (SELECT browser_id, count(distinct site_id) as visited_sites FROM `magnetic-signer-465314-q4.server_side_tracking.requests` GROUP BY browser_id);

---- 3.2: Visited subpages
SELECT browser_id, count(distinct visit_id) as visited_subpage FROM `magnetic-signer-465314-q4.server_side_tracking.requests` GROUP BY browser_id;

SELECT AVG(visited_subpage) avg, MIN(visited_subpage) min, MAX(visited_subpage) max, STDDEV(visited_subpage) SD FROM (SELECT browser_id, count(distinct visit_id) as visited_subpage FROM `magnetic-signer-465314-q4.server_side_tracking.requests` GROUP BY browser_id);


---- 4.0: Sizes
SELECT pg_size_pretty( pg_database_size('server-side-measurement-data') );
SELECT pg_size_pretty( pg_total_relation_size('requests') );
SELECT pg_size_pretty( pg_total_relation_size('responses') );
SELECT pg_size_pretty( pg_total_relation_size('cookie') );
SELECT pg_size_pretty( pg_total_relation_size('javascript') );


---- 5.0: Cookies
---- 5.1: Total Distinct Cookies
SELECT count(*) FROM (SELECT distinct name, path, host FROM cookie);

SELECT SUM(c) FROM (SELECT browser_id, count(*) c FROM (SELECT browser_id, name, path, host FROM `magnetic-signer-465314-q4.server_side_tracking.cookies`) GROUP BY browser_id);


---- 5.2: Total Cookies per Profile
SELECT
  AVG(c) avg,
  MIN(c) min,
  MAX(c) max,
  STDDEV(c) SD
FROM (
  SELECT
    browser_id,
    COUNT(*) c
  FROM (
    SELECT
      browser_id,
      name,
      path,
      host
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.cookies`)
  GROUP BY
    browser_id);


SELECT browser_id, count(*) FROM (SELECT browser_id, name, path, host FROM cookie) GROUP BY browser_id;

---- 5.2: Total Disinct Cookies per Profile
SELECT browser_id, count(*) FROM (SELECT distinct browser_id, name, path, host FROM cookie) GROUP BY browser_id;

---- 5.2.1: fp cookies over profiles
SELECT
      distinct browser_id,
      name,
      path,
      host
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.cookies`
      where first_party_cookie = True;

---- 5.3: Create table for cookie frequency
CREATE TABLE `magnetic-signer-465314-q4.server_side_tracking.cookie_frequence` AS
SELECT name,
       COUNTIF(browser_id = 'openwpm_native_eu_1_omaticall') as EU1,
       COUNTIF(browser_id = 'openwpm_native_eu_2_omaticall') as EU2,
       COUNTIF(browser_id = 'openwpm_native_us_1_omaticall') as US1,
       COUNTIF(browser_id = 'openwpm_native_us_2_omaticall') as US2
 FROM cookie
GROUP BY name;


---- for non big query:
CREATE TABLE cookie_freq AS
SELECT name,
       COUNT(*) FILTER (WHERE browser_id = 'openwpm_native_eu_1_omaticall') AS EU1,
       COUNT(*) FILTER (WHERE browser_id = 'openwpm_native_eu_2_omaticall') AS EU2,
       COUNT(*) FILTER (WHERE browser_id = 'openwpm_native_us_1_omaticall') AS US1,
       COUNT(*) FILTER (WHERE browser_id = 'openwpm_native_us_2_omaticall') AS US2
FROM cookie
GROUP BY name;


---- 5.4: distinct cookies in first and third party
SELECT
  browser_id,
  first_party_cookie,
  COUNT(*) c
FROM (
  SELECT
    distinct browser_id,
    name,
    path,
    host,
    first_party_cookie
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cookies` )
GROUP BY
  browser_id,
  first_party_cookie
ORDER BY
  browser_id;


SELECT
  first_party_cookie,
  COUNT(*) number_of_cookies,
  (
  SELECT
    COUNT(*)
  FROM (
    SELECT
      DISTINCT name,
      path,
      host
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.cookies`)) AS total_cookies,
    COUNT(*) / (
    SELECT
      COUNT(*)
    FROM (
      SELECT
        DISTINCT name,
        path,
        host
      FROM
        `magnetic-signer-465314-q4.server_side_tracking.cookies`)) percentage
  FROM (
    SELECT
      DISTINCT name,
      path,
      host,
      first_party_cookie
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.cookies`)
  GROUP BY
    first_party_cookie;

--- Number FP:
SELECT count(*) FROM (SELECT distinct name, path, host FROM `magnetic-signer-465314-q4.server_side_tracking.cookies` WHERE first_party_cookie)
--- Number TP:
SELECT count(*) FROM (SELECT distinct name, path, host FROM `magnetic-signer-465314-q4.server_side_tracking.cookies` WHERE NOT first_party_cookie)

--- Number not c:
SELECT count(*) FROM (SELECT distinct name, path, host FROM `magnetic-signer-465314-q4.server_side_tracking.cookies` WHERE first_party_cookie IS NULL)




---- 5.4.1: cookies in fp and tp
    SELECT
  *
FROM (
  SELECT
    name,
    path,
    host,
    COUNTIF(first_party_cookie=TRUE) fp,
    COUNTIF(first_party_cookie=FALSE) tp
  FROM (
    SELECT
      DISTINCT name,
      path,
      host,
      first_party_cookie
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.cookies`)
  GROUP BY
    name,
    path,
    host)
WHERE
  fp > 0
  AND tp > 0;



----- 5.5: Intersection
SELECT
  intersection,
  (intersection / (
  SELECT
    COUNT(*)
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cookie_frequence`)) * 100
FROM (
  SELECT
    COUNT(*) intersection
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cookie_frequence`
  WHERE
    EU1 > 0
    AND EU2 > 0
    AND US1 > 0
    AND US2 > 0);

----- 5.6: Cookies per page
SELECT
  browser_id,
  visit_id,
  count(*) cookies_per_page
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cookies`
GROUP BY
  browser_id,
  visit_id;


SELECT
  AVG(cookies_per_page) avg,
  MIN(cookies_per_page) min,
  MAX(cookies_per_page) max,
  STDDEV(cookies_per_page) SD
FROM (
  SELECT
    browser_id,
    visit_id,
    COUNT(*) cookies_per_page
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cookies`
  GROUP BY
    browser_id,
    visit_id);

----- 5.7: Cookies per page
--- only one cookie:
SELECT count(*) FROM (SELECT
  browser_id,
  visit_id,
  count(*) cookies_per_page
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cookies`
GROUP BY
  browser_id,
  visit_id) WHERE cookies_per_page = 1;


--- 5.8: cookies per page:
    SELECT
  cookies_per_page,
  COUNT(*) c
FROM (
  SELECT
    browser_id,
    visit_id,
    COUNT(*) cookies_per_page
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cookies`
  GROUP BY
    browser_id,
    visit_id)
GROUP BY
  cookies_per_page
  ORDER by c desc;



---- 6.0: Sites in Profiles


---- 6.1: Known Tracker
SELECT
    browser_id,
    COUNT(*) AS tracker
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.requests`
  WHERE
    is_tracker
  GROUP BY
    browser_id

SELECT
  AVG(tracker) avg,
  MIN(tracker) min,
  MAX(tracker) max,
  STDDEV(tracker) SD
FROM (
  SELECT
    browser_id,
    COUNT(*) AS tracker
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.requests`
  WHERE
    is_tracker
  GROUP BY
    browser_id);

---- 6.2: Known Tracker distinct URLs
SELECT
    browser_id,
    COUNT(distinct url) AS tracker
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.requests`
  WHERE
    is_tracker
  GROUP BY
    browser_id;

SELECT
    count(distinct url)
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.requests`
  WHERE
    is_tracker

SELECT
  is_third_party_channel,
  COUNT(DISTINCT url)
FROM
  `magnetic-signer-465314-q4.server_side_tracking.requests`
WHERE
  is_tracker
GROUP BY
  is_third_party_channel


---- 7.0: distinct eTLD+1
SELECT
  COUNT(DISTINCT etld) distinct_etld
FROM
  `magnetic-signer-465314-q4.server_side_tracking.requests`;


---- 7.1: distinct eTLD+1 per profile
SELECT
  browser_id,
  COUNT(DISTINCT etld) distinct_etld_per_profile
FROM
  `magnetic-signer-465314-q4.server_side_tracking.requests`
GROUP BY
  browser_id;

---- 7.2: Distribution of eTLD+1
SELECT
  browser_id,
  COUNT(DISTINCT etld) distinct_etld_per_profile
FROM
  `magnetic-signer-465314-q4.server_side_tracking.requests`
GROUP BY
  browser_id;


--- 7.3: etld that are not in all profiles
SELECT
  *
FROM (
  SELECT
    etld,
    COUNTIF(browser_id = 'openwpm_native_eu_1_omaticall') AS EU1,
    COUNTIF(browser_id = 'openwpm_native_eu_2_omaticall') AS EU2,
    COUNTIF(browser_id = 'openwpm_native_us_1_omaticall') AS US1,
    COUNTIF(browser_id = 'openwpm_native_us_2_omaticall') AS US2
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.requests`
  GROUP BY
    etld)
WHERE
  EU1 = 0
  OR EU2 = 0
  OR US1 = 0
  OR US2 = 0;

---- 7.4: etld in one profile
SELECT
  *
FROM (
  SELECT
    etld,
    COUNTIF(browser_id = 'openwpm_native_eu_1_omaticall') AS EU1,
    COUNTIF(browser_id = 'openwpm_native_eu_2_omaticall') AS EU2,
    COUNTIF(browser_id = 'openwpm_native_us_1_omaticall') AS US1,
    COUNTIF(browser_id = 'openwpm_native_us_2_omaticall') AS US2
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.requests`
  GROUP BY
    etld)
WHERE
  (EU1 > 0
    AND EU2 = 0
    AND US1 = 0
    AND US2 = 0)
  OR (EU1 = 0
    AND EU2 > 0
    AND US1 = 0
    AND US2 = 0)
  OR (EU1 = 0
    AND EU2 = 0
    AND US1 > 0
    AND US2 = 0)
  OR (EU1 = 0
    AND EU2 = 0
    AND US1 = 0
    AND US2 > 0);


---- 10.0:
SELECT
  AVG(number_of_elements) AS mean,
  MIN(number_of_elements) AS min,
  MAX(number_of_elements) AS max,
  STDDEV(number_of_elements) AS sd,
  APPROX_QUANTILES(number_of_elements, 100)[
OFFSET
  (50)] AS median_approx
FROM (
  SELECT
    browser_id,
    COUNT(DISTINCT simhash_hex) number_of_elements
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis_wo_empty_simhashes`
  GROUP BY
    browser_id)