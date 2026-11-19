# OpenViz Studio V3.7 — studio editor QA

Status: development build. Functional DOM integration and Node regression checks pass. Real-browser visual, responsive, persistence and accessibility acceptance remain pending.

## Changes

- One Preview/Data editor replaces the default Essentials/Advanced split. Settings remain discoverable in native keyboard-operable accordion groups.
- Preview: canvas-led workspace; project navigator closed initially and available through Project; visible undo/redo; desktop/tablet/phone width previews; settings to the right.
- Data: existing typed editable table with column letters and chart-specific column bindings alongside it. Chart source and selected dataset stay aligned. Refresh retains its existing impact/overwrite review.
- Shared studio toolbar and a Publish & export header action. Native tab semantics, arrow/Home/End navigation, focus restoration and explicit narrow-screen settings close button.
- Appearance controls filter irrelevant line/point/bar controls. Existing specialist mappings, map controls, precise layout, axes, labels, figure presets, annotations, direct manipulation, chart layers, motion, Story Studio and comparison remain accessible.
- Preview device choice changes displayed width only; the SVG aspect ratio and export dimensions stay unchanged. This does not simulate a browser's full responsive publication layout; Publishing Studio remains the publication preview.
- No changes to original datasets, chart calculations, project format, rendering modules, storage or export modules.

## Validation performed

`tests/test-studio-v37.mjs` uses jsdom (external development dependency; not needed to run OpenViz). Install jsdom in your test environment, or set OPENVIZ_DOM_MODULE to its absolute api.js path.

Checks passed:

1. Initial Preview, hidden project navigator, settings groups and tab semantics.
2. Title edits render; undo/redo restore state; applying style leaves data unchanged.
3. Device width choice does not change chart dimensions.
4. Data tab, lettered bindings, typed cell edit, original import preservation and undo.
5. Preview SVG, finite geometry and specialised mappings for all 25 chart types.
6. Publishing Studio opens; Project navigation, standalone data manager and Home remain accessible.
7. Actual DOM tab clicks, keyboard tab navigation, focus, remembered accordion state and return from direct element editing.

Node regression checks passed:

- `node --check src/app.js`
- `node tests/test-publishing-v35.mjs`
- `node tests/test-v34-contract.mjs`
- `node tests/test-v331-contract.mjs`
- `node tests/test-storage-v31.mjs`
- `node tests/test-performance-v33.mjs`

The unchanged V3.6 baseline passed publishing, V3.4 and V3.3.1 Node contracts before editing. Its browser harness could not launch Chromium: the environment denied the process singleton socket. An available browser could not access local files or reach the local HTTP server. No screenshots or pixel/viewport claims are supplied. The DOM harness mocks storage, so it does not establish real IndexedDB persistence.

## Required review before calling this release ready

- Launch through a local HTTP server, e.g. `python -m http.server 8000`, then open `http://localhost:8000`.
- Inspect Preview/Data on desktop, tablet and phone: canvas scale, scroll, panel resizing, overlay dismissal, toolbar overflow and dark mode.
- Verify actual file-picker import and refresh, Excel sheet choice, edits and save across refresh/restart on a normal browser origin.
- Exercise direct text dragging and annotation resizing, hover tooltips, keyboard-only operation and screen-reader tab/disclosure announcements.
- Export SVG/PNG/PDF/PPTX/HTML and compare against the canvas in actual viewers.
- Legacy V3.6 browser checks assert the superseded Essentials/Advanced controls; they are historical tests, not acceptance for the new editor. V3.7 needs a real-browser successor to the DOM checks.
