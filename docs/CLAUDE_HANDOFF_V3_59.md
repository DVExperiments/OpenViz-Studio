# V3.59 handoff (verification round)

The baseline is V3.58. The full results are in `docs/VERIFICATION_V3_59.md`, and the scripts are in `tools/verification/`.

## Code changes

### `src/snapshot.js` (new): undo snapshots

- `projectSnapshot(project)` returns `{meta, rows:[[rowsJson, rawRowsJson]…]}`. Row arrays are serialised once and cached in a WeakMap keyed by the array. Snapshots that share an unchanged array share the same string.
- `restoreProjectSnapshot` restores both formats: the old JSON string and the new object. It also seeds the cache. Placeholders keep dataset key order identical.
- `invalidateRowsSnapshot(arr)` must be called after any in-place row mutation. Today there is only one: the cell edit in `editor/data-edit-ui.js`. It also clears the `data.js` caches.
- `app.js` uses these everywhere it used `JSON.stringify(project)` and `JSON.parse(undo.pop())`.

### `src/data.js`: per-array caches

- `getFields` and `aggregate` (not scatter) are cached per row array when there are more than 2,000 rows. The caches return copies.
- `rowsChanged(arr)` clears them.

### `src/storage.js`: IndexedDB version 3

- Adds a `projectMeta` store holding `{id, rev, name, updatedAt, charts, datasets}`. It is written in the same transaction as the project.
- `saveProjectIfCurrent` checks the revision against the summary. Projects saved before V3.59 have no summary and fall back to reading the full record.
- `listProjects` reads the summaries and backfills any missing ones.
- `getProjectRevision(id)` is new.
- `app.js` imports it through `storageModule`, so older test harnesses that stub storage still work.
- A `VersionError` (an outdated cached build meeting an upgraded database) becomes a "reload to update" message.

### `src/pdf-export.js`

- **Bug:** `fid=fontIndex(o)+1` was off by one (bold rendered as Oblique).
- `fontIndex` is now exported for tests.

### `src/exports.js`

Single-series native bar, line and area charts pass one colour, so PowerPoint stops colouring each point differently.

### Accessibility

**CSS** (end of `ui-refresh.css`):

- contrast tokens
- menu and shortcut colours
- story buttons
- dark-mode primary text
- 24 px slide layer targets

**Markup:**

- removed `aria-label`s that didn't match the visible text (home cards, rename column, story export)
- inert previews
- a name on the add-slide button
- a focusable publish preview region

### Keyboard (`app.js`)

- `menuReturnFocus`: closing a dialog that was opened from a menu refocuses the menu button.
- Enter in `#commandQuery` runs the first match. Running a command closes the palette.
- `e.target.matches?.(` is guarded.

### Other changes

- The command is now named "Toggle light / dark theme".
- The parameter reference line shows the formatted value (`refLineValueText`).

## Tests

- **New:** `tests/test-v359-verification-fixes.mjs` covers snapshot sharing, restore, invalidation and key order; caches; PDF font faces; and contrast tokens.
- **Node suite:** 57 pass and 9 fail. The 9 failures are the same as the V3.52 baseline.
