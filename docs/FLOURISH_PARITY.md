# Flourish gap sequence

This is an implementation plan and status record, not a quality ranking or completed head-to-head benchmark.

| Step | Gap | Status |
|---|---|---|
| 1 | Animated category rankings | V3.12 adds core bar race in editor and standalone interactive chart HTML: playback, scrubbing, speed, looping, stable colours and fixed scale |
| 1 follow-up | Richer race presentation and delivery | V3.13 adds a selectable single-entity history mini-chart, captions keyed to periods and loop-pause timing. V3.14 adds race GIF export and browser-dependent real-time video recording. V3.15 adds embedded category images, 257 flags and race styling. Pending: native video validation, smallest-value ranking, independent swap timing and multi-entity timeline display |
| 2 | Time controls across more chart types | V3.16 adds signed line races and reusable snapshot players for column/horizontal-bar/dot charts. V3.17 extends snapshot controls to scatter/bubble/choropleth/proportional symbols with fixed domains and stable entity keys. V3.40 adds fixed-scale route snapshots; V3.42 adds categorical heatmap snapshots with fixed row/column domains, per-period cell aggregation and common colour limits. V3.43 adds signed stacked-column snapshots with complete-stack timeline scales, fixed category/series order and stable colours. V3.44 adds grouped-column/horizontal snapshots with stable category/series slots, individual-cell timeline scales and full-timeline horizontal label margins. V3.45 adds 100% column/bar snapshots with per-period available-contributor normalization, explicit zero-total/no-data states and negative-source rejection. V3.46 adds signed horizontal-stack snapshots with complete positive/negative total scales, stable slots/label margins and disclosed clipping for filtered over-range totals. V3.47 adds multi-series line snapshots with full numeric/date/categorical X domains, fixed signed Y scales and gaps at missing known X positions. Pending: native browser validation, multi-series area snapshots and richer timing/transition options |
| 3 | Rich storytelling | V3.18 adds saved scene views, named periods/filters and conservative matching-mark transitions. V3.19 adds scroll chapters, navigation and a complete script-free reading view. Pending: native layout validation and broader transition semantics; races remain selected-period views in stories |
| 4 | Geographic breadth | V3.20 adds local Polygon/MultiPolygon GeoJSON choropleths, explicit join review, embedded portable geometry and fixed-domain regional time playback. V3.21 adds custom-region proportional symbols, reviewed regional aggregation, interior representative anchors and fixed time size scales. V3.22 adds optional bounded place/region names and a world extent locator inset. V3.23 adds staged manual name placement/visibility, custom-region symbol display anchors and geographic callouts. V3.24 adds local/Mercator/spherical equal-area choices, staged custom crops, padding and wrapped coordinate Fit. V3.25 adds continuous/equal/quantile/manual classes, fixed time breaks and responsive legends with no-data controls. V3.26 adds three-stop diverging colours, explicit reference, independent/symmetric ranges and neutral interval legends. V3.27 adds opt-in direct name/callout-box dragging and keyboard nudges with atomic Undo and persisted plot-relative positions. V3.28 adds authored continuous/equal-interval numeric colour limits, saturation counts and shared-scale delivery. V3.29 adds positive log and signed symlog continuous/equal-interval colours with original-unit legends. V3.30 adds below-map legend width/alignment, grid/list, type size and literal unit/number-format controls. V3.31 adds staged plain-text tooltip labels/value formats, contributor/aggregation/period/coordinate controls and keyboard missing-region details. V3.32 adds four explicitly selected tooltip fields with grouped-record rules, missing/conflict disclosures and source-binding protections. V3.33 adds opt-in place/ID search and per-map pinned details in Preview/interactive chart/dashboard HTML. V3.34 adds opt-in bounded SVG zoom/pan/reset, optional dragging and per-map transient view continuity in interactive chart/dashboard HTML. V3.35 adds complete-scene exploration in Story Studio/player HTML and independent interactive reading/sticky chapter controls. V3.36 adds bounded Locate fit/recenter with current mark geometry in supported reader contexts. V3.37 adds a live locator inset that follows zoom/pan/Locate with projection, padding and wrapped-longitude handling. V3.38 adds a coordinate-based route/connection template with straight/illustrative curved links, arrows, weighted width and existing exploration/export support. V3.39 adds explicit directed-pair aggregation, reciprocal separation and reusable authored width maxima. V3.40 adds route snapshot playback with per-period aggregation, fixed full-timeline geography/widths, stable route IDs and saved-period dashboard filtering. V3.41 adds route tooltip labels/formats/visibility and four selected extra fields with current-period contributor rules. Pending: native validation and richer geographic breadth |
| 5 | Publishing and team workflow | Pending: managed hosting, review/collaboration and live data integrations |

Before claiming parity for any step, compare identical datasets and configuration in both products and test exported output in real browsers. The current implementation is independently built; no competitor code or assets were copied.

Official references reviewed 16 November 2026:

- https://flourish.studio/visualisations/bar-chart-race/ — race customisation, images, captions, smallest-value controls and timeline chart.
- https://helpcenter.flourish.studio/hc/en-us/articles/8761566757647-Bar-chart-race-an-overview
- https://helpcenter.flourish.studio/hc/en-us/articles/8761522984207-How-to-change-the-animation-speed-of-your-bar-chart-race — timeline duration, swap timing and pause before looping.
- https://helpcenter.flourish.studio/hc/en-us/articles/8761567156623-How-to-start-a-bar-chart-race-paused

V3.12 is deliberately narrower than these combined features. Its practical milestone is a playable local race with explicit statistical/display rules and portable output.

## V3.14 completion of the V3.13 next batch

Implemented a dedicated race export pipeline for changing values/positions, captions and history. Actual GIF output was decoded and timed; native browser video remains unverified. Existing story/dashboard paths remain snapshots. Frame, memory, duration and visibility limits are explicit in the dialog.

Additional references for this batch:

- https://helpcenter.flourish.studio/hc/en-us/articles/8761546928271-How-to-add-a-chart-to-a-bar-chart-race-timeline
- https://helpcenter.flourish.studio/hc/en-us/articles/8827954663183-How-to-add-captions-to-your-racing-charts

Our timeline shows one selected entity, and captions attach to observed periods. These are narrower than Flourish's full timeline/caption configuration; no complete parity is claimed.

## Next batch after V3.14

Add category images/flags and race styling. Preserve local operation and portable projects; avoid runtime dependencies on remote image servers. After that, add line-chart races and reusable time controls. Complete real browser/Windows video validation before claiming full recording parity.

Technical references used for V3.14:

- https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream
- https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported_static
- https://www.w3.org/TR/mediastream-recording/

## V3.15 completed batch

Category images/flags and appearance are implemented locally: exact/manual assignments, custom image uploads, label/bar-end placement, contain/circle treatment, per-category colours, bar roundness/opacity, row fill and label controls. Assets travel with portable projects, static/interactive chart output and GIF. A real flag GIF was decoded and timed; browser-native image/canvas/video checks remain pending. This closes part of the presentation gap without claiming complete parity.

**Next:** line-chart races and reusable time controls. Later work still includes smallest-value ranking, independent swap timing, broader history/timeline presentation and native recording validation.

## V3.16 completed batch

Added line-chart race with progressive trajectories, signed fixed scale, numeric/date X spacing, missing gaps, peak-selected entities, captions, endpoint assets and shared playback/export geometry. Interactive chart HTML preserves controls; dedicated GIF renders the race. Added independent time snapshots to column/horizontal-bar/dot with fixed value scale, source-safe capture/Undo and portable time bindings. A real line GIF was decoded/timed, and model/runtime/editor checks passed.

This remains narrower than Flourish's combined animation ecosystem. Snapshot time controls do not yet cover scatter/maps, ordinary charts do not have timeline GIF/video export, dashboard/story scenes remain static snapshots, and native video validation is pending.

**Next after V3.16:** scatter and map time controls with fixed scales and stable identity; then richer chart-state storytelling. No new head-to-head benchmark was performed in this batch.

## V3.17 completed batch

Time snapshots now cover scatter, bubble, choropleth and proportional-symbol maps, plus the existing three comparison charts. Fixed XY/area/colour/map domains keep periods comparable; explicit identity preserves point colours through row reorder. Ambiguous duplicates are rejected. Map exports reuse local geometry. Editable examples, source-safe capture/Undo, portable bindings and executed HTML runtime checks are included. The chart count remains 43.

These are discrete snapshots, not continuous scatter/map transitions or trails. Dashboard/story output remains a saved snapshot. Heatmap time controls, ordinary snapshot timeline GIF/video and native browser/video validation remain gaps. No new competitor benchmark was performed.

**Next after V3.17:** richer storytelling with saved chart states and transitions between scenes.

## V3.18 completed batch

Scenes now keep separate presentation settings, named periods and filters of a shared linked chart. Preview, publishing and animation use per-scene sources. Matching-mark transitions cover compatible fixed-axis rectangle/circle charts, with explicit crossfade fallback and no inferred joins or new observations. Standalone HTML adds static fallback, scene navigation and reduced-motion handling. An actual 21-frame story GIF was decoded and timed at 3.3 seconds.

Data, calculations, mappings and image assets stay linked; saved views are not frozen source backups. Maps/path morphs and moving axes are not matched. Native browser/video validation remains pending. This is an implementation milestone, not a new competitor benchmark or full parity claim.

**Next after V3.18:** scroll-driven stories, chapter navigation and accessible reading fallbacks.

## V3.19 completed batch

Story Studio adds authored chapter titles/text/descriptions, scroll delivery with optional existing scene transitions, explicit chapter navigation and Reading view. Small screens/reduced motion have complete-state fallbacks; no-JavaScript/static publication contains all chapters and figures. Saved scene sources are shared across animation, scrolling and reading output. Native browser layout was not verified because the Chromium executable is unavailable.

This closes an initial scroll-narrative implementation gap, not full storytelling parity. Browser/screen-reader validation, adaptive reading-chart reflow and broader transitions remain pending. No competitor benchmark was performed.

**Next after V3.19:** geographic breadth, starting with local custom GeoJSON boundaries and explicit regional joins.


## V3.27 completed batch

Direct map name/callout-box editing now uses the existing authoring settings. Drag completion commits one Undo entry; cancelled or stale gestures commit nothing. Keyboard arrows/Shift arrows nudge visible items; Enter/Space/double-click opens the staged numeric manager at the exact item. Geographic callout points, symbol anchors, data and joins remain unchanged. Publishing output has no editor runtime. DOM workflows and prior suites pass; normal native Chromium launch failed, so browser/touch/screen-reader/Windows acceptance remains pending.

**Next after V3.27:** authored numeric colour-domain limits for consistent scales across separate maps. This is an implementation milestone, not a competitor benchmark or full geographic parity claim.


## V3.28 completed batch

Choropleths now have staged custom numeric colour limits for Continuous and Equal interval, preserved through pooled time models, portable files, saved scenes and chart/dashboard publishing. Matching values share colours when full scale/style settings match. Legends disclose saturation counts; actual values and data remain unchanged. Quantile/Manual retain their own break semantics. All 29 automated suites pass; native browser/Windows/touch/screen-reader acceptance remains pending because normal Chromium launch failed.

**Next after V3.28:** logarithmic and symmetric-log colour scales for skewed positive/signed values. No same-data competitor benchmark was performed; full parity is not claimed.


## V3.29 completed batch

Choropleths add log and symmetric-log transformations for Continuous/Equal interval. Log rejects nonpositive aggregates; symlog preserves signed zero with an authored positive constant. Inverse-sampled legends retain original units, transformed class thresholds and reference positions. Shared custom/time domains, portable files, story views, publishing and Undo are preserved. Thirty automated suites pass; normal Chromium launch failed, so native browser/touch/Windows/screen-reader acceptance remains pending.

**Next after V3.29:** map legend layout and number-format controls with explicit units and precision. No identical-data competitor benchmark was performed and full parity is not claimed.


## V3.30 completed batch

Choropleths gain staged legend width/alignment, grid/list, text size, numeric display formats and literal units. Scaled layout reserves space, styled gradient values stagger for narrow readability, and exact thresholds remain in titles/metadata. Data, class membership, fixed time domains and tooltip values retain their semantics. Portable/story/dashboard/time HTML and Undo paths preserve display settings. Thirty-one automated suites pass; native Chromium launch failed, leaving browser/touch/Windows/screen-reader acceptance pending.

**Next after V3.30:** map tooltip customisation with clear displayed labels, values and number formats. No same-data competitor benchmark or full geographic parity claim.


## V3.31 completed batch

Country/regional choropleths and proportional symbols gain dedicated staged plain-text tooltip controls, exact/rounded values, contributor counts, aggregation/current period and coordinate provenance. Keyboard navigation includes custom missing regions, and time changes dismiss stale details. Default output and fixed domains remain; portable/story/dashboard/time HTML and Undo preserve settings. Thirty-two automated suites pass; normal native Chromium launch failed, leaving native/touch/Windows/screen-reader acceptance pending.

**Next after V3.31:** additional tooltip fields with explicit grouped-record aggregation rules. No identical-data competitor comparison was performed, and full geographic parity is not claimed.


## V3.32 completed batch

Custom map tooltips add up to four explicit source columns, per-field rules/formats and missing/conflicting-value disclosures. Contributor selection follows the primary mark/period. Rename, delete, refresh and reviewed dataset-switch paths treat definitions as data bindings. Unselected HTML data remains excluded; optional source tables now also work in time HTML. Thirty-three automated suites pass; native Chromium launch failed, leaving native/touch/Windows/screen-reader acceptance pending.

**Next after V3.32:** map search and pinned detail panels. No identical-data competitor benchmark or full geographic parity claim.


## V3.33 completed batch

Opt-in map place/ID search and pinned detail panels now reuse existing tooltip summaries, update through time, disclose missing/unavailable places and isolate dashboard card state. Search does not filter data or change linked selections; ordinary mark linking remains. Author setting persists, reader queries/pins remain temporary. Thirty-four automated suites pass; normal Chromium launch failed, leaving native/touch/Windows/screen-reader acceptance pending.

**Next after V3.33:** map zoom, pan and reset controls. This is an implementation milestone, not a same-data competitor benchmark or full parity claim.

## V3.34 completion

Reader zoom/pan/reset delivered independently of search. Bounds preserve original authored crop; fixed titles/legends/locator, optional pointer drag, no wheel interception, time/responsive continuity and dashboard isolation. Static outputs preserve authored view. 35 suites pass; native browser/touch/Windows acceptance pending. Independent implementation, not a completed head-to-head benchmark. Next: map reader controls in stories and scroll chapters.

## V3.35 completion

Map exploration in stories/chapters delivered. Animated players use an explicit paused complete-scene view; reading chapter maps are independent, sticky controls are removed on interpolated transitions. Saved scene period/filter respected; static/no-JS outputs remain clean. 36 suites pass; native browser, touch, assistive technology and Windows pending. No completed head-to-head benchmark or full parity claim. Next: bounded zoom-to-place via Locate.

## V3.36 completion

Locate fits/recentres the pinned place within the authored frame, preserves focus/pin, and leaves linked selections/source state unchanged. Current points and region bounds use 4×/8× caps; unsafe measurement gracefully leaves the view unchanged. 37 suites pass; native browser getBBox/CTM/layout, touch and Windows pending. Generated geometry fixtures are not a head-to-head benchmark. Next: live locator inset.

## V3.37 completion

Live locator viewport delivered for local/Mercator/equal-area navigation with padding, split dateline markers, tiny/empty viewport disclosures and temporary state. Preview, chart/dashboard HTML and complete story/chapter readers share it. Static exports retain authored extent. 38 suites pass; native/browser/touch/assistive technology/Windows pending. Independent implementation, not completed head-to-head parity evidence. Next: route and connection maps.

## V3.38 completion

44th template: route/connection maps. Explicit coordinate roles and per-row semantics, bounded routes, seam clipping, fit, optional arrows/endpoints and uniform/proportional width; editable templates, portable/data review and chart/dashboard/story delivery. 39 suites pass; native/browser/touch/Windows pending. No geodesic, automatic route time or complete parity claim. Next: aggregation, reciprocal separation and shared width limits.

## V3.39 completion

Route options now include rows/sum/average/count/min/max by exact directed pair, stable perpendicular reciprocal curves and per-chart/scene shared maxima with saturation disclosure. Defaults/source rows preserved. 40 suites pass, including vertical separation, overflow, scene and editor workflows. Native browser/touch/Windows pending; no head-to-head/full parity claim. Next: fixed-scale route time playback.

## V3.40 route time delivery

Route playback uses the existing bounded snapshot player. Directed-pair aggregation is per period; width maxima/Fit/reciprocal sides reference the full included timeline. Optional row IDs support moving connections, duplicate identities fail validation, missing connections disappear and zero/empty periods are explicit. Map exploration survives period changes. Interactive chart HTML plays all snapshots; static/dashboard/story output uses saved periods. Dashboard filters preserve the source timeline reference and never substitute another period.

This is implementation status, not a new competitor audit or parity claim. Next: plain-text route tooltip controls and additional selected detail fields.

## V3.41 route tooltip delivery

Reuses the staged plain-text map tooltip editor for connection labels, formats, endpoint coordinates and up to four selected contributor fields. Group calculations use every valid contributor in the current period, not the shortened view-row sample. Required identity/capping/illustrative-route disclosures remain. Bindings follow rename/dependency/switch review and remain linked in saved scenes. Existing map/route/time suites pass alongside new export/runtime/editor coverage. This is implementation status, not a new competitor audit.

Next: heatmap time playback with a fixed colour scale.

## V3.42 categorical heatmap time delivery

Heatmap snapshots use fixed categorical axes and a zero-anchored colour domain computed from per-period cell aggregates. Missing cells remain no data, numeric zero remains a value, and invalid-only observed periods keep the grid. Dashboard filters preserve the saved period and complete source timeline domain. Static/story outputs remain saved-period snapshots; interactive chart HTML includes playback. 43 suites pass with native acceptance pending. This is implementation status, not a new competitor comparison.

Next: stacked-column time playback with stable series colours and fixed value scales.

## V3.43 stacked-column time delivery

Stacked snapshots aggregate category/series cells per period and stack positive/negative results separately. Full-timeline positive/negative totals define fixed value bounds; categories, legend and series colours retain their slots. Missing combinations are omitted, zero has no area and invalid-only observed periods stay empty. Dashboard filters keep saved periods and full-source domains/scales. Interactive chart HTML plays snapshots; other delivery uses the saved period. 44 suites pass, native acceptance pending. This is implementation status, not a new competitor audit.

Next: grouped columns and grouped horizontal-bar time playback.

## V3.44 grouped time delivery

Grouped columns and horizontal bars now use per-period cell aggregation, fixed category/series slots, stable full legends/colours and zero-anchored individual-cell scales. Missing cells remain absent; zero uses a baseline marker. Full-timeline category names determine horizontal margins, including empty/filtered periods. Dashboard filters retain saved periods and full-source domains/scales. Interactive chart HTML plays all snapshots; static/story output uses saved periods. 45 suites pass; native acceptance pending. This is implementation status, not a new competitor audit.

Next: 100% stacked column/bar time playback with explicit zero-total/missing rules.

## V3.45 composition time delivery

100% stacked columns and bars now use per-period category/series aggregates and a fixed percentage scale. Negative numeric source contributors reject playback; Count ignores measures. Missing components are omitted with counts disclosed, zero totals have undefined shares and no-data categories remain distinct. Details retain values, totals, counts and current period. Filtering recalculates the available denominator while retaining saved periods and full slots/legend. 46 suites pass; native acceptance pending. This records implementation, not a new competitor audit.

Next: signed stacked-horizontal time playback with full-timeline total scales.

## V3.46 signed horizontal-stack time delivery

Stacked horizontal bars now aggregate category/series cells per period and use fixed complete positive/negative timeline totals. Slots, colours, legend and full-timeline label margins stay stable. Zero uses a boundary marker, missing cells remain absent and invalid-only periods keep an empty view. Dashboard filters retain saved periods and source domains; filtered over-range totals are clipped and disclosed, with original values retained. 47 suites pass; native acceptance pending. This is implementation status, not a new competitor audit.

Next: multi-series line snapshot playback with fixed axes and consistent missing-data gaps.

## V3.47 multi-series line snapshot delivery

Snapshot period is separate from ordered X. Lines use fixed X/Y domains and full series colours/legend. Numeric/ISO date-only X retains actual spacing; categorical X uses observed order. Explicit missing-measure rows retain known positions; absent cells break paths and zero stays observed. Dashboard filters retain saved periods/domains; out-of-range observations use disclosed boundary markers and break lines. 48 suites pass with native acceptance pending. This is implementation status, not a competitor audit.

Next: multi-series area time playback with clear missing/overlap rules.


## V3.48 overlapping-area snapshot delivery

Seventeen snapshot-enabled types now include multi-series areas. Areas overlap from zero rather than stack; negative numeric contributors reject, Count ignores measures. Fixed known-X/Y domains, gap-separated fills/outlines and stable series support saved-period dashboard filtering and disclosed out-of-range boundaries. All fills precede outlines/markers. 49 suites pass; native acceptance remains pending. This is implementation status, not a fresh competitor audit. Consolidated backlog: REMAINING_WORK_V3_48.md.

Next: stacked-area snapshots, followed by shared-scale small-multiple snapshots. Native acceptance remains the main stable-release blocker.


## V3.49 editorial table delivery

Dedicated native chart tables now publish selected unaggregated source columns, with per-column formatting, signed bars/heat, original-value sorting, search and pages. Consistent light/dark designs, rename/Undo/data-switch handling and disclosed static graphic pages are included. Catalogue45; snapshot types17. Six focused suites pass. Full verification is deferred by the user until the revised five implementation priorities are complete. No competitor parity or current native acceptance is claimed. See QUALITY_GAP_PLAN_V3_49.md. Next: map resources/start points, followed by motion and template depth.


## V3.50 map-resource discovery and starter delivery

Eight editable starters, searchable bundled country/area resources, downloadable GeoJSON/blank join CSV, staged current-map boundary review and official-provider guidance are implemented.176 individual outlines plus collections reuse the existing simplified snapshot; no new high-resolution/admin coverage or chart family is claimed. A collapsed polygon is omitted only in downloadable copies; global examples use the built-in renderer rather than relaxing regional extent limits. Six focused suites pass. Comprehensive/native verification remains deferred. Next: richer time playback, starting with stacked areas and shared-scale small multiples.


## V3.51 profile snapshot delivery

Stacked areas and shared-scale small multiples now support time snapshots:19 types,45 catalogue options unchanged. Stack missingness blocks unknown layer positions rather than filling zero; complete totals remain unknown where incomplete. Facets keep shared axes/fixed series slots and colours. Full-source filter domains, transient playback/capture/Undo and taller responsive facet SVG/PNG aspect handling are wired. Six focused suites pass. No new competitor audit or comprehensive/native acceptance claim. Next: ordinary snapshot GIF/video export.


## V3.52 snapshot animation delivery

All19 snapshot-enabled types have an observed-frame GIF/browser-video export path retaining full-timeline scales and missing-data semantics under range selection. Progress, cancellation, real-time recording, dimension/duration/buffer bounds and repeat download are wired. Six focused suites pass, including real GIF encoding/delay checks and controlled video lifecycle; native codecs/timing and comprehensive verification remain deferred. Catalogue45 unchanged. Next: combo and bullet/progress templates with editorial defaults. No new competitor audit/parity claim.
