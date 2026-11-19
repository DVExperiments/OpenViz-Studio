# V3.63 handoff (Data & axes in Settings, better default fields)

## The problem

A user imported an ArcGIS districts table and created a column chart. The chart was useless and the user could not find how to fix it.

- The app picked `RegionCode` as the category and `OBJECTID` as the value, so the chart showed the sum of OBJECTID by region.
- In the Studio, the field choices only live in the **Data** view (the Preview | Data switch above the canvas). The Settings panel in Preview had no field controls at all.

## Changes

- **`data.js` `suggestDefaultFields(rows, numeric?, fields?)`** returns `{x, y}`. It is used by `applyChartChooser` (catalogue) and by the app's own create path.
  - Columns are treated as identifiers when their name looks like an ID (`ID_NAME`), or when they hold unique integers and the name suggests an id or number.
  - Geometry columns (`GEOM_NAME`) are used only as a last-resort measure.
  - Category scoring:
    - Time names score +6.
    - Name, region and similar names score +4, with an extra +2 for name, title or label.
    - Code-like names or values score −5.
    - Columns with 2–60 distinct values score +2. Columns with fewer than 2 distinct values score −8.
  - Numeric time fields such as Year still qualify as categories.
- **`app.js` `quickFieldsSection(c, d)`** is the first Studio section in Preview (`quick-fields`, open by default).
  - It shows up to 4 binding fields from `fieldSpecs(c)`. `timeField` and `proTimeField` are left to Time controls.
  - It adds an aggregation select when `usesAggregation(type)` and the chart has a value field.
  - It links to the Data view (`studio-data`).
  - It uses the standard `data-setting` selects, so undo, re-render and the stale-warning logic work unchanged.
- **`updateChartSetting`:** when `x` or `y` changes and the title still equals the automatic pattern `"<Type> · <y> by <x>"`, the title is regenerated.

## Tests

- `test-v362-excel-prefixed.mjs` adds the V3.63 default-field cases: GIS table, Year, Country with ISO codes, and measures before geometry columns.
- `test-profile-studio-v351` caught a duplicate `timeField` select. It is excluded now.
- **Node suite:** 60 pass and 9 fail. The 9 failures are the same baseline as before.
- **Browser:** the V3.60 flow is clean, as are the axe audit (19 screens) and the keyboard walkthrough.
- **Manual check with the user's file:** the chart defaults to Shape__Area by DistrictName. Switching to RegionName with Average updates the chart, the title and the summary line.
