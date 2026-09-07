# Living title and family journal — implementation plan and delivery

The user authorized full execution, then parking after this complete work front. Direction: many small mouse interactions; a peaceful, mysterious title; progress from getting better at caring for fish. Windows only. Original-game research, Tournament reconstruction and harder population tuning are outside this work front.

## Implemented scope

The existing painted widescreen title and compact menus remain. Eighteen animated visitors comprise two five-fish schools, four curious fish, a cleaner and client, and two shy residents. Schools follow curved routes and respond to nearby pointers; curious fish approach; the cleaning vignette alternates with quiet waiting; clicks create a restrained bubble trail and send shy residents back toward cover. Clicks have a cooldown. Dialogs stop title interactions. The title simulation uses its own clock and no gameplay randomness. Lettering and the menu band remain clear. Reduced motion freezes travel, body animation and lighting; click feedback stays brief and stationary.

Blue Passage is an original 128-second, 60 BPM loop with sustained harmony and sparse soft bells. Only this title arrangement changed; the day/night scores are untouched. Title playback attempts at startup and fades over two seconds. Blocked playback has a visible Enable sound button and retries on interaction, including a previously blocked same track. Music and effects retain separate volume controls and mute.

Family journal is available through File on the title and through the field guide. It is shared locally across all dives, with no account or profile. Illustrated badges show requirements, earned dates and visitor previews; three secret badges start as silhouettes. The species album marks played species and earned care stamps. All playable fish remain available from the start. Created fish can earn activity badges, but do not count toward catalog species milestones.

## Care and achievements

A species is played after 60 active seconds in a life. For a care stamp, needed suitable meals must restore 10 energy in total, followed by 30 continuous active seconds at Energy >=70 and Health >=80. Falling below either condition resets the healthy interval; pause freezes it. A life restart resets its local counters. Existing global accomplishments survive death, restart and loading older dives.

**Implementation refinement:** the planning draft asked for one 10-energy meal before a care stamp. Five plankton-only species have a maximum nine-energy bite, making their stamps impossible. Several needed meals therefore accumulate toward the stamp. The single-meal badge remains unchanged. Food nutrition, diets, population and difficulty are untouched.

| Badge | Requirement | Title visitor |
|---|---|---|
| First Good Meal | One suitable meal actually restores >=10 energy | — |
| Fresh Again | A completed cleaning removes >=10 actual parasite damage | — |
| Safe Harbour | Five continuous active seconds hidden in suitable physical shelter | — |
| Well Cared For | First species care stamp | — |
| Care Keeper | Three distinct species care stamps | Cuttlefish |
| New Perspective | Three distinct species played | Ray |
| Many Lives | Ten distinct species played | Mixed school of three |
| Local Explorer | Three distinct habitats entered | Seahorse |
| Around the Atoll | All nine habitats entered | — |
| Night Owl (secret) | A needed >=10-energy meal at night | — |
| Good Neighbours (secret) | Inspect an NPC while it is receiving cleaning | — |
| School Guest (secret) | Ten continuous seconds within 180 units of three live, same-species schooling NPCs | — |

Rewards activate on the next return to the title, with a maximum of 24 visitors. Splash actions never earn journal progress. Badges use a quiet chime and a four-second toast queued after immediate gameplay feedback, without pausing play.

Care reminders occupy the existing state area after inspection, cleaning, hiding, meals, routes, protection and shelter messages. Food appears below 60 energy and clears at 70; cleaning appears at 10 parasite damage and clears below 3. Injury/poison recovery is explained when fed. A short comfortable-state acknowledgment follows improvement. The existing reminders setting controls these prompts.

## Persistence

The versioned atoll-journal localStorage entry is independent of dive slots. Deduplicated species, habitat and activity sets and badge timestamps save at milestones. Care checkpoints travel in the dive payload, with active-dive autosave batched every ten seconds. Optional new fields validate on import; legacy saves start with fresh care tracking, without inferred achievements.

Back up downloads a JSON file. Restore validates and merges it, keeping existing discoveries and the earlier earned date for duplicates. Combined sets can unlock a newly met milestone. Invalid backups cannot replace the journal. Storage failure exposes a persistent Journal unsaved control and a backup action, including when progress is only in memory.

## Verification and park criteria

Unit tests cover every badge threshold, duplicates, corrupt backups, merged milestones, custom exclusions, continuous timers, pause/restart, legacy/checkpoint restore, actual meal gains, sub-ten cleaning, physical shelter, schooling, care hint hysteresis, title bounds and density, reduced motion and blocked audio retry. Browser tests cover the real journal, file controls, storage failures, visitor activation, title interactions and both 1600x900 and 1024x768 layouts. Native Windows checks must verify actual journal and dive files, sound playback/fade, persistence, fullscreen and established gameplay/cleaner/options behavior. The complete build is parked only after source/package and ZIP/payload verification; see WINDOWS-FAMILY-JOURNAL-BUILD.md for the final receipt.

## Tomorrow's playtest

Watch the title for a minute and move the pointer near fish. Try a Neon damselfish in Practice: eat when hungry, keep it healthy, and open Family journal in the guide. Check whether care feels satisfying without watching counters. Try the small-meal route as a plankton feeder. Visit three habitats, return home, and find the seahorse. Back up the journal once. Feedback should focus on fun, readability and pacing; no more historical research is needed for this work front.
