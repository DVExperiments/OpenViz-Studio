# OpenViz Studio V3.48 handoff

Baseline: V3.47. New capability: multi-area snapshot playback, bringing TIME_TYPES to17; catalogue stays44 plus two races within those44.

`src/multi-area-time.js` validates nonnegative raw contributors and wraps the line domain/renderer. `src/multi-line-time.js` accepts an area mode: run polygons close to zero, missing/out-of-range observations flush runs, isolated observations remain dots, and every fill precedes all outlines/markers. Normal line mode remains unchanged. `time-controls`, `charts`, `app`, `dashboard-interactive`, `data-contracts` and `time-examples` wire editor/export/filter roles. The existing internal lineTimeSourceRows override is shared with area to preserve full source domains under dashboard filters.

New tests: test-multi-area-time-v348.mjs; studio V3.48 block. Updated type-count expectations in prior suites. All49 suites pass. Renderer generator supplies48 fixtures, JSON and six HTML examples. Native Chromium cannot launch in this environment; native acceptance remains outstanding. See QA_V3_48.md.

Do not stack overlapping areas, bridge known missing positions, erase source negatives, mutate playback state into saved settings, or drop source-domain overrides during filtering. Count intentionally ignores measures. Source-data publication visibility remains relevant.

Next feature: stacked-area snapshots with full-timeline stack-total scales and explicit missing/zero rules; then shared-scale small multiples. Prioritize native acceptance for a stable release. REMAINING_WORK_V3_48.md is the authoritative consolidated known backlog; older document suggestions may already be implemented. Optional chart/cloud proposals are not release commitments.
