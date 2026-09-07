# Small-fin propulsion with steady bodies

Four dedicated rigs replace the common rear-body wave for pufferfish, cowfish, triggerfish and filefish. The existing paintings now have independently controlled tails, median fins and overlaid pectoral fins. Protected body polygons keep markings steady, while fixed roots join fins to the body. Eyes, cowfish horns and the filefish spine remain steady. These are authored presentation choices; no new biological claims or original-game research were added.

| Species | Implemented and reviewed | Remaining limits |
|---|---|---|
| s22 Spotted pufferfish | Separate tail, dorsal, anal and pectoral fields. The actual Inflate ability expands the body with the fins carried by their painted attachment positions. The eye and tail retain their shape; release returns to the normal silhouette. | Inflation still stretches a single painting, and spot spacing changes with the body. Its small brown silhouette competes with detailed coral. |
| s23 Longhorn cowfish | Fixed armored-looking torso and horns; rooted dorsal, pectoral and tail strokes. Feeding uses a small local jaw gesture, with no bend through the forehead or horns. | The small fin strokes are subtle at normal size. Existing sand-blowing gameplay remains separate and was not re-reviewed in this front. |
| s24 Clown triggerfish | Upper/lower fin fields alternate in phase; the pectoral fin and tail have independent strokes around the protected spotted body. The actual meal strip uses edible animal prey. | This pass preserves the existing painting and catalog identity; it does not resolve their previously recorded biological identification limits. |
| s48 Orange-spotted filefish | Separate upper/lower fins and pectoral motion; steady central spots and tall spine. Feeding, settling and turns retain a connected outline. | Several similar neighbors can make the player's identity unclear. The spine remains painted in its raised position rather than becoming a new folding joint. |

## Implementation and compatibility

All four use a 20×16 mesh and the existing cyclic cache. The fin-sector rotation helper is shared with the prior long-fin rigs. Body protection excludes the overlaid pectoral field so that the fin can move without making the torso wave. Local mouth movement is restricted to the jaw region. Sampled meshes retain positive orientation through effort, turn, feeding and partial/full puffer inflation.

Inflation offsets are shared with generic custom templates. All three Create-a-fish templates (s5, s42, s16) retain visible puff deformation. The revised puffer fin attachment coordinates match the current large standalone painting more closely. No diet, simulation, save or population rules changed.

## Review evidence

All fifteen images in the completed first batch were inspected: four sixteen-phase actual-simulation strips, eight ordinary gameplay views at 1600×900 and 1024×768, an eight-phase real puffer ability strip, and inflated puffer gameplay at both sizes. Artifacts are in artifacts/rigid-motion/ and artifacts/rigid-puff/. Cruise, settling, both turn facings and real feeding commitment/recovery remain connected in the reviewed strips. Inflation captures show its rise, held state and release. Ordinary scenes use mouse movement, a chosen meal and the generated community; meal checks set energy to 60. The inflation scenes activate Space through the UI. Completed reports have no browser errors. Community counts match before/after the meal captures, including normal respawn handling.

The initial shared capture stopped when it assumed every diet contained a food patch. Triggerfish has only animal prey in this catalog. The corrected harness supplies an edible existing animal for the isolated meal and can select animals in ordinary communities. Pufferfish also eats sponge/coral and did not require that fallback. No shape correction was needed after the completed visual batch, so no confirmation polish round was run. The final browser-cleanup guard is syntax-checked only.

Fine fin rays remain difficult to see at the smaller window size, activity labels overlap, and the player can blend into similar neighbors. These are shared readability findings. Recorded gameplay videos have not been watched continuously. These four entries remain partially reviewed, not fully accepted.

## Checks and next work

All 239 unit tests pass (artifacts/rigid-motion-unit.log). New checks cover body/eye/root protection, horn/spine stability, active median fins, cyclic continuity, mesh orientation and all custom puff templates. Both targeted browser checks pass (artifacts/rigid-motion-e2e.log): real puffer crab/snail feeding and four-species pause/reduced-motion/repeating-cache behavior.

The latest simulation pressure evidence remains artifacts/roster-resident-simulation.json: 110 scenarios, 30 bites and zero deaths, with unchanged initial counts. Remaining reef/propulsion anatomy, full temporal and ordinary-game acceptance, shared visibility, native frame pacing and the final Windows archive remain open. No new package was created.
