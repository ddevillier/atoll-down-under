# Contributing

Follow the setup and test commands in [README](README.md) and [BUILDING](docs/BUILDING.md).
Keep package-lock.json committed and use npm ci for verification. All required
assets ship with the repository. After an intentional asset change, run
npm run assets:manifest and npm run check to update and verify the asset hashes.
Contributions must not introduce API keys or a
private project checkout as a run/build dependency.

- src/: deterministic simulation, species data, Canvas rendering, UI and audio.
- desktop/: isolated Electron launcher and local atoll:// protocol.
- assets/: complete illustrated and audio assets, with separate reserved rights.
- tests/: unit contracts and Playwright browser interactions.
- scripts/: local preview, build, packaging, authoring and QA tools.
- docs/: design, biology/source limits and implementation notes.

Prefer real player interactions and observable outcomes in UI tests. Preserve pause,
save/reload, original creature access and existing population identities when adding
activities. Native QA uses temporary profiles; never point tests at player saves.
For a gameplay change, run npm test and the relevant browser tests. For a delivery,
run the Windows workflow and verify the packaged game. Generated speech must retain
its transcript/provenance and the game's offline operation.

Do not commit node_modules, dist, local captures, credentials or original-game
reverse-engineering materials. Code changes are MIT licensed; game assets retain
the separate permission in assets/LICENSE.md. Discuss asset redistribution with
the maintainer. Further development is guided by the current product direction in
PRODUCT.md; historical milestone documents are records, not new requirements.

