# Windows testing milestone

Atoll Down Under - Windows populations testing build
Date: 2026-09-06
Runtime source commit: 26940f9
SHA-256: f5fcfe92ca7eaff82c52bcdc67442a13c496d0c29a90fe8ccbee5ffb08fcaadc
Archive bytes: 216196703

Extract the complete ZIP and run Atoll Down Under-win32-x64/Atoll Down Under.exe.
Windows x64 only. Starts fullscreen; F11 toggles windowed mode; Escape inspects.

Includes sourced facts for all 64 catalog creatures (ambiguous species identities remain labeled), nine habitat population ranges, a 45% second-hunter chance in Outer Blue versus 25% elsewhere, and consistent poison score/progression penalties.
Start a NEW Practice dive to see new populations. Existing saves preserve their animals.
Predator pursuit speed and bite damage have not increased.

Verified: 109 unit/asset checks; prior full 27-scenario browser suite for populations plus four focused scoring checks; native packaged fullscreen, steering, feeding, travel and map checks; packaged 64-entry fact data, population rules and score penalty; 72 packaged runtime/asset files matched source; ZIP CRC and packaged payload equality.
Population evidence: 14,850 initial habitat populations, 54 fixtures with verified 180-second simulation duration, 55 successful ten-minute exploration runs.

This is a testing milestone. The original-game fidelity audit remains open, including roster parity, food-chain exceptions, original scoring details, animation and scene interaction.
Earlier fullscreen ZIP preserved.

Native test results:

```json
{
  "report": {
    "origin": "atoll://game",
    "ready": true,
    "splashReady": true,
    "mode": "practice",
    "musicReady": 4,
    "nodeExposed": false,
    "species": 64,
    "fullscreenStartup": {
      "active": true,
      "bounds": {
        "x": 0,
        "y": 0,
        "width": 1171,
        "height": 659
      },
      "display": {
        "x": 0,
        "y": 0,
        "width": 1171,
        "height": 659
      },
      "coversDisplay": true
    },
    "factCount": 64,
    "counts": [
      16,
      19,
      15,
      15,
      20,
      16,
      14,
      12,
      10
    ],
    "outerBlueChance": 0.45,
    "factsVerified": true,
    "populationsVerified": true,
    "scoringVerified": true,
    "fullscreenVerified": true,
    "feedingFeedbackVerified": true,
    "mouseSteeringVerified": true,
    "edgeTravelVerified": true,
    "shellfishFeedingVerified": true,
    "passiveJawsVerified": true,
    "reefMapVerified": true
  },
  "isolatedProfile": true,
  "errors": []
}
```
