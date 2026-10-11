import {predatorPolicy} from './risk-cues.js';
import {turnTowards} from './steering.js';
import {WORLD_WIDTH,WORLD_HEIGHT} from './world-dimensions.js';

const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const exact=(e,ref)=>!!(e&&ref&&e.id===ref.id&&(e.incarnation||0)===(ref.incarnation||0)&&e.species?.id===(typeof ref.species==='string'?ref.species:ref.species?.id));
const inside=(e,zone)=>!!(e?.alive&&Number.isFinite(e.x)&&Number.isFinite(e.y)&&distance(e,zone)<=zone.radius);
const previousActors=new WeakMap();

// Descriptors come from the story dispatcher. These helpers never import the
// dispatcher (avoiding a simulation/story dependency cycle), persist a shield,
// change appetite/health, or apply a reef-wide fear effect. Protection is
// derived every time from the active story, current reef, and exact identities.
export function safetyZone(sim,safety=sim?.storySafety){
 if(!sim||sim.mode!=='practice'||sim.trial||sim.phase!=='playing'||!sim.reefStories?.active||!safety||safety.reef!==sim.current||!Number.isFinite(safety.x)||!Number.isFinite(safety.y)||!Number.isFinite(safety.radius)||safety.radius<=0||safety.radius>480||!Array.isArray(safety.participants)||safety.participants.length>4)return null;
 return safety;
}
export function isProtectedActor(sim,actor,safety=sim?.storySafety){
 const zone=safetyZone(sim,safety);
 return !!(zone&&inside(actor,zone)&&(actor===sim.player||zone.participants.some(ref=>exact(actor,ref))));
}
export function canPredate(sim,predator,prey,safety=sim?.storySafety){
 if(!predator||!prey)return false;
 // NPC exit grace prevents immediate re-selection. Player pursuits retain
 // their established behavior during grace; actual bites check that timer.
 if(prey!==sim.player&&(prey.hurtGrace||0)>0)return false;
 const zone=safetyZone(sim,safety);
 return !(zone&&(isProtectedActor(sim,predator,zone)||isProtectedActor(sim,prey,zone)||inside(predator,zone)&&inside(prey,zone)));
}
export function storyNeedsHeld(sim,actor,safety=sim?.storySafety){
 const zone=safetyZone(sim,safety);
 if(!zone||!isProtectedActor(sim,actor,zone))return false;
 return zone.holdNeeds===true||Array.isArray(zone.holdNeeds)&&zone.holdNeeds.some(ref=>exact(actor,ref));
}

// Call before the NPC loop, after ordinary player movement, and once when an
// interaction begins. The transient previous set only detects a boundary exit;
// it never supplies protection. A restored dive derives its first set afresh.
export function syncAdventureSafety(sim,safety=sim?.storySafety){
 if(!sim)return;
 const zone=safetyZone(sim,safety);
 const actors=zone?[sim.player,...(sim.sections?.[zone.reef]?.entities||[])].filter(e=>isProtectedActor(sim,e,zone)):[];
 for(const prior of previousActors.get(sim)||[])if(!actors.includes(prior.actor)&&prior.actor.alive&&(prior.actor.incarnation||0)===prior.incarnation&&prior.actor.species?.id===prior.species){
  prior.actor.hurtGrace=Math.max(prior.actor.hurtGrace||0,predatorPolicy(sim).grace);
  if(prior.actor===sim.player)sim.riskCue={reason:'adventure',until:(sim.time||0)+predatorPolicy(sim).grace};
 }
 previousActors.set(sim,actors.map(actor=>({actor,incarnation:actor.incarnation||0,species:actor.species.id})));
}

// Invoke before NPC danger/meal selection. A hunter remains physically present
// and follows a local outside arc; ordinary prey/food outside stays available.
// Returning true means this tick's movement was handled by this local courtesy.
export function steerAroundAdventure(sim,actor,dt,speed=actor?.species?.speed*.35,safety=sim?.storySafety){
 const zone=safetyZone(sim,safety);
 if(!zone||!actor?.alive||actor===sim.player||isProtectedActor(sim,actor,zone)||!actor.species?.diet?.includes('fish')||actor.groundRoute||actor.holdfast||actor.species.ability==='clean'||!(dt>0)||sim.paused)return false;
 const d=distance(actor,zone),margin=Math.max(35,actor.species.size*.35);
 if(d>zone.radius+margin)return false;
 const prey=actor.target==='player'?sim.player:sim.section?.entities.find(e=>e.id===actor.target);
 if(prey&&!canPredate(sim,actor,prey,zone)){actor.target=null;actor.pursuit=0;if(actor.feeding&&!actor.feeding.committed)actor.feeding=null;}
 // Existing ordinary food is still handled by ordinary movement/feeding.
 if(actor.target)return false;
 const radial=d>1?Math.atan2(actor.y-zone.y,actor.x-zone.x):actor.angle||0;
 const heading=radial+(d<zone.radius+margin*.5?0:(actor.id%2?1:-1)*Math.PI*.38);
 actor.angle=turnTowards(actor.angle||0,heading,(actor.species.agility||2)*dt);
 const advance=Math.max(0,speed)*dt;
 actor.x=clamp(actor.x+Math.cos(actor.angle)*advance,10,WORLD_WIDTH-10);
 actor.y=clamp(actor.y+Math.sin(actor.angle)*advance,25,WORLD_HEIGHT-20);
 actor.facing=Math.cos(actor.angle)>=0?1:-1;
 actor.activity='inspecting';actor.behavior='Swimming around the occupied adventure';
 return true;
}

// Call AFTER the module retracts its spine/restores fin movement/releases its
// own interaction state, using the old descriptor before clearing active.
// No blanket Practice protection is set. The existing short hurtGrace provides
// visible re-entry time and must also decrement on released NPC ticks.
export function releaseAdventureSafety(sim,safety=sim?.storySafety){
 if(!sim||!safety)return false;
 const actors=[sim.player,...(sim.sections?.[safety.reef]?.entities||[])].filter(e=>e?.alive&&(e===sim.player&&sim.current===safety.reef||safety.participants?.some(ref=>exact(e,ref))));
 if(!actors.length)return false;
 const grace=predatorPolicy(sim).grace;
 for(const actor of actors)actor.hurtGrace=Math.max(actor.hurtGrace||0,grace);
 sim.riskCue={reason:'adventure',until:(sim.time||0)+grace};
 sim.event?.('adventure-release','Free swimming restored · a moment to move safely.');
 previousActors.delete(sim);
 return true;
}
