# Windows testing milestone: portable saves

Date: 2026-09-06. Runtime source commit: `dae2b94`.

Archive: `dist/Atoll-Down-Under-Windows-Saves-2026-09-06.zip`  
Bytes: 216204043  
SHA-256: `36f32547df77dcdfd0320ccb24b667f2cb3047199582af966a49362cd9a8e467`

Extract the whole ZIP and run `Atoll Down Under-win32-x64/Atoll Down Under.exe`. Windows x64 only. Starts fullscreen; F11 toggles windowed mode and Escape pauses for inspection. Keep the application folder together.

This includes the preceding population build plus the complete Tournament preview and named, portable `.atoll` saves. Use **Save / load** during a dive to name and export it. Import is available there and under **File → Saved dives** at the title screen. Imports show a preview before opening; the three manual slots are retained. Ctrl+S updates the local last dive, rather than an exported backup. See [PORTABLE-SAVES.md](PORTABLE-SAVES.md).

All 64 catalog creatures have sourced written facts, with ambiguous identities explicitly qualified. Quiet and busy habitats retain their different population ranges; Outer Blue has a 45% second-hunter chance versus 25% elsewhere. Start a new dive for these ranges. Existing saves and imported files retain their actual animals. Pursuit speed and damage have not increased.

## Verified evidence

- 113 unit/asset checks pass, including all 55 playable species round-tripping through portable saves, custom fish, older health fields and invalid-file rejection.
- All 30 browser scenarios pass. Coverage includes file download/import, names across reloads, cancellation and error preservation, all Tournament preview entries matching play order, keyboard navigation, fullscreen and existing gameplay flows.
- Packaged native checks pass: fullscreen display coverage and toggling, mouse steering, meal feedback, boundary pursuit, shellfish feeding, passive jaws, reef map, 64 facts/sprites, population parameters and poison-scoring consistency. Temporary isolated profiles keep QA out of player saves.
- Packaged export/import check: Electron reported a completed file download; the disk file parsed successfully; the UI imported it and resumed a Cuttlefish night dive at `atoll://game`, with the name retained and no page errors.
- All 90 checked source/asset/document files and selected package metadata matched the packaged app at build time. The app archive SHA-256 is `4fa7fa470a190cbdb1e77b3025e8a70e17ef4c698095e3cb4ef5540db6658c66`.
- ZIP CRC check passed. The ZIP's complete set of 73 payload files matches the tested runnable folder byte for byte.

Evidence files: `artifacts/e2e-results.json`, `desktop-report.json`, `native-save-files-report.json`, `packaged-source-report.json` and `saves-archive-check.json`. Reproduce native checks with `scripts/qa-desktop.mjs` and `scripts/qa-save-files-desktop.mjs`, passing the packaged executable path.

Earlier testing ZIPs are preserved. This is a testing milestone, not final acceptance of the original-game fidelity audit. Original roster/order, food-chain exceptions, scoring details, animation, scene readability and interactions still need work. Documentation inside the app reflects the source at packaging; this post-verification receipt records the resulting build.
