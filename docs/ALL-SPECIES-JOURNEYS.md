# Journeys across the roster

Active user goal, September 8: continue species journey development until everyone has a meaningful journey. The previous 19-journey build and all earlier ZIPs remain preserved. This front is not complete until its full roster coverage and delivery checks are demonstrated.

## Required result

1. Cover every one of the 57 current Practice species. Preserve the existing 19 journeys and their saved discovery identities. Resolve the seven non-playable residents as observation journeys or direct playable lives; the user has been asked that consequential question while fish development continues.
2. Give each journey a coherent goal, consequential action, readable feedback and observable outcome. Reuse mechanics by behavior family, but do not count renamed generic meal counters as species differentiation. Use actual food, existing animals, home locations, activity states and anatomical feeding contact. Do not spawn rewards, prey or companions to manufacture success.
3. Integrate progress into normal free exploration, optional journey cards and persistent journal discoveries. Provide clear location/opportunity guidance, safe interruption, repeatable activity after recognition and a way to restart a local relationship or home when conditions change.
4. Preserve save compatibility, validate all added state, freeze while paused, and handle travel, death, creature respawn, lost hosts, occupied partners and unavailable food. Keep populations bounded and predator pressure gentle. No required timer race or mandatory combat escalation.
5. Finish readable instructions and optional spoken guidance for all new journeys using the authorized phonics TTS checkpoint. Keep the existing audio, volume, stop behavior and offline packaging. Document authored abstractions; no new original-game research is needed.
6. Prove complete paths through ordinary controls and generated reefs. Cover all species in simulation acceptance, meaningful negative/lifecycle cases, representative real browser controls for every family, both display sizes, journal/save import, native audio and Windows packaging. Preserve previous ZIPs and deliver one combined verified build.

## Design map

The seven residents are yellow seahorse, reef crab, red sea star, nudibranch, spiral snail, needle-spined urchin and sea anemone. They are not seven additional swimming fish; their journey design must respect their existing attached or bottom-supported routines.

The following is the implementation map for the 38 uncovered playable species. These are targets, not completion claims.

| Work front | Species | Decisions and feedback to develop |
|---|---|---|
| Home and feeding excursions | Neon damselfish, royal gramma, anemonefish, squirrelfish, Banggai cardinalfish, whitemouth moray, humbug damselfish, whitetip reef shark | Choose actual cover or a living host; make the species' suitable feeding excursion; return to the same place. Living-host identity, cave rest, branching-coral refuge and hovering feeding differ in what counts and how the fish settles. |
| Choosing feeding grounds | Moorish idol, longnose butterflyfish, sixbar wrasse, oriental sweetlip, spotted pufferfish, clown triggerfish, regal angelfish, blue-spotted stingray, humphead wrasse, yellowspot emperor | Match real mouth/diet and substrate opportunities: crevice picking, sponge browsing, hard prey and bottom searches. Compare feeding choices at actual patches and organisms, with species-specific prerequisites and visual actions. |
| Patrol and pursuit | Blackfin barracuda, crocodile needlefish, rainbow runner, blacktip reef shark, great white shark, tiger shark, coral trout, doublelined mackerel, silver trevally | Plan routes appropriate to surface, open water or reef edge; identify and reach a suitable meal; recover or rejoin. Speed use, chosen water layer, social return and dietary breadth should change the decision. |
| Watch and approach | Lionfish, whitespot hawkfish, wobbegong, electric ray, giant grouper, golden snapper, checkerboard hawkfish | Choose useful cover, watch actual passing animals, and approach a real meal. Perches, bottom positions, deliberate stalking and post-meal refuge should produce different movement and feedback. |
| Group browsing | Longfin batfish, longfin bannerfish | Forage within a loose group without turning it into a dense school; leave room for neighbors and return after a real meal. Their diets and feeding locations differ. |
| Moving cover | Trumpetfish | Choose a compatible real host, follow its movement and use a feeding opportunity without trapping the host or overriding its needs. |
| Light and school | Flashlight fish | Use the existing light behavior and night companions in a purposeful excursion and reunion, with clear light-state feedback. |

Current evidence lives beside each implemented family and in the eventual build receipt. A catalog row alone does not complete a journey. Final review must reconcile all 64 catalog species and explicitly state the resident outcome.

## Home-family implementation checkpoint

Eight home/feeding journeys are now implemented, bringing source coverage to **27 of 57 Practice species**. This is a work checkpoint, not a completed roster or packaged release. The remaining 30 playable species and seven residents remain in scope. Observation journeys are the stated default for residents while the optional user question remains open.

The new home choices use real refuge locations; anemonefish select a living anemone and track its identity and incarnation. A home must be reached and settled before departure. Feeding in place does not count as an excursion. Neon damselfish take algae then plankton; squirrelfish take shrimp then crab; the other journeys use their selected prey/diet and appropriate refuge/rest requirements. After feeding, the player returns to the same home and settles. Large cave-resting animals are not granted small-fish shelter immunity. Travel preserves the original location and supplies return guidance. A lost or replaced host cannot complete the relationship. E can choose a new home or restart a completed local trip while preserving the earned discovery.

- `artifacts/home-journeys-generated-final.log`: all 24 generated trips pass (eight species × seeds 2/42/57), with ordinary steering, E and mouse-equivalent meals. No NPC, food, appetite or position replacements; generated population counts remain fixed.
- `artifacts/journeys-home-unit-final.log`: all **319 unit checks** pass. New cases cover wrong food/order, feeding without departing, return/settle requirements, duplicate recognition, repeat trips, host death/incarnation, travel guidance, portable pause/replay and malformed state.
- `artifacts/home-journeys-browser-final.log`: three actual mouse/E journeys pass: mixed-feeding damselfish at 1600×900, living-host anemonefish and cave-resting whitetip shark at 1024×768. They verify journal completion, population preservation and changing progress text. Final screenshots were inspected at both sizes.

The first browser run exposed a gap in coverage: the journey completed, but its card still used generic definition steps. The final run explicitly checks feeding-return instructions and the invitation to repeat a trip. That defect is corrected. Spoken guidance for these eight journeys is still pending until their scripts join the broader narration batch. Existing 19 activity recordings and the verified Spoken Activities Windows ZIP are unchanged.

Visual follow-up keeps a remembered home marker visible while paused and beyond the ordinary 420-pixel nearby-marker range. Large-fish shelter labels now say "Too small to hide", separating concealment from the new ledge-resting journey. The three control journeys pass again (`home-journeys-markers-final.log`), and an additional renderer regression proves the far-away remembered-home label survives while paused (`home-journey-marker-range.log`). The confirmation screenshots were inspected at both sizes. No further visual polishing is needed for this family.

Next fronts: feeding specialists and patrol/pursuit journeys, then watch/approach, loose-group browsing, trumpetfish moving cover, flashlight-fish night behavior and resident observation journeys. Finish their complete-path/lifecycle checks, spoken guidance and combined Windows delivery before closing the goal.

## Feeding-specialist implementation checkpoint

Ten further playable journeys are implemented: longnose butterflyfish, sixbar wrasse, oriental sweetlip, blue-spotted stingray, spotted pufferfish, clown triggerfish, humphead wrasse, yellowspot emperor, Moorish idol and regal angelfish. Source journey coverage is now **37 of 57 Practice species**. The remaining 20 playable journeys, seven resident observation journeys, expanded spoken guidance and combined Windows release remain required. Existing testing ZIPs are untouched.

Crevice and bottom searchers now approach an existing food patch and inspect it through 1.5 seconds of continuous anatomical mouth contact. A click inspects and eats; E can expose the food and leave it for a nearby hungry forager. Shell feeders hold contact to open actual crab/snail prey. Moving, travel, death, defensive ability use or loss/replacement of the target interrupts preparation without granting a meal. Existing mouth articulation follows preparation progress; this is not a new whole-body animation pass. Searchers and shell feeders must then find their specified second food at a different feeding ground. Successful consumption, not a marker or proximity check, records the meal.

Moorish idols browse sponge and algae before rejoining a real companion for three quiet seconds; regal angelfish return to actual shelter after their two browsing grounds. The idol activity supports a pair, does not create companions, and names an occupied habitat when none is present locally. Quiet periods reset if interrupted. E can guide the return or restart a finished local trip while retaining recognition. The crab/snail sequences intentionally avoid requiring urchins, which the current game's population rules only supply at night; these daytime lives cannot switch the reef's period. These are authored gameplay abstractions using the game's existing diet and activity model, not newly researched natural-history claims.

- `artifacts/foraging-generated-final.log` and `foraging-journeys-generated.json`: **30/30 generated trips**, ten species × seeds 2/42/57. No NPC, food, appetite or position replacements. The driver uses ordinary meal requests and pointer steering; explicit habitat transitions search existing opportunities across all map rows. Generated population counts remain fixed.
- `artifacts/foraging-browser-final.log`: **five completed journeys through actual mouse controls**, covering crevice inspection, bottom sifting, hard prey, companion reunion and shelter return at 1600×900 and 1024×768. Checks include changing progress text, persistent journal discovery and population count. Completion screenshots were inspected at both sizes. The browser uses an entire seeded simulation as its reproducible fixture, not fabricated feeding targets.
- `tests/foraging-journeys.test.mjs`: interrupted preparation, real exposure before consumption, wrong/unprepared/too-close meals, lost and respawned prey, missing-companion guidance, all ten portable save/pause/replay states, malformed progress, replay without losing recognition, and defensive interruption. The full unit-suite receipt is `artifacts/foraging-full-unit-final.log`.

The first generated run failed eight trips. It exposed the unavailable daytime urchin prerequisite, an unnecessarily strict two-companion reunion, and a QA driver that searched only one map row. Each was corrected; the full 30-case survey and all five browser paths then passed. The first negative unit test also incorrectly assumed a daytime urchin existed; its fixture now uses actual daytime shell prey. No failing run is counted as successful evidence.

Next implementation front is patrol/pursuit, followed by the remaining watch/approach, loose-group, moving-cover, nightlight and resident-observation journeys. Narration and final Windows packaging are still outstanding, not implied by this source checkpoint.
