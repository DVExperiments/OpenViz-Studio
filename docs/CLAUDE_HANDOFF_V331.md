# Claude engineering hand-off — V3.3.1

Continue from this release, retaining prior chart, PPTX/PDF, project and worker functionality. Next planned primary milestone remains V3.4 linked dashboard exploration.

## V3.3.1 changes
- User-facing **column rename** next to remove controls in the Data Workspace. Rename in `dataset-edit.js` preserves `rawRows`, updates rows/columns/types, calculations' bracket references, and chart field mappings (`x`, `y`, series, size, date/end, label, geo coordinates, parallel axes). UI applies all changes as one undoable update, updates audit, autosaves, and validates names.
- Story scenes now have an optional `animationMs` field. New scenes: 5.4s scene/2.6s motion. Existing stories without the field use a compatible computed animation interval without modifying their saved scene duration. Keyframe percentages represent the **motion phase**, with the remaining clip held. Keep this timing consistent in preview, HTML, GIF, MP4.
- Green timeline overview clips are buttons for scene selection, and right handles for drag/keyboard resizing. Actual scene timeline accounts for overlap. Clip resizing modifies scene duration without changing source chart keyframes or values.
- Selecting and changing keyframes updates the preview playhead to show its effect; inactive point-focus track has a warning.

## Highest priority follow-ups
1. Add advanced animation timeline ergonomics: zoomable time ruler, per-keyframe visual value overlays, scene transitions shown as actual overlap regions and drag handles for animation-vs-hold boundary.
2. Increase scene-timeline selection/drag robustness on touch and under narrow viewport sizes.
3. Add end-to-end hosted-origin tests for IndexedDB persistence and story exports; cover multiple browsers.
4. Preserve original imported data and dependency mappings on all future schema edits; do not build another spreadsheet application.

## Tests
`node tests/test-v331-contract.mjs`
`python tests/test-browser-v331.py` (isolated browser; imports embedded JS modules)
Existing natural motion regression: `python tests/test-browser-v211-natural-v32.py`

No external AI model, server API or subscription system is required. Keep OpenViz free and local-first.
