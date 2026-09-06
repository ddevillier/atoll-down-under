# Validation record

## Current exploration revision

This Windows revision is parked for user testing, not a completed-remake acceptance record. The current simulation/asset suite has 103 passing tests. The full browser suite passed 26/26; the map scenario passed again after a compact-window layout correction. New checks cover optional routes, ordinary edge travel, saved destinations, map keyboard controls and food suggestions, alongside the previous feeding, exploration and cleaning behavior. The full report is preserved as `artifacts/e2e-reef-map-full.json`; the latest `e2e-results.json` contains the focused run. Further feature work and natural-history expansion are on hold at the user's request.

An identical seeded comparison ran 30 two-minute open-water circuits as three small species, without food, abilities or deliberate hiding and with initial protection explicitly disabled. Before the revision, 0/30 completed the circuit; afterward, 30/30 completed it, with seven predator bites across the 30 runs. This establishes a substantial reduction in constant predation for that scenario, not complete balance across all creatures and modes. Reports: `artifacts/ecology-before.json` and `artifacts/ecology-after.json`.

The original Windows manual (pages 3–4, 8 and 11) supports exploratory Practice play, arrival protection before feeding/leaving an area, and paused observation with a field guide. Appetite and rest timings are newly authored approximations. Field notes are a new learning aid, not a claimed original feature.

Remaining acceptance work includes wider species and mode playtesting, predator balance, visual integration, and animation fidelity. The earlier finish review below applies only to the initial UI implementation and does not prove these broader requirements. Current release work targets Windows x64 only; the platform evidence below is historical.

## Illustrated map and parked testing snapshot

The map extension starts from commit `8db3724`. Six new unit tests cover every pair of the nine habitats through real simulation transitions, destination-only state changes, arrival, detours, saved routes, legacy marker handling and meal suggestions. All 103 unit/asset tests pass; `artifacts/unit-reef-map.txt` records the result.

The browser scenario uses ordinary mouse movement to travel from Coral Cathedral through Sea Fan Garden to Seagrass Meadow. It checks paused planning, no movement or energy change when setting a route, save/reload, updated directions after the first crossing, arrival feedback, visited labels, spatial keyboard selection, route clearing and focus restoration. Both 1600 × 900 and 1024 × 768 viewports pass. The initial small-window capture clipped the map's bottom row; a scoped layout correction and no-overflow assertion resolved it. The final screenshots are `artifacts/reef-map-1600.png`, `reef-map-1024.png` and the corresponding `reef-map-visited-*` captures.

Native verification is reproducible with `scripts/qa-desktop.mjs` against the packaged Windows executable. It checks map planning and clearing in addition to startup, audio, steering, edge travel and feeding, using a separate temporary profile. Release results are recorded in `artifacts/desktop-report.json`, `artifacts/packaged-source-report.json` and `artifacts/release-report.json`. The parked archive is `dist/Atoll-Down-Under-Windows-Testing-2026-09-06.zip`; [TESTING.md](TESTING.md) supplies the hands-on checklist. Automated checks establish these bounded behaviors, not completed gameplay balance or historical fidelity.

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

## Habitat feeding routes and bottom residents

Baseline: `47e1c05`. All sections previously shared the same food quantities and scattered non-plankton food in a common lower band. New dives use nine authored layouts matching the existing paintings: open channels, vertical terraces, shallow sand and seagrass, encrusted wreck timbers and sponge-rich cave ledges. Initial captures also exposed floating bottom fauna and repeated goatfish populations. A single corrective batch added substrate routes and broader community selection; the revised nine-scene contact sheet was inspected. No paintings or natural-history entries changed.

Eleven additional unit tests cover habitat food differences, independently selectable patches, starting meals for every playable diet, regrowth at fixed coordinates, saved food state, community variety across three seeds and both periods, bottom movement and route endpoints, edible/returning bottom prey, old or damaged route metadata, and the meadow seahorse. All 71 tests pass. The new browser scenario uses actual mouse input to approach and eat meadow seagrass, pauses to inspect the seahorse, saves, reloads, and verifies the habitat, visited sections, depleted patch and resident anchor. Fixtures isolate passing fish from that interaction. The test initially assumed capitalized "Seahorse" and a paused load; the catalog says "Yellow seahorse" and the existing Load dive action resumes play. Those expectations were corrected without changing application behavior. The scenario then passed; all 20 existing browser scenarios also passed.

The final ten-minute exercise completes 54/55 species at seed 42, compared with 55/55 for the previous cleaning-partner build. New food counts and populations change RNG consumption, so this is not an isolated balance comparison. All species found food; together they took 909 meals and 30 predator bites, visiting between four and nine habitats. Longnose butterflyfish died at 454 seconds after three Yellowspot emperor bites, despite adequate food and an available cleaner. A detailed replay confirms the last bite immediately after a habitat transition. Predator balance remains unfinished; the game was not retuned merely to make this script survive. The 12 night scenarios (four species across seeds 42, 7 and 91) all completed. These scripts use ten-second decisions without defenses or deliberate predator avoidance and do not establish human play quality or universal survival.

Evidence: `artifacts/feeding-sites-contact-sheet.png`, `artifacts/feeding-sites-report.json`, `artifacts/meadow-gameplay.png`, `artifacts/exploration-habitat-routes.json`, `artifacts/exploration-butterfly-habitat-trace.json`, and `artifacts/exploration-habitat-night-*.json`. Reproduce with `node scripts/qa-feeding-sites.mjs` and `node scripts/qa-exploration.mjs habitat-routes 42` while the local server is available for browser captures.

New layouts, broader initial populations and the seahorse require a new dive. Existing saves retain food positions, depletion and populations; older bottom residents attach to the nearest local route on resume. Windows packaging is checked through native launch, byte comparison with source, ZIP integrity and release hashes; the corresponding reports are regenerated with the delivered build. No Apple Silicon build is part of this revision.

## Reliable habitat travel and steering

Baseline: `331cec7`. The butterflyfish trace's repeated vertical trips came from the script choosing its direction from the current row, rather than an involuntary return. Investigation nevertheless confirmed an independent transition defect: a pursuer was placed outside the new scene, then boundary clamping snapped it close enough to bite on the next frame. Two regression cases failed before the fix, checking relative position and frame-by-frame movement. Crossings now translate player and pursuer together and let incoming animals swim into view. A continued pursuit can still reach a waiting player; a timed-out pursuit rests while finishing its entry. Save/restore preserves this behavior deterministically.

Two further control defects were reproduced. A cursor 14 logical pixels from a water edge stopped the fish short of the old crossing trigger. The new 24-pixel edge intent band makes the documented move-to-the-edge action practical, with no change to food clicks near an edge. Also, headings containing accumulated whole turns produced a different route from an equivalent zero-turn heading: in a one-second example, a fish aimed right moved left. Four failing regression cases covered player steering (including a saved dive) and non-player food, cleaning and school approaches. Normalized shortest turns resolve these cases without changing species speed or agility. These tolerances are new usability choices, not claimed original numerical constants.

The ten added tests bring the unit suite to 81/81. The full browser suite passes 22/22. Its new scenario uses real mouse movement across all four water edges at 1600 × 900 and 1024 × 768, with an accumulated player heading and a following predator. It verifies correct adjacent habitats, retained pursuit distance, no bite injury and paused inspection. The two resulting screenshots were inspected. Native QA now exercises edge travel and the following predator in the packaged Windows executable as well as its previous checks.

The unchanged ten-minute, seed-42 exercise now completes 55/55, compared with 54/55 at baseline. Longnose butterflyfish completes 600 seconds with 14 meals, six visited habitats and no bites in this run; the roster receives 29 bites in total. All twelve night runs across seeds 42, 7 and 91 also complete. Movement and RNG consumption differ after the corrections, so the butterflyfish comparison does not isolate a predator-balance constant. These results support the specific control fixes; they do not prove completed historical fidelity or human enjoyment. Evidence: `artifacts/exploration-travel-controls.json`, `artifacts/exploration-travel-butterfly-trace.json`, `artifacts/exploration-travel-night-*.json`, `artifacts/habitat-travel-1600.png`, and `artifacts/habitat-travel-1024.png`.

The original Windows manual's movement and reef-navigation pages were reread as local scans (`manual-08.png` and `manual-09.png` in the reference research folder). They describe cursor-following and moving the cursor to the game-screen edge to change areas. The source is linked in PROVENANCE.md. This revision changes gameplay code and its validation, with no new guide content or art. Windows remains the only build target.

## Readable feeding feedback

Baseline: `7b6ab0a`. This revision makes ordinary feeding easier to follow: the diet remains beside the fish's name, a clicked meal has an approach marker and cancellation hint, successful meals report actual energy gained, and renewable patches visibly diminish. A disappearing meal cancels the approach and stops the fish instead of sending it toward an empty location. Existing saves gain this behavior without a new dive. Diet eligibility, nutrition, scoring and regrowth timing are unchanged. No natural-history entries or artwork assets were added.

Three new unit cases cover food taken by a neighbor, vanished animal prey, resumed steering and capped energy rewards; all 84 unit/asset tests pass. The new browser scenario exercises actual mouse targeting and cancellation, unavailable food, contact feeding, reduced patch coverage, full depletion/regrowth, and a long four-category diet fitting within the HUD at 1600 × 900 and 1024 × 768. An initial full run passed 23/23. After the visual correction below, a second full run passed 22/23: the existing travel check measured predator distance after polling and pausing, allowing normal swimming to shrink the gap. The check now records distance immediately before and after the real transition and verifies equality, incoming state, correct habitat, no injury and pause. It passes across all four edges and both window sizes. No gameplay timing or predator parameters were changed to resolve the assertion.

Six initial feeding screenshots were inspected. One corrective batch holds the meal reward longer and positions it above the fish, and refreshes the status immediately when the interface redraws to remove a stale protection label during pause. Confirmation captures verify the compact reward and the long-diet HUD at both sizes. The one mechanical design-detector pass produced palette/type advisories; it was not a clean detector result or a full design-system audit. Evidence: `artifacts/feeding-target-*.png`, `artifacts/feeding-meal-*.png`, and `artifacts/feeding-hud-long-*.png`.

The unchanged ten-minute, seed-42 exploration exercise completes 55/55 playable species (`artifacts/exploration-feeding-feedback.json`). This is bounded regression evidence and does not establish human enjoyment or completed historical fidelity. Native Windows QA now checks the diet and approach message in addition to pointer cancellation, continuous habitat entry and its existing launch checks. Native results, source-byte comparison and archive integrity are recorded by the release checks in `artifacts/desktop-report.json`, `artifacts/packaged-source-report.json` and `artifacts/release-report.json`. Only Windows x64 is built for this revision.


## Usable feeding adaptations

Baseline: `4baa586`. A roster audit found six advertised food choices with no eligible prey: Sixbar wrasse/snail, Squirrelfish/crab, Spotted pufferfish/snail and crab, Cuttlefish/crab, and Oriental sweetlip/snail. The universal armor gate prevented every such meal, although those fish's declared diets included them. Smaller listed crabs and snails now use the existing 77% mouth-size threshold; larger shells, spiny prey and armored fish retain their stronger-jaw restrictions. Feeding, NPC choices and food-web links use the same rule. Wrong-diet, excessive-size and armor rejections now state the corresponding reason.

Crushing Bite previously charged eight energy and started cooldown without changing feeding. It is now presented as the always-active Crushing jaws trait. Space explains that it needs no activation, without spending energy or ending protected arrival. In Create-a-Fish its existing 150-point cost adds coral food for a grazer, or crabs, snails and urchins for other diets. The editor displays the resulting diet and trait description before entry. Saved custom diets update from their saved configuration without replacing the dive; obsolete crushing activation timers clear. The Burst swim and Inflate descriptions now match their existing four-second effects; their timing was not changed.

Thirteen new unit cases cover all six successful approaches/contact meals, a complete declared-diet audit, remaining diet/size/armor restrictions, NPC shellfish feeding with an available cleaner, rejection causes, passive activation, custom diet/budget behavior and saved-state migration. Eleven of the initial twelve cases failed at baseline; the independent rejection-message case also failed before correction. All 97 unit/asset tests now pass (`artifacts/unit-feeding-adaptations.txt`).

The full browser suite passed 25/25. A pufferfish follows actual mouse clicks between authored crab/snail positions and receives both meals. A separate creation flow checks grazer, hunter and omnivore choices, passive HUD semantics, Space without energy loss, and the seven-category diet fitting at 1600 × 900 and 1024 × 768. Five initial screenshots were inspected. The compact editor capture was taken with its lower controls off-screen; focusing the trait and scrolling its description into view confirmed the existing dialog scroll behavior. The focused feeding, creation and poisoning scenarios passed again after the final message correction. Confirmation captures of the compact editor and HUD were inspected; no visual restyling was needed. The earlier session's design-detector advisories remain outside this gameplay change; no second detector pass was run.

The unchanged seed-42, ten-minute exploration exercise completes 55/55 before and after this change. Meals total 923 before and 921 afterward; predator bites total 29 before and 36 afterward. Broader NPC meal choices alter behavior and RNG consumption, so this is regression evidence for playable food access, not a claim of reduced predation or final balance. Each of the five affected species visits four to six habitats. Reports: `artifacts/exploration-feeding-adaptations.json` and `artifacts/feeding-adaptations-comparison.json`. Screenshots: `artifacts/puffer-shellfish-meals.png` and `artifacts/crushing-jaws-{create,hud}-*.png`.

Native Windows QA now selects the pufferfish through the menus and eats a crab, then selects a triggerfish and verifies passive jaws without an activation cost. Its isolated profile protects player saves. Release checks regenerate `desktop-report.json`, `packaged-source-report.json`, archive CRC results and release hashes. Only Windows x64 is packaged. Natural-history expansion and broad fidelity acceptance remain unfinished.
