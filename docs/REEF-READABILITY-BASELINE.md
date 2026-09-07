# Reef readability baseline

September 6, 2026, gameplay source `2ab4435`, following the cleaner queue milestone. This check uses the current game only; no original-game comparisons or external research were performed.

## What the current state shows

The population valleys are present. A fixed-seed initial daytime dive has 10 animals in Quiet Grotto and 20 on Table Coral Terrace. Counts include attached/bottom residents and the cleaner. This single snapshot illustrates the authored population ranges; it does not replace the broader evidence in POPULATION-REVISION.md.

Food-site counts vary much less than animal counts. The quieter animal habitats still contain many feeding sites:

| Habitat | Animals | Food patches |
|---|---:|---:|
| Sunlit Crest | 15 | 22 |
| Table Coral Terrace | 20 | 24 |
| Outer Blue | 16 | 21 |
| Sea Fan Garden | 17 | 20 |
| Coral Cathedral | 19 | 22 |
| The Old Wreck | 13 | 21 |
| Seagrass Meadow | 16 | 26 |
| Pearl Sands | 13 | 25 |
| Quiet Grotto | 10 | 20 |

Food centers are at least 71 world units apart in these authored layouts, with per-habitat minima from 71 to 122. That does not prove sprite silhouettes are separated or easy to see: rendered heights differ by food kind, and the backgrounds contain similar-looking painted organisms.

The existing cleaner queue captures (`artifacts/cleaner-queue-Neon-1024.png` and `cleaner-queue-Flashlight-1600.png`) show Cathedral with food removed and only four fish plus a cleaner. Its painting still looks visually busy. This is a visual assessment of those captures, not a measured contrast or player-error result. Removing more animals alone would not address that background detail.

## Consequence for the next pass

Favor clearer separation of playable organisms from the painting before reducing food supply. Food removal could make specialist feeding harder, contrary to the gentle-difficulty direction. Any presentation change should preserve food coordinates, diets, energy rewards and regeneration unless a separately justified gameplay change is requested.

The user has been offered a choice between scene readability, distinctive species behavior, and holding further feature work for playtesting. No additional feature, food reduction, asset generation or historical reconstruction is bundled into this baseline. The previously verified Windows Cleaner Queues ZIP remains the testing build. The broader objective remains open.

Reproduce the snapshot with `node scripts/qa-reef-readability.mjs`; machine-readable evidence is saved to `artifacts/reef-readability-baseline.json`.
