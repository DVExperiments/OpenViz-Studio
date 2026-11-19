# V3.35 handoff

New story-map-reader.js exports installStoryMapReader(anchor,{pause}), storyMapCss and serializable storyMapRuntime. It owns an Explore/Close section, renders only complete scene SVG, namespaces IDs, installs chart interactions on a fresh HTML mount and disposes it on close. update(svg,key,label) resets on scene-key changes; reader state is never written to a project.

New svg-namespace.js extracts the existing robust nested-SVG scoped ID/reference remapper from story-scroll, adding optional doc for serialized reader use. Namespace reader copies to avoid clashes with animation/sticky/reading SVGs. map-exploration/navigation scope resolution now prefers explicit HTML data-map-reader-scope to avoid inserting HTML controls into SVG compositor layers.

standaloneStoryHtml adds complete sceneViews/labels to its frame-budget/payload. installStoryPlayer closes reader on play/seek/navigation and pauses on Explore. Story Studio similarly owns/disposes reader per render/page; source scene views cache per index until source/editor re-render. No animation-stage controls. Scene map SVG still uses existing scene compositor at final time.

scrollStoryHtml embeds definitions/CSS only when interactive. installScrollStory mounts independent readers in each chapter figure; sticky draw disposes its old mount and installs a fresh one only on a complete frame, never transition samples. Fresh HTML mounts avoid reused disconnected interaction instances and event accumulation. Layout/dispose clears sticky controllers. Existing focus guard and explicit navigation retained. Static exports remain script-free.

36 suites pass, new tests/test-story-maps-v335.mjs plus extended studio workflow. No native browser acceptance. Examples v335-* include portable two-story project and player/scroll/static reading HTML. See QA_V3_35.md. Retain older docs/history.

Next: make Locate reveal pinned/search places by bounded recenter/zoom when navigation is enabled. Use current rendered geometry, handle unavailable/duplicate points, ensure scope isolation, source safety, animation exclusions and keyboard focus. Do not silently alter authored extents or data.
