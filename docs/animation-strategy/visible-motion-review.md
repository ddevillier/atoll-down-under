# Visible motion takes priority over rig counts

The user found the rendered progressions too similar and did not see convincing rigged motion. That criticism is valid: small local deformation and successful math/cache tests did not establish a successful animation uplift. The user specifically likes the cuttlefish and wants more life in the fish and sharks. Keep the cuttlefish's current presentation; use moving, normal-size evidence for subsequent work.

## New runtime prototype

Cowfish (s23), blacktip shark (s32), fusilier (s42) and stingray (s27) now use a lightweight painted-part renderer. Source paintings remain unchanged. Fin/tail pieces are masked into reusable canvases once, then transformed around authored attachment lines each frame. Foreshortening and sweep make the strokes visible. Shark and fusilier bodies use seven cross-section segments; their heads stay steady while the posterior body drives the tail. Cowfish keeps its armored-looking body and horns still while its dorsal/pectoral fins scull. Ray disc halves fold around their roots and the tail has a small independent trailing motion. The cowfish's small pectoral underlay uses adjacent flank paint locally beneath the moving cutout.

Actual displacement still controls effort. Low NPC effort is mapped continuously instead of rounding to the old mesh's zero/half/full bins. Deceleration briefly opens stabilizing fins while tail effort falls. Existing glide, pause, feeding preparation/contact, turns and reduced-motion controls remain in place. The new part renderer does not currently add a separately hinged jaw; the prior tiny jaw deformation is absent for these four, while mouth contact and feeding posture still operate. A larger mouth action is a remaining anatomy task, not something to claim as preserved visual detail.

This is an authored 2D projection, with rigid fin planes and seven body sections. It is not a full 3D rig. The existing midpoint facing change, painted anatomy limits, player identification and overlapping labels remain. No species is newly accepted on the strength of this prototype alone.

## Live evidence and review

`http://127.0.0.1:4173/scripts/motion-preview.html` provides normal-speed motion, pause, slow playback, normal/enlarged sizes, reef background and optional hinge guides. The left column is explicitly the unchanged painting, not a recorded previous animation. Both columns share a small drift to distinguish sliding from articulation. The nine-second swim/brake/settle/resume sequence is a presentation fixture, not ordinary gameplay or an exact reproduction of the renderer's movement-derived phase speed. Reduced-motion users start paused.

Four enlarged initial phase views were inspected. They exposed shark triangle seams; increasing triangle overlap corrected them in the confirmation views. Two enlarged confirmation phases and the 1024-wide confirmation page were inspected. The remaining 1600-wide page screenshot was generated but not separately inspected. All eight ordinary mouse-driven meal/movement screenshots (four species, 1600×900 and 1024×768) were inspected; the capture report has no browser errors. Gameplay videos were recorded, but continuous visual acceptance is not established by those screenshots. The live preview is provided to make the motion directly reviewable instead of relying on contact sheets.

## Rendering evidence

The first synchronous two-second populated-scene diagnostic observed 221 deferred shark requests out of 240. A subsequent controlled comparison (`node scripts/qa-painted-parts.mjs`, output `artifacts/motion-visibility/renderer-comparison.json`) uses the same seeded 240-frame scene for both paths:

| Headless Chromium result | Previous mesh | Painted parts |
|---|---:|---:|
| Shark requests | 480 | 480 |
| Deferred shark requests | 284 | 0 |
| Mean draw time | 13.50 ms | 11.65 ms |
| 95th percentile draw time | 21.70 ms | 25.00 ms |
| Worst draw time | 24.00 ms | 50.50 ms |

The new animals update every frame without a cached-pose fallback. Mean draw time improved in this sample, but tail latency worsened, and other species still had 968 deferred mesh requests. This does **not** establish smoother whole-game/native frame pacing. Cold preparation, the remaining mesh renderer and native performance need separate work before final acceptance. This is a synchronous headless diagnostic, not measured Windows display FPS.

## Checks and continuation

All 246 unit tests pass. Six targeted browser tests pass: new part motion under an exhausted mesh budget, live-preview controls, cuttlefish/seahorse pause/reduced motion, swimmer pose freezing, actual NPC glide/resume, and an actual fleeing-goby mouse meal. After adding the ray's small separate tail, the two part/preview tests pass again. New-part checks verify more than 25 distinct consecutive images in 30 frames with no mesh misses/deferments and only four prepared source rigs; they prove updating and control behavior, not aesthetic quality.

Keep the full 64-species goal active. Next, judge these moving fish/shark examples at gameplay size and carry the successful motion approach across the remaining body shapes with their own cut lines, fin strokes and routines. Preserve the praised cuttlefish. Finish shared readability, remaining social/attachment presentation, continuous review, native frame pacing and one combined Windows archive. No new package was produced for this prototype.
