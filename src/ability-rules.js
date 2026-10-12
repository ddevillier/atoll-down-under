import {edible} from './diet.js';
import {approachRefuge} from './refuge-motion.js';
import {creatureWidth} from './geometry.js';
import {ABILITIES} from './data.js';
import {isProtectedActor} from './adventure-safety.js';

const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const DEFENSIVE_ABILITIES=['spines','puff','poison','ink','shock','sting','sonic','flash'];
export function defended(e){return e.abilityTime>0&&DEFENSIVE_ABILITIES.includes(e.species.ability);}
export function mimicTrusted(sim,host,mimic){return mimic.species.ability==='mimic'&&host.species.ability!=='lure'&&host.species.size<=mimic.species.size*3&&!(host.mimicMemory?.actor===mimic.id&&host.mimicMemory.until>sim.time);}
export function validMimicMemory(value){return value==null||value&&typeof value==='object'&&['string','number'].includes(typeof value.actor)&&Number.isFinite(value.until)&&value.until>=0;}
export function releasePursuit(sim,e,reason='defense'){
 if(e.target==='player')sim.event('pursuit-release',e.species.name+' stopped pursuing.',{animalId:e.id,reason,x:e.x,y:e.y});
 e.target=null;e.pursuit=0;e.think=Math.max(e.think||0,.8);e.feeding=null;
}
export function triggerAbility(sim,actor){
 const ability=actor.species.ability;if(!Object.hasOwn(ABILITIES,ability)||!actor.alive||actor.stun>0||actor.cooldown>0||actor.energy<12||['none','crush','toxic','clean'].includes(ability))return false;
 actor.energy-=8;actor.cooldown=12;actor.abilityTime=['lure','camouflage','mimic'].includes(ability)?6:4;
 actor.cleanerTarget=null;actor.cleanTime=0;actor.cleaningAmount=0;
 for(const e of [sim.player,...sim.section.entities]){
  if(e===actor||!e.alive||e.hidden||e.species.ability==='clean'||isProtectedActor(sim,e))continue;
  const range=ability==='sting'?115:230;if(dist(actor,e)>range)continue;
  const predator=edible(e,actor),pursuing=e.target===actor.id;
  const pulse=ability==='shock'||['sting','sonic','flash'].includes(ability)&&(predator||pursuing);
  const scatter=['ink','poison','spines','puff'].includes(ability)&&(predator||pursuing);
  if(!pulse&&!scatter)continue;
  releasePursuit(sim,e);e.stun=Math.max(e.stun||0,pulse?4:1.5);e.angle=Math.atan2(e.y-actor.y,e.x-actor.x);e.behavior='Startled by '+actor.species.name;
  if(e===sim.player){e.sandProbe=null;e.foragingPrep=null;sim.pointer={x:e.x,y:e.y};sim.event('message',actor.species.name+' used its defense. Give it room.');}
 }
 sim.event('ability',ability,{ability,x:actor.x,y:actor.y,actor:actor.id});return true;
}

export function approachMimic(sim,e,dt){
 if(!e.alive||e.hidden||e.stun>0||e.cleanTime>0||e.cleanerTarget||e.feeding||e.actionTime>0||!e.species.parasites||e.species.ability==='clean')return false;
 const mimic=[sim.player,...sim.section.entities].filter(m=>m!==e&&m.alive&&!m.hidden&&!m.stun&&m.abilityTime>0&&mimicTrusted(sim,e,m)&&dist(e,m)<300).sort((a,b)=>dist(a,e)-dist(b,e))[0];
 if(!mimic)return false;
 // This is a false invitation, never a real cleaning reservation or cure.
 if(e.target&&e.target!==mimic.id)return false;
 releasePursuit(sim,e,'mimic');const side=e.x<mimic.x?-1:1,gap=(creatureWidth(e.species)+creatureWidth(mimic.species))*.42+12;
 const destination={x:Math.max(25,Math.min(1575,mimic.x+side*gap)),y:mimic.y};
 const advance=approachRefuge(e,destination,dt,e.species.speed*.3,10,side<0?0:Math.PI);
 e.x+=Math.cos(e.angle)*advance*dt;e.y+=Math.sin(e.angle)*advance*dt;e.facing=Math.cos(e.angle)>=0?1:-1;
 e.activity='inspecting-mimic';e.behavior='Approaching what looks like a cleaner';return true;
}
export function mimicBite(sim,actor,host){
 actor.abilityTime=0;host.mimicMemory={actor:actor.id,until:sim.time+60};
 releasePursuit(sim,host,'mimic');host.rest=Math.max(host.rest||0,6);host.stun=0;host.think=2;host.angle=Math.atan2(host.y-actor.y,host.x-actor.x);host.behavior='Moving away from a false cleaner';host.activity='avoiding';
 // A scale/skin nip leaves its host alive, unlike swallowing a small fish.
 host.life=Math.max(1,(host.life||100)-12);const damage=Math.min(6,Math.max(0,host.health-1));host.health-=damage;host.biteDamage=(host.biteDamage||0)+damage;host.recoveryDelay=10;
 sim.event('mimic-bite','A small nip. This fish recognized the false cleaner and will avoid another invitation.',{actor:actor.id,host:host.id,x:host.x,y:host.y});
}
export function validLightOrigin(value){return value==null||value&&typeof value==='object'&&Number.isFinite(value.x)&&Number.isFinite(value.y)&&value.x>=0&&value.x<=1600&&value.y>=0&&value.y<=740;}
export function driftTowardLight(sim,dt){
 const lights=[sim.player,...sim.section.entities].filter(e=>e.alive&&!e.hidden&&!e.stun&&e.species.ability==='flash'&&e.abilityTime>0);
 for(const f of sim.section.food){
  if(f.food!=='plankton'||f.regrow>0)continue;
  const light=lights.filter(e=>dist(e,f)<240).sort((a,b)=>dist(a,f)-dist(b,f))[0];
  if(light&&!f.lightOrigin)f.lightOrigin={x:f.x,y:f.y};
  const destination=light?{x:Math.max(20,Math.min(1580,light.x+(light.facing||1)*(creatureWidth(light.species)*.5+20))),y:Math.max(25,Math.min(715,light.y))}:f.lightOrigin;
  if(!destination)continue;const d=dist(f,destination),step=Math.min(d,dt*(light?18:5));
  if(d>1){f.x+=(destination.x-f.x)/d*step;f.y+=(destination.y-f.y)/d*step;}else if(!light)delete f.lightOrigin;
 }
}
