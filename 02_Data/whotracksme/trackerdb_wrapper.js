import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import loadTrackerDB from '@ghostery/trackerdb';

// ES-Module __dirname Ersatz
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// engine Pfad robust bestimmen
const enginePath = path.resolve(
  __dirname,
  "node_modules",
  "@ghostery",
  "trackerdb",
  "dist",
  "trackerdb.engine"
);

const engine = readFileSync(enginePath);
const trackerDB = await loadTrackerDB(engine);

// Argument aus Python laden
const input = JSON.parse(process.argv[2]);

let result = {};

if (input.type === "domain") {
    result = await trackerDB.matchDomain(input.value);
}

if (input.type === "url") {
    result = await trackerDB.matchUrl(
        {
            url: input.value,
            type: input.req_type ?? "xhr",
            sourceUrl: input.source ?? input.value
        },
        { getDomainMetadata: true }
    );
}

// JSON auf stdout zurückgeben
console.log(JSON.stringify(result));
