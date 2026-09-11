# Windows Creature Workshop checkpoint

September 10, 2026. Windows x64. Runtime commit **beef9dc** (modular anatomy introduced in **19dfa95**).

Extract `dist/Atoll-Down-Under-Windows-Creature-Workshop-2026-09-10.zip` completely and open `Atoll Down Under-win32-x64/Atoll Down Under.exe`. Windows starts fullscreen; F11 toggles a window. Choose Create a fish, experiment with parts/colors, Test swim, return with Change my fish, then Keep and meet the reef. File → My creations returns to kept lives.

## Delivered

- Three painted body cores; four tails, four back fins, three side fins and four mouth/head forms.
- Separate body/fin/marking RGB colors, including distinct black/white values; five patterns; trait-driven or freely chosen length/depth.
- Painted articulated tail, back and side fins, visible opening jaws, turn/brake and inflation responses. The chosen head sets the feeding landmark. Nineteen independently generated PNG components; no original-game art.
- Live editor preview and persistent budget/test/keep footer. Appearance survives test/revise, keep, reload, resume and portable saves. Legacy saved appearances remain intact until an edited variation adopts the new system.
- Existing species journeys, narration, ecology and creation care loop remain included. Appearance parts are cosmetic; adjacent diet, ability and swimming controls determine rules and cost.

See [original-game comparison and playtest limits](CREATION-VARIETY-COMPARISON.md), [art provenance](CREATION-ANATOMY-ART.md), and [creation care loop](CREATION-LOOP.md).

## Verified

| Completion criterion | Evidence |
|---|---|
| Valid anatomy, migration and portable persistence | **375 unit tests passed**; `artifacts/anatomy-final-unit.log` |
| Working editor and care loop | **11 browser cases passed**, including ordinary-control refuge/meal/return, safe trials, save failures, imports and resumed appearance; `anatomy-final-browser.log` |
| Every option visibly affects rendering; actual joint movement | Pixel and alpha checks for all selectable parts, color regions, all four jaws, swim stroke, inflation, extreme fin crops and bounded cache; `anatomy-pixel-report.json`, `anatomy-joint-report.json` |
| Final RGB correction | All **four anatomy browser cases passed again** after the lightness fix; `anatomy-rgb-browser.log` |
| Finished assembly and editor layout | Independent review disposition **ship**: dorsal attachment and documentation findings resolved; final RGB recaptures preserved both fixes. `anatomy-review.md`, `anatomy-matrix.png`, `anatomy-editor-{1280,1920}.png` |
| Tested Windows executable | Isolated-profile native creation and general desktop checks passed without page errors: fullscreen/F11, anatomy choices, trial refuge, keep/reload/resume, guide, feeding, mouse steering, travel, maps and music. `anatomy-native/report.json`, `anatomy-desktop.log` |
| Packaged content matches source | **391 files** and runtime package metadata matched before this receipt/README update; `anatomy-content.json` |
| Archive integrity | **73 payload files** passed CRC and SHA-256 comparison to the tested executable folder; `anatomy-archive.json` |

The first renderer prototype was rejected during visual inspection. Painted parts replaced it; a square collar edge and exposed dorsal base were corrected. A test harness initially sent the bite state in the wrong argument position; the corrected pose strip and independent per-mouth pixel test show actual jaw opening. Those unsuccessful intermediate states are not the delivered build.

## Capacity

Nine packaged native cases across three reefs and day/night custom fish plus cuttlefish completed without errors or animation-budget deferrals. At approximately 4K (**3841×2160 actual canvas**, from Windows scaling), custom-scene renderer CPU p95 was **7.4–12.8 ms**. Across all nine cases, requestAnimationFrame interval p95 was at most **17.8 ms**. These short measurements characterize renderer work and callback cadence, not monitor presentation or long-session stability. Evidence: `artifacts/anatomy-native-actual-4k/report.json`.

An additional high-DPI stress run rendered **7680×4320**, despite its historical `anatomy-native-4k` artifact directory name. Custom scenes there measured **12.8–20.1 ms** renderer p95 with zero budget deferrals. A live custom appearance occupied about **3.4 MiB** of prepared painted layers and was prepared once across the sampled reefs. A separate 30-color churn test retained the configured maximum of **12 cached appearances**, about **40.6 MiB**. Created-fish joints are drawn each frame; their cache stores painted parts, not held animation frames. No global animation-budget reduction was made.

## Artifact and limits

- ZIP: `Atoll-Down-Under-Windows-Creature-Workshop-2026-09-10.zip`
- Bytes: **264,605,233**
- SHA-256: `aad7e6a79ba8f7f16046d448dea412a04b3572bfe31c535234ba2827290bd335`
- app.asar SHA-256: `3a9bc3595f5ab07096b18147010f1bd54d7c24d044c4dc8098078c8c28ef7fd8`

Prior verified ZIPs remain available; no Apple Silicon build was made. This receipt, the README handoff and performance-probe additions are recorded after packaging; the app runtime is beef9dc. Human/child enjoyment and long-duration play are not yet verified. The original emulator's color and morphology slider changes remain unverified because pointer input does not reach them; direct observations and manual evidence are distinguished in the comparison. This checkpoint delivers a modern creation workshop, not exact reconstruction of every original morphology.
