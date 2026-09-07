# Roster uplift: developer review and Windows handoff

The animation and local ecology implementation now covers all 64 catalog animals. Forty-five use continuously posed pieces cut from their existing paintings; nineteen use dedicated deformation controls. The cuttlefish painting and deformation remain preserved. This is a reviewed testing candidate, not a claim of perfect animation or a biologically exact simulation.

## What reads differently

Sharks and streamlined fish have conspicuous alternating tail strokes, trailing body movement, propulsion/coasting differences and banked direction changes. Small reef fish use shorter tail strokes and separate fin sculling. Armored bodies stay comparatively rigid. Rays flex their discs, the moray sends a wave toward its tail, long fins have local motion, and attached residents keep their support while their exposed parts move. Feeding, cleaner inspection, goatfish probing, frogfish displays and nearby-passer reactions use actual simulation state.

Schools and pairs make individual feeding excursions. Refuge residents return home; anemonefish occupy host berths; trumpetfish follow compatible cover; cleaners inspect clients continuously; bottom residents reach food on painted support routes. The existing population limits and gentle encounter rules remain. There is no new offscreen ecology or live day/night cycle.

## Individual visual review

`scripts/qa-roster-final-poses.mjs` adds eight full-renderer boards covering every species. Each row shows three cruise phases 0.15 seconds apart and three turning phases; attached animals instead show quiet phases. Poses advance at 60 Hz. Root translation is removed so a moving sprite cannot masquerade as articulation. Each cell shows both 1600-wide and 1024-wide game sizes. These are controlled renderer inputs, not natural gameplay or watched continuous video.

All eight initial boards were inspected. Every animal has distinct cruise images; none touches the sample-canvas boundary. A layout correction separates tall animals from the smaller duplicate and captions; the batfish/seahorse board was inspected again. No anatomy was changed during this final board review. The individual observations are recorded in `coverage.json`, alongside earlier feeding, turning, anatomy and ordinary-game reviews. The ledger's acceptance means developer visual review for this testing build; it does not represent user approval of the animation's feel.

The strongest visible changes are tail-driven swimmers, shark silhouettes, wrasse inspection and independently moving large appendages. Small fins remain subtle at 1024-wide display size. Slow residents intentionally have restrained motion. The boards complement the prior motion-state, pause, reduced-motion, feeding-contact and native timing evidence; they do not establish monitor playback quality by themselves.

## Natural social sequences and the last correction

`scripts/qa-social-meal-stories.mjs` records real NPC approach, committed meal and social return states from generated communities. It does not inject animals, food, hunger, positions or protection. The harness selects an existing habitat, advances the simulation at 60 Hz, then restores exact event checkpoints for screenshots. A pair return means a retained partner within two body widths after the meal; a school return means resumed school steering. These criteria do not promise zero transient body overlap.

| Species | Seed / habitat index | Meal time | Return time | NPC count |
|---|---|---:|---:|---:|
| Yellowtail fusilier | 42 / 0 | 23.48 s | 23.85 s | 15 |
| Foxface rabbitfish | 42 / 0 | 10.38 s | 10.75 s | 15 |
| Orange-spotted filefish | 42 / 4 | 29.70 s | 31.82 s | 19 |
| Flashlight fish | 42 / 2 | 2.50 s | 2.87 s | 17 |

The screenshots exposed a hover name covering the inspected fish's companion. The renderer now reserves the focused animal, its linked partner and nearby schoolmates when placing labels. Four smaller-display return views and four larger-display meal views confirm that the focal fish and companions remain visible. Unrelated animals can still pass behind labels. This last runtime change affects presentation only.

Initial capture attempts had stale HUD titles after checkpoint assignment; the final harness redraws the UI synchronously through its existing pause control. Use `artifacts/social-meal-stories/label-confirmation/` for final review, not the earlier capture directories.

## Combined verification

- All 277 unit tests passed, covering current/legacy saves, interruption, meals, resident support, relationship cleanup, cleaner safety, schooling and predator response.
- The combined browser run passed 73 of 74 tests. The remaining test assumed a natural frogfish encounter in seed 25; the new support routes moved its home and changed that encounter. A 100-seed scan found current natural encounters in seeds 57 and 78. The test now uses seed 57 without changing the lure behavior or weakening the label assertions.
- A targeted rerun exposed an independent fixture flaw: a repositioned visitor could retain an earlier avoidance state. The controlled player-lure setup now selects a free-swimming visitor and clears that stale state. Both lure tests and both label tests pass, including the new natural-pair regression. This brings the distinct browser checks to 75, with the combined run and targeted corrections recorded separately.
- The last simulation pressure matrix remains 110 scenarios, 26 bites, zero deaths and unchanged initial populations. No simulation code changed in this final review.
- Native performance, bounded cache work and sampled cuttlefish preservation are documented in `native-animation-review.md`. A final native confirmation and packaged Windows verification are recorded in the delivery record.

## Known limits and next feedback

Turns use a banked, compressed side-view painting and still switch its facing midway. A true frontal turn would need another art/animation front. Fine fins can disappear against detailed coral at small display sizes. Bottom support is authored against a 2D painting; it has no foreground depth mask. Some grouping choices are explicitly authored game behavior rather than sourced biological claims. Natural lure encounters are occasional, not guaranteed in every dive. None of these limitations is concealed by the acceptance count.

The next useful feedback is a short normal-speed play session with a shark, a reef fish and a cleaner: does their movement feel alive, can the player follow the action, and are feeding and social returns enjoyable? Further subjective tuning should follow that evidence rather than another automatic cycle of species-wide polish.
