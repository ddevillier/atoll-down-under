# Validation record

## Current exploration revision

This is an in-progress Windows revision, not a completed-remake acceptance record. The current simulation/asset suite has 60 passing tests. The expanded browser suite passed all 20 tests. Added coverage verifies non-preferential food selection, satiated hunters, rest after unsuccessful pursuits, plant grazing, mixed communities, protected initial swimming, field notes that persist across reloads, navigable feeding connections, and observable non-player cleaning visits. Renderer animation pauses with observation. Food-web and lesson screenshots were checked at 1440 × 810 and 1024 × 768; the food-web compact layout received one correction and confirmation.

An identical seeded comparison ran 30 two-minute open-water circuits as three small species, without food, abilities or deliberate hiding and with initial protection explicitly disabled. Before the revision, 0/30 completed the circuit; afterward, 30/30 completed it, with seven predator bites across the 30 runs. This establishes a substantial reduction in constant predation for that scenario, not complete balance across all creatures and modes. Reports: `artifacts/ecology-before.json` and `artifacts/ecology-after.json`.

The original Windows manual (pages 3–4, 8 and 11) supports exploratory Practice play, arrival protection before feeding/leaving an area, and paused observation with a field guide. Appetite and rest timings are newly authored approximations. Field notes are a new learning aid, not a claimed original feature.

Remaining acceptance work includes wider species and mode playtesting, more substantial educational content, visual integration, and animation fidelity. The earlier finish review below applies only to the initial UI implementation and does not prove these broader requirements.

## Initial build evidence (historical)

Validated on Windows on 6 September 2026, using Node.js 22.18.0, Electron 44.2.0 and Playwright Chromium.

| Check | Result |
|---|---|
| Simulation and asset tests | 22 passed |
| Browser end-to-end tests | 8 passed; zero failed, skipped or flaky |
| Native Electron source launch | Passed |
| Packaged Windows application | Passed: local protocol, reef entry, 64 sprites and decoded music |
| Renderer errors during native check | None |
| Renderer Node exposure | Disabled |
| Visual inspection | 1600 × 900 and 1024 × 768 screenshots reviewed |
| Independent finish review | Accepted after focus restoration and visible save/load feedback fixes |
| Apple Silicon archive | ZIP CRC verified; 14 framework symlinks preserved; ARM64 Mach-O header verified |
| macOS runtime and signing | Not tested on macOS; unsigned |

## Covered behavior

Simulation tests cover the 55-species playable roster, initial protection, diets, feeding rewards, poison, hiding, day/night cleaners, cleaning interaction, horizontal wrapping and vertical boundaries, predator pursuit between sections, ability costs, pause behavior, four-stage Challenge, full-roster Tournament, continuing after death, creation budget and body selection, deterministic save/restore, invalid saves and starvation.

Browser tests exercise the menus and guide, pointer feeding, inspection, ability activation, saves and reloads, custom fish configuration, Challenge completion and ranking, all nine paintings and 64 creature bounds, audio decoding and settings, keyboard focus, and storage failure recovery. These are automated behavior checks; they do not establish long-term balance or historical numerical parity.

All nine reef images have different hashes and were visually compared as a contact sheet. The accepted revision varies major silhouettes and open-water placement: high terraces, vertical wall, sloping wreck exterior, dense coral, enclosed wreck, meadow, open reef and stacked grotto. Scene-specific shelter locations follow the new artwork.

Audio contains three original music loops and 26 effects. File checks verify OGG/WAV headers, durations and non-silent signals. Measured music peaks are below clipping, and loop-boundary amplitude differences are small. Automated audio checks establish loadability and signal integrity rather than a human listening assessment of every sound.

## Evidence and reproduction

Run `npm test`, `npm run test:e2e`, and `npm run test:desktop`. To check a packaged executable directly:

```sh
node scripts/qa-desktop.mjs "dist/Atoll Down Under-win32-x64/Atoll Down Under.exe"
```

Local evidence is in `artifacts/`: `e2e-results.json`, `desktop-report.json`, `mac-package-report.json`, desktop and browser screenshots, and the reef contact sheet. This QA output is excluded from the application package. `docs/ASSET-MANIFEST.json` records source asset hashes and image dimensions; `dist/SHA256SUMS.txt` identifies release archives.

The source reef paintings are 1672 × 941 pixels and are scaled for higher-resolution displays. The macOS archive requires a real Mac check and appropriate signing before public distribution. The working title has not undergone commercial clearance. The playable ecosystem and numeric balance are independently authored; this build does not claim exact reproduction of every original species or undocumented rule.

## Complete sprites and motion revision

All 64 extracted sprites were visually inspected in four contact sheets. This exposed grid-crop defects that removed fins, noses, antennae and the seahorse’s head. The renderer now segments complete connected silhouettes across each atlas before assigning them to the creature catalog. The corrected sheets were checked again; a browser regression test also verifies an animal crossing a nominal grid boundary.

Separate stylized motion profiles cover ordinary fish, sharks, eels, rays, cuttlefish and seahorses. Tail activity settles when a fish stops, turns interpolate, and inspection/reduced-motion settings remain effective. The six-creature preview recorded 17 ms median and 95th-percentile frame intervals on this machine; that is a limited preview measurement, not a universal performance guarantee.

A three-minute feeding exercise covered all 55 playable species through ordinary click targeting. The first version completed 53/55: its selector sometimes clicked food behind poisonous animals. Checking the actual hit target removed those unintended meals and exposed a separate player-only defense bug: predators avoided poisonous non-player creatures but still attacked a poisonous player. After that rule was made consistent, all 55 completed the exercise and every species found food, without cleaner visits or ability use. This is a bounded feeding check, not proof of universal balance. Reports are `artifacts/roster-before.json`, `artifacts/roster-unobscured.json`, and `artifacts/roster-current.json`.

Native QA now creates a separate temporary user-data profile before entering any dive. The check refuses to proceed unless it verifies that isolation. Reproducible tools include `scripts/qa-sprites.mjs`, `scripts/qa-motion.mjs`, `scripts/qa-roster.mjs` and `scripts/qa-package.mjs`.

Fatal poisoning now identifies the poisonous meal rather than incorrectly blaming parasites. A unit check and browser interaction cover that causal feedback.
# Schooling revision

Current checks: 42 unit/asset tests and 14 browser tests passed. Five new tests cover same-species groups, spacing through an extended swim, leaving to feed, coordination with a player without taking control, and deterministic save/restore. A normal Silver sprat dive showed three schooling neighbors after ten seconds, remained in protected exploration, and recorded the behavior in field notes without renderer errors. Screenshot inspected; recording: `artifacts/schooling-preview.webm`. This verifies one live example, not long-term behavior for every population. The original-game fidelity and broader educational-content audit remain unfinished.


## Natural-history reading revision

Four sourced entries can be expanded inside the creature guide and searched by scientific name. A browser test exercises keyboard expansion, source reading, changing species, horizontal fit and access to the Return button at 1440 × 810 and 1024 × 768. Screenshots were inspected; one correction keeps the species search/list visible while long entries scroll. The focused test and confirmation screenshots passed after that correction. The full 15-test browser suite passed before that CSS-only correction; the 42-test simulation suite is unchanged by this content/UI revision. A focused rerun replaces the default e2e JSON report, so the full-suite result is recorded here rather than inferred from that file.


## Cleaning and recovery revision

Seven health tests cover cleaning with poison, cleaning with bite injury, no false cleaning without parasites, gradual fed recovery, energy-gated recovery without parasite removal, deterministic saved recovery, and migration/corrupt recovery state. The suite now has 49 passing tests. A new browser scenario follows mixed poison/parasite damage through actual cleaning and verifies the health meter retains and explains the poison portion. The full browser suite has 16 tests. All 55 species again completed the three-minute ordinary-feeding exercise. This bounded check does not establish long-term balance across every mode.


## Small-creature inspection revision

Original Windows screenshot contact sheets and the current nine-scene contact sheet were inspected before this change. Small fish had too little screen area in the widescreen view. Two new tests verify readable display sizes without changing ecological size ordering or feeding eligibility, and selection boundaries/dead-entity exclusion. All 51 unit/asset tests passed. The full 17-test browser suite passed; a focused inspection test passed again after suppressing overlapping transient messages.

The browser scenario clicks an enlarged small fish near its visible edge, verifies the close-up contains rendered pixels, and checks access to the field-guide action and resume at 1600 × 900 and 1024 × 768. Both screenshots were reviewed, with a confirmation at the smaller size following the message-overlap correction. Evidence: `artifacts/inspect-closeup-1600.png` and `artifacts/inspect-closeup-1024.png`. All 55 species still completed the ordinary three-minute feeding exercise after selection areas changed. The latest default e2e report contains the focused rerun; do not misread its one-test count as the complete suite.


## Original-layout splash revision

The user specifically requested the original Windows splash composition. A new 1672 × 941 raster supplies the three-line Atoll title, blue-water negative space, left wreck, upper-right light and coral floor. Original source pixels are not bundled. All existing home actions moved into a File / Game / Help strip with pointer and keyboard access. The new menu test covers all four mode choices through arrows, Escape focus restoration, mutually exclusive dropdowns, outside-click dismissal, and modal stacking/inertness. The final full browser suite passed 18/18 after fixes.

An independent finish review requested a smaller/lower raster title, immediate menu focus colors, modal isolation and updated design documentation. All four findings are resolved; the final review disposition is ship for this splash revision. DESIGN.md and its sidecar record the revised surface. Native QA captures the packaged splash before entering a dive and verifies that the title image has loaded. Native and archive check results are recorded in artifacts/desktop-report.json, artifacts/packaged-source-report.json and artifacts/release-report.json alongside the Windows delivery.

## Cursor control and extended gameplay

The user prioritized gameplay before further natural-history expansion. The original Windows manual's movement and feeding pages were reread: moving the cursor should let the fish follow, including after an eating action. A reproduction showed that a clicked food target overrode subsequent mouse positions indefinitely. Three new regressions failed before the fix: steering away from a meal, clicking empty water, and protecting paused state from simulation input. The existing successful approach/contact behavior passed and remains covered. All four now pass, and the complete unit suite passed 55/55.

The new browser scenario uses actual mouse input at 1600 × 900 and 1024 × 768: click distant algae, start the approach, steer away, verify no meal was taken, inspect while paused, and return for a successful bite. The full browser suite passed 19/19. Native QA also exercises the steering override in an isolated packaged Windows dive. No art or natural-history entries changed in this revision.

`scripts/qa-exploration.mjs` replaces the always-feeding assumption with a separate ten-minute exercise for each of the 55 playable species. Seed 42 is fixed; decisions are ten seconds apart, food is sought below 65 energy, and cleaners are visited for parasite loss above 35 while energy is at least 50. Other decisions swim through habitats. It uses normal targeting and movement, with no defensive ability, deliberate predator avoidance or initial protection. Cleaning decisions distinguish parasites from injuries; a preliminary version incorrectly treated every health deficit as cleanable and was corrected before the final comparison.

The same scenario completed 54/55 before and after the control change, with identical results: it did not attempt to interrupt a meal, so it provides playability evidence, not evidence of improved balance from this fix. It averaged 17 meals and 6.3 visited habitats. The flashlight fish ended at 374 seconds following four bites; its night play needs further investigation. The report's exploration time includes waiting between decisions, and its chase counter samples after each simulation step, so an immediate bite can occur without a counted chase. These automated runs do not establish human enjoyment, universal survival or completed gameplay balance. Evidence: `artifacts/exploration-before.json` and `artifacts/exploration-after.json`.

## Reliable cleaning partners

The flashlight-fish failure was replayed from seed 42 with event and decision snapshots. Its nighttime cleaner shrimp was repeatedly eaten by non-player shrimp feeders. The player reached a station at approximately 350 seconds, but the cleaner had been eaten again; no cleaning occurred during the run. Baseline trace: `artifacts/exploration-flashlight-before-trace.json`, from commit `4832ab1`.

NPC foraging now recognizes both kinds of cleaner as partners. Old saved meal targets aimed at cleaners are released while parasite-driven visits remain functional. A cleaner eaten deliberately by the player returns at its established station. Four regression cases failed before the change and pass afterward; a fifth verifies that normal client cleaning remains intact. Coverage includes the four small/bottom-foraging night species, a daytime hunter, saved targets, ordinary shrimp meals, and deliberate player consumption. The full unit suite passed 60/60. A browser test swims a flashlight fish to a station with a hungry neighbor present, waits for parasite removal, and inspects the surviving cleaner. The full browser suite passed 20/20; evidence is `artifacts/night-cleaning-visit.png`.

The extended gameplay script now accepts an optional numeric seed and species IDs, records unavailable-cleaner time, and writes a detailed trace for a single-species run. Twelve ten-minute night scenarios cover Banggai cardinalfish, flashlight fish, squirrelfish and oriental sweetlip with seeds 42, 7 and 91. Completion changed from 11/12 to 12/12. Cleaners were unavailable for 3,707 of 6,974 simulated seconds before, and 610 of 7,200 afterward. The remaining absences include deliberate meals selected by the scripted player; the squirrelfish trace confirms six cleaner meals in its seed-42 run. The original flashlight run now completes 600 seconds, receives four cleanings, and has one bite. These are bounded scenario results, not general survival probabilities.

The full 55-species, seed-42 ten-minute exercise now completes 55/55. Reports: `artifacts/cleaner-partners-comparison.json`, `artifacts/exploration-stations-before-*.json`, `artifacts/exploration-stations-after-*.json`, and `artifacts/exploration-cleaner-partners.json`. Example replay: `node scripts/qa-exploration.mjs flashlight 42 s53`. Gameplay remains the active priority; guide expansion stays on hold. Human play feel, habitat-specific activity and overall remake fidelity still need work before completion can be claimed.
