# Specialist mouths: species adventure research

Research date: 2026-10-10; exact-species behavior follow-up on the same date. Scope: s6, s10, s29, s56. This report is research and proposed design. The current baseline below describes inspected code; every implementation card remains unimplemented for these four IDs. Preserve existing journeys and unrelated implementation work. No original-game research, generated assets, commits, or pushes.

## Recommendation

| Species | Verdict | Best next activity | Effort / priority |
|---|---|---|---|
| s6 Longnose butterflyfish | **Rank 1:** add anatomical choice alongside legacy journey | The narrow window: choose a reachable crevice opening; territorial head/pulse observation is a second, distinct possibility | M / P1; signal encounter M–L / P2 |
| s29 Humphead wrasse | **Rank 2:** quiet community encounter with actual body clearance | The caves at dusk: choose an entrance/chamber and give arriving fish room | M bounded vignette; L global clock / P1 |
| s10 Sixbar wrasse | **Rank 3:** make animal movement and substrate choice matter | Life in the turf: choose a microhabitat and follow a real small-prey escape route | M / P1; captive-pellet handling separate/conditional |
| s56 Longfin bannerfish | **Rank 4:** improve the existing shared trip | Your turn to lead: reciprocal route choice; optional juvenile cleaning observation needs a juvenile actor | M / P2; new juvenile content conditional |

P1 means a strong candidate after shared infrastructure is ready; P2 means refinement rather than necessary replacement. Badges are one-time discoveries with freely repeatable play: no quotas, streaks, grind, or punishment for changing plans.

## Verified implementation baseline

Inspected `src/data.js`, `natural-history.js`, `adventures.js`, `foraging-journeys.js`, `companion-activity.js`, `feeding-contact.js`, `sand-search.js`, `animal-profiles.js`, `home-journeys.js`, `simulation.js`, `save-files.js`, actual pointer/keyboard handlers in `main.js`, and activity narration. Paths below are repository-relative.

- s6 and s10 share `probe`: ordered worm then coral (s6), worm then shrimp (s10); grounds must be at least 120 world units apart. Click approaches, holds anatomical mouth contact for 1.5 simulation seconds, exposes the patch and eats. E inspects without eating. The eight-second exposed opportunity can attract existing hungry foragers through `sand-search.js`; this is a game abstraction, not species-specific cooperation evidence.
- s29 uses `shell`: snail then crab at separated grounds, with 1.5 seconds uninterrupted mouth contact. These are existing animal entities. Completion follows the second meal. Its menu also includes urchin/fish. `crush` is not documented tool use.
- s56 already uses `pairedBrowser`: E invites same-species NPC within 280 units; player takes plankton then worm within 300 units, companion makes a real feeding excursion, and they calmly reunite within 145 units for three seconds. Hunger, danger, cleaning and rest interrupt normally. Separation beyond 650 units parts the pair; companion remains reef-bound. Identity includes ID and incarnation.
- Recheck of the current registry found no selected story for s6/s10/s29/s56 implementing the cards below. The sixbar anvil, butterflyfish territorial signal, humphead dusk/spawning and juvenile bannerfish care are proposals, not existing mechanics. Current companion invitation can detach an NPC's prior pair; any new reciprocal story must admit an eligible unpaired fish instead of inheriting that behavior.
- Real controls: pointer movement swims and cancels preparation through `point`; click targets a meal; E is context; Space existing ability; Esc/P pause/observe; M map; C cleaning. Do not invent WASD controls. New actions need visible-button equivalents and a selected-target cue.
- `approachMeal` accepts only heading alignment and mouth-to-surface gap at most three units; neither body overlap nor streamer contact counts. It handles water-side approaches near boundaries. Never award feeding progress from proximity or E alone.
- `Simulation.step` returns while paused; saves serialize simulation state and restore paused. Extend `validAdventure`, preparation validators and `Simulation.restore` for new state. `period` is selected at spawn, not a running dusk clock. A sunset scene is not a data-row-only change.

## s6 — Longnose butterflyfish / Forcipiger flavissimus

### Evidence and identity limits

This is `F. flavissimus`, not longer-snouted `F. longirostris`. Museums Victoria's account lists polychaete tentacles, echinoderm tube feet/pedicellariae, small crustaceans, hydroids, coral and fish eggs; it also records monogamous pairing. Coral is possible food, but an obligate coral-polyp identity would be wrong. [Fishes of Australia](https://fishesofaustralia.net.au/home/species/2410).

A comparative anatomy/high-speed feeding study directly included both Forcipiger species and `H. acuminatus`. `F. flavissimus` had less extreme jaw mobility than `F. longirostris`; the latter's exceptional anterior protrusion must not become this species' telescoping power. The study discusses crevice probing and rejects extreme suction. Filmed captures used aquarium brine shrimp, so proposed geometry puzzles are authored abstractions, not measured field experiments. [Ferry-Graham et al. 2001, primary paper, pp. 124, 133–137](https://fishlab.ucdavis.edu/wp-content/uploads/sites/397/2020/06/Ferry-Graham-et-al-2001.pdf).

Do not add a mucus cocoon. Hobson's direct Kona observations describe daytime surface picking and nighttime inactivity in rock/coral cover, not a special bedtime ritual. [Hobson 1974, NOAA-hosted primary paper](https://swfsc-publications.fisheries.noaa.gov/publications/CR/1974/7411.PDF).

Pairing needs qualification: the institutional account reports monogamy, but Boyle & Tricas describe Hawaiian `F. flavissimus` as socially haremic and `F. longirostris` as socially monogamous. Do not force universal lifelong pairs or transfer the latter's social system. Current `loose` motion can remain; a new companion story needs population/context evidence.

### Implementation card: The narrow window

**Decision:** Which opening lets this mouth reach a visible small meal while the body stays outside the reef?

1. Approach a ledge with two recognizable openings and a tiny worm-tip cue.
2. E/Inspect previews a reachable approach; choose a side by moving there.
3. Click visible food to align and pick; move away to cancel freely.
4. Inspect a differently shaped opening; recognize inaccessible food and leave it, recording that observation instead of requiring another kill.

**World reaction:** Picked patch retracts; nearby ordinary foragers may investigate a genuinely exposed opportunity. At an inaccessible opening the fish brakes outside the wall with a short reach cue. No teleported food or gratitude from prey.

**Novelty/verdict:** Spatial access and snout/body separation replace the existing two-food checklist. Preserve legacy journey saves. Understanding an inaccessible site can earn the second discovery step.

**Hooks/state/art/audio:** Add entrance/contact points and obstruction geometry to `feeding-sites.js`; species-specific geometry around `foraging-journeys.js` and `feeding-contact.js`, not a global longer bite radius. Preserve `data.js` compatibility; update `natural-history.js` and narration precisely. Save site/opening IDs, observed access outcome, completion; docking restarts if necessary. Crevice overlay, two worm-tip poses, modest jaw/sculling animation; soft pick sound on contact. Badge: **Small Openings**. M/P1.

**Acceptance/lifecycle:** Both-side approaches keep the body outside the wall; no contact through the back of a ledge. Pointer movement/E cancel, pause freezes, save/reload cannot duplicate food. Reef departure clears contact but preserves observations. Do not turn living urchins into whole consumable prey to represent picking tube feet: that requires a distinct partial-feeding model.

### Additional proposed card: A pulse at the boundary

**Observed behavior:** Boyle & Tricas studied 14 `F. flavissimus` in aquarium agonistic encounters: a pulse accompanied rapid cranial elevation. The paper also reports feeding-territory defense in Hawaii. This is territorial signaling, not a friendly call or a measured sound-to-command dictionary. [Primary full text, JEB 2011, DOI 10.1242/jeb.062554](https://www.fishmorphandbehavior.org/uploads/8/4/7/1/84711046/boyle_tricas.2011.pdf).

**Choice → visible consequence:** Approach an occupied feeding edge; observe the actual fish's head motion and matched local ripple; choose a route around its patch or an open feeding face. The player changes position and the neighbor resumes local activity. That spacing response is authored, not a proven receiver response. This differs from hidden-neighbor listening through a visible cranial mechanism and a feeding-boundary route choice; otherwise omit it as a squirrelfish duplicate.

**Scope/acceptance:** A new optional story, one eligible existing conspecific, bounded site/ref/stage, dedicated head articulation and visual equivalent of sound. Freeze offscreen; release identity on replacement; no forced aggression or spawning. Real approach, head motion and changed routes must precede discovery. A sound timer alone cannot complete it. M–L/P2; lower priority than mouth geometry.

## s10 — Sixbar wrasse / Thalassoma hardwicke

### Evidence and identity limits

Six wedge-shaped bars and pink head lines identify the species; the game uses one adult appearance. Institutional documentation supports individuals or small groups, shallow reefs, diverse animal prey and female-to-male sex change. It does not imply lifelong pairs or compulsory cleaning. [Fishes of Australia](https://fishesofaustralia.net.au/home/species/284).

A field study at Lizard Island explicitly lists `T. hardwicke` in Table 1: positive selection of epilithic algal matrix (EAM), neutral dead-coral selection, negative selection of rubble, sand and live coral in that study. This supports hunting crustaceans in turf, not algae grazing or universal habitat avoidance. [Kramer, Bellwood & Bellwood 2016, DOI 10.3354/meps11694, inspected author-uploaded primary paper](https://www.researchgate.net/publication/297894806_Foraging_and_microhabitat_use_by_crustacean-feeding_wrasses_on_Coral_Reefs); [publisher PDF](https://www.int-res.com/articles/meps2016/548/m548p277.pdf); [JCU thesis containing study, chapter 6](https://researchonline.jcu.edu.au/46265/).

Kamen, Mumby & Wolfe's 2024 field observations and separate tank trials included `T. hardwicke`. It consumed small cryptofauna from rubble despite rubble not being its preferred substrate; bite count did not reliably represent consumed biomass. Tank behavior differed from field behavior, and experimental hunger was standardized: neither experimental fasting nor a bite-rate target belongs in the game. [Primary open-access study](https://link.springer.com/article/10.1007/s00338-024-02501-z).

Anvil nuance: Paśko 2010 really concerns **this species**, not tuskfish. Its abstract describes one aquarium fish carrying hard oversized pellets to a rock, about 15 detailed observations. It establishes neither routine wild shell-smashing nor anything about humphead wrasse. Publisher/PubMed full content failed to render; author's abstract was available in indexed metadata. [Primary DOI](https://doi.org/10.1002/zoo.20307), [abstract metadata](https://openalex.org/W2141252420). Keep this a qualified research note. No species-specific sleep claim cleared evidence threshold.

### Implementation card: Life in the turf

**Decision:** Investigate turf-edge animal movements or pursue a shrimp already exposed nearby?

1. Inspect neighboring live-coral and short-turf surfaces.
2. Choose an edge/approach angle; nearby movement reveals an existing small animal retreating through the turf rather than generating guaranteed food.
3. Follow its accessible escape route for a real mouth-contact capture, or leave that animal and inspect another substrate.
4. Reinspect the changed spot: cropped movement/remaining animals reveal what was taken. A forager using remaining food is an optional response, distinguishing animals living among algae from algae itself.

**World reaction:** Turf parts locally and settles; reserved prey cannot feed two actors. Hungry NPCs use actual remaining food. The cue is an accessibility aid, not a biological scan power.

**Novelty/verdict:** Interpret substrate and prey movement instead of finding two generic food types. Recoloring a worm patch or holding E for another reveal timer is insufficient. The short escape route is authored interpretation, not measured natural choreography. If `shrimp` represents tiny crustaceans, label that simplification; do not claim all cryptofauna are decapod shrimp. Turf animals never grant `algae` nutrition.

**Hooks/state/art/audio:** `feeding-sites.js` microhabitat tags plus a bounded prey route/contact actor; a new optional story should preserve `wrasse-search` saves. Reuse contact/consumption and only the useful reservation portions of `sand-search.js`. Save examined sites, prey identity/incarnation or finite resource ID, route branch and consumed/observed flags. One tiny-prey asset and finite turf occlusion, optional rustle. Badge: **Life Between the Blades**. M/P1.

**Acceptance/lifecycle:** Algae itself grants no meal credit. Depleted turf shows no prey; map offers other sites. E never manufactures food; clicking requires mouth contact. Pause freezes timers. Travel clears inspection/reservation; offscreen feeding grants no discovery. If no suitable NPC exists, the optional observation cannot block completion.

**Deferred anvil:** Only a clearly labeled aquarium-observation vignette matches the pellet experiment. Wild shell/anvil play, proven memory-based reasoning, or a tool badge for s29 overstates evidence and adds carry/drop ownership complexity. Defer.

**Conditional captive card — One pellet, one rock:** If a separate aquarium research chapter is authorized, choose an accessible rock surface, physically carry one oversized pellet, contact that surface and observe manageable fragments. A finite carried/placed/fragment record, jaw/rock-contact animation and cancel/drop ownership are required; mouth contact, surface contact and an actual fragment bite must agree. Save each ownership transfer; pause freezes handling. Label this as a reenactment inspired by one captive individual, not a universal skill, a wild shell claim, or proven reasoning. No repeated smashing quota. M–L/conditional; does not justify putting pellets in the wild reef or adding an s29 anvil mechanic. Source remains Paśko's primary abstract/DOI above; full methods were not verified.

## s29 — Humphead wrasse / Cheilinus undulatus

### Evidence and identity limits

The current strong-mouth diet matches documentation of crustaceans, molluscs, fishes and echinoderms. Large-adult appearance is appropriate; sex change and spawning gatherings are separate processes, not instant upgrades. [Fishes of Australia](https://fishesofaustralia.net.au/home/species/2962).

Daly et al. tagged 20 wild Seychelles fish, analyzed 19 after excluding a short track, and observed gatherings outside sleeping caves near dusk. The monitored area had small entrances and roomy interiors. About 55% showed persistent fidelity to that sleeping site; others visited sporadically and may have used alternatives. Familiar caves/dusk gathering are supported, but universal permanent residence is not. [Daly et al. 2020, primary paper, sections 2.4 and 3.6, DOI 10.3354/esr01035](https://pdfs.semanticscholar.org/1beb/43b7473aa7b03c897781110a2021afb4655c.pdf); [publisher](https://www.int-res.com/articles/esr2020/42/n042p007.pdf).

No verified anvil evidence for `C. undulatus` found. Never transfer sixbar aquarium or tuskfish field behavior. Avoid crown-of-thorns extermination: diet membership alone does not establish population control and makes poor peaceful discovery play.

### Implementation card: The caves at dusk

**Decision:** Return to a familiar refuge, yield to an arriving fish, or choose an accessible alternate chamber?

1. Inspect two cave mouths; mark a roomy refuge with E.
2. Make a free exploration/ordinary feeding excursion; food optional.
3. Trigger a clearly labeled dusk vignette at the refuge edge; familiar humpheads begin return paths.
4. Choose a clear entrance or yield space, then settle inside a valid chamber.
5. Record **Room for the Evening**, remembering the cave and witnessed arrivals.

**World reaction:** NPCs enter available chambers. Occupied entrances cause waiting or alternate routing. Slots/yielding are game abstractions, not documented altruistic queueing. No fish-thanks-player claim.

**Novelty/verdict:** Restful community encounter and large-body navigation add more than a generic homecoming timer. Keep snail/crab trip as separate feeding option. Returning to a circle alone duplicates `home-journeys.js`.

**Hooks/state/art/audio:** Use `reef-story-data.js`/story architecture or dedicated journey; reuse home selection and `reef-memories.js` while extending validators carefully. Cave entrance/chamber IDs and body-size acceptance need geometry. `simulation.js` must explicitly support lighting: `period` is static and affects cleaner/population selection. Prefer bounded optional dusk chapter rather than silently rebuilding the reef. Save cave IDs, stage, finite arrival roster/incarnations and completion; revalidate transient reservations. Entrance occlusion, local dusk light, quiet fin/gill motion and ambience. M vignette, L general day/night ecology; P1.

**Acceptance/lifecycle:** E marks, never teleports/completes entry. Entire body fits; entry movement is continuous. Pause/blur stop rest and arrivals. Departure suspends scene with no offscreen award. Missing NPCs release reservations; an open alternate always permits completion. Mid-entry saves restore paused with valid geometry.

### Additional proposed observation: The rise beyond the reef

**Observed behavior:** Colin's Palau field study describes a resident spawning aggregation: males displayed with a pointed anal fin, folded-down caudal fin and dorsal fin held against the body; females rose and pairs released gametes near the shelf break. Timing was associated with tides at that site; it is not a universal daily game appointment. [Primary paper, 2010, DOI 10.1111/j.1095-8649.2010.02553.x](https://onlinelibrary.wiley.com/doi/10.1111/j.1095-8649.2010.02553.x) (publisher abstract inspected).

**Choice/consequence:** In an explicitly introduced reproductive observation chapter, choose an outside viewing route or yield the ascent corridor. Existing eligible adults display the posture and move through a real paired rise; the changed vantage reveals the fin/body sequence. Observation requires visible motion, not another meal or waiting for a clock.

**Scope/acceptance:** Verified adult sex/phase art, independent median-fin articulation, a bounded two-actor route and admitted identities within the population budget. Persist observed phase/vantage; freeze offscreen; missing actors permit a new encounter without resetting earned observations. No automatic reproduction after shell feeding, no multiplying adults, forced calendar or sex-change power. L/P2 conditional; caves remain the practical first choice.

## s56 — Longfin bannerfish / Heniochus acuminatus

### Evidence and identity limits

Australian Museum distinguishes this from schooling bannerfish `H. diphreutes`: the latter has a shorter snout, rounder profile under the head and different anal-band placement. The Museum supports zooplankton and bottom-invertebrate food in sheltered bays/reef waters. A streamer alone cannot identify it. [Australian Museum](https://australian.museum/learn/animals/fishes/longfin-bannerfish-heniochus-acuminatus-linnaeus-1758/).

FishBase's referenced account reports often-solitary juveniles, adult pairs, near-reef plankton feeding and occasional juvenile parasite picking. These are reference-compiled claims, not a newly inspected field experiment. [FishBase field guide, refs. 1602, 48636, 5503](https://www.fishbase.se/Fieldguide/FieldGuideSummary.php?c_code=710&genusname=Heniochus&speciesname=acuminatus). A USGS institutional compilation also mentions occasional cleaning by juveniles and sometimes adults, citing Burgess & Axelrod (1973) and Randall (2005). Thus “only juveniles ever clean” is too absolute; neither account establishes an obligate adult cleaner. [USGS species profile](https://nas.er.usgs.gov/queries/FactSheet.aspx?speciesID=3019). No dependable species-specific sleep ritual verified.

### Implementation card: Your turn to lead

**Decision:** Lead toward an upper-water food stop, or follow a hungry companion toward a lower patch?

1. Invite a nearby adult conspecific with existing E interaction.
2. Read its visible intent; choose an upper/lower stop, or E to follow its proposal.
3. Leader travels and makes a real meal; partner chooses a remaining nearby patch.
4. Rejoin at a familiar landmark, with either animal allowed to start the return.

**World reaction:** Companion proposes destinations and leaves depleted patches. Danger, cleaning and rest still interrupt. Following is optional; parting does not erase completed discoveries.

**Novelty/verdict:** Incremental agency refinement: current `bannerfish-mixed-trip` already covers both feeding levels, companion meals and reunion. New interaction is reciprocal route choice/NPC leadership. Do not call a renamed plankton-then-worm list a new adventure. Leadership is authored agency, not a demonstrated species-specific trait.

**Hooks/state/art/audio:** Extend `companion-activity.js`/`social-motion.js` with leader, stop and return landmark; preserve hunger, `sharedMealAvailable`, ID/incarnation. `adventures.js`, narration/map expose choice. Save bounded leader enum/site reference, not duplicate NPC coordinates. Existing streamer animation suffices; restrained direction cues and reunion sound. Reuse shared-trip journal entry instead of more collectibles. M/P2.

**Acceptance/lifecycle:** Either leader works; actual mouth contact feeds; cosmetic arrows never award progress. Satiated companion can explore/rejoin without waiting for hunger. Pause freezes choices. Travel respects reef-bound relationship; stale incarnation releases leadership. Old buddy saves default to player-led legacy behavior. No giant schooling display borrowed from `H. diphreutes`, parental rescue, or adult cleaner conversion.

**Conditional age-specific alternative — A brief helping stop:** Introduce a verified juvenile bannerfish and an eligible existing client, rather than shrinking the current adult sprite. Choose a close observation face or leave space; witness the juvenile approach a real skin contact and depart independently. Dedicated juvenile proportions, a finite parasite/contact target and two actor references are new scope. The cited compilation supports occasional cleaning; client response and approach choreography are authored. Contact must remove only an existing care target, pause/offscreen must freeze, and satiation/missing clients must never force waiting. No client queue, guaranteed cure or juvenile spawning. M–L/conditional; find and review the cited original observation before making this a playable care flagship.

## Cross-cutting checks and source limits

Review via real pointer movement/click, E/context button, Esc/P, save/export/import, and travel. Check depleted targets, cancellation, hunger, incarnation changes, boundary geometry, no repeated journal awards, no paused/offscreen progression. Keep physics in simulation coordinates: `displayedMouthPoint` is presentation geometry, explicitly excluded from physics by its module. Meaningful scenario checks should cover stateful behavior, not merely repeat data rows. Every decision must be readable without audio.

Follow-up verified the author-hosted Forcipiger sound paper, 2024 Springer cryptofauna article, USGS bannerfish compilation, Australian Museum identity account, current companion admission, and Colin's publisher abstract. Some publisher/institution opens failed despite indexed text; alternate primary copies are linked. Paśko and Colin spawning detail remain explicitly abstract-level evidence. USGS/FishBase cleaning statements are compilations, not newly inspected primary cleaning experiments. The distinct signal/handling/reproductive/juvenile cards above are conditional proposals; none changes current game behavior.

The delivery order is **s6 mouth/body access → s29 cave clearance/arrivals → s10 moving microfauna/substrate choice → s56 reciprocal leadership**. The last improves existing play rather than requiring a new badge. Additional sound, captive handling, spawning and juvenile-care branches only proceed when their actor/art/environment gates are met. No species is upgraded to tool use, breeding or professional cleaning merely because another family member does it.
