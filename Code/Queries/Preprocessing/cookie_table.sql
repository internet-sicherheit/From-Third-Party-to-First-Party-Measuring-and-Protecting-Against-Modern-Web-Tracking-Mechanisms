--- Update Categories for each cookie
UPDATE cookies c
    SET category = cc.category
    FROM cookie_cat cc
    WHERE c.name = cc.cookie_name;

--- Check entropy of cookie value
UPDATE cookies
SET valid_entropy = TRUE
WHERE value IS NOT NULL
    AND LENGTH(value) >= 8;

--- Check for expired date
UPDATE cookies
SET valid_expires_date = TRUE
WHERE expiry - time_stamp >= INTERVAL '90 days';

--- Check if first- or third-party cookie
ALTER TABLE cookies
    add is_first_party_cookie boolean;
UPDATE cookies c
SET is_first_party_cookie = TRUE
FROM javascript js
WHERE c.browser_id = js.browser_id
AND c.visit_id = js.visit_id
AND js.page_scoped_event_ordinal = c.event_ordinal
AND

--- Prepare data for rule analysis
CREATE TABLE potential_tracking_cookies AS
SELECT c.browser_id,
       c.visit_id,
       c.expiry,
       c.name,
       c.value,
       c.host,
       c.path,
       c.time_stamp,
       c.hold_id,
       js.script_url,
       js.document_url,
       js.top_level_url,
       js.symbol,
       js.operation,
       js.func_name
FROM cookies c
JOIN javascript js
ON js.visit_id = c.visit_id
AND js.browser_id = c.browser_id
AND js.page_scoped_event_ordinal = c.event_ordinal
WHERE valid_entropy = TRUE
AND valid_expires_date = TRUE;

---AND is_first_party_cookie = TRUE

ALTER TABLE cookies
    add first_party_cookie boolean;

ALTER TABLE cookies
    add first_party_script boolean;

