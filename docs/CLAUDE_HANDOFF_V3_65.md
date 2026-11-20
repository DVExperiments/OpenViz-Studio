# V3.65 handoff (first visit, backups, plain publishing/dashboards, small screens)

The baseline is V3.64.

## Changes

### First visit (`app.js` `initialise`)

- With no active project, the demo project stays in memory only (`project._unsavedSample=true`, named "Example project (not saved)").
- `markDirty()` clears the flag on the first edit, renames the project "Example project" and sets the active-project key. Autosave then works as before.

### Sidebar (`renderTree`)

- **Labels:** Data, Charts, Dashboards, Slides, Stories and Saved versions. The `data-tree-section` keys are unchanged (`datasets`, `visualisations`, `presentations`, `visual-stories`).
- **Empty starters:** an untouched "My dashboard" (no charts, the only dashboard) and slides with no objects show "None yet". They appear once used or opened.

### Backups (`app.js`)

- **Log:** `localStorage['openviz-backups']` holds `{projectId: ISO time}`, through `recordBackup`, `lastBackup` and `backupAge`.
- **When a backup is due (`backupDue`):** the project has a chart and has never been backed up, or it was edited more than 7 days after its last backup.
- **Sidebar footer (`#backupFoot`):** status text plus **Back up now**, rendered by `renderBackupStatus()` on every `render()`.
- **Reminder banner (`backupReminder()`):** shown in the visualise workspace when a backup is due. "Remind me later" snoozes it for the session (`backupSnooze`).
- **Home cards:** each shows "Backup: …" and a **Back up** button (`backup-project-card` loads the project with `getProject` and calls `exportProject`). A note explains browser-only storage. "Open .openviz file" is now "Open a backup file".

### Publishing (`editor/publish-ui.js`, `publishing.js`)

- The modal is titled "Put it on a website". The sidebar is an ordered list of three steps: download, upload with the URL, copy the code.
- The publishing kit and Team Server sit under `<details class="publish-more">`.
- **Labels:** the preset labels are plain words, and the content modes are "Hover for details (recommended)", "Live…" and "Look only".
- **Status line:** shows the device and an approximate size in KB.
- **Quality list:** titled "Things to check before publishing (N)".

### Dashboards (`editor/dashboard-ui.js`, `help-ui.js`, `app.js` toolbar)

- Plain labels throughout (see the README). All `data-ui` and `data-action` names are unchanged.

### Data toolbar

- "Reload file" and "New column from a formula" replace the old button names.

### Chooser

- **Count line:** "Showing N of M · previews use …".
- **Phones:** a **Search and filters** toggle (`catalogue-toggle-filters`, `#catalogueFilters`).
- **Toast:** the chart-created toast now points to "Data & axes in Settings".

### CSS (`ui-refresh.css`)

- **At 1100px and below:** the editor toolbar wraps (`height:auto`, `max-height:none`, `overflow:visible`), and the preview-size switch is hidden.
- **At 700px and below:**
  - Header: the command search and help button are hidden, the save status is hidden, and the project name is truncated. The **Save** button stays.
  - The element picker and size meta are hidden.
  - Form controls are at least 32px tall, `.field-row` wraps, and selects are at least 140px wide.
- **At 420px and below:** the brand text is hidden and the header button reads "Save".
- **Dark theme:** readable text on the primary buttons in the reminder and region-suggestion banners.

### Flows

- Browser flows that use specialist settings set `localStorage['openviz-all-settings']='1'` after loading.

## Tests

- **Node suite:** 61 pass and 9 fail. The 9 failures are the same baseline as before.
- **Browser:** clean for `flowall`, the V3.56, V3.58 and V3.60 flows, parameters, logos, live data and the keyboard walk.
- **Accessibility (axe):** 0 violations on 19 desktop screens, the V3.60 surfaces, the groups and map library in both themes, and Home, the chooser, the editor, Save or share and publishing at 390×844 and 820×1180.
- **Phone run-through:** import, Settings → change the value field, Save → PNG download all work at 390×844.
