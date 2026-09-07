# Bottom routes on visible support

Nineteen of the twenty-seven bottom routes were revised after inspecting all nine habitat paintings with their generated residents and route guides. The clearest old defects were paths spanning Sea Fan Garden and Quiet Grotto cave openings, and the Wreck's open blue window. Valid route coordinates alone had concealed these visual errors.

The new paths use visible coral ledges, sand corridors and wreck timber. Sunlit Crest's crab/urchin path moves onto the cave roof. The Terrace uses its sandy corridor and a separate lower shelf. Outer Blue residents occupy distinct coral plates. Garden residents use three separate ledges. Cathedral residents move onto the upper rock and pale right-hand substrate. Wreck residents use rubble and two timber surfaces. The Meadow's central path avoids the large grass columns. Grotto residents use three separate rock shelves. Pearl Sands' routes and the existing seahorse holdfast were retained after inspection.

These are authored 2D support paths, not a collision mesh or measured habitat model. No background art, animal animation, population slot, diet or calorie value changes. Existing resident-food placement aligns the same resources to the revised paths, so some food positions change too. No new original-game or natural-history research was used.

## Saves and simulation

Restore recognizes the exact previous authored route arrays and moves only those residents onto the corresponding revised route. It preserves travel direction and maps progress along the ledge before existing food alignment runs. Obsolete visual meal handling is cancelled; food already consumed remains consumed, and an uncommitted reach grants nothing. Current saves and independent valid routes are untouched. Reopening the migrated save is idempotent. The existing resource alignment can reposition an urchin close to its food, as in fresh populations.

All 277 unit tests pass. New file-import checks cover previous routes across all nine sections, committed/uncommitted meal state, unchanged RNG/IDs, animal and food counts, food amount/regrowth, travel direction and repeated restore. Existing checks verify all six resident species reach real meals in all nine habitats, walk their routes, turn at ends and respawn on support. Three browser scenarios retain seahorse picking at both desktop sizes, resident pause/reduced motion, bounded mesh caches and travel/withdrawal effort.

Pressure testing records 26 bites and zero deaths in 110 scenarios with unchanged initial populations. Runtime hashes are included. This supports continuity of the existing gentle encounter balance; it is not a guarantee that every individual trajectory is unchanged.

## Visual evidence and limits

The initial batch contains nine full reef-canvas views with route guides. One correction batch revised the nineteen paths; nine guide-free confirmation views were inspected. These retain generated seed-42 communities, with nighttime residents in eight habitats and the daytime seahorse in the Meadow. The harness enters Practice through the UI, then selects each habitat programmatically and pauses initial placement. They are populated-world views, not claims of uninterrupted mouse-driven travel.

The named cave/window crossings are removed in the confirmation views. Plant texture, slope perspective, overlap with swimming fish and fine foot contact remain approximations; the paintings have no foreground depth masks. Seahorse selection remains verified, but the artwork cannot physically wrap around a painted stem in 3D. No further anatomy polishing or new raster generation was performed.

Evidence: `artifacts/ground-support/initial/`, `confirmation/`, `pressure.json`, `artifacts/ground-support-unit.log` and `artifacts/ground-support-browser.log`. Full-roster visual acceptance and combined Windows delivery remain open; the previous testing archive is preserved.
