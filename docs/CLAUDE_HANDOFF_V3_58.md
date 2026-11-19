# V3.58 handoff

The baseline is V3.57.

## Editor modules

There were two extraction passes: `tools/plans/v358-pass1.json` and `v358-pass2.json`. The pass 1 modules are:

- `story-ui`
- `slides-ui`
- `storage-ui`
- `publish-ui`
- `catalogue-ui`
- `data-edit-ui`
- `style-library-ui`

Pass 2 added `dashboard-ui`, `help-ui`, `map-inspector` and `export-ui`.

- **Size:** `app.js` went from 540 KB to 387 KB.
- **Context bindings:** `app.js` now has several `bindEditorContext` calls, one per pass. They all add to the same `ctx`.
- **Extraction tool:** a variable declared in a block (`let`/`const`/`var`) that the rest of `app.js` assigns is now kept in `app.js` where the block was ("Kept in app.js" in the tool output). A function or class assigned elsewhere is still refused.
- **Checking:** `/home/claude/tools/v358flow.py` drives the catalogue, style library, publishing, dataset editing, slides and present mode, stories, storage, dashboards, help, the PDF and PPTX exports, and undo. I ran it on the build before the pass and after it, and diffed the outputs. They were identical.

## Logo on slides

- **Placement:** `brand.js` `slideLogoPlacement(project, slide)` returns `{dataUri, x, y, w, h}` in slide percentages, or `null`.
  - **Inputs:** `project.slideLogo = {position, size}`. `position` is `off`, `top-right`, `top-left`, `bottom-right` or `bottom-left`. `size` is the height as a percentage of the slide, 3–20, default 8. The logo comes from `project.brand.logo`.
  - **Opt-out:** `slide.hideLogo` hides it on one slide.
  - **Limits:** the margin is 3% horizontally, with the same distance vertically. Width is capped at 40%.
- **Where it renders:**
  - the editor stage: `slideLogoHTML` in `slides-ui`, not selectable
  - PPTX: `exports.js` `rasterLogo()` turns SVG and WebP into PNG
  - PDF: `chartJpeg` now accepts data URIs, and the logo is composited on the slide background
  - printable HTML
- **UI:** `slideLogoControls()` in the slide settings. If the theme has no logo, it shows a link to the theme studio. Changes go through a `change` listener in `slides-ui`.

## What-if parameters (`src/parameters.js`)

- **Model:** `project.parameters = [{id, name, value, min, max, step, format}]`. `normalizeParameter` validates names (no `{}[]`), swaps min and max if they are reversed, and clamps the value.
- **Expressions:** `{Name}` is replaced with the current value before the existing expression engine runs, so no new grammar was needed. Negative values are written as `(0-n)`.
  - `addCalculatedField(rows, name, expr, values)` takes an optional parameter-values argument.
  - Every caller passes it: `addCalculation`, `openRefreshPreview`, live refresh, the scheduled refresh on the server, and the live runtime.
- **Applying values:** `applyParameters(project)` recomputes calculated columns in place, starting from the first calculation that uses a parameter. Earlier calculations and dataset edits are not touched. It also sets `refLineValue` and `refLineParamName` on charts with `refLineMode: 'parameter'`.
  - `charts.js` treats `'parameter'` like `'value'`.
- **UI** (`editor/parameters-ui.js`):
  - the manager dialog. Saving renames `{Old}` references to the new name, and deleting a parameter that is in use asks for confirmation.
  - an inspector section with sliders. The preview updates on `input`, and there is one undo snapshot per drag.
  - a dashboard bar. The dashboard re-renders on `change` and focus is restored.
  - chips in the calculated-field dialog
  - Data menu → *What-if parameters…*
- **Live publications:**
  - `livePayload` adds `parameters`, the ones used by the published charts. Datasets with parameter calculations ship their raw columns and calculations, flagged `parameters: true`.
  - The runtime shows range sliders, rebuilds the affected datasets, and updates parameter reference lines. Rendering is throttled with requestAnimationFrame.
  - **Bug fix:** live datasets with calculations used to ship the derived columns too. `deriveRows` then failed on "field already exists" and silently kept stale values. Derived columns are now stripped and rebuilt.
- **Runtime build:** rebuilt (`node tools/build-live-runtime.mjs`, 489 KB).

## Tests

- `tests/test-v358-modules-logo-parameters.mjs`
- Browser flows outside the repo: `v358flow` (module behaviour), `logoflow`, `paramflow`
