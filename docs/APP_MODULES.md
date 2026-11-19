# Splitting `src/app.js` into editor modules

V3.57 started breaking up the 594 KB `src/app.js` without changing behaviour, and V3.58 continued. Seventeen features now live in `src/editor/`, and `parameters-ui.js` was written as a module from the start:

| Module | Contents |
|---|---|
| `team-ui.js` | Team Server settings, hosted links, shared projects, sync and merge, comments, activity |
| `live-data-ui.js` | Live link connect and preview, settings, refresh, automatic refresh timer |
| `brand-ui.js` | Organisation theme studio, theme packages, auto-apply |
| `chart-panels.js` | Inspector panels: value-label rules, highlights, reference lines, drill-down, pro-family controls and playback |
| `map-library-ui.js` | Map starting points and the map library dialog |
| `snapshot-export-ui.js` | Snapshot and GIF export dialog |
| `story-ui.js` | Story Studio: scenes, keyframes, timeline, playback, story video export (V3.58) |
| `slides-ui.js` | Slide selection, guides, alignment, layers, present mode, slide objects, logo on slides (V3.58) |
| `storage-ui.js` | Storage centre and recovery checkpoints (V3.58) |
| `publish-ui.js` | Publishing Studio: standalone and live HTML, preview, embed kit (V3.58) |
| `catalogue-ui.js` | Chart catalogue and chooser (V3.58) |
| `data-edit-ui.js` | Dataset corrections, rows, columns, renames (V3.58) |
| `style-library-ui.js` | Saved styles library (V3.58) |
| `dashboard-ui.js` | Dashboards: cross-filtering, layout, guides, inspector (V3.58) |
| `help-ui.js` | Help topics (V3.58) |
| `map-inspector.js` | Route and geographic map inspector panels (V3.58) |
| `export-ui.js` | PPTX compatibility, PDF and PPTX export dialogs (V3.58) |
| `parameters-ui.js` | What-if parameter manager, sliders and dashboard bar (V3.58) |

`app.js` is now 387 KB, down from 594 KB.

## How modules reach editor state: `ctx`

`src/editor/context.js` exports one object, `ctx`. `app.js` calls `bindEditorContext({...})` with **getters and setters** for every piece of app state a module uses: `project`, `ui`, `render`, `markDirty` and so on.

- Modules read `ctx.project` and always see the current project, even after `project` is reassigned in `app.js`.
- A module may assign `ctx.project = …` only if app.js bound a setter for it. The extraction tool adds setters automatically when a block assigns app state.
- A module whose own code has a local `ctx` imports the context as `appCtx`. `snapshot-export-ui.js` is the example.

Modules import pure helpers (`data.js`, `live-data.js`, `team.js`, …) directly, not through `ctx`.

## Extracting another block

1. Pick a contiguous run of top-level code in `app.js` with a clear start marker and end marker. The markers are exact strings: the first line of the block, and the first line after it.
2. Write a plan, for example `tools/plans/next.json`:
   ```json
   [{"name":"stories-ui","title":"Visual story editor","start":"<exact first line of the block>","end":"<exact first line after it>"}]
   ```
3. Run:
   ```bash
   npm install --no-save acorn eslint-scope
   node tools/extract-editor-module.mjs tools/plans/next.json
   ```
4. The tool runs a scope analysis and writes `src/editor/<name>.js`. It exports the declarations that `app.js` still uses, imports them back, and extends `bindEditorContext`.
5. If `app.js` assigns a **variable** the block declares (`let x=…`), the tool keeps that declaration in `app.js`, in place of the block, and the module reaches it through `ctx`. It **refuses** the move if `app.js` assigns a **function or class** the block declares. In that case, wrap the assignment in a function inside the block, as `toggleProPlayer()` and `loadBrandExample()` do, and run again.
6. Modules are evaluated before `app.js` binds `ctx`. Top-level code in a module must not read `ctx` straight away; event listeners and functions that run later are fine. Check with a quick scan of each new module's top-level statements.
7. Check the result: run the full node suite (`tests/test-*.mjs`) and the browser flows for the feature. Any new failure means the move changed behaviour. Revert from the backup and narrow the block.

The plans used are in `tools/plans/` (`v357-pass1/2.json`, `v358-pass1/2.json`). For V3.58, the same browser walkthrough (`v358flow`) was run before and after each pass, and the outputs were identical.

## Modules added in V3.60 (outside `app.js`)

| File | Purpose |
|---|---|
| `src/pro-charts-v360.js` | Ticker, countdown, quiz, poll, profile cards, tree/org chart. Delegated from `pro-charts.js` |
| `src/interactive-widgets.js` | Self-contained runtime for those templates and the fullscreen button. Inlined into exports and the live runtime |
| `src/map-markers.js` | Circle, spike, icon and dot-density markers, shared by world and custom-boundary maps |
| `src/chart-description.js` | Rule-based written chart descriptions |
| `src/boundaries/` | 267 bundled boundary sets plus `world-detailed.json`, built by `tools/build-boundaries.mjs` |

## Suggested next candidates

1. The inspector's `chartProperties()` and `studioSections()`. These are the largest remaining blocks; split them by tab and section.
2. The home page and template library
3. The data page and its import dialogs
4. The command palette, keyboard shortcuts and context menus
5. The big `runAction` switch. Once the features have moved out, let each module register its own actions.
