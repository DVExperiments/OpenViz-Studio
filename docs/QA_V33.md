# V3.3 Quality Assessment — Large Data and Rendering Performance

**Status:** tested development release candidate, **not** a claim of production-grade 100k-row performance on every computer. Based on V3.2; local-first, no account and no AI model.

## Implemented changes

1. **Faster field profiling.** `src/data.js` now discovers fields without an array of all keys and counts missing cells during a single column-profile traversal. Field-type inference keeps the previous first-5,000-row heuristic; missingness remains exact for all rows.
2. **More memory-efficient CSV / TSV parsing.** Creates row objects as each record completes instead of retaining a parallel matrix of raw row arrays. Supports quoted commas, doubled quotes and multiline quoted fields. The 25 MB file cap and 100,000-row-per-dataset limit are unchanged.
3. **Background large-file imports.** `src/import-worker.js` supports XLSX, CSV, TSV and JSON imports at and above 512 KiB on browsers that permit module workers. It imports the locally bundled JSZip for XLSX. If the worker cannot start, the existing main-thread parser is used; parsing errors still fail loudly. This is not network processing.
4. **Bounded dense scatter SVGs.** Render up to 400 deterministically selected observations, combining 2D spatial coverage, uniformly spread source records and preserved X/Y extrema. Axis extents use all valid observations. A warning explicitly states the source size, sampling and limitations; project data remains intact. This is a visual sampling strategy, not a statistically representative estimate.
5. **Full-input Sankey/network aggregation.** These diagram renderers now accumulate all valid source/target edges rather than taking the first 180/220 *source rows*. Display limits remain 52/64 nodes and 180/220 unique edges. High-weight relationships take precedence; warnings give the number of omitted connections and the proportion of total positive weight actually displayed. This avoids silently misrepresenting the beginning of a large dataset as the full flow.
6. **Better in-app diagnostics.** Help > Release diagnostics adds a 20,000-row *synthetic* scatter test and the bounded SVG count. The downloaded report contains no source data values.

## Evidence

| Test | Result |
|---|---|
| `node tests/test-performance-v33.mjs` | **PASS:** 100k-row profile, 100k scatter, 20,001 Sankey records incl. a late heavy edge, representative/extreme preservation, 50k CSV parsing and validation, display-limit warnings |
| `node tests/benchmark-v33.mjs` | **PASS:** comparable 5-pass Node synthetic benchmark; report in `docs/BENCHMARK_V33.json` |
| `python tests/test-browser-v33.py` | **PASS:** 30,000-row CSV imported and profiled in isolated Chromium via synchronous fallback; synthetic 30k scatter chart renders <=400 marks and sampling warnings |
| `python tests/test-browser-v30-v32.py` | **PASS:** keyboard navigation, chart accessibility, focus traps, diagnostics including new synthetic test |
| `python tests/test-browser-v31-v32.py` | **PASS:** multi-tab conflict/recovery simulations, storage failure, diagnostic download, widths 660 / 940 / 1400 |
| `python tests/test-browser-v211-natural-v32.py` | **PASS:** 25 visualisation types, natural motion and Story Studio GIF export |
| `python tests/test-browser-v32.py` | **PASS:** figure/slide PDFs, PDF vector-print, editable and vector PPTX structures and output |
| CRC integrity of release ZIP | Check on packaging |

### Synthetic benchmark (one container, Node 22; 5 runs, median)

- **100,000 rows / 9 fields — profile:** V3.2 83.09 ms; V3.3 14.97 ms (**5.55x faster**).
- **50,000-row CSV parse:** V3.2 163.48 ms; V3.3 104.29 ms (**1.57x faster**).
- **100,000-point synthetic scatter:** bounded to 400 SVG points; no HTML/SVG explosion. Exact elapsed time varies with machine and test ordering.
- These are local microbenchmarks, **not** promises of UI responsiveness, import times or memory use on a user's device.

## Limitations and explicit pending checks

1. The isolated Chromium browser **blocks localhost** (`ERR_BLOCKED_BY_ADMINISTRATOR`), so the real-origin **module worker import path** for large XLSX/CSV needs hands-on Chrome/Edge testing. The isolated test verified the fallback and its data integrity, not the worker itself.
2. 100k XLSX worksheets may still require substantial RAM for DOM XML parsing inside the worker. Hardware constraints, browser memory quotas and IndexedDB project size will affect performance. The worker improves main-thread responsiveness when supported, not total computational cost.
3. Scatter samples are deliberate *visual-level-of-detail*, not a claim of statistical representativeness; individual non-extreme points can be omitted. Export/inspect all source data for complete analysis.
4. Sankey and network views still intentionally cap visible nodes and links for readability. Omitted weight is disclosed, not secretly rolled into an unlabelled 'Other' category. Manual node overrides and force-layout convergence should be reviewed on dense cyclic graphs.
5. Other advanced diagram types retain their documented display limits (e.g. Gantt 80 tasks, timelines 80 events, parallel coordinates 240 rows, geographic heatmaps sample up to 1200 points). V3.3 does **not** certify all 25 diagrams at 100k rows.
6. V3.2 direct-PDF font limitations and complex chart PPTX vector fallbacks remain. V3.3 actual Microsoft PowerPoint desktop rendering, Firefox/Safari, persistence across reloads, and cross-origin embed behaviour are not fully certified here.
7. The 30k browser import test could not complete a separate editor-navigation step after the import; the rendering path was independently tested in the same browser and by the 100k Node test. That navigator case is **pending**, not counted as a pass.

## Hands-on acceptance (normal browser)

1. Back up existing projects as `.openviz` first, then run `py -m http.server 8000` from V3.3.
2. Import `examples/performance-demo-30000.csv` through Data. During import, try using the scrollbar or another UI control. Confirm 30,000 rows and four columns.
3. Add a scatter chart mapped to X/Y. Confirm it renders promptly and reports a sampled observation display warning. Inspect the final outlier at X=29999: Y=500.
4. Test a larger real `.xlsx` file (>512 KiB) and check Excel sheet selection, import values and UI responsiveness. This specifically validates the new worker path.
5. Create a Sankey with source/target/value columns and repeated flows. Verify all input rows contribute to totals; test a graph exceeding its node or edge limit and inspect the coverage warning.
6. Save, close/reopen, export a PowerPoint/PDF and run **Help > Release diagnostics**. Use the previously verified two-tab conflict test if desired.

## Next proposed milestone

**V3.4:** cross-filtering, linked brushing and cross-highlighting across interactive dashboards, with consistent field-mapping and privacy controls.
