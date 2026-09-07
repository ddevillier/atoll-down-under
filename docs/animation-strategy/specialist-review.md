# Cuttlefish and seahorse anatomy

Two dedicated 20×16 rigs replace the generic specialist fields. These are authored movement choices fitted to the existing paintings, with no new original-game research.

| Species | Implemented and reviewed | Limits |
|---|---|---|
| s19 Cuttlefish | A travelling wave follows the painted blue fin skirt. Four arm paths move independently around fixed roots; feeding advances the arm tips. The mantle and eye remain steady. Actual cruise, settling, reversal, feeding and sand/reef camouflage frames retain connected contours and aligned color layers. | Fine arm movement is subtle at gameplay size. The shared reversal still mirrors a side-view painting. Cache-pressure alignment needs integration review. |
| s44 Yellow seahorse | Local dorsal-fin flutter, a small upper-body feeding lean carrying the head and eye together, and an exactly fixed lower tail curl. Actual meal preparation/contact/recovery returns to attached rest. Generated-community inspection preserves the holdfast. | It remains a single upright pose. Small cached images become soft when magnified. A fixed coordinate does not prove complete attachment to the background painting. |

## Evidence and capture correction

The first batch completed seven inspected images: a sixteen-phase cuttlefish strip, two cuttlefish gameplay views, a seahorse routine/meal strip, a ten-phase camouflage strip, and two meadow inspection views. Ordinary views use mouse input and generated populations at 1600×900 and 1024×768. Reports have no browser errors; meadow counts remain 16 and holdfast coordinates do not change.

The first enlarged seahorse sheet incorrectly magnified only the animal, leaving the resident food marker in normal world coordinates. The harness now scales the complete rendered world sample. The confirmation sheet shows the morsel arriving at the snout. This was a capture defect, not a change to gameplay feeding rules. The confirmation also produced an inspected camouflage sheet and 1600×900 community view, then timed out selecting the seahorse at 1024×768. That view is covered by the successful first batch and separate browser tests, but the confirmation run is incomplete. No third visual polish batch was run. The harness now preserves intermediate evidence, closes its browser on failure, checks pause state, and chooses an exposed selectable point in the unchanged community; those final harness changes are syntax-checked only.

Artifacts: artifacts/specialist-cuttle/, artifacts/specialist-motion/, and artifacts/specialist-motion-confirmation/. Video recordings have not been reviewed as continuous playback. These are partial species reviews, not full acceptance.

## Checks and remaining integration

All 236 unit tests pass (artifacts/specialist-motion-unit.log). Three new tests cover protected mantle/roots, rigid head geometry and fixed tail, and positive mesh orientation/cyclic continuity. Four browser scenarios pass (artifacts/specialist-motion-e2e.log): cuttlefish camouflage and interruption, attached selection at both sizes, meadow feeding/inspection/save return, and specialist pause/reduced-motion/cyclic-cache behavior.

No simulation rules changed. The latest pressure evidence remains the resident run: 110 scenarios, 30 bites, zero deaths and unchanged initial counts. Custom-fish templates currently use s5, s42 or s16, so dedicated specialist early returns do not bypass custom puff inflation; preserve that compatibility when those templates receive new rigs. Native pacing, full temporal acceptance, shared visibility, remaining swimmers and final Windows delivery remain open. No new package was created.
