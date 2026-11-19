# Parity review — V3.11

Scope: compare documented interaction/design expectations with reproducible OpenViz fixtures. This is not a signed-in, same-dataset head-to-head benchmark of competitor output.

| Criterion | External reference | OpenViz V3.11 evidence | Remaining work |
|---|---|---|---|
| Descriptive text alternative | Flourish screen-reader description; Datawrapper alternative description | Editable altText in editor, SVG aria-label and desc, undo/persistence path | Test with real assistive technology and refine fallback descriptions |
| Keyboard access to details | Flourish/Datawrapper accessibility guidance | One tab entry per rendered SVG, arrows/Home/End among marks, focus tooltip and Escape; executed in jsdom | Real keyboard/screen-reader/browser inspection, complex diagram navigation |
| Labels and layout | Datawrapper label rotation and responsive guidance | Two-line headings, canvas-aware standard labels, wider horizontal label margins, stacked legend rows | All-template browser collision audit, richer label wrapping for complex diagrams |
| Small-screen output | Both platforms document responsive visualisations | 360/700 editor layouts; three pre-rendered HTML chart layouts selected by container width | Browser/container-query tests, fixed-canvas story and free-canvas dashboard behaviour |
| Access to underlying values | Datawrapper data-access guidance | Optional bounded, bound-column source tables; search/sort/pages in interactive HTML | Standalone rich table template, full CSV-download workflow and wider table formatting |
| Data interpretation | Explicit axis/aggregation/missingness review | Existing contracts plus blank-value fixes, heatmap missing/zero distinction and publication checks | More automatic interpretation checks, independent statistical validation |
| Publishing convenience | Flourish hosted pages and embeds | Local HTML/publishing kit and user-supplied HTTPS embed URL | Managed hosting, shared review, collaboration and live connections |
| Maps | Datawrapper geographic catalogue | Existing three geographic chart types; responsive geometry and scoped clip IDs | Local administrative boundaries, custom GeoJSON and locator maps |

Reviewed official guidance (16 November 2026):

- https://flourish.studio/accessibility/
- https://helpcenter.flourish.studio/hc/en-us/articles/8761537418383-How-to-add-a-screen-reader-description
- https://www.datawrapper.de/accessibility
- https://www.datawrapper.de/docs/how-we-make-sure-our-charts-maps-and-tables-are-accessible
- https://www.datawrapper.de/docs/how-to-write-good-alternative-descriptions-for-your-data-visualization
- https://www.datawrapper.de/docs/how-to-create-a-column-chart

Suggested reproducible comparison: import `examples/quality-long-labels.csv` for bars, `quality-series.csv` for grouped/stacked/line views and `quality-missing.csv` for distribution/missingness checks into each platform. Use the same units, aggregation and axis bounds. Compare desktop, 700 and 360 widths, keyboard reachability, missing-value treatment and exported output. Capture competitor results only after actually generating them. No results of that hands-on competitor run are included here.
