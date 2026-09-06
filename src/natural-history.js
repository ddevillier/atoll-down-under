// Independently written summaries of cited museum, government, aquarium and university sources.
// Real-world measurements are separate from sprite size and game balance.
export const NATURAL_HISTORY={
 s19:{scientific:'Sepiidae (cuttlefishes; family)',family:'Cephalopod molluscs · species not identified',
  paragraphs:[
   'Cuttlefishes are molluscs with remarkable camouflage. One Australian example, the giant cuttlefish, can change its color and raise parts of its skin to resemble the texture of sand, rocks or seaweed.',
   'Giant cuttlefish eat fishes, crabs and other crustaceans. Their changing patterns also help them communicate, especially when breeding. They are mainly active by day: the behavior of a real species can differ from a game’s general label.'
  ],question:'Compare changes in color with changes in texture. Would matching only one of those always hide an animal?',
  limit:'The game does not identify its cuttlefish as a giant cuttlefish. That species is a named example here, not an identification of the sprite. The game uses night-only activity and a simplified ink defense.',
  source:'Australian Museum · Giant Cuttlefish (named example)',url:'https://australian.museum/learn/animals/fishes/giant-cuttlefish-sepia-apama-gray-1849/'},
 s20:{scientific:'Pterois (lionfishes; genus)',family:'Scorpaenidae · exact species not identified',
  paragraphs:[
   'Broad, fan-like pectoral fins and separate spines along the back make a lionfish easy to notice. The red lionfish and devil firefish have contrasting pale and brown or maroon bands across the head and body.',
   'Lionfish spines can deliver venom through a wound. Their native home is the Indo-Pacific. A familiar-looking fish can belong to more than one species, so a striped body alone is not enough to tell closely related lionfishes apart.'
  ],question:'Compare the fan-shaped fins with the thin spines. Which structures spread into a broad surface, and which end in a sharp point?',
  limit:'The illustration is not identified to species. The game treats this fish as harmful food and makes its defensive display a timed ability; those are not a biological description of venom delivery.',
  source:'NOAA Ocean Service · What is a lionfish?',url:'https://oceanservice.noaa.gov/facts/lionfish-facts.html'},
 s44:{scientific:'Hippocampus kuda',family:'Syngnathidae · seahorses and pipefishes',
  paragraphs:[
   'A seahorse is a fish with a very unusual outline: an upright body, a long snout and a gripping tail. This species can be pale yellow or dark, so color by itself is not a reliable identification. It uses shallow coastal habitats such as seagrass beds, bays and estuaries.',
   'Its tail holds onto a support while its snout draws in tiny moving prey, including small crustaceans. The female transfers eggs into the male’s brood pouch. He carries the developing young and releases them when they are ready to live independently.'
  ],question:'Compare a seahorse’s gripping tail with a shark’s swimming tail. How does each shape help its owner?',
  limit:'This entry describes the yellow or common seahorse associated with the catalog name; the stylized sprite still needs identification review. Brood care and suction feeding are not animated.',
  source:'Micheleen Hashikawa · University of Michigan Animal Diversity Web',url:'https://animaldiversity.org/accounts/Hippocampus_kuda/'},
 s45:{scientific:'Stenopus hispidus',family:'Stenopodidae · banded coral shrimps',length:'Body length up to about 5 cm',
  paragraphs:[
   'Red-and-white bands, prominent claws and long white antennae distinguish this shrimp. It shelters beneath reef ledges and in crevices. Pairs are often seen together, with the male smaller than the female.',
   'A cleaner shrimp finds food on larger fishes by removing external parasites and other material. Its long antennae help attract visiting fish. Females carry eggs beneath the abdomen; after hatching, the larvae drift in open water before settling near a reef.'
  ],question:'Watch a fish waiting beside the shrimp. What is food for one animal and an unwanted passenger for the other?',
  limit:'The game provides one nighttime cleaner per habitat. Pairing, eggs and drifting larvae are not simulated, and cleaning only repairs the parasite part of the health meter.',
  source:'Oregon Coast Aquarium · Banded Coral Shrimp',url:'https://aquarium.org/animals/banded-coral-shrimp/'},
 s46:{scientific:'Brachyura (true crabs; group)',family:'Crustaceans · species not identified',
  paragraphs:[
   'A crab wears its supporting skeleton on the outside. Jointed legs allow it to move despite this hard covering. Crabs belong to the crustaceans, a group that also includes shrimps, lobsters and tiny plankton animals.',
   'Look for paired antennae and compare the crab’s jointed limbs with a snail’s soft body. A hard outer covering and a shell may look similar, but they belong to animals with very different body plans.'
  ],question:'Count the visible joints as a crab walks. Where does its body bend, and where does it stay stiff?',
  limit:'Reef crab is a broad game label, not a verified species name. Its scavenging diet, size and shell-breaking rules describe the game creature; they do not describe every crab.',
  source:'Australian Museum · Crustaceans',url:'https://australian.museum/learn/animals/crustaceans/'},
 s47:{scientific:'Asteroidea (sea stars; group)',family:'Echinoderms · species not identified',
  paragraphs:[
   'Sea stars are animals, but they are not fish. They have no fins or scales and live in salt water. Their relatives include sea urchins and sea cucumbers.',
   'Small tube feet on the underside help a sea star move and hold food. Not every species has five arms: some have many more. Sea stars can regrow lost arms, although a game-sized moment is far too short to show that process.'
  ],question:'Compare a sea star with an urchin. What similarities might be hidden underneath their very different outlines?',
  limit:'Red sea star does not identify one species. This entry describes the group; the game’s stationary pose and detritus diet are simplified choices, not universal sea-star behavior.',
  source:'NOAA Ocean Service · Are starfish really fish?',url:'https://oceanservice.noaa.gov/facts/starfish.html'},
 s60:{scientific:'Nudibranchia (nudibranchs; group)',family:'Gastropod molluscs · species not identified',
  paragraphs:[
   'Nudibranchs are sea slugs whose adult bodies have no protective shell. Many carry an exposed ring of gills on the back. Their name means naked gills, but the shapes and positions of these structures vary.',
   'They eat other animals, often specializing in a particular prey. Some eat sponges; others use different foods. Defenses vary too: some make unpleasant chemicals, some conceal themselves, and some can store stinging cells taken from their prey.'
  ],question:'A sponge looks still, but it is an animal. Does eating a sponge make a nudibranch a plant-eater or an animal-eater?',
  limit:'The catalog has a representative nudibranch, not a verified species. Its sponge-only menu and poisonous-food flag model one combination of traits rather than every nudibranch.',
  source:'Western Australia DBCA · Nudibranches (sea slugs)',url:'https://www.dbca.wa.gov.au/wildlife-and-ecosystems/marine/marine-parks/fun-facts/nudibranches-sea-slugs'},
 s61:{scientific:'Gastropoda (snails and slugs; group)',family:'Molluscs · species not identified',
  paragraphs:[
   'A snail is soft-bodied underneath its shell. Snails and slugs belong to the gastropods, one of the major groups of molluscs. Molluscs also include very different-looking animals such as clams, octopuses and cuttlefish.',
   'A layer of tissue called the mantle can produce the shell. A muscular foot helps many molluscs move, and many have a tooth-bearing feeding structure called a radula. Shells, feet and feeding structures offer clues to how these animals live.'
  ],question:'Compare the shell-carrying snail with the nudibranch. What does the shell reveal, and what parts of the animal does it hide?',
  limit:'Spiral snail is an invented descriptive label, not an identified species. Algae grazing is this creature’s game diet; the entry does not assign that diet to every marine snail.',
  source:'Australian Museum · Molluscs',url:'https://australian.museum/learn/animals/molluscs/'},
 s62:{scientific:'Echinoidea (sea urchins; group)',family:'Echinoderms · species not identified',
  paragraphs:[
   'Sea urchins come in many forms: some have long, fine spines, while others have thick spines like pencils. Different species live in rock pools, on reefs and among kelp. Long spines alone do not identify a species.',
   'Grazing urchins can change the vegetation around them. On some Australian rocky reefs, their feeding helps maintain patches with little kelp. These patches still support other life; a place without tall plants is not necessarily empty.'
  ],question:'Compare a grazed patch with a patch of tall vegetation. Which animals might find shelter or food in each?',
  limit:'Needle-spined urchin is a visual game label. These examples describe sea-urchin diversity, not an identification of the sprite. Its night-only appearance and fixed position are game rules.',
  source:'Emily McLaren · Australian Museum: The sea urchins of Sydney',url:'https://australian.museum/blog/amri-news/the-sea-urchins-of-sydney/'},
 s63:{scientific:'Actiniaria (sea anemones; group)',family:'Cnidarians · species not identified',
  paragraphs:[
   'Sea anemones are animals related to corals and jellyfish. Their soft bodies and tentacles may resemble flowers, but they belong to a very different branch of life.',
   'Some anemones share their tissues with microscopic algae. Others provide homes for animal partners, including anemonefish. Anemones can even live on a hermit crab’s shell or on a boxing crab’s claws. These relationships differ between species.'
  ],question:'Look at the anemone and the nearby fish. What would you need to observe to show that both animals benefit from living together?',
  limit:'The catalog does not identify an anemone species. Its fixed location and harmful-food rule simplify the animal; partnerships with fish and crabs are not simulated.',
  source:'Australian Museum · Jellyfish, anemones and corals',url:'https://australian.museum/learn/animals/jellyfish/'},
 s32:{scientific:'Carcharhinus melanopterus',family:'Carcharhinidae · requiem sharks',length:'Recorded up to 1.8 m',
  paragraphs:[
   'Dark fin tips edged with pale markings help identify the blacktip reef shark. It favors shallow, clear water around reefs, sand flats and lagoons in the tropical Indo-Pacific.',
   'Individuals often stay close to familiar reef areas. Their meals include fishes, crustaceans and molluscs such as squid. Females give birth to live pups, usually in small litters. A reef shark’s life includes finding food, using familiar habitat and reproducing, not simply chasing everything it sees.'
  ],question:'Compare the fin tips with those of a whitetip reef shark. What other differences can you spot in the head and body?',
  limit:'This shark accepts only fish in the game. Its chase speed and digestion timer are balance settings, and reproduction is not simulated.',
  source:'Florida Museum · Blacktip Reef Shark',url:'https://www.floridamuseum.ufl.edu/discover-fish/species-profiles/blacktip-reef-shark/'},
 s33:{scientific:'Triaenodon obesus',family:'Carcharhinidae · requiem sharks',
  paragraphs:[
   'Pale tips on the first dorsal fin and upper tail stand out against a gray-brown body. This slender shark has a broad, flattened head and lives around coral reefs across much of the Indo-Pacific.',
   'Whitetip reef sharks often rest in caves during the day and become active at night. They can breathe while resting, so they do not have to swim continuously. Several may share a resting place, and individuals can return to the same reef shelters over long periods.'
  ],question:'Would a resting shark necessarily be sick? Compare its behavior with a shark swimming through open water.',
  limit:'The game selects this species for nighttime scenes but does not show its daytime cave-resting routine or simulate breathing.',
  source:'Florida Museum · Whitetip Reef Shark',url:'https://www.floridamuseum.ufl.edu/discover-fish/species-profiles/whitetip-reef-shark/'},
 s34:{scientific:'Carcharodon carcharias',family:'Lamnidae · mackerel sharks',length:'Up to about 6.4 m (21 feet)',
  paragraphs:[
   'The white underside gives this shark its name; its back is much darker. A powerful, streamlined body and crescent-shaped tail suit life in coastal and offshore waters. White sharks range through temperate and subtropical seas around the world.',
   'Their diet changes as they grow. Young sharks eat fishes, smaller sharks, rays and squid; larger individuals also eat marine mammals. They can keep parts of the body warmer than the surrounding water. Growth is slow, and reaching adulthood takes many years.'
  ],question:'Compare a young shark’s meals with an adult’s. Why might a food web need to describe age as well as species?',
  limit:'The game uses one body size and a fish-only menu. Age, warm muscles, ocean migrations and marine mammals are not simulated.',
  source:'NOAA Fisheries · White Shark',url:'https://www.fisheries.noaa.gov/species/white-shark'},
 s35:{scientific:'Galeocerdo cuvier',family:'Tiger sharks',length:'Recorded up to about 5.5 m',
  paragraphs:[
   'Young tiger sharks have strong dark bars and spots along their sides. These markings become less distinct with age. Their pale underside contrasts with a gray back.',
   'Tiger sharks eat a very wide variety of animals. Although they often move slowly, they can accelerate in short bursts to catch prey. Being a large predator does not mean swimming at top speed all the time.'
  ],question:'Compare a steady cruise with a short burst of speed. Which movement would you expect to use more energy each second?',
  limit:'The game’s short food list represents only part of this shark’s diet. Its night-only appearance and crushing ability are scenario rules; markings do not change with age.',
  source:'Florida Museum · Tiger Shark',url:'https://www.floridamuseum.ufl.edu/discover-fish/species-profiles/tiger-shark/'},
 s4:{scientific:'Zanclus cornutus',family:'Zanclidae · Moorish idols',length:'Up to 24 cm standard length (without the tail fin)',
  paragraphs:[
   'Look for the tall, thin body, bold dark bands and long streamer extending from the dorsal fin. The Moorish idol belongs to a family with just one living species and is related to surgeonfishes.',
   'Around Lizard Island it uses reef fronts, flats and sheltered lagoons. Young fish hold small territories; larger fish often travel in groups of two to five. They eat algae and small invertebrates. Before settling on a reef, the young spend an unusually long larval stage in open water.'
  ],question:'Compare a small group with a large school. How does the space between fish change the way the group looks?',
  limit:'The game does not simulate larval dispersal or juvenile territories. Its sponge-and-algae menu represents selected feeding choices.',
  source:'Australian Museum · Lizard Island Field Guide: Moorish Idol',url:'https://lifg.australian.museum/Group.html?groupId=5W64cXWZ&hierarchyId=qBHH2Q3E'},
 s8:{scientific:'Siganus vulpinus',family:'Siganidae · rabbitfishes',length:'Up to 30 cm',
  paragraphs:[
   'The foxface has a pointed snout, a dark band through the eye and a yellow rear body. Its snout helps explain the family name rabbitfish. It lives in the western Pacific, including tropical northern Australia.',
   'Young foxfaces gather in schools and shelter among coral. Fish form pairs by about ten centimetres long. Spines on the back, belly and anal fin have grooves connected to venom glands: the colorful fish has a defense that is easy to overlook.'
  ],question:'Find the fins that carry spines. How is a pointed spine different from a soft fin ray?',
  limit:'Raise spines is a timed game ability. Real venomous spines do not switch off when an ability timer runs out; pair formation is not simulated.',
  source:'Australian Museum · Foxface',url:'https://australian.museum/learn/animals/fishes/foxface-siganus-vulpinus/'},
 s23:{scientific:'Lactoria cornuta',family:'Ostraciidae · boxfishes',
  paragraphs:[
   'Long spines project in front of the eyes, with another pair extending from the lower rear of the armored body. Individuals can be greenish, yellow or orange with blue spots. Shape is a useful clue even when colors differ.',
   'Longhorn cowfish search sandy and weedy places near reefs. They blow water at the sand to uncover small bottom-living animals to eat. Australian records extend around the north from Western Australia to New South Wales, and include Lord Howe Island.'
  ],question:'Imagine a meal buried under sand. How could a jet of water help a fish find it?',
  limit:'Sand-blowing is not animated in this game. The chemical-defense button and predator immunity are game rules, not measurements of natural protection.',
  source:'Dianne J. Bray · Fishes of Australia: Longhorn Cowfish',url:'https://fishesofaustralia.net.au/home/species/837'},
 s30:{scientific:'Dascyllus aruanus',family:'Pomacentridae · damselfishes',length:'Up to 10 cm total length',
  paragraphs:[
   'Three dark bars contrast with this small fish’s pale body and white tail. Banded humbugs gather around branching coral in shallow lagoons and reef flats, slipping between branches for protection.',
   'They collect tiny animal plankton from the water. Their coral home provides shelter, and the fish also remove unwanted algae from it. Males guard eggs attached to the bottom until the larvae hatch.'
  ],question:'Watch the space above a coral head and the gaps between its branches. Which offers feeding room, and which offers shelter?',
  limit:'This entry describes the banded humbug represented by the catalog name. The game does not simulate egg guarding or a defended coral home.',
  source:'Dianne J. Bray · Fishes of Australia: Banded Humbug',url:'https://fishesofaustralia.net.au/home/species/347'},
 s48:{scientific:'Oxymonacanthus longirostris',family:'Monacanthidae · filefishes',length:'Up to 12 cm total length',
  paragraphs:[
   'Also called the harlequin filefish, this slender fish has a pointed snout and rows of spots on a greenish body. It lives in coral-rich lagoons and outer reefs of the Indo-West Pacific, including Australian reefs.',
   'Its food is coral polyps, usually from branching Acropora corals. It shelters among coral branches at night and can acquire a coral-like smell that helps conceal it from predators. This close connection makes the fish vulnerable when its feeding habitat disappears.'
  ],question:'A hiding animal may need to avoid being smelled as well as seen. What can an illustration tell you about each kind of concealment?',
  limit:'The game also accepts algae for this fish; that is a simplified menu, not its documented natural diet. Scent concealment and coral loss are not simulated.',
  source:'Dianne J. Bray · Fishes of Australia: Harlequin Filefish',url:'https://fishesofaustralia.net.au/home/species/812'},
 s6:{scientific:'Forcipiger longirostris',family:'Chaetodontidae · butterflyfishes',length:'Up to 22 cm',
  paragraphs:[
   'A very long snout and a body flattened from side to side distinguish this coral-reef fish. It lives across the Indo-West and Central Pacific; Australian records include northwestern waters and the northern Great Barrier Reef.',
   'It resembles the related forcepsfish, Forcipiger flavissimus. Scientists distinguish them using several features together: snout length, mouth opening, dorsal-fin spines and small spots on the breast. A familiar color pattern alone may not identify a species.'
  ],question:'Compare the long snout with the broad mouth of a grouper. What could you learn from shape, and what would you still need to observe?',
  limit:'The game illustration is stylized. Its worm-and-coral menu is a simplified rule, not a complete account of this species’ natural diet.',
  source:'Australian Museum · Longnose Butterflyfish',url:'https://australian.museum/learn/animals/fishes/longnose-butterflyfish-forcipiger-longirostris-broussonet-1782/'},
 s13:{scientific:'Pterapogon kauderni',family:'Apogonidae · cardinalfishes',length:'Up to about 8.6 cm (3.4 inches)',
  paragraphs:[
   'This small fish is native to Indonesia’s Banggai Archipelago, where it occupies shallow, sheltered reef and seagrass habitats. Populations elsewhere can result from introductions; the collection of animals in this game is not a map of their natural ranges.',
   'Its food includes copepods, tiny crustaceans in the plankton. Males shelter eggs in their mouths and release developed young. The pale spots on each fish form an individual pattern, so careful observation can help researchers recognize individuals.'
  ],question:'A small mouth can collect tiny prey and also shelter young. How might caring for eggs change a parent’s activities?',
  limit:'Egg care and individual spot patterns are not simulated. The game’s night-only appearance is a scenario rule, not a claim that all cardinalfishes share one activity pattern.',
  source:'NOAA Fisheries · Banggai Cardinalfish',url:'https://www.fisheries.noaa.gov/species/banggai-cardinalfish'},
 s24:{scientific:'Balistoides conspicillum',family:'Balistidae · triggerfishes',length:'Up to 50 cm',
  paragraphs:[
   'Large pale spots across the lower body and yellow around the mouth help identify the clown triggerfish. It occurs on Indo-West Pacific coral reefs. Australian records extend from offshore reefs in the northwest to the Great Barrier Reef and northern New South Wales.',
   'Identification starts with looking closely: where are the spots, which part of the body is dark, and what shape are the fins? Combining these observations is more useful than remembering only that a fish is colorful.'
  ],question:'Compare this fish’s markings with the spotted pufferfish. Which features would help you tell them apart?',
  limit:'The reported length describes a real fish, not its on-screen dimensions. Crushing ability and food acceptance use game rules.',
  source:'Australian Museum · Clown Triggerfish',url:'https://australian.museum/learn/animals/fishes/clown-triggerfish-balistoides-conspicillum-bloch-schneider-1801/'},
 s43:{scientific:'Labroides dimidiatus',family:'Labridae · wrasses',
  paragraphs:[
   'A small cleaner wrasse can approach a much larger fish without becoming its meal. It obtains food by removing parasites from clients. The interaction connects two different needs: the cleaner feeds, while the client loses parasites.',
   'Researchers at Lizard Island study these relationships through observations and experiments. Work on damselfish has linked external parasites with poorer performance in a visual learning task, showing that a cleaning relationship can matter beyond the moment of feeding.'
  ],question:'Watch a client stop at the cleaning station. What does each partner do? Compare this encounter with an ordinary feeding trip.',
  limit:'Cleaning restores only the parasite-related part of health. Recovery from poison and injuries follows separate game rules. Real cleaners are not a general treatment for either. The learning experiment is not simulated.',
  source:'Australian Museum · Learning from the cleaners and their clients',url:'https://australian.museum/blog/amri-news/news-from-lirs-learning-from-the-cleaners-and-their-clients/'}
};
