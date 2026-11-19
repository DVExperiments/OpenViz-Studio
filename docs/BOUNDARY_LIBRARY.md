# Boundary library (V3.60)

OpenViz ships with 267 ready-made boundary sets in `src/boundaries/`. Each set is a separate GeoJSON file, fetched only when someone uses it, so the app's start-up size does not change.

| Kind | Sets | Source | Join key (`region_id`) |
|---|---|---|---|
| States, provinces & regions | 213 countries | Natural Earth 1:10m admin-1, public domain | ISO 3166-2 code (e.g. `DE-BY`), or `ISO3-NAME` where Natural Earth has no unique code |
| US counties | 54 states and territories with two or more counties | US Census cartographic boundaries via us-atlas, public domain | 5-digit FIPS code (e.g. `06037`) |
| Detailed world (the "Border detail" option) | 1 file | Natural Earth 1:50m admin-0, public domain | ISO3 |

Every feature also carries `name`, and where available `local_name`, `type` (e.g. "State", "Department"), `iso3` or `state`.

## What is left out, and why

- Countries whose admin-1 layer has a single shape (a one-region choropleth is not useful) and Antarctica.
- Washington DC as a county set (it is one county).
- Natural Earth sometimes gives several current regions the same old ISO code (Madagascar is an example). Those regions keep separate, name-based ids instead of being merged.
- Pieces of one region with the same name and code (e.g. a city and county council) are merged into one shape.

## Accuracy

These are simplified screen-resolution outlines (about 4% of the original admin-1 vertices are kept), suitable for choropleths and locator maps. They are not an official register. Disputed borders follow Natural Earth's de facto policy. For legal, electoral or statistical boundaries, import the official file for that country with **Map library → Official sources & import guide**.

## Rebuilding

`tools/build-boundaries.mjs` regenerates the whole folder. It needs three public-domain inputs and two npm packages, which are installed outside the repo so the app stays dependency-free:

```sh
mkdir -p /tmp/ne /tmp/ms && cd /tmp/ms && npm i mapshaper topojson-client us-atlas
cp node_modules/us-atlas/counties-10m.json /tmp/ne/
# Natural Earth downloads, converted to GeoJSON:
#   ne_10m_admin_1_states_provinces  -> /tmp/ne/admin1.geojson
#   ne_50m_admin_0_countries         -> /tmp/ne/admin0_50m.geojson
cd <repo> && node tools/build-boundaries.mjs --in /tmp/ne --modules /tmp/ms
node tests/test-map-library-v350.mjs && node tests/test-v360-templates-maps-text.mjs
```

The tests check that every set exists, loads, has unique ids that match its `count`, and passes the same validation as an uploaded GeoJSON file. If the number of sets changes, update the `MAP_RESOURCES.length` check in `tests/test-map-library-v350.mjs`.
