# Lantern Company art

Generated 10 October 2026 using the built-in imagegen tool, with transparent alpha. Original illustrations; source photographs are not copied or shipped.

`anomalops-katoptron-v1.png` is a separate **Anomalops katoptron case-study** painting. The ordinary s53 family-level atlas sprite remains unidentified. Inspection found its continuous dorsal and bright blue body did not resolve the species gate. The new painting has two separate dorsal fins, a forked tail, a charcoal body, a large eye and a dark bean-shaped subocular organ. Runtime masks extract painted fin layers; local light geometry exposes the light-emitting surface and suppresses it when the pigmented organ back is presented. These are presentation abstractions, not measured rates or a universal signaling language.

References consulted:
- [Australian Museum: Twofin Flashlightfish](https://australian.museum/learn/animals/fishes/twofin-flashlightfish-anomalops-katoptronem/), Mark McGrouther. Species identity and large organ below each eye.
- [Fishes of Australia: Anomalops katoptron](https://fishesofaustralia.net.au/Home/species/3734), Bray 2017. Bean-shaped bluish light organ and inward rotation.
- [Gruber et al. 2019](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0219852). Continuously luminous bacterial organ is hidden by downward rotation; nighttime schooling.
- [Jägers et al. 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC7979757/). Pigmented organ back, social perception and context-dependent spacing.

Generation reference: `assets/creatures/fish-atlas-3.png`, inspected as painting/style reference only. The old flashlightfish anatomy was explicitly excluded. Generated source: `exec-5313024b-69c7-49db-a9d0-c5a5f6f5b56a.png`.

Exact fish prompt:

```text
Use case: scientific-educational
Asset type: transparent side-profile fish game sprite for an illustrated natural-history reef.
Primary request: Paint one anatomically credible adult splitfin / twofin flashlightfish Anomalops katoptron, in exactly horizontal lateral profile, facing RIGHT, with its entire forked tail and every fin intact.
Subject: fusiform near-black charcoal body, subtle indigo blue highlights and fine scales; large round black eye with restrained silver blue rim; a short blunt snout; TWO distinct dorsal fins, separated by a clear deep gap (small anterior spiny dorsal near head, larger soft dorsal behind it toward tail), forked caudal fin, visible pectoral, pelvic and anal fins with subtle bluish pale margins. A bean-shaped subocular light organ sits directly BELOW the large eye and is currently ROTATED INWARD / OCCLUDED: paint its dark pigmented outer back clearly, no emitted light. No glowing eye.
Style/medium: rich detailed hand-painted natural-history illustration matching the crisp side-profile fish style in the reference atlas. Reference image is STYLE ONLY; its blue flashlightfish has inaccurate continuous dorsal and is NOT an anatomy reference.
Composition/framing: a SINGLE fish centered, swimming straight with level body, head right, tail left, fins naturally spread, full silhouette with generous transparent margins.
Lighting/mood: neutral soft illumination that retains charcoal body detail at small game sizes; do not make whole body neon blue.
Constraints: genuinely transparent alpha background. No water, reef, rock, background color, cast shadow, halo, light beam, text, labels, grid, diagram or extra fish. Do not merge the dorsal fins. Photophore remains dark so runtime can reveal the organ locally.
Anatomical evidence: Australian Museum Twofin Flashlightfish Anomalops katoptron; Gruber et al. 2019 representative adult and rotating subocular organ; Jägers et al. 2021 continuous bacterial light hidden by exposing pigmented organ back. This is a new case-study illustration, not a copied museum photograph.
```

`grotto-outcrop-v1.png` is a compact limestone obstacle, fitted inside the same 94-world-unit collision/sight circle used by the story. Generation reference: `assets/reefs/reef-8.png`, inspected for material and palette. Generated source: `exec-a50b457a-4bd9-4021-8286-cb3178af3f1b.png`.

Exact outcrop prompt:

```text
Use case: illustration-story
Asset type: transparent painted obstacle for a natural-history reef game.
Primary request: one small compact roughly rounded coral limestone outcrop, viewed from the side, full silhouette; a solid rock with irregular but approximately circular silhouette, width and height nearly equal.
Style/medium: detailed painted natural-history underwater illustration matching the attached Quiet Grotto reference habitat. Muted mossy olive limestone, dark teal crevices, subtly weathered pale olive surfaces. Only two or three small restrained patches of dull pink encrusting coralline algae. Dense stone, no big holes.
Composition: isolated rock, centered, all edges complete, modest transparent margins; clear organic jagged silhouette that fits close to a circle. It will block sight lines through its center in game.
Constraints: genuinely transparent alpha background; no surrounding reef, no water, no sand, no glow, no shadows outside rock, no text, no frame. No tall branching coral or plants outside the compact rock contour. Preserve the attached image's rocky material and painted detail, but create a new isolated outcrop.
```
