# Original Create-A-Fish: direct emulator observations

Observed 2026-09-10 in an independent Codex in-app browser tab at https://classicreload.com/play/win3x-odell-down-under.html. This is the Windows 3.x version running through the site's DOSBox emulator. Research used visible screenshots and keyboard input, not game code or reconstructed mechanics. The purpose is to identify useful design principles, not prescribe a historical clone.

## What was directly tested

Start → boot → Alt+F, Return → choose Create-A-Fish with Down twice and Return. The editor opens with name `My Fish`, green appearance, Day active, all three statistics at zero, Small body costing 100, None ability costing 0, and 1,400 points remaining. The accounting implies a 1,500-point total for this run.

The editor presents Speed, Endurance and Agility sliders, five bright color swatches, Day/Night radio buttons, name input, size and special-ability lists, a persistent remaining-points panel, and an animated underwater preview. The preview fish swims back and forth while the player edits.

| Direct change | Displayed cost | Remaining with zero statistics and no ability | Visual response |
|---|---:|---:|---|
| Small | 100 | 1,400 | Small green fish |
| Medium | 400 | 1,100 | Same fish appearance visibly enlarges |
| Large | 800 | 700 | Fish enlarges again |

Changing size did not change the displayed Speed, Endurance or Agility values; each stayed at zero. Large was the final choice reached by Down. This test does not establish exact movement or ecological advantages of each body.

| Ability selected with Large body | Displayed ability cost | Points remaining |
|---|---:|---:|
| None | 0 | 700 |
| Sonic Blast | 200 | 500 |
| Electric Shock | 400 | 300 |
| Squirt Ink | 600 | 100 |

Down again at Squirt Ink left it selected. Switching Day to Night did not change the remaining 100 points. No other ability choices were observed in this keyboard traversal. The statistic sliders were visible but their increments and caps were not successfully manipulated; do not infer them from this session.

## The actual custom dive

I launched Large / Squirt Ink / Night / green / My Fish with all three statistics at zero and 100 points unspent. Return accepted the configuration and entered the reef without a validation dialog. Thus this version permits an under-spent build and zero-valued statistics, at least for this combination.

The reef immediately displayed the same large green fish, a dense illustrated coral environment, other creatures entering view, and a narrow bottom HUD with Info, map-like and day/night icons, segmented Energy and Health meters, and Score. Recorded scores increased from 117 to 372, 702, and later 1,141 during the session while the fish remained near the cursor. Energy declined visibly, and health later declined as well. These observations establish continuing pressure and scoring; they do not isolate scoring formulas or prove successful eating.

Arrow inputs did not demonstrate controlled navigation. Space was sent after selecting Squirt Ink, but a distinct ink effect or predator reaction was not verified in captured frames. This is an input/capture limitation, not evidence that the ability lacks an effect.

## Instructions read inside the running original

Help → Instructions explicitly describes mouse-follow movement, clicking a target to eat, stopping in front of a cave or behind a plant to hide until moving again, Space to use a special ability, and approaching a suspected cleaner then stopping to be cleaned.

Its Scoring page describes discovering edible fish, threats and cleaners; survival, eating and efficient energy use earn points and progression, while poor food choices, waste and neglecting cleaning cost points and survival chances. A later Information page says Info or Escape freezes action so the player can identify reef dwellers, with a Field Guide available through Help and Continue to resume. These are statements from original in-game help, distinguished from actions independently verified above.

## Implications for a synthesized fun roadmap

1. The editor makes opportunity cost visible immediately. Bigger bodies consume the same budget as special tools and statistics; an affordable powerful ability means giving up something else. Preserve the understandable tradeoff, then make its play consequences much clearer than a bare number.
2. Appearance continuity matters: the moving preview becomes the actual reef creature. A live, responsive preview can establish ownership before the dive and help players anticipate size and motion.
3. The strongest original loop appears to combine creature knowledge with survival decisions: pursue food, avoid threats, seek cleaning, choose hiding or a special escape. A modern custom fish should open different decisions in that loop rather than merely multiply scores.
4. Info pause offers a promising bridge between curiosity and danger. Inspection can answer why a choice worked and supply a concrete next experiment without forcing a separate reference-reading session.
5. The original accepts this imperfect build immediately. For a modern experiment loop, make a weak build understandable and cheap to revise; avoid treating exhaustive point allocation as a prerequisite for play.

## Limits and evidence

Screenshots were inspected throughout and remain in the agent's tool transcript (initial editor, each size, each ability cost, Night build, custom dive, native help pages). No screenshot file was persisted by this subtask. The browser accessibility tree exposes the host page but not native Windows controls inside the emulator. Coordinate clicks did not relocate the emulated cursor as expected; keyboard navigation reliably changed dropdowns/radios and opened menus. A successful short custom dive was observed, but controlled pursuit, feeding, hiding, cleaning, ability effectiveness, and long-run outcomes were not verified. No claims about these should be elevated from help descriptions to direct play evidence.
