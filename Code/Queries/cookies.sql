--- 1.0: Get candidates for tareq analysis
SELECT
  *
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cookies` c
JOIN
  `magnetic-signer-465314-q4.server_side_tracking.javascript` j
ON c.browser_id = j.browser_id
  AND c.visit_id = j.visit_id
  AND c.event_ordinal = j.page_scoped_event_ordinal
  AND c.sqlite_visit_id = j.sqlite_visit_id
WHERE c.valid_entropy
AND c.valid_expires_date
AND c.first_party_domain


----
    SELECT
count(distinct cookie_name)
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cookies_holding_id`

--- Count distinct cookies:
SELECT
  DISTINCT name,
  cookie_value,
  path
FROM (
  SELECT
    *,
    c.value as cookie_value
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
    c.valid_entropy
    AND c.valid_expires_date
    AND c.first_party_domain)

-------------------
SELECT
  c.browser_id,
  c.visit_id,
  c.expiry,
  c.name,
  c.value,
  c.host,
  c.path,
  c.time_stamp,
  c.hold_id,
  c.valid_expires_date,
  c.valid_entropy,
  j.script_url,
  j.document_url,
  j.top_level_url,
  j.symbol,
  j.operation,
  j.func_name
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cookies` c
JOIN
  `magnetic-signer-465314-q4.server_side_tracking.javascript` j
ON
  c.visit_id = j.visit_id
  AND c.browser_id = j.browser_id
  AND j.page_scoped_event_ordinal = c.event_ordinal
WHERE valid_expires_date
AND valid_entropy;


--- Set valid entropy
UPDATE
  `magnetic-signer-465314-q4.server_side_tracking.cookies`
SET
  valid_entropy = TRUE
WHERE
  LENGTH(valid_entropy) >= 8;

--- Set valid_expires_date

UPDATE
  `magnetic-signer-465314-q4.server_side_tracking.cookies`
SET
  valid_expires_date = TRUE
WHERE
  TIMESTAMP_DIFF( TIMESTAMP(expiry), TIMESTAMP(time_stamp), DAY ) > 90



--- Update cookie table for fp/tp cookies
UPDATE `magnetic-signer-465314-q4.server_side_tracking.cookies` AS c
SET c.first_party_domain = s.flag_value
FROM (
  SELECT
    browser_id,
    visit_id,
    page_scoped_event_ordinal,
    sqlite_visit_id,
    LOGICAL_OR(CAST(set_first_party_cookies AS BOOL)) AS flag_value
  FROM `magnetic-signer-465314-q4.server_side_tracking.javascript`
  GROUP BY 1,2,3,4
) AS s
WHERE s.browser_id = c.browser_id
  AND s.visit_id = c.visit_id
  AND c.event_ordinal = s.page_scoped_event_ordinal
  AND c.sqlite_visit_id = s.sqlite_visit_id;



--->

CREATE TABLE `magnetic-signer-465314-q4.server_side_tracking.cookies2` AS
SELECT
  c.*,
  js.set_first_party_cookies as fp_cookie,
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cookies` c
JOIN
  `magnetic-signer-465314-q4.server_side_tracking.javascript` js
ON
  c.browser_id = js.browser_id
  AND c.visit_id = js.visit_id
  AND c.event_ordinal = js.page_scoped_event_ordinal



--- 2.0: number of etlds in heurstic
SELECT count(distinct top_level_url_etld) FROM `magnetic-signer-465314-q4.server_side_tracking.cookies_holding_id`;
--- 2.1: cookies per etld+1

SELECT top_level_url_etld, count(cookie_name) FROM `magnetic-signer-465314-q4.server_side_tracking.cookies_holding_id` GROUP BY top_level_url_etld;

SELECT
  AVG(c) avg,
  MIN(c) min,
  MAX(c) max,
  STDDEV(c) SD
FROM (
  SELECT
    top_level_url_etld,
    COUNT(cookie_name) c
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cookies_holding_id`
  GROUP BY
    top_level_url_etld);

--- 2.2: Cookie eTLD+1 pairs
SELECT
  distinct cookie_name,
  top_level_url_etld
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cookies_holding_id`

--- 2.3: Cookies holding ID on all etld
SELECT cookie_name FROM (SELECT
  cookie_name,
  COUNTIF(hold_id=True) AS true_id,
  COUNTIF(hold_id=False) AS false_id
FROM (
  SELECT
    DISTINCT cookie_name,
    top_level_url_etld,
    hold_id
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cookies_holding_id`)
GROUP BY
  cookie_name)
WHERE false_id = 0;

SELECT cookie_name FROM (SELECT
  cookie_name,
  COUNTIF(hold_id=True) AS true_id,
  COUNTIF(hold_id=False) AS false_id
FROM (
  SELECT
    DISTINCT cookie_name,
    top_level_url_etld,
    hold_id
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cookies_holding_id`)
GROUP BY
  cookie_name)
WHERE true_id = 0;

--- 2.4







---- 3.0: Classified Cookies
SELECT
  category,
  COUNT(*)
FROM (
  SELECT
    DISTINCT name,
    value,
    path,
    category,
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cookies`)
GROUP BY
  category;

---- 3.1: Heuristic input by name, path ,value
SELECT
  distinct name
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cookies` c
WHERE c.valid_entropy
AND c.valid_expires_date
AND c.first_party_domain;

---- 3.2: By name
SELECT
  distinct name
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cookies` c
WHERE c.valid_entropy
AND c.valid_expires_date
AND c.first_party_domain;

---- 3.3: Cookies holding IDs
SELECT
  DISTINCT cookie_name
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cookie_id_analysis`
WHERE
  hold_id;

---- 3.4: Cookies didn´t pass the check
SELECT
  DISTINCT cookie_name
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cookie_id_analysis`
WHERE
  passed_checkin = FALSE
  AND cookie_name NOT IN (
  SELECT
    DISTINCT cookie_name
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cookie_id_analysis`
  WHERE
    hold_id);

----- 3.5: Cookies didn´t pass uniqueness
SELECT
  DISTINCT cookie_name
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cookie_id_analysis`
WHERE
  passed_checkin = True
  AND unique_ok = TRUE

  AND cookie_name NOT IN (
  SELECT
    DISTINCT cookie_name
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cookie_id_analysis`
  WHERE
    hold_id);

---- 3.6:Cookies didn´t pass similarity
SELECT
  DISTINCT cookie_name
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cookie_id_analysis`
WHERE
  passed_checkin = True
  AND unique_ok = TRUE
  AND similarity_ok = FALSE
  AND cookie_name NOT IN (
  SELECT
    DISTINCT cookie_name
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cookie_id_analysis`
  WHERE
    hold_id);


---- Prepare Multiple Key-Values
SELECT
  *
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cookies`
WHERE
  REGEXP_CONTAINS(value, r'\[[^]]*:[^]]*\]')
  OR REGEXP_CONTAINS(value, r'\{[^}]*:[^}]*\}');

UPDATE
  `magnetic-signer-465314-q4.server_side_tracking.cookies`
SET
  contains_multiple_values = TRUE
WHERE
  REGEXP_CONTAINS(value, r'\[[^]]*:[^]]*\]')
  OR REGEXP_CONTAINS(value, r'\{[^}]*:[^}]*\}');


---- 4.0: Distinct Cookie Values
SELECT
  distinct value
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cookies`
WHERE
  contains_multiple_values

---- 4.1: Distinct Cookies
SELECT
  distinct name
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cookies`
WHERE
  contains_multiple_values

---- Create Analysis Table
CREATE TABLE
  `magnetic-signer-465314-q4.server_side_tracking.multiple_cookie_values` AS
SELECT
  *
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cookies`
WHERE
  contains_multiple_values

---- Cookies holding IDs:
