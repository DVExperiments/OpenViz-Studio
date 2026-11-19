# OpenViz Studio V3.7 — engineering hand-off

The user requested that the editor follow Flourish Studio. V3.7 adopts its documented Preview/Data split, column bindings beside the editable sheet, a large preview and collapsible settings. OpenViz keeps its own identity and local-first functionality. It is not a claim of pixel-identical appearance or full Flourish feature parity.

## Implementation

`src/app.js` adds studioToolbar, studioSections, propertiesFor, renderStudioInspector and decorateStudioData. Existing chartProperties builders supply controls. UI state lives outside the portable document: studioTab, studioDevice, studioProjectOpen, studioChartId, studioSections. Switching to another chart starts in Preview. Data tab renders the existing data editor within the chart workspace; all direct data-editor refreshes decorate it again and refresh bindings. Chart source selection continues to use the existing guarded setting path.

`src/styles.css` adds studio-scoped header, tab bar, settings, canvas and table styling, plus narrow-screen overlay rules. `index.html` adds a narrow-screen settings close button and V3.7 status label. Other workspaces retain their existing layout.

Keep chart-specific controls relevant without deleting specialist options. Do not modify source data when changing appearance, preview widths or tabs. Keep field bindings typed and explicit, original imports intact, undo, storage conflict checks, project compatibility and publishing safety.

## Validation and limitations

See QA_V37.md. New jsdom integration checks cover all 25 types, editing, tabs and keyboard semantics, undo, data safety, presets and publishing entry. Existing Node contracts pass. Real-browser visual QA is blocked in this environment and remains outstanding. Do not describe this as fully tested in Chromium or release ready.

The user should review the layout before further visual refinement. No new chart types, AI or account dependency were added. Preview width buttons scale the existing SVG; use Publishing Studio to inspect responsive HTML publication layout.

## Sources

Flourish's official editor description: https://helpcenter.flourish.studio/hc/en-us/articles/8761537173263-Creating-a-visualization

## Run locally

Serve the extracted directory with a local HTTP server and open index.html through localhost. No build step or npm installation is needed for the application. jsdom is used only by the optional V3.7 DOM test.
