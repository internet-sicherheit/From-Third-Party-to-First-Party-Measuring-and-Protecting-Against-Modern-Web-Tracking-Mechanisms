--- Update Easylist Blocking
UPDATE `magnetic-signer-465314-q4.server_side_tracking.requests`
SET easylist_privacy_blocked = True
WHERE url IN (SELECT url FROM `magnetic-signer-465314-q4.server_side_tracking.easylist_classification` WHERE blocked_by_easyprivacy = True);

UPDATE `magnetic-signer-465314-q4.server_side_tracking.requests`
SET easylist_blocked = True
WHERE url IN (SELECT url FROM `magnetic-signer-465314-q4.server_side_tracking.easylist_classification` WHERE easylist_blocked = True);


UPDATE `magnetic-signer-465314-q4.server_side_tracking.requests`
SET is_tracker = True
WHERE (easylist_privacy_blocked = TRUE OR easylist_blocked = True)