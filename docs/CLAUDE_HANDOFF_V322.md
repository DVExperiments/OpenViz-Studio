# V3.22 handoff

New `src/map-furniture.js` shares map label placement and the world extent inset. It imports the bundled WORLD and chart-quality metrics, without importing either map renderer, avoiding cycles. Normalised Natural Earth world path is precomputed; locator extent handles wrap and minimum visible markers. Locator is optional/default off; omitted under 140×110 plot size.

`mapLabels` uses at most 80 placed labels, estimated Arial widths and candidate order, skips out-of-bounds/unplaceable names, reserves prior label/locator/symbol boxes, and draws leader lines for displaced labels. Decorative aria-hidden group does not add duplicate point targets. Full labels use escaped titles. Do not claim true browser collision certification or complete cartographic optimisation.

Custom renderer labels all boundary regions using reviewed label properties and existing regionalAnchor, regardless of current values. Symbol clearance uses fixed maximum radius for stable conservative placement. Built-in choropleths label matched countries via existing approximate centres; symbols use place positions. Heat supports locator only. Ordinary legacy showLabels remains when new map names are off; new names suppress old raw symbol labels while on.

Defaults in charts.js: geoShowLabels/geoShowLocator false, geoLabelSize 11, geoLabelColor empty (follows text colour), geoLocatorColor #e65c37. App numeric setting list includes geoLabelSize. Map appearance exposes toggles, colours, size and undoable labels/locator example. Publishing generator is 3.22. Story state naturally captures these visual fields; shared geometry and data joins remain on base chart. No source row mutation, network services or chart count increase.

New tests/render: test-map-context-v322.mjs, render-map-context-v322.mjs; studio test extended. All prior automated suites passed. Normal Chromium launch failed, so native Windows/browser checks remain pending. See README/QA_V322.md. Run py -m http.server 8000 from extracted index.html folder, then localhost:8000 and Ctrl+F5.

Next: manual map label and symbol anchor placement plus geographic annotations. Preserve reviewed joins, unmodified source rows, portable geometry, per-period fixed scales and readable responsive exports. Full competitor parity requires same-data real-browser comparisons.
