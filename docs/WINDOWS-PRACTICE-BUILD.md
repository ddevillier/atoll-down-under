# Windows testing milestone: Practice updates

Date: 2026-09-06. Runtime source commit: `f79ca91`.

Archive: `dist/Atoll-Down-Under-Windows-Practice-2026-09-06.zip`

Bytes: 224127464

SHA-256: `7a7ffad7c4b52b5297979a8fa5f4a6b001164203f5ac5bda62fd0015a8fab2de`

Extract the whole ZIP and run `Atoll Down Under-win32-x64/Atoll Down Under.exe`. Keep the folder together. Windows x64 only; native fullscreen on startup, F11 toggles and Escape pauses.

## Included work

This includes Windows-Species plus the corrected lyretail coral trout and short-tail electric ray facts/illustrations, accurate shelter inspection boundaries, size-fit labels, taking-cover feedback and complete arrival-protection wording. Earlier batfish, butterflyfish and grouper corrections, lionfish crab food, varied populations, Outer Blue's modest extra-hunter likelihood, all 64 written fact entries and portable named saves remain included.

The gameplay size cutoff, shelter delay, predator difficulty and Tournament order are unchanged. Stable species IDs preserve existing saves. Existing saved populations are retained; start a new dive to generate a fresh habitat community.

## Verification

- All 118 unit/asset checks and all 31 browser scenarios passed on the runtime source. The focused shelter scenario also passed after the final wording/contrast refinement.
- Packaged native checks pass for fullscreen startup/display coverage/toggling, mouse movement, feeding feedback, edge travel, shellfish feeding, passive jaws, map, facts/population settings and poison-score consistency.
- Packaged shelter check verifies actual concealment in the formerly unmarked portion of the circular area, the renderer's drawn circle coordinates/radii, fit labels and oversized-fish rejection.
- The initial five-second shelter QA timeout was too short for the invisible test window: the successful run advanced 0.7 simulated seconds in 7.462 wall seconds. The QA wait was extended to 20 seconds; gameplay timing was not changed. This check proves the transition and UI, not real-time performance in a visible player window.
- Dedicated packaged species checks pass for all five corrected entries: scientific search, correct facts, no horizontal overflow and high-resolution sprite loading. Batfish, ray and trout enter Practice; the ray's pulse starts its existing cooldown. No page errors.
- A packaged save exported to disk, imported and resumed a named Cuttlefish night dive. Native checks use isolated profiles.
- All 103 checked runtime/asset/document files and selected package metadata matched source at packaging. App archive SHA-256: `3bd3845ff834c65c64ed3bc196ed8052b7817efea1d4eb1bedc9cf683d10bac4`.
- All 73 ZIP payload files match the tested runnable folder byte for byte; CRC passes.

Evidence: `artifacts/shelter-full-e2e-results.json`, `practice-desktop-report.json`, `practice-native-shelter-report.json`, `practice-native-species-report.json`, `practice-native-save-files-report.json`, `practice-packaged-source-report.json` and `practice-archive-check.json`.

Earlier testing ZIPs are preserved. This post-verification receipt and CURRENT-AUDIT-STATUS.md are newer than the application archive. The QA script's timeout correction is also newer than the packaged runtime source; it changes only the external test harness. The original-game fidelity audit remains incomplete, with current priorities and unresolved areas recorded in CURRENT-AUDIT-STATUS.md.
