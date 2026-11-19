# V3.43 handoff

Stacked-column time snapshots implemented; 44 chart options, ten snapshot types, 44 passing suites. Native Chromium exits before opening page; browser/touch/Windows/screen reader acceptance remains pending.

New stacked-time.js reuses heatmapTimeMatrix for exact per-period category/series cells. stackedTimeDomain computes separate complete positive and negative totals for each category/frame, then fixed y.lo/y.hi across all frames. It rejects cell/stack/range overflow, more than 32 categories or 10 series, with 0–1 fallback for all zero. Count can leave measure unmapped. Shared timeline bounds override manual bounds.

time-controls.js adds stacked-bar, distinct period/series roles, domain validation/settings, warnings and snapshot notes. charts.js uses timed cells/category/series domains, a dedicated signed stacked branch, stable palette indices/full legend, zero-height numeric-zero marks and omitted missing pairs. Zero baseline/label is explicit; nearby tick labels are thinned. Legend padding uses full timeline series count and extra subtitle clearance; axis visibility is respected. Existing static stack branch unchanged. chartData returns active frame cells in timed mode.

Internal stackedTimeSourceRows compiler override parallels route/heatmap variants: dashboard export/editor derive saved period/scale/domains from full source then intersect visible row references. It is not persisted or added to publication raw data. Data contracts allow Count without measure and separate time from series. timeExample provides signed/zero/missing/duplicate/returning series and invalid-only 2022 data.

New test-stacked-time-v343.mjs and studio extension cover math/overflow/caps, signed baselines, category geometry/series colours, empty and zero semantics, axes, source filtering, portable/rename/story and executed publication keyboard/runtime. Supported-type count tests updated to ten. Generator writes six HTML examples/portable JSON/48 SVG fixtures; representative docs/v343-stacked-time.png inspected. See QA_V3_43.md for limitations.

Next: grouped-column and grouped-horizontal-bar time playback with stable series/category order and full-timeline value scales. Reuse exact categorical-cell contracts carefully; preserve missing-vs-zero and signed values, avoid pooling periods, keep source/period filtering explicit and ensure horizontal label margins are fixed across frames. No competitor-parity claims without matched-data native acceptance.
