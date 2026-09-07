# Feeding contact review · September 7, 2026

This is a completed implementation/checkpoint for feeding alignment within the active whole-roster uplift. It is not full animation acceptance or a new Windows delivery.

## What changed

Ordinary player and NPC feeding now approaches a contact point using the animal's cropped painting and authored mouth landmark. It settles its heading, makes small positional corrections, prepares, then commits the existing meal once within three world pixels of that landmark. Steering away interrupts preparation immediately. Long snouts no longer use the same center-distance stopping rule as short-bodied fishes. Near-vertical approaches choose a stable side from position rather than oscillating with heading. Incoming hunters retain continuous travel across habitat boundaries.

Shark landmarks now lie at the painted lower jaw; ray targets sit beneath the anterior disc, whose movement quiets during feeding. This is an authored 2D representation, not measured biomechanics or a pixel-perfect collision surface. Existing diet, damage, nutrition, pursuit/rest and population rules remain.

Ground residents approach food relative to their feeding structure. Seahorse resources are near the snout rather than the tail holdfast; anemone resources are near the oral disc rather than the base. A small colored morsel follows the resident's real preparation/contact state. Starfish and urchin morsels render beneath the body. Resource-layout version 2 migrates prior layouts once without refilling resources or duplicating detritus. A conflicting unassigned patch can move locally so a fixed feeder's food remains reachable and independently selectable.

## Visual evidence and findings

`scripts/qa-feeding-contact.mjs` records three actual simulation action states for 62 species. The two cleaning partners are deliberately left for the cleaner-session review. Each state uses the full creature renderer with isolated snapshot IDs; these are static phase comparisons, not continuous locomotion/turning videos. Thumbnail scaling is for inspection and does not prove readability at every ordinary gameplay size.

All eight first-round sheets were inspected, followed by a batched correction and a confirmation of the affected sheets. The first gallery cropped some left-facing residents; its layout now fits the full food/animal bounds. The review changed shark/ray feeding landmarks and moved radial-animal morsels beneath their bodies. The three action states establish improved contact presentation; they do not establish species-wide acceptance.

| Sheet | Species reviewed | Main observations |
|---|---|---|
| 0 | s0–s7 | Snouts meet plankton/plant/coral areas; long butterflyfish snout remains intact. Small atlas fish have limited fine mouth detail. |
| 1 | s8–s15 | Goatfish barbels remain below the mouth, plant browsers reach their patch, and worm/shrimp preparation preserves the face. |
| 2 | s16–s23 | Needlefish reaches with the long jaw, cuttlefish with the arm region. Lionfish/scorpionfish silhouettes stay joined. Puffer and cowfish keep rigid body forms. |
| 3 | s24–s31 | Triggerfish contacts the visible crab body; moray uses its extended pose; the stingray settles over food beneath the front disc. |
| 4 | s32–s39 | Shark contact now sits below the snout. Electric-ray food is beneath the disc. Wobbegong and grouper handling remain readable in the enlarged view. |
| 5 | s40–s42, s44, s46–s49 | Seahorse feeds near its snout while preserving the holdfast; crab brings a morsel inward; starfish food stays under the body. |
| 6 | s50–s57 | Predator contact is separated from prey disappearance; frogfish's lure and silver trevally's long fins remain distinct from the mouth cue. |
| 7 | s58–s63 | Snail and nudibranch reach from the appropriate facing; shell/base remain firm; urchin food is below the body and the anemone responds around the oral disc. |

Evidence directories: `artifacts/feeding-contact/` (first round), `artifacts/feeding-contact-confirmation/` (confirmation). Ordinary UI entry and mouse-driven goatfish feeding in Pearl Sands were captured at 1600×900 and 1024×768. Puffer crab/snail meals and meadow feeding/inspection/saved return pass their browser scenarios. The older meadow fixture clicked the tail's world anchor; it now clicks the visible seahorse head and separately checks the preserved holdfast.

Remaining visual limits: the sponge food-atlas crop contains a small stray fragment at its left edge, visible in the nudibranch sheet. It was initially mistaken for gallery clipping and remains after the bounded confirmation. Correct that source/extraction issue in the outstanding asset pass. Fine jaws in the small original atlases remain subtle. Moving-prey surface contact uses the visible body's approximate inner edge; it is not an alpha-contour collision system. Continuous reversals, full locomotion, ecology presentation and ordinary-size acceptance remain in the broader ledger.

## Verification

- Full suite: **201 unit tests pass** (`artifacts/anatomical-contact-unit-final.log`). The 55 playable species each complete a real meal from four starting directions, with a mouth-gap assertion at the actual consumption boundary. Cancellation, missing food, saved preparation/commit and malformed contact coordinates are covered.
- All six bottom residents feed on actual resources across all nine habitats. Seahorse feeding preserves the holdfast. Version-one layout migration preserves counts, amounts and regrowth and is idempotent.
- Three targeted browser scenarios pass after the meadow fixture correction: puffer shellfish, mouse feeding/reward at both sizes, and meadow feeding/inspection/saved return. First two: `artifacts/anatomical-contact-e2e.log`; corrected meadow: `artifacts/anatomical-contact-meadow-confirm.log`.
- Updated pressure run: **31 bites, zero deaths, maximum one bite in a run**, across 110 one-minute stationary/scripted-swimming scenarios. Five bites occur in stationary runs and 26 in moving runs. Every initial population count matches the original baseline. The prior foundation checkpoint had seven bites; the pre-uplift baseline had 26. These are reproducible simulation observations, not proof that encounter timing feels right to a child.

The original baseline is preserved in `artifacts/roster-before-simulation.json`; the foundation checkpoint is preserved in `artifacts/roster-foundation-simulation.json`; current results are in `artifacts/roster-after-simulation.json`. Broader performance, native Windows validation and the combined release remain pending.
