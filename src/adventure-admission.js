import {REEFS} from './data.js';
import {suitableMeal} from './diet.js';
import {WORLD_WIDTH,WORLD_HEIGHT} from './world-dimensions.js';

const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const reference=e=>({id:e.id,incarnation:e.incarnation||0,species:e.species.id});
const unpaired=(e,entities)=>e.ecology?.partner==null&&!entities.some(b=>b!==e&&b.ecology?.partner===e.id);
const freeActor=(e,entities)=>!!(e?.alive&&e.health>0&&e.energy>0&&!e.hidden&&!(e.stun>0)&&!e.target&&!e.feeding&&!(e.actionTime>0)&&!(e.cleanTime>0)&&!e.cleanerTarget&&!e.service&&!e.groundRoute&&!e.holdfast&&unpaired(e,entities));
const inWater=e=>Number.isFinite(e.x)&&Number.isFinite(e.y)&&e.x>=1&&e.x<=WORLD_WIDTH-1&&e.y>=1&&e.y<=WORLD_HEIGHT-1;
const rules={
 housekeeper:{species:['s30'],reef:4},lookout:{species:['s8','s52'],reef:0},
 walker:{species:['s54'],reef:4},nest:{species:['s3'],reef:4},crevice:{species:['s24'],reef:4},
 shade:{species:['s12'],reef:8,night:true},lantern:{species:['s53'],reef:8,night:true}
};

// Only a new, explicitly guided dive uses these entry points.
export function initialAdventureSite(key){
 const rule=rules[key];if(!rule)return null;
 return {reef:rule.reef,x:key==='lookout'?240:key==='lantern'?610:key==='shade'?360:780,y:key==='lookout'?370:key==='lantern'?360:key==='shade'?430:440};
}
export function adventureParticipantReserved(sim,actor){
 const r=actor?.adventureReservation;
 return !!(r&&['lookout','lantern'].includes(r.key)&&r.reef===sim.current&&r.remaining>0&&actor.alive&&(actor.incarnation||0)===r.incarnation&&actor.species.id===r.species);
}
export function tickAdventureReservation(sim,actor,dt){
 const r=actor?.adventureReservation;if(!r)return;
 if(r.reef!==sim.current||!actor.alive)return;
 const buddy=sim.adventure?.buddy;
 // An explicit ordinary browsing invitation is an alternative player choice.
 // It releases this initial opportunity; incidental NPC pairing never does.
 if(!sim.reefStories?.active&&buddy&&!buddy.away&&buddy.reef===r.reef&&buddy.id===actor.id&&buddy.incarnation===(actor.incarnation||0)&&actor.ecology?.partner===sim.player?.id){delete actor.adventureReservation;return;}
 r.remaining=Math.max(0,r.remaining-dt);if(!r.remaining)delete actor.adventureReservation;
}
// Binding an identity alone is insufficient: reading/approaching must retain
// the invitation until the module actually owns this tick's movement.
export function claimAdventureParticipant(sim,actor){
 if(adventureParticipantReserved(sim,actor)&&sim.reefStories?.active===actor.adventureReservation.key)delete actor.adventureReservation;
}
export function releaseAdventureReservations(sim,key){
 for(const section of sim.sections||[])for(const e of section.entities||[])if(e.adventureReservation?.key===key)delete e.adventureReservation;
}
export function validAdventureReservation(r){
 return r==null||(r.key==='lookout'&&r.reef===0&&['s8','s52'].includes(r.species)||r.key==='lantern'&&r.reef===8&&r.species==='s53')&&Number.isFinite(r.remaining)&&r.remaining>=0&&r.remaining<=60&&Number.isInteger(r.incarnation)&&r.incarnation>=0&&Number.isFinite(r.x)&&Number.isFinite(r.y)&&r.x>=1&&r.x<WORLD_WIDTH&&r.y>=1&&r.y<WORLD_HEIGHT;
}

// Called only from populate, after the ordinary initial slots have been made.
// The caller excludes s8/s52 from reef 0's earlier automatic pair assignment.
// This policy is an initial encounter profile, not a change to a living actor:
// previously consumed physiology draws map to 0..4s digestion / 85..100 health.
// Companion slots already start healthy with no digestion. No RNG is consumed,
// no adult is appended, and an array already installed in a dive is immutable.
export function reserveAdventureParticipants(sim,reef,entities,population,available){
 if(!sim?.player||!Array.isArray(entities)||sim.sections?.some(s=>s?.entities===entities))return [];
 const id=sim.player.species.id;
 const species=available?.find(s=>s.id===id);
 if(!species)return [];
 const browser=['s8','s52'].includes(id)&&reef.id===0&&sim.period==='day';
 const shade=id==='s12'&&reef.id===8&&sim.period==='night';
 const lantern=id==='s53'&&reef.id===8&&sim.period==='night';
 if(!browser&&!shade&&!lantern)return [];
 const foragers=entities.slice(0,population.foragers);
 const companions=entities.slice(population.foragers+population.hunters,population.foragers+population.hunters+population.companions);
 const slots=[...companions,...foragers].filter(e=>freeActor(e,entities)&&e.species.playable&&!e.species.diet.includes('fish')&&e.species.ability!=='clean');
 const existing=slots.filter(e=>e.species.id===id);
 const count=lantern?Math.min(3,slots.length):1;
 if(count<(lantern?2:1))return [];
 const chosen=[...existing,...slots.filter(e=>e.species.id!==id)].slice(0,count);
 const anchor=browser?reef.feedingSites.algae?.[0]:shade?[360,235]:reef.feedingSites.plankton?.[1];
 if(!anchor)return [];
 chosen.forEach((e,i)=>{
  e.species=species;
  e.satiated=clamp((e.satiated||0)*4/65,0,4);
  e.health=clamp(85+(e.health-60)*.375,85,100);
  e.rest=0;
  e.x=lantern?[555,565,490][i]:clamp(anchor[0]+(browser?90:135),30,WORLD_WIDTH-30);
  e.y=lantern?[335,395,370][i]:clamp(anchor[1]+(browser?-28:20),40,WORLD_HEIGHT-40);
  e.angle=Math.PI;e.facing=-1;
  if(browser)e.adventureReservation={key:'lookout',reef:reef.id,remaining:60,incarnation:e.incarnation||0,species:id,x:e.x,y:e.y};
  if(lantern&&sim.initialAdventureKey==='lantern')e.adventureReservation={key:'lantern',reef:reef.id,remaining:60,incarnation:e.incarnation||0,species:id,x:e.x,y:e.y};
 });
 return chosen.map(reference);
}

function readyFood(section,actor){
 return section.food?.filter(f=>f.kind==='food'&&f.amount>0&&!(f.regrow>0)&&suitableMeal(actor,f)&&inWater(f)&&!section.entities.some(e=>e.alive&&e.feeding?.committed&&e.feeding.target===f.id)).sort((a,b)=>distance(actor,a)-distance(actor,b))||[];
}
const unavailable=(reef,reason,needsFreshDive=false)=>({available:false,reef,reason,needsFreshDive});

// Read-only admission. Every reef is reachable through the map's adjacent reef
// routes; a finite scan offers an existing encounter or explains the missing
// prerequisite. Import and Begin never use the initializer above.
export function admissionFor(sim,key){
 const rule=rules[key];
 if(!rule)return {available:true,reef:null,reason:'',needsFreshDive:false};
 if(!rule.species.includes(sim?.player?.species?.id))return unavailable(rule.reef,'Choose a fish suited to this adventure.');
 if(sim.mode!=='practice'||sim.trial)return unavailable(rule.reef,'Adventures are available in a Practice dive.');
 if(sim.player.health<=0||sim.player.energy<=0)return unavailable(rule.reef,'Your fish needs a fresh dive before this adventure.',true);
 if(rule.night&&sim.period!=='night')return unavailable(rule.reef,'This encounter needs a night dive.',true);
 const sections=sim.sections||[];
 if(!sections[rule.reef])return unavailable(rule.reef,'The adventure habitat is missing from this dive.',true);
 if(!['lookout','shade','lantern'].includes(key)){
  const site=REEFS[rule.reef];
  if(!site||!site.shelters?.length||!Object.values(site.feedingSites||{}).some(v=>v.length))return unavailable(rule.reef,'This dive has no accessible adventure site.',true);
  return {available:true,reef:rule.reef,reason:'',needsFreshDive:false};
 }
 // Shade supports any existing ledge. The other modules have authored sites
 // only in their named habitat; an animal elsewhere cannot be teleported in.
 const order=key==='shade'?[rule.reef,...sections.map((_,i)=>i).filter(i=>i!==rule.reef)]:[rule.reef];
 let busy=false,digesting=false,noFood=false;
 for(const reef of order){
  const section=sections[reef];if(!section?.entities)continue;
  const conspecifics=section.entities.filter(e=>e.alive&&e.species.id===sim.player.species.id&&inWater(e));
  const candidates=conspecifics.filter(e=>freeActor(e,section.entities)&&(!e.species.parasites||e.health>=70));
  busy ||= conspecifics.length>candidates.length;
  if(key==='lookout'){
   for(const e of candidates){
    if((e.satiated||0)>8||(e.rest||0)>8){digesting=true;continue;}
    const food=readyFood(section,e).find(f=>distance(e,f)<330&&readyFood(section,sim.player).some(p=>p.id===f.id));
    if(!food){noFood=true;continue;}
    const passer=section.entities.find(b=>b!==e&&freeActor(b,section.entities)&&!b.species.diet.includes('fish')&&b.species.ability!=='clean'&&distance(b,{x:240,y:370})<850);
    if(!passer){busy=true;continue;}
    return {available:true,reef,reason:'',needsFreshDive:false,participants:[reference(e)],food:food.id};
   }
  }else if(candidates.length>=(key==='lantern'?2:1)){
   const participants=candidates.slice(0,key==='lantern'?3:1);
   if(key==='lantern'&&!participants.every(e=>participants.every(b=>distance(e,b)<=600)))continue;
   return {available:true,reef,reason:'',needsFreshDive:false,participants:participants.map(reference)};
  }
 }
 const reason=digesting?'The available companion is digesting a meal. A fresh adventure dive starts with a ready companion.':noFood?'No companion has an available grazing patch within reach.':busy?'The available neighbors are paired, busy, or need care.':'This dive has no eligible '+(key==='lantern'?'flashlight cohort':'unpaired neighbor')+'.';
 return unavailable(rule.reef,reason+' Preserve this dive and choose Fresh adventure dive.',true);
}
