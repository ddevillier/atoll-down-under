import {creatureFrame} from './geometry.js';
import {rigFor} from './animal-rigs.js';

const clamp=n=>Math.max(0,Math.min(1,n));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const live=e=>!!e?.alive&&e.health>0&&!(e.stun>0)&&!e.hidden;
const helper=e=>live(e)&&e.species.ability==='clean';
// Authored inspection landmarks on side-view paintings. The shrimp reaches
// down with its painted claws; the wrasse works along the lower flank.
// Progress comes from the existing treatment, never from a visual-only clock.
export function cleanerInspection(cleaner,client){
 const frame=creatureFrame(client),shrimp=cleaner.species.id==='s45';
 const phase=clamp((client.cleanTime||0)/(client.id==='player'?2:3));
 const stage=Math.min(2,Math.floor(phase*3)),local=phase*3-stage;
 // Inspect, then glide to the next area without a target-position jump.
 // Each third retains a stationary picking interval before its short transfer.
 const t=clamp((local-.65)/.35),transfer=t*t*(3-2*t),areas=[.72,.52,.35];
 const along=areas[stage]+((areas[stage+1]??areas[stage])-areas[stage])*transfer;
 const contact={x:frame.x+(along-.5)*frame.width*(client.facing||1),y:frame.y+frame.height*(shrimp?-.17:.16)};
 const facing=client.facing||1,tip=shrimp?[.94,.82]:rigFor({id:cleaner.species.id}).mouth,own=creatureFrame(cleaner);
 const x=contact.x-(tip[0]-.5)*own.width*facing,y=contact.y-(tip[1]-.5)*own.height;
 return {x,y,facing,contact,stage,phase,picking:stage===2?1:1-transfer,gap:Math.hypot(cleaner.x-x,cleaner.y-y)};
}

// Leave room for the cleaner's center throughout the inspection sweep. Move
// the client into this berth rather than separating the contact from its body.
export function cleaningClientBerth(cleaner,client,width=1600,height=740){
 const ends=[0,3].map(cleanTime=>cleanerInspection(cleaner,{...client,cleanTime}));
 const axis=(key,size)=>{
  const offsets=ends.map(p=>p[key]-client[key]);
  return Math.max(10-Math.min(...offsets),Math.min(size-10-Math.max(...offsets),client[key]));
 };
 return {x:axis('x',width),y:axis('y',height)};
}

export function moveCleaner(cleaner,client,dt){
 const plan=client?cleanerInspection(cleaner,client):null,dest=plan||cleaner.station;
 const treating=client?.cleanTime>0;
 if(dest){const blend=1-Math.exp(-dt*(client?10:3));cleaner.x+=(dest.x-cleaner.x)*blend;cleaner.y+=(dest.y-cleaner.y)*blend;}
 // A service stance is lateral, so the contact landmark and drawn appendages
 // share a frame. Return facing stays stable until the cleaner reaches home.
 if(plan){cleaner.facing=plan.facing;cleaner.angle=plan.facing<0?Math.PI:0;}
 else if(dest&&Math.hypot(dest.x-cleaner.x,dest.y-cleaner.y)>8){cleaner.angle=Math.atan2(dest.y-cleaner.y,dest.x-cleaner.x);cleaner.facing=Math.cos(cleaner.angle)>=0?1:-1;}
 const touching=plan&&Math.hypot(cleaner.x-plan.x,cleaner.y-plan.y)<6;
 cleaner.actionTime=treating&&touching?(1+Math.sin(plan.phase*Math.PI*18))*.15*plan.picking:0;
 cleaner.behavior=treating?'Cleaning '+client.species.name:client?'Approaching a cleaning client':dest&&Math.hypot(dest.x-cleaner.x,dest.y-cleaner.y)>8?'Returning to the cleaning station':'At a cleaning station';
}

// Draw working/approaching cleaners after clients, including the player.
// Otherwise size sorting hides their mouth/claws behind the animal they help.
export function foregroundCleaner(e){return e.species.ability==='clean'&&(/^(Cleaning |Approaching a cleaning client)/).test(e.behavior||'');}

// Read the live service relationship, never a renderer timer or a saved visual
// flag. Queued fish keep their ordinary posture until their own visit starts.
function cleaningPair(sim,animal){
 const p=sim.player,entities=sim.section.entities;
 const playerPartner=()=>entities.find(e=>helper(e)&&e.id===p.cleanerTarget)||
  (p.cleanTime>0?entities.filter(e=>helper(e)&&distance(e,p)<105).sort((a,b)=>distance(a,p)-distance(b,p))[0]:null);
 const invited=sim.player.service?.reef===sim.current?entities.find(e=>e.id===p.service.client&&live(e)):null;
 if(animal===p&&helper(p)&&invited)return {cleaner:p,client:invited,elapsed:p.service.elapsed};
 if(animal===invited&&helper(p))return {cleaner:p,client:animal,elapsed:p.service.elapsed};
 if(animal===p&&live(p)){const cleaner=playerPartner();if(cleaner)return {cleaner,client:p,elapsed:p.cleanTime||0};}
 if(helper(animal)){
  if(p.cleanTime>0&&live(p)&&playerPartner()===animal)return {cleaner:animal,client:p,elapsed:p.cleanTime};
  const working=entities.find(e=>e!==animal&&e!==invited&&live(e)&&e.cleanTime>0&&e.target===animal.id);
  if(working)return {cleaner:animal,client:working,elapsed:working.cleanTime};
  if((animal.behavior||'').startsWith('Approaching a cleaning client')){
   const arriving=p.cleanerTarget===animal.id&&live(p)?p:entities.find(e=>live(e)&&e.target===animal.id&&e.behavior==='Visiting a cleaning station'&&distance(e,animal)<220);
   if(arriving)return {cleaner:animal,client:arriving,elapsed:0};
  }
 }else if(live(animal)&&animal.behavior!=='Waiting for a cleaner'){
  const cleaner=entities.find(e=>helper(e)&&e.id===animal.target);
  if(cleaner&&(animal.cleanTime>0||animal.behavior==='Visiting a cleaning station'))return {cleaner,client:animal,elapsed:animal.cleanTime||0};
 }
 return null;
}

// Pure pose input for jaws/claws, stabilizing fins and an existing departure.
// Keeping centers and body angles untouched preserves the real contact point.
// A previous renderer pose identifies a departing client after ordinary NPC
// routines replace its behavior text. Its existing rest timer bounds release.
export function cleaningPresentation(sim,animal,reducedMotion=false,previous=null){
 if(!sim?.player||!sim.section||!live(animal))return null;
 const pair=cleaningPair(sim,animal);
 if(pair){
  const {cleaner,client,elapsed}=pair;
  if(!helper(cleaner)||!live(client)||!client.species.parasites||client.species.ability==='clean'||client.feeding)return null;
  const plan=cleanerInspection(cleaner,{...client,cleanTime:elapsed});
  const inspecting=elapsed>0&&plan.gap<=8,role=animal===cleaner?'cleaner':'client';
  const shrimp=cleaner.species.id==='s45',pulse=reducedMotion?.5:(1+Math.sin(plan.phase*Math.PI*18))*.5;
  const picking=inspecting?plan.picking:0;
  return {role,mode:inspecting?'inspect':'approach',phase:plan.phase,stage:plan.stage,picking,
   feed:role==='cleaner'?picking*(shrimp?.12+.70*(1-pulse):.20+.75*pulse):0,
   brake:inspecting?(role==='client'?.58+.28*picking:.45):0,
   effort:inspecting?(role==='client'?.055:shrimp?.16:.08):null,
   release:0,contact:plan.contact,cleaner:cleaner.id,client:client.id};
 }
 const returning=animal.species.ability==='clean'&&animal.station&&animal.behavior==='Returning to the cleaning station';
 const knownClient=previous?.role==='client'&&previous.client===animal.id&&entitiesCleaner(sim,previous.cleaner);
 const leaving=animal.species.ability!=='clean'&&animal.rest>0&&animal.rest<=8.01&&!animal.target&&!animal.feeding&&animal.activity!=='avoiding'&&
  (knownClient||['Leaving your cleaning visit','Resting after your help','Leaving the cleaning station'].includes(animal.behavior));
 if(!returning&&!leaving)return null;
 const release=returning?1-clamp(distance(animal,animal.station)/80):1-clamp(animal.rest/8);
 return {role:returning?'cleaner':'client',mode:'depart',phase:1,stage:2,picking:0,feed:0,
  brake:leaving?.45*(1-release):0,effort:null,release,contact:null,cleaner:returning?animal.id:previous?.cleaner??null,client:leaving?animal.id:null};
}

const entitiesCleaner=(sim,id)=>sim.section.entities.some(e=>e.id===id&&helper(e))||(sim.player.id===id&&helper(sim.player));
