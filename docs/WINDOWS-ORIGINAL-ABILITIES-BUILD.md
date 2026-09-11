# Windows original-abilities checkpoint

September 10, 2026. Runtime commit: `f5f0b28`.

Build: `dist/Atoll-Down-Under-Windows-Original-Abilities-2026-09-10.zip` (264,615,306 bytes). Extract and run `Atoll Down Under-win32-x64/Atoll Down Under.exe`.

ZIP SHA-256: `86b4511898712624f556adfe7aabbaaa057009fd8dbd981fe0e586461733fe3f`

app.asar SHA-256: `87ee1b9de5304974211adb89d879c4daf9677c31327b69070c06181e34c9a7e8`

The [ability audit](ORIGINAL-ABILITY-AUDIT.md) is included in the application archive. This release receipt was written after packaging and lives alongside the source; it is not inside that archive.

## Delivered

Eleven original ability families audited against browser-visible original-game evidence and the complete browser-readable species guide. Passive Poisonous body and Imitate cleaner added to Creature Workshop. Predator-specific defense responses, reactive NPC defenses, revalidated targets, player stun handling, plankton attraction, cleaner invitation motion and body/effect feedback completed. Existing abilities and saves remain compatible. The audit records intentional remake differences and five future proposals, which remain unimplemented.

## Verified

- 400 unit tests passed on the final runtime.
- Eight ability/flashlight/lure browser checks passed, including keyboard activation, mouse-driven mimic feeding and native-species reduced-motion states.
- Sixteen creation/anatomy/cleaner browser regression checks passed; three overlap the earlier ability cases. Both cleaner species completed actual generated-client service through mouse controls at two viewport sizes.
- Source-native and packaged-native Windows checks passed in isolated QA profiles: fullscreen startup and F11 toggling, creating a mimic, inviting and nipping a host without killing it, saving/reloading the same creation and host memory, and passive poison with zero activation cooldown. No page errors recorded.
- Package verification matched 395 source/asset/document files and application metadata before this receipt was added.
- Archive CRC passed; every one of its 73 files matched the packaged payload by SHA-256.

Evidence: `artifacts/original-abilities-units.log`, `original-abilities-browser.log`, `original-abilities-regression.log`, `original-abilities-packaged/report.json`, `packaged-source-report.json`, `original-abilities-archive.json`, and `original-ability-pixels.json`.

## Limits

Original emulator observations establish the named abilities and their described intent; not every original ability was activated against a live attacker because the emulated mouse was unreliable. Timing and balance are our authored remake rules. Cleaner imitation is available for created fish; no separately illustrated Cleaner Mimic Blenny was added. This checkpoint has no new monitor-presentation or extended performance claim. Earlier testing archives are preserved.
