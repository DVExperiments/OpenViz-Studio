# V3.53 handoff — new chart families, overlays, UI refresh

Baseline V3.52.

## New chart families

- `src/pro-charts.js` holds all 24 families:
  - PRO_META, PRO_TYPES, PRO_AGGREGATING
  - PRO_OPTIONS: declarative inspector controls
  - proFieldSpecs (role contracts), proData, proWarnings, renderPro, proExample
- Rendering follows the renderAdvanced/renderExpanded contract: it draws inside the plot box laid out by buildChart.
- Pro types use their own axes, so buildChart gives them a small left/bottom margin (more for combo, candlestick, marimekko and zero-baseline streamgraph). The global legend is suppressed for them.

## Wiring

- `charts.js`: CHARTS spread, chartData/chartWarnings dispatch, render dispatch, legend/margin exclusions.
- `catalogue.js`: entries appended (tag "new in 3.53", isNew), proExample first in chartExample. The candlestick "planned" entry was removed.
- `data-contracts.js`: proFieldSpecs and PRO_AGGREGATING in usesAggregation.
- `advisor.js`: suitability via mappingIssues/proData, plus trade-offs and goal lists.
- `dashboard-links.js`: CLICKABLE extended for category-keyed families.
- `app.js`:
  - imports; proControls and referenceControls
  - setting coercion: PRO_SETTING_NUMBERS/CHECKS; blank-allowed gaugeMax/radarMax/refLineValue; showTrendline
  - example extras copied for PRO_TYPES, as for geo-route
  - "catalogue-new" filter chip and New badge
  - home featured ids, hero copy and version string

## Overlays

- `charts.js`: referenceLine/trendLine/linearFit, with REF_TYPES.
- Overlays accumulate in `refOverlay` and are appended after the type renderers, before the source note.
- Only non-time views get trend lines.
- niceManualTicks picks round steps inside manual bounds; it falls back to equal division.

## UI

- `src/ui-refresh.css` is loaded after styles.css.
- `src/icons.js` installIcons() uses a MutationObserver to swap glyph text nodes for SVG icons in #app, the modal layer, menus and toast. It skips SVG, form controls, kbd/code and [data-no-icons].
- U+2212 minus is deliberately not mapped (numbers).

## Tests

- New: tests/test-pro-charts-v353.mjs.
- Count assertions were updated in the expansions-v39, editorial-table-v349 and map-library-v350 suites.
- Test harness needs `jsdom` installed outside the shipped folder.

## Not done

- Time playback for the new families.
- Native PPTX charts for pie/combo (they use the SVG fallback).
- Per-mark drag offsets for value labels in the new families.
- Gap analysis: docs/COMPETITIVE_GAP_ANALYSIS_V3_53.md.
