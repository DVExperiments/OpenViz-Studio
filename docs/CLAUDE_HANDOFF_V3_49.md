# V3.49 handoff — editorial tables

Baseline V3.48; catalogue now45, snapshot types17. Follow QUALITY_GAP_PLAN_V3_49.md for the user's revised priorities. Full verification is deferred by the user; keep focused checks while implementing.

New editorial-table.js owns a source-preserving table model, native HTML/CSS/runtime and bounded static SVG page. parallelFields is reused as selected ordered columns, with data-contract kind columns (1–8, any type, including empty). tableColumnStyles stores field/label/format/decimals/prefix/suffix/visual. Rename updates both selected bindings and styling fields; reviewed dataset switches clear old per-column styles. Renderer never aggregates or alters rows.

Catalog/home/example, chart engine, advisor, editor settings/preview and chart publishing are wired. Dedicated native preview bypasses irrelevant chart axes/style controls. installEditorialTables is included both in the app shared interaction runtime and its serialized export dependency closure. Chart HTML has its own native table runtime; dashboard/story pipelines retain disclosed static SVG pages. No live table dashboard/story claim.

Six focused suites pass; see QA_V3_49.md. render-editorial-table-v349.mjs generates portable/light/dark examples. No broad/native acceptance claim. Next: offline map-resource starter browsing, then motion/template depth/editorial consistency. Preserve original numeric sorting, missing-last, fixed full-column scales, escaped values, publication privacy and static-page disclosure.
