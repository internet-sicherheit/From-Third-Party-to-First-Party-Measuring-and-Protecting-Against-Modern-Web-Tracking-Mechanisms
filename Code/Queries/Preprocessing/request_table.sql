alter table requests
add is_third_party boolean;

UPDATE requests SET is_third_party = TRUE
WHERE url != top_level_url;