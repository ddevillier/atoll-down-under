# Finding the next fun in Atoll Down Under

Research and proposed development sequence — September 10, 2026. Runtime examined: `a2f92f4`, with subsequent documentation through `d54e0a6`. This report proposes future work; it does not claim those features are implemented.

The best next direction is **making a fish, discovering what its body is good at, changing one thing, and wanting to visit that individual again**. Follow that with clearer consequences between animals already living in the reef. Our game has extensive species journeys and ecology; adding another catalog of tasks would miss the larger opportunity.

This recommendation combines original Windows emulator observation, the MECC manual, selected player memories, and current source inspection. Historical facts, remembered experiences, implementation findings, and new design proposals are kept separate below. Peaceful mystery, caring, free choice, and occasional readable danger are our modern direction. Tournament remains secondary.

## What the original suggests

The original Create-A-Fish editor makes a surprisingly direct invitation: name a fish, watch it swim in the preview, spend a shared budget, then inhabit it. In the emulated Windows session, Small/Medium/Large cost 100/400/800; None/Sonic Blast/Electric Shock/Squirt Ink cost 0/200/400/600. The preview visibly enlarged with size. A Large, ink-equipped night fish with all three statistics at zero could enter the reef with 100 points left. This is observed behavior in that version, not a prescription to duplicate its numbers. [Direct session and limitations](fun-research/04-original-create-play.md), [running original](https://classicreload.com/play/win3x-odell-down-under.html).

The manual supports choosing a species in Practice, starting in its preferred setting, observing cleaners, pausing to identify animals, and learning through body-dependent survival choices. It documents nine sections and a period selected by the fish; it does not establish a continuously evolving offscreen ecosystem. Its useful inheritance is an invitation to investigate. [MECC User's Guide](https://www.myabandonware.com/download/m72w-odell-down-under), PDF pages 1, 4, 7–12; [manual evidence memo](fun-research/01-manual-mechanics.md).

A second independent emulator session explicitly entered Practice, inspected two species briefings, and verified Escape freezing and resuming the reef. Its Spinecheek habitat had broad pale sand and separated tall plants, visibly different from the custom session's dense coral wall. That confirms meaningful compositional variety in at least two scenes, not all nine. The original's schooling description was read, but simulated schooling was not demonstrated. Carry forward differences in visibility, landmarks and opportunities; dense background artwork is not a reason to increase animal density. [Practice session](fun-research/06-original-practice-evidence.md).

Creation and unusual capabilities recur in spontaneous recollections, including a school-Mac identification memory where making a fish helped recover the game's name. Other accounts remember particular species, cleaning, sound, and escapes. These are promising design cues, not representative audience research. [MacRumors, posts 80 and 95](https://forums.macrumors.com/threads/what-are-your-memories-of-early-mac-pc-games.760039/page-4), [community evidence ledger](fun-research/02-community-memories.md).

There is counterevidence to romanticizing the original: a retrospective recalls confusing decorative coral with targets and guessing at edible food, while questioning how much it taught. We should preserve experimentation while making its results understandable. Nostalgia does not justify starvation lotteries, opaque diets, or repeated surprise deaths. [GameTyrant retrospective](https://gametyrant.com/news/anyone-remember-odell-down-under).

## Biggest gaps in the current game

| Finding | Current evidence | What to do with it |
| --- | --- | --- |
| A created fish functions, but lacks an individual life record | Feeding, shelter, cleaners, powers, travel and saves work. `custom` is excluded from roster care/played stamps and authored adventure lookup. | Add persistent creation identity and capability-based activities. Preserve real-species counts separately. |
| Draft and saved fish can interfere | `Simulation.start` retains the mutable editor object. A reproduced crushing-grazer save reloads with hunter foods after that draft is changed. | Fix configuration ownership before building a collection or variations. This is a correctness defect, not a preference. |
| The budget often asks for little sacrifice | Default costs 805/1600. Maximum attributes plus Burst swim fit at 1580. Large size still has real hunger/shelter disadvantages. | Tune around understandable niches; do not just lower the budget until everything feels weak. |
| Some offered abilities have poor or empty uses | Grazer+lure has no eligible animal prey. Several defenses share much of their simulation effect despite different prices. Crushing jaws already works. | Give every allowed combination an achievable use, explain restrictions, and differentiate powers before adding more. |
| The guide loses the invented fish | Custom guide entry redirects to `s1`; body is one of three tinted templates, and dominant stats can silently change starting habitat. | Compute a creation-specific diet/threat card; make appearance, habitat and biological role explicit. |
| Much ecological substance already exists | 57 playable journeys, seven resident observations, reciprocal feeding, cleaning, school routines, remembered homes and pursuit rules. | Make those responses noticeable and accessible to compatible creations. Do not restart this work or call the reef empty. |
| Persistence is local and bounded | Active section advances; follow relationships release during travel. | Remember actual encounters without implying a simulated unseen day or an immortal friend. |

Detailed source references and verification: [current creation audit](fun-research/03-current-create-fish.md), [current reef audit](fun-research/05-current-reef-fun.md). The creation audit ran 65 focused tests and additional model probes; green existing tests did not catch the shared-configuration defect. Checklist fatigue and weak attachment are design hypotheses, not measured player findings.

## The first complete feature: a fish worth keeping

Build the full **make → test → understand → vary → keep → return** loop. A saved portrait alone would be incomplete; a beautiful editor followed by the same disconnected dive would also be incomplete.

**Make.** Begin with a few readable body choices and an animated fish that follows the pointer in its preview. Show what changes: turning circle, likely meals, shelter access, appetite and one special action. Use simulation rules for these predictions, not a second approximate formula. Name and color remain playful, low-pressure choices. Do not require spending every point.

**Test.** Offer a small repeatable trial area using ordinary steering, feeding, hiding and ability controls. It is explicitly a safe experiment, separate from a saved wild dive. Reset conditions for comparisons. Let a child discover that a small fish can settle in refuge, an agile fish turns sooner, or a different mouth opens a food opportunity. A short failed experiment should make revision inviting.

**Understand and vary.** After an outcome, explain one actual cause near the action: this body is too large for this shelter, that food suits these jaws, or this visitor ate what you uncovered. “Make a variation” duplicates the blueprint and changes a draft; it never edits the parent fish behind the scenes. Compare two fish in the same trial conditions, without declaring a universal best build.

**Keep and return.** Give each creation a stable ID, revision, portrait, validated blueprint and a modest personal record of real care/discoveries. Resume its existing dive or start another swim explicitly. Export/import must preserve that identity and its record. Real-species achievements stay distinct from invented-animal memories.

**Have a way of living.** First support one compatible custom role end to end, using an existing interaction: a small grazer that can visit food patches and shelter. Then add social browsing or sand searching once their actual neighbor responses are clear. A role resolver should inspect capabilities instead of pretending `custom` is a catalog species. Do not grant every animal every journey or allow a role to produce impossible goals.

Start with understandable choices and reliable consequences. Modular fins, procedural anatomy, elaborate family trees and dozens of new powers are later opportunities; they are not prerequisites for a satisfying first loop.

## Four moments that can make the whole reef more memorable

These should work with the journey card closed. Each uses a real state transition, not a reward animation that pretends something happened.

| Moment | Implementation direction | Proof that matters |
| --- | --- | --- |
| “Someone ate what I found.” | Use existing sand exposure and hungry-neighbor feeding. Emphasize the actual bite and its location. | Existing food is consumed by an eligible hungry visitor; no fabricated visitor or appetite. If nobody is available, feedback stays truthful. |
| “It waited for me.” | Build on companion reunion and reciprocal meals; extend a compatible role to creations. | The same individual eats and rejoins while retaining its own hunger, cleaning and danger priorities. |
| “It lost me in the plants.” | Show pursuit, settling into refuge, and actual target release with restrained animation/sound. | A real hunter stops pursuing for the recorded reason. No extra predators or damage are needed to demonstrate the loop. |
| “I found my way home.” | Strengthen the remembered host, landmark and arrival pose; show its real location on the map. | Travel and return retain exact home identity; a lost host cannot receive false reunion credit. |

The first development pass should choose one of these, not launch four parallel systems. Sand sharing is a strong spectacle; refuge play is the simpler companion to the first small custom fish. Social memory follows identity work. See [implementation seams and edge cases](fun-research/05-current-reef-fun.md).

## Animation and sound should explain life

The latest packaged renderer has already removed the 3.5 ms cutoff, uses GPU mesh rendering, and recorded zero budget deferrals across 63 native cases. That evidence supports using the available hardware; it does not prove all movement is expressive. [Capacity investigation](ANIMATION-CAPACITY.md).

Spend the next animation effort on readable anticipation and response: braking before a bite, body/fin adjustment through a turn, preparing a feeding action, settling into shelter, and a neighbor resuming its routine. Compare clips at normal play scale with HUD hidden. A moving mesh or changing frame checksum is insufficient if the action still looks static. Keep the successful cuttlefish motion intact.

Retain the peaceful soundscape. Optional narration should answer an observed question or explain a chosen action, with stop/replay and no overlap. Reuse current offline narration when appropriate; new lines should wait until mechanics and wording settle. No fresh API generation or key work is needed to complete this report. Do not spend on narration for interactions we later remove.

## Proposed next five development days

This is an ordered plan, not a promise that all later features fit fixed dates. Complete the acceptance gate before expanding scope; extend a day if integration needs it.

| Work front | Deliverable | Gate before moving on |
| --- | --- | --- |
| Day 1: trustworthy identity | Detached configuration ownership; saved creation identity; draft/variation separation; exact editor hydration; compatible save migration | Create A, edit B, reload/export/import A: appearance, diet, role and dive remain A. Older saves still load. |
| Day 2: playful comparison | Responsive preview, safe repeatable trial, accurate trait/food/shelter feedback; first pass on empty ability combinations | Two one-trait variants produce explainable different outcomes through normal controls under the same conditions. Trial never consumes live progress. |
| Day 3: a kept fish with a life | One compatible role, personal care memory, resume/new-swim choice, custom guide context | Make, try, vary, keep, close, reopen and play that exact fish through a meaningful activity. No real-species stamp pollution. |
| Day 4: one visible reef consequence | Refuge encounter or sand-sharing polish, with action-specific animation and restrained sound | Cause and response are visible with cards closed, muted and reduced-motion settings; simulation confirms the same event. |
| Day 5: play, repair, package | Short observed play sessions, repair confusion, regression/performance checks, Windows testing build and receipt | Functional evidence and recorded human observations are separated. Package only after lifecycle, fullscreen, saves and current motion remain sound. |

After this milestone, choose social relationships, richer anatomy, additional custom roles or travel discovery based on what players voluntarily repeat. Do not automatically add another 64 completion cards. Currents and physically navigable coral are larger movement/level-design projects because current painted scenery is not a collision field. Continuous offscreen life is a separate simulation project with explicit persistence and performance costs.

## Acceptance beyond passing tests

The functional gate covers blueprint immutability, migration, export/import, diet/ability eligibility, actual meal/pursuit events, pause, travel, restart, fullscreen, reduced motion and bounded rendering. Add tests for new contracts, not a duplicate assertion for every visual flourish. Use generated ordinary communities for wild-reef checks; controlled trial fixtures must not masquerade as evidence of naturally occurring encounters.

The play gate needs people. Watch short sessions with a new player and, if available, a returning fan. Let the first attempt happen without coaching. Record whether they notice what changed, deliberately try another trait, choose to return to a saved fish, and invent a next action with the cards closed. Ask them to show the consequence rather than recite terminology. Also record anxiety, confusion and abandonment. These are exploratory observations, not claims of retention or educational efficacy.

Created animals should be clearly identified as inventions. Real species facts belong to real-species entries; a fictional combination can invite comparison without teaching that an arbitrary grazer naturally produces electricity. Badges remember care or discovery, and should never make unnecessary eating the optimal caring strategy.

Keep current generic activity badges available to creations. Add individual memories separately rather than treating all invented fish as one new species. Avoid daily chores, expiring care or penalties for time away. The first return visit should offer the recognizable fish and its last real discovery. [Learning-through-play design](fun-research/07-learning-through-play.md).

## Evidence coverage and remaining uncertainty

Eight distinct research contributions are linked below. They have different jobs; eight opinions do not equal eight independent confirmations of every claim.

1. [Manual mechanics](fun-research/01-manual-mechanics.md): primary Windows guide, cross-version boundaries.
2. [Community memories](fun-research/02-community-memories.md): first-person recollections and counterexamples, with sampling limitations.
3. [Current Create-a-Fish](fun-research/03-current-create-fish.md): source, focused tests and executable defect reproduction.
4. [Original Create-A-Fish](fun-research/04-original-create-play.md): live emulator editor, custom dive and native help.
5. [Current reef fun](fun-research/05-current-reef-fun.md): existing ecology, integration gaps and concrete play moments.
6. [Original Practice evidence](fun-research/06-original-practice-evidence.md): additional original-game investigation.
7. [Learning through play](fun-research/07-learning-through-play.md): educational framing and discovery design.
8. [Priority challenge](fun-research/08-priority-challenge.md): independent scope and sequencing critique.

The emulator supplied direct editor and dive evidence, but mouse transport limited verification of feeding, pursuit, cleaning and special effects. Native help is documentary evidence, not proof those actions were successfully performed in our session. Historical balance across Macintosh and Windows releases remains uncertain. The report does not need those exact formulas to recommend a better experiment loop. New feature fun and child comprehension remain untested until implementation and play observation.

## Completion audit for this research task

| Requested outcome | Evidence inspected | Status |
| --- | --- | --- |
| Use eight subagents | Eight distinct numbered memos, each with a bounded research role; final three include independent Practice investigation, learning synthesis and skeptical prioritization | Complete |
| Inspect the emulated original | Two independent emulator memos document successful original Create and Practice interactions, with unsuccessful actions explicitly excluded | Complete within stated observation limits |
| Inspect manuals and community memories | Primary Windows manual memo with page references; community ledger with source URLs, dates, counterexamples and limitations | Complete |
| Identify missing fun in our game | Current creation and reef source audits distinguish working systems, reproducible defects and design hypotheses | Complete |
| Give Create-a-Fish substantial attention | Whole-loop proposal, persistence contracts, compatible roles, trial design, ability tradeoffs and acceptance gates | Complete |
| Create a synthesized next-work report | This report resolves scope and sequence, incorporates the independent challenge, and supplies a five-day plan plus later options | Complete |

No runtime implementation, family playtest, new narration or new build was required or performed for this research deliverable. The save defect is documented for the first implementation session and remains unfixed here. The next milestone is a complete playable creation loop, not merely more research.
