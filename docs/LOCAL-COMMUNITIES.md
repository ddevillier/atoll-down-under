# Practice community variation

Scene population sizes already varied, but the nine scenes shared three broad habitat filters. The forager draw now uses nine weighted preference lists. These are authored exploration mixes based on the existing catalog, not recovered Odell population tables or claims about precise wild distributions. Tournament sequence and progression are unchanged; its shared simulation also receives the community mixes.

| Scene | Favored daytime foragers |
|---|---|
| Sunlit Crest | Palette surgeonfish and the two rabbitfish |
| Table Coral Terrace | Orange coral goby, longnose butterflyfish, humbug damselfish |
| Outer Blue | Sprat, fairy basslet, fusilier and anthias |
| Sea Fan Garden | Butterflyfish, regal angelfish and bannerfish |
| Coral Cathedral | Moorish idol, parrotfish and filefish |
| Old Wreck | Royal gramma, pufferfish and batfish |
| Seagrass Meadow | Rabbitfish and yellow goatfish |
| Pearl Sands | Goatfish, pufferfish and cowfish |
| Quiet Grotto | Goby and gramma |

Preferred foragers receive weight 8, other foragers matching the broad habitat receive weight 2, and other eligible visitors receive weight 1. Existing activity, size and diet filters run first. The existing three-per-species preference remains, with its fallback when the eligible pool is exhausted. Daytime explicit schools and small companions are unchanged. Night has only four eligible non-hunting forager types in the current catalog, so night preferences provide less variety; this change does not invent more night species or change activity periods.

The hunter draw, population ranges, companion counts, food patches, cleaners, bottom residents, movement, damage and ability parameters are unchanged. One species-selection random draw is still consumed per forager. Existing saves retain their stored communities. Changed prey composition can affect later encounters even though hunter settings are unchanged.

Validation against c7b990c: 400 paired day/night starts across 200 seeds, covering 3,600 scene pairs, retained identical total counts, full initial hunter states, non-playable residents, food patches and final random seeds. The encounter census is in artifacts/community-census.json. Independent population tests cover all 55 playable species across 30 seeds. New community tests compare encounter proportions between scenes, rather than relying on higher counts in busier scenes, and check activity eligibility.

All 120 unit/asset checks and all 31 browser scenarios pass. Browser evidence is preserved in artifacts/communities-e2e-results.json. All 55 species completed the existing ten-minute automated exploration exercise at seed 42, with protection disabled and without defensive abilities; see artifacts/exploration-communities.json. This is a bounded regression exercise, not proof of child-play difficulty or original-game fidelity.

This partially addresses G02's community-composition gap. Food-patch clutter, visual spacing, roster identity mismatches and original-scene correspondence remain open. The parked Windows-Practice ZIP predates this source change.
