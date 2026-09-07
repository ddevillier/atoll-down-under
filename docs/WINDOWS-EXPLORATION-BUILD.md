# Windows testing milestone: Exploration

Date: 2026-09-06. Runtime source commit: `8bd0e79`.

Archive: `dist/Atoll-Down-Under-Windows-Exploration-2026-09-06.zip`

Bytes: 219509864

SHA-256: `1830f1f3b795ed20d119178093fd7bc7aee67e784b28db09db2528bf290e61f5`

Extract the whole ZIP and run `Atoll Down Under-win32-x64/Atoll Down Under.exe`. Keep the folder together. Windows x64 only. The app starts fullscreen; F11 toggles fullscreen and Escape pauses.

This includes the prior Windows-Practice milestone plus nine weighted forager communities and nearest-center food/animal selection. Start a new dive to see the new communities; saved dives retain their populations. Selection improvements apply to existing saves without migration. Population ranges, Outer Blue's modest second-hunter chance, predator tuning, food quantities and Tournament sequence are unchanged.

Verification:

- All 123 unit/asset checks and all 32 browser scenarios passed on the runtime source.
- All 55 playable species completed the ten-minute seed-42 automated exploration exercise with protection disabled and no defensive abilities. This bounded exercise does not establish child-play difficulty.
- A 331,650-patch initial-state census found 20,144 animal-over-food center conflicts before the selection repair and none afterward. This is not a player error rate. See FOOD-SELECTION-REPAIR.md.
- Packaged native checks passed fullscreen startup/display coverage/F11 and menu toggles, mouse movement, feeding feedback, travel, shellfish feeding, passive jaws, map, facts, population settings and poison-score consistency.
- The dedicated packaged selection check inspected algae beside a stunned poisonous slug through mouse clicks, resumed and ate the algae: amount 100 to 65, zero poison damage, slug still alive and player energy increased. The controlled fixture isolates target selection.
- Actual packaged export/import used a file on disk and resumed the named Cuttlefish night dive. Native checks used isolated profiles and reported no page errors.
- All 108 checked runtime/asset/document files and selected package metadata matched source at packaging. App archive SHA-256: `01d54067036403ae24ad96c8ad0a07690a06c71b6f5b515b0fddc31c76dc27f4`.
- All 73 ZIP payload files matched the tested runnable folder byte for byte, and CRC passed.

Evidence: `artifacts/selection-e2e-results.json`, `selection-audit.json`, `exploration-selection.json`, `exploration-desktop-report.json`, `exploration-native-selection-report.json`, `exploration-native-save-files-report.json`, `exploration-packaged-source-report.json` and `exploration-archive-check.json`.

Earlier testing ZIPs are preserved. This post-verification receipt and audit-status updates are newer than the application archive; runtime source is unchanged. The overall original-game fidelity objective remains incomplete. Dense background detail, food-patch clutter, occlusion, remaining species/interaction discrepancies and other open audit items are recorded in CURRENT-AUDIT-STATUS.md. Tournament reconstruction remains deferred by user direction.
