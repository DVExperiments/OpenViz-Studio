# OpenViz Studio V3.15 handoff

V3.15 completes the category images/flags and race-styling batch. Read README.md and QA_V315.md for usage, limits and validation. Chart catalogue remains 42.

## Main code

- src/race-assets.js: bounded PNG validation, upload/decode/resize, assignment budgets, exact flag matching, style clamps, category colours and licence metadata.
- src/race-flags.js: generated 257 offline PNG flags plus MIT licence; tools/build-race-flags.py reproduces from flag-icons 7.6.0.
- src/race-example-images.js: original illustrative team badges.
- src/race.js: SVG images, label/bar-end placement, crop, appearance and runtime motion; data/frame semantics unchanged.
- src/app.js and styles.css: Race appearance controls and category asset/colour manager; safe upload context, Undo and portable chart properties.
- src/gif.js and race-export.js: optional GIF comments carrying flag licence; existing timing/encoding preserved.

Assets live in chart.raceAssets, keyed by exact entity name. Entries are {kind:'flag',code} or {kind:'image',label,data}; only validated embedded PNG is rendered. Guard special property names. Flag table is imported statically, so no network fetch. Invalid imported entries must remain removable. Uploads must not commit after project/chart/category/modal changes. Keep validation before trackChange/state mutation.

## Next batch

Line-chart races and reusable time controls. Preserve aggregation, source immutability, missing-value gaps, observation-based timing and honest export limits. Existing dashboard/story races remain snapshots. Smaller-value ranking, independent swap timing, multi-entity history and native video validation remain gaps. Do not claim full Flourish parity.

Keep compact Preview/Data layout, Project open by default, collapsible sidebar, reviewed source switching, Home Templates gallery/search and map-source note toggle. No AI/API/account requirement. Include Windows server instructions with every delivered build. End batch replies with what comes next.
