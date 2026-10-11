# Night ledges: species adventure research

Research date: 10 October 2026; sources and working-tree status rechecked for the research-only planning pass. Scope: s3 Royal gramma, s12 Squirrelfish, s14 Oriental sweetlip, s51 Golden snapper. This pass changes only this report. Existing catalog names and scientific identities remain authoritative. All proposed titles, decision rules, timings, reactions, badges and compressed events below are authored game design, not claims that fish perform a human task.

## Recommendation

| Species | Distinctive opportunity | Verdict | Effort / priority |
|---|---|---|---|
| s3 Royal gramma | Turn beneath a ledge; carry algae into a nest and clear its entrance | Strong: concrete, tactile care beyond an existing meal trip | M-L / P1 |
| s12 Squirrelfish | Notice an obscured neighbor through sound plus posture; choose personal space | Strong with careful communication framing | M / P1 |
| s14 Oriental sweetlip | Compare a freely moving juvenile with a resting adult | Small conditional observation; defer a full spacing story because it duplicates squirrelfish | M / P2 after verified juvenile art |
| s51 Golden snapper | Explore readable silty coastal structure and find another snapper nearby | Conditional on a real coastal habitat; defer major story | L / P3 |

No candidate needs a day/session schedule, online wait, repeat grind, predator attack, brood loss, or deadline. No original-game research was conducted. A quiet dusk-like palette can express nocturnal ecology without forcing a period change or scheduling a future session.

## Existing architecture and shared implementation contract

Read: `src/data.js`, relevant `src/natural-history.js` records, `src/adventures.js`, `src/home-journeys.js`, `src/foraging-journeys.js`, `src/watch-journeys.js`, `src/reef-story-data.js`, `src/reef-stories.js`, `src/cardinalfish-nursery.js`, `src/feeding-contact.js`, `src/geometry.js`, and relevant `src/simulation.js`, `src/main.js`, `src/save-files.js` sections. Also inspected the unfinished `src/gramma-nest.js`, `src/gramma-nest-render.js`, `src/squirrelfish-shade.js`, `src/squirrelfish-shade-render.js` and their test files.

The four fish already have journeys. At this snapshot, `reef-story-data.js` contains the proposed `nest` and `shade` metadata and a `storyKeysFor` list, but the runtime module table, `freshStories`, restore validator and habitat dispatch in `reef-stories.js` still cover only the five earlier stories. The new mechanics/render/test files are implementation drafts, not verified playable features. Resume by completing and reviewing those drafts instead of creating duplicate adventures. Explicit story selection and compatibility must reach the UI and restore path; a metadata registration alone does not establish integration. The module contract includes `initStory`, `validStory`, `storyAction`, `tickStory`, `storyMeal`, `storyNPC`, and `storyView`; the drafts also expose input, pose/scene and safety hooks requiring simulation and renderer wiring.

Simulation already serializes `reefStories`; its validator rejects unknown keys and checks active story/species compatibility. `save-files.js` permits the top-level key but that does not validate new nested data automatically. Persist a versioned, bounded stage and stable world references. Use `{id, incarnation}` for fish so a replacement entity cannot silently inherit a relationship. Pause freezes active timers. Leaving the reef suspends dependent events; never silently completes one, empties a nest, or penalizes the player. Reload resumes the last completed beat without awarding it twice. Missing NPCs permit a new encounter with a fresh reference; earned progress remains.

`main.js` already offers Begin/Continue, Return to free exploration, story buttons and a discovery cue. On completion emit one existing `discovery` event with a registered ID, so family-journal persistence uses the established path. A named species badge is additional work in `src/journal.js`; existing discovery milestones alone do not create that badge. Award once for a meaningful completed interaction, not visits or elapsed minutes. The story remains replayable without multiplying rewards.

Mouse movement normally calls `sim.point`, cancels meal pursuit and several other assisted actions. Pointer-down calls `eatAt`. The draft `storyClick`, `storyPointer` and `storyPlayer` hooks need routing before ordinary movement/eating where appropriate; a distant click may set an approach target but must not advance progress. Moving the pointer must return control immediately. Keep keyboard/context equivalents, visible focus, text equivalents for audio, and usable touch targets. Do not make an ambient sound or a tiny visual target the sole clue. Encounter admission must reserve eligible existing fish within the adult population budget, preserve established pairs and committed meals, and visibly recover from a missing or busy participant. A retry button hidden behind a bound but unavailable fish is insufficient.

Acceptance across all cards: real rendered mouse interaction, event/state assertion after actual contact, no completion by remote clicks, no forced cursor destination after the user steers, pause/modal/offscreen/save round trips at every stage, missing-neighbor recovery, and one persistent discovery after replay/reload. Story-specific tests below are necessary because these affect new interaction rules; no runtime tests were run for this research document.

## s3 — Royal gramma (*Gramma loreto*)

### Evidence and identity limits

The current Atlantic identity is explicit. Do not imply native Australian occurrence or substitute a similarly purple/yellow dottyback. Aquarium La Rochelle describes shelter association, occasional cleaning, male nest care, and belly-up swimming beneath overhangs. The belly-up behavior is directly supported; a full gravity-defying traversal system is a design extension. [Aquarium La Rochelle species account](https://www.aquarium-larochelle.com/en/species-encyclopedia/royal-gramma/).

Asoh and Yoshikawa's field study observed males carrying algae with the mouth, modifying nest entrances and emerging from nests to expel silt clouds. Algae-associated egg sheets occurred in holes/crevices, including overhang undersides. It found no evidence for mouthbrooding. The authors could not observe whether removed silt came from eggs or another nest surface. Entrance mats might camouflage, filter silt or narrow the defended opening; those functions were discussed as possibilities, not demonstrated outcomes. This directly supports construction and maintenance while leaving automatic egg appearance and guaranteed ecological benefits outside the card. [Primary paper, author-uploaded full text, Copeia 1996](https://www.researchgate.net/publication/271792367_Nesting_Behavior_Male_Parental_Care_and_Embryonic_Development_in_the_Fairy_Basslet_Gramma_loreto); [DOI](https://doi.org/10.2307/1446936).

### Current loop

`data.js`: size 42, speed 126, plankton/shrimp, day, dash, reef. The integrated `home-journeys.js` loop remains `gramma-ledge` / “Under the ledge”: choose shelter, settle, depart, eat shrimp and return. The unfinished `gramma-nest.js` draft adds an explicit nesting-male role, two ledges in reef 4, a single construction tuft, left/right sockets, clearing and final inspection. Its `nestPhysicalPose`/`nestMouth` functions aim to align belly-up rendering and contact. Neither this source file nor a test file proves the live pose, input routing or save integration is complete. A second meal/homecoming loop adds little.

### Implementation card — A Little Room Under the Roof

**New decision:** Which sheltered opening to line, where to place a loose algae piece, and whether the remaining gap needs lining or clearing. The player explicitly takes the role of a nesting male for this optional story; free play remains unspecified. This is a proposed role choice, not a retroactive identity change.

**Four-beat loop:**

1. Swim to either of two readable ledge openings; hover along its underside and choose it. The fish rolls belly-up while the mouse remains responsive.
2. Click a loose algae tuft, physically approach it, and carry one piece in the mouth back to an entrance socket. Choose the left or right edge; both are valid and produce different visible arrangements.
3. Inspect a small silt cloud at the entrance. Position the mouth at the clearing point and use the contextual action; the fish takes material out and releases a cloud away from the opening.
4. Swim back to the opening and physically inspect the finished nest, recording “A cared-for corner.” The completed algae lining and cleared entrance remain visible. Construction does not summon a visitor or produce eggs. Any later egg-care content requires a separately introduced, explicit reproduction story establishing that spawning has occurred.

**NPC/world reaction:** Algae visibly changes the opening and silt moves into the water; physical inspection reveals the clear entrance and attached lining. Nearby fish can continue their ordinary routines without a scripted reproductive response. Do not instruct an unrelated fish to help, imply female construction, or transplant cardinalfish mouthbrooding.

**Reuse:** Shelter locations and `chooseJourneyHome` selection shape; `sim.point`; story actions/view; `mouthPoint`, `feedingApproach`, `approachMeal` as patterns for physical pickup/deposit; existing particle/effect and journal paths. Keep story materials out of ordinary food/diet bookkeeping: algae is construction material for this carnivore.

**New state/art/audio:** Nest site, selected edge, tuft reference, carried piece, placed socket, cleared flag, inspected flag, stage/completed. Ledge underside geometry, nest socket overlay, attached algae piece, small silt particles and belly-up pose. Egg state and art are outside this construction story and require the explicit reproductive-story prerequisite above. Soft material movement cue is optional; no generated speech/audio API work is required. Each opening is viable: placement is expressive rather than a hidden correct-answer puzzle.

**Concrete continuation:** Review `gramma-nest.js`/`gramma-nest-render.js`, then wire `reef-stories.js`, `simulation.js`, `render.js`, `main.js` and save validation. Persist one versioned role/site/side/material record and the three completed flags; keep movement jobs transient and reconstruct carried material conservatively. Source/target hit regions must agree with the same authoritative mouth pose. No new animal is required for this solo activity.

**Save/pause/offscreen:** Save carried material and attached pieces; suspend debris and inspection beats offscreen. Nest does not foul again while absent. Returning later offers inspection, not compulsory upkeep. Never simulate egg loss. Stopping resets transient carry/pose control safely while retaining the built nest; resume makes any unplaced piece available nearby.

**Real-control/contact acceptance:** Picking up must require mouth-to-tuft contact; deposition requires mouth-to-socket contact. The existing simulation mouth calculation defaults to zero rotation, whereas rendered frames can rotate: belly-up carrying cannot be implemented as a cosmetic flip alone. Define one authoritative physical pose or return to an upright feeding pose before contact, and verify the rendered mouth actually meets each target from both facing directions. Mouse movement interrupts approach without losing completed work. Final inspection must require the fish at the finished entrance, not a remote button press. Test near ledge edges, overlapping food targets, reload while carrying, and leaving before final inspection.

**Effort/priority/risk:** M without free underside traversal; L if arbitrary ledge-normal navigation is required. P1. Main risk is render/contact disagreement; second is turning care into resource collection. Use one meaningful placement plus one clearing action, not a pile of identical deliveries.

## s12 — Squirrelfish (*Neoniphon sammara*)

### Evidence and identity limits

Keep the existing label “Squirrelfish” and the precise *N. sammara* identity. Museums Victoria's account names the slender/bloodspot squirrelfish, shelter use and nocturnal feeding; its communication statement is family-level. [Fishes of Australia](https://fishesofaustralia.net.au/home/species/4445).

Species-specific evidence is available. The 2024 field study includes *N. sammara* and documents parallel-swimming competition; its supporting S4 movie shows that species, whereas body quivering was not observed in it. Researchers recorded during daylight near shelters, then left to reduce disturbance. They describe *N. sammara* as mostly solitary, sometimes sharing shelter with a few others. Sound types did not map reliably to single behaviours; reinforcing visual communication is the authors' interpretation. No reproductive behaviour was observed. This supports reading sound with posture and spacing, with a shaded encounter as game interpretation; it does not demonstrate a friendly nocturnal greeting or a fish dictionary. [Primary study, PLOS ONE 2024, Results, Discussion and S4 Movie](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0312191).

A comparative anatomical/acoustic paper also directly includes *N. sammara*. Hand-held distress recordings should not be used as proof of its friendly greeting sound. [Primary paper, Frontiers in Zoology 2011, institutional copy](https://www.vliz.be/imisdocs/publications/237899.pdf). Do not extend this to echolocation, sonic stunning, an obligatory chorus, or cooperative night migration. Current `sonic` defense is already acknowledged as authored.

### Current loop

`data.js`: size 62, speed 140, shrimp/crab, night, sonic, reef. The integrated `squirrelfish-night-trip` already covers refuge, a shrimp/crab excursion and return. The unfinished `squirrelfish-shade.js` draft separately binds an existing eligible conspecific, emits local `shade-pulse` events and requires real crowd-to-separation movement before final inspection. It has bounded save validation and renderer scene exports; the dispatcher and end-to-end integration remain unfinished at this snapshot. Preserve the old journey and defensive ability. Draft synthetic sound is authored sound design, not a licensed field recording.

### Implementation card — Someone in the Shade

**New decision:** Where to settle relative to another fish, using sound together with orientation and spacing. The player can leave more room or inspect another opening; no aggressive victory condition.

**Four-beat loop:**

1. Follow a soft directional pulse toward a partly obscured opening. A matching visual ripple and text cue make the source discoverable with audio muted.
2. Approach to see a resident. It turns side-on and maintains its space; sound is a cue to investigate, not a translated sentence.
3. Choose the neighboring alcove or back away and take the other approach. A short live spacing interaction lets the player see the resident's movement settle as the gap opens.
4. Inspect both positions from the shared ledge edge. The two fish remain independently settled; record “Room in the shadows” and optionally explore the other opening.

**NPC/world reaction:** A resident shifts away from crowding, turns toward a nearby fish, then settles when the player moves away. Calm coexistence is authored behavior inspired by territorial spacing, not evidence of friendship or a scientifically measured acceptance radius. No fish is chased, stunned, or driven from its home for a reward.

**Reuse:** Refuge geometry, `storyNPC`, steering/turning, familiar-entity references, `storyView` actions, spatial effects and discovery events. Keep defensive `useAbility` independent; a special listening/inspect action must not consume sonic-defense energy or trigger predator effects.

**New state/art/audio:** Two alcove occupancy points, resident `{id,incarnation}`, observed flag, player-selected point, separation progress, complete. Directional ripple/caption, readable dorsal/side-on pose, optional short quiet synthetic knocks labelled as sound design rather than a field recording. If real recordings are later licensed, preserve provenance and context. Do not copy or generate audio in this research pass.

**Concrete continuation:** Review `squirrelfish-shade.js`/`squirrelfish-shade-render.js`, integrate their scene and input hooks through `reef-stories.js`, `simulation.js`, `render.js` and `main.js`, and connect an optional muted-aware audio handler. Save reef/site, species-qualified actor identity, observed beat, chosen point, actual crowd/response evidence and one completion flag. Bound pulse/stability state; playback cannot create evidence. Admission, danger protection and busy/missing recovery must use the same local ownership rules rather than stealing a paired fish or resetting appetite.

**Save/pause/offscreen:** Freeze the encounter outside its reef and when paused. Persist observed/space-selected beats; reload reconstructs positions conservatively. If the resident vanishes, another resident can offer the remaining spacing encounter without erasing the observation. Completion never requires a scheduled night or another real session.

**Real-control/contact acceptance:** Clicks select investigation locations, not remote “heard” credit. Observation requires the player inside the local listening area and the resident visibly acting there. Completion needs a real change from crowded to separated positions, not waiting anywhere for a bar to fill. There is no mouth contact in this story. Mouse steering always overrides an assisted approach; verify muted play, resident motion, scale changes, and return after a map visit. Do not lock normal movement into watch-journey mouse aiming unintentionally.

Add acceptance for a bound fish that starts a meal or cleaner visit: show a clear unavailable/retry path, preserve its activity, and offer the existing save-preserving fresh-dive path if no eligible fish is reachable. Verify both choices produce different real positions with the same incarnation, pause/blur freeze sound and movement, and local hunters remain present without injuring required participants. A half-second calm pose may confirm an already changed spatial outcome; it cannot replace that outcome.

**Effort/priority/risk:** M / P1. Risk: presenting invented meanings as science or repurposing threatening calls as a friendship spell. Keep the uncertainty explicit in the journal reflection and make pose/position the decisive information.

## s14 — Oriental sweetlip (*Plectorhinchus vittatus*)

### Evidence and identity limits

The exact identity is retained; neither *P. chaetodonoides* nor *P. lessonii* is interchangeable. Museums Victoria describes resting singly or in small groups by day and nocturnal carnivory. It also describes marked juvenile/subadult/adult pattern changes. [Fishes of Australia](https://fishesofaustralia.net.au/home/species/459).

Reef Life Survey describes small juveniles as black with large orange-edged pale spots and adults with broad stripes continuing over the belly; the latter helps distinguish *P. lessonii*. Fishes of Australia describes juveniles with a yellow head and irregular broad dark stripes, and subadults with broad stripes. These descriptions are not interchangeable art specifications: select an explicitly identified, photographed age/size rather than combining spotted and striped juvenile stages. The sources do not establish why the juvenile pattern exists. [Reef Life Survey account and photographs](https://reeflife.org/species/plectorhinchus-vittatus/), [Fishes of Australia, Summary and More Info](https://fishesofaustralia.net.au/home/species/459).

The existing natural-history record cites Biarritz for tooth sounds; that endpoint failed to open during this pass, so it is not fresh verified evidence for a species-specific sound mechanic. No opened primary study here establishes toxic-flatworm mimicry, a particular juvenile dance's function, lifelong resting partners, coordinated patrols or parental care for this taxon. Do not import such claims from another sweetlip or turn a plausible mimicry story into fact.

### Current loop and verdict

`data.js`: size 96, speed 123, worm/shrimp/snail, night, none, sand. `sweetlip-bottom-route` / “Along the nighttime bottom” already requires a worm and then shrimp from a separate patch. `foraging-journeys.js` approaches the target, requires uninterrupted mouth contact for 1.5 seconds to uncover it, then eating; sites must be at least 120 units apart. Repeating bottom sifting or adding a third meal is not a new adventure.

A full resting-spacing adventure would duplicate the stronger squirrelfish encounter. Defer that version. A small juvenile/adult observation is more distinctive, conditional on correct life-stage art and scene context. The current single adult illustration cannot be relabelled as a juvenile. Daytime resting evidence also needs an explicit daytime observation scene; a shaded nighttime starting dive is not automatically such a scene. Do not change an imported dive's period or make players wait for the real clock.

### Conditional observation card — Before the Stripes

**New decision:** Choose a clear viewing position around cover, then follow either a juvenile's independent short movement or an adult's resting outline. The player controls which individual and life-stage features become visible. This is an observation vignette, not a growth simulation or an identification quiz.

**Four-beat loop:**

1. In an explicitly authored daytime observation scene, find a correctly identified juvenile near cover and an independently resting adult.
2. Choose a viewing edge around an occluding rock. Physical swimming, rather than a remote button, reveals the juvenile's spotted silhouette.
3. Follow its short autonomous movement, or inspect the adult from another edge; the two animals do not form a scripted parent/offspring pair.
4. Inspect the second individual and add the observed juvenile/adult comparison to the journal. No feeding, capture, instant maturation or obligatory school joins the loop.

**Reaction/reuse:** Changing viewpoint reveals different real body areas through cover; the juvenile continues its own movement while the adult rests. Route and reveal timing are authored. Reuse scene/hit geometry, `storyNPC`, `turnTowards`, incarnation references and journal recording. Close approach may interrupt a view, but cannot create a permanent bond or evict a fish for a reward.

**Files/art/bounded state:** A future observation module and renderer would join `reef-story-data.js`, `reef-stories.js`, `simulation.js`, `render.js` and `main.js`. Reserve two population slots with explicit adult/juvenile identities rather than appending adults or shrinking the current sprite. Save one scene ID, two `{id,incarnation,species,lifeStage}` references, chosen viewing edge, two observed flags and completion. Add a photographed-age juvenile body/sprite, distinct proportions, resting adult pose and cover occlusion; ambient water audio is enough. Defer if juvenile art, population admission or daytime scene support is absent.

**Save/pause/offscreen:** Freeze local observation and its short route when paused/offscreen; preserve completed views. Replacing a fish must rebind the appropriate life stage without inheriting a relationship. An unobserved juvenile cannot become an adult while absent. A future scene-entry choice must preserve the previous dive; no hidden day/night rewrite.

**Real-control/contact acceptance:** Two different player positions must reveal different body areas with matching picking geometry. Credit requires a visibly present, correctly proportioned animal inside the local view, with identity and life stage asserted; remote clicks and offscreen movement grant none. Clicking the juvenile inspects instead of starting a hunting action. Verify solitary adult and small-group contexts without implying all individuals school. Pause, reload and missing-actor recovery preserve observed views; replay adds no duplicate discovery.

**Effort/priority/risk:** M / P2 conditional observation, after the two P1 cards. Defer a full story now: the spacing version repeats squirrelfish and the more distinctive age comparison needs juvenile art and an honest daytime scene. A small optional atlas comparison can explain the evidence without pretending those runtime features exist.

## s51 — Golden snapper (*Lutjanus johnii*)

### Evidence and identity limits

The current taxon is the golden/fingermark snapper, not the unrelated fishes called golden snapper elsewhere. Museums Victoria supports inshore coastal/estuarine reefs, silty areas, mangrove juveniles, and reported schools of large adults in turbid coastal waters. Diet includes fish and benthic invertebrates. [Fishes of Australia](https://fishesofaustralia.net.au/home/species/558).

A Western Australian trap study found *L. johnii* relatively more important in nighttime than daytime catches. Catch composition does not establish an obligatory night migration route or absence by day. [Travers, Newman and Potter 2006, government-hosted primary-study abstract](https://library.dpird.wa.gov.au/fr_fja/388/).

A 2023 artificial-reef telemetry study tagged three *L. johnii* among eleven fish. Their residency indices differed (1.00, 0.61, 1.00); the study concerns released fish at a South China Sea artificial reef. It supports local residency as a possible motif, not universal adult home fidelity, a natural nursery migration, or a night-only schedule. [Lyu et al. 2023, primary paper, Table 1](https://www.frontiersin.org/journals/marine-science/articles/10.3389/fmars.2023.1130547/pdf).

Tanaka et al. inferred coast-to-inner-mangrove movement in the youngest *L. johnii* from stable isotopes in Malaysia's Matang system. That is evidence about growth-related habitat use and food-web dependence, not a directly filmed daily migration or a promise that every Australian fish takes that route. A recent Northern Territory synthesis notes that precise movement data remain limited and tagging generally suggests local movements, with relatively few offshore movers. Keep any future juvenile mangrove case study geographically and methodologically labelled. [Tanaka et al. 2011, primary paper](https://doi.org/10.1007/s12562-011-0396-x), [Northern Territory assessment, Introduction, p. 12](https://nt.gov.au/__data/assets/pdf_file/0011/1574354/golden-snapper-stock-assessment-2024.pdf).

### Current loop and verdict

`data.js`: size 128, speed 152, fish/shrimp/crab, night, dash, reef. `snapper-two-visits` / “Two nighttime visits” already combines watching with two short trips: E at a ledge, settle 1.5 seconds, mouse-aim at a shrimp for a second within 280 units, click/approach/eat, return and settle three seconds; repeat for fish. A “night patrol,” two habitats with two meals, or another homecoming is redundant.

The new ecological opportunity is habitat structure and visibility. Existing scenes contain reef, sand and seagrass, not a mangrove nursery. Do not rename seagrass as mangroves or claim the current adult is a juvenile. A major story should wait for a correctly authored coastal habitat. A smaller adult aggregation vignette can be ambient, but is not strong enough to justify a full story by itself.

### Conditional implementation card — Gold in the Clouded Water

**New decision:** Choose a route around coastal structure using near-field visual landmarks and nearby fish instead of a distant unobstructed target. This is exploratory navigation, not sensory-superpower or echolocation simulation.

**Four-beat loop:**

1. Enter a purpose-built, clearly labelled silty coastal reef pocket and inspect two structural landmarks.
2. Choose the open channel or the closer reef edge. Silty bands soften distant scenery while player, nearby fish and interaction targets remain readable.
3. Find a loose adult snapper aggregation near structure; approach an unoccupied position and see neighboring fish adjust spacing.
4. Swim back using the other landmark route. Record a habitat discovery; a mangrove juvenile observation is optional only if a genuine mangrove extension and juvenile art are also built.

**Reaction/reuse:** Independent adults shift and cruise, a silt layer reveals a landmark as the player approaches, and the visited landmarks become persistent map notes. These exact routes and reactions are authored. Reuse map routing, story module/NPC hooks, geometry, `reefMemory`/journal patterns and existing movement. No need for additional predation or feeding credit.

**New state/art/audio:** Real coastal habitat art and collision/occlusion geometry, visited landmark IDs, branch choice, resident refs, local visibility state, complete. Need an accessible visibility layer that never hides essential targets. Mangrove prop roots and juvenile art are separate optional expansion work, not cosmetic relabeling. Ambient water sound is sufficient.

**Files and scope gate:** A new habitat/scene definition in `data.js` and reef assets must precede a story module/renderer and the usual registry, simulation, input and save wiring. Bound the card to two landmark IDs, one branch choice, up to two real adult actor refs and completion; derive visibility from current local position instead of saving an unbounded trail. A juvenile variant requires a separately labelled habitat/life-stage case study. Given the map/art cost and weak evidence for a distinctive sensory interaction, this is a habitat expansion candidate, not a core sprint commitment.

**Save/pause/offscreen:** Save branch and visited landmarks, suspend story movement outside the pocket. No offscreen navigation or migration success. If broader map expansion is not authorized in implementation, defer rather than place impossible mangroves into existing art. Badges survive independently of which route was taken.

**Real-control/contact acceptance:** Map route selection cannot award exploration; the fish must swim through actual landmark regions. Visibility/hit-testing must agree, and silhouettes/captions or a reduced-haze setting preserve access. No mouth contact here. Test both routes, all supported canvas sizes, high contrast/reduced effects, offscreen return, reload in haze, and adult group placement clear of the player's large body.

**Effort/priority/risk:** L / P3 conditional. Biggest risk is building a generic fog maze, falsely portraying this as special snapper sensing, or disguising a new-habitat project as a small species feature. If no coastal expansion is planned, keep existing `snapper-two-visits` and add only a supported atlas/memory observation; no new badge grind.

## Cross-species safeguards for implementation review

- Preserve the four current species names and precise identities; proposed male/juvenile roles must be explicit choices.
- Use short in-world cause and effect: material moves, a fish gives space, a viewpoint opens. Text explains the observed effect rather than replacing it.
- Separate evidence from authorship in journal reflections. Especially avoid gramma mouthbrooding, sweetlip mimicry borrowed from another species, a squirrelfish dictionary, and universal snapper migration.
- All rewards are permanent, optional and noncompetitive. No session calendar, escalating resource list, injury timer, enforced darkness, failed brood, or threat required to finish.
- Maintain visible mouth/contact agreement for gramma material handling, readable body clearance for rest scenes, and accessible sound/visibility cues. These are release acceptance requirements rather than decorative polish.

## Ranked continuation and coverage

1. **s3 Royal gramma — P1:** finish and verify the existing construction draft. Direct male algae-carrying/silt-clearing evidence supports the most concrete world change; role and authoritative mouth contact are the main gates.
2. **s12 Squirrelfish — P1:** finish and verify the existing context/spacing draft. Species-specific field evidence is strong, but the exact quiet sound, choice radii and calm settling are authored. Admission and visible busy-actor recovery are mandatory.
3. **s14 Oriental sweetlip — P2 conditional:** retain its bottom-foraging journey; defer duplicate spacing gameplay. An optional age-comparison vignette needs identified juvenile art, two admitted life stages and honest daytime scene support.
4. **s51 Golden snapper — P3/defer:** retain its watched trips. Coastal habitat and local adult aggregation are supported; a major exploration story needs genuine new habitat art and a distinctive interaction beyond generic fog navigation. Juvenile migration is a locality-specific case study, not a universal daily route.

Coverage: all four assigned roster IDs and exact scientific identities reviewed; feeding, refuge/rest, construction/care, communication, life-stage appearance and habitat use considered. Source rechecks distinguish direct observation, isotope inference, species accounts and game interpretation. This pass adds no runtime changes and reports no browser, integration, Windows or release-validation success.
