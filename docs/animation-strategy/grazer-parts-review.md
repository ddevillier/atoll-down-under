# Side-fin movement for six grazers and wrasses

Palette surgeonfish, foxface rabbitfish, sixbar wrasse, parrotfish, humphead wrasse and pencilled rabbitfish now use separate painted tail, pectoral and pelvic pieces. Their principal bodies, faces, dorsal outlines and rigid spines do not inherit the sharks' trunk bend. Pectorals continue sculling at rest, tails settle with effort, and braking opens stabilizing fins. The sixbar has a quicker stroke; the larger humphead has a slower, broad pectoral sweep. These are authored animation signatures, not measured swimming kinematics.

Each fin uses its own cut polygon and attachment line. Small flank underlays reconstructed from adjacent paint fill the space exposed by folding overlaid pectorals. These patches are approximate painted reconstruction, not recovered anatomy. Original asset files and the cuttlefish are unchanged. The existing guide/art identity limitations remain; animation does not correct mismatched species markings.

## Visual review

All six source crops were inspected. Six initial grouped comparison views cover swimming and settled phases for all six species. The broad parrotfish and humphead fins read most clearly; the small sixbar and surgeonfish pectorals remain more subtle. Two body-only diagnostics exposed residual fin outlines on foxface and parrotfish. Their cuts were expanded and underlay samples adjusted to remove those remnants. Two grouped confirmation views were inspected after that correction. Other generated phase/viewport captures and playback recordings are available but were not additionally inspected or continuously watched.

All twelve ordinary gameplay captures were inspected: each species at 1600×900 and 1024×768. The harness enters Practice through the menus, moves and reverses with the mouse, selects a real edible target from the generated community, completes a meal and returns to a rest point. Player energy starts at 60 for visible feeding feedback. No community entities or food are replaced. The report records twelve completed scenes with no browser errors. These captures began before the final two mask corrections; the grouped confirmation covers those graphical changes.

The live preview now offers **Reef grazers** and **Wrasses and parrotfish** with normal size/speed, enlarged inspection, slow playback, pause and a reef background. It compares a shared whole-sprite drift against independent fin/tail articulation. The gameplay screenshots show readable player identity, but tiny fins still lose detail against the densely painted reef.

## Checks and remaining work

All 255 unit tests pass after the final corrections. The rigid-body/resting-scull test now covers ten pectoral-driven reef species, including these six. Four targeted browser tests pass: all 23 painted-part species keep changing even with the old mesh budget exhausted and freeze on pause/reduced motion; cropped/full fin canvases preserve placement; preview controls/layout remain correct; the trumpetfish's actual mouse-driven shadow interaction and host/guest label clearance still work.

This pass changes presentation only. Pair routines, food consumption, predators, health, populations and save formats are unchanged. The previous 110-scenario pressure result remains the simulation baseline; it was not unnecessarily rerun for these new cut masks. Runtime performance across the complete roster is still unaccepted.

Evidence is under `artifacts/grazer-parts/`, with final comparison captures in `confirmation/` and ordinary captures in `gameplay/`. The new painted-part path still lacks independent jaw opening. Continuous motion acceptance, remaining body plans, habitat attachment, complete social presentation, native performance and the combined Windows archive remain open. No new archive was made.
