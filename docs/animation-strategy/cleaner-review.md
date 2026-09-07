# Cleaner inspection and station approach review

This front fixes two visible/functional defects and reviews the two cleaner species. It does not close the whole-roster uplift.

## Changes

Active cleaners previously rendered before larger NPCs and before the player. Their clients could cover the inspection animation. Working and approaching cleaners now render once, after clients. Idle cleaners keep ordinary depth ordering.

The wrasse's mouth follows three authored lower-flank points. The shrimp's painted claw tip follows three upper-flank points, placing its body above the client. These coordinates use client crop dimensions, not a fixed fraction of body width as the vertical offset. Jaw/claw effort only appears while treatment is active and the cleaner has approached within six world pixels of its target. Clients and working cleaners settle their pitch and avoid a swimming bank during treatment. An interrupted cleaner stops the action cue and returns to its established station.

Existing treatment progress drives the inspection sequence; the animation creates no additional health award. The existing two-second player/three-second NPC treatment rules remain. The six-pixel visual cue threshold is not a new healing gate. The flank points are authored approximations, not measured skin contours or newly sourced biological claims.

Ordinary gameplay exposed a separate arrival bug: a grouper could orbit a station's tiny destination indefinitely when approaching diagonally. Requested player visits and queued NPC arrivals now slow near their destination and use short fin-driven positioning corrections. Free mouse swimming retains its steering response.

## Verification

- `artifacts/cleaner-motion-unit-final.log`: all 207 unit tests pass. Real visits exercise both cleaners with all 47 parasite-bearing playable species (94 visits), require a close-contact action cue in each of three inspection stages, preserve bite injuries and complete exactly one treatment. Another 235 arrivals cover four diagonal approaches and a tight orbit reproduction.
- Existing checks retain player cancellation, saved/resumed progress, poison/injury separation, queue priority and service interruption. The queue completion fixture now keeps clients fed: an unrelated recovered grouper otherwise ate a later client before the queue finished. Its eventual-treatment assertions remain intact.
- `artifacts/cleaner-motion-e2e-final.log`: targeted browser checks cover both cleaners at both desktop sizes, foreground drawing exactly once, cancellation, treatment completion, waiting queues and paused rendering.
- `artifacts/cleaner-motion-confirmation/inspection-0.png` and `inspection-1.png`: six cleaner/client combinations, each at three actual treatment stages, inspected. Clients are a small damselfish, grouper and moray. The first gallery enlarged low-resolution cache frames; the confirmation requests the correct raster resolution. These are enlarged still comparisons, not native performance evidence.
- `artifacts/cleaner-motion-gameplay/`: day grouper and night flashlight fish visits through the ordinary UI, both 1600×900 and 1024×768. All four screenshots inspected; all runs reach treatment and record no browser errors. Their ordinary communities are retained, while health/injury/energy are prepared to request care and protection is enabled. Videos are recorded but continuous playback has not been directly reviewed.
- The first two ordinary captures timed out because of the diagonal orbit. After that functional fix, the separate gameplay-only capture succeeds. It does not repeat a third gallery polish round.
- `artifacts/cleaner-motion-pressure.log`: 110 one-minute scenarios retain initial population counts, 31 bites, zero deaths and at most one bite per run. Bite/death totals match the preceding anatomical-contact run, now preserved in `artifacts/roster-anatomical-contact-simulation.json`. Health outcomes can change with incidental cleaning; unchanged totals do not mean every trajectory is identical.

## Remaining review

The shrimp's fine appendages remain hard to distinguish against a busy painting at 1024×768, though it is now visible above its client. Continuous approach/inspection/return motion, left-facing interactions, NPC-client presentation across other habitats, and native performance remain open. No species receives whole-roster acceptance from this limited station front.

Predators can still hunt NPC clients, including during a treatment; the recovered grouper in the queue fixture demonstrated this. A possible next design change is a brief active-treatment safety rule or post-visit foraging pause. It has not been silently introduced here. Existing cleaners remain inedible helpers, and no extra animals or hunter slots were added.

No new Windows archive has been made. The earlier testing build remains preserved.
