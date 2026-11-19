> Historical baseline audit: this file compares V3.8.1 (25 implemented entries). V3.9 now has 36 selectable entries, including orientation/composition variants, a dedicated faceting template and two experimental views. See QA_V39.md and EXPERIMENTAL_V39.md for current scope and limitations. Greater overall breadth/quality than Flourish remains unproven.

# OpenViz vs Flourish — catalogue, variety and quality audit

Reviewed 16 November 2026. This is a source-code audit of OpenViz V3.8.1 against current official Flourish documentation, not a completed head-to-head visual trial. The live Flourish template chooser returned HTTP 403 to retrieval; public documentation provides confirmed coverage, not an exhaustive inventory or exact variant count.

## Main finding

OpenViz does not yet have a broader catalogue than Flourish, and its visual quality has not been shown to be better. OpenViz has 25 implemented renderer IDs, 25 available catalogue entries and one explicitly planned entry (candlestick). Flourish describes its offering as 50+ templates/chart types [F1]. These units are not directly comparable: one Flourish template can contain multiple distinct visual forms, and OpenViz currently counts horizontal/vertical bars separately. A cosmetic preset, example dataset or duplicated orientation is not evidence of another chart family.

The direction should be to exceed useful analytical coverage and demonstrated quality, then maintain an audited count. Shipping dozens of incomplete renderers would not meet the user's objective. Existing local-first operation, reviewed data connections and portable export are product strengths; they do not establish chart-quality superiority.

## Current OpenViz inventory

Verified from src/charts.js and src/catalogue.js, excluding planned entries.

| Catalogue category | Implemented entries | Count |
|---|---|---:|
| Comparison | Column, horizontal bar, dot | 3 |
| Time & trends | Line, area, event timeline, Gantt, slope | 5 |
| Relationships | Scatter, heatmap, bubble, parallel coordinates | 4 |
| Part-to-whole | Donut, stacked columns, treemap | 3 |
| Distribution | Histogram, box-and-whisker, violin | 3 |
| Hierarchy | Sunburst | 1 |
| Flows & networks | Sankey, network | 2 |
| Geographic | Country choropleth, proportional symbols, geographic density | 3 |
| Financial & specialised | Waterfall | 1 |
| **Total available** | **Candlestick is planned, not available** | **25** |

These are catalogue categories, not mutually exclusive analytical families. For example, treemap is also hierarchical and slope is also a comparison chart.

## Coverage comparison

“Available” below means implemented/documented, not equivalent in depth or validated at equal quality. An ordinary dashboard of independent charts is not a substitute for a shared-scale faceted chart. A motion reveal is not a data-driven ranking race.

| Family/capability | OpenViz current state | Flourish evidence | Main work needed |
|---|---|---|---|
| Core bars, lines, areas, part-to-whole | Single-measure lines/areas, bars, donut and stacked columns | Combined Line/bar/pie template [F2] | Multi-series lines, grouped bars, horizontal stacks, 100% stacks, stacked area, pie option |
| Ranking changes | Slope compares first/last periods | Bump/ranked area support [F3] | Bump and ranked-area charts with explicit rank rules and ties |
| Small multiples | Dashboard grid only; no chart-level faceting | Shared/independent scales and faceted layouts [F4] | Facet binding, common scales, readable facet titles and responsive layout |
| Combined measures | No dedicated combination chart | Column/line and other combinations [F5] | Combination series with explicit axes/units and safe defaults |
| Scatter, bubble, box, violin | Available, with documented sampling/size limits | Multiple forms, beeswarm and additional encodings [F6] | Beeswarm, meaningful colour/shape groups, trend overlays and stronger interaction |
| Multivariate profiles | Parallel coordinates only | Radar, radial bar and star forms [F7] | Radar with clear comparable-scale guidance; radial bars as a separate option |
| Survey exploration | General aggregation charts; no dedicated respondent explorer | Entity-level grouping, grids and filtering [F8] | Likert, diverging response charts, respondent exploration and clear denominators |
| Pictorial quantities | No dedicated pictogram/waffle | Pictograms are documented [F9] | Accurate icon units, partial-unit rules and an accessible numeric equivalent |
| Hierarchy | Treemap and a two-level sunburst | Multiple nesting forms and drill-down [F10] | Arbitrary-depth hierarchy, circle packing, icicle/tree forms and navigation |
| Flows and networks | Sankey and network | Sankey/network plus chord template [F11, F12] | Chord, arc diagrams, scalable labels and explicit directed/undirected semantics |
| Geographic presentation | Three country/point-based forms with built-in simplified boundaries | Additional geographic template families [F12] | Custom geographic areas, marker layers, connections and geographic interactions |
| Calendar density | Generic heatmap only | Calendar template documented [F12] | Date-aware calendar layout with missing days and consistent date handling |
| Business indicators | Waterfall; candlestick planned | Gauge, progress, number ticker and Marimekko templates [F12, F13] | Bullet/progress, funnel, gauge, candlestick/OHLC and Marimekko |
| Dynamic rankings | Reveal animation/Story Studio, not dedicated races | Bar and line race templates [F12] | Actual time-driven values/ranking, interpolation and export consistency |
| Text and tables | Editable source table, not a published table/word-cloud chart | Table, cards and word-cloud templates [F12] | Searchable published table, word frequencies and word cloud with alternatives |
| Interactive narrative | Story Studio and bounded interactive HTML | Responsive templates and storytelling documented [F1, F14] | True responsive chart re-layout, richer controls and verified narrow-screen exports |

Additional proposed research forms—ECDF, uncertainty/error intervals, forest plots and ridgeline—would broaden OpenViz's analytical usefulness. Their presence or absence in Flourish was not established by this audit; do not market them as exclusive.

## Recommended build order

### Batch 1: strengthen everyday charts

Implement shared multi-series/grouping infrastructure first. Deliver multi-series line and area, grouped bars, horizontal stacks, 100% stacks and stacked area. Add shared-scale small multiples as a cross-chart capability, not an inflated extra type count. Improve direct series labels, legend wrapping, long category labels, missing-data gaps and numeric formatting across the existing catalogue.

Why first: it expands the questions ordinary datasets can answer and improves several families simultaneously. These additions should inherit V3.8 field requirements, reviewed switching, calculation summaries, individual styling and export behaviour.

### Batch 2: survey and research variety

Add diverging/Likert bars, waffle/pictogram, beeswarm/strip plots, ECDF and uncertainty intervals. Require explicit response ordering, neutral-category handling, denominators and supplied-versus-computed interval definitions. Add radar only with consistent scales and guidance about interpretation. Avoid automatic statistical inference presented as fact.

### Batch 3: relationships, hierarchy and business

Add bump, dumbbell, combo, chord, deeper trees/circle packing, calendar heatmaps, Marimekko, funnel/bullet and candlestick/OHLC. Implement dedicated data contracts and honest limits; do not route unfamiliar input into a misleading approximate chart.

### Batch 4: spatial and data-driven motion

Custom geographic regions, connection/arc layers and real bar/line races. This requires data-driven transitions and responsive output work rather than another visual reveal effect.

### Breadth target and counting rules

The user's goal of more variety should remain explicit. A provisional long-term target of 60+ meaningful chart options can guide the backlog, but is not proof of exceeding Flourish: its exact comparable inventory must be re-audited. Maintain three separate counts: renderer families, meaningful variants, and starting presets. Count a type only after it passes its data, editor, responsive, interaction and export acceptance gates. Reuse engines where appropriate without presenting aliases as novel families.

## Quality benchmark required before claiming “better”

Use identical input data, chart purpose, viewport and output format on both platforms. Record the concrete result, not a general aesthetic impression. Run blind user comparisons when possible.

| Area | Acceptance evidence |
|---|---|
| Numerical accuracy | Independently checked expected totals, ranks, bins, quantiles, intervals and missing-value behaviour |
| Honest visual encoding | Correct areas/lengths; negative and zero handling; explicit aggregation/normalisation; scale choices disclosed |
| Typography/layout | No unintended clipping or label collision with long labels, large values, many series and translated text |
| Responsive behaviour | Re-layout at 320, 768 and 1440 px; legible labels and usable controls, rather than only scaling the same SVG |
| Colour and accessibility | Readable contrast, sensible categorical/sequential/diverging palettes, keyboard access and descriptions |
| Interaction | Hover, selection, filtering and legends accurately identify records and keep scales consistent or disclose changes |
| Export consistency | Matching labels, palettes, legends, geometry and optional map notes in SVG, PNG, PDF, PPTX and HTML; clear fallback notices |
| Reliability | Source-switch/cancel/undo, save/reopen, project round-trip, missing columns, empty data and large datasets |
| Usability | First-time users can select the right chart, bind data, understand calculations and export; document errors and hesitation |

Existing DOM/Node checks are useful functional evidence. Real-browser visual, responsiveness, persistence and cross-viewer acceptance are still pending. The supplied screenshots demonstrate real user-visible findings, not a complete quality benchmark.

## Scope of this build

V3.8.1 implements the requested UI/map refinements and provides this comparison/expansion plan. It deliberately does not advertise any new chart types or claim superior quality. New chart implementation should follow Batch 1 with the acceptance matrix above.

## Official Flourish sources

All reviewed 16 November 2026. Source claims are documented capabilities; marketing descriptions of quality/responsiveness are not independent test results.

- [F1: FAQ — published breadth and template terminology](https://flourish.studio/resources/faq/)
- [F2: Line, bar and pie overview](https://helpcenter.flourish.studio/hc/en-us/articles/8761567940495-Line-bar-and-pie-charts-an-overview)
- [F3: Ranked area/bump charts](https://helpcenter.flourish.studio/hc/en-us/articles/9951629626383-How-to-create-an-area-bump-chart)
- [F4: Chart grids and scales](https://helpcenter.flourish.studio/hc/en-us/articles/8827954285583-How-to-create-a-grid-of-charts)
- [F5: Combination/dual-axis charts](https://flourish.studio/visualisations/dual-axis-charts/index.html)
- [F6: Scatter family overview](https://helpcenter.flourish.studio/hc/en-us/articles/8761582471439-Scatter-plot-an-overview)
- [F7: Radar family overview](https://helpcenter.flourish.studio/hc/en-us/articles/8761575550351-Radar-an-overview)
- [F8: Survey overview](https://helpcenter.flourish.studio/hc/en-us/articles/8761569396879-Survey-an-overview)
- [F9: Survey examples, pictograms and word clouds](https://flourish.studio/resources/visualize-survey-data/)
- [F10: Hierarchy overview](https://helpcenter.flourish.studio/hc/en-us/articles/8761561023375-Hierarchy-an-overview)
- [F11: Chord diagrams](https://flourish.studio/visualisations/chord-diagrams/index.html)
- [F12: Official list of templates supporting data downloads](https://helpcenter.flourish.studio/hc/en-us/articles/8827987230479-How-to-add-data-download-links-and-share-icons-to-your-header-or-footer)
- [F13: Marimekko overview](https://helpcenter.flourish.studio/hc/en-us/articles/8761553749007-Marimekko-charts-an-overview)
- [F14: Public visualisation catalogue introduction](https://flourish.studio/visualisations/)
