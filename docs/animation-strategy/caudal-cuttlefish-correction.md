# Cuttlefish restoration and caudal motion correction

September 9. Active work; completion remains unproven.

## Plan and acceptance

1. Preserve the current source and measure all 53 caudal-fish species over complete cycles at low, medium and full swimming effort. Separate intrinsic tail movement from swimming position and whole-body pitch. Confirm representative painted-pixel measurements against renderer transforms; do not treat transparent polygon corners as visible tips.
2. Remove the combined vertical spine wave and tail shear in side-view fish. Use horizontal projection changes about attached tail roots, preserve species cadence, effort, braking, pectoral/median-fin activity, feeding and turn controls. Apply the same projection convention to mesh-rendered fish; rays, prehensile seahorse tails and invertebrates retain their distinct geometry. Target less than 1% sprite-width intrinsic caudal vertical travel in neutral swimming across the covered roster, with visible horizontal motion retained.
3. Resolve the praised cuttlefish from historical evidence and the user's clarification. Restore a clearly traveling fin-skirt cycle and independent arms in the actual gameplay renderer, preserving eyes/core, camouflage, pause and reduced motion. Check actual game cadence and budget effects; a preview-only animation is not delivery.
4. Inspect moving before/after evidence at gameplay and enlarged sizes, run relevant geometry, lifecycle and renderer tests, and verify actual native gameplay. Package a separate Windows testing build and preserve previous ZIPs. Report measured changes and any remaining limitation.

The initial mathematical audit samples the same authored tail landmarks at 240 cycle phases. Some are polygon boundaries, so its large values are diagnostic, not yet a claim about the visible fin silhouette. Baseline source is retained under artifacts/caudal-baseline/src and measurements under artifacts/caudal-before.json.

## Implemented correction

The 44 painted caudal fins now use horizontal foreshortening around the authored hinge. Both endpoints stay attached and every painted tail pixel keeps its intrinsic height. Posterior body bending is projected into a small length change instead of a vertical wave. The nine remaining caudal fish use corresponding mesh projection, including the moray's continuous posterior body. Species cadence, effort, braking, feeding, pectoral and median fins remain active. Custom fish use the matching painted template during normal swimming. Whole-animal position, pitch and turns remain separate from this intrinsic caudal measurement.

The cuttlefish was subsequently given small movements in the specialist pass, despite later notes saying it was preserved. Historical source contains larger arm amplitudes and a .046 skirt amplitude. This correction restores that expressive range with protected modern landmarks. It also fixes a specific suppression: pathWeight's progress-to-the-power-of-1.5 taper is suitable for an arm rooted at one end, but diminished most of a continuous fin ribbon. The ribbon now carries its wave along its length. Arms have independent phases and broader influence bands to prevent folded mesh triangles. The cycle has 48 samples; the player's base and camouflage layers get the requested phase even when background animals have spent the mesh budget. Camouflage still uses the existing sand/reef blending behavior.

No answer to the optional historical-reference clarification was available while this work progressed. The working interpretation is the flowing fin ribbon and expressive arms, rather than inventing a new color display. This is restoration of the earlier expressive range with corrected geometry, not a claim to have identified an exact user-approved video frame.

## Measured evidence

The full mathematical sweep covers **53 species × three efforts × 240 phases**. Every covered caudal landmark now has under 1% sprite-width vertical travel, and each species retains measurable horizontal motion at full effort. The independent painted-pixel audit reads actual Canvas draw transforms and follows the opaque distal 8% of each tail, avoiding transparent polygon corners.

At full effort, the former opaque tail landmark travelled vertically by:

| Species | Previous intrinsic travel at gameplay size | Corrected |
|---|---:|---:|
| Blacktip reef shark | 54.49 px | 0 px |
| Tiger shark | 61.37 px | 0 px |
| Yellowtail fusilier | 25.27 px | 0 px |
| Peach fairy basslet | 12.45 px | 0 px |
| Bluestreak cleaner wrasse | 8.60 px | 0 px |
| Painted frogfish | 7.98 px | 0 px |
| Longhorn cowfish | 5.38 px | 0 px |
| Longnose butterflyfish | 6.12 px | 0 px |

These are displacement ranges of the same painted landmark in body-local coordinates, not changes in the fish's world position. Source geometry sweeps and actual rendered measurements are retained in artifacts/caudal-before.json, caudal-after.json and caudal-rendered/measurements.json. The moving comparison records the actual previous and corrected renderers, not static original paintings. Enlarged and small views were inspected in a bounded initial/confirmation review.

The first ordinary-control cuttlefish tests exposed a test-navigation issue: the target sand point was underneath the activity card at compact sizes. The test hides its expanded guidance and swims through an unobscured waypoint so the normal card-avoidance behavior exposes the target at both sizes. The corrected test then swims to the real site, blends, verifies animation during rest, pauses and resumes, and swims away to release camouflage. No animal or food positions are changed.


All **351 unit tests** pass. The 11 distinct targeted browser scenarios pass across the completed regression run and corrected three-case cuttlefish rerun: normal controls at both sizes, full cuttlefish phase updates under exhausted background budget, painted-piece alignment and pause/reduced motion across all 45 painted rigs, and fin/rigid/swimmer motion plus actual feeding. Native packaging and timing are the final gates.
