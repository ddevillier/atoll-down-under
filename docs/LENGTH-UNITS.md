# Field-guide length units

The existing metric preference was unused. Settings now exposes **Metric length summaries (cm / m)**. It defaults on; switching it off displays inches or feet in the 28 existing measured length summaries. The preference persists across reloads. Natural-history paragraphs and source records retain their wording; entries without a length gain no invented measurement.

Conversion uses 2.54 centimetres per inch and 30.48 centimetres per foot, rounds to one decimal place, removes redundant trailing zeros and labels the result approximate. It preserves qualifiers and anatomical definitions such as total/standard length. Existing parenthetical imperial equivalents are replaced rather than duplicated. Gameplay size, custom-fish budgets and simulation values do not change.

All 140 unit/asset checks pass, including coverage of all 28 measured summaries and unchanged source records. Four relevant browser scenarios pass for unit selection/persistence, natural-history browsing, food hints and existing Settings/rendering behavior. A focused follow-up confirms the longer converted summary remains readable after scrolling at 1024×768; captures at 1024×768 and 1600×900 were reviewed. Evidence: `artifacts/length-units-e2e-results.json` and `length-units-focused-results.json`.

This option is now included in the parked Windows Guide Options build, with native switching and preference-persistence verification; see WINDOWS-PARKED-BUILD.md. It resolves the unused length-unit preference, not the broader audit's scoring, leaderboard or historical-comparison considerations. No new natural-history or original-game research was used. The user has parked further work.
