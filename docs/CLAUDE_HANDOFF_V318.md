# OpenViz Studio V3.18 handoff

Read README.md and QA_V318.md. V3.18 implements saved scene views and conservative matching-mark transitions. Chart count remains 43.

## Code

- src/story-state.js: bounded view settings, named periods, role-based filters, resolver and per-scene sources. Scene sources key by scene index, with a legacy chart-ID fallback in story.js. Do not memoise filtered source rows using the old preview cache (its keys omit row content).
- Saved presentation state excludes type, data bindings, aggregation, image assets, race captions, positional offsets and dataset rows. These remain linked. Periods resolve by exact label after filtering; missing periods/fields/empty results block export. Role-based filters follow renamed chart mappings without embedded field-name rewrites.
- buildStorySources copies chart configuration before reserving uniform caption space. It never changes the original chart or dataset. Returns sources plus explicit scene errors; app and Publishing Studio use the same builder.
- src/story-transition.js: strict same-chart/type/fixed-axis checks, unique 1–400 rectangle/circle marks, key matching and numeric geometry/hex colour interpolation. No arbitrary SVG paths or inferred IDs. Missing marks fade at their observed geometry. Incompatibility crossfades and is explained in inspector.
- src/story.js: scene state preserved by normalisation, scene-index source lookup, matching/crossfade fallback, clean caption fade phases, important sampled boundaries, bounded standalone player/static fallback, scene navigation/reduced motion/tab pause. Incoming matching scenes skip layer reveal and show full saved source. GIF variable delays preserve duration; rasterize callback supports exact fixture verification.
- src/story-examples.js and app.js: editable illustrative three-scene example, capture/recapture/link switch, per-scene title/period/bounds/map/filter controls, stale filter context guard, Undo. Source changes clear saved state/focus.

## Next

Scroll-driven story chapters with explicit navigation and accessible static reading fallback. Keep scene-view semantics/source safety and reuse the authoritative builder. Do not claim complete Flourish parity. Broad path/axis morphing, native video validation and managed publishing/collaboration remain gaps.

Keep compact Preview/Data, default-open Project, collapsible sidebar, reviewed data switching, Home Templates/search and map-source note toggle. Deliver a complete ZIP and Windows server command, state validation limits honestly, and end with what's next.
