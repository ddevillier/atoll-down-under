# Species adventures: next implementation sprint

Research and plan, 10 October 2026. This is a proposal, not a claim that the new adventures are implemented or playtested. Twenty research assignments cover the actual 64-creature roster: 57 creatures playable in Practice (55 standard plus two cleaners) and seven residents. The linked reports distinguish observed biology, game interpretation, current code, and unresolved species identity.

## Recommended direction

Build a set of genuinely different things to do: tend a home, exchange roles, walk over terrain, construct a nest, fit into a refuge, interpret a neighbor, and navigate by living light. Keep the existing five expanded stories and all current journeys. A species does not need another story when its distinctive behavior already has good gameplay.

The next sprint should deliver the six core adventures below, the small accuracy corrections, and the shared integration/verification work. Treat Lantern Company as the preferred additional flagship after its explicit identity and population gates. Other researched cards remain an ordered expansion queue, not promises hidden inside this scope. S/M/L estimates express relative engineering/art complexity, not calendar deadlines.

## Core adventure cards

| Order | Creature / adventure | Player loop and visible payoff | Implementation boundary / evidence |
|---|---|---|---|
| 1 | **Humbug damselfish — Coral Housekeeper** (s30, M) | Inspect a dusted branching colony → choose a pocket and approach direction → physically clear sediment → inspect the uncovered branch detail. The colony retains the visible change; a nearby resident may use it. | Author a verified Pocillopora damicornis colony, two contact targets and a bounded sediment mask; clearing reveals existing surfaces, not instant coral recovery or new geometry. Existing home anchors and story dispatch are reusable. Exact-species experiment supports sediment removal; particle-direction puzzle is our interpretation. [Research/card](species-adventure-research/01-coral-homes.md). |
| 2 | **Foxface and pencilled rabbitfish — Your Turn to Look** (s8/s52, M) | Choose a grazing nook with a real companion → take the lookout position → respond to passing movement → swap roles and take a real bite while the companion watches. | Add role arbitration and readable upright/grazing poses to existing companion identity and feeding. Do not repeat the current both-feed-and-regroup journey. Both taxa were studied; deliberate moral fairness and decoded fin language were not established. [Research/card](species-adventure-research/06-paired-browsers.md). |
| 3 | **Painted frogfish — A Walk Along the Reef** (s54, L) | Inspect two short terrain routes → plant walking fins on reachable footholds → shift weight around an obstacle → settle at a chosen lookout. | A bounded foothold graph, planted fin contacts and body movement must agree. Preserve ordinary swimming and existing lure/strike play. No sliding sprite dressed up as walking. [Research/card](species-adventure-research/12-camouflage.md). |
| 4 | **Royal gramma — A Little Room Under the Roof** (s3, M–L) | Opt into a nesting-male role → choose a ledge → carry one algae tuft and choose left/right entrance placement → clear silt and inspect the finished nest. | Construction material is not food. Save carried/placed material and edited site. Use a verified underside pose; physical mouth contact must agree with it. No automatic eggs or invented courtship after construction. [Research/card](species-adventure-research/03-night-ledges.md). |
| 5 | **Clown triggerfish — The Just-Right Crevice** (s24, M) | Compare openings → align and enter a fitting one → visibly lock the dorsal spine → release and back out. | Up to three authored crevices with clearance/occupancy; separate spine articulation and rock occlusion. Fit matters, not proximity to a generic shelter point. No predator required. [Research/card](species-adventure-research/09-parrot-armored.md). |
| 6 | **Squirrelfish — Someone in the Shade** (s12, M) | Follow a sound/ripple → inspect a partly hidden neighbor → choose another alcove or give it space → see both fish settle independently. | Local sound plus posture and actual spacing drive the encounter. Provide visual/muted equivalents. Do not turn distress sounds into friendly words or echolocation. [Research/card](species-adventure-research/03-night-ledges.md). |

A complete story needs more than one novel animation. Each card has a choice, an animal/world response, a changed outcome, cancellation, persistence and a replayable discovery. The detailed reports supply bounded state, source files, evidence limits and acceptance cases.

## Signature expansion and subsequent queue

**Lantern Company — flashlight fish (s53, L):** follow a small existing school in darkness, choose a route and whether to expose the light organ, and observe context-dependent changes in neighbor spacing and direction. This should be a navigation/communication adventure, not rapid clicking or a memory rhythm test. The strong evidence concerns *Anomalops katoptron*, whereas the roster currently says Anomalopidae. First establish a named case-study identity and compatible art; then secure eligible existing school members without inflating population. Its existing night start avoids needing a live dusk cycle. See [school/light research](species-adventure-research/16-schools-light.md).

Keep these distinct researched opportunities in the expansion queue; their reports contain implementation cards rather than bare ideas:

- **Filefish scent mystery:** actual coral diet affects a subsequent scent-based investigation. Requires identified coral sites and an evidence-compatible observer; a reskinned color-matching Artist is insufficient. [06](species-adventure-research/06-paired-browsers.md).
- **Moorish idol / longnose butterflyfish:** angle/reach choices at real crevice geometry, with their different mouth mechanics visibly doing the work. Share target geometry, not identical animations or diets. [04](species-adventure-research/04-reef-browsers.md), [05](species-adventure-research/05-specialist-mouths.md).
- **Neon damselfish:** excavate a usable recess beneath a boulder. Share sediment/contact helpers with Housekeeper; keep nest shaping distinct from coral care. [01](species-adventure-research/01-coral-homes.md).
- **Longfin batfish:** discover a leaflike juvenile among floating debris by observing movement. Dedicated juvenile proportions/art are necessary; this is *Platax teira*, not the flatworm mimicry of *P. pinnatus*. [04](species-adventure-research/04-reef-browsers.md).
- **Banggai cardinalfish:** add courtship and egg handoff before the existing nursery; do not rebuild mouthbrooding. **Seahorse:** observe a paired rise and return to holdfasts, conditional on true resident movement and a second appropriate resident within an explicit population budget. [08](species-adventure-research/08-parenting.md).
- **Spotted pufferfish:** aim short water jets to expose existing buried prey, with reveal/inspect/choose feedback. Only proceed if controls differ meaningfully from the cowfish/goatfish sand routines; no geometric sand circles. [09](species-adventure-research/09-parrot-armored.md).
- **Night-home extensions:** humbug sleep-swimming, anemonefish host-water movement and humphead sleeping-cave returns need explicit scene/time support and, where required, named host/fish identities. They must not silently respawn a daytime world as night. [01](species-adventure-research/01-coral-homes.md), [02](species-adventure-research/02-anemone-partners.md), [05](species-adventure-research/05-specialist-mouths.md).

The [complete 64-creature index](species-adventure-research/README.md) links every species to its report and implementation verdict. Additional worthwhile cards are summarized below. A “defer” verdict means current play is adequate or evidence/prerequisites do not justify another adventure yet; it does not mean the species was skipped.

## Other worthwhile cards retained for sprint selection

| Creatures | Distinct implementation proposal | Why queued / prerequisite |
|---|---|---|
| Rainbow runner (s28) | One controlled conspecific scrape, actual recipient turn, then give it room; finish without a meal or burst quota. | Exact-species observation; the parasite-removal benefit is hypothesized, so do not award a guaranteed cure. M. [11](species-adventure-research/11-pelagic-hunters.md). |
| Whitetip / blacktip sharks (s33/s32) | Whitetip chooses a body-sized resting slot while leaving passage; blacktip joins and later recognizes the same preferred associate on a local route. | Genuine non-feeding shark play. Existing participants and real fit/spacing required; no compulsory swimming myth or spawned friend. M. [14](species-adventure-research/14-reef-sharks.md). |
| Cleaner wrasse / coral shrimp (s43/s45) | Wrasse chooses visible versus obscured treatment berth and sees a bystander respond; shrimp chooses client care or physical parasite-egg picking on a ledge. | Distinguishes third-party learning and environmental foraging from the completed Clinic. Shrimp evidence is laboratory/parasite-specific, not universal reef sterilization. M. [18](species-adventure-research/18-cleaners.md). |
| Devil scorpionfish / trumpetfish (s21/s41) | Orient and unfold a warning fan to a local observer; switch between moving cover and head-down coral concealment. | Requires visible orientation/occlusion consequences. No guaranteed fear power; existing shadow-following alone is not new. M. [12](species-adventure-research/12-camouflage.md), [13](species-adventure-research/13-perches-signals.md). |
| Coral trout / moray (s39/s26) | Automatic context-linked color changes during different movement routes; physically reversible crevice traversal. | Preserve exact species. A cooperative hunt cannot use an unsupported partner just because it is another moray. M. [10](species-adventure-research/10-cooperative-hunters.md). |
| Electric ray (s37) | Choose the location of a prey-directed pulse and observe its bounded local consequence. | Distinct from current generic shock/watch loop only if aim/position actually matter; no weapon upgrades. M. [15](species-adventure-research/15-rays-large-sharks.md). |
| Sprat / needlefish (s0/s18) | Inspect real substrate, approach, and leave attached eggs using each species' documented attachment behavior. | Explicit adult reproductive role and dedicated attachment art; no automatically multiplying NPC population or invented parental guarding. M–L. [16](species-adventure-research/16-schools-light.md), [11](species-adventure-research/11-pelagic-hunters.md). |
| Nudibranch / snail / urchin residents (s60/s61/s62) | Predict a sensory turn and observe it; make spatial choices around finite grazing surfaces and see cropped trails/edges. | Keep residents autonomous and non-playable. Named representative/art/diet gates apply; no meal-count or waiting-only observation. M. [20](species-adventure-research/20-nudibranch.md), [19](species-adventure-research/19-bottom-residents.md). |
| Fusilier / anthias (s42/s11/s58) | Choose where to join a visibly mixed-species school, with real neighbor responses. | Documented companion taxa are absent. Explicit roster/art/locality expansion first; never relabel our two anthias as the studied association. M–L/Hold. [16](species-adventure-research/16-schools-light.md), [17](species-adventure-research/17-anthias.md). |

Enrichment and defer rows for all other IDs remain in the coverage index. Their reports also contain the less urgent alternatives and explicit rejection reasons. These alternatives do not automatically expand the six-story core commitment.

## Implementation sequence and completion gates

### 1. Lock identities and make the adventure contract explicit

Record exact study taxa separately from generic roster labels, current common-name aliases and invented game rules. Audit the cited guide limitations against shipped code: parrotfish sand/algae renewal, goatfish probing/sharing, cardinalfish brood care, companion pairing and resident crawling are examples of stale descriptions. Correct the yellowspot emperor's daytime mismatch against its documented feeding routine with a targeted compatibility review; do not silently rewrite saved dives.

Current `storyKeyFor` returns only the first matching story. Before adding a second story to a species, add a list of eligible stories and explicit selected story key; retain the old default for old saves. Keep this a small registry change in `reef-story-data.js`, `reef-stories.js`, their UI/renderer dispatch, and restore validation. Add an explicit optional story key rather than rewriting the quest system. Residents keep their observation entry point; they do not become playable through a story side effect.

**Encounter admission is a prerequisite.** New guided starts must allocate suitable participants inside the existing adult population budget before ordinary pairing: one eligible unpaired conspecific for rabbitfish, one appropriate squirrelfish neighbor, and the required flashlight cohort if that card ships. Reserve actual initial slots; do not append adults or break established pairs. Check reachable habitat, actor eligibility, uncommitted meals and accessible sites before offering Begin. Do not reset appetite to satisfy a story. Meal-bearing stories must demonstrate timely actual feeding from normal initialized state, with tuning of the scene/site—not fabricated bites or mandatory digestive waiting.

Old saves retain their animals and pair bonds. If no eligible participant exists anywhere reachable, say so and offer a clearly labeled fresh adventure dive after preserving the current dive through the existing save/export flow. Never offer endless searching as the solution. New story saves must preserve reserved identities and resume directly. Test representative generated starts, including foxface seeds 9, 11, 26, 28, 33 and pencilled-rabbitfish seed 1, which the review found lacked unpaired conspecifics before this proposed allocation.

**Exit evidence:** old dives/journals still import; the five shipped stories remain selectable; invalid species/story pairs fail validation; all new biological claims map to sources and correct identities.

### 2. Deliver Housekeeper from real input through saved world change

Implement one authored branching colony and the full clear/inspect/save/reload loop, then expand its meaningful pocket choices. Add only the reusable pieces this exposes: stable site IDs, material-contact targets, story hit dispatch before ordinary eating, and a pure world-change renderer. Remote clicks may select an approach but never complete work.

Use existing story module hooks (`initStory`, `storyAction`, `tickStory`, `storyMeal`, `storyNPC`, `storyView`, `validStory`). Save bounded enums/masks and explicit site references. Render code cannot award discoveries.

**Exit evidence:** the player physically changes the visible colony without gaining calories; cancellation is immediate; the change survives reload and a reef visit; missing NPCs cannot block this solo story.

### 3. Add cooperation and bodily variety

Build rabbitfish role exchange against actual available companions. Preserve identity as reef + entity ID + incarnation + species, existing pairs, committed meals, care and danger priorities. Then implement frogfish walking, gramma carrying and triggerfish fit using each animal's actual pose/contact requirements. Do not generalize a new locomotion framework before these concrete cases need it.

For rotated bodies, preserve the intentional separation between display and simulation frames in `feeding-contact.js`; define an authoritative interaction pose or return to a supported contact pose. Never pass decorative render motion back into physics.

**Peaceful encounter policy must be implemented here, not assumed from Practice mode.** While a core story owns a clearly indicated local interaction area, its player and bound participants use non-injurious interaction rules. Predators outside that area continue ordinary behavior and feeding; inside, they retain physical presence and steer around or inspect the occupied activity instead of attacking immobilized participants. Suspend need drain caused by a required held pose; preserve actual hunger/health values rather than refilling them. Story cancellation first restores free movement and normal interaction ownership before ordinary danger can resume, using the existing Practice protection/re-entry cue or an explicitly tested equivalent. No global predator removal, forced attack, hidden whole-reef fear pulse or permanent immunity. Save/restore derives the same active protection; leaving the area releases it safely. Verify these transitions with live nearby predators, including cancellation during a fin stance or locked spine.

**Exit evidence:** an NPC genuinely swaps roles and feeds; frogfish fins visibly plant while the body travels; gramma material follows its mouth and stays placed; the triggerfish spine touches a fitting surface and retracts to exit. Still frames alone cannot prove movement.

### 4. Add readable communication, then the conditional light flagship

Complete the squirrelfish encounter with sound, posture and muted equivalents. If flashlight identity/art/eligible-school gates pass, build Lantern Company using bounded local perception and real school movement. If a gate fails, report the exact prerequisite; continue the six core stories and keep the light card explicitly incomplete.

Model signals as context-sensitive animal cues. Avoid a “fish speech translator,” mandatory strobing, or whole-screen flashes. A reduced-flash presentation should retain spacing/direction decisions. Other NPC routines continue; do not eliminate predators across the entire game to make a quiet encounter work.

**Exit evidence:** changing the player's choice produces a different live response; neither sound playback nor cosmetic light timers alone can finish a story.

### 5. Integrate the discoveries and verify the Windows package

Award a distinct journal discovery once per meaningful activity, retaining earlier badges. Keep every story optional and immediately escapable; no upkeep chores, real-time waits, food quotas, daily scheduling or offscreen punishment. Record one brief reflection per finished feature; generate/review offline narration only after mechanics and wording are stable, using the established pipeline.

Run focused mechanics/state tests and real-input browser acceptance for each story, then `npm test`, `npm run test:e2e`, the existing desktop QA and Windows build/package checks. Verify widescreen/fullscreen, muted play, reduced motion, pause/blur, stop/resume, old and new save imports, missing/replaced actors, occupied sites and discovery deduplication. Capture motion recordings showing contact and consequences, not only sprite sheets.

Profile the actual Windows build at intended display sizes with active school/particles/rigs. Establish measured CPU/GPU/frame-time/memory headroom before cutting animation detail; do not assume the modern machine is capacity-limited. Cap local effects and references to prevent growth, not to justify static animals.

**Exit evidence:** all six core adventures complete through actual controls in the packaged build, stable save/return behavior, no density inflation or fake encounters, visible articulated motion, linked verification artifacts. Adult/child playtesting is a separate fun assessment and must not be claimed from automated tests.

## Cross-cutting rules that prevent rework

- Per-dive world changes stay local. Pause/offscreen clocks freeze; no global ecosystem catch-up is introduced here.
- Existing adults are selected and move physically. A scene cannot teleport, replenish hunger, steal an occupied pair or spawn an adult to manufacture success. A deliberately new juvenile/resident lifecycle is explicit separately budgeted work.
- Waiting is not the mechanic. Where a necessary partner is unavailable, explain why and permit another site/encounter or free exploration. Preserve committed work and earned discoveries.
- These are original, biologically inspired adventures in a fictional mixed-species reef; do not imply every animal or observed interaction naturally co-occurs.
- New controls keep pointer steering, contextual keyboard equivalents, clear targets and cancellation. Biological time compression and authored puzzle rules are stated honestly.
- No reverse-engineering/original-game comparison, runtime implementation, asset generation or new build was performed for this research task.
