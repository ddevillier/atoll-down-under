# Windows roster uplift testing build

September 7, 2026. Portable Windows x64 candidate: `dist/Atoll-Down-Under-Windows-Living-Reef-2026-09-07.zip`. Extract the complete folder and open `Atoll Down Under.exe`. Startup is fullscreen; F11 toggles it and Escape pauses observation.

This combines the roster animation and local ecology pass. Sharks and fast fish have visible tail propulsion and coasting; reef fish have separate fin movement; cleaners inspect along a client's body; residents keep painted support; schools, pairs, refuges, host partnerships and occasional lure/shadow interactions use the local simulation. The cuttlefish animation is preserved.

Try a blacktip or tiger shark in Practice, then a small reef fish and a cleaner. Watch acceleration, turning, feeding and settling. Pause over an NPC pair after a meal: the name should leave both fish visible. The Family Journal, species adventures and optional local narration remain available.

The [final roster review](animation-strategy/final-roster-review.md) describes all 64 developer review records and verification limits. Turns still use a mirrored 2D painting; fine appendages can be subtle on small displays. This is a testing build for feedback on feel, not a claim of finished production art.

The earlier `Atoll-Down-Under-Windows-Species-Adventures-2026-09-07.zip` is preserved. Its SHA256 is `3e54302b04334077f3f72a32780fcd66b447b52248557624dca7b374ab6f00e4`.

## Verified delivery

The animation/ecology pass is complete and parked for testing. Tested runtime commit: a0f3360. No further development or generation is queued. The larger remake remains an ongoing project.

All 277 unit checks and 75 distinct browser scenarios have passing evidence across the combined run and targeted fixture/presentation corrections described in the final roster review. Three packaged Windows checks pass with isolated profiles and no reported errors: fullscreen and ordinary gameplay; real portable save download/import; and the cuttlefish E/adventure, camouflage checkpoint, local narration, audio ducking, stop-on-close, reduced motion and narration volume.

The final four native habitat measurements at both display sizes report draw p95 at most 10.8 ms and animation callback p95 at most 17.6 ms. Cached mesh pixels stay below the existing limit. These are Windows measurements, not a universal monitor-FPS guarantee. The GPU flag was captured before asset loading and does not reliably establish the backend during measurement. All recorded runtime hashes match the delivered source.

All 259 checked source/asset/document files and package metadata matched before these receipt edits. All 73 ZIP payload files match the tested application byte-for-byte; CRC passes. The previous Species Adventures ZIP retains its original hash.

- ZIP: Atoll-Down-Under-Windows-Living-Reef-2026-09-07.zip
- Bytes: 242804033
- ZIP SHA256: bd8a4462d242b229cfbd8cc01d95e4d6c2da85c4b854ea63c880fb6f0ee3e2b2
- app.asar SHA256: 19db77337689e05a6358555b82da9a5c4c2c2d3b19940307e61c95ba0df40295

The source README, coverage/status records and this receipt were updated after packaging; those documentation-only edits are newer than the internal packaged documents. Runtime code and assets are unchanged.

Evidence: artifacts/roster-final-unit.log, roster-final-browser-results.json, roster-final-interaction-browser.log, roster-native-gameplay.log, roster-native-saves.log, roster-native-adventures.log, roster-packaged-source.log, living-reef-archive-report.json, and roster-native-performance/delivery/report.json.
