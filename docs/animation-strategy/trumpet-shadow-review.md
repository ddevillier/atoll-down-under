# Trumpetfish: rear-fin motion and moving cover

The trumpetfish now has four independently posed painted pieces: tail, dorsal, anal and lower fin. Rear fins continue working during a quiet hover; tail effort settles. Its rodlike torso, eye and complete tube snout stay rigid. This uses the existing transparent crop, with no new raster asset or original-game research. The long-bodied group in the live motion preview now includes it.

The previous cover routine approached a moving host with the stationary-refuge controller. Close approaches were capped at half cruising speed, so even an ordinary moving NPC could outrun the follower. A failing test measured 48.44 world units of longitudinal lag after eight seconds beside a host moving at 30 units/second. The new close-follow controller matches measured host velocity and corrects relative position within the trumpetfish's ordinary cruising-speed limit. The same test now stays within six units. Faster hosts can still get away; there is no teleport or pursuit-speed increase.

Approaching a host and actually occupying cover now have distinct activity/observation states. Entry/exit tolerances differ slightly to avoid rapid state changes at the boundary. Feeding or escaping hosts are ineligible, and the trumpetfish's own meal approach removes its shadow drawing state. Missing/dead/hidden hosts, cleaners and unsafe potential predators retain existing eligibility rules. Save/replay uses the existing relationship and velocity fields.

Shadowing and head-down waiting already appear in the project's sourced trumpetfish entry in `src/natural-history.js`. The tracking controller, spacing, eligibility rules and fin rhythms are authored gameplay choices, not measured biology. Head-down refuge presentation and a separate mouth-expansion action remain unaccepted.

## Reviewed evidence

- Inspected the actual source crop and one full-renderer strip covering cruise, settle, reversal and feeding. The strip shows changing rear fins and tail silhouettes while the snout remains stable. It does not establish continuous motion quality or show an independently opening jaw.
- Inspected both ordinary player-trumpetfish meal/return captures, at 1600×900 and 1024×768, within generated communities. The capture report records no browser errors. Tiny fin visibility against the busy background remains limited.
- A search of seeds 1–40 found seed 19, where an existing NPC trumpetfish naturally selects an existing parrotfish. No fish, food or individual positions were replaced. Deterministic simulation/renderer snapshots distinguish approach at 12 seconds, close cover at 20 seconds and accompanying the moving host at 26 seconds. Four initial 20/26-second views were inspected at both sizes. They exposed a shelter label obscuring the pair in the smaller window.
- The foreground label pass now also reserves the rendered bounds of active shadowing and cleaning participants. Two 26-second confirmation views, one per size, were inspected and show the pair clear of the labels. The capture helper lets the real-time welcome toast expire before accelerating simulation time. Other generated snapshots were not additionally inspected. This completes the bounded correction/confirmation batch for this front.

## Validation and remaining scope

All 255 unit tests pass. New tests cover moving-host lag, normal-speed caps, host interruption/loss, save/replay, the generated NPC approach/join/travel sequence, meal priority and rigid snout/torso with active rear fins. The final five targeted browser tests pass: all seventeen painted-part species avoid mesh-cache starvation and freeze correctly; cropped fin placement and preview controls remain correct; the actual mouse-driven shadow fixture preserves drawing order and reserves the host/guest against labels; shared label clearance still works.

The final simulation pressure run contains 110 scenarios, 31 bites, zero deaths and unchanged initial populations. It matches the previous aggregate pressure result. The report is `artifacts/trumpet-shadow/pressure-final.json`; it includes source hashes and predates only the final renderer label-clearance change. The pressure helper now accepts a separate output path so earlier checkpoints are preserved. These are simulation and browser results, not native performance acceptance.

Logs and captures are in `artifacts/trumpet-shadow/`. Complete roster anatomy/ecology, continuous perceptual review, remaining feeding/attachment presentation, native performance and the combined Windows archive remain open. No new archive was produced.
