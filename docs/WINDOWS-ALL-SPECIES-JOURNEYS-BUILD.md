# Windows all-species journeys — verified testing handoff

September 8, 2026. Runtime checkpoint **da0bca2**. Windows x64 only.

## Open the game

Extract `dist/Atoll-Down-Under-Windows-All-Species-Journeys-2026-09-08.zip` completely, then open `Atoll Down Under-win32-x64/Atoll Down Under.exe`. Keep the extracted folder together. Start a new Practice dive for a fresh journey. Choose **Try adventure** to show the steps, or explore freely and open the activity card later. F11 toggles fullscreen.

All **57 playable species** now have journeys. To try a **resident observation**, pause with Escape, inspect a seahorse, crab, sea star, nudibranch, snail, urchin or anemone, then choose Resume watching. Watch the existing animal's next suitable meal and subsequent rest or movement. These routines can take time; no food or appetite is manufactured to hurry them. Completed discoveries persist in the Family Journal. Repeating an activity keeps the existing discovery.

Choose **Hear this activity** or **Hear this observation** for optional spoken instructions. All 64 activity explanations and the existing 64 field-guide introductions are bundled offline. The game needs no API key or network connection.

## Verification

- **349 unit tests passed**, including journey state validation, interruption, pause, travel, lost/replaced hosts, portable saves and persistent discoveries.
- **154 generated acceptance paths passed across all 64 species**: the original 19 at seed 42; 45 added roles at seeds 2, 42 and 57. Source hashes still match the verified runtime. Population, appetite, food and positions were not replaced by these acceptance drivers.
- **115 browser tests passed**, with zero skips, unexpected failures or flaky results. Representative real controls cover every journey family, with coverage at 1600×900 and 1024×768. This does not claim a manual playthrough of every species.
- All six packaged native checks passed in isolated QA profiles: fullscreen/steering/feeding/travel/map, named save export/import, journal backup/restore/persistence, cuttlefish context and narration, cleaner and ambush paths, and spoken activity playback. The native smoke test's relocated pufferfish fixture originally clicked the activity card before its avoidance update; the test now waits for that visible update, clicks the rendered crab body, and asserts shell preparation begins. No gameplay change was made to bypass the failure.
- **64 activity recordings** passed request provenance, file hash, independent transcription, full decoding, duration and signal checks; all 64 also decoded inside packaged Electron. Native playback verified explicit activation, pause, music ducking/restoration, natural completion, replay, close/resume, and resident explanations. Original 19 recordings/scripts remain unchanged. All 64 guide introductions pass their existing audio audit. Machine checks do not constitute human listening approval of every clip.
- **36 native performance samples** covered nine habitats, two window sizes, and day/night species. No page errors; at least 179 measured frames per case. Worst case draw p95 **10.1 ms**, callback interval p95 **17.1 ms**. The GPU flag was collected before asset loading, so it does not establish the rendering backend during measurement; a later startup probe showed that this early flag can change from software to hardware acceleration. These are sampled renderer CPU/callback measurements, not guaranteed monitor presentation or performance on another PC.
- Before archiving, **343 packaged source/asset/documentation files** matched the checkpoint, along with package metadata. Every one of the ZIP's **73 payload files** passed CRC and byte-hash comparison against the tested folder.
- All four previous Windows testing ZIP hashes remain unchanged. No Apple Silicon build was made.

## Artifact identity

- ZIP: `Atoll-Down-Under-Windows-All-Species-Journeys-2026-09-08.zip`
- Size: **260,052,053 bytes**
- SHA-256: `11b7bc04ccac841d893ee5adc0bf63fb3f0c6d2661263fbc9c8fe5f4515c636d`
- Packaged app.asar SHA-256: `b03b4624597bb62f6b25c64b68f14f6e30b9b9af8de2a78f8b334038be47605a`

This receipt, the README's verified-build wording, and the external native QA synchronization correction were committed after packaging. They do not alter the tested runtime or audio. The ZIP contains checkpoint da0bca2's documentation, which calls this build a candidate; this receipt records the subsequent completed verification.

Detailed family implementation and lifecycle evidence are in [ALL-SPECIES-JOURNEYS.md](ALL-SPECIES-JOURNEYS.md). Local machine receipts are `artifacts/all-species-journeys-verification.json`, `all-journeys-browser-results-final.json`, `activity-narration-qa.json`, `all-journeys-native-*-final.log`, `all-journeys-native-performance/report.json`, and `all-species-journeys-archive-report.json`.

The delivered design uses shared behavior families with species-specific diets, habitats, prerequisites and outcomes. Residents remain observation subjects. These are authored educational activities rather than research-grade simulations. Existing broader predator-balancing and original-design audit items are separate from this completed journey front.
