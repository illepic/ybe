#!/usr/bin/env node
// Decode a Trailforks map JSON into a clean GeoJSON FeatureCollection of trails.
//
// The source "geometry" objects claim type:"LineString" but carry their points
// in `encodedpath` (Google encoded polyline, precision 5, lat/lng) instead of a
// real coordinates array. This decodes them to standard [lng,lat] coordinates
// and keeps just the bits we care about: name, color, difficulty.
//
// General-purpose companion to extract-map.mjs: dumps EVERY trail (not just the
// curated map subset), useful when scouting trails to add to extract-map.mjs.
//
// Usage:
//   node src/data/scripts/decode-trailforks.mjs <input.json> [output.geojson] [--simple] [--bike]
//     --simple : decode `simplepath` (far fewer points) instead of `encodedpath`
//     --bike   : keep only trails whose activitytypes include "1" (mountain bike)
//
// Example:
//   node src/data/scripts/decode-trailforks.mjs src/data/trailforks.json /tmp/all-trails.json --bike

import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const [inPath, outPath] = args.filter((a) => !a.startsWith('--'));
if (!inPath) {
  console.error(
    'Usage: node decode-trailforks.mjs <input.json> [output.geojson] [--simple] [--bike]'
  );
  process.exit(1);
}

// Google encoded-polyline decoder → array of [lng, lat] (GeoJSON order).
const decodePolyline = (str, precision = 5) => {
  const factor = 10 ** precision;
  let index = 0,
    lat = 0,
    lng = 0;
  const coords = [];
  while (index < str.length) {
    let result = 0,
      shift = 0,
      byte;
    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    result = 0;
    shift = 0;
    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    coords.push([lng / factor, lat / factor]);
  }
  return coords;
};

const src = JSON.parse(readFileSync(inPath, 'utf8'));
const key = flags.has('--simple') ? 'simplepath' : 'encodedpath';

const features = src.features
  .filter((f) => f.properties?.type === 'trail' && f.geometry?.[key])
  .filter((f) => (flags.has('--bike') ? `,${f.properties.activitytypes},`.includes(',1,') : true))
  .map((f) => ({
    type: 'Feature',
    id: f.properties.id,
    properties: {
      name: f.properties.name,
      color: f.properties.color,
      difficulty: f.properties.difficulty,
      trailtype: f.properties.trailtype,
      direction: f.properties.direction,
    },
    geometry: { type: 'LineString', coordinates: decodePolyline(f.geometry[key]) },
  }));

const fc = { type: 'FeatureCollection', features };
const json = JSON.stringify(fc);

if (outPath) {
  writeFileSync(outPath, json);
  console.error(
    `Wrote ${features.length} trails → ${outPath} (${(json.length / 1024).toFixed(1)} KB)`
  );
} else {
  process.stdout.write(json);
  console.error(`\n${features.length} trails decoded`);
}
