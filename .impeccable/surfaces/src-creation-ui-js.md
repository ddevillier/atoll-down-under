---
version: 1
slug: "src-creation-ui-js"
primary_target: "src/creation-ui.js"
related_targets: ["src/main.js", "src/style.css", "src/creation-appearance.js", "src/creation-render.js"]
---

# Create, test, revise, keep, return

Scope: the creation editor, temporary test swim, My creations shelf, custom guide and rename dialog. The first kept life is a small grazer learning a refuge. Visitor mode is operate, with observation and a familiar fish as the reward.

Audience and job: a player imagining a fish, trying its movement and ecological choices, then keeping a life they can return to. Make the effect of diet, size, ability and budget readable before entry. Clearly distinguish invented game adaptations from real species.

Action sequence: name and shape a fish; Test swim; Change my fish to revise the retained draft; Keep and meet the reef; return through My creations. The shelf distinguishes Resume from New swim and offers Make a variation and Rename. A variation opens a draft based on the saved fish. The test toolbar explicitly states that nothing is saved and permits Reset test.

Direction: extend the incumbent field-guide paper dialogs over the painted reef. This is an ordinary extension and does not need a new visual world. The editor pairs a sticky live preview in a 42% left column with anatomy and living-trait controls in the flexible remaining column. Spectral headings and DM Sans controls remain on warm paper with teal actions. The collection pairs each familiar portrait with its habitat, life and remembered experiences. Existing actions, focus and modal behavior remain the visual vocabulary.

Anatomy extension: three body forms, four tails, four back fins, three side-fin shapes, four mouths and five patterns combine with separate body, fin and marking RGB color controls. Follow swimming traits adapts the silhouette; Choose my proportions exposes length and depth controls. The painted assembly retains scales, fin rays and side-profile readability, with articulated fins and a feeding jaw. Appearance choices remain distinct from diet and ability effects.

Memorable moment: the named fish turns toward the pointer in the editor, then becomes a recognizable life on the shelf. For the small grazer, choosing shelter, finding a needed meal and returning home gives that life a simple ecological routine.

Content and proof: show diet and shelter fit in words and an ability explanation within the scrollable controls. Keep remaining points and the complete “Test swims never change saved fish.” sentence together in the footer between My creations and the Test swim / Keep and meet the reef actions. The shelf gives the habitat, life number and available memories, or a short new-life invitation. Saving errors remain visible through existing feedback surfaces.

Constraints: preserve the two-column desktop editor and readable footer actions at 1280×720 and 1920×1080. Keep the live portrait contained in its 240px stage, reduced to 180px at viewport heights up to 850px; its column stays sticky while lower controls scroll into view. Retain the established reef paintings and fonts. Do not let creation framing imply the invented fish is a real species. This brief does not expand the task into an identity redesign or unrelated product-context cleanup.

Evidence: `artifacts/anatomy-editor-{1280,1920}.png` records the current editor and visible footer sentence at both sizes; `artifacts/anatomy-matrix.png` records varied painted assemblies and articulation. Implementation is in the mapped source files. The earlier `artifacts/creation-{editor,shelf}-{1280,1920}.png` captures and `docs/CREATION-UI-REVIEW.md` ship disposition document the preceding editor and unchanged shelf. Runtime verification remains separate from screenshot evidence and the historical review verdict.

Unresolved visual decisions: none within the reviewed creation surfaces.
