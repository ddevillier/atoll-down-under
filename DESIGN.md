---
name: Atoll Down Under
description: A luminous illustrated reef with compact field-guide controls.
colors:
  paper: "#f4f0df"
  ink: "#163c43"
  muted: "#426269"
  teal: "#196a6e"
  line: "#c6d0c5"
  shell: "#0b2930"
  secondary-surface: "#fffdf2"
  on-teal: "#fff6da"
  selection: "#216f71"
  tool-surface: "#e1e7d8"
  tool-primary: "#1a686b"
  focus: "#f4c76e"
  meter-safe: "#6e9b66"
  meter-warning: "#c7a34b"
  meter-danger: "#c36850"
typography:
  headline:
    fontFamily: "AtollDisplay, Georgia, serif"
    fontSize: "29px"
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: "AtollDisplay, Georgia, serif"
    fontSize: "25px"
    fontWeight: 600
  body:
    fontFamily: "AtollSans, Arial, sans-serif"
    fontSize: "13px"
    lineHeight: 1.6
  label:
    fontFamily: "AtollSans, Arial, sans-serif"
    fontSize: "13px"
  micro:
    fontFamily: "AtollSans, Arial, sans-serif"
    fontSize: "10px"
  diet:
    fontFamily: "AtollSans, Arial, sans-serif"
    fontSize: "11px"
    lineHeight: 1.25
  diet-compact:
    fontFamily: "AtollSans, Arial, sans-serif"
    fontSize: "10.5px"
    lineHeight: 1.2
rounded:
  toast: "3px"
  panel: "4px"
  canvas-tag: "6px"
spacing:
  control-gap: "8px"
  group-gap: "14px"
  hud-gap: "22px"
  species-gap: "26px"
  panel-inset: "27px"
  two-column-gap: "28px"
components:
  diet-reminder:
    textColor: "{colors.ink}"
    typography: "{typography.diet}"
    width: "220px"
  button-primary:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.on-teal}"
    padding: "11px 20px"
  button-secondary:
    backgroundColor: "{colors.secondary-surface}"
    textColor: "{colors.ink}"
    padding: "11px 20px"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "9px 12px"
  button-tool:
    backgroundColor: "{colors.tool-surface}"
    textColor: "{colors.ink}"
    padding: "9px 12px"
  button-tool-primary:
    backgroundColor: "{colors.tool-primary}"
    textColor: "#fff6d8"
    padding: "9px 12px"
  splash-menu-bar:
    backgroundColor: "#eeeedf"
    textColor: "#153c43"
    typography: "{typography.label}"
    height: "30px"
  splash-menu-item:
    backgroundColor: "transparent"
    textColor: "#153c43"
    typography: "{typography.label}"
    padding: "10px 12px"
  splash-menu-item-hover:
    backgroundColor: "{colors.selection}"
    textColor: "{colors.on-teal}"
  search:
    backgroundColor: "#fffdf3"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "11px 13px"
    width: "100%"
  panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    width: "min(930px, 90%)"
  sequence-tag:
    backgroundColor: "#dce7d7"
    typography: "{typography.micro}"
    padding: "5px 8px"
---

# Design System: Atoll Down Under

## Overview

**Creative North Star: "The illustrated living reef"**

Richly textured natural-history reef illustrations and crisp side-profile fish carry the experience. Jewel-tone coral, luminous turquoise water, cream sand, and deep cave shadows give the world its detail. Compact warm cream and gray-green controls, dark teal lettering, and Spectral headings provide the field-guide frame.

The reef dominates this Windows desktop 16:9 scene-driven game. Menus and educational dialogs sit over the same illustrated world; interface density stays compact so the habitat and creatures remain visible. The splash uses centered, three-line stone Atoll Down Under lettering in deep blue water, a leaning wreck on the left, upper-right light, and a coral foreground. Original artwork and branding preserve the approved Windows Odell Down Under composition reference without bundling original game assets.

**Key Characteristics:**

- Rich natural-history illustration with clear side-profile creatures.
- Nine distinct habitat compositions with scene-specific shelter and food placement.
- Warm paper surfaces, restrained teal actions, and compact ecological instruments.
- Spectral headings paired with readable DM Sans controls.
- A painted stone splash title beneath a compact File / Game / Help menu strip.
- Full reef readability in both daytime and nighttime play.

This document merges the provisional direction from this build with the shipped implementation. Token values come from `src/style.css`; canvas-specific treatments come from `src/render.js`. Visual evidence includes species selection, gameplay, inspection, error-feedback screenshots, and the nine-scene contact sheet in `artifacts/`. The current splash is documented by `artifacts/splash-1600.png`, `splash-1024.png`, `splash-menu-1600.png`, `splash-menu-1024.png`, and `splash-dialog-1024.png`.

## Colors

The interface uses warm paper and muted greens against the saturated turquoise, coral, violet, and sandy colors supplied by the habitat paintings. The splash painting uses deeper blue water with warm stone lettering and coral.

### Primary

- **Reef teal:** Primary dialog actions.
- **Selection teal:** Active creature rows and guide tabs.
- **Tool teal:** The emphasized inspection/continue control in the survival bar.

### Secondary

- **Focus gold:** Keyboard focus outlines on buttons and form controls.
- **Survival green, warning ochre, and danger coral:** The two meter fills change with their values; textual numbers remain visible.

### Neutral

- **Paper:** Dialog surfaces.
- **Ink:** Main interface text.
- **Muted ink:** Supporting facts, captions, and secondary labels.
- **Reef line:** Thin separators between dialog regions and list rows.
- **Shell:** Letterbox area around the widescreen game.
- **Secondary surface:** Light secondary buttons.
- **On-teal cream:** Text on primary dialog actions.
- **Tool surface:** Quiet survival-bar buttons.

The gameplay top bar and survival bar use translucent warm paper; the artwork remains faintly visible through them. The splash menu strip is opaque pale paper with ink labels, and its open and hovered items use selection teal with cream text. Toasts, scene labels, and inspection labels use dark translucent water tones for legibility over dense reef texture. Those literal component treatments are recorded in the sidecar.

The sidecar's tonal ramps are derived swatch previews for the design panel. They are not an additional shipped palette; the frontmatter and extracted component values remain normative.

**The Reef Color Rule.** Let the paintings carry the broad color range; keep the interface grounded in paper, ink, and teal.

## Typography

**Heading Font:** Spectral, loaded locally as `AtollDisplay`, with Georgia/serif fallbacks. The bundled face is weight 600.

**Body Font:** DM Sans, loaded locally as `AtollSans`, with Arial/sans-serif fallbacks. The bundled variable face supports weights 100–900.

Spectral gives dialog and creature headings a natural-history book character. DM Sans keeps the small labels and dense facts readable. Use the frontmatter hierarchy as the normal desktop reference.

- **Splash title:** The visible three-line stone lettering is part of `assets/title/splash.png`, not a font-rendered heading. The DOM supplies a visually hidden `h1` with the game name. Preserve the title as artwork; no display typography token governs it.
- **Headline:** Dialog headings use the headline token.
- **Title:** Creature headings use the title token; inspection headings are slightly smaller (22px).
- **Body:** Creature descriptions use the body token. Most explanatory text and facts use 12px; dialog paragraphs use a 1.6 line height.
- **Label:** Buttons and scene labels generally use 13px. Primary and secondary dialog buttons use weight 600. Scene names are uppercase with 0.08em tracking.
- **Micro:** Meter labels and sequence chips use the micro token; survival-bar captions use 10–11px.
- **Scores:** Survival scores use 18px with tabular numerals. End-state headings and large scores use 42px.

At the compact desktop breakpoint, dialog headings reduce to 25px and creature headings to 22px. Gameplay top-bar actions and scene names use 11px. The splash menu stays at 13px with 11px mode descriptions. These are established density adjustments, not a separate mobile type system.

## Layout

The app is a centered 16:9 stage with width `min(100vw, 177.777vh)` and height `min(100vh, 56.25vw)`. The canvas and DOM overlay share this stage; surrounding space uses the shell background. The original desktop brief sets 1280×720 as the minimum and 1920×1080 as the reference. The renderer uses a 1600×900 logical scene and caps device-pixel-ratio scaling at 2. Compact screenshots at 1024px document the existing fallback layout, not a separate phone experience.

The gameplay top navigation occupies 6.2% of stage height with a minimum of 38px. The survival bar occupies 11% with a minimum of 69px. Both use 2% horizontal insets.

The splash painting fills the whole stage. Its centered three-line title, left-leaning wreck, upper-right light, and bottom coral stay in the artwork's composition as the widescreen stage scales. `assets/title/splash.png` is a 1672×941 raster drawn into the renderer's 1600×900 logical scene; it is not native 4K artwork. The splash menu spans the top edge at a fixed 30px height, with File and Game at the left and Help at the right. Dropdowns open directly below the strip: File and Help are 220px wide, and Game is 310px wide. Help aligns its dropdown to the right edge. This arrangement remains intact in the 1024px compact desktop fallback.

Dialogs are centered within an overlay padded by 5.5% vertically and 5% horizontally. The standard width is in frontmatter; the small dialog uses `min(520px, 85%)`. The implementation also provides a wide variant of `min(1120px, 94%)`. Dialog bodies scroll internally. Header/body/footer horizontal padding is 27px; body vertical padding is 23px.

Creature selection has a 38% list column, a flexible detail column, and the species-gap token. Its portrait is 175px tall and clips a separately positioned canvas. Create-a-Fish, help, and glossary use two columns with the two-column-gap token. The field-guide list has a 325px maximum height.

The only width breakpoint is `max-width: 1100px`. It reduces survival-bar gaps and button padding, removes keyboard keycaps, reduces portrait height to 130px and list height to 255px, and reduces dialog horizontal padding to 22px. The widescreen stage and paired content columns remain intact.

**The Distinct Habitat Rule.** Each of the nine scenes must have a distinct overall silhouette, negative-space arrangement, and habitat topology. Do not repeat an open-water bowl framed by coral across the map.

The user explicitly rejected the initial repeated-bowl background batch; those variations are superseded. Preserve the correction's composition vocabulary: vertical wall, densely packed full-frame reef, stacked cave shelves, diagonal wreck/ledge, high sandy terrace with side water, seagrass meadow, enclosed tunnel, and archipelago of coral heads. These describe the required variety rather than a reusable framing template.

The accepted scene set includes Sunlit Crest's open water, Table Coral Terrace's elevated shelf, Outer Blue's diagonal reef face, Sea Fan Garden's vertical wall, Coral Cathedral's dense full-frame coral, The Old Wreck's timber enclosure, Seagrass Meadow's low vegetation, Pearl Sands' broad sandy terrace, and Quiet Grotto's stacked cave shelves. Hiding locations and food placements follow each actual painting instead of identical coordinates across all scenes.

## Elevation & Depth

The paintings supply most depth through coral overlap, side-facing caves, textured sand, and luminous water. Interface surfaces use thin borders and tonal separation; dialogs, inspection cards, and open splash dropdowns use lifted shadows. Splash lettering, its stone depth, and the surrounding light are baked into the painting; the title has no CSS text shadow or gradient backing.

- **Dialog shadow:** `0 12px 50px #082b3880`; lifts the paused educational surface above the reef.
- **Inspection shadow:** `0 6px 22px #173d4660`; separates a small field note from the painting.
- **Splash dropdown shadow:** `3px 6px 16px #061c3460`; separates an open menu from the painting.
- **Modal veil:** `#082c3978`; marks the paused layer while retaining the habitat beneath.

**The Readable Night Rule.** Keep nighttime habitats as readable as daytime. The renderer deliberately applies no dark night filter or obscuring fog.

Decorative movement consists of fine suspended particles, subtle fish motion, and small food sways. On the splash, live side-profile fish swim over the static title painting. Reduced-motion preferences remove CSS animation and transitions and reduce renderer decoration, including the splash fish's horizontal travel. Brief meal and ability effects stay near the action; a small triangular player marker identifies the fish without a full-body outline.

## Shapes

Controls, tabs, lists, and meters are compact rectangles. Dialogs and toasts use the small corner values in frontmatter. Canvas labels use the canvas-tag radius; status dots are circular. Avoid turning the interface into a field of pill buttons or large rounded cards.

Icons are thin inline strokes, usually 19px in buttons with a 1.7 stroke width and rounded caps/joins. The habitat grid is a three-by-three arrangement of 13×11px rectangles with 3px gaps. Meter tracks are 9px tall with a thin border.

## Components

### Buttons and navigation

Primary dialog actions are teal with cream text; secondary actions are light with an ink label and a thin muted border. Both use 13px semibold type and a 9px icon gap. Text navigation is transparent at rest and gains a pale green backing on hover. Toolbar actions use 12px text and small keycaps; the inspection/continue action uses tool teal.

Global button transitions cover background and text color (0.16s). Hover brightens buttons to 1.06; pressing moves them down 1px. Disabled buttons use 0.48 opacity. Keyboard focus uses a 3px gold outline with a 3px offset. Preserve visible focus when selecting creatures or switching guide tabs. The splash menu has the immediate state treatment described below.

### Splash menu

The compact File / Game / Help strip is the splash's only visible interface at rest. Native disclosure controls open warm paper dropdowns; Game contains Practice, Challenge, Tournament, and Create a fish with short descriptions. Mode rows share the same treatment, with semibold names and muted descriptions. File contains saved dives, scores, settings, and a continue action when a dive exists; Help contains the field guide and instructions.

Hover and focus states change immediately. Summary hover and open states use selection teal; summary keyboard focus is a 2px inset teal outline. Dropdown items use selection teal with cream text on hover or focus, including their descriptions, and a 2px inset gold focus outline. Dropdown buttons have no color transition or hover brightness filter.

Only one dropdown stays open. Clicking outside closes menus; Up and Down cycle through the current menu's actions, Left and Right switch menus, and Escape closes the menu and returns focus to its summary. When a modal opens, the strip becomes inert and hidden from assistive technology; its layer (3) remains beneath the modal overlay (10).

### Dialogs and inspection cards

The dialog is a paper sheet with a separated heading, scrollable content, and a pale green footer. The close control is a simple multiplication mark. Opening a dialog pauses the simulation and places keyboard focus inside; Tab stays inside the dialog. Closing returns focus to the reef.

The inspection card is positioned 2% from the right and 10% from the top, with a width of 290px and 19px padding. It uses a compact Spectral creature heading, short body copy, facts, and an optional field-guide action.

### Creature browser and fields

The search input is full width with a light surface and a thin green-gray border. The list uses flat divider rows rather than individual cards. A selected row fills with selection teal and cream text. Preserve list scroll and keyboard focus after selection.

Creature portraits sit on a crop of the reef painting. Fit the complete sprite inside the stage and clip the stage, preventing sprite overflow into headings or list content. Facts use an 85px label column, a flexible value column, and 7px gaps.

Create-a-Fish text fields and selects share the light surface and thin border. Sliders use a teal accent; their labels and current values remain paired. The budget uses Spectral at 19px, changing to an earthy red when exceeded; the start action is then disabled.

### Survival bar and habitat map

Two slim labeled meters show energy and health as a fill plus numeric value. Each row uses columns of 47px, a flexible track, and 30px, with 8px gaps. The three-by-three map highlights the current section and sits beside the day/night icon. Creature identity, meters, map, score, and actions occupy one compact horizontal bar.

A persistent diet reminder sits below the current fish's name and mode, using the existing food types in readable words. It uses 11px ink text with a muted "Diet:" label, a 220px maximum width and a 3px top gap. At the compact breakpoint it uses 10.5px text, a 195px maximum width and a 1px gap; HUD vertical padding becomes 7px. Long diets wrap within the existing bar height. This is a game-diet reminder; individual prey still obey size, armor and poison rules.

### Feedback and tags

World notifications appear near the top center in a dark translucent toast. Survival-state feedback sits above the bottom bar; control reminders sit at the lower left. Canvas tags use 15px DM Sans inside small dark rectangles.

A clicked meal has a cream ellipse with a dark under-stroke and a name tag while the fish approaches it. The status badge explains that moving the cursor cancels the approach; the usual control hint is hidden during that state. The marker follows moving prey and disappears on cancellation, completion, disappearance or observation pause. After a successful meal, a nearby tag shows the rounded energy actually gained, or "Meal taken" when the gain is below one point. It holds briefly, fades out over a 2.2-second lifetime, and freezes with observation; reduced motion keeps the tag stationary above the meal.

Renewable food patches reduce their rendered scale with the remaining food, and plankton clouds lose visible particles. Their selection areas remain generous and unchanged. Full depletion and regrowth follow the existing simulation; this is readable game feedback rather than a depiction of biological growth rates. No artwork files are modified by these renderer treatments.

When a dialog is open, feedback appears in a visible sand-colored status strip directly below its heading, not behind the modal. The shipped strip uses 12px text, a 1.5 line height, and 10px by 27px padding. Notification text is also announced accessibly.

Sequence chips are small rectangular labels with pale green backgrounds and 10px type. They wrap across a row; the first stage receives a slightly stronger tint.

## Do's and Don'ts

### Do:

- **Do** let original reef paintings and side-profile creatures dominate the stage.
- **Do** preserve nine distinct scene silhouettes, negative spaces, and habitat topologies.
- **Do** place shelters and food against each painting's actual terrain.
- **Do** use Spectral for dialog and creature headings and DM Sans for controls and facts.
- **Do** preserve the splash's centered three-line stone title and compact top menu as the widescreen stage scales.
- **Do** keep energy and health compact, labeled, and numerically readable.
- **Do** preserve visible keyboard focus, modal focus containment, and in-dialog feedback.
- **Do** keep the night reef fully readable and honor reduced-motion preferences.

### Don't:

- **Don't** reuse the rejected open-water bowl composition for every habitat.
- **Don't** copy original game marks, lettering, or bundled artwork.
- **Don't** cover the reef with combat HUD clutter, broad fog, or a dark night filter.
- **Don't** replace the compact rectangular controls with oversized pill or card treatments.
- **Don't** allow portrait canvases to overflow their stages or obscure text.
- **Don't** hide save or load feedback behind the active dialog.
