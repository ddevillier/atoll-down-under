# Controlled side-view turn review

Status: partial implementation and review, not full species acceptance.

## Implemented behavior

`src/turn-motion.js` replaces exponential facing interpolation with a bounded renderer-only turn state. Most swimming animals turn over 0.28–0.46 seconds, depending on their authored motion family. A new steering request reverses from the current state; a paused frame preserves it. Feeding shortens the remaining transition to settle for contact. Reduced motion uses the requested facing immediately.

The existing side-view painting banks, pivots near its nose and bends more at the rear. Rigid bodies bend less; the moray bends more. After the first visual review, minimum width increased from 48% to 78%, or 88% for the eel and the selected long-snouted forms. These parameters are presentation choices, not measured biological timing or a claim of reconstructed frontal anatomy.

Ground routes and holdfasts bypass swimming bank/pivot/bend. Upright/front-facing residents keep their established presentation. The deformation cache includes seven signed turn states and retains the existing 512-frame/12-million-pixel cap and soft 3.5 ms new-frame generation budget. Added states may increase cache misses; no fresh performance acceptance is claimed.

## Evidence

- `artifacts/turn-motion-unit-final.log`: all 204 unit tests pass after the compression correction. New checks exercise all 64 profiles, finite bounded poses, settling, pause, a reversed request and ground/attachment exclusions.
- `artifacts/turn-motion-e2e.log`: two browser scenarios pass, covering real-species renderer turn state and the existing pause behavior. These ran before the width correction; that correction changes width limits only.
- `artifacts/turn-motion/`: first batch, all eight roster boards and ordinary shark screenshots at 1600×900 and 1024×768 inspected. This exposed excessive compression in large and long-bodied animals.
- `artifacts/turn-motion-confirmation/`: one confirmation batch with the apex held explicitly. All eight boards inspected; the visible non-clipped bodies retain better proportions. Both capture runs report no browser errors. Videos record the full pose renderer and ordinary mouse-driven shark movement, but were not directly watched as continuous playback.

The gallery runs the real creature renderer with a controlled population, capped display sizes and an unrestricted deformation-generation budget. It cannot establish native frame pacing or every animal's normal gameplay size. Ordinary shark captures exercise normal UI entry and mouse steering, but do not substitute for ordinary review of the other species.

## Remaining limitations

The painting still mirrors when signed turn state crosses zero. The nose-led pivot reduces head displacement while the rear switches sides; it does not provide a continuous three-dimensional body rotation. Static apex images and numerical state tests cannot certify temporal smoothness.

At the held apex, the pivot moves first-column bodies partly beyond the gallery's left edge. Several tails are clipped by the review canvas. This is a harness framing limitation; these frames are insufficient for full silhouette acceptance and do not establish a runtime clipping defect. No third capture/polish round was undertaken for this front.

The roster ledger therefore remains at zero fully accepted animals. Continuous transitions, populated interactions and final performance still need combined review. Predator behavior/counts were unchanged by this renderer-only pass; the anatomical-contact pressure results remain the latest simulation evidence. No Windows archive has been produced for this unfinished uplift.
