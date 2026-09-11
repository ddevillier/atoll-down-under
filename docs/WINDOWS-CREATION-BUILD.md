# Windows Create-a-Fish testing build

September 10, 2026. Runtime checkpoint **e063667**. Windows x64 only.

Extract `dist/Atoll-Down-Under-Windows-Create-a-Fish-2026-09-10.zip` completely, then open `Atoll Down Under-win32-x64/Atoll Down Under.exe`. F11 toggles fullscreen. Game → Create a fish opens the editor; File → My creations returns to kept fish.

## Included

The complete first creation loop: explicit body forms, reactive animated preview, repeatable safe test swims, independent variations, persistent named fish and personal memories, rename/resume/new-swim controls, and a creation-specific guide. Small grazers can choose a refuge, leave for a needed meal and return. Actual pursuit feedback makes concealment visible. Existing species journeys, offline narration, music and full-quality GPU animation remain included.

The mutable-editor save corruption is fixed. Legacy custom saves migrate; portable export version 2 carries creation identity, while the importer still accepts version 1. Created fish do not inflate real-species achievements. Failed IndexedDB writes remain visible and can recover when storage is available.

## Verified

- **357 unit tests passed**, including new identity, migration, refuge and trial rules.
- **12 distinct affected browser scenarios passed**. The seven creation scenarios passed again in final confirmation, including storage recovery, independent variations, conflicting imports and ordinary-controls refuge/meal/return. Layouts were inspected at 1280×720 and 1920×1080.
- **Two packaged native checks passed** in isolated profiles: creation/fullscreen/trial/resume/guide, and the existing desktop regression covering feeding, travel, map, populations, music and controls. No page errors.
- **Nine packaged 4K cases passed**, with custom day/night and cuttlefish players across three habitats. Actual backing canvas: 3841×2160; at least 240 samples per case. All used WebGL, with GPU acceleration confirmed, **zero budget deferrals**, worst draw p95 **12.0 ms**, worst callback p95 **17.1 ms**, and maximum observed pose hold **55.3 ms**. These are sampled timings, not guaranteed monitor presentation or locked 60 FPS.
- **265 runtime/asset files** matched the source byte for byte. Packaged application metadata matched its source fields; development-only package fields are deliberately pruned.
- **All 73 ZIP payload files** passed CRC and SHA-256 comparison against the tested application folder.
- Independent UI review: **ship**. Its one material finding, clipped test-safety text, was resolved at both sizes. [Review](CREATION-UI-REVIEW.md).

The generated-community escape proof is separate from browser play: production steering/feeding commands led a small fish away from a coral trout and into concealment, without replacing animals or appetite. See [implementation and evidence](CREATION-LOOP.md).

## Artifact identity

- ZIP: `Atoll-Down-Under-Windows-Create-a-Fish-2026-09-10.zip`
- Bytes: **260,125,608**
- SHA-256: `0f7698c7d96fb367720105f6ec6c9caf52a88e698cae29aa624a387adae328a1`
- app.asar SHA-256: `8bb83b642bf085005ccf86e76b885ac1c8fa499fa7f79e3e7490d3a3ff0d75c3`

The September 9 Full Animation ZIP is retained and its SHA-256 reverified as `a5aa4fb8e6ef8c44b28742886367f5979cf1f8bf5806722e78c5fa5882ab91d8`. No old archives were deleted in this work and no Apple Silicon build was made.

Local evidence: `artifacts/creation-unit.log`, `creation-browser.log`, `creation-final-browser.log`, `creation-storage-recovery.log`, `creation-generated-refuge.json`, `creations-native/report.json`, `creation-packaged-desktop.log`, `creation-packaged-4k/report.json`, `creation-package-content.json`, and `creation-archive-report.json`. The native creation script was corrected after packaging to wait for asynchronous resume before inspecting identity; its packaged rerun passed. This changes the external test harness only. This receipt and the latest-build README were also updated after packaging; runtime files remain e063667.

## What remains unverified or deferred

No child playtest has established enjoyment, comprehension or voluntary return. The screenshot review does not establish motion expressiveness. This build reuses established rigs and adds preview/interaction feedback; it is not another whole-species animation overhaul. The next social roles, modular anatomy, broad ability rebalance and offscreen ecosystem are not included. New narration was not generated.

Try making a small grazer, testing a larger variation, then returning to the original through My creations. Watch whether the differences encourage another experiment without an adult reading the next task.
