# Species correction pass 3

This pass reconciles three more current entries with original Windows INFORES.DLL identities. Stable IDs and catalog menu names are retained. It follows the user's Practice/exploration priority; Tournament order and predator tuning are unchanged.

| ID | Original name/scientific string IDs | Corrected identity | Previous mismatch |
|---|---|---|---|
| s2 | 163 / 267 | Gobiodon okinawae | Genus-level example and orange patterned illustration |
| s12 | 71 / 175 | Neoniphon sammara | Atlantic squirrelfish example and generic red illustration |
| s22 | 69 / 173 | Arothron nigropunctatus | Stars-and-stripes example and a permanently round yellow illustration |

The goby keeps the original “Orange coral goby” menu label while its guide explains the yellow adult coloration. The squirrelfish has its pale striped body and diagnostic dark dorsal patch. The puffer is shown in an ordinary, uninflated swimming form with irregular dark spots and a pale snout band. These are stylized illustrations, not anatomical plates certified down to fin-ray counts. All three were checked in the shared renderer against the incumbent sprite sheet; no original game images or third-party photographs were copied into these assets.

## Source evidence and gameplay boundary

- [Fishes of Australia: Yellow Coralgoby](https://fishesofaustralia.net.au/home/species/2231) supplies modern identity, adult/juvenile distinctions, coral association and diet. Original information resource 599 lists plankton, so the game retains its plankton-only menu. Natural coral feeding and skin defenses are explicitly outside the simulation.
- [Fishes of Australia: Slender Squirrelfish](https://fishesofaustralia.net.au/home/species/4445) supplies the bloodspot synonym, markings, nocturnal behavior, natural food and communication. Original information resource 507 lists crabs and shrimps; those gameplay foods remain. No fish-eating tag is added, so nighttime hunter selection and density are unchanged.
- [Australian Museum: Blackspotted Pufferfish](https://australian.museum/learn/animals/fishes/blackspotted-pufferfish-arothron-nigropunctatus-bloch-schneider-1801/) supports coral feeding, range, size and identification. [Fishes of Australia: Blackspotted Puffer](https://fishesofaustralia.net.au/home/species/850) also supports snout/eye markings and color variation. Original information resource 505 explicitly includes corals among foods. The missing coral tag is restored in the shared player/NPC diet; the existing other food tags are retained. Natural toxin and predator-exception behavior is not changed in this pass.

Original files remain in the external odell-reference research folder, with provenance in ORIGINAL-ROSTER-LEDGER.md. No copyrighted original educational paragraphs are added to the product.

Saved player and NPC puffers with ID s22 gain only the missing coral tag. Position, food depletion, health, populations, RNG and other recorded fields are retained. Custom fish retain their chosen diet. Migration is idempotent. All three new illustrations resolve by stable catalog index, including existing saves.

## Asset provenance and prompts

Built-in image generation, three independently authored text prompts, no image input. Selected outputs were copied intact into assets/creatures; original generated outputs and original atlas cells remain. Each PNG is 1536×1024 with real alpha. Body alpha peaks at 254, and each has over 540,000 pixels above alpha 200; no image-edge pixel exceeds alpha 40. The dark glow visible in the generation preview is not an opaque background in the game; the browser contact sheets verify compositing on the guide's pale background. This verifies transparency, not every anatomical detail.

### yellow-coralgoby-v2.png

Original output: exec-de324b56-1e67-4aee-b950-2737748b3d91.png in the thread's generated_images directory.

Full prompt:

> Create one high-resolution original educational game creature sprite: an adult yellow coral goby Gobiodon okinawae, complete fish in strict side profile facing RIGHT, isolated on a genuinely transparent alpha background. Landscape canvas 1536 by 1024; fish occupies 84% of canvas width with generous clear margins around all fins. Accurate compact stout goby anatomy, relatively large blunt head, small rounded mouth, black round eye, two separate low dorsal fins, rounded broad tail, visible soft pectoral and pelvic fins. Adult is uniformly bright lemon yellow including fins, subtly lighter cheek, smooth scaleless skin, NO orange spots, NO stripes, NO red markings. Fin membranes delicately translucent but body solid opaque. Refined hand-painted natural-history plate suitable for a polished high-resolution reef exploration game, luminous color and subtle anatomical modeling, clean readable silhouette, restrained fine texture, no thick cartoon border. One animal only. No coral, scenery, ground, cast shadow, text, caption, ruler, frame, watermark, checkerboard or colored background. Keep horizontal swimming axis. This is newly authored artwork, not reproduction of any game or photograph.

### bloodspot-squirrelfish-v2.png

Original output: exec-c2f75ca0-844a-40b6-b758-ab8f62d1e689.png in the thread's generated_images directory.

Full prompt:

> Create one high-resolution original educational game creature sprite of Neoniphon sammara, bloodspot/slender squirrelfish, full body in strict SIDE PROFILE facing RIGHT, genuinely transparent alpha background. Landscape 1536x1024 canvas, animal 84% of width with all fins and tail inside generous clear margins. Slender moderately deep fish, conspicuously large natural dark eye, pointed snout with slightly projecting lower jaw, forked tail, strongly spiny first dorsal fin followed by soft dorsal lobe. SILVERY-GOLD body fading to ivory underside, numerous narrow dark reddish longitudinal stripes along sides. Large diagnostic BLACK blotch at FRONT of spiny dorsal, joining a broad rusty red band through that fin; white dorsal spine tips and small pale basal markings; red gill-cover band and small dark cheek marks. Fins delicately translucent reddish. NOT a uniformly red deep-bodied generic squirrelfish. Refined hand-painted natural-history plate for a high-resolution reef exploration game, anatomically considered, luminous and clean, coherent opaque body, subtly modeled scales and fin rays, readable at small game size, no thick cartoon outlines. One complete animal only. No scene, water, plants, shadows, label, text, frame, watermark, checkerboard or colored background. Newly authored artwork, not a reproduction of a photograph or game asset.

### blackspotted-puffer-v2.png

Original output: exec-3acc9097-bd23-4715-9d87-0ded5af3e216.png in the thread's generated_images directory.

Full prompt:

> Create one high-resolution original educational game sprite: adult blackspotted dogface pufferfish Arothron nigropunctatus in its NORMAL UNINFLATED swimming form, full-body strict side profile facing RIGHT, isolated on genuinely transparent alpha background. Landscape canvas 1536x1024, fish 84% canvas width, clear margin around entire silhouette. Elongated plump oval body tapering strongly to a short tail stalk and rounded fan tail, blunt doglike muzzle, small protruding beaklike mouth, natural dark eye; small pectoral fin behind gill, short dorsal and anal fins set far back opposite one another, NO pelvic fins, NO spines. Grey-brown upper body, warm ivory to pale yellow underside. Scattered IRREGULAR dark black-brown spots, dark patches surrounding eye and muzzle, distinctive PALE BAND across top of snout. Not an inflated balloon, not porcupinefish, not white-spotted or striped puffer. Refined hand-painted natural-history illustration for a polished high-resolution reef exploration game: luminous but natural tones, smooth skin with restrained texture, delicate fin rays, solid opaque body, clean silhouette visible at small sizes, no cartoon border. One animal only. No water, scenery, cast shadow, substrate, lettering, caption, frame, watermark, checkerboard or background color. Entire tail and fins visible. Newly authored design, not traced or copied from any existing game or photograph.

## Validation and remaining work

All 125 unit/asset checks pass, including coral meals by player and NPC puffers, exact old-save migration, unchanged goby/squirrelfish menus and real-alpha checks for all seven sprite overrides. ASSET-MANIFEST.json records 89 assets. All 32 browser scenarios pass; evidence is preserved in artifacts/species-pass3-e2e-results.json.

The dedicated guide/Practice checks pass in the browser at 1024 and 1600 widths and in source Electron on Windows with an isolated profile (scripts/qa-species-corrections.mjs --source-electron). They cover eight scientific-name searches and expanded fact entries, loaded illustrations and horizontal overflow, six Practice entries, actual mouse-selected puffer coral feeding with energy gain/no poisoning, puffer inflation, and the existing ray pulse. No page errors were recorded. Evidence: artifacts/species-pass3-browser-report.json and species-pass3-source-electron-report.json. These are source-app checks, not a new packaged build. All 55 species complete the ten-minute seed-42 exploration exercise; see artifacts/exploration-puffer-coral.json for its bounded scope.

The parked Windows-Exploration ZIP predates this source change. Eight original identity mismatches now have corrected written identities; seven use replacement illustrations. Other roster identities, missing organisms, feeding/defense exceptions, occlusion and animation gaps remain open.
