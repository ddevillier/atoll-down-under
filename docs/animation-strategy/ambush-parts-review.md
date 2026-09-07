# Bottom ambush fish and lure curiosity

Wobbegong, painted frogfish and longsnout flathead now use independently posed painted fins and tails. Wobbegong and flathead have gentle rear-body movement; frogfish retains a rigid body with a separately hinged lure. Frogfish and flathead lower jaws respond to actual feeding preparation and recovery. The wobbegong's fringed snout remains intact without a separate jaw. There are now 44 species on the continuously updated painted-part path. Cuttlefish and original image bytes remain unchanged.

## Local interaction

Hungry NPC frogfish display their lure briefly during the existing refuge-rest routine. Nearby suitable fish without a higher-priority activity can approach a cautious observation berth. The player's existing six-second Space ability drives the same lure animation and curiosity. These timings and distances are authored gameplay choices; this is not a quantitative biological model. No additional original-game research was used.

Curiosity no longer reuses a meal target. The old player-only lure assigned the player as prey's target, which was unsafe to extend to NPC hosts because ordinary targeting can initiate consumption. The new approach leaves the meal target empty and grants no food, damage or healing. Meals, escape and cleaner service take priority; the display and response end on interruption. Old saved player-lure aliases are released before diet checks. No new persistent relationship is added to saves.

The initial implementation excluded satiated visitors. An 80-seed search, including eleven communities with NPC frogfish, found displays but no interaction within ninety seconds per community. Allowing otherwise unoccupied, recently fed fish to investigate produced a natural episode in seed 25 at 54.52 seconds. Both desktop captures retain all nineteen generated NPCs and their simulated positions: frogfish 165 displays while peach fairy basslet 155 approaches with no meal target.

## Visual review

Three source paintings, three initial full-renderer cruise/settle/turn/feed strips and six ordinary mouse-driven Practice meal views were inspected at 1600x900 and 1024x768. Initial wobbegong inspection exposed an empty triangle above the pectoral fin. Its hinge and adjacent-painted underlay were corrected; one confirmation strip shows the joined root without that gap. Some ordinary captures predate this correction and the lure integration.

The lure phase sheet shows a moving stalk and bulb with a stable head. Two natural NPC interaction views were inspected: the hovered basslet's **Watching a lure** label clears both animals. The frogfish and its fine appendages blend strongly into the busy coral, particularly at 1024px. A welcome toast persists in these accelerated-simulation captures and overlaps a shelter caption in the smaller view; it is not evidence of normal toast duration. Fine-detail readability and uninterrupted normal-speed perceptual acceptance remain open. Still strips and unwatched recorded videos do not establish full animation acceptance.

## Verification and scope

All 273 unit tests and six targeted browser scenarios pass. They cover the lure's player ability and expiry, naturally generated NPC curiosity, meal/cleaning priority, legacy aliases, save replay, death and travel, feeding jaw pixels and protected eyes, all 44 painted-part placements, motion with the old mesh budget exhausted, pause/reduced motion and live preview controls. Pressure checks record 26 bites and zero deaths across 110 scenarios, matching the previous front with unchanged initial populations. Runtime source hashes are recorded.

Evidence is in `artifacts/ambush-parts/`: `unit.log`, `browser.log`, `pressure.json`, `confirmation/`, ordinary captures and `lure/`. The live comparison includes **Bottom ambush fish**. Native performance, complete roster acceptance, precise substrate contact and combined Windows delivery remain open. No new archive was created.
