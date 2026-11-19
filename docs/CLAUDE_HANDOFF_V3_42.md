# V3.42 handoff

Categorical heatmap time playback implemented; 44 chart options/nine snapshot-enabled types/43 passing suites. Native Chromium exits before page open; browser/touch/Windows/screen reader acceptance pending.

New heatmap-time.js provides heatmapTimeMatrix (valid labels, finite measures except Count, complete exact cell grouping) and heatmapTimeDomain (ordered-period categorical union, zero-anchored min/max, dimension/overflow rejection). Per-period mean divides before accumulating to handle large finite measures. Time mode caps 32 columns/16 rows across all included periods; static matrix code retains earlier semantics.

time-controls.js includes heatmap and validates distinct roles/timeline matrix. Snapshot settings carry kind:heatmap/categories/series/min/max. Warnings explain per-period aggregates, exclusions, missing-vs-zero, sequential range and overrides. charts.js uses timed cells in chartData/rendering, common domains/opacity, full empty grids, period-aware accessible details and optional common-reference legend. SVG domain is transient; source data untouched. IncludeDataTable uses existing explicit bound-column delivery.

Internal override heatmapTimeSourceRows parallels routeTimeSourceRows: dashboard compiler uses full source to choose saved index/domain then intersects visible row references. app.js and dashboard-interactive.js supply it only for timed heatmaps. It is not persisted or embedded as an extra raw dataset. Static/dashboard/story output remains saved period; interactive chart HTML uses snapshot player. Data contracts allow unmapped Count measure and separate period from both categorical roles. Time example includes 2020/2021/2022/2024, invalid-only 2022 numeric period, zero, signed and repeated cells.

New test-heatmap-time-v342.mjs plus studio extension cover matrix math, identity/positions/colour, source safety, numeric and size bounds, portable/rename/story, filter semantics and executed exported scripts. Spatial-time test supported-type count is nine. Generator writes six HTML examples, portable JSON and 48 SVGs; representative comparison docs/v342-heatmap-time.png.

Next: stacked-column time playback with stable series colours and fixed value scales. Review positive/negative stack semantics, full-series order, missing-vs-zero, timeline totals and saved-period dashboard filtering. Do not claim parity without matched-dataset native acceptance.
