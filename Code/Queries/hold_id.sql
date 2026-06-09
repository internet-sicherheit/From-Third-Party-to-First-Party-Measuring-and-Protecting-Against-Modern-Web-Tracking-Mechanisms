--- Input data
SELECT
  *
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cookies` c
WHERE c.valid_entropy
AND c.valid_expires_date
AND c.first_party_domain;


--- Creating Table
--- Number of cookies holding an ID
SELECT
  DISTINCT cookie_name
FROM
  `magnetic-signer-465314-q4.server_side_tracking.cookie_id_analysis`
WHERE
  hold_id;

--- Update Cookies Table
UPDATE
  `magnetic-signer-465314-q4.server_side_tracking.cookies`
SET
  hold_id = TRUE
WHERE
  name IN (
  SELECT
    DISTINCT cookie_name
  FROM
    `magnetic-signer-465314-q4.server_side_tracking.cookie_id_analysis`
  WHERE
    hold_id);

--- Update cookie classification
UPDATE `magnetic-signer-465314-q4.server_side_tracking.cookies` AS c
SET category = s.category
FROM (
  SELECT
    string_field_0 AS name,
    ANY_VALUE(string_field_1) AS category
  FROM `magnetic-signer-465314-q4.server_side_tracking.cookie_classified`
  GROUP BY string_field_0
) AS s
WHERE c.name = s.name;


------ Test results


