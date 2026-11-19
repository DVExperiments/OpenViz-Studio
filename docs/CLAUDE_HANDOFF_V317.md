# OpenViz Studio V3.17 handoff

V3.17 extends time snapshots to scatter, bubble, choropleth and proportional symbols (seven supported types; 43 chart options unchanged). Read README.md and QA_V317.md.

## Main implementation

- src/time-spatial.js: exact entity keys, optional canonical country-centroid keys, stable hashed palette with explicit overrides, strict point data, fixed XY/size and geographic domains.
- src/time-controls.js: period/identity validation, duplicate examples, missing-ID exclusion, 400-point cap, escaped payload byte budget, fixed snapshot settings, shared geometry dictionary and self-contained local restoration. Existing shared clock and transient capture remain unchanged.
- src/geo.js: per-period country aggregate domains; full-timeline Fit bounds, fixed symbol area maximum, ID colours, responsive radius/projection padding and fixed-scale legend. Ordinary map behaviour remains separate from derived time domains. Public-domain boundaries remain bundled.
- src/charts.js: discards raw timeDomain on entry; derives it only for enabled supported time views. Fixed XY ticks, data keys, proportional area, empty-period annotations and entity/size legends. Fixed domains bypass potentially overflowing natural tick calculations.
- src/time-examples.js: illustrative values and approximate locations; reversed source order/missing observation intentionally exercise identity.
- src/app.js: explicit entity control, editable example creation/Undo, point-colour wording and safe special-property override storage.
- field-bindings/data-contracts/dataset-edit/data: entity/time columns participate in reviews, rename/removal/refresh. dashboard-links avoids inferring joins between a separate coordinate entity and the category field, and resolves canonical centroid keys.

Do not persist derived timeDomain, fake missing observations, join points by row index, pool years for choropleth domains or renormalise circle sizes per period. Colour hashes may collide in the finite palette; identity keys and tooltip details remain exact. Constant domains expand for visibility. Point views require one source record per entity/period; ambiguous duplicates stop playback.

Examples: examples/v317-spatial-time.json, companion CSV, four v317-*-time.html standalone files. tests/test-spatial-time-v317.mjs and render-spatial-time-v317.mjs add coverage; studio and v316 suites updated. QA uses actual SVG and serialised HTML runtime, with CairoSVG pixels, not a successful native browser session.

Next: richer Story Studio chart states and scene transitions. Preserve source-safe capture/Undo and static fallback; avoid presenting transitions as new observations. Native browser/Windows video validation, ordinary snapshot GIF/video, time heatmaps and broader map boundaries remain pending. Do not claim complete Flourish parity.

Keep compact Preview/Data, default-open Project, collapsible sidebar, reviewed data switching, Home Templates/search and map-source note toggle. Deliver a complete ZIP, Windows server command, concise evidence/limits and what's next.
