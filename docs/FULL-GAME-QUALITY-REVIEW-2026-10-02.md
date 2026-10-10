Method: dual-agent (A: /root/quality27_design_a · B: /root/quality30_design_b), within a 30-specialist full-game review.

# Full-game quality and progress review — October 2, 2026

**Verdict: a substantial, attractive, functioning reef game with uneven repeat-play depth.** Visual cohesion is strong. The simulation contains real feeding, care, danger, social routines, and creation persistence. The weakest bridge is between those systems and the player's experience of making a useful choice, seeing an animal respond, and wanting another trip. The latest Windows package also predates important working-tree fixes. Feature coverage is much further along than release acceptance and experiential polish.

This was an assessment, not an implementation or release. Thirty specialist agents reviewed the package, progress, all major gameplay families, presentation, education, persistence, and performance. Fresh ordinary UI sessions were complemented by source inspection, bounded production-model probes, current unit tests, and a native packaged smoke check. The two interface assessments were independent; Assessment A finished before the root read B's detector findings. The conclusions below reconcile their evidence rather than count votes.

The brief remains peaceful mystery, many small reactive interactions, improving at caring for fish, and persistent achievements. Practice is the main development priority. No new original-game research, narration generation, production source changes, package rebuild, build deletion, or Apple Silicon work occurred.

## Progress and evidence

| Deliverable | Actual state | Acceptance boundary |
|---|---|---|
| Creature coverage | 64 catalog creatures; 55 scored-mode species; 57 Practice species including two cleaners | Counted from current modules, not inferred from milestone prose |
| Species journeys | 57 player adventures plus seven resident observations, covering 64 discovery IDs | September 11 evidence records 57/57 and 7/7 assisted completions; this audit did not freshly complete every journey unaided |
| Habitats | Nine distinct illustrated scenes with different resources, communities, shelters, and routes | Painted structures generally do not block swimming or line of sight; inactive habitats freeze |
| Creation | Parts, color/pattern, traits, diet, ability, budget, reversible trial, shelf, guide, persistent identity | Fresh UI confirmed visibly different speed variants, keep, return, and Resume; individual combinations are not exhaustive |
| Persistent progress | 13 badges, played/cared species, habitats, observations, 64 discoveries, four cosmetic title visitor rewards | Some predicates recognize time rather than skill; repeated discoveries add little new memory |
| Education and speech | 64 natural-history entries; 64 introduction and 64 activity narration clips | Transcripts and audio hashes verified; no missing clips. Fresh listening, pronunciation, comprehension, and learning effectiveness unverified |
| Current source regressions | **481/481 unit tests passed**, zero failures/skips | This is functional evidence, not human-fun or continuous-animation acceptance; focused reviewer tests overlap and are not added to this total |
| Real UI play | First-session Neon journey; grazer, cowfish, trout, cleaner visit, both cleaner lives, both escorts, creation; additional guide/map/layout checks | Reviewers used normal controls in isolated contexts. These are adult-agent sessions, not child research |
| Native shipped app | Fresh smoke passed fullscreen/F11, created identity/shelf reload, mimic-host memory, passive poison, zero page errors | Ability checks used controlled fixtures. This does not prove naturally earned campaigns, all native save failures, or restart durability |
| Package integrity | ZIP CRC and all 73 payload files verified; all 492 ASAR entries verified | Intact September 10 checkpoint, not current source |
| Performance/animation | Default mesh-build budget is unlimited; 45 painted-part and 19 mesh rigs | Historical visible RTX 2080 runs have zero deferrals; current full-frame timing and normal-speed roster feel remain unverified |

Current source baseline: HEAD `2d570d53da4207e4634866314c693aeff608dc77` plus pre-existing uncommitted September 11 integration fixes. A commit ID alone does not identify the reviewed working tree. The package comparison preserves exact bytes and its complete diff.

The actual latest archive is `dist/Atoll-Down-Under-Windows-Original-Abilities-2026-09-10.zip`, 264,615,306 bytes, SHA-256 `86b4511898712624f556adfe7aabbaaa057009fd8dbd981fe0e586461733fe3f`. Its ASAR is `87ee1b9de5304974211adb89d879c4daf9677c31327b69070c06181e34c9a7e8`, matching runtime `f5f0b28`. Twenty-six current source files differ and `world-dimensions.js` is new. The old package has a complete old import graph; the missing newer helper is not an existing package startup failure.

Fresh extracted-package probes reproduce old validation bypasses, terminal metadata loss, exhausted mimic-host energy/score farming, the missing recovery sound alias, and failure to mute an already-playing effect. The current source passes those same boundaries. Other package/source differences include contact, defense, journey, modal, journal, and picking fixes. Keep the named checkpoint as rollback; do not present it as delivering current fixes. README and progress documents also lag behind implemented coverage.

Evidence: [unit log](../artifacts/quality-review-2026-10-02/units.log), [native report](../artifacts/quality-review-2026-10-02/package-native/report.json), [package audit](../artifacts/quality-review-2026-10-02/02-package.md), [exact runtime diff](../artifacts/quality-review-2026-10-02/package/runtime-diff.patch).

## Are the gameplay loops fun?

These are evidence-backed reviewer judgments. They identify good sources of agency and likely repetition; they do not establish enjoyment by the user or daughter.

| Loop | What makes it engaging | What currently limits it | Judgment and next move |
|---|---|---|---|
| Basic swimming and meals | Assisted approach, actual mouth contact, anticipation, one commit, immediate cancellation; species differ in size/agility | Tiny food competes with coral; unsuitable-food feedback comes late; large turns have a discontinuity | Dependable foundation. Improve recognition and continuity before adding more goals |
| Grazing | Choose a patch, see consumption, leave space, revisit recovery | Repeat use of the same patch is easy; recovery freezes offscreen; completion can replace useful guidance | Pleasant, but revisit needs a visible local consequence and continuing guidance |
| Sand search / cowfish / goatfish | Search → uncover → eat or share; a clear change in the world caused by the player | Cowfish reveal is immediate even facing away; NPCs can consume some unrevealed hidden food; shell preparation is shared | One of the strongest foundations. Preserve its cause/effect and repair inconsistent reveal rules |
| Cleaner wrasse and shrimp | Choose a real client, approach, remove actual parasites, restore health and gain nourishment; swimming away interrupts | Eligibility is hard to recognize; select–wait–result repeats; shrimp contact is subtle; cancellation briefly leaves stale Helping text | Calming and readable. Enrich client response/inspection rather than simply extending treatment timers |
| Visiting a cleaner | Feeding, parasite care, and refuge form a understandable care circuit; Fresh Again is a fitting reward | Hunger guidance can obscure parasite need; repeated service has little variation | Useful ritual. Show both needs and distinguish parasite treatment from injury recovery |
| Schools | Real cohesion, spacing, hunger excursions, actual shared patch consumption | Basslet/anthias can wait about 18 seconds for a response in seed 42; fusilier completion does not require a schoolmate meal | Functionally social, weakly reciprocal. Make acceptance, feeding, and regrouping visible |
| Companions and home | Specific buddy/host identity, real individual needs, safe return; several ordered diets differ | Reunions are understated; player companions release on habitat travel; repeat memories are shallow | Promising attachment loop. Remember a few individuals/places and give returns a response |
| Trumpetfish and flashlight fish | Moving cover and attracted plankton offer different ways to live | Trumpetfish's observed host remained at home, so cover choice barely mattered; guidance can recommend a distant habitat unnecessarily | Flashlight play has stronger agency. Let useful local circumstances drive cover decisions |
| Watching and ambush | Frogfish lure/strike and trout lane/dash offer distinctive actions | Several watchers use settle → gaze → meal → return; gaze and clicked prey can disagree | Keep deliberate stillness, but make observation affect a choice rather than merely satisfy a timer |
| Patrols and large predators | Nine species have five substantive rule variants, different handling/hunger, routes and prey constraints | Routes/quiet returns are similar; H can mark food that cannot advance the current sequence/size goal | Working coverage. Align guidance with the current goal and make one or two decisions per family more distinctive |
| Resident observation | Follow a living individual through an actual meal, withdrawal, rest or movement | Small appendages are difficult to see; digestion can make repeat observation a long wait | Appropriate quiet play. Improve normal-size visible behavior and offer other observations while waiting |
| Create and keep a fish | Personal authorship, visibly different speed, reversible trials, persistent identity | Numeric traits/budget are hard to predict; head/body patterns show seams; second trips add the same four deduplicated memories | A strong long-term hook. Add a plain-language life preview and specific recent memories |
| Challenge and Tournament | Structured progression and existing lifecycle handling | Score gates interrupt care; mixed leaderboard outcomes; retry forfeiture is unclear; full earned campaigns lack fresh acceptance | Secondary priority. Establish fair endings/persistence before revisiting tournament structure |

## Cohesion

**Visual identity is strong.** Stone title, wreck, varied reefs, species portraits, parchment panels, guide, map, and family journal look authored for one game. The habitats are not merely nine recolors. A quiet title-start invitation could help a child while preserving the requested menu composition.

**Mechanical cohesion is partial.** Food, hunger, treatment, predation, shelter, and social interruptions are real. Yet cues and achievements do not always reflect the same rules. Journey feeding can count at full energy while meal/care badges require actual nourishment. Plankton restores at most nine energy, so plankton-only lives can never earn the global First Good Meal badge's ten-energy single-meal threshold. Ordinary H hints use dietary suitability without every current journey's food-order/size requirement. NPC cover/blending can change pose and position without the player's corresponding concealment benefit.

**Long-term cohesion is weakest.** The permanent journal is sound, but first discovery often becomes the end of the authored invitation. Repeated activities may reset internally while showing generic Discovered text, companions rarely acknowledge a return, and custom memories remain four one-time strings. The next improvement should make the reef remember a small useful event and react to it. Avoid replacing this with compulsory daily chores or endless repeat counters.

**The ecosystem is lively without excessive density.** Across 108 generated habitat samples, counts were 9–21 NPC animals with one or two hunters and exactly one cleaner; the authored envelope is 9–23. Eighteen ordinary 90-second day/night simulations recorded 332 resource meals, 17 animal meals/deaths, ten respawns, and 26 NPC cleanings. Alive counts fell by at most two. Quiet Grotto and Pearl Sands remain quieter than Terrace/Cathedral. Visual congestion comes partly from detailed scenery and weak salience, not runaway populations. Improve existing animal stories before adding animals broadly.

The world is a set of locally active habitats, not a globally advancing ecosystem. That boundary is consistent and useful for current scope. School meal waves currently depend on the player's trip; ordinary NPC meals do not initiate them. Loose groups and host groups also lack fully distinct general motion rules. These are bounded opportunities, not a reason to rebuild the whole simulation.

## Five priorities

Severity here is development priority within the current family-game brief. P1 means resolve before claiming a polished testing release; it does not imply every item causes a crash.

### 1. P1 — Make interactions fair, continuous, and consistent

Multiple docked hunters can remove 70 health in one simulation frame; three can kill a healthy player. The fixture proves the absent shared hurt guard, not the natural encounter frequency. Preserve predators and their existing six-second chase/15-second rest/45–80-second digestion. Add a short shared bite reaction window or explicit encounter staggering, then verify defense/escape after the first bite.

Related bounded defects: closed north/south edges classify a zero-velocity fish as moving, deny rest, and charge the higher energy rate; width-only circular picking selects well outside a thin fish; a turn pivot flips sign at the mirror midpoint (white-shark transform jump 168.48 world pixels); watch gaze and click can select different prey; failed leaderboard writing followed by Retry discards the live score and overwrites Last dive. Fix these with production-contract tests and visible interaction checks, rather than more broad progression tests.

Suggested UI workflow: `impeccable harden` / `impeccable animate` for feedback and continuity; simulation fixes need their normal focused code workflow.

### 2. P1 — Make a useful action recognizable without the activity card

Show an explicit Food hints control beside readable diet/status text, suitable-target feedback, and compact world cues for the current opportunity. Keep cues available when Activity is collapsed. Align marked food with the active journey's food order, minimum prey size, and defended-prey exclusions. Ensure the watching/click target agree.

Name protected watching and ordinary reef life clearly. A food selection—including an unsuitable attempt—can end protection before a meal, while the banner says Eating. Give the transition a gentle durable status, useful recovery/shelter guidance, and preserve pause. Do not add blocking confirmations. Provide keyboard steering and nearby-organism focus/cycling, manageable listbox focus, and a visible canvas focus state. At compact desktop sizes, scroll the selected species into view and make the creation preview fit its scrollport.

Suggested workflow: `impeccable clarify`, `impeccable harden`, `impeccable adapt`.

### 3. P1 — Turn completed coverage into worthwhile repeat journeys

Present the existing 64 discoveries as named achievements with visible collection progress; keep the 13 broad badges as family milestones. Separate the permanent discovery flag from the active trip's guidance. Add one consistent voluntary replay action and a small persistent record of a particular habitat, food, host/client, or useful response. Preserve identity plus incarnation so a replacement animal is not falsely remembered as the original.

Resolve feeding incentive semantics alongside the protected on-ramp. Do not simply require missing energy everywhere: new lives start full and protected. Technique observations can recognize a first feeding technique honestly, while nourishment/care rewards should recognize actual benefit. Use cumulative or diet-relative nourishment for small-meal species. Show enough care progress to explain a reset without turning it into an optimization chore.

Suggested workflow: `impeccable shape`, `impeccable clarify`, `impeccable delight`.

### 4. P2 — Make existing animals visibly respond

Start with one school, one companion, one cleaner interaction, and a shark/reef-fish animation family. Let an ordinary NPC meal start a bounded feeding excursion; retain hunger, danger, service, and handling precedence. Give acceptance, yielding, feeding, and reunion a small recognizable movement. Add clear shark jaw/contact action and smooth turn/stop/stroke presentation at actual playing size. Preserve the cuttlefish direction and unlimited default animation budget.

Extend family rules after representative behavior is convincing, then inspect every affected species. Require normal-speed recordings of idle, swim, turn midpoint, approach, actual contact, cancellation, and recovery at 1024 and 1600 widths. Changed pixels, rig counts, and zero deferrals cannot establish convincing movement. Terrain collision/occlusion could later make landmarks more consequential, but avoid introducing a general obstacle engine before these smaller response gaps are resolved.

Suggested workflow: `impeccable animate` / `impeccable delight`.

### 5. P1 — Accept and release the actual current Windows game

Freeze an explicit source/asset snapshot, correct the progress documents and stale mechanics descriptions, build Windows from that snapshot, compare the new ASAR against intended inputs, and run acceptance on that executable. Preserve and label older checkpoints until the replacement is accepted. Use a fresh release name and hash receipt.

Acceptance must include same-profile offline restart of settings/journal/creations/Last dive; storage failure and terminal score handling; ordinary feeding/cleaning/social/creation trips; fullscreen/focus; audio mute and missing-clip fallback; and a small native performance/motion sample on the user's actual display. The current harness hides ATOLL_QA windows, so future presentation checks must explicitly show and verify the test window. No fresh package or current frame benchmark was produced by this review.

Suggested workflow: `impeccable document` for authoritative state; standard Windows build and package verification tools for delivery.

## Interface design assessment

The ten-heuristic score is an interface rubric, not a percentage-complete or fun score. Assessment A found strong specificity and weak recognition. B's static detector returned zero findings for main.js/creation-ui.js, while independent browser confirmation found compact-layout and keyboard gaps. A clean detector does not contradict the runtime observations.

| Heuristic | Score / 4 | Main implication |
|---|---:|---|
| System status | 3 | Good meters/cooldowns; protection transition is understated |
| Real-world match | 3 | Friendly ecological language; numeric creation traits need interpretation |
| Control and freedom | 3 | Pause/cancel/reversible trials are strong |
| Consistency | 3 | Coherent surfaces; guide transitions and replay affordances vary |
| Error prevention | 3 | Current validation is sound; target ambiguity remains |
| Recognition rather than recall | 2 | Food, goals, and immediate care facts are hard to find |
| Flexibility and efficiency | 3 | Many shortcuts; no keyboard swimming, inefficient species list |
| Aesthetic/minimalist design | 2 | Strong art; scenery and small critical labels compete |
| Error recovery | 3 | Useful storage recovery; retry after failed score save still loses the result |
| Help and documentation | 3 | Extensive guide/speech; practical facts and current-step help need priority |
| **Total** | **28/40** | **Good foundation, with recognition and play feedback to improve** |

High cognitive load is concentrated in chooser, guide, and workshop: four of eight checklist items fail, including competing live focus, more than four visible decisions, and many creation decisions at once. Seven guide categories, 57 selector tab stops, and 15 ability choices are concrete examples. Grouping and reversible experimentation work well; do not remove depth merely to meet an arbitrary option count.

For a first-time child, the risks are the quiet start path, tiny food, reading-heavy instructions, and unexpected exposure during learning. For a supporting adult, operational facts appear below descriptive guide content and creation numbers demand trial-and-error translation. Keyboard/low-vision users encounter pointer-only primary play, small 10–12 px critical labels, and absent arrow navigation in the species list. These are observed interface/source limitations; actual child and screen-reader outcomes remain untested.

## Smaller but material follow-ups

- Four current paintings conflict with their own supplied field-guide identifying features: clown triggerfish, orange-spotted filefish, pencilled rabbitfish, and golden snapper. Reconcile art with the already accepted descriptions; no new taxonomic research was conducted. Moorish idol and bannerfish could also be easier to distinguish.
- Sea-star and urchin model-limit text still says stationary/fixed despite current crawling. The asset manifest lists only 90 of 239 files; the 149 omissions are bookkeeping omissions, not missing runtime assets.
- Guide facts should lead descriptive narration. Current activity speech replays a complete instruction clip rather than the current step; decide useful short help before generating more audio. Spoken quality was not freshly listened to.
- Music switches and repeated event sounds deserve a listening pass. Track durations of about 107/128 seconds establish repetition potential, not a measured annoyance. Badge/title visitor rewards could have a more connected quiet payoff.
- WebGL context loss permanently switches this session to Canvas; no restoration handler exists. Busy-scene fallback cost is unmeasured. DPR is capped at two, mesh raster width at 640, and sampled poses remain quantized; default motion has no finite build-time cap. Change these only after visible evidence at the target display.
- Score-based Practice ending and automatic stage changes can interrupt a caring activity. Prioritize a continuation/reflection flow over tournament redesign. Campaign difficulty needs normally earned representative runs before changing thresholds.

## Staged next work and exit criteria

These are ordered work fronts, not a promise that every item fits one day. They keep implementation contracts and acceptance explicit.

1. **Interaction correctness.** Own the shared damage window, closed-boundary rest, displayed picking geometry, turn continuity, watch target identity, goal-aware food hints, and failed-score retry recovery. Exit: focused regressions plus visible normal-control encounters; no reduction in predator population or species handling differences.
2. **Readable Practice.** Own diet/food/status cues, first-action exposure transition, collapsed-card opportunities, compact layouts, keyboard play/list navigation, and living-trait summaries. Exit: a new player can find a suitable meal, identify risk, pause, and use one species action without an adult reading the guide. Direct family verification is needed for that claim.
3. **Meaningful second trip.** Own active-trip versus permanent discovery state, 64-discovery presentation, care semantics, replay action, and specific memory persistence. Exit: after finishing, saving, restarting, and choosing another trip, guidance remains current and a materially different useful event leaves a small retrievable memory. No repeat grind or absence penalty.
4. **Living response and animation.** Establish explicit precedence/cancellation for danger → service → feeding/handling → social/routine behavior. Add autonomous meal stories and reciprocal cues; polish representative motion then cover affected families. Exit: normal-speed native clips and live observation show why an animal acts, who responded, and a readable turn/bite/return. Source counters alone do not pass this stage.
5. **Windows acceptance.** Freeze hashes; build/verify/archive the new checkpoint; test offline same-profile restart, failures, representative ordinary journeys, fullscreen, audio, and bounded visible performance. Exit: tested EXE/ASAR/ZIP and source manifest all agree, docs name that checkpoint, and the family session supports the intended relaxed experience.

The highest-value human session is 15–20 minutes: first meal without coaching, one needed cleaner interaction, one social/sand activity, then a voluntary second trip or created-fish return. Record wrong targets, assistance, unexplained waits, whether responses are noticed, and whether the player chooses to continue. Voluntary continuation and understanding why an action helped are stronger fun evidence than journey counters.

## Reconciliations and limits

The cleaner-station review initially extrapolated a roughly 13-minute NPC wait from entity()'s default health. Root checked populate(), which sets seeded forager/hunter health to 60–100; fish below 65 can need a cleaner immediately. The specialist corrected its report. Only an actual 100-health fish needs roughly 778 active seconds to cross the automatic queue threshold. The 26 observed model cleanings corroborate that this is not a universal delay; no earlier-client population change is recommended.

A root CUA session approached the marked cuttlefish reef, activated blending, and progressed to the next sand instruction. The initial Move closer message was an unmet approach condition, not an established activity stall. Screenshot: [current cuttlefish](../artifacts/quality-review-2026-10-02/root-cuttlefish.png).

Historical animation boards precede later tail/cuttlefish/mouth-mask fixes. They were not used to reopen repaired defects or prove current motion. Historical performance reports explicitly record visible windows; the current hidden-harness caveat must not be applied retroactively. No current performance regression was demonstrated.

No actual daughter/child session, full current unaided roster sweep, normally earned full campaigns, continuous current roster animation playback, fresh audio listening, complete same-profile native restart test, or current full-frame benchmark occurred. These are acceptance gaps, not invented failures. No P0 crash/blocker was established by this audit.

## Thirty specialist reports

All 30 completed. Reports retain their narrower evidence, reproductions, screenshots where used, and limitations.

| # | Scope | Report |
|---:|---|---|
| 1 | Progress and completion | [01](../artifacts/quality-review-2026-10-02/01-progress.md) |
| 2 | Actual Windows package | [02](../artifacts/quality-review-2026-10-02/02-package.md) |
| 3 | Unassisted first session | [03](../artifacts/quality-review-2026-10-02/03-onboarding.md) |
| 4 | Child usability and care risks | [04](../artifacts/quality-review-2026-10-02/04-child.md) |
| 5 | Movement, picking and turns | [05](../artifacts/quality-review-2026-10-02/05-movement.md) |
| 6 | Feeding and food recognition | [06](../artifacts/quality-review-2026-10-02/06-feeding.md) |
| 7 | Danger and fairness | [07](../artifacts/quality-review-2026-10-02/07-danger.md) |
| 8 | Cleaner visits | [08, corrected](../artifacts/quality-review-2026-10-02/08-station.md) |
| 9 | Playing both cleaner species | [09](../artifacts/quality-review-2026-10-02/09-cleanerplay.md) |
| 10 | Schools and companions | [10](../artifacts/quality-review-2026-10-02/10-school.md) |
| 11 | Escort journeys | [11](../artifacts/quality-review-2026-10-02/11-escort.md) |
| 12 | Home, refuge and attachment | [12](../artifacts/quality-review-2026-10-02/12-home.md) |
| 13 | Sand and preparation | [13](../artifacts/quality-review-2026-10-02/13-sand-tools.md) |
| 14 | Watching and ambush | [14](../artifacts/quality-review-2026-10-02/14-watch-ambush.md) |
| 15 | Patrol/predator journeys | [15](../artifacts/quality-review-2026-10-02/15-patrol.md) |
| 16 | Workshop and trials | [16](../artifacts/quality-review-2026-10-02/16-workshop.md) |
| 17 | Created life and persistence | [17](../artifacts/quality-review-2026-10-02/17-created-life.md) |
| 18 | Rewards and replay | [18](../artifacts/quality-review-2026-10-02/18-rewards.md) |
| 19 | Practice cohesion | [19](../artifacts/quality-review-2026-10-02/19-practice.md) |
| 20 | Scored modes and endings | [20](../artifacts/quality-review-2026-10-02/20-modes.md) |
| 21 | Habitat variety | [21](../artifacts/quality-review-2026-10-02/21-habitats.md) |
| 22 | Ecology and density | [22](../artifacts/quality-review-2026-10-02/22-ecology.md) |
| 23 | Animation evidence and quality | [23](../artifacts/quality-review-2026-10-02/23-animation.md) |
| 24 | Art and anatomy | [24](../artifacts/quality-review-2026-10-02/24-art-anatomy.md) |
| 25 | Atmosphere and audio | [25](../artifacts/quality-review-2026-10-02/25-atmosphere.md) |
| 26 | Education and narration | [26](../artifacts/quality-review-2026-10-02/26-education.md) |
| 27 | Independent design assessment A | [27](../artifacts/quality-review-2026-10-02/27-design-A.md) |
| 28 | Saves and recoverability | [28](../artifacts/quality-review-2026-10-02/28-saves.md) |
| 29 | Performance and renderer | [29](../artifacts/quality-review-2026-10-02/29-performance.md) |
| 30 | Independent detector/browser assessment B | [30](../artifacts/quality-review-2026-10-02/30-design-B.md) |

## Questions for the next pass

1. After the interaction/readability fixes, which source of replay should lead: **remembered fish and homecomings** (recommended), **richer school/client reactions**, or **more varied species challenges**?
2. For Practice's unclear safety transition, which direction fits best: **gentle ecology with clear risk cues** (recommended), **an optional always-safe exploration setting**, or **more survival tension**?
