# Whole-roster animation strategy

Four complementary planning reviews cover all 64 catalog animals and the shared integration work. The broader animation/ecology goal is **active and unfinished**. None of these reviews, profile rows, or passing tests establishes a completed full-game polish.

| Planning review | Coverage | Deliverable |
|---|---|---|
| Propulsion | 15 fast swimmers, sharks, rays, eel and related body plans | [Species strategy](strategy-propulsion.md) |
| Reef fishes | 39 browsers, grazers, hoverers, perchers, rigid bodies and long fins | [Species strategy](strategy-reef.md) |
| Attached and slow residents | 10 cuttlefish, cleaners, seahorse and invertebrates | [Species strategy](strategy-residents.md) |
| Integration | Shared state, eight ecological systems, performance, saves and evidence | [Integration strategy](strategy-integration.md) |

## Decisions from the reviews

1. **Motion follows anatomy.** Rigid eyes, horns, shells and attachment points remain coherent. Pectoral fins, streamers, barbels, feelers and claws use local roots and paths. Sharks, rays, eels, crustaceans and attached animals cannot inherit an anonymous fish wiggle.
2. **An action must happen in the simulation.** Approach, preparation, contact, consumption and recovery need a visible connection. The renderer cannot invent food, healing or social relationships. Player steering remains interruptible.
3. **Social behavior uses the existing population.** Stable companions, flexible schools, refuge communities, host partnerships, cleaner visits and shadowing have different purposes. Predatory schooling does not authorize filling companion slots with additional hunters.
4. **Stillness is a meaningful state.** Perchers watch, ambush predators settle, a seahorse holds its support, shells stay rigid, and tiny soft appendages keep resting animals alive. Continuous swimmers use circuits and coasting instead of compulsory stationary rest.
5. **Inspect each animal, then the game.** Isolated rig diagnostics are useful for anatomy, but cannot prove natural placement, visual contact, clean turning or readable social interaction in populated scenes.

## Work sequence

These are work fronts, not elapsed-time completion claims.

| Front | Concrete work | Exit evidence |
|---|---|---|
| Shared action and motion foundations | Ground/holdfast feeding, preparation and contact, cleanup on respawn/travel, continuous locomotion phase, cyclic caching, per-frame generation budget | Actual resource mutation, cancellation/save tests; bounded CPU/memory and no stale pose transitions |
| Propulsion and turning | Tail-peduncle rigs, distinct shark and ray mechanics, eel asset, acceleration/coast/brake, better direction reversals | All 15 species in cruise, turn, rest and feeding; ordinary scenes with large animals |
| Reef anatomy | Individual pectorals, jaws, rigid spines, long snouts, streamers, barbels; local puffer inflation | All 39 species examined at useful sizes and both facings; detailed motion without warped eyes or armor |
| Slow life and ecological interactions | Claws/legs/antennae, tube-foot travel, exposed gills, feelers, tentacles, cleaner inspection; pairs, schools, home returns, feeding routes, ambushes and shadowing | Actual approach/contact/return, host/partner loss, interruption and normal population composition; all 10 residents examined |
| Combined refinement and Windows delivery | Correct remaining art/contact defects, recheck predator pressure and food readability, confirm performance and accessibility, complete the roster ledger | Individual acceptance records, populated gameplay, combined regression/native checks, one verified Windows archive |

## Current implementation checkpoint

- A 64-entry motion table and an initially authored 64-entry landmark table exist. Species-dependent local appendages have begun replacing the broad rectangular deformation fields. They remain prototypes awaiting completed visual acceptance.
- Bottom residents now approach reachable food, prepare, consume once, and recover. Seahorse feeding keeps its holdfast. Two small detritus resources per habitat close the previously missing scavenger-food loop. Selected existing patches are repositioned onto reachable substrate and kept independently selectable; this is a deliberate food-layout change, not a recovered original-game mechanic.
- The school profile source is shared with the roster table. Stable companion references, anemone hosts, local refuge/perch returns, feeding routes, shadowing and swimming circuits are wired into normal NPC updates. Feeding, avoidance and cleaner work retain precedence.
- Cleaner presentation visits three client inspection points. It does not create another cleaner or apply another healing transaction.
- Whole-body feeding squash is removed. Grounded animals use a support offset; upright/front-facing residents avoid fish-style mirroring in the creature renderer. Their placement against the paintings still needs refinement.
- Cache keys now repeat with the animation cycle; background-detail meshes use fewer subdivisions. The first capture exposed expensive cold misses, so a 3.5 ms frame budget has been added for generating new deformation frames. It reuses a nearby cached phase or the original sprite while new frames wait. A subsequent headless large-animal spot check recorded CPU draw p95 9.8 ms and 55 deferred frame requests over six seconds. It ran alongside browser regression workers, so it is not a clean comparative performance result; performance remains open.

## Evidence and explicit remaining gaps

188 unit tests passed after the new ecology tests were added alongside the original ecology suite. The new resident checks exercise all six bottom residents across all nine habitats, actual anchored seahorse feeding, and save/restore on either side of consumption. This is simulation evidence, not individual animation acceptance. The browser regression run passed 45 of 46 scenarios; the remaining turn fixture exposed a zero-size canvas allocation on incomplete diagnostic species data. A finite-dimension guard fixes it, and the targeted turn scenario then passed.

The latest completed 110 one-minute pressure scenarios preserve initial animal counts, have seven player bites and no deaths, versus 26 bites and no deaths in the earlier baseline. This large reduction remains a play-review question. The protection and hunter rules are still tested, but a nonzero bite count alone does not prove good tension.

The first batched browser capture has all 64 isolated rigs in a recorded sequence and eight populated-scene captures across 1600×900 and 1024×768. There were no browser errors. CPU draw p95 ranged from 5.5–13.2 ms before the new generation budget; one large-animal scene had a roughly 33 ms p95 frame interval. These results are headless Windows measurements with video recording, not a native-release performance claim. Populated scenes use ordinary composition, but the harness selects the species/section directly. The isolated gallery calls sprite deformation rather than the full creature pose pipeline; its thumbnail sizes are capped, so it does not establish actual gameplay-size coverage for every species.

Remaining blockers to a full-roster completion claim:

- **Moray:** the current coiled painting cannot serve as a convincing extended swimming pose. Two generated candidates still have an opaque painted checkerboard, confirmed as RGB without alpha. They were not installed. An actually transparent swimming asset remains required.
- **Actions:** ordinary fish bites still need anticipation before contact; the new full sequence currently applies to residents. Local puffer inflation remains unfinished.
- **Anatomy:** finish the difficult ray margins, lionfish fans, long streamers, crustacean joints and eye-protection checks in animated transitions. Authored landmarks alone are insufficient.
- **Attachment:** some background routes place attached/slow residents awkwardly against grass or open-looking portions of the painting. A valid route coordinate is not visual proof of support.
- **Turning:** the reduced card-thinning shortcut remains a transition to replace/refine, not a finished volumetric turn.
- **Social breadth:** test ordinary pair feeding/rejoining, refuge occupancy, host occlusion, group spacing and shadowing. Record sourced versus authored assignments; do not teach unsupported grouping as a biological fact.
- **Delivery:** no new Windows archive has been produced for this unfinished pass. The earlier Species Adventures archive remains preserved.

See [coverage.json](coverage.json) for the explicitly unaccepted species ledger. Update acceptance only from reviewed evidence, never from the existence of profile/rig rows.
