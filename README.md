# Atoll Down Under

An offline, widescreen 2D reef-survival game with original painted artwork, creature sprites, relaxing music, and sound effects. Inspired by the ecological play of Odell Down Under; it does not include the original game's artwork, music, text, or executable.

## Play

On Windows, open `dist/Atoll Down Under-win32-x64/Atoll Down Under.exe`. Keep the whole application folder together. A ZIP of the portable application is supplied in `dist`.

For Apple Silicon Macs, `dist/Atoll-Down-Under-mac-arm64.zip` contains an unsigned app and setup notes. This archive has been checked for integrity and preserved framework links, but has not been run on macOS.

From source (Node.js 22 or later):

```sh
npm ci
npm start
```

For a local browser development preview: `npm run dev`, then open http://127.0.0.1:4173. The production application is a desktop Electron app and needs no server or internet connection.

## What's here

- Nine distinct illustrated habitats: sunlit crest, high terrace, diagonal wreck cliff, vertical coral wall, dense coral cathedral, wreck interior, seagrass meadow, sandy shelf, and stacked grotto.
- 64 illustrated marine creatures, including 55 playable species and nine supporting reef residents.
- Practice, four-life Challenge, full-roster Tournament, and a configurable Create-a-Fish mode.
- Species-specific diets, food rejection, poison, energy use, parasites, day/night cleaners, concealment, predator pursuit across reef boundaries, renewable food, abilities, scoring, and advancement.
- Paused inspection, a searchable field guide and glossary, three manual save slots plus a last-dive save, and local Reef Rulers scores.
- Three original stereo music loops and 26 effects. Editable synthesis source and uncompressed WAV masters are included.

See the [nine-scene contact sheet](docs/REEF-CONTACT-SHEET.jpg) for the revised habitat compositions. The [implementation specification](docs/GAME-DESIGN.md), [visual system](DESIGN.md), and [validation record](docs/VALIDATION.md) explain the shipped design.

## Controls

| Input | Action |
|---|---|
| Mouse movement | Swim toward the pointer |
| Click an organism | Approach and attempt to eat |
| Stop inside shelter | Hide, if your body fits |
| Stop beside a cleaner | Request parasite removal |
| Space | Activate your special ability |
| Escape | Pause and inspect; resume |
| P | Pause / resume |
| F | Field guide |
| Ctrl/Cmd + S | Save the last dive |
| F11 | Desktop fullscreen |

Small fish can hide in the marked shelters. Use Inspect to find them. Daytime cleaners are bluestreak cleaner wrasses; nighttime cleaners are banded coral shrimp. Wait nearby without clicking. The night reef stays bright, as in the reference game's approach.

## Audio

| Track | Use | Duration |
|---|---|---|
| Blue Passage | Title / menus | ~101 seconds |
| Glasswater | Daytime reef | ~107 seconds |
| Moon Through Water | Nighttime reef | 128 seconds |

The soundtrack uses newly composed chord progressions and melodic patterns, soft synthesized mallets, pads, bass, and stereo delay. No recorded samples or original-game melodies are used. Audio starts after the first user interaction. Music and effects have independent volume controls.

To rebuild all audio: install Python `numpy` and FFmpeg, then run `python scripts/compose_audio.py` from this folder. Game audio uses OGG Vorbis; the source project also includes WAV masters. The desktop package omits the WAV masters to reduce download size.

## Project layout

- `src/`: game data, deterministic simulation, Canvas renderer, UI, and audio control.
- `assets/`: nine reef paintings, four creature atlases, food atlas, original icon, licensed fonts, and audio.
- `desktop/`: isolated Electron launcher using a local `atoll://` protocol.
- `scripts/`: local server, asset tools, audio composer, packaging and QA.
- `tests/`: behavior tests, asset verification, and end-to-end UI tests.
- `docs/`: design, source notes, asset prompts and validation evidence.

## Build and verify

```sh
npm test
npx playwright install chromium
npm run test:e2e
npm run test:desktop
npm run package:win
npm run package:mac
```

Browser tests start their own localhost server when one is not already running. The native desktop test launches a hidden test window and verifies the real local protocol, game startup, sprite loading, and music readiness. macOS builds target Apple Silicon; they are unsigned and require verification on a Mac before distribution.

When packaging macOS from Windows, run `package:win` first. The macOS packaging script uses that application archive and preserves the official Electron ZIP's Unix symlinks without extracting them on Windows. This path also requires Python 3 (or set `ATOLL_PYTHON` to its executable). Running `package:mac` on a Mac uses the native packager. Run `python scripts/package-releases.py` after both builds to create the Windows portable ZIP, full source ZIP, and SHA-256 checksums.

## Fidelity and limits

This is a complete playable first version with the major requested systems. Numeric balancing, creature roster, names of habitats, field-guide prose, and ability effects are independently authored. It is not a byte-for-byte emulation or a claim of exact historical parity. Species sizes and diets are game abstractions, not a scientific reference.

The image-generation tool produced approximately 1.5K–1.7K source paintings; the renderer scales smoothly to 4K displays. These are new high-resolution illustrations relative to the original game's small screens, not native 4K painted masters. Original prompts are in `docs/ASSET-PROMPTS.json`.

The chosen title has not been commercially cleared. See `docs/PROVENANCE.md` for asset sources and licenses. No account, multiplayer, telemetry, or online leaderboard is required.
