# OpenViz Studio V3.3 — Engineering Hand-off

## Product guardrails

Browser-based, free/local-first, no API keys, account or AI model. Keep the existing professional UI, 25 visualisation types, editability, dashboard/presentation/story workflows, and portable project format. Users prepare data primarily in Excel; Data Workspace corrections should remain lightweight rather than becoming a spreadsheet replacement.

## Hot paths modified

- `src/data.js` — `parseDelimited`, `getFields`, `profile`, `importFile`, new `parseLargeFileInWorker`. Preserve numeric/date inference and exact missing counts. Avoid converting 100k input arrays into multiple full-size intermediate arrays.
- `src/import-worker.js` — browser module worker, `../vendor/jszip.min.js` side-effect import, locally imported `parseExcel` / `parseDelimited` / `parseJSON`. Worker sends complete sheets/rows only after successful validation; errors must never turn into partial success.
- `src/performance.js` — deterministic `scatterSample` and positive-edge `aggregateEdges`. Maintains extrema, spatial buckets, bounded visual marks; handles the full edge list before choosing a visible subset.
- `src/charts.js` — chart descriptions and chart warnings, bounded scatter marks, full-data axes, safe numeric min/max loops (avoids huge `Math.min(...array)` spreads), numeric scatter ticks.
- `src/advanced.js` — Sankey/network selected from aggregates of all eligible rows; reduced charts warn with displayed fraction of full positive weight.
- `src/app.js` — Data Workspace reads missing counts from a single profile result; large imports show processing feedback; release diagnostics includes a synthetic 20k scatter smoke check.

## Performance contract / data integrity

1. Never silently present the first N observations as the entirety of a flow network. Do not mix hidden rows into visible totals without coverage disclosures.
2. Scatter LOD changes only the rendered SVG, not data, project archive, analytics or user-defined chart field mappings. Sampling is not unbiased; no statistical claims.
3. Keep SVG mark output bounded on scatter, with all-domain scales. Note that many other visual types still have explicit hard caps.
4. Worker startup can fail (including restrictive origins). Fallback must preserve imports. Worker parser errors should be surfaced rather than silently retried as if successful.
5. Avoid calling an asynchronous save 'successful' until its indexed data read-back matches. Preserve V3.1 two-tab optimistic concurrency and recovery.
6. Don't reintroduce duplicate navigation or a full spreadsheet manager. Preserve chart-focused UI, precise styling, PDF/PPTX and Story Studio.

## Tests

```
node tests/test-performance-v33.mjs
node tests/benchmark-v33.mjs
python tests/test-browser-v33.py
python tests/test-browser-v30-v32.py
python tests/test-browser-v31-v32.py
python tests/test-browser-v211-natural-v32.py
python tests/test-browser-v32.py
```

The browser suites use module injection and mocked storage because test Chromium cannot access loopback. **Do not** treat successful mocked storage or worker fallback tests as real-origin sign-off. Chrome/Edge XLSX worker import, Firefox/Safari, memory use at 100k rows, and full PPTX desktop inspection remain manual gates.

## After V3.3

V3.4 interactive cross-highlighting; V3.5 hosting/publishing/embed workflow; V3.6 multi-media storytelling; future public beta subject to acceptance testing. See `docs/ROADMAP_AFTER_V33.md`.
