# Species illustration corrections — 6 September 2026

Practice and reef exploration remain the priority. Tournament reconstruction is parked.

## Scope

- s16 Coral grouper: written identity corrected to Cephalopholis miniata. Existing orange-red, blue-spotted illustration retained.
- s6 Longnose butterflyfish: written identity corrected to Forcipiger flavissimus; new yellow, black-headed illustration replaces the incompatible banded fish.
- s40 Longfin batfish: written identity corrected to Platax teira; new round-bodied silver batfish replaces the Moorish-idol-like illustration.
- Original Windows guide string pairs: 86/190, 113/217 and 114/218 respectively. Modern biological sources are recorded in LIFE-SCIENCE-SOURCES.md.
- src/sprite-assets.js selects standalone images by stable catalog index. The renderer uses them for swimming fish, HUD, selection and guide portraits. Existing saved entities retain their IDs and receive the illustrations without population reset or gameplay migration.
- No changes to diet, difficulty, movement, collision sizes, population counts or Tournament order in this revision. The preceding lionfish crab-diet repair remains in source.
- These images improve identifying features; they do not establish complete anatomical or original-animation fidelity.

## Asset provenance

Built-in image_gen tool; new original illustrations from textual descriptions. No reference photograph or original-game sprite was supplied to generation or bundled. Generated transparent PNGs are copied intact into the project; no post-generation bitmap editing.

- assets/creatures/longfin-batfish-v2.png
- assets/creatures/longnose-butterflyfish-v2.png

Full prompts:

### Batfish

Create one original scientific-educational game sprite, a roundface/longfin batfish Platax teira, isolated on a genuinely transparent RGBA background. One complete fish only, strict lateral side profile facing RIGHT, eye and tiny mouth on right, tail on left. No text, labels, water, scenery, shadow, border or additional animals. Naturalistic hand-painted high-resolution field-guide illustration, fine fin rays and soft silver scale texture, clean silhouette suitable for a widescreen reef game. Key anatomy: deep roughly circular silver-grey body, gently rounded forehead and short blunt mouth, two broad charcoal vertical bands (one through eye, one level with pectoral fin), distinct dark blotch below pectoral fin and smaller elongated dark mark just above anal-fin origin. Long broad triangular dorsal and anal fins tapering above and below the body, juvenile/subadult proportions, slightly yellowish fins, short rounded fan tail. Correct batfish anatomy: NOT a Moorish idol, NO threadlike banner streamer, NO long pointed snout, NO orange-edged black pinnatus juvenile. Entire fins and tail fully visible with generous transparent margin. Square image at least 1024 pixels; fish fills about 80% canvas height. Polished original artwork, not a copy of a photograph.

### Butterflyfish

Create one original scientific-educational game sprite of Forcipiger flavissimus, the yellow longnose butterflyfish / forceps fish. One entire fish, STRICT side view facing RIGHT, long narrow forceps snout pointing right, tail left. Genuinely transparent RGBA background. Naturalistic hand-painted high resolution field guide illustration with fine scales and delicate fin rays, crisp silhouette for a widescreen reef exploration game. Accurate identifying features: laterally flattened oval lemon-yellow body; black upper head and white lower head and breast; elongated white slender snout with tiny terminal mouth; black eye at boundary of black and white head; yellow dorsal and anal fins; small round black eyespot at the REAR of the anal fin near lower tail base; translucent whitish fan tail. Snout is long but NOT excessively elongated like F. longirostris. NO bands across yellow body, NO copperband pattern, NO dorsal eyespot, NO streamer, NO invented ornamental stripes, NO spots on the white chest. Eye about midway between tip of snout and base of pectoral fin. Correct natural fins and single eye visible. Neutral swimming pose with full tail and fins uncropped, generous transparent margin. No scenery, water, labels, text, shadow or other animals. Square image at least 1024px, fish fills 85% canvas width. Original illustration, not copied from any photograph.

## Validation

All 115 unit/asset checks and all 30 browser scenarios pass. Contact sheets render all 64 sprites; the two corrected entries have been visually inspected against their defining features and the other artwork. The dedicated browser check verifies scientific-name search, expected facts and no horizontal overflow for all three entries at widths 1024 and 1600. It also confirms the two standalone illustrations load at more than 1000 pixels wide and enters Practice as the batfish. Guide and Practice captures were inspected. No page errors occurred. Reproduce with scripts/qa-species-corrections.mjs; it also accepts a packaged Windows executable for native verification.

These checks establish content delivery and visible improvement, not full species or historical-mechanics fidelity. Refreshed Windows packaging is a separate verification step.
