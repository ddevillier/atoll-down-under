// Authored play populations, not estimates of wild abundance or original-game counts.
// Bottom residents and a cleaner remain available in every habitat.
export const POPULATIONS=[
 {foragers:[5,7],companions:[3,4],secondHunter:.25}, // Sunlit Crest
 {foragers:[7,9],companions:[3,5],secondHunter:.25}, // Table Coral Terrace
 {foragers:[3,5],companions:[3,4],secondHunter:.45}, // Outer Blue
 {foragers:[6,8],companions:[1,2],secondHunter:.25}, // Sea Fan Garden
 {foragers:[9,11],companions:[1,2],secondHunter:.25}, // Coral Cathedral
 {foragers:[4,6],companions:[1,2],secondHunter:.25}, // The Old Wreck
 {foragers:[5,7],companions:[1,2],secondHunter:.25}, // Seagrass Meadow
 {foragers:[2,4],companions:[1,2],secondHunter:.25}, // Pearl Sands
 {foragers:[1,3],companions:[1,1],secondHunter:.25}, // Quiet Grotto
];
export function populationFor(id,random){
 const profile=POPULATIONS[id];
 const sample=([min,max])=>min+Math.floor(random()*(max-min+1));
 return {foragers:sample(profile.foragers),companions:sample(profile.companions),hunters:1+(random()<profile.secondHunter?1:0)};
}
