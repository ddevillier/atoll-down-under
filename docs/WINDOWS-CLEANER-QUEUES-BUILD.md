# Windows Cleaner Queues testing build

Verified September 6, 2026. Runtime source commit: `2ab4435`.

Archive: `dist/Atoll-Down-Under-Windows-Cleaner-Queues-2026-09-06.zip`

Extract and launch `Atoll Down Under.exe`. Windows x64; starts fullscreen. F11 toggles fullscreen, Escape pauses, and C requests a cleaner visit.

This build includes the complete cleaner loop and subsequent interruption fixes. Waiting visitors now swim to separate positions instead of stacking on the treatment point. The current client finishes first, a requested player visit goes next, and other fish then approach in proximity order. Stunned cleaners pause NPC treatment; ended visits discard stale progress. Population ranges and predator difficulty settings are unchanged. No new original-game comparison research was used.

## Verified behavior

- All 136 unit/asset checks and 35 browser scenarios pass. Queue destination spacing covers day/night fixtures in all nine habitats; saved queues resume deterministically and all clients eventually receive treatment.
- All 55 playable species complete the ten-minute seed-42 exploration regression exercise. This bounded automated exercise does not predict a child's difficulty experience.
- Packaged Windows day/night checks pass for visit controls, gradual parasite healing, cancellation, restart, and completion that preserves bite damage. Both visits finish at 85 health with 15 bite damage; cleaners stay alive.
- Packaged queue fixtures keep waiting fish roughly 99 world units apart at their closest centers, then complete player and NPC treatment after a temporary cleaner interruption. These fixtures advance simulation time directly; they do not measure wall-clock treatment duration.
- Native fullscreen/gameplay and actual save-file export/import/resumption pass. All three native reports contain no errors and use isolated profiles.
- All 116 checked source/runtime/asset/document files and package metadata match the application at packaging. All 73 ZIP payload files match the tested runnable folder byte-for-byte; CRC passes.

Evidence: `artifacts/cleaner-queues-e2e-results.json`, `cleaner-queues-desktop-report.json`, `cleaner-queues-save-files-report.json`, `cleaner-queues-native-cleaner-report.json`, `cleaner-queues-packaged-source-report.json`, and `cleaner-queues-archive-check.json`. Visual captures: `cleaner-queue-Neon-1024.png` and `cleaner-queue-Flashlight-1600.png`.

Waiting destinations are separated; swimming paths can still cross. Extremely crowded imported saves use the best available position if full separation will not fit. This milestone does not close the broader project or every historical audit consideration.

## Integrity

ZIP bytes: `225755715`

ZIP SHA256: `14f16321a8dd3e545efa50b50529ad763ec44e4ab53650a62c58fbcecc116c48`

Packaged app.asar SHA256: `dadfbf2e57ab7a7e5ed161ded6885fe9895b3da5b817a35abc3a764ee7e7a044`

This receipt and final status updates postdate the verified runtime. Earlier ZIPs are preserved. The parked extra-diet pass remains excluded.
