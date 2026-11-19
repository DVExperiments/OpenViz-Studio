# V3.7.2 handoff

User wants dashboard dark-mode/alignment fixes, collapsible left sections and an obvious data-source connection route. They are happy with the existing chart editor layout; preserve it.

app.js: renderTree uses native details/summary with separate add buttons; ui.treeSections loads/saves the project-tree-sections browser preference. Preview's source line has Change data. studio-change-data opens Data and focuses studioDatasetSource, the sole connection selector above the table. renderStudioInspector removes its duplicate source selector. Existing source setting event handling and undo remain unchanged. Dashboard inspector heading and remove-action accessible names are clearer.

styles.css: fixes the undefined dashboard --surface fallback to --panel, makes dashboard plot wrapper transparent, aligns dashboard controls/card headers and adds narrow-container wrapping. Adds disclosure, source-picker and source-status styles. Saved chart backgrounds and actual chart SVG styling remain unchanged. The red background in the screenshot is a saved chart setting, not the application theme.

Version 3.7.2. See QA_V372.md for passing DOM/Node checks and outstanding browser review. No export, storage schema or chart renderer changes.
