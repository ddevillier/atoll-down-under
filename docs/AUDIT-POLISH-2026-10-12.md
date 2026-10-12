# Gameplay polish after the extended audit

Rabbitfish exchanges now treat the companion's committed grazing bite as a small portion. The usual 45–80 second NPC digestion interval is multiplied by one sixth for that exact bite, yielding 7.5–13.33 seconds. It still needs a real invited companion, the acknowledged passing encounter, the player's held lookout and genuine mouth contact with the selected live grazing patch. Other NPC meals, existing digestion/rest, danger, cleaning and real pair relationships retain their rules. No actor is teleported or made hungry by clicking replay.

“Try another exchange” keeps the same free, nearby companion when it can legitimately accept. Missing, paired, busy or committed-feeding fish are not appropriated. A real Foxface exchange in the verification run resumed lookout with the same actor in 12.42 active seconds after completion, including physical return and natural digestion. Both rabbitfish species and Hold/Move branches passed real-input feeding and visible role-exchange checks.

The dive menu now has a direct Journal button; J opens it from the reef or title. Earned discoveries and badges show a View in journal link that opens the appropriate section, scrolls to the exact entry and moves keyboard focus there. Opening the journal pauses the dive and closing it restores the prior pause choice. A focused notification remains available beyond its usual timeout so keyboard users can activate it. Journal data and save formats are unchanged.

Completion feedback now replaces an obsolete activity toast after the event batch, addressing the Nest silt-carrying message lingering after discovery. The cuttlefish's ordinary two-background goal explicitly explains that its recorded three-disguise adventure is separate; this does not invent ordinary-goal progress or merge the counters.

## Verification

- Full local unit suite: 886 passed. New checks cover contact/identity-gated recovery, replay without clearing needs or taking an existing pair, and separate cuttlefish progress.
- Targeted actual-input browser coverage: both rabbitfish species at 1600 and 1024 widths, both choices, actual NPC/player bite receipts, replay with unchanged identity, stop, motion and save lifecycle checks. Journal tests at both widths cover direct access, J, running/paused returns, discovery and badge entry focus, notification priority and keyboard activation after timeout.
- Journal event injection is an explicitly labeled presentation fixture; the rabbitfish cases supply genuine feeding/discovery integration evidence. Layout screenshots were inspected at the supported smaller size.
- The first verification found and corrected deferred modal focus overriding the earned entry. An initial replay test also clicked Retry a second time after already beginning a new watch; that controller error was corrected. Failed receipts were retained.
- Hosted checks caught a changed badge-announcement prefix used by cleaner and map acceptance tests. The established “Journal badge earned” wording was restored while retaining clickable feedback; all three affected paths passed locally afterward.

Hosted CI and exact Windows package results are recorded separately against the final commit. Detailed local logs/screenshots are under `artifacts/polish-*` and `artifacts/species-adventures/lookout-polished-replay.json` (gitignored). No original-game research, assets, narration calls, global ecology/difficulty changes or old-build cleanup were included.
