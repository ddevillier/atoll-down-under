# Implementation design

## Learning surfaces

The field guide includes a navigable food web computed from the current catalog and diet/size/armor rules. Arrows run from food to eater. Selecting a connected creature recenters the web. This is labeled as a model, not a measured natural food web.

Four expandable Reef life lessons introduce coral polyps and symbiosis, plankton, sponge filtration, and grazing. Each includes a comparison question, the simulation's limits, and a named primary source. References are recorded in `LIFE-SCIENCE-SOURCES.md`. Field notes record actual inspected simulation behavior. Pausing for observation freezes both movement and sprite/particle animation.

## Reef presentation

1600 × 900 logical canvas, maintained at 16:9. Desktop content scales without exposing extra world area on ultrawide displays. Nine hand-composed scene paintings have different habitat silhouettes. Day and night change populations and soundtrack rather than visibility. A small triangle identifies the player's fish. Pause/Inspect labels interactive organisms and shelter areas.

## Simulation

The engine advances in fixed 1/60-second steps. Species definitions contain diet tags, movement, size, activity, ability, parasite requirements, prey type and defensive traits. Feeding combines explicit diet acceptance with size/armor checks. Food clicks acquire a target and initiate an approach; food rewards arrive only on contact. Rejected food wastes energy. Poison also costs health and points.

The player initially has an undrained protected state. Swimming within the arrival habitat preserves protection; eating, using an ability, or changing sections ends it. Movement costs more energy than stillness. Health decreases with parasites for susceptible species. Waiting near the active period's cleaner restores health after a short cleaning interaction. Small fish can hide while stationary in scene-specific shelter zones. Moving reveals them. Predators remember an active chase at section transitions; wrapping occurs horizontally, with hard top and bottom boundaries.

NPCs forage, hunt smaller suitable creatures, flee threatening player fish, return to cleaner stations, and repopulate after consumption. Renewable stationary food regrows after depletion. Population and food state persist in the save. Off-screen sections retain their state rather than running a second independent simulation.

## Abilities

Burst swim; raised spines; camouflage; ink; inflation; chemical defense; crushing bite; tail sting; electric pulse; sonic pulse; startling flash; and lure. Active use costs eight energy, requires at least twelve energy, and has a twelve-second recovery. The effect lasts four seconds, or six for lure/camouflage. Crushing also grants access to armored prey. Defenses interrupt or deter attacks; lure attracts edible fish; camouflage works while still. These are independently balanced game effects.

## Modes and scoring

Practice selects any of 55 playable species and has no score. Challenge selects four increasing size bands and requires 5,000 / 10,000 / 15,000 / 20,000 stage points. Tournament visits every playable species once, ending as the Great White Shark, with 5,000 points per life. Whole prey earns 1,000; renewable food earns 500; survival outside hiding earns eight points per second; stage completion earns 1,500. Continuing after death resets points and stage progress while retaining the current life. Local rankings can record finished or lost scored runs.

Create-a-Fish offers a 1,600-point budget: body size, speed, endurance, agility, ability, active period, color, diet, and name. Dominant attributes choose one of three base silhouettes; the renderer recolors the created fish. Overspending disables entry. The created fish uses the same survival simulation and can be saved.

## Interface and persistence

Field guide: all 64 creatures, interactive-food descriptions, and glossary. Dialogs pause the simulation. Keyboard focus remains within open dialogs and survives list updates. Separate audio levels, optional verbose feeding dialogs, decorative-motion reduction and hints are stored locally. Three manual save slots and a last-dive save use versioned JSON including RNG, ecosystem, mode and player. Invalid saves and unavailable storage have visible recovery messages.

## Reconstruction boundaries

The original manual and screenshots guide behavior and composition. No exact executable analysis or historical numerical verification is claimed. The catalog is an independently selected reef ecosystem rather than an assertion that every original roster entry appears. There is no continuous size growth, procedurally replaced reef, multiplayer, crafting or online service.

## Exploration-first revision

Community generation now selects at most two fish-eating hunters per newly populated section, alongside small foragers, grazers and other residents. Migrating animals can change that population. Hunters choose the nearest suitable food within their sensing range, using the same rule for player and non-player prey. Grazers consume renewable plants and other suitable food too. Feeding is followed by 45–80 seconds of digestion. Pursuits end after six seconds and are followed by a 15-second rest. These durations are provisional tuning values, not recovered original constants or real-world biological measurements.

Inspection records the organism's name, activity, habitat, period and relationship to the current fish. Field notes persist with saves and deduplicate repeated observations of the same behavior in the same habitat. Initial protected swimming follows the original manual's opportunity to inspect the reef before eating or leaving an area. All major existing food, health, cleaning, shelter and mode systems remain available, but their presentation is being revised around learning.

Non-player fish also accumulate parasites and visit cleaning stations. One client is cleaned at a time, with the player given priority during an active cleaning interaction. Clients wait, receive cleaning over three seconds, and return to the reef. Inspection exposes these behaviors for observation and field-note recording.
