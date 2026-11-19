# V3.60 handoff (templates, boundary library, globe, markers, RTL, descriptions, table extras, styles)

The baseline is V3.59. There is no AI anywhere in this release, by the owner's decision: descriptions are rule-based, and nothing calls a network service except the on-demand fetch of bundled boundary files from the app's own origin.

## New modules

### `src/pro-charts-v360.js`: six templates

- Exports `EXTRA_META`, `EXTRA_TYPES`, `EXTRA_OPTIONS`, `extraFieldSpecs`, `extraData`, `extraWarnings`, `renderExtra`, `extraExample`, `extraOption`, `parseWhen`, `countdownParts`, `treeModel`, `layoutTree`.
- `pro-charts.js` spreads `EXTRA_META` and `EXTRA_OPTIONS` into its own tables and delegates any type in `EXTRA_TYPES`. `PRO_TYPES` now has 31 entries.
- `proWarnings` reports unmapped required fields first for these types too, then the type's own warnings.
- `proTimeModel` returns `null` for these types: they have no playback.
- `EXTRA_OPTIONS` introduced `kind:'text'`, which `editor/chart-panels.js` `proControls` renders as a text input.
- Markup contracts read by the runtime:
  - Ticker: `[data-ov-ticker]` holding JSON `{from,to,places,prefix,suffix,duration}`. The static text is the final value.
  - Countdown: `[data-ov-countdown]` with JSON `{target,units,after}`, plus `[data-ov-unit]`, `[data-ov-caption]` and `[data-ov-asof]` (hidden once live).
  - Quiz: `[data-ov-quiz]` > `[data-ov-question]` > `[data-ov-option][data-ov-correct]` (role=button, tabindex=0), plus `[data-ov-explanation]` and `[data-ov-score]`. The question text carries `data-viz-part="point"`.
  - Poll: `[data-ov-poll][data-ov-revealed]` > `[data-ov-choice]` (role=button), plus `[data-ov-bar]` (target width), `[data-ov-value]` and `[data-ov-poll-note]`. The result bar carries `data-viz-part="point"`.

### `src/interactive-widgets.js`

- `installInteractiveWidgets(root)` and `installFullscreenButton(doc)` are self-contained: no imports, no closures. They are inlined with `.toString()` into `interactionScript` in `chart-interactions.js`.
- They are also called by `app.js` `enableChartHover` and by `live-runtime.js`, after each render and at mount.
- The live runtime's resize re-render skips quiz, poll, ticker and countdown, so readers do not lose state.
- **Polls never send anything.** Keep it that way unless a server-side vote store is designed, including consent and abuse handling.

### `src/map-markers.js`

- `MARKER_STYLES` (circle, spike, icon, dots) and `MARKER_ICONS` (15 original path icons).
- `markerSVG(s,{x,y,r,value,top,fill,opacity,stroke,attrs,title,plotH})` draws one marker.
  - Circles keep the old precision: `cx`/`cy` `toFixed(3)`, `r` `toFixed(4)`. Older tests compare these strings.
- `validMarkerImage`: data: URIs only (PNG/JPEG/WebP/SVG), at most 200 KB.
- `dotDensitySVG(s,{geometry,proj,value,dotValue,fill,key,budget})` returns `{svg,drawn,capped}`.
  - It uses a seeded RNG keyed by region, so dots stay put between renders.
  - `budget.left` is shared across all regions (`DOT_BUDGET` = 12,000).
- Used by both `geo.js` (world) and `regional-map.js` (custom boundaries).

### `src/chart-description.js`

- `describePoints(pts,s,typeName)` builds a rule-based summary: extremes, totals where they make sense, trend for ordered x, correlation for scatter.
- `charts.js` exports `describeChart(rows,settings)` and uses it for `<desc>`.

### `src/boundaries/` and `tools/build-boundaries.mjs`

- See `docs/BOUNDARY_LIBRARY.md`.
- `map-library.js` appends `BOUNDARY_SETS` to `MAP_RESOURCES` (451 in total).
- Sets with `file` must be loaded before the synchronous resource functions:
  - `ensureBoundarySet(id, fetcher)` is async and cached.
  - `primeBoundarySet(id, json)` is used in tests.
  - `resourceGeoJSON` throws "Load this boundary set first." otherwise.
- The editor's `readyResource(id)` in `editor/map-library-ui.js` does this before use, download, details and create.

## Changed modules

- **`map-projection.js`:** adds `MAP_PROJECTIONS.globe`.
  - The orthographic projector has `kind:'globe'`, `xyz`, `screen` and `globe:{cx,cy,r,lon0,lat0}`.
  - `globeRing` clips rings to the visible hemisphere and closes them along the horizon (`horizonArc`).
  - Also adds `globeOutline`, `globeGraticule` and `globeCentre`.
- **`geo.js`:**
  - Detailed world borders: `setDetailedWorld` and `detailedWorldReady`, used when `geoDetail==='detailed'`.
  - Globe ocean and graticule, marker styles, and a dot legend.
  - `ISO3_GAPS` makes `FRA` and `NOR` join, because Natural Earth 1:110m has `-99` there.
- **`regional-map.js`:** globe sphere and marker styles for custom boundaries.
- **`charts.js`:**
  - `CHARTS` gains `geo-spike`, `geo-dots` and `geo-globe`. These are presets over existing renderers (`preset:{type,settings}`), handled by `chartPreset` and `applyChartPreset`. `buildChart` maps them without mutating the chart.
  - `chartIsRtl(s)` (auto-detect, or `textDirection`). When RTL: title right-aligned, legend top-left, `data-rtl`, and `unicode-bidi:plaintext` on text.
  - Quiz and poll SVGs use `role="group"` because they contain buttons.
  - Templates without axes no longer get "of X by Y" in the aria-label.
- **`map-canvas-edit.js`:** keeps `role="group"` on SVGs that contain quiz or poll buttons.
- **`chart-interactions.js`:** roving-focus marks exclude anything inside `[data-ov-choice]` or `[data-ov-option]`, so there are no nested focus targets.
- **`exports.js`:** `pageDirection(html, rtl)`. It is used by `makeInteractiveHtml`, the `publishing.js` chart and dashboard pages, and `live-publish.js`.
- **`editorial-table.js`:**
  - Column `display` (text / image / flag) and `sticky`.
  - `safeImage` allows https and `data:image` only.
  - Sticky columns are rendered first, with `--sl` offsets of 10em each.
- **`race-assets.js`:** `flagFor(value)` accepts ISO2, ISO3, English names and aliases, including the France and Norway fix.
- **`themes.js`:** eight newsroom styles (16 built-in in total).
- **`app.js`:**
  - The settings lists were corrected in this release. `geoMarkerStyle`, `geoIconSizing`, `geoProjection`, `geoDetail` and `geoGraticule` are in the re-render list. They had briefly landed in the numeric list during development, which would have turned them into `NaN`.
  - The new optional numbers are `globeLon`, `globeLat`, `geoSpikeHeight`, `geoSpikeWidth`, `geoDotValue`, `geoDotSize` and `geoIconSize`.
  - Adds the suggested-description box and the Text direction select.
  - `render()` lazily fetches `boundaries/world-detailed.json`.

## Tests

- **New:** `tests/test-v360-templates-maps-text.mjs`.
- **Updated for the intended count changes:**
  - charts 70 → 79
  - `PRO_TYPES` 25 → 31
  - `MAP_RESOURCES` 184 → 451
  - NZL search 1 → 2
  - `test-map-library-v350` primes and checks every bundled set.
  - `test-quality-v311` checks quiz and poll answers as keyboard buttons instead of roving marks.
  - `test-v356` skips playback for the new types.
- **Node suite:** 58 pass. The same 9 harness failures as V3.59 remain: `installEditorialTables` ReferenceErrors in old harnesses, route-map-v338, time-v316, studio-v37.
- **Browser:**
  - `tools/v360flow.py`: every new feature in Chromium.
  - `tools/flowall.py`: all 31 pro types with every option toggled.
  - `tools/a11y/axe_v360.py`: 0 violations on new templates, exports and the map library.
  - Existing axe audit: 0 violations on 19 screens. The keyboard walk-through and V3.58 flow are clean.
  - WebKit self-test: 79/79 types, 0 errors.

## Known limits and next candidates

- **Countdown time zones:** the target instant is fixed when the chart is built. A date without a time zone is read in the author's time zone, so `2026-12-24T18:00+01:00` is safer for international audiences. The ticking itself uses the reader's clock.
- **Poll results:** they come from the dataset. Live vote collection would need the Team Server, plus consent and abuse controls.
- **Boundary detail:** sets are simplified for screens. Very small regions (e.g. some Slovenian municipalities) can look coarse at large sizes.
- **Globe:** the globe does not drag-rotate on the canvas; use the rotate sliders. It also does not animate between views in stories yet.
