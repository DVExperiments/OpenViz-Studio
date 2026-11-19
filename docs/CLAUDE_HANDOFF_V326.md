# V3.26 handoff

map-classification.js now validates geoColorMode (sequential/diverging), geoMidpoint, geoDivergingRange (independent/symmetric), geoLowColor/geoMidColor/geoHighColor. Models carry optional diverging {midpoint,min,max,rangeMode,stops} and neutralClass. Continuous colours use two RGB segments. Independent endpoints include reference and observed extremes; symmetric mirrors max distance. Reject finite-domain overflow. Sequential paths are unchanged.

Class membership/breaks are unchanged. Classified neutralClass exists only when reference is within observed span, and its whole interval is neutral. Other class colours sample midpoint of bounds clipped to observed range; empty manual bins can repeat colours, while bins wholly across the reference from all observations keep their corresponding endpoint hue. Legends explicitly state neutral interval and range policy. Endpoint labels now align with gradient ends; legend reserves extra rows. New metadata data-map-colour-mode/midpoint/scale-domain describes actual colour model, while underlying observed aggregate min/max remain separate.

App staged classification modal adds mode/reference/range/three stops/presets and validates data-dependent scale before Apply. geoStaticClassification supplies static aggregate review; time uses geoTimeDomain. Sequential mode preserves original stored reference/stops and ignores disabled controls. Sequential palette selector hidden only for active diverging choropleths. Authored example uses regionalClassifiedExample and continuous symmetric reference 0. Source rows and geometry stay unchanged.

Story-state hex validation explicitly exempts geoColorMode enum; validateMapClassification still checks it. Capture/portable validation persist all new primitive fields. charts build propagates explicit type argument into settings to keep derived legends/renderers consistent. Publishing generator 3.26.

Tests/render: test-map-diverging-v326.mjs and render-map-diverging-v326.mjs; studio extended. All prior automated groups passed. Native Chromium launch failed; Windows/browser validation pending. README/QA_V326.md contain policies. Run py -m http.server 8000 in extracted index.html directory, localhost:8000, Ctrl+F5.

Next: direct map label/callout canvas editing using existing plot-relative/coordinate authoring state and Undo. Preserve exact IDs, source rows, fixed time domains, portable projects and responsive output. No full competitor parity claim without real same-data browser comparisons.
