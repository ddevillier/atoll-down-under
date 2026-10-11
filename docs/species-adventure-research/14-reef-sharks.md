# Reef sharks: species adventure research

Research date and independent source recheck: 10 October 2026. Scope: s32 Blacktip reef shark, s33 Whitetip reef shark, s36 Wobbegong. Research/design only. All proposed interactions, short timescales, reactions, and completion rules below are game design inferences, not claims that animals perform human tasks.

## Recommendation

| ID and identity | Current loop | Fresh opportunity and verdict | Effort / priority |
|---|---|---|---|
| s32 — *Carcharhinus melanopterus* | `blacktip-reef-edge`: select lane, survey, take substantial fish, return | Choose spacing beside an actual preferred associate, then recognize the same individual on an independent route. Tide/access is the larger subsequent option. | M / P2 social; L / P2 tide |
| s33 — *Triaenodon obesus* | `whitetip-rest-trip`: select ledge, settle, leave for fish/crab, return | Find a body-sized place in a shared resting shelter and leave a neighbor room to pass. Strong, immediately legible non-feeding story; explicit scene and admission gates. | M / P1 |
| s36 — Orectolobidae, family; species unresolved | `wobbegong-bottom`: become still, notice fish/crab, short trip, return | Fit a patterned body against existing cover, compare two positions, then relocate under its own power. Moderate; preserve family-level identity and avoid copying cuttlefish color change. | M / P2 |

Prefer whitetip shared-space fit, then blacktip familiarity, then the family-scoped wobbegong cover comparison. Tide/access follows its scene-infrastructure gate. No card adds animals, offspring, prey waves, mandatory kills, permanent territory ownership, day/night waits, or an oxygen countdown. Existing sharks and other residents remain the participants. Before offering a shared encounter, admit eligible adults within the existing population budget and validate reachable sites. Preserve committed behavior and existing relationships. If a saved dive has no eligible conspecific anywhere reachable, state that honestly and preserve/export it before offering a fresh adventure dive; endless searching cannot fix that world. A solo habitat branch keeps exploration useful, but cannot award an associate reunion or shared-passage discovery.

## Verified code baseline and integration contract

Inspected `src/data.js`, `src/natural-history.js`, `src/adventures.js`, `src/patrol-journeys.js`, `src/home-journeys.js`, `src/watch-journeys.js`, `src/refuge-motion.js`, `src/ambush-activity.js`, `src/reef-story-data.js`, `src/reef-stories.js`, `src/main.js`, and relevant simulation/save references. No runtime files were edited and no runtime tests were run.

- s32 is day/open/dash, fish-only in the game. Its patrol is a lower-water lane centered at y=410 with a 100-unit band, minimum prey size 45, and a three-second return interval. This is already a complete meal circuit; changing the route's name or adding another meal is not a new adventure.
- s33 is night/reef/dash, fish and crab. `home-journeys.js` already gives it a resting ledge, departure threshold and three-second settling. Add shared-space selection rather than another leave/feed/return checklist.
- s36 is night/sand/camouflage, fish and crab. Its implemented player activity comes from `watch-journeys.js` with a three-second settle and a short-trip range of 240. **It is not in `ambushHunter`**, whose IDs are s16, s21, s54 and s59. Do not claim that the existing ambush action already supports wobbegong. The current camouflage ability is a game abstraction; it should not become evidence of rapid biological color change.
- All three are excluded from the game's parasite-bearing species in `data.js`. A mandatory cleaner visit would need an explicit gameplay and evidence change; it is not an easy existing hook.
- `refugeHome` and `chooseRoom` provide collision-aware candidate placement and persistent homes; `approachRefuge` provides smooth approaches. Their present general shelter/bottom geometry does not establish species-specific cave clearance, tidal access, or actual camouflage quality.

Implement optional Practice stories using the existing module interface: `initStory`, `validStory`, `storyAction`, `tickStory`, `storyMeal`, `storyNPC`, and `storyView`. Register keys in `REEF_STORIES`, reflections/discovery IDs, module dispatch, `freshStories`, strict `validStories`, `habitatFor`, cleanup and renderer dispatch. `storyKeysFor` now lists eligible stories; `storyKeyFor` retains the first-match default for old callers/saves. Preserve explicit optional selection and current journeys when adding another s32 story. New observation/slot controls should live in story actions, with visible nearby markers; E currently belongs to `sim.useContext()` and existing journeys.

Use versioned bounded state: stage enum, one reef/site reference, at most two candidate sites and one NPC reference, finite positions/headings, limited evidence flags, and a completion flag. NPC identity means `{id, incarnation}`, plus species and reef validation, never array index or species alone. Save/reload must preserve meaningful completed beats, validate all nested fields, and award one discovery exactly once. Pause/modal/blur freezes clocks. Leaving the reef suspends dependent interactions without claiming observation or punishing delay. Missing/replaced NPCs clear the relationship and allow a fresh encounter; a replacement must not inherit familiarity. Free exploration and moving the mouse immediately release assisted poses/routes. No offline deadlines or accumulated scarcity.

Controls verified in `main.js`: pointer movement steers, except watch/ambush states where it aims; live canvas clicks call `eatAt`; paused clicks inspect; Escape/P pause; M opens map; E invokes existing context action. Consequently a proposed friendly shark/world click needs an explicit hit-test before `eatAt`, or a clearly labeled story button. Merely painting a marker does not implement an action. Provide keyboard-focusable story controls and large visible targets; do not overload a shark click with accidental feeding. Real-controls acceptance below means browser input through these paths, not calling a story function directly.

## s32 — A route with room

### Evidence and limits

Blacktip reef sharks use shallow reef and sand flats and familiar restricted areas. The museum account also describes tidal movement into mangroves. This is *C. melanopterus*, not *C. limbatus*. [Florida Museum species account](https://www.floridamuseum.ufl.edu/discover-fish/species-profiles/blacktip-reef-shark/).

Telemetry at St Joseph Atoll found greater shallow-flat use at higher tides, with individual variation; blacktips could access flats earlier than sicklefin lemon sharks. The study's local water-height threshold must not become a universal shark requirement. [Lea et al., 2020, primary study](https://www.frontiersin.org/journals/marine-science/articles/10.3389/fmars.2020.00624/full).

Juvenile nursery research describes a particular size class moving with tides among very shallow reef and mangrove habitat. Do not label the current large avatar a pup or transplant juvenile refuge behavior to every adult. [JCU repository: George et al., 2019](https://researchonline.jcu.edu.au/60551/).

**Fresh decision:** choose between a newly covered flat and the always-accessible deeper route, then adjust when the available water changes. A spatial access problem replaces the patrol's food-size problem.

**Four-beat loop:**

1. Approach a junction and compare two readable depth/coverage markers, including a clear text cue for body clearance.
2. Choose a branch. The player swims through it; a remote choice alone does not count.
3. At the next junction, a short authored tide transition makes one flat less suitable. The shark turns toward the connected deeper channel; the player can follow or choose another suitable route.
4. Reach the familiar junction by a connected safe route and observe the different water coverage. Record the habitat choice, without requiring a meal or a timed return.

**Visible agency/world consequence:** one already-present blacktip independently chooses the suitable channel before or after the player. Its turn and the water-covered flat's outline carry the story. Do not force it to follow the player, beach it, or turn a shallow route into damage. With no conspecific, the route remains a solo habitat story and makes no social claim.

**Hooks/state/art:** new route graph/access predicates over two authored passages, current body-clearance check, mild coverage overlay, one junction marker, map cue, and optional existing-NPC routing through `storyNPC`. Store phase enum (covered/receding), traversed branch, reached junction flags, bounded NPC ref. Tide phase changes at an explicit spatial beat, not an actual clock or real-world tide. Expose the compressed scene as an illustrative game scenario. Flowing dots and distinct contour marks need reduced-motion/text equivalents. No global ocean physics is needed, but static reef backgrounds must actually depict the claimed flat/channel geometry.

**Acceptance:** complete through pointer steering and story buttons; wrong branch receives a readable detour rather than damage; marker clicked across the reef grants no traversal; pause mid-transition keeps coverage and NPC position; map exit/resume keeps branch and phase; loading at the junction cannot award again; existing food/spawn counts remain unchanged. Test small and large body clearance and alternate route availability so no tide phase traps the player.

**Verdict:** strong ecological distinction, L / P2 because the game currently lacks authored tidal connectivity. Do not reduce it to two recolored patrol lanes.

### Conditional smaller card — Familiar fins

Photoidentification research on blacktip reef sharks at Moorea found social communities and associations beyond spatial overlap. That supports optional familiar company, not pack hierarchy, telepathy, obligatory friendship, or a juvenile-wide rule. [Mourier, Vercelloni and Planes, 2012, institutional research record](https://researchers.mq.edu.au/en/publications/evidence-of-social-communities-in-a-spatially-structured-network-/).

**Decision and four beats:** identify a currently present blacktip; swim at its chosen comfortable spacing; let it choose one of two routes rather than steering it; meet the same individual at the next junction or freely take the solo branch. The neighbor may continue independently. A short matched-heading segment and later same-identity encounter make success, never waiting beside a still NPC. One companion reference, two junctions, an encounter flag and a bounded spacing band suffice; the reaction timing is authored, not a measured social rule. Reuse patrol/refuge steering and existing identity presentation, but not feeding-companion code that demands meals. No hearts, breeding, new sharks, or permanent follower.

**Acceptance:** another shark of the same species cannot finish the reunion; reincarnated/replaced entity clears it; pointer steering can break formation immediately; no-neighbor route stays available; pause/offscreen never logs unseen reunion. M / P2, and conditional on normal population placement offering a real same-species encounter. Combine with the tide story only if shared junctions remain clear and both branches are independently completable.

## s33 — Room beneath the ledge

### Evidence and limits

Whitetip reef sharks can breathe while stationary, commonly rest in caves by day, and return to familiar shelters. Multiple animals can share a non-territorial resting place; the narrow body also permits feeding in reef crevices. These claims apply to *Triaenodon obesus*, not oceanic whitetips. [Florida Museum species account](https://www.floridamuseum.ufl.edu/discover-fish/species-profiles/whitetip-reef-shark/).

A [primary acoustic-telemetry study at Isla del Coco](https://revistas.ucr.ac.cr/index.php/rrbt/article/view/10781) followed eight tagged whitetips for approximately a year and found persistent bay residency with fewer nighttime detections. Receiver detections support local residency, not exact cave occupancy or deliberate etiquette. Do not manufacture a neighbor's politeness as a biological fact.

**Scene gate:** current s33 dives initialize at night. A card presented as daytime communal rest needs an explicit compatible fresh daytime scene and population setup. Never relight or repopulate a saved night dive. A short nighttime pause can remain honestly described as resting between excursions; daytime evidence does not establish universal nighttime inactivity. No requirement to keep swimming or oxygen countdown applies to this resting-capable species.

**Fresh decision:** select a resting orientation and position that fits around a resident and leaves a passage. This is shared habitat geometry, not another prescribed rest timer. Neighbor repositioning below is an authored way to make the shared space readable, not evidence of deliberate etiquette.

**Four-beat loop:**

1. Inspect two visible spaces beneath a broad ledge, one beside an existing resting whitetip and one that obstructs the entrance. Show body silhouettes/clearance without awarding a step.
2. Swim into a suitable gap and choose Rest here. The body aligns with the floor while subtle gill movement shows ordinary stationary breathing.
3. The existing neighbor independently starts an excursion; the player shifts to a side gap or leaves first, keeping the passage clear. The neighbor can choose the other opening if the player stays.
4. After the neighbor passes, choose the vacated or original gap and settle into its physical footprint. Complete on a valid pose and witnessed passage, without a mandatory feeding trip or prolonged stillness countdown.

**Observable effect:** two bodies have distinct resting positions, the neighbor turns and swims out, and the entrance becomes visibly clear. No aggression, eviction, dragging the NPC, starvation, or oxygen emergency. If no whitetip is present, offer the solo fit comparison and preserve the shared-space invitation for a future actual encounter; do not claim a shared-space discovery from solo action.

**Hooks/state/art:** extend refuge candidate scoring with explicit cave floor/entrance footprints for this scene; use `creatureFrame`, `approachRefuge` and a small `storyNPC` departure intent. Keep normal autonomous feeding/avoidance precedence. Store ledge index, selected slot enum, neighbor reference, passage-witnessed flag, pose enum and complete flag. Art is one broad overhang mask, two restrained clearance outlines, visible white fin tips and restrained gill animation; avoid making the animal disappear behind opaque cave art. No bubbles imply air breathing. Directional pose/clearance is the skill; no rhythmic input needed.

**Lifecycle:** NPC departure intent resumes only while the story habitat is active. If the NPC leaves permanently, preserve the chosen ledge but require a new actual neighbor before logging shared passage. Never reposition an offscreen shark into a staged pile on return. Save stationary breathing pose separately from any breath-meter mechanic; there is no breath meter.

Required held poses need explicit local peaceful interaction ownership and suspension of pose-related need drain. Preserve actual health/energy, let unrelated reef ecology continue, and release movement before normal danger resumes on cancellation. A generic Practice label alone does not establish these properties.

**Acceptance:** actual approach is required before Rest here; rest must not accidentally trigger E's old home-trip reset; can shift and leave using ordinary steering; blocking one opening leaves a valid alternate; neighbor cannot clip through the player or snap into a stack; an already departed offscreen NPC does not count as witnessed; save/load each beat preserves identity and one reward. Reduced motion retains a static Resting and breathing normally cue. M / P1.

**Reject/defer:** shark-cleaner clinic as a required feature. The museum page's cleaning reference concerns *Carcharhinus perezi* and is not sufficient evidence for this species' exact cleaner relationship. Current parasite rules also exclude s33. Better evidence and an intentional system change are needed before proposing a cleaning payoff.

## s36 — The edge of the pattern

### Evidence and identity limits

The game explicitly identifies a wobbegong family rather than a species. Preserve that wording. The Australian Museum's spotted wobbegong example describes a flattened, patterned shark with snout flaps, often on sandy or rocky bottoms. Its southern Australian range must not be generalized to all Orectolobidae or used to silently identify the avatar. [Australian Museum: spotted wobbegong](https://australian.museum/learn/animals/fishes/spotted-wobbegong-orectolobus-maculatus-bonnaterre-1788/).

The museum's *Orectolobus ornatus* account describes clear-water reefs and bottom resting by day. A 2006 study under that name found selection of complex resting sites and crevice volume, rather than selection by prey availability, and substantial individual turnover. Treat the older named study as an example requiring taxonomy reconciliation before a species-specific implementation; it cannot justify permanent home ownership for every wobbegong. [Australian Museum: banded wobbegong](https://australian.museum/learn/animals/fishes/banded-wobbegong-orectolobus-ornatus-de-vis-1883/); [Carraro and Gladstone, 2006, UTS research record](https://opus.lib.uts.edu.au/handle/10453/14866).

**Fresh decision:** find a place where the existing outline, patterned body and low profile fit cover. The animal chooses position/orientation; it does not choose a new skin pattern. Avoid making another version of the cuttlefish's Disappearing Artist.

**Four-beat loop:**

1. Approach two existing bottom sites: exposed smooth sand and broken rock/ledge edge. Preview only coarse suitability and body clearance.
2. Select a position and turn the body so its outline lies beside the cover; no invisibility toggle is needed.
3. An already-present, non-edible compatible passer takes its normal route. Record the spatial comparison through an outline/cover overlay; a small course change may make detection readable, explicitly as game inference rather than a taxon-wide measured reaction.
4. Relocate to the second site and compare the same body silhouette. Choose either comfortable place to finish; no prey capture or compulsory wait for a fish.

**NPC/world effect:** the wobbegong visibly lifts/moves and settles rather than being a static tile; a passer may give a little space. If no eligible passer is already nearby, the habitat-fit comparison completes without a fabricated sighting or spawn. Do not lure prey into its mouth or claim that resting always means hunting. Shared data can support ambient resting-site choice for existing wobbegong NPCs after the player story proves clear.

**Hooks/state/art:** draw two natural bottom/ledge footprints on existing `bottomRoutes`, validate full creature bounds via geometry, and reuse smooth refuge approach. Do not simply add s36 to `ambushHunter`; its watch journey stays intact. Store up to two site IDs, heading enum, compared-sites bitset and optional passer `{id, incarnation}`; no population ledger. Art may need an under-ledge occlusion mask and a clearer fixed fringe silhouette; never animate rapid skin-color switching. A quiet lift/settle is enough to express activity.

**Lifecycle/acceptance:** pointer movement leaves immediately; select through a story button or dedicated friendly hotspot rather than `eatAt`; distant clicks do not teleport or count; player must physically compare both sites; unchanged fixed markings across sites; no watching completion while paused/offscreen; missing passer falls back to the honest solo comparison; restoring a saved site clamps to valid geometry without re-awarding. M / P2, moderate pending family-level habitat wording. Species-specific luring, social partner preferences, exact night schedule, or long-term territory should wait for a resolved taxon and matching sources.

A daytime resting showcase also needs an explicit fresh-scene gate because current s36 starts at night. The [Australian Museum comparison](https://australian.museum/learn/animals/fishes/banded-wobbegong-orectolobus-ornatus-de-vis-1883/) distinguishes *O. ornatus* from the similar, larger *O. halei*; name, size and art must agree before a named case study is offered. Keeping Orectolobidae in the guide is preferable to silently assigning a species from its pattern alone.

## Cross-card acceptance and delivery boundaries

For each implemented card, exercise real rendered mouse and keyboard controls, immediate user override, paused inspection, route exit/re-entry, save/load at every beat, missing/incarnated NPC recovery, and replay reward idempotence. Assert a visible pose, route or spatial consequence accompanies each progress flag. Confirm entity and food counts do not increase. Keep complete fallback routes available when no social participant is present; never require waiting for a spawn, a time of day, a real tide, a meal regrowth, or a later session.

This document adds proposals only. No changes to runtime, audio generation/APIs, commits, or research into any original game were made.

## Final implementation order

1. **s33 — [Room beneath the ledge](#s33--room-beneath-the-ledge), M/P1:** two physically usable slots and a witnessed real-neighbor passage; gate the daytime showcase and eligible participant.
2. **s32 — [Familiar fins](#conditional-smaller-card--familiar-fins), M/P2:** independently moving associate, meaningful spacing choice, later same-ID encounter; gate actual conspecific admission.
3. **s36 — [The edge of the pattern](#s36--the-edge-of-the-pattern), M/P2:** fixed-pattern body placement and visible relocation; keep family scope until taxonomy/art/locality agree.
4. **s32 — [A route with room](#s32--a-route-with-room), L/P2:** water coverage changes real route access; defer until authored flat/channel geometry and escape paths exist.
