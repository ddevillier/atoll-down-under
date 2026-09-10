# Learning through play: a fish worth revisiting

Research/design memo, 2026-09-10. Agent 7 of 8. No runtime changes or new player study. This independently synthesizes memos 01–05 and reads current `journal.js`, `adventures.js`, `learning.js`, and relevant creation, guide, narration and journal paths in `main.js`/`data.js`. Historical claims below come from the cited research; all new scenarios are proposals.

## The opportunity

Give the child a question they can answer by swimming, then a fish whose answer they want to remember. The strongest next educational feature is a trustworthy **make → try → notice → change → return** loop. More facts, more species entries, and another set of completion requirements would add less to this particular gap.

There is a historical foundation, but no demonstrated learning outcome: the [Windows manual](https://www.myabandonware.com/download/m72w-odell-down-under), PDF pages 1, 7 and 11, frames observation and experimentation, documents custom traits, and provides paused inspection. [Direct emulator research](04-original-create-play.md) saw the animated custom preview become the same visible reef animal; its controlled feeding/escape tests were limited by input handling. [Community research](02-community-memories.md) records memorable creature choices and disagreements about how much people learned. None establishes that a new child will understand biology or enjoy our proposed loop. That remains a playtest question.

Current foundations are substantial: optional journeys, actual care interactions, model-derived food webs, sourced natural-history text, narration with transcripts, saved observations, and a family journal. The gap is connection and personal meaning. Created fish miss roster-keyed journeys and individual care stamps; the guide explicitly switches away from `custom` to `s1`. See the reproducible identity defect and fuller implementation audit in [memo 03](03-current-create-fish.md).

## Three small experiments, with the instructions closed

These are modern proposals. They should remain understandable with music muted and the activity card hidden. Each starts from one existing system; none requires a globally busier reef.

| Play moment | What the child can notice | Follow-up they can choose | Evidence needed |
|---|---|---|---|
| **Pebble finds a home.** Make a small grazer, choose a real refuge, take a needed meal, return and settle. Create a larger variation and revisit the same site. | Body size changes whether this game's shelter accepts the fish. Arrival has an actual concealment response, not just a badge. | Keep the small fish, choose another home, or take the large one farther from cover. | Both versions use the same simulation shelter rule; the larger version receives truthful feedback when it cannot hide. The journal preserves both identities. Do not imply agility changes passage width: current scenery has no such collision geometry. |
| **Which lunch suits Noodle?** In an optional repeatable trial area, compare the same body with two diets, using clearly selectable existing food types. | One food is accepted and another is unsuitable; the diet change explains the difference. | Adjust diet once, or keep the specialist and find its food in another habitat. | Preview, inspection and actual bite use the same eligibility rules. Trial resetting restores comparable conditions; it does not overwrite the live dive. A poor choice yields information without a repeated-death requirement. |
| **Someone shared my discovery.** Choose a compatible sand-search role, uncover existing food, move aside, and watch a genuinely hungry neighbor take it. | The player's action changed another animal's opportunity. The neighbor still decides according to hunger and competing priorities. | Try another patch, wait for a different visitor, or eat the food themselves. | Feedback follows a real bite at that exposed food. If nobody is available, say so rather than spawning a grateful visitor. The role must be explicitly granted; current sand searching is species-gated. |

For the first implementation slice, choose one role—small home keeper or a compatible browser—not all three experiments. Complete its identity, controls, world response, save lifecycle and return visit before broadening the role catalog. A full-featured modular body editor is not a dependency for finding out whether repeat creation is fun.

The repeatable trial area is a proposal distinct from normal reef ecology. It can deliberately present the same conditions for an A/B comparison, with a clear “test swim” label. The live reef should retain contingent encounters; repeatedly re-rolling its inhabitants to guarantee every demonstration would conceal the simulation the child is trying to understand.

## Persistent identity without pretending creations are species

The family journal currently recognizes roster species, habitat visits and activity IDs (`src/journal.js:1–67`). Created fish already earn applicable generic activity badges; they are not entirely unrewarded. Keep these truthful achievements and add a separate, modest **My creations** collection.

Each creation needs a stable ID independent of its name and the shared `custom` species ID, an immutable saved blueprint/revision, a live-dive reference, and a few actual memories. “Make a variation” creates a new ID and remembers its parent; renaming preserves identity. Show the moving portrait, chosen traits, last habitat and an earned care memory such as “Pebble found a meal and rested safely.” Keep exact event evidence in saved data; do not award a care memory merely for naming a fish or leaving the window open.

A gallery should answer “Where is the fish I made?” in one action, with Resume, Make a variation, and a small comparison. Do not require earning currency, beating Tournament, or filling the point budget. Deleting a draft should not delete an existing dive; replay after death should not silently fabricate uninterrupted survival. Preserve current save/import workflows, and migrate old custom saves into a stable identity without losing their diet or appearance.

This requires a versioned data contract, bounded memory storage, validated import and merge behavior, and a resolved identity-vs-blueprint-vs-dive model. It is more than adding `custom` to `speciesIds`: that would merge every invention into one care stamp and could misrepresent the number of real species played. First fix the shared mutable configuration defect identified in memo 03, then build the collection on reliable snapshots.

## Let the world deliver the reward before the journal records it

The current journal shows badge counts, species counts, care thresholds, habitat totals, and all 64 Ways of living entries (`src/main.js:40`). Current adventures are optional and replayable; calling them mandatory would be wrong. Even so, completion-heavy presentation may direct attention toward filling rows rather than noticing animals. That is a design risk, not an observed child reaction.

Keep badges as souvenirs of unique actions. On first success, show the actual response—neighbor takes a meal, hiding settles, cleaner finishes—before any small journal notification. Put one recent memory or favorite creation at the top of the journal; leave the full collection available below. Do not impose streaks, expiring care, daily chores, or higher quotas as the next reward tier. No fish should suffer because the family did not launch the game yesterday.

Offer at most one contextual invitation at a time, chosen from the fish's real capabilities and current opportunities. Let the child dismiss it and continue. After discovery, prefer “Try another place” or simple silence to immediately replacing it with a larger counter. Keep optional explicit steps for players who want direction; cards closed must not mean controls undiscoverable.

## Keep three kinds of knowledge distinguishable

The source already makes a useful distinction: `learning.js` derives its food web from simulation rules, while lesson entries separately identify the real-world source and model limitation. `naturalHistoryHTML` exposes sourced biology and an “In this game” explanation. Extend that distinction to the custom creature instead of presenting a real roster fish when its guide opens.

1. **Your invention:** “Noodle is a creature you designed.” A name, fantasy trait combination and nickname are not a scientific species description. Do not invent a Latin name or claim arbitrary combinations exist in nature.
2. **This reef model:** “In this game, Noodle can eat these foods and hide in these shelters.” Calculate this from the live creation. An endurance slider changes modeled hunger; do not describe it as measured biological stamina. A successful test demonstrates the model's rule, not a law of nature.
3. **Real animals to compare:** An optional link to an existing sourced species entry can invite comparison. Verify any newly asserted biological connection before writing it. Avoid “evolving” a new body through slider changes or saying every colorful fish is camouflaged simply because tint was selected.

A useful observation can be accurate and modest: “This fish ate after I uncovered that food.” Do not turn an approach into “It thanked you” or present an invented emotional motive as animal biology. Warm animations and player nicknames remain possible; the factual narration should describe what happened.

## Narration should answer curiosity, not interrupt it

Existing guide and activity narration is requested by the player, has visible text, identifies its generated voice, and pauses the activity-help reef (`src/main.js:80–84,192,283`). Preserve that behavior. A custom role can reuse a short reviewed explanation and visible transcript; bespoke speech for every name or slider change is unnecessary for the first slice.

Prefer two optional prompts: “What happened?” for a confirmed event and “What could I try?” for a capability-compatible suggestion. Only narrate events backed by live state; never announce an arriving helper, successful escape or friendship merely because a timer expired. Stop or replace stale speech when context changes. Failure to load audio must leave the activity fully playable from text and visual cues. Do not generate a continuous natural-history lecture over the peaceful soundscape.

## Acceptance and human questions

Functional completion is testable before asking the family to evaluate fun:

- Two separately named creations survive editing, resume, export/import and reload with unchanged original traits; making a variation cannot mutate the first fish. Existing roster journals and saved dives still load.
- One complete compatible custom role works through ordinary controls in the generated reef, including its real world response and a later return; no developer-created replacement food or NPC is needed.
- The same action remains legible with its card closed, muted audio and reduced motion. A paused inspection correctly describes the created fish rather than another species.
- A custom memory cannot inflate real-species completion, and imported identities cannot collapse unrelated creations. Unavailable opportunities and interrupted interactions yield no false reward.
- The fish can be resumed without replaying an introduction, a trial, or a progression gate. Optional narration can fail without blocking any action.

Then observe short sessions rather than setting a pass percentage from an invented sample size. Ask only after the child has had room to act:

- “Show me your fish. What do you like about it?” Can they locate and recognize the same creation tomorrow?
- “What changed when you made the other one?” Do they describe a consequence, a color preference, or uncertainty? All are useful evidence; only the first supports rule comprehension.
- “What do you want to try next?” Do they voluntarily change one choice, revisit a home, or return to a neighbor after the first badge?
- “Did that really happen in our reef, or is it something you imagined?” Can the adult clarify the distinction without spoiling the play?
- “Was anything confusing or worrying?” Record where prompting was required and whether a danger episode invited retrying or stopping.

Do not advertise learning efficacy from a completed route, a badge, or one successful explanation. What this slice can establish is reliable agency, readable consequences, preserved attachment and a concrete reason to return. Those are meaningful prerequisites to evaluate before expanding the lesson catalog.
