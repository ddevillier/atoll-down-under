# Original ability audit and implementation

September 10, 2026. Scope: every named special ability in the original species catalogue and Create-A-Fish, including the non-playable cleaners. This is a gameplay remake; timing, energy costs and balancing are independently authored.

## Sources and coverage

The Windows original was opened in the [ClassicReload emulator](https://classicreload.com/play/win3x-odell-down-under.html). The creator's complete ability menu and species information panels were inspected directly. Screenshots are in `artifacts/original-abilities/`: `create-list.png`, `sharp-spines.png`, `inflating.png`, `tail-sting.png`, `mimic.png`, `ink.png`, and `illuminate.png`.

The complete [GameFAQs species walkthrough](https://gamefaqs.gamespot.com/mac/927060-odell-down-under/faqs/42416) was also read in the browser, including the frogfish, short-tail electric ray and both cleaners. Windows reference material corroborates the catalogue: `C:/Users/Daniel/Desktop/odell-reference/INFORES.DLL.strings.txt` and the original User's Guide, pages 7–10. The guide is a Macintosh account; the emulator is Windows. This cross-check identifies eleven distinct ability families, treating Dance/Dancing as one and ignoring None.

Original-game evidence establishes the names, descriptions and intended interactions. It is not an exhaustive adversarial playtest of every original ability: browser pointer input does not reliably reach the emulated mouse. Mechanical timing and immunity claims below refer to our implementation, not measured original timings. The original's natural-history text sometimes describes more than its observable simulation; plankton attraction is an explicit modernization of the illumination concept.

## Findings and delivered behavior

| Original ability | Before this pass | Current implementation and proof |
|---|---|---|
| Sonic Blast | Activated pulse existed | Predator/pursuit-specific release and four-second stun; harmless fish and cleaners spared. Distinct expanding water waves. |
| Electric Shock | Activated stun existed | Four-second local discharge affects fish including prey, with cleaners spared. Real attacks provoke NPC discharge; player movement and actions respect stun. Branching electrical water effect. |
| Squirt Ink | Activated defense existed | Releases actual nearby pursuits, delays attackers and prevents reacquisition during the four-second defense. Visible dark cloud. |
| Poisonous | Missing as a selectable passive trait; chemical cloud was a different mechanic | Creator's Poisonous body sets persistent toxicity, deters predators and costs no activation energy. It does not make toxic food safe. Existing chemical cloud remains a separate compatible choice. |
| Sharp spines | Defense existed; response was indiscriminate | Actual predators are deterred. NPC defenses cannot be bypassed by clicking again. Painted tail/fin display; custom fish expose a spiny dorsal. |
| Inflating | Body inflation and active defense existed | Player and NPC inflation stops pursuit and prevents bites during the defense. Existing painted body expansion retained. |
| Tail sting | Shared broad area stun | Close defense uses a 115-unit radius, versus 230 for other pulses. Only predators/pursuers are stunned. Ray's painted tail whips; custom tails respond too. |
| Illuminate | Light organ and predator flash existed; food attraction missing | Active organ draws existing nearby plankton toward it, then releases it to drift back. No food is manufactured. Positions/origins survive portable saves. Custom fish also show a light organ. |
| Angling | Implemented | Six-second player lure and natural NPC lure episodes attract eligible prey; existing painted lure, approach and expiry tested. |
| Dance / Dancing | Cleaning service existed; explicit idle invitation movement missing | Stationary available cleaners advertise with a small pitching/sculling dance. Dance stops during service or stun and respects reduced motion. Both playable cleaner service loops remain intact. |
| Imitate Cleaner | Missing | Creator hunter can carry a cleaner-like stripe, advertise for six seconds, invite a naive host and take a nourishing nonlethal nip. Host survives, takes a small injury, flees and remembers that mimic for sixty seconds. Frogfish and sufficiently large hunters see through the disguise. No cleaning or healing credit is granted. |

The mimic ability is fully playable through Creature Workshop; this pass does not add a separately illustrated scientific Cleaner Mimic Blenny species. Cosmetic anatomy choices remain separate from diet and ability rules.

Active abilities use the established eight-energy charge, twelve-second recovery and minimum twelve energy. Passive traits do not. Defenses are temporary: predator density and spawn rates were not reduced. NPCs recover defense energy over time and can defend later encounters. Hidden, dead and out-of-range actors are excluded. Existing targets revalidate defenses, toxicity and cleaner relationships before feeding.

Cleaner healing continues our established parasite-specific model. It does not instantly repair poisoning or bite wounds, unlike the older game's broader health restoration. Exact original exploits, blanket immunities and undocumented numeric rules are not reproduced.

## Implementation and verification

`src/ability-rules.js` owns activation, pursuit release, mimic trust/memory, nonlethal nips and plankton attraction. `src/ability-visuals.js` owns invitation poses and bounded water effects. Simulation, diet, creator validation, save validation and rendering use those rules. Existing audio effects are reused with quieter NPC playback; sound preferences still apply.

Motion purpose: invitation makes the false-cleaner loop legible; exposed organs and actual painted-part movement explain defensive state. Effects are limited to active actors in the current section. Custom painted layers use the existing twelve-entry cache. Reduced motion preserves visible active states while removing decorative movement.

Evidence:

Validation at this checkpoint: 400/400 unit tests; 8/8 ability/flashlight/lure browser checks; 16/16 creation/anatomy/cleaner regression checks (three overlap the ability run). Source-native Windows smoke passed, including saved mimic memory, passive poison and fullscreen toggling. Packaged build verification and archive hashes are recorded separately in the release receipt.

- `tests/original-abilities.test.mjs`: activation scope, cooldown/expiry, passive toxicity, safe/unsafe meals, mimic diet and host survival, memory persistence/expiry/corruption, NPC attacks, repeated defenses, stun gates, lure and plankton behavior, reduced-motion dance.
- `tests/e2e/original-abilities.spec.js`: ordinary creator controls; Space activation for seven defenses; mouse-driven invitation and nip; painted state differences at fixed coordinates; reduced motion.
- Existing flashlight, lure, cleaner, creation and anatomy browser regressions cover adjoining flows.
- `artifacts/original-ability-visuals.png` and `original-ability-pixels.json`: fixed-position body/effect evidence. The light-organ test separately verifies that the eye and surrounding painting do not move.
- Generated-community ambush test now reassesses available waiting spots every twenty seconds. This preserves meaningful NPC defenses while verifying that all four ambush journeys can still succeed through ordinary movement and repeated attempts.

## Five future abilities — proposals only

These are game concepts, not implemented features or claims that every existing species performs the behavior.

1. **Current surfing:** read a moving current ribbon, enter at the right angle, and ride it with reduced energy use. Leaving at the right moment reaches an otherwise costly feeding route.
2. **Bubble curtain:** shape a short curved barrier that redirects drifting food or small fish. Placement matters; it guides movement rather than stunning everything nearby.
3. **Tool anvil:** carry a suitable shell to a hard reef surface, position it, and open it with a short sequence of deliberate strikes. A preparation loop distinct from passive crushing jaws.
4. **Alarm relay:** warn nearby companions of a genuine approaching hunter. A well-timed signal helps the group retreat; repeated false alarms temporarily reduce its response.
5. **Egg guardian:** establish a small nursery, fan the eggs and keep the site clear while making brief feeding trips. Success depends on balancing care, food and safe return rather than combat.
