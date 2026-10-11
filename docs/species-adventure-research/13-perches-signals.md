# Perches, cover and signals: species adventure research

Research date: 10 October 2026; independently rechecked against current files and sources. Scope: s20 Lionfish, s31 Whitespot hawkfish, s41 Trumpetfish, s57 Checkerboard hawkfish. Research/design only. All proposed names, timings, ranges, reactions and objectives below are authored gameplay, not measured biology. This revision changes only this report.

## Recommendation

| ID / identity scope | Existing loop | New-behavior verdict | Effort / priority |
|---|---|---|---|
| s20 / Pterois, genus only | Watch from a ledge, approach a meal, return | Water-jet approach is a genuinely different candidate, but qualify it to documented P. volitans / P. miles examples; reject genus-wide cooperative signaling | M / P2, conditional on explicit trait wording |
| s31 / Paracirrhites hemistictus | Perch, watch a meal, feed, return | Physical perch and sightline choices can improve the existing loop; no sufficiently distinct new life-history story established | M / P2 shared improvement |
| s41 / Aulostomus chinensis | Follow broader neighbor, eat, return to same neighbor | Strong extension: choose between moving cover and head-down coral concealment; do not sell shadow-following again as new | M / P1 |
| s57 / Cirrhitidae, family only | Perch, watch, feed, relocate to second perch | Preserve family scope; share perch improvements, defer a species-specific adventure | S shared integration / P3; identity research before larger work |

These candidates need no timed appointment, invisible reputation, repeated meal quota, forced predator encounter, starvation challenge, or fabricated visitor. Each proposed completion can follow a visible response or observation without eating. Discovery rewards record a completed interaction once; replay remains available without farming rewards.

## Verified architecture and shared delivery contract

Inspected `src/data.js`, `src/natural-history.js`, `src/adventures.js`, `src/watch-journeys.js`, `src/escort-journeys.js`, `src/ambush-activity.js`, `src/refuge-motion.js`, `src/ecology.js`, `src/animal-profiles.js`, `src/reef-stories.js`, `src/reef-story-data.js`, `src/feeding-contact.js`, `src/feeding-motion.js`, `src/geometry.js`, and relevant `src/simulation.js` / `src/main.js` sections.

All four already have journeys. `WATCH_JOURNEYS` supplies s20, s31 and s57; `ESCORT_JOURNEYS` supplies s41. They enter `ADVENTURES`, `sitesFor`, `useContext`, `mealAdventure`, and `tickAdventure`. `ambush-activity.js` currently applies only to s16/s21/s54/s59, so borrowing its short-strike concept does not mean it already supports these four.

Substantial additions fit optional Practice stories. Add a module through the explicit `reef-stories.js` module table, `freshStories`, `validStories`, `habitatFor`, cleanup and renderer dispatch; register `REEF_STORIES`, `STORY_IDS` and `STORY_REFLECTIONS`. The module contract is `initStory`, `validStory`, `storyAction`, `tickStory`, `storyMeal`, `storyNPC`, `storyView`. The current metadata now exposes `storyKeysFor` and `storyCompatible`; `storyKeyFor` retains the first-match default. Use explicit selection if a species gets another story; the two trumpetfish cover modes can remain choices within one story. `Simulation.serialize()` already includes `reefStories`, but validators reject unknown keys; registration and bounded validation are necessary. Preserve existing journey discoveries rather than resetting saves to introduce optional content.

**Admission and safety gates:** before offering a guided Begin, check the actual reachable supports and eligible existing host/prey. Fresh-start allocation must stay inside the normal adult population budget; preserve existing animals and pair bonds in saved dives. If no eligible actor exists anywhere reachable, explain that limitation and offer a labeled fresh adventure after preserving the old dive, rather than indefinite searching. While a required perch or head-down pose owns a local area, preserve health/hunger and use local non-injurious interaction rules; nearby predators remain visible and steer around the activity, while outside predators continue ordinary behavior. Steering/cancellation releases assistance safely before normal danger returns. These are required implementation gates, not claims that the queued stories already enforce them.

Real controls: E / the context button acts near a relevant opportunity; pointer movement normally calls `sim.point` and releases follow/watch; during watch it aims without swimming; clicking calls `eatAt`; Esc/P pauses. New story buttons currently dispatch actions rather than world hit tests. A new perch, orientation or pulse interaction needs explicit routing and a visible action label, not an undocumented key. A distant selection may initiate movement but cannot count as arrival or contact. Preserve an obvious Leave/Cancel action and steering escape. Space remains the existing species defense.

Feeding must still pass `suitableMeal`/`edible`, `approachMeal`, `contactGap`, `mealContact`, and `consume`. `feeding-contact.js` deliberately separates displayed mouth coordinates from simulation physics. Do not make a rotated pose merely look like a successful bite while eating through a gap. References to moving fish must include `{id, incarnation, reef}`; nearby replacements cannot inherit progress. Food references likewise need current availability and regrow/incarnation semantics.

Shared state budget: one active story, one live target, at most one host, at most two selected sites, stages 0–4, small bounded timers and booleans; no accumulating trails or per-frame history. Pause/modal/blur freezes timers and effects. Leaving the reef cancels transient pulses/strikes and suspends local progression without offscreen rewards or penalties. Restore completed beats once, revalidate references, and return to an actionable choice if a target is gone. Do not respawn or teleport a replacement into an encounter. Keep rewards out of visual-only or elapsed-time code.

## s20 — Lionfish: a little current

### Evidence, scope and current behavior

The catalogue is explicitly `Pterois (lionfishes; genus)` and does not identify the illustration to species (`natural-history.js`, s20). Current stats: fish/shrimp/crab diet, night, spines, reef; `watch-journeys.js` defines `lionfish-watch`, a 2-second settle, 260-unit watch range, watched meal, and 3-second return. Its defensive display is a game abstraction, not an account of venom delivery.

Albins & Lyons documented P. volitans producing directed water jets while approaching fish prey; the proposed orienting function was initially interpretive. A 2026 experimental paper on P. miles found prey reorientation and more head-first captures when blowing. Blowing was associated with lionfish size, and was not determined by the prey's initial orientation. This supports a small, directional current affecting an existing prey fish, not a stunning beam or universal lionfish power. The 2012 publisher PDF could be searched but direct open failed; the 2026 primary full-text search result exposed its abstract and methods/discussion, while direct publisher/PMC retrieval failed or met a browser challenge. [Albins & Lyons 2012, primary paper](https://www.int-res.com/articles/feature/m448p001.pdf); [Bottacini et al. 2026, primary paper](https://academic.oup.com/beheco/article/37/5/arag087/8741288); [PMC full-text record](https://pmc.ncbi.nlm.nih.gov/articles/PMC13435627/).

Do not implement cooperative fin signaling for this genus entry. The 2014 experiment used Dendrochirus zebra as initiator, with conspecific or Pterois antennata partners; Dendrochirus is not Pterois. Later P. miles studies found no evidence for recruitment (2021) or coordination/reciprocity (2023). Those negative results are population/species-specific, not proof that no lionfish ever cooperates. The 2014 article also has correction history: the journal's 2019 correction reports satisfaction with its independent review while correcting the inclusion of a collage. Do not label the article retracted or dismiss it solely on an unresolved 2018 headline. The taxon mismatch and later negative evidence already make universal signaling unsuitable. [Original 2014 paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC4090549/); [Sarhan & Bshary 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8441117/); [Sarhan & Bshary 2023](https://doi.org/10.1098/rsos.220834); [2019 editorial correction](https://pmc.ncbi.nlm.nih.gov/articles/PMC6892523/).

### Candidate card — A little current

**Fresh decision:** continue a normal slow approach, try one short pulse at suitable close range, or abandon the approach. The player reads the prey's heading and response. Do not require every meal to be prepared or imply the experiments showed lionfish choose pulses according to initial prey orientation; that is not established. The player's comparison is authored interaction.

**Four beats:** (1) Find an existing suitable small fish and approach slowly. (2) When the real snout is close and aligned, choose the visible Pulse action. (3) Observe the local water trace and the target's bounded turn; it can still move or flee. (4) Click for an ordinary contact meal or steer away; record the observed response without requiring a kill or a second attempt.

**Visible consequence:** one prey NPC changes heading in response to a real local pulse; a miss leaves it unchanged. Ambient suspended particles move a short distance to explain the current. Never spawn bait, stop all surrounding fish, pull a fish through scenery, or award food for firing. NPC lionfish can occasionally use the same scoped rule during an already valid approach, so this becomes reef behavior as well as a player tool.

**Hooks and bounds:** proposed `src/lionfish-current.js` and renderer hook plus a small shared approach effect near `Simulation.step`/NPC feeding; integrate through `reef-stories.js`, `main.js`, `render.js` and `reef-story-data.js`. Limit to fish entities, not shrimp/crab tokens; retain current diet. Store stage, target reference, one pulse elapsed value (0–1), one short recovery value, and response/completion booleans. Presentation uses a mouth compression cue and a small reusable particle streak; no projectile mesh, attack flash or new art atlas needed. Pixel ranges are authored and must not be presented as centimeters.

**Identity gate:** journal copy must say this is inspired by jets documented in P. volitans and P. miles, while the game's lionfish is identified only to genus. Either retain that explicit named-example framing or resolve species/art identity before presenting it as this individual's verified natural history. Do not silently rename s20 or claim all Pterois blow jets.

**Acceptance through real controls:** select a fish with the mouse, reach the visible range, press the action button, and verify only that target turns. Pulse while distant, facing away, paused, or after the target dies: no response/progress. Click after a pulse: no meal until mouth contact and normal feeding delay. Move away: immediate control return and no delayed pulse. Save during preparation/response; reload without replaying the pulse or paying a second reward. Changing incarnation invalidates the pending target. No cooperative signal, venom projectile, or stun is introduced.

**Effort/priority:** M / P2, conditional; a strong physical interaction with more scope risk than the identified trumpetfish.

## s31 — Whitespot hawkfish: find the open view

### Evidence, scope and current behavior

The scientific identity is P. hemistictus. Churaumi explicitly uses the English name Whitespot hawkfish for this species, so the catalogue does not need a correction merely because the Australian Museum calls it Ornate/Halfspotted Hawkfish. Avoid confusing it with Cirrhitus pinnulatus, which appears under a similar common name elsewhere. Churaumi documents a benthic shallow-reef predator of small fishes/crustaceans. The Australian Museum specifically describes perching with elongated pectoral rays on coral branches, sea fans or rocks. [Churaumi species account](https://churaumi.okinawa/en/fishbook/1610175140/); [Australian Museum species account](https://australian.museum/learn/animals/fishes/ornate-hawkfish-paracirrhites-hemistictus/).

**Alternative investigated — courtship/home spacing:** Donaldson's primary study describes dusk courtship, sex-specific home areas and pelagic spawning across ten Pacific hawkfish species. The abstract does not identify which observations apply to P. hemistictus; the full PDF failed retrieval in this review. The museum's species account supports a harem description, but that alone does not supply a species-specific courtship sequence for animation. Defer a reproductive card until the exact study taxa/sequence, adult roles, dusk setting and available partner population are verified. Do not turn a nearby passer into a mate or a pectoral movement into a decoded invitation. [Donaldson 1990, primary abstract and PDF entry](https://www.jstage.jst.go.jp/article/jji1950/36/4/36_4_439/_article/-char/en).

`hawkfish-perch` currently asks the player to choose a reef perch, settle for 2 seconds, aim at a suitable meal for 1 second within 220 units, take a short feeding trip, return and settle 3 seconds. NPC `perchHeading` already looks toward passing fish; `refugeHome` already spaces resting neighbors; `ecology.js` alternates perching and short excursions. New copy describing patience, looking, or returning is not new behavior.

### Modest card — Find the open view

**Verdict:** improve the shared perch system, rather than claim a new species-specific lifestyle story. Exact pectoral footing is directly supported; comparative sightline selection is an authored use of that behavior, not a demonstrated cognition claim.

**Fresh decision / four beats:** (1) Approach either of two actual supports with visibly different open views. (2) E settles the pectoral rays onto a reachable socket; aim to survey. (3) If reef geometry obscures a passing meal, remain or leave for the other support. (4) Make a normal contact approach or simply observe a pass through the newly open view. End with a readable comparison, without requiring two meals.

**Visible consequence:** the fish actually rests on a support instead of a generic shelter center, turns toward an unobscured passer, and loses that line of sight behind a branch. NPC hawkfish use the same support selection and gaze rule. The world change is a real body placement and attention change; do not add territorial threats, cooperative guarding, a harem task, or a magic attraction radius.

**Hooks / bounds:** enrich `watchPlaces` with authored support points, support type and one/two coarse occluder segments per selected scene; extend `perchHeading` with the same simple visibility check. Use `animal-rigs.js` pectoral articulation and `geometry.js` for visual alignment. Store one support ID, previous support ID, one watched `{id, incarnation}` and a comparison flag. Two readable rock/branch sockets and a pectoral-contact pose suffice. Validate missing/changed support IDs and resume at selection; do not migrate coordinates blindly. Paused/offscreen fish do not complete observation. Keep support collision separate from food bite geometry.

**Acceptance:** actual E near a socket places the fin contact correctly in both facings; remote E only prompts approach. Mouse aim through an occluder does not count the hidden target. A clear passer does; target death/incarnation replacement clears attention. Moving/E leaves promptly; no snap back. Normal prey clicking still requires mouth contact. Save after choosing the first support and restore without granting the comparison. The original perch journey remains completable.

**Effort/priority:** M / P2 shared improvement. Defer if the project is selecting only large, distinctive stories.

## s41 — Trumpetfish: choose your cover

### Evidence, scope and current behavior

A. chinensis is explicit. Museums Victoria's Fishes of Australia documents rapid color change, head-down waiting among corals, shadowing larger fishes, and suction feeding. The Australian Museum also describes vertical approaches and observations beside Bluespotted Coral Cod / Masked Rabbitfish. These sources directly support the two cover modes for this species. Do not repeat the Australian Museum page's outdated claim that Aulostomus has only one species. [Fishes of Australia species account](https://fishesofaustralia.net.au/home/species/1875); [Australian Museum species account](https://australian.museum/learn/animals/fishes/trumpetfish-aulostomus-chinensis-linnaeus-1766/).

The well-known 2023 experimental demonstration that shadowing reduces prey detection concerns A. maculatus, not A. chinensis. Cite it only as related-species experimental context; do not transfer measured detection effects, preferred hosts, or success rates wholesale. [Matchette et al. primary abstract](https://pubmed.ncbi.nlm.nih.gov/37552943/).

`trumpetfish-moving-cover` / A moving hiding place already chooses a broader compatible neighbor with E, follows 3 seconds, takes a fish/shrimp meal within 400 units, and returns to the same `{host, incarnation}` for 3 seconds. `compatibleShadow` checks actual body geometry, rejects unsuitable/busy animals and predator/prey conflicts. `followShadow` matches measured host movement without teleporting. NPCs already shadow and fall back to reef refuges. Natural-history copy already mentions head-down waiting. New value must be player choice and the real consequences of concealment geometry, not another escort checklist.

### Strong card — Choose your cover

**Fresh decision:** follow a suitable moving fish or occupy a stationary vertical coral gap; change strategy when the neighbor turns away or the gap gives a better approach. Both are legitimate solutions; no mandatory completion of both and no extra repetition of eat/return.

**Five beats:** (1) Observe an actual broad neighbor and a reachable upright coral gap. (2) Select Moving cover or Head-down cover and move into position. (3) Adjust side/position as the host turns, or orient head-down within the gap. (4) Read an existing prey NPC's visible response to exposure and decide whether to wait, switch cover, or approach. (5) Complete by observing a concealed close pass or taking a normal contact meal; the journal explains the cover used.

**Visible consequence:** the player silhouette is hidden from a local prey's view only when geometry actually puts the host/structure between them. A turn can expose it; the prey may then face/avoid it under normal threat rules. No guaranteed capture, global invisibility, host obedience, or host teleport. The same NPC trumpetfish can settle head-down when no suitable host is near and continue its own ordinary life. Concealment coefficients and the comparison outcome are authored simplifications, not exact A. chinensis experimental results.

**Hooks / bounds:** proposed `src/trumpetfish-cover.js` and `src/trumpetfish-cover-render.js`; delegate host compatibility/following to `escort-journeys.js` and `refuge-motion.js`, add two coral gap anchors and a small per-target visibility predicate. Register through `reef-stories.js`, `reef-story-data.js`, `main.js` and `render.js`. Route context actions explicitly so E does not simultaneously join an escort and select a coral pose. Store mode enum, stage, one host reference, one coral ID, one prey reference, a short exposure timer and one witnessed-result flag. Four direction/pose transitions and a subtle body tint can use the existing needle rig; two painted coral occlusion masks must agree with actual gap clearance. Do not require color matching to a host species as an established quantified rule.

**Contact caveat:** current feeding settles the side-view painting into contact. Either visibly leave the head-down pose and use normal `approachMeal`, or implement a coherent simulation-mouth orientation before supporting a vertical strike. The first is the smaller, safer initial scope. Never extend bite range to cover a display/physics mismatch. Suction mouth expansion may illustrate contact but cannot vacuum food from outside the ordinary envelope.

**Save / pause / identity:** host missing/busy or new incarnation offers Switch cover/Choose another; earned observation survives. On reef exit, release motion assistance and suspend the beat; no offscreen following or eating. Restore the pose only if the support remains valid and reachable. Rendering transitions use simulation timers and freeze with pause. Completion is idempotent and can be replayed without duplicate discoveries.

**Acceptance through real controls:** use the actual cover buttons and E, follow a moving/turning host, and demonstrate exposed versus occluded prey response. Swim into and out of the gap: visible alignment and exposure must agree. Click an actual meal from a head-down pose: visible transition, real mouth contact, one consume event. Steer away mid-follow/pose to regain control immediately. Remove a host, change its incarnation, switch reef, pause mid-turn and save/reload each beat without remote progress, stale references, or forced movement. Ensure a sensible quiet completion when prey passes but no meal is taken.

**Effort/priority:** M / P1. Highest-value candidate here, because the species is identified and the current behaviors provide reusable foundations.

## s57 — Checkerboard hawkfish: retain uncertainty

`natural-history.js`, s57 deliberately identifies only Cirrhitidae. It gives Oxycirrhites typus as a named example, explicitly not the sprite's identity. The family-level Australian Museum account supports perching on thickened lower pectoral rays. Fishes of Australia supports sea-fan/black-coral perching, current-exposed outer slopes and small crustaceans specifically for O. typus; its long pointed snout is essential to the example. [Australian Museum family account](https://australian.museum/learn/animals/fishes/cirrhitidae-hawkfishes/); [Fishes of Australia: Oxycirrhites typus](https://fishesofaustralia.net.au/home/species/2428).

Current `hawkfish-lookouts` has the same 2-second watch and 220-unit range as s31, then requires settling at a different perch after a meal. NPC perching/gaze already exists. A new “move to a second perch” adventure would duplicate the shipped loop.

**Verdict:** no separate strong card supported now. Share Find the open view as a clearly family-level game interaction. Its fresh choice is which support gives an open view; its four beats, visible NPC placement/gaze, bounded support state, pause/save/offscreen and real-contact acceptance are exactly the shared s31 contract. Keep s57's existing relocate ending if preserving the journey, but do not award a second discovery for the same comparison.

**Do not import:** O. typus monogamous pair spawning, sea-fan exclusivity, deep strong-current specialization, or planktonic-crustacean diet as confirmed s57 traits. Current fish/shrimp diet remains the catalogue abstraction. A current-facing feeding story becomes eligible only after verified identity/art review and a genuinely modeled flow/food system; a particle ribbon plus a wait timer is insufficient. S / P3 for shared integration; a distinct story is deferred rather than padded with unsupported biology.

## Ranked delivery and coverage

1. **s41 [Choose your cover](#s41--trumpetfish-choose-your-cover), M / P1:** exact-species support for a real cover/pose choice; completion may be a concealed pass. Keep the existing moving-cover journey.
2. **s20 [A little current](#s20--lionfish-a-little-current), M / P2, conditional:** close-range prey reorientation provides a physical outcome without requiring a catch. Explicit P. volitans/P. miles example framing or verified sprite identity is mandatory; no cooperative signal.
3. **s31 [Find the open view](#s31--whitespot-hawkfish-find-the-open-view), M / P2 shared improvement:** actual pectoral support and obstructed/open sightlines improve the present perch system. Reproductive story deferred at exact-taxon/dusk/partner gates.
4. **s57 [Retain uncertainty](#s57--checkerboard-hawkfish-retain-uncertainty), S / P3 shared integration:** family-level pectoral footing is defensible; a distinct current-facing or reproductive story awaits verified identity and physical flow or partner support.

All assigned IDs are covered: s20, s31, s41 and s57. Strong support for a named species, genus/family examples, and authored geometry outcomes remain separate. Neither a visual fin movement nor a spatial association proves decoded speech or cooperation; trumpetfish hosts need not cooperate or change goals to provide cover.

## Verification scope

This revision changed only this research/design document. No runtime tests or walker QA runs were executed for this revision. Re-read the current roster, natural-history, watch/escort journeys and perch/shadow helpers; independently browsed the museum/aquarium accounts, primary jet/recruitment/coordination papers and correction record. The inaccessible PDFs and publisher/PMC challenges are stated where material. The acceptance checks describe later implementation proof through rendered input and actual contact, rather than asserting the queued behaviors already work.
