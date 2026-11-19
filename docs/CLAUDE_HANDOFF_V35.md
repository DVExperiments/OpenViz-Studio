# V3.5 Engineering hand-off (Claude / further engineering)

## Entry point & files

- `index.html` loads `src/app.js` (native ES modules).
- **New:** `src/publishing.js` contains the pure publication specification/preset logic, document builders, safe URL handling and iframe code generation.
- `src/app.js` adds Publishing Studio state (`publishUI`), modal rendering, document previews, download and ZIP actions and delegated field events. All publication changes are **temporary UI state**, not project/data mutations.
- `src/styles.css` contains the split publishing dialog, device preview and small-screen layouts.
- Existing trusted exporters remain authoritative: `src/exports.js` chart HTML; `src/dashboard-interactive.js` linked dashboards; `src/story.js` deterministic story frames.

## Contracts and security

- `createPublication(project,{kind,assetId,preset,interactive,showTitle})` generates HTML/metadata only and never uploads.
- `safePublishUrl` accepts HTTPS and HTTP **localhost only**. Avoid interpolating untrusted URLs in executable JS. `embedCode` HTML-escapes URL/title attributes. Do not bypass these guards.
- The preview iframe uses `sandbox="allow-scripts"` without `allow-same-origin`, `allow-top-navigation` or other privileges.
- Never automatically insert a placeholder public URL; the user must supply their actual hosted HTML URL. Changing output settings invalidates this URL.
- Respect CSP and sandbox restrictions of third-party hosts and don't claim OpenViz provides hosting.
- Publishing self-contained HTML may include dataset values and filtering variants; the privacy notice must remain visible.
- Static HTML exports must include no executable scripts. Interactive content uses locally bundled chart renderers and existing limitations.
- Keep `.openviz` storage/project formats unchanged; do not modify the original data when formatting publications.

## Tests

Run:

```sh
python tests/test-browser-v35-fast.py
node tests/test-publishing-v35.mjs
node tests/test-v34-contract.mjs
node tests/test-v331-contract.mjs
node tests/test-storage-v31.mjs
node tests/test-performance-v33.mjs
```

Isolated Chromium browser tests use Blob URL module imports and a fake storage layer because this environment blocks network navigation (including localhost). They cannot certify real-origin IndexedDB saves/reloads or live website embeds.

## Next engineering work

- Test on normally hosted Chrome, Edge, Firefox and Safari; verify resize/scroll, iframe permissions, and focus navigation.
- Add optional managed hosting only if explicitly approved, with a separate service/privacy design; do not silently add APIs to the local-first core.
- Improve publishing presets with richer typography and accessibility options; add consistent metadata and downloadable embed gallery templates.
- Add export-size estimates, large-story warnings, and optional source-data inspection of generated HTML before public posting.
- V3.6 proposed: Story Studio audio tracks, more professional video compositing and export settings, preserving the deterministic frame renderer and privacy-first architecture.
