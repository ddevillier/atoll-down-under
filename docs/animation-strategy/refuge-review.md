# Refuges, anemone berths and shadowing

Residents now remember an individual resting place rather than repeatedly converging on nearly identical offsets. This is a local ecology pass; it does not complete the roster's animation acceptance.

## Behavior and implementation

`refuge-motion.js` reserves candidate homes using rendered body dimensions. It tries the existing shelter sites before expanding outward, retains the chosen home during feeding trips, and preserves it in saved dives. Bottom ambush animals use points along existing substrate routes. Trumpetfish reserve a taller footprint for their head-down rest. If every candidate is occupied, the best available clearance wins; there is no universal collision-free or shelter-capacity guarantee.

Final approaches use bounded fin corrections and slow to a stop. Animals can face open water while settling instead of orbiting their destination. Existing food, fleeing and cleaning priorities still interrupt local routines. This adds no actors, hunter slots or random-number draws.

Anemonefish choose separate berths around a living anemone's rendered crown. The nearest host is a deliberately simple game rule, not species-specific host preference. Losing a host releases its berth association and allows a coral refuge fallback. The existing layer order leaves some tentacles in front of a guest; outer guests hover farther above the crown. The existing exception that prevents anemonefish triggering host retraction was already present before this pass.

Trumpetfish choose a broader neighbor whose game diet and size do not make it a predator of the trumpetfish. Hidden, grounded, busy, stunned and cleaning fish are excluded. A compatible player fish can be a host. Final approaches track the host's actual position and heading, allowing a trumpetfish to settle when its host stops. It releases an unsuitable or distant host. NPC guests draw immediately before their host, even when the host's catalog size is smaller; player hosts already draw after NPCs. This is partial visual cover, with no new immunity, suction-feeding system or predation bonus.

The three relevant field-guide limit statements now describe these simplified behaviors. The existing biological paragraphs and sources are unchanged. No original-game research was performed.

## Verification

- `artifacts/refuge-unit-final.log`: all 217 unit tests pass. New checks cover eleven mixed residents reserving distinct body-spaced homes, a real feeding trip and return, deterministic exported-save continuation, three anemone guests, host loss, predator rejection, a stopped player host, and invalid saved coordinates.
- `artifacts/refuge-e2e.log`: two browser scenarios pass. The existing goby choose-home/feed/return adventure remains functional. The new isolated trumpetfish scenario checks real mouse movement at 1600×900 and 1024×768, paused coordinates, and drawing exactly once behind both player and NPC hosts.
- `artifacts/refuge-scenes/`: nine existing seeded communities after 45 simulated seconds, plus one controlled two-panel partnership close-up. All ten images were inspected. Animals initially receive high health/satiation and the player is protected to expose resting behavior. The harness selects each section directly; its UI header and welcome toast remain stale at Coral Cathedral, so these are habitat-rendering checks, not ordinary navigation evidence.
- `artifacts/refuge-shadow-player-1600.png` and `refuge-shadow-player-1024.png`: both inspected as the second visual batch. They show the isolated guest following a mouse-controlled batfish. These captures do not establish normal population composition or continuous temporal quality.
- `artifacts/roster-refuge-simulation.json` and `refuge-pressure.log`: 110 one-minute pressure scenarios, 27 player bites, zero deaths, initial population counts unchanged. The preceding social pass recorded 31 bites and zero deaths; changed movement can alter encounters. This measures regression pressure, not whether every predator encounter feels right.

## Remaining limits

Some shelter/cleaner labels collide in inspection mode. Several resting residents still need better attachment to the painted seabed, especially against grass, branches and ambiguous ledges. A reserved coordinate does not prove a believable perch or cave entrance. Body-footprint spacing does not prevent unrelated passing swimmers from crossing a resident.

The partnership close-up shows partial host occlusion and separate anemone berths, but does not prove continuous motion quality across all habitats or host species. Species acceptance, cleaner-client safety, native performance and the combined Windows archive remain open. The previous testing archive is preserved.
