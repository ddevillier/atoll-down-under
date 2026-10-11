# Paired browsers: species research and optional adventures

Research reviewed 10 October 2026. Scope: **s8 Foxface rabbitfish**, **s48 Orange-spotted filefish**, **s52 Pencilled rabbitfish**. This revision changes only this report and preserves existing/draft gameplay. Inspected draft modules do not establish completed integration or production acceptance.

## Recommendation

Preserve and finish the existing draft **rabbitfish watch exchange** (M, P1), shared by the two correctly identified rabbitfish species. Next prioritize a **filefish coral-scent mystery** (L, P1) after its coral/observer gates. A new **polyp-access choice** (M–L, P2) is a smaller distinct alternative. Keep doliatus group routes and filefish branch rest as later options. Preserve companion journeys and discoveries. No proposal needs death, score targets, repeated meal quotas, forced digestive waiting or a calendar delay.

| Rank | Assigned IDs | Card | Distinct decision and consequence |
| --- | --- | --- | --- |
| 1 | s8, s52 | [A. Your turn to look](#card-a--your-turn-to-look-s8-and-s52) | Directed attention and a real passer click select hold/move, physical relocation and exchanged roles. |
| 2 | s48 | [B. The invisible clue](#card-b--the-invisible-clue-s48) | Choose diet and shelter independently; live investigation changes with the scent/background match. |
| 3 | s48 | [D. The easier polyp](#card-d--the-easier-polyp-s48) | Inspect branch faces and choose a snout approach; real branch geometry changes access. |
| 4 | s52 | [C. Where do the pairs go?](#card-c--where-do-the-pairs-go-s52-later-option) | Choose a lane and stop; intact pairs use the space left clear and return as the same individuals. |
| 5 | s48 | [E. A branch for the night](#card-e--a-branch-for-the-night-s48) | Choose a free body/spine socket, physically anchor and release immediately. |

## Current implementation inspected

- `src/data.js`: all three are playable daytime reef species with the generic spines ability. s8/s52 eat algae/grass; s48 accepts coral/algae.
- `src/natural-history.js`: s8 = *Siganus vulpinus*, s48 = *Oxymonacanthus longirostris*, s52 = *Siganus doliatus*. Current rabbitfish wording distinguishes authored role exchange from lifelong bonds, moral fairness and decoded signals. The s52 art update still needs authoritative identification review.
- `src/adventures.js:34–36`: “Room for two,” “A browsing companion,” and “A shared feeding trip” already ask players to invite a conspecific, have both feed, and regroup. Renaming this sequence is not a new adventure.
- `src/companion-activity.js`: invitation within 280 units; buddy = reef + entity ID + incarnation; real food contact credits meals; NPC makes feeding excursions; reunion needs both meals and three calm nearby seconds. Separation beyond 650 units pauses the association; return can reunite. Cleaner visits, satiation, and availability have their own instructions. Current invitation can displace an NPC's existing partner: a caring new story should prefer an unpaired eligible NPC and should not silently dissolve another pair.
- `src/ecology.js` and `src/animal-profiles.js`: ordinary pair following, spacing, slowing and waiting already exist. Those routines alone are not lookout-role exchange.
- Draft `src/rabbitfish-lookout.js` and its renderer already add reef-0 nook choice, anchored aim, a real passer click (`cueClicked`), hold/move/missed responses, actual relocation, committed NPC meal contact, and physical lookout arrival before the player's bite. Preserve this work; another identical exchange is not new gameplay. Upright watchers must not displace grazing mouth geometry.
- The registry now lists draft lookout work. Verify story/input/NPC meal/render/journal/restore dispatch together before calling it shipped. NPC meal callbacks must identify the actor. Artist already uses visual background/pattern choice and an observer; filefish should not merely reskin it.
- Draft `src/adventure-admission.js` separates fresh initial-slot reservation from read-only admission. Begin/import must preserve living actors, appetite and bonds. Population/admission/old-save acceptance remain gates.
- `src/main.js:361–377`: mouse move steers; click requests eating; E is contextual; pause/inspect and blur pause exist. A new “watch” mode must deliberately route mouse aim before general steering. `watch-journeys.js` provides an aiming precedent, but its hunt logic is unsuitable for peaceful sentry play.
- `src/simulation.js`, `src/save-files.js`, `src/journal.js`, `src/reef-memories.js`: serialized adventure/story state, strict validators, paused restoration, one-time discoveries, and bounded familiarity memories already exist. A journal memory alone is not a permanent badge: extend approved discovery/badge IDs and validation explicitly.
- `src/feeding-sites.js`: coral is currently generic food, without genus or branch sockets. `simulation.js` selects day/night at species start; no automatic dusk cycle is available. Proposed scent and sleeping scenes require authored support.
- `src/risk-cues.js`: entering reef life can remove initial protection. Practice still contains ordinary predator/damage systems. These peaceful stories must have an explicit non-harmful encounter policy; simply calling them “Practice” is insufficient.

## Taxonomy, evidence, and verdicts

### s8 — Foxface rabbitfish

**Identity:** *Siganus vulpinus*, family Siganidae. Australian Museum confirms the black face/breast markings, yellow posterior body, western Pacific distribution, juvenile schooling and later pairing; its lifelong-pair wording is qualified as a belief. Venom-bearing fin spines are defensive anatomy, not a timed force field. [Australian Museum species account](https://australian.museum/learn/animals/fishes/foxface-siganus-vulpinus/)

**Evidence:** Directly included in the rabbitfish study below, so using paired vigilance here is not a transfer from another species. Do not promise a significant extra crevice-depth benefit for foxface. Its current generic grazing menu is an abstraction; the study describes a cyanobacteria-rich diet in this setting.

**Current scope:** Established algae/grass grazing, spine defense, ordinary NPC pairing and companion meal/reunion; the draft lookout adds role exchange, directed attention and response choice. Verify integrated acceptance before promoting it as complete.

**Verdict:** Strong candidate for Card A. Retain its existing shared-trip discovery. No separate “loyal mate for life” challenge or reward for brandishing venom.

### s52 — Pencilled rabbitfish

**Identity:** *Siganus doliatus*, family Siganidae; “Bluelined” and “Pencil-streaked” rabbitfish are documented names. Fine blue lines, two diagonal head-area bands and yellow dorsal/tail fins are useful art checks. Herbivory and occurrence in pairs or schools fit the present broad menu/social role. [Fishes of Australia](https://fishesofaustralia.net.au/home/species/1049)

**Evidence:** Directly included in the vigilance study. A separate telemetry study tracked eight paired adults, **one individual per pair**, and found coordinated monthly departures and returns. It did not continuously track both partners, and spawning aggregation was inferred from timing/direction rather than directly witnessed. This supports an optional shared-route mystery, not a claim that all pairs always migrate together or that the player knows their mating arrangements. [Fox, Bellwood & Jennions 2015, full paper](https://researchonline.jcu.edu.au/44317/1/44317%20Fox%20et%20al%202015.pdf)

**Current scope:** Established feed/regroup mechanic and shared draft lookout exchange. No migration/community-route experience is established by the inspected modules.

**Verdict:** Strong Card A eligibility; Card C offers greater species differentiation at higher cost. Resolve sprite identification before biology-heavy art promotion. Do not build a second identical companion loop.

**Pairing boundary:** A primary *doliatus* study found stable pairs including same-sex pairs and overlapping home ranges. A companion is not automatically a mating partner, and a home route is not necessarily defended marital territory. [Brandl & Bellwood 2013, primary abstract](https://onlinelibrary.wiley.com/doi/abs/10.1111/jfb.12131)

### Shared rabbitfish evidence boundary

Brandl & Bellwood observed 59 pairs around Lizard Island: *S. corallinus*, *S. doliatus*, *S. puellus*, and *S. vulpinus*. All four showed coordinated feeding/lookout postures and frequent role alternation. This is field observational evidence consistent with reciprocity, not an experimental demonstration of deliberate repayment or moral fairness. Paired *vulpinus* had longer vigilance bouts than solitary fish; the corresponding *doliatus* comparison was not significant (P=.09). Deeper crevice penetration was significant for *doliatus*, but not *vulpinus* (P=.084). Fin flicks are a possible coordination cue, not a decoded language. [Brandl & Bellwood 2015, methods and results](https://www.nature.com/articles/srep14556)

### s48 — Orange-spotted filefish

**Identity:** *Oxymonacanthus longirostris*, family Monacanthidae; also Harlequin Filefish. Museum account supports coral-rich habitat, pairing, and coral-polyp specialization. Algae acceptance is a game concession, not its natural menu. Usually associated with *Acropora*, but documented *Pocillopora* feeding means “can only ever eat Acropora” is too absolute. Do not conflate it with Red Sea *O. halli*. [Fishes of Australia](https://fishesofaustralia.net.au/home/species/812)

**Evidence:** Coral-associated crab olfactory choices and predatory cod trials support diet-dependent chemical crypsis. Matching coral diet/background reduced cod attraction; this is neither immunity nor conscious camouflage planning or a proven one-bite transformation. [Brooker et al. primary abstract](https://pubmed.ncbi.nlm.nih.gov/25621328/)

**Verified methods:** The author's chapter 4 identifies exclusive *Acropora spathulata* and *Pocillopora damicornis* diets, initiated three days before trials and maintained over four weeks. Cod are identified only as **Cephalopholis spp.**, with no exact *C. miniata* confirmation. Existing s16 requires explicit dramatized genus-level proxy wording unless primary exact-species identification is obtained. A story meal must openly compress dietary history. [Author thesis, chapter 4 methods](https://researchonline.jcu.edu.au/40623/1/40623-brooker-2014-thesis.pdf)

**Additional behavior:** A primary within-colony experiment found selective branch feeding and demonstrated that varying polyp access changed feeding location. This supports an inspection/approach choice rather than “always bite the middle.” [Brooker, Jones & Munday 2013, primary abstract and figures](https://pubmed.ncbi.nlm.nih.gov/24324862/)

Sleeping/locking is supported for this species: the author's thesis, printed pp.58–59/PDF p.75, describes dorsal-spine anchorage among branching coral at dusk. The 2011 primary note discusses branch masquerade; its publisher full text was access-restricted, so exact head-down/fin-fold choreography needs a full primary figure check before production. Do not borrow teeth-anchorage from a different filefish. [Primary note and institutional abstract](https://researchonline.jcu.edu.au/19591/)

**Current scope:** Generic coral/algae meals, spines ability, companion feeding/reunion. Guide describes scent concealment and says it is not simulated. Neither branch anchorage nor meal-dependent scent identity exists.

**Verdict:** Strongest distinct mystery in this assignment: Card B. Keep scent and physical branch resemblance conceptually separate. No coral-restoration quest that implies polyp eating is intrinsically harmful or that one fish repairs bleaching.

## Implementation cards

All numbers below are proposed play tuning, not measured zoology.

### Card A — “Your turn to look” (s8 and s52)

**Hook:** Your companion keeps tilting upward between bites. Discover what changes when you take that place.

**Source → choice → real consequence:** Observed role alternation supports directed attention and an authored hold/move signal. Actual relocation, committed feeding and lookout arrival provide the consequence; no moral repayment or translated fin-flick meaning is claimed.

1. Approach an eligible familiar conspecific and choose “Watch together.” Select one of two nearby grazing nooks with the mouse; an illustrated sightline shows which view is open.
2. Take the lookout position with E. Mouse movement now turns attention within the view, without dragging the fish away. A harmless passing school enters one side; click its visible movement to choose “hold” or “move over.”
3. The NPC visibly responds: it continues its actual meal in the calm nook, or rises and relocates with you. Missing the cue produces a gentle reposition, never harm or lost earned progress.
4. After the NPC's committed bite, it rises to watch. Click reachable food and physically approach for your turn. The completed exchange grants “A Thoughtful Lookout,” then free exploration resumes.

**Player/NPC roles:** Player chooses lookout and a response; NPC has a feeding action, reacts to the signal, then occupies the former lookout. Do not require an exact equal number of bites or portray grudges for leaving.

**Files:** Preserve the draft `rabbitfish-lookout.js`/renderer and integrate through the registry/story dispatcher, actor-aware NPC committed-meal callbacks, aim routing before normal steering, rendering, journal IDs and restore validation. Eligibility must preserve existing buddy journeys and NPC bonds rather than reuse the generic invitation's pair-displacement side effect.

**Bounded state:** Version, reef, one buddy reference, one of two site IDs, enum phase/role, one passer reference with capped route counter, bounded aim, cue-click/response flags, player/NPC real meal booleans, capped 0–3 second settle, logged boolean. No expanding favor ledger.

**Animation/sound:** Readable upright lookout, grounded grazing contact, small attention turn and matched swimming departure. Keep the grazing mouth aligned with authoritative meal geometry. Soft existing water/fin sound and restrained completion tone; no alarm or invented speech. Reduced-motion option keeps role icons and essential poses.

**Lifecycle:** Adopt the shared identity/save/pause rules below. Any NPC cleaning/hunger/rest conflict yields a readable wait/explore state. Switching story species resets only the active encounter, not discovery ownership.

**Acceptance:** Drive real pointer/E/click input; remote clicking a nook cannot settle; a clicked food icon cannot credit a meal before contact; both-lookout has no food progress; correct NPC role change must be visible; pause/save midway cannot advance either turn. Show a completion screenshot plus an input-driven recording of the actual exchange.

**Effort/priority/risks:** M/P1. Core new work is true role arbitration and aim-mode input. Greatest risks are blocking normal steering, automatically stealing an existing pair, and dressing up passive waiting as reciprocity. Story signals are a play abstraction, not translated fish language.

### Card B — “The invisible clue” (s48)

**Hook:** Two fish can look equally well hidden, yet an investigating visitor chooses only one branch. The clue begins with a meal.

**Source → choice → real consequence:** Diet/background odor comparisons support independent coral meal and shelter decisions. A physically arriving visitor investigates the mismatch more. Comparable visual cover distinguishes this from Artist; scent is not an equipable invisibility power.

1. Watch a familiar filefish feed at a clearly identified coral patch. Two shelter branches have similar visual cover but different labeled coral identities. Mouse hover reveals a simple scent-symbol overlay only when requested.
2. Choose a coral meal and swim into actual feeding contact. A single completed meal stands for a longer diet history; the guide says this explicitly. Algae does not set the story's coral-scent evidence.
3. Choose a shelter branch. Your companion chooses the other free socket; moving your selection changes where the companion settles. Both remain visible through subtle fin breathing rather than disappearing sprites.
4. A non-attacking visitor physically approaches along the scene's short route. Matching diet/background changes its investigation: it continues past a match, or pauses/turns near a mismatch. The companion mirrors neither outcome automatically nor the player's scent; its observed diet controls its result.
5. Let the player infer the difference, then choose a matching branch and witness the resulting pass. Earn “An Invisible Clue” once. An optional “Watch the resting pose” vignette demonstrates branch anchorage and can be left immediately.

**Player/NPC roles:** Player chooses diet and shelter; same-identity companion provides a visible comparison and occupies the alternate resting place. Visitor makes an observable decision. This differs from Artist's color-pattern selection: the hidden variable is prior feeding, and a second fish can reveal the hypothesis without a wrong-answer penalty.

**Files/data:** New s48 module/render layer; named coral metadata tied to validated art, real socket geometry, actor-aware meal hooks and a non-attacking investigation route; existing input, save, journal and guide dispatch. Keep generic food compatible with old saves. Existing s16 *Cephalopholis miniata* is a candidate proxy rather than an automatic new-species dependency; its exact study match is not verified.

**Resolved observer gate:** Accessible author methods identify only *Cephalopholis* spp.; s16's exact experimental match remains unverified. Use explicitly dramatized-proxy wording or separately scope verified observer identity/art/initial slots. The experiment's coral-obligate crabs also require exact identities; existing decorator-crab art cannot silently substitute. Neither a guessed coral genus on an old painting nor a generic observer proves the biological comparison.

**Bounded state:** Two coral types/sites, two actor diet enums, player and companion sockets, one identity reference each for companion/visitor, enum phase, capped route progress, witnessed outcome flags (maximum two), one badge flag. No scent decay grind or global chemical simulation.

**Animation/sound:** Reveal scent with optional symbol-plus-color wisps; patterns distinguish it without color vision. Small visitor turn and resumed cruising communicate the consequence. Dorsal-spine/branch contact uses verified art; no venom burst. Quiet existing ambience, one soft discovery cue.

**Lifecycle:** Shared rules below. Optional dusk is a clearly framed local vignette; do not repopulate the world or silently change the saved day/night period. No waiting until real evening. On leaving a branch the player immediately regains mouse steering; occupied NPC sockets cannot be overwritten.

**Acceptance:** Wrong shelter remains safe and visibly yields the intended observation. No outcome before visitor reaches the encounter zone; no credit from algae or distant clicks; changing shelter updates NPC socket occupancy; pause, reload, unavailable visitor, and reef departure cannot fabricate a pass. Show the two outcomes from actual inputs, not by assigning success flags.

**Effort/priority/risks:** L/P1, or M/P2 if narrowed to sleeping/branch selection only. Requires new coral identity presentation and verified observer choice. Risks: teaching instant chemistry, claiming total invisibility, overlapping Artist, and attaching fish to painted scenery without real geometry.

### Card C — “Where do the pairs go?” (s52, later option)

**Hook:** Several familiar pairs turn the same way. Follow the movement, choose where to observe, and find familiar individuals at home again.

**Source → choice → real consequence:** Telemetry supports coordinated movement and return. Lane/yield and observation-stop decisions cause actual pair passage and same-identity homecoming. The compressed route is authored; it does not represent directly witnessed spawning.

1. Notice two existing local pairs orient toward the same passage. Choose “Join the route” or keep exploring; the prompt is always optional.
2. Mouse-steer beside your familiar companion. At a narrow passage choose to yield or use the wider lane; the other pair visibly moves through the space you leave.
3. Choose a scenic observation stop. The companion waits beside you, while the other pair continues to the gathering edge. A short illustrated note distinguishes observed movement from inferred spawning.
4. Return through either safe lane and recognize the original fish at its home site. Earn “A Familiar Way Home”; no breeding animation or multi-day absence is required.

**Files/state:** Story module + renderer, route markers through authored reef data, `ecology.js`/`simulation.js` for bounded group motion, memories/journal/save hooks. One reef scene initially; two lanes, up to three NPC references, one home site, phase, lane choice, one witnessed yielding flag, one return flag. Avoid moving an NPC between existing reef arrays for the first version.

**Animation/sound:** Parallel swimming, a partner's glance back, and clear gap opening when yielding; gentle route motif using existing assets. No crowd crush, timers, or failure barks.

**Lifecycle/acceptance:** Shared rules below; actors genuinely traverse gates in order and homecoming resolves the same identity. Far-edge clicking cannot jump stages. Pausing or leaving cannot advance a procession, spawn replacement “friends,” or earn return credit. Missing pair means “Explore; this group is away,” not auto-completion.

**Effort/priority/risks:** L/P2. The compressed route and cooperative yielding are authored storytelling, not study findings. Restrict claim to coordinated movements; the tracking paper did not establish every pair member's simultaneous route. Do not transfer this particular migration claim to foxface.

### Card D — “The easier polyp” (s48)

**Source → choice → real consequence:** [Primary branch-access experiments](https://pubmed.ncbi.nlm.nih.gov/24324862/) support inspecting exposed versus protected polyps. Hover to inspect two faces of one identified colony, choose a snout approach and physically swim through the available corridor. Exposed access permits committed contact; a guarded face requires a visible change of approach. A real filefish neighbor demonstrates an alternate reachable face. Do not teach that the branch middle is invariably best or that coral eating repairs coral.

**Code/art/bounded state:** Real branch/meal geometry with two allowed access faces, normal anatomical bite callbacks and continuous NPC approach. Persist colony/face enum, phase, one neighbor reference, one witnessed access result and badge. Distinguish skeleton, polyp and snout contact in art. Figure-level geometry support is a gate; tuning is not a measured biological reach limit. M–L/P2, a smaller alternative when B's coral/observer requirements are not ready.

**Acceptance:** A hidden accessibility flag cannot reject a visibly touching mouth. Both approaches remain cancellable and physically legible. Obstruction changes route rather than adding a countdown. Remote choice and offscreen waiting grant neither contact nor observation; completion follows a real access choice and bite rather than a meal quota.

### Card E — “A branch for the night” (s48)

**Source → choice → real consequence:** Dorsal-spine anchorage and [suggested branch masquerade](https://researchonline.jcu.edu.au/19591/) support a reversible fitting vignette. Compare two free sockets, swim into the chosen fit and press E to bracket the branch with the spine. Actual body/spine alignment determines whether it settles. E/open-water click releases immediately; an existing filefish may use the other socket. Physical resemblance stays separate from chemical crypsis.

**Code/art/bounded state:** Two socket geometries, real body/spine contact, one optional neighbor reference, selected socket, phase, capped settle and badge. Obtain the full primary figure or another exact-species authoritative reference before promoting precise joint choreography. Frame local dusk without changing the saved world period. M/P2 with an art gate.

**Acceptance:** Remote clicks cannot anchor; a wrong fit gives visible safe repositioning; occupied sockets remain occupied. The spine must contact the branch and release must restore swimming immediately. No teleport, teeth anchorage, full invisibility, forced night cycle or wait-only completion.

## Shared implementation and acceptance rules

**Admission is a prerequisite.** Reserve suitable initial slots inside the existing adult population budget before ordinary pairing; never append adults, break bonds, reset appetite at invitation or repopulate an import. Read-only Begin admission checks reachable habitat, identity, care/committed-food ownership, real food and passer/visitor. An unpaired candidate must have no incoming partner reference as well as no outgoing bond. Prove timely real feeding from normal initialized physiology/site tuning; compulsory digestion is not a meaningful choice.

Earlier read-only review found no unpaired conspecific anywhere for foxface seeds **9, 11, 26, 28, 33** and pencilled rabbitfish seed **1**. Include them in allocation/admission checks. Preserve old saves; if prerequisites are absent everywhere reachable, explain the actual missing condition and offer a clearly labeled fresh adventure dive through existing save/export flows. Endless searching cannot repair a world with no eligible actor.

1. **Identity:** Every animal reference is reef + ID + incarnation + species. Never silently substitute a respawn. Missing actors suspend that encounter with an explicit restart choice; prior badges remain.
2. **Input/contact:** Movement stays responsive and cancellable. Special aiming is visibly signposted and exited by E/open-water click. All meals use existing committed contact, and NPC consequences require actual motion through the scene.
3. **Save:** Version and strictly validate finite counters, enums, site allowlists, reference counts, and outcome combinations. Default missing story fields for legacy dives. Earn once through persistent journal discovery/badge IDs; never revoke on restart.
4. **Pause/offscreen:** Freeze encounter clocks on pause, blur, menus, reef departure, or inactive story; restore paused. Reset transient aim and reacquire missing participants only with a new encounter, not hidden progress. Never use wall-clock catch-up.
5. **Peace/care:** Keep story participants safe and useful without silently disabling all unrelated ecology. A mistaken choice should yield a readable neutral consequence, another viewpoint, or a safe retry. Allow cleaner visits and ordinary exploration. Do not drain care meters to make someone comply or consume scarce rewards.
6. **Verification:** Input-driven acceptance should prove both branch outcomes, real food contact, NPC causality, cancellation, paused restoration, stale identity handling, and badge deduplication. Research does not itself claim these changes have been implemented or tested.

## Source access notes

Reviewed museum pages, the Scientific Reports full paper, pair-formation primary abstract, JCU thesis methods, polyp-access primary abstract/figures, JCU 2011 repository extract and 2015 telemetry paper. PMC's direct chemical-paper opening returned a browser challenge; Europe PMC access failed. Published abstract and accessible author methods support the narrow diet/background claim and genus-only cod gate. The 2011 note's full text remains restricted, so exact anchoring choreography needs verification before art promotion. These access distinctions are intentional.

Rejected shortcuts: loyalty/fairness scores, another both-feed-and-regroup reward, venom upgrades, calendar spawning grind, single-bite scent immunity, guessed coral identities and a coral-restoration quest. All three assigned IDs keep exact identity and existing gameplay while the ranked cards describe additional testable choices.
