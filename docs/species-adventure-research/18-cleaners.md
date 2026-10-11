# Cleaners: species adventure research

Research rechecked: 2026-10-10. Assignment 18/20 covers s43 and s45 only. This document proposes future work; preserve the current game, seven new adventures, and all generated audio. No runtime changes, commits, audio generation, or original-game modifications in this research pass.

## Existing behavior and scope

Inspected `src/data.js`, assigned records in `src/natural-history.js`, `src/adventures.js`, `src/player-cleaner.js`, `src/cleaner-motion.js`, `src/reef-clinic.js`, and story/input integration in `src/reef-stories.js` and `src/main.js`.

| ID / exact identity | Current playable loop | Existing scope that must not be sold as new | Verdict |
| --- | --- | --- | --- |
| s43 Bluestreak cleaner wrasse, *Labroides dimidiatus* | Daytime reef cleaner; parasite diet; `reef-helper` / “A helping fin”: click needy fish, help three species. | Contact-based treatment already approaches real clients, sweeps three inspection areas, restores only parasite damage, and earns nourishment. Reef Clinic in Coral Cathedral already has individually remembered nervous/bold clients, gentle approaches, actual care, and a return visit. | **P1 / M: Who Can See the Help?** A spatial audience encounter, with visible observer decisions. |
| s45 Banded coral shrimp, *Stenopus hispidus* | Nighttime reef cleaner; parasite/detritus diet; `night-helper` / “Helping after dark”: same three-species count. | Reef Clinic in Quiet Grotto already offers the same relationship loop. The journal describes ledges, pairs, eggs and larvae but explicitly says pairing and reproduction are not simulated. | **P2 / M: Two at the Door**, conditional on a real established mate within an explicit population budget. **P2 / M–L: The Ledge Beneath the Client**, deferred until genuine environmental parasite-stage quantities exist. |

The shipped `player-cleaner.js` service is the sole authority for client treatment: it advances only once the cleaner reaches its contact position and stops after approximately three seconds. Keep that authority. Neither a story button nor an animation may grant remote healing, repair poison/bite damage, or fabricate successful appointments.

**Final local rank:** (1) s43 observer choice, (2) s45 established-mate recognition, (3) s45 substrate foraging after its ecology prerequisite. Do not add parasites, forced hunger, injuries, mandatory cheating, or artificial cures to make any encounter happen. When no eligible animal or world target exists, let the player explore; an adventure request is not permission to manufacture illness.

## Evidence and limits

### s43: social observation adds a new decision; reassurance alone does not

- **Positive observer choice without cheating:** Bshary and Grutter (2006) found clients spending more time near observed cooperative cleaners than cleaners of unknown cooperation, and trained cleaners adjusted feeding under an experimental image-scoring arrangement. This provides the better basis for the friendly encounter below: observer approach can occur without requiring mucus stealing or client punishment. The abstract was accessible through the publisher's search result; full methods were not obtained. [Primary publisher paper](https://www.nature.com/articles/nature04755).
- **Exact-species experiment:** Pinto et al. (2011) found *L. dimidiatus* more cooperative with a bystander client present; bystanders avoided cleaners after observing cheating. This supports a local observer response to a witnessed interaction. It does not demonstrate a reef-wide reputation number, gossip, a patient queue, or a duty to attend everyone. [Primary abstract, PubMed](https://pubmed.ncbi.nlm.nih.gov/21700458/).
- **Exact-species experiment, narrower context:** McAuliffe et al. (2021) manipulated opaque/transparent partitions around female cleaners, male partners and artificial food plates. Study 1 supported sensitivity to visual access; Study 2 choices reversed across blocks. The study concerns conspecific strategic feeding, not wild client demands for a particular berth. The friendly spatial puzzle is a declared design adaptation, not replication or proof of universal mind reading. [Primary full paper](https://www.nature.com/articles/s42003-021-02584-2).
- **Already substantially covered:** Bshary and Würth (2001) describe non-feeding fin contact used to influence client decisions and reconcile interactions. A separate “make nervous clients comfortable” adventure would repackage Reef Clinic. A future small fin-contact visual improvement is reasonable; it is not the new headline loop. [Primary paper record](https://pmc.ncbi.nlm.nih.gov/articles/PMC1088769/). The search-indexed abstract was available; direct opening encountered a browser check.
- **Reject for this brief:** visitor-versus-resident priority queues, hunger-induced cheating, punishment, or taking mucus to manufacture an apology. These are interesting research topics but pull the requested caring play toward penalties and waiting.

### s45: use *Stenopus* results, not interchangeable “cleaner shrimp” lore

- **Exact-species laboratory evidence:** Vaughan, Grutter and Hutson (2018) tested *S. hispidus* alongside three other shrimp species with farmed grouper *Epinephelus coioides*. *S. hispidus* reduced *Neobenedenia girellae* eggs on surfaces both day and night, and reduced that parasite on fish at night. Results differed by parasite: it did not reduce *Cryptocaryon irritans* environmental tomonts at night. This supports an egg-picking adaptation, not universal disinfection or the best performance reported for a different shrimp. The wild reef, visible enlarged egg threads, and lasting local effect below are illustrative gameplay extrapolations. [Primary full paper, James Cook University repository](https://researchonline.jcu.edu.au/55757/1/55757_Vaughan_et_al_2018.pdf).
- **Exact-species recognition:** Johnson (1977) reports that paired *S. hispidus* distinguished a previous mate from a similar-looking unfamiliar shrimp; chemical cues were the probable basis. Recognition is supported, but the accessed abstract does not establish the exact recognition gesture or a “scent trail” visualization. [Primary publisher abstract](https://www.sciencedirect.com/science/article/pii/0003347277900173). Search exposed the abstract; direct publisher opening was blocked, so detailed choreography is not claimed verified.
- **Institutional natural history:** Oregon Coast Aquarium identifies the species, ledge/crevice habitat, antennae, chelipeds and size differences. It provides a grounded setting and existing art reference, not proof of a cleaning dance or tactile stress reduction. [Aquarium species account](https://aquarium.org/animals/banded-coral-shrimp/).
- **Reject:** borrowing *Lysmata* or *Ancylomenes* rocking displays, learning rules, colour signals, touch-induced stress relief, or willingness-to-clean experiments. Likewise do not promise that shrimp are strictly nocturnal or that each large claw is a treatment tool. Use existing small-appendage picking art; reserve prominent chelipeds for body language.

## Strong card — s43: Who Can See the Help?

**Fresh player decision:** arrange a real care encounter so an interested neighbour can see it. Choose between two nearby berths with different sightlines, then choose whether to acknowledge the observer or keep the encounter small. Both are valid; only the open sightline makes a witnessed-care beat possible. No trust meter decays, no missed-client penalty, and no queue forms.

**Why it differs:** Reef Clinic concerns the treated individual and their memory of the player. This encounter concerns a third individual learning by watching, with geometry and attention visible in the reef. Do not count a normal clinic return as completion.

**Four-beat loop:**

1. A parasite-bearing client pauses near a coral spur; one curious fish is visible around its other side. A caption identifies “Watching from behind the coral.” Use E or the labelled action to preview the two berths; the player swims to select one.
2. Choose “Make room here.” The client swims into the berth under its ordinary speed limit. The observer turns toward the encounter. If the spur blocks its view, an outline/caption shows that directly, and repositioning remains possible.
3. Begin the existing contact care. The observer's attention ring fills only during treatment it can actually see. The ring is an explanatory view cue, not a reward timer; no credit while treatment is remote, paused or occluded.
4. After witnessing care, the same observer swims to the now-free edge and offers its own cleaning pose. Accept if it needs care, or choose “Leave room” and watch it settle nearby. Discovery requires the visible third-party response, not a second health bar or number of patients.

**Visible world effect:** a formerly distant observer changes orientation, route and voluntary approach because it witnessed this particular encounter. Closing a berth or swimming away simply leaves it exploring. No unseen fish gains knowledge; no species-wide reputation is updated.

**Integration hooks:** build a small optional story alongside the clinic through the story registry/dispatch, not a rewrite of clinic relationship logic. Reuse `requestPlayerService`, `serviceClient`, `canHelp`, `cleanerInspection`, and `cleaningClientBerth`. Record a witnessed service completion with the event's real client ID, plus observer identity and line-of-sight samples. Add static occluder metadata for this one coral spur rather than pretending the background bitmap already supplies collision geometry. Read-only rendering should show berth footprints, gaze direction, and understandable “view blocked” feedback.

**Bounded state/art:** one station, two berths, one client, one observer; phases `choose/approach/care/response/complete`; observed-care duration capped to service duration; flags for witness and response. Two identity records use `reef,id,species,incarnation`. Reuse fish models and treatment rigs; add one spur occluder mask, two subtle berth marks, an attention pose/caption. No audio dependency. Rough scope **M**, priority **P1**; **L** only if generalized to arbitrary reef occlusion and multiple simultaneous audiences, which is unnecessary for the first version.

**Persistence:** serialize a versioned story with finite coordinates and bounded fields. Preserve actual parasite removal on cancellation; discard uncommitted witness progress when its client changes. Pausing, focus loss, modal views, and offscreen reefs freeze story progress. Save/load re-resolves both identities and contact service. A dead/replaced/unavailable observer can be replaced explicitly without inheriting memory; never bind by species name alone. Reef departure releases appointments without erasing completed discovery. Existing clinic and legacy adventures remain compatible.

**Acceptance through real controls:** start from the ordinary species/adventure UI, move with the pointer, choose each berth through E and the accessible button, and click the real client. Demonstrate that the occluded berth cannot earn witnessed-care credit, then reposition and see the observer visibly turn/approach. Compare equal real care with and without an observing fish; health recovery must be identical. Cancel by steering away; Escape/P and blur must stop movement/progress. Reload mid-care, leave/re-enter, replace a same-species observer, and verify no false response or duplicate journal entry. Inspect actual mouth contact and draw order; a panel-only counter increase fails.

## Deferred card — s45: The Ledge Beneath the Client

**Prerequisite / P2:** the current game models accumulated parasite damage on fish, not named environmental-stage quantities. Do not implement this by spawning decorative pathogen eggs for the quest or declaring that their removal prevents infection. Proceed only when a genuine bounded environmental-stage target exists independently of this story. Otherwise keep the card in research and prefer the mate encounter.

**Fresh player decision:** inspect and choose which reachable substrate surface to pick. A nearby fish with real existing parasite need can offer optional client care in either order; no client visit is required for the substrate discovery. This removes the repeated cleaning quota and requires no induced illness.

**Four-beat loop:**

1. At an existing crevice with independently modeled parasite stages, inspect the ledge with E. An optional magnified inset reveals existing egg groups, labelled with their stage and “enlarged to show them”; the world shows subtle reachable targets. Do not create a sick client to provide a matching task.
2. Choose the client or a substrate patch. Client care uses the existing service. A substrate click sets an approach target and precise claw/mouth reach point; it does not instantly remove anything.
3. Pick the surface eggs in short contact bouts, choosing an accessible outer patch or a small inner recess. Progress appears as threads removed from the inset and surface, with an immediate effect on the bounded local egg pool.
4. Inspect the changed substrate. The discovery requires verified physical removal from the world's quantity, not a client-care flag. A separately treated fish may continue its independent route; explain only the effects actually observed. No remote cure or decorative prevention claim.

**Visible NPC/world effect:** the surface's real stage quantity changes independently of optional client care. Once stage targets exist, physical consumption can stand alone without a claimed preventive effect. Only a tested life-cycle model may reduce the treated site's future exposure contribution, which must be displayed/explained. Never silently lower all fish parasite rates or pretend decorative eggs prevented infection.

**Integration hooks:** add a dedicated bounded `environmental-parasite-eggs` target type rather than relabelling every detritus meal. Reuse feeding-contact/geometry and the shrimp picking rig, with source target validation. Reuse existing care on fish unchanged. The `night-helper` adventure can point to this optional encounter, and the natural-history limitation must say the surface stage is a laboratory-inspired illustration. The research used *E. coioides*, not a proven test of every roster fish: other client species are an explicitly generalised game setting.

**Bounded state/art:** one crevice with two validated stage-target records `id,anchor,remaining[0..3],provenance`, selected target/contact duration and verified removals; optional real client identity. No unbounded reproduction, timer pressure or epidemic. Add an inset, fine egg-thread linework, reachable picking points and substrate-specific appendage pose. Story scope **M**, missing environmental-stage authority **M–L**, priority **P2 / deferred**. Existing detritus cannot simply be renamed a pathogen.

**Persistence:** removed groups persist; no regeneration or “dirty again” clock while the player is absent. Pause freezes contact, picking and NPC progress. Save/load validates finite quantities, patch IDs and optional client incarnation. Offscreen activity is suspended and no fish is remotely healed. Cancel, species change or departure releases owned targets while preserving verified removals. Completion grants a single discovery; replay can inspect the changed site without conjuring new parasites.

**Acceptance through real controls:** select surface or client in either order with the ordinary pointer plus E/button alternatives. Clicking a distant egg patch must visibly move the shrimp, and each removed group must coincide with appendage contact. Steering away stops picking immediately; pause, blur, load and reef travel cannot finish a bout. Check front/back drawing at a ledge, legible targets at low zoom and reduced motion, and inset labels that distinguish illustration from true scale. Fish health must only rise through the incumbent treatment service. Picking eggs cannot repair bite/poison damage, affect distant fish, or earn a fake “client helped” event.

## Secondary card — s45: Two at the Door

**Verdict: P2 / M, preferred s45 follow-up after the population gate.** This adds non-cleaning conspecific domestic life, but avoid another generic “meet, eat, reunite” checklist. Recognition starts from an established bond; it is not manufactured by one button.

**Fresh choice and three beats:** (1) Return to an occupied crevice and inspect a nearby shrimp at antenna range; (2) recognise the established mate and choose the inner or outer resting nook, leaving the other available; (3) the recognised mate takes the complementary nook and both settle at their shared entrance. An unfamiliar shrimp receives space and continues exploring; no fight, mistaken-identity punishment, forced pairing, or relationship countdown.

The mate-recognition evidence is real; nook allocation and the readable antenna greeting are gentle game choreography, not a claimed observed division of labour. The visible payoff is two independently moving residents comfortably fitting one home. Do not claim the mate guards eggs, offers childcare, shares prey, cleans simultaneously, or switches sex without additional exact-species evidence.

**Hooks/state/art:** existing shelter anchors and species model, a tiny story-owned pair record with stable identity/incarnation, two nook anchors and occupied flags, and antenna-near-contact display. Because the current simulation provides one cleaner per habitat, adding a second individual is an explicit population change, not a trivial reuse: create or select a real eligible same-species resident with bounded ownership, preserve ordinary ecology, and prevent duplicate mate spawns on load. Never reassign a dead/replaced animal's identity to maintain the illusion of reunion.

**Save/control acceptance:** pause and offscreen freeze the vignette; cancelled greetings do not commit recognition; save/load retains the same actual partner. Test pointer movement and E/button inspection at antenna range, both nook choices, leaving/re-entering, replacement identity, and zero completion from remote clicks. Pairing remains optional and an existing bond is established in the encounter setup; the player does not conjure a lifelong bond with one button.

## Delivery boundary

All three cards are design proposals with source limits recorded above. Implementation should keep current care, movement, food, save and journal systems authoritative. Add targeted tests for identity, contact, cancellation, pause and recovery plus one real-control browser path per new encounter; cosmetic-only variants of existing treatment do not justify a new adventure. No runtime files were changed in this research pass.
