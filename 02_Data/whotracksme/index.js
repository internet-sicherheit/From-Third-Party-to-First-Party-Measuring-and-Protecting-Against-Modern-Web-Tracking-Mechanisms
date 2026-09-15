import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import loadTrackerDB from '@ghostery/trackerdb';

// __dirname-Äquivalent für ES-Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pfad zur Engine-Datei relativ zu diesem Projektordner
const enginePath = path.resolve(
  __dirname,
  'node_modules',
  '@ghostery',
  'trackerdb',
  'dist',
  'trackerdb.engine',
);

// Engine von der Platte laden
const engine = readFileSync(enginePath);

const trackerDB = await loadTrackerDB(engine);

const domainMatches = await trackerDB.matchDomain('google.com');
console.log('domainMatches:', domainMatches);

const urlMatches = await trackerDB.matchUrl(
  {
    url: 'https://google.com/gen_204',
    type: 'xhr',
    sourceUrl: 'https://google.com/',
  },
  {
    getDomainMetadata: true,
  },
);
console.log('urlMatches:', urlMatches);
