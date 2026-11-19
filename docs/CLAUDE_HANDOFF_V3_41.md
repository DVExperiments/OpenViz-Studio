# V3.41 handoff

Adds route tooltip customisation and selected source fields. 44 chart options, eight time-enabled types. 42 passing suites; native browser/Windows/touch/screen reader acceptance pending (Chromium exits before page open).

route-map.js validates shared tooltip settings; routeReport retains sourceRows only when custom extra fields are active. Grouping accumulates all contributors separately from the existing eight-row index sample. routeTooltipText reuses mapTooltipText with routeAggregation, then appends required ID/view-row/cap/illustrative notices and optional supplied origin/destination coordinates. No invented measure/no-data state for unweighted routes. Custom route marks have data-map-tooltip for existing keyboard/hover interactions. XML aria-label line breaks use character references. Geometry, grouping and width calculations are unchanged.

app.js exposes the existing staged dialog from route Map appearance; route wording/coordinate toggle and stale-context binding guard include route roles/aggregation/saved period. Existing tooltip settings schema, field limits and source dependency guards are reused. readable-data.js includes route custom extra fields within prior table limits. Story appearance remains captured; geoTooltipFields remain linked source bindings. Automatic route rendering retains legacy details.

New tests/test-route-tooltips-v341.mjs plus extended studio suite cover contributor completeness, ID/period values, count/unweighted semantics, literal text/runtime safety, source isolation, binding rename/delete/switch, exports and dialog Preview/Cancel/Apply/Undo. Full previous suites pass. Generator render-route-tooltips-v341.mjs writes 48 SVG fixtures, six HTML examples and portable JSON with service/fare fields.

Next batch: heatmap time playback using fixed colour domains across all included periods. Review missing-cell versus zero semantics, stable row/column domains and per-period aggregation; keep dashboard/story saved snapshot behaviour explicit and test source invariance/export payload bounds. Do not claim parity without matched datasets and native export acceptance.
