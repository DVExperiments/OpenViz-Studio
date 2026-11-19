# OpenViz Studio V3.8 — QA

Status: development build. DOM integration and Node contracts pass; no new real-browser visual or persistence certification.

## Implemented

Data-source selectors stage a Review data connection dialog. Exact compatible bindings are preserved first. Unique case-insensitive or named semantic matches, and a sole eligible required column, can be suggested with an explicit review label. Multiple plausible matches stay empty. Optional unavailable fields are cleared; parallel dimensions preserve compatible numeric fields. Old inactive bindings are cleared in the proposed settings rather than leaking into a new source.

Required and numeric/date field types, distinct scalar roles, paired geographic coordinates and 2–8 distinct parallel dimensions are checked before applying. Date role compatibility allows numeric dates, matching the renderer's existing conventions; this is not semantic date validation. Chart-specific renderer warnings still appear, and applying a structurally complete mapping with data warnings is permitted. The review includes a chart preview once required connections are complete.

No source, chart or project changes occur during review. Apply checks project identity, chart/source identity and the edit sequence to reject stale reviews, then commits one undoable change. Both datasets and other charts are preserved. Chart titles, annotations and appearance remain user-controlled.

Mapping controls now follow each chart contract: unused fields are hidden, optional fields have an explicit None choice, and unresolved bindings show a choice placeholder rather than silently displaying the first column. Data and catalogue show requirements and bounded illustrative examples. Preview and Data show calculation summaries. Data exposes one aggregation control only for types that use ordinary aggregation; raw, distribution, graph, geographic and temporal charts have specific explanations. Contextual notes provide alternatives for potentially misleading chart choices. The existing adviser remains available.

Histogram bins and scatter rows now exclude null/empty/whitespace observations rather than coercing them to zero. Real zero values remain included.

## Passed automated checks

- node --check src/app.js and src/data-contracts.js.
- node tests/test-data-contracts-v38.mjs: all 25 example contracts, non-mutating proposals, typed/exact/case-insensitive preservation and suggestions, ambiguous fields, optional clearing, distinct bindings, coordinate pairs, parallel requirements, calculation summaries, guidance and blank/zero integrity.
- tests/test-studio-v37.mjs with jsdom: reviewed switch/apply/preview/undo for all 25 chart types; different-schema manual mappings; cancel; blocking unresolved required choices; rejection of an intervening edit; retained titles, datasets and other charts; calculation summary updates; data requirements and catalogue example tables. Existing column rename, direct editing, tab keyboard/focus, presets, dashboard structure, collapsed tree and publishing entry checks remain passing.
- node tests/test-publishing-v35.mjs.
- node tests/test-v34-contract.mjs.
- node tests/test-v331-contract.mjs.
- node tests/test-storage-v31.mjs.
- node tests/test-performance-v33.mjs (100,000-row profile/scatter accuracy and bounded previews, 50,000-row CSV, graph totals).

The DOM test uses mocked storage and an external jsdom development dependency. Set OPENVIZ_DOM_MODULE to its absolute module path if it is not installed on Node's module path. jsdom is not an application dependency.

## Pending acceptance

Serve the actual build on localhost and check Chrome/Edge, Firefox and Safari. Inspect the review dialog's keyboard/focus flow, dropdown widths, long column names, examples, dark/light contrast, scrolling and narrow screens. Test Excel/CSV/TSV/JSON import, different-schema switches, refresh, save/reopen and project export/import in a normal browser origin. Verify rendered exports in actual PDF/PPTX/HTML viewers.

Earlier browser limitations remain as documented in QA_V37.md. These Node/DOM tests establish functional behaviour for covered cases, not pixel accuracy, screen-reader certification or full statistical validity. Legacy injected-module Python browser harnesses predate data-contracts.js and need updating for the new import before reuse.

Known boundaries: live manual field editing and changing chart types retain their existing behaviour; the new staged review applies to dataset-source switching. Suggestions cannot infer semantic equivalence. Numeric/type checks may rely on the existing 5,000-observation field profiler. Renderer warnings and bounded/sampled chart limits still apply. A full audit of other chart calculations is outside this release.
