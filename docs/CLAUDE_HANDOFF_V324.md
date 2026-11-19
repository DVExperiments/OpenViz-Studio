# V3.24 handoff

New map-projection.js owns projection choices/validation, custom extent resolution, shortest circular coordinate bounds, uniform fitted spherical/local transforms, contains checks and geographic clipping/unwrapping. Local is legacy middle-latitude-cosine linear display; Mercator clamps to ±85.05112878°; equalArea uses cos30 / sin(latitude)/cos30. Projected polygons retain holes/parts and clip geographic rings before projection. Large-ring extrema use loops, not spread arguments.

Geo and regional renderers share projection for geometry, symbols, name anchors and callouts. Region bounds remain authoritative for supplied symbol-anchor eligibility, while displayed frame may crop them. Quantitative domains remain full-source/per-period, independent of crop. Heat density uses in-frame observations. Locator uses effective geographic frame with its own world projection. Default padding 0; existing region/symbol insets remain.

Defaults: geoProjection local, geoFramePadding 0, geoExtent null. App exposes projection/padding and a staged extent modal with preview/Cancel/Apply/restore auto, stale context guards and Undo. Projection example uses fictional regional data plus authored settings. currentMapExtent supplies UI framing; coordinate Fit uses shortest longitude span across all time data. Country boundary Fit remains unsupported.

Portable imports validate new fields. Scene capture/normalisation explicitly copies geoExtent array; primitive fields follow VIEW_KEYS. Invalid saved settings block scene resolution. Publishing generator 3.24. Source rows, joins, colours, areas and imported geometry are not rewritten. No network dependencies added.

New tests/render: test-map-projection-v324.mjs, render-map-projection-v324.mjs; studio suite extended. Prior automated regressions passed; Chromium launch still fails, Windows/native validation pending. See README/QA_V324.md for caveats. py -m http.server 8000 in extracted index.html directory; localhost:8000 and Ctrl+F5.

Next: choropleth classification and improved legend controls, with explicit break semantics, negative/zero/missing policies, fixed breaks across periods and portable/exported legends. Preserve source safety, reviewed joins and local operation. Full competitor parity requires real-browser same-data comparison.
