SELECT
  distinct
  c.expiry,
  c.is_secure,
  c.is_http_only,
  c.same_site,
  c.name,
  c.value,
  c.host,
  c.path,
  c.time_stamp,
  c.is_host_only,
  c.is_session,
  c.valid_entropy,
  c.category,
  c.valid_expires_date,
  j.script_url,
  j.document_url,
  j.top_level_url
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cookies` c
JOIN
  `magnetic-signer-465314-q4.server_side_tracking.javascript` j
ON
  c.browser_id = j.browser_id
  AND c.visit_id = j.visit_id
  AND c.event_ordinal = j.page_scoped_event_ordinal
  AND c.sqlite_visit_id = j.sqlite_visit_id
JOIN
WHERE
  c.hold_id
  AND c.first_party_cookie;

--- Update easylist status
UPDATE `magnetic-signer-465314-q4.server_side_tracking.llm_analysis` AS ana
SET ana.easylist_classified = src.is_tracker_any
FROM (
  SELECT
    url,
    LOGICAL_OR(CAST(is_tracker AS BOOL)) AS is_tracker_any
  FROM `magnetic-signer-465314-q4.server_side_tracking.requests`
  GROUP BY url
) AS src
WHERE src.url = ana.script_url;
