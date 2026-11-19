# V3.34 handoff

Added src/map-navigation.js: independent dependency-free installer and CSS, serialized through chart-interactions. Controller per time stage/dashboard frame/responsive chart, normalized center/zoom, bounded 1–8×. Shared transforms for every responsive/time SVG. Context excludes time period; includes source/mappings/projection/crop/boundary settings. Pan controls, opt-in drag, inverse screen CTM, pointer capture, cancellation, movement threshold/click suppression, cleanup. No wheel or pinch handling. Runtime receives isEditing callback so exported scripts contain no editor-class dependency.

map-exploration-meta.js adds optional navigation root/frame metadata. geo.js/regional-map.js emit clipped data-map-pan-layer groups only when geoNavigationEnabled; fixed plot ocean/title/legend/locator. Symbols/labels magnify. Context/source change resets view. Existing disabled render layering preserved. Search/pin independently enabled, Locate remains focus/highlight only.

DEFAULT_CHART.geoNavigationEnabled=false; validateMapTooltip validates boolean. Map appearance checkbox and Try zoomable map example; example uses fictional regional data with search and tooltips. app syncs canvas-editing mode before refreshing interactions, so controls are visibly disabled while authoring. Status/index/publishing release version 3.34.

35 suites pass. Native browser launch unavailable. See QA_V3_34.md. Full regression uses test-runtime jsdom via OPENVIZ_DOM_MODULE; no development dependency is required to run the app. New navigation suite and extended studio suite test reader state separate from project/Undo, exports and example creation. Examples retained in examples/v334-*; prior releases/docs preserved.

Next batch: install exploration/navigation into story/scroll chapter compositions with scene-scoped state and no leakage into static fallbacks. Inspect story-state/story-scroll and publication paths first; do not simply install twice on overlapping roots.
