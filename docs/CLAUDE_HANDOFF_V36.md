# OpenViz Studio V3.6 — engineering hand-off

## Standing product direction

The user has explicitly chosen quality of **data visualisation** over feature sprawl. This platform is free, browser-based, local-first and does not require an account, AI model or API to work. Avoid developing a full spreadsheet, a general video editor or another unrelated workspace. The goals are approachable creation, high-end aesthetic polish, deep customisation, good defaults, non-AI chart guidance and strong exporting. Flourish is inspiration for the template-first UX, not a visual clone or a source of code/assets.

## Architecture and compatibility

- `src/app.js`: main SPA UI, current project and workspace navigation, basic/advanced chart inspector, catalogue route, import routing and toolbars.
- `src/styles.css`: desktop/editor and responsive layout, V3.6 Home, gallery, compact toolbar, mode bar, inspector and mobile contextual controls.
- `src/catalogue.js`: chart metadata and example datasets. Defaults for time series now use numeric year data.
- `src/publishing.js`: V3.5 publishing and iframe rules; preserve privacy and HTTPS URL validation.
- Existing `src/` modules for chart calculation/rendering, story motion, project storage, PPTX/PDF export and security remain untouched except where necessary. Preserve data integrity, imported raw data, undo, typed field bindings and portable `.openviz` compatibility.

## New UI flows

1. Home > Start with your data: choose and parse a file, then create a separate project.
2. Home > Explore visualisations: curated initial 12, category filter, search, explicit Show all to expand.
3. Home > Gallery > Try example: new project with illustrative dataset and chart.
4. Home > Gallery > Use my data: select template first; CSV/XLSX upload then creates the selected chart in a new project. Do not mutate an unrelated project.
5. Chart Editor > Essentials (default): field mappings + quick design/share; Advanced gives exact specialist controls. Preference persists per browser.
6. Chart Editor > Direct click: element inspector takes precedence; Back to chart settings returns to current Essentials/Advanced inspector.
7. Mobile/tablet: contextual controls open Project and Properties panels, avoiding a canvas that is unusably narrow.

## Implementation rules

- Do not remove expert chart features to simplify the beginner view. Use progressive disclosure.
- Avoid duplicative buttons, native browser `prompt()` in core editing flows or hidden destructive actions.
- A preset must be a starting point; all appearance controls remain accessible in Advanced.
- On import failure/cancel, avoid creating ghost projects. Do not silently re-map chart fields or mix data from different existing projects.
- Maintain explicit distinctions between template examples, genuine user data and sampled previews. Avoid false scientific/publication-standard compliance claims.
- Keep static and animated export behaviour deterministic, and audit security of user-provided text/filenames/links.
- Preserve current saving/conflict safeguards, project recovery and existing dashboard and slide behaviours.

## Tests and gaps

See `docs/QA_V36.md`. Run `tests/test-browser-v36.py` and the V3.5 publishing, V3.4 linking and V3.3.1 contracts before changes. Isolated Chromium passes do not certify real-origin IndexedDB, cross-browser behaviour or usability. Verify on Windows Chrome/Edge and real browsers before public beta. Enlist beginning students and experienced researchers/designers for comparative task testing.

## Next work priorities

1. Instrumented UX tests and fixing confusing labels, focus, nested workflows, default mappings and export routes.
2. Consistent polished template previews and chart styling across all 25 types (not just thumbnails).
3. Direct-manipulation and chart-inspector usability improvements with clearly grouped controls.
4. Robust data-to-template mapping with intentional suggestions, visible calculations and chart validity warnings.
5. Accessibility, performant resize/responsive presentation and precise publishing/PPTX/PDF fidelity.

Do **not** reintroduce the previous V3.6 audio/video expansion plan as the default next milestone.
