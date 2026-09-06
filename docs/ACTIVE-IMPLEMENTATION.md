# Current implementation objective

Continue the original specification and audit work with gentle difficulty. The user requests animal facts for every species first, population hills and valleys, and one zone with a modestly higher predator spawn likelihood. Increasing general chase difficulty is not a current priority.

## Order and evidence

1. Complete sourced natural-history entries for all 64 catalog creatures. Use group-level facts when an ambiguous label cannot support an exact species identification; document that limit. Keep identification, actual diet, habitat and distinctive behavior separate from simulation rules. Current coverage: 45/64; see SPECIES-FACTS-LEDGER.md and LIFE-SCIENCE-SOURCES.md. Sprite identity and original-roster parity remain separate unfinished work.
2. Author different population ranges for all nine habitats, with quiet valleys and busier areas. Outer Blue is the proposed zone for a modestly higher hunter likelihood. Measure initial and sustained densities across species, seeds and periods; preserve usable foods, cleaners, saved populations and safe arrival. Do not increase pursuit speed or damage as part of this change. Population implementation is still pending.
3. Work through ORIGINAL-DESIGN-AUDIT.md against GAME-DESIGN.md. Begin with confirmed correctness issues such as inconsistent poison stage-score penalties, then species and interaction fidelity. Historical discrepancies need original-game evidence; source uncertainty must not become an invented rule. Keep the user's gentle-difficulty constraint when resolving conflicts with the audit's earlier predator recommendations.
4. Verify gameplay, guide usability and Windows packaging after the implementation is ready. The existing fullscreen testing ZIP is a preserved baseline and does not include these in-progress facts.

## Completion boundary

Facts batch 5 adds five entries, bringing sourced coverage to 45/64. Catalog/schema checks passed; all 45 entries passed scientific-name search, reading and horizontal-overflow checks at 1024 and 1600 widths. Royal gramma facts explicitly identify its Atlantic range; the checkerboard hawkfish remains an unresolved catalog identity with a named example. Nineteen entries still need sourced facts. Population and gameplay work remains pending, and the Windows testing ZIP is unchanged.

Facts batch 4 adds nine entries, bringing sourced coverage to 40/64. Catalog/schema checks passed; all 40 entries passed scientific-name search, reading and overflow checks at 1024 and 1600 widths. Source review records the yellowspot emperor's activity discrepancy, ambiguous common-name matches, and source errors deliberately excluded from educational text. Population and gameplay changes remain pending until the facts pass is finished.

Facts batch 3 adds eight species entries (palette surgeonfish, sixbar wrasse, regal angelfish, painted frogfish, crocodile needlefish, whitemouth moray, rainbow runner and longfin batfish). All 31 current entries passed catalog/schema validation and browser scientific-name search, reading and horizontal-overflow checks at 1024 and 1600 widths. Sources are recorded with claim-specific limits. Thirty-three entries remain without sourced facts. Simulation and population changes remain pending.

Facts batch 2 adds ten entries, including eight explicitly identified at group/genus level rather than inventing species names. All 23 entries passed catalog/schema checks and browser delivery/overflow checks at 1024 and 1600 widths. Sources and their limits are recorded in LIFE-SCIENCE-SOURCES.md. Forty-one entries still need researched content; group entries also retain unresolved exact identity. Population and simulation changes remain pending.

Facts batch 1 verification: all 13 current entries passed catalog/schema checks. Browser smoke inspection searched scientific names, opened each entry and confirmed its first paragraph and lack of horizontal overflow at 1024 and 1600 pixel widths. The existing keyboard-reading natural-history browser test passed. This checks content delivery, not biological accuracy; the source review is recorded separately. No simulation parameters or packaged testing files changed.

The objective is not complete when one facts batch passes or population counts vary. All requested species coverage, habitat changes, applicable specification/audit work and verification remain in scope. This document tracks work; it does not replace the specification or waive unresolved audit items.
