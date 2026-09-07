# Food selection in crowded scenes

The G02/G22 readability review found a concrete interaction defect: findAt searched animals before searching any food. A cursor directly on a renewable patch could therefore select an adjacent animal whose generous hit area overlapped the cursor. Food-to-food overlap also used list order rather than proximity.

Selection now considers all available targets within their existing hit areas and chooses the nearest center. Exact ties retain animal priority, consistent with their foreground drawing order. The same function serves paused inspection and active meal clicks. This is a modern usability repair, not a claim about the original game's undocumented hit-testing algorithm.

Against source 0851982, the initial-state census checked 331,650 food centers across 55 playable species, 30 seeds and nine scenes. Previously, 20,144 centers selected an animal (6.07%); after the repair, all centers select their own patch. This measures potential conflicts in those initial states, not a user error rate or a guarantee about every later overlap. The reproducible script is scripts/audit-selection.mjs; evidence is artifacts/selection-audit.json.

Three unit regressions cover direct clicks beside a poisonous slug, nearest-patch selection independent of array order, exact overlap, creature edges, dead creatures and depleted patches. The browser scenario uses actual mouse clicks at 1600×900 and 1024×768 to inspect algae, resume, approach and eat it beside a stunned slug. It verifies patch depletion, no poisoning and the slug remaining alive. The fixture isolates selection rather than ordinary animal behavior. A matching native Windows script is scripts/qa-selection-desktop.mjs.

All 123 unit/asset checks and all 32 browser scenarios pass; the browser report is preserved in artifacts/selection-e2e-results.json. All 55 playable species completed the ten-minute automated exploration exercise at seed 42 with protection disabled and without defensive abilities; artifacts/exploration-selection.json records the bounded exercise.

Food quantities, coordinates, nutrition, regrowth, click-area sizes, population settings and predator tuning are unchanged. Saves need no migration. Changing which nearby object a click selects is deliberate; the whole silhouette is not tested pixel by pixel. Dense background detail, foreground occlusion and food-patch clutter remain open G21/G22 work. Original and current screenshots were visually reviewed; dense scenery in the original is not evidence that every current food patch should be removed.
