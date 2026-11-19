# OpenViz Studio V3.59: verification report

**Date:** 19 November 2026
**Build:** V3.59, which includes the fixes this round found
**Scope:**

- cross-browser behaviour
- automated accessibility (WCAG 2.2 AA)
- keyboard-only use
- performance at the 100,000-row limit
- storage upgrade
- exports opened in independent document tools

What could not be verified here is listed at the end. Claims of parity with Datawrapper, Flourish or Tableau should still wait for that part.

## Summary

| Area | Result | Issues found and fixed |
|---|---|---|
| Cross-browser | All 70 chart types and 9 key workflows run with no errors in **Chromium** (Chrome 14x) and **WebKit** (WebKitGTK 2.52, the engine family Safari uses), with identical output | 1: a keyboard handler threw on events targeted at the document |
| Accessibility (axe-core 4.14, WCAG 2.0/2.1/2.2 A and AA) | **0 violations on 19 screens**, including dialogs, dark mode, and published standalone and live HTML. Before the fixes there were 9 rule types across 233 elements. | Contrast (muted text, warnings, menu bar, shortcut hints, accent text, dark-mode primary buttons), names that didn't match visible labels, a focusable element inside a hidden preview, an unnamed button, a scroll region keyboard users couldn't reach, small targets |
| Keyboard | Every Tab stop shows a visible focus ring. Dialogs trap focus, close with Esc and return focus to where it came from. The menu bar works with the arrow keys. The template library is reachable in 5 Tab presses. Parameter sliders work with the arrow keys and announce their value. | Focus now returns to the menu button after a dialog opened from a menu. Enter in the command search runs the top match, and the palette closes afterwards. |
| Performance (100k rows) | Imports 100,000 rows in 0.7 s, creates a chart in about 2 s, and edits in a median of **47 ms**. Memory stays flat at **55 MB** after 20 edits. The table draws only the visible rows. | Undo history now shares unchanged dataset rows (before: 238 ms per edit, memory up to 438 MB). Autosave no longer reads the whole project back. Column lists and totals are cached per dataset version. |
| Storage upgrade | A V3.58 database (version 2) opens, saves and lists projects in V3.59 (version 3) | A clear "reload to update" message if an old cached copy meets an upgraded database |
| Exports | PPTX opens in python-pptx and LibreOffice. PDF passes qpdf and pypdf and renders in poppler. SVG is well-formed XML, and the PNG is 1920×1080. All 8 slides render with the logo in the same place in every tool. | Bold slide text came out *italic* in PDF exports (wrong font number). Single-series native PowerPoint charts gave each bar a different colour. |

## Details

### Cross-browser

`tools/verification/selftest.js` runs inside the page in any browser. It creates every catalogue chart from its example and counts the marks drawn. It then walks through these screens and actions:

- data page
- live publication preview
- dashboard
- slides
- story
- parameters dialog
- PNG export

The same script ran in Chromium (Playwright) and in WebKitGTK through WebDriver (`webkit.py`). Results were identical:

- 70 of 70 chart types drawn, with the same mark counts and sizes
- all 9 workflows passed
- no script errors

I also looked at screenshots of the editor and of a live publication with filters and a parameter slider in WebKit. Fonts, layout and controls were correct.

**Firefox was not tested.** This environment cannot download Firefox: the Playwright and Mozilla download hosts are blocked, and Ubuntu packages it only as a snap. The app uses only standard ES modules, SVG and IndexedDB, with no Chrome-only APIs found. Firefox should still be tested before claiming support.

### Accessibility

`axe_audit.py` runs these surfaces:

- home and the template library
- the chart editor (light and dark)
- the data page and dashboard
- slides and Story Studio
- Publishing Studio
- the parameter, theme, live data, calculated field and storage dialogs
- the command palette and chart catalogue
- an editorial table
- the standalone HTML export
- a live publication

**Fixes:**

- **Contrast tokens** (all now ≥ 4.5:1):
  - muted text `#8a96a6` → `#636f7c` (5.1:1 on white)
  - accent `#0b7f76` → `#0a756d`
  - warning text `#ae701e` → `#8a5310`
  - dark-mode muted `#7c8b9b` → `#94a3b2`
  - dark-mode primary buttons now use dark text on the light accent
  - menu bar and shortcut hints no longer use faded opacity
- **Accessible names:**
  - chart cards and column headers no longer have an `aria-label` that hides their visible text
  - the "+" add-slide button has a name
  - chart thumbnails inside cards are `inert`
- **Publishing preview:** the scroll area is focusable and labelled.
- **Slide layer buttons:** at least 24×24 px.

### Performance

`perf-engine.mjs` times the chart engine with no browser. At 99,999 rows:

| Step | Time |
|---|---|
| Parse a 4 MB CSV | 206 ms |
| Calculated field | 25 ms |
| Column, line, histogram | 14–51 ms |
| Scatter | 77 ms |
| Box plot | 87 ms |
| What-if parameter recalculation | 37 ms |

Live publications embed up to 50,000 rows and warn above that, by design.

`perf-undo.py` makes 20 edits on a 100k-row project and records time and memory. Before and after this release:

| | V3.58 | V3.59 |
|---|---|---|
| Median edit | 238 ms | 47 ms |
| Slowest edit | 420 ms | 56 ms |
| JS memory after 20 edits | 438 MB | 55 MB |
| Undo / redo of a cell edit | correct | correct |

The datasets limit of 100,000 rows is enforced with a clear message.

### Exports

`make-exports.py` builds a project with 7 chart types (column, combo, pie, line, sankey, editorial table, KPI cards) on 8 slides with the theme logo, then downloads every format. The PPTX is exported twice: once as default (pictures for exact styling) and once with every chart set to *Editable*. In the editable deck, column, combo (two plots, dual axis), pie and line come through as native PowerPoint charts. Sankey, table and KPI correctly fall back to pictures.

All decks were converted with LibreOffice and rendered with poppler, then compared by eye. Content, layout and the logo position matched in every tool.

### Storage upgrade

`storage-upgrade.py` saves a project with the V3.58 build, then opens the same browser profile with V3.59, with the HTTP cache disabled. It checks that:

- the database upgrades to version 3 with the new summary store
- the old project opens, saves and keeps the edit after a reload

**Hosting note:** serve the app files with `Cache-Control: no-cache` so browsers revalidate after an update. The Team Server already does this.

## Not verified here (needs people or other machines)

- **Screen readers:** NVDA or JAWS on Windows, VoiceOver on macOS and iOS. Automated checks find about a third to half of real accessibility problems.
- **Firefox**, and **Safari on macOS and iOS**. WebKitGTK shares Safari's engine but not its exact build.
- **Microsoft PowerPoint, Keynote, Google Slides and Adobe Acrobat:** opening the exports in these and checking them by eye. LibreOffice and poppler are independent renderers but are not the tools your readers use.
- **Low-end hardware:** timings above are from a cloud VM, so expect 2–4× slower on modest laptops.
- **Side-by-side tasks against the competitors**, with real users.

## Re-running

The scripts are in `tools/verification/`. They expect:

- the app served at `http://localhost:8765/`
- Playwright with Chrome
- `axe-core` installed in `/tmp/axe`
- `webkit2gtk-driver` plus `selenium` for WebKit, with an X display (Xvfb)
- LibreOffice, `qpdf` and `poppler-utils` for exports
