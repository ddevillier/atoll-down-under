// Authored gameplay rules, shared by shelter detection and its on-screen explanation.
export const SHELTER_SETTLE_SECONDS=.7;
export const canUseShelter=species=>species.size<125;
export const shelterAt=(reef,fish)=>reef.shelters.find(s=>Math.hypot(fish.x-s.x,fish.y-s.y)<s.r);
export {PROTECTED_WATCHING as PROTECTION_HINT} from './risk-cues.js';
export function shelterHint(reef,fish){
 if(!shelterAt(reef,fish))return '';
 if(!canUseShelter(fish.species))return '';
 return fish.hidden?'Hidden':fish.still>0?'Taking cover':'Shelter';
}
