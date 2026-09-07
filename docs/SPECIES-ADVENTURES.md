# Species adventures and narrated guide

Approved September 7: execute the five ordered milestones: expressive motion/behavior foundation; social and coral-home routines; cowfish searching and cuttlefish camouflage; 64 optional narrated guide introductions; combined playtesting and Windows delivery. Windows only; no original-game comparison research. Preserve the previous Family Journal ZIP. Do not interpret historical parked notes as a stop instruction for this authorized work.

Four featured lives: yellowtail fusilier (join, feed, rejoin), coral goby (home, excursion, return), cowfish (uncover/eat at two sand sites), cuttlefish (blend into sand and reef). Optional adventures record genuine discoveries even during free exploration. Existing care stamps remain separate. Context action E preserves Space abilities and C cleaning. NPCs demonstrate the same site preferences. No additional population, live day/night cycle, or offscreen simulation.

Biology references: Australian Museum Yellowtail Fusilier (Caesio cuning); Fishes of Australia Longhorn Cowfish species/837 and Yellow Coralgoby species/2231; Australian Museum Giant Cuttlefish as an explicitly named example for the family-level cuttlefish catalog. Schooling expanded to already documented social catalog creatures. Timings, site markers, concealment and goal sequences are game abstractions. Group identity uncertainty is retained.

Narration: one reviewed 45–65 word introduction for each of 64 catalog creatures; warm naturalist, gpt-realtime-2.1-mini / marin, generated offline using the phonics operator credential convention. Play/Stop in the field guide only, exact transcripts, separate volume, music ducking, no automatic narration or API key in the package. Cache completed clips by script/settings hash and inspect representative samples before the batch.

Acceptance: four visibly different ordinary-control adventures; stable schooling, cleaning precedence, quiet/busy population ranges; no increased bite/death outcomes in paired baseline scenarios; deterministic saves and backward-compatible journal/dive imports; responsive controls/reduced motion; all 64 clips/transcripts and offline playback; 1600x900 and 1024x768 visual checks; verified Windows package and ZIP. Follow-up candidates: goatfish, parrotfish, flashlight routines, then playable cleaner, then separately planned day/night and offscreen continuity.

## Implementation and boundaries

The four lives are available from Practice: choose Yellowtail fusilier, Orange coral goby, Longhorn cowfish or Cuttlefish, then Try adventure. Explore freely starts the same mechanics with the instruction tucked away. Hiding the instruction preserves progress. A completed life records one permanent Ways of living discovery in the Family Journal, independent of existing badges and care stamps.

Schooling requires three nearby actively schooling companions for ten continuous seconds, a suitable meal, then five seconds back with the group. Keep swimming with them. The goby chooses an existing coral refuge with E, settles, leaves for a meal, then returns and settles. Cowfish use E within 110 world units of two stable food sites; exposed food stays available for eight seconds and must actually be eaten. Cuttlefish use E near either background and remain still for two seconds, then repeat at the other background. Moving, choosing a meal, cleaning or using ink ends blending. The sand/reef tint changes gradually; the player marker remains visible.

Species behavior profiles separate social tendencies from habitat labels. Nearby eligible social fish coordinate heading, spacing and edge turns; feeding, cleaning and avoidance take precedence. Coral gobies return to a familiar refuge after eating; cowfish search suitable sand sites; satiated cuttlefish settle against a background. These are local lightweight routines. Existing predators, starting populations, renewable food quantities and fixed dive periods remain the basis of the simulation. The new patterns and posture animation are stylized sprite effects, not new anatomical rigs or a complete biological model.

## Narration production

The phonics project's operator environment supplied the credential through process.loadEnvFile; it is never copied to Atoll or its package. That API project did not allow the initially planned speech model. The available gpt-realtime-2.1-mini model with Marin generated the fixed scripts instead. No network or generative calls happen during play.

Run `node scripts/generate-narration.mjs` for a dry run; `--execute` generates only uncached scripts. Optional `--only=s2,s19` limits work. Operator dependencies come from the phonics content package, configurable with ATOLL_PHONICS_ROOT; credentials can use ATOLL_NARRATION_ENV. Completed clips are cached by script/model/voice/instructions hash. Rejected transcripts are not accepted. WAV masters remain in ignored artifacts; OGG files and their provenance manifest ship. Service transcripts are checked against the 45–65 word scripts. This is an automated wording check, not proof of every pronunciation. Narration totals about 24 minutes across 64 clips.

The guide has explicit Play/Stop, readable transcripts, an AI voice label and its own volume slider. Switching creatures, leaving the guide, stopping, finishing a clip, muting or a playback failure releases narration and restores the music level. Missing audio leaves the written introduction available. Music is reduced to 28% of its selected level while a voice plays.

## Testing with the family

Try one complete sand search first, then the cuttlefish backgrounds. Compare the goby's short out-and-back trip with the fusilier's moving companions. Notice whether the prompt explains the next action without adult translation, whether the animation communicates feeding/resting, and whether the discovery feels worth repeating with another creature. Narration is an optional field-guide visit between swims.

This delivery completes the approved five-milestone work front, not the full game's development. Next candidates remain goatfish/parrotfish/flashlight routines, playable cleaner work, deeper habitat readability, and separately scoped day/night or offscreen continuity. More original-game comparison research still requires asking the user first.

API reference: https://developers.openai.com/api/docs/models/gpt-realtime-2.1-mini and https://developers.openai.com/api/docs/guides/text-to-speech.
