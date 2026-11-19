# V3.61 handoff (country starting points, template groups)

The baseline is V3.60.

## `src/map-library.js`: country starting points

- `STARTER_COUNTRIES` has 221 entries. Each has `{iso3, name, outline?, admin1?, regions?, counties?}`.
  - It is built from the outline resources plus the admin-1 boundary sets.
  - France and Norway get their ISO3 code from `ISO3_FIX`.
- Lookup helpers: `starterCountry(iso3)`, `searchStarterCountries(query)` (2+ characters), and `countryStarterResource(iso3)` (the admin-1 set, else the outline).
- `countryStarters(iso3)` returns card metadata with ids `country:ISO3:kind`. The kinds are `regions` (only when there is an admin-1 set), `places`, `locator`, `density` and `hexbin`.
- `countryStarter(id)` returns `{name, rows, settings}`. **Its resource must be loaded first** (`ensureBoundarySet`); the UI does this through `readyResource`.
- Point positions:
  - Points are representative points inside regions: the polygon centroid, or the middle of the widest horizontal span when the centroid falls outside the polygon.
  - Points are chosen by farthest-point sampling among the larger regions (`spreadAnchors`), so they cover the whole country.
- Framing:
  - `mainShapes` drops outliers further than twice the 75th-percentile distance from the median point. This frames on the main territory.
  - `countryExtent` uses `shortestLongitudeBounds`, so countries crossing the antimeridian work. It ignores islands under 8% of a region's largest polygon.
  - Point starters use the world basemap with `geoExtent` and `geoDetail:'detailed'`. Regions starters use the admin-1 set with the same `geoExtent`.

## `src/editor/map-library-ui.js`

- `openMapLibrary({fromCatalogue})` snapshots `catalogueUI` and `chartChooserContext`. `backToTemplates()` reopens the chooser and restores the group and search.
- The Starting points tab has a `#mapLibraryCountry` select, handled by `setMapLibraryCountry`. That function loads the set, then renders.
- `starterItems(query, country)`:
  - With a country chosen: that country's cards plus the general world starters. The NZ and Pacific examples are hidden.
  - Without a country: matching countries appear as "Show maps for …" cards (`map-library-country`), followed by the starters. The NZ and Pacific starters are pilled "example: …".
- `createMapLibraryDesign` handles `country:` ids.

## `src/catalogue.js` and `editor/catalogue-ui.js`: groups

- `CATALOGUE_GROUPS` is a list of categories or tests. `catalogueSearch(query, category, show, group)` takes the group as an optional fourth argument.
- The chip row is now `role="group"`, with `aria-pressed` and counts.
- `catalogueUI.group` is set by `catalogue-group`. It is reset by All, the category select, `v36-catalogue-reset` and `template-category`.
- `catalogue-new` now sets the `new` group. It used to search the tag "new in 3.53".

## Other fixes

- **`geo.js`:** the escape helper was missing `'`, so tooltips read "undefined".
- **`ui-refresh.css`:** group chip styles, the back link, and dark-mode text colour for primary CTAs and pressed chips.
- **Version:** the status bar and title now read v3.61.

## Tests

- New: `tests/test-v361-country-maps-groups.mjs` builds every country's starters (about 1,100). It checks rendering for six awkward countries, plus framing, spreading, apostrophes and group coverage.
- **Node suite:** 59 pass and 9 fail. The failures are the same baseline as before.
- **Browser:** the V3.60 flow is clean.
- **Accessibility:** axe finds 0 violations on 19 screens and on the template groups and map library in both themes. The dark contrast issue on the home page was fixed. The keyboard walkthrough is clean.
