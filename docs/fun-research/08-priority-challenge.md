# Independent challenge: make one fish worth revisiting

Research agent 8, September 10, 2026. Read research memos 01–05 and independently inspected current `data.js`, `simulation.js`, `journal.js`, `save-files.js`, `adventures.js`, `companion-activity.js`, and `lure-motion.js`. This memo challenges scope and prioritization; it does not claim another original-game play session, user playtest, or runtime implementation.

## Recommendation

Create-a-Fish is the strongest next development focus, but **a complete small experiment loop is the deliverable**: make a recognizable fish, try a consequential choice, understand the result, make a variation, and return to the original. A library alone is storage. A trial pool alone is a demonstration. A new journey card alone is another assignment. The value comes from joining these pieces to an already responsive reef.

The historical evidence supports creation as a salient experience and the manual explicitly supports experimentation. It does not establish that a modern parts editor, permanent friends, breeding, or an evolving offscreen ecosystem is required. Those are additional design bets. Nor does the evidence show that the current game is missing all social simulation: memo 05 traces substantial existing behavior. The first milestone should expose and connect what exists.

## Claims that survive challenge

| Claim | Independent assessment | Consequence |
|---|---|---|
| A saved custom fish can change after editing a separate draft. | **Confirmed simulation defect.** `Simulation.start` retains the caller's config reference. I reproduced a crushing grazer changing from algae/grass/plankton/coral while live to fish/shrimp/worm/crab/snail/urchin after restore, solely by changing the original config's diet. The UI route is source-traced in memo 03, not independently browser-exercised here. | Fix identity integrity before adding a collection. This is a correctness gate, not an optional polish idea. |
| Core attributes offer weak budget tension. | **Confirmed arithmetic, limited balance conclusion.** All four sliders at maximum cost 1,480 against 1,600. This does not prove max size is best: size changes predation, hunger and shelter eligibility. | Do not simply copy the original's 1,500 total or lower the budget blindly. First show current consequences and compare two viable builds; tune when one clearly dominates the intended choices. |
| Custom fish miss species journeys and named care stamps. | **Confirmed eligibility boundary.** `ADVENTURES` and several activity predicates use roster IDs; journal played/cared validation accepts Practice species only. Generic care and survival remain. | Separate creation identity from ecological role and scientific species identity. Never change `custom` to a real species ID just to unlock existing code. |
| The original editor had opportunity costs and a moving preview. | **Supported by direct emulator memo 04 and manual memo 01.** Exact slider increments were not successfully tested. | Preserve immediate appearance continuity and understandable choices; do not claim a faithful numeric recreation. |
| More social response could improve fun. | **Plausible proposal, not a diagnosed absence of social AI.** Existing companion code already validates an individual and incarnation, allows actual meals, and supports reunion. | Start with one visible existing response. Avoid a new ecosystem framework before seeing whether the child notices the current interaction. |

The independent probe used `Simulation.restore` (static), following an initial failed call to an instance method. The corrected probe succeeded. No game files or saves were modified. It also returned `alias: true`, maximum basic cost `1480`, and budget `1600`. This is model evidence, not a completed browser regression test.

## What I would remove or defer from an overambitious first milestone

- **A broad library of new custom journeys.** One compatible role with a real interaction is enough to establish the architecture. Automatically generating chores from diet risks reproducing the same meal–wait–return grammar under new names.
- **Persistent named NPC friends across the whole reef.** Existing partner identity is useful, but the current section alone advances. Start by remembering a creation and a truthful local encounter. Cross-habitat friends require decisions about movement, loss, save migration and offscreen time; they cannot be implied by a nickname.
- **A modular anatomical creature editor.** Swappable mouths, fins and bodies require assets, rig compatibility, feeding contact, hit geometry and many combinations. They are a later dedicated workstream. The present three-template body switch should first become explicit and predictable.
- **Rebalancing every ability at once.** Lure compatibility and misleading descriptions deserve immediate attention. Distinct animation does not make two identical tactical effects meaningfully different. In the first slice, offer a small set of demonstrably useful choices and explain unavailable combinations; then expand deliberately.
- **A new trial simulation.** The trial must use the production movement, eating, ability and shelter rules. A separate attractive sandbox that behaves differently teaches false expectations and doubles maintenance.
- **A new score, badge ladder or hypothesis worksheet.** Optional personal memories can recognize play. Requiring written predictions or collecting comparison tokens turns experimentation into homework. The child should be able to learn through swimming and immediately changing one thing.
- **Density increases, Tournament expansion and reenacting punishing scarcity.** None is justified by this evidence. Readable choices and actual causal responses should be tested before adding pressure or entities.

## Feasible next-days sequence

This is a dependency order with stopping gates, not a promise that all stages fit fixed calendar days. If a gate fails, repair the same slice before adding breadth.

**First development session: trustworthy identity and return.** Separate immutable saved creation, editable draft and active dive. Clone config on dive start; restore the editor from the selected creation; implement “make a variation” without overwriting the original. Preserve current portable saves and migrate old custom dives deliberately. A compact shelf with name and moving portrait is sufficient; elaborate organization is not. The child must be able to return to fish A after making B.

**Second session: one comprehensible experiment.** Use a repeatable production-rules trial area with a food opportunity and a shelter opportunity. Compare two controlled changes, such as size just below/at the current shelter threshold, or endurance under identical movement. Present consequences in words and visible action, not inferred scientific claims. Repeat a trial without consuming the original dive or personal progress. Keep an immediate exit to the normal reef; a child who already understands should not be forced through a tutorial.

**Third session: one custom ecological role in normal play.** Choose one interaction with clear on-screen consequence. Group browsing is socially inviting but requires eligibility refactoring; renewing grazing is simpler but easier to reduce to a checklist. Select based on a short implementation spike, then finish one. For group browsing, an actual available neighbor approaches, takes a real meal, and reunites; neither food nor hunger is fabricated to ensure a happy result. Make the interaction work with its journey card closed. A saved memory names what really happened, not an unseen simulated history.

**Following session: observe, then polish the specific weak link.** Test ordinary controls in the packaged Windows game. Watch whether the player recognizes the fish, can explain one difference, deliberately revises, notices the neighbor, and chooses another swim. If the response is invisible, improve approach/turn/feeding/reunion animation and spatial feedback. If the choice feels irrelevant, adjust that rule. If navigation interrupts the loop, fix return/revision flow. Do not infer the problem from the number of completed badges.

Later expansion can add more compatible roles, distinct ability mechanics, anatomy choices and bounded relationships. A fully persistent ecosystem should have its own design and performance budget after the local loop proves useful.

## Evidence gates that prevent a cosmetic completion

1. **Identity:** Create A, vary B, save/reload/export/import A and B; names, traits, diets, appearances and dive state remain independent. Old custom saves still load. A saved creation is not silently rewritten by editor activity.
2. **Truthful choices:** Preview and normal reef use the same functions for costs, eligible food and shelter. Every offered ability has a reachable beneficial use for the selected build, or the incompatibility is stated before spending points. An inherited template cannot silently change the starting habitat.
3. **Real causality:** One normal generated reef supports the selected interaction through ordinary controls. Credit and animation correspond to actual animal state. An unavailable neighbor produces an honest alternate invitation, not forced appetite, respawning or a fake success.
4. **Lifecycle:** Pause, home, resume, death continuation and import have explicit creation/role semantics. A new incarnation cannot inherit a lost individual's relationship by accident. Custom accomplishments do not inflate the count of real species played.
5. **Visible motion:** Record actual playback through a turn, bite and response; inspect at real speed as well as separated frames. A frame counter, large cache or GPU use cannot prove expressive motion. Profile only the affected crowded/4K cases if new animation work warrants it; do not assume unused capacity guarantees good posing.
6. **Human fun:** Observe a short session without reading the next task aloud. Record voluntary variation, recognizable cause and effect, and self-chosen return. These are questions to investigate, not pass percentages claimed from a tiny family sample. If no human session is available, report functional completion and leave enjoyment unverified.

## Synthesis guardrails

Describe the strongest current gap as **continuity and legibility around self-authored play**, not “there is nothing to do.” Keep documentary facts, emulator observation, community recollection, source audit and proposals visibly distinct. Memo 04's inability to verify ink activation is an input limitation, not a historical missing ability. Community nostalgia is useful inspiration, not measured demand. Existing journey tests establish reachable actions, not voluntary replay. These distinctions make the next plan ambitious without pretending its fun has already been demonstrated.
