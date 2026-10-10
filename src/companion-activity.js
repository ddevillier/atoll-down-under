import {approachCleaning} from './cleaning-stations.js';
import {REEFS} from './data.js';
import {meetFish,rememberExperience,animalPhrase} from './reef-memories.js';
import {edible} from './diet.js';
import {sharedMealAvailable} from './social-motion.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const pairedBrowser=p=>['s8','s48','s52','s40','s56'].includes(p.species.id);
export const companionFoods=p=>p.species.id==='s40'?['algae','plankton']:p.species.id==='s56'?['plankton','worm']:null;
const sameCommunity=(p,e)=>p.species.id==='s40'?!e.groundRoute&&!e.holdfast&&e.species.ability!=='clean'&&!e.species.diet.includes('fish')&&e.species.size>=30&&e.species.size<140&&e.species.diet.some(f=>['algae','plankton'].includes(f)):e.species.id===p.species.id;
export function validBuddy(b){return b==null||typeof b==='object'&&(typeof b.id==='string'&&b.id.length>0&&b.id.length<100&&b.id!=='player'||Number.isInteger(b.id)&&b.id>=0)&&Number.isInteger(b.reef)&&b.reef>=0&&b.reef<9&&Number.isInteger(b.incarnation)&&b.incarnation>=0&&(b.away===undefined||typeof b.away==='boolean')&&(b.tripRecorded===undefined||typeof b.tripRecorded==='boolean')&&(b.foods===undefined||Array.isArray(b.foods)&&b.foods.length<=2&&b.foods.every(f=>['algae','plankton','worm'].includes(f)))&&typeof b.playerMeal==='boolean'&&typeof b.partnerMeal==='boolean'&&Number.isFinite(b.rejoined)&&b.rejoined>=0&&b.rejoined<=3;}
export function companion(sim){const b=sim.adventure?.buddy;return b&&b.reef===sim.current&&pairedBrowser(sim.player)?sim.section.entities.find(e=>e.id===b.id&&e.alive&&sameCommunity(sim.player,e)&&(e.incarnation||0)===b.incarnation):null;}
export function companionInstruction(sim){
 const a=sim.adventure,e=companion(sim);
 if(a.buddy?.reef!==undefined&&a.buddy.reef!==sim.current)return 'Your familiar companion stays in '+REEFS[a.buddy.reef].name+' · Return to meet again';
 if(e&&a.buddy.away)return 'Your familiar companion is here · Swim nearby to browse together again';
 if(e&&a.buddy.rejoined>=3)return 'Home together · Press E for another shared feeding trip';
 if(!e){
  if(!sim.section.entities.some(e=>e.alive&&sameCommunity(sim.player,e))){
   const reef=sim.sections.findIndex(r=>r.entities.some(e=>e.alive&&sameCommunity(sim.player,e)));
   if(reef>=0)return 'Visit '+REEFS[reef].name+' to find '+(sim.player.species.id==='s40'?'a suitable browsing neighbor':'a companion of your species');
  }
  return sim.player.species.id==='s40'?'Swim near a small reef grazer or plankton feeder and press E':'Swim near your species and press E to browse together';
 }
 if(e.cleanTime>0||sim.section.entities.some(b=>b.id===e.target&&b.species.ability==='clean'))return 'Your companion is visiting a cleaner · Wait nearby or explore';
 if(!a.buddy.playerMeal){const foods=companionFoods(sim.player);return foods?'Take '+foods[a.buddy.foods?.length||0]+' within sight of your companion':'Take a meal within sight of your companion';}
 if(!a.buddy.partnerMeal)return e.satiated>0?'Your companion is digesting · Explore together until it is hungry':'Browse near food and let your companion eat · Stay nearby';
 return `Meet your companion again · ${Math.floor(a.buddy.rejoined)}/3 seconds together`;
}
export function releaseCompanion(sim){
 const b=sim.adventure?.buddy;if(!b)return;
 const fish=sim.sections[b.reef]?.entities.find(e=>e.id===b.id);
 if(fish?.ecology?.partner===sim.player.id)fish.ecology.partner=null;
 sim.adventure.buddy=null;
}
export function partCompanion(sim){
 const b=sim.adventure?.buddy;if(!b)return;
 const e=sim.sections[b.reef]?.entities.find(e=>e.id===b.id);
 if(e?.ecology?.partner===sim.player.id)e.ecology.partner=null;
 b.away=true;b.rejoined=0;
}
export function companionCandidates(sim){const p=sim.player;return sim.section.entities.filter(e=>e.alive&&sameCommunity(p,e)&&e.health>0&&!e.hidden&&!e.stun&&!e.feeding&&!e.target&&!e.cleanTime).sort((a,b)=>distance(a,p)-distance(b,p));}
export function inviteCompanion(sim){
 const p=sim.player;if(!pairedBrowser(p)||sim.paused||sim.phase!=='playing')return false;
 if(companion(sim)&&!sim.adventure.buddy.away){
  const b=sim.adventure.buddy;
  if(b.rejoined>=3){b.foods=[];b.playerMeal=false;b.partnerMeal=false;b.rejoined=0;b.tripRecorded=false;sim.event('activity-step','Another trip together');return true;}
  releaseCompanion(sim);sim.event('activity-step','Exploring separately');return true;
 }
 const e=companionCandidates(sim).find(e=>distance(e,p)<280);
 if(!e){sim.event('message','Move near a resting '+(p.species.id==='s40'?'reef grazer':p.species.name.toLowerCase())+' and press E.');return false;}
 releaseCompanion(sim);
 const former=sim.section.entities.find(b=>b.id===e.ecology?.partner);if(former?.ecology?.partner===e.id)former.ecology.partner=null;
 e.ecology??={reef:sim.current,clock:0,point:0,wait:0,partner:null,host:null};e.ecology.partner=p.id;
 meetFish(sim,e);
 sim.adventure.buddy={id:e.id,reef:sim.current,incarnation:e.incarnation||0,playerMeal:false,partnerMeal:false,rejoined:0,away:false,tripRecorded:false};
 sim.event('activity-step','Browsing together');return true;
}
// This is reached only after feeding, danger, cleaning and rest have had their
// turn. The companion can make a real feeding excursion and then come back.
export function followPlayerCompanion(sim,e,dt,speed){
 if(companion(sim)!==e||sim.adventure.buddy.away)return null;
 const p=sim.player,d=distance(e,p);
 if(d>650){partCompanion(sim);return null;}
 // A hungry companion can find a real nearby patch instead of waiting at the
 // player's side just outside normal meal-detection range. Ordinary meal
 // selection and contact still perform the feeding on subsequent ticks.
 if(e.satiated<=0&&e.rest<=0&&!sim.adventure.buddy.partnerMeal){
  const patch=sim.section.food.filter(f=>f.regrow<=0&&edible(e,f)&&distance(f,p)<300&&distance(f,e)<330&&sharedMealAvailable(e,f,sim.section.entities)).sort((a,b)=>distance(e,a)-distance(e,b))[0];
  if(patch){approachCleaning(e,patch,dt,speed);e.activity='foraging';e.behavior='Making a short feeding excursion beside you';return 0;}
 }
 const side=e.x<p.x?-1:1,dest={x:p.x+side*100,y:p.y+35};
 if(d>145){approachCleaning(e,dest,dt,speed);e.activity='companionship';e.behavior='Returning to your side';return 0;}
 e.activity='waiting';e.behavior=p.target||p.feeding?'Waiting while you feed':'Browsing beside you';return speed*.08;
}
export function companionMeal(sim,e,food){
 const c=companion(sim),b=sim.adventure?.buddy;if(!c||b.away||food.kind!=='food'||!e.species.diet.includes(food.food))return;
 if(e===sim.player&&distance(e,c)<300){const foods=companionFoods(e);if(foods){b.foods??=[];if(food.food===foods[b.foods.length])b.foods.push(food.food);b.playerMeal=b.foods.length===foods.length;}else b.playerMeal=true;}
 if(e===c&&distance(e,sim.player)<300)b.partnerMeal=true;
}
export function tickCompanion(sim,dt){
 const b=sim.adventure?.buddy;if(!b)return false;const e=companion(sim),p=sim.player;
 const original=sim.sections[b.reef]?.entities.find(f=>f.id===b.id&&f.alive&&sameCommunity(p,f)&&(f.incarnation||0)===b.incarnation);
 if(!original||p.health<=0){releaseCompanion(sim);return false;}
 if(b.reef!==sim.current){b.rejoined=0;return false;}
 if(distance(e,p)>650){partCompanion(sim);return false;}
 const calm=!e.target&&!e.feeding&&!e.cleanTime&&!e.stun&&e.activity!=='avoiding'&&!p.target&&!p.feeding&&!p.cleanerTarget&&!p.stun;
 if(b.away){if(!calm||distance(e,p)>280)return false;b.away=false;e.ecology??={reef:sim.current,clock:0,point:0,wait:0,partner:null,host:null};const former=sim.section.entities.find(f=>f.id===e.ecology.partner);if(former?.ecology?.partner===e.id)former.ecology.partner=null;e.ecology.partner=p.id;sim.event('activity-step','Companion rejoined');}
 b.rejoined=b.playerMeal&&b.partnerMeal&&calm&&distance(e,p)<145?Math.min(3,b.rejoined+dt):0;
 if(b.rejoined>=3&&!b.tripRecorded){b.tripRecorded=true;rememberExperience(sim,'shared-trip','Shared a feeding trip with '+animalPhrase(e.species.name)+' in '+REEFS[sim.current].name+'.',{neighbor:e.species.id,...(b.foods?.length?{foods:b.foods}: {})});sim.event('reunion','Together again · Your companion makes room beside you.',{x:e.x,y:e.y,animalId:e.id});}
 return b.rejoined>=3;
}
