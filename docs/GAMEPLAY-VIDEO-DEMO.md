# Captured gameplay video — September 8, 2026

Watch or download: https://atoll-gameplay-demo.ddevil88.chatgpt.site

The page is owner-private and requires the same ChatGPT account. Sites deployment `appgdep_6aa01239a5e88191b8214e2f657f8281` succeeded. An unauthenticated browser-style HTTP request reaches the expected **Sign in required** gate. Authenticated remote playback was not independently exercised; the deployed archive was verified to contain the exact tested MP4.

## Video

- 2 minutes 15 seconds, 1600×900, 30 fps, H.264/AAC stereo.
- Five directly recorded live game scenes: title, bluestreak cleaner service, stingray feeding journey, cuttlefish camouflage, flashlight fish at night.
- Actual browser-rendered game footage, with mouse/keyboard control. No new animals, meals, progress or positions injected for the recording. Read-only simulation queries locate existing opportunities.
- The soundtrack is the native `assets/audio/blue-passage.wav` master, looped and faded at the ends. No computer-recorded audio or narration is included.
- Full video/audio decode passed. An eight-second audio comparison against the source music has correlation 0.999894 after AAC encoding.
- Edited frame contact sheet inspected throughout. Capture state records show a cleaner client helped, two stingray meals, a sand camouflage pattern, and the flashlight companion join/flash. The footage does not claim every shown journey is completed.
- Download size: 23,136,042 bytes. SHA-256: `654cb97f2e102e5fd66753dec5aa96e78d41044ba7456a84ff03a89194511bf4`.

## Reproducible local artifacts

`artifacts/video-demo/` contains the original scene recordings, capture manifest, assembly script, full-resolution 1920×1080 edit, online MP4, contact sheet and verification receipt. `scripts/capture-game-demo.mjs` captures the game itself through Playwright; FFmpeg handles trimming, encoding and direct music-file muxing. No editor installation was necessary.

The separate publishing checkout is `C:/Users/Daniel/Desktop/atoll-demo-video`, source checkpoint `ca095f4b6e603ec7bb91a98e1e898cc1fae22151`. Its packaged MP4 hash matches the verified local copy. The page supplies standard playback and a direct MP4 download. No YouTube upload connector or signed-in upload session was available, so this fulfills the requested alternate hosting route.
