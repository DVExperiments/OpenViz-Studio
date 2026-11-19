# V3.23 handoff

New `src/map-authoring.js` validates canonical display settings (geoLabelPositions, geoSymbolAnchors, geoAnnotations), resolves custom-region anchor fallback and renders geographic callouts. Labels use plot-normalised centres/hidden flags; symbols use lon/lat within the custom extent; annotations use lon/lat point plus plot-normalised text centre. Canonical objects use Object.fromEntries and the UI uses defineProperty for arbitrary reviewed IDs. Limits: 80 label overrides, 2,000 anchors, 20×240-char callouts.

`map-furniture.js` gives manual names priority, clamps text inside the plot, allows explicit overlaps, and hides chosen names. Automatic placement otherwise stays as before. Regional renderer uses supplied display anchors for circles and label leaders without changing values, scales, bounds or geometry. Geo renderers draw coordinate callouts after locator. `geo.js` exports mapEditableTargets for exact rendered IDs. Built-in point locations are source-derived and do not accept custom-region anchor overrides.

App has a staged map editor with preview, label/anchor reset, callout add/edit/remove, all-reset, Cancel and Apply. Apply validates project/chart/type/dataset/row reference/asset/current authoring and commits one Undo entry. Form edits require Set/Add/Save before Apply. No direct canvas drag. Authored example shares fictional regional data; regionalAuthoredSettings supplies the visual example settings.

Portable import validates authoring on every chart. Story capture/normalise explicitly includes these object/array fields; old saved scenes without them retain base-chart values. Invalid saved authoring blocks scene resolution. New module imports chart-quality only, avoiding renderer cycles. Defaults and publishing generator updated to 3.23.

Tests: new test-map-authoring-v323.mjs and render-map-authoring-v323.mjs, extended studio suite. Prior automated groups passed. Native Chromium launch failed; Windows/browser validation pending. README/QA_V323.md detail semantics. Run py -m http.server 8000 from extracted index.html directory, localhost:8000, Ctrl+F5.

Next: projection options and improved geographic framing, retaining reviewed joins, immutable source rows, fixed per-period scales, portable assets and compact editor UI. Do not claim complete competitor parity without real browser same-data comparisons.
