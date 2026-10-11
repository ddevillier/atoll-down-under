# Schools and living lights: species adventure research

Research-only refresh, **10 October 2026**. Assigned roster: **s0 Silver sprat**, **s42 Yellowtail fusilier**, **s53 Flashlight fish**. This pass changes only this report and preserves existing art/runtime. Cards below are proposals or reviews of a local draft, not implementation or playtest claims.

## Current code and ranking

Inspected `data.js`, `natural-history.js`, `adventures.js`, `school-activity.js`, `social-motion.js`, `simulation.js`, `escort-journeys.js`, `ability-rules.js`, `reef-stories.js`, `reef-story-data.js`, `render.js`, `save-files.js`, and the local `lantern-company.js` / `lantern-company-render.js` draft and art provenance.

| ID / scientific scope | Existing baseline | Distinct candidate / status |
|---|---|---|
| **s0 — Spratelloides gracilis** | `sprat-feeding-wave`: plankton meal near two conspecifics, actual neighbor meal, then three seconds rejoined. Day-active; no ability. | **P1 / M–L: substrate-contact spawning**, proposal. Needs an explicit mature egg-laying role and eligible substrate geometry. |
| **s42 — Caesio cuning** | `school-life`: ten seconds beside three companions, meal, five seconds rejoined. Shared plankton machinery also includes s42. Day-active; dash. | **P2 / L: mixed fusilier association**, deferred. Documented partner taxa are absent. |
| **s53 — Anomalopidae, family-level catalog identity** | `flashlight-night-excursion`: E selects an existing neighbor, three seconds following, Space flash, plankton excursion, E reunion. Night-active; defense/food attraction already exist. | **P0 / M: Lantern Company**, review the local named-*Anomalops katoptron* draft. Separate case-study art exists; this does not identify the ordinary family sprite. |

Priorities are relative to these IDs. P0 means research/acceptance review, not authorization to build. At inspection, Lantern Company metadata and natural-history copy existed, but `reef-stories.js` still listed only the five original modules, and `render.js` / `simulation.js` had no lantern integration. Dedicated code, assets and tests do **not** establish an accessible, saved, playable story.

Same-species alignment, separation and real shared meals already exist. NPC feeding waves invite at most two available neighbors after genuine consumption; the ordinary school path considers up to six neighbors. Another “school, eat, return” card duplicates those systems.

## s0 — A silver trace on the seabed

**Source → behavior.** Penghu underwater observations recorded rapid bottom passes, individually or in groups of two to four, with mature females contacting substrate during egg deposition. Attached egg samples on sand and red/brown algae were genetically identified as *S. gracilis*. The spawning aggregation was not an orderly school. Regional timing differs; Taiwan's calendar is not an Australian rule. [Cheng et al. 2023, sections 3.4–4](https://www.frontiersin.org/journals/marine-science/articles/10.3389/fmars.2023.1217897/full). A five-year Papua New Guinea study found spawning in most months, further caution against a universal season. [Dalzell 1985, primary abstract](https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1095-8649.1985.tb04023.x).

**Choice → actual consequence.** Enter an explicitly labeled **mature egg-laying adult / Penghu case study**. Compare sand and macroalgae-on-gravel patches, choose one, steer a close pass, and press E at physical contact. Swim away, turn back, and inspect the small attachment on that exact surface. The world consequence is deposited eggs, without guaranteed fertilization or hatchlings. Existing sprats may make independent nearby passes; no monogamous mate or quest fish is supplied.

**Four beats:** inspect substrates → choose and approach → deposit at contact → return and inspect the persistent trace. No meal, incubation countdown, nest construction, egg guarding or school-follow timer.

**Files / art / bounded state.** A future `sprat-spawning.js` would use story lifecycle and actual pointer/context/body-contact geometry in `reef-stories.js`, `simulation.js` and `geometry.js`. Add typed substrate descriptors to habitat data; food and shelter sites are not automatically spawning surfaces. Preserve current fish/reef paintings. Supporting needs: one additive small egg decal, contact-band geometry and a close-pass pose. Store version, species/role, reef/site, phase, finite contact segment and one committed attachment flag; cap inspected surfaces at two and optional NPC identities at two.

**Persistence / acceptance.** Old saves default inactive. Validate role, substrate, geometry and deposition-before-completion. Pause freezes contact; offscreen time never deposits, fertilizes or hatches. Preserve one committed trace across travel/reload without multiplying it. Future real-controls checks: distant E and swimming above the band leave no eggs; one contact action leaves one trace; return inspection completes without eating. Verify Escape, save/reload after deposition, M travel, species changes and replay. **M–L / P1:** substrate and reproductive-role representation are the dependencies.

## s53 — A conversation in the dark

**Source → behavior.** Field imaging/modeling links *A. katoptron* light to nighttime alignment and school turns initiated by a minority; dark individuals can remain in the group. [Gruber et al. 2019](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0219852). Laboratory/field work links organ occlusion patterns to nearest-neighbor distance. Bacteria emit continuously; rotation exposes the pigmented back and hides the luminous face. [Jägers et al. 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC7979757/).

Newer primary findings refine the interpretation:

- **2024:** the largest individual direction changes occurred around organ occlusion, with straighter movement before exposure resumed. This correlation does not mean hiding commands the school to turn. [Jägers, Frischmuth & Herlitze 2024](https://link.springer.com/article/10.1186/s12862-024-02283-6).
- **2025:** 23 fish in a two-choice experiment preferred faster **artificial** light-organ frequencies; frequency was more explanatory than pulse duration. This supports experimental attraction/aggregation, not a universal friendly-blink language or a particular cave-exit ritual. [Jägers & Herlitze 2025](https://link.springer.com/article/10.1186/s12983-024-00555-x).

**Identity/art gate.** Keep ordinary s53 labeled **Anomalopidae; species not identified**. Its continuous-dorsal atlas sprite does not establish splitfin identity. The local draft explicitly names **“Anomalops katoptron case study”** and already has separate charcoal-body, split-dorsal, large-eye/subocular-organ art in `assets/story-lantern/`. Preserve these assets and their [provenance](../../assets/story-lantern/PROVENANCE.md). Never use the family sprite as species proof or generalize organ rotation across anomalopids. The [Australian Museum named species entry](https://australian.museum/learn/animals/fishes/twofin-flashlightfish-anomalops-katoptronem/) provides authoritative identity context.

**Choice → actual consequence.** Meet two available existing neighbors, choose above or below a sight-blocking outcrop, then steer while showing/hiding the organ with E. If sight is lost, circle back or regain contact on the open side. A real participant incrementally reorients after valid light observation; no teleport or appetite/health mutation. A possible refinement of the **same** card is hide → turn → reveal on the new course, inspired by 2024. The 2025 evidence strengthens the explanation but does not justify a rhythm score, faster-blink button, duplicate reunion quest or unsupported cave-transition sequence.

**Four beats:** inspect existing lights → choose a bend → recover visible contact and observe a heading response → cross with the same responding neighbor and leave freely. No required plankton meal.

**Draft files / art / bounded state.** `lantern-company.js` authors reef 8, a radius-94 outcrop at (800,360), two four-point bends, sight checks, at most three id/incarnation participants, travel/gate evidence and recorded contact/heading response. The range, slow light cycle and route are game abstractions. `lantern-company-render.js` consumes dedicated art and organ exposure; reduced motion uses a stable outline. Pending integration concerns: story registration/lifecycle, player/NPC precedence, E/pointer dispatch, renderer loading/drawing, journal persistence and save validation. Submitted route/light actions must never count as observed NPC responses. Space remains the separate defensive ability.

**Persistence / acceptance.** The draft resets unfinished encounters after restore, travel interruption or participant invalidation; evidence does not silently transfer to another fish. Confirm this intended policy through real UI and saved dives. Test hidden/exposed organ, blocked/open sight, actual incremental NPC turns and player-plus-same-neighbor displacement. Waiting, E alone, Space or eating must not complete. Pause freezes state; leaving/reentry requires fresh contact; missing/busy neighbors produce an honest hint without spawning fish. Inspect ordinary s53 outside the case study and reduced-motion readability. **M / P0 review:** draft code and renderer unit checks are not integrated-play acceptance.

## s42 — A place among yellow tails, conditional

**Source → behavior.** FAO specifically records *C. cuning* sometimes associating with *C. xanthonota* and *C. teres*. Juvenile *C. cuning* also associates with yellow-tailed juvenile *C. lunaris*; the latter adult association differs. The full-moon spawning examples concern *C. teres* and *Pterocaesio digramma*, not *C. cuning*. [Carpenter, FAO Fusilier Fishes of the World, printed p. 6](https://www.fao.org/4/t0046e/T0046E02.pdf).

**Gate → choice → actual consequence.** All named partner taxa are absent from the 64-species roster: **defer**. After a separately approved ecological expansion adds a persistent compatible species, inspect a mixed group, choose an open flank, leave spacing and cross a bend beside both independently moving taxa. The NPC change is compatible cross-species alignment, with separation and feeding/cleaning/avoidance precedence retained. Anthias, basslets and silver sprats cannot substitute for documented fusilier partners.

**Files / art / bounded state.** Future work needs verified partner identity/art, `data.js` population/diet/activity entries, `natural-history.js`, and a narrow compatibility table in the social path. Preserve current s42/reef art. Store one reef/bend, at most four id/incarnation/taxon tuples and verified mixed-turn evidence; do not automatically fabricate population. Generic nocturnal color/shelter descriptions support ambience at most, not a species-specific new adventure.

**Acceptance after the gate is met.** Enter through actual UI, identify both taxa, choose a flank and watch alignment while crossing. Same-species company alone, idle time, dash or eating cannot finish. Verify pause, reload, travel, participant replacement and an honest no-partner state. **L / P2:** roster/ecology expansion is the dependency.

## Shared acceptance limits

Discovery requires an authored choice plus a changed surface or actual actor response. Controls are pointer steering, E/context, Space ability, Escape/P pause and M map; click-to-food needs explicit routing for new non-food targets. No remote world mutation, synthetic consumption, mandatory danger, unbounded history, borrowed species-specific behavior or invented universal calendar.

This research refresh ran no runtime tests and changed no runtime/art files. Acceptance above is future work. Final ranking: **s53 P0 audit the existing named draft; s0 P1 strongest new reproductive card; s42 P2 defer until documented partner taxa exist.**
