import {approachMeal} from './feeding-contact.js';
import {animalProfile} from './animal-profiles.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const sandSearcher=p=>['s9','s23'].includes(p.species.id);
export const validSandSource=id=>id===undefined||typeof id==='string'&&id.length>0&&id.length<100||typeof id==='number'&&Number.isFinite(id);
export function validSandProbe(p){return p==null||typeof p==='object'&&Number.isInteger(p.reef)&&p.reef>=0&&p.reef<9&&typeof p.food==='string'&&p.food.length>0&&p.food.length<100&&(p.eat===undefined||typeof p.eat==='boolean')&&Number.isFinite(p.elapsed)&&p.elapsed>=0&&p.elapsed<=1.5;}
export function uncoverSand(sim,food,actor){
 food.uncovered=8;food.sandSource=actor.id;
 actor.actionTime=1;
 // A local opportunity wakes existing foragers; it does not create food or
 // animals and does not interrupt a meal, rest, danger or a cleaning visit.
 for(const e of sim.section.entities)if(e.alive&&!e.target&&!e.feeding&&distance(e,food)<240)e.think=0;
}
export function startSandProbe(sim,food,eat=false){
 const p=sim.player;p.sandProbe={reef:sim.current,food:food.id,elapsed:0,eat};
 p.target=null;p.feeding=null;p.hidden=false;sim.pointer={x:p.x,y:p.y};
 sim.event('message','Inspecting the sand with your barbels · Move to stop.');
}
export function tickSandProbe(sim,dt){
 const p=sim.player,q=p.sandProbe;if(!q)return false;
 const food=q.reef===sim.current&&sim.section.food.find(f=>f.id===q.food&&f.regrow<=0);
 if(!food||p.species.id!=='s9'||p.health<=0||p.stun>0||p.target||p.cleanerTarget){p.sandProbe=null;return false;}
 const contact=approachMeal(p,food,dt,p.species.speed);
 p.activity='probing';p.behavior='Inspecting sand with your barbels';
 if(contact.ready)q.elapsed=Math.min(1.5,q.elapsed+dt);
 if(q.elapsed>=1.5){
  uncoverSand(sim,food,p);p.sandProbe=null;sim.pointer={x:p.x,y:p.y};
  if(q.eat)p.target=food.id;
  sim.event('sand','A meal uncovered. Eat, or leave it for a nearby forager.',{x:food.x,y:food.y});
 }
 return true;
}
export function sharedSandFood(sim,e){
 if(e.satiated>0||e.rest>0||e.feeding||e.cleanTime>0||e.species.ability==='clean'||!['probe-sand','sand','pick','bottom-forage'].includes(animalProfile(e.species).routine))return null;
 return sim.section.food.filter(f=>f.regrow<=0&&f.uncovered>0&&f.sandSource!==e.id&&e.species.diet.includes(f.food)&&distance(e,f)<240&&!sim.section.entities.some(b=>b!==e&&b.alive&&b.target===f.id)).sort((a,b)=>distance(e,a)-distance(e,b))[0]||null;
}
export function sandOpportunityHint(sim,foods){
 const food=foods.filter(f=>f.regrow<=0).sort((a,b)=>distance(sim.player,a)-distance(sim.player,b))[0];
 if(!food)return 'Try another habitat for a sand meal to share';
 const approaching=sim.section.entities.find(e=>e.alive&&e.target===food.id&&e.id!==food.sandSource);
 if(approaching)return approaching.species.name+' is approaching · Leave this meal and watch nearby';
 const ready=sim.section.entities.find(e=>e.alive&&!e.hidden&&!e.stun&&!e.target&&!e.feeding&&!e.cleanTime&&!(e.satiated>0)&&!(e.rest>0)&&e.activity!=='avoiding'&&['probe-sand','sand','pick','bottom-forage'].includes(animalProfile(e.species).routine)&&e.species.diet.includes(food.food)&&distance(e,food)<240);
 return ready?ready.species.name+' may share this patch · Uncover a meal and watch':'No hungry sand forager at this patch · Try another patch or explore';
}
export function witnessSandMeal(sim,e,food){
 if(sim.player.species.id==='s9'&&food.uncovered>0&&food.sandSource===sim.player.id&&distance(sim.player,food)<260){
  if(!sim.adventure.shared)sim.event('message',e.species.name+' found the meal you uncovered.');
  sim.adventure.shared=sim.current+':'+food.id;
 }
}
