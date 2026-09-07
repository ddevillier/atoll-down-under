# Reef hunter fins and feeding jaws

Coral grouper, devil scorpionfish, giant grouper and coral trout now use continuously updated painted tail, pectoral and pelvic pieces. The first three keep their heavy body cores and dorsal spines steady; trout adds a gentler rear-body bend with its painted lyretail intact. This brings the painted-part path to 27 species. The cuttlefish and source asset bytes are unchanged.

Each of these four also has a separate lower jaw. It opens using the existing feeding envelope during preparation, peaks at contact, and returns during recovery. No extra consumption event, idle gape loop or feeding rule was added. The neutral pose is the original painting, which already has slightly parted lips. These are authored 2D gestures rather than reconstructed anatomical models. Adjacent flank paint reconstructs the area exposed behind folding pectorals.

## Visual evidence

Four source crops, four initial full-renderer simulation strips and eight ordinary Practice captures were inspected. Each strip covers cruise, settle, turn and actual meal phases. Ordinary captures cover every species at 1600×900 and 1024×768: mouse movement, reversal, a real edible target in the generated community, consumption and rest. Player energy starts at 60 for feedback. No community or food entities are replaced. The capture report records twelve scenes without browser errors.

The initial feeding views exposed dark angular mouth patches: the cavity filled transparent corners of the cutting polygon. The correction uses the original jaw's alpha silhouette, with a cropped cavity canvas. Four confirmation strips were inspected after this correction; the angular patches are gone in those views. Original ordinary captures predate that correction and show recovered poses. Recorded videos exist but were not continuously watched.

Tail and broad fin phase differences are visible in the inspection strips. Feeding now moves the lower lip independently while the eye stays stable. At ordinary gameplay size, mouth motion and the mottled scorpionfish's fins are subtler against the densely painted reef. Static strips and pixel changes do not establish continuous perceptual acceptance.

The live comparison at `/scripts/motion-preview.html` adds **Reef hunters** and an optional **Preview feeding** control. The control uses the same contact timing and envelope, with a clearly labeled gesture preview during braking. Other groups retain the swimming comparison, and the feeding control is disabled where jaws have not been authored.

## Verification and limits

All 256 unit tests and four targeted browser tests pass after the correction. The new unit check follows preparation, one consumption contact, recovery and rest. Browser checks verify lower-mouth pixel changes with unchanged eyes, exact source-alpha coverage for the cavity, cropped/full canvas placement including feeding, all 27 species moving with the old mesh budget exhausted, pause/reduced-motion behavior and comparison controls. Cavity allocations are included in the renderer's prepared-pixel diagnostic.

Evidence is under `artifacts/hunter-parts/`; corrected strips are in `confirmation/`, with final test output in `final-unit.log` and `final-browser.log`. Simulation rules, populations, saves and predator balance are unchanged, so the previous pressure baseline was not rerun. Complete roster review, natural attachment, social presentation, native frame pacing and the combined Windows archive remain open. No species is marked fully accepted and no archive was made for this pass.
