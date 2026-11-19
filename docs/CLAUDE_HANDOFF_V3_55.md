# V3.55 handoff

Baseline V3.54.

## Live data

- `src/live-data.js`:
  - resolveSourceUrl: Google Sheets edit/published links, GitHub blob, Dropbox, https only (http for localhost), no credentials in URLs
  - fetchLiveSource: injectable fetchImpl; timeout, 20 MB cap, HTML refusal, plain-language errors
  - guessFormat, liveDue, sameSchema, describeSource
- `app.js`:
  - `dataset.liveSource` = {input, url, kind, interval, lastFetched, lastError}
  - openLiveConnect / renderLiveConnect / liveConnectPreview / liveConnectSave / refreshLiveDataset
  - parseLiveText reuses importFile through a synthetic File
  - interactive refresh goes through the existing openRefreshPreview → applyRefresh path; applyRefresh keeps the dataset name for live sources
  - auto-refresh uses a 30 s interval checker, skipped when the tab is hidden; the timer is unref'd so Node test harnesses can exit
  - menu items, Data page buttons and a status line
- Published HTML does not re-fetch (future work).

## Themes everywhere

- `brand.js`: brandHtmlHeader, brandHtmlFooter, brandHtmlCss, brandSlideTokens.
- editorial-table.js: HTML footer, `--et-font` (safeFont), SVG footer with reserved height.
- dashboard-interactive.js:
  - header and footer come from `dash.brand`
  - card charts get `brand:null`
  - app.js passes `{...dash, brand: project.brand}`
- The static dashboard export was updated the same way.
- advanced.js: module palette swapped per render from `chart.palette`.
- saveBrand optionally restyles slides (`#brandIncludeSlides`).

## Native PowerPoint

- exports.js:
  - pptxChartMode nativeTypes now include pie and combo
  - the combo uses a pptxgenjs multi-type chart with secondary value/category axes when dual
  - native charts take their palette from chart.palette
  - pie shows percentages and a legend
- pro-charts.js: comboSeries().

## Projection

- charts.js: projectionModel(ct, pts, s), with settings projectPeriods (0–24) and projectWindow.
- Generic branch: the scale includes projected values; the step reserves extra slots; the band draws under the marks and the dashed path plus italic labels go in refOverlay.
- Inspector: inputs added to referenceControls for line/area.
