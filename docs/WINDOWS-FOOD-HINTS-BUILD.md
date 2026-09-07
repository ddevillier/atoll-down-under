# Windows Food Hints testing build

Verified September 6, 2026. Packaged source commit: `2e43ce2` (food-hint implementation `7c9d3b0`).

Archive: `dist/Atoll-Down-Under-Windows-Food-Hints-2026-09-06.zip`

Extract and launch `Atoll Down Under.exe`. Windows x64, fullscreen at startup. Press **H** during a dive or use **Highlight nearby suitable food (H)** in Settings. It starts off, remembers the preference, and marks up to three suitable nearby meals. Click to approach and eat normally. F11 toggles fullscreen; Escape pauses. Earlier cleaner controls and spaced station queues are included.

## Evidence

- All 138 unit/asset checks and four relevant browser scenarios pass for the implementation. Two window-size captures were reviewed. See FOOD-VISIBILITY.md and `artifacts/food-hints-e2e-results.json`.
- Packaged food-hint checks pass: default off, H shortcut, settings toggle, persistence after reload, typing without accidental toggling, and actual mouse feeding. Report: `artifacts/food-hints-native-report.json`.
- Native fullscreen/gameplay and actual portable-save export/import/resumption pass with isolated profiles and no reported errors. Reports: `artifacts/food-hints-desktop-report.json` and `food-hints-save-files-report.json`.
- Simulation and cleaner-queue source files are unchanged from the preceding verified cleaner-queue milestone. The aid does not alter food supply, populations or difficulty.
- All 120 checked source/runtime/asset/document files and package metadata match at packaging. All 73 ZIP payload files match the tested runnable folder byte-for-byte; CRC passes. Reports: `artifacts/food-hints-packaged-source-report.json` and `food-hints-archive-check.json`.

## Integrity

ZIP bytes: `225760510`

ZIP SHA256: `e0dc3514f8a630418d82c4065a4b167b0ae7c256c9da8a251c72409bede12a45`

app.asar SHA256: `9f99230b08bab5920386aaa239af6512192287060d259cbc86ebcc4a90d26b0c`

This receipt and final status updates postdate the packaged runtime. Earlier ZIPs are preserved. No new original-game research was performed, and the parked diet pass remains excluded. The optional aid does not resolve all background readability concerns or complete the broader objective.
