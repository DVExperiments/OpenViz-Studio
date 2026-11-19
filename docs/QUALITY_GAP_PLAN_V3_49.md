# Gap-closing implementation plan after V3.49

User priorities: broader template depth, richer motion, consistent editorial finish, sophisticated published tables and map resources. Complete implementation in reviewable batches, then conduct the large verification/testing run. Focused checks continue with each change; they are not a release certification.

## Delivered in V3.49

- Dedicated Editorial table catalogue/home template and editable example.
- Explicit selected columns/order, labels and per-numeric-column formatting.
- Native HTML search, raw-value stable sort with missing values last, page sizes, sticky headers and responsive horizontal scrolling.
- Signed in-cell bars, heat intensity, zero-inclusive fixed column scales, original/exact values retained.
- Light/dark authored palettes, consistent numeric alignment, source/missingness notes.
- Undoable settings, source rename preservation and reviewed data switching.
- Full standalone chart table HTML; all-row static HTML; disclosed first-page SVG fallback for static graphics, dashboard and story views.

## Next: map resources

- Curated offline starting points for useful geographic tasks, with searchable labels/previews and explicit illustrative data.
- Make existing world/regional/custom-boundary capabilities easier to discover and reuse.
- Add genuinely useful geographic boundary resources only with checked licensing, provenance, identifiers, simplification and join guidance. Never imply fictional polygons are real boundaries.
- Improve place-label/legend/source-note editorial defaults and mobile framing; preserve custom GeoJSON import.

## Then: richer motion

- Extend meaningful timeline coverage, including stacked-area and shared-scale small-multiple snapshots.
- Improve transitions/sequencing where data semantics support them; retain missing/zero distinctions, fixed-comparison scales and reduced motion.
- Synchronized dashboard/story timelines and snapshot GIF/video export need further implementation; existing race exports are not equivalent.

## Broader template depth and editorial finish

- Prioritize versatile business/research templates from the consolidated backlog, beginning with useful combo/bullet and distribution layouts rather than count-only expansion.
- Refine titles, subtitles, labels, legends, units, direct annotations, source notes and mobile defaults across families.
- Additional table depth: sparklines supplied by explicit ordered fields, optional safe image cells, table-specific reusable presets and full live dashboard/story table integration. These are not delivered in V3.49.
- Do not add fabricated comparisons, inferred confidence bounds or invisible truncation.

## Final verification phase — deferred by user

Cross-browser and Windows acceptance; mobile/touch; actual screen readers/keyboard; real-origin storage/recovery; security/privacy; performance; native PDF/PPTX/image/video viewers/codecs; real embeds; and side-by-side competitor/user tasks. Resolve failures before claiming stable release or better quality/parity. Six focused V3.49 suites do not replace this phase.

The larger known backlog remains in REMAINING_WORK_V3_49.md. Online hosting/collaboration remain a separate optional scope, outside these five immediate priorities. No mandatory cloud/account/AI dependency is introduced.
