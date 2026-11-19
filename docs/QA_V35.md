# OpenViz Studio V3.5 — QA & release evidence

**Status:** Development release candidate. Built on the V3.4 dashboard and Home fixes.

## Delivered

- Publishing Studio accessible from File, the Export chooser, chart toolbar, dashboard toolbar and Story Studio.
- Chart, dashboard or story selection with four publishing layout presets: Responsive website, Article/research, Presentation/widescreen and Portrait/mobile.
- Interactive or static HTML output. Static outputs have no scripts; interactive outputs use the existing chart, dashboard or Story Studio renderer, preserving source data and compatible interactions.
- Sandbox-separated desktop (1080px), tablet (700px) and phone (375px) preview widths. Preview renders **the same generated HTML content** that the download uses.
- Self-contained HTML download and ZIP kit (`index.html` + instructions). No watermark, account, server upload or third-party publishing API.
- Responsive iframe snippet created **only after the user supplies a valid hosted HTTPS URL** (localhost HTTP accepted for local testing). The code includes an accessible title, lazy loading and responsive aspect ratio. `javascript:`, `file:`, ordinary HTTP and credentials are rejected.
- Privacy warning: exports may contain visible dataset values, SVG titles/tooltips and pre-rendered filtering variants. Changing the published asset or settings clears the previously entered hosted URL, avoiding an accidental embed of outdated content.
- Responsive dashboard grids reflow at narrow widths. Free-canvas dashboards preserve the user's coordinates and use horizontal scrolling when required rather than silently rearranging the design.
- Added Basic Help guidance and a dedicated hand-off.

## Tests run

| Test | Outcome |
|---|---|
| `python tests/test-browser-v35-fast.py` | **PASS** isolated Chromium, Blob URL modules / in-memory storage |
| Publishing dialog, actual sandboxed chart preview, responsive device widths | **PASS** |
| Static chart containing no `<script>` | **PASS** |
| Browser-generated HTML download and CRC-valid publishing ZIP | **PASS** |
| Unsafe hosted URL rejected, valid HTTPS embed code enabled | **PASS** |
| Existing dashboard and story render through the Publishing Studio | **PASS** |
| `node tests/test-publishing-v35.mjs` | **PASS** chart/dashboard interactive/static contracts, embed safety, free-canvas geometry |
| `node tests/test-v34-contract.mjs` | **PASS** linked dashboard / large-category export constraints |
| `node tests/test-v331-contract.mjs` | **PASS** dataset rename and Story Studio scene timing contracts |
| `node tests/test-storage-v31.mjs` | **PASS** guarded saves and checkpoint/storage test double |
| `node tests/test-performance-v33.mjs` | **PASS** large scatter / full relationship aggregation contracts |
| Browser-specific real HTTP-origin persistence / cross-browser tests | **PENDING** owner verification |
| Actual external hosting, iframe on Wix/WordPress/other CMS | **PENDING** real target-site verification |

## Known limits / correct expectations

1. OpenViz **does not upload or host** HTML. A downloadable `file://` file is not a public embed URL. The user must upload it to their web host and enter that hosted URL.
2. Not all website builders permit iframes. Some apply restrictive Content Security Policy (CSP) or sandbox settings; testing on the actual target platform is required.
3. Interactive publishing is based on existing exporters. Some charts support hover and filtering; others expose only their visual graphic. Do not claim universal cross-filter functionality.
4. Interactive dashboard HTML supports a single selected filter value up to 24 distinct categories; larger categories switch to cross-highlighting. The editing workspace supports multiple category selection and up to 250 shared values.
5. Publishing styles control the output frame and responsive shell, **not** every underlying chart's custom dimensions or text wrapping. Free-canvas dashboards intentionally scroll horizontally on narrow screens.
6. Self-contained story HTML may become large because it includes pre-rendered animation frames. Very long stories can affect browser memory.
7. Exported files can contain sensitive labels, values, tooltips or cached chart variants. Review content before public hosting.
8. Firefox, Safari, externally hosted iframe sandboxing and app persistence after a hard reload have not been certified by these isolated tests.

## Manual acceptance checklist

- Export a complete `.openviz` backup of an important project first.
- Open chart, dashboard and story in Publishing Studio; verify static and interactive previews at all three device widths.
- Download HTML, open locally and verify the controls in a normal browser.
- Download ZIP kit, extract and verify `index.html` and instructions.
- Upload `index.html` to a real HTTPS web host; paste its HTTPS URL into Publishing Studio and copy the iframe snippet.
- Embed on the actual intended website platform and test phone/tablet/desktop display, title and selection behaviour.
- Confirm public URLs do not expose confidential information; test browser reload and current project backups.
