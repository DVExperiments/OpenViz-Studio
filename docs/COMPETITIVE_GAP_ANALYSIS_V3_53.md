# OpenViz Studio — competitive gap analysis (V3.53, 19 November 2026)

Benchmarks: **Datawrapper** (newsroom/government charts, maps and tables), **Flourish** (storytelling templates, animation, scrollytelling) and **Tableau** (BI and analytics). Competitor facts were checked against their public pages in November 2026. Datawrapper advertises 23 chart types plus three map types and tables. Flourish advertises 50+ templates. Tableau's Show Me panel offers 24 standard chart types, with analytics such as dual axes, reference lines and trend lines on top.

## 1. Where OpenViz already matches or leads (before V3.53)

| Area | OpenViz V3.52 | Comparison |
|---|---|---|
| Template breadth | 45 working options (79 by V3.60) | On par with Flourish's core set and wider than Datawrapper's chart count |
| Maps | Choropleth, symbol, route, density, custom GeoJSON, projections, map library | Wider than Datawrapper's 3 map types; Flourish adds 3D/globe |
| Animation | Bar/line races, 19 time-snapshot types, GIF/video export | Comparable to Flourish; ahead of Datawrapper and Tableau |
| Stories | Saved-view stories, scrolling stories | Comparable to Flourish |
| Tables | Editorial table with search, sort, bars and heat | Comparable to Datawrapper tables (no sparklines yet) |
| Output | SVG, PNG, PDF, editable PPTX, standalone HTML, embed kit | Wider than all three for offline delivery |
| Privacy | Local-first, no account, works offline | A clear differentiator |
| Integrity | Explicit missing-data rules, disclosed exclusions, no invented values | Stricter than the competitors |

## 2. Gaps found in V3.52

**Chart families competitors have that OpenViz lacked:** pie, column + line combo (dual axis), bullet bars, range (dumbbell) and arrow plots, split bars, lollipop, funnel, gauge, KPI/number cards, radar, waffle, beeswarm, ridgeline, population pyramid, bump chart, streamgraph, chord, arc diagram, circle packing, Marimekko, parliament chart, word cloud and candlestick (listed as "planned").

**Analytics:** reference lines (target/average/median) and scatter trend lines (Tableau and Datawrapper have both).

**UI quality ("looks vibe-coded"):**
- Unicode glyphs used as icons (＋ ↥ ▥ ◐ ☰ ↶). They render differently on every OS and font.
- A dark navy header on Home but a white one in the editor, so the app felt like two products.
- Heavy teal-filled tabs, three stacked toolbars and +/− section toggles.
- A marketing-style home hero ("Make your data tell a better story") instead of a workspace.
- Uneven control heights, focus states, radii and shadows across a 113 KB stylesheet with many version-specific overrides.
- Charts with manual axis bounds produced uneven ticks (0, 37.5, 75, 112.5, 150).

## 3. Delivered in V3.53

- **24 new chart families** (`src/pro-charts.js`). The catalogue now has **69 working templates** and nothing is still "planned". Each new family has:
  - a field contract with mapping suggestions, aggregation support and disclosed exclusions
  - an editable illustrative example
  - type-specific options in a new **Chart options** panel
  - tooltips on every mark
  - advisor recommendations
  - publishing/export through the existing pipelines
  - dashboard click-filtering for families keyed by category
- **Reference lines** (fixed value, average or median) on column, bar, line, area, dot, scatter and bubble charts. **Linear trend lines with R²** on scatter and bubble charts.
- **Rounder ticks** when the axis minimum or maximum is set by hand.
- **Professional UI refresh** (`src/ui-refresh.css`, `src/icons.js`):
  - one consistent line-icon set replacing the Unicode glyphs
  - a light header everywhere
  - segmented-control tabs and device switcher
  - quieter status and element ribbons
  - a dotted canvas board with a floating chart sheet
  - chevron accordions in Settings
  - 32 px controls with visible focus rings
  - refined modals and menus, light and dark tokens
  - a workspace-style Home with a "New chart types" filter and New badges
- Tests: a new `tests/test-pro-charts-v353.mjs` covers all 24 families, every option value, empty/unmapped states and data rules. All suites that passed in V3.52 still pass. The three tests that assert the catalogue size were updated from 45 to 69.

## 4. Remaining gaps, prioritised

1. **Hosted publishing and live links**: ✅ V3.56 adds the optional self-hostable Team Server: hosted links updated in place at the same URL, 20 versions with restore, and sandboxed pages. Still open: a managed cloud service, view analytics, custom domains per publication.
2. **Live data**: ✅ V3.55 adds links to Google Sheets, CSV/TSV/JSON, GitHub and Dropbox, with preview, a reviewed refresh and automatic refresh while the project is open. ✅ V3.56 Live publications re-fetch in readers' browsers. ✅ V3.57 adds opt-in scheduled refresh on the Team Server, so shared projects stay current when nobody has OpenViz open. Still open: server-side rendering of static images.
3. **Collaboration**: ✅ V3.56 adds shared projects with conflict-safe sync, 20 revisions, comments and an activity log. ✅ V3.57 merges scheduled-refresh revisions instead of raising conflicts. Still open: per-project permissions, shared folders, SSO and real-time co-editing.
4. **Annotation depth**: ✅ V3.54 adds data-anchored range highlights and arrow callouts to the core charts. ✅ V3.57 adds per-family value-label rules (series: last, first and last, highs and lows; categories: top or bottom 3 or 5, extremes) and hides labels that would overlap. Still open: drag-to-place callouts, and highlights on the V3.53 families and time views.
5. **Tableau-class analysis**: ✅ V3.55–3.56 add trend and seasonal forecasts with 80/90/95% prediction intervals, k-means clustering, and Live publications with reader filters, multi-level drill-down with cross-filtering, and playback. ✅ V3.58 adds what-if parameters: sliders that drive calculated fields and reference lines in the editor, on dashboards and in Live publications for readers. Still open: non-linear or ARIMA-style forecasting, and parameters that switch fields (not just numbers).
6. **Map extras**: ✅ V3.56 adds a locator map starter, a hexagon density map and tile maps (US states, NZ regions, custom grids). ✅ V3.60 adds a globe (orthographic, rotatable), spike and dot-density maps, custom marker icons, detailed 1:50m world borders, and a bundled library of 267 boundary sets (admin-1 for 213 countries, counties for every US state), loaded on demand. Still open: a world tile grid, drag-to-rotate on the globe, and admin-2 levels outside the US.
7. **Depth for the new families**: ✅ playback for all 25 newer families with fixed scales (V3.56). ✅ Native PPTX pie and combo charts were delivered in V3.55; table sparklines in V3.54. ✅ V3.60 adds images, flags and sticky columns in tables (Datawrapper-style).
8. **Brand themes for organisations**: ✅ V3.54 adds shareable theme packages: palette, fonts, logo, byline/footer and default source, with apply-to-all and apply-to-new. ✅ V3.55 extends themes to editorial tables, dashboards, slides and the sankey/network family. ✅ Personal default theme added (V3.56). ✅ V3.58 places the theme logo on slides in the editor and in PPTX, PDF and printable exports, with a per-slide opt-out.
9. **Engineering**: `src/app.js` had grown to 594 KB of long single-line statements. ✅ V3.57 starts the split, bringing it to 540 KB: six editor features now live in `src/editor/` (team, live data, brand, chart panels, map library, snapshot export). They use a shared `ctx` context and a repeatable extraction tool, with no behaviour change. ✅ V3.58 moves eleven more (stories, slides, storage, publishing, catalogue, data editing, styles, dashboards, help, map inspector, exports), bringing `app.js` to 387 KB. Still open: the inspector's property panels, home, the data page and the action dispatcher.
10. **Final verification phase**: ✅ V3.59 completed the automated part (see `docs/VERIFICATION_V3_59.md`):
    - Chromium and WebKit run identically.
    - There are 0 WCAG 2.2 AA violations on 19 screens.
    - The keyboard walkthrough passes.
    - Edits on 100k rows are about 5× faster, with memory flat.
    - Exports were checked in LibreOffice, PDF validators and renderers.
    - Six classes of issue were fixed.

    Still open, and needing people or other machines: screen readers (NVDA, JAWS, VoiceOver), Firefox and Safari on Apple devices, PowerPoint, Keynote, Google Slides and Acrobat, low-end hardware, and side-by-side user tasks against the competitors. Claims of parity should wait for these.

11. **Storytelling and engagement formats** (Flourish-style): ✅ V3.60 adds number tickers, countdowns, quizzes, guess-and-reveal polls, profile cards and tree/org charts (79 templates in total), interactive in published pages, with a fullscreen button on embeds. Polls reveal published results only and do not collect votes. Still open: collected polls (would need the Team Server, consent and abuse handling).
12. **Language and accessibility reach**: ✅ V3.60 adds right-to-left text (auto-detected Arabic, Hebrew, Persian and Urdu, with `dir="rtl"` pages) and rule-based written chart descriptions for alt text. AI features are deliberately out of scope for now, to keep hosting, deployment and maintenance simple.
13. **Styles**: ✅ V3.60 adds eight built-in styles in common newsroom looks with generic names (16 in total).

## 5. Suggested next batches

- **V3.54 (delivered):** range highlights and arrow callouts; table sparklines; organisation theme packages.
- **V3.55 (delivered):** live data links, themes everywhere, native PPTX pie/combo, line projections.
- **V3.56 (delivered):** Team Server, Live publications (self-updating, filters, drill-down, playback), forecasts with intervals, clustering, tile/hexbin/locator maps, playback for the newer families, default theme.
- **V3.57 (delivered):** per-family label rules with overlap avoidance; first `app.js` modules; opt-in scheduled refresh on the Team Server.
- **V3.58 (delivered):** what-if parameters, logos on slides, eleven more editor modules.
- **V3.59 (delivered):** automated verification round and its fixes (accessibility, large-data performance, PDF fonts, PowerPoint colours, storage summaries).
- **V3.60 (delivered):** tickers, countdowns, quizzes, polls, profile cards, tree/org charts; boundary library, globe, spike and dot-density maps, custom icons; right-to-left text; written descriptions; table images, flags and sticky columns; newsroom styles; fullscreen embeds.
- **Next:** the human part of verification (screen readers, Firefox and Safari, Office apps, user tasks), plus the remaining `app.js` split (inspector panels).
- **Then:** field-switching parameters, non-linear forecasting, per-project permissions on the Team Server.
- **Decided:** hosting and collaboration ship as the optional, self-hostable Team Server. Local-first remains the default.
