# V3.54 handoff — highlights, sparklines, organisation themes

Baseline V3.53.

## Highlights (`charts.js`)

- New exports: HIGHLIGHT_TYPES, highlightList, highlightLayers. The chart setting is `highlights`: [{id, kind: 'value-band' | 'category-band' | 'callout', from, to, label, color, target, text, dx, dy, hidden}].
- Hooked into three branches, each skipped for time views:
  - the generic bar/line/area/scatter branch (orient 'v'; numeric X for scatter)
  - the hbar/dot branch (orient 'h'; rows as categories)
  - the bubble branch
- Bands go into `svg` before marks. Labels and callouts go into `refOverlay`, which is drawn after the marks.
- `app.js`: highlightControls, a document change listener on `[data-hl-id]`, and actions `hl-add` / `hl-delete`.

## Sparklines (`editorial-table.js`)

- New chart settings: tableSparkFields (ordered, max 24), tableSparkLabel, tableSparkStyle (line | bars), tableSparkScale (row | shared).
- tableModel returns `spark` and `sparkIssues`. sparkIssues never block the table; they surface through chartWarnings.
- sparklineSvg is shared by the HTML and SVG outputs. sparkCell carries data-table-value = latest value, which drives sorting.
- `app.js`: sparklineControls inside tableAppearanceProperties, a `[data-spark-field]` listener, and the `spark-clear` action. The example-copy sites also copy the spark fields.

## Organisation themes (`brand.js`)

- Exports: normalizeBrand (strict validation), applyBrand / removeBrand, brandFooterHeight / brandFooterSvg, chartPalette, brandExample.
- Applying copies `style` properties, `palette` and `brand` {byline, footerNote, logo} onto each chart, so every exporter renders it without project context. `chart.brandSeen` marks charts that have already been handled.
- `project.brand` holds the package. In `app.js`, markDirty → autoApplyBrand applies it to unseen charts when `applyToNew` is on; "Save theme only" stamps existing charts as seen.
- `charts.js`:
  - font() now accepts any safe font string
  - the palette is taken from chartPalette
  - the bottom margin reserves space for the footer
  - the source note moves up above the footer
- Palettes are also respected in pro-charts.js and expanded-charts.js. advanced.js (sankey/network/etc.) still uses its own fixed palette.
- The theme studio UI is openBrandStudio / renderBrandStudio / saveBrand, plus a change listener scoped to `.brand-studio`.

## Not done

- No brand footer on editorial-table SVG/HTML.
- Highlights are not available on time-snapshot views or on the V3.53 families.
- Highlights cannot be dragged on the canvas; offsets are numeric.
