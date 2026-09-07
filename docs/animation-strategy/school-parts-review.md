# School fish fins and flashlight organs

Peach fairy basslet, flashlight fish, silver trevally and purple anthias now use independently posed painted fins and tails. Basslet, flashlight fish and anthias also have gentle rear-body bending with protected heads; trevally keeps its deep body steady. Resting pectoral strokes, reduced tail effort and braking spreads use the existing motion state. This brings the continuously updated painted-part path to 34 species. Cuttlefish and source asset bytes remain unchanged.

The flashlight fish's painted organ beneath its eye dims and reveals itself, remaining bright during feeding and the defensive ability. The dim base is baked into the prepared body, and the original luminous cutout blends over it without moving the eye. The 3.4-second cycle is authored game timing, not synchronized school signaling or a claim about an exact species. The existing guide limitation now explains that scope. No new original-game research was used.

Defensive flash previously stunned every nearby animal. It now stuns only living fish capable of eating the player. Schoolmates and cleaners continue moving. Range, duration, energy cost, cooldown, population and other abilities are unchanged. School steering is unchanged in this pass; generated companions differ by habitat and diet, so all four species do not have equally large schools.

## Visual review

Four source crops, four initial full-renderer cruise/settle/turn/feed strips and eight ordinary Practice meal captures at 1600x900 and 1024x768 were inspected. The ordinary captures use generated communities and mouse input without replacing food or animals. Tail and fin positions differ across the strips, while small appendages remain difficult to distinguish against busy coral at playing size. Mouths remain static for these four species.

Initial inspection found a detached trevally dorsal fleck and residual pectoral edge. Corrected cut boundaries and the flank underlay remove those remnants in its confirmation strip. An initial flashlight comparison exposed a blunt dark patch; a feathered dim base and protected head region improve the final light comparison and confirmation strip. Underlays remain approximate reconstructions from nearby paint.

Five final flashlight images were inspected: one three-state light comparison and ordinary dim/defensive-flash community views at both desktop sizes. These advance the simulation and renderer together, activate Space, then pause for inspection. The bright patch is clear in the enlarged comparison but subtle on the small dark fish in the reef. No predator was in flash range in those ordinary scenes; the controlled browser fixture establishes the predator response. Recorded meal videos have not been continuously watched, so this remains partial visual evidence rather than perceptual acceptance.

## Verification and remaining work

All 264 unit tests pass. Five targeted browser checks pass for local light changes, actual ability input, crop placement across all 34 part species, movement under exhausted old mesh budget, pause/reduced motion and preview controls. A final five-test interaction run repeats the two flashlight checks and three swimmer checks, proving a schoolmate travels while a stunned predator stays still, NPC glide recovery, and mouse-driven feeding. These runs contain eight distinct browser scenarios.

Pressure testing covers 110 scenarios with 26 bites, zero deaths and unchanged initial populations. It does not exercise the defensive ability; separate unit and browser checks do. Runtime source hashes are recorded in the pressure report. Native frame pacing, memory and continuous normal-speed visual acceptance remain open.

Evidence is in `artifacts/school-parts/`: `unit.log`, `browser.log`, `interaction-final.log`, `pressure.json`, source/strip/gameplay images and `confirmation/`. The live preview adds a reef-school group. This completes this bounded implementation pass, with all species still partially reviewed. Remaining roster anatomy, local routines, fine-detail readability and the combined Windows archive remain open. No new archive was made.
