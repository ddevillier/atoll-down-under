# Windows motion correction — verified testing handoff

September 9, 2026. Runtime checkpoint **46e62db62644b5382de2d2d69c374839b8e74ba4**. Windows x64 only.

## Open the game

Extract `dist/Atoll-Down-Under-Windows-Motion-Correction-2026-09-09.zip` completely, then open `Atoll Down Under-win32-x64/Atoll Down Under.exe`. Keep the extracted folder together. Windows starts fullscreen; F11 switches to a window.

All 57 playable journeys and seven resident observations, persistent journal discoveries, 64 activity recordings and 64 guide introductions remain included. Start a Practice dive and choose **Try adventure**. For a resident, pause, inspect the individual, and choose **Resume watching**. **Hear this activity** or **Hear this observation** plays the bundled offline explanation. The journey runtime, save behavior and audio files are unchanged from the [verified all-species build](WINDOWS-ALL-SPECIES-JOURNEYS-BUILD.md).

This release restores the cuttlefish's traveling fin ribbon and expressive arms in actual gameplay, including during camouflage. It corrects intrinsic caudal-fin motion across 53 fish species. The independent painted-pixel check confirmed the previous exaggerated vertical motion: blacktip shark 54.49 px and tiger shark 61.37 px at gameplay size, now 0 px relative to their bodies. Whole-animal swimming, pitch and turns can still move the tail on screen. See [the complete investigation](animation-strategy/caudal-cuttlefish-correction.md) for scope, measurement methods and historical-reference uncertainty.

## Verification

- **351 unit tests passed**, including all journey lifecycle/save tests, painted tail attachment and projection, cuttlefish core protection and positive mesh geometry.
- **11 distinct targeted browser scenarios passed** across the regression run and corrected cuttlefish rerun. The first combined run had ten passes and one compact-layout control-test failure; an unobscured swimming waypoint fixed the test navigation, and all three cuttlefish cases subsequently passed. This is not a claim of one entirely green 11-case run. Coverage includes actual cuttlefish movement, sand blending, pause and release at 1600×900 and 1024×768, 48 requested animation phases under exhausted background budget, painted-piece alignment, reduced motion and actual feeding.
- **Two packaged native functional checks passed** using isolated QA profiles. They cover startup fullscreen and toggles, steering, feeding, habitat travel, map, normal population checks, cuttlefish context controls and camouflage, portable paused state, narration stop/volume and reduced motion. No page errors.
- **54 native performance cases** covered nine habitats, 1600- and 1024-pixel widths, and day, night and cuttlefish player species. No page errors; at least 180 measured frames per case. Worst draw p95 **12.4 ms**; callback interval p95 **20.8 ms**. The visible Windows app used software rendering. In all 18 player-cuttlefish cases, player mesh requests had **zero deferrals**, with a longest sampled pose hold of **49.1 ms**. Background mesh animals still had budget deferrals and a worst sampled hold of **287.9 ms**. These are sampled renderer CPU/callback and canvas-change measurements, not guaranteed display frame rates.
- Before receipt edits, **346 packaged source/asset/documentation files** matched the runtime checkpoint, along with package metadata. All **73 ZIP payload files** passed CRC and byte-hash comparison against the tested application folder.
- All five previous Windows testing ZIPs retain their original SHA-256 hashes. Native tests used isolated profiles. No Apple Silicon build was made.

The earlier all-species acceptance evidence remains applicable to unchanged journey code: **154 completed generated paths covering every species**, representative controls for every journey family in the earlier 115-test browser suite, and technical audits of all activity/guide audio. Those broad suites were not rerun for this renderer-only correction; current checks are listed separately above.

## Artifact identity and review evidence

- ZIP: `Atoll-Down-Under-Windows-Motion-Correction-2026-09-09.zip`
- Size: **260,061,598 bytes**
- SHA-256: `3f175ea5682d9c7ded2731b361e1009733652c6323bd89586c095ce7fdae71c4`
- Packaged app.asar SHA-256: `4a51ca11bf55d52326548ba0acfd4ccbc4f5578c670de532b6c7e8cbd688f0bf`
- Before/after moving comparison: `artifacts/caudal-rendered/motion-comparison.mp4` (23.96 seconds; full decode passed).

Local machine receipts: `artifacts/caudal-unit-final.log`, `caudal-browser-final.log`, `cuttle-browser-final.log`, `caudal-native-desktop.log`, `caudal-native-adventures-desktop.log`, `caudal-native-performance/report.json`, `caudal-native-performance/summary.json`, `caudal-after.json`, `caudal-rendered/measurements.json` and `motion-correction-archive-report.json`.

This receipt and the final README/investigation wording are documentation-only changes after packaging. The archive contains runtime 46e62db's candidate wording; this receipt records the completed verification. The exact previously admired cuttlefish clip has not been identified, so this is a restoration of its earlier expressive range and correction of ribbon suppression, not a claim of an exact historical animation match.
