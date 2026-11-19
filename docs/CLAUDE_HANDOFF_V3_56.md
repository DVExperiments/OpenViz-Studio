# V3.56 handoff

Baseline V3.55.

## Forecast and clustering (`src/stats.js`)

- tCdf/tQuantile (incomplete beta), regressionForecast (OLS with seasonal dummies and exact prediction intervals, df ≥ 1), kmeans (k-means++, seeded mulberry32, 6 restarts, standardised axes, silhouette auto-k, clusters ordered by size).
- `charts.js`:
  - projectionModel now uses regressionForecast. Settings: projectMethod linear | seasonal, projectSeason, projectInterval 0/80/90/95 (default 80).
  - The forecast band path is drawn before the marks.
  - clusterOverlay draws the centroids and legend.
  - Scatter X axes use prettyTicks (`var scatterXTicks`).

## Maps

- geo.js: `geoHeatMode: 'hexbin'` with `geoHexSize`; nearest-centre assignment over neighbouring rows/columns; legend and warning branches.
- map-library.js: nz-locator and nz-hexbin starters.
- pro-charts.js: the tile-map family.
  - TILE_LAYOUTS: US 51 and NZ 16, matched by normalised name/code plus aliases.
  - tileModel handles both built-in and custom layouts.
  - The tile loop uses `tile`, not `t`, because `t` is the text helper.

## Playback for newer families (`pro-charts.js`)

- proTimeModel and proFrameValues; renderPro wraps renderProFrame and passes `_domain` / `_domain2`.
- Each family's main scale is widened by D through dom() or an explicit include.
- Settings: proTimeField, proTimeIndex, proTimeMs.
- `app.js`: proPlaybackControls and the `pro-play` interval (`stopProPlayer`).

## Live publications

- `src/live-runtime.js` provides mountLive, DRILL_TYPES and liveRuntimeCss.
  - Its state holds filters, drill paths, time and data.
  - Rendering goes through buildChart.
  - Drill attaches click and keyboard handlers to `[data-viz-part=point][data-viz-key]`.
- Bundle it with `tools/build-live-runtime.mjs` (needs esbuild; race-flags is stubbed). Output: `src/dist/openviz-live.js`, IIFE global `OpenVizLive`. **Rebuild after changing chart code.**
- `src/live-publish.js`: livePayload (only the needed columns; raw columns kept when live calculations exist), liveHtml (script-safe JSON), liveFilterCandidates.
- `app.js`: Publishing Studio content mode 'live' (publishUI.live / liveFilters / liveKeep), ensureLiveRuntime() fetches the bundle, buildPublication() replaces direct createPublication calls, drillControls (drillLevel2 / drillLevel3).

## Team Server

- `server/openviz-server.mjs`: createTeamServer({dataDir, tokens, appRoot, publicUrl}) for tests; the CLI runs when executed directly. Routes are listed in server/README.md.
- `src/team.js`: normalizeServerUrl, teamFetch (TeamError with status/data), projectForUpload, safeProjectId.
- `app.js`:
  - preference 'team-server' {url, token, name}
  - project.team {server, id, revision, syncedAt, dirty}; markDirty sets dirty unless teamApplying
  - project.teamPublications[kind:assetId]
  - conflict dialog
  - comments section, loaded asynchronously

## Default theme

Preference 'default-brand' is applied in startNewProject.

## Not done

- Real-time co-editing, SSO and per-project permissions.
- Server-side scheduled refresh and server-side rendering.
- Hosted dashboards keep their own copy of data: re-publish or use Live.
- Live mode for stories.
- Playback in GIF/video export for the newer families.
- A world tile grid.
