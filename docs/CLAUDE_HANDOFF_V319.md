# OpenViz Studio V3.19 handoff

Read README.md and QA_V319.md. V3.19 adds scroll story delivery, chapter narrative and no-JavaScript reading output. Chart count remains 43.

## Code

- story.js: fresh/normalised delivery (player default, scroll opt-in), introduction, scrollTransitions and per-scene chapterTitle/chapterText/chapterDescription. storySceneSvg renders a complete isolated ending pose from the existing scene source, avoiding overlapping neighbours.
- story-scroll.js: bounded plan/compiler, SVG namespace isolation by nested SVG scope, escaped plain-text paragraphs, complete chapter articles, desktop sticky stage and optional nine-sample overlap transitions. Reading mode is the default document without JS. Runtime uses viewport positions, native chapter navigation/heading focus, media/observer fallback, explicit reduced-motion states and focus-aware stage updates. No remote scripts, parent messages or auto page resizing.
- story-examples.js: illustrative authored three-chapter example using the v318 saved-view example, with exact named periods and explanatory descriptions.
- app.js: delivery/introduction/chapter controls, example creation/Undo, actual exported HTML preview frames, script-free reading download and narrative HTML routing. Animation/GIF/video remain separate from scroll navigation.
- publishing.js: interactive scroll or static whole-article reading for delivery=scroll; legacy player behaviour preserved. Narrative iframe option uses min-height 600px; app copy/update/readme routes pass the same narrative flag.

The lower-level standaloneStoryHtml helper remains the animation player. App/export and Publishing Studio explicitly route scroll stories to scrollStoryHtml. Do not accidentally feed saved scenes through a chart-ID-only dictionary or alter original datasets.

Important: rendering chart content and paragraph structure was verified independently; native browser CSS sticky/print/iframe rendering is NOT verified. A normal Chromium launch failed because the packaged browser executable is missing. No bypass attempted. DOM tests use controlled geometry/media/observer mocks. Native screen-reader, Windows and video validation remain pending.

Next batch: custom GeoJSON boundaries and regional choropleths. Start with a bounded local import, explicit join-key review, safe geometry handling, missing-region reporting and portable assets; keep fixed time domains and story source safety.

Preserve compact Preview/Data, default-open Project, collapsible sidebar, reviewed data source switching, Home Templates/search and map-source note toggle. Deliver complete ZIP + Windows server command and finish with what's next. No complete competitor parity claim.
