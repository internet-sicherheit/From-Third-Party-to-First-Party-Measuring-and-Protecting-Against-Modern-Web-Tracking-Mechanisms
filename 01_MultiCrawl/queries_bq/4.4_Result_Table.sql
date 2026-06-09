# Fill Table 2
WITH visited_sites AS (SELECT browser_id, count(distinct site_id) as visited_sites FROM measurement.requests GROUP BY browser_id),

visited_subpages AS (SELECT browser_id, count(distinct visit_id) as visited_subpage FROM measurement.requests GROUP BY browser_id),

cookies AS (SELECT browser_id, count(distinct name) as cookies FROM measurement.cookies GROUP BY browser_id),

known_tracker AS (SELECT browser_id, count(*) as tracker FROM measurement.requests WHERE is_tracker = 1 GROUP BY browser_id)

SELECT vs.browser_id, vs.visited_sites, vp.visited_subpage, c.cookies, kt.tracker FROM visited_subpages vp JOIN visited_sites vs ON vs.browser_id = vp.browser_id JOIN cookies c ON  vs.browser_id = c.browser_id JOIN known_tracker kt ON vs.browser_id = kt.browser_id;
