# OpenViz Studio V3.61: maps for every country, template groups

## Map library: starting points for any country

Open **Map library → Starting points** and choose a country in **Country or area** (221 countries and areas), or type a country name into the search box. Each country gets its own editable starting points:

- **Compare regions**: a choropleth of its states, provinces or regions (213 countries), with a legend.
- **Places**: proportional circles at well-spread points across the country.
- **Locator map**: labelled pins with an overview inset.
- **Point density** and **Hexagon density**.

Maps are framed on the main territory (for example mainland France, or the US lower 48), use detailed borders, and the example values are fictional and labelled as such. The New Zealand and Pacific starters are still there, now marked as examples.

## Template library groups

The chips at the top of the template library are now groups that filter the whole catalogue, with counts: **All**, New, Comparison, Trends over time, Part-to-whole, Distribution, Relationships, Maps, Flows & hierarchy, Tables, Storytelling & animation, Specialised and Experimental. The selected group is highlighted, and **All** always returns to every template. Every template belongs to at least one group.

**Map library ↗** opens the map library with a **← Back to templates** link that returns you to the group and search you had.

## Fixes

- Map tooltips turned apostrophes into "undefined" (e.g. "Côte d'Ivoire", "Hawke's Bay").
- "New chart types" only showed the V3.53 templates; it now includes V3.60's.
- Dark mode: the "Import and create" button text had too little contrast.
- The status bar showed v3.59.

---

## OpenViz Studio V3.60: interactive templates, boundary library, globe, spike and dot maps, right-to-left text

This release adds the newsroom and storytelling formats that were still missing, a large ready-made map library, and text features for more languages. Everything still runs locally. Nothing in this release uses AI or sends data anywhere.

## New templates (79 chart types in total)

- **Number ticker:** headline numbers count up once when the reader scrolls them into view. Choose the starting value, decimals, prefix, suffix and duration.
- **Countdown:** days, hours, minutes and seconds to (or since) a date, updated every second on published pages. Images and PDFs show the time at export.
- **Quiz:** one row per answer, with a column marking the correct one and an optional explanation. Readers click or press Enter; the right answer and explanation appear and a score is kept.
- **Poll (guess and reveal):** readers pick an answer and the *published* results animate in. Polls do not collect or send votes; they reveal the numbers in your data.
- **Profile cards:** a photo or initials, name, role, a highlight number and a short bio for each person or item.
- **Tree / org chart:** a hierarchy from name + parent columns, or from paths such as `Europe/France/Paris`. Top-down, left-to-right or radial. Loops and missing parents are reported, not hidden.

In standalone HTML, Publishing Studio pages and live publications these are interactive. PNG, SVG, PDF and PowerPoint get a still: the final numbers (ticker), the time left at export (countdown), the questions with or without answers depending on the quiz's *Reveal* setting, and the poll results if the poll is set to show them from the start.

## Maps

- **Boundary library:** 267 ready-made sets, loaded only when used: states, provinces and regions for 213 countries (Natural Earth 1:10m, ISO 3166-2 codes where available) and counties for every US state (US Census via us-atlas, 5-digit FIPS codes). Open **Map library → Included outlines**, search a country or state, then **Preview & use resource**. Each set lists its join key and source.
- **Border detail:** world maps can switch to a detailed 1:50m outline (loaded on demand).
- **Globe:** an orthographic "3D" globe projection with a rotate control, graticule and ocean. The far side is clipped properly.
- **Spike maps and dot-density maps:** new marker styles for point and area data, with their own legends. Dot positions are stable between renders and capped at 12,000 dots.
- **Custom marker icons:** 15 built-in icons or your own small image (PNG, JPEG, WebP or SVG up to 200 KB), at a fixed size or sized by value.

## Text and accessibility

- **Right-to-left text:** Arabic, Hebrew, Persian and Urdu titles are detected automatically (or set *Text direction* by hand). Titles and legends align right, mixed text is ordered correctly, and published pages get `dir="rtl"`.
- **Suggested description:** under *Accessible design*, a plain-language summary of the chart (highest and lowest values, trends, totals) generated from your data by rules, not AI. Click **Use as description** to copy it into the description field.
- **Full-screen button** on published pages and embeds (embeds already allow full screen).

## Tables

- **Images and flags in cells:** set a column to show images (https or embedded images only) or flags (country names, ISO2 or ISO3 codes).
- **Sticky columns:** keep chosen columns visible while the table scrolls sideways.

## Styles

Eight new built-in styles in common newsroom looks, with generic names: Financial paper, Weekly briefing, Wire service, Public broadcaster, Data desk serif, Tabloid bold, Statistics office and Night desk (16 built-in styles in total).

## Fixes found while testing

- France and Norway now join on world maps by `FRA` / `NOR` (Natural Earth leaves their ISO3 code blank), and get flags in tables.
- Charts without axes no longer read "… of undefined" to screen readers.

See `docs/CLAUDE_HANDOFF_V3_60.md`, `docs/QA_V3_60.md` and `docs/BOUNDARY_LIBRARY.md`.

---

## OpenViz Studio V3.59: verification round (browsers, accessibility, performance, exports)

This release is the result of a verification pass. It contains no new features: only the fixes the checks found. The full report is in `docs/VERIFICATION_V3_59.md`.

- **Browsers:** all 70 chart types and the main workflows behave the same in Chromium and WebKit (Safari's engine family).
- **Accessibility:** 0 automated WCAG 2.2 AA violations across 19 screens, down from 233 flagged elements. Contrast has been raised throughout, light and dark. Labels and focus handling have been fixed. Keyboard use was walked through end to end.
- **Large datasets:** with 100,000 rows, edits are about 5× faster and memory stays flat. Undo now shares unchanged data, autosave no longer reads the whole project back, and column lists and totals are cached.
- **Exports:** decks were checked in LibreOffice, PDF validators and renderers.
  - Bold slide text no longer turns italic in PDFs.
  - Single-series editable PowerPoint charts keep one colour.
- **Keyboard:** Enter in the command search runs the top match. Closing a dialog that was opened from a menu returns focus to that menu.
- **Storage:** projects now have a small summary record. Saved projects upgrade automatically. If an outdated cached copy of the app opens, it asks you to reload.

**Hosting note:** serve the app files with `Cache-Control: no-cache`. The Team Server already does.

---

## OpenViz Studio V3.58: what-if parameters, logos on slides, editor split into modules

## What-if parameters

*Data → What-if parameters* creates named numbers with a range, a step and a display format (number, percent or currency). Examples: a growth rate, a price or a target.

- **In calculated fields:** write `{Growth rate}`, for example `[Revenue] * (1 + {Growth rate} / 100)`. The calculated-field dialog lists your parameters as buttons that insert them.
- **As a reference line:** choose *Reference line → What-if parameter*. The line follows the parameter's value.
- **Sliders:**
  - in the chart settings (*What-if parameters* section), where the preview updates while you drag
  - above dashboards, for every parameter their charts use
  - in **Live publications**, where readers can explore scenarios themselves. Calculations are rebuilt in the reader's browser, and *Reset values* goes back to the published values.
- **Safe changes:** moving a parameter recomputes only the calculated fields that depend on it, so dataset edits are kept. Changes can be undone. Renaming a parameter updates the formulas that use it.

## Organisation logo on slides

Open the slide settings (click an empty part of a slide), go to *Logo on slides*, and choose a corner and a size. The logo from your organisation theme then appears:

- on every slide in the editor
- in PowerPoint (SVG and WebP logos are converted to PNG)
- in PDF and printable slide exports

You can hide it on individual slides, for example a title slide.

## Editor modules (no behaviour change)

Eleven more features have moved from `src/app.js` into `src/editor/`:

- stories
- slides and present mode
- storage
- publishing
- chart catalogue
- dataset editing
- style library
- dashboards
- help
- map inspector panels
- export dialogs

`app.js` went from 540 KB to 387 KB.

The extraction tool can now keep state variables in `app.js` when the rest of the app assigns them. Each move was checked by running the same browser walkthrough before and after, with identical results.

---

## OpenViz Studio V3.57: value-label rules, first app.js modules, scheduled refresh on the Team Server

## Value-label rules for each chart family

Turn on *Show value labels*, then choose which values get a label:

- **Line and area charts:** every value, the last value, the first and last values, the highest and lowest values, or the highest only.
- **Bar, column, dot, lollipop, combo, range, arrow, split-bar and pyramid charts:** every value, the top 3 or 5, the bottom 3, the highest and lowest, or the highest only.

*Hide labels that would overlap* is on by default. Dense charts drop labels that would collide instead of printing them on top of each other.

## Scheduled refresh when nobody has OpenViz open (optional)

In a project shared with a Team Server, tick *Data → Live link settings → Also refresh on the team server when nobody has OpenViz open*. If the server was started with `SCHEDULED_REFRESH=1`, it fetches the link on the dataset's schedule and saves a new team revision whenever the data changes.

Teammates with unsynced edits are not sent into a conflict because of a scheduled refresh. *Sync with team* merges the refreshed rows into the local copy and then saves.

The server fetches only public `https://` links. It refuses private, loopback and link-local addresses, also after DNS lookups and redirects. Datasets that are not opted in are never fetched by the server, and OpenViz without a server works exactly as before. See `server/README.md`.

## Modular editor (no behaviour change)

Six features have moved out of `src/app.js` into `src/editor/`:

- team
- live data
- brand themes
- chart panels
- map library
- snapshot export

They share the editor's state through a small live `ctx` context. `tools/extract-editor-module.mjs` repeats the move for further blocks: it analyses free variables and refuses unsafe moves. See `docs/APP_MODULES.md`.

---

# Previous release notes

## OpenViz Studio V3.56 — Team Server, live publications, forecasts, clustering, tile & hexbin maps, playback everywhere

## Hosted links and collaboration: the optional Team Server

`server/openviz-server.mjs` is a self-hostable server with zero dependencies (Node 18+). OpenViz keeps working fully offline without it. See `server/README.md`.

- **Hosted links you can update in place.** In Publishing Studio, *Publish to team server* gives a URL. *Update team link* replaces the content at the same URL, so embeds update automatically. The last 20 versions are kept, can be viewed, and can be restored.
- **Shared projects** (*File → Share project with team / Open team project / Sync with team*). Sync uses revision numbers. If a teammate saved first while you had unsynced edits, you choose: use the team version, keep yours as a copy, or overwrite. The server keeps 20 revisions.
- **Comments** on charts (*Settings → Team comments*), with resolve/reopen, plus a team activity log.
- **Access tokens per member** (constant-time checks). Published pages are sandboxed in a unique origin by CSP, so they cannot reach the API. Writes are atomic, bodies are size-limited, requests are rate-limited, and static files are path-safe. The server also serves the app at `/app/`.

## Live publications: self-updating charts and dashboards with filters, drill-down and playback

Publishing Studio has a new content mode, **Live**. It embeds a bundled runtime (`src/dist/openviz-live.js`, about 485 KB) so readers' browsers redraw the charts. It works as a downloaded file or as a Team Server link.

- **Self-updating:** datasets with a live link re-fetch when the page opens (and on their interval while it stays open). If a refresh fails, the published snapshot stays and the page says so.
- **Reader filters:** up to 6 shared category or period fields, combined with AND, with a Reset button.
- **Drill-down:** set levels per chart (*Settings → Drill-down*), for example Region → City → Store. Readers click a bar or slice to go down a level, use a breadcrumb to go back up, and other dashboard charts cross-filter to match. Marks are keyboard-accessible.
- **Playback controls** for time-enabled charts, and a "View data" table for every chart.
- Only the columns the charts actually use are embedded.

## Forecasts with uncertainty, and clustering

- Line and area charts: *Reference lines & forecast* now offers a **linear trend** or **trend + seasonal pattern** (season length you choose), with an **80/90/95% prediction interval** band. The band uses ordinary least squares with the exact Student-t interval ŷ ± t·s·√(1 + x₀ᵀ(XᵀX)⁻¹x₀). It widens with the horizon, and tooltips state its assumptions. Choosing "None" restores the plain trend line.
- Scatter and bubble charts: **k-means clustering**, with a fixed number of clusters (2–8) or an automatic choice (2–6, best silhouette). It runs on standardised axes and is seeded, so results repeat. It adds centroids and a cluster legend, and the tooltip says that clusters describe patterns in these two variables only.
- Scatter X axes now use round ticks.

## New maps

- **Tile map (grid cartogram):** a new template with built-in grids for US states (51) and New Zealand regions (16), or your own Row/Column grid. Tiles can be squares or hexagons, coloured on a continuous or classed scale. Unmatched names and missing tiles are reported.
- **Hexagon density:** a new style for the geographic heatmap that shows exact counts (or total weights) per hexagon, with its own legend. The disclosure notes that hexagons on a projected map don't cover equal ground areas.
- **Map library starters:** *Locator map* (equal pins, labels, framed view, overview inset) and *Hexagon density map*.

## Time playback for the newer chart families

All 25 V3.53+ families can now play through periods. Choose a *Period field* under *Chart options → Time playback*, then use Play/Pause and the slider, or set the period that static exports use. Scales are fixed across the whole timeline, nothing is interpolated between periods, and the current period shows as a watermark. Live publications include the player.

## Your own default theme

In the Organisation theme editor, **Make my default** applies that theme to every new project on this device. *Clear my default* removes it.

## Evidence

- New suites, all passing:
  - `tests/test-v356-forecast-maps-playback-live.mjs`: t quantiles, interval width and growth, seasonal fit, k-means repeatability, tile grids, hexbin counts, playback on all 25 families with a fixed axis, the live payload omitting unused columns, script-breakout safety, team client
  - `tests/test-team-server-v356.mjs`: publish, update at the same URL, versions and restore; CSP sandbox; conflict detection and forced overwrite; revision history; comments; activity; path safety; unpublish
- Older assertions updated for intended changes: catalogue 69 → 70, map starters 8 → 10, the "density" search now matching 2 starters, and projection wording.
- Full node run: 54 pass, 9 fail. The 9 failures are the same as the untouched V3.52 baseline.
- Browser checks:
  - Team flow against a running server: connect, publish, update the same link (v2), share, conflict dialog after a teammate's save, use the team version, post a comment
  - Hosted live dashboard: renders under the sandbox CSP and refreshes from the CORS source
  - Live dashboard: filter, drill-down, cross-filter, playback, go back up
  - Tile map, clustering, forecast band, Live publish preview and download, default theme applied to a new project
  - All 25 families created through the UI
  - Earlier flows re-run: highlights, themes, sparklines, live data

## Run on Windows

The app runs exactly as before:

```bat
py -m http.server 8000
```

Then open http://localhost:8000. The Team Server is optional: run `node server\openviz-server.mjs`, then open http://localhost:8787/app/.

---

# OpenViz Studio V3.55 — live data links, themes everywhere, native PowerPoint pie/combo, trend projections

## Live data connections

**Data → Connect live data (link / Google Sheet)…** (or **Connect live data** on the Data page) links a dataset to a web source.

- Paste a Google Sheets link (shared "Anyone with the link" or *Publish to web*), a CSV/TSV/JSON URL, a GitHub file link or a Dropbox link. Share links are converted to direct data links automatically.
- **Fetch preview** shows the rows and columns before anything is created.
- Optional automatic refresh runs every 1, 5, 15 or 60 minutes while the project is open.
- **Refresh live data** pulls the latest rows through the existing *Review data refresh* screen. Automatic refreshes apply silently only when no columns have disappeared; otherwise they wait for your review.
- The Data page shows the link type, when it last refreshed, and any last error.
- **Disconnect** keeps the current rows as a snapshot.

Fetching happens directly from your browser; no OpenViz server is involved. The connection uses https only (http is allowed for localhost), never sends credentials, has a 20-second timeout and a 20 MB cap, and refuses links that return a web page instead of data. Error messages explain sharing and CORS problems in plain language.

*Not yet:* published HTML charts don't re-fetch on their own. Publish again after a refresh.

## Organisation themes everywhere

- **Editorial tables** show the theme byline, footer note and logo in HTML, and the footer in static SVG/PNG/PDF. They also use the theme font.
- **Dashboards** (interactive and static HTML exports) show the logo in the header and the byline in the footer. The cards no longer repeat a footer each.
- **Slides:** "Save & apply to all charts" can also restyle slides (background, fonts, text and shape colours).
- **Sankey, network, sunburst, timeline, Gantt and parallel coordinates** now use the theme palette.

## Native PowerPoint pie and combo charts

With *Editable data* chosen for a slide chart, **pie** and **column + line combo** charts now export as native, editable PowerPoint charts. The combo keeps its second axis and axis titles; gaps stay gaps. Native charts also use the theme palette. Verified by exporting and rendering the .pptx (bar + line with two value axes, pie with legend).

## Trend projection (line & area)

**Settings → Reference lines & projection → Projection** projects the trend 1–24 periods forward, fitted on all periods or on the last N.

- The projection is a dashed least-squares line in a shaded "Projection" area. Future period labels are inferred for evenly spaced years or numbers; otherwise they read +1, +2, …
- The tooltip gives R² and states plainly that it assumes the recent trend continues: it is not a forecast and shows no uncertainty.

## Evidence

- New `tests/test-v355-live-brand-pptx-projection.mjs` passes. It covers:
  - URL conversion and rejection
  - mocked fetch outcomes: CSV, HTML page, 403, 500, oversized, CORS failure, timeout
  - refresh scheduling and schema checks
  - themed tables, dashboards and flows, plus slide tokens
  - native PPTX eligibility and combo series alignment
  - projection maths and labels
- Full node run: 51 pass, 9 fail. The 9 failures are the same ones present in the untouched V3.52 baseline.
- Browser checks against a local CORS server:
  - live connect, refresh with review, and error display
  - projection controls
  - highlights, theme studio and sparklines (re-run)
  - all 24 V3.53 families
  - PPTX rendered through LibreOffice

## Run on Windows

Stop the old server with Ctrl+C. Extract the ZIP and open Command Prompt beside `index.html`:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5.

---

# OpenViz Studio V3.54 — highlights & callouts, table sparklines, organisation themes

This release delivers the three items proposed after V3.53: annotation depth, richer tables and shareable branding. The catalogue stays at 69 templates.

## Highlights & callouts

Column, bar, line, area, dot, scatter and bubble charts have a new **Settings → Highlights & callouts** section. It works like Datawrapper's range highlights and arrow annotations:

- **Value range:** a shaded horizontal band (or a vertical band on bar/dot charts), such as a target zone.
- **Period / categories / X range:** a shaded span between two categories, or two X values on scatter and bubble charts.
- **Arrow callout:** a curved arrow from a text label to a data point. Leave the text blank to show the point's value.

Highlights are tied to data coordinates rather than pixels, so they follow the data when it, the axis range or the canvas size changes. Bands sit behind the marks, labels are escaped, and highlights pointing at values that don't exist are skipped. Each chart allows up to 24. Undo works as usual.

## Sparklines in editorial tables

Editorial tables have a new **Sparkline column** section:

- Tick two or more numeric columns. They are read in the order you tick them, for example Q1–Q4 or 2019–2026.
- Choose a line with an end point, or bars from zero.
- Choose a per-row scale (shows shape) or a shared scale (shows magnitude).

Missing values break the line and nothing is interpolated. Each row's values are available to screen readers and tooltips. In HTML the column sorts by its latest value. Static image, slide and story exports draw the sparkline too. A sparkline problem, such as a column that no longer exists after a data switch, hides only the sparkline and shows a warning; the table itself still renders. The editorial-table example now includes quarterly values with a trend column.

## Organisation themes (brand kits)

**Settings → Templates & styles → Organisation theme…** (also in the Format menu and command search) lets you set up one theme for the whole project:

- an 8-colour series palette
- background, text and gridline colours
- font and title size
- a byline (for example "Chart: Your organisation"), a footer note and a default source
- a logo: PNG, JPEG, WebP or SVG up to 300 KB, embedded in exports

A live preview updates as you edit. **Save & apply to all charts** restyles every chart; Undo reverts it. With *Apply automatically to new charts* on, every chart created afterwards picks up the theme.

Themes export and import as small `.openviz-theme.json` files. They contain no data, mappings or chart content, and everything is validated on import: invalid colours, unsafe fonts, non-image or oversized logos and layout properties are dropped. Applying a theme never changes data, mappings, titles, annotations or highlights, and keeps any source note you already wrote. The palette is used by the core, multi-series and V3.53 chart families, and fonts are no longer restricted to six names.

## Evidence

- New suite `tests/test-v354-annotations-tables-brand.mjs` passes. All suites that passed in V3.53 still pass.
- Two older editorial-table assertions were updated because the example dataset now has four extra quarterly columns, and the table preview now legitimately contains sparkline SVGs.
- The 9 failures that predate this work (V3.52 baseline) are unchanged.
- In the browser, the highlight controls, theme studio (logo upload, export, apply to all, automatic apply to a new chart) and sparkline controls were all exercised with no console errors. See `docs/QA_V3_54.md`.

## Run on Windows

Stop the old server with Ctrl+C. Extract the ZIP and open Command Prompt beside `index.html`:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5.

**Next (proposed):** split `app.js` into modules, keeping behaviour unchanged. After that, live data connectors (published CSV / Google Sheets URL with refresh).

---

# OpenViz Studio V3.53 — 24 new chart families, analytic overlays and a professional UI refresh

The catalogue grows from 45 to **69 working templates**. Nothing remains "planned": the candlestick chart is now implemented. See `docs/COMPETITIVE_GAP_ANALYSIS_V3_53.md` for the comparison with Datawrapper, Flourish and Tableau that drove this batch, and `docs/v353-new-charts.png` for every new family.

## New chart families

| Group | Charts |
|---|---|
| Part-to-whole & hierarchy | Pie, Waffle, Marimekko, Circle packing, Parliament |
| Comparison | Column + line combo (optional right axis), Lollipop, Split bars, Range plot (dumbbell) |
| Change & ranking | Arrow plot, Bump chart, Streamgraph |
| Business & finance | Bullet chart, Gauge, Number cards (KPI), Funnel, Candlestick (OHLC) |
| Distribution | Beeswarm, Ridgeline, Population pyramid |
| Relationships & flows | Radar, Chord diagram, Arc diagram |
| Text | Word cloud |

Open **Templates → New chart types** to browse them. Each has:

- an editable illustrative example
- a field contract with automatic column suggestions
- aggregation where it is meaningful
- type-specific settings under **Chart options**
- tooltips on every mark
- advisor recommendations
- the existing SVG/PNG/PDF/PPTX/HTML delivery

Data rules follow the project's integrity conventions. Negative values are excluded from part-to-whole charts. Waffle squares use largest-remainder rounding, so they always sum to 100. Bump charts use competition ranking for ties and leave gaps for missing periods. Candlestick rows whose low/high contradict their open/close are excluded. Parliament seats are rounded. Every one of these exclusions is disclosed as a warning. Pie, waffle, lollipop, funnel, bullet, range/arrow plots, parliament, word cloud and circle packing support dashboard click-filtering.

## Reference and trend lines

Column, bar, line, area, dot, scatter and bubble charts gain **Settings → Reference & trend lines**:

- A fixed target, average or median line, with its own label and colour. Lines outside the axis range are not drawn.
- On scatter and bubble charts, a least-squares **linear trend** with R². The tooltip notes that association is not causation.

## Professional UI refresh

- `src/icons.js` replaces the Unicode glyphs used as icons with one consistent line-icon set. Chart artwork and form controls are never altered.
- `src/ui-refresh.css` re-tunes the shell:
  - a light header everywhere and a quiet menu bar
  - segmented Preview/Data and device controls
  - compact status ribbons and a dotted canvas board with a floating sheet
  - chevron accordions in Settings
  - consistent 32 px controls with focus rings
  - refined modals, menus and template cards, in light and dark themes
- Home now reads as a workspace ("What would you like to visualise?"). Its featured templates include the new families.
- When you set the axis minimum or maximum by hand, ticks now use round steps (0, 50, 100, 150 rather than 0, 37.5, 75…).

## Evidence

`tests/test-pro-charts-v353.mjs` renders all 24 families at desktop and narrow sizes, in light and dark styles. It also covers every option value, empty and unmapped states, field contracts, data rules, reference/trend lines and tick rounding. Every suite that passed in V3.52 still passes; only the three catalogue-size assertions changed (45 → 69). Nine suites that failed in V3.52 fail the same way, for reasons unrelated to this batch (for example `installEditorialTables is not defined` in older browser-harness tests). All 24 families were also created through the live editor, with every chart option exercised, and no console errors. See `docs/QA_V3_53.md`.

## Run on Windows

Stop the old server with Ctrl+C. Extract the ZIP and open Command Prompt beside `index.html`:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5.

**Next batch (proposed):** annotation depth (range highlights, arrows), table sparklines and organisation theme packages. After that, splitting `app.js` into modules. The comprehensive verification phase is still deferred.

---

# OpenViz Studio V3.52 — snapshot GIF and video export

All **19 snapshot-enabled chart types** now have a dedicated GIF/browser-video export path. The chart catalogue stays at **45 options**; this batch expands delivery, not the count of visualization families. Dedicated race exports remain separate.

## Export observed periods

Enable time snapshots on a supported chart, then choose **Export snapshots as GIF / video…** in Time controls, or **Snapshot GIF / video** in the Export chooser. Choose first/last observed periods, playback speed, longest-edge output size, an extra final hold and GIF looping. Video also exposes a target frame rate and is available only when canvas capture/MediaRecorder report support. MP4 is preferred where supported; otherwise WebM.

Each included period is held as its own observed snapshot. There is no interpolation between periods, fading, carry-forward or invented intermediate value. Empty numeric periods are retained. The last snapshot receives its normal hold plus the extra final hold. Durations round to 10 ms for GIF/video planning consistency. GIF uses one encoded frame per observed period with explicit delays; video paints the snapshots repeatedly at the requested frame-rate target.

**Exporting a shorter range retains the full source timeline’s scales, category/series colours, facet slots and missing-data rules.** It does not rebase axes to the selected range. Stacked missingness and shared-scale empty panels remain visible. Source data, chart appearance and the saved static period are unchanged. Actual rendered SVG dimensions set output proportions, including tall facets.

## Progress, bounds and cancellation

The dialog estimates dimensions, duration and frame buffers before starting. Export shows progress, stage/status messages, cancellation and Download again. Closing the dialog cancels an active job. A changed source invalidates an open export setup; reopen it to review the current range. Jobs use independent captured chart/row copies.

Frames are rasterized before video recording so loading SVG does not skip periods during the recording clock. Video runs in real time and stops when the tab becomes hidden. A skipped observed period, premature recorder stop or recorder error rejects the output rather than silently downloading an incomplete animation. Native timing/frame-rate fidelity remains to be verified; the target fps is not a guarantee.

Limits: 60 seconds for GIF, 90 seconds for video, 96 MiB of retained frame buffers, 24 MiB of rendered SVG artwork and 64 MiB of recorded video. Oversized ranges reject with guidance to shorten the range or reduce resolution. GIF longest edge supports up to 720 px; video up to 1280 px. Source time-model limits remain 60 periods/30,000 rows and the applicable chart-specific caps. These are frame-buffer/artwork budgets, not a measured total browser-memory ceiling.

Animated GIF/video contains rendered artwork rather than keyboard controls, tooltips or source tables. Interactive HTML remains the delivery option for reader controls and accessible details. The still-image/table/story exporters keep their existing saved-period behavior. Exporting animation is an explicit action; the reader player’s reduced-motion preference does not alter the chosen export timing.

## Evidence and examples

Six focused suites pass: snapshot export/planning, dedicated editor flow, existing race export, profile snapshots, publishing and data contracts. All 19 types are exercised by the planner/renderer check. Actual GIF delay bytes are checked; video lifecycle/cancellation is exercised with a controlled recorder substitute. Native browser codecs/playback and full cross-browser/accessibility/storage/performance/export-viewer acceptance remain deferred until the implementation phase is complete.

`examples/v352-bar-snapshots.gif`, `v352-stacked-area-snapshots.gif` and `v352-small-multiples-snapshots.gif` are real encoded examples from generated chart SVG. Corresponding export-plan JSON files disclose their exact sizes, periods and durations. Pillow decoding verified 3/4/4 frames with holds 600/600/1200 ms or 600/600/600/1200 ms. See `docs/QA_V3_52.md`.

## Run on Windows

Stop the old server with Ctrl+C. Extract the ZIP and open Command Prompt beside `index.html`:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5.

**Next batch:** combo and bullet/progress templates, with consistent editorial defaults. Comprehensive verification remains the final phase.

---

# OpenViz Studio V3.51 — stacked-area and shared-scale facet snapshots

Two existing templates now support time playback: **Stacked areas** and **Shared-scale small multiples**. The catalogue remains **45 chart options**, now with **19 snapshot-enabled types and two dedicated races**.

Create either template, open **Time controls**, and choose **Try an editable time example**. Map separate snapshot period, ordered X, series and measure fields. Sum, Mean, Count, Minimum and Maximum aggregate each X/series cell independently within each period; Count can leave the measure unmapped.

## Stacked areas: missing components remain unknown

Source measures must be nonnegative; negative contributors reject playback even if their net cell sum would be positive. Count ignores measures. The Y maximum is fixed to the largest sum of available observed components at any known X/snapshot across the timeline. This is a display envelope, not an inferred complete total for incomplete stacks. All-zero timelines use 0–1.

At a known X, the first missing component breaks its own layer and all layers above it. Observed lower layers can still be shown. An observed component above a gap has an unknown stack position and is retained in the incomplete-stack marker’s details rather than plotted at an invented baseline. A diamond rail above the plot identifies incomplete stacks, with missing/observed components and record counts; the complete total remains unknown. Positions with no valid observations have no markers. A measured zero retains its boundary point and count. Isolated observations remain points; no area is invented across a gap.

Layer order, colours, known X positions and the total-scale envelope remain fixed across snapshots. Fills precede outlines/markers. Optional direct labels use sufficiently tall segments in sparse views. Per-cell colour overrides affect markers rather than quantitative layers. Check whether stacking means/minima/maxima makes sense for your data.

Dashboard filters retain the saved period and full source domains. If filtering raises an aggregate/stack beyond the saved envelope, the affected layer and layers above break; an issue marker discloses original values. Overflow rejects partial geometry rather than silently clipping totals into range.

## Shared-scale small multiples

Each series keeps its own panel in the full-timeline order, even if it has no observations in a period. Every panel uses identical X/Y domains; signed values and a zero reference are supported. Missing known X observations break lines, measured zero remains observed, and isolated observations remain dots. Colours stay associated with series, including when a series disappears and returns.

Wider layouts use two columns; narrow layouts use one column and grow vertically to preserve panel legibility. PNG export now derives height from the actual SVG aspect ratio, preserving tall facet layouts. Per-panel labels are shortened when necessary; full names remain in SVG/details.

## Shared delivery rules

Numeric and consistent ISO date-only X labels use actual spacing; other labels use observed categorical order. Ambiguous numeric/date coordinate aliases reject. Gaps use the full known X union across all series/snapshots, including explicit missing-measure rows. Unobserved X positions are not fabricated. No carry-forward or interpolation between snapshots; ordinary segments connect adjacent valid known X observations within a snapshot.

Playback remains transient. **Use period for static exports** saves the current snapshot with Undo. Interactive chart HTML contains the observed timeline; static/dashboard/story outputs use the saved period. Independent charts/filtered story sources can define independent domains. Limits: 60 known X positions, 10 series for stacked areas or 8 facets, 60 periods, 30,000 source rows and 6 MiB player payload. Manual value bounds are overridden.

Import `examples/v351-profile-time.json` for both designs and a dashboard. Two standalone HTML players and 24 light/dark, wide/narrow SVG fixtures accompany them.

**Six focused suites pass**: new profile semantics, dedicated editor flow, prior multi-series line and area regressions, data contracts and publishing. Generated wide/light and narrow/dark examples were inspected. The comprehensive native browser/Windows/accessibility/storage/performance/export-viewer run remains deferred until implementation is complete. See `docs/QA_V3_51.md`.

## Run on Windows

Stop the old server with Ctrl+C. Extract the ZIP and open Command Prompt beside `index.html`:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5.

**Next batch:** GIF/video export for ordinary time-snapshot charts. Broader template depth and editorial refinement continue afterward; comprehensive verification remains the final phase.

---

# OpenViz Studio V3.50 — map starting points and resources

The **Map library** is available from Home, Templates and map appearance settings. Browse eight editable designs, search the bundled country/area outlines, or open official boundary-provider guidance. These are starting points and reusable resources within the existing map families; the catalogue remains **45 chart options**, with 17 snapshot-enabled types and two dedicated races.

## Eight editable starting points

- Country rate comparison with a sequential legend.
- Signed country change with a zero-centred diverging scale.
- New Zealand place magnitudes using explicit approximate city coordinates.
- Pacific place comparison.
- Directed Pacific connections, framed across the antimeridian with a locator.
- Country snapshots across three observed periods and a fixed colour scale.
- Custom-region join practice, using clearly fictional district polygons and an unmatched source key.
- Synthetic point density around New Zealand cities, with relative-intensity semantics.

Creating a starting point adds a new editable chart and dataset. Existing charts remain available. Measurements are fictional, not official regional statistics. Creating from Home starts a new project only after a design is selected. Opening/searching the library does not change project content. Created charts/datasets are undoable.

## Included outlines and downloads

Search by country/area name, ISO metadata or continent. The library contains 176 single country/area outlines, seven continent collections and one global collection:184 resource records, all reusing the shipped simplified Natural Earth snapshot. This does not mean184 new map families or new high-resolution datasets.

Preview a resource, create an explicitly uniform-value outline example, download its WGS84 GeoJSON, or download a blank CSV data template. Regional resources use `region_id` in GeoJSON and `RegionID` in CSV. The generated `NE-` keys are identifiers for this bundled snapshot, not official administrative/ISO identifiers. CSV measurements remain blank until supplied. Name/ISO metadata is included for reference.

For the current choropleth or symbol map, **Review with current map’s data** stages the selected regional outline in the existing boundary/join-review window. Preview the chosen boundary property and source column and inspect unmatched records; only Apply saves the change. Cancel leaves the chart/data unchanged and Undo restores an applied change.

The global example uses the existing built-in world map and joins country names. Its downloadable global GeoJSON is for external GIS use: the custom regional importer rejects extents broader than 300° longitude. Global review into a custom regional map is therefore disabled.

The downloadable copies omit one collapsed ring/polygon found in the shipped simplified geometry; no country/area features are removed. The existing basemap is unchanged. Other geometry is not resurveyed, updated, topologically repaired or increased in resolution. The source has no verified current official boundary vintage. Small islands, coastlines and disputed boundaries require review.

## Official sources and custom imports

The library links to Natural Earth, Stats NZ Geographic Data Service and US Census cartographic boundaries. Natural Earth’s official terms place its map data in the public domain. Check the particular layer’s license, geography year and identifiers for other providers. External files are not downloaded/refreshed automatically.

Import guidance explains WGS84 longitude/latitude Polygon/MultiPolygon GeoJSON, exact joins, leading-zero identifiers, source credits, reprojection and simplification. Shapefile, KML and GeoPackage require conversion; renaming an extension is insufficient. Existing limits remain 8 MiB, 2,000 features and 150,000 vertices. Finer administrative boundaries are linked resources, not newly bundled data.

Examples: import `examples/v350-map-library.json` for all eight designs. Standalone HTML and light/dark SVG fixtures accompany them. Global/New Zealand GeoJSON, blank CSV templates and a complete resource inventory are included.

**Six focused suites pass**: resource/model checks, dedicated editor flow, regional maps, projections, publishing and editorial-table regression. Generated light/dark map output was visually inspected. The comprehensive native browser/Windows/accessibility/storage/performance/export run remains deferred until implementation is complete, as requested. See `docs/QA_V3_50.md`.

## Run on Windows

Stop the old server with Ctrl+C. Extract the ZIP and open Command Prompt beside `index.html`:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5.

**Next batch:** richer time playback, starting with stacked-area snapshots and shared-scale small multiples. Further template depth/editorial work follows; the comprehensive verification phase remains at the end.

---

# OpenViz Studio V3.49 — editorial tables

First batch of the revised gap-closing work: published table depth and consistent editorial presentation. There are now **45 implemented chart options**; snapshot playback remains17 types plus two dedicated races within the catalogue. No additional motion or map-resource capability is claimed in this batch.

## Try it

Open Templates and search **Editorial table**, then choose the editable example. Or change a chart's type to Editorial table. In Data, choose1–8 published columns and reorder them. Preview settings offer labels, per-column number/fixed/percent/USD currency formats, decimals, prefix/suffix, and signed bars or heat intensity for numeric columns. Mixed/text columns retain original values. Percent expects fractions. An all-missing column remains text until numeric observations exist. No aggregation applies.

Native table HTML supports search, stable ascending/descending sorting, sticky headers and10/25/50-row pages. Sorting uses original values, not formatted currencies/percentages; missing values stay last in either direction. Search includes displayed and original values from selected columns only. Bar/heat scales include zero and every source value in that column and stay fixed during search, sorting and paging. Columns with different units do not share a scale. Heat intensity shows distance from zero rather than sign; labels retain signs. Background/text/accent are authored settings, with light/dark examples.

Reader controls are transient; column settings/order are saved with Undo. Renaming a selected source column updates its binding and formatting reference while imported rawRows remain unchanged. Dataset switching reviews columns; switching datasets resets the old per-column formatting. Headers and values are escaped as text, never scripts or links.

**Chart HTML** is the complete native table; static chart HTML includes all selected source records without interactive controls. **SVG/PNG/PDF/PPTX, dashboard and story views** show a bounded first static page, with a visible shown/total-row disclosure. They do not yet offer the table's live controls. Source tables beneath other chart types remain separate.

Limits:5,000 source rows,8 selected columns and6 MiB table HTML. Oversized inputs reject rather than quietly truncating the interactive table. Only selected columns enter its HTML; review them for confidential data. Static SVG cells may shorten text; full values remain in SVG titles and native HTML. JavaScript-disabled interactive HTML shows its first page and a notice; use static HTML for all rows.

Import `examples/v349-editorial-tables.json` for two editable designs. Light/dark interactive and full static HTML examples and two SVG pages accompany it. Generated SVG output was visually inspected; no native-browser layout acceptance is claimed.

**Six focused suites pass**: new table semantics/export test, dedicated editor integration, data contracts, publishing, expanded-template integration and rendering/interaction quality. The comprehensive cross-browser, Windows, accessibility, storage, performance and export-viewer run is deferred until implementation is complete, as requested. See `docs/QA_V3_49.md` and `docs/QUALITY_GAP_PLAN_V3_49.md`.

## Run on Windows

Stop the old server with Ctrl+C. Extract the ZIP and open Command Prompt beside `index.html`:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5.

**Next batch:** reusable map starting points and map-resource browsing, followed by richer motion and further template depth. Comprehensive verification follows the implementation phase.

---

# OpenViz Studio V3.48 — overlapping area snapshot playback

Multi-series areas now support time snapshots. Areas overlap from a common zero baseline; they are not stacked or summed. The catalogue has **44 chart options, 17 snapshot-enabled types and two dedicated races**.

Create Overlapping series areas, open **Time controls**, then **Try an editable time example**. Use separate period, X, series and measure columns. Sum, Mean, Count, Minimum and Maximum aggregate each X/series cell per snapshot; Count may leave the measure unmapped. Numeric source contributors must be nonnegative, even when a cell's net sum would be positive. Count ignores measure values.

Numeric and ISO date-only X values retain actual spacing; other labels use observed categorical order. Full-timeline X positions, Y range, legend and colours stay fixed. Missing observations break both fills and outlines; zero remains observed, isolated observations remain dots. Gaps use the known X union across the timeline; positions never in the data are not invented. A visible caption explains overlap. All fills render behind all outlines and markers.

Dashboard filtering retains the saved period and source domains. An aggregate outside the fixed Y range uses a disclosed boundary marker and breaks the fill/outline; details preserve its original value. Overflow gives an error instead of a partial chart. Playback is transient; **Use period for static exports** captures a snapshot with Undo. Interactive chart HTML carries the timeline; static/dashboard/story outputs use the saved period. No between-snapshot interpolation or source rewriting.

Limits: 60 known X positions, 10 series, 60 periods, 30,000 rows and 6 MiB player payload. Existing static areas and signed multi-series line snapshots remain available.

Import `examples/v348-multi-area-time.json` for numeric/date/categorical charts, a dashboard and a three-period story. Six standalone HTML examples accompany it. Fictional reference dates demonstrate axis spacing rather than historical observations.

**49 automated suites pass**, including editor and exported-script integration. Generated wide/light and narrow/dark renders were visually inspected. Native Chromium exited before opening a page; native browser, Windows, touch, screen-reader and detailed performance acceptance remain pending. See `docs/QA_V3_48.md`.

**Remaining work:** `docs/REMAINING_WORK_V3_48.md` consolidates release blockers, product gaps, optional expansions and exact template playback coverage. It supersedes stale “next” suggestions in earlier release sections.

## Run on Windows

Stop the old server with Ctrl+C. Extract the ZIP and open Command Prompt beside `index.html`:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5.

**Next feature batch:** stacked-area snapshots, then shared-scale small-multiple snapshots. Native release acceptance remains the highest release blocker.

---

# OpenViz Studio V3.47 — multi-series line snapshot playback

**Multi-series lines** now support snapshot playback with fixed X/Y domains, stable series colours and consistent gaps. The catalogue remains **44 chart options**, with **sixteen snapshot-enabled types**.

## Try it

Create Multi-series lines, open **Time controls**, and choose **Try an editable time example**. Use a separate **snapshot period** and **X dimension**: for example Year selects a daily profile, while Day positions observations along each line. Category/X, series, measure and snapshot period must be distinct roles. Sum, Mean, Count, Minimum and Maximum aggregate each X/series cell within each snapshot. Count can leave the measure unmapped.

X positions and series come from valid X/series labels across the whole timeline, including explicit rows whose measure is missing. All-numeric X labels sort numerically and retain actual spacing. Consistent valid ISO `YYYY-MM-DD` labels sort by UTC date and retain day spacing. Other labels use first-observed categorical order. Numeric/date labels mapping to the same coordinate must be standardized; they are not silently merged. Date tick labels are compact, with a year caption; their full ISO values remain in axis titles and observation details.

**Gaps use the full known X-position union across all series and snapshots.** If a series has no valid observation at a known X, its path breaks there. An explicit missing-measure row can therefore preserve a gap even when that X never has a valid measure elsewhere. A measured zero remains a point; an isolated observation remains a dot. X positions never present in the source are not invented, so two available neighbouring known X positions can still be joined across a larger numeric/date interval.

The Y scale includes zero and all valid per-snapshot aggregates, including signed values. All-zero data uses 0–1. X/Y domains, full legend, series colours and plot framing stay fixed across snapshots; manual value bounds are overridden. A series can disappear and return without changing colour. Per-point colour overrides affect markers, while line colours continue to identify series. Details retain full X/series labels, aggregate/exact values, contributor counts and period.

Play/Pause, Previous/Next, scrubbing, speed and looping use separate snapshots, with no interpolation between snapshots or carry-forward. Ordinary line segments join adjacent valid known X observations within a snapshot. Reader playback leaves the source and saved chart unchanged. **Use period for static exports** captures the current snapshot with Undo support.

## Filtering, delivery and examples

Dashboard filters retain the saved period, full X/Y domains and series order. Filtering a known X creates a gap. If filtering raises an aggregate beyond the fixed Y range, that observation is shown as a disclosed boundary marker and breaks the line; its original value remains in details. Lines are not drawn through out-of-range observations. Numeric overflow shows an error rather than partial curves. Independent charts/filtered story sources define their own domains.

Interactive chart HTML includes all observed snapshots. Static/dashboard/story delivery uses the saved period. Import `examples/v347-multi-line-time.json` for numeric, date and categorical examples, a saved-2020 dashboard and a three-snapshot story. Standalone files use `v347-multi-line-time-numeric`, `-dated`, `-categorical`, `-dashboard`, `-player` and `-scroll` filenames. The dated example repeats fictional reference dates across snapshot years; it is an axis demonstration, not historical data. All designs include gaps, zeros, missing/returning series and invalid-only numeric data in 2022. Count includes labelled missing-measure records and may therefore show points in that period.

Limits: **60 known X positions**, **10 series across the timeline**, **60 snapshot periods**, **30,000 source rows** and **6 MiB snapshot payload**. Oversized/overflowing or wholly invalid numeric timelines reject playback rather than truncating. Existing non-time multi-series line rendering remains unchanged. No source rows are rewritten.

All **48 automated suites** pass, including the editor DOM flow. Forty-eight SVG fixtures cover four periods/two widths/two themes; representative wide/light and narrow/dark output was inspected. Final date-label checks also pass. Native Chromium exited before opening a page; native browser layout/focus/touch, screen readers, Windows and detailed performance acceptance remain pending. See `docs/QA_V3_47.md`.

## Run on Windows

Stop the old server with Ctrl+C. Extract the ZIP and open Command Prompt beside `index.html`:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5.

**Next batch:** multi-series area time playback with clear missing-data and overlap rules.

---

# OpenViz Studio V3.46 — signed stacked-horizontal time playback

**Stacked horizontal bars** now support time playback with fixed category positions, series order/colours, label margins and total value scales. Positive and negative aggregates stack separately around zero. The catalogue remains **44 chart options**, with **fifteen snapshot-enabled types**.

## Try it

Create Stacked horizontal bars, open **Time controls**, and choose **Try an editable time example**. For your own data, select a separate period column, category, series and numeric measure. Sum, Mean, Count, Minimum and Maximum aggregate each category/series cell independently per period. Count can leave the measure unmapped. A warning asks whether adding means/minima/maxima is meaningful for your data.

The fixed scale uses the largest complete positive stack and smallest complete negative stack across all categories and periods. It does not pool records across time or use only the largest individual segment. Both bounds include zero; all-zero data uses 0–1. Manual value-axis bounds are overridden. Positive and negative totals are separate, not a net total.

Categories and series retain their full-timeline slots as observations disappear or return. The complete legend and series colours stay fixed. Long labels appearing later reserve horizontal space from the start. Signed values extend from a visible zero baseline. Numeric zero has a boundary marker without area; missing cells have no mark. An observed period with no valid numeric cells keeps axes/legend/categories and shows an empty-period message. No interpolation, carry-forward or invented periods.

Details retain original values, exact numeric values/totals when formatting changes them, current positive/negative totals, contributing record count and period. Per-cell colours remain supported and can differ from the legend. Optional direct value labels appear where there is space.

## Filtering and delivery

Dashboard filters retain the saved period and full source timeline's slots, margins and total scales. Missing matches stay empty rather than switching years. Filtering can increase a grouped result, for example by removing a cancelling negative record. When that exceeds the fixed range, bars are **clipped at the axis limits**, with a visible clipping notice and original values in details. They never draw outside the plot. Filtered numeric overflow shows an error rather than partial stacks.

Interactive chart HTML includes all observed snapshot periods. Static/dashboard/story outputs use the saved period. Playback does not modify source rows or saved settings. **Use period for static exports** saves the current snapshot with Undo support. Independent charts and differently filtered story sources have their own domains; this batch does not synchronize authored limits across them.

Import `examples/v346-horizontal-stack-time.json` for Sum, Mean and Count designs, a saved-2024 dashboard and a three-period story. Standalone HTML examples use `v346-horizontal-stack-time-sum`, `-mean`, `-count`, `-dashboard`, `-player` and `-scroll` filenames. Fictional data includes sign changes, repeated cells, zero, arriving/returning series, a long label and invalid-only 2022 measures. Count includes labelled missing-measure records, unlike numeric aggregation.

Limits: **32 categories**, **10 series across the timeline**, **60 periods**, **30,000 source rows**, **6 MiB snapshot payload**. Missing labels/measures are excluded and reported, except Count ignores measure values. Cell/stack-total overflow or an unrepresentable range rejects playback rather than publishing partial stacks. Existing non-time rendering remains unchanged. No source data is rewritten.

All **47 automated suites** pass, including the actual editor DOM flow and executed export scripts. Forty-eight SVG fixtures cover four periods/two widths/two themes; representative wide/light and narrow/dark output was inspected. Native Chromium exited before opening a page; native browser layout/focus/touch, screen readers, Windows and detailed performance acceptance remain pending. See `docs/QA_V3_46.md`.

## Run on Windows

Stop the old server with Ctrl+C. Extract the ZIP and open Command Prompt beside `index.html`:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5.

**Next batch:** multi-series line time playback with fixed axes and consistent missing-data gaps.

---

# OpenViz Studio V3.45 — 100% stacked time playback

**100% stacked columns** and **100% stacked bars** now support time playback with fixed category slots, series order/colours and a **0–100% axis**. The catalogue remains **44 chart options**, with **fourteen time-enabled types**.

## Try it

Create either 100% stacked template, open **Time controls**, and choose **Try an editable time example**. For your own data, choose a separate period column, category, series and numeric measure. Sum, Mean, Count, Minimum and Maximum aggregate each category/series independently within each period, then divide by that category/period's available aggregate total. Count can leave the measure unmapped.

Shares describe **available valid contributors**, not a guarantee of a complete composition. Missing series are omitted, never filled with zero. Details disclose the number of missing series relative to the full timeline legend. For Mean/Minimum/Maximum, a warning asks whether normalizing their combined total is meaningful.

- **Positive total:** valid components share the full 100% span; numeric zero uses a small boundary marker without area.
- **Zero total:** the category is labelled **Zero total**; shares are undefined. Zero-valued records retain keyboard/hover details and baseline markers.
- **No valid contributors:** the category is labelled **No data**, distinct from zero total.
- **Negative source measure:** playback stops with a correction message, even if aggregation would cancel the negative record. Count ignores measure values and counts labelled records instead.

Hover/keyboard details retain original aggregate values, category totals, contributor counts, current period and missing-series counts. Exact numeric values/totals are added when display formatting changes them. Share percentages are displayed to six significant digits in details. Percentage axes stay fixed regardless of raw-value formatting or manual value bounds. Optional direct labels show percentages where space permits.

Category/series slots and the full legend stay stable as components disappear or return. Horizontal label margins use the entire timeline. Play/Pause, Previous/Next, scrubbing, speed and looping use separate snapshots. Playback leaves the saved chart and source unchanged; **Use period for static exports** captures the current period with Undo.

## Examples and delivery

Import `examples/v345-percent-time.json` for columns, horizontal bars and Count compositions, plus a saved-2020 dashboard and three-period story. Six standalone examples use `v345-percent-time-columns`, `-bars`, `-count`, `-dashboard`, `-player` and `-scroll` filenames. Fictional data demonstrates partial compositions, zero totals, missing categories and invalid-only numeric data in 2022. Count includes labelled records with missing measures, so its composition can differ from Sum.

Interactive chart HTML includes all observed snapshots. Static/dashboard/story output uses the saved period. Dashboard filters retain saved periods and full category/series slots, while **shares and denominators recalculate from matching valid contributors**. A filter selecting one series can therefore make it 100% of the remaining composition. No matching cells stays No data; no other year is substituted. Independent/filtered story sources define their own contributor sets.

Limits: **32 categories**, **10 series across the timeline**, **60 periods**, **30,000 source rows** and the existing **6 MiB snapshot payload**. Cell or category-total overflow rejects playback with a rescaling message. Existing non-time 100% templates keep their previous rendering path. No imported data is rewritten.

All **46 automated suites** pass, including both editor DOM flows. Forty-eight SVG fixtures cover four periods/two widths/two themes; representative wide/light and narrow/dark output was inspected. Native Chromium exited before opening a page; native browser layout/focus/touch, screen readers, Windows and detailed performance acceptance remain pending. See `docs/QA_V3_45.md`.

## Run on Windows

Stop the old server with Ctrl+C. Extract the ZIP and open Command Prompt beside `index.html`:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5.

**Next batch:** signed stacked-horizontal time playback with fixed total scales.

---

# OpenViz Studio V3.44 — grouped chart time playback

**Grouped columns** and **Grouped horizontal bars** now support time playback with fixed category/series slots, stable series colours and a common value scale across periods. The catalogue remains **44 chart options**, with **twelve time-enabled types**.

## Try it

Create either grouped template, open **Time controls**, and choose **Try an editable time example**. For your own data, choose a separate period column, category, series and numeric value. Count can leave the value unmapped. Sum, Mean, Count, Minimum and Maximum aggregate each category/series cell independently within each period.

The scale uses the smallest/largest individual cell aggregate across the full timeline and includes zero. Unlike stacked columns, grouped bars do not use combined stack totals. Manual value bounds are overridden. All-zero data uses a finite 0–1 range. Categories and series follow first valid appearance within ordered periods and keep their slots; missing cells never cause neighbouring bars to move into their space. The complete series legend and palette slots remain stable, including absent/returning series. Per-cell colour overrides take precedence.

Signed values extend on either side of a visible zero baseline. Numeric zero has a small baseline marker and retains details; a missing combination has no mark. Invalid-only observed periods keep categories/legend/axes and show an empty-period message. Missing labels are excluded; Count requires labels but includes records whose measure is missing. No interpolation, carry-forward or invented periods.

Horizontal margins use category names from the entire timeline, including later-arriving long names. Value ticks adapt to narrow plots to avoid crowding around zero. Hover/keyboard details retain full category/series names, contributor count and current period. Dense axis names can be thinned or shortened. Optional direct numeric labels appear only where there is space.

Play/Pause, Previous/Next, scrubbing, speed and looping use the existing snapshot player. Playback leaves the source and saved chart unchanged. **Use period for static exports** saves the current snapshot and supports Undo.

## Examples and delivery

Import `examples/v344-grouped-time.json` for grouped columns, grouped horizontal bars and a Count design, plus a saved-period dashboard/story. Six standalone HTML examples use `v344-grouped-time-columns`, `-bars`, `-count`, `-dashboard`, `-player` and `-scroll` filenames. Fictional data includes signed values, duplicate cells, zero, missing combinations, later/returning series, a long category name and invalid-only 2022 measures. Count includes that labelled 2022 record; numeric aggregation leaves the period empty.

Interactive chart HTML includes all observed snapshots. Static/dashboard/story output uses the saved period. Dashboard filters keep that period, full category/series slots and the unfiltered timeline scale. No matching cells gives an empty view rather than another year. Independent charts and differently filtered story sources have their own timeline domains; this batch does not add synchronized authored scales between them.

Limits: **32 categories**, **10 series across the timeline**, **60 periods**, **30,000 source rows**, **6 MiB snapshot payload**. Invalid aggregation/range overflow or excess dimensions rejects playback rather than truncating. Existing non-time grouped templates keep their prior rendering path. Source data is never rewritten.

All **45 automated suites** pass, including both real editor DOM flows. Forty-eight SVG fixtures cover four periods/two widths/two themes; representative wide/light and narrow/dark output was inspected. Native Chromium exited before opening a page; native browser layout/focus/touch, screen readers, Windows and detailed performance acceptance remain pending. See `docs/QA_V3_44.md`.

## Run on Windows

Stop the old server with Ctrl+C. Extract the ZIP and open Command Prompt beside `index.html`:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5.

**Next batch:** 100% stacked column/bar time playback, with explicit zero-total and missing-data handling.

---

# OpenViz Studio V3.43 — stacked-column time playback

**Stacked columns** now support time playback with fixed category positions, series order/colours and value scales. Positive and negative aggregates stack separately around zero. The catalogue remains **44 chart options**, with **ten time-enabled types**.

## Try it

Create Stacked columns, open **Time controls**, and choose **Try an editable time example**. For your own data, enable snapshots and choose a separate period column, category, series and numeric measure. Count can leave the measure unmapped. Sum, Mean, Count, Minimum and Maximum aggregate each category/series within each period; stacking means/minima/maxima is allowed with a warning to check whether adding those values is meaningful.

The timeline scale covers the largest complete positive stack and smallest complete negative stack across all categories/periods. It does not use only the biggest individual segment or pool records across periods. Both bounds include zero; all-zero data uses 0–1. This fixed scale overrides manual value-axis bounds. Positive and negative component heights are separate totals, not a net total.

Categories and series follow first valid appearance in ordered periods and retain their slots. Series colours and the complete legend remain stable when a component disappears or returns. Explicit per-cell colour overrides still take precedence. A visible zero baseline and period-aware hover/focus details help read signed values. Zero segments have no area but retain details; absent combinations are omitted, not filled with zero. An observed period with no valid numeric measures keeps its axes/categories/legend and shows an empty-period message. No interpolation, carry-forward or invented years.

Play/Pause, Previous/Next, scrubbing, speed and loop controls use discrete snapshots. Playback does not change the saved chart or source data. **Use period for static exports** saves a snapshot with Undo support.

## Examples and delivery

Import `examples/v343-stacked-time.json` for Sum, Mean and Count designs, a saved-period dashboard and a three-period story. Six standalone HTML examples use `v343-stacked-time-sum`, `-mean`, `-count`, `-dashboard`, `-player` and `-scroll` filenames. The fictional dataset includes duplicates, zero, sign changes, arriving/disappearing series and invalid-only 2022 measures. Count includes that labelled 2022 record while Sum/Mean leave the period empty.

Interactive chart HTML includes all period snapshots. Static/dashboard/story delivery uses the saved period. Dashboard filters retain that period and the full source timeline's category/series domains and total scale; missing matches stay absent. Differently filtered story sources and independent charts have their own domains; this batch does not add synchronized authored scales across charts/scenes.

Limits: **32 categories**, **10 series across the timeline**, **60 periods**, **30,000 source rows** and the existing **6 MiB player payload**. Ten series use the existing ten-colour palette without repeating slots. Missing labels/measures are reported; Count requires both labels but ignores missing measure values. Aggregation/stack-total overflow or an unrepresentable value span rejects playback rather than publishing partial stacks. Existing non-time stacked columns retain their prior behaviour, including their negative-segment warning.

All **44 automated suites** pass. Forty-eight SVG fixtures cover four periods/two widths/two themes; representative wide/light and narrow/dark output was inspected. Native Chromium exited before opening a page; native browser layout/focus/touch, screen readers, Windows and detailed performance acceptance remain pending. See `docs/QA_V3_43.md`.

## Run on Windows

Stop the old server with Ctrl+C. Extract the ZIP and open Command Prompt beside `index.html`:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5.

**Next batch:** grouped-column and grouped-horizontal-bar time playback with stable series and shared timeline scales.

---

# OpenViz Studio V3.42 — heatmap time playback

Categorical **Heatmap** charts now support period playback with fixed row/column positions and a shared colour range across the included timeline. The catalogue remains **44 chart options**, with **nine time-enabled types**. This is the categorical matrix template, not the geographic density heatmap.

## Try it

Create a Heatmap, open **Time controls** and choose **Try an editable time example**. For your own data, enable time snapshots and choose a separate period column, two distinct categorical dimensions and a numeric measure. Count may leave the measure unmapped. Repeated cells aggregate independently per period using Sum, Mean, Count, Minimum or Maximum.

Columns and rows follow their first valid appearance in ordered periods and stay in place throughout playback. The colour range includes every valid per-period cell aggregate, anchored to at least 0–1; signed values may extend it below zero. Manual value-axis bounds do not control this colour range. Per-cell colour overrides remain supported and bypass the scale for those cells. The optional legend shows common lower/upper references and missing-data colour.

Missing cells are grey, distinct from numeric zero. Records with missing dimension labels are excluded; missing/nonnumeric measures are excluded unless using Count. Count counts records with both labels even when their measure is missing. An observed period with no valid numeric cells keeps the full no-data grid. Years without any input record are not invented. No interpolation, zero filling or carry-forward is applied.

Play/Pause, Previous/Next, period scrubbing, speed and looping use the existing discrete snapshot player. Reader playback does not change the saved chart or source data. **Use period for static exports** saves the current snapshot and supports Undo. Hover/focus details include the current period.

## Delivery and examples

Interactive chart HTML includes all period snapshots. Static output, dashboards and stories use the saved period. Dashboard filters keep that period, full row/column domains and full-timeline colour scale; unmatched cells remain no data rather than switching years. A separate chart or differently filtered story scene has its own timeline domain; this release does not add shared authored colour limits between charts/scenes.

Import `examples/v342-heatmap-time.json` for Sum, Mean and Count designs, a filtered dashboard and a saved-period story. Standalone HTML examples use `v342-heatmap-time-sum`, `-mean`, `-count`, `-dashboard`, `-player` and `-scroll` filenames. The fictional example includes signed values, zero, missing combinations, duplicate cells and a 2022 record with no measure: Sum/Mean show an empty grid in 2022; Count includes that labelled record.

Limits are **32 columns × 16 rows across the whole timeline**, **60 periods**, **30,000 source rows** and the existing **6 MiB snapshot payload** budget. Exceeding dimension/aggregation limits stops playback with a message; it does not silently truncate. Existing non-time heatmaps retain their static rules.

All **43 automated suites** pass, including editor integration. Forty-eight SVG fixtures cover four periods/two widths/two themes; representative output was inspected. Native Chromium exited before opening a page; native browser layout/focus/touch, screen readers, Windows and detailed performance acceptance remain pending. See `docs/QA_V3_42.md`.

## Run on Windows

Stop the old server with Ctrl+C. Extract the ZIP and open Command Prompt beside `index.html`:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5.

**Next batch:** stacked-column time playback with stable series colours and fixed value scales.

---

# OpenViz Studio V3.41 — route tooltip details

Route maps now support custom plain-text tooltips and up to **four explicitly selected additional fields**. The catalogue remains **44 chart options**, including eight time-enabled types.

## Try it

Open a **Route & connection map** and select **Map appearance → Tooltip labels & values…**. Choose **Custom labels & values**, then set the connection/value labels, number format, decimals, literal prefix/suffix and optional exact-value line. Toggle main value, contributor count, aggregation, period and supplied origin/destination coordinates. Preview before applying; Cancel leaves the chart unchanged and Apply is one undoable change.

Additional fields can use **Unique text**, **Sum**, **Mean**, **Minimum**, **Maximum** or **Non-empty count**. Each has its own label and numeric display settings. Grouped connections use **all valid contributing rows in the current period**, including contributors beyond the eight displayed view-row references. Unique text discloses differing values; missing/invalid numeric cells and overflow are reported. A selected main magnitude still determines which input records contribute. Count without a magnitude includes otherwise valid coordinate rows.

Connection identity, active explicit Route ID, view-row references, width-cap notices and the illustrative-path note remain visible. These controls change presentation, not the source, route grouping, width or geography. Unweighted routes do not invent a magnitude or display a missing measure. Automatic mode retains the existing route details; extra fields are active only in Custom mode.

## Delivery and source bindings

Custom details work on hover/keyboard focus, in search/pinned details, through period playback and in chart/dashboard/story exports. Missing connections remain unavailable and returning connections show their current details. Saved story views capture tooltip appearance while additional source-field bindings remain linked to the chart. Renaming a column updates bindings; removal and refresh checks detect dependencies; switching datasets clears extra fields for explicit review.

Only selected extra columns enter generated tooltip text. Unselected source columns are not automatically published; portable project files still contain their datasets. Hiding a tooltip row does not remove its bound data from a project or publication. An optional readable source table can include selected extra columns within its existing 12-column / 5,000-row limits. All text is literal; HTML and scripts are not accepted as tooltip markup.

Import `examples/v341-route-time.json` for custom ID-based timelines, grouped service/fare fields and capped widths. Six standalone HTML examples use `v341-route-time-ids`, `-sum`, `-capped`, `-dashboard`, `-player` and `-scroll` filenames. The map UI labels tooltips under Map appearance; time settings remain under Time controls.

All **42 automated suites** pass, including the real editor DOM flow and executed publication scripts. Forty-eight SVG fixtures were generated; representative narrow dark output was inspected. Native Chromium exited before opening a page, so native browser layout/focus/touch, screen readers, Windows and detailed performance acceptance remain pending. See `docs/QA_V3_41.md`.

## Run on Windows

Stop the old server with Ctrl+C. Extract the ZIP and open Command Prompt beside `index.html`:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5.

**Next batch:** heatmap time playback with a fixed colour scale across periods.

---

# OpenViz Studio V3.40 — route time playback

Route maps now support period playback with fixed geographic framing, width scales and reciprocal lane assignment across the timeline. The catalogue remains **44 chart options**, with **eight time-enabled types**.

## Try it

Create a **Route & connection map**, open **Time controls**, and use the time example or enable playback on your own data. Choose a separate period column. In row mode, an optional **Route ID** keeps the same connection identifiable when its coordinates change. Without an ID, identity is the exact directed coordinate/label pair. Duplicate identities within a period block playback: group directed pairs or supply distinct IDs. Blank selected IDs and missing periods are excluded and reported.

Play/Pause, Previous/Next, period selection, speed and looping use discrete snapshots. Changing the reader period does not edit the dataset or saved chart; use **Capture current period** to save a snapshot. Missing connections disappear, zero values have no line width, and an empty period keeps the basemap. No interpolation, zero filling or carry-forward is inferred.

Grouping runs separately within each period. Automatic width maximum and Fit use all valid period results, never totals pooled across time. Reciprocal sides remain stable when the reverse direction temporarily disappears. An authored shared maximum still takes precedence; larger values retain their original magnitudes and disclose visual saturation. Use the same maximum, maximum line width and display scale when comparing independently configured charts.

Search, pinned details, zoom and the live locator retain their reading context across periods. A pinned missing connection is marked unavailable and updates when it returns. Route IDs and the current period appear in timed row details. Source data remains unchanged.

Limits: **60 periods**, **30,000 source rows**, **500 resulting connections per period** after grouping, and the existing **6 MiB interactive snapshot payload** budget. Playback stops with validation feedback when limits or duplicate identity rules fail.

## Examples and delivery

Import `examples/v340-route-time.json` for ID-based playback, per-period directed sums and an authored width cap, plus a saved-period dashboard and three-period story. The example includes an intentionally invalid-only 2022 period to demonstrate an empty map. Six standalone HTML examples use the `v340-route-time-` prefix: `ids`, `sum`, `capped`, `dashboard`, `player` and `scroll`.

Interactive chart HTML includes the complete snapshot player. Static outputs, dashboards and stories use the saved period. Dashboard filters retain that period and the full source timeline's frame/scale; a missing filtered connection stays empty rather than switching years. Captured story filters define their own source timeline, so use authored shared maxima for comparison across differently filtered scenes. Exported interactive HTML contains chart data and all included period snapshots.

All **41 automated suites** pass. Forty-eight SVG fixtures cover four periods, two widths and two themes; representative generated output was inspected. Native Chromium exited before opening a page. Native browser layout/focus/touch, screen readers, Windows and detailed performance acceptance remain pending. See `docs/QA_V3_40.md`.

## Run on Windows

Stop the old server with Ctrl+C. Extract the ZIP and open Command Prompt in the folder containing `index.html`:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5.

**Next batch:** route tooltip customisation and additional detail fields.

---

# OpenViz Studio V3.39 — grouped and two-way route comparisons

Route maps now offer optional directed-pair aggregation, reciprocal-link separation and reusable width limits. The catalogue remains at **44 chart options**. Existing maps keep their defaults: one connection per row, overlapping reciprocal paths and an automatic width maximum.

## Try it

Open a **Route & connection map** and find **Connection appearance**:

- **Combine matching directed connections:** keep `rows`, or choose `sum`, `average`, `count`, `min` or `max`.
- **Separate reciprocal directions:** when both directions are present, show opposite illustrative curves. This also applies in straight mode and uses a small minimum bend.
- **Shared width maximum:** enter a positive maximum for value-based widths. Leave it blank for automatic scaling.

Grouping matches exact origin/destination coordinates and full endpoint labels. Reverse directions remain distinct; different labels are not silently merged. Longitude -180 and 180 represent the same grouping position. Source rows remain unchanged. Group details disclose the calculation, contributing valid-row count and up to eight current-view row positions.

Sum/average/min/max require a value column. Count can work without a value column. If a value is selected, the existing rule still excludes missing/nonnumeric/negative values before counting or grouping. Clearing the optional value lets Count count coordinate-valid rows without a magnitude filter. Zeros remain valid. Sums that exceed the numerical range stop the view with an error; they do not publish partial groups.

## Comparable widths and directions

Copy the same **Shared width maximum** and **Maximum proportional width** to related charts/scenes, and compare them at the same display scale. The limit is saved per chart or captured scene; it is not a globally linked rule. Filtered views can then retain the same width reference. Without a fixed maximum, each view uses its automatic maximum.

Values above the shared maximum reach the maximum line width while retaining their original values. The key, accessible summary and pinned details disclose width capping. Zero has no line width; endpoint dots can remain. Uniform-width mode ignores the magnitude scale.

Reciprocal curves have stable side assignment when rows are reordered and separate near-vertical connections as well as horizontal/diagonal ones. They are illustrative visual offsets, not observed travel paths. Separation only applies when both directions are in the current view; filtering one away may return the remaining connection to its normal shape. Same-direction rows still overlap unless grouped. Geographic clipping and polar limits still apply.

The 500-connection drawing cap applies **after grouping**. Automatic maxima and Fit use all valid resulting connections, including those beyond the cap. Input exclusions are distinct from connections outside the selected crop.

## Examples and exports

Import `examples/v339-route-comparison.json` for raw-row, grouped, separated/shared-maximum and width-capped designs, plus a comparison dashboard and a shared-scale story. Standalone examples are `v339-route-rows.html`, `v339-route-sum.html`, `v339-route-separate.html`, `v339-route-capped.html`, `v339-route-dashboard.html`, `v339-route-player.html` and `v339-route-scroll.html` inside `examples/`.

The new settings work with search/pins, navigation/locator, static exports, portable projects and captured story views. Editing settings is undoable; reader state remains temporary. No source data is rewritten and no runtime network service is added.

All **40 automated suites** pass, including grouping arithmetic/overflow, reciprocal geometry, shared-scale saturation, saved scenes and editor Undo checks. Twenty-four SVG fixtures were generated and representative output inspected. Native Chromium exited before opening a page; browser layout/focus/touch, screen readers, Windows and detailed performance acceptance remain pending. See `docs/QA_V3_39.md`.

## Run on Windows

Stop the old server with Ctrl+C. Extract the ZIP and open Command Prompt in the folder containing `index.html`:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5.

**Next batch:** route time playback with fixed geographic and width scales.

---

# OpenViz Studio V3.38 — route and connection maps

**Route & connection map** is now an available template, bringing the catalogue to **44 chart options**. Connect origin/destination coordinates with straight or illustrative curved links, optional destination arrows, endpoint names and uniform or value-proportional line width.

## Try it

Open **Templates**, search **route**, then create **Route & connection map** with its editable example. Or import `examples/v338-route-maps.json`, containing three chart designs, a dashboard and a filtered three-scene story.

In Data, choose four distinct WGS84 decimal-degree columns: **Origin latitude**, **Origin longitude**, **Destination latitude**, **Destination longitude**. Origin/destination labels and a nonnegative value are optional. A value is required for proportional widths. Map appearance includes all three projections, viewport/Fit/custom crop, padding, labels, outlines, key and locator. Connection appearance controls shape, curvature, widths, opacity, endpoint dots, arrows and colour.

Enable map search/pinned details, zoom/pan and the locator to explore connections. Search uses the combined origin/destination labels, pins describe that input-view row, and Locate fits the connection's displayed bounds. Route clicks do not originate linked dashboard selections; maps can receive filtering from a shared dropdown or other supported charts. Filtering resets connection reading state to avoid stale row identities.

## What the map means

Each valid row is one connection. Duplicate and reciprocal rows remain separate and can overlap. No aggregation or distance/travel path is inferred. Straight mode draws direct projected segments; curved mode uses an illustrative latitude bow. Paths follow the shorter longitude direction, split at map seams and clip to the selected viewport. Arrows appear only at in-view destinations, not arbitrary crop edges.

Uniform mode uses a fixed line width. Value mode uses width proportional to value, with zero producing no line width; endpoint dots can still show locations. The maximum uses all valid rows in the current view, including rows beyond the drawing cap. If a value column is selected, missing/nonnumeric/negative values are excluded even in uniform mode; leave it unmapped for unweighted connections. Coordinates must be numeric and in range. Identical-position connections are excluded. Counts and reasons appear in editor warnings; the map key/accessible summary also disclose exclusion counts.

Only the first **500 valid rows** are drawn. Fit covers the complete longitude spans with a conservative allowance for the curved shape, rather than only the endpoint positions. These are illustrative connections, not actual journeys, geodesics, navigation instructions or distance measurements. Country-name geocoding, automatic time playback, custom-boundary joins, manual endpoint-label placement, route aggregation and reciprocal-link separation are not included in this batch.

## Examples and delivery

`examples/v338-route-pacific.html`, `v338-route-world.html` and `v338-route-straight.html` demonstrate the chart designs. `v338-route-dashboard.html`, `v338-route-player.html` and `v338-route-scroll.html` exercise filtering and story delivery. Story widths rescale to each scene's filtered view, as disclosed in its chapter text; a shared authored width scale is a follow-up.

Column renaming, source switching/review, bound-column tables, portable projects, static/vector output and interactive chart/dashboard/story HTML include the new coordinate roles. Imported raw rows remain unchanged. No account, geocoding API, tiles or runtime network dependency is added.

All **39 automated suites** pass, including the new route suite, 44 field contracts and template quality checks, plus extended editor template/binding/Undo workflow checks. Eighteen SVG fixtures were generated and representative designs inspected. Normal native Chromium launch still exited before opening a page; native browser layout/keyboard/touch, screen readers, Windows and performance acceptance remain pending. See `docs/QA_V3_38.md`. Full competitor parity is not claimed.

## Run on Windows

Stop the old server with Ctrl+C. Extract the ZIP and open Command Prompt in the folder containing `index.html`:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5.

**Next batch:** route aggregation, separation of reciprocal links and shared width scales.

---

# OpenViz Studio V3.37 — live reader locator

The world locator inset now follows the current reader viewport while zooming, panning, dragging or using **Locate on map**. It works in Preview and interactive charts, dashboards and complete story/chapter map views. The catalogue remains at 43 options.

## Try it

Enable **Map appearance → Show world locator inset** and **Show map zoom & pan controls**. Zoom or pan and watch the inset outline move. Enable search/pinned details too if you want to test Locate. These author options remain off by default; no extra live-locator switch is required.

The outline uses the map's actual projected geographic rectangle, accounting for frame padding and symbol inset space. Local equirectangular, spherical Mercator and cylindrical equal-area are supported. Dateline crossings split the outline into two pieces. Very small extents retain the minimum visible marker, so the outline is an orientation aid rather than an exact area/scale measurement.

A view that falls entirely in map padding has no geographic outline and its accessible description explains that. Reset restores the authored extent. Time playback retains that map's reader view; dashboard cards and story chapter views remain independent. Story transitions/animation frames retain the existing complete-scene exploration rules.

The locator's accessible description identifies the current reader viewport. It is informational; clicking or dragging inside the inset does not navigate the main map. Static SVG/PNG/PDF, GIF/video, static HTML and script-free reading output keep the authored extent. Reader viewport state is not written to chart settings, portable projects or Undo history.

## Examples

Import `examples/v337-live-locator.json` for eight maps, four datasets, a dashboard and two stories. Standalone HTML examples:

- `v337-locator-regions.html`, `v337-locator-timed-points.html`
- `v337-locator-mercator.html`, `v337-locator-equal-area.html`, `v337-locator-wrapped.html`
- `v337-locator-dashboard.html`, `v337-locator-story.html`, `v337-locator-scroll.html`

All are inside `examples/` and use the current self-contained runtime. Saved story scenes retain their own captured options; the supplied story examples have both navigation and locator enabled.

All **38 automated suites** pass, including inverse-projection arithmetic and runtime/editor lifecycle checks. Thirty-two runtime SVG fixtures were generated across projections, two widths and two themes, with before/zoom output. Native Chromium exited before opening a page, so real browser layout/painting, touch, screen readers, Windows and performance acceptance remain pending. See `docs/QA_V3_37.md`.

## Run on Windows

Stop the old server with Ctrl+C. Extract the ZIP and open Command Prompt in the folder containing `index.html`:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5.

**Next batch:** route and connection maps for journeys and flows between places.

---

# OpenViz Studio V3.36 — locate a pinned place

**Locate on map** now fits and recentres a pinned region or point when map zoom/pan is enabled. This works in Preview, interactive charts/dashboards, Story Studio's complete-scene explorer, standalone story players and interactive scroll/reading chapters. The catalogue remains at 43 options.

## Try it

Enable both **Map appearance → Show map search & pinned details** and **Show map zoom & pan controls**. Search for a place and choose a result, or click a mapped item, then press **Locate on map**. Search and pinning do not move the view until Locate is pressed.

Regions fit their displayed bounding rectangle with space around it, capped at 8×. Points/symbols are capped at 4× and retain their original radius/data. The view stays within the authored map frame/crop. Large or widely separated multi-part regions may need little or no zoom. **Reset view** restores the authored framing. Movement is immediate, including with reduced motion.

Locate retains the pin, moves keyboard focus to the selected mark and, after a successful move, scrolls the map into the nearest visible part of the page if needed. It does not click the mark, change linked dashboard selections or create Undo entries. Maps remain independent across dashboard cards and story chapters.

Missing or ambiguous pins keep Locate disabled. A timed point returning in a later period is located from its current position. Points outside the authored crop are not recovered. If navigation is disabled, Locate keeps its focus/highlight behaviour and explains how to enable recentering. If shape measurement fails, the view stays unchanged with a plain-text explanation.

## Examples and delivery

Import `examples/v336-locate-maps.json` for five maps, a dashboard and two stories. Open `examples/v336-locate-regions.html`, `v336-locate-countries.html` or `v336-locate-timed-points.html` for standalone maps. The dashboard, story player and scroll examples are `v336-locate-dashboard.html`, `v336-locate-story.html` and `v336-locate-scroll.html`.

The enabled author options remain saved/undoable. Reader pin, zoom and pan state remain temporary and are excluded from fresh/static exports. Saved story scenes still honour their captured options/period/filter; animation frames are not used as measurement data.

All **37 automated suites** pass, including new geometry/Locate tests and extended editor workflow checks. Native browser measurement/layout, touch, screen readers, Windows and performance acceptance remain pending: normal Chromium launch exited before opening a page. Generated fixtures use a disclosed polygon-measurement shim and are not a native-browser certification. See `docs/QA_V3_36.md`.

## Run on Windows

Stop the old server with Ctrl+C. Extract the ZIP and open Command Prompt in the folder containing `index.html`:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5.

**Next batch:** a live locator inset that follows the reader's zoom and pan.

---

# OpenViz Studio V3.35 — map exploration in stories

Map search, pinned details and zoom/pan now work in Story Studio, standalone story players and interactive scroll chapters. The catalogue remains at 43 options.

## Try it

Import `examples/v335-map-stories.json` for two fictional three-scene stories: district values and point surveys. Or enable **Map appearance → Show map search & pinned details** and **Show map zoom & pan controls** on a chart, then use it in a story. Both options remain off by default. Saved scene views preserve their own settings: capture a new scene view or use the linked chart if an older snapshot has these options disabled.

In Story Studio and standalone story players, choose **Explore scene map**. This pauses playback and opens the complete saved scene map beneath the animation, with the enabled controls. The heading identifies the scene. It is separate from the sampled animation frame so interpolated values/positions are never offered as the scene's data. **Close scene map** returns to the animation. Playing, seeking or navigating scenes closes the explorer; reopening starts a fresh search/pin/view.

In interactive scroll stories, **Reading view** puts controls beneath each complete chapter map. Maps in separate chapters have independent pins and view state. On larger screens, **Scroll view** provides controls in the sticky map on complete chapter views. Controls are removed while a chapter transition is being drawn, then installed afresh on the next complete view. Existing focus protection holds the sticky map while its controls have keyboard focus. Reading and sticky exploration are separate; a pin is not carried between chapters or layouts.

Reader exploration does not change project settings, rows, saved scene views, the story playhead or Undo history. The Explore action pauses playback; normal story navigation still determines the scene. Search/pin values come from that scene's saved period/filter. Zoom remains bounded 1–8× within the authored crop; no map tiles, wheel/pinch zoom or automatic Locate recentering are added.

## Examples and delivery

- `examples/v335-map-player.html`: standalone district story; use Explore scene map.
- `examples/v335-point-player.html`: point-survey story with different sites available by scene.
- `examples/v335-map-scroll.html`: interactive scroll/reading chapters.
- `examples/v335-map-reading.html`: complete script-free reading export.

Publishing Studio and story HTML export include the same behaviour. Static HTML, reading downloads, SVG, PNG, GIF and video remain composited authored output without reader controls or temporary highlights/transforms. No account, API or runtime network request is required.

All **36 automated suites** pass, including a new executed story-map suite and extended Story Studio editor workflow checks. Native Chromium again exited before opening a page; browser layout/touch/focus, screen readers, Windows and detailed performance acceptance remain pending. See `docs/QA_V3_35.md`. This is independently built functionality, not a completed competitor benchmark.

## Run on Windows

Stop the old server with Ctrl+C. Extract the ZIP and open Command Prompt in the folder containing `index.html`:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5.

**Next batch:** zoom-to-place from search/pinned details, so Locate can bring a place back into view.

---

# OpenViz Studio V3.34 — map zoom, pan and reset

Choropleth and proportional-symbol maps now offer optional reader navigation in Preview and interactive chart/dashboard HTML. The catalogue remains at 43 options.

## Try it

Enable **Map appearance → Show map zoom & pan controls**. It is off by default and independent of search/pinned details. **Try zoomable map example** adds fictional regional time data with both features enabled.

Use **Zoom in / Zoom out** for 1–8× magnification, directional **Pan** buttons to move through the map, and **Reset view** to restore the authored framing. Turn on **Drag to pan** for pointer dragging after zooming. Escape or pointer cancellation rolls back the current drag. Normal page scrolling is untouched; there is no wheel zoom or pinch gesture.

The pan buttons are native keyboard-operable buttons. Titles, legends and the locator remain fixed. Map geometry, symbols, names and geographic callouts magnify together within the original map frame. The locator continues to show the authored extent, not the temporary zoom window. This is SVG magnification, not new map tiles or higher-resolution boundaries; zoom cannot reveal features outside the authored crop.

Navigation is temporary reader state, creates no Undo entries and does not change project/data/colour scales. Each dashboard map has its own view; responsive variants and time periods share that map's view. A fresh editor render resets the view. Changing the source, projection, crop or boundary context resets it too. Map-position editing disables navigation. Dragging suppresses its following mark click to avoid accidental pinning or linked selection; ordinary clicks keep their existing behaviour.

Search/pinning can be enabled separately. Pinned details keep updating across time. Locate on map still focuses/highlights a mark; it does not automatically recenter a zoomed view.

Import `examples/v334-zoomable-maps.json` for five maps and a dashboard. Open `examples/v334-zoomable-regions.html` or `examples/v334-zoomable-timed-points.html` for self-contained interactive time examples.

## Delivery and verification

Static SVG/PNG/PDF/static HTML uses the authored framing without reader controls or temporary transforms. The author setting is saved/undoable and validated in portable files. Stories retain settings and metadata but do not install the navigation/search reader panels yet. Heat-density maps are excluded.

All **35 automated suites** pass, including bounded zoom/pan, shared time/responsive state, independent dashboard maps, coordinate conversion, drag suppression/cancellation, editor/Undo and static/export checks. See `docs/QA_V3_34.md`. Native Chromium could not open a page in this environment; real browser layout, pointer/touch behaviour, screen-reader, Windows and performance acceptance remain pending. Full Flourish parity is not claimed.

## Run on Windows

Stop the old server with Ctrl+C. Extract the ZIP and open Command Prompt in the folder containing `index.html`:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5.

**Next batch:** bring map search, pinned details and navigation into stories and scroll chapters.

---

# OpenViz Studio V3.33 — map search and pinned details

Maps now offer optional **place search and a pinned detail panel** in Preview and interactive chart/dashboard HTML. Find a place, keep its details open and follow it through time without changing source data or chart filters. The catalogue remains at **43 options**.

## Try it

On a choropleth or proportional-symbol map, enable **Map appearance → Show map search & pinned details**. It is off by default. **Try searchable map example** creates fictional regional time data with selected extra tooltip fields; Undo removes the example.

Type a place name or ID below the map and choose a result. Or click a mapped item. **Locate on map** moves keyboard focus to the highlighted mark; **Clear pin** closes the details. Search ignores case and common accent marks and returns up to 20 matching places; refine the query when there are more. Search uses place names/IDs, not arbitrary tooltip-column contents.

Import `examples/v333-searchable-maps.json` for five editable examples and a dashboard. `examples/v333-searchable-regions.html` has regional time playback. In `examples/v333-searchable-time-points.html`, pin Survey point A, step to 2023 to see it unavailable, then to 2025 to see its updated value and position.

## Reading behaviour

- One pin per map. Pins use the same safe plain-text details as tooltips, including additional-field rules, missing-value disclosures and optional exact values.
- Search does not filter, rescale or aggregate anything. It also does not change linked dashboard selections. Ordinary mark clicks retain the dashboard's configured linking behaviour, so a click can pin details and also trigger its existing linked selection.
- Pins refresh from the current frame. A missing regional value can show No data; a point absent from the current view/period says Unavailable. Old values are not presented as current. The pin is retained so it can recover if the place returns.
- Regional areas/symbols share one place identity; symbol details take priority when available. Timed points use their entity IDs. Static points use place/position identity; ambiguous duplicate observations are disclosed and their details are not combined.
- Maps in separate dashboard cards have independent panels. Responsive SVG variants share one panel per chart. Reflow selects the visible layout.

Pinning, searching and clearing are temporary reader state. They add no Undo entries and are not saved in the project, portable file or export. A fresh editor render or changed chart/data context resets them. The enabled/disabled author setting is saved and undoable. Map-position editing blocks pin changes until editing ends.

## Keyboard and layout

Tab enters the search field or map. In search, Arrow Down moves to the first result; Enter pins a sole result or focuses the first of several. Native result buttons support keyboard activation. Enter/Space on a mapped item also pins its details. Clear pin returns focus to search. The detail text is scrollable and keyboard focusable, which helps with long additional-field summaries.

The panel sits below the map; editor controls stay outside the SVG authoring sheet. The selected mark receives a temporary outline. Locate focuses/highlights; it does not zoom or pan. Search is limited to rendered features in the current view, not a global geocoder.

## Delivery and limits

Interactive standalone chart and dashboard HTML includes the dependency-free reader runtime. Static SVG/PNG/PDF/static HTML keeps the map and titles without HTML controls or pinned highlights. Story views retain the author setting/metadata, but this batch does not install search panels into story compositions or scroll chapters. Heat-density maps retain their current interaction model.

No new data, hosting, account or runtime library is required. Values, geometry, joins, time domains, extra-field policies and source-data publication choices are unchanged. Unlinked interactive dashboards now guard their absent selection-status element instead of throwing during startup.

All **34 automated suites** pass, including new search/pin/runtime/export tests, extended editor workflows and prior regressions. Twenty map SVG fixtures and five detail-text cards were generated; representative output was rasterised and inspected. See `docs/QA_V3_33.md`.

Normal native Chromium launch failed before opening a page. Native panel/font/layout, touch, screen readers, Windows and detailed real-world performance remain pending. DOM checks do not certify those behaviours, and full Flourish geographic parity is not claimed.

## Run on Windows

Stop the previous server with Ctrl+C. Extract the ZIP, open the folder containing `index.html`, type `cmd` in File Explorer's address bar, then run:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5. Keep the same origin/port for saved projects and retain portable backups.

**Next batch:** map zoom, pan and reset controls.

## Earlier release notes

# OpenViz Studio V3.32 — additional map tooltip fields

Map tooltips now support **up to four explicitly selected source columns**, each with a label, aggregation rule and independent number format/units. Preview the result before Apply; Cancel and Undo retain their existing behaviour. The catalogue remains at **43 options**.

## Try it

Open **Map appearance → Tooltip labels & values… → Custom labels & values → Additional tooltip fields**. Add a field, choose its source column and rule, then Preview. Blank or invalid definitions block Apply. Add/remove changes stay in the draft until Apply commits one Undo step.

**Try additional fields example** adds fictional regional time data containing conflicting context labels and a partly missing secondary measure. It creates new data; prior datasets stay unchanged. Import `examples/v332-map-tooltip-fields.json` for regional/country/point examples and a dashboard, or open `examples/v332-map-tooltip-fields.html` for offline playback.

## Explicit rules

| Rule | Meaning |
| --- | --- |
| Unique text | Show the value only when all non-empty valid cells agree; otherwise say Multiple values and report the distinct count. No first-row guess. |
| Sum | Add valid finite numeric cells. |
| Mean | Average valid finite numeric cells. |
| Minimum / Maximum | Use the valid numeric extreme. |
| Non-empty count | Count nonblank scalar cells, including zero and false; this is not a numeric-only count. |

Rules use **only rows contributing to the main mark in the displayed period**. A row excluded by the main measure/join is not rescued by an additional field. If the main calculation is Count, its existing broader contributor rule still applies. A point symbol uses its one observation; country aliases and custom regions use their actual grouped contributors.

Numeric rules accept finite numbers and nonblank numeric strings; they exclude booleans, blanks, invalid strings and nonfinite values. Excluded cells produce a valid/missing/invalid count. An empty numeric group is No data, never an invented zero. Non-empty count over no contributors is zero. Overflow is reported as Outside numeric range.

Unique text trims string edges, is case/type-sensitive and accepts strings, finite numbers and booleans. Values longer than 120 Unicode characters are shortened; control characters are replaced for safe display. Distinct numeric 1 and text "1" remain two typed values. Missing/invalid cells are reported separately.

Labels include the selected rule so readers can distinguish a mean from a total. Each numeric field has Automatic, Decimal, Compact or Scientific formatting, 0–6 decimal places and literal prefix/suffix units. Existing Include exact value when rounded controls exact rows for additional summaries too. Percentage suffixes do not convert data.

## Data connections and delivery

Selected columns are data bindings. Renaming a column updates these definitions without changing the original import. Deleting a used column is blocked; refresh review flags removed selected columns. Missing references appear in connection warnings.

Switching to another dataset **clears additional tooltip fields in the reviewed draft**, even when the new columns have identical names. The review explains this; add them again after checking the new data. Cancel leaves the chart unchanged; Undo restores its previous dataset and field definitions. Other chart appearance settings are retained.

Additional-field definitions stay linked to the source chart in saved story views, like other data bindings. They are not frozen copies inside a scene. The scene's existing period/filter still determines the actual contributors. Portable projects validate and retain definitions; static/interactive chart/dashboard/story output and time HTML render selected summaries.

Unselected columns remain excluded from HTML. When the optional source-data table is enabled, active selected tooltip columns can appear as raw records, within the existing 12-column/5,000-row limits. Dormant Automatic-mode definitions and non-map definitions are excluded from that table. Time HTML now provides the main container needed to include this existing optional table. Hiding a display row does not remove project data.

Chart values, joins, geometry, colour domains/classes and symbol sizes are unchanged. No formulas, arbitrary HTML, external data service or new chart template is added. Existing time-payload limits still apply; many long tooltip fields can increase publication size.

## Validation

All **33 automated suites** pass: new field/rule/binding/delivery tests, extended editor workflows and previous regressions. Sixteen SVG fixtures and four tooltip text cards were generated; representative output was rasterised and inspected. See `docs/QA_V3_32.md`.

Normal native Chromium launch failed before opening a page. Native font/modal/tooltip layout, touch, Windows, screen readers and detailed real-world performance remain pending. DOM tests do not certify those behaviours. Full Flourish geographic parity is not claimed.

## Run on Windows

Stop the previous server with Ctrl+C. Extract the ZIP, open the folder containing `index.html`, type `cmd` in File Explorer's address bar, then run:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5. Keep the same origin/port for saved projects and retain portable backups.

**Next batch:** map search and pinned detail panels for easier exploration of richer tooltip content.

## Earlier release notes

# OpenViz Studio V3.31 — custom map tooltip labels and values

Country/region choropleths and proportional-symbol maps now have a dedicated **Tooltip labels & values…** editor. Customise the details shown on hover and keyboard focus, Preview before Apply, and restore the previous settings with one Undo. Automatic keeps the previous map details. The catalogue stays at **43 options**.

## Try it

Open a supported map, then **Map appearance → Tooltip labels & values… → Custom labels & values**. Edit the controls and choose **Preview tooltips**. A sample card shows the first mapped item; the preview map also supports hover and keyboard focus. Cancel leaves the chart unchanged.

**Try customised tooltips example** creates fictional positive regional time data with labelled amounts and units. Undo removes the example. Import `examples/v331-map-tooltips.json` for four editable region/country/point examples and a dashboard. `examples/v331-map-tooltips.html` includes offline time playback.

## Display controls

- Set optional place/region and value labels. A blank value label uses the bound value field, or Count of records for a count aggregate.
- Choose Automatic/exact, Decimal, Compact or Scientific values, 0–6 decimal places, and literal prefix/suffix units. `%` does not multiply data by 100 or convert units.
- Show/hide the numeric value, exact value when rounding, contributing record count, aggregation method and current period.
- Show symbol coordinates where available. Country positions and regional display anchors are explicitly representative; coordinate-bound point symbols say Observation position. Coordinates display latitude then longitude to three decimal places.
- Set missing-data text. The place name and missing-data state remain identifiable. Genuine zero is a value, not a missing observation.

Decimal/compact/scientific formats reuse the deterministic display formatter. Rounded numbers carry ≈; an optional separate row gives the exact original value with its units. Legend formatting is independent. Automatic tooltip mode keeps saved custom settings for later use.

Grouped country/region values use the chart's existing aggregation. Counts report valid contributors to that feature in the displayed period, not all source rows. Ordinary point symbols represent one observation. Symbol-size formulas, colour/classification models and joins do not change. No arbitrary source columns, rich HTML, links or per-row templates are introduced in this batch.

## Keyboard, time and delivery

Custom missing regions join the existing roving keyboard navigation. Tab enters the map; arrows move between mapped items; Enter/Space shows details and Escape dismisses them. The runtime uses plain text and preserves line breaks. Replacing a time frame dismisses stale tooltip details, and the next focused mark shows its own period/value.

Displayed period is transient snapshot metadata outside the fixed scale-domain object. Time scales, colours and sizes remain fixed across frames. Static SVG/HTML titles, interactive chart/dashboard publishing, saved story views and portable projects retain tooltip settings. Heat-density cells and map annotation boxes retain their existing details.

Hiding a tooltip row is a display preference, not data removal: the project, other chart content and numeric SVG metadata may still contain the values. Prefix/suffix fields do not modify observations. Tooltips remain separate from labels, callouts, legends, geometry and source data.

## Validation

All **32 automated suites** pass, including the new tooltip model/render/runtime/delivery suite, extended editor workflows and previous regressions. Tests cover duplicate aggregates, counts, zero/missing values, exact/rounded text, coordinate provenance, keyboard dismissal, time updates, Preview/Cancel/Apply/Undo, stale-context rejection, portable/story/dashboard export and source safety. Sixteen SVG fixtures and four rendered-text cards were generated and representative figures inspected. See `docs/QA_V3_31.md`.

Normal native Chromium launch failed before opening a page. Native font/modal/tooltip layout, touch, Windows and screen readers remain pending. DOM checks are not native acceptance tests; full Flourish geographic parity is not claimed.

## Run on Windows

Stop the previous server with Ctrl+C. Extract the ZIP, open the folder containing `index.html`, type `cmd` in File Explorer's address bar, then run:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5. Keep the same origin/port for saved projects and retain portable backups.

**Next batch:** additional tooltip fields with explicit rules for aggregating grouped records.

## Earlier release notes

# OpenViz Studio V3.30 — map legend layout, units and number formats

Choropleth legends now have **block width/alignment, class-key layout, text size, units and number-format controls**. Preview before Apply; Undo restores the previous design. These are display settings: numeric domains, breaks, class membership and actual observations retain their values. The catalogue stays at **43 options**.

## Try it

Open **Choropleth map → Map appearance → Classification, colours & legend… → Legend layout & numbers**. Or use **Try legend layout example** to add fictional signed regional data with a right-aligned vertical list and kg suffix. Undo removes the example.

Import `examples/v330-map-legend-layouts.json` for four editable designs and a comparison dashboard. `examples/v330-map-legend.html` is self-contained time playback. The generated comparison figure is in `docs/v330-map-legend-layouts.png`.

## Layout

- **Automatic grid** uses available width and label complexity to choose class-key columns. **Vertical list** puts one class per row. This choice is retained but disabled for Continuous, which uses a gradient.
- **Block width** is 25–100% of the map plot, with a responsive 120px minimum where space allows. **Left/Centre/Right** positions this whole block below the map. Alignment becomes visible when the block is narrower than the plot.
- **Text size** is 9–16 for legend body text; the title remains proportionally larger. Larger type, narrow blocks and long lists reserve more space below the map. A short canvas may grow to preserve a minimum map area.
- Formatted gradient values are staggered onto separate rows so scientific exponents and ordinary unit labels remain readable on narrow charts. Long prefixes/suffixes or captions can still be shortened; inspect compact exports. Exact numeric text remains in SVG titles.

Legends remain below the map. This release does not add floating/in-map placement, gradient orientation controls or free dragging. Source notes and boundary notes retain their own layout.

## Numbers and units

**Automatic** keeps the previous numeric presentation. **Decimal**, **Compact** and **Scientific** use 0–6 decimal places. Decimal uses deterministic English grouping; Compact uses k/M/B/T, with scientific fallback at extreme magnitudes. Scientific uses decimal places after the mantissa point. A rounded label receives **≈** when its displayed number no longer equals the exact threshold/value.

Prefix and suffix are literal labels of at most 16 characters each. Include a leading space in a suffix such as ` kg` if desired. A `%` suffix does **not** multiply values by 100. For example, a stored 0.01 with two decimal places and `%` displays `0.01%`, not `1%`. These fields do not convert currency, physical units or stored data.

Formatting applies to legend ticks, class thresholds, midpoint, custom-range captions and symmetric-log constant. Exact thresholds and scale metadata retain their original numeric values; tooltips keep their current actual-value presentation. Two different thresholds can have the same rounded label at low precision, so increase precision or inspect their exact titles. The legend title remains independently editable.

## Time and delivery

The same legend settings persist across every time period, static SVG/HTML, chart/dashboard publishing, saved story views and portable projects. Missing-data labels/keys and explicit per-feature colour overrides remain separate. Symbol-size and heat-density legends, map names/callouts, source rows, geometry, joins, aggregation and scale models are unchanged. Plot geometry may resize to make room for a larger legend.

Controls use staged Preview/Cancel/Apply and one-step Undo. Imports validate layout enums, integer width/type/precision limits and safe prefix/suffix text. No project format version change, runtime dependency, account or hosting service is added.

## Validation

All **31 automated suites** pass, including new formatter/layout/delivery tests, extended actual editor handlers and previous regressions. Tests cover scaled bounds at narrow widths, a maximum-size seven-class list, original thresholds/tooltip values, rounding/units/escaping, Preview/Cancel/Apply/Undo, portable/story/dashboard settings and executed time HTML. Sixteen responsive/theme SVG fixtures were generated; four rasterised examples were inspected. See `docs/QA_V330.md`.

Normal native Chromium launch failed before opening a page. Native browser/font/modal layout, touch, Windows and screen readers remain pending. DOM/SVG checks are not native acceptance tests. Full Flourish geographic parity is not claimed.

## Run on Windows

Stop the previous server with Ctrl+C. Extract the ZIP, open the folder containing `index.html`, type `cmd` in File Explorer's address bar, then run:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5. Keep the same origin/port for saved projects and retain portable backups.

**Next batch:** map tooltip customisation, including displayed labels, values and number formats.

## Earlier release notes

# OpenViz Studio V3.29 — logarithmic and symmetric-log map colours

Choropleths now have **Linear, Logarithmic and Symmetric log** colour transformations. These help show differences in highly skewed positive or signed values while keeping source data, tooltips and legend thresholds in original units. The catalogue stays at **43 options**.

## Try it

Open **Choropleth map → Map appearance → Classification, colours & legend…** and choose **Scale transformation**. Preview before Apply; Cancel leaves the chart unchanged and Apply is one Undo step. **Try logarithmic example** and **Try symmetric-log example** add fictional skewed regional time data. Undo removes an example.

Import `examples/v329-nonlinear-map-scales.json` for six editable comparisons and a dashboard. The log/symlog standalone HTML examples include offline time playback. The generated comparison figure is in `docs/v329-nonlinear-map-scales.png`.

## Transformation rules

**Linear** is the default and keeps the existing colour behaviour.

**Logarithmic** compares ratios: on a 1…100 scale, 10 is halfway through the colour range. All matched country/region aggregates must be strictly positive, including values outside custom limits. Zero and negative aggregates are rejected with an explanation; they are not silently hidden or changed to no data. Logarithmic diverging colour needs a positive midpoint. If symmetric automatic fitting crosses zero, choose Independent sides, positive custom limits or Symmetric log.

**Symmetric log** accepts negative values, zero and positive values. Its positive constant is expressed in the original value units. The transform is `sign(v) × ln(1 + abs(v) / constant)`: approximately linear near zero and increasingly compressed farther away. It is centred at zero, even when an authored diverging reference is something else. A larger constant widens the near-zero region; it is not a sharp boundary. Zero remains an ordinary observation and receives the neutral stop when the diverging midpoint is zero.

Continuous colours interpolate in transformed space, separately on either side of a diverging midpoint. Automatic independent/symmetric fitting still chooses endpoints in original numeric units. Custom endpoints still take precedence. To compare separate maps, match the transformation and symmetric-log constant as well as units, aggregation, palette/stops, midpoint, method and limits.

## Classes and legends

**Equal interval** divides the selected domain evenly in transformed space when Logarithmic or Symmetric log is active. For example, log bounds 1…1,000 with three classes produce breaks 10 and 100. Nonlinear automatic thresholds are rounded to 15 significant digits before classification; exact stored thresholds enter the upper class. Quantile and Manual restore Linear and retain their existing meanings.

Legends explicitly name the transformation and show the symmetric-log constant. Continuous legends sample the inverse transform, show endpoint and middle values in original units, and put the reference marker at its transformed position. The middle tick is a scale value, not an observed median. Colour strips are sampled gradients, not additional observations.

Nonlinear class keys use wider responsive entries. Rounded display thresholds carry an approximation mark; exact classification thresholds remain in SVG titles. Long text may still be shortened. Very narrow canvases can devote substantial space to the key, so inspect the exported layout.

Time maps pool matched per-period aggregates for one fixed scale and set of breaks across every period. Custom-limit saturation counts, missing-data styling, per-feature overrides, map labels, callouts and projection/crop behaviour are retained. Actual values, source rows, joins, geometry and symbol sizes are unchanged. This batch changes choropleth colour semantics only.

## Validation and delivery

New fields persist through portable files, saved story views, static SVG/HTML, chart/dashboard publishing and time HTML. Portable settings are validated; data-dependent log errors are shown during rendering and rejected before editor Apply. Updating source data to include a nonpositive aggregate requires choosing a compatible scale before producing a valid log map.

Constants must be finite and greater than zero. Nonrepresentable ranges and transformed limits too close to distinguish numerically are rejected. Existing finite original-span guards remain; this release does not promise unlimited numeric dynamic range. No runtime dependency, remote data, hosting or account is added.

All **30 automated suites** pass, including the new scale model/render/delivery suite, extended editor handlers and prior regressions. Twenty-four responsive/theme SVG fixtures were generated; six were rasterised and inspected. See `docs/QA_V329.md`.

Normal native Chromium launch failed before opening a page. Native browser/font/modal layout, touch, Windows, screen readers and large real-world map acceptance remain pending. DOM/SVG checks do not certify those behaviours, and no full competitor parity is claimed.

## Run on Windows

Stop the previous server with Ctrl+C. Extract the ZIP, open the folder containing `index.html`, type `cmd` in File Explorer's address bar, then run:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5. Keep the same origin/port for saved projects and retain portable backups.

**Next batch:** map legend layout and number-format controls, including clearer units and display precision.

## Earlier release notes

# OpenViz Studio V3.28 — comparable map colour scales

Choropleths now support **custom numeric colour limits**. Separate maps can show the same value with the same colour when their units, aggregation, method, palette/colour stops, midpoint and limits match. The catalogue remains at **43 options**.

## Try it

Open **Choropleth map → Map appearance → Classification, colours & legend…**. Choose **Continuous** or **Equal interval**, then set **Colour limits → Custom numeric limits** and enter both endpoints. Preview before Apply; Cancel leaves the chart unchanged. Apply is one Undo step.

**Try custom colour limits example** creates a fictional regional time map with an authored −20…60 scale and reference 0. Alternatively import `examples/v328-map-colour-limits.json`: four editable charts and an early/later comparison dashboard. `examples/v328-map-colour-limits.html` is self-contained time playback.

## Colour rules

- **Continuous:** the authored minimum and maximum are the scale endpoints. Values outside them retain their actual values but use the endpoint colours.
- **Equal interval:** breaks divide the authored range into the requested number of intervals. The outer classes are unbounded, so out-of-range values enter the first/last class. Exact thresholds enter the upper class.
- **Diverging:** the midpoint must lie strictly inside the limits. Custom endpoints take precedence over automatic independent/symmetric fitting. For a symmetric custom range, choose endpoints equally spaced from the midpoint. The old automatic range preference is retained.
- **Classified diverging:** the entire class containing the midpoint is neutral, including when the observed data is wholly on one side. Colours and neutral class therefore stay comparable across maps with different distributions. This is a class, not a claim that every contained value equals the midpoint.
- **Quantiles:** custom limits are disabled; switching to Quantile restores Automatic. Quantile thresholds depend on each dataset and cannot promise shared colours across maps.
- **Manual breaks:** use identical thresholds to share class membership. Custom domain controls are disabled; this batch does not change the previous manual diverging class-colour policy.

Limits must be finite with maximum greater than minimum and a representable numeric span. Equal endpoints, blanks and invalid diverging references are rejected before Apply. Automatic restores the previous fitted behaviour and retains saved endpoint numbers for later use. Changing a chart's scale does not automatically edit other charts.

## Time, legends and source safety

Time maps use one authored scale and one set of equal-interval breaks across every period. These limits remain fixed after data updates and re-export, until edited. Fitted automatic scales still follow the observations. Crop/framing never changes the colour model.

Custom legends show the numeric range and **counts of matched aggregates below/above it**. Time counts pool all region/country-period aggregates across the timeline; static maps count current matched aggregates. Counts are not raw source-row counts. The fictional time example with −10…40 limits has 1 aggregate below and 6 above among 14 matched region-period aggregates. The unmatched 9,999 is excluded. Tooltips and data retain actual values.

Missing regions remain separate from zero and out-of-range values. Explicit per-feature colours can override the scale and are disclosed in the key. Names/callouts, geometry, joins, calculations, source rows and symbol sizes are unchanged. This batch applies to choropleth colour scales, not symbol-size or heat-density scales.

Portable imports validate the new fields. Static output, time HTML, dashboards, saved story views and Publishing Studio retain the authored settings. No hosting, account or runtime dependency is added.

## Run on Windows

Stop the previous server with Ctrl+C. Extract the ZIP, open the folder containing `index.html`, type `cmd` in File Explorer's address bar, then run:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5. Keep the same origin/port for saved projects and retain portable backups.

## Validation

All **29 automated suites** pass: new domain model/render/delivery tests, extended actual editor handlers and previous regressions. Coverage includes matching colours across different distributions, saturation, pooled counts, empty/constant data, invalid/overflow limits, fixed time models, country/custom maps, staged Preview/Cancel/Apply/Undo, inactive controls, portable/story/dashboard settings and executed standalone HTML playback. Sixteen SVG fixtures were generated; four narrow/wide light/dark examples were rasterised and inspected. See `docs/QA_V328.md`.

Normal native Chromium launch failed before a page opened. Native browser/font/modal layout, touch, Windows and screen readers remain pending. DOM/SVG checks do not certify these behaviours. No head-to-head competitor benchmark or full Flourish parity is claimed.

**Next batch:** logarithmic and symmetric-log colour scales for highly skewed positive and signed data, with explicit legends and validation.

## Earlier release notes

# OpenViz Studio V3.27 — move map names and callouts on the canvas

Maps now have an explicit **Edit map labels & callouts** mode in the Preview ribbon. Drag visible place/region names or callout boxes; their leader lines follow. Each completed move is one Undo step. The catalogue remains at **43 options**.

## Try it

Open a choropleth or proportional-symbol map. Under **Map appearance**, use **Try authored map example** (or import `examples/v327-map-canvas-positions.json`). Click **Edit map labels & callouts** above the canvas, then drag a visible name or callout box. Click **Done editing map** to return to normal chart selection.

- Tab focuses visible names and callout boxes. Arrow keys nudge by 1% of the plot; Shift+arrow uses 5%. Each nudge is undoable.
- Escape cancels an active drag. Pointer cancellation, lost capture, leaving the window, a replaced SVG or changed chart context also discard the unfinished move.
- Enter, Space or double-click opens the existing numeric **Map positions & annotations** editor at that item. It retains staged Preview/Apply/Cancel, hiding/resetting names and adding/removing callouts.
- Movement starts after three screen pixels. A click adds no Undo entry. Playback pauses when a move begins. The currently viewed time period is retained after a save; the chart's saved period is unchanged.

Enabling edit mode temporarily shows eligible names without changing their saved visibility. Completing a name move turns stored names on. Hidden names and names omitted by the placement limit/collision rules remain available through the numeric editor. Heatmaps support existing callout boxes; they do not gain place-name labels.

## Saved positions and delivery

Name and callout centres use the existing normalised map-plot coordinates. A move clamps the full text/box footprint inside the plot. The same settings persist through portable projects, static output, time HTML, dashboards, saved story views and Publishing Studio. Published output has no editing handles or drag runtime. `examples/v327-map-canvas-positions.html` is a standalone playback example, not an editor.

Dragging a callout moves its box, **not its geographic point**. Source rows, joins, aggregations, boundary geometry and symbol display anchors are unchanged. There is no new project schema or runtime dependency. Existing limits remain: 80 manual name overrides and 20 callouts.

Manual placement can overlap other labels, callouts, symbols or the locator, especially after resizing. Inspect compact output and adjust positions or hide names as needed. Moving symbols or geographic callout points directly on the canvas is outside this batch; their numeric controls remain available.

## Run on Windows

Stop the previous server with Ctrl+C. Extract the ZIP, open the folder containing `index.html`, type `cmd` in File Explorer's address bar, then run:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5. Keep the same origin/port for saved projects and retain portable backups.

## Validation

The new runtime and app integration checks pass drag preview/commit, one-step Undo, Escape/pointer cancellation/lost capture/window blur, stale/detached SVG rejection, keyboard nudges, exact numeric-editor targeting, temporary name visibility, transient periods, bounds/scaling, portable roundtrip and editor-free publication. All prior automated suites pass. Eight narrow/wide, light/dark SVG fixtures were generated and representative output rasterised and inspected. See `docs/QA_V327.md`.

A normal native Chromium launch failed before opening a page. Native pointer/touch layout, screen readers and Windows testing remain pending; DOM tests do not certify those behaviours.

**Next batch:** authored numeric colour-domain limits so separate maps can use matching scales. Full Flourish geographic parity is not claimed.

## Earlier release notes

# OpenViz Studio V3.26 — diverging colours and midpoints

Choropleths now support **three-stop diverging colours around an authored reference**, with independent or symmetric numeric ranges. Continuous and classified modes retain fixed time scales, explicit legends and separate missing-data styling. Existing sequential defaults remain. The catalogue stays at **43 options**.

## Try it

Open **Choropleth map → Map appearance → Try diverging map example**. It creates fictional regional data with a negative aggregate, zero, a missing later-period region and an unmatched outlier. The initial view uses continuous colours around zero with a symmetric range. Undo removes the example.

Open **Classification, colours & legend…**, choose **Diverging around midpoint**, enter a finite reference, choose the range policy and set low/neutral/high colour stops. Presets populate the three controls; you can then edit each colour. Preview before Apply. Cancel leaves the chart unchanged and Apply is undoable. Switching back to Sequential restores the existing palette controls without deleting the saved reference/colour stops. Inactive controls are disabled. Ranges that cannot be represented numerically are rejected before Apply.

Files: `examples/v326-diverging-maps.json` contains four editable reference-policy/classification examples and a dashboard; `examples/v326-diverging-map.html` is standalone time playback. docs includes the comparison figure and exact model verification.

## Continuous diverging colours

The midpoint is an explicit number, **not an inferred mean or median**. Values below it blend between the low and neutral stops; values above it blend between neutral and high. A continuous value exactly equal to the midpoint receives the neutral colour. RGB channels interpolate linearly; this is not a perceptually uniform interpolator or an accessibility certification.

**Independent sides** fit each side to its observed extreme while including the reference. For observations −10…20 around zero, −10 receives the low stop and 20 the high stop. Equal numeric distances either side can therefore have different interpolation weights.

**Symmetric distance** uses the larger observed distance on both sides. The same observations use −20…20, so −10 and +10 are both halfway between neutral and their respective endpoint. The legend can include an unobserved endpoint. This does not create data or change the values.

One-sided data remains on its corresponding side of the reference. The displayed colour range includes the reference even when no observation equals it. If all values equal the midpoint, they are neutral. Zero remains an ordinary value when the chosen reference is something else; it is never treated as no data.

The example has observed pooled aggregates −15…57, midpoint 0 and symmetric colour endpoints −57…57. Fourteen valid region/period aggregates determine that range; the unmatched value 9,999 is excluded. Region B 2020 is a genuine zero and uses neutral; Region E 2023 is missing and uses the separate no-data colour.

## Classified diverging colours

Equal-interval, quantile and manual break membership stays exactly as in V3.25. **A class is an interval, not one exact reference value.** If the reference lies within the observed numeric span, its containing class receives the neutral colour, including all other values in that class. The legend identifies that neutral interval. Exact break values still enter the upper class.

For example, a quantile class `< 29.25` containing reference 0 can include both negative and positive values and will be neutral throughout. This is a deliberate coarse classification, not a claim that those values equal zero. Use Continuous when exact distance from the reference matters, or choose manual breaks suited to the distinction you want readers to see. If the reference is outside the observed span, no class is designated neutral.

Other class colours use the midpoint of the class bounds after clipping those bounds to the observed numeric span, then the selected diverging interpolation. Unbounded outer intervals use the finite observed endpoints. Empty manual intervals can share colours. An empty interval wholly on the opposite side of the reference uses that side’s endpoint colour rather than a contradictory hue. Thresholds remain explicit in the key. The sequential classified palette is unchanged.

## Fixed time scales and legends

One model uses valid per-period country/region aggregates pooled across the whole timeline. Midpoint, fitted range, class colours and breaks remain fixed in every snapshot. Crop/framing does not alter that model. Automatic fitted endpoints can change after source data updates and re-export; authored midpoint, colour stops and manual breaks persist.

Continuous legends show both endpoints at the gradient ends and mark the reference position. Captions state the midpoint/range policy; classified keys also name the neutral interval or explain that there is no neutral observed class. Long labels retain exact text in SVG titles. Manual per-feature colours may override the scale and remain disclosed in the key. No-data colour/key controls remain separate.

Legend space is reserved below the map, and short choropleth canvases can grow to fit. Existing projections, labels, callouts, framing and source notes are retained. Diverging mode uses the three colour controls instead of the sequential palette; the unrelated palette selector is hidden while diverging is active.

## Projects and delivery

Portable imports validate mode, finite midpoint, range policy and colour stops. Captured story views retain them; story normalisation now recognises the colour-mode enum as an enum rather than a hex colour. Static/chart/dashboard/story output, Publishing Studio and standalone time HTML preserve the scale. Source rows, joins, aggregates and boundary geometry are unchanged. This batch applies to choropleths; symbol/heatmap colour semantics are unchanged. No runtime dependency, hosting or external data service is added.

Concept references reviewed:

- https://d3js.org/d3-scale/diverging — three-part numeric domains and colour interpolation.
- https://colorbrewer2.org/learnmore/schemes.html — meaningful central values in diverging maps.

The classified neutral-interval policy above is OpenViz's explicit implementation; this does not claim matching output to another product.

## Run on Windows

Stop the previous server with Ctrl+C. Extract the ZIP, open the folder containing `index.html`, type `cmd` in File Explorer's address bar, then run:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5. Keep the same origin/port for saved projects and retain portable backups.

## Validation

New diverging arithmetic/render/export checks and staged editor tests passed, alongside prior automated regressions. They cover exact references/endpoints, independent/symmetric/asymmetric/one-sided/constant data, classified neutral intervals, fixed time models, overflow rejection, presets/Undo, portable/story/dashboard settings and executed HTML playback. Sixteen SVG fixtures were rasterised and representative narrow/light and wide/dark figures inspected. See `docs/QA_V326.md`.

A normal native Chromium launch failed before a page opened. Native browser/font/modal layout, Windows, screen readers and detailed real-world performance remain pending. DOM and SVG tests do not certify those behaviours.

**Next batch:** direct canvas editing for map labels and callouts. Full Flourish geographic parity is not claimed.

## Earlier release notes

# OpenViz Studio V3.25 — choropleth classes and legends

Choropleths now support **continuous, equal-interval, quantile and manual colour breaks**, with clearer legends and separate no-data styling. Classification works for built-in countries and custom GeoJSON regions. Time maps use one set of breaks across all periods. The catalogue remains at **43 options**.

## Try it

Open **Choropleth map → Map appearance → Try classified map example**. It creates fictional district data with negative values, genuine zero, a missing region and an unmatched outlier. Undo removes the example. These are illustrative shapes/values, not real administrative data.

Open **Classification & legend…** to select a method, automatic class count (2–7), manual thresholds, legend title, no-data colour/label and whether to show the no-data key. Preview before Apply; Cancel leaves the project unchanged, and Apply is undoable. Inactive class/break controls are disabled. The existing Show map legend switch controls visibility without clearing the classification.

Ready-to-open files: `examples/v325-choropleth-classification.json` contains four editable comparison maps and a dashboard; `examples/v325-classified-map.html` is standalone time playback. The generated comparison figure and exact quantile verification are in docs.

## Classification semantics

**Continuous** remains the default and blends the palette across the valid aggregate minimum/maximum.

**Equal interval** splits that aggregate range into the requested number of equal-width ranges. **Quantile** uses R-7-style linear interpolation at i / class-count on the sorted aggregate values. Duplicate thresholds and thresholds at the observed endpoints are removed, so tied/constant data may produce fewer classes. Identical values are never split between classes, and equal class counts are not guaranteed. A constant automatic dataset has one colour/key entry for all matched values.

**Manual breaks** accepts 1–6 finite, strictly increasing thresholds, producing 2–7 classes. Outer classes are unbounded: values below the first threshold and above the last remain coloured. The exact boundary rule is always **lower-inclusive, upper-exclusive**: < first, a ≤ value < b, then ≥ last. An observation exactly on a break goes into the upper class. Negative values and zero are ordinary numeric values; neither is converted to no data. Natural breaks/Jenks, standard-deviation methods, log scales and diverging midpoints are not included yet.

The methods operate on the chart's chosen **per-country/per-region aggregates**, not raw-row ranks. Sum, average, count, minimum and maximum are retained. Built-in country maps now exclude blank/whitespace/boolean numeric measures, matching the custom-region policy. Count counts matched records without requiring a measure column. These rules do not change source rows.

## Time and missing data

Time classification pools the valid **per-period aggregates** and computes one model for every snapshot. Each matched region/period contributes one aggregate; duplicates within a region/period first use the chart calculation. Missing regions, unmatched keys and invalid measures do not enter the break population. A combined multi-year regional total is never used in place of those period aggregates. Manual breaks remain exactly as supplied.

The example's pooled domain is −15…57 across 14 region/period aggregates. Four-class quantiles are **29.25, 37, 45.25**. The unmatched source value 9,999 is excluded. Region B 2020 is genuinely zero; Region E 2023 is missing and uses the no-data colour. Fixed breaks make colours comparable across periods, but do not imply equal counts within each period.

Cropping still changes drawing rather than the break population. Out-of-crop values can determine breaks. Published static snapshots of a time chart retain the timeline's model. Changing the source data recalculates automatic breaks when rendering/re-exporting; manual thresholds remain fixed.

## Legends and styling

Legends show the method, fixed/static scale status, exact interval rules and an optional no-data swatch. Set the title to include units or context; blank titles use the value field (Count uses Count of records) and method. No-data text defaults to No data. Long titles/threshold labels can be shortened visually; exact text remains in SVG titles. The legend uses a bounded responsive grid and reserves space below the plot. Very short choropleth canvases grow to fit a minimum plot plus legend, so actual export height may exceed the requested height. Boundary/source notes stay below the legend.

Valid manual per-region/country colours can override the quantitative class colours. The legend discloses when an applicable override exists; it cannot enumerate arbitrary custom colour semantics. Reset overrides when a purely quantitative legend is required. Existing palettes, labels, callouts, projections, framing and portable geometry remain available.

## Projects and delivery

Portable imports validate classification, breaks and legend fields. Captured story views save the break array and visual settings. Chart/dashboard/story snapshots, Publishing Studio and standalone time HTML retain them. Data values, joins, original rows and boundary geometry are unchanged. Classification applies to choropleths, not symbol/heatmap quantities. Existing local operation and input/export budgets remain; no dependency or remote service is added.

Method references reviewed:

- https://d3js.org/d3-scale/quantile — sampled domains and threshold inclusivity.
- https://d3js.org/d3-array/summarize — interpolated quantiles (R-7).
- https://pro.arcgis.com/en/pro-app/3.4/help/mapping/layer-properties/data-classification-methods.htm — classification concepts.

This implementation uses the explicit tie-collapse policy above; it does not claim identical break output to another tool.

## Run on Windows

Stop the previous server with Ctrl+C. Extract the ZIP, open the folder containing `index.html`, type `cmd` in File Explorer's address bar, then run:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5. Keep the same origin/port for saved projects and retain portable backups.

## Validation

New arithmetic/render/export tests and staged editor checks passed, alongside prior automated regression suites. They cover exact thresholds, tied/constant data, negatives/zero/missing/count, fixed timeline models, responsive legends, short-canvas fitting, manual overrides, portable/story/dashboard settings and executed HTML playback. Sixteen SVG fixtures were rasterised and representative narrow/light and wide/dark figures inspected. See `docs/QA_V325.md`.

A normal native Chromium launch failed before a page opened. Native browser/font/modal layout, Windows, screen readers and detailed real-world performance remain pending. DOM and SVG tests do not certify those behaviours.

**Next batch:** diverging colour scales and midpoint controls. Full Flourish geographic parity is not claimed.

## Earlier release notes

# OpenViz Studio V3.24 — projections and geographic framing

Maps now offer **projection selection, frame padding and staged custom geographic extents**. Coordinate-based Fit uses the shortest longitude span so nearby points either side of the antimeridian stay together. Labels, symbols, callouts and locator extents use the same map frame. The catalogue remains at **43 options**.

## Try it

Open **Choropleth map** or **Proportional-symbol map → Map appearance → Try projection example**. It creates the fictional regional example in spherical cylindrical equal-area with padding, authored labels and a callout. Undo removes it.

In Map appearance choose **Projection** and **Frame padding (%)**. Open **Set custom geographic extent…** to enter west/south/east/north, enable the custom extent checkbox, then Preview before Apply. Cancel leaves the project unchanged; Apply is undoable. Restore automatic framing removes the staged override; Apply commits that reset. A custom extent overrides the selected built-in viewport or imported region bounds.

Ready-to-open files:

- `examples/v324-projections-and-framing.json`: editable regional map plus three world projection examples and a comparison dashboard.
- `examples/v324-projected-regional-map.html`: standalone regional time player.
- `docs/v324-projection-comparison.png`: generated world comparison figures.

## Projection choices

**Local equirectangular** remains the default. It retains the previous linear longitude/latitude display, with longitude scaled by the cosine of the frame's middle latitude (minimum factor 0.15). It is not equal-area.

**Mercator (spherical)** uses longitude in radians and y = log(tan(π/4 + latitude/2)). It enlarges high latitudes and is not equal-area. Display latitude is limited to ±85.05112878 degrees: geometry is clipped and marks beyond that range are omitted. An entirely polar extent can therefore show no data geometry even though records still exist. This is a spherical display implementation, not a full ellipsoidal CRS transformation or a navigation tool.

**Cylindrical equal-area (30°)** uses x = longitude × cos(30°), y = sin(latitude) / cos(30°), with angular inputs in radians and one uniform screen scale. It preserves area on the mathematical sphere while distorting shapes. It is not an ellipsoidal ground-area calculator. Boundaries remain the original simplified polygon vertices joined by rendered straight segments; no exact geodesic/curved-edge densification is performed. Pixel polygon areas are therefore approximations.

Projection conventions reviewed against the official PROJ documentation:

- https://proj.org/en/stable/operations/projections/cea.html
- https://proj.org/en/stable/operations/projections/merc.html

## Framing, cropping and wrapping

Padding accepts 0–20 percent of the shorter plot dimension, in addition to existing symbol/region safety margins. It adds display space without changing geographic bounds or locator focus. Projection fitting preserves a uniform x/y scale; land is not stretched to fill the canvas.

Custom coordinates use WGS84 degrees, south < north within ±90. West is −180…180; east may also be an unwrapped longitude up to 540. East less than west crosses the antimeridian; equal west/east is invalid. The unwrapped span must be greater than zero and no more than 360 degrees. For a full longitude span use west −180, east 180. Overridden extents may crop any part of a map, including the full imported boundary file.

Polygons are unwrapped and clipped to the geographic frame before projection. Holes and multipart regions remain supported. Off-frame symbols, name anchors and callout points are omitted. The locator displays the effective frame, including Mercator's latitude limit, and keeps its own simple world projection. Padding does not change it. Coordinate Fit uses the shortest circular longitude span and padding, fixed across all periods when time playback is enabled. Country choropleths continue to use selected world/regional viewports or custom extents; this release does not add automatic country-boundary fitting.

Cropping is a display operation: it does not filter or rewrite the dataset, recalculate regional values, or reset quantitative colour/size domains. Values outside the crop may still determine those scales. Heatmaps include only valid points within the displayed geographic frame in their density kernel; density remains relative and can change with framing. Existing capped point/heatmap limits remain.

## Authoring and delivery

Manual label/callout text centres remain plot-relative; their geographic anchors reproject with the map. Custom symbol overrides still use WGS84 coordinates and the original boundary extent eligibility rule. Framing does not modify source coordinates or boundary geometry. Review manual positions after changing projection or cropping because text may overlap differently or a geographic anchor may disappear.

Projection, padding and custom extents persist in portable JSON and captured story views. Invalid imported frame settings are rejected. Chart/dashboard/story snapshots, Publishing Studio and standalone time HTML retain the settings; complete time snapshots share geometry and use fixed framing/domains. No added shape interpolation, pan/zoom, globe rendering or remote tiles. Existing input/export budgets and topology caveats remain.

Built-in boundary coverage is unchanged; choosing a full-world extent does not add missing geography. The bundled country extract omits Antarctica. Custom GeoJSON remains available for supported additional regions. The illustrative examples do not assert administrative accuracy.

## Run on Windows

Stop the previous server with Ctrl+C. Extract the ZIP, open the folder containing `index.html`, type `cmd` in File Explorer's address bar, then run:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5. Keep the same origin/port for saved projects and retain portable backups.

## Validation

New projection/framing and extended editor tests passed, alongside all prior automated regression suites. They cover forward equations and equal-area ratios, polar limits, wrapped coordinate fitting, clipping, both regional types/themes/widths/time domains, staged crop/Cancel/Apply/Undo, portable/story/dashboard settings and executed standalone HTML. Eighteen SVG fixtures were rasterised; representative world and narrow regional figures were inspected. See `docs/QA_V324.md`.

A normal native Chromium launch failed before a page opened. Native browser/font/modal layout, Windows, screen readers and detailed real-world geometry performance remain pending. DOM and SVG tests do not certify those behaviours.

**Next batch:** choropleth classification and improved legend controls. Full Flourish geographic parity is not claimed.

## Earlier release notes

# OpenViz Studio V3.23 — authored map positions and callouts

Maps now have a staged **positions and annotations editor**: place or hide individual names, supply display anchors for custom-region symbols, and add coordinate-based callouts. Changes are previewed before Apply and undoable. Settings persist in portable projects, captured story views and exports. The catalogue remains at **43 options**.

## Try it

Open a **Choropleth map** or **Proportional-symbol map → Map appearance → Try authored map example**. It creates a fictional regional example with a manual name position and callout; the symbol version also has a supplied display anchor. Undo removes the example. The shapes and values are illustrative, not real administrative boundaries.

For an existing map, open **Map appearance → Position labels, symbols & annotations…**. Choose the target name, enter its centre X/Y as percentages of the map plot, optionally hide it, and click **Set label position / visibility**. Reset that label to return to automatic placement. Setting manual names enables map names on Apply. These are numeric controls; direct dragging on the canvas is not part of this batch.

Custom regional proportional-symbol maps additionally offer **symbol longitude / latitude**. Set the anchor to reposition its display symbol; reset to restore the representative interior point. Built-in country/coordinate symbol maps retain their source-derived locations and do not offer this override. All map types can add, edit and remove plain-text callouts with a geographic point and a label centre expressed as plot percentages.

Stage each change using its Set / Add / Save button, inspect the saved-period preview, then choose **Apply map edits**. Cancel leaves the chart untouched. Reset all removes staged label overrides, anchors and callouts; Apply commits that reset as one undoable edit. Ready-to-open files: `examples/v323-authored-map.json` and `examples/v323-authored-map.html`.

## Position semantics

Manual name centres scale with the plot size and are clamped to keep the rendered text box inside it. They take priority over automatic labels. Authors can intentionally overlap manual labels, symbols or the locator; narrow layouts must be inspected. Hidden names suppress the label, not the region or its values. There are at most 80 stored label overrides and 80 visible map names. Names remain shortened when necessary; full text remains in titles/descriptions. Overrides use the map's exact rendered ID: reviewed boundary keys for custom regions, canonical country IDs for built-in choropleths, and place/entity IDs for ordinary symbols. Unmatched IDs are retained but have no effect. Review/reset them when replacing boundaries, switching datasets or changing identity mappings.

A supplied regional symbol anchor uses WGS84 longitude ±180 / latitude ±90. It may be outside the region polygon, but must lie inside the full imported map extent to take effect; otherwise the renderer falls back to automatic placement. The chosen position is a **display anchor, not an observation coordinate**. Values, circle areas, colours, aggregation, fixed time scales and imported geometry are unchanged. Label leaders follow the displayed symbol position. Up to 2,000 supplied anchors are supported.

Callouts use one WGS84 geographic point and a label centre in plot percentages. Their point, leader and text box render on the map; a point outside the displayed plot is omitted. Callouts are static author text applied to every period, including periods without matching data. Up to 20 callouts and 240 characters each are supported. They are single-line visual labels shortened as needed, with full text in the SVG title and accessible description. No HTML executes. Callouts are drawn over other map furniture and may cover important detail; placement is the author's responsibility. They do not automatically attach to a data row or update their wording from values.

## Projects, stories and output

Portable project imports validate the bounded position/anchor/callout fields. Source rows and boundary files are never rewritten. Captured story views save these visual edits; older saved views without these fields continue to use the linked chart's authoring. Use linked chart or recapture if a scene should follow later changes.

Chart/dashboard/story snapshots, Publishing Studio and standalone time HTML preserve the edits. Existing responsive layouts recompute plot-relative text centres; geographic anchors use the renderer's current projection/framing. Time playback uses the same authored positions and notes in each complete snapshot, with no added motion interpolation. Existing geometry, payload limits, projection/topology caveats and local-only operation remain. Position overrides do not change the map extent or the world locator's focus.

## Run on Windows

Stop the previous server with Ctrl+C. Extract the ZIP, open the folder containing `index.html`, type `cmd` in File Explorer's address bar, then run:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5. Keep the same origin/port for saved projects and retain portable backups.

## Validation

New authoring and staged editor checks passed, along with the prior automated regression suites. They cover positions/visibility, anchors and fallback, unchanged quantities and source data, escaping/limits, portable validation, saved story settings, chart/dashboard publication and executed time HTML. Twelve SVG fixtures were rasterised and representative narrow/light and wide/dark frames inspected. See `docs/QA_V323.md` and the included contact sheet.

A normal native Chromium launch failed before a page opened. Native modal/font layout, Windows, screen readers and detailed real-world map performance remain pending. DOM and SVG tests do not certify those behaviours.

**Next batch:** projection options and improved geographic framing. Full Flourish geographic parity is not claimed.

## Earlier release notes

# OpenViz Studio V3.22 — map labels and world locators

Maps now have **optional place/region names** with bounded label placement and an optional **world locator inset**. Both settings travel with portable projects, story views and publications. This expands the existing geographic templates; the catalogue remains at **43 options**.

## Try it

Open a **Choropleth map** or **Proportional-symbol map → Map appearance → Try labels and locator example**. It creates an editable fictional regional map with both features enabled; Undo removes the example. These shapes are illustrative, not real administrative boundaries.

For your map, enable **Show place / region names** and/or **Show world locator inset** in Map appearance. Adjust map label size/colour and locator extent colour. Both are off by default, preserving existing map output. Heatmaps support the locator but do not offer the name-label control.

Ready-to-open files: `examples/v322-map-labels-locator.json` (portable project) and `examples/v322-map-labels-locator.html` (standalone time player).

## Names and placement

Custom regional maps use the chosen boundary label property, falling back to the reviewed join key. **All custom regions** are eligible, including regions without values: a name identifies geography, not the presence of data. Built-in choropleths label matched countries; ordinary symbol maps label places. Custom anchors use the representative interior point of the largest polygon component from V3.21. Built-in country labels use their existing approximate country centres.

Labels try a small set of deterministic positions inside the plot. They avoid previously placed label boxes, the locator and conservative symbol boxes; moved names use leader lines when separated from their anchor. Labels use an outline for contrast. Size is clamped to 9–18 pixels, names may be shortened to fit, and at most 80 labels are shown, in source/candidate order. A name with no available position is omitted. Full names remain in mark tooltips/accessibility descriptions and label titles; no source rows or regions are removed. Label text is decorative and does not add duplicate keyboard targets.

Placement uses estimated Arial/sans-serif text metrics, not measured browser glyph bounds. It is a bounded readability aid, not a complete cartographic labelling engine. Lines can cross other features; manual offsets, label priorities, editing individual names and supplied symbol anchors are not included yet. Built-in map anchors need not lie within every visible country fragment. The new option takes precedence over legacy symbol show-labels rendering while enabled.

## Locator semantics

The inset uses the bundled simplified Natural Earth world geometry and highlights the **displayed map extent**, not the distribution of observations or legal boundaries. Custom maps use their full imported bounds; built-in maps use their selected viewport or fixed timeline fit. Extents crossing the antimeridian are split into two focus rectangles. Very small extents have a minimum three-pixel marker, enlarged for visibility. The inset is omitted when the plot is narrower than 140 pixels or shorter than 110 pixels.

The inset sits at the lower right and covers part of the underlying map; turn it off when that hides important detail. It stays within the existing plot area and does not resize the map. The world inset is a simple geographic context view, not pan/zoom, a detailed regional context basemap, a new locator template or a scale/distance tool. No tiles or network requests are added.

## Projects and exports

Label and locator settings persist in portable JSON and captured story views. Chart/dashboard/story snapshots and Publishing Studio include them; responsive static HTML recomputes layout for its existing narrow/medium/wide SVG variants. Time HTML retains labels/insets in each complete snapshot and reuses their geometry. Existing fixed map extents and colour/size domains remain. Built-in label eligibility may change when a period's matched countries/places change; no label-motion interpolation is added. Existing payload budgets still apply; complex maps and many scenes can hit them sooner.

V3.20/V3.21 join rules, non-negative symbol aggregation, geometry limits, projection and topology caveats remain unchanged. Labels do not imply exact observation positions or administrative accuracy. Everything remains local; source data and imported boundaries are unchanged.

## Run on Windows

Stop the previous server with Ctrl+C. Extract the ZIP, open the folder containing `index.html`, type `cmd` in File Explorer's address bar, then run:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5. Keep the same origin/port for saved projects and retain portable backups.

## Validation

New label/locator tests and extended editor checks passed, along with all prior automated regression suites. Tests cover collision boxes, label caps/escaping, dateline and tiny extents, both regional modes/themes/widths, built-in maps, portable/story/dashboard output and executed time HTML. Twelve map SVGs were rasterised; representative narrow/light and wide/dark frames were visually inspected. See `docs/QA_V322.md` and the included frame contact sheet.

A normal native Chromium launch failed before a page opened. Native browser layout/font metrics, Windows, screen readers and detailed real-world map performance remain pending. DOM tests and rasterised SVG figures do not certify them.

**Next batch:** manual map label/symbol positioning and geographic annotations. Full Flourish geographic parity is not claimed.

## Earlier release notes

# OpenViz Studio V3.21 — regional proportional symbols

Proportional-symbol maps now work with **custom GeoJSON regions**, using the same explicit boundary join review as choropleths. Repeated records aggregate by region, circle area shows value, and time playback keeps symbol positions and its size scale fixed. The catalogue remains at **43 options**; this expands the existing map template.

## Try it

Open a **Proportional-symbol map → Map appearance → Try regional map example**. The example uses fictional districts, including a hole, a detached island, zero, missing data and an unmatched row. These are not real administrative boundaries.

To use your boundaries, choose **Import custom region boundaries…** in Map appearance. Select a unique boundary property/Feature ID, the matching data column and an optional name property, then review counts and the combined-period preview before Apply. The process remains staged and undoable. Existing custom choropleths can switch **Map type** to Proportional-symbol map while retaining their asset and join; review the different value rules below.

Open `examples/v321-regional-symbol-map.json` for an editable portable example, or `examples/v321-regional-symbol-map.html` for standalone time playback. The separate V3.20 illustrative GeoJSON/CSV files are also included: join boundary `code` to data `Region`.

## Quantities and placement

Regional symbols use **sum, average, count, minimum or maximum** per matched region. Non-count calculations exclude blank, non-finite, boolean and **negative source measures** before aggregation; they do not take absolute values or offset negative totals. Count counts matched records without requiring a value column. This differs from choropleths, which support negative values. The Data tab explains the calculation; Map appearance also exposes the regional calculation.

Circle area is proportional to value, using radius = maximum radius × square root(value / maximum). Zero has zero area; an absent/invalid region has no circle. The minimum radius setting is ignored and hidden in custom mode. Time playback fixes the maximum to the largest per-period regional aggregate, excluding unmatched/invalid rows. The ordinary point entity field and coordinate bindings do not apply: repeated region/period records deliberately aggregate. Built-in coordinate/country symbol maps retain their existing observation rules.

Symbol centres are deterministic **representative interior points of the largest polygon component**, chosen by a bounded scanline search that accounts for holes. They are not geographic centroids, observation locations or guaranteed best label positions. All boundary parts remain visible. Circles may overlap each other or extend over holes/coastlines: centres are placed inside, circles are not clipped to their regions. There is no collision solver, manual anchor editing or supplied-coordinate anchor mode yet. Symbols draw largest first so smaller symbols remain visible above them. Review detailed real-world geometry before sharing.

The base symbol colour and optional per-region overrides stay consistent across periods. Maximum radius and opacity remain adjustable. Region outlines, water colour, legend and optional visible boundary credit are retained. Full credit remains in SVG metadata.

## Data and delivery

The V3.20 exact/explicit-trim join rules, geometry validation and input limits still apply: WGS84 Polygon/MultiPolygon FeatureCollection, 8 MiB, 2,000 features, 150,000 positions, 10,000 rings. No topology repair or complete overlap/hole validation is performed. Extent uses a fitted local equirectangular view, not equal-area. Boundary assets are immutable and embedded in portable projects; source rows are unchanged.

Chart/dashboard/story snapshots and Publishing Studio include regional symbols. Standalone interactive chart HTML includes the time player and shares boundary paths; the existing 6 MiB playback budget applies. Static custom-map HTML omits the generic category filter and retains the 24 MiB static SVG budget. Stories retain base-chart geometry and join settings. Existing dashboard normalisation limitations remain; IDs that collide cannot originate linked selections. No hosting, remote data refresh or new export animation pipeline was added.

## Run on Windows

Stop the previous server with Ctrl+C. Extract this ZIP, open the folder containing `index.html`, type `cmd` in File Explorer's address bar, then run:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5. Use the same origin/port for saved projects and keep portable backups.

## Validation

The new regional-symbol geometry/arithmetic/time/export suite and extended editor Apply/Undo checks passed, along with prior automated regression suites. Twelve SVG fixtures cover narrow/wide, both themes and all three example periods; representative PNG renders were visually inspected. See `docs/QA_V321.md`.

A normal native Chromium launch failed before a page opened. Native browser layout, Windows, file-picker behaviour, detailed real-world performance and screen-reader validation remain pending. DOM and SVG tests do not certify them.

**Next batch:** map labels and locator views, including clearer regional identification and better context for small places. Full Flourish geographic parity is not claimed.

## Earlier release notes

# OpenViz Studio V3.20 — custom regional maps

Choropleth maps now accept **local GeoJSON boundaries** with a staged join review, preserved holes and separate islands, and optional time playback. Geometry is embedded in portable projects and rendered into standalone publications. The catalogue remains at **43 options**; this expands the existing choropleth template.

## Try it

Open a **Choropleth map → Map appearance → Import custom region boundaries…**. Choose a local `.geojson` or `.json` file, select a unique boundary property (or Feature ID), choose the data join column and optional label property, then inspect the match counts and preview before choosing **Use boundaries and join**. Cancel leaves the project unchanged; Apply is undoable. Data rows are never rewritten.

For a ready-made demonstration, choose **Try regional map example** in Map appearance. It adds fictional districts and three periods, including a polygon hole, a detached island, a genuine zero, a missing region and an unmatched source row. These are illustrative shapes, not real administrative boundaries.

Ready-to-open examples:

- `examples/v320-regional-map.json` — portable editable project.
- `examples/v320-illustrative-districts.geojson` and `examples/v320-regional-data.csv` — separate import files; join boundary `code` to data `Region` and label with `name`.
- `examples/v320-regional-map.html` — standalone time-enabled map.

## Joining and values

**Exact displayed text** is the default: leading zeros and case matter. Optional **Trim + case-insensitive NFC text** must be selected explicitly. No fuzzy matching or inferred country aliases are used. Boundary keys must be present and unique under the selected rule; merge disconnected parts into a MultiPolygon when they represent one region.

The review reports regions with values, unmatched data rows, invalid numeric rows and regions without values. Its preview combines all source periods; time playback calculates each period separately and fixes the colour range across those per-period aggregates. Unmatched rows never affect that range. Regions without values remain grey; zero is a valid observation. Sum, average, count, minimum and maximum are supported. Count does not require a measure column. Manual region colours can override the quantitative scale.

The complete imported boundary extent remains fixed across periods. Labels are available through tooltips and accessible mark descriptions; on-map text labels are not included yet. The existing **Show boundary source note** toggle controls the visible credit, while source information remains in SVG metadata. Supply appropriate credit and follow the boundary provider's terms.

## Supported geometry and limits

Use a WGS84 longitude/latitude GeoJSON FeatureCollection containing Polygon and MultiPolygon features. Limits are 8 MiB, 2,000 features, 150,000 positions, 10,000 rings and 64 properties per feature. Coordinate positions must contain two or three finite numbers, within longitude ±180 and latitude ±90; altitude is discarded. Nested/unsupported properties are discarded and reported. Projected coordinates, legacy CRS declarations, TopoJSON, shapefiles and remote boundary URLs are not supported.

Rings must be explicitly closed and non-degenerate. Structure and coordinate ranges are validated; **full topology, self-intersection, hole containment and overlap checks are not performed**. Inspect your imported shapes. The regional renderer fits a local equirectangular view, preserving holes and multiparts; it is not equal-area. Longitude uses the shortest circular span, including antimeridian examples; extents wider than 300 degrees are rejected. Use built-in boundaries for world maps. The ordinary world viewport selector does not apply to custom regions.

## Projects and publishing

Portable JSON includes the geometry, reviewed join and credit. Imported project geometry is validated. Story scenes share the base chart's boundary configuration; invalid assets or join keys block story publication. Regional snapshots work in charts, dashboards and stories, with time playback in standalone interactive chart HTML. Static custom-map interactive exports omit the generic category dropdown to avoid duplicating large geometry and ambiguous joins. Time-map exports reuse boundary paths. Existing time payload budgets still apply; static custom interactive SVG content has a 24 MiB budget.

Local files and exported HTML contain the included geometry, properties and rendered data. Review them before sharing. Boundary files are not fetched or refreshed remotely. Custom regions are currently available for choropleths only. Dashboard mark selection is disabled when IDs collide under the existing shared filter normalisation; this release does not introduce independent geographic dashboard joins.

## Run on Windows

Stop the previous server with Ctrl+C. Extract the ZIP, open the folder containing `index.html`, type `cmd` in File Explorer's address bar, then run:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5. Keep the same origin/port for saved projects; export portable backups before clearing storage or moving devices.

## Validation

Regional geometry/join/arithmetic/export tests, executed HTML time controls, editor file/apply/cancel/Undo checks and all prior automated regression suites passed. Twelve SVG fixtures cover two widths, both themes and three periods; representative PNG renders were visually inspected. See `docs/QA_V320.md` and the included frame contact sheet.

A normal native Chromium launch was attempted and failed because the browser closed before a page opened. Native browser layout, file-picker behaviour, Windows, screen readers and large real-world boundary performance remain pending. DOM tests and rasterised SVGs do not certify those behaviours.

**Next batch:** regional proportional-symbol maps, followed by improved map labels and locator views. Full Flourish geographic parity is not claimed.

## Earlier release notes

# OpenViz Studio V3.19 — scroll stories and reading view

Story Studio now publishes **scroll-driven chapters**, with narrative text, chapter navigation and a complete no-JavaScript reading view. It uses the saved scene views and conservative transitions from V3.18. The chart catalogue remains at **43 options**.

## Try it

Open **Story Studio → Try scroll story**. This creates an illustrative three-chapter example, leaving existing charts and datasets unchanged. Undo removes the example. In the inspector choose **HTML story format → Scroll story / chapters**, then edit the story introduction and each scene’s chapter title, narrative text and chart description.

Use **Preview chapters** in the toolbar, or **Preview scroll story / Preview reading view** in the inspector. Previews contain the actual exported HTML in an isolated frame. The reading preview also offers **Download reading HTML**. The regular Export story → HTML option follows the story’s selected format; GIF/video continue to use the animation timeline.

Ready-to-open examples:

- `examples/v319-scroll-story.json` — portable project with editable chapters and saved views.
- `examples/v319-scroll-story.html` — self-contained scroll story.
- `examples/v319-reading-story.html` — full reading article with no script.

## Reading and scrolling

On larger screens, the chart stays beside the narrative and follows chapter position. Chapter links and Previous/Next controls are available in the chart panel; **Reading view** shows every chapter’s full chart in document order. Explicit navigation focuses the chapter heading. Passive scrolling does not move focus; chart updates pause while focus is inside the current figure.

Small or short viewports, narrow publication containers and environments without IntersectionObserver use the reading layout. Without JavaScript, all chapter text, descriptions, figures and native chapter links remain available. Print styles show the complete figures. Reduced motion disables interpolated scrolling transitions and switches directly between complete states; it does not block reading or navigation.

**Transitions while scrolling → Use scene transitions** is optional. Each incoming overlap has nine pre-rendered samples generated by the same compositor as animation playback. Matching-mark rules and crossfade fallbacks remain those of V3.18. Scrolling backward reverses the selected samples. Intermediate geometry is a visual effect, not an additional observation. With **Switch complete views**, only the complete chapter snapshots are used.

Chapter text is plain text: blank lines create paragraphs and single line breaks are preserved. Limits: 120 characters for titles, 4,000 for chapter text, 1,000 for chart descriptions and 2,000 for the introduction. Descriptions should explain the figure for readers who cannot see it; the example includes authored descriptions. These features are not a screen-reader or WCAG certification.

## Publishing and data

Publishing Studio follows the selected story format. For a scroll story, **Interactive** exports scrolling plus Reading view; **Static** exports all chapters as a script-free reading article. Animation-player stories retain their previous publishing behaviour. Narrative iframe snippets reserve a taller viewport (minimum 600 pixels) and may scroll inside the frame; automatic parent-page height resizing is not included. Host the exported HTML yourself before generating a public HTTPS embed.

Every chapter uses the authoritative scene resolver for saved periods, filters, styling and linked data. Missing periods or invalid saved views still block publication. Scroll export never rewrites source rows or chart settings. Published files contain rendered values and all included chapter/transition views; inspect them before sharing. Source data is not refreshed remotely; re-export after updates.

The scroll publication budget is 24 MiB for rendered chapter/frame content and escaped payload. Turn off scroll transitions or reduce scenes/images if exceeded. Existing 24-scene and animation export limits remain. Reading figures preserve the story’s 960 × 540 geometry and scale with the page; they do not gain per-chart mobile reflow in this release.

## Run on Windows

Stop the previous server with Ctrl+C. Extract the ZIP, open the folder containing `index.html`, type `cmd` in File Explorer's address bar, then run:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5. Keep the same origin/port for saved projects; export portable backups before clearing storage or moving devices.

## Validation

New model/editor/executed-runtime checks passed for chapters, scroll mapping, navigation/focus, direct chapter links, reading toggle, reduced-motion/mobile/no-observer fallbacks, SVG ID isolation, plain-text escaping, portable projects, publishing and Undo/source safety. All prior regression suites passed. Complete chapter SVGs were rasterised with CairoSVG and inspected; a contact sheet is included in docs.

A normal native Chromium launch was attempted but its executable is missing in this environment. Native sticky/print layout, Windows, real screen readers, browser performance and video recording remain pending. DOM/geometry mocks and CairoSVG figures do not certify browser layout.

**Next batch:** custom GeoJSON boundaries and regional choropleth maps.

## Earlier release notes

# V3.18 — saved story views

Story Studio can now keep **different saved views of the same chart in different scenes**. This release also adds matching-mark transitions for compatible views, clearer caption transitions and improved standalone story navigation. The chart catalogue remains at **43 options**.

## Try it

Open Story Studio and choose **Try saved-view example**. The example adds one illustrative dataset, one scatter chart and a three-scene story. Each scene saves a different observed period; the base chart stays on its original period. Next/Previous scene buttons let you compare them. Undo removes the example.

Or open `examples/v318-saved-view-story.json` as a portable project. `examples/v318-saved-view-story.html` is a self-contained player; `docs/v318-saved-view-story.gif` shows the exported animation.

## Save a scene view

Select a scene → **Scene view → Save current chart view**. Edit its title/subtitle, choose an observed time/race period, set value-axis bounds where supported, or choose a map view. **Filter this scene’s data** selects values from a mapped category/entity role. A filter changes only that scene, not the dataset or other scenes. Up to 100 exact displayed filter values are supported; at least one must be selected in the editor.

The view saves presentation settings, selected point colours, its named period and optional filter. It does **not** freeze or copy source rows, chart type, field connections, calculations, image assets or race captions. Those stay linked to the original chart. Periods are stored by label, not numeric position, so reordering data cannot silently change which period a scene shows. Column-role filters survive column renaming when the linked chart mapping is updated.

Use **Replace view from linked chart** to recapture settings and reset the scene filter. **Use linked chart view** removes the saved view and follows the chart again. These operations, view edits, filter changes, duplication and scene ordering support Undo. Changing a scene’s source chart clears its old saved view and focus. Existing stories without saved views continue to follow their linked charts.

Unavailable periods, missing filter fields, empty filter results and invalid saved axis ranges show a message and block export/publication. They never silently choose a different period. Updating source values still changes the rendered story; review captions and conclusions after data or calculation changes. A saved view is not a data backup.

## Match data marks

Choose **Transition → Match data marks** on an incoming scene. Two views of the **same linked chart** can match when they have identical plot bounds and axes and 1–400 unique keyed rectangle/circle marks. Supported types: column, horizontal bar, dot, scatter and bubble. Shared marks move/resize between their endpoint geometry; unmatched marks fade at their observed position. No joins by row index, path morphing, moving axes or invented zero positions are used.

The inspector states whether matching is available. Different axes/layouts/types, duplicate keys, custom transforms or incompatible ending poses use a crossfade fallback. The outgoing reveal must finish before the overlap. Clear focus and use the Instant motion preset if needed. Matching-mark scenes display their complete views; their incoming layer reveal is skipped. Existing crossfade/slide/wipe/zoom/cut transitions remain available.

Intermediate geometry is a visual transition, not an additional data observation. Source values are unchanged. Caption space is reserved consistently across the story, and outgoing captions fade out before incoming captions fade in so the text does not overlap.

## Exports and playback

Preview, GIF, video and Publishing Studio use the same scene-specific source builder. Standalone HTML includes a complete first view without JavaScript, Previous/Next scene controls, scrubbing and Play/Pause. It starts paused, blocks animated playback under reduced motion and pauses when the tab is hidden. Scene boundary/settled frames are retained in the sampled timeline. HTML frame payload is capped at 24 MiB; reduce scenes or embedded images if exceeded.

The story GIF encoder now uses variable delays within the declared story duration, including a final-state frame, instead of adding a full extra frame delay. Existing optional smooth-loop blending remains available. Native browser canvas/video recording is still unverified here; inspect recorded MP4/WebM on your target machine. Stories remain 960 × 540, with up to 24 scenes. Existing export dialog duration and frame-count limits remain in place.

## Run on Windows

Stop the previous server with Ctrl+C. Extract the ZIP, open the folder containing `index.html`, type `cmd` in File Explorer's address bar, then run:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5. Keep the same origin/port for saved projects; export portable backups before clearing storage or moving devices.

## Validation

New model/editor/runtime checks passed for independent scene views, filters, named periods, source safety, Undo, portable projects, column renaming, matching/fallback and reduced-motion scene navigation. Prior regression suites passed. The actual compositor/GIF pipeline generated a 21-frame, 480 × 270 animation, decoded with Pillow: 3,300 ms total, changing frames and the expected saved views. SVG frames were rasterised with CairoSVG and visually inspected. See `docs/QA_V318.md` and the included contact sheet.

Native browser layout, Windows, screen readers and MP4/WebM recording remain pending. DOM and CairoSVG checks do not certify native browser behaviour. No complete Flourish parity is claimed.

**Next batch:** scroll-driven stories with chapter navigation and accessible reading fallbacks.

## Earlier release notes

# V3.17 — spatial time controls

Time snapshots now work on **scatter plots, bubble charts, choropleth maps and proportional-symbol maps**, alongside the existing column, horizontal-bar and dot charts. The catalogue remains at **43 chart options**; seven types now support time snapshots.

## Try it

Choose one of the four chart types, then open **Preview → Time controls → Try an editable time example**. This adds an illustrative dataset and chart to the current project; existing datasets are unchanged and Undo removes the example. Or open `examples/v317-spatial-time.json` for all four views. The companion CSV contains illustrative values and approximate locations, not live country indicators.

For your own data, enable Time snapshots and choose a separate period column. Scatter/bubble plots also require an entity ID/name column. Proportional-symbol maps can use their place/country field as identity or a separate ID, especially for coordinate observations. Use one record per entity and period; duplicate pairs stop playback and report example IDs rather than guessing how to combine points. Country-centroid identity uses canonical country joins; explicit coordinate IDs retain exact values.

Play/Pause, Previous/Next, integer scrubbing, speed and loop controls remain shared. Playback starts paused and respects reduced motion. **Use period for static exports** saves the current period, with Undo; exploration never edits source rows.

## Comparable scales and identity

- **Scatter:** fixed X/Y ranges from valid observations across the complete timeline, with stable colours by entity ID.
- **Bubble:** fixed X/Y and size maximum; circle area is proportional to the supplied size. Zero has zero area. Minimum-radius floors are overridden for these time views.
- **Choropleth:** fixed colour range based on per-period canonical country aggregates, including the selected sum/average/count/min/max calculation. Values are not pooled across periods. Countries without values stay unshaded.
- **Proportional symbols:** fixed geographic view and area scale, with stable entity colours. Fit uses all included periods. Responsive radius limits and map padding keep in-view symbols from being cut off at narrow edges.

Point snapshots do not aggregate observations. Missing/invalid points disappear without interpolation, carry-forward or invented zero values. Rows without IDs or periods are excluded and reported. Duplicate ID/period pairs block playback, even when one duplicate has invalid measures. Entity colours stay attached to IDs through reordered rows and changing values; colours are drawn from a finite palette and can repeat. Click a point to override its colour across periods.

Timeline scales override manual axis bounds. Geographic views remain fixed even when a period has no observations. Numeric periods and valid ISO dates sort; other labels use first appearance. Each step has equal playback duration. These are independent snapshots, not continuous motion or inferred trajectories.

## Exports and limits

Standalone interactive chart HTML retains playback. Static SVG/PNG/PDF, dashboard cards and story scenes use the saved period. Map HTML reuses shared boundary geometry across frames. The four ready-to-open `examples/v317-*-time.html` files are self-contained, with no remote scripts or map tiles.

Limits: 60 periods, 30,000 source rows, 400 valid observations per period for scatter/bubble/symbol time views, and 6 MiB for the embedded frame payload including the first visible snapshot. Player code/styles and browser runtime overhead are outside that payload budget. Heatmaps are not time-enabled. Ordinary time snapshots do not yet export timeline GIF/video; use interactive HTML for playback. The separate bar/line race GIF/video tools are unchanged.

Interactive files contain every included period's plotted observations/aggregates. Optional source tables contain bound source records before filtering; review them before publishing. Unbound source columns are not embedded by these chart players when the source-table option is off. Entity/time fields participate in reviewed source switching, column rename/removal and refresh dependencies.

## Run on Windows

Stop the previous server with Ctrl+C. Extract the ZIP, open the folder containing `index.html`, type `cmd` in File Explorer's address bar, then run:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5. Keep the same origin/port for existing saved projects. Export portable backups before clearing storage or moving devices.

## Validation

New model, SVG/XML, editor and executed standalone-runtime tests passed for fixed domains, area ratios, stable IDs/colours, duplicates, missing values, canonical country aggregation, responsive symbol containment, shared geometry restoration, escaping, portable projects and source safety. Prior 43-chart, race, publishing, dashboard, data, storage and performance regression suites passed. Forty-eight SVG fixtures were rasterised with CairoSVG, with narrow/wide and light/dark views inspected; see `docs/v317-time-controls-preview.png` and `docs/QA_V317.md`.

Native browser layout, Windows, screen readers and MP4/WebM recording remain unverified in this environment. DOM/CairoSVG checks do not certify those behaviours.

**Next batch:** richer storytelling with saved chart states and transitions between scenes.

## Earlier release notes

# V3.16 — line races and time snapshots

The catalogue now has **43 chart options**. This batch adds a line-chart race and time playback for column, horizontal-bar and dot charts.

## Line chart race

Home → Templates → search **Line chart race** → Try example. Preview includes Play/Pause, Previous/Next, scrubbing, speed and loop controls. In Template options, choose the saved period, maximum lines, aggregation, missing policy and period captions. Race appearance controls line width, endpoint images and value labels; the category manager assigns colours, flags and local images.

Lines reveal observed trajectories, with a fixed signed scale across all included periods. Numeric/ISO-date X spacing reflects distance; playback advances through equally timed observation steps. Other period labels follow source order and equal X spacing. Only adjacent observations are interpolated. Missing values leave gaps and hide the current endpoint; the explicit zero policy fills absent entity–period pairs without changing source rows. Invalid numeric records are excluded, not zero-filled. Dotted leader lines connect endpoints to spaced labels; they are not future observations.

Up to 15 entities are selected by highest observed peak across the whole included range, with alphabetical ties. This selection stays fixed during playback. The existing limits of 120 periods and 100 source entities apply; filter larger datasets first. Short canvases may require increasing height. Narrow layouts truncate endpoint labels, with complete names/values retained in accessible descriptions. Circle crop and bar-specific styling do not apply to line endpoints; their images preserve full proportions.

Static SVG/PNG, dashboard cards and story scenes use the saved period. Interactive chart HTML retains playback; dedicated Race GIF/video renders the timeline using the same geometry. Selected-range exports recompute the scale and peak selection from that range. Browser-native MP4/WebM remains unverified here.

## Time controls on comparison charts

On a column, horizontal-bar or dot chart, open **Preview → Time controls**, choose a separate time column and enable **Time snapshots**. Use the same play, step, scrub, speed and loop interactions. Playback is transient; click **Use period for static exports** to save a period, with Undo support.

Each period is an independent snapshot, aggregated by the existing chart calculation. The value scale is fixed across all periods and overrides manual value-axis bounds. Absent categories are omitted; there is no interpolation, zero fill or carry-forward. Numeric/date periods sort; other labels follow source order. Limits: 60 periods, 30,000 source rows and 6 MiB pre-rendered playback markup. Static/dashboard/story output uses the saved period; interactive chart HTML includes every aggregate snapshot. Snapshot GIF/video timeline export is not part of this batch; use interactive HTML for playback.

Time columns participate in reviewed source switching, column rename/removal dependencies and portable projects. Enabling time controls never changes source rows. HTML with the optional source-data table includes bound source records before filtering; review privacy before publishing.

Open `examples/v316-time-controls.json` as a portable project for both views; the companion CSV contains illustrative signed team values and a deliberately missing observation. `docs/v316-line-race.gif` shows actual exported output.

## Run on Windows

Stop the previous server with Ctrl+C. Extract the ZIP, open the folder containing `index.html`, type `cmd` in File Explorer's address bar, then run:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5. Keep the same origin/port for existing saved projects. Export portable backups before clearing storage or moving devices.

## Validation

New model/runtime/editor tests passed for signed scales, unequal X spacing, missing gaps, explicit zero policy, peak selection, fixed snapshot scales, playback/loop timing, saved-period capture/Undo, source safety, portable projects and column renaming. All 43 chart contracts and prior regression suites passed. Narrow/light and wide/dark SVGs were visually inspected. A ten-frame line GIF was rendered through CairoSVG and the actual encoder, then decoded with Pillow: 480 × 360, 1,900 ms total and 400 ms final hold.

Browser-native canvas/upload/video recording, Windows and cross-browser visual validation remain pending. DOM and CairoSVG checks do not certify native codecs or browser layout. See `docs/QA_V316.md`.

**Next batch:** time-enabled scatter plots and maps, with fixed scales and stable identity, followed by richer storytelling transitions.

## Earlier release notes

# V3.15 — race images, flags and styling

This batch adds category images and appearance controls to the bar-chart race. The catalogue remains at **42 chart options**.

- **257 bundled flags:** assign manually, or match exact English country/territory names and two-letter codes, with a small set of common aliases. Existing assignments are kept; review automatic results.
- **Your own images:** upload PNG, JPEG or WebP logos locally. Images are resized and embedded in portable projects and exports. The team example includes original illustrative badges.
- **Appearance controls:** images beside category labels or moving at the bar end, contain/circle treatment, image size, individual category colours, bar roundness and opacity, row fill, label size and value-label visibility.
- **Portable output:** static SVG, interactive chart HTML and GIF carry the assets. Bundled flags include their MIT licence in SVG metadata and GIF comments. Source rows are unchanged; saved assignments and styling support Undo.

## Try V3.15

Home → Bar chart race → Try example → Preview → **Race appearance** → **Category images, flags & colours**. Choose a category, assign a flag or upload a local image, then close the window and play the race. The manager also applies individual bar colours. Use Race appearance to set placement, crop and styling.

For a country example, open `examples/v315-country-race.json` as a portable project. It uses illustrative values for New Zealand, Japan and Canada. See `docs/v315-flag-race.gif` for an exported clip.

Uploads accept PNG/JPEG/WebP up to 5 MiB, with decoded dimensions up to 8,192 pixels per side and 16 megapixels. They become PNGs at most 128 × 128, capped at 80 KiB each and 2 MiB total custom images per chart. Remote image URLs and SVG uploads are not accepted. Imported invalid assignments are ignored; over-budget custom images are hidden. Unused assignments are retained until you remove them in the manager. Contain preserves the complete image; circle crop can cut off rectangular flags or logos.

## Run on Windows

Stop the previous server with Ctrl+C. Extract the ZIP, open the folder containing `index.html`, type `cmd` in File Explorer's address bar, then run:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5. Keep the same origin/port for existing saved projects. Export portable backups before clearing storage or moving devices.

## Validation and remaining checks

Asset validation, editor assignment/Undo, category colours, appearance, runtime movement, source immutability and portable project tests passed, along with prior regression suites. A seven-frame flag GIF was rasterised with CairoSVG, encoded through the actual export pipeline and decoded with Pillow: 480 × 360, 1,400 ms, 400 ms final hold, with licence metadata. Narrow and wide SVG layouts and the decoded frames were inspected.

Native browser upload/canvas rasterisation and MP4/WebM recording remain unverified here. Upload and recorder mocks test control flow, not browser codec support or visual quality. Windows and cross-browser checks remain pending. See `docs/QA_V315.md` and bundled flag credits under `vendor/flag-icons/`.

**Next batch:** line-chart races and reusable time controls, preserving explicit missing-value and aggregation rules.

## Earlier release notes

# V3.14 — export the race timeline

This batch adds **actual race GIF/video export**, including changing values, positions, period captions and the entity-history mini-chart. The chart catalogue remains at **42 options**.

## Try it

Open Bar chart race → Try example → Preview → **Export race GIF/video**. You can also use Export and publish → Race GIF/video. Choose the first/last periods, output size, playback speed, target frame rate and final hold. The dialog estimates duration, frame buffers and effective GIF frame rate. Cancel safely or download the completed file again.

The exported range receives its own fixed zero-based scale and history. Periods outside that range are not drawn or included in the exported chart history. Source rows, captions and the saved chart remain unchanged. Interactive HTML remains the option for a playable chart with controls; dashboard and story scenes still use a selected snapshot.

## GIF

GIF export renders the actual timeline, including every selected observation and the final period. A shared adaptive palette keeps category colours consistent. Frame-rate reduction preserves the requested duration; it does not speed up the race. Choose looping or play-once GIF. The final hold uses variable frame timing, without crossfading between unrelated values.

Limits: 60 seconds, 220 frames, 720 pixels on the longest edge, and a 96 MiB RGBA-frame-buffer budget. If even one frame per observed period cannot fit, choose fewer periods or a smaller output size. Very long clips can have low effective frame rates; the estimate discloses this. A zero final hold still includes at least one output frame. GIF timing is quantised to centiseconds. The frame-buffer estimate excludes encoder and browser overhead.

## Video

The browser records the rendered canvas in real time, choosing supported MP4 or WebM. Video requires MediaRecorder and canvas capture support; otherwise GIF and interactive HTML remain available. Video limits are 90 seconds, 1,280 pixels on the longest edge and 64 MiB output. Target frame rate is not a performance guarantee. Keep the tab visible: hiding it stops the export rather than silently producing a stalled recording. Cancellation, recorder failure and early stops clean up capture tracks and discard incomplete files. Video files are finite clips; GIF looping does not apply to them. Video has no audio.

Native video recording is implemented but **not verified in a real browser in this environment**. Inspect the downloaded file on your machine before relying on it.

## Run on Windows

Stop the previous server with Ctrl+C. Extract the ZIP, open the folder containing `index.html`, type `cmd` in File Explorer's address bar, then run:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5. Keep the same origin/port for existing saved projects. Export portable backups before clearing storage or moving devices.

## Validation

Automated plan, GIF encoder, cancellation, editor/export-dialog and regression checks passed. A real GIF was generated from the exporter's exact SVG frames using CairoSVG raster fixtures, decoded with Pillow, and checked for dimensions, changing frames, 1,400 ms duration and 400 ms final hold. See `docs/v314-race-export-example.gif` and `docs/QA_V314.md`.

A normal Chromium launch was attempted and failed. Browser rasterisation, native video codecs, real screen readers and Windows export validation remain pending. Mocked recorder tests verify lifecycle/error handling, not video quality or codec compatibility.

**Next batch:** category images/flags and race styling, followed by line-chart races and broader time controls.

## Earlier release notes

### V3.13 — race history, captions and loop holds

This batch extends the existing bar-chart race; the catalogue remains at **42 chart options**.

- **Entity history mini-chart:** one selected entity across every period, using the race's fixed zero-based scale. Automatic mode chooses the entity with the highest observed peak; ties follow alphabetical order. Missing observations stay as gaps unless the explicit zero policy is selected. Click the mini-chart or use Left/Right/Home/End to select an observed period. The History control in the player is transient; Template options saves the default entity.
- **Captions tied to periods:** select a period in Template options and enter up to 400 characters. The caption appears at that observation and remains active during the transition toward the next period; the next period uses its own caption or clears it. No text is inferred from data. Full captions appear in the interactive player; static SVG captions wrap to two lines and retain the full text in a title element. Captions are portable chart properties and support undo.
- **Pause before looping:** set 0–10,000 milliseconds. The final frame, caption and history cursor hold before restart. Playback speed changes transition time; it does not shorten the loop hold. Pause/resume preserves the remaining hold. Reduced motion still prevents autoplay and allows manual controls.

New race examples use a 720-pixel canvas to leave room for presentation elements. The mini-chart is omitted when plot height is below 280 logical pixels, such as gallery thumbnails. Old saved charts keep their dimensions; increase height or reduce the bar limit if needed.

## Try the batch

Home → Bar chart race → Try example → Preview. Play or scrub to **2021** or **2024** to see illustrative captions. Change the **History** entity, then click its mini-chart or focus it and use the keyboard. In **Template options**, choose the period for static exports to edit its caption, toggle the history chart and set the pause before looping. Playback and history exploration do not modify source rows. Use **Use period for static exports** to save the current period.

## Export scope

Interactive chart HTML includes playback, history selection and period captions, with all included aggregate frames/captions stored locally in the file. Static SVG/PNG/PDF/PPTX/HTML, dashboards and story scenes show the selected period with its caption/history where space permits. Optional source-data tables remain separate snapshots and do not follow playback. Race GIF/video recording is **not implemented yet**: existing motion/story exports still animate the selected snapshot.

## Run on Windows

Stop the previous server with Ctrl+C. Extract this ZIP, open the folder containing `index.html`, type `cmd` in File Explorer's address bar and run:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5. Keep the same origin/port for existing local projects, and export portable backups before clearing storage or moving machines.

## Validation and next batch

Automated model, deterministic playback-clock, editor/undo, export-script and regression checks passed. Static SVG output was rasterised and inspected at 360 and 960 widths. Full browser motion/layout, screen-reader and native Windows validation remain pending. See `docs/QA_V313.md`.

**Next batch:** export the actual race timeline as GIF/video, including captions and the history chart; verify frame timing and output limits. Images/flags and broader time-controlled chart types remain later Flourish gaps. This release does not claim complete Flourish parity.

## Earlier release notes

### V3.12 — Flourish gap 1: animated rankings

This release adds **Bar chart race**, bringing the catalogue to **42 selectable options**. It implements the core animated-ranking workflow; it does not claim complete parity with Flourish's race template or its wider platform.

## Try it

From Home, select the **Bar chart race** featured card, then **Try example**. Switch to Preview and use Play/Pause, Previous/Next, the timeline, playback speed and Loop. Open **Template options** to choose the visible-bar limit, milliseconds per period, missing-combination policy and the period used by static exports. With your own data, connect a period column, an entity/category column and a numeric value column.

Data is **long format**, one entity/period/value record per row. Duplicate pairs use Sum, Average, Count, Minimum or Maximum. Numeric periods sort numerically; valid ISO dates sort chronologically; other labels use first appearance in the source. Steps are equally spaced, independent of elapsed calendar time. Ties are displayed alphabetically. All periods use one fixed zero-based value scale, and category colours remain stable through time and filtering.

Missing entity–period pairs are hidden by default. An explicit alternative assumes zero for absent combinations without changing the source. Empty periods are retained if a period and entity were supplied. Negative numeric values block the race rather than disappearing. Rendering is limited to 120 periods and 100 entities; larger inputs ask for filtering instead of silently truncating. Between observed periods, values, bar positions and opacity are interpolated for animation and identified as such in detail tooltips.

Playback starts paused and stays paused when reduced motion is requested. Previous/Next and the timeline remain usable. Tab enters the chart, arrow keys inspect marks and Escape dismisses details. Hidden entities are excluded from mark navigation. Playback is transient: choose **Use period for static exports** to save a period, with undo support.

## Export scope

- **Interactive chart HTML / Publishing Studio in Interactive mode:** working offline playback, timeline, speed, loop, responsive layouts and optional source-data table. The file contains aggregate values for every included entity/period.
- **SVG, PNG, PDF, PowerPoint, static HTML, dashboard cards and story scenes:** the selected static period. Race cards can receive dashboard filters but do not originate linked selections.
- Existing GIF/video/motion/story exports animate the selected chart snapshot; they do **not** record the race timeline in this release. Use interactive chart HTML for the race itself.

The example is illustrative, not real team performance data. See `examples/v312-bar-race.csv` and `docs/FLOURISH_PARITY.md` for scope and the remaining gap sequence.

## Run on Windows

Stop an older server with Ctrl+C. Extract the ZIP, open the folder containing `index.html`, type `cmd` in File Explorer's address bar, then run:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5. Keep the same origin/port when using existing saved projects; export portable project backups before moving machines or clearing browser storage.

## Validation

Race arithmetic, ordering, missingness, playback clock/control scripts, reduced-motion behaviour, escaping, editor/static capture/undo, portable project and export contracts passed automated checks. Existing editor and renderer checks cover all 42 options. Static race output was rasterised and inspected at normal and compact widths; a tick-overlap issue found there was corrected. Full browser layout/motion, screen-reader and native Windows export checks remain pending; this environment previously could not launch Chromium. See `docs/QA_V312.md`.

## Earlier release notes

### V3.11 — quality and parity foundations

This release improves the existing **41 chart options**. It adds no new renderer families and does not claim full parity with Flourish, Datawrapper or enterprise BI platforms.

- Long chart titles/subtitles wrap to two lines with reserved space; overflow ends with an ellipsis. Horizontal category labels receive more room, and standard labels fit their canvas. Text fitting uses deterministic font-width estimates; inspect custom fonts and explicit margins.
- Stacked-column legends use separate rows below the header. Redundant single-series legends are suppressed for templates with their own legend.
- Phone and tablet editor previews render at 360 and 700 logical pixels without changing the saved canvas. Interactive and static HTML chart publications carry wide, medium and compact pre-rendered layouts; modern CSS container queries choose the layout. Maps use a shorter compact canvas. Source SVG/PNG exports retain the saved dimensions.
- Keyboard details in interactive chart/dashboard HTML and the editor: Tab enters a chart, arrow keys move among marks, Home/End jump, Enter/Space shows details and Escape dismisses the tooltip. Existing linked dashboard buttons keep Enter/Space selection. Reduced-motion preferences remain supported.
- **Accessible design** now includes a chart description, source credit, contrast/readability guidance and an optional source-data table. Descriptions appear in SVG metadata; source credits appear on the canvas. Publication checks bring chart warnings and review items into Publishing Studio.
- Source-data tables are **off by default**. If enabled, HTML chart/dashboard exports include up to 5,000 original rows and 12 bound columns, explicitly before aggregation or chart filtering. Unbound columns are omitted. Interactive tables support search, numeric/text sorting and 25-row pages; static publications contain a plain scrollable table with no scripts. Tables are not a new chart template.
- Older box plots now exclude blank observations; heatmaps and stacked columns exclude missing measures for numeric calculations. Heatmaps show missing combinations in grey, distinct from zero. Count still counts records. Native stacked PowerPoint preparation follows the same missing-value rule.

## Run on Windows

Stop an earlier server with Ctrl+C. Extract this ZIP, open the folder containing `index.html`, type `cmd` in File Explorer's address bar and run:

```bat
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5. Keep the same origin/port for existing local projects. Export portable project backups before clearing browser storage or moving machines.

## Try the improvements

Open a chart and expand **Accessible design** in Preview settings. Add a description/source and optionally enable the source table. Use the Phone/Tablet buttons to inspect the layout. Open **Publish & export**, review **Publication checks**, and download interactive HTML to try keyboard details and the source table. All data stays local until you choose to share an exported file.

## Validation

Automated model, SVG, editor, export-script and regression checks passed. Actual chart SVGs were rasterised and inspected. Chromium could not launch in this environment: browser layout, real screen readers, native Windows PowerPoint and real-origin persistence remain pending. `docs/QA_V311.md` gives precise coverage; `docs/PARITY_V311.md` distinguishes implemented features from unverified parity goals.

## Earlier release notes

### V3.10 — survey, research and sensitivity templates

Five new editable templates bring the catalogue to **41 selectable entries**, including **3 experimental views**. Entries include orientation/composition variants; this is not a count of independent chart families or a claim of superiority over Flourish.

- **Likert response chart:** long-format question, ordered response and nonnegative count/weight. Configure the response order and neutral label. Neutral remains in the denominator, centred across zero or in a separate column. Unknown response categories and negative weights block plotting until corrected.
- **Interval plot:** one estimate, supplied lower bound and supplied upper bound per row. Add an optional reference line and label what the interval represents. Bounds are never inferred, labelled as a particular confidence level, or silently swapped.
- **Empirical cumulative distribution (ECDF):** raw observations with optional cohorts. Exact steps combine ties; each cohort uses its own valid sample size. No fitted distribution or inferred confidence band.
- **Calendar heatmap:** select a year and aggregate repeated ISO calendar dates using Sum, Average, Count, Minimum or Maximum. Missing days remain distinct from zero. Dates use the date as written without timezone conversion.
- **Assumption lens (Experimental):** compare rankings under Average, Median or Sum, with explicit exclusion, zero-fill or complete-group policies for the alternative. Both rankings use the same matched groups; ties receive average ranks. Zero-fill never changes source data. This describes sensitivity, not which assumption is correct.

Find these in **Home → Explore templates**, or use the featured Home cards. **Try example** opens editable illustrative data; **Use my data** connects your dataset. Preview has a **Template options** section, and the Data screen explains field requirements and calculations. Renaming a bound column preserves its connections, including interval bounds; removing/refreshing a column in use is guarded.

Standalone interactive HTML includes neutral placement for Likert, year selection for calendars, and 27 method/policy variants for Assumption lens. ECDF and interval exports retain category filtering. Calendar maps receive dashboard filters but do not originate day selections. Chart/dashboard HTML, publishing, portable project files and vector export paths share the same renderers.

## Run locally on Windows

Extract the ZIP, open the folder containing `index.html`, type `cmd` in File Explorer's address bar, then run:

```bat
py -m http.server 8000
```

Open http://localhost:8000. Stop an older server with Ctrl+C first; refresh the page with Ctrl+F5. Keep the same origin/port when returning to locally saved projects. Export a portable project backup before moving machines or clearing browser storage.

## Validation and limits

Node model/regression checks and jsdom editor/export-script checks passed. Actual SVG output was rendered and inspected at normal and narrow widths. This is not browser layout, accessibility, cross-browser or real-origin persistence certification. See `docs/QA_V310.md` for exact scope and display limits.

## Previous release notes

### V3.9 — chart expansions and Templates

This first expansion batch adds **9 standard templates and 2 experimental views**, bringing the available catalogue to **36 selectable entries**. This is a count of options, including orientation/composition variants and the dedicated faceting template, not 36 unrelated renderer families or proof of greater breadth than Flourish.

## Templates on Home

Home now has **Explore templates** and a **Start from a template** section with four featured starting points. Search, category filters and the Experimental shortcut are inside the **Templates** window. A featured card opens that template's gallery entry; choosing Try example creates a separate illustrative project. Use my data retains the existing import/new-project workflow.

## New standard templates

- Grouped columns and grouped horizontal bars.
- Stacked horizontal bars with separate positive/negative stacks.
- 100% stacked columns and bars.
- Multi-series lines and overlapping series areas.
- Stacked areas.
- Shared-scale small multiples (one line panel per series).

All use long-format data: one category/period, one series column and one numeric value column. Repeated category–series records use the chosen aggregation. Lines keep missing combinations as gaps; stacked areas explicitly treat absent combinations as zero. Percentage stacks use displayed series within each category and show undefined zero-total categories. Unsupported negative composition values display a message rather than disappearing silently. Shared scales are automatic; the new templates do not offer independent per-series/manual bounds.

## Experimental

**Evidence lanes:** raw observations, full range, median, middle-50% band and valid sample size on a shared scale. The band is not a confidence interval. Up to 180 observation marks per lane are sampled deterministically when needed; summaries use all valid observations.

**Change lens:** aligned before/after endpoints and a signed difference panel. Only complete numeric pairs are included in both measures, and the measures must have the same units. This is descriptive comparison, not a causal estimate. Use Sum/Average/Minimum/Maximum rather than Count.

These are exploratory combinations of established encodings. We have not verified exclusivity or claimed that Flourish lacks their components. More proposed directions are in docs/EXPERIMENTAL_V39.md.

## Start on Windows

Extract the ZIP. Open the folder containing index.html, type `cmd` in File Explorer's address bar and press Enter. Stop the previous server with Ctrl+C, then run:

```cmd
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5. Keep Command Prompt open while using the app. No npm, account, AI model or API is needed to run OpenViz.

## Try it

Choose Home > Explore templates, use the Experimental shortcut or search for grouped, percentage, multi-series or small multiples. Try example to get a clearly labelled illustrative dataset. Example CSVs are included in examples/v39-*.csv.

The new templates support reviewed dataset switching, chart/dashboard publishing, category linking, standalone HTML filters and portable project settings. PowerPoint uses the existing SVG/vector fallback rather than native editable chart data for these new types. Browser-specific PNG/PDF/PPTX viewer checks remain pending.

Status: development build. Numerical/model tests, DOM workflows across all 36 entries, actual standalone HTML filter scripts in jsdom and SVG XML/finite geometry at 360/768/1440 widths pass. The 11 default sample SVGs were raster-rendered and visually inspected; docs/v39-chart-preview.png is that sample sheet, not an application screenshot. Browser UI/layout, assistive technology, actual persistence and cross-viewer acceptance remain pending. See docs/QA_V39.md.

Earlier notes below are historical where they conflict with V3.9.

---

# OpenViz Studio V3.8.1 — compact editor and optional map notes

- Project panel opens by default on desktop/tablet widths above 720 px. On narrow screens it remains an on-demand overlay to preserve canvas space. The Project button still opens/closes it.
- Preview/Data toolbar is 42 px rather than 57 px. Full-height tabs now sit flush with its bottom border; panel headings and narrow-screen overlays align with the compact toolbar.
- Map boundary/source note is hidden by default, including maps from older projects without the new setting. Enable **Show map boundary/source note** under **Preview > Map appearance**. The setting works on choropleth, symbol and density maps and follows rendered exports. Source/provenance information remains in the settings/documentation.
- A current, source-backed Flourish comparison and expansion plan is included at `docs/FLOURISH_COMPARISON_AND_EXPANSION_PLAN.md`. OpenViz still has 25 implemented chart types. No new chart types or superiority claims are introduced in this patch.

## Windows startup

Extract the ZIP and open the folder containing index.html. Type `cmd` in File Explorer's address bar and press Enter. Stop the previous server with Ctrl+C, then run:

```cmd
py -m http.server 8000
```

Open http://localhost:8000 and press Ctrl+F5. Keep Command Prompt open while using OpenViz.

Functional DOM/Node checks pass, including note visibility and HTML export, setting round-trip and unchanged map geometry/data. Real-browser pixel/layout acceptance remains pending. See `docs/QA_V381.md`.

---

# OpenViz Studio V3.8 — clearer, safer data connections

V3.8 retains the approved editor layout and adds:

- **Review data connection:** choose another dataset, inspect preserved mappings and labelled suggestions, complete required choices, view the proposed chart, then apply. Cancel leaves the project unchanged. Undo restores the old connection. Reviews are rejected if the project changed while the dialog was open.
- **Chart-specific requirements:** Data includes field roles, required/optional types and a two-row illustrative table. The catalogue includes the same requirements and examples. Geographic coordinates, graph links, date ranges and parallel dimensions receive specialised checks.
- **Transparent calculations:** Preview and Data explain how chart values are produced. Where supported, the Data guide exposes Sum, Average, Count, Minimum and Maximum. Charts using raw observations explain that they do not use ordinary group aggregation.
- **Practical guidance:** contextual notes explain categorical line axes, large donut charts, stacked averages, geographic totals, signed changes and numeric relationships.
- **Data integrity fix:** blank histogram/scatter observations no longer become zero values. Genuine zero observations remain valid.

## Start on Windows

Extract the ZIP, open the folder containing index.html, type `cmd` in File Explorer's address bar and press Enter. Stop any earlier server with Ctrl+C, then run:

```cmd
py -m http.server 8000
```

Open http://localhost:8000. Press Ctrl+F5 to refresh cached assets. Keep Command Prompt open. The application requires no npm, account, AI or API. Export a .openviz backup before switching builds if you need a separate copy of your work.

## Try the main change

In Preview choose **Change data**, then select a different **Chart data source**. The chart remains connected to its original dataset during review. Compatible exact-name bindings are preserved; unique case-insensitive, semantic or unambiguous required matches are labelled suggestions. Ambiguous choices remain empty. Choose required fields and inspect the preview/warnings before **Apply connection**.

The review checks field structure and types. It cannot establish that two differently named columns mean the same thing, that dates/coordinates are correct, or that a chart answers the intended question. Titles, annotations and appearance are retained for your review. No column data is rewritten by connecting a chart.

Status: development build. DOM integration tests cover all 25 chart types and reviewed switches, and Node regression checks pass. Browser visual/responsive and real-origin persistence acceptance remain pending. See docs/QA_V38.md, docs/CLAUDE_HANDOFF_V38.md and docs/ROADMAP_AFTER_V38.md.

Earlier release notes below are historical wherever they conflict with V3.8.

---

# OpenViz Studio V3.7.2 — dashboard and navigation polish

- Dashboard filter controls use the active dark/light theme; control baselines and card headers are aligned consistently. Saved chart colours, including explicit backgrounds, are preserved.
- Collapse or expand Datasets, Visualisations, Dashboards, Presentations and Visual stories using their section headings. These choices are browser preferences, separate from project content.
- Preview shows **Change data** next to the connected source. It opens Data and focuses a prominent **Chart data source** selector above the sheet. Choose an already imported dataset, then review column bindings. Replace data updates the selected source through the existing review workflow; Manage all datasets lets you import additional datasets.
- The chart preview and settings arrangement remain the same.

## Run on Windows

Extract the ZIP and open the folder containing index.html. Type `cmd` into File Explorer's address bar and press Enter. Stop your old server with Ctrl+C, then run:

```cmd
py -m http.server 8000
```

Open http://localhost:8000. Use Ctrl+F5 if the previous interface remains cached. Keep the terminal open while using the app. Export a .openviz backup before switching builds if needed.

Validation: expanded DOM integration checks and publishing, linked-dashboard and column-rename Node contracts pass. Browser visual/responsive review remains pending. Details: docs/QA_V372.md and docs/CLAUDE_HANDOFF_V372.md.

---

# OpenViz Studio V3.7.1 — discoverable column renaming

Click any column heading to rename it. The heading now shows an explicit **Rename** hint in both the standalone Data screen and the chart editor's Data tab. Enter a new name and press Enter or choose Rename column. Values and linked chart mappings are preserved, duplicate or blank names show inline errors, and Undo restores the previous name.

The chart editor layout is unchanged from V3.7.

## Start on Windows

Extract the ZIP. Open the folder containing `index.html`, type `cmd` in File Explorer's address bar and press Enter. Run:

```cmd
py -m http.server 8000
```

Open http://localhost:8000. Keep Command Prompt open; Ctrl+C stops the server. Stop any older OpenViz server first, and export a `.openviz` backup before switching builds. Use Ctrl+F5 if your browser still displays the previous interface.

Validation: DOM integration checks cover heading clicks, Enter, duplicate/blank rejection, cancel, undo, values, original import and updated bindings on both screens. All 25 chart editor DOM checks and existing rename, publishing and dashboard Node contracts pass. Real-browser visual review remains pending; see `docs/QA_V371.md`.

---

# OpenViz Studio V3.7 — Preview & Data studio

V3.7 introduces a Flourish-style editor workflow: Preview/Data tabs, a large canvas, collapsible settings and column bindings next to the editable table. OpenViz retains its own identity and existing local-first features.

**Development build:** DOM integration checks cover all 25 chart types, and Node regression checks pass. Real-browser visual/responsive review and persistence acceptance remain pending; see `docs/QA_V37.md`.

Extract this ZIP, open a terminal in this directory, run `python -m http.server 8000`, and visit `http://localhost:8000`. The application needs no build step, npm, account, API or AI model. Serve over HTTP for browser module loading and local saving.

Start from a template, then use **Data** to edit values and bind columns. Use **Preview** to adjust chart settings. Open **Project** to access your other charts, dashboards and slides. Width preview buttons scale the chart without changing its export dimensions. **Publish & export** opens Publishing Studio; File > Export retains image, PDF, PowerPoint and project downloads.

V3.6 Essentials/Advanced controls are replaced in the chart editor. Prior documentation below describes the previous releases and should be read as historical where it conflicts with V3.7. Handoff and roadmap: `docs/CLAUDE_HANDOFF_V37.md`, `docs/ROADMAP_AFTER_V37.md`.

---

# OpenViz Studio V3.6 — Visualisation-First UX Refinement (16 November 2026)

The first experience-focused release on V3.5. Instead of adding unrelated features, it shortens the path from **an example or imported spreadsheet to a polished chart**. The application retains its 25 working visualisation types, deep editor, dashboard, presentation/PowerPoint/PDF, Story Studio, local-first saving and publishing capabilities.

## What changed

- **Simpler project entry:** Home now clearly offers **Start with your data**, **Explore visualisations** and **Start a blank project**, with optional rules-based advice separately.
- **Visual gallery:** explore 12 curated chart previews first, use search/filters, or expand to the full chart library. Start with an example or pick the chart then upload your own file into a *new* project.
- **Essentials / Advanced chart editing:** Essentials groups data mappings, quick style choices and publishing into a low-friction inspector. Advanced retains the previous professional controls and chart-specific mappings. Switching doesn't discard styling/data.
- **Cleaner canvas:** layers and data preview start closed; available from View. A small-screen Project/Edit settings control ensures overlays are reachable.
- **Improved sample previews:** correct time-series examples so the default line chart doesn't warn about ill-mapped fields.

OpenViz **does not** host user data, run an AI model, or require an account. The goal is professional visualisation, not a spreadsheet or general video editor. Templates remain fully customisable, not restrictive.

## Launch

Extract this ZIP, open a terminal in the folder containing `index.html`, then on Windows run `py -m http.server 8000`; open `http://localhost:8000`. Back up important existing projects as `.openviz` files before changing versions.

## V3.6 documentation

- `docs/QA_V36.md` — tested flows, evidence and outstanding browser/UX validation.
- `docs/CLAUDE_HANDOFF_V36.md` — detailed engineering instructions and preserved product values.
- `docs/ROADMAP_AFTER_V36.md` — design-quality-first future milestones.

**Status:** Development release candidate, not production UX certification. Tests ran in an isolated Chromium harness. Real-browser persistence, Firefox/Safari and beginner usability sessions remain pending.

---

# OpenViz Studio V3.5 — Publishing Studio & Responsive Embeds (November 2026)

Built on V3.4 with no change to the 25 visualisation types, dataset models, linked dashboard interactions, slide and PDF/PowerPoint exports, Story Studio, or local saving safeguards.

### What’s new

- **Publishing Studio** available from **File > Publishing Studio & embed code**, the main Export panel and visualisation, dashboard and story toolbars.
- Choose an existing chart, dashboard or visual story. Choose interactive/static output and one of four page-layout presets (responsive website, article/research, widescreen, portrait/mobile).
- Preview actual generated HTML at desktop, tablet and phone widths, with a sandboxed iframe.
- Download a self-contained HTML page or a ZIP publishing kit with `index.html` and instructions. Nothing is uploaded automatically.
- After hosting the file on your own HTTPS website, enter the real hosted URL to generate a responsive, accessible iframe snippet. Local `file://` URLs cannot be embedded publicly.
- A visible privacy warning reminds users to review any underlying data before sharing publicly. Changing publication contents clears the previous hosted URL.
- Responsive dashboards reflow; precisely positioned Free Canvas dashboards retain their geometry and may scroll horizontally on mobile.

### Launch

Extract ZIP. From the folder containing `index.html`, run `py -m http.server 8000` on Windows or `python3 -m http.server 8000` elsewhere; visit `http://localhost:8000`. No API key, service, Node.js or paid account is needed to use OpenViz. Back up important projects as `.openviz` files before upgrading.

### Documentation

- `docs/QA_V35.md` — verified features, limitations and manual acceptance checklist.
- `docs/CLAUDE_HANDOFF_V35.md` — source structure, security contracts and tests.
- `docs/ROADMAP_AFTER_V35.md` — proposed next milestones.

**Status:** development release candidate. Browser-to-host publishing, Firefox/Safari and full real-origin persistence testing require hands-on verification.

---

# OpenViz Studio V3.4 — Home Import Fixes & Linked Interactive Dashboards (November 2026)

This release builds on V3.3.1 and keeps the existing 25-chart visualisation catalogue, dataset-correction tools, presentation/PDF exports and Story Studio.

## Major changes

- **Home → Import your data** creates a *new project* named for your imported file. The existing project remains intact. Cancelling the file picker or worksheet selection does not create a new project. Ordinary imports made from inside an existing project's Data Workspace still add to that existing project.
- On a brand-new, empty Data Workspace, the optional **Open example project** button is behind *Want to explore with example data?*, keeping Import as the clear primary action.
- **Dashboard Studio**: choose a **Linked field** shared by your chart datasets and select **Highlight matching marks**, **Filter all linked charts**, or **Disable interactions**. Click eligible chart marks to select a category, Shift/Ctrl-click several, or choose **Clear selection**. Highlight keeps scales fixed; Filter recalculates from selected rows without modifying the original data. Choropleth ISO country marks can link to charts using the same country field.
- **Export interactive dashboard** produces a local/offline HTML file with click-to-highlight, selection reset and categorical filtering when there are at most 24 values. For more categories, it visibly falls back to highlight-only instead of embedding hundreds of pre-rendered chart variants. Up to 250 values may be offered for linked selection in the editor.
- Advanced visualisations whose marks do not correspond to the linked field can still receive filtering, but do not become incorrectly clickable selection sources.

## Run the application

Extract the ZIP, open a terminal in the directory containing `index.html`, run `py -m http.server 8000` on Windows (or `python3 -m http.server 8000` elsewhere), then open `http://localhost:8000`. No Node installation, cloud service, account or AI model is needed for normal use. Export important existing projects as `.openviz` backups before testing a new release.

## Test dataset and notes

`examples/v34-region-and-country.csv` can be imported to explore country/region linked charts. Try a choropleth and horizontal bar chart mapped to Country, or two column charts mapped to Region. Use explicit matching category columns in any datasets you want to link.

See `docs/QA_V34.md` for test evidence and limitations, `docs/CLAUDE_HANDOFF_V34.md` for source-level hand-off, and `docs/ROADMAP_AFTER_V34.md` for proposed upcoming milestones. This is a **development release candidate**, not fully certified in every browser.

---

# OpenViz Studio V3.3.1 — Data renaming & Story Studio editing (16 November 2026)

Focused usability update built on V3.3. **New:** click a dataset column's ✎ icon to rename it (linked chart mappings and calculation references update); click green story timeline scenes to select; drag the right edge of a scene to alter length; use a separate animation duration so the completed chart stays visible before transitioning; selecting a keyframe now seeks the preview to its timing. New scenes default to a 2.6 s animation within a 5.4 s scene. Existing scenes retain their saved total durations; extend them manually for longer holds. Additional hint warns if the data-point keyframe track has no focus point.

Refer to `docs/QA_V331.md` and `docs/CLAUDE_HANDOFF_V331.md` for tests, open limitations and implementation details. The underlying data import/export and editing features remain available.

---

# OpenViz Studio V3.3 — Performance & Large Datasets

V3.3 builds on V3.2 without changing project formats or reducing chart functionality. It improves **large-file import responsiveness**, **data profiling/parsing speed**, and **accuracy of large Sankey/network visualisations**. Dense scatter charts now show a deterministic, up-to-400-point *visual sample* with a full-data axis range and an explicit warning. All source rows remain in the dataset and portable project.

**Run locally:** unzip, run `py -m http.server 8000` in the folder with `index.html`, open `http://localhost:8000`. No Node installation is required to use the app. Back up old projects as `.openviz` before upgrading. Optional: import `examples/performance-demo-30000.csv` to try large data, or use `node tests/test-performance-v33.mjs` to run synthetic tests.

Large XLSX/CSV/TSV/JSON imports (>=512 KiB) use a **local Web Worker** when allowed, with a safe fallback. The 25 MB file limit and 100k-rows-per-dataset cap remain. These changes do not make complex diagram or PowerPoint output unlimited in size. Please review the diagram coverage warnings before publishing.

**QA status:** See [QA evidence](docs/QA_V33.md), [engineer hand-off](docs/CLAUDE_HANDOFF_V33.md), [benchmark](docs/BENCHMARK_V33.json), and [roadmap](docs/ROADMAP_AFTER_V33.md). Real-origin worker compatibility, broad cross-browser testing and 100k-row hardware/memory acceptance are still pending; this is a **development release candidate**, not a production certification.

---

# OpenViz Studio V3.2 — PowerPoint & Publication Export Fidelity

**New in V3.2:** Direct browser-local PDF export for slides and selected figures; optional vector-print HTML for print-to-PDF; per-slide-chart PowerPoint trade-off controls (automatic / prefer editable chart data / always vector artwork); editable native stacked columns; improved export menus and documentation. All previous V3.1 save safeguards and 25 chart types remain.

**Launch:** Extract ZIP and run `py -m http.server 8000` (Windows) or `python3 -m http.server 8000` in this folder, then open `http://localhost:8000`. Export a portable `.openviz` backup before upgrading from V3.1.

**Use:** File > Export PDF & publication or Presentation Studio > Export PDF. Download PDF directly (slide text/selectable, chart artwork high-resolution raster) or choose Print-ready vector HTML, open in your browser, then Print > Save as PDF (SVG stays vector when browser supports it). For PPTX, select a slide chart and choose its PowerPoint chart export mode in Properties. Check File > Review PowerPoint compatibility first.

**Quality status:** Tested in isolated Chromium including PDF render/parse and editable PPTX file structure; stacked PPTX also rendered in LibreOffice. Real-browser reloads, Microsoft PowerPoint desktop fidelity and Firefox/Safari require final owner testing. Direct-PDF embedded fonts/complex Unicode support and true SVG-vector direct PDFs are not yet implemented.

- [QA evidence & limitations](docs/QA_V32.md)
- [Claude engineering hand-off](docs/CLAUDE_HANDOFF_V32.md)
- [Roadmap](docs/ROADMAP_AFTER_V32.md)

---

# OpenViz Studio V3.1 — QA and recovery release candidate

**V3.1 adds safe browser-tab save conflict detection, recovery choices, accurate save status, a memory-bounded chart-preview cache, and a downloadable release-diagnostics report.** All 25 working chart types, dashboards, Story Studio and PowerPoint/GIF/video exports remain available. This is a release candidate, not a full public stability certification.

### Run

Extract this folder, then from the folder containing `index.html` run `py -m http.server 8000` (Windows) or `python3 -m http.server 8000`. Open `http://localhost:8000` in a normal Chrome or Edge window. Back up valuable old projects as `.openviz` files before testing new builds.

### Acceptance and hand-off

- [V3.1 QA evidence and real-origin owner test](docs/QA_V31.md)
- [V3.1 hand-off for future engineering](docs/CLAUDE_HANDOFF_V31.md)
- [After V3.1 roadmap](docs/ROADMAP_AFTER_V31.md)
- [Cross-browser/release matrix](docs/RELEASE_MATRIX_V31.csv)
- `Help > Release diagnostics` runs the browser-local checks; after running them, select **Download report** to save results without dataset values.

---

# OpenViz Studio V3.0 — Professional Release-Readiness

V3.0 consolidates V2.11 without adding unrelated product features. It improves keyboard access, modal focus, chart accessibility, preview caching, imported project safety and in-app **Help > Release diagnostics**. All 25 visualisation types, Story Studio, interactive dashboards, PowerPoint, HTML and GIF/video exporters remain included.

**First-time check:** extract ZIP, run `py -m http.server 8000` from this directory, open `http://localhost:8000` and run **Help > Release diagnostics** in an editing workspace. Export a `.openviz` backup before switching builds.

**Release status:** Development / release candidate, not a full production certification. See [QA_V30](docs/QA_V30.md), [roadmap](docs/ROADMAP_AFTER_V30.md) and [Claude hand-off](docs/CLAUDE_HANDOFF_V30.md).

---

# OpenViz Studio V2.11 — Natural Motion System

**Chart-aware animation for all 25 working visualisation types.** The existing
V2.10.1 app, project model, editors, dashboards, storytelling and exports are
preserved. This release introduces `src/natural-motion.js`, a deterministic,
SVG-native animation engine. It animates visible geometry rather than altering
underlying numbers, calculations, axis geometry or chart field mappings.

## What changed

- **Auto** now selects an appropriate motion for each chart type. The inspector
  displays the actual recommended effect, e.g. *Automatic · Draw line left to right*.
- **Chart-specific alternatives** appear in Story Studio → Selected scene →
  Mark animation, and in Visualise → Motion timeline → Effect. Unsuitable
  options are not presented by default.
- **Line/slope/parallel:** left-to-right path/observation reveal using SVG clips;
  **area:** anchored area growth; **scatter/bubble/dot/symbol maps:** in-place
  circle growth (radius, not moving the observation coordinates).
- **Donut:** a radial sweep; **sunburst:** parent before child rings;
  **treemap/heatmap:** stable sequential tiles/cells; **choropleth:** sequential
  country fills; **geographic density:** gradual intensity buildup.
- **Sankey:** nodes first, then directional flow reveal; **network:** nodes and
  edges build without moving their layout; **timelines:** milestones reveal;
  **Gantt:** bars extend from task start dates.
- **Box plots:** quartiles, whiskers and outliers build in stages;
  **violins:** density shapes expand symmetrically about their centre lines;
  **waterfalls:** changes grow from their prior cumulative level; **stacked bars:**
  segments build progressively without floating above unfinished segments.
- **Reveal order** (forward/reverse) and **sequence spacing** (0–0.9) are saved
  per story scene. Existing keyframe tracks and the explicitly opted-in Custom
  movement mode remain available.
- Story Studio preview, standalone HTML, GIF and video all use the same
  `storySvgAt()` renderer. The single-chart Motion Timeline uses the same
  natural motion engine via `setMotionFrame()`. Smooth-loop GIF exports from
  V2.10 are retained.
- Animation metadata is part of the SVG rendering only. Existing static SVG,
  PNG and PowerPoint exports are unchanged; PowerPoint animation is not native.

**Try it:** Run `py -m http.server 8000` inside this directory, open
`http://localhost:8000`, load example data, choose a chart, then select
**Story Studio**. Switch to a line, donut, network, flow or map chart using
**Insert > Browse chart catalogue** to inspect its natural motion. For a
single chart, open **Motion timeline** in the Visualise toolbar.

**Actual example exports:** `v211-line-natural-motion.gif`,
`v211-donut-natural-motion.gif`, `v211-sankey-natural-motion.gif`.
The V2.11 source, QA report, tests and Claude hand-off are bundled here.

**Accuracy and limitations:** these are deterministic SVG reveal effects, not
simulation of real physical flow. Sankey links progressively uncover; they do
not simulate moving particles. Geographic boundaries remain the simplified
bundled world data, and the map itself never moves. The GIF encoder is still
limited to 256 colours. Cross-browser behaviour and real-origin IndexedDB
reloads require testing on a normal hosted origin. Do not use a visual effect
in ways that imply values or times absent from the source dataset.

---

# OpenViz Studio V2.10.1 — Chart-aware Animation Refinement

**Focused update to V2.10.** Story Studio now offers scene-level **Mark animation** choices: Automatic (grow supported bars, fade others), Grow from baseline, Grow sequentially, Fade in place, Custom movement and No intro. Story's new default keeps bars anchored within the chart, rather than moving them outside their axes.

Supported bar-like charts: vertical column, horizontal bar, histogram and stacked columns. Growth is drawn from each mark's displayed baseline, including negative direction where appropriate. The standalone Motion Timeline also supports these effects, and repeated scrubbing restores original dimensions correctly.

Existing `.openviz` projects load with an automatic growth/fade default for scenes that did not previously store a Mark animation choice. Manual custom offsets remain available when **Custom movement** is selected. Animated GIF, MP4/WebM and HTML exports all use the same frame renderer as Story Studio preview; the V2.10 seamless GIF loop improvement remains intact.

**Try it:** Run `py -m http.server 8000`, load sample data, open a chart, choose **Story Studio**, and adjust **Properties > Selected scene > Mark animation**. For a quick starter select **Bars: Grow from zero** in Motion starter. See `v211-grow-from-zero.gif` and `v211-story-grow.png`.

**QA:** See `docs/QA_V2101.md`, `docs/CLAUDE_HANDOFF_V2101.md`, and `tests/test-browser-v211.py`. This remains a development build; real-origin IndexedDB saving and Firefox/Safari require testing.

---

# OpenViz Studio V2.10 — Smooth Animation & Professional Export

**Browser-based, free, local-first and no AI model.** V2.10 refines the V2.9 Story Studio without modifying chart or dataset structures.

- **Export story…** is now one prominent action in the Story Studio toolbar. Export modal explains Video, GIF and Interactive HTML; shows progress, errors, completion and Download again.
- GIF exports now use fully composed, opaque frames, a **single adaptive colour palette** calculated across the entire animation, consistent disposal and configurable smooth end-to-start looping.
- GIF controls: 560 × 315 or 720 × 405, target 12/18/24 fps, smooth looping on/off. Maximum 150/180 frames respectively: very long stories may render below target fps (effective rate shown).
- Video recordings use more generous bitrate with selectable 18/24/30 fps **targets**, subject to browser hardware/performance; browser chooses MP4/WebM support. Interactive HTML is unchanged.
- Browser encoding runs locally, releases time for progress updates and supports cancellation between frames.
- New tests check first/last frame continuity, adaptive palette, still-background stability, export UI and V2.9 functionality.

**Run:** Unzip, run `py -m http.server 8000` in folder containing `index.html`, open `http://localhost:8000`. Select a visual story and click **Export story…**. Back up projects as `.openviz` before switching versions.

**Limits:** GIF remains 256 colours by file format and may show banding in some gradients. Smooth loop blending is offered for GIF and is independent of keyframe settings; video and HTML retain their original ending. Browser MIME/codec support varies, and real-origin IndexedDB persistence / Firefox-Safari still need owner checks. See docs/QA_V210.md and docs/CLAUDE_HANDOFF_V210.md.

---

# OpenViz Studio V2.9 — Story Studio & Multi-Scene Animation

**Free, browser-based, local-first, no account or AI model.** V2.9 is a substantial animation upgrade built on V2.8, retaining all 25 working chart types, geographic visualisations, spreadsheet corrections, professional styles, dashboards and editable PPTX slides.

**New in V2.9**

- **Visual stories** appear in the Project navigator. Use **Insert > New visual story**, **Format > Story Studio**, or the visualisation editor's **Story Studio** toolbar action to begin.
- Sequence multiple existing charts as scenes. Scenes reference their source chart and data, rather than duplicating the spreadsheet.
- **Transitions:** crossfade, slide, wipe, zoom or cut; independent duration and incoming transition length. Reorder, duplicate or remove scenes.
- **Six animated tracks:** data marks, titles, axes/grid, value labels, annotations, and an explicitly selected data point. Edit opacity, X/Y displacement, scale, time and easing, or drag keyframes along the track. Start with a built-in motion preset if preferred.
- **Narrative captions** on scenes, a global story playback scrubber, and independent scene timings.
- **Export:** self-contained interactive HTML story player; animated GIF; browser-supported MP4/WebM video. All rendered through the same chart-frame compositor as the editor preview.
- Undo/redo, autosave and `.openviz` archive handling include story configuration. Story deletion does **not** delete source charts.

**Quick start:** Extract this ZIP; run `py -m http.server 8000` in the directory containing `index.html`; open `http://localhost:8000`. Load sample data, open any visualisation and choose **Story Studio**. Back up existing projects with **File > Export portable project** before changing versions.

**Limitations:** This is a keyframe-based chart animation/story composer, not a general-purpose video editor. No voiceover/audio tracks, tweened source data, nonlinear freeform movement or animated PPTX. For GIF/HTML, very long stories use capped frame counts, and video uses the browser recorder in real time. Microsoft PowerPoint and normal-origin browser persistence remain owner verification tasks. See `docs/QA_V29.md` and `docs/CLAUDE_HANDOFF_V29.md`.

---

# OpenViz Studio V2.8 — Motion Timeline & Shared Dashboard Filtering

OpenViz remains **free, local-first, browser-based and AI-free**. V2.8 extends V2.7 without replacing its dataset corrections, 25 working visualisations, presentation editor or export formats.

**What's new**
- Visualise > **Motion timeline** or Format > Motion timeline: configure intro, hold, outro, start delay, easing and reveal effect; preview with playback and scrubbing; save in the portable project.
- Export **animated GIF** without external services, and **MP4/WebM** video where your browser supports recording.
- Dashboard Studio: choose a **Shared filter field** that exists in all linked chart datasets and filter them together. Export an **interactive HTML dashboard** with the shared filter, compatible with responsive grid or Free canvas.
- Import, data editing, SVG, static HTML, PPTX, curated styles and previous chart types remain available.

**Quick start:** Extract the ZIP; in the folder with `index.html`, run `py -m http.server 8000` on Windows (or `python3 -m http.server 8000`) and visit `http://localhost:8000`. Export a `.openviz` backup of an important older project before switching versions.

**Important limitations:** Motion is currently a phase-based animation of data marks, not a full multi-object keyframe compositor. GIF is 256-colour/560×315; MP4/WebM availability varies by browser. Shared dashboard filters require common categorical field names and values across all included chart datasets (2–12 common values). Filters do not change the original dataset and may rescale chart axes. Real-origin IndexedDB checks, cross-browser testing and PowerPoint desktop inspection remain owner checks. See `docs/QA_V28.md` and `docs/CLAUDE_HANDOFF_V28.md`.

---

# OpenViz Studio V2.7 — Data Corrections & Interactive Charts

Free, local-first, browser-based visualisation. No account, subscription, AI model, or remote chart API required.

**V2.7 additions**
- Correct incomplete datasets without rebuilding Excel files: **Data > Add row**, **Add column**, select and delete multiple rows, remove unused columns, and edit cells directly. Raw imported data remains preserved in the project. Undo/redo and data audits record corrections. Linked visualisations use corrected rows automatically, including choropleth maps.
- Chart-linked or calculated columns are protected against deletion until you update their dependencies. Refresh warns before replacing local corrections.
- Visualisation Editor: **▶ Preview motion** and hover descriptions on rendered data marks.
- Export: **Interactive HTML embed** with replayable, reduced-motion-aware animation, optional categorical filtering for suitable charts, and self-contained hover information. Existing **Static HTML**, SVG, PNG, portable projects and PowerPoint still work.
- New `src/dataset-edit.js` contains isolated, dependency-aware operations.

**Run locally:** extract ZIP, run `py -m http.server 8000` from the folder containing `index.html`, open `http://localhost:8000` in a modern browser. Export an `.openviz` backup of important projects before switching releases.

**What this does not claim:** No MP4/GIF export or animation timeline yet; categorical filtering in interactive HTML is restricted to supported data structures and the chart rescales on filter; normal-origin storage persistence and Microsoft's desktop PowerPoint rendering still need verification. See `docs/QA_V27.md` and `docs/CLAUDE_HANDOFF_V27.md`.

---

# OpenViz Studio V2.6 — Professional Styles & Reusable Templates

**Free, browser-based, local-first, no account or AI.** V2.6 builds on V2.5's 25 working visualisation types and adds a non-destructive, reusable design library.

## What's new

- **Eight curated styles** for editorial, academic, business, journalism, presentation, accessibility and dark/neutral designs. These are editable starting points, not licensed professional certification or forced templates.
- **Actual visual previews** based on labelled illustrative data. Search styles and filter by category before applying.
- **Apply to one or every chart** with a single, undoable operation. Data values, chart types, field mappings, aggregations, annotations and statistical settings remain unchanged.
- **Optional layout and spacing changes** plus a separate choice to clear individual-point colour overrides; these are never silently reset.
- **Create your own named styles** from any chart, then reuse them in other projects. User styles are included in the portable `.openviz` project and cached in local browser preferences for convenience.
- **Share styles as JSON**, including an example in `examples/example-research-style.json`. Imported style properties are validated through an allow-list.
- **Optional slide styling:** when deliberately enabled, style slide backgrounds, text and shapes to accompany linked visualisations. PowerPoint exports now preserve the slide background and editable text colours.
- **Help Centre updated** with Basic and Advanced style instructions. Browser light/dark mode is independent of visualisation themes.

## Try V2.6

1. Back up important projects as `.openviz` files, and extract this ZIP into its own folder.
2. In that folder, run `py -m http.server 8000` (Windows) or `python3 -m http.server 8000` (macOS/Linux). Open `http://localhost:8000`.
3. Load the example dataset or import an Excel/CSV file, then open a visualisation.
4. Choose **Format > Styles & templates…** (or the **Style** inspector's **Browse and save styles…** action).
5. Preview a curated style and click **Apply**. You can choose **Selected visualisation** or **All project visualisations** first.
6. Edit the chart to taste, then use **My styles > Save current appearance**. Export style JSON to share it; use **Import .json style** to add one back.
7. Optionally check **Also style slide background, text and shapes** when applying across a project. Export PowerPoint and review the result.

This is an early development release. Styles do not dynamically subscribe charts to future updates; reapply a style when you want to propagate it. Academic styles are not guaranteed to meet APA 7, Chicago, MLA or journal-specific requirements. See `docs/QA_V26.md` and `docs/CLAUDE_HANDOFF_V26.md` for verification, limitations and follow-up engineering work.

---

# OpenViz Studio V2.5 — Geographic Visualisations

**Free, browser-based, local-first, no AI model or account.** V2.5 builds on V2.4 and now includes **25 working visualisation types**, including three new geographic maps, in a catalogue with 26 entries (one planned).

## New in V2.5

- **Country choropleth:** join country names, ISO2 or ISO3 codes to the bundled world boundaries and colour each country by a numeric measure. Geographic match and missing-data warnings are provided. Do not interpret absolute totals as comparable rates without appropriate normalization.
- **Proportional-symbol map:** plot city/point locations by latitude and longitude, or use recognized country centroids; size circles by area in proportion to a positive numeric measure. Configure marker size, colour and opacity.
- **Geographic heatmap:** show smoothed density of observations with latitude/longitude and optional positive weights. It is based on geocoded points, not a country-level choropleth, and should not imply more spatial precision than the observations allow.
- **Geographic catalogue:** all three types appear under the Geographic category, with requirements, explanation, editable examples, and compatibility warnings. All 25 working visualisations remain browsable regardless of current dataset.
- **Map design and export:** customise region/viewport (world and major regions, including a New Zealand-focused view), colour palettes, borders, ocean colour, size/opacity, smoothing and legends. SVG, HTML and project export preserve the map; slides/PPTX export geographic charts as high-fidelity SVG vectors rather than editable native PowerPoint charts.
- **Non-AI advice:** the optional rule-based Visualisation Advisor and Comparison Studio recognise geography-related goals and field requirements. The editor does not silently invent coordinate values.

## Offline basemap and attribution

Map boundaries are bundled in `src/world-data.js` and are derived from **Natural Earth 1:110m** country polygons (public domain). The simplified equirectangular global projection is adequate for general country overview graphics but *not* authoritative for borders, disputed territories, legal boundaries, small islands, or precise distance/area calculations. The offline map does not fetch satellite imagery, geocode user addresses or use map-service API keys. Names, boundaries and joins should be reviewed carefully for publication.

## Quick start

1. Export an `.openviz` backup of any important older project.
2. Extract the ZIP and run `py -m http.server 8000` in the directory containing `index.html` (or `python3 -m http.server 8000`). Open `http://localhost:8000`.
3. Choose **Insert > Browse chart catalogue > Geographic**, then **Try example** for a map. Or import your own Excel/CSV with country names or decimal-degree latitude/longitude fields.
4. Choose the map and configure geographic field assignments, viewport and appearance in **Properties**. For source country names that do not match the bundled boundaries, use country ISO codes or correct the source labels.
5. Export SVG or add the map to a presentation and export PPTX. Geographic map shapes are vector graphics in PowerPoint and are not editable chart data.

See `docs/QA_V25.md` and `docs/CLAUDE_HANDOFF_V25.md` for tests, limitations and development notes.

---

# OpenViz Studio V2.4 — Advanced Visualisations & Gantt

**Browser-based, free, local-first, no AI model, no account.** This release expands from 16 to **22 working visualisation types** (24 catalogue entries, including two clearly marked future types).

## New in V2.4

- **Sankey diagrams** — source → target flows with positive numeric weights, node width/spacing, link opacity, draggable nodes and recolouring.
- **Network graphs** — source/target edge lists, optional link weight, force/circular layouts, draggable/recolourable nodes.
- **Sunburst diagrams** — two-level nested groups and positive proportions, live point styling.
- **Event timelines** — dated events with optional lanes, selectable events and zoom control.
- **Parallel coordinates** — select 2–8 numeric dimensions, colour by group and adjust line opacity.
- **Gantt charts** — task names, Start and End date mapping, optional team grouping and overlapping bars.

Every type has an editable built-in example dataset under **Insert > Browse chart catalogue → Try example**, dedicated mapping controls in **Properties > Data**, format warnings, and the same SVG / HTML / project and presentation rendering pipeline. Specialised charts export as vectors within PowerPoint rather than PowerPoint-native editable chart data.

## Running V2.4

Export portable `.openviz` backups of important older projects first. Extract the entire ZIP and, in the directory containing `index.html`, run `py -m http.server 8000` on Windows or `python3 -m http.server 8000` on macOS/Linux. Open `http://localhost:8000`. Do not open via `file://` because ES modules are used.

See `docs/QA_V24.md` for tested workflows, precise limitations and hands-on checks. See `docs/CLAUDE_HANDOFF_V24.md` for implementation notes and future professionalisation.

---

# OpenViz Studio V2.3 — Comparison & Visualisation Advisor

**A free, browser-based, local-first data visualisation platform.** V2.3 builds directly on V2.2, focusing on discovering, fairly comparing, and choosing visualisation types. No AI model is used, and the Data workspace remains intentionally lightweight.

## V2.3 highlights

- **Comparison Studio** opens from **Visualise > Compare chart types**, View, command search, or Advisor. Compare any selection of 16 working chart types side by side using the same spreadsheet data.
- **Shared mappings stay explicit:** choose dataset, goal, X, numerical Y, optional group and bubble size, and aggregation. Comparison adjustments do not modify the existing visualisation.
- **Clear interpretive guidance:** each chart explains what it reveals, what can mislead, whether it uses raw observations or aggregation, and what mappings are missing. Unavailable combinations are never silently remapped.
- **Two explicit outcomes:** Create a *new* chart while retaining the original, or *replace* the current chart when you choose to.
- **Optional rules-based advisor:** start with “What are you trying to visualise?”. With a dataset, it proposes fields based on the description and column names and shows four real-data previews. Without data, it shows labelled examples you can open as editable chart templates. It uses no AI model and no external API.
- **No disruption to previous editing/export features:** professional editor, responsive dashboards, PowerPoint presentation exports, project backups and the catalogue remain.

## Quick start

1. **Export an `.openviz` backup** of anything important before changing versions.
2. Extract the entire ZIP to a directory.
3. From that directory, run `py -m http.server 8000` on Windows or `python3 -m http.server 8000` on macOS/Linux.
4. Visit `http://localhost:8000` in a modern browser. Do not open `index.html` with `file://`; the application uses modules and browser-local storage.
5. Open a chart, click **Compare chart types** in the Visualisation Editor, or select **Get visualisation advice** on Home. For a blank project, use the Advisor without data or Insert > Browse chart catalogue.

See `docs/QA_V23.md` for verification and remaining limitations, and `docs/CLAUDE_HANDOFF_V23.md` for the next engineering pass.

---

# OpenViz Studio V2.2 — Visualisation Library & Discovery

**A free, local-first professional visualisation studio in your browser.** V2.2 builds on V2.1 and returns development focus to the platform's purpose: making polished visualisations from data people have already prepared in Excel or another tool. The Data workspace remains a lightweight import, preview, mapping and refresh workspace.

## What's new

- **16 working chart types**, up from 11: adds **waterfall**, **treemap**, **violin plot**, **bubble chart**, **slope chart**. There are 21 entries in the browsable catalogue; five future types remain marked **Planned**.
- **Browse the chart library:** search by chart name or purpose, filter by category, working status or compatibility with uploaded data.
- **Meaningful preview examples:** each supported chart is demonstrated using its own *illustrative dataset*. Choose **My uploaded data** to see actual values where the dataset contains appropriate fields; examples remain clearly labelled when fields do not match.
- **Try example:** create an editable example chart and sample dataset without importing Excel first. The sample stays clearly labelled as illustrative.
- **Better specialised mappings:** bubble area/size field, optional treemap groups, two-endpoint slope group field, violin bandwidth. The application warns about incompatible or misleading interpretations.
- The previous comparison, precision editing, dashboards, PowerPoint slides, HTML embeds and project recovery tools remain available. No AI model is used.

## Quick start

1. Extract the ZIP to a folder, keeping `src`, `vendor`, `docs`, `tests` and `examples` in place.
2. In that folder run `py -m http.server 8000` on Windows, or `python3 -m http.server 8000` on macOS/Linux.
3. Open `http://localhost:8000`. Export a portable `.openviz` backup of important projects before switching versions.
4. Go to **Insert > Browse chart catalogue** (or choose the plus sign beside **Visualisations**) to browse chart types. For a blank project, use **Data > Browse chart types** or the Insert menu and **Try example**.
5. When importing Excel or CSV, choose **My uploaded data** in the catalogue to preview the compatible charts and configure field mappings in the Data tab of Properties.

## Technical / reliability notes

The app uses ordinary browser JavaScript modules with vendored JSZip and PptxGenJS. No Node, account, subscription, AI model or API is required to run it. Some newer charts use editable SVG geometry in the editor but export as a high-fidelity vector image in PowerPoint (not editable chart data). See `docs/QA_V22.md` for chart semantics, warnings, tested flows and limitations, and `docs/CLAUDE_HANDOFF_V22.md` for future engineering.

---

# OpenViz Studio V2.1 — Reliability & Editing Consistency

V2.1 builds on the **tested V2.0 browser application**. It prioritises safer recovery, shared appearance actions between editing workspaces, and a more transparent PowerPoint workflow rather than adding more chart types. This is a working development prototype, **not yet a production-certified analytics or slide product**.

## Changes in V2.1

- **Storage & recovery** under File: run a real browser write/read/delete check, see quota and persistent-storage status when available, create checkpoints, and restore one with confirmation. Five per-project recovery snapshots are retained, each capped at 8 MiB. Automatic checkpoints periodically preserve a prior saved version, best-effort.
- **Safer project transitions:** queued writes are completed before opening or creating a different project; pending autosave attempts to flush when the tab becomes hidden; browsers may warn if you navigate away while changes remain unsaved.
- **Consistent appearance copying:** use **Edit > Copy appearance / Paste appearance** (or Ctrl+Alt+C / Ctrl+Alt+V) with chart titles/annotations and compatible slide text/shape objects. Formatting transfers without changing the data, text content, object size or position. Object-specific controls appear under slide Properties.
- **PowerPoint compatibility report:** available from **File > Review PowerPoint compatibility** and the Export dialogue. See counts and item-by-item export modes: editable text/shapes, editable native charts or vector fallback. Missing chart references are flagged before export.
- **PowerPoint accuracy:** native line charts no longer incorrectly force the value axis to zero when the source data does not require it.
- **All V2.0 features retained:** draggable panel widths, responsive small-screen overlays, 11 chart types, precision editor, presentation canvas, dashboard, exports and portable project files.

## Launch

Extract the entire ZIP, run `py -m http.server 8000` inside the project folder, then open `http://localhost:8000` in Chrome, Edge or another modern browser. No Node/npm or AI model is required to **run** OpenViz Studio. Use the **same localhost address and port** as the previous version to see the same browser-local project library. **Export an `.openviz` backup before switching versions.**

## Verification

The V2.1 test suite and earlier V1.5–V2.0 regression suites passed. A Node storage-contract test double covered the IndexedDB schema migration, checkpoints, pruning, read/write/delete and deletion. The isolated Chromium environment cannot validate real-origin IndexedDB reloads; test these on your own local server using the steps in `docs/QA_V21.md`. Rendering in Microsoft PowerPoint desktop also needs a final hands-on check.

Detailed QA: `docs/QA_V21.md`. Claude engineering continuation: `docs/CLAUDE_HANDOFF_V21.md`.

---

# OpenViz Studio V2.0 — Resizable Workspaces & Reliability Pass

V2.0 builds on the **working V1.9 browser application**, rather than replacing the chart, dashboard, or slide editors. The primary goal is a more usable professional workspace, more predictable saves, and clearer PowerPoint export behaviour. **This is a development prototype, not yet a production-certified analytics or presentation platform.**

## What changed

- **Resizable Project and Properties panels:** Drag the thin vertical borders of either panel. Their widths are saved as *browser preferences*, not inside projects, and restored the next time the application loads on the same origin and browser profile.
- **Keyboard-accessible splitters:** Focus a divider and press the left or right arrow key for 10-pixel changes. Double-click a divider (or press Home while focused) to reset it. **View > Reset panel widths** resets both widths.
- **Small-screen behaviour:** The Properties inspector overlays the canvas below 1050 px, rather than permanently stealing canvas space. At 720 px or narrower, the Project navigator is also an overlay; either panel can be opened via View. These panels do not appear on Home.
- **Saving reliability:** Auto-saves use frozen project snapshots, serialized writes, and a read-back verification before marking a project saved. A new project or opening another saved project first flushes pending changes. Project deletion waits for in-flight saves, preventing a delayed save from recreating the deleted project.
- **PowerPoint export transparency:** In Present > Properties, a selected chart explicitly reports whether it will export as a native editable PowerPoint chart with simplified styling or as a high-fidelity SVG image (not individually editable as chart data). This uses the same selection logic as the actual exporter.
- **Presentation text fidelity:** The exported PPTX now preserves the selected font-family name where valid and passes through line-height settings as native PowerPoint paragraph line spacing. Basic shape opacity handling also respects zero opacity. Custom fonts must still be installed on the recipient's computer.
- **Polish:** More consistent panel scrolling, accessible resizer labels, and documented panel controls in the Advanced guide.

## Start the app

Extract the full ZIP and open a terminal inside `openviz-studio-v2.0`:

```powershell
py -m http.server 8000
```

Open `http://localhost:8000` in a modern browser. On macOS/Linux use `python3 -m http.server 8000`. **Do not double-click `index.html` using a `file://` URL:** modules and persistent storage require an HTTP origin. No Node, AI model, API key or account is required.

## Suggested real-browser acceptance check

1. Start the local server, open a saved or sample project, drag both panel borders and reset widths using View; reload and check panel preferences persisted.
2. Create a new project with a dataset, save and refresh the browser. Check the dataset, chart, slide layouts, groups and formatting are still present.
3. Save another version, switch between projects, return to the original and ensure the latest edits are present.
4. Export an `.openviz` file as an independent backup and import it again.
5. Create an editable text box and a chart on a slide, export `.pptx`, open it in Microsoft PowerPoint and inspect both layout and which components are editable.
6. Test at desktop widths around 1440, 1024 and 768 px. On small screens use View to open either overlay panel.

**Automated Chromium tests:** `tests/test-browser-v20.py` passed at 1720/940/660 px, plus V1.5–V1.9 regression suites. The isolation environment blocks navigation to normal HTTP/file origins, so the browser's real IndexedDB persistence on localhost and PowerPoint desktop rendering are **not verified**. The code includes read-back verification, but this is not proof of cross-reload persistence.

Detailed evidence and outstanding work: `docs/QA_V20.md`. Future engineering hand-off: `docs/CLAUDE_HANDOFF_V20.md`.

---

# OpenViz Studio V1.9 — Presentation Studio layers, grouping and precision formatting

V1.9 extends V1.8's slide editor without changing the local-first browser deployment model. **This remains an early professional-software prototype, not a complete replacement for PowerPoint or Tableau.**

### New in V1.9
- Richer object-level text controls: font, bold, italic, underline, horizontal/vertical alignment, letter spacing and line-height, plus in-place editing.
- Selection handles to resize text, shapes and linked charts; hold **Shift** for proportional resizing.
- Slide Layers pane inside Presentation Studio (below the slide thumbnails), with per-object selection, visibility, locks and stacking order.
- Persistent group / ungroup via **Arrange** or **Ctrl+G / Ctrl+Shift+G**; grouped items move together. Ungroup restores independent selection.
- Rectangles, rounded rectangles and ellipses with configurable fill, stroke and opacity; set in **Properties** after insertion under **Insert**.
- Improved editable PowerPoint export for native text and shapes. Complex visualisations still use high-fidelity vector fallbacks. OpenViz groups export as separately editable PowerPoint objects, not native grouped shapes.

### Launch
Extract the ZIP, start `py -m http.server 8000` from the `openviz-studio-v1.9` directory, then visit `http://localhost:8000`. No Node, account or AI model required.

### Testing
The V1.9 Chromium smoke test and V1.8/V1.7.1/V1.7/V1.6/V1.5-extended regressions passed. Details and outstanding manual gates: `docs/QA_V19.md`. Engineering follow-up: `docs/CLAUDE_HANDOFF_V19.md`.

---

# OpenViz Studio V1.8 — Presentation direct editing and freeform dashboards

V1.8 builds on V1.7.1 with **browser-native, professional slide and dashboard editing**. This remains an early development prototype, not a finished PowerPoint/Tableau replacement.

## Starting V1.8

Extract the ZIP without rearranging `src/` or `vendor/`. From the extracted `openviz-studio-v1.8` directory run `py -m http.server 8000` (Windows) or `python3 -m http.server 8000` (macOS/Linux). Open `http://localhost:8000`. No Node build step, subscription, account, AI model or API key is required.

## New in V1.8

**Presentation Studio**

- Double-click slide *text* to edit it directly on the slide (not in a browser prompt). Enter saves, Shift+Enter adds a line, Escape cancels, and clicking away saves.
- Shift/Ctrl/Command-click objects to select multiple, and drag any selected object to move the entire selection. Select multiple objects, then use Arrange or Properties for alignment/distribution.
- Blue smart guides appear when objects align with slide centres, other objects or evenly spaced candidates. Hold Alt to move without snapping. Toggle these guides under View.
- Keyboard shortcuts when not editing text: Ctrl/Cmd+A select all; Ctrl/Cmd+D duplicate; Delete/Backspace remove; arrow keys nudge; Shift+arrows make a larger nudge.
- The previously introduced tight chart framing and deliberate slide-edge cropping remain in place.

**Dashboard Studio**

- Choose **Responsive grid** (automatic, mobile-friendly layout) or **Free canvas** (precision layout) in the dashboard header.
- In Free canvas, drag a chart by its header, resize it with the lower-right handle, and inspect/edit exact X/Y/width/height in Properties.
- Smart alignment guides, adjustable canvas height, and layouts stored in the portable project file.
- HTML export preserves the chosen layout. A Free canvas export is fixed-position, intentionally **not mobile-reflowing**; users who want responsive embeds should choose Responsive grid.

## Validation

The V1.8 Chromium interaction suite, V1.7.1, V1.7, V1.6 and V1.5 regression tests passed using injected modules. See `docs/QA_V18.md` for detailed evidence and **remaining tests**. In particular, normal-origin IndexedDB persistence and Microsoft PowerPoint desktop rendering remain unverified.

---

# OpenViz Studio V1.7.1 — In-app Text Editing & Tight Slide Charts

This focused update builds on V1.7 and addresses two interface problems reported from real use.

## What changed

1. **Double-click a chart title/subtitle** to edit it directly on the canvas in an OpenViz text field. Double-clicking unrelated chart areas does nothing. Press **Enter** or click away to apply, or **Escape** to cancel. The field expands to fit longer titles. Existing direct dragging, Properties editing and undo/history are preserved. (Other legacy rename/delete commands may still use native browser dialogs; those will be converted in a broader UI pass.)
2. **Presentation charts default to tight bounds** rather than reserving the entire original SVG canvas with its internal margins. A shared SVG crop function measures displayed graphic content and removes unused background, while leaving the source chart unchanged.
3. **Presentation > Properties > Tight bounds** toggles between the fitted chart and its full original canvas. **Include source chart background** is separate. **Fit frame to visible chart** adjusts the selected object's bounding box to its visible aspect ratio.
4. **Slide-edge cropping:** charts can be dragged partly outside the slide. Negative slide X/Y values are permitted via the Properties fields. The slide viewport crops overflow, and the PowerPoint exporter preserves those off-slide coordinates.
5. Cropped/precisely framed charts use an **SVG vector image in PowerPoint** so that export matches the edited slide. Surrounding PowerPoint text and shapes remain editable; the cropped vector chart is not a native editable PowerPoint chart. Users can choose the full source canvas for native PPTX chart export when its type and style are supported.
6. Previously created slide charts are fitted once when first opened in V1.7.1; project data and source-chart styling are unchanged. Save or export the project to preserve the updated slide layout.

## Testing

- `tests/test-browser-v171.py`: Chromium interaction tests for no native dialog on unrelated double clicks, in-place title/subtitle commit and cancel, crop/full toggle, slide-edge dragging, fit command and PPTX XML with negative coordinates and embedded vector graphics. **PASS** using inline injected modules.
- `tests/test-browser-v17.py`: original V1.7 interaction and export regression. **PASS**.
- Normal-origin IndexedDB saving/reopening and full PowerPoint desktop rendering remain **unverified**: the test browser blocks loopback navigation. Verify on the user's regular browser before publication.
- The new behaviour is illustrated by `v171-inline-editor-active.png`, `v171-tight-chart-default.png` and `v171-tight-slide.png`.

To run: extract the ZIP, open a terminal inside the `openviz-studio-v1.7.1` folder, run `py -m http.server 8000` on Windows (or `python3 -m http.server 8000` on macOS/Linux), then open `http://localhost:8000`. You do not need Node, an account or an AI model.

---

# OpenViz Studio V1.7 — Precision Editing & Expanded Chart Library

**Browser-based, local-first software prototype.** No AI model, required account, subscription or Node build step. V1.7 continues from V1.6 and is not yet a production-complete substitute for Tableau, Flourish, Illustrator or PowerPoint.

## Launch the application

1. Extract the **entire** ZIP; the `src/`, `vendor/`, and other folders must remain together.
2. Open a terminal inside `openviz-studio-v1.7`.
3. Start a local static web server: **Windows** `py -m http.server 8000`; **macOS/Linux** `python3 -m http.server 8000`.
4. Open `http://localhost:8000` in your browser. The app cannot run directly via `file://` because it uses JavaScript modules.
5. Choose **Try sample data** from Home, or import your own Excel/CSV/TSV/JSON file.

If port 8000 is occupied, choose another port (e.g., 8001). A normal browser should be used for the remaining persistence/reload checks; the automated Chromium environment here blocks loopback navigation.

## V1.7 features

### Direct-manipulation editing

- **Movable chart titles, subtitles and axis titles.** Drag their text directly. Position changes are stored as pixel offsets from the standard layout, so auto-sizing can still work. Select one to specify exact X/Y offset values in Properties.
- **Movable individual value labels** in supported bar, dot, hbar and line/area visualisations. Turn on **Show value labels** first, then drag a single label. The offsets are keyed by the category/X value; multiple observations with the same X value share one label offset.
- **Resizable annotation boxes.** Select one annotation and drag its small bottom-right handle, or enter its width and height in Properties. Narrowing a text box wraps the annotation text; if the box is too short to contain all its lines, hidden overflow text remains in the annotation's underlying project data.
- **Alignment and distribution tools.** Shift-select two or more unlocked annotations, then use the buttons at the bottom of Layers or **Arrange** menu to align left/center/right/top/middle/bottom. Select at least three notes to distribute them evenly along X or Y.
- **Alignment guides.** When dragging a single annotation, temporary guides appear near the canvas centre or other annotation anchors. Disable them under **View > Alignment guides**. The existing 10px grid snap remains separately configurable; hold **Alt** while dragging to bypass snapping.
- **Copy and paste compatible appearance.** Use **Edit > Copy appearance** and **Edit > Paste appearance** (or **Ctrl+Alt+C / Ctrl+Alt+V**, when no input is focused). Works with annotations, titles/subtitles and series/points when appropriate, without altering data or layout.
- All changes above integrate with existing **Undo/Redo**, portable project files, SVG/PNG/standalone HTML exports and the PowerPoint fidelity fallback.

### Chart library: 11 working types

The prior seven types remain: column chart, horizontal bar, line, area, scatter, dot and donut.

V1.7 adds:

1. **Histogram**: frequencies of values in a numeric Y field. `histBins` supports 2–40 equal-width bins.
2. **Box-and-whisker plot**: per-group median, Q1, Q3, 1.5×IQR whiskers and outlier markers, calculated from *raw numeric observations* (not averages of aggregates).
3. **Stacked columns**: categories on X, numerical Y measure and a distinct `Series / second dimension` field. Segment values follow the chosen aggregation. Negative segments are currently omitted with a warning; do not use this mode for data that require signed stacks.
4. **Heatmap**: categories on X and a distinct second categorical dimension, numeric measure shown by colour intensity. Values follow the chosen aggregation; individual cells can be recoloured as overrides.

Browse all 20 listed chart types via **Insert > Browse chart catalogue**. Unsupported types remain clearly labelled **Planned**. Stacked columns and heatmaps auto-suggest a valid second dimension when one is available; the mapping is editable in Properties > Data.

### Accuracy and exporting

- Box plots do not force the numeric axis to start at zero unless the user explicitly sets it.
- Chart warnings identify missing series fields, negative stacked values, unsound aggregations, and currently truncated category groups. Stacked/heatmap charts currently display up to 32 categories × 16 groups, and box plots show up to 50 groups. Filter before publication if these limits apply.
- SVG and portable project exports preserve title and axis-title position, individual value-label offsets, annotation sizes and per-cell/segment colours.
- **PPTX:** native editable charts remain possible where supported by the existing exporter. Advanced customisation requires a *vector SVG fallback* inside PowerPoint to preserve visual accuracy; a vector image is not a fully editable native PowerPoint chart. Surrounding slide text and shapes remain editable.
- Note: source scripts are intentionally modular JavaScript, with vendored JSZip and PptxGenJS in `vendor/`. This release does not introduce external AI or a telemetry service.

## Testing

- `tests/test-browser-v17.py` — automated Chromium interaction suite, using inline injected modules because the test browser blocks HTTP loopback. Covers title/value-label drag, annotation sizing, alignment/distribution, style clipboard, all four new charts, and project/SVG/PPTX export.
- `tests/test-browser-v16.py` — previous release's regression suite; passed on the updated codebase.
- `tests/test-browser-v15.py` and `tests/test-browser-v15-extended.py` — prior editing and export regressions; passed in the updated codebase.
- `docs/QA_V17.md` — test evidence, limitations and remaining validation.
- `docs/CLAUDE_HANDOFF.md` — engineering continuation priorities.

## Known limits / next release

- Titles and axis titles use **offset positioning**, not independent freeform text containers. Pixel-precise grouping, rotation and handles for all text objects remain to be built.
- Annotations can be resized but do not yet support arbitrary shape/path editing, rich text spans or automatic fit-to-content controls.
- Alignment guides and distribution currently apply to **annotations**, not every element type or a mixed group of charts/notes/shapes.
- The style clipboard transfers compatible basic appearance properties, not a universal cross-object style system.
- Current charts are mostly single-measure; stacked/heatmap series require extra data mappings and currently have stated display limits.
- Real-origin IndexedDB persistence across reloads, Firefox/Safari/Edge parity, keyboard/screen-reader QA, and large-file performance remain outstanding tests.

This is an iterative build. Please review the application in a normal browser before using it for high-stakes analytical, research or publication work.
