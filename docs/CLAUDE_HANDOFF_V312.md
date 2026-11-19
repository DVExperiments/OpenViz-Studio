# V3.12 handoff

`src/race.js` owns the pure model/frame sampler, static renderer, player markup and dependency-free browser runtime. It is dispatched through RESEARCH_META/RESEARCH_TYPES and the expanded chart pipeline, remaining excluded from generic SERIES_TYPES. Contracts bind x=period, seriesField=entity, y=value. Count permits no measure. raceIndex, raceTopN, raceStepMs, raceMissing and raceLoop are portable chart properties. source mutations never occur during playback; static-period capture updates raceIndex via normal undo.

The player serialises aggregates/settings as escaped application/json, never into executable data. raceRuntimeScript embeds only static function definitions. Editor players are disposed on rerenders/navigation; detached/hidden documents pause. Three responsive SVG scenes share one timeline. Geometry comes from data-race-scene attributes; hidden marks are skipped by generic keyboard navigation. Deterministic entity-name colours survive filters. Negative numeric values and oversized timelines/entities block explicitly.

`buildChart` permits empty race frames through its ordinary no-data guard so a missing period can still have a scene and later play into valid periods. HTML exports use raceSeed to include hidden category nodes for animation. Dashboard/story/video paths remain saved snapshots; UI, README and QA say so. Do not claim race-video export until it is implemented and tested.

Keep the earlier compact editor, Project open by default, Templates window search, reviewed dataset switching, collapsible sidebar and map-source toggle. Some V3.11 helper CSS referenced non-existent colour tokens; V3.12 uses existing --line/--ink/--secondary tokens.

Next work is listed in FLOURISH_PARITY.md. Browser testing remains unverified in this environment.
