# Rays and large sharks: biological adventure research

Research updated 10 October 2026. **Planning only; no runtime, asset, audio or original-game changes.** Covers **s27 blue-spotted stingray, s34 great white shark, s35 tiger shark and s37 electric ray**.

## Current game and verdict

Read `src/data.js`, `natural-history.js`, `animal-profiles.js`, `adventures.js`, `foraging-journeys.js`, `patrol-journeys.js`, `watch-journeys.js`, `ambush-activity.js`, `sand-search.js`, `ability-rules.js`, `diet.js`, `feeding-contact.js`, `geometry.js` and relevant `simulation.js`/`main.js` controls. Proposed distances, speeds and controls are game abstractions.

| ID / taxon scope | Existing behavior | Next direction | Size / priority |
|---|---|---|---|
| **s27**, Dasyatidae; species unresolved | `stingray-sifting`: shrimp, then worm at a separated patch; real sand uncovering already alerts neighbors | Resolve identity first; tide-linked access conditional | Identity S / P0; adventure L / defer |
| **s34**, *Carcharodon carcharias* | `white-shark-meal`: fixed-lane 360-unit survey, sufficiently large fish, calm return | Same-identity passing encounter if a real conspecific exists | M / P2, cohort gate |
| **s35**, *Galeocerdo cuvier* | `tiger-varied-route`: lower-water survey, fish then crab, return | Dive/glide geometry beyond patrol; needs truthful depth and momentum | L / defer |
| **s37**, *Hypnos monopterygius* | `electric-ray-watch`: settle, aim at meal, approach, return; Space already stuns nearby actors | Soft-substrate placement and mouth-first contact; pulse observation cheaper alternative | M–L / P1 after pose/contact gate |

Mouse movement steers; click ordinarily approaches food; E/context invokes activities; Space invokes an active ability; H shows food hints; M opens the map; Escape/P pauses; Ctrl+S saves. Non-food scene targets require their own dispatch and labels. No spawned prey/companions, forced hunger, graphic predation, or expanded electrical weapon. Timers may animate/debounce, not award a biological outcome. Save committed consequences and bounded identity references, freeze pause/offscreen work, revalidate id+incarnation, and clear pending observations without erasing valid completed world changes.

## Conditional earlier candidates

**s27 — Follow the water onto the flat.** Only after species resolution: inspect open shallow and deeper-edge channels, choose with E, physically swim the branch, optionally feed, and leave through the remaining connected opening as access changes. Changing access makes real bottom surfaces reachable; feeding is never a quota. *Taeniura lymma* is a named example, not the resolved s27 identity. [Fishes of Australia: Taeniura lymma](https://fishesofaustralia.net.au/home/species/2030); [Fishes of Australia: Neotrygon australiae](https://fishesofaustralia.net.au/home/species/2019).

Needs typed habitat channels, readable water edges and a safe exit beside `reef-stories.js`/input hooks. Bound to two links, three existing patch references and one reef/taxon/route/phase record. Pause freezes phase; offscreen time cannot strand the ray; reload preserves safe connectivity without teleporting to completion. Test both branches using E/mouse, decline every meal, and save during closing access. **L / defer:** the map has no tidal-access system.

**s34 — Above and below, held fallback.** Surface and near-bottom cruising have species-level support, but another y-lane adds little. Require actual occlusion to reveal different existing information from the two approaches, rather than x-ray targets, mandatory eating or a home-return timer. Bound to two view anchors and three living target references; test distinct visibility and an empty-scene exploration finish. [Florida Museum: White Shark](https://www.floridamuseum.ufl.edu/discover-fish/species-profiles/white-shark/).

**s35 — Environmental corridor, defer.** Regional salinity/bathymetry habitat choice needs absent condition zones and connected coastal geography. A seagrass predator-cascade scene also needs the documented grazers: turtles/dugongs are absent, and rabbitfish are not evidence-backed substitutes. Do not claim broad diet makes plastic useful food. Preserve the existing varied feeding loop while these dependencies remain absent. [D’Antonio et al., 2025, regional Shark Bay study](https://www.nature.com/articles/s41598-025-92272-6).

**s37 — A pulse at close quarters, economical alternative.** Select one existing eligible prey, preview the actual nearby actors affected by the ordinary game pulse, reposition or leave, then use Space once. Observe the same prey's ordinary catch or recovery and inspect the result. Position changes real affected actors; the game must not imply focused electricity or altruistic protection. [Fishes of Australia: Coffin Ray](https://fishesofaustralia.net.au/home/species/1843).

Hook actual events in `ability-rules.js`, ordinary capture/contact and `reef-stories.js`. The current 230-unit radius, four-second stun, twelve-second cooldown and eight-energy expenditure are authored. Bound to one reef, prey id+incarnation, at most three observation references, pulse serial, stage and result; the record cap must not suppress other actual bystanders. Static reduced-motion outlines suffice. `tickWatchJourney` cancels watching during active abilities, so this needs independent ownership. Test catch/recovery, no-prey pulse, different-fish non-credit, cooldown spam, pause during stun, save without repeated pulse and map return without unseen recovery credit. Missing prey permits honest no-catch resolution. **M**, with no hunger wait or repeated Space gate.

## Further investigation beyond pulse and patrol

The supplementary pass also read `animal-profiles.js`, `ambush-activity.js`, `diet.js`, `feeding-contact.js` and `geometry.js`. The four cards below refine the slate; they are not claims that a new biological system is already implemented.

### s27 — Diagnostic identity before a tidal adventure

The Australian Museum distinguishes *Taeniura lymma* by disc/pelvic blue spots and blue stripes along either side of the tail, and describes rising-tide shallow feeding and falling-tide return to deeper shelter. These statements apply to that **named species**. The common label alone cannot separate it from a *Neotrygon* maskray. [Australian Museum: Bluespotted Fantail Ray](https://australian.museum/learn/animals/fishes/bluespotted-fantail-ray-taeniura-lymma-forsskal-1775/).

Compare actual catalog/sprite morphology with those diagnostics before choosing a species-specific card. An explicitly named case study needs matching art and clear scope. The tide card above stays **L / deferred** because typed channels, water phase and safe exits do not exist yet; family identity cannot justify compulsory schooling or burial. No runtime rename belongs in this research deliverable.

### s34 — Passing company

**Observed/source:** biologging off Guadalupe Island measured varying white-shark associations and individual depth use. Many associations could be random; some were stronger. This supports variable encounters, not universal friendship, stable schools or coordinated attacks. [Papastamatiou et al., 2022, primary study](https://doi.org/10.1098/rsbl.2021.0599); [PubMed abstract](https://pubmed.ncbi.nlm.nih.gov/35317626/).

**Choice → real consequence:** encounter one existing living conspecific; choose a parallel offset or give it space by taking the other side. Steer through one actual crossing while the neighbor retains its own route and normal priorities. Inspect whether that same individual continued alongside, separated or crossed behind. All are truthful outcomes; no food gate, guaranteed accompaniment or follow timer. Courtesy/separation corrections are game abstractions, not proven social signals.

**Files/art/state:** `reef-stories.js`, identity checks from companion/escort machinery, ordinary movement in `simulation.js`, spacing in `social-motion.js`. Do not call a companion invitation that breaks existing relationships. One reef, one id+incarnation, chosen flank, two previous positions/headings, bounded displacement/crossing evidence and result enum. Reuse shark art with a quiet flank preview. If no eligible conspecific exists, offer exploration and preserve the current patrol; do not spawn, replace or teleport a shark. **M / P2 conditional** on natural availability within the current allocation budget.

**Acceptance:** start locally with UI/E, select flank and physically swim the crossing without eating. A stationary player cannot finish; test both passing outcomes. Pause freezes movement. Save/reload preserves committed evidence for matching actors and requires fresh visible contact; missing/reincarnated fish clear pending credit. Reef travel grants no unseen association. If availability cannot be supported honestly, defer this card.

### s35 — A long glide

**Observed/source:** tags on 21 tiger sharks at Ningaloo linked oscillatory vertical movements and habitat-dependent dive geometry to modeled transport costs using acceleration as an expenditure proxy. Gliding varied; some individuals recorded none. This does not supply a universal optimum or an exact game energy refund. [Andrzejaczek et al., 2020, primary study](https://pmc.ncbi.nlm.nih.gov/articles/PMC7481696/); [PubMed abstract](https://pubmed.ncbi.nlm.nih.gov/32968529/).

**Choice → real consequence:** in a future readable water-column section, choose a shallow descending glide or a direct powered descent, then resume powered swimming to clear the bottom. Inputs must change actual momentum, tailbeat pose, clearance and effort; trade horizontal reach against depth change. Finish after a real ascent/descent cycle and inspect its trace without eating. A simplified energy comparison must be explicitly authored.

**Files/art/state:** movement ownership in `simulation.js`, compatible shark glide/tailbeat animation, typed depth/bottom geometry and a small trace overlay. Present screen y and map travel are not calibrated depth; do not relabel them as metres. Bound to one corridor, two approaches, powered/gliding enum, finite velocity, two extrema and displacement evidence. No extra prey. **L / defer** until shared scene/movement work is justified.

**Acceptance:** UI/E changes powered/gliding motion; mouse steering creates different actual traces/clearances. Waiting cannot finish. Test safe cancellation, pause, map travel and reload without a velocity leap or unseen energy savings. A cosmetic route recolor or another lower-water patrol fails the novelty gate. This is a stronger research direction than adding another food category; retain current gameplay meanwhile.

### s37 — Under the sand, a mouth-first opportunity

**Identity/source:** the accepted *Hypnos monopterygius* identity is checked against the Australian Museum and Fishes of Australia, including its very short tail, rear dorsal fins and burial in sand/mud. The Museum's **captive-management account** describes prey passing the nose, fast attacks with discharge, head-first swallowing and reburial. Treat that as a captive account, not a quantified wild success rate. [Australian Museum: Coffin Ray](https://australian.museum/learn/animals/fishes/numbfish-hypnos-monopterygium-shaw-nodder-1795/).

Stomach-content and morphology research found bottom-associated fishes and cephalopods, especially octopus, dominant in its sample. Its family comparisons distinguish Hypnidae/Torpedinidae from Narcinidae. Do not transfer generic numbfish feeding or electric-eel behavior, and do not invent an octopus by recoloring a crab. [Frost, Jacobsen & Bennett, 2017, primary abstract](https://doi.org/10.1071/MF16200).

**Choice → real consequence:** inspect two soft-bottom contact bands; choose placement and nose orientation relative to an existing eligible fish's actual path. E settles **only at substrate contact**, leaving a small persistent depression; steering undoes the pose. Let the fish pass or use the ordinary Space pulse when it really enters the local opportunity. A catch requires ordinary anatomical mouth contact and the same incarnation. Inspect the depression/reburial afterward; an observed missed pass is a valid outcome. A remote click, generic watch timer or shock alone cannot finish.

**Files/art/state:** `reef-stories.js`, watch patterns, `feeding-contact.js`/`feeding-motion.js`, actual pulse events in `ability-rules.js`, and typed soft-substrate data. The generic ambush routine currently excludes s37; simply adding its ID would not create this surface interaction. Need depression/burial art and a verified ventral mouth/head-first pose. No forced food-size exception or extended bite reach. Bound to two substrate descriptors, one chosen site, one prey id+incarnation, phase, contacted/depressed flags, observed pass/catch result and a committed pulse serial. **M–L / P1 after contact/pose prototype**. If underside contact cannot be represented honestly, use the narrower M pulse-observation card above.

**Acceptance:** use actual UI/E, mouse movement and optional Space. Above-bottom settling, remote E and wrong placement cannot create a depression/catch. Another stunned or eaten animal earns no selected-prey credit. Demonstrate voluntary no-catch resolution, moving away, pause, save/reload after surface change, and prey disappearance/reincarnation. Preserve committed depression/result; clear pending observations on restore; grant no offscreen passage or duplicate pulse.

## Recommended delivery order

1. **s37:** prototype soft-substrate contact/head-first pose; use actual pulse observation if those dependencies exceed scope. [Primary diet/morphology evidence](https://doi.org/10.1071/MF16200).
2. **s27:** resolve identity as editorial research, without silently renaming the sprite; tidal access remains deferred. [Museum diagnostics](https://australian.museum/learn/animals/fishes/bluespotted-fantail-ray-taeniura-lymma-forsskal-1775/).
3. **s34:** test natural availability for a same-identity passing encounter. Depth-view remains a fallback only if it materially changes visibility. [Primary association study](https://doi.org/10.1098/rsbl.2021.0599).
4. **s35:** keep dive/glide and environmental scenarios on the later shared-system roadmap; retain the present varied feeding loop. [Primary dive study](https://pubmed.ncbi.nlm.nih.gov/32968529/).

No tests were added or run: this deliverable is research/design only. Acceptance items above are future implementation checks, not claims of passed runtime tests.
