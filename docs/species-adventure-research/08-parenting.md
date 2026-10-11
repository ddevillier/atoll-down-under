# Parenting and courtship — s13 and s44

Research refreshed 10 October 2026. Research only: this update changes this report, not runtime code, art, narration or saves. Existing catalog identities remain authoritative. The cards below are optional future work; timings, routes, response bands and rewards are game interpretation.

| Rank | ID / exact identity / role | Existing content to retain | Recommendation | Effort / priority |
| --- | --- | --- | --- | --- |
| 1 | s13 — Banggai cardinalfish, *Pterapogon kauderni*; playable | Cover-and-plankton home journey plus Dad’s Big Mouth nursery | **Before the Big Mouth:** respond to a real displaying female, choose a shared pocket, explicitly receive one brood into the existing nursery | M / P2; optional prelude, not a second nursery |
| 2 | s44 — Yellow seahorse, *Hippocampus kuda*; resident | Actual holdfast plankton meal and subsequent rest observation | **A Little Rise Together:** choose a viewing position and witness two residents release, ascend and reattach | L / P2, conditional on identity, two real residents and shared movement/contact support |

## s13 — Banggai cardinalfish

### Evidence and limits

NOAA confirms the Banggai Archipelago identity, shallow sheltered reef/seagrass habitat, paternal mouthbrooding and release of developed young. Its account also notes individually distinct spots and broadly similar male/female appearance. These support a recognizable encounter, not sex assignment from the current sprite or a claim that this fictional reef reproduces native distributions. [NOAA species account](https://www.fisheries.noaa.gov/species/banggai-cardinalfish).

Kolm’s exact-species experiment distinguished female rush and twitch courtship. Rush frequency was associated with clutch weight; twitch frequency with proximity to spawning. The publisher abstract supports those associations, but supplies no complete animation ethogram. A single movement must not become a guaranteed readiness code or an egg-quality score. [Kolm 2004, female courtship](https://link.springer.com/article/10.1007/s00265-003-0754-5).

In a field experiment, established pairs resisted introduced individuals; males were the main aggressors, and no intruder replaced a resident partner during the observation. This argues against simplifying paternal care into universal female-only competition. It does not establish lifetime monogamy. [Kolm and Berglund 2004, territorial behaviour](https://link.springer.com/article/10.1023/B:EBFI.0000035430.76766.53).

Another field/genetic study found homing to the original group location, without evidence of familiar-group-member recognition or kin grouping. Preserve entity identity for continuity, but do not narrate a returning group as recognized relatives. A new homing task would also duplicate the existing home journey. [Kolm et al. 2005, group stability and homing](https://academic.oup.com/beheco/article-abstract/16/3/521/189890).

**Shelter gate:** field and experimental literature summarized in NOAA’s bibliography supports associations with *Diadema* urchins and named anemones, including life-stage-dependent shelter use. These are possible habitat fidelity improvements, not permission to label generic s62/s63 as verified hosts. The roster currently identifies them only as Echinoidea/Actiniaria; a special spines/tentacles refuge requires an explicit host identity, art and clearance contract. Do not make juvenile refuge another father-controlled delivery chore. [NOAA-hosted research bibliography, microhabitat entries](https://repository.library.noaa.gov/view/noaa/29974/noaa_29974_DS1.pdf).

### Current loop and duplication boundary

`home-journeys.js` already supplies `cardinalfish-cover`: choose cover, depart at least 80 units, take plankton, return. `cardinalfish-nursery.js` evaluates real shelter traffic/hunters, requires local cover selection and calm brooding, then releases four dedicated young. Those young travel autonomously to cover; `tickBackground()` preserves their local routine when another story is active in the same reef. It does not run an unseen ecosystem elsewhere. `validStory()` bounds stages, timers and exactly four released records. `cardinalfish-nursery-render.js` provides dedicated juvenile art and mouthbrooding presentation.

`natural-history.js` now accurately states that this nursery exists and that courtship, spawning and spot recognition remain absent. The earlier report’s stale-limit correction is therefore no longer outstanding. Do not add another calm timer, repeated cover selection, offspring feeding or extra release.

### Card — Before the Big Mouth

**Source → choice:** female-led courtship and paternal mouthbrooding → the player explicitly opts into a prospective-father role, chooses whether to acknowledge one eligible displaying female, and chooses a nearby shared pocket. Role assignment is authored for this encounter, not inferred from size/color or retroactively applied to free exploration.

**Four beats and visible consequence:**

1. Inspect one eligible existing s13 showing a short approach/quiver. A restrained “Courtship display” cue and inspection text make tiny movement accessible. Declining or swimming away returns both animals to normal life without penalty.
2. Acknowledge while physically beside the fish. Reserve its ID/incarnation; repeated remote clicks cannot advance this beat.
3. Choose either of two nearby open pockets. The partner swims there at ordinary speed, and both align alongside one another. Changing pocket changes actual travel and final spacing. Crowding permits repositioning; it does not summon a substitute.
4. Deliberately choose “Receive the brood” at adjacent, aligned contact. One bounded transfer cue establishes eggs and changes the father’s mouth. Commit once, then continue the existing nursery. The female resumes ordinary local activity; the scene asserts no continued maternal care of released young.

**Code / art / state:** use `companion-activity.js` only as an identity-reference pattern; do not enroll s13 in rabbitfish feeding rules. Add an optional versioned prelude with stage, partner `{id,incarnation,reef}`, pocket ID, bounded display phase and `transferCommitted`. Reuse nursery pose/young art and its one brood record. Review the female approach/quiver against full methods or a verified motion reference before literal captions; an abstract cannot specify speed/frequency. Reduced motion keeps posture, contact and text cues. Existing sprites share spots, so distinguish the particular partner with existing inspection/memory UI unless actual individual pattern variants are authored; do not pretend shared artwork is diagnostic.

**Admission / persistence:** reserve one eligible unpaired adult within the normal adult budget before offering Begin; never break an existing bond, append adults, teleport a partner or refill appetite. If an old save lacks a suitable adult, retain its animals and nursery, explain unavailability and offer the established preserved-dive/fresh-adventure route. Freeze approach/display/transfer on pause and offscreen. A missing incarnation before transfer permits a new encounter; after transfer it cannot erase the brood. Old nursery saves continue without a required prelude. Replays may revisit courtship without duplicating the committed brood, young or discovery.

**Acceptance:** normal controls must discover, decline, acknowledge, change pocket and physically complete transfer. Show the partner traverse both routes; compare rendered contact with simulation geometry at supported scales and reduced motion. Save/reload immediately before/after transfer; interrupt with steering, pause and map travel; remove/replace the partner before and after commit. Assert one brood handoff, no adult increase, unchanged old nursery completion and exactly its existing four young. Remote buttons or elapsed time alone award nothing.

**Verdict:** M / P2. Strongest extension here because the new decision concerns beginning a particular brood. Detailed spawning art remains gated; a caption-only egg handoff is insufficient.

## s44 — Yellow seahorse

### Evidence and identity gate

Keep catalog *Hippocampus kuda*, with the existing stylized-art identification caveat. Yellow coloration cannot diagnose the species. Lee et al. observed laboratory pairs identified as *H. kuda*: facing/snouted contact, male following, tail-linked upward swimming and egg transfer into the male pouch. The paper’s figures provide a motion reference, but its own discussion acknowledges classification difficulty and calls for taxonomic work. Treat this as captive evidence for specimens reported as *H. kuda*, not a wild Australian timetable or unquestioned identification of our art. [Lee et al. 2018, full primary paper, results and Fig. 1](https://www.ksdb.org/journal/dr/dr-22-4/pdf/dr-22-4-361.pdf).

An independent Indian captive study recorded pair formation, coloration/posture changes, courtship and male receipt of eggs. It supports the broad social sequence; its age, size and brood figures are husbandry results, not progression goals. [Thangaraj et al. 2006, CMFRI full paper](https://eprints.cmfri.org.in/6196/1/2006.pdf).

Do not import daily greeting clocks, lifetime fidelity, mate-recognition experiments or an exact four-phase ritual from other seahorse species. The proposed player-distance interruption and short return route below are authored peaceful feedback, not a measured *H. kuda* disturbance response.

### Current loop and duplication boundary

`resident-journeys.js` resolves a real ID/incarnation for `seahorse-holdfast-meal`: witness committed plankton consumption, then rest. `resident-life.js` drives resource contact/handling and records the actual meal. `simulation.js` seeds one daytime s44 in Seagrass Meadow, gives it a coordinate holdfast and pins attached residents before invoking `residentStep()`. A second seahorse and a free-moving social branch do not currently exist. Existing upright/tail/snout presentation is not a release-and-reattach system.

The natural-history entry now acknowledges simplified snout/contact movement; its remaining courtship/brood limit is accurate. Preserve the actual meal observation. s44 remains non-playable.

### Card — A Little Rise Together

**Source → choice:** captive paired contact/ascent → from an existing playable fish, choose a clear viewing position and how much space to leave two autonomous residents. The player observes agency; it cannot command pregnancy.

**Four beats and visible consequence:**

1. Inspect an existing resident with a real eligible neighbor and choose “Watch the pair.” Show no false start when only one exists.
2. Swim to a near, plant-obscured viewpoint or a wider side view. Choosing the wider view exposes both animals and the ascent corridor. Visibility is feedback, not a patience meter.
3. Watch both release actual supports, approach, briefly align and ascend along a bounded route. An over-close observer causes an authored calm return; reposition to see another sequence. No real dawn appointment or restart grind.
4. Watch separate returns and regripping at reachable plants, then inspect to record the observed beats. Save the resulting support occupancy. This slice shows courtship-associated movement without egg transfer, pregnancy, birth or new young.

**Code / art / state:** extend resident observations with an encounter type instead of replacing the meal journey. Add one record holding two ID/incarnation references, real plant/support IDs, bounded routes/phases and witnessed-beat bits. Insert a social-motion branch before holdfast pinning; use common simulation/render tail-grip landmarks for release, upright translation and reattachment. Author attached/free tail poses, dorsal propulsion and a protected eye/snouted contact pose. Tail-entwining needs an actual linked geometry rig or an honestly simplified close parallel pose; two static bodies with floating artwork are not a scene. Reduced motion retains routes, attachment and captions.

**Admission / persistence:** first resolve the sprite’s *H. kuda* identity and provide two eligible residents within an explicitly approved resident/adult population budget at normal generation. Preserve old single-resident saves without adding a mate on inspection or import. If no pair exists, retain the meal observation and disclose the unavailable social encounter. Pause/offscreen freezes routes and witnessed credit. Save positions, free/attached state and supports; validate both incarnations and geometry on reload. Missing partner recovery ends/reoffers the encounter honestly, preserves earned observation and never snaps or silently replaces a resident. Ordinary holdfast meals resume after genuine reattachment.

**Acceptance:** use visible inspection, ordinary movement and save/map controls in a normal generated dive. Choose both viewpoints, interrupt by moving close and retry; capture continuous animal positions and tail contacts through release/rise/return. Pause, leave and reload mid-rise; test a missing partner and occupied support. Assert no offscreen witness credit, one award, no spawned animals, unchanged prior meal discovery and preserved old single-resident saves. An injected pair or forced render phase cannot demonstrate admission.

**Verdict:** L / P2, conditional. The main cost is real resident movement/occupancy, not research. Defer if identity or encounter admission cannot be satisfied; a false paired animation is not an acceptable cheaper version.

## Ranked handoff and shared boundaries

1. **s13:** queue the explicit courtship/handoff prelude; retain both current journeys and the complete nursery. Biological confidence high for broad sequence, lower for precise courtship animation without full ethogram.
2. **s44:** conditionally queue resident pair observation after identity, budget and holdfast-motion support. Captive evidence supports the broad sequence; no eggs are required by this card.

Both IDs are covered. Separate observed biology from compressed scenes in journal copy. No automatic eggs, population farming, session calendar, brood-loss penalty or mandatory reproduction. Wire any optional choice through the registry and real dispatcher; exposing a second data entry alone cannot select it. Preserve existing save validators through explicit versioned migration. These proposals and acceptance cases have not been implemented or playtested in this research pass.
