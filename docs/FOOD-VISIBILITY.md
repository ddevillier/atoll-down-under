# Optional food visibility

This source follow-up addresses the current reef-readability baseline without removing food or changing population and difficulty settings. No original-game comparisons or new assets were used.

Press **H** during a dive, or enable **Highlight nearby suitable food (H)** in Settings. The preference starts off and persists locally. Up to three suitable meals within 480 world units receive small contrasting brackets; the closest also receives a food label. H toggles the aid off again. Typing in an input field or using a modified H shortcut does not toggle it.

Hints respect the current fish's diet, prey-size and armor rules, food depletion, living prey and poison resistance. Cleaners are excluded by the shared food rule. The aid does not select or consume a meal, change swimming, grant protection, alter food supply, or use simulation random draws. Existing inspection, selected-meal and active cleaning feedback takes precedence over the extra markers. An area with no suitable nearby meals displays no markers.

All 138 unit/asset checks pass. Four focused browser scenarios pass, covering the new preference and keyboard controls, persistence, actual mouse feeding, existing food selection, fullscreen controls, Settings and rendering. Captures at 1024×768 and 1600×900 were reviewed together: `artifacts/food-hints-1024.png` and `artifacts/food-hints-1600.png`. Evidence: `artifacts/food-hints-e2e-results.json`.

This is source/browser verified and is not included in the parked Windows Cleaner Queues ZIP. It is a limited visibility aid; it does not establish that all nine paintings have sufficient visual contrast or close the broader gameplay audit.
