# Validation record

Validated on Windows on 6 September 2026, using Node.js 22.18.0, Electron 44.2.0 and Playwright Chromium.

| Check | Result |
|---|---|
| Simulation and asset tests | 22 passed |
| Browser end-to-end tests | 8 passed; zero failed, skipped or flaky |
| Native Electron source launch | Passed |
| Packaged Windows application | Passed: local protocol, reef entry, 64 sprites and decoded music |
| Renderer errors during native check | None |
| Renderer Node exposure | Disabled |
| Visual inspection | 1600 × 900 and 1024 × 768 screenshots reviewed |
| Independent finish review | Accepted after focus restoration and visible save/load feedback fixes |
| Apple Silicon archive | ZIP CRC verified; 14 framework symlinks preserved; ARM64 Mach-O header verified |
| macOS runtime and signing | Not tested on macOS; unsigned |

## Covered behavior

Simulation tests cover the 55-species playable roster, initial protection, diets, feeding rewards, poison, hiding, day/night cleaners, cleaning interaction, horizontal wrapping and vertical boundaries, predator pursuit between sections, ability costs, pause behavior, four-stage Challenge, full-roster Tournament, continuing after death, creation budget and body selection, deterministic save/restore, invalid saves and starvation.

Browser tests exercise the menus and guide, pointer feeding, inspection, ability activation, saves and reloads, custom fish configuration, Challenge completion and ranking, all nine paintings and 64 creature bounds, audio decoding and settings, keyboard focus, and storage failure recovery. These are automated behavior checks; they do not establish long-term balance or historical numerical parity.

All nine reef images have different hashes and were visually compared as a contact sheet. The accepted revision varies major silhouettes and open-water placement: high terraces, vertical wall, sloping wreck exterior, dense coral, enclosed wreck, meadow, open reef and stacked grotto. Scene-specific shelter locations follow the new artwork.

Audio contains three original music loops and 26 effects. File checks verify OGG/WAV headers, durations and non-silent signals. Measured music peaks are below clipping, and loop-boundary amplitude differences are small. Automated audio checks establish loadability and signal integrity rather than a human listening assessment of every sound.

## Evidence and reproduction

Run `npm test`, `npm run test:e2e`, and `npm run test:desktop`. To check a packaged executable directly:

```sh
node scripts/qa-desktop.mjs "dist/Atoll Down Under-win32-x64/Atoll Down Under.exe"
```

Local evidence is in `artifacts/`: `e2e-results.json`, `desktop-report.json`, `mac-package-report.json`, desktop and browser screenshots, and the reef contact sheet. This QA output is excluded from the application package. `docs/ASSET-MANIFEST.json` records source asset hashes and image dimensions; `dist/SHA256SUMS.txt` identifies release archives.

The source reef paintings are 1672 × 941 pixels and are scaled for higher-resolution displays. The macOS archive requires a real Mac check and appropriate signing before public distribution. The working title has not undergone commercial clearance. The playable ecosystem and numeric balance are independently authored; this build does not claim exact reproduction of every original species or undocumented rule.
