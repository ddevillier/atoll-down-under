# Ray disc and tail animation

The stingray and electric ray now have separate deformation controls measured against their current cropped paintings. This replaces the shared broad disc field and removes the stingray's duplicate generic tail-path motion. It changes presentation only: simulation rules, diets, animal counts and saved state are unchanged.

## Species treatment

| Animal | Implemented movement | Reviewed result and remaining limits |
|---|---|---|
| s27 Blue-spotted stingray | Protected head and central ridge; movement increases toward the pointed disc margins with a front-to-rear delay. The long curved tail has its own continuous trailing field. Margin effort relaxes when stopped or feeding, and unequal margin flex supports a turn. | Cruise samples show distinct margin flex without moving the central markings as a sheet. The full tail stays joined and visible in both facings. It remains a deformation of the painted curved tail, not a physically simulated tail or a new anatomical identification. |
| s37 Electric ray | Much smaller disc-margin motion; a short independent caudal region and restrained rear pelvic-lobe movement. Both eye positions and the central ridge stay steady. Quiet rest and feeding use the same effort/contact transitions with lower amplitudes. | The rounder disc and short tail remain coherent through the reviewed states. Its movement is substantially quieter than the stingray's. Burial, shock-specific anatomy and painted seabed contact still require the later resident/action review. |

All parameters are authored animation choices. The existing guide's sourced facts remain the biology baseline; no new biological claims or original-game research were added. The existing controlled 2D turn still mirrors the painting midway; this pass does not claim a continuous 3D rotation.

## Evidence

`artifacts/ray-motion/` contains the first batched review: two 16-frame inspection strips and four populated gameplay views. Each strip uses the full creature renderer while an actual isolated Simulation cruises, stops, turns, and executes preparation/contact/recovery for a shrimp meal. Inspection width is 320 world pixels; it is not a native-size performance test. All six images were inspected.

The first turn samples ended before the renderer completed its facing change. Several gameplay screenshots also placed the player behind shelter/meal labels. The single confirmation batch in `artifacts/ray-motion-confirmation/` extends turn samples through 1.4 seconds and uses ordinary mouse movement into open sand after the meal. All six confirmation images were inspected. Both facings and full tail contours are visible; paused gameplay views show the selected rays at their actual size at 1600×900 and 1024×768. The underlying label collisions remain a separate UI issue; moving the fish does not fix them.

The gameplay captures enter Practice through the normal UI, keep generated communities, use mouse movement and a suitable existing food, and record energy restored by the meal. Energy is set to 60 to make that feedback observable. Initial and final population counts match within each capture; random starts can have different counts. Recorded videos accompany the screenshots but have not been directly watched as continuous playback. These are short controlled play sequences, not long-session or all-habitat acceptance.

`artifacts/ray-motion-unit-final.log` records all 223 unit tests passing. New checks sample head/ridge stability, resting and feeding amplitude reduction, cyclic continuity and positive mesh orientation under strokes, feeding and turn extremes. `artifacts/ray-motion-e2e.log` records the browser check passing for both rays: full-pose pause and reduced-motion frames remain unchanged; a second 24-phase animation cycle reuses the first cycle's cache entries and stays within the existing pixel limit.

No additional performance or survival claim follows from those cache checks. The latest simulation pressure evidence remains the preceding cleaner-courtesy run because no simulation code changes here. Native frame-time/memory measurements, complete substrate review, remaining anatomy groups and the combined Windows archive are still required for the whole-roster goal.
