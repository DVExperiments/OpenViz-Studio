# V3.9 engineering handoff

User authorised chart expansion and exploratory/experimental visualisations. They also requested a Templates section on Home, replacing Explore visualisations with a template entry point and keeping search inside its window.

## Main implementation

src/expanded-charts.js is a shared, local-only long-format series engine plus Evidence lanes and Change lens. Metadata, examples, models, warnings, rendering and default axis labels live here. charts.js registers/renders these through the existing SVG shell, retaining titles, figure captions, annotations and shared exports. Catalogue uses the same metadata/examples. data-contracts includes new roles, distinct bindings and calculation descriptions. App provides dedicated field controls, legends for series templates, relevant settings and experimental labels. Unsupported controls are hidden for these new renderers rather than suggesting they work. Legacy controls stay unchanged.

Home featured cards open the Templates dialog filtered to a template; they do not create projects. The existing Try example / Use my data actions retain sample isolation/import behaviour. Query/category/search live in the dialog; Experimental has an explicit shortcut.

Advisor/comparison knows the new requirements and trade-offs. Dashboard category selection decodes category/series keys for the series types and raw group keys for experiments. Standalone interactive HTML category filtering includes the new types. PowerPoint deliberately uses its faithful vector fallback.

## Important semantics

Use complete category/series pairs, valid numeric values (except Count), stable category ordering and bounded display with visible warnings. Keep numeric/date X spacing on time/line templates. Do not connect missing line combinations; stacked-area absent combinations are explicitly zero. Percentage zero totals are undefined. Reject unsupported negative compositions instead of dropping them. Check overflow. Evidence quartiles use linear interpolation, not confidence intervals. Change lens uses the same complete-pair rows for both sides. No causal or exclusivity claims.

See QA_V39.md for limits, passed model/DOM/runtime/static-output checks and outstanding actual-browser acceptance. See EXPERIMENTAL_V39.md for overlap with Flourish and future ideas that are proposals, not available entries. Catalogue currently has 36 selectable entries (including variants/capability templates), not 36 unrelated families. Candlestick is still planned.

## Next work

Review this batch with the user before adding more types. Prioritise label/legend robustness, direct series styling, truly responsive facet behaviour and browser/export acceptance. Then consider survey/research forms and Assumption lens/Missingness atlas. Preserve the approved editor structure, default-open Project and local-first/no-account/no-AI constraints.
