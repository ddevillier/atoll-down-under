# Cleaner gameplay loop

The user redirected development toward the spirit of a reef exploration game rather than exact historical reconstruction. This feature was designed from the current gameplay problem; no new original-game reference research was used. Ask the user before spending more work on original-game comparisons. The unfinished diet pass is parked in artifacts/parked-diet-pass.patch and is not included.

## Player flow

One labeled cleaning partner is easy to locate in each scene: a wrasse by day and shrimp by night. Click the partner, choose Visit cleaner, or press C to request a visit. A paused player can resume through the Visit cleaner button. The fish swims to the station and settles without requiring the player to hold the pointer on a tiny moving animal.

The status strip explains approaching, waiting for an NPC client, waiting for a stunned cleaner, settling, and treatment progress. A cleaner finishes an existing NPC treatment before starting the player. During the two-second treatment, the parasite portion of health rises gradually. Completion reports the benefit and explains any remaining bite or poison damage. A request with no parasites gives an immediate explanation instead of a fake treatment.

Mouse movement, a meal selection or an active ability releases the visit. Partial health restored is retained. Pause freezes the visit, and saving/resuming retains progress. A disappearing partner releases the approach with a message. Passive cleaning still works when a fish simply stops near a free cleaner.

Cleaning partners are helpers rather than food. The shared food predicate excludes them, so the food web and food-seeking callers agree with the safe click behavior. Direct consumption is rejected without an energy penalty. Legacy saved player meal targets aimed at a cleaner are released; absent cleaners in older saves still return at their station.

## Bounds

Treatment removes parasites; it does not repair bite or poison damage. Existing recovery, feeding, parasite accumulation, population settings, pursuit and damage tuning are unchanged. Cleaner service is not a general invulnerability field. The encounter script still uses ordinary movement and feeding rather than perfect avoidance.

One treatment label replaces the station label during player cleaning, preventing overlapping text. The existing health meter shows recovery; progress text changes in quarters rather than announcing every simulation frame. No new assets or external sources were needed.

## Verification

Source follow-up after the Windows Cleaners milestone: NPC treatment now pauses while its cleaner is stunned, then resumes; clients also discard stale treatment progress after recovery or loss of the visit. Both regression cases failed before the repair and pass afterward. All 133 unit/asset checks pass. This follow-up is not yet in the parked Windows Cleaners ZIP; its receipt remains accurate for runtime 9cdeab3.

All 131 unit/asset checks pass, including day/night request clicks, gradual recovery, steering cancellation, NPC queue order, missing/healthy partners, saved treatment, legacy targets and injury/poison separation. The dedicated browser cases exercise both day and night at 1024×768 and 1600×900 with actual mouse and keyboard controls.

The first sustained check exposed an inconsistent food predicate: callers still offered cleaners as meals even though clicks now requested treatment. That was repaired in the shared rule, rather than teaching only the test to ignore them. The corrected ten-minute seed-42 exploration exercise completes for all 55 playable species, compared with 41 in that intermediate version. Evidence is retained in artifacts/exploration-cleaner-loop.json and exploration-cleaner-loop-corrected.json. These automated runs are bounded regression evidence, not a prediction of a child's play.

All 34 browser scenarios pass. Native Windows verification uses scripts/qa-cleaner-desktop.mjs and isolated profiles: both Neon and Flashlight cleaner visits approach, partially heal, pause, cancel, restart and complete, leaving 15 bite damage intact and the cleaner alive. Native fullscreen/gameplay and actual portable-save checks also pass with no reported errors. The verified ZIP and integrity results are recorded in WINDOWS-CLEANERS-BUILD.md. Hidden-window native checks verify behavior, not visible-window treatment timing.
