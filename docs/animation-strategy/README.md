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

The foundation's 110 one-minute pressure scenarios preserved initial animal counts, with seven player bites and no deaths, versus 26 bites and no deaths in the earlier baseline. The later anatomical-contact run below supersedes that result. Protection and hunter rules remain tested, but a nonzero bite count alone does not prove good tension.

The first batched browser capture has all 64 isolated rigs in a recorded sequence and eight populated-scene captures across 1600×900 and 1024×768. There were no browser errors. CPU draw p95 ranged from 5.5–13.2 ms before the new generation budget; one large-animal scene had a roughly 33 ms p95 frame interval. These results are headless Windows measurements with video recording, not a native-release performance claim. Populated scenes use ordinary composition, but the harness selects the species/section directly. The isolated gallery calls sprite deformation rather than the full creature pose pipeline; its thumbnail sizes are capped, so it does not establish actual gameplay-size coverage for every species.

Remaining blockers to a full-roster completion claim:

- **Moray:** an extended swimming illustration now has real alpha after user-authorized local background removal. The rig keeps its eye stable and sends a larger wave toward the tail. Cruise phases and both facings have been inspected; precise feeding contact, turns and refuge presentation remain open.
- **Actions:** ordinary player/NPC meals now settle an authored mouth landmark against the visible meal, with an interruptible anticipation/contact/recovery sequence and saved contact ownership. Every playable species obtains a meal from four approach directions. See the contact review below for visual scope and remaining source/contour limits. Puffer inflation now expands the torso locally and eases in/out; its final visual acceptance remains pending with the rest of that species.
- **Anatomy:** finish the difficult ray margins, lionfish fans, long streamers, crustacean joints and eye-protection checks in animated transitions. Authored landmarks alone are insufficient.
- **Attachment:** some background routes place attached/slow residents awkwardly against grass or open-looking portions of the painting. A valid route coordinate is not visual proof of support.
- **Turning:** short turns now use a nose-led pivot, bank and trailing body bend, with less silhouette compression. They still mirror the side-view painting midway; temporal smoothness and individual acceptance remain open. See the [turn review](turn-review.md).
- **Social breadth:** test ordinary pair feeding/rejoining, refuge occupancy, host occlusion, group spacing and shadowing. Record sourced versus authored assignments; do not teach unsupported grouping as a biological fact.
- **Delivery:** no new Windows archive has been produced for this unfinished pass. The earlier Species Adventures archive remains preserved.

See [coverage.json](coverage.json) for the explicitly unaccepted species ledger. Update acceptance only from reviewed evidence, never from the existence of profile/rig rows.

## Feeding and inflation continuation

After the initial foundation checkpoint, the full 193-test unit suite passes. New action checks cover actual meals for all 55 playable species, cancellation before contact, loss of a target and saves on both sides of the consumption boundary. Existing hunter/grazer/school tests were updated to expect visible preparation instead of an instantaneous first-frame bite; their resource, damage, satiation and rejoining assertions remain. Six targeted browser scenarios pass: mouse-driven feeding at both sizes, puffer shellfish, pause rendering, and the cowfish/goby/fusilier adventure loops.

Puffer inflation uses a smooth torso envelope with eye protection and fin attachment offsets, leaving overall sprite width and tail size stable. The first image review exposed an excessively peaked silhouette; a broader, gentler envelope improves the rounded body in the confirmation image. This two-pass shape check is not full species acceptance. The new action pipeline also still needs broader close-contact visual review: existing forgiving center-distance reach is preserved, so the mouth is not yet guaranteed to meet every target's rendered surface precisely.

## Attachment, individual timing and moray continuation

The full 199-test unit suite passes. A browser check at both desktop sizes confirms the 64 stored sprite dimensions match actual renderer crops and that clicking the seahorse's visible head selects it without moving its holdfast. Bottom residents now use body-plan support points and the seahorse uses its tail anchor; rings and picking follow their visible frames. Ground contact across every painting still needs review.

The earlier ID hash gave consecutive school members almost identical phases. An avalanche hash now distributes them around the stroke and spreads local refuge destinations. Paired foragers choose a shared patch with individual offsets; anemonefish return beside the rendered host crown. Terrace community weights now allow anemonefish in existing population slots. Twenty seeded populations preserve the count and hunter limits; normal encounter readability still needs broader review.

The moray's generated extended pose was cleaned locally with explicit user approval. Its new 1902×353 runtime crop replaces the coiled sprite. A dark-background inspection and a four-phase sheet show joined body markings, a stable eye, intact mouth edges and both facings. The script also records normal Practice movement with the selected moray. These checks are limited to this asset/rig front and do not mark the species fully accepted. The old compressed-spine experiment was rejected and is not in runtime code. No new Windows package has been made.

## Anatomical feeding contact continuation

The [feeding contact review](feeding-contact-review.md) records actual preparation/contact/recovery phase inspections for 62 species, corrections to shark/ray feeding points and resident morsel layering, and ordinary goatfish gameplay at both desktop sizes. All 201 unit tests pass, along with the three targeted browser scenarios. The latest 110 pressure scenarios preserve initial counts and produce 31 bites, zero deaths, and at most one bite per run. Full-roster acceptance remains pending: contact geometry is authored, the sponge food crop has a stray fragment to correct, and this review does not establish continuous turning or complete local ecology presentation.

## Controlled turn continuation

The [turn review](turn-review.md) records the full creature renderer across all 64 animals, a correction to excessive compression, and ordinary mouse-driven shark movement at both desktop sizes. The final 204-test unit suite passes; two targeted browser checks cover turn state and paused rendering. Grounded and attached residents bypass swimming turns. This is an authored 2D transition using existing paintings, with a remaining midpoint mirror change. Gallery framing clips several first-column tails, so those screenshots cannot establish complete silhouette acceptance. All species remain unaccepted in the broader ledger; native performance and the combined Windows delivery remain outstanding.

## Cleaner inspection and station arrivals

The [cleaner review](cleaner-review.md) records a foreground ordering fix, anatomy-based wrasse/shrimp inspection points and actual ordinary day/night visits at both desktop sizes. It also documents a gameplay bug discovered during capture: diagonal approaches could orbit the station forever. Requested visits and NPC waiting positions now use slowing final approaches. All 207 unit tests pass; both cleaners reach three inspection areas with all 47 eligible playable species. Pressure checks retain 31 bites and no deaths across 110 runs, with initial counts unchanged. Continuous visual acceptance and station safety for NPC clients remain open; no additional health transaction or predator immunity has been introduced.

## Social spacing and individual excursions

The [social review](social-review.md) records body-aware separation, limited shared-meal excursions, stable pair lead/follow behavior and paired browsers in existing forager slots. In 32 generated-community samples, the body-overlap estimate falls from 35.9% to 1.2% for schools and 7.6% to 1.2% for pairs. These are geometric estimates, not universal visual acceptance. All 213 unit tests and the browser fusilier join/eat/rejoin adventure pass. Eight ordinary-community views and one confirmation batch cover four species at both desktop sizes. Pressure checks still report 31 bites and zero deaths with initial counts unchanged. Refuge, host, shadowing and complete animation review remain open.

## Refuges and host partnerships

The [refuge review](refuge-review.md) records persistent individual resting places, separate anemone berths, compatible player/NPC hosts for trumpetfish, and drawing behind the host. All 217 unit tests and two targeted browser scenarios pass. Nine habitat views, a partnership close-up and mouse-controlled batfish scenes at both desktop sizes were inspected. Pressure checks record 27 bites and no deaths over 110 runs with initial counts unchanged. Painted substrate contact and continuous motion quality remain open; no species is marked fully accepted and no new Windows archive has been created.

## Cleaner client courtesy

A [cleaner continuation](cleaner-review.md#client-courtesy-continuation) closes the observed bug where a recovered predator ate another waiting patient. NPC hunters leave clients at actual service positions alone, and treated NPCs receive an eight-second departure rest. Distant requests and fish outside those positions retain ordinary predation. All 221 unit tests and three cleaner browser scenarios pass, including the mixed queue with hungry clients. The latest pressure run reports 30 bites, zero deaths and unchanged initial counts across 110 scenarios. Individual visual acceptance and final delivery remain open.

## Separate ray anatomy

The [ray review](ray-review.md) records distinct stingray/electric-ray disc, head and tail controls, actual-simulation cruise/settle/turn/feed strips and mouse-driven meals in generated communities at both desktop sizes. All 223 unit tests and the ray pause/reduced-motion/cyclic-cache browser check pass. One initial visual batch and one confirmation batch were inspected. Their current 2D silhouettes remain joined and readable; continuous playback, seabed attachment and native performance remain open. No simulation rule or Windows archive changes in this presentation pass.

## Separate long fins and fans

The [fin review](fin-review.md) records eight dedicated rigs with independent tails, fin sectors and streamers, protected attachments and stable eyes. All 225 unit tests and the eight-species browser pause/reduced-motion/cache check pass. Eight full-renderer simulation strips, sixteen ordinary gameplay views at both desktop sizes and eight confirmation strips were inspected. Thin dark fins, player identification and overlapping activity labels remain shared readability issues. Continuous playback and the cost of the finer meshes remain open; all species retain partial review status and no new Windows archive was created.

## Food crop cleanup

The [food extraction continuation](feeding-contact-review.md#food-extraction-continuation) resolves the recorded sponge fragment and related grid-boundary defects in the other food sprites. One initial sheet and one confirmation were inspected, including all eight foods and actual nudibranch meal phases. Original atlas bytes remain unchanged; the correction is in extraction. Broader animal animation, habitat attachment and delivery remain in progress.

## Resident appendages and close-passer responses

The [resident review](resident-review.md) records dedicated shrimp/crab joints, snail shell protection and separate nudibranch gills/feelers. Crawlers briefly pause and withdraw near a larger neighbor, then tolerate a lingering neighbor or recover after quiet. Ground travel now drives animation effort using actual crawl speed. All 230 unit tests and two resident browser scenarios pass; the final targeted run also verifies respawn cleanup. Sixteen images were inspected across the initial batch and one confirmation. Pressure checks retain 30 bites, zero deaths and unchanged initial counts across 110 scenarios. Fine-detail visibility, complete substrate contact, continuous playback, remaining anatomy groups and native performance stay open.

## Separate radial anatomy

The [radial review](radial-review.md) records directional sea-star arms, independently timed urchin spine groups, and anemone tentacle paths with a fixed base and inward crown contraction. All 233 unit tests and two browser scenarios pass. Three actual-routine strips and ordinary nighttime communities at both desktop sizes were inspected after correcting the capture fixture to include the nocturnal urchin. Shape continuity and direction-aware cache behavior are verified within that scope. Fine dark details, complete attachment, continuous playback, remaining species groups, native performance and final Windows delivery remain open.
