const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const feedingSchool=p=>['s0','s11','s42','s58'].includes(p.species.id);
export function validSchoolTrip(s){return s==null||typeof s==='object'&&Number.isInteger(s.reef)&&s.reef>=0&&s.reef<9&&typeof s.patch==='string'&&s.patch.length>0&&s.patch.length<100&&typeof s.neighborMeal==='boolean'&&Number.isFinite(s.joined)&&s.joined>=0&&s.joined<=3;}
export function schoolNeighbors(sim){const p=sim.player;return sim.section.entities.filter(e=>e.alive&&!e.hidden&&!e.stun&&!e.cleanTime&&e.species.id===p.species.id&&e.activity!=='avoiding'&&distance(e,p)<220);}
export function schoolMeal(sim,e,food){
 const p=sim.player;if(!feedingSchool(p)||food.kind!=='food'||food.food!=='plankton')return;
 if(e===p&&schoolNeighbors(sim).length>=2){
  // Every nearby meal can start another feeding wave, including after the
  // journal discovery. Returning to the school completes the current trip.
  sim.adventure.school={reef:sim.current,patch:food.id,neighborMeal:false,joined:0};
  for(const n of schoolNeighbors(sim))if(!n.target&&!n.feeding)n.think=0;
 }else{
  const trip=sim.adventure.school;
  if(trip&&trip.reef===sim.current&&trip.patch===food.id&&e.species.id===p.species.id&&distance(e,p)<300)trip.neighborMeal=true;
 }
}
export function sharedSchoolFood(sim,e){
 const trip=sim.adventure.school,p=sim.player;
 if(!trip||trip.reef!==sim.current||trip.neighborMeal||!feedingSchool(p)||e.species.id!==p.species.id||e.satiated>0||e.rest>0||e.feeding||e.cleanTime>0)return null;
 const f=sim.section.food.find(f=>f.id===trip.patch&&f.regrow<=0&&f.food==='plankton');
 if(!f||distance(e,f)>240||sim.section.entities.filter(b=>b!==e&&b.alive&&b.species.id===e.species.id&&b.target===f.id).length>=2)return null;
 return f;
}
export function tickSchoolTrip(sim,dt){
 const trip=sim.adventure.school;if(!trip)return false;
 const p=sim.player,neighbors=schoolNeighbors(sim).filter(e=>e.activity==='schooling'&&!e.target&&!e.feeding);
 trip.joined=trip.reef===sim.current&&trip.neighborMeal&&neighbors.length>=2&&!p.target&&!p.feeding?Math.min(3,trip.joined+dt):0;
 return trip.joined>=3;
}
export function schoolInstruction(sim){
 const trip=sim.adventure.school;
 if(!trip)return 'Swim with two schoolmates, then take a plankton meal nearby';
 if(trip.reef!==sim.current)return 'Return to your feeding habitat or begin another feeding trip';
 if(!trip.neighborMeal){
  const neighbors=schoolNeighbors(sim);
  if(neighbors.length<2)return 'Your school has moved on · Join it and try another plankton patch';
  if(neighbors.every(e=>e.satiated>0||e.rest>0))return 'Your schoolmates are digesting · Explore together or wait near plankton';
  return 'Stay near the plankton patch while a hungry schoolmate feeds';
 }
 return `Rejoin two schoolmates · ${Math.floor(trip.joined)}/3 seconds together`;
}
