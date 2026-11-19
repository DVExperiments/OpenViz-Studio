# OpenViz Studio V3.16 handoff

Read README.md and QA_V316.md. V3.16 adds line-chart race (43 chart options total) plus optional independent time snapshots on bar/hbar/dot.

## Code

- src/line-race.js: pure lineRaceState geometry, signed fixed scale, stable peak subset, actual numeric/date spacing, missing gaps, collision-spaced labels, decorative endpoint assets; common SVG/live/export geometry. Dotted leaders are not observations.
- src/race.js: model admits signed values only for line-race; retains bar rejection. Adds min and signed-range checks. Existing player runs line scenes with the shared clock, captions and transient capture semantics. Runtime serialises shared functions, with no network dependency.
- src/research-charts.js: metadata, illustrative signed/gapped example, data/warnings/render hooks.
- src/race-export.js: accepts both race types, recomputes range-specific min/max and passes prepared model through buildChart. Never retain future/out-of-range data in exported paths.
- src/time-controls.js: ordered periods, bounded snapshot model, fixed scale settings, player markup and self-contained runtime. Shares advanceRaceClock. Supports bar/hbar/dot only; no ordinary snapshot timeline GIF/video.
- src/charts.js: time resolution for static chartData/buildChart; time errors render visibly; per-period aggregation and bounds use the same authoritative data engine.
- src/field-bindings.js/data-contracts.js: timeField participates in schema review, rename, removal and refresh dependencies.
- src/app.js: Time controls accordion, line-specific options, common player installation/disposal, explicit period capture with Undo. Source rows must remain untouched.

New fixtures/tests: tests/test-time-v316.mjs and render-time-v316.mjs; studio and existing expansion/runtime/quality suites extended. Native browser/video/Windows remains pending. Do not claim full Flourish parity.

Next: extend time controls to scatter and maps with fixed X/Y/colour/size scales and stable entity identity, then chart-state storytelling transitions. Keep compact Preview/Data, default-open Project, collapsible sidebar, reviewed data-source switching, Home Templates/search and map-source note toggle. Include Windows server command with each delivery and finish with what's next.
