# Visible propulsion across ten swimmers

Eight more animals use the continuously updated painted-part renderer: sprat, barracuda, needlefish, runner, whitetip shark, white shark, tiger shark and mackerel. With blacktip and fusilier, this covers the ten streamlined swimmers. Cowfish and stingray retain the preceding prototypes; the user-praised cuttlefish is unchanged.

Each new painting has its own tail cut, attachment lines and external fin pieces. Body cross-sections now use individual tail root, front of bend, spine height, amplitude and lag. The needlefish's entire long snout stays rigid. A tail-joint discontinuity was corrected: the final body cross-section and tail attachment now use the same tangent.

| Animal | Authored motion distinction |
|---|---|
| Sprat | Quick, shallow body drive and strong visible tail foreshortening; independent dorsal/pelvic strokes. |
| Barracuda | Slower firm tail sweep, restrained trunk and two separate dorsal pieces. |
| Needlefish | Small posterior bend behind the eye, sharp little tail and rear fins; no snout bending. |
| Runner | Strong forked-tail sweep with a shorter posterior wave and independent dorsal/pelvic folds. |
| Whitetip shark | More flexible rear body, slower strokes and quiet movement in its existing refuge routine. |
| White shark | Slow, restrained trunk/tail movement and broad pectoral braking. |
| Tiger shark | Larger posterior stroke and tail sweep than the white shark; separate dorsal/pectoral motion. |
| Mackerel | Quicker narrow-body stroke, pronounced tail foreshortening and separate fin folds. |

These are authored game-animation differences, not measured biological constants. No new original-game research or raster asset generation was used. Existing populations, movement rules and local social routines are unchanged.

## Evidence and corrections

The live preview now offers Four sharks, School swimmers and Long-bodied swimmers. Enlarged rows grow to fit the white shark instead of overlapping names and neighboring animals. A final functional correction avoids reallocating the preview canvas every frame when CSS rounds a fractional aspect ratio; the layout-specific browser test passes.

Six initial stroke comparison images were inspected. They show visibly different tail positions and fin projections, but also exposed thin fin remnants on blacktip, white and tiger sharks. Three body-only diagnostics confirmed that the masks excluded part of the original fin edge. Expanded cut boundaries include those edges; two enlarged shark confirmation views show the remnants removed. Three 1024-wide confirmation preview pages were inspected. Other generated confirmation views were not additionally inspected. The new normal-speed preview recordings are in `artifacts/propulsion-parts/confirmation/`; they are available for direct playback, not claimed as continuously watched by this review.

All sixteen ordinary mouse-driven gameplay images were inspected at 1600×900 and 1024×768 (`artifacts/propulsion-parts/gameplay/`). They show completed meals and returns within generated communities, with no browser errors in the report. These captures began before the last shark-mask correction; the confirmation gallery verifies that shape correction. Same-species player identification, very small sprat/needlefish silhouettes and overlapping shelter/cleaner labels remain clear usability defects. These entries remain partial reviews.

All 248 unit tests pass. New checks protect eyes, the full needlefish snout, tail-joint continuity and non-inverting fin projections. The twelve-species browser test proves more than 25 changed consecutive images in 30 frames even with the old mesh budget exhausted, and verifies pause/reduced motion without allocating new pose frames. Actual NPC glide/resume, fleeing-goby feeding and fusilier feeding/rejoining browser tests pass. Final preview layout behavior also passes its targeted test.

A new paired headless 240-frame diagnostic records 261 deferred shark requests out of 480 with the old mesh and zero with painted parts. Mean draw times were 12.05 versus 7.83 ms, p95 20.5 versus 17.4 ms, and worst 22.8 versus 26.7 ms. Other mesh animals still deferred 579 requests. This is bounded synchronous Chromium evidence, not native display FPS or full-game performance acceptance. The earlier four-part diagnostic is preserved as `artifacts/motion-visibility/renderer-comparison-four-parts.json`; the current result is `renderer-comparison.json` in the same directory.

Full-roster anatomy, larger local jaw actions, remaining social/attachment presentation, normal-speed perceptual acceptance, shared readability, native performance and final Windows packaging remain open. No new archive was made.
