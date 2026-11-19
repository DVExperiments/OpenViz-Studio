# Remaining known work after V3.49

This is the consolidated project backlog as of 18 November 2026, grounded in the current source and existing roadmaps. It is not a fresh audit of every competitor. Earlier release “next” notes are historical. Optional proposals below are choices, not promised scope or requirements for every release. A chart option is not necessarily a distinct visualization family.

The user has deferred the comprehensive verification phase until the five implementation priorities in QUALITY_GAP_PLAN_V3_49.md are complete. Focused checks continue. Dedicated editorial tables are now implemented; further table depth remains optional.

## 1. Release acceptance — final verification phase

- [ ] Run native Windows Chrome/Edge and Firefox/Safari acceptance; cover desktop, tablet and phone layouts, import → mapping → chart → export, and real first-time users.
- [ ] Verify keyboard order, focus, dialogs, chart details, touch/hover alternatives, screen readers, reduced motion, contrast and colour-vision accessibility. Automated DOM checks do not prove WCAG conformance.
- [ ] Test real-origin IndexedDB save/reload, autosave, checkpoints/backups, restore/migration, quota/deletion/recovery and long/large projects. Existing storage features are implemented; native acceptance is pending.
- [ ] Open actual SVG/PNG/PDF/PPTX/standalone HTML outputs in target viewers. Verify editable PowerPoint primitives versus SVG fallback in desktop PowerPoint.
- [ ] Verify native GIF/MP4/WebM codec availability, timing, frame rate, duration and rasterization. Existing race export pipelines still need native acceptance.
- [ ] Improve PDF Unicode/font embedding and complex-vector fidelity. Current Standard14/WinAnsi fallback substitutes unsupported characters; complex SVG content may rasterize. Test the print-based vector alternative too.
- [ ] Measure memory/runtime and responsiveness with realistic large imports, maps, stories, filtered exports and long sessions; test worker/import fallback paths. Raise caps only with evidence.
- [ ] Verify real hosted embeds, cross-origin/container sizing, mobile behavior and exported interaction compatibility.
- [ ] Complete adversarial/security/privacy review of imported projects, tabular data, SVG/GeoJSON and HTML payload boundaries. Turn regression checks into a repeatable release/CI workflow.
- [ ] Establish beta/stable criteria, known-limits guidance, onboarding/tutorials, release notes, update/migration/distribution and support process.

## 2. Time, animation and stories

- [ ] Next feature: stacked-area snapshots, with full-timeline stack totals and explicit missing-versus-zero semantics.
- [ ] Then shared-scale small-multiple snapshots with consistent facet slots/scales.
- [ ] Decide which other static-only entries genuinely benefit from snapshots; see complete coverage matrix below. Ordinary single-series line/area could reuse the multi-series engines. Static charts do not all require playback.
- [ ] Add ordinary snapshot-player GIF/video export. Dedicated race exports already exist.
- [ ] Add synchronized dashboard/story temporal playback; current delivery retains individually saved periods rather than a shared live timeline.
- [ ] Refine between-state transitions, path/axis morphing and series timing where valid; preserve gap/zero semantics and reduced motion.
- [ ] Race depth: smallest-value ranking, independent swap timing and richer multi-entity history/timeline views.
- [ ] Further story chapter/presentation and transition polish. Optional later proposal: narration/audio/image synchronization.

## 3. Dashboard interactions and data workflow

- [ ] Explicit reviewed cross-dataset joins/field mappings and multi-filter rules, without inferred joins.
- [ ] Broaden exported filtering beyond one category at a time. Current bounded export supports up to24 variants, then falls back to highlighting; candidate fields are capped at250 values. Improve delivery before lifting caps.
- [ ] Systematically audit saved-period/domain retention and out-of-range/overflow disclosure across older grouped, heatmap, stacked-column and other filtered families. Recent line/area/horizontal-stack paths handle these explicitly; this does not establish that every older path is broken.
- [ ] Shared authored scale presets and synchronization across independently filtered charts/scenes.
- [ ] Further reusable design tokens, series styling, direct labels, dense legends, facets, typography and mobile polish across every family.
- [ ] Prioritize additional join/reshape/transform and data-review tools only where chart workflows need them. Local file refresh and editable source tables already exist.

## 4. Chart/template additions — prioritized candidates, not all mandatory

- [ ] Explicitly planned catalogue item: candlestick/OHLC, with proper financial semantics.
- [ ] Business/composition candidates: pie option, line/column combo with explicit units and axes, bullet/progress, funnel, gauge/number ticker and Marimekko.
- [ ] Ranking candidates: bump/ranked-area charts with tie rules.
- [ ] Distribution/research candidates: beeswarm/strip, ridgelines with bandwidth controls, correlation matrices with sample sizes, missingness views, and richer forest/paired interval layouts. Interval plots already exist; evaluate Change lens reuse before adding a duplicate dumbbell chart.
- [ ] Pictorial/multivariate candidates: waffle/pictograms with accurate partial-unit handling, radar/radial/star views with comparable-scale guidance.
- [ ] Hierarchy candidates: arbitrary-depth hierarchy/drilldown, tree/icicle and circle packing.
- [ ] Relationship candidates: chord and arc diagrams; more directional semantics, scalable labels and network interactions.
- [x] Dedicated published editorial table with numeric formats, bars/heat, search, sorting and paging.
- [ ] Further table sparklines/images, reusable presets and live dashboard/story tables; dedicated cards/word-cloud candidates with accessible alternatives.
- [ ] Scatter depth: shape/colour group encodings and carefully labelled trend overlays/assumptions.
- [ ] Geography depth: richer/multiple marker layers, useful additional geographic families/projections/boundaries, dense-label collision handling, topology/performance QA, and an actually navigable inset if needed. Custom GeoJSON/regional symbols, routes and an informative locator already exist.

## 5. Experimental visualizations

- [ ] Disagreement map and Missingness atlas prototypes, with explicit data contracts and uncertainty/missingness meanings.
- [ ] Comprehension/validity studies for existing Evidence lanes, Change lens and Assumption lens before expanding their claims. Assumption lens is implemented, despite an older proposal document.
- [ ] Promote useful experiments to stable templates only after accuracy, accessibility, usability and export checks.

## 6. Optional online services — separate architecture decision

The core remains free/local-first without mandatory accounts, cloud or AI. These proposals need explicit prioritization and a separate service design:

- [ ] Managed publishing/hosting and updateable public links. Publishing Studio already creates standalone HTML, kits and embed snippets; it does not host files.
- [ ] Live-data integrations and scheduled remote refresh. Local source refresh already exists.
- [ ] Review/collaboration workflows. Potential scope includes accounts/workspaces, comments/coediting, permissions, audit/version histories and controlled hosted-data access; these are candidates, not current commitments.

## 7. Competitive proof and finish criteria

- [ ] Refresh official competitor inventories; distinguish visualization families, meaningful variants and style presets.
- [ ] Compare identical datasets, viewports and output formats; measure accuracy, labels/layout, interaction, accessibility, export fidelity and task completion.
- [ ] Run user trials before claiming higher quality, greater variety or superior usability.45 catalogue entries do not prove44 distinct families or market superiority. The older60+ target is provisional, not a finish criterion.
- [ ] Prioritize gaps by real user need rather than implementing every competitor feature.

## Completed items that should not be counted as remaining

Column renaming; reviewed data-switching and Undo; compact Preview/Data workflow; default-open Project panel and collapsible sections; dashboard theme refinements; map attribution toggle; static multi-series/grouped/stacked/percentage charts; shared-scale small multiples; Likert; ECDF; supplied intervals; calendar heatmap; Assumption lens; bar/line races and their export pipelines; custom regions/regional symbols; map classifications/projections/legends/tooltips/search/pins/zoom/Locate/locator; route grouping, reciprocal routes and magnitude scales; Publishing Studio standalone delivery; saved story views/scroll chapters; optional readable source tables; storage/checkpoints/backups. Native acceptance and deeper quality work remain as listed above.

## Exact current playback coverage

There are45 implemented options:17 snapshot-enabled,2 dedicated races and26 static-only. Candlestick is marked planned and excluded. Static-only does not imply unfinished or require animation.

| Chart option | Playback |
| --- | --- |
| Editorial table | Native HTML search/sort/pages; static graphic page |
| Bar chart race | Dedicated race |
| Line chart race | Dedicated race |
| Likert response chart | Static |
| Interval plot | Static |
| Empirical cumulative distribution | Static |
| Calendar heatmap | Static |
| Assumption lens | Static |
| Grouped columns | Snapshots |
| Grouped horizontal bars | Snapshots |
| Stacked horizontal bars | Snapshots |
| 100% stacked columns | Snapshots |
| 100% stacked bars | Snapshots |
| Multi-series lines | Snapshots |
| Overlapping series areas | Snapshots |
| Stacked areas | Static |
| Shared-scale small multiples | Static |
| Evidence lanes | Static |
| Change lens | Static |
| Choropleth map | Snapshots |
| Proportional-symbol map | Snapshots |
| Route & connection map | Snapshots |
| Geographic heatmap | Static |
| Sankey diagram | Static |
| Network graph | Static |
| Sunburst diagram | Static |
| Event timeline | Static |
| Parallel coordinates | Static |
| Gantt chart | Static |
| Column chart | Snapshots |
| Horizontal bar | Snapshots |
| Line chart | Static |
| Area chart | Static |
| Scatter plot | Snapshots |
| Dot plot | Snapshots |
| Donut chart | Static |
| Histogram | Static |
| Box-and-whisker plot | Static |
| Stacked columns | Snapshots |
| Heatmap | Snapshots |
| Waterfall chart | Static |
| Treemap | Static |
| Violin plot | Static |
| Bubble chart | Snapshots |
| Slope chart | Static |
