# V3.7.1 handoff

User feedback: chart usability is good; column renaming was not discoverable on standalone Data. Preserve the current chart editor.

Changes: app.js renderData uses a full heading button (.data-col-name.data-col-rename) with name, type and visible Rename hint. decorateStudioData inserts letters into that button. Existing request/confirm rename logic is reused; failures now appear inside the modal. CSS enlarges the heading target and uses theme colours. Version status is 3.7.1.

See QA_V371.md for passed checks and browser limitations. No new project schema, rendering or storage changes. Continue from this build rather than V3.7.
