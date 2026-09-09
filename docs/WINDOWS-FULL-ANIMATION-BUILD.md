# Windows full-animation build — verified handoff

September 9, 2026. Runtime checkpoint **a2f92f4**. Windows x64 only.

Extract `dist/Atoll-Down-Under-Windows-Full-Animation-2026-09-09.zip` completely, then open `Atoll Down Under-win32-x64/Atoll Down Under.exe`. Keep the whole extracted folder together. F11 toggles fullscreen.

This build removes the fixed 3.5 ms animation cutoff, rasterizes mesh poses on the GPU, expands the bounded pose cache, and supplies denser phase sampling for slow creatures. All 57 playable journeys, seven resident observations, discoveries and offline narration remain included. The restored cuttlefish and caudal-fin corrections are preserved. Authored cycles and behavior speeds are unchanged.

## Verified results

| Packaged native survey | Cases | Minimum frames per case | Worst draw p95 | Worst callback p95 | Maximum pose hold | Deferred requests |
|---|---:|---:|---:|---:|---:|---:|
| Nine habitats, two sizes, day/night/cuttlefish | 54 | 180 | 15.0 ms | 18.5 ms | 61.6 ms | 0 |
| Three layouts, day/night/cuttlefish, 4K backing canvas | 9 | 239 | 16.1 ms | 19.9 ms | 80.9 ms | 0 |

All 63 cases used the WebGL mesh backend, with no page errors. Loaded and final GPU status confirmed hardware acceleration on the RTX 2080. The larger test used a 1920×1080 logical viewport and measured 3841×2160 backing pixels. These are sampled renderer/callback measurements, not monitor presentation or guaranteed 60 FPS. Normal phase quantization and occasional callback delays remain; zero budget deferrals is not a claim that every displayed frame changes every animal's pose.

- **351 unit tests passed**.
- **23 distinct browser scenarios passed** across the nine-case budget/GPU run and 16-case renderer regression run, which share two GPU tests. The full-quality sampling case was subsequently expanded to all 19 mesh species and passed again. Tests cover phase updates, bounded caches, all mesh families, painted-part alignment, pause/reduced motion, ordinary cuttlefish controls at both sizes, actual feeding and WebGL context loss.
- **38 GPU/Canvas pixel comparisons** cover 19 species at two phases. No missing opaque pixels under the coverage check; worst mean RGB difference 1.672 out of 255. The comparison contact sheet and packaged native gameplay screenshot were inspected.
- **Two packaged native functional checks passed**: fullscreen and controls, feeding/travel/map and population checks; cuttlefish context/camouflage, portable paused state, narration stop/volume and reduced motion. Profiles were isolated from family saves.
- **349 packaged source/asset/documentation files** and package metadata matched before final receipt edits. All **73 ZIP payload files** passed CRC and SHA-256 comparison against the tested application folder.
- All **six earlier Windows testing ZIPs** remain byte-identical. The scheduled cleanup can retain this latest build and its preceding rollback build. No Apple Silicon build was made.

## Artifact identity

- ZIP: `Atoll-Down-Under-Windows-Full-Animation-2026-09-09.zip`
- Size: **260,067,897 bytes**
- SHA-256: `a5aa4fb8e6ef8c44b28742886367f5979cf1f8bf5806722e78c5fa5882ab91d8`
- app.asar SHA-256: `bdb3c890e4639c8e94ecdf9cf9bc239870a72e7c7b3b7826938ffbb6e0eb5d2b`

Local receipts: `artifacts/full-animation-native-performance/report.json`, `full-animation-native-4k/report.json`, `full-quality-unit.log`, `budget-browser.log`, `full-quality-regression.log`, `full-animation-all-mesh-sampling.log`, `full-animation-native-desktop.log`, `full-animation-native-adventures.log`, `gpu-mesh-pixel-report.json`, `gpu-mesh-comparison.png`, and `full-animation-archive-report.json`.

The final README, investigation completion, this receipt and expanded external sampling test were committed after packaging. They do not alter runtime a2f92f4; the ZIP's documentation calls it a candidate. See [the capacity investigation](ANIMATION-CAPACITY.md) for comparisons, discarded experiments and the correction to earlier premature GPU-status reporting. Canvas rendering remains a functional fallback when WebGL is unavailable or lost; its full-quality cost is higher, and GPU-path timing claims do not apply to that fallback.
