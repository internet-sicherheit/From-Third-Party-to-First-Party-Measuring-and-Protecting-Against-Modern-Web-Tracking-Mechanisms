SELECT bundle, count(*) occurency FROM (SELECT
 CASE
    -- Webpack (comprehensive fingerprint coverage)
    WHEN REGEXP_CONTAINS(headers, r'\b__webpack_require__\b')
      OR REGEXP_CONTAINS(headers, r'\b__webpack_modules__\b')
      OR REGEXP_CONTAINS(headers, r'\b__webpack_module_cache__\b')
      OR REGEXP_CONTAINS(headers, r'\b__webpack_exports\b')
      OR REGEXP_CONTAINS(headers, r'\b__webpack_hash__\b')
      OR REGEXP_CONTAINS(headers, r'\b__webpack_get_script_filename__\b')
      OR REGEXP_CONTAINS(headers, r'\bwebpackChunk\b')
      OR REGEXP_CONTAINS(headers, r'\bwebpackJsonp\b')
      OR REGEXP_CONTAINS(headers, r'\b__webpack_require__\.g\b')
      OR REGEXP_CONTAINS(headers, r'\b__webpack_require__\.d\b')
      OR REGEXP_CONTAINS(headers, r'\b__webpack_require__\.o\b')
      OR REGEXP_CONTAINS(headers, r'\b__webpack_require__\.r\b')
      -- detect minified runtime helpers and internal keys
      OR REGEXP_CONTAINS(headers, r'\bloaded\s*:\s*!1\b')
      OR REGEXP_CONTAINS(headers, r'\bl\s*:\s*!1\b')
      OR REGEXP_CONTAINS(headers, r'\bSymbol\.toStringTag\b')
      OR headers LIKE "%webpack%"
      THEN 'webpack'

    -- Parcel (include all runtime helpers)
    WHEN REGEXP_CONTAINS(headers, r'\bparcelRequire\b')
      OR REGEXP_CONTAINS(headers, r'\bisParcelRequire\b')
      OR REGEXP_CONTAINS(headers, r'@parcel\/runtime-js')
      OR REGEXP_CONTAINS(headers, r'\bnewRequire\(')
      OR REGEXP_CONTAINS(headers, r'newRequire\.Module')
      OR REGEXP_CONTAINS(headers, r'newRequire\.modules')
      OR REGEXP_CONTAINS(headers, r'newRequire\.cache')
      OR REGEXP_CONTAINS(headers, r'newRequire\.parent')
      OR REGEXP_CONTAINS(headers, r'newRequire\.register')
      OR (REGEXP_CONTAINS(headers, r'\bmodule\.exports\b')
           AND REGEXP_CONTAINS(headers, r'\brequire\('))
      THEN 'parcel'

    -- Vite (Vite uses Rollup in production; keep original patterns for dev)
    WHEN REGEXP_CONTAINS(headers, r'\b__vitePreload\b')
      OR REGEXP_CONTAINS(headers, r'\bimport\.meta\.env\b')
      OR REGEXP_CONTAINS(headers, r'\bmodulepreload\b')
      OR REGEXP_CONTAINS(headers, r'vite\/modulepreload')
      THEN 'vite'

    -- Rollup (CommonJS helpers and ES6 namespace helpers)
    WHEN REGEXP_CONTAINS(headers, r'\bcommonjsGlobal\b')
      OR REGEXP_CONTAINS(headers, r'\bgetAugmentedNamespace\b')
      OR REGEXP_CONTAINS(headers, r'typeof\s+globalThis\b')
      THEN 'rollup'

    -- esbuild (comprehensive helper patterns)
    WHEN REGEXP_CONTAINS(headers, r'\b__commonJS\b')
      OR REGEXP_CONTAINS(headers, r'\b__toModule\b')
      OR REGEXP_CONTAINS(headers, r'\b__markAsModule\b')
      OR REGEXP_CONTAINS(headers, r'\b__toCommonJS\b')
      OR REGEXP_CONTAINS(headers, r'\b__exportStar\b')
      OR REGEXP_CONTAINS(headers, r'\b__create\b')
      OR REGEXP_CONTAINS(headers, r'\b__defProp\b')
      OR REGEXP_CONTAINS(headers, r'\b__getOwnPropDesc\b')
      OR REGEXP_CONTAINS(headers, r'\b__getOwnPropNames\b')
      OR REGEXP_CONTAINS(headers, r'\b__getProtoOf\b')
      OR REGEXP_CONTAINS(headers, r'\b__reExport\b')
      OR REGEXP_CONTAINS(headers, r'\b__require\b')
      OR REGEXP_CONTAINS(headers, r'\b__esm\b')
      OR REGEXP_CONTAINS(headers, r'\b__export\b')
      THEN 'esbuild'

    -- FuseBox (runtime loader patterns)
    WHEN REGEXP_CONTAINS(headers, r'FuseBox\.pkg\(')
      OR REGEXP_CONTAINS(headers, r'FuseBox\.import\(')
      OR REGEXP_CONTAINS(headers, r'\$fsx\.r\(')
      OR REGEXP_CONTAINS(headers, r'\$fsx\.m\(')
      THEN 'fusebox'

    -- Browserify (explicit patterns from fingerprints)
    WHEN REGEXP_CONTAINS(headers, r'\bfunction\s+o\s*\(')
      AND REGEXP_CONTAINS(headers, r'\bMODULE_NOT_FOUND\b')
      THEN 'browserify'

    -- Browserify-like fallback (no other bundler detected)
    WHEN REGEXP_CONTAINS(headers, r'Cannot find module')
      AND REGEXP_CONTAINS(headers, r'\bMODULE_NOT_FOUND\b')
      AND NOT REGEXP_CONTAINS(headers,
         r'__webpack_require__|__webpack_modules__|__webpack_module_cache__|'
       || r'__webpack_require__\.g|__webpack_require__\.d|__webpack_require__\.o|'
       || r'__webpack_require__\.r|webpackChunk|webpackJsonp|loaded\s*:\s*!1|'
       || r'\bl\s*:\s*!1|Symbol\.toStringTag|parcelRequire|isParcelRequire|'
       || r'@parcel\/runtime-js|newRequire\.Module|newRequire\.modules|'
       || r'newRequire\.cache|newRequire\.parent|newRequire\.register|'
       || r'\b__vitePreload|import\.meta\.env|modulepreload|vite\/modulepreload|'
       || r'commonjsGlobal|getAugmentedNamespace|typeof\s+globalThis|'
       || r'__commonJS|__toModule|__markAsModule|__toCommonJS|__exportStar|'
       || r'__create|__defProp|__getOwnPropDesc|__getOwnPropNames|__getProtoOf|'
       || r'__reExport|__require|__esm|__export|FuseBox\.pkg\(|FuseBox\.import\(|'
       || r'\$fsx\.r\(|\$fsx\.m\(|function\s+o\s*\(')
      THEN 'browserify_like'
    ELSE 'unknown'
END as bundle
FROM
  `magnetic-signer-465314-q4.server_side_tracking.responses`
WHERE is_javascript) GROUP by bundle


---- find bundles in cluster
SELECT DISTINCT foo.content_hash, bundle, bar.simhash_hex
FROM
  (
    SELECT
      CASE
        -- Webpack (comprehensive fingerprint coverage)
        WHEN
          REGEXP_CONTAINS(headers, r'\b__webpack_require__\b')
          OR REGEXP_CONTAINS(headers, r'\b__webpack_modules__\b')
          OR REGEXP_CONTAINS(headers, r'\b__webpack_module_cache__\b')
          OR REGEXP_CONTAINS(headers, r'\b__webpack_exports\b')
          OR REGEXP_CONTAINS(headers, r'\b__webpack_hash__\b')
          OR REGEXP_CONTAINS(headers, r'\b__webpack_get_script_filename__\b')
          OR REGEXP_CONTAINS(headers, r'\bwebpackChunk\b')
          OR REGEXP_CONTAINS(headers, r'\bwebpackJsonp\b')
          OR REGEXP_CONTAINS(headers, r'\b__webpack_require__\.g\b')
          OR REGEXP_CONTAINS(headers, r'\b__webpack_require__\.d\b')
          OR REGEXP_CONTAINS(headers, r'\b__webpack_require__\.o\b')
          OR REGEXP_CONTAINS(headers, r'\b__webpack_require__\.r\b')
          -- detect minified runtime helpers and internal keys
          OR REGEXP_CONTAINS(headers, r'\bloaded\s*:\s*!1\b')
          OR REGEXP_CONTAINS(headers, r'\bl\s*:\s*!1\b')
          OR REGEXP_CONTAINS(headers, r'\bSymbol\.toStringTag\b')
          OR headers LIKE "%webpack%"
          THEN 'webpack'

        -- Parcel (include all runtime helpers)
        WHEN
          REGEXP_CONTAINS(headers, r'\bparcelRequire\b')
          OR REGEXP_CONTAINS(headers, r'\bisParcelRequire\b')
          OR REGEXP_CONTAINS(headers, r'@parcel\/runtime-js')
          OR REGEXP_CONTAINS(headers, r'\bnewRequire\(')
          OR REGEXP_CONTAINS(headers, r'newRequire\.Module')
          OR REGEXP_CONTAINS(headers, r'newRequire\.modules')
          OR REGEXP_CONTAINS(headers, r'newRequire\.cache')
          OR REGEXP_CONTAINS(headers, r'newRequire\.parent')
          OR REGEXP_CONTAINS(headers, r'newRequire\.register')
          OR (
            REGEXP_CONTAINS(headers, r'\bmodule\.exports\b')
            AND REGEXP_CONTAINS(headers, r'\brequire\('))
          THEN 'parcel'

        -- Vite (Vite uses Rollup in production; keep original patterns for dev)
        WHEN
          REGEXP_CONTAINS(headers, r'\b__vitePreload\b')
          OR REGEXP_CONTAINS(headers, r'\bimport\.meta\.env\b')
          OR REGEXP_CONTAINS(headers, r'\bmodulepreload\b')
          OR REGEXP_CONTAINS(headers, r'vite\/modulepreload')
          THEN 'vite'

        -- Rollup (CommonJS helpers and ES6 namespace helpers)
        WHEN
          REGEXP_CONTAINS(headers, r'\bcommonjsGlobal\b')
          OR REGEXP_CONTAINS(headers, r'\bgetAugmentedNamespace\b')
          OR REGEXP_CONTAINS(headers, r'typeof\s+globalThis\b')
          THEN 'rollup'

        -- esbuild (comprehensive helper patterns)
        WHEN
          REGEXP_CONTAINS(headers, r'\b__commonJS\b')
          OR REGEXP_CONTAINS(headers, r'\b__toModule\b')
          OR REGEXP_CONTAINS(headers, r'\b__markAsModule\b')
          OR REGEXP_CONTAINS(headers, r'\b__toCommonJS\b')
          OR REGEXP_CONTAINS(headers, r'\b__exportStar\b')
          OR REGEXP_CONTAINS(headers, r'\b__create\b')
          OR REGEXP_CONTAINS(headers, r'\b__defProp\b')
          OR REGEXP_CONTAINS(headers, r'\b__getOwnPropDesc\b')
          OR REGEXP_CONTAINS(headers, r'\b__getOwnPropNames\b')
          OR REGEXP_CONTAINS(headers, r'\b__getProtoOf\b')
          OR REGEXP_CONTAINS(headers, r'\b__reExport\b')
          OR REGEXP_CONTAINS(headers, r'\b__require\b')
          OR REGEXP_CONTAINS(headers, r'\b__esm\b')
          OR REGEXP_CONTAINS(headers, r'\b__export\b')
          THEN 'esbuild'

        -- FuseBox (runtime loader patterns)
        WHEN
          REGEXP_CONTAINS(headers, r'FuseBox\.pkg\(')
          OR REGEXP_CONTAINS(headers, r'FuseBox\.import\(')
          OR REGEXP_CONTAINS(headers, r'\$fsx\.r\(')
          OR REGEXP_CONTAINS(headers, r'\$fsx\.m\(')
          THEN 'fusebox'

        -- Browserify (explicit patterns from fingerprints)
        WHEN
          REGEXP_CONTAINS(headers, r'\bfunction\s+o\s*\(')
          AND REGEXP_CONTAINS(headers, r'\bMODULE_NOT_FOUND\b')
          THEN 'browserify'

        -- Browserify-like fallback (no other bundler detected)
        WHEN
          REGEXP_CONTAINS(headers, r'Cannot find module')
          AND REGEXP_CONTAINS(headers, r'\bMODULE_NOT_FOUND\b')
          AND NOT REGEXP_CONTAINS(
            headers,
            r'__webpack_require__|__webpack_modules__|__webpack_module_cache__|'
              || r'__webpack_require__\.g|__webpack_require__\.d|__webpack_require__\.o|'
              || r'__webpack_require__\.r|webpackChunk|webpackJsonp|loaded\s*:\s*!1|'
              || r'\bl\s*:\s*!1|Symbol\.toStringTag|parcelRequire|isParcelRequire|'
              || r'@parcel\/runtime-js|newRequire\.Module|newRequire\.modules|'
              || r'newRequire\.cache|newRequire\.parent|newRequire\.register|'
              || r'\b__vitePreload|import\.meta\.env|modulepreload|vite\/modulepreload|'
              || r'commonjsGlobal|getAugmentedNamespace|typeof\s+globalThis|'
              || r'__commonJS|__toModule|__markAsModule|__toCommonJS|__exportStar|'
              || r'__create|__defProp|__getOwnPropDesc|__getOwnPropNames|__getProtoOf|'
              || r'__reExport|__require|__esm|__export|FuseBox\.pkg\(|FuseBox\.import\(|'
              || r'\$fsx\.r\(|\$fsx\.m\(|function\s+o\s*\(')
          THEN 'browserify_like'
        ELSE 'unknown'
        END AS bundle,
      content_hash,
      browser_id,
      visit_id
    FROM
      `magnetic-signer-465314-q4.server_side_tracking.responses`
    WHERE is_javascript) foo
    JOIN
      `magnetic-signer-465314-q4.server_side_tracking.ecosystem_candidates` bar
      ON foo.content_hash = bar.content_hash
      AND foo.browser_id = bar.browser_id
      AND foo.visit_id = bar.visit_id
    WHERE bundle != 'unknown'

    ---- update script
FOR r IN (
  SELECT n AS i
  FROM UNNEST(GENERATE_ARRAY(1, 67)) AS n
) DO
  EXECUTE IMMEDIATE FORMAT("""
    UPDATE `magnetic-signer-465314-q4.server_side_tracking.cluster_k8` foo
    SET foo.bundle = bar.bundle
    FROM (
      SELECT
        simhash_hex,
        ANY_VALUE(bundle) AS bundle
      FROM `magnetic-signer-465314-q4.server_side_tracking.js_bundling_in_cluster`
      GROUP BY simhash_hex
    ) bar
    WHERE bar.simhash_hex = foo.cluster_%d
  """, r.i);
END FOR;

----- 1.0
    SELECT CLUSTER, cluster_size, bundle, number_of_site_data FROM `magnetic-signer-465314-q4.server_side_tracking.cluster_k8` WHERE bundle != ""
    SELECT CLUSTER, cluster_size, bundle, number_of_site_data FROM `magnetic-signer-465314-q4.server_side_tracking.cluster_k8` WHERE bundle != "" AND number_of_site_data = 1


