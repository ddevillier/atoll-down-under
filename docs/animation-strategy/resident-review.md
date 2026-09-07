# Jointed and soft-bodied residents

Four species now use dedicated appendage controls and protected body regions. Broad rectangular leg/foot fields and the duplicate generic feeler paths have been removed for these animals. The new 20×16 meshes deform the existing paintings continuously; they do not introduce separate skeletal assets or claim measured biomechanics.

| Species | Implemented and observed | Remaining limits |
|---|---|---|
| s45 Banded coral shrimp | Separate phased leg paths, shoulder/elbow claw movement, trailing antennae and a restrained tail response. Protected central body and eye. The existing cleaning action drives the claw gesture. Three actual inspection stages were reviewed against damselfish, grouper and moray clients. Antennae and claws stay connected; the shrimp draws in front of the client. | Claw segments remain painted surfaces, with small authored bends. Individual legs/antennae are hard to distinguish against the busy reef at normal size. No continuous-playback or native performance acceptance yet. |
| s46 Reef crab | Protected carapace and two eyes; five visible leg paths have different phases, with separate elbow controls for both claws. Feeding and withdrawal move claws locally. The front-facing painting avoids a swimming mirror/bank. | Leg changes remain restrained. The inspection guide line is a support reference, not a claim that all painted feet lie on one physical plane. Complete substrate contact and continuous gait review remain open. |
| s60 Nudibranch | Separate rear-gill branches and two front feelers, a protected central back, subtle foot travel and local feeding reach. Upper appendages settle during withdrawal. Reviewed travel, rest, close-passer response, recovery and real sponge feeding, including both facings. | Bright outline remains legible, but small appendage changes are subtle at ordinary size. The painted skirt is not a physical foot/contact model. |
| s61 Spiral snail | Explicit protected shell polygon, independent upper feelers, local head reach/withdrawal and a small foot wave. Shell contour and spiral markings remain steady in reviewed phases and both facings. | Shell protection favors stillness near the shell lip; the soft foot motion is small. Full ground attachment and continuous reversal review remain open. |

## Local response and locomotion

The existing detection of a nearby larger animal now causes the crab, nudibranch and snail to pause briefly as they withdraw. An uncommitted reach can be cancelled; a committed meal finishes handling exactly once. A sustained neighbor is tolerated after the initial response, so an animal is not permanently prevented from feeding. A quiet interval restores its response to another close pass. This is an authored interaction; the three guide limitations state that distinction. It does not grant predator immunity or change population counts.

The first regression run exposed a snail that could never eat while another resident stayed nearby. Bounded exposure and recovery fix that failure without removing the interaction. `passerExposure` is capped at four, persisted and validated in both direct restore and file import, and removed on respawn. Old saves default to no exposure.

The renderer also measured crawling effort against catalog swimming speed. Slow post-meal travel could round down to zero in the animation cache and suppress leg motion. Grounded animals now use their actual authored ground speed as the effort reference. The browser check verifies post-meal travel produces approximately 0.45 effort and the brief withdrawal reduces it below 0.02. Non-grounded swimming retains its existing reference.

## Reviewed evidence

The first visual batch comprises eleven inspected images:

- `artifacts/resident-motion/`: three 16-frame strips using actual isolated resident routines, plus two normal UI-entry Practice community views at 1600×900 and 1024×768.
- `artifacts/resident-cleaner-motion/`: two cleaning inspection sheets (wrasse comparison and changed shrimp), plus four actual UI-requested day/night treatment screenshots at the two desktop sizes. All six cleaner/client combinations reach three inspection stages; all four ordinary treatments reach the captured point with restored health and no browser errors.

The single confirmation batch in `artifacts/resident-motion-confirmation/` contains the three resident strips and two community views after the ground-effort correction and bounded response. All five images were inspected. Total: sixteen reviewed images. The community captures preserve generated residents and use ordinary mouse movement; the player remains a playable fish, since these bottom residents are NPCs. Counts match before/after each community capture. Both resident reports and the cleaner report have no browser errors.

Close-up contours remain joined; the shell/carapaces do not visibly pulse as whole sheets. At normal size, the crab, snail and nudibranch are recognizable, but fine appendage motion competes with coral detail. Shared label collisions and ambiguous painted ledges remain. Inspection strips follow the animal with an enlarged renderer width; the horizontal line identifies its authored support level, not a validated seabed. Recorded videos have not been watched as continuous playback. This evidence remains partial individual review.

## Verification

All 230 unit tests pass in `artifacts/resident-motion-unit-final.log`. New checks cover protected geometry, roots/eyes, positive triangle orientation and cyclic continuity under motion/action extremes; actual interrupted and committed meals; quiet recovery and tolerance of lingering neighbors; and valid/damaged saves. The final five-test resident run adds direct respawn cleanup assertions (`artifacts/resident-motion-targeted-final.log`). Existing all-resident feeding checks continue to reach actual meals across all nine habitats.

Both browser scenarios in `artifacts/resident-motion-e2e.log` pass: full-pose pause/reduced-motion stability and bounded repeating cache entries for all four animals, plus actual ground-effort/withdrawal behavior for the three crawlers. The 110 pressure scenarios in `artifacts/roster-resident-simulation.json` report 30 bites, zero deaths and unchanged initial counts, matching the preceding run's aggregate bite/death results. These are controlled survival observations, not proof of a child's experience or native frame pacing.

The cost of the finer resident meshes remains part of the final populated/native performance work. Star, urchin, anemone, seahorse, cuttlefish, remaining swimmers, shared visibility and the combined Windows archive remain in the whole-roster scope. No species is marked fully accepted by this pass.
