# Habitat population revision

New dives now use nine authored population ranges instead of roughly 24–25 NPC animals in every habitat. These are playability choices, not recovered original-game counts or estimates of wild abundance.

Each habitat starts with one fish-eating hunter. A second has a 25% chance, rising modestly to 45% in Outer Blue. Neither slot guarantees a shark or an animal large enough to eat the current player. The initial ceiling remains two. Pursuit speed, sensing, damage, satiation, rest and recovery are unchanged.

| Habitat | Sampled initial NPC range, day and night | Mean NPC animals |
|---|---:|---:|
| Sunlit Crest | 15–18 | 15.99 |
| Table Coral Terrace | 17–23 | 19.73 |
| Outer Blue | 13–18 | 15.08 |
| Sea Fan Garden | 14–19 | 15.99 |
| Coral Cathedral | 17–21 | 18.67 |
| The Old Wreck | 12–16 | 13.93 |
| Seagrass Meadow | 14–18 | 15.82 |
| Pearl Sands | 10–14 | 12.14 |
| Quiet Grotto | 9–13 | 10.38 |

Counts exclude the player and food patches. The census covers all 55 playable species, seeds 1–30 and nine habitats: 14,850 initial populations. Many species share generation paths, so these are not 14,850 independent random draws. Sampled ranges are not exhaustive theoretical bounds. A separate 1,000-seed test checks second-hunter frequencies and the difference between Outer Blue and every other habitat.

Quiet Grotto and Pearl Sands have fewer free-swimming foragers; the cathedral and terrace have more. Daytime open-water schools contain 3–5 companions depending on habitat and seed. Small companions remain elsewhere, with all existing bottom-resident foods, cleaner stations and renewable feeding patches preserved. This reduces animal crowding while retaining food access. Background detail, food-patch clutter and occlusion remain separate audit work.

Existing saves retain their actual animals and random-generator state. Loading a crowded old save does not silently cull it or reroll its communities; start a new dive to see the new ranges. Respawning restores members of the smaller generated population, rather than refilling to the former counts. A following hunter can still migrate between habitats, as before.

Validation: 106 unit/asset checks and all 27 browser scenarios pass. Tests cover all starting species across 30 seeds, quiet/busy ordering, food access, cleaners, one-to-two hunters, the regional probability difference and retention of old crowded saves. The population audit also runs 54 three-minute day/night fixtures with NPC feeding and respawning active. Quiet Grotto remained at 8–13 live NPCs, Pearl Sands 10–14, and the cathedral 15–20 in those fixtures. These stationary protected fixtures do not measure player difficulty or migrating hunters.

All 55 species survived the ten-minute seed-42 exploration exercise with feeding and cleaning, without deliberate predator avoidance or defensive abilities. There were 25 bites across 14 runs; 41 runs had none. This supports continued gentle play and available food, not restored predator fidelity. The scripts do not replace a child playtest. Evidence: `artifacts/population-audit.json` and `artifacts/exploration-populations-42.json`; reproducible with `node scripts/audit-populations.mjs` and `node scripts/qa-exploration.mjs populations-42 42`.

The parked fullscreen Windows ZIP remains the earlier baseline. This source revision is not yet included in that ZIP.

Timing correction: the first sustained audit requested 0.1-second steps, but the engine caps steps at 0.05 seconds. Those initial runs covered 90 seconds. The corrected audit uses 20 Hz and asserts 180 elapsed simulation seconds in each of all 54 rerun fixtures; the ranges above are from the corrected runs. Initial population and ten-minute exploration measurements were unaffected.
