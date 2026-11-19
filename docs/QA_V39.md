# V3.9 QA — expanded templates, experiments and Home discovery

Development build. No claim of Flourish superiority or exclusive chart invention.

## Scope

11 new selectable entries: 9 standard long-format series templates and 2 experimental views. Total catalogue availability is 36; candlestick remains planned and is excluded from that count. Home has four featured templates and the renamed Explore templates action. Search and filters remain inside the Templates window.

The approved compact toolbar, default-open desktop Project, collapsible sections, map-note toggle, reviewed data switching, undo and local-first operation remain.

## Numerical/model checks passed

`node tests/test-expansions-v39.mjs` verifies grouping, sum/mean/count/min, missing values and genuine zeroes, negative compositions, percentage denominators, zero-total handling, exact empirical quartiles and complete-pair differences. It also checks overflow handling, source immutability, all new field contracts and suggestions, comparison compatibility, category linkage, portable imports, HTML publication and vector fallback. A 100,000-row model check accounts for every accepted record in bounded category/series buckets. Timing is a smoke observation, not a user-machine guarantee.

`node tests/test-data-contracts-v38.mjs` now covers all 36 available entries. Legacy map-note, publishing, dashboard linking, rename/story, guarded storage and performance Node contracts pass.

## DOM/export runtime checks passed

The expanded `tests/test-studio-v37.mjs` checks Preview/Data, relevant mappings, actual reviewed source switch/apply/undo for all 36 entries, column renames, tabs/focus, dashboard structure, sidebar, map notes and publishing entry. It also verifies Home featured cards, the Templates window, its search and Experimental category, and that browsing does not mutate the active project.

`tests/test-expanded-runtime-v39.mjs` parses SVG XML and checks finite numerical geometry for all 11 additions at renderer widths 360, 768 and 1440 px. It verifies shared facet scales, gap-separated line paths and continuous X spacing. It executes the actual generated standalone HTML filter scripts in jsdom and verifies that changing a category changes the displayed frame without script errors.

Use external jsdom or set OPENVIZ_DOM_MODULE to its absolute api.js path. jsdom is a test dependency, not a browser/runtime requirement for the app.

## Static visual inspection

All 11 default sample charts were rendered from SVG through CairoSVG and inspected as a contact sheet. A Change lens caption/subtitle collision was corrected. New numeric axes use cleaner tick intervals. The sample sheet in this directory is a chart-output render, not a browser screenshot. It does not establish responsive UI behaviour or visual quality on arbitrary real data.

## Limits and deliberate behaviour

- Series displays: first 40 categories and first 10 series; small multiples first 8 series. Warnings disclose truncation. Percentage denominators use displayed series only.
- Small multiples is a dedicated shared-scale line template, not faceting for every chart type. Too many facets for the configured canvas display a request to increase height or filter.
- Lines and overlapping areas leave absent combinations as gaps. Stacked areas treat them as zero and disclose that convention.
- Percentage stacks, overlapping areas and stacked areas require nonnegative aggregated values. New horizontal stacks support signed contributions; the original stacked-column implementation keeps its prior limits.
- Evidence lanes: first 10 groups, at most 180 visible observation marks per group. Summary values/n use all valid observations. Points use deterministic jitter, not collision-free beeswarm placement.
- Change lens: first 12 groups, complete pairs only, matching units required. Count is not a valid magnitude calculation. Difference labels are integral; optional endpoint labels require enough row space.
- New templates use automatic common scales. Unsupported controls (manual scale, independent legend placement and other unsupported specialist appearance properties) are not exposed for these types. Existing chart controls are preserved for legacy renderers.
- New series legends wrap above the plot; facets use panel titles. Generic point colours remain available, but there is no new dedicated series-colour editor in this batch.
- New templates use SVG/vector fallback for PowerPoint, not native editable chart data. Generic reveal/Story Studio support is retained; these are not data-driven ranking races.
- Published HTML scales SVG; finite geometry at several renderer widths is not proof of browser-triggered responsive chart re-layout.

## Outstanding browser acceptance

Normal-origin import/save/refresh and .openviz round trips, Chrome/Edge/Firefox/Safari, dark/light UI, narrow-screen Home/Templates, keyboard/screen readers, label collisions with long names/many groups, PNG/PDF/PowerPoint actual-viewer fidelity, animation/video exports and public-host embedding. Earlier browser restrictions still apply. Do not label this build release ready based on Node/DOM checks alone.
