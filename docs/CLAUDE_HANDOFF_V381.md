# V3.8.1 handoff

User wants Project open by default, a more compact Preview/Data row with tabs anchored to the row, an optional choropleth boundary note, then a serious Flourish comparison to guide broader/higher-quality chart coverage.

Implemented desktop default-open via studioProjectOpen initialised for widths above 720 px, retaining the existing mobile overlay policy. Studio toolbar/headings are 42 px. High-specificity full-height tab rules override the old generic 29 px toolbar button rule. Mobile inspector and resize overlay offsets match 42 px.

New boolean geoShowBoundaryNote in DEFAULT_CHART, updateChartSetting's boolean list and geoMapStyling. renderGeo emits the source note only when strictly true. Default false also applies to legacy charts without the property. No geometry change; settings/docs retain provenance. All three geographic renderers use it, and shared buildChart-based outputs follow it.

See QA_V381.md. New map-note pure tests cover rendering, static/interactive publication, data safety and portable JSON import. DOM regression passes. Real-browser visual acceptance remains pending.

Read FLOURISH_COMPARISON_AND_EXPANSION_PLAN.md before adding types. It includes the verified current 25-type inventory, confirmed competitor capabilities, counting rules, limits of documentary comparison, an expansion order and quality gates. Do not claim greater breadth or quality yet. Next recommended batch is shared multi-series infrastructure, grouped/100%/horizontal stacks, multi-series line/area and chart-level small multiples. Maintain reviewed source switching, requirements/examples, styles, warnings and all exports for each addition.
