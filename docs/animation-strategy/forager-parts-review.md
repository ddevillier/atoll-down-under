# Reef browsers, foragers and goatfish barbels

Seven previously unreviewed fish now have independently posed painted tails and fins: longnose butterflyfish, yellow goatfish, squirrelfish, Oriental sweetlip, regal angelfish, yellowspot emperor and golden snapper. Butterflyfish and angelfish retain steady deep bodies; the other five use gentle rear-body bending with protected heads. Resting pectoral activity, braking and feeding transitions use the shared renderer's actual movement state. There are now 41 species on the continuously updated painted-part path. Cuttlefish and original image bytes stay unchanged.

Goatfish have two separate painted barbel pieces with independent timing. A stronger sweep accompanies an existing worm or shrimp meal's final approach and feeding contact. The cue is shared by player and NPC fish and smoothly decays after cancellation. It does not reveal hidden food, change diet, extend contact reach, grant another meal or model sensory detection. The guide's family-level account motivates this presentation; its scope note now explains the authored cue. No additional original-game research was used.

## Actual behavior and interruption

The initial attempt used the existing generic `searching` activity. A ten-seed, sixty-second community sample found no goatfish entering it: ordinary food acquisition or school movement took precedence. A cue dependent on that state alone would rarely appear. The final implementation derives `probing` from an available nearby worm or shrimp target on the existing meal approach. It is recomputed every step and does not add a persistent target or timer to saves. Feeding commitment still belongs to the existing one-meal pipeline.

Unit tests exercise player consumption and cancellation; NPC food loss, stun, cleaning, death/respawn and save replay; and a naturally generated seed-2 NPC feeding trip. The renderer interpolates the cue, freezes it with the motion clock on pause, and uses static artwork with reduced motion. A mouse-driven browser test verifies the cue is delivered to the painted parts during an actual meal approach and fades after moving away. Broader digging, barbel tucking and precise substrate contact remain unfinished.

## Visual review

Seven source paintings, seven initial full-renderer cruise/settle/turn/feed strips and fourteen ordinary mouse-driven Practice meal captures were inspected. Every species was viewed at 1600x900 and 1024x768. The gameplay captures retain generated food and animals; player energy starts at 60 for visible meal feedback. All 21 capture scenes completed without browser errors. Some captures predate the final fin-mask corrections and goatfish cue integration.

Initial inspection exposed a fixed edge beside the butterflyfish anal fin and leading pectoral remnants on sweetlip, emperor and snapper. Cut boundaries and adjacent-paint underlays were corrected together. Five confirmation strips cover those four fish and the goatfish's actual feeding response. Detached remnants are removed in these views, while underlay texture remains an approximate reconstruction. The heads, long butterflyfish snout and goatfish barbel roots stay steady. No separate jaws were added in this pass; several stiff dorsal areas also remain fixed.

Tail and fin phase differences are visible in the strips. Small fins and especially barbels are subtle in the reef; busy coral and overlapping animals still limit readability. Ordinary still captures and recorded videos that have not been continuously watched do not establish final normal-speed perceptual acceptance.

Two initial ordinary NPC probing views exposed activation before the fish faced its meal and a label obscuring the animal in the smaller window. The cue now requires alignment toward the meal. The hover caption adds **Inspecting a meal**, and label placement protects the inspecting fish. Two final views of the generated seed-2 trip at 43.33 seconds were inspected; the fish is facing its shrimp target and the label stays clear at both sizes. These captures retain all 12 generated NPCs and do not replace food or positions. The welcome toast persists because the simulation is advanced directly alongside the renderer. Evidence and exact target state are in `behavior-confirmation/`.

## Verification and delivery scope

All 268 unit tests and five final targeted browser scenarios pass. The browser coverage includes cropped-canvas placement for all 41 species, continuous motion with the old mesh budget exhausted, pause/reduced motion, live preview controls, the goatfish interaction and activity-label clearance at both desktop sizes. Pressure testing still records 26 bites and zero deaths in 110 scenarios with unchanged initial populations; runtime source hashes are recorded. Native frame pacing and memory acceptance remain open.

Evidence is in `artifacts/forager-parts/`, including `unit-final.log`, `browser-final.log`, `pressure-final.json`, `capture.log`, ordinary/initial images and `confirmation/`. The live comparison offers **Reef browsers** and **Squirrelfish and foragers**. This is a completed implementation pass within the broader incomplete roster uplift. Individual perceptual acceptance, remaining specialist anatomy and ecology, and the combined Windows archive remain open. No new archive was created.
