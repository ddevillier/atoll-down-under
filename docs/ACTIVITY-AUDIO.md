# Spoken activity guidance

September 8, 2026. All 64 journey roles now have a short spoken explanation: 57 playable activities and seven resident observations, in addition to the existing 64 narrated natural-history introductions. Choose **Hear this activity** on a playable activity card, including while its step guidance is hidden, or **Hear this observation** on a resident observation card. The reef pauses while the explanation plays. The dialog shows the complete text, Stop/Play controls and Return to the reef. Closing it stops speech and resumes exploration. Missing or muted audio leaves the text readable.

The voice is **Marin**, generated with **gpt-4o-mini-tts-2025-12-15**, matching the checkpoint and voice found in the phonics project's `generate-moonroot-audio.mjs`. The fixed recordings ship offline. No API call or credential is needed during play. Existing narration volume and music ducking apply. The UI identifies the voice as AI-generated.

The scripts explain authored gameplay, not new biological claims. They cover care, sand searching, grazing, companions, schools, ambushes, homes, varied foraging, patrols, watched approaches, moving cover, nighttime excursions, cuttlefish patterns and resident feeding routines. Opportunities still depend on nearby animals and their appetite; narration does not promise a visitor or a completion time.

## Generation and evidence

`node scripts/generate-activity-narration.mjs` previews the job list. `--execute` generates uncached jobs; `--only=s43,s45` restricts the set. The operator key follows the phonics `.env.local` convention and is never copied into this repository. WAV masters and previous attempts remain in ignored artifacts. The shipped OGG files have a manifest containing scripts, settings hashes, audio hashes and independent transcriptions.

Speech generation used the requested checkpoint successfully. The first independent transcription model was unavailable to the credential (HTTP 403); verification used phonics' existing `whisper-1` approach instead. All completed WAVs were reused. Four ambiguous reads were rewritten and regenerated; the foxface explanation needed one further wording correction. Final transcripts match after punctuation/case, pencilled/penciled spelling and 2/two normalization only. The audit supplied no expected-text prompt to transcription. This is machine screening, not human listening approval or a guarantee of every pronunciation.

`node scripts/qa-activity-narration.mjs` verifies coverage of every playable and resident journey, provenance, hashes, full decoding, duration, non-silence, peaks and long gaps. All 64 final clips pass, totaling **1,630.3 seconds** (about 27 minutes). The 45 added explanations preserve all 19 previous recordings and scripts byte for byte (`artifacts/all-journeys-preserved-audio.json`). Six new clips needed wording correction; the bannerfish explanation needed two further rewrites after a word substitution and an omitted final sentence. The final recordings all match independent transcripts (`artifacts/all-journeys-audio-qa-final.log`). The two new browser checks pass at 1600×900 and 1024×768, covering explicit playback, pause, replay, close, missing audio, mute and recovery. The six existing adventure/guide checks also pass in the integration run. Both viewport layouts were inspected; no additional visual redesign was needed.

The initial browser assertion incorrectly treated an OGG stream's early estimated media duration as the full file duration. Full-file decoding confirmed the complete recording. Playback tests now check readiness; native delivery checks decode every complete clip and let a representative recording reach its natural end.

Official API references: [Speech generation](https://developers.openai.com/api/reference/resources/audio/subresources/speech/methods/create), [file transcription](https://developers.openai.com/api/docs/guides/speech-to-text).

## Previous verified Windows handoff (19 activities)

Build: `dist/Atoll-Down-Under-Windows-Spoken-Activities-2026-09-08.zip`, runtime checkpoint `0241267`. Extract the whole folder and open `Atoll Down Under.exe`. The preceding Species Life, Living Reef and Species Adventures ZIPs retain their original hashes. Only Windows was packaged.

All 314 unit checks pass. The eight distinct activity/guide browser checks pass across the integration and corrected final run; the initial duration-assertion failures are retained in the logs described above. Packaged native verification decodes all 19 new clips, plays the cleaner explanation to its natural end, confirms pause and music ducking/restoration, replays it and verifies stop-on-close/resume. The run uses isolated QA storage and reports no page errors (`artifacts/native-activity-audio-report.json`).

Before final receipt updates, all 290 checked source, asset and document files match the package. Archive CRC passes and all 73 payload files match the tested Windows application byte for byte. The final receipt and current-build links were updated after packaging; runtime files and audio are unchanged.

- ZIP size: **248,226,484 bytes**.
- ZIP SHA-256: `33b5f9643128e202f64875c6e23700b2b0c09a9a812c1e96a2d79a102cef36b1`.
- `app.asar` SHA-256: `7e4a4da8fd5179149d84c479e0254869d4f92d6ee9a0df12fc6ea97253cc0d37`.
- Integrity receipt: `artifacts/spoken-activities-archive-report.json`.
