# OpenViz Studio V3.8 — engineering handoff

Preserve the approved Preview/Data studio, dashboard theme/layout and collapsible navigation. V3.8 focuses on trustworthy connections and clear calculation context, with no new chart types, account or AI requirement.

## Code

- src/data-contracts.js (new): fieldSpecs, schemaFor, fieldFits, mappingIssues, proposeMappings, usesAggregation, calculationSummary, alternativeHint. Depends on data.js only. Proposal construction is pure and non-mutating.
- src/app.js: datasetId change events now reset the visible selector to the current source and open staged review. pendingDatasetSwitch holds a draft, original source/project/chart identities and editSequence. Apply rejects stale state, validates and commits once through trackChange; Cancel/Escape closes without writes. Existing manual mapping/type-change code is unchanged.
- dataGuide, requirementList and exampleDataTable provide shared Data/catalogue guidance. Preview calculation text updates during live field/settings edits. Ordinary aggregation control is moved from the bindings panel into the guide; no duplicate selector. Binding controls hide inactive roles and show explicit optional/missing placeholders.
- src/styles.css: scoped guide, review, table and preview styling with theme tokens and narrow-screen rules.
- src/charts.js: histogram filters missing/blank values before Number conversion.
- src/data.js: scatter aggregation rejects blank coordinates while retaining zero.

## Rules

Never apply a proposed source or guessed mapping before explicit in-product Apply connection. Never mutate either dataset when changing a connection. Preserve compatible mappings and flag suggestions. Ambiguous matches need a user choice. Optional absent fields clear; incompatible required mappings block Apply. Keep existing chart warnings visible: structural completeness is not proof of correct semantics. Preserve source rawRows, project format, storage guards, export/privacy rules and undo.

See QA_V38.md for passing test coverage and browser gaps. The functional test loads actual modules through jsdom; old Python injected-module harnesses must include data-contracts.js. No normal-browser visual approval has been claimed.

## Next

Run browser acceptance before expanding features. Review real datasets and mapping suggestions with users. V3.9 can focus on accessibility, persistence and export fidelity. Do not add unrelated workspaces or extra chart types by default.
