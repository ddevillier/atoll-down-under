// Independently written summaries of cited museum, government, aquarium and university sources.
// Real-world measurements are separate from sprite size and game balance.
export const NATURAL_HISTORY={
 s2:{scientific:'Gobiodon (coral gobies; genus)',family:'Gobiidae · gobies',
  paragraphs:[
   'Coral gobies are small fishes closely associated with living corals. One named example is the yellow coralgoby, Gobiodon okinawae, which often occupies the outer edges of table-like Acropora colonies on sheltered reefs.',
   'That species eats both plankton and tissue from its coral host. Its young look different from the bright-yellow adults: they are whitish, with a dark internal stripe and spots on the head and tail. A coral can be both a home and a source of food.'
  ],question:'Look along a coral colony’s outer edge as well as between its branches. Where might a small resident be easiest to see?',
  limit:'Orange coral goby has not been matched to an exact species. The yellow coralgoby is an example, not an identification of this sprite; host-specific feeding is not simulated.',
  source:'Dianne J. Bray · Fishes of Australia: Yellow Coralgoby (named example)',url:'https://fishesofaustralia.net.au/home/species/2231'},
 s12:{scientific:'Holocentridae (squirrelfishes and soldierfishes; family)',family:'Squirrelfishes · species not identified',
  paragraphs:[
   'Squirrelfish is a name shared by several fishes. The Atlantic species Holocentrus adscensionis is a red, large-eyed example. It hides in reef crevices and beneath ledges during the day, then searches over sand and seagrass at night.',
   'Its food includes crab and shrimp larvae, other small crustaceans and occasional young fishes. It can make sounds with its swim bladder to communicate with other members of its species. Nighttime activity involves more than what a brightly lit view can reveal.'
  ],question:'Compare a sheltered daytime resting place with an open nighttime feeding area. What changes besides the light?',
  limit:'The Atlantic species is a named example for an unresolved catalog identity. The game’s nighttime visibility and sound effects do not recreate its natural sensory environment.',
  source:'Florida Museum · Squirrelfish (named example)',url:'https://www.floridamuseum.ufl.edu/discover-fish/species-profiles/squirrelfish/'},
 s16:{scientific:'Epinephelus corallicola',family:'Groupers and rockcods',
  paragraphs:[
   'The coral grouper described in the FAO identification guide is brownish to greenish-grey, with scattered small dark spots on its head, body and fins. It has a rounded tail and darker blotches near the base of the dorsal fin.',
   'Young fish have conspicuous pale spots that fade as they grow. This western Pacific species inhabits shallow silty reefs and estuarine areas, including Australian waters. Coral reef fish do not all live in perfectly clear water.'
  ],question:'Compare a spotted juvenile with a larger fish whose pale spots have faded. Which other features would help connect them?',
  limit:'This follows the FAO coral-grouper name, which still needs comparison with the original roster and sprite. The source does not establish the game’s diet, pursuit speed or prey-size thresholds.',
  source:'FAO · Groupers of the World, coral grouper, printed page 133',url:'https://www.fao.org/4/t0540e/t0540e21.pdf'},
 s22:{scientific:'Tetraodontidae (pufferfishes; family)',family:'Pufferfishes · species not identified',
  paragraphs:[
   'Several pufferfishes have spots, so spotted pufferfish alone is not a precise identification. One example is the stars-and-stripes puffer, Arothron hispidus, with white spots above, pale lines below, and rings around the gill opening and pectoral-fin base.',
   'That Indo-Pacific species uses habitats from estuaries to coral reefs. Its varied food includes algae, sponges, corals, molluscs and other invertebrates. Joined teeth form two plates in each jaw, making a beak-like mouth.'
  ],question:'Compare the marks above and below a pufferfish’s middle. Could stripes, rings and spots together identify it better than spots alone?',
  limit:'The stars-and-stripes puffer is a named example, not a verified sprite identity. The game’s puff ability and restricted menu are separate simulation rules.',
  source:'Australian Museum · Stars-and-stripes Puffer (named example)',url:'https://australian.museum/learn/animals/fishes/stars-and-stripes-toadfish-arothron-hispidus-linnaeus-1758/'},
 s27:{scientific:'Dasyatidae (stingrays; family)',family:'Blue-spotted stingrays · species not identified',
  paragraphs:[
   'Blue spots occur on more than one kind of stingray. The bluespotted ribbontail ray, Taeniura lymma, is one example with a rounded oval disc, bright spots on its upper surface and blue stripes beside its tail.',
   'It feeds in sandy areas beside reefs, including at high tide. Meals include molluscs, worms, shrimps, crabs and small fishes. Small teeth arranged in plates help crush prey; the mouth and gill openings are on the underside of the body.'
  ],question:'Compare the disc outline and tail as well as the spots. What would help distinguish two similarly colored rays?',
  limit:'The ribbontail ray is a named example; this catalog label does not resolve the sprite’s species. Tides, crushing teeth and species-specific tail defenses are not fully simulated.',
  source:'Florida Museum · Bluespotted Ribbontail Ray (named example)',url:'https://www.floridamuseum.ufl.edu/discover-fish/species-profiles/bluespotted-ribbontail-ray/'},
 s0:{scientific:'Spratelloides gracilis',family:'Sprats and round herrings',
  paragraphs:[
   'Silver sprats have slender bodies with dark-blue backs and pale undersides. A bright silver band runs along each side from the gill cover to the base of the tail. Their scales are thin and comparatively large.',
   'These small Indo-Pacific fishes gather in large schools, including inshore waters within atolls. In the Maldives their local abundance changes with the monsoon season. A busy school in one place does not mean the whole reef has the same population.'
  ],question:'Compare a school with scattered fish. Where are the largest gaps in the water, and how do they change as the school turns?',
  limit:'This entry follows the FAO guide’s silver-sprat name. School size, seasonal movements and feeding rates are not reconstructed from the original game or measured in this simulation.',
  source:'FAO · Fishes of the Maldives, Silver sprat, printed page 33',url:'https://www.fao.org/4/ad471e/ad471e12.pdf'},
 s9:{scientific:'Mullidae (goatfishes; family)',family:'Goatfishes · species not identified',
  paragraphs:[
   'Goatfishes have two sensory barbels beneath the lower jaw. These whisker-like structures help them search sand and reef crevices by touch and taste. When not being used, the barbels can be tucked away.',
   'Their meals include bottom-living worms, crustaceans and small molluscs; some species also eat fish. A goatfish can take sand into its mouth while searching and expel it through the gill openings. Different species feed by day, at night, or during both periods.'
  ],question:'Watch where a goatfish points its head. How might searching with barbels differ from spotting a meal in open water?',
  limit:'Yellow goatfish is used for more than one species. This entry gives family-level facts rather than assigning the sprite an unverified scientific name; digging and barbel sensing are not simulated.',
  source:'Waikīkī Aquarium · Goatfishes',url:'https://www.waikikiaquarium.org/experience/animal-guide/fishes/goatfishes/goatfishes/'},
 s41:{scientific:'Aulostomus chinensis',family:'Aulostomidae · trumpetfishes',length:'Up to 90 cm total length',
  paragraphs:[
   'A trumpetfish has a long, narrow body and a tube-shaped snout. It can change color and sometimes waits head-down among corals. Its outline can be difficult to pick out against long branches.',
   'It also approaches prey beside a larger fish, using that neighbor as cover. Small fishes and crustaceans are sucked through the snout when the mouth region expands rapidly. Catching a meal can depend on a concealed approach rather than a long chase.'
  ],question:'Compare a trumpetfish alone with one beside a larger fish. When would its outline be easier to notice?',
  limit:'The entry follows the Australian trumpetfish name. The game does not reproduce head-down waiting, shadowing larger fish or suction-feeding anatomy.',
  source:'Dianne J. Bray and Vanessa J. Thompson · Fishes of Australia: Trumpetfish',url:'https://fishesofaustralia.net.au/home/species/1875'},
 s42:{scientific:'Caesio cuning',family:'Fusiliers and snappers',
  paragraphs:[
   'The yellowtail fusilier has a grey-blue body with yellow on its tail and the soft rear part of its dorsal fin. Its pale lower body may have a pinkish-red tint, which explains the alternative name red-bellied fusilier.',
   'Large schools occur around offshore reef slopes in the tropical Indo-West Pacific, including northern Australia. These fishes feed on animal plankton in midwater. Looking above a reef can reveal feeding activity that is easy to miss when searching only the bottom.'
  ],question:'Compare fish feeding above a reef with fish feeding against its surface. What different kinds of food might they be finding?',
  limit:'The common-name match follows the Australian Museum. School numbers and available plankton patches are game settings, not estimates of wild abundance.',
  source:'Australian Museum · Yellowtail Fusilier',url:'https://australian.museum/learn/animals/fishes/yellowtail-fusilier-caesio-cuning-bloch-1791/'},
 s55:{scientific:'Pseudocaranx georgianus',family:'Carangidae · jacks and trevallies',
  paragraphs:[
   'Silver trevally are greenish-blue above and silver below, with a dark patch high on the gill cover. Younger fish often show yellow stripes. Their deep bodies narrow sharply toward the tail.',
   'This species forms schools over reefs and nearby sand in southern Australia and New Zealand. Young fish use shallow coastal habitats, while adults often occupy deeper water near headlands. Some larger fish move offshore as they grow.'
  ],question:'Compare young fish near shore with larger fish farther out. What would you need to observe to tell whether they belong to the same species?',
  limit:'The museum distinguishes this species from Pseudocaranx dentex, a name used in older accounts. Its temperate range and life-stage movements are not represented by the game’s tropical reef layout.',
  source:'Dianne J. Bray · Fishes of Australia: Silver Trevally',url:'https://fishesofaustralia.net.au/home/species/4279'},
 s58:{scientific:'Pseudanthias tuka',family:'Anthias and fairy basslets',length:'Up to 12 cm',
  paragraphs:[
   'Purple anthias, also called purple queens, are deep pink to purple. Females have a yellow stripe along the back extending onto the tail. Males have longer soft dorsal-fin rays and a purple patch at the base of that fin.',
   'They gather along the upper edges of drop-offs and steep outer reef slopes. Their tropical range includes the Great Barrier Reef. A group of differently marked fish may contain males and females of the same species.'
  ],question:'Compare the backs and fins of fish in a group. Which differences could help you recognize male and female forms?',
  limit:'This follows the Australian Museum’s purple-anthias name. The game uses one sprite and a simplified feeding role; it does not distinguish sexes or recreate measured group sizes.',
  source:'Australian Museum · Purple Queen',url:'https://australian.museum/learn/animals/fishes/purple-queen-pseudanthias-tuka/'},
 s59:{scientific:'Thysanophrys chiltonae',family:'Platycephalidae · flatheads',length:'Up to about 25 cm total length',
  paragraphs:[
   'Longsnout flatheads have elongated snouts and low, broad heads. Their tan bodies carry pale spots and darker bands across the back. A dark bar below the eye and alternating pale and dark lip markings provide further identification clues.',
   'They inhabit sandy areas around coral reefs, including lagoons and bays, and often lie partly buried. Their range extends through the tropical Indo-Pacific and includes northern Australian reefs. Finding one may require looking for a small exposed part of its outline.'
  ],question:'Imagine most of a fish covered by sand. Which remaining features could reveal its position?',
  limit:'The species match follows the Australian National Fish Collection and Fishes of Australia. The game’s camouflage timer does not model actual burial or verify the sprite’s anatomy.',
  source:'Australian National Fish Collection, CSIRO and Dianne J. Bray · Fishes of Australia: Longsnout Flathead',url:'https://fishesofaustralia.net.au/home/species/3369'},
 s7:{scientific:'Amphiprion (anemonefishes; genus)',family:'Pomacentridae · damselfishes',
  paragraphs:[
   'Anemonefishes can nestle among the stinging tentacles of their host anemones. The anemone still has working stinging capsules, and the fish does not have unusually thick skin. Protection is associated with the mucus coating its body.',
   'How that coating protects a fish is an interesting research question. The Australian Museum describes evidence for acquiring mucus from the host and for fish mucus lacking substances that trigger stings. Different host relationships may involve different explanations.'
  ],question:'Compare a fish resting among tentacles with one swimming outside them. What observations would help explain the partnership?',
  limit:'The catalog label covers a group, not a verified species. The game’s shelter rule does not reproduce host selection, acclimatisation or mucus chemistry.',
  source:'Australian Museum · Why don’t anemonefishes get stung?',url:'https://australian.museum/learn/animals/fishes/why-dont-anemonefishes-get-stung/'},
 s14:{scientific:'Plectorhinchus vittatus',family:'Haemulidae · grunts and sweetlips',
  paragraphs:[
   'Oriental sweetlips occur in the tropical Indo-Pacific. Young fish have a brown background with pale, creamy-yellow spots. A juvenile’s markings can be an important clue when comparing it with an adult.',
   'These fish eat invertebrates living on or near the seabed. They can also make sounds with their teeth, with the swim bladder helping amplify the sound. Watching a fish tells only part of its story: underwater animals can produce sounds too.'
  ],question:'Compare a young fish with an adult. Which features might change as it grows, and which would you check to identify it?',
  limit:'The game uses one illustration and does not simulate growth-related markings or species-specific tooth sounds. Its feeding menu remains a simplified rule.',
  source:'Aquarium de Biarritz · Oriental sweetlips',url:'https://www.aquariumbiarritz.com/en/oriental-sweetlips/'},
 s15:{scientific:'Scarinae (parrotfishes; group)',family:'Parrotfishes · species not identified',
  paragraphs:[
   'Many parrotfishes bite reef surfaces with teeth joined into a beak-like structure. Feeding can remove algae and other living material along with pieces of the hard coral skeleton. Parrotfish is a group name, so one feeding description does not identify every species.',
   'After food is digested, swallowed coral material can pass out as sand. A fish’s meals can therefore help change the reef around it. Grazing also removes algae that compete with corals for space.'
  ],question:'Look at a grazing fish’s mouth and the surface beneath it. What traces might a meal leave behind?',
  limit:'No exact parrotfish species has been verified for this sprite. The game does not grind reef surfaces into sand or model changes in algae and coral cover.',
  source:'Smithsonian Ocean · Tough Teeth and Parrotfish Poop',url:'https://ocean.si.edu/ocean-life/fish/tough-teeth-and-parrotfish-poop'},
 s21:{scientific:'Scorpaenopsis diabolus',family:'Scorpaenidae · scorpionfishes',length:'Up to 30 cm',
  paragraphs:[
   'Also called the false stonefish, this fish has a humped back, large head and pointed snout. Its colors vary considerably. It occurs in tropical and subtropical Indo-Pacific waters, including Australia.',
   'The inner surfaces of its pectoral fins are yellowish with a large dark spot. When threatened, the fish spreads these fins to reveal the bright pattern. This display is thought to startle an approaching predator.'
  ],question:'How could a fish be difficult to notice while resting, yet suddenly reveal a conspicuous pattern?',
  limit:'This follows the Australian Museum’s devil-scorpionfish name; it does not certify the sprite. The game’s universal poison protection is an authored simplification, not a biological guarantee.',
  source:'Australian Museum · False Stonefish',url:'https://australian.museum/learn/animals/fishes/false-stonefish-scorpaenopsis-diabolus/'},
 s36:{scientific:'Orectolobidae (wobbegongs; family)',family:'Carpet sharks · species not identified',
  paragraphs:[
   'Wobbegong names several species of carpet shark. One Australian example is the spotted wobbegong, Orectolobus maculatus. It has skin flaps around the snout and pale rings over a yellowish to greenish-brown body with dark saddle markings.',
   'Spotted wobbegongs often rest on sand or rocky reef bottoms in shallow coastal water. They feed mainly at night, taking fishes, crayfish, crabs and octopuses. A resting shark and a swimming shark need not be different kinds of animal.'
  ],question:'Search for a shark’s outline on the seabed. Which markings make the outline harder to follow?',
  limit:'The spotted wobbegong is a named example, not a confirmed identification of this sprite. Its documented range is largely southern Australia; the catalog’s generic wobbegong needs a separate identity review.',
  source:'Australian Museum · Spotted Wobbegong (named example)',url:'https://australian.museum/learn/animals/fishes/spotted-wobbegong-orectolobus-maculatus-bonnaterre-1788/'},
 s37:{scientific:'Torpediniformes (electric rays; group)',family:'Electric rays · species not identified',
  paragraphs:[
   'Electric rays can use electrical discharges to stun prey and discourage predators. One example is the Pacific electric ray, Tetronarce californica, which has a rounded body, small eyes and a short, thick tail.',
   'That species lives along the Pacific coast of North America. At night it searches above sandy bottoms and nearby reefs for fishes. During capture it can curl its body disc around the prey, concentrating the electrical field and helping position the meal.'
  ],question:'Compare this broad-bodied hunter with a narrow-bodied fish. How might their body shapes support different ways of catching food?',
  limit:'The Pacific electric ray is an example, not an Australian species identification for the sprite. The game’s shock radius, duration and energy cost are balance settings; they are not measured electrical properties.',
  source:'Monterey Bay Aquarium · Pacific electric ray (named example)',url:'https://www.montereybayaquarium.org/animals-the-ocean/animals-a-to-z/pacific-electric-ray'},
 s53:{scientific:'Anomalopidae (flashlight fishes; family)',family:'Flashlight fishes · species not identified',
  paragraphs:[
   'Flashlight fishes carry light-producing bacteria in organs beneath their eyes. In the splitfin flashlight fish, Anomalops katoptron, those organs can rotate so their light is hidden or revealed. The fish controls a living light source rather than making sparks.',
   'Splitfin flashlight fish shelter in caves and dark overhangs by day and form schools at night. They eat animal plankton and use light to help find it. This species occurs in the Pacific, including the Great Barrier Reef.'
  ],question:'Imagine watching only the lights in a dark school. What could you learn from their spacing and changes in visibility?',
  limit:'Splitfin flashlight fish is a named example; the sprite’s exact species remains unresolved. The game simplifies its light into an ability and does not simulate bacterial partners or coordinated flashing.',
  source:'Aquarium of the Pacific · Splitfin Flashlight Fish (named example)',url:'https://www.aquariumofpacific.org/onlinelearningcenter/species/splitfin_flashlight_fish'},
 s3:{scientific:'Gramma loreto',family:'Royal grammas and their relatives',length:'About 8 cm',
  paragraphs:[
   'Royal grammas live around Caribbean and western Atlantic reefs, often close to caves and overhangs. They can swim belly-up beneath a ledge, orienting themselves to the nearby reef surface.',
   'Their food includes tiny crustaceans drifting in the water or living near the bottom. They sometimes pick parasites from other fishes. A male prepares a sheltered nest with algae and other material, then tends the eggs.'
  ],question:'Watch a fish beside a ledge. Is its belly always facing the seabed, or could it face the nearest shelter?',
  limit:'This is an Atlantic species in a mixed game catalog, not evidence that it belongs on an Australian reef. Upside-down swimming, nesting and occasional cleaning are not simulated.',
  source:'Aquarium La Rochelle · Royal Gramma',url:'https://www.aquarium-larochelle.com/en/species-encyclopedia/royal-gramma/'},
 s1:{scientific:'Pomacentrus coelestis',family:'Pomacentridae · damselfishes',length:'Up to 8 cm total length',
  paragraphs:[
   'Brilliant blue covers the neon damsel’s body, with yellow on the tail and sometimes the lower fins. It is a small reef fish found across a broad part of the Indo-Pacific, including northern Australian reefs.',
   'Other blue damselfishes can be confusingly similar. The related blue damsel, Pomacentrus pavo, has dark streaks on its scales and a dark mark high on the gill cover. Looking for several features is more reliable than identifying a fish simply as blue.'
  ],question:'Compare a fish’s tail color, gill cover and scale markings. Which details remain visible when it turns?',
  limit:'This entry follows the museum’s neon-damsel name. The game’s plankton-and-algae menu and burst ability are separate rules; the sprite has not been verified against all similar species.',
  source:'Dianne J. Bray · Fishes of Australia: Neon Damsel',url:'https://fishesofaustralia.net.au/home/species/2341'},
 s11:{scientific:'Nemanthias dispar',family:'Anthias and fairy basslets',length:'Up to 9.5 cm total length',
  paragraphs:[
   'Peach fairy basslets show different male and female appearances. Males have a bright red dorsal fin, purple-pink areas on the head and belly, and long pelvic fins. Females have shorter pelvic fins and a yellowish tail.',
   'Both have an orange line passing through the lower part of the eye toward the pectoral fin. This reef-associated fish was previously called Pseudanthias dispar, so older books may use a different scientific name for the same animal.'
  ],question:'Compare two fish with different fin lengths. What evidence would help you decide whether they are different species or different forms of one species?',
  limit:'The game uses one illustration and a simplified plankton-feeding role. It does not show male and female forms, and the renamed genus does not change gameplay.',
  source:'Dianne J. Bray · Fishes of Australia: Fairy Basslet',url:'https://fishesofaustralia.net.au/home/species/4390'},
 s31:{scientific:'Paracirrhites hemistictus',family:'Cirrhitidae · hawkfishes',length:'Up to 29 cm',
  paragraphs:[
   'Small dark spots cover the body of this hawkfish, with pale spots near its middle. It is one of the larger hawkfishes, despite the small size of its illustration here.',
   'It lives close to the bottom on shallow coral reefs. Small fishes and crustaceans make up its main food. Looking near the reef surface can reveal a hunter that might be missed when watching only the open water.'
  ],question:'Search near the bottom before looking higher in the water. Does changing where you look reveal different animals?',
  limit:'Real-world length is separate from game sprite size. Its camouflage ability and exact prey-size limits are simulation choices.',
  source:'Okinawa Churaumi Aquarium · Whitespot hawkfish',url:'https://churaumi.okinawa/en/fishbook/1610175140/'},
 s57:{scientific:'Cirrhitidae (hawkfishes; family)',family:'Hawkfishes · species not identified',
  paragraphs:[
   'Checkerboard hawkfish is a descriptive game name that does not yet identify a verified species. One real hawkfish with a crisscross pattern is the longnose hawkfish, Oxycirrhites typus, whose pointed snout is especially distinctive.',
   'That species perches among sea fans and black corals on steep reef slopes. It eats small crustaceans, including animals drifting in the plankton. A perch can place a fish beside moving water that carries food past it.'
  ],question:'Compare a long, pointed snout with a short one. Why would matching a color pattern alone be insufficient to identify a fish?',
  limit:'The longnose hawkfish is a named example, not an identification of this sprite. The game’s shrimp-and-fish menu and camouflage rule belong to the catalog creature.',
  source:'Dianne J. Bray · Fishes of Australia: Longnose Hawkfish (named example)',url:'https://fishesofaustralia.net.au/home/species/2428'},
 s50:{scientific:'Gnathodentex aureolineatus',family:'Lethrinidae · emperors',length:'Up to 30 cm total length',
  paragraphs:[
   'A bright yellow blotch below the rear dorsal fin stands out on this striped fish. Also called the goldspot seabream, it has rows of pale spots on the upper body and brownish-orange stripes below.',
   'It lives around coastal reefs, lagoons and outer slopes, sometimes gathering in large daytime schools. Feeding takes place at night, when it takes bottom-dwelling animals such as crabs and snails, with small fishes sometimes included.'
  ],question:'Would a fish seen in a daytime school necessarily be feeding? What behavior would provide better evidence?',
  limit:'The game currently puts this fish in daytime scenes. Its documented nighttime feeding is stated here separately; a future activity correction needs gameplay checks.',
  source:'Dianne J. Bray · Fishes of Australia: Goldspot Seabream',url:'https://fishesofaustralia.net.au/home/species/2222'},
 s56:{scientific:'Heniochus acuminatus',family:'Chaetodontidae · butterflyfishes',length:'Up to 25 cm',
  paragraphs:[
   'A long dorsal streamer trails above a pale body crossed by two broad black bands. Yellow on the tail and soft dorsal fin adds another useful identification clue.',
   'Longfin bannerfish live in sheltered coastal bays and coral-reef waters of the tropical Indo-Pacific. Their food includes animal plankton and bottom-living invertebrates. The similar schooling bannerfish has a shorter snout and a more rounded outline beneath the head.'
  ],question:'Compare this fish with the Moorish idol. Which markings and body shapes are alike, and which are different?',
  limit:'The game simplifies its food to plankton and worms. A long streamer alone does not verify species identity; closely related bannerfishes need careful comparison.',
  source:'Australian Museum · Longfin Bannerfish',url:'https://australian.museum/learn/animals/fishes/longfin-bannerfish-heniochus-acuminatus-linnaeus-1758/'},
 s49:{scientific:'Grammatorcynus bilineatus',family:'Scombridae · mackerels',
  paragraphs:[
   'This slender fish is blue-green above and silver below. Its lateral line divides, with one branch curving down behind the pectoral fin before following the lower side. That feature gives the doublelined mackerel its name.',
   'Also called the scad mackerel, it forms dense schools near reefs, especially outer walls and deep, clear slopes. It eats small fishes and crustaceans. A school of hunters can be part of a reef community as well as schools of smaller prey.'
  ],question:'Compare a compact school with scattered individuals. How does grouping change the amount of open water between fish?',
  limit:'The game does not give this species a dedicated schooling routine or its full crustacean diet. Its chase speed is a balance setting.',
  source:'Dianne J. Bray and S. Schultz · Fishes of Australia: Scad Mackerel',url:'https://fishesofaustralia.net.au/home/species/722'},
 s51:{scientific:'Lutjanus johnii',family:'Lutjanidae · snappers',
  paragraphs:[
   'Golden snapper have a yellowish, bronze-to-silver body with a large dark blotch high on the side. Small reddish-brown marks on the scales form fine lines along the body.',
   'They use coastal and estuarine reefs, including silty places where the water is less clear. Young fish occur among mangroves. Their meals include fishes, shrimps, crabs and cephalopods; a muddy habitat can support a rich food supply.'
  ],question:'Compare a clear outer reef with a silty coastal reef. What might change about the distance at which animals can see one another?',
  limit:'The game keeps every nighttime scene clear enough to play. It does not simulate mangrove nurseries, turbidity or life-stage habitat changes.',
  source:'Dianne J. Bray · Fishes of Australia: Golden Snapper',url:'https://fishesofaustralia.net.au/home/species/558'},
 s52:{scientific:'Siganus doliatus',family:'Siganidae · rabbitfishes',
  paragraphs:[
   'Also called the bluelined or pencil-streaked rabbitfish, this fish has fine blue lines and two slanting dark bands near the head. Its dorsal and tail fins are yellow, and its stout fin spines are venomous.',
   'Pairs and schools graze turf algae, larger seaweeds and seagrass in shallow, sheltered reef habitats. A pair is not always isolated: tracking studies have found coordinated movements involving many pairs.'
  ],question:'Compare a rabbitfish pair with a whole school. What observations would help tell whether the same two fish stay together?',
  limit:'The catalog name is matched to the pencil-streaked rabbitfish; the sprite still needs identification review. Pair bonds and coordinated migrations are not simulated.',
  source:'Dianne J. Bray · Fishes of Australia: Bluelined Rabbitfish',url:'https://fishesofaustralia.net.au/home/species/1049'},
 s17:{scientific:'Sphyraena qenie',family:'Sphyraenidae · barracudas',length:'Up to 1.7 m total length',
  paragraphs:[
   'Dark bars run along this large barracuda’s body. Each bar slopes above the middle of the side and becomes more upright below it. The tail is mostly dark, with two small lobes along its rear edge in adults.',
   'Blackfin barracudas use coastal waters and coral reefs. Australian records extend from Ningaloo Reef around the tropical north to New South Wales. Similar barracudas have different tail colors or fin shapes, so several features are needed for identification.'
  ],question:'Compare the bars and tail with another long, silver fish. Which details would be easiest to see at a distance?',
  limit:'The game’s speed and burst ability are authored values. This source supports identification, size and habitat, rather than the exact chase behavior.',
  source:'Dianne J. Bray · Fishes of Australia: Blackfin Barracuda',url:'https://fishesofaustralia.net.au/home/species/2554'},
 s29:{scientific:'Cheilinus undulatus',family:'Labridae · wrasses',
  paragraphs:[
   'A large adult has thick lips and a rounded hump above the eyes. Young humphead wrasses look different, with wavy dark lines behind the eye and a yellow edge on the tail. They live on tropical Indo-Pacific reefs.',
   'Their food includes crustaceans, molluscs, fishes and echinoderms such as sea urchins. These long-lived fish take years to mature. Some females later become males, and adults gather to spawn on outer reefs.'
  ],question:'Compare its mouth with the cleaner wrasse’s mouth. How can relatives have very different ways of finding food?',
  limit:'The game’s crushing trait represents access to selected hard foods. Growth, sex change and spawning gatherings are not simulated.',
  source:'Fishes of Australia · Humphead Maori Wrasse',url:'https://fishesofaustralia.net.au/home/species/2962'},
 s38:{scientific:'Epinephelus lanceolatus',family:'Groupers',
  paragraphs:[
   'Also called the Queensland groper, this is a huge, heavy-bodied reef fish. Small juveniles are yellow with broad dark markings; adults become mottled gray-brown with darker or yellowish fins.',
   'It usually lives alone, using habitats that include caves, wrecks, rocky shores, estuaries and reefs. A large individual may hover in the water or remain still on the bottom. A big fish does not need to be constantly on the move.'
  ],question:'Watch a large fish hovering. How is staying in one place different from being unable to move?',
  limit:'The game uses one size and one appearance. Its food list and crushing rules are simplified, and juvenile color changes are not simulated.',
  source:'Dianne J. Bray · Fishes of Australia: Queensland Groper',url:'https://fishesofaustralia.net.au/home/species/4672'},
 s39:{scientific:'Plectropomus leopardus',family:'Coral groupers',
  paragraphs:[
   'The common coral trout has many small blue spots and a blue ring around the eye. Its body can be olive, brownish or orange-red. It can quickly change color and may become mottled while hunting.',
   'Individuals or pairs may swim slowly near schools of smaller fish or rest on coral outcrops. Closely related coral trout can look similar; elongated spots on the head help distinguish the barcheek coral trout from this species.'
  ],question:'Compare round spots with long dashes on a fish’s head. Why might that small detail matter more than overall color?',
  limit:'This entry uses common coral trout as the catalog’s intended species; artwork identification remains open. The game does not change its markings during a hunt.',
  source:'Dianne J. Bray · Fishes of Australia: Common Coral Trout',url:'https://fishesofaustralia.net.au/home/species/4518'},
 s18:{scientific:'Tylosurus crocodilus',family:'Belonidae · needlefishes',length:'Up to 1.5 m total length',
  paragraphs:[
   'Also called the crocodile longtom, this fish has an extremely long upper and lower jaw armed with sharp teeth. Its stretched-out body ends in a deeply forked tail.',
   'It lives near the surface in tropical coastal waters, including lagoons, bays, estuaries and areas above reefs. Small fishes are its main food. Needlefishes can leap clear of the water when disturbed.'
  ],question:'Compare this narrow jaw with the broad mouth of a grouper. How might each fish approach a small meal?',
  limit:'The game also accepts shrimp. Surface leaping and movement into the air are not simulated; the fish stays within the underwater scene.',
  source:'Dianne J. Bray · Fishes of Australia: Crocodile Longtom',url:'https://fishesofaustralia.net.au/home/species/2097'},
 s26:{scientific:'Gymnothorax meleagris',family:'Muraenidae · moray eels',length:'Up to 1.2 m total length',
  paragraphs:[
   'Small white spots cover the dark body of the whitemouth moray. The inside of its mouth is pale and the tail tip is yellow. Combining these features helps distinguish it from other spotted morays.',
   'Australian records include Western Australia, the Great Barrier Reef, Coral Sea reefs and islands such as Lord Howe Island. It is associated with reef habitat: its long body has a very different outline from a deep-bodied reef fish.'
  ],question:'Follow the animal’s outline from head to tail. Which features would still help you recognize it if you could see only its head?',
  limit:'The game’s fish, shrimp and crab menu and nighttime-only appearance remain simulation rules. This reference supports identification and distribution, not those precise feeding or timing choices.',
  source:'Dianne J. Bray · Fishes of Australia: Whitemouth Moray',url:'https://fishesofaustralia.net.au/Home/species/3812'},
 s28:{scientific:'Elagatis bipinnulata',family:'Carangidae · jacks and relatives',
  paragraphs:[
   'Rainbow runners use open water, often near the surface over reefs and sometimes farther offshore. They occur around the world in tropical and warm temperate seas, including waters around northern Australia.',
   'Their food is mostly invertebrates, particularly crustaceans drifting in the plankton, with small fishes also eaten. A large, fast-swimming fish can still depend on very small animals for much of its food.'
  ],question:'Compare a plankton meal with a fish meal. Why might the size of a predator alone fail to tell you what it eats?',
  limit:'The game groups this fish with fish-eating hunters and offers fish and shrimp. It does not model the natural proportions of different foods or offshore journeys.',
  source:'Dianne J. Bray · Fishes of Australia: Rainbow Runner',url:'https://fishesofaustralia.net.au/home/species/4273'},
 s40:{scientific:'Platax pinnatus',family:'Ephippidae · batfishes',length:'Up to 35 cm',
  paragraphs:[
   'Young longfin batfish are dark with an orange outline around the body and long fins. Adults look very different: silver-gray to brown, with a dark bar through the eye and another near the pectoral fins.',
   'This species uses coastal and coral-reef waters of the tropical Indo-West Pacific. In Australia it occurs around the north and extends south along both coasts. Its changing appearance is a reminder that a young fish need not look like a small adult.'
  ],question:'Imagine the dark, orange-edged juvenile beside a silver adult. Which body shapes might reveal that they are the same species?',
  limit:'This entry follows the Australian Museum’s use of the common name; other batfishes can share it. Sprite identity still needs review. Growth and changing markings are not simulated.',
  source:'Australian Museum · Longfin Batfish',url:'https://australian.museum/learn/animals/fishes/longfin-batfish-platax-pinnatus/'},
 s5:{scientific:'Paracanthurus hepatus',family:'Acanthuridae · surgeonfishes',
  paragraphs:[
   'The bright blue body, dark markings and yellow tail make the palette surgeonfish distinctive. Sharp spines lie on either side of the narrow base of the tail. It lives around Indo-Pacific coral reefs.',
   'It eats both tiny animal plankton and algae growing on surfaces. Young fish stay close to branching coral, and an alarmed fish can wedge itself between branches. Adults also gather over reef terraces swept by currents.'
  ],question:'Compare feeding in a current with hiding among branches. What might the same fish gain from each place?',
  limit:'The game represents selected foods and a timed spine defense. It does not simulate a fish physically wedging into coral or changing habitat as it grows.',
  source:'Georgia Aquarium · Palette Surgeonfish',url:'https://www.georgiaaquarium.org/animal/palette-surgeonfish/'},
 s10:{scientific:'Thalassoma hardwicke',family:'Labridae · wrasses',
  paragraphs:[
   'Six dark, wedge-shaped bars cross the upper body of this greenish wrasse. They become shorter toward the tail, while pink bands spread outward from the eye. Individuals and small groups use shallow lagoons and outer reef slopes.',
   'Its varied meals include crustaceans, fish eggs and small fishes, as well as other small organisms on the bottom and in the plankton. Some females change into males during their lives; the male color phase is brighter.'
  ],question:'Compare the bars near the head with those near the tail. How could their pattern help you recognize this fish?',
  limit:'The game uses a shrimp, worm and snail menu and one adult appearance. Fish eggs, sex change and different color phases are not simulated.',
  source:'Dianne J. Bray · Fishes of Australia: Sixbar Wrasse',url:'https://fishesofaustralia.net.au/home/species/284'},
 s25:{scientific:'Pygoplites diacanthus',family:'Pomacanthidae · angelfishes',
  paragraphs:[
   'Pale bars with dark edges cross the yellow-orange body and continue onto the fins. Young regal angelfish have fewer bars and a conspicuous eyespot near the back of the dorsal fin.',
   'These fish live around coral-rich lagoons and outer reefs, often near caves. Juveniles shelter in narrow cracks. Their natural food includes sponges and tunicates: still-looking animals can be important meals.'
  ],question:'Find the real eye and imagine an eyespot near the tail. How would you tell a marking from an actual eye?',
  limit:'The game also accepts algae for this fish; that is a menu simplification rather than the documented sponge-and-tunicate diet. Juvenile markings and growth are not simulated.',
  source:'Dianne J. Bray · Fishes of Australia: Regal Angelfish',url:'https://fishesofaustralia.net.au/home/species/658'},
 s54:{scientific:'Antennarius pictus',family:'Antennariidae · frogfishes',length:'Up to 16 cm',
  paragraphs:[
   'Also called the painted anglerfish, this fish can be red, yellow, orange, green, brown or black. The pectoral fins often have pale tips, and three spots commonly mark the tail. Color alone is not enough to identify it.',
   'It often lives alongside sponges in bays and estuaries. Its range includes tropical and temperate parts of the Indo-Pacific, with Australian records extending around the north and down both western and eastern coasts.'
  ],question:'Compare the outlines of a frogfish and a sponge. What details would you look for to decide which one is a fish?',
  limit:'The illustration shows one stylized appearance. The lure ability and its effect on nearby prey are game rules; this source verifies identity and habitat rather than lure timing.',
  source:'Australian Museum · Painted Anglerfish',url:'https://australian.museum/learn/animals/fishes/painted-anglerfish-antennarius-pictus/'},
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
