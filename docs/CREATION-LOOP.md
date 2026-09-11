# Create, test, keep and return

September 10, 2026. Implementation of the approved six-stage plan. The selected first life is a small grazer exploring and finding refuge. Later sand-sharing, social roles, neighbor memory and modular anatomy remain separate work fronts.

## Delivered behavior

- The editor offers explicit rounded, slender and sturdy bodies. Statistics no longer silently change the body or starting habitat. Name, color, active period, diet and existing abilities remain available. Invalid lure combinations explain the problem before a new fish can be kept or tested. The 1,600-point budget remains unchanged.
- Test swim uses the production simulation with repeatable food, refuge and harmless visitor opportunities. It starts at 55 energy, prevents lethal outcomes, blocks travel and persistence, and never adds journal rewards. Reset repeats the same conditions; Change my fish returns to the draft and preserves the previous live dive.
- My creations keeps named fish in IndexedDB, including their last dive and actual memories. Resume, New swim, Make a variation and Rename are distinct actions. A variation owns a new blueprint and identity; renaming preserves identity. Failures remain visible and a live dive can still be exported.
- Small grazers can choose an existing refuge with E, leave for a needed meal, return and settle. Home is identified by habitat and shelter index. Actual shelter, feeding and care events create personal memories without inflating real-species achievement counts. Maps can be opened at the remembered refuge's habitat.
- Created fish receive their own guide context. It identifies them as inventions and explains their actual game diet, shelter compatibility and ability, with a separate route to real-species entries.
- The preview and shelf animate existing rigs. Gameplay retains existing braking, turns, feeding and settling movement. Refuge markers and actual pursuit acquisition/release feedback expose the consequence of hiding. This is not a new whole-roster animation overhaul.

## Data and lifecycle contracts

Creation metadata has its own version, stable ID, optional parent ID, revision, normalized blueprint, bounded memories and life number. The editable draft never aliases the simulation config. A saved record contains both metadata and a simulation snapshot in one IndexedDB transaction.

Portable exports use `atoll-dive` envelope version 2, retaining simulation state version 1 with optional creation metadata. The importer accepts envelope versions 1 and 2. Legacy custom dives derive a stable migration ID from seed and blueprint, reconstruct traits from the live saved fish, and retain their world. A new-style metadata/config or static gameplay-trait mismatch is rejected after applicable legacy migrations. Identical imported state reuses its identity; a conflicting incoming record becomes a separate copy. Older game versions are not expected to read new version-2 exports.

New swim and death continuation increment the life number and reset the current home/trip while preserving historical memories. Ordinary saves, home transitions, periodic checkpoints, visibility changes and important creation events persist progress. An interrupted/failed write is not reported as successful creation storage. As with existing saves, abrupt process termination can lose changes since the last completed checkpoint.

## Verification record

The complete unit suite passed **357 tests**. New cases cover configuration ownership, variations, legacy migration, explicit forms, invalid memories, actual refuge/meal completion and trial shelter/hunger/isolation rules. Existing portable-save rejection coverage now uses a genuinely unsupported future version rather than the newly supported version 2.

The affected browser run passed **12 distinct scenarios**, including creation lifecycle, trial isolation, creation storage failure, duplicate/conflicting imports, both supported creation layouts, a generated-reef ordinary-controls refuge/meal/return, fullscreen, working crushing jaws, creation budgets, existing saves and errors. Storage recovery was subsequently exercised successfully. Final confirmation and packaging results are recorded in the Windows handoff receipt.

The first ordinary-controls refuge test selected food near the refuge without establishing departure. It was corrected to verify departure and a reachable actual bite, then passed. A later lifecycle check read state before asynchronous resume finished; it now waits for the requested identity. These were diagnosed failures, not counted as passing runs.

`artifacts/creation-generated-refuge.json` records a successful generated community at seed 1: a coral trout began pursuit at simulation time 52.42 and released the player for concealment at 55.27. The test uses production steering/feeding commands and accelerated time, without replacing entities or appetite. This is simulation evidence, separate from the browser's ordinary-controls feeding/refuge proof.

Native source checks verified fullscreen, production test-swim concealment/emergence, keeping, reload/resume and the custom guide in an isolated profile; a recording and screenshots are under `artifacts/creations-native`. The nine-case native source survey covered custom day/night and cuttlefish players in three habitats, with zero budget deferrals. Packaged measurements belong in the final receipt, not this source-run claim.

The independent UI review's final disposition is **ship**. Its one material finding, clipped test-safety text, was resolved at 1280×720 and 1920×1080. See [the review](CREATION-UI-REVIEW.md). The existing visual system was extended, not replaced.

## Practical limits

No child or returning-fan playtest has been conducted. Voluntary replay, comprehension and enjoyment remain unverified. The first custom role is complete; other diets keep free exploration and applicable personal care memories, not invented species-specific journeys. Ability mechanics were not broadly rebalanced. No new narration was generated, and no offscreen ecosystem or extra population was added.

Next, watch whether a player deliberately changes one trait and returns to their original fish. Use that observation to choose between sand-sharing feedback and a compatible social-browsing role. Do not automatically expand the task catalog.

## Completion audit

Four delegated contributors supported this milestone: `creation_finish_reviewer` reviewed the interface, `creation_documenter` recorded its design contract, `creation_persistence_completion` audited and fixed portable identity/storage recovery, and `creation_lifecycle_completion` audited and fixed lifecycle/defense feedback. The main agent integrated and packaged the result.

The final correctness pass makes object-key reordering irrelevant to identical imports, reconnects storage after IndexedDB connection closure, prevents terminal or paused lives from earning return memories, and emits pursuit-release feedback when an active defense actually clears a predator target. Regression coverage exercises those boundaries, repeated trips, travel/reload, death continuation and deterministic trials. The final Windows receipt records the refreshed build and its test results.
