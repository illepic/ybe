#!/usr/bin/env node
// Curate the Trailforks dump (src/data/trailforks.json) down to the handful of
// trails, roads, and POIs we actually show on the map. Line features are decoded
// from their `encodedpath` to real [lng,lat] coordinates (the raw encoded string
// is dropped — trailforks.json stays as the encoded source of truth).
//
// Regenerate src/data/trails.json after editing the TRAILS/ROADS/POIS lists:
//   npm run gen:trails
//   (= node src/data/scripts/extract-map.mjs src/data/trailforks.json src/data/trails.json)

import { readFileSync, writeFileSync } from 'node:fs';

const [inPath, outPath = 'src/data/trails.json'] = process.argv.slice(2);

const TRAILS = [
  'Sixth Sense',
  'Cold Creek',
  'Thrillium',
  "Murphy's Grade - Upper",
  "Murphy's Grade - Lower",
  'Vista Ridge',
  'Top Top',
  'Meadow Connector',
  'Tower to Meadow',
];
const ROADS = ['Dole Valley Rd', 'L1500 Road', 'L1050 Road', '1070 Road', 'L1510 Road'];
const POIS = [
  'Yacolt Burn Trailhead Parking',
  'Bridge/Thrillium Shuttle Parking',
  'Larch Mountain Trailhead Parking Lot',
  'Radio Towers',
  '5 Corners Junction',
];

// Google encoded-polyline decoder → [lng, lat] (GeoJSON order), rounded to 5dp.
const decodePolyline = (str) => {
  let i = 0,
    lat = 0,
    lng = 0;
  const out = [];
  while (i < str.length) {
    let r = 0,
      s = 0,
      b;
    do {
      b = str.charCodeAt(i++) - 63;
      r |= (b & 0x1f) << s;
      s += 5;
    } while (b >= 0x20);
    lat += r & 1 ? ~(r >> 1) : r >> 1;
    r = 0;
    s = 0;
    do {
      b = str.charCodeAt(i++) - 63;
      r |= (b & 0x1f) << s;
      s += 5;
    } while (b >= 0x20);
    lng += r & 1 ? ~(r >> 1) : r >> 1;
    out.push([+(lng / 1e5).toFixed(5), +(lat / 1e5).toFixed(5)]);
  }
  return out;
};

const src = JSON.parse(readFileSync(inPath, 'utf8'));
const byName = (names, pred) => (f) => names.includes(f.properties?.name) && pred(f);

const line = (category) => (f) => ({
  type: 'Feature',
  id: f.properties.id,
  properties: {
    name: f.properties.name,
    category,
    color: f.properties.color,
    difficulty: f.properties.difficulty,
    direction: f.properties.direction,
  },
  geometry: { type: 'LineString', coordinates: decodePolyline(f.geometry.encodedpath) },
});

// POIs that are shuttle drop-off destinations (rendered with a truck icon).
const SHUTTLE = new Set([
  'Larch Mountain Trailhead Parking Lot',
  '5 Corners Junction',
  'Radio Towers',
]);
const point = (f) => ({
  type: 'Feature',
  id: f.properties.id,
  properties: {
    name: f.properties.name,
    category: 'poi',
    icon: f.properties.icon,
    shuttle: SHUTTLE.has(f.properties.name),
  },
  geometry: f.geometry,
});

const roads = src.features
  .filter(byName(ROADS, (f) => f.properties.type === 'trail' && f.properties.primary === 1))
  .map(line('road'));
const trails = src.features
  .filter(byName(TRAILS, (f) => f.properties.type === 'trail' && f.properties.primary === 1))
  .map(line('trail'));
const pois = src.features.filter(byName(POIS, (f) => f.properties.type === 'poi')).map(point);

// Warn on anything requested that didn't match.
const found = new Set([...roads, ...trails, ...pois].map((f) => f.properties.name));
for (const n of [...TRAILS, ...ROADS, ...POIS])
  if (!found.has(n)) console.error(`!! no match: "${n}"`);

const fc = { type: 'FeatureCollection', features: [...roads, ...trails, ...pois] };
writeFileSync(outPath, JSON.stringify(fc));
console.error(
  `Wrote ${fc.features.length} features (${roads.length} roads, ${trails.length} trails, ${pois.length} pois) → ${outPath}`
);
