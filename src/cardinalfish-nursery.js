import {REEFS} from './data.js';
import {edible} from './diet.js';
import {WORLD_WIDTH,WORLD_HEIGHT} from './world-dimensions.js';

// NOAA: males mouthbrood and release fully formed young in calm reef/seagrass habitat.
// https://www.fisheries.noaa.gov/species/banggai-cardinalfish
// The duration, clutch of four representatives, and cover-follow route are game abstractions.
export const NURSERY_REEF=6;
export const BROOD_SECONDS=24;
export const MAX_JUVENILES=4;
const FOLLOWUP_SECONDS=6;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const state=sim=>sim.reefStories?.nursery;
const active=sim=>sim.reefStories?.active==='nursery'||sim.reefStories?.active==='cardinalfish-nursery';
const available=sim=>active(sim)&&sim.player?.species?.id==='s13';
const emit=(sim,text,type='message',extra={})=>sim.event?.(type,text,extra);
const coverFor=s=>s?.nursery&&REEFS[NURSERY_REEF].shelters[s.nursery.index];
const swimmingFish=e=>e.alive&&e.species&&(e.species.food||'fish')==='fish'&&e.species.speed>0;

/** Each choice uses authored shelter geometry and current living neighbors, never a fixed rating. */
export function nurseryOptions(sim){
 const entities=sim.sections?.[NURSERY_REEF]?.entities||[];
 return REEFS[NURSERY_REEF].shelters.map((cover,index)=>{
  const near=entities.filter(e=>e!==sim.player&&swimmingFish(e)&&distance(e,cover)<cover.r+100);
  const traffic=near.filter(e=>Math.hypot(e.vx||0,e.vy||0)>10||e.target||e.activity==='foraging'||e.activity==='avoiding').length;
  const threats=near.filter(e=>sim.player&&edible(e,sim.player)).length;
  const safe=threats===0&&traffic<3&&near.length<5;
  return {index,...cover,traffic,neighbors:near.length,threats,safe,
   quality:threats?'A larger hunter is passing nearby':traffic>=3||near.length>=5?'Busy fish traffic around this cover':'Quiet cover with room for the young'};
 });
}

export function initStory(sim){
 if(sim.player?.species?.id!=='s13')return false;
 sim.reefStories??={version:1,active:'nursery',clinic:null,artist:null,engineer:null,detective:null,nursery:null};
 if(!state(sim))sim.reefStories.nursery={version:1,reef:NURSERY_REEF,stage:'choose',nursery:null,progress:0,calmTime:0,interruptionTime:0,followupTime:0,juveniles:[],completed:false};
 if(sim.current!==NURSERY_REEF){sim.setDestination?.(NURSERY_REEF);emit(sim,'Dad’s Big Mouth · Visit Seagrass Meadow and compare quiet cover.');}
 return true;
}

function pose(sim,s){
 const p=sim.player;if(!p)return;
 p.cardinalBrooding=available(sim)&&s?.stage==='brooding';
 p.broodPose=p.cardinalBrooding ? .65+.25*s.progress/BROOD_SECONDS : 0;
 if(p.cardinalBrooding&&sim.current===NURSERY_REEF&&s.calmTime>=3)p.activity='brooding';
}
function selectNursery(sim,s,value){
 if(sim.current!==NURSERY_REEF){sim.setDestination?.(NURSERY_REEF);emit(sim,'Choose nursery cover in Seagrass Meadow.');return true;}
 const options=nurseryOptions(sim);
 const index=value==null?options.find(o=>distance(sim.player,o)<o.r)?.index:Number(value);
 const choice=options.find(o=>o.index===index);
 if(!choice){emit(sim,'Open water offers no nursery shelter. Swim into one of the meadow’s cover circles.');return true;}
 if(distance(sim.player,choice)>choice.r*.75){sim.point?.(choice.x,choice.y);emit(sim,'Swim into meadow cover '+(choice.index+1)+' to inspect it.');return true;}
 if(!choice.safe){emit(sim,choice.quality+'. Try the other cover, or let the passing fish move on.');return true;}
 s.nursery={index:choice.index,x:choice.x,y:choice.y,r:choice.r};s.stage='ready';
 emit(sim,'Quiet cover chosen · Settle here to begin mouthbrooding.');return true;
}

export function storyAction(sim,action,value){
 const s=state(sim);if(!available(sim)||!s)return false;
 if(action==='nursery-choose'&&['choose','ready'].includes(s.stage))return selectNursery(sim,s,value);
 if(action==='nursery-settle'&&s.stage==='ready'){
  const cover=coverFor(s),choice=nurseryOptions(sim)[s.nursery.index];
  if(sim.current!==NURSERY_REEF||distance(sim.player,cover)>cover.r*.75){emit(sim,'Return inside your chosen cover to settle.');return true;}
  if(!choice.safe){emit(sim,choice.quality+'. Brooding can begin when the cover is quiet.');return true;}
  sim.point?.(sim.player.x,sim.player.y);s.stage='brooding';s.calmTime=0;s.interruptionTime=0;pose(sim,s);
  emit(sim,'The father holds the brood in his mouth. This story compresses biological time into a short game scene.');return true;
 }
 if(action==='nursery-check'&&s.stage==='released'){
  const cover=coverFor(s),choice=nurseryOptions(sim)[s.nursery.index];
  if(sim.current!==NURSERY_REEF||distance(sim.player,cover)>cover.r+130){emit(sim,'Return near the chosen meadow cover to observe the young.');return true;}
  if(s.followupTime<FOLLOWUP_SECONDS||!choice.safe){emit(sim,'The young are finding their shelter. Give the cover a quiet moment, then observe them.');return true;}
  s.stage='complete';s.completed=true;pose(sim,s);
  emit(sim,'Dad’s Big Mouth · The young have settled into meadow cover.','discovery',{value:'cardinalfish-nursery'});return true;
 }
 return false;
}

function release(sim,s){
 const p=sim.player,cover=coverFor(s);
 s.stage='released';s.followupTime=0;
 // These are separate story animals, never adult population or breeding candidates.
 s.juveniles=Array.from({length:MAX_JUVENILES},(_,i)=>({id:'cardinal-young-'+i,x:clamp(p.x+(p.facing||1)*(28+i*5),1,WORLD_WIDTH-1),y:clamp(p.y+(i-1.5)*7,1,WORLD_HEIGHT-1),vx:0,vy:0,angle:0,facing:p.facing||1,phase:i*Math.PI/2,age:0}));
 pose(sim,s);emit(sim,'Four young represent the released brood. They seek the chosen cover on their own.','activity-step',{value:'cardinalfish-release',x:cover.x,y:cover.y});
}
function tickYoung(sim,s,dt){
 const cover=coverFor(s);if(!cover)return;
 const choice=nurseryOptions(sim)[s.nursery.index];
 for(const young of s.juveniles){
  young.age=Math.min(300,young.age+dt);
  const radius=choice.safe?cover.r*.38:cover.r*.16;
  const phase=young.phase+young.age*.35;
  // A small autonomous route follows shelter, rather than chasing the father into open water.
  const target={x:cover.x+Math.cos(phase)*radius,y:cover.y+Math.sin(phase)*radius*.55};
  const dx=target.x-young.x,dy=target.y-young.y,d=Math.hypot(dx,dy),advance=Math.min(d,24*dt);
  young.vx=d?dx/d*advance/dt:0;young.vy=d?dy/d*advance/dt:0;
  young.x=clamp(young.x+young.vx*dt,1,WORLD_WIDTH-1);young.y=clamp(young.y+young.vy*dt,1,WORLD_HEIGHT-1);
  if(d>1){young.angle=Math.atan2(dy,dx);young.facing=dx>=0?1:-1;}
 }
 if(s.stage==='released'&&choice.safe&&s.juveniles.every(j=>distance(j,cover)<cover.r))s.followupTime=Math.min(FOLLOWUP_SECONDS,s.followupTime+dt);
}
export function tickStory(sim,dt){
 const s=state(sim);pose(sim,s);
 if(!available(sim)||!s||sim.paused||sim.phase&&sim.phase!=='playing'||!Number.isFinite(dt)||dt<=0)return;
 // Bound catch-up so a delayed browser frame cannot complete an unseen scene.
 dt=Math.min(dt,.25);
 if(sim.current!==NURSERY_REEF)return;
 if(s.stage==='brooding'){
  const cover=coverFor(s),p=sim.player,choice=nurseryOptions(sim)[s.nursery.index];
  const quiet=choice.safe&&distance(p,cover)<cover.r*.8&&Math.hypot(p.vx||0,p.vy||0)<18&&!p.target&&!p.feeding&&!p.cleanerTarget&&!p.cleanTime&&!p.stun&&(!sim.pointer||distance(p,sim.pointer)<20);
  if(quiet){s.interruptionTime=0;s.calmTime=Math.min(3,s.calmTime+dt);if(s.calmTime>=3)s.progress=Math.min(BROOD_SECONDS,s.progress+dt);}
  else{s.calmTime=0;s.interruptionTime=Math.min(3,s.interruptionTime+dt);}
  if(s.progress>=BROOD_SECONDS&&s.calmTime>=3)release(sim,s);
  pose(sim,s);
 }else if(s.stage==='released'||s.stage==='complete')tickYoung(sim,s,dt);
}
// Released young continue their local shelter routine after the player leaves the story UI.
// This route cannot begin a brood, award a discovery, or alter the father's pose.
export function tickBackground(sim,dt){
 const s=state(sim);
 if(!s||!['released','complete'].includes(s.stage)||sim.current!==NURSERY_REEF||sim.paused||sim.phase&&sim.phase!=='playing'||!Number.isFinite(dt)||dt<=0)return;
 tickYoung(sim,s,Math.min(dt,.25));
}
export function storyMeal(){return false;}
export function storyNPC(){return false;}

export function storyView(sim){
 const s=state(sim);if(!s)return {step:'Choose a quiet nursery',detail:'Begin Dad’s Big Mouth as a Banggai cardinalfish.',actions:[],complete:false};
 if(s.completed)return {step:'Young at home',detail:'Your nursery is complete. The young keep close to their shelter independently.',actions:[],complete:true};
 if(sim.current!==NURSERY_REEF)return {step:'Visit Seagrass Meadow',detail:'Follow the map to meadow cover. Your nursery progress is saved while you explore.',actions:[],complete:false};
 if(s.stage==='choose'||s.stage==='ready'){
  const options=nurseryOptions(sim),actions=options.map(o=>({id:'nursery-choose',label:'Cover '+(o.index+1)+' · '+(o.safe?'quiet':o.threats?'hunter nearby':'busy'),value:o.index}));
  if(s.stage==='ready')actions.unshift({id:'nursery-settle',label:'Settle with the brood'});
  return {step:s.stage==='ready'?'Settle in your chosen cover':'Compare meadow cover',detail:'Inspect real shelter and passing fish traffic. Choose a quiet place with room for the young.',actions,complete:false};
 }
 if(s.stage==='brooding')return {step:'Mouthbrooding · '+Math.floor(s.progress/BROOD_SECONDS*100)+'%',detail:s.interruptionTime>0?'Progress is saved. Return to quiet cover when ready; the brood stays with its father.':'The father’s enlarged mouth holds the brood. Biological time is compressed into this game scene.',actions:[],complete:false};
 return {step:'Young seeking shelter',detail:s.followupTime>=FOLLOWUP_SECONDS?'The young have found cover. Observe them once nearby, then explore freely.':'Four young represent the brood. Watch them find shelter on their own; they need no feeding chores.',actions:[{id:'nursery-check',label:'Observe the sheltered young'}],complete:false};
}

const number=(n,min,max)=>Number.isFinite(n)&&n>=min&&n<=max;
export function validStory(s){
 if(s==null)return true;
 if(!s||typeof s!=='object'||Array.isArray(s)||s.version!==1||s.reef!==NURSERY_REEF||!['choose','ready','brooding','released','complete'].includes(s.stage)||typeof s.completed!=='boolean'||s.completed!==(s.stage==='complete'))return false;
 if(!number(s.progress,0,BROOD_SECONDS)||!number(s.calmTime,0,3)||!number(s.interruptionTime,0,3)||!number(s.followupTime,0,FOLLOWUP_SECONDS)||!Array.isArray(s.juveniles)||s.juveniles.length>MAX_JUVENILES)return false;
 if(s.stage==='choose'){if(s.nursery!==null||s.progress!==0||s.juveniles.length)return false;}
 else{
  const n=s.nursery,cover=n&&REEFS[NURSERY_REEF].shelters[n.index];
  if(!n||typeof n!=='object'||Array.isArray(n)||!cover||!Number.isInteger(n.index)||n.x!==cover.x||n.y!==cover.y||n.r!==cover.r)return false;
 }
 const released=['released','complete'].includes(s.stage);
 if(released?(s.progress!==BROOD_SECONDS||s.juveniles.length!==MAX_JUVENILES):(s.juveniles.length!==0||s.followupTime!==0))return false;
 if(s.stage==='ready'&&s.progress!==0||s.completed&&s.followupTime!==FOLLOWUP_SECONDS)return false;
 return s.juveniles.every((j,i)=>j&&j.id==='cardinal-young-'+i&&number(j.x,0,WORLD_WIDTH)&&number(j.y,0,WORLD_HEIGHT)&&number(j.vx,-24,24)&&number(j.vy,-24,24)&&Math.hypot(j.vx,j.vy)<=24.001&&number(j.angle,-Math.PI,Math.PI)&&[1,-1].includes(j.facing)&&number(j.phase,0,Math.PI*2)&&number(j.age,0,300));
}



