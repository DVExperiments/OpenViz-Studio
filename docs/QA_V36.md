# OpenViz Studio V3.6 — usability refinement QA

**Status:** Development release candidate; automated checks complete for the specific workflows below. Not a public-availability or accessibility certification.

## Product intent

V3.6 refocuses the product on **professional data visualisation**. It draws on recognised template-first chart-creation workflows while retaining an independent visual identity and the existing local-first, no-account and no-AI design. It deliberately does **not** add general-purpose audio/video editing, spreadsheet automation, or extra unfinished chart types.

## Implemented

- Home emphasises **Start with your data**, **Explore visualisations**, and **Start a blank project**, with the optional rules-based adviser separate from the main actions.
- Chart catalogue opens with 12 examples. Additional charts are available through **Show all**, with search, filtering, categories, compatibility and descriptions preserved.
- Starting from a template without imported data creates a separate, editable example project.
- Starting from a template and then importing a CSV creates a *new* project and the chosen chart; it does not add data to an unrelated older project. Cancelled/failed imports should not create projects.
- Visualisation Editor defaults to an **Essentials** inspector: simple field mappings (where supported), quick styles/colours, titles and share/export. **Advanced** retains full customisation, exact layout, specialist field mappings, chart selection and academic/publication controls.
- Existing chart layers and bottom data preview open on demand rather than consuming the default editing canvas.
- At narrow widths, contextual Project and Edit settings buttons offer access to overlay panels without duplicating the full desktop navigation.
- More appropriate example date/time-series fields prevent spurious warnings for the default line/area template preview.

## Automated validation

Run from the extracted application root:

```bash
python tests/test-browser-v36.py
python tests/test-browser-v35-fast.py
node tests/test-publishing-v35.mjs
node tests/test-v34-contract.mjs
node tests/test-v331-contract.mjs
node --check src/app.js
```

**Observed results in isolated Chromium / Node test environment:**

| Check | Result |
|---|---|
| Gallery opens, previews and filter chips work | PASS |
| Default gallery shows a curated subset and can show all | PASS |
| Template example creates separate project | PASS |
| Essentials/Advanced round trip preserves values and styling | PASS |
| Direct element editing offers an exit back to inspector | PASS |
| Publishing Studio opens from compact editor | PASS |
| Template-first CSV import creates selected chart in new project | PASS |
| Tablet/mobile Project and Properties access | PASS |
| Existing V3.5 HTML publishing and ZIP export | PASS |
| V3.4 dashboard link and V3.3.1 data editor contracts | PASS |
| JavaScript syntax | PASS |

Tests run using an isolated injected-module browser harness, not real localhost. The file-picker integration was separately tested after fixing a test-harness file-dialog issue.

## Outstanding acceptance work

1. Test in a normal localhost browser origin: import Excel with several sheets, CSV, TSV and JSON; cancel import; verify project isolation and local saving across refresh/restart.
2. Test full flow with first-time users who have no chart design experience. Measure time/steps to create a chart, discover design options and export; record where they hesitate or misinterpret labels.
3. Test advanced users on specialised mappings (Sankey, network, maps, Gantt), APA figure controls, preserved layouts and publication/export fidelity.
4. Test Chrome, Edge, Firefox and Safari; keyboard and screen reader access; contrast, focus, reduced-motion and narrow-screen layouts.
5. Verify exports in actual Microsoft PowerPoint and PDF viewers, and iframe publishing in chosen website providers.
6. Use professional design review across all 25 chart types to check labelling, tooltip quality, theme coherence, defaults and visual accuracy. The new Essentials panel does not expose every specialist field—Advanced is the intentional path for those types.

No claim of parity with Flourish or production readiness is made. All prior deep features remain available but have not all been retested in V3.6.
