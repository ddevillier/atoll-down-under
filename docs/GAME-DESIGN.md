# Implementation design

## Learning surfaces

The field guide includes a navigable food web computed from the current catalog and diet/size/armor rules. Arrows run from food to eater. Selecting a connected creature recenters the web. This is labeled as a model, not a measured natural food web.

Four expandable Reef life lessons introduce coral polyps and symbiosis, plankton, sponge filtration, and grazing. Each includes a comparison question, the simulation's limits, and a named primary source. References are recorded in `LIFE-SCIENCE-SOURCES.md`. Field notes record actual inspected simulation behavior. Pausing for observation freezes both movement and sprite/particle animation.

## Reef presentation

1600 × 900 logical canvas, maintained at 16:9. Desktop content scales without exposing extra world area on ultrawide displays. Nine hand-composed scene paintings have different habitat silhouettes. Day and night change populations and soundtrack rather than visibility. A small triangle identifies the player's fish. Pause/Inspect labels interactive organisms and shelter areas.

## Simulation

The original Windows blackspotted puffer entry confirms coral among its foods. Pufferfish now use coral patches in addition to their existing menu, under the same shared player/NPC feeding rules. Older saved puffers receive only the coral diet addition; custom diets and saved reef populations remain intact. The goby and squirrelfish retain their original guide menus even where modern natural-history sources describe broader diets. See SPECIES-CORRECTIONS-PASS-3.md.

Food and animal hit areas share nearest-center selection for both inspection and meal clicks. A nearby animal's larger hit area no longer automatically overrides a direct food-patch click; exact ties favor the foreground animal. Existing click-area sizes and feeding rules are preserved. See FOOD-SELECTION-REPAIR.md for the census and interaction tests.

The engine advances in fixed 1/60-second steps. Species definitions contain diet tags, movement, size, activity, ability, parasite requirements, prey type and defensive traits. Feeding combines explicit diet acceptance with size/armor checks. Food clicks acquire a target and initiate an approach; food rewards arrive only on contact. Moving the cursor releases that target and returns swimming control immediately. Clicking empty water also cancels the approach and swims to that position. Observation pauses do not accept movement or meal commands. Rejected food wastes energy. Poison also costs health and points.

The current fish's diet stays visible beside its name. A selected meal receives a following outline and name tag, and the status strip explains how to steer away. If another animal consumes that meal before arrival, the approach stops with a single message; the player can immediately choose another meal or swim elsewhere. A successful meal shows the energy actually gained after the meter's cap, with a neutral "Meal taken" label when less than one point is gained. Renewable patches visibly shrink as they are eaten; plankton clouds also lose particles before depletion and regrowth. Selection areas, nutrition, scoring and regrowth timing retain their existing values. Observation freezes feedback animation and reduced motion keeps meal labels stationary. These changes apply to existing saves without starting a new dive.

Listed crab and snail diets allow shells smaller than 77% of the eater's model body size. Larger shells, spiny urchins and armored fish keep the existing stronger-jaw gate (Crushing jaws or body size at least 100), as well as diet membership and the separate fish-prey size limit. These are gameplay thresholds, not biological measurements. The rule makes all six previously blocked choices usable: Sixbar wrasse/snail, Squirrelfish/crab, Spotted pufferfish/snail and crab, Cuttlefish/crab, and Oriental sweetlip/snail. Player feeding, NPC foraging and the computed food web share the same eligibility function. Rejection messages distinguish the wrong diet, excessive size and armor.

The original Windows lionfish information resource confirms crab as food alongside fish and shrimp. Lionfish now include crab in the shared diet model. Existing saved lionfish receive this one correction on restoration without regenerating populations or changing RNG; custom fish retain their configured diet. Activity periods and predator immunity are unchanged. The original resource references and remaining species mismatches are recorded in ORIGINAL-ROSTER-LEDGER.md.

The player initially has an undrained protected state. Swimming within the arrival habitat preserves protection; eating, using an ability, or changing sections ends it. Movement costs more energy than stillness. Health decreases with parasites for susceptible species. Waiting near the active period's cleaner restores health after a short cleaning interaction. Small fish can hide while stationary in scene-specific shelter zones. Moving reveals them. Predators remember an active chase at section transitions; wrapping occurs horizontally, with hard top and bottom boundaries.

Steering within 24 logical pixels of a water edge aims at that boundary, making section travel usable beside the HUD without requiring a near-exact pixel. One unchanged edge command enters one habitat and stops at arrival; subsequent cursor movement steers again. Clicking food near an edge still targets that food. Turning uses the shortest angular difference even after many complete rotations, for the player and for non-player feeding, cleaning and schooling. Speed and species agility remain distinct.

A pursuing animal crosses with the same position relative to the player, retaining its pursuit/rest state. If it is still outside the new painting, it swims through the intervening distance rather than being clamped instantly onto the edge. A pursuit that expires during entry becomes a calm arrival at cruising speed. This does not grant fresh protection or reset a chase. The entry state persists in saves; existing saves gain the steering corrections immediately and use the new crossing behavior on their next transition.

NPCs forage, hunt smaller suitable creatures, flee threatening player fish, return to cleaner stations, and repopulate after consumption. Renewable stationary food regrows after depletion. Population and food state persist in the save. Off-screen sections retain their state rather than running a second independent simulation.

Each new dive has authored feeding sites matched to the nine paintings. Plankton occupies open-water channels; terrace food occurs at different heights; meadow plants and worms spread over the shallow floor; sponge feeding is more prominent in the grotto. The kinds and amounts differ by habitat. Depleted patches regrow at the same location so a player can learn a feeding route and return to it. Food nutrition, diet rules and regrowth timing retain their existing values.

Crabs, lobsters, snails, stars, urchins and anemones occupy short routes on sand or individual ledges. Crawlers turn at route ends and graze suitable nearby patches; stationary residents remain attached. They remain selectable and edible under the usual diet rules, and replacements return on their route. A non-player seahorse occurs beside the daytime meadow's seagrass. Initial community selection prefers local species but stops favoring a species once three copies are present, when other eligible species remain. The separate schooling groups and two-hunter population limit remain in place.

Non-hunting forager selection uses nine scene-specific preference lists, with separate day/night preferences filtered through the existing activity rules. Preferred species have weight 8, other broad-habitat residents weight 2, and eligible visitors weight 1. This differentiates terrace coral residents, cathedral browsers, meadow grazers and other exploration encounters without raising population ranges or changing hunter selection. Night variety is constrained by the four eligible nighttime forager species in the current catalog. See LOCAL-COMMUNITIES.md for authored mixes and regression evidence.

Existing saves preserve their food coordinates, depletion and populations. Older bottom residents attach to the nearest local substrate route when play resumes. New food layouts, community variety and the meadow seahorse require a new dive; loading an earlier save does not repopulate it. These placements and routes are authored gameplay abstractions, not measured animal behavior.

Routine NPC feeding recognizes both the cleaner wrasse and cleaner shrimp as partners and leaves them out of food selection. An old saved feeding target aimed at a cleaner is released; parasite-driven cleaning visits retain their target. This is a gameplay convention supporting observable cleaning relationships, not a claim that cleaners are never prey in nature. The player's deliberate food choices still follow the usual diet rules. If a player eats a cleaner, its replacement returns at the established station after the existing respawn interval. Cleaner stations and health recovery otherwise keep their existing rules.

## Abilities

Burst swim; raised spines; camouflage; ink; inflation; chemical defense; tail sting; electric pulse; sonic pulse; startling flash; and lure. Active use costs eight energy, requires at least twelve energy, and has a twelve-second recovery. The effect lasts four seconds, or six for lure/camouflage. Defenses interrupt or deter attacks; lure attracts edible fish; camouflage works while still. These are independently balanced game effects.

Crushing jaws is always active while eating suitable food. It has no activation cost, cooldown or stronger-bite button; the HUD presents it as a passive trait. Its Create-a-Fish budget cost remains 150 points. Selecting it adds coral polyps to a created grazer's diet, or crabs, snails and urchins to a created hunter or omnivore's diet. The live diet preview shows these choices before entering the reef. Other traits retain their existing diets. Older saves keep the current dive, body, energy and food state; saved crushing activation/cooldown timers are cleared, and a created fish's diet is updated from its saved configuration.

Shelter inspection outlines use the same circular radius as simulation detection and label whether the current fish meets the existing size cutoff. Status feedback distinguishes arriving, settling into cover, hidden, and unable to fit. Active ability use is included in the entry-protection explanation. These messages do not change hiding delay, protection or camouflage behavior; see SHELTER-FEEDBACK.md.

## Modes and scoring

Practice selects any of 55 playable species and has no score. Challenge selects four increasing size bands and requires 5,000 / 10,000 / 15,000 / 20,000 stage points. Tournament visits every playable species once, ending as the Great White Shark, with 5,000 points per life. Whole prey earns 1,000; renewable food earns 500; survival outside hiding earns eight points per second; stage completion earns 1,500. Poisonous meals deduct up to 500 from total score and current-life progress independently, with both floored at zero. The feedback reports the actual total points lost. Practice remains unscored. Continuing after death resets points and stage progress while retaining the current life. Local rankings can record finished or lost scored runs.

Create-a-Fish offers a 1,600-point budget: body size, speed, endurance, agility, ability, active period, color, diet, and name. Dominant attributes choose one of three base silhouettes; the renderer recolors the created fish. Overspending disables entry. The created fish uses the same survival simulation and can be saved.

## Interface and persistence

The Windows application starts in native fullscreen on each launch. F11 toggles the native window state, with repeat presses while held ignored. File, Settings and the dive toolbar expose the same action and update their labels after changes. Escape retains pause/inspection behavior. The sandboxed desktop bridge exposes only fullscreen state, toggle and change notifications. Browser development preview uses the browser Fullscreen API.

Field guide: all 64 creatures, interactive-food descriptions, and glossary. Dialogs pause the simulation. Keyboard focus remains within open dialogs and survives list updates. Separate audio levels, optional verbose feeding dialogs, decorative-motion reduction and hints are stored locally. Three manual save slots and a last-dive save use versioned JSON including RNG, ecosystem, mode and player. Invalid saves and unavailable storage have visible recovery messages.

The HUD's nine-square locator opens an illustrated reef map; M provides the same action. Its three-by-three arrangement matches the actual connected habitats and uses the existing scene paintings. Current, visited and unvisited places have text labels. Selecting a habitat shows food categories currently present and suitable for the player's diet, size and defenses; depleted food, dead animals, cleaner partners and harmful poisonous prey are omitted from those suggestions. Off-screen habitat state can change when the player returns, so this is a planning aid rather than a reserved meal.

Guide my swim sets an optional destination and returns to play. The status strip names the next edge and habitat, rerouting after a detour; swimming still follows the player's cursor. Planning changes no position, energy, protection or score and provides no automatic movement. Arrival clears the destination and reports the visited count. Saves retain the marker, older saves load without one, and a new life clears it. The map supports spatial arrow-key focus, Enter selection, ordinary Tab navigation and Escape to return. This illustrated planner is a modern addition to the original game's small section locator and cursor-edge exploration.

## Reconstruction boundaries

The original manual and screenshots guide behavior and composition. No exact executable analysis or historical numerical verification is claimed. The catalog is an independently selected reef ecosystem rather than an assertion that every original roster entry appears. There is no continuous size growth, procedurally replaced reef, multiplayer, crafting or online service.

## Exploration-first revision

Community generation uses nine population ranges, with quiet valleys in Pearl Sands and Quiet Grotto and busier populations in the terrace and cathedral. Each section starts with one fish-eating hunter and a 25% chance of a second; Outer Blue alone has a 45% second-hunter chance. The ceiling remains two. See POPULATION-REVISION.md for counts and evidence. Migrating animals can change that population. Hunters choose the nearest suitable food within their sensing range, using the same rule for player and non-player prey. Grazers consume renewable plants and other suitable food too. Feeding is followed by 45–80 seconds of digestion. Pursuits end after six seconds and are followed by a 15-second rest. These durations are provisional tuning values, not recovered original constants or real-world biological measurements.

Inspection records the organism's name, activity, habitat, period and relationship to the current fish. Field notes persist with saves and deduplicate repeated observations of the same behavior in the same habitat. Initial protected swimming follows the original manual's opportunity to inspect the reef before eating or leaving an area. All major existing food, health, cleaning, shelter and mode systems remain available, but their presentation is being revised around learning.

Non-player fish also accumulate parasites and visit cleaning stations. One client is cleaned at a time, with the player given priority during an active cleaning interaction. Clients wait, receive cleaning over three seconds, and return to the reef. Inspection exposes these behaviors for observation and field-note recording.

NPC predators use the same avoidance rule for poisonous player and non-player species. Fatal meal poisoning is attributed to the food that caused it. Sprite extraction uses full-atlas connected components rather than cropping a grid first, preserving long fins and appendages. Motion profiles are stylized by body family and smoothly interpolate turns; these are artistic approximations, not scientific swimming models.
# Observable schooling

Daytime open-water sections include three to five nearby members of one schooling species, depending on habitat and seed. If the player selects a schooling species, these groups match it. Idle group members align, maintain space and stay near each other; feeding, avoidance and cleaner visits take precedence. A matching player fish can swim alongside them without automatic steering being applied to the player. Inspect records the schooling behavior in field notes. This is a simplified model, not a measured simulation of species-specific schooling or a claim about an original-game mechanic. Existing saves retain their populations; eligible fish use the new behavior when they have nearby same-species neighbors.


## Species natural history

The Creatures tab offers expandable natural-history text for all 64 researched catalog creatures (including explicitly labeled group entries). Scientific names are searchable; maximum natural lengths, when sourced, are distinct from sprite size. Readers can compare anatomy, habitat, parental care and ecological relationships, with source URLs available offline. Brief game rules remain below the expansion. A sticky species browser retains navigation while the entry scrolls. SPECIES-FACTS-LEDGER.md tracks each entry; ambiguous labels retain explicit identity limits and named examples. Original-roster parity remains unverified.


## Health, cleaning and recovery

The health meter combines parasite effects, poison damage and bite injury. Poison and bite losses are tracked separately; the remaining deficit is attributed to parasites. Cleaning restores only that parasite portion. It does not erase poisoning, injuries or the recorded cause of harm.

A fed player (Energy at least 50) recovers 0.4 health points per simulation second from poison/bite damage after a 10-second delay following the latest harmful encounter. Recovery is divided proportionally between the two damage types and does not remove parasites. This is a deliberately gentle gameplay abstraction, not a biological rate or a treatment claim. Pausing freezes recovery along with all simulation time. The health meter exposes a breakdown through its hover text and accessible value description.

Save files persist damage and recovery delay. Older saves lack the breakdown: a recorded poisonous meal's existing deficit is retained as poison damage; unlabelled historical loss keeps its former parasite interpretation. The exact causes of older aggregate health loss cannot be reconstructed. New sessions and newly recorded damage use the separated rules.


## Small-creature readability

Widescreen presentation gives small creatures a larger display width (`max(size, 28 + 0.75 × size)`) while preserving ecological size for diet, speed, shelter and feeding rules. Large creatures retain their existing display width. Selection hit areas and inspection hover markers use the same display-size helper. This is a readability treatment, not a change to physical size or a claim of exact original sprite proportions.

Paused inspection presents a close-up of the selected animal using its actual atlas illustration, alongside its activity, diet and relationship. The panel scrolls within the reef area at small desktop sizes. Transient dive messages are suppressed while a selected animal is being inspected so they do not cover the portrait. The original scene composition and current nine background paintings remain intact.


## Splash screen

The splash follows the original Windows title-screen composition in a widescreen painting: centered three-line stone title, open deep-blue water above, leaning wreck at left, upper-right light, bottom coral and swimming fish. It uses new project art and Atoll branding. The old left-aligned heading and large mode stack are replaced by a compact File / Game / Help strip. File contains saves, reef rulers, settings and an available current-dive continuation; Game contains the four modes; Help contains the field guide and instructions. Menus support pointer, arrows and Escape. Opening a modal makes the splash bar inert and puts it below the modal veil.
