# Tail-driven swimmers and quiet glides

Ten paintings now use separately authored posterior-body, caudal and fin controls. Tail lobes rotate together around a peduncle, while dorsal and lower fins move with their attachment points. Heads and eyes remain steady. The needlefish's long snout is excluded from body bending. These coordinates and rhythms are authored animation choices, not measured animal kinematics; no new original-game research or asset generation was used.

| Species | Motion signature | Observed limit |
|---|---|---|
| s0 Silver sprat | Small posterior wave, quick caudal strokes and independently timed school glides. | Tiny silver silhouette is difficult to follow against detailed coral. |
| s17 Blackfin barracuda | Restrained body bend, firm tail stroke, two separate dorsal fields and a longer glide. | Fine pectoral movement is subtle at normal size. |
| s18 Crocodile needlefish | Straight protected snout, very small rear-body wave and localized rear fins. | Thin outline and muted color have poor contrast against coral. |
| s28 Rainbow runner | Strong forked-tail propulsion, separate pectoral brake and shorter drive/glide cycle. | Its bright painting resembles the fusilier at a glance. |
| s32 Blacktip reef shark | Rear-body wave, connected unequal tail lobes and rooted dorsal/pectoral fins; quiet effort while still moving. | A same-species neighbor can obscure player identity. |
| s33 Whitetip reef shark | More flexible posterior wave, quiet tail at its existing refuge and a smooth return to swimming. | This front does not establish painted seabed contact. |
| s34 Great white shark | Broad stable head, restrained tail-driven bend and the longest authored glide. | Turn-camera clipping in the first inspection was corrected in the capture fixture. |
| s35 Tiger shark | More posterior flexibility than the white shark, stable head/stripes and rooted fins. | Two nearby tiger sharks are difficult to distinguish as player versus NPC. |
| s42 Yellowtail fusilier | Quick tail rhythm, pectoral corrections and individual quiet intervals while schooling. | Player identification within its own school remains weak. |
| s49 Doublelined mackerel | Restrained trunk, firm tail stroke and independently rooted small fins. | Thin fins disappear at the smaller window size. |

## Simulation and presentation

Supported NPCs share a drive/glide cadence between movement and rendering. A glide reduces circuit or school speed to 78% and smooths the tail effort toward quiet without stopping forward motion. Individual ID phases prevent simultaneous school-wide glides. Feeding, avoidance, cleaning and refuge states bypass passive glides. The player keeps movement-driven effort. Non-swimmer circuit timing is preserved. Existing ecology clocks survive save/load, so this adds no new saved fields or population slots.

All ten use the existing cyclic cache with a 20×16 mesh. Eye protection, positive mesh orientation, cyclic continuity, real glide/resume behavior, priority interruptions and save continuity are tested. Custom template s42 retains shared inflation deformation. The cost of the finer meshes still needs final native measurement.

## Reviewed evidence

The initial ten actual-simulation strips in `artifacts/swim-motion/` were inspected, showing cruise, settling, turning and actual meal phases. The four-shark NPC sheet in `artifacts/swim-routines/shark-routines.png` was inspected: three moving sharks enter quiet glides and resume, while the whitetip becomes quiet at home. This fixture follows actual simulation states; its plain background does not prove substrate attachment.

All twenty ordinary gameplay images in `artifacts/swim-combined-gameplay/` were inspected at 1600×900 and 1024×768. Captures use Practice menu controls, mouse movement/reversal and a clicked edible meal in the generated community, with initial player energy set to 60. The completed report records twenty scenes and no browser errors. Its entity counts include dead/respawning entries; they are not alive-density measurements. Existing activity labels overlap, fine silhouettes compete with coral, and same-species player identification remains an issue.

A confirmation batch follows the visible body center during the inspection turn. White shark and needlefish confirmation strips were inspected; the white shark's tail is no longer clipped. The other eight confirmation strips were generated but not additionally inspected because their initial strips already showed complete silhouettes and the articulation did not change. Camera-following strips do not establish the full world-space pivot trajectory. Videos were recorded but not watched continuously. These ten entries remain partially reviewed.

Initial capture attempts exposed two distinct issues: the harness could choose a cleaner as prey even though clicking it requests service, and a real fleeing-meal docking bug could prevent a faster player from catching a goby. The former is excluded by the harness; the latter is fixed in runtime and documented in [feeding contact review](feeding-contact-review.md#moving-meal-continuation). The NPC sheet's resume threshold was also changed from an absolute activity threshold to a relative effort threshold so a slower circuit could complete the fixture.

## Checks

All 246 unit tests pass (`artifacts/swim-combined-unit.log`). Eight of nine targeted browser scenarios passed in the combined run; the new goby test failed before gameplay because it did not open the menu disclosure. After using the shared visible-menu helper, that test passes in `artifacts/moving-meal-browser.log`. Thus all nine targeted scenarios pass, including fusilier join/eat/rejoin, three cleaner scenarios, puffer shellfish, meadow feeding, ten-species pause/reduced-motion/cache behavior, a real NPC glide and the fleeing-goby meal.

The final 110 pressure scenarios record 31 bites, zero deaths and unchanged initial populations (`artifacts/roster-moving-meal-simulation.json`), one additional bite compared with the pre-fix swimmer run. Complete continuous-motion review, remaining species anatomy, shared readability, native performance and final Windows delivery remain open. No new archive was created.
