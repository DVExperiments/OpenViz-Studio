# OpenViz Studio: usability walkthrough (V3.63 → V3.64)

*Walkthrough on 20 November 2026 in Chrome at 1366 × 768. The persona was someone who isn't comfortable with technology and has never used a charting tool.*

## How it was tested

The persona doesn't know words like dataset, aggregation, choropleth, iframe or raster. They click the most obvious button, read only what is on screen, rarely scroll, and don't open menus unless they're stuck. Each task started from a fresh browser with a simple spreadsheet: a shop's monthly sales, or visitors by New Zealand region.

| # | Task | Before (V3.63) | After (V3.64) |
|---|---|---|---|
| 1 | Import a spreadsheet and make a chart | Slow: you land on "Connect your data", then face 79 templates shown with example data | Suggested charts appear straight away, drawn with your own numbers |
| 2 | Change what the chart shows | Fixed in V3.63 (Data & axes in Settings) | Settings now start with only the everyday sections |
| 3 | Change the title and bar colours | OK: double-click the title, click a bar | Same |
| 4 | Save the chart as a picture, PDF or PowerPoint | **Blocked**: "Publish & export" offered only website publishing | "Save or share" offers Picture, PDF and PowerPoint first |
| 5 | Map values by NZ region | **Blocked**: blank map, "No compatible data. Check field mappings." | The app spots NZ regions and offers "Show New Zealand's regions" |
| 6 | Come back later and carry on | **Blocked**: "Your projects" sat below 12 template previews | "Your projects" now sits directly under the start options |
| 7 | Publish on a website | Possible, but full of jargon | Unchanged (see remaining issues) |
| 8 | Build a dashboard | Possible, but full of jargon | Unchanged (see remaining issues) |

## Findings, ranked

### Blocking: the person gives up (all fixed in V3.64)

1. **No visible way to save a picture, PDF or PowerPoint from the chart editor.** The editor's main button opened the Publishing Studio, which covers HTML, iframe code and Team Server only. PNG, PDF and PowerPoint were in a separate dialog reachable only from the Data page.
   - **Fix:** the button is now **Save or share**. It opens one dialog grouped in plain words:
     - *Save a copy:* Picture (PNG), PDF, PowerPoint, video
     - *Put it on a website:* web page or embed code, interactive file
     - *Keep a backup:* project file
     - *More formats:* SVG and static HTML, for designers and developers
2. **Region names lead to a dead end.** A spreadsheet of NZ region names on a shaded map drew nothing and blamed "field mappings".
   - **Fix:** when a map's names match no country, the app checks them against the region names of 213 countries, using a 62 KB index loaded only when needed. It then offers, for example: *"These look like regions of New Zealand. 7 of 7 names match. [Show New Zealand's regions]"*.
   - Matching is forgiving. It ignores accents, punctuation and words like District or City, so "Manawatū-Whanganui" matches "Manawatu-Wanganui" and "Gisborne" matches "Gisborne District".
   - This "Forgiving" match rule is also available when joining your own boundary files.
3. **Saved work looked lost.** On returning, "Your projects" appeared at the bottom of the home page, below 12 template previews.
   - **Fix:** it now appears directly under the three start options.

### Slows people down

| # | Issue | Status |
|---|---|---|
| 4 | After importing, you land on "Data / Source manager: Connect your data." and must find "Browse chart types". | **Fixed.** Importing from Home opens the chart chooser straight away. The data page is now titled "Check your data", with a **Make a chart →** button. |
| 5 | The chooser previews used example data. The first three cards for monthly sales were Editorial table, Route & connection map and Column chart. The intro text was jargon. | **Fixed.** When you have data, the chooser opens on **Suggested for your data**: 4–5 plain charts chosen from your columns, previewed with your numbers. Line comes first for months and years, columns or a donut for a few categories, horizontal bars for many. |
| 6 | The Settings panel had about 20 sections, including "Precise plot margins", "Drill-down (live publications)", "Publication / figure formatting", and two both called "Value labels". | **Fixed.** Settings now shows the everyday sections: Data & axes, Styles, Title & text, Colours, Value labels, Legend and Accessible design. **Show all settings (N more)** reveals the rest, and the choice is remembered. The duplicate is renamed "Which values get labels". |
| 7 | Default titles read like code: "Column chart · Sales by Month". | **Fixed.** New charts are titled "Sales by Month", and the title follows field changes until you edit it. |
| 8 | Map names were jargon: "Choropleth map", "Proportional-symbol map". | **Fixed.** Now "Shaded map (choropleth)" and "Bubble map (proportional symbols)". |
| 9 | Line charts of months warned "The X field is categorical. A line may imply continuous ordering…" | **Fixed.** No warning for month, weekday or quarter names, and plainer wording elsewhere. |
| 10 | Field labels in Data & axes said "Region data join key" and "Country / ISO code". | **Fixed.** Now "Region names or codes" and "Country names or codes". |

### Still to do (not changed in V3.64)

| # | Issue | Suggested fix | Priority |
|---|---|---|---|
| 11 | **Fixed in V3.65.** First launch saves a sample project, "Regional sales analysis", that the person never made. New projects also come with an empty "My dashboard" and "Slides (1)". | Don't save the sample until it is edited. Create dashboards and slides on first use. | High |
| 12 | **Fixed in V3.65** (backup reminder, backup status, Back up on each project). Work lives only in this browser. Clearing browser data or switching computers loses it. The warning is a line at the bottom of Home. | A gentle reminder after the first chart ("Keep a backup?"), and a one-click backup on Home. | High |
| 13 | **Fixed in V3.65** (three plain steps). Publishing Studio jargon: iframe, Team Server, "Content mode", "Layout preset", "112,316 HTML characters". | A plain first screen ("Put this on a website: 1. Download 2. Upload to your site 3. Paste this code"), with the options under "Advanced". | Medium |
| 14 | **Fixed in V3.65.** Dashboard jargon: "Linked field", "Highlight matching marks", "Responsive grid / Free canvas", "Comparison chooser". | Plain labels ("When someone clicks a bar…"), and a single **Add chart** first. | Medium |
| 15 | **Fixed in V3.65.** The sidebar uses Datasets, Visualisations, Visual stories, Design versions and "Local-first workspace". | Data, Charts, Stories and Saved versions. | Medium |
| 16 | The chooser still shows 14 group chips plus Category, Show and Preview dropdowns. | Put the dropdowns behind a "Filters" button. | Medium |
| 17 | "1 Choose a template / 2 Connect data / 3 Design & share" look like buttons but do nothing. | Style them as a step indicator, not buttons. | Low |
| 18 | Status lines and warnings use analyst wording, such as "Sum of Sales per Month." or "No compatible geographic observations". | Rewrite the 20 most common warnings in plain English, each with the action to take. | Medium |
| 19 | The region map counts tiny outlying islands as "unshaded" ("7 of 24 regions have values; 17 remain unshaded"). | Count mainland regions only, or say "No data for 17 areas, mostly small islands". | Low |
| 20 | The "Select element" dropdown has 16 technical options, such as "Individual value label" and "Data series". | Hide it in the simple view; clicking on the chart already works. | Low |
| 21 | Many template names are expert terms: Beeswarm, Ridgeline, Marimekko, Editorial table. | Add a plain one-line "Use this to…" under each name. | Low |
| 22 | **Phone and tablet checked and fixed in V3.65**; screen readers and real people still to do (test kit ready). Phone and tablet layouts, screen readers and real people were not tested in this round. | Run the 5-person test (test kit available on request). | High |

## Verification of the fixes

- Each fixed task was walked through again in Chrome.
  - Monthly sales: import opens the suggestions, Line chart is first, and the picture downloads.
  - NZ regions: the suggestion appears, and one click shades all 7 regions.
  - On returning, the projects show under the start options.
- **Node suite:** 61 pass and 9 fail. The 9 failures are the same baseline as before. The new test is `tests/test-v364-usability.mjs`.
- **Browser flows:** clean for every template type and option, the V3.58 and V3.60 flows, and the keyboard walkthrough.
- **Accessibility (axe-core):** 0 violations on 19 screens, plus the template groups and map library in light and dark themes. This round also fixed one existing issue: project cards' accessible names didn't match their visible names.
