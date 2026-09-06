# Life-science reference notes

The field guide separates natural-history explanations from the game's simplified rules. The following primary sources were read on 6 September 2026. The text in the game is newly written; source photographs and text are not copied into the asset library.

- [NOAA Ocean Service: Are corals animals or plants?](https://oceanservice.noaa.gov/facts/coral.html) supports coral polyps as animals, limestone skeletons, colony formation and partnerships with photosynthetic algae.
- [NOAA Ocean Service: What are plankton?](https://oceanservice.noaa.gov/facts/plankton.html) supports classification by drifting, life stages, phytoplankton and zooplankton, and feeding links.
- [NOAA Ocean Service: What is a sponge?](https://oceanservice.noaa.gov/facts/sponge.html) supports sponges as animals, water filtration, feeding on small particles, and differences from coral.
- [NOAA Fisheries: Restoring natural grazing processes can help coral reefs](https://www.fisheries.noaa.gov/feature-story/restoring-natural-grazing-processes-can-help-coral-reefs) supports the relationship between herbivory, algal control and coral recruitment.

The interactive food web is computed from `src/data.js` and the feeding size/armor rules. It is explicitly labeled as a game model. It does not represent measured prey preferences, ecological abundance, or a scientifically validated food web. Defenses and active periods can further affect encounters. Cleaner and detritus diets are shown as resource categories even though they are not ordinary clickable food patches.

Each lesson includes an observation or comparison question and states the processes the simulation omits. Teaching content must retain this distinction as the game grows.


## Species natural history (checked 6 September 2026)

Twenty-three entries in `src/natural-history.js` add independently written natural-history summaries and observation questions. Scientific names and real-world lengths are separate from simulation parameters. Source text and photographs are not bundled.

- Longnose butterflyfish: [Australian Museum](https://australian.museum/learn/animals/fishes/longnose-butterflyfish-forcipiger-longirostris-broussonet-1782/). Supports name, family, maximum length, range, habitat and diagnostic differences from the forcepsfish. The current illustration needs a species-identification art audit; its markings should not be used as a field identification reference.
- Banggai cardinalfish: [NOAA Fisheries](https://www.fisheries.noaa.gov/species/banggai-cardinalfish). Supports name, family, length (3.4 inches converted to approximately 8.6 cm), native range, copepod diet, mouthbrooding and individually distinctive spots. The simulation's activity period remains a scenario rule pending a species activity audit; reproduction is not simulated.
- Clown triggerfish: [Australian Museum](https://australian.museum/learn/animals/fishes/clown-triggerfish-balistoides-conspicillum-bloch-schneider-1801/). Supports name, family, length, identification and distribution. The comparison question is original teaching material, not a sourced causal claim.
- Bluestreak cleaner wrasse: [Australian Museum / Lizard Island Research Station](https://australian.museum/blog/amri-news/news-from-lirs-learning-from-the-cleaners-and-their-clients/). Supports parasite-feeding relationships and the reported damselfish visual-learning experiment. The game health meter distinguishes parasite removal from separate recovery rules for injury and poisoning. These recovery rules are authored game balance, not sourced biological rates.

Additional entries checked during the species-facts revision:

- Moorish idol: [Australian Museum / Lizard Island Field Guide](https://lifg.australian.museum/Group.html?groupId=5W64cXWZ&hierarchyId=qBHH2Q3E). Identity, family, standard length, appearance, local habitat, life-stage differences and feeding.
- Foxface: [Australian Museum](https://australian.museum/learn/animals/fishes/foxface-siganus-vulpinus/). Identity, length, range, markings, juvenile schools, pair formation and venom-bearing spines.
- Longhorn cowfish: [Dianne J. Bray, Fishes of Australia](https://fishesofaustralia.net.au/home/species/837). Identity, family, appearance, range and water-jet feeding. Length omitted because the source's quick-facts field is mislabeled.
- Humbug damselfish: [Dianne J. Bray, Fishes of Australia](https://fishesofaustralia.net.au/home/species/347). Banded humbug identity, length, coral shelter, zooplankton feeding and egg care. Entry avoids treating the historical broad Indian Ocean distribution as settled taxonomy.
- Orange-spotted filefish: [Dianne J. Bray, Fishes of Australia](https://fishesofaustralia.net.au/home/species/812). Identity, length, habitat, coral feeding and scent concealment. Algae acceptance remains explicitly identified as a game discrepancy. Source reports both usual Acropora specialization and an observed switch to Pocillopora; the entry does not claim exclusive dependence on one coral genus.
- Blacktip reef shark: [Florida Museum](https://www.floridamuseum.ufl.edu/discover-fish/species-profiles/blacktip-reef-shark/). Identity, recorded length, shallow habitat, site fidelity, diet and live birth.
- Whitetip reef shark: [Florida Museum](https://www.floridamuseum.ufl.edu/discover-fish/species-profiles/whitetip-reef-shark/). Identity, appearance, range, daytime cave use, communal resting and breathing while stationary.
- Great white shark: [NOAA Fisheries](https://www.fisheries.noaa.gov/species/white-shark). Identity, length, appearance, range, diet changes with age, regional endothermy and slow maturation.
- Tiger shark: [Florida Museum](https://www.floridamuseum.ufl.edu/discover-fish/species-profiles/tiger-shark/). Identity, recorded length, fading juvenile markings, varied diet and burst hunting. No conservation status or human-attack statistics were adopted from the museum shark pages; those claims require separately dated review.

Second facts batch (checked 6 September 2026):

- Reef crab: [Australian Museum, Crustaceans](https://australian.museum/learn/animals/crustaceans/). General body plan, external skeleton, jointed appendages and relationships. No crab species, size, range or universal scavenging diet is inferred from the catalog label.
- Red sea star: [NOAA Ocean Service](https://oceanservice.noaa.gov/facts/starfish.html). Sea-star identity, relatives, tube feet, arm diversity and regeneration. No exact species or diet claimed. The source's oversimplified comparison between blood and water-vascular systems was not adopted.
- Nudibranch: [Western Australia DBCA](https://www.dbca.wa.gov.au/wildlife-and-ecosystems/marine/marine-parks/fun-facts/nudibranches-sea-slugs). Adult shell loss, exposed gills, varied animal prey and defenses. The entry explicitly avoids giving all nudibranchs the game's sponge diet and poison flag.
- Spiral snail: [Australian Museum, Molluscs](https://australian.museum/learn/animals/molluscs/). Gastropod relationships, soft body, mantle, shell, foot and radula. No exact species or universal algae diet claimed.
- Needle-spined urchin: [Emily McLaren, Australian Museum](https://australian.museum/blog/amri-news/the-sea-urchins-of-sydney/). Examples of spine diversity, habitats, grazing and vegetated/barren habitat mosaics. These are group examples from Australian rocky reefs, not a tropical species identification or current regional population assessment.
- Sea anemone: [Australian Museum, Jellyfish, anemones and corals](https://australian.museum/learn/animals/jellyfish/). Cnidarian relationships and examples of partnerships with algae, fish and crustaceans. The entry describes a group and does not claim every anemone supports every partner.
- Lionfish: [NOAA Ocean Service](https://oceanservice.noaa.gov/facts/lionfish-facts.html). Pterois appearance and venomous spines; source explicitly covers red lionfish and devil firefish. Genus-level identification avoids assigning the stylized sprite to one of those species. No medical instructions or attack statistics are reproduced.
- Yellow seahorse: [Micheleen Hashikawa, University of Michigan Animal Diversity Web](https://animaldiversity.org/accounts/Hippocampus_kuda/). Educational species account supporting coastal habitat, gripping tail, feeding, color variation and paternal brood care. This is a sourced university synthesis, not a primary field study. Exact sprite identity remains unverified; no uncertain range endpoint, maturity or brood-size figures adopted.
- Banded coral shrimp: [Oregon Coast Aquarium](https://aquarium.org/animals/banded-coral-shrimp/). Identity, approximate body length, markings, habitat, pairing, cleaning, eggs and larval dispersal. No exact larval duration or nocturnal exclusivity claimed.
- Cuttlefish: [Australian Museum, Giant Cuttlefish](https://australian.museum/learn/animals/fishes/giant-cuttlefish-sepia-apama-gray-1849/). Named example supporting camouflage, changing texture, diet, communication and daytime activity. The catalog still lacks a species identification; the example is explicitly not asserted to be its identity. No claim that all cuttlefish share the giant cuttlefish's size or distribution.

The remaining 41 catalog entries do not yet have sourced natural-history expansions. Brief game descriptions remain available for all 64. Common names, artwork, activity periods and species-specific diets still need a complete consistency audit. Group entries provide useful facts but do not resolve species identification. Do not infer that this partial expansion verifies the full roster's natural history. See [SPECIES-FACTS-LEDGER.md](SPECIES-FACTS-LEDGER.md) for per-entry coverage.
