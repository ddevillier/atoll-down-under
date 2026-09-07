# Shelter and protection feedback

This Practice-focused audit repair makes existing hiding rules visible without changing difficulty.

## What changed

- Inspection previously drew an ellipse with vertical radius half the actual circular hiding area. It now draws the actual radius, with a contrasting edge that remains readable over reef detail.
- Markers say whether the current fish can hide there. Large fish no longer see an unqualified Shelter label on areas they cannot use.
- Inside a hiding area, active feedback distinguishes stopping, taking cover and being hidden. An oversized fish gets a direct explanation. Pause, cleaning, feeding and route instructions retain priority when relevant.
- The initial protection message now includes active abilities among the actions that end protection. The hidden message describes concealment rather than promising general safety from hunger or existing injury.
- Status changes are exposed through a polite live region and only rewritten when the text changes. The basic control hint is hidden while a more specific message is shown, avoiding overlapping text. Long status messages wrap within the canvas width.

## Preserved mechanics and limits

The shared shelter module retains the authored strict size cutoff below 125, circular center-distance check and greater-than-0.7-second stillness delay. Moving reveals the fish. Active camouflage still works independently of shelter fit. No changes to predators, populations, energy, health, protection duration or scoring were made.

This repairs a presentation mismatch within G14 and incomplete protection wording within G13. It does not establish original-game meter behavior during protection, reproduce rock/coral occlusion, replace circular shelter regions with physical openings, or implement NPC shelter seeking. Those parts of the audit remain open.

## Verification

Unit checks cover a fish inside the true circle but outside the former drawn ellipse, stillness before/after the delay, moving out of concealment, the exact boundary, the size cutoff and large-fish camouflage. Browser checks exercise protected entry, actual hiding, paused small/large fit markers, oversized-fish feedback and status width at 1024 and 1600. The large-fish fixture deliberately enlarges a neon damselfish to isolate the size rule; it is not a new species or game balance change.

All 118 unit/asset checks and all 31 browser scenarios pass. The focused shelter scenario also passes after the final outline-contrast and active-ability wording refinements. Source Electron checks pass for fullscreen startup/toggling, feeding, steering, travel, shellfish, passive jaws, map, facts, populations and scoring, with no page errors and an isolated profile. The two visual review rounds inspected fit labels and boundary contrast at the tested widths.

Evidence: artifacts/shelter-full-e2e-results.json, e2e-results.json (final focused check), shelter-source-desktop-report.json and shelter-small/large-1024/1600.png. The large-fish fixture can retain a preceding hidden-event toast while paused because its body size is mutated directly for the test; gameplay does not resize an existing fish this way.

Native packaging verification is pending; the parked Windows-Species ZIP remains unchanged. Source Electron verification is not a claim that the testing ZIP includes these changes.
