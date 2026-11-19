# V3.37 handoff

New map-locator-view.js exports pure locatorReaderView(model,frame,k,cx,cy). Validates v1/kind/arrays; intersects normalized pre-transform reader rectangle with exact projected geographic rectangle. Inverts latitude via linear/local, Mercator atan(exp), equal-area asin, longitude linearly/unwrapped. Splits dateline and computes 3px-min focus rectangles in inset coordinates. Empty padding returns {extent:null,rects:[]}; invalid returns null.

mapLocator now receives projection as optional fourth arg. With navigation enabled, emits escaped data-locator-model: version/kind/view/plot (raw projected NW/SE screen coords) and inset rectangle. geo.js/regional-map.js pass their existing projection, accounting for padding/symbol margins. Without nav, static appearance remains unchanged.

map-navigation.apply updates locator for every responsive SVG from its own metadata. WeakMap snapshots original focus nodes/title/aria label; restore on invalid model/disconnect. Runtime removes/replaces only focus rectangles and updates data-locator-live/view and accessible description. No project state. Rect changes do not trigger SVG-replacement observers. Dynamic helper definition serialized before navigation in chart-interactions and story-map-reader runtimes.

Map appearance hint/status/index/publishing v3.37. New tests/test-live-locator-v337 and extended studio checks; 38 suites pass. Current-runtime examples v337-* contain eight maps, dashboard and two stories. render-live-locator-v337 generates 32 actual runtime SVGs, no measurement shim. Native browser unavailable; see QA_V3_37.md. Historical versions retained.

Next: route/connection maps, a new geographic chart option for start/end coordinates and journeys/flows. First inspect FIELD_BINDING_KEYS, data contracts, geo rendering and template catalogue. Use explicit origin/destination roles, disclose missing/invalid coordinates and aggregation, preserve source rows, handle dateline/wrapped maps and portable/story/export paths. Avoid adding external geocoding/tiles/network dependencies without a concrete user request.
