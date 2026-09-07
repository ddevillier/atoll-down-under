# Provenance

## Original project content

Game code, balance values, interface text, field-guide prose, synthesized music, sound effects and the vector application icon were authored for this project. No audio samples or melodies from Odell Down Under are included.

The nine reef paintings, four 16-creature sprite atlases and eight-item food atlas were created with the built-in image-generation tool. See `ASSET-PROMPTS.json` for prompts. The first repetitive reef variants were superseded after the user's correction requesting distinct original-game-style layouts. No original game's screenshots are distributed in the game assets. The renderer segments full connected silhouettes across the atlas before assigning creatures to cells, preserving parts that extend over a nominal grid boundary. The original atlas pixels remain unchanged.

## Historical design references

- Original Windows User's Guide: https://www.myabandonware.com/download/m72w-odell-down-under
- Original screenshots: https://www.myabandonware.com/game/odell-down-under-3o0
- Dense reef reference: https://www.myabandonware.com/media/screenshots/o/odell-down-under-4ge/odell-down-under_8.jpg
- Vertical reef wall: https://www.myabandonware.com/media/screenshots/o/odell-down-under-4ge/odell-down-under_7.jpg
- Wreck and reef slope: https://www.myabandonware.com/media/screenshots/o/odell-down-under-4ge/odell-down-under_10.jpg
- Sandy terrace: https://www.myabandonware.com/media/screenshots/o/odell-down-under-4ge/odell-down-under_11.jpg
- Seagrass: https://www.myabandonware.com/media/screenshots/o/odell-down-under-3t4/odell-down-under_5.png
- Secondary mechanics reference: https://gamefaqs.gamespot.com/mac/927060-odell-down-under/faqs/42416

References established the broad mechanics and illustrated visual language. Wreck interior and the arrangement of individual habitats are new compositions. Artwork is not a recovered original production asset library.

## Third-party software and fonts

Spectral and DM Sans are self-hosted from their Fontsource packages. Their SIL Open Font License texts are included beside the fonts in `assets/fonts`. Electron and its bundled Chromium components retain their distribution license notices in the packaged application. Development dependencies are recorded in `package-lock.json` with their own licenses.

No publication rights or trademark clearance are implied by this project. The user selected the working title Atoll Down Under.

The feeding-rule review checked the [Australian Museum's Stars-and-stripes Puffer account](https://australian.museum/learn/animals/fishes/stars-and-stripes-toadfish-arothron-hispidus-linnaeus-1758/), whose diet includes molluscs and other invertebrates. This is a broad check against making the game's puffer a sponge-only feeder, not a taxonomic identification of the project's "Spotted pufferfish" or evidence for its numeric shell-size threshold. No new natural-history entry was added.


## Original-layout splash revision

`assets/title/splash.png` is newly generated project artwork with Atoll Down Under lettering, using the original Windows title-screen screenshot as a composition reference. It recreates the arrangement of a centered three-line stone title, leaning wreck, blue water, upper-right light and coral foreground. A second generation corrected the title's vertical footprint. The original screenshot is not included in the application or source archive. Animated animals are the project's existing sprites drawn over the painting.

The actual title-painting resolution is 1672 × 941. The generator did not supply native 4K output; rendering on a larger display does not make it a native 4K asset. Prompt summaries are recorded in `ASSET-PROMPTS.json`, and the selected output hash is recorded in `ASSET-MANIFEST.json`.

## Extended moray swimming pose · September 7, 2026

`assets/creatures/whitemouth-moray-swim-v2.png` is a newly generated project illustration, not an original-game asset. The selected built-in generation was `exec-d2530da6-879d-47a5-8c4e-b9737100b553.png`, a 1983×793 RGB image with a painted pale checkerboard. The user explicitly authorized local background removal after two generation attempts failed to supply alpha. `scripts/remove-moray-background.mjs` removes border-connected neutral light pixels, decontaminates soft edges and pads the canvas transparently to 1983×1000 without upscaling. The extracted runtime silhouette is 1902×353. The atlas is preserved. The animation uses a longitudinal wave with a steady head; it does not establish measured animal kinematics or validate every species-identification detail in the generated painting.
