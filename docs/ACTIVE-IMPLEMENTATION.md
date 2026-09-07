# Current implementation brief

**PARKED BY USER — September 6, 2026.** The user said “Yes let’s park.” The last running checks finished successfully and the Windows Guide Options build is parked for testing. See [WINDOWS-PARKED-BUILD.md](WINDOWS-PARKED-BUILD.md), packaged source `5add04a`. Stop feature work, research and additional builds until the user explicitly asks to resume. The broader objective remains unfinished; the old goal and history below are not permission to override this parking instruction.

This page records current scope. The previous chronological notes are preserved in [IMPLEMENTATION-HISTORY-2026-09-06.md](IMPLEMENTATION-HISTORY-2026-09-06.md). Their old priorities and pending-build statements are historical, not instructions to restart completed work.

## User direction

The full objective remains population hills and valleys, one area with a slightly higher predator-spawn likelihood, facts for every species, and continued implementation of needed gameplay/specification audit changes without leaning into greater difficulty.

The user's later direction governs how that objective is pursued:

- Capture the spirit of the game; a verbatim reconstruction is not required.
- Ask before further original-game reference research or comparisons. Historical discrepancies are not automatic implementation requirements.
- Prioritize Practice/exploration and gameplay. Tournament reconstruction is deferred.
- The latest specifically requested feature was the cleaner loop; it is implemented and packaged.
- Windows only. No Apple Silicon or other macOS build is authorized.
- Do not apply artifacts/parked-diet-pass.patch automatically.

## Current testing build

The length-unit follow-up is now packaged in the parked build above. Native unit switching, persistence, food highlights, fullscreen and gameplay passed. The Food Hints milestone below is retained as prior verification history.

[Windows Food Hints](WINDOWS-FOOD-HINTS-BUILD.md), packaged source 2e43ce2, includes cleaners, spaced queues, interruption fixes, and optional H/Settings food markers. The archive is dist/Atoll-Down-Under-Windows-Food-Hints-2026-09-06.zip. Native food controls, ordinary gameplay, fullscreen and portable saves passed. All 120 checked packaged files and 73 ZIP payload files matched; CRC passed. This brief postdates the packaged runtime.

The implementation has 138 passing unit/asset checks. Four relevant browser scenarios verified the food-hint follow-up; the preceding cleaner-queue milestone passed the full 35-scenario browser suite. Do not represent those scopes as a fresh full-suite run on the current package. Receipts and feature documents retain detailed evidence.

## Verified work

| Requirement or repair | Current evidence |
|---|---|
| Population hills and valleys | Nine authored ranges in src/populations.js; census and sustained exercises in POPULATION-REVISION.md. |
| One modestly higher predator-spawn zone | Outer Blue has a 45% chance of a second initial hunter; every other zone has 25%. General pursuit/damage settings were not increased. |
| Facts for every catalog species | All 64 IDs have natural-history entries; no missing entries in the current-source check. SPECIES-FACTS-LEDGER.md records sources and identity limits. Written coverage does not prove complete scientific or historical parity. |
| Local communities and feeding | Nine weighted forager mixes, authored feeding sites and closest-center selection are packaged. See LOCAL-COMMUNITIES.md and FOOD-SELECTION-REPAIR.md. |
| Cleaner gameplay | Click/button/C approach, gradual parasite treatment, cancellation, current-client priority, spaced waiting, interruptions and saved continuation. See CLEANER-LOOP.md. |
| Optional food visibility | H/Settings markers respect diet, size, armor and poison resistance. Off by default; no automatic movement/feeding or supply change. See FOOD-VISIBILITY.md. |
| Fullscreen and portable saves | Startup, F11, named slots, real file export/import and resumed gameplay verified in the Windows receipt. |
| Other completed audit repairs | Poison stage-score consistency, damage separation, shelter feedback, fact/art corrections and map planning are recorded in CURRENT-AUDIT-STATUS.md and feature documents. |

## Work still open

- Scene readability: food markers do not settle background density, foreground occlusion or all-species contrast. REEF-READABILITY-BASELINE.md separates animal counts, food-site counts and visual judgment. Do not reduce food merely to make a screenshot quieter.
- Species interactions: nighttime variety, distinctive feeding/defensive behavior and shelter behavior remain possible gameplay improvements. Stronger behavior can affect difficulty even when numeric tuning is unchanged; assess its actual effect.
- Art and identity limits: remaining artwork/anatomy mismatches and ambiguous identities are not proved resolved. Further historical comparisons require a question first.
- Playtesting: automated survival/interaction tests do not establish a child's experience. The user was offered scene readability, distinctive species behavior, or holding feature work for playtesting; no answer has been received in the current record.
- Historical comparisons: scoring formula, roster/diet exceptions, scene correspondence, audio comparisons and other entries remain in the original audit. Preserve evidence and uncertainty without automatically pursuing literal parity. Tournament remains deferred.

The broader objective is not marked complete. Verify requirements at their actual scope; unresolved work must not disappear merely because a milestone was delivered. Conversely, do not keep changing a verified feature solely because older history calls it unfinished. Use concrete gameplay evidence and current user priorities to select the next change.
