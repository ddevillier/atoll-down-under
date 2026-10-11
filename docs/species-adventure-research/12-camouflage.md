# Camouflage species: new adventure research

Research date: 10 October 2026; authoritative-source follow-up the same day. Scope: s19 Cuttlefish, s21 Devil scorpionfish, s54 Painted frogfish, s59 Longsnout flathead. This report describes research and proposed work. Parallel frogfish walking files are drafts; their presence does not establish integrated or packaged delivery. Proposed timings, route geometry, choices and NPC responses are authored game rules; sources support the underlying behavior, not the exact challenge.

## Recommendations

| ID / retained identity | Distinctive opportunity | Verdict | Effort / priority |
|---|---|---|---|
| s19 / Sepiidae, species unresolved | Named giant-cuttlefish case study: choose an egg attachment site | Strong behavior, conditional on explicit species/place vignette | L / P2 |
| s21 / Scorpaenopsis diabolus | Remain still or reveal bright pectoral fins to an approaching neighbor | Strong optional warning-display encounter | M / P1 |
| s54 / Antennarius pictus | Fin-walking over a small, collision-checked foothold graph | Strongest immediate prototype; distinct physical play beyond lure/strike | L / P1 |
| s59 / Thysanophrys chiltonae | Physical partial burial and emergence | Supported, but modest extension; defer major standalone story | S extension / P2; standalone M / P3 |

Do not add another camouflage-matching discovery to s19: the existing story already does it. Do not sell s54 lure attraction as missing functionality. No proposal needs spawned prey, feeding quotas, real-world waiting, calendar scheduling, damage, brood loss or reward farming.

## Inspected baseline and shared implementation contract

Read the relevant records/logic in `src/data.js`, `src/natural-history.js`, `src/adventures.js`, `src/disappearing-artist.js`, `src/ambush-activity.js`, `src/lure-motion.js`, `src/reef-story-data.js`, `src/reef-stories.js`, and input/serialization references in `src/main.js` and `src/simulation.js`.

Optional stories are Practice-only; modules expose `initStory`, `validStory`, `storyAction`, `tickStory`, `storyMeal`, `storyNPC`, and `storyView`. New stories need metadata/reflection/discovery registration, module/state validation, habitat routing, cleanup and renderer dispatch. The current draft registry provides `storyKeysFor` and retains first-match `storyKeyFor` for compatibility. That list alone does not prove working UI selection or save validation: s19 still needs an explicit selectable case study that preserves the artist. This selection work is included in L scope.

E/context dispatch reaches the active story. Story buttons are accessible HTML controls, while ordinary canvas pointer-down calls `eatAt`; pointer movement steers except during ambush/watch aiming. Environmental targets therefore need deliberate hit handling before `eatAt`. Keep E/button equivalents, generous targets and focus retention. Do not claim keyboard arrow swimming already exists. Pointer steering must relinquish assisted approach immediately.

All candidates need versioned finite state, bounded active-time timers, idempotent completion and stable scenery/reef IDs. Animal references use `{id, incarnation}`, never species names or array indices. Pause/modal suspension, reef departure and reload must never advance encounters or award outcomes. Resume a safe beat. Missing/dead/replaced NPCs release bindings and allow another naturally available encounter without losing completed progress. No teleporting, respawning or changed diets. Log one existing journal discovery on first meaningful completion; replay without multiplying rewards. These are proposed contracts, not claims that every existing module already satisfies them.

## s19 — Cuttlefish: named Sepia apama case study

### Current mechanics, scope and evidence

`data.js` assigns night/sand and ink that interrupts pursuit. `adventures.js` has the older two-background “Colors of the reef.” `disappearing-artist.js` already supplies pale sand, deep shadow and mottled skin; eight mapped sites across Pearl Sands, Sea Fan Garden and Old Wreck; skin selection and match quality; a two-second settle; movement/ink reveal; an existing live observer with identity-safe passing behavior, noticed/overlooked outcomes and three distinct successes. A texture slider or fourth disguise is insufficient novelty. The natural-history caveat “two authored background patterns” describes the older activity and is incomplete for the story; reconcile later if editing that area.

The catalog only identifies Sepiidae. The Australian Museum account is a named example, not proof that the sprite is giant cuttlefish. It describes southern Australian distribution, camouflage and breeding communication. Introduce this activity as “A giant cuttlefish story — Sepia apama, southern Australia.” Do not attribute its reproductive system to the whole family or pretend the Spencer Gulf aggregation belongs naturally inside this tropical atoll. [Australian Museum: Giant Cuttlefish](https://australian.museum/learn/animals/fishes/giant-cuttlefish-sepia-apama-gray-1849/).

Cronin's primary thesis reports eggs principally beneath flattened rocks at its study sites, with crevices/other surfaces used when underside space was scarce. Egg capsules become more translucent during development, which takes months. This supports substrate choice and an illustrated later-development view; it does not establish maternal guarding or immediate failure of exposed eggs. [Cronin 2000, University of Adelaide thesis, field observations p. 27 and abstract](https://digital.library.adelaide.edu.au/server/api/core/bitstreams/60853101-f0cf-4b8d-a70f-da507551edff/content).

Hall and Hanlon studied a particular Spencer Gulf aggregation, including females searching for egg-laying sites and intervals between individual depositions. [Hall and Hanlon 2002, university record/abstract](https://digital.library.adelaide.edu.au/items/3f1493bc-aa05-4510-b4d3-868366d41084); [paper DOI](https://doi.org/10.1007/s00227-001-0718-0). The record was searchable but its open view had no body; the opened Cronin thesis provides full-text substrate evidence.

**Follow-up corroboration and limits:** Hanlon and colleagues' exact-species field paper also describes attachment of large white eggs beneath large flat rocks (printed p. 547). Its night surveys observed spawning animals cease conspicuous reproductive signaling and settle in background-adapted camouflage at dusk; this is context-specific evidence, not a rule that all cuttlefish sleep on a timer. [Hanlon et al. 2007, *Adaptable Night Camouflage by Cuttlefish*, institutional full text](https://digital.library.adelaide.edu.au/server/api/core/bitstreams/5deaf1eb-d5ef-48d5-a571-b68c2fe9aa44/content). The Cronin PDF reopened with metadata in this follow-up but subsequent text/screenshot requests timed out; its translucency details remain the earlier reading's evidence and should be checked directly before authoring a developmental illustration.

**Verdict:** Strong new act of site selection and attachment, conditional on an explicit female giant-cuttlefish role and geographically honest vignette. If that setting is outside scope, defer rather than identify s19 retroactively. No octopus-style brooding or protect-the-babies timer.

### Card — A Place Beneath the Rock

**New decision:** Which accessible underside/crevice to inspect and where to attach a capsule. Geometry and arm reach drive interaction, not skin choice or observer detection.

**Four beats:**

1. Enter the labeled case-study vignette; inspect two fixed rock forms with a readable underside and recess.
2. Swim to an entrance; E inspects nearby attachment surfaces. Choose a reachable opening. Distant selection only approaches it.
3. Position arm tips near an unoccupied attachment point and choose “Place capsule.” A visible arm-cupping/attachment animation commits one capsule. Cancel before its commit frame without loss.
4. Back away to see the attached capsule. An optional “Later in development” illustration shows translucency, explicitly a time jump. Complete the discovery without hatching simulation prey or waiting months.

**Observable consequence:** The capsule persists on the chosen surface; another valid choice changes its location/view. An inaccessible opening produces a reach cue, not egg damage. One placement per run, no production quota.

**Hooks/state/art:** Case-study destination and story-selection support; ordinary movement, E and buttons. State: version, stage enum, one of two site IDs, one of at most four anchors, `placed`, animation time 0–4 seconds, `logged`. One capsule with opaque/translucent variants, one arm pose and two rock masks. No breeding-partner AI, new population or global life cycle; no NPC reference required.

**Lifecycle:** Pause freezes pose. Leaving before placement returns to inspection; after placement retains its anchor. Reload cannot duplicate the capsule/discovery. The later view never claims offscreen time elapsed. Free exploration restores normal s19 identity and movement.

**Real-controls acceptance:** Use rendered story selection and normal pointer movement to both sites. Remote E/buttons cannot attach. Verify reach/obstruction, mid-animation cancel, save/load before and after commit, pause during placement and scene exit. Confirm one visible capsule/discovery and artist still selectable. **L / P2**, chiefly for honest case-study setting and multiple-story selection.

## s21 — Devil scorpionfish, Scorpaenopsis diabolus

### Current mechanics, evidence and verdict

Current play is night/reef, camouflage and a poison flag. “Hidden in plain sight” shares bottom-route ambush sites with frogfish/flathead: E settles two seconds, pointer aims, clicking a nearby live target starts a 0.8-second strike, and a real meal completes it. Pectoral display is in natural-history prose, not this loop. The poison flag is an authored abstraction, not universal immunity.

The Australian Museum describes a yellowish inner pectoral surface with a large dark spot; fins are spread when threatened, with startling predators described as a believed function. FAO likewise reports a colored-fin warning when alarmed. [Australian Museum: False Stonefish](https://australian.museum/learn/animals/fishes/false-stonefish-scorpaenopsis-diabolus/); [FAO guide, printed p. 2341 / PDF page 8](https://www.fao.org/4/x2400e/x2400e23.pdf).

**Verdict:** Strong contrast with concealment. An authored brief hesitation/wider berth is suitable; guaranteed predator repulsion is not established. No damaging flash weapon. Do not borrow the “walking fingers” of Inimicus, a different genus commonly confused in search results.

### Card — The Hidden Fan

**New decision:** Stay inconspicuous for a distant passer, or face a close approach and open the bright pectorals. Intentional orientation/display timing, not pattern matching or feeding.

**Four beats:**

1. Rest beside a rock; an existing nearby fish's visible ordinary route supplies an approach cue. No attack is forced.
2. Choose folded fins or orient toward the fish. A distant passer continues normally; premature display simply reveals the player's fins.
3. E/“Show fins” smoothly unfolds them while the bound observer is near and looking toward the display. A modest authored hesitation or wider arc gives more room, then ordinary behavior resumes.
4. Fold fins and watch the neighbor leave; choose the same resting spot or a nearby one. Complete the visible encounter once.

**Observable consequence:** Bright inner fins and folded outline look different. Orientation matters; distant/rear-facing observers do not respond. Only the bound observer adjusts. No health, meal or fear points; absent response invites a gentle retry.

**Hooks/state/art:** Practice actions and one existing encounter participant through `storyNPC`; normal avoidance has priority. Context turn/aim must not use attack targeting. State: stage, site/reef, one `{id, incarnation}`, response enum, display time 0–3 seconds, bounded approach/exit endpoints and `logged`. Two pectoral layers unfold with dark spot/warm inner color and shape cues; no strobing, particles or new NPC species.

**Lifecycle:** Pause freezes both display and authored response. Reef exit, stop-story or newly busy NPC releases control and returns to seeking/rest. Reload resolves identity; recycled IDs cannot finish. No permanent panic or accumulated retry reward.

**Real-controls acceptance:** Use rendered E/button and pointer orientation near a real NPC; compare front, back and distant cases. Open-water steering cancels assistance; feeding remains separate; remote actions cannot complete. Save/load during unfurl/response, replace participant, pause and leave reef; require clean recovery and one discovery. **M / P1**; anatomy/readability is principal risk.

### Additional small card — Seen Through a Different Light

**Source → interpretation:** Sparks et al. directly identify *Scorpaenopsis diabolus* in their fluorescence imagery (figure 1G). Blue excitation and filtered observation expose fluorescent emission; this is not self-produced light, and that paper does not establish a voluntary signaling function for this species. Its natural-habitat scorpionfish movie/figure 5A is *S. papuensis*, which must not be relabeled as s21. [Sparks et al. 2014, primary paper and figure 1](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0083259).

**Choice → consequence:** In inspection, choose ordinary illumination or a clearly labeled researcher-style filtered comparison; the same resting fish shows a different emission pattern. This is a brief observation discovery, not a second combat/display ability or a claim that neighbors decode fluorescence.

**Code/art/state:** An inspection-only view enum and dedicated source-matched emission mask; retain position, ordinary behavior and white-light identity. No whole-screen flash or autonomous glow. Save an optional once-only observation flag; closing inspection immediately restores the scene. **Acceptance:** compare both views with the fish fixed, verify the pictured taxon and excitation/filter labels, muted/reduced-flash operation, pause/exit and discovery deduplication. **S–M / P3**, gated on accurate mask art and a useful inspection interface; no full adventure until a distinct supported behavioral consequence exists.

## s54 — Painted frogfish, Antennarius pictus

### Current mechanics, evidence and verdict

Current play is day/reef with a six-second lure ability. “An invitation to dinner” implements ambush/lure/strike. `lure-motion.js` displays the settled player's lure for five seconds of an eight-second cycle, selects existing eligible edible fish and guides them toward its tip; normal feeding confirms capture. Keep this loop separate and intact.

Churaumi Aquarium's exact-species entry describes seabed movement using pectoral and pelvic fins like limbs. Its traditional-Chinese page opened successfully; the Japanese endpoint intermittently failed. [Churaumi Aquarium: Painted frogfish](https://churaumi.okinawa/tc/fishbook/1459836633/). The Australian Museum verifies frequent sponge association and variable color; color alone is not adequate identification. [Australian Museum: Painted Anglerfish](https://australian.museum/learn/animals/fishes/painted-anglerfish-antennarius-pictus/).

**Verdict:** Strong independent locomotion adventure and first prototype recommendation. Use actual fins to walk around sponges. No nibbling/collecting sponges, instantaneous recoloring or claim that real fish obey a stepping-stone graph. Reach/terrain constraints are playful authored geometry.

**Current draft boundary:** `src/frogfish-walk.js` supplies a six-node graph, collision/reach checks, stride phases and world contacts; `src/frogfish-walk-render.js` supplies painted fin parts and terrain. These are concrete implementation drafts, not shipped evidence. Their physical acceptance must include the painted top surfaces and rock volumes: overlapping shelves can place a mathematically valid contact beneath a higher painted plinth. A numerical toe test or a sprite sheet cannot close that geometry/integration gap.

### Card — A Walk Around the Sponge

**New decision:** Pick a reachable support and approach direction; the visually shorter branch contains a gap, so the player can choose a longer grounded route or exit into ordinary swimming.

**Four beats:**

1. Approach a sponge-side patch and choose “Walk here.” Body lowers; pectoral/pelvic support contacts become visible.
2. Choose one of two next support areas through E/large buttons or hotspots. A reach preview explains which is adjacent. Distant clicks do not snap ahead.
3. Walk at most three transitions along the chosen branch. A blocked gap invites another route or “Swim freely”; no fall/damage/energy penalty.
4. Reach the other side of the same sponge, lift the head and view the traversed path. One route logs the discovery, then free exploration resumes.

**Observable consequence:** Planted fins remain fixed relative to a support while the body advances; the moving fin lifts and re-plants before weight shifts. Route choices change the actual path. The sponge stays intact. No lure response, visitor or catch required.

**Bounded physical implementation:** Author one graph with 4–6 stable support nodes and at most 8 allowed edges. Each node contains a support segment/polygon, normal, permitted body footprint and fin contact anchors. Each edge contains a reach bound and a collision-checked body envelope; mark the direct gap invalid and provide a readable valid alternate. Verify against painted scenery: existing `bottomRoutes` are placement hints, not collision geometry. Evaluate only adjacent edges, never infer traversability from screen distance alone. No whole-reef navigation mesh or full physics engine.

During stance, lock planted pectoral/pelvic contacts in world coordinates. Solve a bounded body pose around those anchors; clamp joint reach, lift the swing contact, test its landing point, then transfer support. If the pose or swept body envelope cannot fit, remain at the last valid stance and explain the blocked edge. Contact shadows help verification but do not substitute for contact. A sprite merely bobbing/sliding along a spline fails acceptance.

**Hooks/state/art:** A grounded player mode integrates with actual steering; entry cancels ambush/meal targeting. Normal lure/ambush code is not rewritten into walking. State: version, stage, graph/reef ID, current/next stable node IDs, one of a small contact-phase enum, progress 0–1, selected branch, transition count capped at 3 and `logged`. Contact points derive deterministically from the graph; avoid unbounded per-frame trails. Art requires distinguishable pectoral/pelvic joint layers, readable support anchors, contact shadows and reach preview, retaining Antennarius pictus body shape. No generic tail propulsion during a planted stance.

**Lifecycle:** Pause freezes contacts/body. Mid-step reload resolves to last completed stance without a second award. “Swim freely,” open-water steering, reef departure and stop-story clear all anchors and restore ordinary movement immediately; the player is never stuck awaiting a gait phase. No NPC identity needed. Graph nodes retain stable IDs across saves; missing/changed geometry restores safe free swimming rather than a floating planted pose.

**Real-controls acceptance:** Drive the rendered UI/canvas, not direct helper calls, through both branches, the blocked gap and a distant node. Assert no stage advance until actual contact/body transfer. Capture successive frames: actual painted stance-fin toes stay within a small authored tolerance while body coordinates change; swing fins lift/re-plant; body envelope and limbs never cross sponge/rock or disappear inside another shelf. Verify path changes when the branch changes, no teleport, no skating/bobbing substitute. Steer away and press “Swim freely” mid-step; ordinary swim and subsequent existing lure/ambush must work. Save/load mid-contact, pause/modal, reef exit, invalid-node recovery and replay preserve one discovery. **L / P1**; terrain, articulation and integration together set the cost.

### Subsequent life-stage card — A Tiny Arrival

**Source → interpretation:** Baensch's firsthand culture report identifies *A. pictus* juveniles raised from a floating egg raft and describes a long pelagic larval phase followed by settlement with visibly modified walking pelvic fins. Approximately 80 days was a result of that captive rearing, not a universal wild schedule; his juvenile grouping observations are likewise captive evidence. [Baensch, *Painted Frogfish Culture*, 2022/2024](https://www.frankbaensch.com/marine-aquarium-fish-culture/my-research/painted-frogfish-culture/).

**Choice → consequence:** After an explicitly labeled later-life illustration, opt into one juvenile viewpoint and choose between two reachable sponge-adjacent landing supports. Free swimming and a planted juvenile pose have different visible anatomy and locomotion. The support choice is authored; the source does not establish exact wild habitat preference, parental guarding, or a group-living adult routine.

**Code/art/state:** Separate larval/juvenile paintings and an optional case-study view; bounded `view`, chosen support, stance phase and once-only discovery. Reuse verified walking contacts only after the juvenile geometry is authored; an adult painting scaled down is insufficient. No egg collection, waiting 80 days, offscreen growth or extra live cohort. **Acceptance:** labeling makes the time jump clear; juvenile proportions/fin emergence differ visibly; actual landing agrees with support art; cancel/pause/save/return retains the chosen viewpoint without changing the ordinary adult. **M–L / P3**, a later identity/art-gated chapter, not additional scope for the walking prototype.

## s59 — Longsnout flathead, Thysanophrys chiltonae

### Current mechanics, evidence and verdict

Current play is night/sand and camouflage. “A quiet surprise” already uses shared two-second settle/short strike at bottom ambush sites. Natural-history text explicitly says the camouflage timer does not simulate burial.

The exact-species account from Australian National Fish Collection/CSIRO and Museums Victoria records sandy habitat around reefs and frequent whole/partial burial. It does not establish adjustable depth as a strategy, preferred grain size, current routines, social cooperation or nesting. [Fishes of Australia: Thysanophrys chiltonae](https://fishesofaustralia.net.au/home/species/3369).

**Verdict:** Evidence-backed tactile improvement, weak standalone story. Another hide/wait/strike objective duplicates current play. Prefer species-specific burial rendering/geometry inside existing activity; defer a larger plot pending stronger exact-species evidence. Do not substitute Platycephalus species or generic flounder behavior.

### Small card — Just Above the Sand

**New decision:** Choose a true sand patch versus an adjacent hard edge, then settle or emerge/reposition. No score for maximizing burial depth.

**Three beats:**

1. Swim to a sand/rock boundary and inspect the ground cue.
2. E settles only where the body footprint overlaps sand; a brief sediment sweep occludes the lower outline while keeping the fish legible. Hard ground leaves it above the surface with an explanatory cue.
3. E or open-water steering emerges and restores movement, with a short-lived sand outline. Optional discovery records the observed contrast; no catch requirement.

**Consequence/hooks/state/art:** Patch-tied physical occlusion rather than global transparency; emergence clears concealment. The authored trace is not claimed as measured species-specific behavior. Extend ambush settle/render and cancellation while keeping catch progress separate. Two verified sand masks, one burial amount 0–1 and one bounded sediment/footprint overlay; stable reef/site IDs. No terrain destruction, currents or prey.

**Lifecycle/real-controls acceptance:** Pause freezes burial; cancellation, reef exit and invalid site clear occlusion. Reload must not hide the fish over rock. Actual E/pointer tests compare sand/rock, require movement to reveal, preserve ordinary feeding, reject distant burial, and cover pause/load/replay without duplicate discovery. **S / P2 as extension; M / P3 standalone**. If painted scenery cannot support the footprint check economically, defer rather than present another timer as a new lifestyle loop.

## Delivery and limits

This follow-up edited only this document; it did not change runtime code, assets, tests, audio or saves. It preserves parallel implementation drafts and does not claim that they are integrated or shipped. Institutional exact-species accounts and primary research support the shortlist. Baensch's self-published culture report is firsthand captive observation, with that limitation stated; derivative search results were leads only. Exact-species lifestyle evidence and novelty for s59 remain thin, deliberately reflected in its modest verdict.

Further candidate adjudication: s19's documented small-male female mimicry is a different reproductive tactic, but it needs a labeled *S. apama* breeding vignette, participant roles and substantial new social interaction; another disguise button would repeat the artist. Retain it as research rather than append a shallow challenge. [Hanlon et al. 2005, primary report](https://www.nature.com/articles/433212a). Night-rest observations similarly enrich the named case study but do not justify a second background-matching story. Do not import *Sepia officinalis* learning/egg experiments, *Antennarius maculatus* fluorescence, *Scorpaenopsis papuensis* reef signaling or generic flathead reproduction into these IDs.

## Ranked next decisions — all four IDs accounted for

1. **s54 — [A Walk Around the Sponge](#card--a-walk-around-the-sponge), L/P1:** strongest new bodily choice; close terrain/contact and real-control gates before claiming delivery.
2. **s21 — [The Hidden Fan](#card--the-hidden-fan), M/P1:** documented display; observer hesitation is a bounded game interpretation with accurate anatomy required.
3. **s19 — [A Place Beneath the Rock](#card--a-place-beneath-the-rock), L/P2:** strong exact-species attachment behavior, conditional on honest identity, female role, location and separate story selection.
4. **s59 — [Just Above the Sand](#small-card--just-above-the-sand), S/P2 extension:** visible physical burial is worthwhile; defer a standalone adventure without additional exact-species evidence.

The s21 filtered-light observation and s54 juvenile chapter are P3 expansion candidates. Existing s19 camouflage and s54 lure/strike already provide meaningful behavior and should remain available.
