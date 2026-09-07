# Species corrections, second pass

6 September 2026. Continues the Practice/exploration priority and G09 identity reconciliation.

## Changes

- **s39 Coral trout:** original Windows guide strings 117/221 identify Variola louti. Replaced the Plectropomus leopardus facts and the rounded-tail illustration with a sourced yellow-edged lyretail account and new artwork showing the crescent tail and yellow edging. Stable catalog name and ID remain.
- **s37 Electric ray:** original strings 146/250 identify the short-tail electric ray under the historical spelling Hypnos monopterygium. Fishes of Australia documents that spelling and uses modern Hypnos monopterygius. Replaced the Pacific electric-ray example and incompatible blue-spotted stingray-like image with Australian coffin-ray facts and new brown, short-tailed artwork.
- Both use the shared standalone-sprite renderer from the preceding pass. Existing saves receive these illustrations through their stable catalog indexes.
- Diet rules, species size, movement, population ranges, pursuit, damage, shock timing and Tournament order are unchanged.
- These are stylized educational illustrations, not proof of exact anatomy or historical animation. The ray’s fine fin proportions remain an illustration limitation; burial is not reconstructed.

## Sources and provenance

Modern facts: [Fishes of Australia — Yellowedge Coronation Trout](https://fishesofaustralia.net.au/home/species/4521), [Fishes of Australia — Coffin Ray](https://fishesofaustralia.net.au/home/species/1843), with [Australian Museum — Coffin Ray](https://australian.museum/learn/animals/fishes/numbfish-hypnos-monopterygium-shaw-nodder-1795/) as independent identity confirmation. Original-resource references and modern reconciliation are in ORIGINAL-ROSTER-LEDGER.md/JSON and LIFE-SCIENCE-SOURCES.md.

Built-in image_gen created original illustrations from textual descriptions. A John Turnbull photo hosted by Fishes of Australia was inspected externally for anatomical reference, but was not supplied to generation, copied into the product or used as a bitmap layer. The final images were copied intact; no post-generation bitmap editing.

Final project assets:
- assets/creatures/lyretail-coral-trout-v2.png
- assets/creatures/short-tail-electric-ray-v2.png

The first generated ray had too much exposed tail. Its edited variant lost the dorsal fins and contained an opaque checkerboard, so both were rejected. The final ray is a fresh generation. Rejected images remain outside the repository.

## Full generation prompts

### Lyretail (accepted)

Create an original scientific-educational game sprite of Variola louti, yellow-edged lyretail / coronation trout. One whole fish only, strict lateral profile facing RIGHT (head right, tail left). Genuinely transparent RGBA background. Naturalistic hand-painted field-guide illustration, fine fin rays, attractive textured reddish-orange body with numerous small blue to pale pink dots, large grouper mouth and gently sloping head. Essential identifying feature: a deeply concave crescent/lunate tail with long pointed upper and lower lobes and a clearly visible bright yellow outer border around the tail; yellow edging to the rear soft dorsal and anal fins. Slender elongated grouper body, NOT a salmon, NOT a round-tailed coral hind. Neutral horizontal swimming pose, every fin and tail tip within the canvas with 6% clear margin. Clean silhouette without colored fringe. No black stroke, water, shadows, scenery, labels or other creatures. 1536x1024 landscape if possible, detailed original high-resolution illustration for a widescreen reef game. Do not copy a photograph.

### Ray initial attempt (rejected)

Create one original scientific-educational game sprite of the Australian coffin ray / short-tail electric ray Hypnos monopterygius, isolated on a genuinely transparent RGBA background. Only one animal, no text, scenery, sand, water, lightning, shadows or other objects. View from above and slightly to its side, head oriented RIGHT, tiny tail LEFT; body horizontal so it can swim right across a side-view reef game. Show the diagnostic broad soft pear-shaped flattened body disc, blunt rounded front, brown matte skin with subtle tonal variation, small raised eyes and paired spiracles on the upper front. Two small closely spaced dorsal fins on the very short rear tail region above the pelvic fins; only a little rounded caudal fin extends beyond the hind pelvic-fin margins. Tail must be extremely short and thick, NOT a long whip. No blue spots, no stingray tail, no sting barb, no diamond manta wings, no long shark body. Entire silhouette and all fins visible with generous transparent margin. Accurate coffin ray proportions and earthy pale brown to reddish-brown coloring. Original naturalistic hand-painted field-guide art with fine skin detail, softly modeled volume and a very clean alpha edge, no outer glow. Landscape 1536x1024 or similar, animal occupies about 80% of canvas width. Attractive readable illustration suitable for a high resolution reef exploration game, not a copied photograph.

### Ray edit (rejected)

Edit this generated electric ray sprite into an anatomically closer Hypnos monopterygius coffin ray. Keep its brown naturalistic painting, head facing right, dorsal/top view, small eyes and spiracles, original single animal and transparent RGBA background. Critical correction: the rear is TOO LONG. Shorten the entire rear tail region by roughly HALF, moving the small rounded caudal fin close to the body. Broaden the paired pelvic fins so their rear edges end almost level with the caudal-fin base; ONLY THE ROUNDED CAUDAL FIN should extend beyond the rear pelvic-fin margins. Two tiny dorsal fins must sit closely adjacent over the pelvic-fin region, not spaced along an exposed long tail stalk. The silhouette should be a squat pear-shaped disc with a very short stubby rear, characteristic of the Australian coffin ray, NOT a generic torpedo ray with a long tail. Maintain the brown coloring, no blue spots or sting barb. Remove every background glow; transparent means zero alpha outside the clean animal silhouette, no haze. Whole animal in frame with margin, all fins intact. No text or new objects.

### Ray final generation (accepted)

Original natural-history illustration for a game: one Australian coffin ray (Hypnos monopterygius), fully isolated on actual transparent RGBA pixels. NO checkerboard pattern and NO background scene. Draw a complete animal swimming toward the RIGHT, viewed obliquely from above so its dorsal fins are visible. Its broad, soft, flattened pear-shaped brown disc fills most of its length. The small blunt snout and two tiny raised eyes are at the right. At the left rear, two wide rounded pelvic-fin lobes closely flank a VERY SHORT thick tail. On top of this very short rear segment sit TWO closely adjacent small rounded dorsal fins, one behind the other, like two small folded sails. A small rounded caudal fin barely protrudes beyond the back ends of the broad pelvic lobes. NO exposed long stalk between body and tail fin. All three upright rear fins must be present and visible (two dorsals then the terminal caudal), nestled close together. Warm medium brown smooth leathery skin with subtle natural mottling, no blue spots, no spiny stingray tail, no mouth on the upper surface, no lightning. Naturalistic painted style with fine surface detail, clean non-glowing alpha edges, fish centered with a transparent margin on all sides. Landscape image, approximately 1536 by 1024. No labels, text, sand, parasitic leeches, ornaments or other animals. This is an independently composed illustration, not a photograph reproduction.

## Verification

- All 116 unit/asset checks pass. The new asset check requires high-resolution source dimensions, a real alpha channel, substantial transparent and visible pixel areas, and nearly transparent borders. It catches the failed opaque-checkerboard result; it does not establish biological accuracy.
- Dedicated browser check passes all five corrected guide entries at widths 1024 and 1600: scientific-name search, expected text, no horizontal overflow, and high-resolution replacement loading.
- Batfish, electric ray and coral trout can all be selected and entered in Practice. The ray’s Space-key pulse starts its existing cooldown.
- All 64 sprites render in the contact sheets. Guide, sprite and Practice screenshots were visually inspected; no page errors.
- Evidence: artifacts/browser-species-corrections.json, browser-s37-guide-1600.png, browser-s39-practice.png and sprite-sheet-2.png. Reproduce using scripts/qa-species-corrections.mjs and scripts/qa-sprites.mjs.
- This pass is newer than the parked Windows-Species ZIP (runtime 4094e6f). That testing ZIP and its receipt remain unchanged. Native packaging verification of these two new illustrations is pending.

