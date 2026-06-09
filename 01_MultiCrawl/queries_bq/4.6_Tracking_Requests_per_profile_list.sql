SELECT
  browser_id,
  url,
  JSON_EXTRACT(json, '$.USA') as filterlist_us,
  JSON_EXTRACT(json, '$.China') as filterlist_cn,
  JSON_EXTRACT(json, '$.Japanese') as filterlist_jp,
  JSON_EXTRACT(json, '$.Indian') as filterlist_in,
  JSON_EXTRACT(json, '$.Germany') as filterlist_de,
  JSON_EXTRACT(json, '$.Scandinavia') as filterlist_no,
  JSON_EXTRACT(json, '$.France1') as filterlist_fr,
  JSON_EXTRACT(json, '$.Israel') as filterlist_is,
  JSON_EXTRACT(json, '$.VAE') as filterlist_ae
FROM
  `filterlists.measurement.tmp_requests_tracker_processed`
