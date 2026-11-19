# Map resource provenance — V3.50

Provider links checked 18 November 2026 against official pages. This is a source guide, not an automated update feed or legal review of every layer.

| Resource | Official source | Scope / reuse guidance |
| --- | --- | --- |
| Natural Earth | https://www.naturalearthdata.com/about/terms-of-use/ | Official terms put all versions of Natural Earth vector/raster map data in the public domain. OpenViz reuses its previously bundled simplified 1:110m country/area snapshot, not a fresh download. Source release vintage is not independently verified. |
| Stats NZ Geographic Data Service | https://datafinder.stats.govt.nz/ | Official NZ statistical areas, territorial authorities and regional councils. Use its Current Geographic Boundaries Table for appropriate versions; check the individual layer’s license and identifier fields. No Stats NZ geometry is bundled by this batch. |
| US Census cartographic boundaries | https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html | Small-scale thematic boundary files and geography vintages. Common formats include Shapefile, geodatabase, KML and GeoPackage; conversion/reprojection is needed for OpenViz. Preserve geographic identifiers as text. No Census geometry is bundled by this batch. |

Included copies: 176 single country/area outlines plus 7 continent collections and 1 world layer (184 resource records total). One collapsed polygon ring is dropped for strict normalization, with no feature omitted; original WORLD basemap is unchanged. Political boundaries/coastlines and small-island coverage are simplified, not authoritative. Generated NE- IDs are valid only for the bundled snapshot. Global GeoJSON is downloadable for external GIS; use the built-in world map inside OpenViz because the regional importer caps longitude span at300°. No hidden relaxation of that limit.
