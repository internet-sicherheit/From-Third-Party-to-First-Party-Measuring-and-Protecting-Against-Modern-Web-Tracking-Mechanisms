--- 0: Fixing and Preprocessing

UPDATE `magnetic-signer-465314-q4.server_side_tracking.javascript`
SET first_party_script = TRUE
WHERE
NET.REG_DOMAIN(script_url) = NET.REG_DOMAIN(top_level_url);

UPDATE `magnetic-signer-465314-q4.server_side_tracking.javascript`
SET  set_first_party_cookies = TRUE
WHERE
NET.REG_DOMAIN(document_url) = NET.REG_DOMAIN(top_level_url);


-- 1) Convert script_col in server_side_tracking.broken_js
CREATE OR REPLACE TABLE `magnetic-signer-465314-q4.server_side_tracking.broken_js` AS
SELECT
  * REPLACE (SAFE_CAST(TRIM(script_line) AS NUMERIC) AS script_line)
FROM `magnetic-signer-465314-q4.server_side_tracking.broken_js`;

-- 2) Convert script_col in server_side_tracking.broke_js_2
CREATE OR REPLACE TABLE `magnetic-signer-465314-q4.server_side_tracking.broke_js_2` AS
SELECT
  * REPLACE (SAFE_CAST(TRIM(script_line) AS NUMERIC) AS script_line)
FROM `magnetic-signer-465314-q4.server_side_tracking.broke_js_2`;

CREATE TABLE `magnetic-signer-465314-q4.server_side_tracking.javascript` AS
SELECT * FROM `magnetic-signer-465314-q4.server_side_tracking.js_eu1_us1_2`
UNION ALL
SELECT * FROM `magnetic-signer-465314-q4.server_side_tracking.js_eu2`
UNION ALL
SELECT * FROM `magnetic-signer-465314-q4.server_side_tracking.broken_js`
UNION ALL
SELECT * FROM `magnetic-signer-465314-q4.server_side_tracking.broke_js_2`;


---- 1.0: JS per Page per browser_id
SELECT
  browser_id,
  AVG(number_of_javascripts) mean,
  MIN(number_of_javascripts) min,
  MAX(number_of_javascripts) max,
  STDDEV(number_of_javascripts) sd
FROM (
  SELECT
    browser_id,
    visit_id,
    COUNT(content_hash) number_of_javascripts
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.responses`
  GROUP BY
    browser_id,
    visit_id)
GROUP BY
  browser_id;

---- 1.1: JS per page total
SELECT
  AVG(number_of_javascripts) mean,
  MIN(number_of_javascripts) min,
  MAX(number_of_javascripts) max,
  STDDEV(number_of_javascripts) sd
FROM (
  SELECT
    browser_id,
    visit_id,
    COUNT(content_hash) number_of_javascripts
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.responses`
  GROUP BY
    browser_id,
    visit_id);

----- 1.2: Scripts per profile:
SELECT
  AVG(number_of_javascripts) mean,
  MIN(number_of_javascripts) min,
  MAX(number_of_javascripts) max,
  STDDEV(number_of_javascripts) SD
FROM (
  SELECT
    browser_id,
    COUNT(DISTINCT content_hash) number_of_javascripts
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.responses`
  GROUP BY
    browser_id);

------ 1.3: distinct content hashes
SELECT
  count(DISTINCT content_hash) distinct_scripts
FROM
  `magnetic-signer-465314-q4.server_side_tracking.responses`;


---- 1.3.1
SELECT
  is_third_party_channel,
  COUNT(*)
FROM (
  SELECT
    DISTINCT NET.REG_DOMAIN(url),
    is_third_party_channel
  FROM (
    SELECT
      DISTINCT res.content_hash,
      res.url,
      res.etld,
      req.top_level_url,
      req.is_third_party_channel
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.responses` res
    JOIN
      `magnetic-signer-465314-q4.server_side_tracking.requests` req
    ON
      res.browser_id = req.browser_id
      AND res.visit_id = req.visit_id
      AND res.url = req.url
      AND res.content_hash IS NOT NULL))
GROUP BY
  is_third_party_channel

---- 1.3.2:


----- 1.4: Pages w/o javascript
SELECT
  COUNT(*) pages_wo_js
FROM (
  SELECT
    browser_id,
    visit_id,
    COUNT(content_hash) number_of_javascripts
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.responses`
  GROUP BY
    browser_id,
    visit_id)
WHERE
  number_of_javascripts = 0;

--- 1.5: Site w/o javascript
SELECT
  COUNT(*) pages_wo_js
FROM (
  SELECT
    browser_id,
    site_id,
    COUNT(content_hash) number_of_javascripts
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.responses`
  GROUP BY
    browser_id,
    site_id)
WHERE
  number_of_javascripts = 0;

--- 1.6: JS interaction with a fp tracking cookie
SELECT
  COUNT(DISTINCT content_hash)
FROM
  `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis`;

--- 1.7: JS per profile
SELECT
  browser_id,
  COUNT(DISTINCT content_hash) distinct_content_hashes
FROM
  `magnetic-signer-465314-q4.server_side_tracking.sst_ecosystem_analysis`
GROUP BY
  browser_id;


----2.0
SELECT count(distinct simhash_hex) FROM `magnetic-signer-465314-q4.server_side_tracking.ecosystem_candidates`;


--- 2.1
SELECT first_party_script, count(distinct simhash_hex) FROM `magnetic-signer-465314-q4.server_side_tracking.ecosystem_candidates` GROUP BY first_party_script

--- 2.2
SELECT count(distinct simhash_hex) FROM (SELECT DISTINCT
  simhash_hex,
  COUNTIF(first_party_script = TRUE) fp,
  COUNTIF(first_party_script = FALSE) TP
FROM `magnetic-signer-465314-q4.server_side_tracking.ecosystem_candidates`
GROUP BY simhash_hex) WHERE fp > 0 AND tp > 0;
