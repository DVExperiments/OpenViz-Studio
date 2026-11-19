#!/usr/bin/env node
// Rebuilds the bundled boundary library in src/boundaries/.
//
// Inputs (all public domain), downloaded once into a scratch folder:
//   admin1.geojson      Natural Earth 1:10m admin-1 states/provinces
//                       (ne_10m_admin_1_states_provinces, converted to GeoJSON)
//   admin0_50m.geojson  Natural Earth 1:50m admin-0 countries
//   counties-10m.json   us-atlas counties TopoJSON (US Census cartographic boundaries)
//
// Tools: run `npm i mapshaper topojson-client` in a scratch folder (not in this repo)
// and pass that folder with --modules so the repo stays dependency-free.
//
// Usage:
//   node tools/build-boundaries.mjs --in /tmp/ne --modules /tmp/ms [--out src/boundaries]
//
// Output:
//   src/boundaries/index.js            BOUNDARY_SETS metadata (no geometry)
//   src/boundaries/admin1/ISO3.json    one FeatureCollection per country
//   src/boundaries/us-counties/SS.json one FeatureCollection per US state (FIPS code)
//   src/boundaries/world-detailed.json 1:50m countries for the "Border detail" option
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';

const arg = (name, fallback) => { const i = process.argv.indexOf('--' + name); return i > -1 ? process.argv[i + 1] : fallback; };
const IN = arg('in'), MODS = arg('modules'), OUT = path.resolve(arg('out', 'src/boundaries'));
if (!IN || !MODS) { console.error('Usage: node tools/build-boundaries.mjs --in <inputs> --modules <folder with mapshaper + topojson-client>'); process.exit(1); }
const require = createRequire(path.join(path.resolve(MODS), 'node_modules', 'x.js'));
const mapshaperBin = path.join(path.resolve(MODS), 'node_modules', '.bin', 'mapshaper');
const topojson = require('topojson-client');
const tmp = fs.mkdtempSync(path.join(path.resolve(MODS), 'bnd-'));

const MIN_FEATURES = 2;          // a one-shape set is not useful as a choropleth
const EXCLUDE = new Set(['ATA']); // Antarctica has no meaningful admin-1 layer
const ISO2_RE = /^[A-Z]{2}-[A-Z0-9]{1,3}$/;

function mapshaper(args) { execFileSync(mapshaperBin, args, {stdio: ['ignore', 'ignore', 'inherit']}); }
const slug = s => String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toUpperCase().slice(0, 24) || 'X';
const clean = v => (v == null || v === -99 || v === '-99' || String(v).trim() === '') ? '' : String(v).trim();

function plural(word) {
  const w = word.split('|')[0].trim();
  if (/[^aeiou]y$/i.test(w)) return w.slice(0, -1) + 'ies';
  if (/(s|sh|ch|x|z)$/i.test(w)) return w + 'es';
  return w + 's';
}
function setLabel(types) {
  const counts = new Map();
  for (const t of types) if (t) counts.set(t, (counts.get(t) || 0) + 1);
  if (counts.size === 1) { const [t] = counts.keys(); return plural(t).toLowerCase(); }
  // "Metropolitan department" + "Overseas department" -> "departments"
  const last = new Set([...counts.keys()].map(t => t.split('|')[0].trim().split(/\s+/).pop().toLowerCase()));
  if (last.size === 1) return plural([...last][0]);
  return 'states, provinces & regions';
}

// Join features that share an id into one MultiPolygon, so ids stay unique.
function mergeById(features) {
  const byId = new Map();
  for (const f of features) {
    const id = f.properties.region_id, prev = byId.get(id);
    if (!prev) { byId.set(id, f); continue; }
    const polys = g => g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    prev.geometry = {type: 'MultiPolygon', coordinates: [...polys(prev.geometry), ...polys(f.geometry)]};
  }
  return [...byId.values()];
}
const writeJSON = (file, data) => { fs.mkdirSync(path.dirname(file), {recursive: true}); fs.writeFileSync(file, JSON.stringify(data)); };

// ---- admin-1 ----
const admin1 = path.join(tmp, 'admin1.json');
mapshaper(['-i', path.join(IN, 'admin1.geojson'), '-simplify', '4%', 'keep-shapes', '-filter', '$.isNull === false',
  '-filter-fields', 'name,name_en,name_local,iso_3166_2,adm0_a3,admin,type_en',
  '-o', 'format=geojson', 'precision=0.001', admin1]);
const byCountry = new Map();
for (const f of JSON.parse(fs.readFileSync(admin1, 'utf8')).features) {
  const p = f.properties, iso3 = clean(p.adm0_a3);
  if (!iso3 || EXCLUDE.has(iso3) || !f.geometry) continue;
  (byCountry.get(iso3) || byCountry.set(iso3, {country: clean(p.admin), rows: []}).get(iso3)).rows.push(f);
}
const sets = [];
fs.rmSync(path.join(OUT, 'admin1'), {recursive: true, force: true});
for (const [iso3, {country, rows}] of byCountry) {
  const codes = new Map();
  for (const f of rows) { const c = clean(f.properties.iso_3166_2); if (ISO2_RE.test(c)) codes.set(c, (codes.get(c) || 0) + 1); }
  const features = mergeById(rows.map(f => {
    const p = f.properties, code = clean(p.iso_3166_2), name = clean(p.name) || clean(p.name_en) || code;
    // Natural Earth sometimes reuses one ISO code for several current regions
    // (e.g. old provinces); keep those regions separate with a name-based id.
    const region_id = codes.get(code) === 1 ? code : `${iso3}-${slug(name)}`;
    const props = {region_id, name};
    const local = clean(p.name_local); if (local && local !== name) props.local_name = local;
    const type = clean(p.type_en); if (type) props.type = type;
    props.iso3 = iso3;
    return {type: 'Feature', properties: props, geometry: f.geometry};
  }));
  if (features.length < MIN_FEATURES) continue;
  const label = setLabel(features.map(f => f.properties.type));
  const name = `${country} · ${label.charAt(0).toUpperCase()}${label.slice(1)}`;
  const file = `admin1/${iso3}.json`;
  writeJSON(path.join(OUT, file), {type: 'FeatureCollection', name, features});
  sets.push({id: `admin1-${iso3}`, name, group: 'States & provinces', kind: 'subdivision', iso3, country, count: features.length, file, source: 'ne10'});
}

// ---- US counties ----
const topo = JSON.parse(fs.readFileSync(path.join(IN, 'counties-10m.json'), 'utf8'));
const states = new Map(topojson.feature(topo, topo.objects.states).features.map(f => [String(f.id).padStart(2, '0'), f.properties.name]));
const counties = path.join(tmp, 'counties.json');
fs.writeFileSync(path.join(tmp, 'counties-in.json'), JSON.stringify(topojson.feature(topo, topo.objects.counties)));
mapshaper(['-i', path.join(tmp, 'counties-in.json'), '-simplify', '25%', 'keep-shapes', '-o', 'format=geojson', 'precision=0.001', counties]);
const byState = new Map();
for (const f of JSON.parse(fs.readFileSync(counties, 'utf8')).features) {
  const fips = String(f.id ?? f.properties.id ?? '').padStart(5, '0'), st = fips.slice(0, 2);
  if (!states.has(st) || !f.geometry) continue;
  (byState.get(st) || byState.set(st, []).get(st)).push({type: 'Feature', properties: {region_id: fips, name: f.properties.name, state: states.get(st)}, geometry: f.geometry});
}
fs.rmSync(path.join(OUT, 'us-counties'), {recursive: true, force: true});
for (const [st, rows] of [...byState].sort()) {
  const features = mergeById(rows);
  if (features.length < MIN_FEATURES) continue;
  const state = states.get(st), name = `${state} · Counties`, file = `us-counties/${st}.json`;
  writeJSON(path.join(OUT, file), {type: 'FeatureCollection', name, features});
  sets.push({id: `uscounties-${st}`, name, group: 'US counties', kind: 'county', iso3: 'USA', country: 'United States', state, count: features.length, file, source: 'census'});
}

// ---- detailed world ----
const world = path.join(tmp, 'world.json');
mapshaper(['-i', path.join(IN, 'admin0_50m.geojson'), '-simplify', '30%', 'keep-shapes',
  '-filter', 'ADM0_A3 != "ATA"', '-o', 'format=geojson', 'precision=0.01', world]);
const worldFeatures = JSON.parse(fs.readFileSync(world, 'utf8')).features.map(f => {
  const p = f.properties, iso3 = clean(p.ADM0_A3) || clean(p.adm0_a3);
  return {type: 'Feature', properties: {region_id: iso3, name: clean(p.NAME) || clean(p.name), iso3, iso2: clean(p.ISO_A2_EH) || clean(p.ISO_A2), continent: clean(p.CONTINENT), subregion: clean(p.SUBREGION)}, geometry: f.geometry};
}).filter(f => f.geometry);
writeJSON(path.join(OUT, 'world-detailed.json'), {type: 'FeatureCollection', features: mergeById(worldFeatures)});

sets.sort((a, b) => a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === 'subdivision' ? -1 : 1);
fs.writeFileSync(path.join(OUT, 'index.js'),
  '// Generated by tools/build-boundaries.mjs from Natural Earth 1:10m admin-1 (public domain)\n' +
  '// and US Census county boundaries via us-atlas (public domain).\n' +
  '// Each set is a separate file loaded only when used. See docs/BOUNDARY_LIBRARY.md.\n' +
  'export const BOUNDARY_SETS=' + JSON.stringify(sets) + ';\n');
fs.rmSync(tmp, {recursive: true, force: true});
console.log(`Wrote ${sets.length} boundary sets and world-detailed.json to ${OUT}`);
