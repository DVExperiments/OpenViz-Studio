# V3.21 handoff

Custom GeoJSON mode now supports geo-symbol as well as geo-choropleth. `isRegional` identifies both. `regional-map.js` shares canonical assets, joins, aggregation and boundaries; symbols exclude negative source measures before non-count aggregation. A WeakMap caches deterministic scanline interior anchors in the largest net-area polygon part. Centres account for holes; full circles may overlap boundaries and each other. No topology repair or manual anchors.

Radius uses sqrt(value/max) for area proportionality, including static mode, ignoring the old minimum radius. Time maximum uses per-period regional aggregates, zero radius stays zero, extent/anchors stay fixed. Base colour plus manual region overrides, largest circles first. Boundary paths are non-selectable backgrounds; keyed circles are marks. `time-controls.js` and contracts exempt regional symbols from the ordinary point identity/duplicate constraints and coordinate roles; built-in symbol behaviour remains unchanged.

App Map appearance supports import/review/example/reset for both types and exposes symbol regional calculation, colour/radius/opacity. The review guards chart type in addition to project/chart/data/asset identity. Geometry and joins remain linked to the base chart in story scenes. Exports share geometry and keep existing payload limits. Read README and QA_V321.md for full limits/pending checks.

Run: py -m http.server 8000 in extracted index.html directory, localhost:8000, Ctrl+F5. Node DOM tests accept OPENVIZ_DOM_MODULE pointing at jsdom. New tests: test-regional-symbol-v321.mjs; render-regional-symbol-v321.mjs. Editor test extended in test-studio-v37.mjs. All prior automated regression groups passed; native Chromium launch failed and Windows remains pending.

Next: map labels and locator views. Design collision-aware readable labels and explicit context/anchor semantics; do not imply exact observation locations or geographic parity. Keep source rows unchanged, joins reviewable, geometry portable, and preserve compact tabs, default-open Project, collapsible sidebar and Home Templates.
