# Windows testing milestone: species corrections

Date: 2026-09-06. Runtime source commit: `4094e6f`.

Archive: `dist/Atoll-Down-Under-Windows-Species-2026-09-06.zip`

Bytes: 219600954

SHA-256: `3bac516f3693f876021eb6cca21e18bd03cdf4af3ae708ace49ff036b289da85`

Extract the whole ZIP and run `Atoll Down Under-win32-x64/Atoll Down Under.exe`. Keep the application folder together. Windows x64 only; starts fullscreen, F11 toggles, Escape pauses.

## Included changes

This builds on Windows-Saves with the lionfish crab-diet correction and narrow saved-fish migration, corrected coral grouper facts, and corrected facts plus new illustrations for longnose butterflyfish and longfin batfish. The latter two previously used incompatible atlas artwork. Shared renderer overrides apply to swimming animals, portraits and existing saves. See SPECIES-ILLUSTRATION-CORRECTIONS.md for biological sources, exact generation prompts and limits.

Practice and exploration are the priority. Tournament ordering and difficulty are unchanged. The preceding population hills and valleys, Outer Blue's modest extra-hunter likelihood, all 64 written fact entries, fullscreen controls, named saves and portable export/import remain included. Existing saves retain their actual populations.

## Verified evidence

- All 115 unit/asset checks and all 30 browser scenarios pass.
- Dedicated species checks pass at browser widths 1024 and 1600 and in the packaged fullscreen application: scientific-name searches, corrected facts, no horizontal overflow, standalone high-resolution sprite loading, and entry into Practice as longfin batfish. Guide, contact sheet and Practice captures were visually reviewed. No page errors.
- Packaged native checks pass for fullscreen startup/display coverage/toggling, feeding feedback, mouse steering, travel, shellfish meals, passive jaws, map, facts/population settings and poison-score consistency.
- Packaged portable save exported to disk, imported and resumed the named Cuttlefish night dive. All native tests used isolated profiles.
- All 97 checked source/asset/document files and selected package metadata matched the packaged application at build time. App archive SHA-256: `081285d681322f2e7123eb733c08ac2d9abf50df275c2b15a2c28344b71fb972`.
- All 73 ZIP payload files match the tested runnable folder byte for byte; ZIP CRC passes.

Evidence: `artifacts/species-e2e-results.json`, `species-desktop-report.json`, `browser-species-corrections.json`, `native-species-corrections.json`, `species-native-save-files-report.json`, `species-packaged-source-report.json` and `species-archive-check.json`.

Earlier testing ZIPs are preserved. This is a testing milestone, not completion of the fidelity audit. Coral trout and other species mismatches, feeding/defense exceptions, habitat readability and remaining interaction work are still open. This receipt is written after verification; documentation inside the application reflects source commit 4094e6f.
