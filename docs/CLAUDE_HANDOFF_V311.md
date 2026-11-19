# V3.11 handoff

New modules: chart-quality.js (pure fitting/contrast/guidance), chart-interactions.js (shared delegated runtime), readable-data.js (bounded opt-in source snapshots), responsive-chart.js (three pre-rendered HTML SVG layouts). Never interpolate user data into executable scripts. Table source templates are escaped HTML. Source values remain separate from aggregated/filtered mark values. Keep includeDataTable false by default.

charts.js wraps headers/reserves margin, provides source/description metadata and fixes old missing-value handling in box/matrix preparation. exports.js uses responsive layouts and a shared HTML enhancer. dashboard-interactive.js uses the same runtime/responsive wrappers; existing data-cross-value buttons retain selection keyboard handlers. publishing.js keeps static HTML script-free and adds optional static source tables outside dashboard cards. Geo clip IDs include layout geometry to avoid cross-layout clipping collisions. Editor device previews use logical 360/700 widths without changing saved settings. Source credits/alt text are chart properties, portable with the existing project schema.

Keep existing compact editor, open Project panel, reviewed source switching, collapsible sidebar, Templates Home and map-note toggle. Catalogue count remains 41. See QA_V311 and PARITY_V311 for exact limits/pending browser work. Stories remain fixed-canvas and do not include the optional source-table component.

Next: actual browser and Windows smoke tests, screen-reader testing, repeated same-data competitor output review, then rich table templates and expanded maps. Avoid expanding the catalogue merely to increase its count.
