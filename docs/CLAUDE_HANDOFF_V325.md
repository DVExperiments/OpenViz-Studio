# V3.25 handoff

New map-classification.js validates bounded config, computes continuous/equal/R-7 quantile/manual models, maps values to palette colours and renders responsive legend keys. Equal/quantile remove duplicate/endpoint thresholds; exact thresholds enter upper classes. Constant automatic data uses one class; manual outer classes are unbounded. Class count 2–7; manual breaks 1–6. Legend title/no-data label/colour/key are configurable. Full labels retained in SVG titles when fitted text shortens.

Geo/regional time domains now include classification model from pooled per-period aggregates; renderers use it rather than reclassifying frames. Static maps classify current aggregate values. Cropping never changes model input. Built-in country measure parsing excludes boolean/whitespace; count no longer requires Y. Built-in valid canonical-country manual colours now apply and are disclosed alongside regional overrides.

Charts reserve mapLegendHeight below choropleths and grow minimum canvas height for legend + plot. Symbol legends remain unchanged. Classification is ignored for symbol/heat quantities. App has staged Classification & legend modal (Preview/Cancel/Apply/Undo/stale guards) and a fictional negative/zero/missing/unmatched example. No-data styles do not alter values. Defaults continuous/5/[]/No data/#d8e2e8. Publishing generator 3.25.

Portable imports validate fields; story capture/normalisation explicitly saves geoClassBreaks and primitive visual settings. Manual mode requires valid saved breaks; invalid scene settings block resolution. No source rows, raw import or boundary geometry modified.

New test/render: test-map-classification-v325.mjs, render-map-classification-v325.mjs; studio extended. Prior automated regressions passed; native Chromium launch failed, Windows/browser validation pending. See README/QA_V325.md. Run py -m http.server 8000 in extracted index.html directory; localhost:8000 and Ctrl+F5.

Next: diverging colour scales and midpoint controls, with explicit negative/zero/asymmetric-domain semantics and portable fixed time models. Preserve reviewed joins, accurate no-data handling, local operation and compact editor. No full competitor parity claim without real same-data browser comparisons.
