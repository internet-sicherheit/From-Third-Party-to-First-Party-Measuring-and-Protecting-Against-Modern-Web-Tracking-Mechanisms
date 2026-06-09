# Successfully visited sites
SELECT visited_sites, visited_sites/90000 * 100 as percentage_from_scope FROM (SELECT count(*) as visited_sites FROM (SELECT distinct etld FROM measurement.requests));

# Successfully visited pages
SELECT count(*) as visited_pages FROM (SELECT distinct url FROM measurement.requests);

# Min, Max, SD pages per side

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
      measurement.requests
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
