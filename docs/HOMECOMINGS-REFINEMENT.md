# Remembered fish, homecomings and gentle risk — October 2, 2026

This refinement follows the 30-specialist quality review. Its purpose is to make another dive meaningful: return to an actual familiar neighbor, care for it, repeat a feeding trip from a chosen home, and retain a concrete account of what happened. It preserves the painted reef, species roster, existing articulation, offline narration and Windows delivery target.

## Delivered behavior

**Individuals stay individuals.** Inspecting a living fish, inviting a companion, choosing a living anemone or completing needed care establishes familiarity. A later habitat visit can produce a brief orientation/approach, local welcome and journal reunion. Recognition matches habitat, entity ID, species and incarnation. A distant, occupied, dead or respawned fish cannot impersonate that encounter. A hungry hunter does not greet instead of hunting. Animals remain in their habitats; inactive habitats freeze. Familiarity is a game interaction, not a scientific claim that all these species recognize people.

**Companions can part and meet again.** All five paired-browser roles retain the same companion when it moves far away or the player travels. Guidance names its habitat. Calm proximity resumes browsing; death or replacement releases the association. Feeding, threats, treatment and digestion retain priority. A hungry companion can make a short nearby feeding excursion using ordinary food selection and contact. This fixes waiting just outside food-detection range without manufacturing food or reducing hunger timers. After both meals and reunion, E begins another shared trip. Discovery remains earned once; the actual repeated trip creates a fresh memory.

**Homecoming remains playable after discovery.** All eight shared home journeys, the coral goby and created refuge lives record repeated returns. Entries name the habitat and food, rather than merely repeat a completed badge. Home guidance survives hiding the optional activity card and habitat travel. Living-anemone loss remains meaningful. Created grazers, hunters and omnivores can record their real needed meal and return. Their recent memories appear on the shelf and custom guide.

**Progress has an account of experience.** The Family Journal displays the 64 Ways of living total plus recent encounters, homecomings, care and shared trips. A dive retains 16 encounter entries and 16 familiar individuals; a created life retains 12 recent entries; the shared journal retains 64. Stable entry IDs prevent duplicate imports/reloads. Stale journal writers merge instead of replacing each other's progress. Older saves and journal backups without these fields remain readable. The journal does not retain an unlimited historical transcript. Starting a new life creates a new encounter identity; Resume continues the saved individual relationships.

**Risk is clearer and gives a reaction window.** Watching safely is explicitly named in the HUD. Meal selection, active ability, care/activity or travel explains the transition to ordinary reef life once. Benign curiosity about unsuitable food remains protected. A genuine pursuit supplies persistent guidance; Space is offered only for an available active ability. Bites get a localized visual cue and a shared 1.8-second recovery window, preventing simultaneous hits from several hunters. Later attacks, injury, hunger, poison and parasites remain. Closed top/bottom edges stop actual movement and use resting energy consumption. Food hints has a visible, persistent toggle as well as H. Inspection still freezes the reef.

The package also carries the existing September 11 integration fixes reviewed in the quality audit: storage and terminal recovery, creation validation, needed mimic nourishment, food contact and defense boundaries, journey progress, renderer/picking, audio muting and motion integration. No original-game research, new narration generation, Apple Silicon build or archive deletion was performed.

## Acceptance and evidence

The measured Windows receipt is beside `Atoll-Down-Under-Windows-Homecomings-2026-10-02.zip` in `dist`; it identifies the final archive and ASAR hashes, exact source comparison and packaged native results. Evidence logs and screenshots remain in `artifacts` and are omitted from the application payload.

| Requirement | Verification |
|---|---|
| Actual recognition, absence, busy/distant fish, incarnation, pause, bounded memories | `tests/reef-memories.test.mjs`; native familiarity boundary fixture |
| Save/import and older save compatibility | Memory, companion, save-file and journal tests; full native close/relaunch with one isolated profile |
| Eight repeatable home journeys, goby and three created diets | Production-simulation fixtures exercise two trips per shared home, goby and created diet; ordinary mouse/E generated home journeys for Neon, Anemonefish and Whitetip |
| Real shared feeding and reunion | Generated filefish habitat with no hunger, NPC, food or position edits; normal controls at 1600×900 and 1024×768 |
| Visible journal, risk and controls | Rendered inspection at both desktop sizes; production-event layout fixtures distinguished from earned gameplay |
| Bite grace still permits later attacks | Three actual contact hunters; save/restore recovery window; repeat attack after grace |
| Exposure and resting boundaries | Protected unsuitable curiosity, real meal/poison selection, ability/travel, and closed-edge energy tests |
| Existing regression baseline | Full unit suite; UI modal/focus, terminal save, journal merge/failure, HUD and audio checks |
| Release provenance | Byte-for-byte source/ASAR comparison; ZIP CRC, payload parity and SHA-256; packaged startup/fullscreen/restart checks |

This is a testing package, not a claim that the whole project is finished. No child playtest or learning-outcome study occurred. Bounded fixtures prove specific state boundaries; they do not prove unaided discovery. The current pass does not complete every roster journey from scratch, continuously inspect every animation, solve all assessment findings, or benchmark sustained full-roster frame time. Further work should judge whether children notice the reactions and willingly repeat trips, then address the quality review's remaining interaction and movement gaps.
