# Atoll Down Under

An offline, widescreen 2D life-science exploration game with original painted artwork, creature sprites, relaxing music, and sound effects. Inspired by the ecological play of Odell Down Under; it does not include the original game's artwork, music, text, or executable.

## Play

On Windows, open `dist/Atoll Down Under-win32-x64/Atoll Down Under.exe`. Keep the whole application folder together. A ZIP of the portable application is supplied in `dist`.

The verified gameplay testing build is `dist/Atoll-Down-Under-Windows-Spoken-Activities-2026-09-08.zip`. It includes [spoken guidance for all 19 activities](docs/ACTIVITY-AUDIO.md); choose Hear this activity on the activity card. It adds playable cleaner care, grazing routes, companion trips, shared school feeding and ambush hunting to the full-roster animation and local ecology uplift. Cuttlefish animation is preserved. Extract it completely before opening the executable. Windows starts fullscreen; F11 switches to a window. Fullscreen controls also appear in File, Settings and the dive toolbar. Escape still pauses for inspection. See [the testing guide](docs/TESTING.md).

The [original-design audit](docs/ORIGINAL-DESIGN-AUDIT.md) records the remaining gameplay gaps and measured predator pressure. This build includes all 64 sourced guide entries, varied habitat populations, consistent poison score penalties, the complete Tournament preview and named portable saves. Start a new dive for the new populations. Predator pursuit and damage remain gentle; the full audit is not yet resolved. See [the build receipt](docs/WINDOWS-SPECIES-LIFE-BUILD.md).

See [named, portable dive files](docs/PORTABLE-SAVES.md) for backup and import instructions. Earlier testing ZIPs remain available.

From source (Node.js 22 or later):

```sh
npm ci
npm start
```

For a local browser development preview: `npm run dev`, then open http://127.0.0.1:4173. The production application is a desktop Electron app and needs no server or internet connection.

The living title now responds to your mouse and plays the peaceful Blue Passage arrangement. Open File → Family journal, or find it in the field guide, for shared badges, species care stamps and journal backup/restore. See [care and journal rules](docs/FAMILY-JOURNAL.md).

Nineteen optional Practice adventures introduce cleaner care, grazing recovery, shared feeding trips, ambush hunting, coral-home visits, sand searching and cuttlefish camouflage. Each records a Ways of living discovery in the Family Journal. All 64 guide entries have an optional narrated introduction with a transcript; press Play to listen. See [ways of living](docs/SPECIES-LIFE.md).

## What's here

- Nine distinct illustrated habitats: sunlit crest, high terrace, diagonal wreck cliff, vertical coral wall, dense coral cathedral, wreck interior, seagrass meadow, sandy shelf, and stacked grotto.
- 64 illustrated marine creatures, with 57 Practice choices and the established 55-species Challenge/Tournament roster.
- Practice, four-life Challenge, full-roster Tournament, and a configurable Create-a-Fish mode.
- Species-specific diets, food rejection, poison, energy use, parasites, day/night cleaners, concealment, predator pursuit across reef boundaries, renewable food, abilities, scoring, and advancement.
- Paused inspection, a searchable field guide and glossary, three manual save slots plus a last-dive save, and local Reef Rulers scores.
- An illustrated nine-habitat map with visited places, suitable meals and optional directions for your next swim.
- Three original stereo music loops and 26 effects. Editable synthesis source and uncompressed WAV masters are included.

See the [nine-scene contact sheet](docs/REEF-CONTACT-SHEET.jpg) for the revised habitat compositions. The [implementation specification](docs/GAME-DESIGN.md), [visual system](DESIGN.md), and [validation record](docs/VALIDATION.md) explain the shipped design.

## Controls

| Input | Action |
|---|---|
| E / context button | Use the species activity: help a client, inspect sand, invite a companion, choose an ambush, choose a home or blend |
| Mouse movement | Swim toward the pointer; while ambushing, aim without leaving the position |
| Click an organism | Approach and attempt to eat; playable cleaners instead help suitable clients |
| Stop inside shelter | Hide, if your body fits |
| Stop beside a cleaner | Request parasite removal |
| Space | Activate your special ability |
| Escape | Pause and inspect; resume |
| P | Pause / resume |
| F | Field guide |
| M | Reef map and optional swim directions |
| Ctrl/Cmd + S | Save the last dive |
| F11 | Leave or enter desktop fullscreen |

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
```

Browser tests start their own localhost server when one is not already running. The native desktop test uses isolated temporary storage and launches a hidden test window and verifies the real local protocol, game startup, sprite loading, and music readiness. Windows is the authorized delivery target.

Run `python scripts/package-releases.py` after the Windows build to create the Windows portable ZIP, source ZIP, and SHA-256 checksums. Python 3 is required for this archive step.

## Exploration revision in progress

The current revision replaces player-first predator targeting with nearest suitable food selection, feeding/rest cycles and bounded pursuits. Communities include more small foragers and grazers; a shark is no longer forced into every scene. Your first habitat remains protected while you swim and observe, until you eat, use an ability, or leave that habitat.

Press Escape and click an organism to inspect its current activity and relationship to your fish. Observations are recorded in **Field guide → Field notes** and saved with the dive. These notes describe the game's model; they are not a substitute for a scientific species reference.

**Field guide → Food web** lets you follow feeding connections through the creature catalog. **Reef life** explains coral animals, plankton, sponges and grazing, with observation questions and NOAA source references. Each explanation distinguishes real biology from the processes simplified or omitted by the game. Inspection now freezes sprite animation as well as the simulation. Other fish visit cleaners too: watch a client arrive, wait, receive cleaning, and leave.

## Fidelity and limits

This is a playable work in progress. Ecological pacing, educational depth, animation, and visual fidelity are still being refined. Numeric balancing, creature roster, names of habitats, field-guide prose, and ability effects are independently authored. It is not a byte-for-byte emulation or a claim of exact historical parity. Species sizes and diets are game abstractions, not a scientific reference.

The image-generation tool produced approximately 1.5K–1.7K source paintings; the renderer scales smoothly to 4K displays. These are new high-resolution illustrations relative to the original game's small screens, not native 4K painted masters. Original prompts are in `docs/ASSET-PROMPTS.json`.

The chosen title has not been commercially cleared. See `docs/PROVENANCE.md` for asset sources and licenses. No account, multiplayer, telemetry, or online leaderboard is required.

The renderer preserves complete sprites that cross atlas grid boundaries. Swimming uses separate stylized articulation for fish, sharks, eels, rays, cuttlefish and seahorses, with smoother turns. These animations illustrate different forms; they are not biomechanical reconstructions.
