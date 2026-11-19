# V3.13 handoff

New `src/race-presentation.js` exports pure history/caption/clock helpers plus SVG presentation renderers. `race.js` attaches bounded captions to model frames, lays out optional caption/history areas, and shares the same data with its player. The standalone script serialises static helper function definitions; data remains escaped application/json. No source-row edits occur.

Portable chart settings: raceTimeline (default true), raceTimelineEntity (empty means highest peak), raceCaptions (period-string map), raceLoopPauseMs (default 1000, clamp 0–10000). The editor's raceCaptionText is a pseudo-setting that updates the caption for raceIndex, never an extra persisted value field. It uses defineProperty for arbitrary safe period keys, including __proto__. Captions for other datasets remain dormant, allowing source-switch undo/return.

The runtime uses advanceRaceClock for movement and final holds. Loop pauses are independent of speed; pause/resume preserves holdMs. Manual seeking clears holds. History keyboard/pointer selection seeks observed integer periods; slider interpolation and reduced-motion behaviour remain compatible. The miniature chart uses the global race maximum and does not bridge missing values. Interactive history is a slider; static history is an image. Small thumbnails omit it.

Example constructors preserve sample captions and create new races at height 720. Existing saved dimensions remain intact. Caption metadata/frames are public in interactive HTML, as disclosed in warnings. Static exports and dashboard/story scenes stay snapshots. Do not claim recorded race GIF/video export yet.

Next batch: actual race GIF/video output including captions/history. Preserve all current data, undo, responsiveness, portable-project, no-account/local operation and accessibility controls. Further Flourish gaps remain in FLOURISH_PARITY.md. At every batch completion, include a clear What's next note for the user, plus the Windows server command when needed.
