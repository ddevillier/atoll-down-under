import {FEEDING_SITES} from './feeding-sites.js';
// Authored visual sand regions in gameplay coordinates (background y - 55).
// These conservative envelopes follow the pale sand in reef-6/reef-7 artwork.
// Eligibility selects existing food; it never moves food or animals.
const SAND_REGIONS={
 6:[[120,350,320,680],[470,280,640,710],[860,240,1030,700],[1260,330,1430,640]],
 7:[[300,180,620,500],[570,370,740,470],[530,550,650,625]]
};
export function detectiveSandFood(reef,food){
 return !!(food?.kind==='food'&&['worm','shrimp'].includes(food.food)&&Number.isFinite(food.x)&&Number.isFinite(food.y)&&FEEDING_SITES[reef]?.[food.food]?.some(([x,y])=>Math.hypot(food.x-x,food.y-y)<1)&&SAND_REGIONS[reef]?.some(([left,top,right,bottom])=>food.x>=left&&food.x<=right&&food.y>=top&&food.y<=bottom));
}
export function detectiveBuriedCandidates(section,reef){
 const meals=section?.food?.filter(f=>['worm','shrimp'].includes(f.food))||[],marked=new Set(meals.slice(0,2).map(f=>f.id));
 return meals.filter(f=>detectiveSandFood(reef,f)&&f.regrow<=0&&f.amount>0&&!(f.uncovered>0)&&f.sandSource===undefined&&!marked.has(f.id));
}

