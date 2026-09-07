# Whole-roster animation and ecology uplift

User direction, September 7: resume beyond the earlier limited pass. Raise animation and social/simulation quality across all 64 catalog animals. The previous five-milestone completion did not constitute a full-game animation polish. The new goal stays active until its broader scope is implemented and reviewed.

## Motion direction

The focal experience is recognizing how an animal lives from its movement: a rigid cowfish steering with small fins, a fast fish driving its tail, a ray flexing its disc, a fish choosing a resting place, or tentacles responding to a neighbor. Preserve painted silhouettes. Articulate fins and appendages locally instead of bending every animal as one strip. Acceleration, coasting, braking, feeding and returning to rest must remain continuous and interruptible. Calm observation and reduced motion must freeze unnecessary movement without losing game information.

Build explicit profiles for every species, a reusable deformable sprite renderer, individual motion phases, activity transitions, and a visual review gallery that exercises the full roster. Author profile parameters for the actual paintings; these are animation choices, not measured biological constants. Cache deformation work within a bounded memory budget, keep population counts unchanged, and measure busy scenes at both desktop sizes. Do not replace all paintings or invoke new asset generation unless a specific anatomy limitation requires it.

## Ecology scope

Extend local routines throughout the roster: loose aggregations and schools, stable pairs where supported, coral/anemone homes, grazing circuits, bottom searches, short ambushes, cave/perch returns, shadowing, cleaner signaling and bottom-dweller feeding. Existing diets, cleaning priority and gentle encounter rules remain constraints. Give every profile an explicit authored routine and record which biological claims come from existing guide sources versus simplified game choices. Do not claim that every animal is social. Include solitary and attached lives.

Still exclude live day/night changes and offscreen ecosystem simulation unless subsequently requested. These do not limit the breadth of visible local behaviors. Windows remains the delivery target. The prior testing ZIP stays preserved.

## Completion evidence required

- All 64 entries have implemented motion appropriate to their body shape and activity, plus an individual visual review record; a populated profile table alone is insufficient.
- Every species has an implemented local routine, with meaningful social interactions where appropriate and solitary behavior where appropriate. Verify interactions through actual simulation, including interruption, feeding and cleanup after death/respawn/travel.
- Ordinary gameplay communicates the new behavior and remains responsive. Do not substitute a developer gallery for in-game verification.
- Paused/reduced-motion presentation, legacy saves, current checkpoints, cleaner safety, population variation and gentleness retain appropriate regression coverage.
- Batch visual reviews after complete implementation for the relevant surface; correct a batch and confirm once. Keep later explicitly unfinished groups recorded rather than claiming whole-roster completion.
- Verify performance/memory, the combined Windows build and its archived bytes only after the broader work is complete. No repeated checkpoint packaging.

## Source and review record

Existing independently written species facts and source URLs in src/natural-history.js are the biology baseline. Additional locomotion references: Caltech-hosted primary paper, *Boxfishes as a model system for fishes swimming with many fins: kinematics* (https://authors.library.caltech.edu/records/p0b68-kgz96), describes a rigid armored body controlled by multiple fins; NOAA *Are starfish really fish?* (https://oceanservice.noaa.gov/facts/starfish.html) describes locomotion with tube feet. These motivate body-plan differences, not exact timing values. No new original-game reference research.

Current status: implementation in progress. No species is yet marked visually accepted for this broader uplift.

The four requested planning reviews, integration decisions, implementation checkpoint and outstanding evidence are collected in [animation-strategy/README.md](animation-strategy/README.md). Its 64-species coverage ledger explicitly keeps acceptance pending.
