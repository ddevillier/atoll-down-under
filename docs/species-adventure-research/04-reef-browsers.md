# Reef browsers: species adventure research

Research date: 10 October 2026. Scope: s4, s5, s25, s40. Research and planning only; no runtime changes.

**Second research pass, 10 October 2026:** Rechecked the live journey and story registry, reopened exact-taxon museum accounts and the 2025 jaw paper, and investigated schooling, development and cave use. The new evidence and strengthened cards below are proposals. None of the four proposed stories is registered in `src/reef-story-data.js`; no standalone implementation draft for them was found in the inspected `src/` paths. Existing journey code and prior work are preserved. `tests/integration-idol-availability.test.mjs` concerns the incumbent idol encounter, and is not evidence that Sideways Supper exists.

## Recommendation

Prioritize **The Sideways Supper** (Moorish idol, P1/M) and **The Leaf That Turned** (juvenile longfin batfish, P1/L). **Where the Water Brings Lunch** (palette surgeonfish, P2/M) supplies a better species-specific direction than another algae garden. Regal angelfish supports a small optional juvenile-observation encounter, not yet a strong standalone adventure (P3/S).

All proposed encounters are optional Practice stories. Choices change something visible in the reef; badges record one discovery rather than repeated meals. Mistakes offer another observation or approach without damage, countdowns, mandatory return trips, or progress loss. Names and friendly narration are authored fiction; mechanism claims below are separated from it.

## Existing implementation and duplication boundary

Reviewed `src/data.js`, assigned entries in `src/natural-history.js`, `src/adventures.js`, `src/foraging-journeys.js`, `src/home-journeys.js`, `src/companion-activity.js`, `src/grazing-activity.js`, `src/reef-story-data.js`, `src/reef-stories.js`, `src/disappearing-artist.js`, `src/reef-memories.js`, and input/save integration in `src/main.js`, `src/simulation.js`, `src/save-files.js`.

| Species | Current behavior | Avoid repeating |
|---|---|---|
| s4 Moorish idol | Sponge then algae at separated grounds, finish near another idol (`idol-browsing-group`). No active ability. | Two food types followed by reunion. |
| s5 Palette surgeonfish | Algae bite, another plant patch, return to recovering first patch (`surgeonfish-route`). Plankton/algae diet; timed spine defense. | Renewing garden, feed-and-return, or generic school meal. |
| s25 Regal angelfish | Sponge then algae, settle in cover (`angelfish-quiet-browse`). Timed spine defense. | Another secluded browsing circuit. Natural-history text already identifies algae as a game simplification. |
| s40 Longfin batfish | Invite a compatible mixed-species browser, algae then plankton, let neighbor eat and reunite (`batfish-loose-browsing`). | Another shared feeding tour; do not imply this broad compatibility rule is a documented species partnership. |

Existing major stories cover cleaning, cuttlefish background choice/observer response, parrotfish sand production and recovery, goatfish buried-food sharing, and cardinalfish brooding. Batfish should be a perception/habitat investigation, not a second choose-camouflage-and-test-observer story.

## Evidence and identity ledger

### s4 — Moorish idol, Zanclus cornutus

**Identity:** Exact species, family Zanclidae. Not a bannerfish. Keep the snout, dorsal streamer, and facial saddle identifiable.

**Verified:** The Australian Museum describes snout feeding on sponges and coralline algae in reef cracks and crevices; individuals may occur alone, in pairs, or in schools. [Australian Museum account](https://australian.museum/learn/animals/fishes/moorish-idol-zanclus-cornutus-linnaeus-1758/).

**New primary evidence:** Mihalitsis et al. (2025) directly filmed and anatomically examined lateral rotation of both upper and lower jaws in this species. The study used aquarium feeding trials; it does not establish cooperative food extraction, tool use, or a prescribed wild crevice-solving sequence. [PNAS article, university-hosted full text](https://fishlab.ucdavis.edu/wp-content/uploads/sites/397/2025/05/mihalitsis-et-al-lateral-jaw-motion-in-fish-expands-the-functional-repertoire-of-vertebrates-and-underpins-the-success-1.pdf), [PubMed record and DOI](https://pubmed.ncbi.nlm.nih.gov/40324084/).

**Schooling/home evidence:** The [Australian Museum Lizard Island field guide](https://lifg.australian.museum/Group.html?groupId=5W64cXWZ&hierarchyId=qBHH2Q3E) separates territorial juveniles from larger animals roaming in groups of two to five. A [1998 primary observational paper](https://kli.ac.at/webroot/files/file/Evolution%20%26%20Cognition/1998%204-2.pdf), printed pp.108–135, describes individual recognition and fusion of territories in a 4 × 4 × 2 m aquarium during 1976–1977. Its historical observations and interpretation are not a replicated wild territoriality experiment. This is a later candidate for recognizing a familiar individual or yielding space, not proof of friendship, teaching or cooperative grazing. Do not require an aggressive dominance contest in this peaceful game.

**Verdict:** Advance an approach-angle puzzle. Combining documented crevice feeding with documented lateral jaw mobility is a defensible game abstraction, explicitly not an experiment reconstructed in the reef. Reject claims that idols deliberately farm sponge, teach juveniles, or cooperate to open crevices.

### s5 — Palette surgeonfish, Paracanthurus hepatus

**Identity:** Exact Indo-Pacific species; do not borrow Atlantic blue tang (Acanthurus coeruleus) behavior. Blue body, black pattern, yellow tail remain identity cues.

**Verified:** Georgia Aquarium lists zooplankton and benthic algae, adults in loose groups over current-swept reef terraces, and juveniles associated with branching coral. It also describes wedging among branches when alarmed. [Georgia Aquarium species account](https://www.georgiaaquarium.org/animal/palette-surgeonfish/). Direct open initially timed out; search retrieved the full account. Avoid numeric dietary proportions: consulted summaries differ in emphasis, and no primary diet quantification was established here.

**Second-pass corroboration:** The [Australian Museum](https://australian.museum/learn/animals/fishes/blue-tang-paracanthurus-hepatus/) identifies zooplankton feeding and supplies a photographed juvenile school; [Fishes of Australia](https://fishesofaustralia.net.au/home/species/2203) independently places the species in reef channels and exposed outer reefs with moderate to strong current. These support a flowing-water and schooling encounter without a garden-ownership claim. The jaw paper discusses *Paracanthurus* muscle anatomy; that mention alone does not establish a filmed, species-specific jaw sequence for *P. hepatus*. Do not copy the idol's paired upper/lower jaw rotation into s5.

**Verdict:** Advance a current-reading/plankton interception story with algae retained as an ordinary menu option. This evidence supports neither an algae-only specialist nor deliberate garden ownership. Reject a garden-expansion quest and any borrowed farming claim. No predator alarm is needed to motivate shelter choice.

### s25 — Regal angelfish, Pygoplites diacanthus

**Identity:** Exact current game taxon. Fishes of Australia notes regional genetic structure/possible cryptic diversity, so do not mix an Indian Ocean or Red Sea color form into a Pacific juvenile/adult comparison without specifying the scope.

**Verified:** Juveniles have fewer bars and a rear dorsal eyespot; they hide in cracks and crevices. Adults occur individually, in pairs, or small groups near coral-rich reefs and caves. Diet is sponge and tunicates. [Museums Victoria / Fishes of Australia](https://fishesofaustralia.net.au/home/species/658).

**New cave-posture lead:** The [USGS exact-species account](https://nas.er.usgs.gov/queries/FactSheet.aspx?speciesID=2605), citing Randall (2005), specifically describes cryptic juveniles using cave roofs upside down. Its text was retrieved through the search index; direct opening failed in this pass. This supports a bounded optional ceiling-observation variant with a verified juvenile painting. It does not establish obligate inverted swimming, nesting, substrate attachment or upside-down feeding. For Pacific art, [Bishop Museum's Randall juvenile record from Palau](https://pbs.bishopmuseum.org/images/JER/detail.asp?ID=554144614&cols=10&size=i) provides a life-stage and locality reference. The [2016 phylogeography study](https://pubmed.ncbi.nlm.nih.gov/27068838/) reinforces the need to specify regional scope; its abstract supports population partitions, not new social mechanics.

**Verdict:** Keep as a small observation encounter, or supporting character for a broader juvenile-identification adventure. The eye-mark is a useful visual mystery; the accessed source does not demonstrate its defensive function. Reject juvenile cleaner behavior borrowed from other angelfishes, guaranteed predator misdirection, pair-bond caregiving, and another algae circuit. A tunicate menu requires a real new food identity, not relabeling algae or sponge.

### s40 — Longfin / roundface batfish, Platax teira

**Identity:** Exact species P. teira, not P. pinnatus or P. orbicularis. Adult diagnostic marks include the blotch below the pectoral fin and elongated mark above the anal-fin origin. Juveniles have disproportionately elongated fins. [Australian Museum account](https://australian.museum/learn/animals/fishes/roundface-batfish-platax-teira/).

**Verified:** Very small juveniles resemble brown floating leaves and shelter in floating debris; larger juveniles may school below Sargassum rafts. Adults use sheltered and offshore reefs; diet includes zooplankton, benthic invertebrates, and algae. [Museums Victoria / Fishes of Australia](https://fishesofaustralia.net.au/home/species/2210).

**Exact-species motion corroboration:** The [Australian Museum's 2014 encounter note](https://publications.australian.museum/blog-archive/science/tropical-visitor/) says juvenile *P. teira* can move as well as look like drifting leaves. The author explicitly leaves the observed individual's health uncertain; that report is not a predator-choice experiment. Leaflike low-amplitude drifting is supported, while a guaranteed invisibility benefit, deliberate deception or a copied *P. orbicularis* side-lying gait is not. The brief turning/reveal sequence in card C remains authored observation choreography.

**Cross-species exclusion:** A primary growth study of P. orbicularis and Chaetodipterus faber distinguishes the flatworm resemblance of juvenile P. pinnatus in its literature review. Its measured size thresholds and growth curves are not P. teira results. [Barros et al., PLOS ONE (2015)](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0143838).

**Verdict:** Advance leaf/debris habitat investigation with explicitly juvenile art. Reject orange-edged flatworm mimicry, venom mimic abilities, transplantation of P. orbicularis growth thresholds, and a parent escort story: parental care was not verified.

## Implementation cards

### A. The Sideways Supper — s4

**P1; M effort; scientific risk medium.** New choice: approach a visible recessed food patch from its open side, rather than simply click any suitable food.

1. A small sponge patch is visible through a notched ledge. Hover shows the reachable mouth area and rock lip, not a hidden-answer marker.
2. Mouse steering lets the player try a straight approach or circle to either side; click the patch to request a bite. A blocked approach produces a short head turn and a clear “The ledge is in the way” cue, with no damage or consumed food.
3. At an unobstructed contact point, a brief lateral snout/jaw movement takes a bite. The patch changes locally. A close-up inset may clarify the motion without exaggerating the entire body into a bending tool.
4. The player can try a differently oriented opening or leave. One successful interpretation earns **A Different Angle**; the second opening is optional play, not a badge quota.

**Hooks/state:** New module through `reef-story-data.js` / `reef-stories.js`; `storyAction`, `storyMeal`, and the existing feeding contact commit in `simulation.js`; render overlay in `render.js`. Reuse `foraging-journeys.js` target conventions but do not count its ordered meals. Two authored sites, one chosen site ID, bounded phase enum, approach side, one food ID/incarnation, and `logged` flag. One short jaw animation; reuse a quiet existing interaction cue, no animal-vocalization claim or new audio generation.

**Acceptance:** Click from afar only approaches; no success through rock or before mouth contact. Moving away cancels preparation. Opposite-side approach demonstrably changes outcome. Pause/save during approach and during bite restores without duplicate nutrition or badge. Offscreen or wrong reef cannot finish. Food replacement cannot satisfy old target identity. Stop-story clears transient jaw/target state. Keyboard-accessible story buttons may choose a marked approach, while normal mouse steering remains sufficient.

**Physical production gate:** The 2025 paper distinguishes lateral jaw rotation from rotating the whole fish. Author a local upper-and-lower jaw articulation on the existing idol painting, preserving the eye and dorsal streamer, plus an optional dorsal-view close-up of the same committed bite. An ordinary side-view jaw gape or cosmetic head bob fails this card. Two rock openings need explicit lip polygons, reachable contact sockets and snout clearance. The chosen approach must change which socket is reachable. An authoritative jaw contact model or a supported level contact pose must agree with `feeding-contact.js`; display-only mouth deformation cannot be used to credit food through a rock. One contact-based bite can conclude the discovery, but success must demonstrate the choice's geometry, not merely increment the incumbent meal list.

### B. Where the Water Brings Lunch — s5

**P2; M effort; scientific risk low for ecology, medium for authored flow geometry.** New choice: infer an interception place from particle travel and choose a quiet edge or stronger stream. No rapid reaction requirement.

1. Above a terrace, drifting particles split around a coral head. Some are food, some harmless suspended specks; the same shapes stay visually distinguishable.
2. The player follows either stream with the mouse and chooses a place to intercept a plankton meal. The quiet edge is easy to hold; the main stream provides a clear moving target. Both solve the story.
3. Clicking food approaches it using normal controls; actual contact produces a bite. A missed particle loops back naturally, so there is no lost opportunity or countdown.
4. A simple trail overlay reveals where that meal came from. **Reader of Currents** records the discovery; comparing the other lane remains optional.

**Hooks/state:** `reef-stories.js` dispatcher, `simulation.js` food contact, `main.js` story panel, `render.js` particle trails. Reuse plankton from `data.js` and site anchors from `feeding-sites.js`. Two local flow splines, at most six visual particles, at most one edible target, chosen lane enum, path phase in [0,1], caught/logged booleans. Current affects only this bounded encounter initially, not a global physics rewrite. Optional existing soft bite/discovery cues; no ticking sound.

**Acceptance:** Particle drawing cannot award a meal; only the normal committed edible contact does. Do not award for algae consumption or rejoining a school. Player may change lanes freely. Paused particle positions and targets remain fixed; save restores deterministic phase and consumed status. Offscreen progress stops. Leaving/reentering does not multiply food or awards. Clearly label habitat and mixed diet rather than calling this a garden.

**Stronger non-quota variant — Find the Quiet Gap:** First inspect the real paths of two existing conspecifics above the terrace, then choose the sheltered gap behind the coral head or a wider place beside the faster stream. Those two choices change the player's reachable observation position and the neighbors' actual spacing/routes around the occupied gap. A bounded local flow field moves the existing edible plankton target and visible tracers consistently; a single optional interception demonstrates that flow. Award **Reader of Currents** only after the chosen position and changed live spacing/path have both been witnessed, whether or not the player eats. The grouping and current-swept habitat are supported; the gap arbitration, local hydrodynamics and narrated lesson are game interpretation. No studied cooperative group decision is claimed.

Use two reserved eligible s5 actors inside the normal adult population budget, one coral-head obstacle, two viewpoint/flow lanes, at most six tracers and one existing food identity. State adds two complete actor references, lane enum, bounded flow phase, observed-route bits and logged flag. Normal fin propulsion and actual turning must carry the movement; line trails cannot substitute for animals. Refuse Begin if actors or reachable geometry are absent and preserve the current dive. Acceptance includes freely switching lanes, differing live neighbor positions after each choice, matching food/tracer flow, no nutritional award without mouth contact, and no completion from waiting at either remote marker. This is a more distinctive alternative to card B's meal-led version, not an additional simultaneous quota story.

### C. The Leaf That Turned — s40

**P1; L effort because life-stage art is required; scientific risk low for habitat, medium for encounter choreography.** New choice: investigate a suspicious leaf from the side while leaving its cover intact, instead of attracting a browsing partner.

1. At a floating natural-debris patch, several leaves drift; one occasionally shows an eye and tiny fin stroke. A friendly prompt wonders why one leaf can turn by itself.
2. Mouse movement changes the viewing position. “Watch from here” fixes the player at a nearby observation point; “Try another side” restores steering. The suspect remains visible and persistent, with no timed reveal to miss.
3. From a clear view, the juvenile makes a short controlled turn, exposing fish features. The player marks the moving shape with an accessible story button or paused inspection. Choosing a real leaf gives a gentle distinguishing clue.
4. A nearby larger juvenile under a raft offers an optional silhouette comparison; it is a second individual, not instantaneous growth or a parent. **A Leaf with Fins** records the first discovery.

**Hooks/state:** `reef-stories.js`, existing paused observation in `main.js`, `render.js`, and identity conventions in `reef-memories.js`. Use a new bounded story resident presentation keyed to s40 + stage, rather than mutating all batfish artwork. At most two residents, three debris props, selected observation point, evidence bitset, reveal phase, logged flag; resident identity includes reef, species, ID and incarnation. New small brown juvenile and larger elongated-fin juvenile art; low-amplitude drifting/turn animation. Existing quiet discovery cue only.

**Acceptance:** Living NPC never becomes a leaf item or food target through this story; inspection must record s40. No orange-black flatworm art. No growth counter or parent bond. Entry/exit preserves the residents without spawning clones; observer selection cannot bind a recycled ID. Pausing freezes turns. Offscreen observation cannot complete; resume offers the same visual clues. “Return to free exploration” removes camera/observation anchoring. Badge requires observing fish evidence, not clearing debris, chasing, or feeding it.

**Physical production gate:** Reserve a juvenile encounter slot explicitly; the adult `longfin-batfish-v2.png` is not juvenile proof. The fish and the three debris props follow bounded, separately persisted routes. A changing viewpoint must alter real occlusion and reveal the existing eye, gill movement or fin contact with the water; it cannot teleport the suspect, turn a leaf into a fish, or flip a success bit from a button. Keep the floating cover present after identification, and retain the observed juvenile identity on a return visit. The optional larger juvenile must be admitted under its own population budget and may be omitted without blocking the smaller fish's discovery.

### D. An Eye at the Other End — s25 supporting encounter

**P3; S if a juvenile sprite variant exists, otherwise M; scientific risk low with no claimed eyespot function.** Do not prioritize as a full separate story slot.

Three beats: encounter a juvenile partly in a crevice; choose a side-on observation position that reveals either the mouth/real eye or rear dorsal eyespot; watch a gentle turn and mark which end contains the mouth. World response is a clearer silhouette and identification note, not an alarmed fish, feeding chore, or quiz modal. Optional **Careful Observer** note can join a shared juvenile fieldbook, without a new grind badge.

Reuse the batfish observation/identity wrapper and paused inspection. Bound state to one resident, one chosen viewpoint, two observed features, and one logged flag. New art must keep the eyespot on the rear dorsal fin and use the same regional form as the adult. Save/pause/offscreen and incarnation safeguards match card C. Actual line of sight/proximity is required; clicking a hidden resident from across the reef cannot complete. Reject implementation if it is only an encyclopedia paragraph with no visible juvenile.

**Optional stronger posture variant — Look Under the Roof (P2/M, art/verification gated):** Follow a visible glimpse into one of two cave apertures; choose a low side viewpoint or swim around to the wider opening. The same juvenile quietly uses a roof-adjacent inverted swimming pose. Rock occlusion changes with the player's actual viewpoint and reveals its real eye, mouth and rear dorsal eyespot in different orders. Let it continue under the roof after identification; no food or disturbance is required. Use one Pacific juvenile reference, two cave/viewpoint IDs, one bounded roof route, two feature-observed bits and one logged flag. Reuse observation controls and identity validation, with new juvenile art and a verified belly-up pose anchored to real cave clearance. Acceptance must show the same animal moving under the roof in both views, no clipping through the ceiling, no mouth-spine attachment, immediate return to steering, and no distant-click identification. This is a development/habitat observation adventure; do not generalize its inverted posture to adult s25 browsing or call the eyespot a proven defense. It remains a proposal until the posture reference and authored cave geometry are reviewed.

## Shared integration constraints

The current `reef-stories.js` schema whitelists module keys; extending `freshStories`, `validStories`, and species matching in `simulation.js` is mandatory. Old saves must default missing new story states to null. `save-files.js` already allows `reefStories`, but that does not validate new internal data automatically. The current registry now includes `storyKeysFor` and `storyCompatible` alongside the legacy first-match `storyKeyFor`. None of s4/s5/s25/s40 has a registered main story in the inspected registry. Use explicit story selection if alternatives are eventually implemented; an optional supporting juvenile encounter must not silently take over an existing activity.

Use the existing `discovery` event and journal deduplication, with species-specific IDs. No success via proximity alone when the claim is biting or seeing a feature: contact/visibility must be tested. Existing E/context remains the base activity; optional story actions use labeled panel controls unless routing is explicitly designed. Escape/P pause, focus loss, save/load, leaving reef, stopping a story, and changing species all require bounded, reversible behavior. Current story logic suppresses ordinary `mealAdventure` while active; preserve that separation deliberately. Scientific animations remain illustrative, and the written field note links directly to the source that supports the behavior.

## Second-pass ranking and readiness

| Rank | ID / exact taxon | Strongest next proposal | Distinct player choice and visible consequence | Readiness |
|---|---|---|---|---|
| 1 | s4 — *Zanclus cornutus* | Sideways Supper | Choose an approach socket; rock clearance and local lateral jaw contact change which bite can occur. | P1/M; exact-species jaw evidence strong; contact geometry and lateral jaw art unimplemented. |
| 2 | s40 — *Platax teira* | The Leaf That Turned | Choose a real viewing route; occlusion exposes a persistent leaflike juvenile's eye and independently moving fins. | P1/L; exact-species leaf/habitat evidence strong; juvenile art and admission unimplemented. |
| 3 | s5 — *Paracanthurus hepatus* | Find the Quiet Gap, strengthening Where the Water Brings Lunch | Choose a sheltered or exposed place in flowing water; real neighbors and plankton take different physical routes. | P2/M; current habitat/schooling supported; flow and gap response are explicit game interpretation. |
| 4 | s25 — *Pygoplites diacanthus* | Look Under the Roof / An Eye at the Other End | Choose the low or wider cave view; occlusion reveals the same roof-swimming juvenile's mouth and eyespot. | P2/M if cave posture is reviewed; otherwise retain P3 supporting observation. No eyespot-function claim. |

All four retain their existing playable journeys. The ranked stories and strengthened variants are **proposed**, not shipped, not playtested and not unintegrated code drafts. No runtime files, creature population, art assets or rewards were changed by this research pass.

## Source-access notes for the second pass

Opened the complete 2025 jaw paper and museum species accounts; used the Australian Museum's exact-species batfish encounter note as motion corroboration. The Lizard Island guide and USGS cave-posture text were available in search results while direct page access failed; that distinction is retained above. The 1998 idol paper is an accessible primary historical aquarium account with an explicitly limited evidential scope. The 2016 regal phylogeography abstract and the Bishop Museum's locality/life-stage record support identity checks only. No exact-species experimental test of *P. teira* leaf resemblance reducing predation, or *P. diacanthus* eyespot defensive function, was established. No source found justifies transferring *P. pinnatus* flatworm resemblance or *P. orbicularis* measured growth/side-lying behavior into s40.
