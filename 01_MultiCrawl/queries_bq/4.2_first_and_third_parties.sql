# First and Third-party cookies
SELECT is_third_party, count(*) FROM measurement.cookies GROUP BY is_third_party;
