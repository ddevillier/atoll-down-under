import {BY_ID,REEFS,FOODS} from './data.js';
import {turnTowards} from './steering.js';

const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const kinds=new Set(['meeting','reunion','homecoming','shared-trip','care']);
const validId=id=>Number.isInteger(id)&&id>=0||typeof id==='string'&&id.length>0&&id.length<100&&id!=='player';
const text=(value,max)=>typeof value==='string'&&value.length>0&&value.length<=max;
export const animalPhrase=name=>(/^[aeiou]/i.test(name)?'an ':'a ')+name.toLowerCase();
export function validMemory(m){
 return !!m&&typeof m==='object'&&!Array.isArray(m)&&text(m.id,150)&&/^[\w:-]+$/.test(m.id)&&kinds.has(m.kind)&&(m.species==='custom'||!!BY_ID[m.species])&&text(m.name,100)&&Number.isInteger(m.reef)&&!!REEFS[m.reef]&&Number.isFinite(m.time)&&m.time>=0&&text(m.text,300)&&(m.neighbor===undefined||!!BY_ID[m.neighbor])&&(m.foods===undefined||Array.isArray(m.foods)&&m.foods.length<=2&&m.foods.every(f=>Object.hasOwn(FOODS,f)||['fish','crab','snail','urchin','star'].includes(f)))&&(m.recordedAt===undefined||typeof m.recordedAt==='string'&&Number.isFinite(Date.parse(m.recordedAt)));
}
export const freshReefMemory=()=>({version:1,id:globalThis.crypto.randomUUID(),sequence:0,visits:Array(9).fill(0),friends:[],entries:[]});
export function validReefMemory(m){
 return !!m&&m.version===1&&text(m.id,100)&&/^[\w-]+$/.test(m.id)&&Number.isInteger(m.sequence)&&m.sequence>=0&&Array.isArray(m.visits)&&m.visits.length===9&&m.visits.every(v=>Number.isInteger(v)&&v>=0)&&Array.isArray(m.entries)&&m.entries.length<=16&&m.entries.every(validMemory)&&new Set(m.entries.map(e=>e.id)).size===m.entries.length&&Array.isArray(m.friends)&&m.friends.length<=16&&m.friends.every(f=>validId(f.id)&&Number.isInteger(f.reef)&&!!REEFS[f.reef]&&!!BY_ID[f.species]&&Number.isInteger(f.incarnation)&&f.incarnation>=0&&Number.isInteger(f.visit)&&f.visit>=0&&f.visit<=m.visits[f.reef]&&Number.isFinite(f.greetUntil)&&f.greetUntil>=0)&&new Set(m.friends.map(f=>`${f.reef}:${f.id}:${f.incarnation}`)).size===m.friends.length;
}
export function rememberExperience(sim,kind,description,extra={}){
 if(sim.trial||!sim.player||sim.player.health<=0||!kinds.has(kind))return null;
 const book=sim.reefMemory??=freshReefMemory();
 const entry={id:book.id+':'+(++book.sequence),kind,species:sim.player.species.id,name:sim.player.species.name,reef:sim.current,time:sim.time,text:description,...extra};
 if(!validMemory(entry))throw new Error('Invalid reef memory.');
 book.entries.push(entry);book.entries=book.entries.slice(-16);
 if(sim.creation){sim.creation.recentMemories??=[];sim.creation.recentMemories.push(structuredClone(entry));sim.creation.recentMemories=sim.creation.recentMemories.slice(-12);}
 sim.event('memory',description,{memory:entry,creationChanged:!!sim.creation});return entry;
}
export function familiarFish(sim,e){
 return sim.reefMemory?.friends.find(f=>f.reef===sim.current&&f.id===e.id&&f.species===e.species.id&&f.incarnation===(e.incarnation||0));
}
export function meetFish(sim,e,{record=true}={}){
 if(sim.trial||!e?.alive||!BY_ID[e.species?.id])return null;
 const book=sim.reefMemory??=freshReefMemory();let friend=familiarFish(sim,e);
 if(!friend){
  friend={id:e.id,reef:sim.current,species:e.species.id,incarnation:e.incarnation||0,visit:book.visits[sim.current],greetUntil:0};book.friends.push(friend);book.friends=book.friends.slice(-16);
  if(record)rememberExperience(sim,'meeting','Met '+animalPhrase(e.species.name)+' in '+REEFS[sim.current].name+'.',{neighbor:e.species.id});
 }
 return friend;
}
const available=e=>e.alive&&e.health>0&&!e.stun&&!e.hidden&&!e.target&&!e.feeding&&!e.cleanTime&&e.activity!=='avoiding'&&!e.behavior?.startsWith('Moving away');
export function tickFamiliarFish(sim){
 if(sim.trial||sim.paused||sim.phase!=='playing')return;
 const book=sim.reefMemory;if(!book)return;
 for(const friend of book.friends){
  if(friend.reef!==sim.current||friend.visit===book.visits[sim.current])continue;
  const fish=sim.section.entities.find(e=>e.id===friend.id&&e.species.id===friend.species&&(e.incarnation||0)===friend.incarnation);
  if(!fish||!available(fish)||distance(fish,sim.player)>240||fish.species.diet.includes('fish')&&!(fish.satiated>0))continue;
  friend.visit=book.visits[sim.current];friend.greetUntil=sim.time+3;
  rememberExperience(sim,'reunion','Found the same '+fish.species.name.toLowerCase()+' again in '+REEFS[sim.current].name+'.',{neighbor:fish.species.id});
  sim.event('reunion','A familiar '+fish.species.name.toLowerCase()+' · Welcome back.',{x:fish.x,y:fish.y,animalId:fish.id});
 }
}
// A short orientation/approach belongs below danger, feeding and service in
// the routine priority. Familiarity never grants safety or teleports a fish.
export function greetingRoutine(sim,e,dt,speed){
 const friend=familiarFish(sim,e);if(!friend||friend.greetUntil<=sim.time||!available(e)||e.species.ability==='clean'||e.groundRoute||e.holdfast)return null;
 e.angle=turnTowards(e.angle,Math.atan2(sim.player.y-e.y,sim.player.x-e.x),e.species.agility*dt);
 e.activity='companionship';e.behavior='Greeting a familiar visitor';return distance(e,sim.player)>140?speed*.45:speed*.08;
}
export function rememberHomecoming(sim,home,foods=[]){
 return rememberExperience(sim,'homecoming','Came home to '+home+' in '+REEFS[sim.current].name+(foods.length?' after a meal of '+foods.map(f=>FOODS[f]?.name.toLowerCase()||f).join(' and '):'')+'.',{foods:[...foods].slice(0,2)});
}
