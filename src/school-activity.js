import {animalProfile} from './animal-profiles.js';
import {edible} from './diet.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const SCHOOL_WAVE_SECONDS=10;
const incarnation=e=>e.incarnation||0;
const memberId=id=>Number.isInteger(id)&&id>=0||typeof id==='string'&&id.length>0&&id.length<100&&id!=='player';
const sameMember=(e,m)=>e.id===m.id&&incarnation(e)===m.incarnation;
const available=e=>e.alive&&e.health>0&&!e.hidden&&!(e.stun>0)&&!(e.satiated>0)&&!(e.rest>0)&&!e.target&&!e.feeding&&!(e.actionTime>0)&&!(e.cleanTime>0)&&!e.service&&e.activity!=='avoiding'&&!e.behavior?.startsWith('Moving away');
const needsService=(sim,e)=>sim.player.service?.reef===sim.current&&sim.player.service.client===e.id||e.species.parasites&&100-e.health-(e.biteDamage||0)-(e.poisonDamage||0)>35;
export function schoolDanger(sim,e){
 return [...sim.section.entities,sim.player].some(b=>b!==e&&b?.alive&&!b.hidden&&edible(b,e)&&distance(b,e)<100&&(b===sim.player||!(b.satiated>0)||b.target===e.id));
}
export function validSchoolWave(w,section){
 if(w==null)return true;
 const identity=m=>m&&typeof m==='object'&&!Array.isArray(m)&&memberId(m.id)&&Number.isInteger(m.incarnation)&&m.incarnation>=0;
 if(typeof w!=='object'||Array.isArray(w)||typeof w.species!=='string'||typeof w.patch!=='string'||!w.patch.length||w.patch.length>=100||!identity(w.origin)||!Number.isFinite(w.elapsed)||w.elapsed<0||w.elapsed>SCHOOL_WAVE_SECONDS||!Array.isArray(w.followers)||w.followers.length<1||w.followers.length>2||!w.followers.every(identity)||new Set([w.origin.id,...w.followers.map(m=>m.id)]).size!==w.followers.length+1)return false;
 if(!section)return true;
 const fish=[w.origin,...w.followers].map(m=>section.entities.find(e=>sameMember(e,m)));
 return section.food.some(f=>f.id===w.patch&&f.food==='plankton')&&fish.every(e=>e&&e.species.id===w.species&&animalProfile(e.species).social==='school'&&e.species.diet.includes('plankton'));
}
export function cancelNpcSchoolWave(sim,section=sim.section){
 const wave=section.schoolWave;if(!wave)return;
 for(const m of wave.followers){
  const fish=section.entities.find(e=>sameMember(e,m));
  if(fish?.target===wave.patch&&!fish.feeding?.committed){fish.target=null;fish.feeding=null;fish.pursuit=0;fish.think=.4;fish.behavior='Returning to school';}
 }
 section.schoolWave=null;
}
export function startNpcSchoolWave(sim,e,food){
 // Only the committed NPC consumption path calls this, after subtracting food.
 // The invitation changes attention, never appetite, food or player progress.
 if(e===sim.player||!e.alive||e.health<=0||animalProfile(e.species).social!=='school'||!e.species.diet.includes('plankton')||food.food!=='plankton'||food.kind!=='food'||food.regrow>0||!(food.amount>0)||!e.feeding?.committed||e.feeding.target!==food.id||sim.section.schoolWave||schoolDanger(sim,e))return false;
 const followers=sim.section.entities.filter(b=>b!==e&&b.species.id===e.species.id&&available(b)&&!needsService(sim,b)&&distance(b,e)<240&&distance(b,food)<240&&!schoolDanger(sim,b)).sort((a,b)=>distance(a,e)-distance(b,e)||String(a.id).localeCompare(String(b.id))).slice(0,2);
 if(!followers.length)return false;
 sim.section.schoolWave={species:e.species.id,patch:food.id,origin:{id:e.id,incarnation:incarnation(e)},elapsed:0,followers:followers.map(b=>({id:b.id,incarnation:incarnation(b)}))};
 for(const b of followers)b.think=0;
 return true;
}
export function tickNpcSchoolWave(sim,dt){
 const wave=sim.section.schoolWave;if(!wave)return;
 wave.elapsed=Math.min(SCHOOL_WAVE_SECONDS,wave.elapsed+dt);
 const food=sim.section.food.find(f=>f.id===wave.patch&&f.food==='plankton'&&f.regrow<=0&&f.amount>0);
 const origin=sim.section.entities.find(e=>sameMember(e,wave.origin));
 const followers=wave.followers.map(m=>sim.section.entities.find(e=>sameMember(e,m)));
 if(wave.elapsed>=SCHOOL_WAVE_SECONDS||sim.phase!=='playing'||!food||!origin?.alive||followers.some(e=>!e?.alive)||[origin,...followers].some(e=>schoolDanger(sim,e))){cancelNpcSchoolWave(sim);return;}
 // Service and ordinary feeding can take over without keeping a stale invite.
 wave.followers=wave.followers.filter(m=>{const e=sim.section.entities.find(e=>sameMember(e,m));return !e.service&&!needsService(sim,e)&&!(e.cleanTime>0)&&!(e.stun>0)&&(!e.target||e.target===wave.patch);});
 if(!wave.followers.length)cancelNpcSchoolWave(sim);
}
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
 }else if(e!==p){
  const trip=sim.adventure.school;
  if(trip&&trip.reef===sim.current&&trip.patch===food.id&&e.species.id===p.species.id&&distance(e,p)<300)trip.neighborMeal=true;
 }
}
export function sharedSchoolFood(sim,e){
 const wave=sim.section.schoolWave;
 if(wave&&e.species.id===wave.species&&wave.followers.some(m=>sameMember(e,m))&&available(e)&&!needsService(sim,e)&&!schoolDanger(sim,e)){
  const food=sim.section.food.find(f=>f.id===wave.patch&&f.food==='plankton'&&f.regrow<=0&&f.amount>0);
  if(food&&distance(e,food)<240&&sim.section.entities.filter(b=>b!==e&&b.alive&&b.species.id===e.species.id&&b.target===food.id).length<2)return food;
 }
 const trip=sim.adventure.school,p=sim.player;
 if(!trip||trip.reef!==sim.current||trip.neighborMeal||!feedingSchool(p)||e.species.id!==p.species.id||e.satiated>0||e.rest>0||e.feeding||e.cleanTime>0)return null;
 const f=sim.section.food.find(f=>f.id===trip.patch&&f.regrow<=0&&f.food==='plankton');
 if(!f||distance(e,f)>240||sim.section.entities.filter(b=>b!==e&&b.alive&&b.species.id===e.species.id&&b.target===f.id).length>=2)return null;
 return f;
}
export function schoolFoodAvailable(sim,e,food){
 if(animalProfile(e.species).social!=='school'||food.kind!=='food')return true;
 return sim.section.entities.filter(b=>b!==e&&b.alive&&b.species.id===e.species.id&&b.target===food.id).length<2;
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
