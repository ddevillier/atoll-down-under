# Species activities and a reactive reef

Active scope: implement the proposed Day 1 and Day 2 work broadly, then finish progression, feedback, regression and a Windows testing handoff. The Living Reef ZIP stays preserved. This is a new gameplay work front, not another blanket animation pass.

## Required outcomes

1. **Care as a playable role.** Cleaner wrasse and shrimp can help existing NPC fish in Practice. Choose a client, approach, inspect its body and remove actual parasite damage. Steering interrupts safely. Nutrition comes from real work; bites and poison are not healed by cleaning. Waiting/helped fish react visibly. Existing cleaners and populations remain available.
2. **Different feeding decisions.** Extend grazing routes, goatfish sand searches, paired browsers, school excursions and ambush hunting. Use the existing anatomical contact, food amounts, regrowth and species diets. Each activity needs a legible goal, a consequential player action and a useful response; species coverage is not satisfied by changing the label on one counter.
3. **A locally reactive reef.** Existing neighbors respond to actual feeding/search disturbances and care activity. Schools split and recover; companions can wait/rejoin; eligible scavengers/foragers can investigate a shared opportunity; solitary and refuge species retain their own routines. Preserve behavior priorities and bounded populations rather than adding decorative swarms.
4. **Optional persistent recognition.** Connect distinct activities and care breadth to the journal. Free exploration remains useful without a mandatory quest. Existing journal/dive saves migrate, preserve progress, and reject corrupt new state.
5. **Readable and gentle.** Activity prompts and immediate feedback explain the current choice at both display sizes. Avoid compulsory hurry, repeated popups, or increased predator density. Preserve cuttlefish motion, fullscreen, pause/reduced motion and explicit narration playback. Further narration work follows finalized gameplay text.
6. **Combined handoff.** Verify actual user controls, natural generated communities, meals/resources, interruptions, save/restore, death/travel, population pressure and performance. Package and verify one combined Windows archive after these fronts are complete.

## Implementation order

First establish the cleaner role with real service ownership, contact-driven progress and interruption. Then extend the guided activities using explicit activity definitions and saved state, connecting each to the local simulation. Add journal recognition and clearer prompts alongside those finished loops. Finish with combined play/pressure checks and Windows delivery. None of these individual fronts closes the entire goal on its own.

No new original-game reference research is needed. Existing species guide sources inform the educational baseline; game timings, objectives and simplified social responses are authored design choices. Avoid introducing stronger biological claims without checking them.

Status: implementation and source/native verification complete. The final archive receipt records the delivery integrity checks.

## Current completion audit

The activity implementation covers 19 species adventures and 57 Practice choices. The following audit supersedes the historical checkpoint lists below. Delivery identity and archive verification are recorded in [the Windows receipt](WINDOWS-SPECIES-LIFE-BUILD.md).

| Required outcome | Current evidence | Still needed |
| --- | --- | --- |
| Playable care | Both roles remove real parasites; mouse controls pass at both sizes; packaged generated three-client discoveries survive portable saves (`native-species-life-report.json`) | Ready for user play feedback |
| Different feeding decisions | Six distinct activity families; generated real-meal checks, 16 completed grazing routes, and the complete 84-test browser sweep cover controls/discoveries | Tune enjoyment from ordinary play; no universal completion-time claim |
| Reactive reef | Existing NPCs respond to food, searches, companions and cleaning; 54 generated habitat/period/seed cases retain fixed populations and finite resources with 30 predator bites and replayable checkpoints | Balance evidence is sampled, not exhaustive |
| Persistent recognition | 19 discoveries and 13 badges; schema/legacy/replay checks in 314-test suite; packaged actual dive and journal file export/import, deduplication and reload persistence pass | No implementation gap identified |
| Readable and gentle | Both viewports reviewed; full browser suite and packaged fullscreen, cuttlefish context action, explicit narration, volume, reduced motion and stop-on-close checks pass | Motion feel remains a user-feedback topic |
| Combined handoff | 314 unit and 84 browser checks pass; all packaged functional checks pass; 36 native performance cases across nine habitats complete without errors; archive identity is in the receipt | Preserve previous archives and use the receipt's verified ZIP |

## Gameplay checkpoint — September 7

Implemented in the working tree, not yet in a Windows archive:

- Practice cleaner wrasse and shrimp remove actual parasite damage through body contact and receive nutrition from that work. Steering, travel, death and unavailable clients cancel safely. A requested client approaches at bounded speed, leaves an unstarted NPC station trip, and is excluded from that station's queue. Active NPC treatment cannot be stolen. Three different client species support optional discoveries; the new helping badge is tied to actual parasite removal.
- Goatfish can inspect existing sand food with their barbels. E approaches and probes for 1.5 seconds of actual contact, leaving an eight-second opportunity to eat or share. A food click handles inspection followed by eating. Steering or E interrupts; progress survives checkpoints. Cowfish retain their distinct immediate water-blowing action.
- Nearby eligible hungry foragers can investigate uncovered food, while existing meals, rest, cleaning and danger retain priority. Only one additional visitor selects the opportunity at a time. The goatfish discovery requires a player meal and an observed real NPC bite at a different site. No animals or food are spawned by these interactions.

Evidence: `artifacts/gameplay-uplift-unit.log` reports 289/289 unit checks. `artifacts/gameplay-uplift-browser.log` reports cleaner wrasse, shrimp and goatfish control scenarios passing at 1600×900 and 1024×768. The final sand-control confirmation is in `artifacts/sand-search-browser-confirm.log`. Screenshots in `artifacts/sand-search-*-probing.png` and `*-meal.png` were reviewed at both sizes; the context action now says Stop inspecting while probing. These still captures prove layout and contact placement, not continuous animation quality. Additional generated-community and station-ownership assertions are in `artifacts/gameplay-uplift-natural.log`.

A diagnostic using ordinary player steering and repeated E at the first generated sand site found actual sharing at 43.68 seconds for seed 2 and 34.13 seconds for seed 42. Seed 57 had no visitor within 120 seconds. Communities, food and hunger were not replaced or adjusted. This is evidence that local opportunity matters, and that guidance for choosing a better patch needs improvement; it is not proof of balanced completion time across habitats.

Remaining: improve opportunity feedback and verify complete cleaner discoveries/journal flows; implement grazing choices, player pair/companion activities, wider school excursions and ambush goals with matching NPC responses; finish the broader progression and feedback work; run combined pressure/lifecycle/performance checks and package one Windows build. The overall goal remains active. The parked Living Reef ZIP is unchanged.

## Browsing checkpoint — September 7

The earlier remaining-work list above is historical. Current additions:

- Foxface rabbitfish, orange-spotted filefish and pencilled rabbitfish can invite an existing nearby conspecific using E. The invitation releases its prior NPC pair association; meals, danger, cleaning and rest still take priority. The chosen fish follows and waits, with bounded movement. Both fish must commit an actual nearby meal and then calmly regroup for three seconds. Travel, death, loss, reincarnation and separation beyond 650 pixels release the relationship. A companion label identifies the individual among similar fish; E can also end the association.
- Palette surgeonfish and parrotfish have grazing-route discoveries. A first plant meal establishes a remembered patch; a meal at another plant patch and a return to actual recovery finish the route. Algae and seagrass partially replenish at two resource units per game second after eight quiet seconds. A further bite restarts that delay. The existing depleted-patch reset remains. Coral, animal food and population counts are unaffected by this renewal rule. NPCs prefer fuller nearby plant patches when the nearer choice is heavily grazed. These rates are authored game mechanics, not biological growth claims.
- Sand prompts distinguish no nearby appetite, an eligible neighbor and a visitor already approaching. Companion prompts explain digestion/cleaning and identify another habitat when no conspecific is present. Grazing prompts and the original-patch marker show recovery and the return destination, including during pause.

Evidence: `artifacts/gameplay-uplift-browse-unit.log` records 299/299 full-suite checks. After two additional integration/feedback assertions, `artifacts/browsing-activity-core.log` records 16/16 targeted checks, including real NPC patch choice, real player/NPC feeding commits, checkpoint replay and relationship release. `artifacts/browsing-activity-browser.log` passes filefish invitation/feeding/reunion at both display sizes and the two grazing routes through mouse controls, including journal discoveries. The final label confirmation is recorded separately in `artifacts/browsing-activity-browser-confirm.log`. Browser scenarios use a complete generated seed-42 reef; they do not replace NPCs or food or alter appetite or positions.

Balance limitation: the initial time-seeded surgeonfish browser run exceeded its 25-second return wait; another time-seeded run and the reproducible seed-42 route passed. The original failed run did not capture enough simulation state to attribute the timeout. Do not treat the passing seed as proof of consistent completion times across generated communities. Keep this in the combined resource-pressure/play-feel pass.

Still required for the full goal: wider schooling excursions and ambush hunting activities; complete cleaner discoveries and remaining journal/save/UI integration checks; mixed-species resource, predator and social-pressure checks across generated habitats; targeted feedback improvements based on those results; performance/regression and one verified Windows archive. The goal remains active, and no new archive is claimed here.

## Ambush and school checkpoint — September 7

This supersedes the activity gaps in the preceding checkpoint.

- Coral grouper, devil scorpionfish, painted frogfish and longsnout flathead can settle at authored ledge/bottom positions. Two seconds of settling enable concealment and a short, 0.8-second strike at a suitable fish within 160 pixels. The strike uses three times normal swim/turn rates, still requires anatomical meal contact, and stops on a miss. Frogfish display their existing lure in waiting windows. Mouse movement aims without leaving the position; E or clicking open water leaves. Waiting turns toward the cursor continuously rather than snapping. These are authored play abstractions, not measured strike kinematics.
- Silver sprat, peach fairy basslet and purple anthias gain school feeding trips: a plankton meal near two companions, a real nearby schoolmate meal, then three seconds regrouped. Existing fusilier progression remains intact and gains the same local feeding response. Each later player meal can start another feeding wave after the discovery. Existing appetite, rest, danger, food amounts and two-fish target limit remain in control.
- A generated seed-42 simulation supports all four ambush catches through ordinary steering, waiting and repeat attempts, and all three new school trips through actual player/NPC feeding. This demonstrates complete paths without replacing communities or increasing populations; it does not prove universal completion times.
- A browser retry exposed an unreliable short-strike experience. A controlled heading experiment found an opposite-facing hunter could reach prey but lose the strike window before the contact action finished. Continuous aiming and faster bounded strike turning address that problem; multi-heading moving-prey tests pass. The final frogfish browser confirmation passes at both sizes. The earlier failed run remains in `artifacts/predator-school-browser.log`; do not count that combined run as wholly passing. Its two school scenarios pass, and the corrected ambush has its separate receipt.

Evidence: `artifacts/gameplay-uplift-integrated-unit.log` reports 313/313 full-suite checks. `artifacts/ambush-natural.log` includes all four generated ambush paths and multi-heading catches; `artifacts/school-activity-natural.log` includes all three generated school trips. `artifacts/ambush-browser-confirm.log` proves frogfish aiming/catching/discovery through actual mouse/E controls at 1600×900 and 1024×768. The school cases in `artifacts/predator-school-browser.log` prove real mouse feeding and journal completion. `artifacts/cleaner-discovery-integration.log` covers both complete cleaner discoveries and portable export/import. `artifacts/gameplay-uplift-integration-browser.log` is the combined regression receipt for old adventures, narration, journal, cleaner controls and sand searching.

The next work is the remaining integration/balance/delivery gates in the current audit, not another expansion of activity types. Preserve the Living Reef archive until the new combined Windows build is verified.

## Arrival and stability checkpoint — September 7

A generated inactive-player survey reproduced indefinite circling near a mouse destination. Normal steering now brakes inside the turning radius, allowing the player to arrive and become still. A regression covering all 57 Practice species from four headings fails before the fix and passes afterward. This is a reproduced movement defect; the earlier grazing timeout did not record enough state to prove it had exactly the same cause.

The current full unit suite passes 314/314 checks (`artifacts/gameplay-final-unit.log`). All 16 generated grazing routes, across eight seeds and both grazers, complete with two real meal requests and one return request; the longest takes 27.3 simulation seconds (`artifacts/grazing-route-survey.json`). No NPC, food, appetite or position replacements are used in that survey.

The 54-case pressure survey spans all nine habitats, day/night players and three seeds for three minutes each. Populations remain fixed at their generated 10–20 animals, resources and positions remain finite, predators deliver 30 bites, and all 54 portable checkpoints replay. No players die in this inactive-player sample after the arrival fix. This establishes stability and actual predator activity, not active-play survival balance or universal activity completion time (`artifacts/gameplay-pressure.json`). Browser, native and archive verification still determine readiness for handoff.
