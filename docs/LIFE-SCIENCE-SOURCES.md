# Life-science reference notes

The field guide separates natural-history explanations from the game's simplified rules. The following primary sources were read on 6 September 2026. The text in the game is newly written; source photographs and text are not copied into the asset library.

- [NOAA Ocean Service: Are corals animals or plants?](https://oceanservice.noaa.gov/facts/coral.html) supports coral polyps as animals, limestone skeletons, colony formation and partnerships with photosynthetic algae.
- [NOAA Ocean Service: What are plankton?](https://oceanservice.noaa.gov/facts/plankton.html) supports classification by drifting, life stages, phytoplankton and zooplankton, and feeding links.
- [NOAA Ocean Service: What is a sponge?](https://oceanservice.noaa.gov/facts/sponge.html) supports sponges as animals, water filtration, feeding on small particles, and differences from coral.
- [NOAA Fisheries: Restoring natural grazing processes can help coral reefs](https://www.fisheries.noaa.gov/feature-story/restoring-natural-grazing-processes-can-help-coral-reefs) supports the relationship between herbivory, algal control and coral recruitment.

The interactive food web is computed from `src/data.js` and the feeding size/armor rules. It is explicitly labeled as a game model. It does not represent measured prey preferences, ecological abundance, or a scientifically validated food web. Defenses and active periods can further affect encounters. Cleaner and detritus diets are shown as resource categories even though they are not ordinary clickable food patches.

Each lesson includes an observation or comparison question and states the processes the simulation omits. Teaching content must retain this distinction as the game grows.


## Species natural history (checked 6 September 2026)

Four entries in `src/natural-history.js` add independently written natural-history summaries and observation questions. Scientific names and real-world lengths are separate from simulation parameters. Source text and photographs are not bundled.

- Longnose butterflyfish: [Australian Museum](https://australian.museum/learn/animals/fishes/longnose-butterflyfish-forcipiger-longirostris-broussonet-1782/). Supports name, family, maximum length, range, habitat and diagnostic differences from the forcepsfish. The current illustration needs a species-identification art audit; its markings should not be used as a field identification reference.
- Banggai cardinalfish: [NOAA Fisheries](https://www.fisheries.noaa.gov/species/banggai-cardinalfish). Supports name, family, length (3.4 inches converted to approximately 8.6 cm), native range, copepod diet, mouthbrooding and individually distinctive spots. The simulation's activity period remains a scenario rule pending a species activity audit; reproduction is not simulated.
- Clown triggerfish: [Australian Museum](https://australian.museum/learn/animals/fishes/clown-triggerfish-balistoides-conspicillum-bloch-schneider-1801/). Supports name, family, length, identification and distribution. The comparison question is original teaching material, not a sourced causal claim.
- Bluestreak cleaner wrasse: [Australian Museum / Lizard Island Research Station](https://australian.museum/blog/amri-news/news-from-lirs-learning-from-the-cleaners-and-their-clients/). Supports parasite-feeding relationships and the reported damselfish visual-learning experiment. The combined game health meter is explicitly distinguished from real parasite removal.

The remaining 60 catalog entries do not yet have species-specific sourced natural-history expansions. Brief game descriptions remain available for all 64. Common names, artwork, activity periods and species-specific diets still need a complete consistency audit. Do not infer that this partial expansion verifies the full roster's natural history.
