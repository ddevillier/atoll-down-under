# Windows Family Journal build

Combined work front: living mouse-reactive title, slower original title music with recoverable startup, shared journal with 12 badges and species care stamps, title visitors, care reminders, journal backup/restore and portable care checkpoints. See FAMILY-JOURNAL.md for the completed implementation and the small-meal care refinement.

Archive target: `dist/Atoll-Down-Under-Windows-Family-Journal-2026-09-06.zip`.

Source verification: 164 unit/asset tests pass. The full browser run passed 39 scenarios and exposed one obsolete expectation that the status area should disappear after canceling a meal. The new care hint legitimately fills that area. Updating the assertion and rerunning feeding plus all three journal scenarios passed all four, covering all 40 scenarios across the full and focused runs.

Visual checks cover 1600x900 and 1024x768: title lettering remains clear, the journal scrolls within its dialog, and fixed footer actions remain available. Native package verification, source identity and archive checks are the final delivery gate; their results and hashes are appended to the repository receipt after packaging.

Windows x64 only. Previous ZIPs are preserved. The user requested parking after this complete work front. The broader remake and historical audit remain open; no further original-game research is authorized by this delivery.

## Verified delivery and park

**Complete work front parked September 6, 2026.** Runtime commit: `a16e4c6`. No further work is queued; resume only at the user's request.

Final source: 165 passing unit/asset checks, including continuous movement of the reward cuttlefish. All 40 browser scenarios are covered by the full run and the four passing focused reruns described above.

The combined Windows build at 01848e8 passed native title autoplay/fade, journal persistence and actual backup/restore files, fullscreen startup/toggling, mouse feeding/steering/travel, reef map, shellfish diets, passive jaws, portable dive files, day/night cleaner interruption and spaced queues, optional food hints, and metric/imperial preference persistence, with zero reported errors. The only subsequent runtime change moves the reward cuttlefish route clear of the title boundary; its continuity test passes. The final a16e4c6 package was checked again for title autoplay/fade, care stamps, actual journal files, deduplicating restore and persistence, with zero errors.

All 129 checked packaged source/runtime/asset/document files and package metadata matched the final source at packaging. All 73 ZIP payload files matched the tested final application folder byte-for-byte; CRC passed.

- Archive bytes: `226061988`
- ZIP SHA256: `2ba2d197b1d3f0903ce84ed6e3404de70b8c71c9df6dced01a341b35fb8912fc`
- app.asar SHA256: `181be65712e502d4b79235fc3e190d0ac145a7aecac345bdda984b79b70355a7`

Evidence: artifacts/unit-family-journal-final.txt, e2e-complete-journal.txt, e2e-journal-final.txt, family-journal-*-report.json and family-journal-archive-check.json. The source receipt and parked-status notes postdate the verified packaged runtime. Older Windows ZIPs remain preserved.

Extract the ZIP completely and run `Atoll Down Under-win32-x64/Atoll Down Under.exe`. The application starts fullscreen. F11 switches to a window; Escape pauses the dive. See FAMILY-JOURNAL.md for a short playtest and the explicit small-meal refinement to care stamps.
