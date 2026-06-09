---- Positive FP and TP Tracking scripts
WITH
  cookies_holding_ids AS (
  SELECT
    DISTINCT name
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cookies`
  WHERE
    hold_id = TRUE),
  js_data AS (
  SELECT
    c.name,
    j.script_url
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cookies` c
  JOIN
    `magnetic-signer-465314-q4.server_side_tracking.javascript` j
  ON
    c.visit_id = j.visit_id
    AND c.browser_id = j.browser_id
    AND j.page_scoped_event_ordinal = c.event_ordinal)
SELECT
  DISTINCT foo.script_url
FROM
  js_data AS foo
WHERE
  foo.name IN (
  SELECT
    *
  FROM
    cookies_holding_ids);