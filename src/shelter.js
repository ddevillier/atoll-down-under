// Authored gameplay rules, shared by shelter detection and its on-screen explanation.
export const SHELTER_SETTLE_SECONDS=.7;
export const canUseShelter=species=>species.size<125;
export const shelterAt=(reef,fish)=>reef.shelters.find(s=>Math.hypot(fish.x-s.x,fish.y-s.y)<s.r);
export const PROTECTION_HINT='Protected exploration · Eating, active abilities or travel end protection';
export function shelterHint(reef,fish){
 if(!shelterAt(reef,fish))return '';
 if(!canUseShelter(fish.species))return 'This shelter is too small for your fish';
 return fish.still>0?'Taking cover · Remain still until hidden':'Shelter · Stop swimming here to hide';
}
