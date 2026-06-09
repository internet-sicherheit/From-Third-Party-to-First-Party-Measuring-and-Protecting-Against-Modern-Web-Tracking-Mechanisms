# Known Tracker
SELECT browser_id, is_tracker, count(*) FROM measurement.requests GROUP BY browser_id, is_tracker
