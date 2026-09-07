# Visible hovering fins for four reef fish

Neon damselfish, orange coral goby, anemonefish and humbug damselfish now use independently moving painted tails and pectorals. The three deeper-bodied fish also have separate pelvic pieces. Their bodies, eyes and stripes stay stationary while the fins fold and sweep; they do not inherit the sharks' posterior body bend. Pectoral sculling continues at rest while tail propulsion settles. Braking opens the stabilizing fins, and feeding dampens their strokes.

These are authored 2D animation choices, not measured biological motion. Existing transparent paintings are cut locally at initialization. Overlaid pectorals reveal a small reconstructed flank underlay sampled from adjacent paint. Original asset bytes, cuttlefish motion, populations and simulation rules are unchanged.

## Review evidence

Four source crops, two swimming poses and two settled poses were inspected. The anemonefish has the clearest local fin change; smaller blue and striped fins remain more subtle. Tail silhouettes and pectoral projections differ between the sampled phases without bending the skull. The samples deliberately avoid a near-whole-cycle interval that made earlier progressions look identical through temporal aliasing.

Eight ordinary mouse-driven gameplay captures were inspected: all four species at 1600×900 and 1024×768. The recorded runs complete meals within their generated communities and report no browser errors. Small player silhouettes, camouflage against the busy reef and overlapping shelter/cleaner labels remain readability defects. These screenshots cannot establish continuous motion quality.

The live comparison at `/scripts/motion-preview.html` now starts with Hovering reef fish. It offers unchanged paintings beside moving parts, normal game-world size, enlarged inspection, normal speed, slow playback, pause and a reef background. Both columns share the same drift, making local articulation distinguishable from whole-sprite translation. A ten-second playback recording is available in `artifacts/hover-parts/hover-normal-size.webm`; this review does not claim to have continuously watched that recording.

## Runtime cost and regression

All sixteen current painted-part species now allocate cropped fin canvases rather than a complete source-size canvas for each fin. The body canvas remains full size. Crop offsets are retained through the same hinge transforms. `preparedPixels` counts cumulative prepared canvas pixels; it is not live memory or native performance evidence.

All 249 unit tests pass. A new test verifies resting pectoral strokes, quiet resting tails and fixed body points for the four hoverers. Seven targeted browser tests pass across two runs: all sixteen painted species continue changing with the mesh budget exhausted and freeze on pause/reduced motion; preview controls/layout work; goby home and fusilier meal/rejoin loops succeed; cuttlefish camouflage and puffer feeding remain intact; cropped and full-size fin canvases preserve placement across six pose/size combinations per species. The crop comparison allows small raster filtering differences rather than asserting byte-identical antialiasing.

Logs and captures are under `artifacts/hover-parts/`. No further visual tuning batch was needed for this bounded front. Full-roster acceptance, separate jaw actions in the painted-part renderer, shared readability, native performance and Windows packaging remain open. No new archive was produced.
