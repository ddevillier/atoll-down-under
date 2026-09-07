# Schools, companions and feeding excursions

This pass addresses crowded schools and pairs that chase each other. It adds observable social routines without increasing animal counts. Full-roster animation acceptance remains open.

## Implemented behavior

School steering now uses painted body widths and up to six available neighbors. Feeding, recovering, cleaning, stunned and fleeing animals do not pull the rest of the school toward their heading. Nearby members still leave room for them. Small fin-driven lateral corrections, capped at 22 world pixels/second and 20% of species speed, separate close bodies while heading changes take effect. Exactly coincident animals receive deterministic opposite corrections rather than remaining stacked. These are authored simulation rules, not measured swimming mechanics.

At most two schoolmates select the same meal at once. A paired browser yields a shared meal to its existing partner. Normal food consumption, bite preparation/recovery, satiation and player choices remain authoritative. An occupied meal does not block another available meal. After eating, the animal can return to the school or its companion. Avoidance keeps its activity state between decision ticks, and takes priority over grouping.

Pairs use a stable lead/follow order: the follower returns to an open flank, while the leader slows if its partner falls behind. Shared grazing destinations sit on opposite sides of a patch instead of receiving unrelated offsets that may overlap. Pair identity persists across individual excursions and saves; existing loss/travel cleanup remains.

When playing foxface rabbitfish, pencilled rabbitfish or orange-spotted filefish, relevant authored communities reuse two existing forager slots for a nearby linked pair. Population selection still consumes its established random draws; no new fish or hunter slots are added. This deliberately changes species composition in those slots. Existing saves keep their current communities.

Filefish pairing remains an authored game assignment. Other previously flagged social assignments, including s11/s17/s28, still need source review before stronger educational claims. No original-game research or new biology claims were added here.

## Evidence

The spacing harness samples existing generated communities for 60 seconds, omits the first five seconds, and measures a body-ellipse overlap proxy among available same-species NPCs. It runs 32 cases: two seeds for each of the 16 playable school/small-group/pair profiles. Its geometry excludes long fins and is not pixel collision detection.

| Measure | Before | Final |
|---|---:|---:|
| School samples with body overlap | 7,353 / 20,500 (35.9%) | 247 / 20,500 (1.2%) |
| Pair samples with body overlap | 694 / 9,096 (7.6%) | 110 / 8,894 (1.2%) |

Evidence files are `artifacts/social-spacing-before.json` and `artifacts/social-spacing-composition.json`. Intermediate `after` and `final` files record the stages before the composition correction. Sampling exposure can change as animals feed or leave groups; these numbers demonstrate improvement in these scenarios, not universal collision-free behavior or lower animal density.

`artifacts/social-motion-unit-final.log` records all 213 unit tests passing. New functional checks cover coincident schools becoming distinct, actual limited meal excursions followed by rejoining, rabbitfish feeding and rejoining with preserved partner identity, deterministic save continuation, bounded/paused corrections, escaping a nearby predator then reforming, and 60 seeded paired-browser populations retaining counts and hunter limits. Existing ecology, cleaning, survival, saves and steering checks also pass.

`artifacts/social-motion-e2e.log` records the browser fusilier adventure passing its join, mouse-driven meal and rejoin sequence. Its controlled school fixture verifies the gameplay loop; ordinary-community captures provide separate composition evidence.

`artifacts/social-scenes/` and one confirmation batch in `artifacts/social-scenes-confirmation/` each contain eight screenshots/videos: fusilier, foxface, filefish and flashlight fish at 1600×900 and 1024×768. All sixteen screenshots were inspected. Both runs report no browser errors. The first run exposed missing filefish companions and widely separated rabbitfish. After composition changes, both pair species have linked NPC pairs at both sizes. Schools are visibly separated; the flashlight fish also show smaller local groups rather than one compulsory flock. The harness selects a habitat from the actual generated world, retains its animals/food/positions, enables protection, then uses normal mouse movement and Escape. These are not unmodified whole-session playtests, and recorded videos have not been directly watched as continuous playback.

`artifacts/social-motion-pressure-final.log` records 110 one-minute survival scenarios: 31 bites, zero deaths, initial animal counts unchanged. This matches the preceding cleaner pass's aggregate bite/death totals. Species mix and individual trajectories can change. No increase to attack duration, damage, pursuit range or hunter count was introduced.

## Remaining review

Strong motion acceptance still needs full-size animation/turn review, especially during fast local separation and group direction changes. The four pictured species do not stand in for all 64 animals. Some inspection labels overlap at shared shelter/cleaner locations, and busy backgrounds still conceal small appendages. No extra visual polish rounds were performed for those separate UI/art issues.

Refuge occupancy, host layering, shadowing, cave/perch return, cleaner-client safety and native performance remain separate unfinished fronts. This pass does not add live day/night simulation or offscreen population dynamics. No new Windows archive has been created.
