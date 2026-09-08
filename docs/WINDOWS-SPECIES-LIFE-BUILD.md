# Species Life — verified Windows testing build

September 7, 2026. Portable archive: `dist/Atoll-Down-Under-Windows-Species-Life-2026-09-07.zip`.

This build combines the Living Reef artwork/animation with 19 optional species adventures and 57 Practice choices. It includes cleaner care, shared sand discoveries, renewing grazing patches, companion feeding trips, school feeding waves and short ambush strikes. Normal mouse swimming now brakes near the destination so fish settle instead of circling it indefinitely.

See [Ways of living](SPECIES-LIFE.md) for the activities and controls. Extract the whole application folder and open `Atoll Down Under.exe`. The game starts fullscreen; F11 changes display mode, and Escape pauses for inspection. No server or account is required to play.

## Verification status

Tested runtime checkpoint: `865a7a7`. The complete activity acceptance audit is in [GAMEPLAY-UPLIFT.md](GAMEPLAY-UPLIFT.md). Receipt and handoff documentation were finalized after packaging; the archive contains their earlier candidate wording. Runtime code and assets have not changed since the checked package.

- 314 unit checks pass, including nearby arrival for all 57 Practice species from four headings.
- The 54-case, three-minute habitat/period/seed survey reports fixed populations, finite resources, 30 bites and no deaths. All 54 portable checkpoints replay. These inactive-player scenarios are stability evidence, not a promise about active-play survival.
- All 16 generated grazing routes complete; maximum elapsed simulation time is about 27.3 seconds.
- All 84 browser checks pass in one complete run (`artifacts/gameplay-final-browser.log`), including current activity controls, journal, older adventures, animation state, pause, reduced motion and both viewport sizes where specified by each scenario.
- Packaged Windows checks pass for startup fullscreen covering the display, F11 and visible fullscreen controls, mouse steering, edge travel, map routing, actual portable dive export/import, journal backup/restore/deduplication and reload persistence. The tests use isolated QA profiles, not the family's actual saves.
- Packaged cleaner simulation checks complete three distinct client species for both roles and retain discoveries in portable saves. Actual native E/mouse controls verify ambush settling, aiming, cancellation and a frozen paused checkpoint. The cleaner completion checks run the simulation inside the packaged runtime; they are not a claim of three-client mouse play.
- Native cuttlefish context action, guide narration playback/music ducking/stop-on-close, narration volume and reduced motion pass. Existing narration files are used; this work generated no new API audio.
- All 36 native performance samples (nine habitats × day/night × 1600/1024 widths) finish without errors, with at least 180 frames per case. Worst per-case 95th-percentile renderer draw time is 10.4 ms; callback interval is 17.4 ms. Maximum mesh-cache allocation is 12,578,912 pixels, with 7,423,747 prepared part pixels. The window was visible and software rendering was reported. This measures renderer CPU and callback cadence, not guaranteed monitor presentation or performance on another computer. Source hashes in `artifacts/species-life-native-performance/report.json` match the tested runtime.
- Before final receipt edits, all 268 checked source/asset/document files and package metadata matched `app.asar`. ZIP CRC and all 73 payload files match the tested application byte for byte.

## Archive identity

- Size: **242,825,975 bytes**.
- ZIP SHA-256: `6dd46a46aed21914fc88bbc0c54e4af4d9e56fc6e4472d0723139f073bc0e95d`.
- `app.asar` SHA-256: `131581d06939eaa097a6cf1247b253b040888a7065d0a63a0688242b2b56098a`.
- Archive verification: `artifacts/species-life-archive-report.json`.

## Play feedback still matters

Activity opportunities depend on generated neighbors, hunger and location. These tests establish working paths and stable sampled communities, not universal completion times or a claim that every loop is already maximally enjoyable. The next useful test is ordinary free exploration with a cleaner, a grazer and a school fish. Check whether waiting feels purposeful, feedback is clear and interactions invite another try. Existing 2D turns still switch side-facing artwork; small fins remain subtle at small display sizes. This gameplay pass does not claim another visual overhaul.

The previous Living Reef and Species Adventures archives remain preserved. No macOS/Apple Silicon build is part of this handoff.
