# V3.20 handoff

## Delivered

Custom local Polygon/MultiPolygon GeoJSON choropleths. New pure `src/regional-map.js` owns bounded ingestion, canonical immutable assets, explicit joins/reports, per-period domains and fitted SVG rendering. `src/regional-example.js` provides fictional test districts. `geo.js` dispatches only custom choropleths; built-in maps remain available.

`app.js` stages asset/key/label/match/data-column/credit in a modal, validates before Apply, rejects stale project/chart/data contexts and tracks Undo. Never mutate source rows. Boundary assets are shared by story scenes, not copied into scene settings. Imported portable projects validate geometry. Time HTML reuses paths; generic static category filtering is disabled for custom maps. See README for limits and semantics.

## Architecture cautions

Assets and cached indexes are treated as immutable; replace the whole asset when changing geometry or credit. Cache is WeakMap-backed with eight indexes per asset. No fuzzy aliases: exact displayed text default, explicit trim/NFC/case fold optional. Match boundary keys must be unique. Preserve leading zeros. Exclude unmatched or invalid measures from scales; zero is valid. Fixed time colour range must use per-period aggregates, not the combined review totals. Keep boundary extent fixed across periods.

Preserve evenodd holes, all MultiPolygon parts, credits in metadata and optional visible note. Do not claim topology validation, equal-area projection or real administrative accuracy for example shapes. Native browser/Windows coverage is pending; see QA_V320.md.

## Run / tests

`py -m http.server 8000` in the extracted index.html directory; http://localhost:8000, Ctrl+F5.

Node test files are in tests. DOM suites accept OPENVIZ_DOM_MODULE pointing to a jsdom module; otherwise use installed jsdom. Run the regional suite and studio suite after UI changes, plus relevant time/story/export contracts when those paths change. No dependencies are bundled; application remains native browser ES modules.

## Next batch

Extend custom region geometry to proportional-symbol maps, then improve labels/locator views. Define explicit point-placement semantics (centroid can fall outside concave regions or holes; representative interior point or supplied coordinates may be needed), consistent area scaling and time domains. Keep joins reviewable and original rows intact. Do not silently reinterpret choropleth geometry as point observations. Full competitor parity requires same-data real-browser comparisons.
