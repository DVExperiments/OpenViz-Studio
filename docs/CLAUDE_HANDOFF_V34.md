# OpenViz Studio V3.4 — engineering hand-off

## Baseline and principles
- Direct descendant of V3.3.1, with no framework migration. Static browser ES modules, SVG chart engine, local-first storage, no API or AI model.
- Preserve project schema and original imported `rawRows`, chart mappings, presentation export options, story keyframes and recovery protections.
- Minimise duplicated navigation; the Project navigator remains the workspace navigation, menu dropdowns remain contextual.

## New functions and locations
- `src/app.js`: the Home card now uses `home-import-data`. `inputF('data','home-data')` parses before `startNewProject(true)`; the XLSX worksheet picker carries `newProject`. `startNewProject` returns an explicit boolean status so a storage conflict can abort a switch. Empty dataset UI uses an accessible `<details>` disclosure for the example action.
- `src/dashboard-links.js`: `chartCanSelect`, `markCategory`, `matchesCategory`, `matchingRows`, `validSelection`. The mark-selection contract requires the chart's plotted category dimension to match the configured linked field; don't infer joins from numeric coordinates. Choropleth ISO keys are resolved via `geoCanonicalValue` exported from `src/geo.js`.
- `src/app.js`: `renderDashboard`, `dashboardClickMark`, `dashboardClearSelection`, and `setDashboardInteractionMarkers`. Selected categories are session UI state; `sharedFilterField` and `interactionMode` are saved on the dashboard object. `data-dash-category` and SVG keyboard attributes are added to eligible marks after render. `filter` recomputes from matching source rows; `highlight` only dims/hilites marks.
- `src/dashboard-interactive.js`: standalone HTML export contains its own CSS/script and static SVG templates. It does not depend on external scripts or fetch. The field selection is bounded to 250 categories for editor discoverability, and exported per-category filtering to 24 to avoid file bloat. For larger fields, export explicitly switches to highlight and states that in the HTML. Invalid imported mode values are sanitised to an allowlist before script embedding.
- `src/styles.css`: secondary sample disclosure and dashboard selection visuals.

## Regression and test commands
```
node --check src/app.js
node --check src/dashboard-interactive.js
node --check src/dashboard-links.js
node tests/test-v34-contract.mjs
node tests/test-v331-contract.mjs
python tests/test-browser-v34.py
```
The isolated Chromium integration passed once with screenshots; a later rerun stalled after additional source guards were added. See `QA_V34.md` for exact evidence and unresolved verification; don't assume all the repeated tests passed.

## High-priority next engineering work
1. Run an actual HTTP-origin browser test with IndexedDB across reloads and multi-tab conflicts; test user-owned large XLSX with multiple worksheets.
2. Create a controlled metadata/join design for different field names and cross-dataset entities; don't silently infer joins.
3. Explore dynamic offline chart aggregation to support multi-category and >24-category filtering without rendering one SVG for every category combination.
4. Improve mapping and selection within advanced diagrams while making their source/target/weight semantics explicit.
5. Keyboard, accessibility and cross-browser tests (Firefox/Safari); full export fidelity and styling after linked selections.
