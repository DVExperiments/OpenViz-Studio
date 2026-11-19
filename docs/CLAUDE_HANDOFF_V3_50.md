# V3.50 handoff — map library

Baseline V3.49. New map-library.js wraps the shipped WORLD snapshot with searchable resource metadata, cleaned download copies, blank CSV join templates, eight independent editable starter factories and official source links. Country/area count176;7 continent collections;1 world collection. Catalogue45 and snapshot types17 unchanged.

One collapsed ring/polygon is omitted in download/regional resource copies; no feature removed and WORLD never mutated. resourceGeoJSON clones geometry. All183 nonglobal resources normalize using the existing regional limits. Global extent exceeds the regional importer’s300° limit, so resourceStarter(world) uses built-in country-name rendering, its CSV uses Country, and custom review is disabled. Other resources use snapshot-local region_id / RegionID generated keys, explicitly not official codes.

App integrates Home/Templates/map appearance entry points and search/kind/paged browsing. Source-provider URLs are static HTTPS links opened only by user action. Creating adds an undoable dataset/chart; Home starts a new project only on selection. Reviewing with existing map data stages asset/key/label in regionalContext; Apply uses the unchanged guarded regional manager and source rows remain unchanged. UI styles use existing theme variables. Pacific route starter overrides global example framing with wrapped fit + locator.

Six focused suites pass; see QA_V3_50.md. No comprehensive/native acceptance claim; user deferred it. Generator/examples and resource inventory included. Next: richer time playback, stacked areas then shared-scale small multiples; then broader template depth/editorial consistency. See QUALITY_GAP_PLAN_V3_50.md and REMAINING_WORK_V3_50.md.
