# Current reef: turn existing mechanics into invitations to play

Source audit, September 10, 2026. This is a planning document; no runtime changes or new playtest results are claimed. It uses current source and the September 8 completion section of `docs/ALL-SPECIES-JOURNEYS.md`, not the stale coverage counts in `CURRENT-AUDIT-STATUS.md`. The classic-spirit lens here is being a creature, trying things, and noticing consequences; historical fidelity is outside this audit.

The reef already contains substantially more play than an empty aquarium or a collection of meal counters. The next opportunity is to make its existing responses easy to notice, connect them to created fish, and let children invent a second thing to try after the first success. More species, more animals, and Tournament work do not address that gap.

## Verified present mechanics

| Area | What current source actually does | Evidence |
| --- | --- | --- |
| Species journeys | All 57 Practice animals have playable journey definitions; seven residents have observation journeys. Actions include selecting a living home, actual mouth-contact food preparation, water-layer crossings and prey-specific bursts, watching and approaching a particular prey, reciprocal group meals, assisted following, and resident feeding/aftermath observation. Journeys are optional, replayable, and recorded persistently. | `src/adventures.js:14–42`, family journey modules; `src/resident-journeys.js`; September 8 combined acceptance in `docs/ALL-SPECIES-JOURNEYS.md`. The documented 154 generated paths and 349 unit checks are prior evidence, not tests rerun for this audit. |
| Local social ecology | Pairs can wait and reunite after feeding; schools separate and re-form; anemonefish retain a real host; trumpetfish can shadow a broader neighbor, including the player; perching fish watch passersby; foragers visit patches and reef residents return home. Hunger, danger, cleaning and rest take precedence. | `src/ecology.js:34–145`, `src/simulation.js:390–473`, `src/companion-activity.js`, `src/refuge-motion.js`. |
| Consequential care and feeding | Player cleaners remove actual parasites. Sand inspection exposes existing food for another hungry animal, school feeding can start a local feeding wave, companions must eat real meals, and grazed plant patches recover after a quiet interval. These are already world responses, not merely journal animations. | `src/player-cleaner.js`, `src/sand-search.js`, `src/school-activity.js`, `src/grazing-activity.js`, `src/simulation.js:435–440`; current implementation in `docs/GAMEPLAY-UPLIFT.md`. |
| Traversal | Nine differentiated illustrated habitats form three rows with horizontal wrap. Selecting a destination supplies directions and suitable-food information; it does not teleport the player. Crossing an edge places the fish at the adjacent edge; active pursuers transfer with their relative displacement. Homes can survive travel, while player companions and assisted follows release. | `src/reef-map.js:6–27`, `src/main.js:69–74`, `src/simulation.js:247–260`; `src/communities.js` and reef data. |
| Danger and defense | Initial protected exploration ends on specified actions including travel. Small fish can settle in shelter; camouflage and ambush concealment also affect predation. Diet, size, poison, current defenses and cleaning safety constrain pursuit. Hunts time out, predators digest after feeding, and ability use consumes energy and has cooldown. Injuries can recover through adequate energy and time. | `src/shelter.js`, `src/simulation.js:203–214,289–305,390–440`. |
| Sensory feedback | Species rigs and activity poses accompany anatomical feeding; sand puffs, food/energy labels, hiding opacity, ability visuals, damage tint, companion and home markers already exist. Music differs between day/night and title; ability/eating/cleaning effects play. Guide introductions and activity narration are explicitly requested. | `src/render.js:145–190`, `src/audio.js`, `src/main.js:80–84,144,270–278`, motion modules. |
| Discovery | Inspection captures an actual animal/behavior/habitat; resident observation follows an individual and incarnation. Journal badges, species care stamps, habitat visits, 64 Ways of living entries, and some earned title-screen visitors persist. Created fish can earn activity badges. | `src/simulation.js:146–163`, `src/resident-journeys.js`, `src/journal.js:1–44`, `src/main.js:40`. |

## Where the connections still stop

1. **Creation does not select a way of living.** `createSpecies` in `src/data.js:80–87` yields `id: 'custom'`; `adventureHTML`, `useContext` and journey dispatch consult the catalog species ID. Same-species schooling and many companion rules also compare literal IDs. A created fish still eats, hides, uses abilities, visits cleaners, and can be a compatible NPC shadow host, but it does not gain a chosen journey or a meaningful school identity merely by inheriting a visual template. Do not claim it is wholly excluded from ecology. Add an explicit authored ecological role rather than impersonating a real species ID.

2. **Many good journeys converge on completion grammar.** Their actions genuinely differ, but numerous cards ask for food A, food B, a return, and a quiet interval. The visible journal enumerates every role and several numerical milestones. This makes checklist fatigue a plausible UX risk, not a measured finding. Completed activities can already repeat; the missing design work is making repeat play suggest a different experiment or visible relationship, without another quota.

3. **Social life has little remembered personal meaning.** Existing companion identity and incarnation checks are strong foundations. The journal, however, stores species discoveries and observations rather than a child's named neighbor or remembered episode. Travel deliberately releases active follow relationships, and only the current section advances. A return is continuity of saved local state, not evidence that a friend lived an unseen day. Any new memory should state those limits and avoid promising an offscreen ecosystem.

4. **Habitat travel is useful navigation more than physical discovery.** Food availability and compositions differ; authored shelters, bottom routes and feeding sites matter. The boundary itself is an adjacent-scene coordinate change. Current movement has no current-force field or player collision/navigation around painted coral. Do not sell narrow grotto entrances or current riding as already present, or silently turn the painted backgrounds into collision walls.

5. **Feedback often explains the result after the fact.** Most events reach a toast/sound; discovery becomes a UI sound plus journal record. Visual ecological activity is richer than that, but the game rarely holds attention on the exact neighbor response that made an action matter. A flash near a flashlight companion currently sets a journey flag; the source does not implement an answering communication signal. Sound and animation polish should follow actual state transitions, not manufacture implied biological responses.

## Four concrete moments to develop

These are proposals, not missing requirements from earlier milestones. Each should work with the journey card closed and without a new badge.

### 1. “I made a fish, and this one wants to swim with me.”

A child gives a created fish a **group browser** role, approaches a compatible existing grazer, and invites it. The neighbor joins when available, visibly slows while the child eats, then takes its own meal. The child swims a loop and sees it return. A persistent optional nickname makes this particular encounter memorable. This builds on the existing companion toy rather than adding more animals.

**Seams:** Resolve a created fish's role separately from species identity in `data.js`, journey/context dispatch, `companion-activity.js`, and appropriate social eligibility. Start with the existing compatible mixed-species browser logic rather than making every fish friendly. Add bounded relationship-memory state through `save-files.js` and simulation validation; render the real individual's label. A nickname is player fiction, not a natural-history claim.

**Acceptance:** An ordinary-controls created-fish flow invites an existing compatible neighbor, witnesses an actual neighbor meal, and rejoins without a card. Busy/feeding/cleaning/threatened fish retain their priorities. No entity, food or appetite is replaced. Death or respawn cannot inherit the old relationship; travel releases the active follow as today and any remembered label remains truthful. Pause/save/import preserve validated state. Observe whether a child spontaneously leads it somewhere after the first reunion.

### 2. “Look! Someone ate the thing I found.”

Use the current goatfish sand toy as the first strong model of a created **sand searcher** role. The child exposes food, backs away, and sees an actual hungry neighbor approach and take it. Keep the sand puff and add a short, spatially placed reaction at the real bite: a glance marker or restrained label that links the visitor to that patch. Let the child repeat at another patch because they want to see who comes, not because the card demands two sites.

**Seams:** `sand-search.js` opportunity selection and witness callbacks, foraging preparation, `main.js` event handling and `render.js` effects. Grant the role explicitly; several sand hooks currently depend on species IDs. Use existing availability hints before promising an observer a visitor.

**Acceptance:** Credit/feedback comes only from an actual bite at exposed existing food; no visitor means no invented response. No change to hunger or density. A nearby satiated fish must not be attracted for demonstration. Test a seed with no available hungry visitor and offer a truthful nearby/other-habitat suggestion. The effect survives reduced motion and is intelligible muted. Ask a child to point to what their action changed.

### 3. “It spotted me—now it can't find me.”

As a small fish or compatible small creation, a child notices one existing hunter begin pursuit, swims to a marked refuge, becomes still, and sees the hunter abandon the chase. They choose when to emerge. This closes a current loop of diet, size, steering, concealment and predator targeting; it needs legibility before stronger danger. A subtle directional cue and a visible release response make successful defense satisfying.

**Seams:** Actual `target === 'player'` acquisition/release in `simulation.js`, `shelterHint`, existing hide/reveal events, renderer and sound. Carry the responsible predator identity into feedback. Show “lost interest” only after real release, not just on entering a shelter radius. Distinguish protection, a defense, timeout and concealment as causes.

**Acceptance:** Natural generated encounter, ordinary steering, genuine pursuit followed by concealment and target release. A fish too large to hide gets the existing truthful hint. Settling must precede concealment, and moving out restores eligibility without forcing an immediate bite. Pursuer transfer across a habitat boundary remains valid. No added predators, damage, or mandatory escape timer. Test readable state both muted and with reduced motion, then observe whether the child deliberately tries emerging and hiding again.

### 4. “That's my anemone; I found the way back.”

A child leaves a remembered real home for food in a neighboring habitat and returns, recognizing the same host and landmark before consulting directions. On arrival, the fish visibly nestles at its host; the game lets that quiet reunion be the payoff. Map detail can show the child's home and a small remembered portrait of its real host rather than only a meal inventory and visit count. Later, a created **home keeper** could choose a role-appropriate existing refuge; anemone association should remain an explicit authored option, not a default for arbitrary fish.

**Seams:** Saved home identity in `home-journeys.js`, existing map detail and route selection, `refuge-motion.js`, home markers and poses. Improve visual arrival framing first. A brief boundary transition treatment must freeze gameplay or preserve elapsed simulation consistently; it must not turn scenery into undocumented collision geometry.

**Acceptance:** Across ordinary edge travel and return, the home retains exact reef/site/host identity and the route points to the actual destination. Lost/replaced hosts show loss and support a new choice, never false reunion credit. No offscreen growth or feeding is implied. Player can locate the home with card closed at both supported sizes; map and marker remain readable paused. Have a child explain the route back and show which host is theirs.

## Recommended order and evidence standard

First connect one created ecological role to one already consequential reef interaction: group browsing is the clearest social starting point, with sand searching a strong second. In the same small vertical slice, make the neighbor's actual response visible and preserve its identity correctly. Then improve the hide/reveal loop and home navigation. Avoid launching a new catalog of 64 follow-up journeys.

Current generated acceptance demonstrates reachable mechanics, save correctness and control paths. It does not establish curiosity, readability, preferred pacing or voluntary replay. For each slice retain the relevant existing unit/lifecycle tests, add only tests for new contracts, and run one ordinary-controls end-to-end scenario using a generated community without replacing its opportunities. Then watch short child/adult sessions with the cards closed: can they explain cause and effect, notice the other animal, and choose a new thing to try without an adult reading the next instruction? Record confusion and self-chosen repeats; don't turn playfulness into another completion target.
