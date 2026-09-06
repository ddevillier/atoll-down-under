# Life-science reference notes

The field guide separates natural-history explanations from the game's simplified rules. The following institutional sources were read on 6 September 2026. The text in the game is newly written; source photographs and text are not copied into the asset library.

- [NOAA Ocean Service: Are corals animals or plants?](https://oceanservice.noaa.gov/facts/coral.html) supports coral polyps as animals, limestone skeletons, colony formation and partnerships with photosynthetic algae.
- [NOAA Ocean Service: What are plankton?](https://oceanservice.noaa.gov/facts/plankton.html) supports classification by drifting, life stages, phytoplankton and zooplankton, and feeding links.
- [NOAA Ocean Service: What is a sponge?](https://oceanservice.noaa.gov/facts/sponge.html) supports sponges as animals, water filtration, feeding on small particles, and differences from coral.
- [NOAA Fisheries: Restoring natural grazing processes can help coral reefs](https://www.fisheries.noaa.gov/feature-story/restoring-natural-grazing-processes-can-help-coral-reefs) supports the relationship between herbivory, algal control and coral recruitment.

The interactive food web is computed from `src/data.js` and the feeding size/armor rules. It is explicitly labeled as a game model. It does not represent measured prey preferences, ecological abundance, or a scientifically validated food web. Defenses and active periods can further affect encounters. Cleaner and detritus diets are shown as resource categories even though they are not ordinary clickable food patches.

Each lesson includes an observation or comparison question and states the processes the simulation omits. Teaching content must retain this distinction as the game grows.


## Species natural history (checked 6 September 2026)

Fifty-two entries in `src/natural-history.js` add independently written natural-history summaries and observation questions. Scientific names and real-world lengths are separate from simulation parameters. Source text and photographs are not bundled.

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

The remaining 12 catalog entries do not yet have sourced natural-history expansions. Brief game descriptions remain available for all 64. Common names, artwork, activity periods and species-specific diets still need a complete consistency audit. Group entries provide useful facts but do not resolve species identification. Do not infer that this partial expansion verifies the full roster's natural history. See [SPECIES-FACTS-LEDGER.md](SPECIES-FACTS-LEDGER.md) for per-entry coverage.

## Third facts batch (checked 6 September 2026)

- Palette surgeonfish: [Georgia Aquarium · Palette Surgeonfish](https://www.georgiaaquarium.org/animal/palette-surgeonfish/). Appearance, tail spines, reef habitat, plankton/algae diet and coral shelter; no venom potency or current conservation claim adopted.
- Sixbar wrasse: [Dianne J. Bray · Fishes of Australia: Sixbar Wrasse](https://fishesofaustralia.net.au/home/species/284). Markings, shallow habitats, broad diet and changes between female and male phases. Fish eggs and small fish remain absent from the game menu.
- Regal angelfish: [Dianne J. Bray · Fishes of Australia: Regal Angelfish](https://fishesofaustralia.net.au/home/species/658). Adult/juvenile markings, cave-associated habitat and sponge/tunicate diet. No settled global species boundaries asserted; source notes taxonomic uncertainty.
- Painted frogfish: [Australian Museum · Painted Anglerfish](https://australian.museum/learn/animals/fishes/painted-anglerfish-antennarius-pictus/). Identity, variable colors, length, association with sponges and distribution. This source does not establish the game lure mechanics.
- Crocodile needlefish: [Dianne J. Bray · Fishes of Australia: Crocodile Longtom](https://fishesofaustralia.net.au/home/species/2097). Jaw and tail shape, total length, near-surface habitat, fish diet and leaping. No human injury examples reproduced.
- Whitemouth moray: [Dianne J. Bray · Fishes of Australia: Whitemouth Moray](https://fishesofaustralia.net.au/Home/species/3812). Markings, pale mouth, length and reef distribution. Natural diet and daily activity remain unverified by this source.
- Rainbow runner: [Dianne J. Bray · Fishes of Australia: Rainbow Runner](https://fishesofaustralia.net.au/home/species/4273). Pelagic habitat, range and predominantly invertebrate feeding. No inference that the game hunter category represents dominant natural diet.
- Longfin batfish: [Australian Museum · Longfin Batfish](https://australian.museum/learn/animals/fishes/longfin-batfish-platax-pinnatus/). Life-stage appearance, length and distribution. Common-name overlap with other Platax species is explicitly disclosed; artwork identification remains open.

## Fourth facts batch (checked 6 September 2026)

- Blackfin barracuda: [Dianne J. Bray · Fishes of Australia: Blackfin Barracuda](https://fishesofaustralia.net.au/home/species/2554). Markings, tail shape, length and reef distribution; no chase-speed evidence claimed.
- Humphead wrasse: [Fishes of Australia · Humphead Maori Wrasse](https://fishesofaustralia.net.au/home/species/2962). Adult/juvenile appearance, diet, reef habitat and life cycle; no current legal or conservation status adopted.
- Giant grouper: [Dianne J. Bray · Fishes of Australia: Queensland Groper](https://fishesofaustralia.net.au/home/species/4672). Life-stage coloration, solitary behavior and use of caves, wrecks and coastal habitats. No record-size superlative adopted.
- Coral trout: [Dianne J. Bray · Fishes of Australia: Common Coral Trout](https://fishesofaustralia.net.au/home/species/4518). Blue spots, color changes, hunting/resting behavior and differences from related coral trout. Source biology line contradicts its own term protogynous; the sex-change claim was deliberately omitted.
- Doublelined mackerel: [Dianne J. Bray and S. Schultz · Fishes of Australia: Scad Mackerel](https://fishesofaustralia.net.au/home/species/722). Divided lateral line, outer reef schooling, diet and appearance. Conflicting source size fields were omitted.
- Golden snapper: [Dianne J. Bray · Fishes of Australia: Golden Snapper](https://fishesofaustralia.net.au/home/species/558). Markings, coastal/estuarine habitat, mangrove juveniles and food. No nocturnal exclusivity established.
- Pencilled rabbitfish: [Dianne J. Bray · Fishes of Australia: Bluelined Rabbitfish](https://fishesofaustralia.net.au/home/species/1049). Common-name match, markings, venomous spines, grazing and paired movements; sprite identity still needs checking.
- Yellowspot emperor: [Dianne J. Bray · Fishes of Australia: Goldspot Seabream](https://fishesofaustralia.net.au/home/species/2222). Markings, reef habitats, daytime schools and nighttime feeding. Common-name mapping additionally supported by NOAA species table; game daytime setting remains a documented discrepancy.
- Longfin bannerfish: [Australian Museum · Longfin Bannerfish](https://australian.museum/learn/animals/fishes/longfin-bannerfish-heniochus-acuminatus-linnaeus-1758/). Identification, length, habitat, diet and distinction from schooling bannerfish.

Yellowspot emperor name cross-check: [NOAA species table](https://downloads.regulations.gov/NOAA-NMFS-2014-0130-0016/content.pdf); its spelling aurolineatus is reconciled to the museum account aureolineatus. No fisheries rules are adopted.

## Facts batch 5

- [Neon damselfish](https://fishesofaustralia.net.au/home/species/2341): Fishes of Australia supports the neon-damsel name, color, length, range and comparison with P. pavo. This common-name match does not certify the sprite.
- [Peach fairy basslet](https://fishesofaustralia.net.au/home/species/4390): Fishes of Australia supports male/female fin and color differences, length and the change from Pseudanthias to Nemanthias. The game feeding rule is separate.
- [Whitespot hawkfish](https://churaumi.okinawa/en/fishbook/1610175140/): Okinawa Churaumi Aquarium supports identity, size, markings, bottom habitat and small-fish/crustacean diet.
- [Checkerboard hawkfish](https://fishesofaustralia.net.au/home/species/2428): Exact identity remains unresolved. Fishes of Australia provides Oxycirrhites typus as a clearly named example: patterned body, long snout, perching habitat and crustacean diet. It is not presented as the sprite identification.
- [Royal gramma](https://www.aquarium-larochelle.com/en/species-encyclopedia/royal-gramma/): Aquarium La Rochelle supports identity, size, Atlantic distribution, ledge orientation, crustacean diet, occasional cleaning and nest care. Geography is explicitly flagged as inconsistent with a strictly Australian roster. Reproductive timing and sex-development claims were omitted.

## Facts batch 6

- [Anemonefish](https://australian.museum/learn/animals/fishes/why-dont-anemonefishes-get-stung/): Group-level protection and mucus explanations, with competing mechanisms retained as explanations rather than settled chemistry.
- [Oriental sweetlip](https://www.aquariumbiarritz.com/en/oriental-sweetlips/): Identity, juvenile markings, Indo-Pacific distribution, benthic invertebrate feeding and sound production. The reported maximum size was not needed for this entry.
- [Parrotfish](https://ocean.si.edu/ocean-life/fish/tough-teeth-and-parrotfish-poop): Group-level beak feeding, grazing and sand production. Does not generalize the source’s numerical sand output, tooth count or coral-feeding rate to every species.
- [Devil scorpionfish](https://australian.museum/learn/animals/fishes/false-stonefish-scorpaenopsis-diabolus/): Museum common-name match, body form, range, length and pectoral-fin display. The proposed startle function remains qualified.
- [Wobbegong](https://australian.museum/learn/animals/fishes/spotted-wobbegong-orectolobus-maculatus-bonnaterre-1788/): Spotted wobbegong is a named example for an unresolved generic catalog label. Markings, resting habitat, nighttime feeding and Australian range are supported; conflicting overseas records from other pages were excluded.
- [Electric ray](https://www.montereybayaquarium.org/animals-the-ocean/animals-a-to-z/pacific-electric-ray): Pacific electric ray is an explicitly non-Australian example. Supports anatomy, electrical predation, nocturnal searching and disc wrapping. Voltage, human effects and ancient medical claims were excluded; aquarium web and teaching-card voltage figures disagree.
- [Flashlight fish](https://www.aquariumofpacific.org/onlinelearningcenter/species/splitfin_flashlight_fish): Splitfin flashlight fish is a named example. Uses the source’s species-specific Pacific range, rather than its broader introductory range. Supports bacterial light organs, rotation, diet and nocturnal schooling. Inconsistent conservation labels and tentative reproduction were excluded.
