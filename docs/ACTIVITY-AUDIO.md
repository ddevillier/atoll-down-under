# Spoken activity guidance

September 8, 2026. All 19 species activities now have a short spoken explanation, in addition to the existing 64 narrated natural-history introductions. Choose **Hear this activity** on the activity card, including while its step guidance is hidden. The reef pauses while the explanation plays. The dialog shows the complete text, Stop/Play controls and Return to the reef. Closing it stops speech and resumes exploration. Missing or muted audio leaves the text readable.

The voice is **Marin**, generated with **gpt-4o-mini-tts-2025-12-15**, matching the checkpoint and voice found in the phonics project's `generate-moonroot-audio.mjs`. The fixed recordings ship offline. No API call or credential is needed during play. Existing narration volume and music ducking apply. The UI identifies the voice as AI-generated.

The scripts explain authored gameplay, not new biological claims. They cover cleaner visits, sand searching/sharing, grazing circuits, companions, school feeding trips, ambush positioning, coral homes and cuttlefish patterns. Opportunities still depend on nearby animals and their appetite; narration does not promise a visitor or a completion time.

## Generation and evidence

`node scripts/generate-activity-narration.mjs` previews the job list. `--execute` generates uncached jobs; `--only=s43,s45` restricts the set. The operator key follows the phonics `.env.local` convention and is never copied into this repository. WAV masters and previous attempts remain in ignored artifacts. The shipped OGG files have a manifest containing scripts, settings hashes, audio hashes and independent transcriptions.

Speech generation used the requested checkpoint successfully. The first independent transcription model was unavailable to the credential (HTTP 403); verification used phonics' existing `whisper-1` approach instead. All completed WAVs were reused. Four ambiguous reads were rewritten and regenerated; the foxface explanation needed one further wording correction. Final transcripts match after punctuation/case, pencilled/penciled spelling and 2/two normalization only. The audit supplied no expected-text prompt to transcription. This is machine screening, not human listening approval or a guarantee of every pronunciation.

`node scripts/qa-activity-narration.mjs` verifies coverage of every current adventure, provenance, hashes, full decoding, duration, non-silence, peaks and long gaps. All 19 final clips pass, totaling **513.2 seconds**. The two new browser checks pass at 1600×900 and 1024×768, covering explicit playback, pause, replay, close, missing audio, mute and recovery. The six existing adventure/guide checks also pass in the integration run. Both viewport layouts were inspected; no additional visual redesign was needed.

The initial browser assertion incorrectly treated an OGG stream's early estimated media duration as the full file duration. Full-file decoding confirmed the complete recording. Playback tests now check readiness; native delivery checks decode every complete clip and let a representative recording reach its natural end.

Official API references: [Speech generation](https://developers.openai.com/api/reference/resources/audio/subresources/speech/methods/create), [file transcription](https://developers.openai.com/api/docs/guides/speech-to-text).
