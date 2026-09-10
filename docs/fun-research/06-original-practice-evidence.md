# Original Practice: choice, observation and habitat evidence

Independent research agent 6, observed 2026-09-10. Research only; no runtime changes.

## Method and source

I ran the original in a separate in-app browser session at [ClassicReload's Windows emulator](https://classicreload.com/play/win3x-odell-down-under.html), using visible screenshots and keyboard/mouse input. The boot panel identified **Odell Down Under Version 1.0, copyright 1994 MECC**. The host's initial loading illustration is not evidence of my game state; observations below begin after the actual boot panel. Screenshots were inspected in the tool transcript, not saved as distributed game assets.

I also read the other agents' [manual evidence](01-manual-mechanics.md) and [Create-A-Fish session](04-original-create-play.md) to distinguish independent observations from corroboration. This is a bounded Practice investigation, not a full playthrough or balance benchmark.

## Directly observed

**Practice was explicitly selected.** File → New Game presented Challenge, Tournament, Create-A-Fish and Practice. Three Down presses selected the Practice radio, verified before accepting. The resulting Pick a Fish dialog initially showed Achilles Tang; later I selected Black and White Spinecheek and entered its reef. The bottom HUD explicitly read **Practice Game**, in the location where the custom session's HUD displayed a numeric score.

**Choosing a body gives an immediately relevant briefing.** Achilles Tang's entry displayed its scientific name, eight-inch length, daytime activity, algae/grass diet, larger-fish enemies and sharp-spine ability, alongside a swimming preview. Black and White Spinecheek's entry displayed the same length, anytime activity, invertebrate/plankton diet and larger-fish enemies. Its paragraph described staying near branching coral for refuge and sometimes forming large schools. These are original interface descriptions, **not verification that the game's NPCs actually school**, and not a substitute for modern biological fact-checking.

**The preview conveys a living animal.** Across captures, the selected creature crossed its small underwater preview and changed facing. The preview background was pale blue with little foreground obstruction. The main reef was much more visually layered. I did not measure animation frames or articulation, so these screenshots do not support a claim of sophisticated rigging.

**The Spinecheek dive began in a bright planted habitat.** A broad cream-colored sandy field occupied much of the view, with tall branching green plants arranged in separated clumps, dark rocks along the top and bottom, and scattered brightly colored reef inhabitants. This is compositionally different from the densely packed coral wall observed in agent 4's custom dive. That comparison establishes at least two visibly different habitat compositions; it does not independently verify all nine sections or transitions between them.

**Escape toggled observation successfully.** During the dive, pressing Escape changed the lower-left button from Info to Continue. The visible creatures and meter positions stayed fixed over subsequent captures while Continue was shown. A second Escape restored Info and animal positions changed again. This directly corroborates paused observation and resumption, beyond merely reading a help description. Clicking a purple reef object did not produce a verified identification panel in this session.

**Care meters remain present in Practice.** Segmented Energy and Health bars were displayed, with some Health segments visibly unfilled during the short session. I did not isolate what caused the change and cannot infer decay rates, parasite timing, initial protection duration or difficulty from this test.

## Documentary support, not independently played here

The [MECC Windows manual](https://www.myabandonware.com/download/m72w-odell-down-under), as examined by agent 1, documents preferred-area Practice starts (PDF p. 4), nine reef sections (p. 9), learning cleaner locations by watching other animals and stopping nearby (p. 10), and paused identification (p. 11). The first two help interpret the different habitat compositions; the latter two place observation inside survival rather than outside play. Feeding, cleaning, hiding, pursuit and successful region travel were **not** verified by this session.

## What this adds to the modern roadmap

1. **Species choice should promise an experience, then deliver it quickly.** The original places food, threats and a distinctive characteristic beside a moving animal before the dive. A modern version can turn that into one concrete invitation—find a feeding patch, investigate a neighbor or try a refuge—without making the player read a full guide first. This is a proposal, not a missing-feature verdict on current code.
2. **Different habitats need different play geometry.** The open sand and tall plant clumps suggest separated routes and pauses, while a crowded coral wall suggests tight inspection and refuge. The new game should make location changes alter choices, sightlines and animal encounters as well as the palette. Do not increase animal density merely to imitate the original's dense background detail.
3. **Pause can sustain curiosity rather than erase consequence.** The verified Info/Continue toggle lets the same reef serve as both an active world and a place to inspect. A modern explanation should help the player decide what to try upon resuming—for example, whether a nearby animal is a cleaner or whether a plant is edible for this body.
4. **Translate species descriptions into observable behavior.** A text entry about refuge or schooling can seed new interactions, but it is not evidence those behaviors already existed in the original simulation. The modern opportunity is to make the distinctive behavior visible and useful, with accurate factual sourcing and clear feedback.

## Limits

Coordinate input did not reliably relocate the emulated cursor, although keyboard menus and some selection changes worked. I stopped after verified mode choice, two species briefings, one Practice habitat and an observation/resume cycle rather than treating attempted clicks as completed gameplay. No predator encounter, successful meal, cleaning exchange, identification result, ecological causal relationship or child enjoyment was observed. The research supports design hypotheses; it does not validate their fun or establish current-game omissions without the separate source audits.
