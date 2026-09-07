# Long fins, streamers and fans

Eight species now use separate tail, fin-sector and streamer controls instead of the generic rear-body and outline fields. Those generic fields could catch a long fin extending behind the torso and move it like a second tail. Attachment points and eyes stay pinned; feeding remains local. These are authored controls fitted to the existing paintings, with no new biological claims or original-game research.

| Species | Implemented and inspected | Remaining limits |
|---|---|---|
| s4 Moorish idol | Independent caudal fin, lower fins and a trailing dorsal streamer. Full streamer stays joined through both facings; torso stripes remain steady. | Streamer is thin at ordinary size. Its painting is very similar to the bannerfish; motion does not resolve that identity issue. |
| s11 Peach fairy basslet | Separate tail, dorsal/lower fin sectors and trailing tips. Eye and bright torso stay stable through cruise, rest and feeding samples. | Fine tip motion is difficult to distinguish within a busy school at ordinary size. |
| s13 Banggai cardinalfish | Separate caudal region, lower fins and long dorsal path. Full fork and vertical body bars remain coherent in both facings. | Thin black appendages can disappear against dense coral. |
| s20 Lionfish | Broad fan sectors rotate around their shoulder attachment; dorsal sectors have smaller, staggered motion. Head remains steady and fan stays connected. | Painted rays remain parts of one continuous mesh, not individually articulated bones. Small spines blend into busy backgrounds. |
| s40 Longfin batfish | Separate high dorsal and lower fin sectors, pectoral stabilization and a restrained caudal region. Tall silhouette remains intact through the sampled turn. | Motion is restrained; continuous playback and dense-scene performance still need review. |
| s55 Silver trevally | Caudal motion is separated from the long dorsal and lower tips. Body stripe stays continuous in both facings. | Source identity and complete ordinary-game acceptance remain open. |
| s56 Longfin bannerfish | Its own dorsal streamer path, lower sectors and tail control. Streamer remains connected during turn and meal samples. | Thin streamer visibility and similarity to the idol painting remain open. |
| s58 Purple anthias | Independent upper/lower trailing tips and caudal motion; local pectoral movement. Face and torso remain stable. | Fine appendage motion is subtle at ordinary gameplay size. |

## Review evidence

The first batch in `artifacts/fin-motion/` contains eight 16-frame inspection strips and sixteen populated gameplay screenshots: each species at 1600×900 and 1024×768. All 24 images were inspected. Strips use the full creature renderer and an actual isolated Simulation for cruise, settling, reversal and meal preparation/contact/recovery. Inspection scale is enlarged and adjusted for tall paintings; this is not actual-size evidence by itself.

The initial sheets left the bottom 200 pixels transparent because their background fill retained an older height. The single confirmation batch in `artifacts/fin-motion-confirmation/` corrects the sheet background and contains eight strips, all inspected. No runtime geometry changed after the first visual review. Full contours and both facings are visible in the confirmation sheets. These 32 reviewed images do not establish continuous temporal acceptance; gameplay videos were recorded but have not been watched as continuous playback.

Gameplay captures enter Practice through the UI, retain generated communities, move and reverse with the mouse, and eat an existing suitable food. Energy is set to 60 to expose meal feedback. All sixteen sequences completed; initial/final animal counts match within each sequence. Both capture reports have no browser errors. The captures also expose overlapping activity labels and weak separation of the player from similar NPCs. Those shared presentation issues remain open.

## Checks and performance boundary

All 225 unit tests pass (`artifacts/fin-motion-unit-final.log`). New checks cover pinned roots/eyes, cyclic continuity and positive triangle orientation on the actual 20×16 mesh under effort, turn and feeding extremes. The browser check passes for all eight species (`artifacts/fin-motion-e2e.log`): paused and reduced-motion full poses freeze; repeating a 24-phase cycle reuses existing cache entries and respects the pixel limit.

The dedicated meshes use more subdivisions to resolve narrow appendage regions. Their populated/native frame-time and memory cost has not yet been measured. Existing cache limits and generation budget remain in force; passing a cache test is not a performance result. Simulation rules and population generation did not change, so the latest pressure evidence remains the cleaner-courtesy run. All eight ledger entries stay partially reviewed and unaccepted for the broader whole-roster goal. No new Windows archive was created.
