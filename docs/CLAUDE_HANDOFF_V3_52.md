# V3.52 handoff — ordinary snapshot GIF/video

Baseline V3.51. New snapshot-export.js plans observed-period holds on the full existing time model. Range selection retains full-source domains. GIF encodes one frame/period; video pre-rasterizes every selected period then paints buffered frames in real time, with skip/hidden-tab/recorder checks. It shares only rasterization/codec helpers with race-export; race planning remains unchanged. Uses actual rendered viewBox for tall facet export proportions.

UI integrates Time controls, motion-open routing for enabled time charts and Export chooser. Shared activeRaceExport lock/controller prevents competing race/snapshot jobs; closeModal already aborts it. snapshotExportContext records project/chart/dataset/edit sequence; stale setups reject. Source rows/chart are cloned at job start. Download-again stores the completed blob. No export controls are embedded into published reader HTML.

Six focused suites pass; details/limits in QA_V3_52.md. Real generated GIFs and decoded hold evidence included; controlled video lifecycle only, native codec/timing acceptance remains deferred. Catalogue 45, snapshot types 19 unchanged. Next: combo and bullet/progress templates and editorial defaults. Further synchronized timelines/transitions remain in the backlog; full verification is last by user request.
