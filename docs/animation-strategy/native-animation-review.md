# Fair pose scheduling and slow-loop cadence

The mesh renderer now gives deferred animals the next frame's generation budget before ordinary draw order spends it. Each individual has one pending slot; a newer state replaces an obsolete request while retaining its place. Work and raster caches remain bounded: at most 128 pending jobs, 512 cached frames and 12,582,912 cached pixels. The budget remains 3.5 ms. A single pose can exceed the remaining budget, as before; this is not a hard real-time deadline.

Sea stars, urchins and anemones now have more cached phase samples per slow cycle, up to 96. Their cycle speeds and deformation fields are unchanged. The original 16/24-sample grids could hold an image for hundreds of milliseconds even without any deferred request. Finer sampling addresses that separate issue. Other species, including cuttlefish, retain their existing phase grids.

## Native measurements

`qa-roster-native-performance.mjs` runs the real Electron animation loop in isolated QA storage. The main matrix uses all nine generated habitats, day and night players, and 1600x900/1024x768 content sizes: 36 cases before and after the change. Each measures 2.4 seconds after a short warmup. No benchmark workers run concurrently. Instrumentation records draw duration, callback intervals, displayed mesh-canvas changes and memory counts.

The recorded Windows environment reports software canvas/rasterization/compositing. The window becomes visible when leaving fullscreen, despite the application's initial hidden QA startup; an initial report-description error was corrected after checking the recorded window state. Background throttling is disabled. These measurements cover native renderer work and callback cadence, not monitor presentation or broad hardware certification.

| Main-matrix metric | Before | After |
|---|---:|---:|
| Highest per-case CPU draw p95 | 10.6 ms | 11.9 ms |
| Longest sea-star pose hold | 305.5 ms | 103.8 ms |
| Longest urchin pose hold | 416.8 ms | 133.4 ms |
| Longest anemone pose hold | 271.6 ms | 121.1 ms |
| Highest cached pixel count | 12,576,480 | 12,580,888 |
| Renderer working set at end | 611,008 KiB | 624,112 KiB |

The final matrix has two callback p95 outliers, 23.1 and 23.7 ms, in the smaller nighttime meadow/pearl scenes. Longer ten-second checks of those cases report 17.6 and 17.1 ms, with draw p95 of 10.7 and 9.1 ms. Both results are retained. This does not establish a sustained 60 FPS guarantee.

Finer radial sampling increases work requests: total main-matrix deferrals rise from 459 to 2,216 while the displayed poses advance more frequently. A deferral counter alone is therefore not a freshness metric. The synthetic tight-budget test separately verifies that fixed draw order cannot indefinitely exclude a later animal. The main matrix encountered seventeen of the nineteen mesh species; supplemental native moray and batfish cases cover the other two.

## Preservation and regression evidence

All 275 unit tests and six targeted browser scenarios pass. New browser checks exercise all animals advancing under a deliberately tiny shared budget, replacement of obsolete requests, bounded pending work, and more than fifteen distinct rendered radial poses over two seconds of idle-clock motion. Existing radial/specialist checks retain pause, reduced motion, directional sea-star states and repeating bounded caches.

`qa-animation-pose-contract.mjs` compares the immutable pre-change renderer from `bcf022e` with the current renderer. All 114 sampled poses across the nineteen mesh species match pixel-for-pixel. The eighteen radial samples use phase positions shared by the old and finer grids; the other species, including cuttlefish, use unchanged arbitrary times. This verifies sampled shape/raster preservation, not every possible pose or final subjective animation acceptance. No anatomy or source-painting edits are included in this pass.

Evidence is in `artifacts/roster-native-performance/` (`baseline-full`, `final`, `cadence-confirmation` and `large-mesh`), `artifacts/animation-pose-contract/report.json`, `artifacts/animation-budget-unit.log`, `artifacts/animation-budget-browser.log` and `artifacts/animation-budget-radial-browser.log`. Native reports include runtime hashes and platform details. Population and simulation rules are unchanged. Final visual acceptance, remaining gameplay/attachment issues and the combined Windows archive remain open.
