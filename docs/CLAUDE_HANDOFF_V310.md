# OpenViz Studio V3.10 handoff

New `src/research-charts.js` supplies pure models, examples, warnings, SVG rendering and bounded standalone interactive HTML for five templates. `expanded-charts.js` dispatches these through the existing catalogue/build/export interfaces. Research types must remain excluded from generic SERIES_TYPES. `src/field-bindings.js` centralises scalar bindings, including lowerField/upperField, for rename, dependency, refresh and review workflows.

Keep Project open by default on desktop, collapsible sidebar sections, compact Preview/Data toolbar, Change data route, staged source-switch review and map boundary note toggle. Home remains a Templates entry point with search inside its window. Examples are illustrative; do not imply template count equals independent families or that experimental means exclusive to OpenViz.

Data semantics are in README and QA_V310. Never infer confidence bounds, silently fill missing calendar dates with zero, or compare rankings on different eligible cohorts. Assumption controls are explicit and source-safe. Calendar is a dashboard filter receiver only. Interval row mark IDs are [label, occurrence]; Likert IDs are [question, response]. Null model results retain null rather than masquerading as zero.

Run the Node suites and jsdom integration checks documented in QA_V310. Set OPENVIZ_DOM_MODULE to an installed jsdom entry when needed. Browser visual QA, Windows and accessibility remain pending. Prior V3.9 documents are retained as historical notes.
