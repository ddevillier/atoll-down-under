// Widescreen readability: small creatures need enough pixels to show anatomy.
// Ecological size remains separate for diets, movement and feeding rules.
export function creatureWidth(species){return Math.max(species.size,28+species.size*.75);}
