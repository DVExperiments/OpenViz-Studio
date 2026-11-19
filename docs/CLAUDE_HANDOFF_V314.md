# V3.14 handoff

New `src/race-export.js` owns race export plans, bounded GIF sampling, time-to-position mapping, shared SVG frames, cancellable browser rasterisation and real-time canvas recording. Export ranges are sliced from the validated race model and have their own fixed scale/history/captions. Internal `racePreparedModel` is passed through buildChart's override argument, never through a saved chart property, to avoid reaggregating source rows on every frame. Renderer/frame sampler remain authoritative.

GIF encoder APIs now accept optional per-frame delays and loop=false, preserving existing defaults for story/motion callers. Cumulative centisecond rounding preserves total duration. LZW output is appended in chunks to avoid argument-count overflows. Race frame plans include every observed endpoint, reduce extra interpolation frames to fit 96 MiB/220 frames, and reject ranges that cannot fit even endpoint frames. GIF limit is 60 seconds; video is 90 seconds/64 MiB. A zero hold still includes one output frame.

App: dedicated Export race animation dialog, range/size/speed/fps/hold/loop controls, estimates, progress, cancellation and Download again. The race player's editor button and race Motion entry route here. Source charts/rows are cloned at job start and stay unchanged. closeModal aborts active jobs. Static/dashboard/story outputs remain selected snapshots. Interactive HTML retains live controls.

Native video uses preferred supported MP4/WebM with captureStream(fps), optional requestFrame, real wall-clock timing, visibility interruption and recorder cleanup. Mocks cover lifecycle, not codec quality. Chromium still cannot launch here. Real browser/Windows video and browser GIF rasterisation are pending.

See QA_V314 for actual decoded GIF verification through CairoSVG raster fixtures and Pillow. The example GIF is a renderer/encoder fixture, not proof of native browser export. Future changes to race rendering should retain its history, caption timing, scale and missing-value semantics.

Next: category images/flags and richer race styling, then line races/time sliders. Keep the user-facing What's next note last after every batch, and include the Windows server command when needed.
