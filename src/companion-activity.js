import {approachCleaning} from './cleaning-stations.js';
import {REEFS} from './data.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const pairedBrowser=p=>['s8','s48','s52'].includes(p.species.id);
export function validBuddy(b){return b==null||typeof b==='object'&&(typeof b.id==='string'&&b.id.length>0&&b.id.length<100&&b.id!=='player'||Number.isInteger(b.id)&&b.id>=0)&&Number.isInteger(b.reef)&&b.reef>=0&&b.reef<9&&Number.isInteger(b.incarnation)&&b.incarnation>=0&&typeof b.playerMeal==='boolean'&&typeof b.partnerMeal==='boolean'&&Number.isFinite(b.rejoined)&&b.rejoined>=0&&b.rejoined<=3;}
export function companion(sim){const b=sim.adventure?.buddy;return b&&b.reef===sim.current&&pairedBrowser(sim.player)?sim.section.entities.find(e=>e.id===b.id&&e.alive&&e.species.id===sim.player.species.id&&(e.incarnation||0)===b.incarnation):null;}
export function companionInstruction(sim){
 const a=sim.adventure,e=companion(sim);
 if(!e){
  if(!sim.section.entities.some(e=>e.alive&&e.species.id===sim.player.species.id)){
   const reef=sim.sections.findIndex(r=>r.entities.some(e=>e.alive&&e.species.id===sim.player.species.id));
   if(reef>=0)return 'Visit '+REEFS[reef].name+' to find a companion of your species';
  }
  return 'Swim near your species and press E to browse together';
 }
 if(e.cleanTime>0||sim.section.entities.some(b=>b.id===e.target&&b.species.ability==='clean'))return 'Your companion is visiting a cleaner · Wait nearby or explore';
 if(!a.buddy.playerMeal)return 'Take a meal within sight of your companion';
 if(!a.buddy.partnerMeal)return e.satiated>0?'Your companion is digesting · Explore together until it is hungry':'Browse near food and let your companion eat · Stay nearby';
 return `Meet your companion again · ${Math.floor(a.buddy.rejoined)}/3 seconds together`;
}
export function releaseCompanion(sim){
 const b=sim.adventure?.buddy;if(!b)return;
 const fish=sim.sections[b.reef]?.entities.find(e=>e.id===b.id);
 if(fish?.ecology?.partner===sim.player.id)fish.ecology.partner=null;
 sim.adventure.buddy=null;
}
export function inviteCompanion(sim){
 const p=sim.player;if(!pairedBrowser(p)||sim.paused||sim.phase!=='playing')return false;
 if(companion(sim)){releaseCompanion(sim);sim.event('message','You can each explore freely.');return true;}
 const e=sim.section.entities.filter(e=>e.alive&&e.species.id===p.species.id&&e.health>0&&!e.hidden&&!e.stun&&!e.feeding&&!e.target&&!e.cleanTime&&distance(e,p)<280).sort((a,b)=>distance(a,p)-distance(b,p))[0];
 if(!e){sim.event('message','Swim near a resting '+p.species.name.toLowerCase()+', then press E to browse together.');return false;}
 releaseCompanion(sim);
 const former=sim.section.entities.find(b=>b.id===e.ecology?.partner);if(former?.ecology?.partner===e.id)former.ecology.partner=null;
 e.ecology??={reef:sim.current,clock:0,point:0,wait:0,partner:null,host:null};e.ecology.partner=p.id;
 sim.adventure.buddy={id:e.id,reef:sim.current,incarnation:e.incarnation||0,playerMeal:false,partnerMeal:false,rejoined:0};
 sim.event('message','Browsing together · Take a meal, let your companion feed, then meet again.');return true;
}
// This is reached only after feeding, danger, cleaning and rest have had their
// turn. The companion can make a real feeding excursion and then come back.
export function followPlayerCompanion(sim,e,dt,speed){
 if(companion(sim)!==e)return null;
 const p=sim.player,d=distance(e,p);
 if(d>650){releaseCompanion(sim);return null;}
 const side=e.x<p.x?-1:1,dest={x:p.x+side*100,y:p.y+35};
 if(d>145){approachCleaning(e,dest,dt,speed);e.activity='companionship';e.behavior='Returning to your side';return 0;}
 e.activity='waiting';e.behavior=p.target||p.feeding?'Waiting while you feed':'Browsing beside you';return speed*.08;
}
export function companionMeal(sim,e,food){
 const c=companion(sim),b=sim.adventure?.buddy;if(!c||food.kind!=='food'||!e.species.diet.includes(food.food))return;
 if(e===sim.player&&distance(e,c)<300)b.playerMeal=true;
 if(e===c&&distance(e,sim.player)<300)b.partnerMeal=true;
}
export function tickCompanion(sim,dt){
 const b=sim.adventure?.buddy;if(!b)return false;const e=companion(sim),p=sim.player;
 if(!e||p.health<=0||distance(e,p)>650){releaseCompanion(sim);return false;}
 const calm=!e.target&&!e.feeding&&!e.cleanTime&&!e.stun&&e.activity!=='avoiding'&&!p.target&&!p.feeding&&!p.cleanerTarget;
 b.rejoined=b.playerMeal&&b.partnerMeal&&calm&&distance(e,p)<145?Math.min(3,b.rejoined+dt):0;
 return b.rejoined>=3;
}
