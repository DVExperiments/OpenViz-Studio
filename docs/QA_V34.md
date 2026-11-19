# OpenViz Studio V3.4 — QA and release notes

**Status:** Development release candidate; not yet a fully certified public release.

## Changes

1. **Home → Import your data:** the file is parsed before creating a separate blank project, named for the file (extension removed). The currently active/old project is saved or protected by existing conflict safeguards before switching. Cancelling the picker or failing to parse does not intentionally mutate an old project. Multi-worksheet Excel files defer project creation until a nonempty sheet is chosen.
2. **Blank project:** sample data is behind an optional expandable explanation. The primary empty-state call to action is importing the user's own file; the example creates a separate sample project.
3. **Linked dashboard selection:** set *Linked field* to a shared category and choose Highlight, Filter, or Disable. Click compatible marks in the grid or free canvas; Shift/Ctrl/Cmd-click toggles multiple categories; clear selection resets. Keyboard-focused SVG marks accept Enter/Space; Escape clears selection. Highlight does not recalculate axes. Filter does recalculate charts from matching rows; all source datasets are preserved.
4. **Map link support:** choropleth ISO-code marks are resolved back to the original country-name/ISO field before linking to category charts.
5. **Standalone interactive HTML:** self-contained, no external services. Offline highlight works on supported marks and 1-category filtered HTML works when the shared field has at most 24 values. For larger fields, filter exports automatically use highlight-only mode **with an explicit visible notice**, avoiding hundreds of heavy precomputed SVG variants. The editor still supports multi-category filtering in the current browser session.
6. **High-cardinality category fields:** up to 250 shared distinct values may be considered; above that they are omitted to avoid misleading joins and excessive memory. Only exact same field names and common values qualify. Charts whose marks don't represent the linked dimension can receive filtering but aren't made clickable selection sources.

## Executed checks

- `tests/test-browser-v34.py` — **passed** in isolated Chromium on the initial integrated build: new project on Home CSV import; sample dataset disclosure; mark selection across two charts; Shift multi-selection; filter/reset; offline HTML click and reset; country ISO-mark selection linked to a bar chart. Screenshots `v34-dashboard-interactions.png`, `v34-choropleth-linked.png`, `v34-home-library.png` are actual captured results.
- A subsequent rerun after empty-sheet safeguards stalled inside the test-browser environment. **Do not claim that repeat passed.** The new guards were reviewed at source level; source syntax checks passed.
- `node tests/test-v34-contract.mjs` — **passed**: 195-country candidate selection, bounded HTML export, field mapping safeguards, escape/injection case, selection utilities.
- `node tests/test-v331-contract.mjs` — **passed**: inherited column-renaming, mapping dependencies, original-data preservation and story timing model.
- `node --check src/app.js`, `src/dashboard-interactive.js`, `src/dashboard-links.js` — passed.
- Portable ZIP structure and CRC verification: see packaging record in release. No application feature relies on a hosted API or AI model.

## Owner acceptance scenarios (run on the normal origin)

- Back up important projects as `.openviz`. From Home import a CSV, then verify it appears as a **new project**, leaving all older saved projects unchanged, even when an older project was active before returning Home.
- Cancel the Home file picker: no extra project should appear. Try a two-sheet XLSX and cancel the sheet picker; neither action should create a project.
- Start blank: data import is prominent, and sample data requires expanding *Want to explore with example data?*.
- Add two charts that both map `Region` to their X dimension, add them to a dashboard, choose Linked field = Region and Highlight. Click North: matching marks in both charts should remain bright; other marks should dim. Axes must not change.
- Shift-click South, then choose Filter. Verify both categories remain and scales can update. Clear and confirm the original rows were never modified.
- Add a choropleth and a bar chart sharing `Country`, click New Zealand or another recognized map region, and verify the corresponding bar responds.
- Export interactive dashboard HTML, open it offline, click categories and reset. Check that single-category filter mode is supported for 2–24 distinct shared values; larger fields disclose their highlight-only fallback.
- Repeat in the free-canvas layout and at small screen widths. Reopen the `.openviz` project after reload and confirm saved dashboard field/mode persisted.
- Run Help > Release diagnostics; check PowerPoint and Story Studio regressions by exporting a representative slide and short animation.

## Known limitations

- Shared linking uses an explicitly common field, not arbitrary cross-dataset joins or inferred entity resolution. The same field name in different datasets may still carry different meanings; verify correspondence.
- The editor supports multi-category filtering, whereas exported HTML's precomputed filtering supports a single category; HTML high-cardinality fields (>24 categories) export as **highlight-only**, explicitly described inside the HTML.
- Interactions cannot originate from scatter plots, geographic density rasters, networks, Sankey links, and other mark types lacking a reliable category key for the chosen field. Such charts may still receive filtered rows.
- Changing filtered rows can change aggregation/axis scales; using Highlight is recommended for side-by-side comparison.
- Large-dataset performance, normal-origin IndexedDB persistence, Microsoft PowerPoint desktop fidelity, and Firefox/Safari interaction compatibility have not been fully verified in this environment. Previous owner testing verified a V3.1 multi-tab save conflict in Chrome.
