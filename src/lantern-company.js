// Anomalops katoptron case study. Organ exposure, sight radius and the authored
// bend are game abstractions; they do not claim a universal flashlightfish code.
import {WORLD_WIDTH,WORLD_HEIGHT} from './world-dimensions.js';

export const LANTERN_REEF=8;
export const LANTERN_CASE_STUDY='Anomalops katoptron';
export const LANTERN_OUTCROP=Object.freeze({x:800,y:360,r:94});
export const LIGHT_RANGE=265;
const routes={upper:[{x:610,y:360},{x:720,y:190},{x:910,y:190},{x:1010,y:360}],lower:[{x:610,y:360},{x:720,y:530},{x:910,y:530},{x:1010,y:360}]};
const sessions=new WeakMap();
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const delta=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
const turn=(a,b,n)=>a+clamp(delta(a,b),-n,n);
const finite=(n,a,b)=>Number.isFinite(n)&&n>=a&&n<=b;
const state=sim=>sim.reefStories?.lantern;
const active=sim=>sim.reefStories?.active==='lantern'&&sim.player?.species?.id==='s53'&&sim.mode!=='challenge'&&!sim.trial;
const running=sim=>active(sim)&&!sim.paused&&sim.phase==='playing'&&sim.current===LANTERN_REEF&&sim.period==='night'&&sim.player.alive!==false&&sim.player.health>0;
const emit=(sim,text,type='message')=>sim.event?.(type,text,type==='discovery'?{value:'lantern-company'}:{});
const incarnation=e=>e.incarnation||0;
const identity=(e,m)=>e?.id===m.id&&incarnation(e)===m.incarnation;
const entities=sim=>sim.sections?.[LANTERN_REEF]?.entities||sim.section?.entities||[];
const eligible=e=>e?.alive&&e.health>0&&e.species?.id==='s53'&&!e.hidden&&!(e.stun>0)&&!e.target&&!e.feeding&&!e.cleanerTarget&&!(e.cleanTime>0)&&!e.service&&!(e.actionTime>0)&&e.activity!=='avoiding'&&!e.behavior?.startsWith('Moving away')&&100-e.health-(e.biteDamage||0)-(e.poisonDamage||0)<=35;
const validId=id=>typeof id==='string'&&id.length>0&&id.length<100&&id!=='player'||Number.isInteger(id)&&id>=0;

export function validStory(s){
 if(s==null)return true;
 const fields=['version','reef','caseStudy','stage','route','organShown','complete','clock','playerGate','playerTravel','participants'];
 if(typeof s!=='object'||Array.isArray(s)||!Object.keys(s).every(k=>fields.includes(k))||s.version!==1||s.reef!==8||s.caseStudy!==LANTERN_CASE_STUDY||!['gather','route','complete'].includes(s.stage)||![null,'upper','lower'].includes(s.route)||typeof s.organShown!=='boolean'||typeof s.complete!=='boolean'||!finite(s.clock,0,6)||!Number.isInteger(s.playerGate)||s.playerGate<0||s.playerGate>4||!finite(s.playerTravel,0,4000)||!Array.isArray(s.participants)||s.participants.length>3)return false;
 const keys=['id','incarnation','gate','travel','response','contact'];
 if(!s.participants.every(m=>m&&typeof m==='object'&&!Array.isArray(m)&&Object.keys(m).every(k=>keys.includes(k))&&validId(m.id)&&Number.isInteger(m.incarnation)&&m.incarnation>=0&&Number.isInteger(m.gate)&&m.gate>=0&&m.gate<=4&&finite(m.travel,0,4000)&&typeof m.response==='boolean'&&typeof m.contact==='boolean'&&(!m.response||m.contact))||new Set(s.participants.map(m=>m.id)).size!==s.participants.length)return false;
 if(s.stage==='gather')return !s.complete&&s.route===null&&s.playerGate===0&&s.playerTravel===0&&s.participants.length===0;
 if(!s.route||s.participants.length<2||s.complete!==(s.stage==='complete'))return false;
 return !s.complete||s.playerGate===4&&s.playerTravel>=450&&s.participants.some(m=>m.gate===4&&m.travel>=420&&m.response&&m.contact);
}

export function lanternOptions(){return Object.entries(routes).map(([id,points])=>({id,label:id==='upper'?'Above the outcrop':'Below the outcrop',points:points.map(p=>({...p}))}));}
export function lanternLineVisible(a,b){
 if(!a||!b||dist(a,b)>LIGHT_RANGE)return false;
 const o=LANTERN_OUTCROP,dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy;
 const t=length?clamp(((o.x-a.x)*dx+(o.y-a.y)*dy)/length,0,1):0;
 return Math.hypot(a.x+t*dx-o.x,a.y+t*dy-o.y)>o.r+5;
}
const memberFish=(sim,s)=>s.participants.map(m=>entities(sim).find(e=>identity(e,m)&&e.species?.id==='s53'&&e.alive&&e.health>0));
function runtime(sim,s){
 let rt=sessions.get(sim);
 if(!rt||rt.state!==s){rt={state:s,offscreen:false,previousPlayer:{x:sim.player.x,y:sim.player.y},previousMembers:new Map(memberFish(sim,s).filter(Boolean).map(e=>[e.id,{x:e.x,y:e.y}])),moving:false,freshContact:new Set()};sessions.set(sim,rt);return {rt,fresh:true};}
 return {rt,fresh:false};
}
function reset(sim,s,reason){
 for(const e of memberFish(sim,s))if(e){delete e.lanternCaseStudy;delete e.lanternLight;delete e.lanternOrganShown;}
 Object.assign(s,{stage:'gather',route:null,participants:[],playerGate:0,playerTravel:0,organShown:false,complete:false});
 sessions.set(sim,{state:s,offscreen:false,previousPlayer:{x:sim.player.x,y:sim.player.y},previousMembers:new Map(),moving:false,freshContact:new Set()});
 emit(sim,reason);
}
export function initStory(sim){
 if(!active(sim))return false;
 if(!state(sim))sim.reefStories.lantern={version:1,reef:8,caseStudy:LANTERN_CASE_STUDY,stage:'gather',route:null,participants:[],playerGate:0,playerTravel:0,organShown:false,clock:0,complete:false};
 if(!validStory(state(sim)))return false;
 const s=state(sim);runtime(sim,s);
 if(s.stage==='route'&&sim.current===8&&memberFish(sim,s).some(e=>!eligible(e)))reset(sim,s,'A saved schoolmate is absent or busy. Meet two available fish for a fresh bend.');
 if(sim.current===8)pose(sim,s);
 if(sim.current!==8)sim.setDestination?.(8);
 return true;
}
const lightFor=(s,m)=>.5+.5*Math.sin(s.clock*Math.PI/3+Number(m.id)*.7||s.clock*Math.PI/3);
function pose(sim,s){
 sim.player.lanternCaseStudy=LANTERN_CASE_STUDY;sim.player.lanternOrganShown=s.organShown;sim.player.lanternLight=s.organShown?1:0;
 for(const m of s.participants){const e=entities(sim).find(e=>identity(e,m));if(e){e.lanternCaseStudy=LANTERN_CASE_STUDY;e.lanternLight=lightFor(s,m);e.lanternOrganShown=e.lanternLight>.35;}}
}
export function storyAction(sim,action,value){
 const s=state(sim);if(!s||!running(sim))return false;
 if(action==='lantern-restart'){reset(sim,s,'Meet two available flashlightfish and choose another route.');return true;}
 if(['lantern-upper','lantern-lower','lantern-route'].includes(action)){
  if(s.complete||s.stage!=='gather')return true;
  const route=action==='lantern-route'?value:action.slice(8);if(!Object.hasOwn(routes,route))return false;
  const fish=entities(sim).filter(e=>eligible(e)&&dist(e,sim.player)<250).sort((a,b)=>dist(a,sim.player)-dist(b,sim.player)||String(a.id).localeCompare(String(b.id))).slice(0,3);
  if(fish.length<2){emit(sim,'Swim near two available flashlightfish. The case study uses the fish already living here.');return true;}
  s.participants=fish.map(e=>({id:e.id,incarnation:incarnation(e),gate:0,travel:0,response:false,contact:false}));s.route=route;s.stage='route';s.organShown=false;
  sim.player.target=null;sim.player.feeding=null;
  sessions.set(sim,{state:s,offscreen:false,previousPlayer:{x:sim.player.x,y:sim.player.y},previousMembers:new Map(fish.map(e=>[e.id,{x:e.x,y:e.y}])),moving:false,freshContact:new Set()});
  pose(sim,s);emit(sim,'Chosen bend · Swim through the left marker, then around the outcrop. E shows or hides your light organ.','activity-step');return true;
 }
 if(['context','lantern-light','lantern-show','lantern-hide'].includes(action)){
  if(s.stage!=='route'){emit(sim,'Choose a bend while near two available schoolmates.');return true;}
  s.organShown=action==='lantern-show'?true:action==='lantern-hide'?false:!s.organShown;pose(sim,s);return true;
 }
 return false;
}
function move(e,destination,dt,speed,player=false){
 const d=dist(e,destination),old={x:e.x,y:e.y};if(d<7){e.vx=0;e.vy=0;return 0;}
 e.angle=turn(e.angle||0,Math.atan2(destination.y-e.y,destination.x-e.x),(e.species.agility||3)*dt);
 const advance=Math.min(speed*dt,d*(e.species.agility||3)*.7*dt,d),next={x:clamp(e.x+Math.cos(e.angle)*advance,player?0:10,WORLD_WIDTH-(player?0:10)),y:clamp(e.y+Math.sin(e.angle)*advance,player?0:25,WORLD_HEIGHT-(player?0:20))};
 // Reject a blocked step instead of snapping the animal onto a scripted route.
 const o=LANTERN_OUTCROP;
 if(dist(next,o)<o.r+20){e.vx=0;e.vy=0;return 0;}
 e.x=next.x;e.y=next.y;e.facing=Math.cos(e.angle)>=0?1:-1;e.vx=(e.x-old.x)/dt;e.vy=(e.y-old.y)/dt;return dist(e,old);
}
export function storyPlayer(sim,dt){
 const s=state(sim);if(!s||!running(sim)||s.stage!=='route'||sim.player.stun>0||sim.player.cleanerTarget||sim.player.feeding)return false;
 if(!Number.isFinite(dt)||dt<=0)return false;
 const {rt}=runtime(sim,s);sim.player.target=null;
 rt.moving=move(sim.player,sim.pointer||sim.player,Math.min(.05,dt),sim.player.species.speed*.54,true)>.08;
 return true;
}
export function storyPointer(sim,x,y){const s=state(sim);if(!s||!running(sim)||s.stage!=='route'||!finite(x,0,WORLD_WIDTH)||!finite(y,0,WORLD_HEIGHT))return false;sim.player.target=null;sim.pointer={x,y};return true;}
export const storyClick=storyPointer;
function advanceGate(actor,record,points){if(record.gate<4&&dist(actor,points[record.gate])<62)record.gate++;}
export function tickStory(sim,dt){
 const s=state(sim);if(!s||!active(sim)||sim.paused||sim.phase!=='playing'||!Number.isFinite(dt)||dt<=0)return false;
 const info=runtime(sim,s),rt=info.rt;
 if(sim.current!==8){rt.offscreen=true;rt.moving=false;rt.freshContact.clear();return false;}
 if(!running(sim))return false;
 if(s.stage==='route'&&rt.offscreen){rt.previousPlayer={x:sim.player.x,y:sim.player.y};rt.previousMembers=new Map(memberFish(sim,s).filter(Boolean).map(e=>[e.id,{x:e.x,y:e.y}]));rt.moving=false;rt.freshContact.clear();}
 rt.offscreen=false;
 if(s.stage==='route'&&memberFish(sim,s).some(e=>!e||!eligible(e))){reset(sim,s,'A schoolmate is absent or busy. Meet two available fish for a fresh bend.');pose(sim,s);return true;}
 s.clock=(s.clock+Math.min(.05,dt))%6;pose(sim,s);if(s.complete)return true;
 if(s.stage!=='route')return true;
 const p=sim.player,points=routes[s.route],step=dist(p,rt.previousPlayer);rt.previousPlayer={x:p.x,y:p.y};
 // Reject displacement that cannot have happened through bounded swimming.
 if(step>12){reset(sim,s,'A changed position interrupted the bend. Begin a fresh encounter.');return true;}
 s.playerTravel=Math.min(4000,s.playerTravel+step);const record={gate:s.playerGate};advanceGate(p,record,points);s.playerGate=record.gate;
 for(const m of s.participants){const e=entities(sim).find(e=>identity(e,m)),old=rt.previousMembers.get(m.id);if(old){const traveled=dist(e,old);if(traveled>12){reset(sim,s,'A schoolmate changed position. Begin a fresh encounter.');return true;}m.travel=Math.min(4000,m.travel+traveled);}rt.previousMembers.set(m.id,{x:e.x,y:e.y});advanceGate(e,m,points);}
 if(s.playerGate===4&&s.playerTravel>=450&&s.participants.some(m=>m.gate===4&&m.travel>=420&&m.response&&m.contact&&rt.freshContact.has(m.id))){s.complete=true;s.stage='complete';emit(sim,'Lantern Company · You and a living schoolmate crossed the bend using visible light cues.','discovery');}
 return true;
}
export function storyNPC(sim,e,dt){
 const s=state(sim);if(!s||!running(sim)||s.stage!=='route'||!eligible(e)||!Number.isFinite(dt)||dt<=0)return false;
 const m=s.participants.find(m=>identity(e,m));if(!m)return false;
 const p=sim.player,{rt}=runtime(sim,s),step=Math.min(.05,dt),fish=memberFish(sim,s),signals=[];
 if(s.organShown&&lanternLineVisible(e,p))signals.push(p);
 for(const b of fish)if(b&&b!==e&&b.lanternOrganShown&&lanternLineVisible(e,b))signals.push(b);
 let dx=0,dy=0;
 for(const b of signals){const d=dist(e,b),weight=b===p?1.3: .45;dx+=weight*(Math.cos(b.angle||0)*.8+(b.x-e.x)/130);dy+=weight*(Math.sin(b.angle||0)*.8+(b.y-e.y)/130);if(d<65){dx-=(b.x-e.x)/Math.max(1,d)*2;dy-=(b.y-e.y)/Math.max(1,d)*2;}}
 const before=e.angle||0;if(Math.hypot(dx,dy)>.01)e.angle=turn(before,Math.atan2(dy,dx),(e.species.agility||3)*step*.55);
 if(signals.includes(p)){m.contact=true;rt.freshContact.add(m.id);if(rt.moving&&s.playerGate>=1&&s.playerTravel>50&&Math.abs(delta(before,e.angle))>.008)m.response=true;}
 // With no light observation the fish coasts on its current heading. The
 // route markers never enter this social steering calculation.
 const anchor=signals.includes(p)?p:signals.slice().sort((a,b)=>dist(e,a)-dist(e,b))[0];
 const speed=e.species.speed*(anchor?(dist(e,anchor)>135?.64:.43):.18);
 const destination={x:e.x+Math.cos(e.angle)*100,y:e.y+Math.sin(e.angle)*100};
 if(dist({x:e.x+Math.cos(e.angle)*speed*step,y:e.y+Math.sin(e.angle)*speed*step},LANTERN_OUTCROP)<LANTERN_OUTCROP.r+20){
  const away=Math.atan2(e.y-LANTERN_OUTCROP.y,e.x-LANTERN_OUTCROP.x);e.angle=turn(e.angle,away,(e.species.agility||3)*step);destination.x=e.x+Math.cos(e.angle)*100;destination.y=e.y+Math.sin(e.angle)*100;
 }
 move(e,destination,step,speed);e.activity='schooling';e.behavior=signals.length?'Turning toward visible light cues':'Coasting without a visible light cue';return true;
}
export function storyMeal(){return false;}
export function lanternSafety(sim){
 const s=state(sim);if(!active(sim)||!s||sim.current!==8||s.complete)return null;
 const participants=s.stage==='gather'?entities(sim).filter(e=>{
  const r=e.adventureReservation;return eligible(e)&&r?.key==='lantern'&&r.reef===8&&r.species==='s53'&&r.incarnation===incarnation(e)&&r.remaining>0;
 }).slice(0,3).map(e=>({id:e.id,incarnation:incarnation(e),species:'s53'})):s.participants.map(m=>({id:m.id,incarnation:m.incarnation,species:'s53'}));
 return {reef:8,x:800,y:360,radius:430,participants,holdNeeds:s.stage==='route'};
}
export const storySafety=lanternSafety;
export const safety=lanternSafety;
export function lanternCue(sim){
 const s=state(sim);if(!s||!active(sim)||sim.current!==8)return null;
 return {active:true,obstacle:{...LANTERN_OUTCROP},routes:lanternOptions(),route:s.route,points:s.route?routes[s.route].map(p=>({...p})):[],playerGate:s.playerGate,stage:s.stage,organShown:s.organShown,complete:s.complete,participants:s.participants.map(m=>{const e=entities(sim).find(e=>identity(e,m));return {...m,x:e?.x,y:e?.y,light:e?.lanternLight||0,visible:!!(e&&s.organShown&&lanternLineVisible(e,sim.player))};})};
}
export function stopStory(sim){const s=state(sim);delete sim.player.lanternCaseStudy;delete sim.player.lanternLight;delete sim.player.lanternOrganShown;if(s){for(const e of memberFish(sim,s))if(e){delete e.lanternCaseStudy;delete e.lanternLight;delete e.lanternOrganShown;}if(!s.complete)reset(sim,s,'You leave the school freely.');}sessions.delete(sim);return true;}
export function storyView(sim){
 const s=state(sim);if(!s)return null;
 if(s.complete)return {step:'A conversation in the dark',detail:'You and the same living schoolmate crossed the chosen bend. Its heading changed after seeing your exposed organ. This is an Anomalops katoptron case study; distances and controls are game abstractions.',actions:[{id:'lantern-restart',label:'Meet the school again'}],complete:true};
 if(sim.current!==8)return {step:'Visit Quiet Grotto',detail:'The nighttime case study waits in Quiet Grotto. A fresh encounter begins when you return.',actions:[],complete:false};
 if(s.stage==='gather')return {step:'Meet the living lights',detail:'Anomalops katoptron case study · Swim near two available flashlightfish, then choose a bend. These are existing neighbors; their lights help them perceive one another.',actions:[{id:'lantern-upper',label:'Above the outcrop'},{id:'lantern-lower',label:'Below the outcrop'}],complete:false};
 return {step:s.playerGate===0?'Swim through the left marker':s.playerGate<4?'Lead the bend at the school’s pace':'Let a schoolmate cross the final marker',detail:(s.organShown?'Your organ is exposed. ':'Your organ is hidden. ')+(s.playerGate===0?'Start at the left marker. ':'Swim around your chosen side of the outcrop. ')+ 'E shows or hides the organ. The rock blocks sight; circle back if contact is lost. Waiting and the defensive Space flash cannot finish this bend.',actions:[{id:'lantern-light',label:s.organShown?'Hide light organ · E':'Show light organ · E'},{id:'lantern-restart',label:'Choose a fresh bend'}],complete:false};
}
