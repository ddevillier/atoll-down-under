# Animation capacity investigation

September 9, 2026. Windows release candidate; final packaging evidence follows after native verification.

## Finding and implementation

The user's concern was valid: a fixed **3.5 ms per-frame mesh budget** imposed held poses without adapting to the computer's available capacity. It was independent of the GPU and applied even when the surrounding frame had time available. The **512-frame / 48 MiB RGBA cache** also reached its limits in the measured scenes. Separately, a small snail's 16 samples per cycle, 0.45 Hz cycle and 0.55x resting clock produced only **3.96 new poses per second**. That naturally quantized hold cannot be fixed by raising the compute budget alone.

The new normal rendering path requests every current pose, without the 3.5 ms cutoff. It retains explicit finite-budget operation for fallback diagnostics and fairness regression tests. All mesh animals now receive at least **24 pose samples per second at rest**, while keeping their authored cycle speeds. The cuttlefish retains its existing 48-sample cycle, which already exceeds that minimum. Painted-part fish continue their continuous per-frame transforms; their geometry and movement amplitudes are unchanged.

A shared WebGL surface draws each generated mesh in **one triangle draw call**, replacing up to 640 separately clipped Canvas image draws per pose. The result is copied into the existing independent pose canvases, preserving the rest of the Canvas renderer, layering and tint behavior. Source textures are bounded to 64; pose canvases are bounded to **2,048 frames and 128 MiB of RGBA pixels**. Those bounds exclude browser overhead, source paintings and other game memory. If WebGL is unavailable or its context is lost, the existing Canvas mesh rasterizer remains available. Full-quality Canvas fallback is functionally supported, but has higher measured cost than the GPU path.

An intermediate experiment cached fixed rig influence calculations. It did not improve the native measurements and was removed. Increasing sampling with only the Canvas rasterizer also produced frame-time spikes. Neither experiment is presented as the shipped optimization.

## Correcting the GPU evidence

This machine reports an AMD Ryzen 7 2700X and NVIDIA RTX 2080. A paired startup probe in the same Electron process reported `disabled_software` before asset loading, then `enabled` after loading and again at completion. The initialized renderer identifies NVIDIA RTX 2080 through ANGLE/D3D11. The older QA script queried GPU status too early. Its CPU/callback timings remain measured data, but the accompanying software-rendering interpretation was not justified. Previous build receipts have been corrected accordingly.

The performance script now records early, loaded and final GPU status, GPU renderer information, the mesh backend, any budget override, actual backing-canvas dimensions, runtime hashes, errors and per-animal requests/deferrals/pose holds. It also accepts explicit viewport height for larger-display tests.

## Comparison experiments

Nine generated scenes per experiment: three habitat layouts with day, night and cuttlefish players at 1600×900. The first three runs sampled four seconds per case; denser-sampling runs sampled six seconds. Timings are single-machine observations, not controlled hardware benchmarks or monitor presentation guarantees. Each run executes the real native requestAnimationFrame loop in an isolated save profile.

| Configuration | Worst case draw p95 | Worst callback p95 | Deferred requests |
|---|---:|---:|---:|
| Previous sampling, 3.5 ms budget | 9.8 ms | 17.2 ms | 553 |
| Previous sampling, 8 ms budget | 14.6 ms | 20.2 ms | 66 |
| Previous sampling, no cutoff | 15.0 ms | 22.1 ms | 0 |
| Denser sampling, larger cache, Canvas | 26.4 ms | 41.0 ms | 0 |
| Denser sampling, larger cache, GPU mesh | 15.0 ms | 18.4 ms | 0 |

The initial GPU comparison recorded a maximum pose hold of 99.3 ms, with most cases around 50–56 ms, versus 266.6 ms in the 3.5 ms comparison. Pose identity is sampled at renderer callbacks, so normal sample quantization and callback delays are included; a changed canvas is not proof that every subpixel change is perceptible. Zero budget deferrals does not mean zero frame-time spikes.

Local evidence: `artifacts/budget-3.5`, `budget-8`, `budget-unlimited`, `budget-full-quality`, `budget-cached-influences` and `budget-gpu-mesh`, each containing a native report; `budget-gpu-info.json` records the initialized hardware probe. The complete roster survey, larger-display stress case, visual comparison and Windows receipt will establish the final handoff.
