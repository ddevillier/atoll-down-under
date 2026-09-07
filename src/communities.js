// Authored exploration mixes, not recovered original-game communities or
// claims about exact wild distributions. Activity and feeding eligibility
// are filtered by the simulation before these preferences are applied.
export const COMMUNITIES=[
 {day:[5,8,52],night:[12,53]}, // Sunlit Crest: grazers above the reef
 {day:[2,6,7,30],night:[12,13]}, // Table Coral Terrace: small coral and anemone residents
 {day:[0,11,42,58],night:[53]}, // Outer Blue: plankton feeders
 {day:[6,25,56],night:[12]}, // Sea Fan Garden: reef browsers
 {day:[4,15,48],night:[13]}, // Coral Cathedral: coral and sponge feeders
 {day:[3,22,40],night:[12,53]}, // Old Wreck: mixed visitors near cover
 {day:[8,9,52],night:[14,13]}, // Seagrass Meadow: grazers and bottom foragers
 {day:[9,22,23],night:[14]}, // Pearl Sands: bottom foragers
 {day:[3,2],night:[13,53]}, // Quiet Grotto: small residents
];

export function chooseForager(pool,reef,period,roll){
 const preferred=COMMUNITIES[reef.id]?.[period]||[];
 const weights=pool.map(s=>preferred.includes(s.index)?8:s.habitat===reef.habitat?2:1);
 let remaining=roll*weights.reduce((sum,w)=>sum+w,0);
 for(let i=0;i<pool.length;i++){
  remaining-=weights[i];
  if(remaining<0)return pool[i];
 }
 return pool.at(-1);
}
