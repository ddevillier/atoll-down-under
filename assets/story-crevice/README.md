# Crevice presentation provenance

The fish uses `clown-triggerfish-v1.png`, a new independently generated painted
*Balistoides conspicillum*. It corrects the materially mismatched pale,
dark-spotted atlas cell with the named species' black body, large white lower
flank spots, gold upper saddle and orange lips. All reef material reuses the
shipped `assets/reefs/reef-4.png`. No original-game art was added.

Built-in ImageGen generated one transparent side-profile painting on 2026-10-10.
The original has a genuine alpha channel; no background removal was necessary.
The selected output was cropped and reduced locally with its alpha intact to a
355 × 219 padded runtime frame. `loadCreviceArt` preserves this entire frame
instead of trimming it. The agreed physical body remains 100 × 61.69014 world
units. Full prompt, original identifier, crop and hashes are in
`provenance.json`. This is reviewed stylized game art, not a measured anatomical
or photographic reconstruction.

`src/triggerfish-crevice-render.js` makes bounded, renderer-local canvas crops:

- The fish's anterior first dorsal spine is clipped from its actual painted
  silhouette. The identical mask removes that piece from the body. The body and
  spine are then drawn once each; the ordinary swimming rig is bypassed while
  the physical crevice pose owns the fish.
  A local brightness filter lifts the blade's existing painted rim in the
  shaded recess without adding a second silhouette.
- The original Coral Cathedral cave provides the recess. Limestone pixels from
  that same painting provide the two foreground edges. Edge alpha comes from
  sampled painted texture with the physical contact column pinned to the
  opening clearance; crop perimeters blend into the incumbent painting.

The spine hinge is normalized `[0.697, 0.256]`, its painted tip is
`[0.637, 0.037]`, and its affine pose targets the simulation's world-space root
and tip. These are authored game/art landmarks, not measured anatomical data.
Pause and reduced-motion do not retract or flatten a locked physical pose.
The presentation module never progresses a story or grants a discovery.

Inspection images belong under `artifacts/crevice-*`, outside runtime assets.
