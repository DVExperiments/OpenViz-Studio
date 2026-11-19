# V3.57 handoff

The baseline is V3.56.

## Value-label rules (`src/labels.js`)

- **Rule lists.** `LABEL_RULES_SERIES` (all, last, first-last, extremes, max) and `LABEL_RULES_CATEGORY` (all, top3, top5, bottom3, extremes, max). `LABEL_FAMILIES` maps a chart type to its family. `labelRulesFor(type)` returns null for types that have no rules.
- **`labelPicker(s, values)`** returns `i => bool` for `s.labelRule`.
- **`labelPlacer(s)`** is greedy box collision. It is off when `s.labelAvoidOverlap === false`.
- **Where they are used:**
  - `charts.js`: bar, line and area use `vLabelOk`/`vPlace`; hbar and dot use `hLabelOk`/`hPlace`.
  - `pro-charts.js`: lollipop, combo, and range/arrow. Range and arrow pick by gap size.
- **UI.** `labelRuleControls` in `src/editor/chart-panels.js`. Settings: `showLabels`, `labelRule`, `labelAvoidOverlap`.

## Editor modules

See `docs/APP_MODULES.md`. `app.js` binds `ctx` twice, once per extraction pass. Do not edit `src/editor/*` expecting `app.js` locals in scope: use `ctx.<name>`, and add a binding in `app.js` if a new one is needed.

## Scheduled refresh (`server/scheduled-refresh.mjs`)

- **Enabling it.** It is off unless `SCHEDULED_REFRESH=1` is set (or the `scheduledRefresh: true` option is passed). `createTeamServer` returns `refresher`, which starts on `listening` unless `autoStartRefresh: false`.
- **Test-only options.** `refreshAllowPrivate` (`REFRESH_ALLOW_PRIVATE=1`), `refreshClock`, `refreshTickMs`.
- **`fetchPublicText`.**
  - Fetches only https. The `lookup` hook rejects any resolved address in the private ranges (a `net.BlockList`, including IPv4-mapped IPv6), so DNS rebinding is covered.
  - Redirects are followed manually (up to 5) and each one is re-checked.
  - 20 s timeout, 20 MB cap, no credentials.
- **`refreshDataset`.** Parses with the same `parseDelimited`/`parseJSON` as the app, applies the same schema guard (`sameSchema`), and re-derives calculations.
- **Return values.** `refreshDataset` returns `updated`, `unchanged`, `schema` or `error`. Only status changes are saved.
- **`createRefresher(store)`.**
  - Ticks every minute. It refreshes datasets with `liveSource.serverRefresh === true` that are due according to `interval`.
  - An in-memory `attempts` map keeps it from refetching every tick when nothing was saved.
  - It fetches outside the per-file lock, then applies only rows and status to the *latest* record inside the lock, so team settings saved meanwhile are kept.
- **Server changes** (`openviz-server.mjs`):
  - Records `lastHumanRevision`, returned by GET and in 409 responses.
  - Refresh revisions are saved as `updatedBy: 'Scheduled refresh'`, with activity type `refresh`.
  - New route: `POST /api/projects/:id/refresh`.
  - `/api/me` reports `scheduledRefresh`.
  - The project list no longer includes `.rN.json` history files (this was a V3.56 bug: duplicates appeared after the first sync).
- **Client** (`src/team.js`, `src/editor/team-ui.js`):
  - `refreshOnlySince(remote, base)` and `mergeServerRefresh(local, remoteProject)`.
  - `teamSync` and the 409 path of `teamPush` merge refresh-only revisions, then push with the new base. A human revision still opens the conflict dialog.
- **UI.** The checkbox is in Live link settings and is shown only for shared projects. Its hint checks `/api/me` and says when the server has the feature off.

## Tests

- `tests/test-v357-labels-refresh.mjs` covers:
  - label rules and placement, and chart label counts
  - module wiring
  - the SSRF guard and a local source
  - refresh results and the server end to end, with a fake clock
  - conflict metadata and the client merge
- Browser flow: `v357flow` (outside the repo). It covers the label rule select, the opt-in checkbox, a server refresh, then a local edit and sync with no conflict dialog.
