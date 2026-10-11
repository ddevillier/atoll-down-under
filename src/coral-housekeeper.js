import {mouthPoint} from './feeding-contact.js';
import {turnTowards} from './steering.js';

// A named, authored colony, not a taxonomic claim about a generic shelter dot.
// Branches, sediment targets and the inspection berth share one world frame.
const branches=[
 {x:620,y:402,tipX:602,tipY:273,width:18},
 {x:610,y:370,tipX:559,tipY:289,width:14},
 {x:613,y:351,tipX:650,tipY:278,width:14},
 {x:620,y:377,tipX:682,tipY:320,width:16},
 {x:602,y:326,tipX:575,tipY:268,width:11},
 {x:646,y:341,tipX:673,tipY:280,width:11},
 {x:579,y:320,tipX:546,tipY:308,width:10},
 {x:659,y:358,tipX:698,tipY:355,width:11},
];
export const COLONY=Object.freeze({id:'pocillopora-cathedral-1',reef:4,taxon:'Pocillopora damicornis',x:620,y:340,radius:112,
 branches:Object.freeze(branches.map(Object.freeze)),
 pockets:Object.freeze([{id:0,label:'Left branch pocket',x:578,y:321,radius:19,outward:'left'},
 {id:1,label:'Right branch pocket',x:660,y:358,radius:19,outward:'right'}].map(Object.freeze)),
 inspect:Object.freeze({x:620,y:430,radius:30})});
const CLEAR_SECONDS=1.2,REVIEW_SECONDS=.8,PLUME_SECONDS=1.6;
const state=sim=>sim.reefStories?.housekeeper;
const active=sim=>sim.reefStories?.active==='housekeeper'&&sim.player?.species?.id==='s30'&&sim.mode==='practice'&&!sim.trial;
const playable=sim=>active(sim)&&!sim.paused&&sim.phase==='playing'&&sim.player.health>0&&sim.player.energy>0&&!(sim.player.stun>0);
const local=sim=>sim.current===COLONY.reef;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const bounded=n=>Math.min(.05,n);
const cleared=s=>s.mask.every(Boolean);
const direction=d=>d==='left'||d==='right';
const owning=s=>s?.intent!==null&&['approach','clear','review'].includes(s?.phase);

export function initStory(sim){
 if(sim.player?.species?.id!=='s30')return null;
 sim.reefStories??={version:1,active:null};
 return state(sim)|| (sim.reefStories.housekeeper={version:1,reef:COLONY.reef,site:COLONY.id,phase:'inspect',intent:null,
 selected:null,direction:'left',approach:'flank',mask:[0,0],elapsed:0,plume:0,plumePocket:null,plumeDirection:'left',inspected:false,complete:false});
}
function release(sim){
 const s=state(sim);if(!s)return;
 const owned=owning(s);s.intent=null;s.elapsed=0;s.approach='flank';
 s.phase=s.complete?'complete':cleared(s)?'review':s.inspected?'choose':'inspect';
 if(owned){sim.player.target=null;sim.player.feeding=null;sim.pointer={x:sim.player.x,y:sim.player.y};}
}
export function stopStory(sim){if(!state(sim))return false;release(sim);return true;}
function request(sim,intent){
 const s=state(sim);s.intent=intent;s.phase='approach';s.approach=intent==='clear'?'flank':'contact';s.elapsed=0;
 sim.player.target=null;sim.player.feeding=null;sim.player.cleanerTarget=null;sim.player.cleanTime=0;
 sim.pointer={x:sim.player.x,y:sim.player.y};return true;
}
function select(sim,id){
 const s=state(sim);if(!Number.isInteger(id)||!COLONY.pockets[id]||s.mask[id]||!s.inspected||s.complete)return false;
 release(sim);s.selected=id;s.direction=sim.player.x<COLONY.pockets[id].x?'right':'left';return true;
}
export function storyAction(sim,action,value){
 if(!playable(sim))return false;const s=initStory(sim);
 if(action==='housekeeper-cancel'){release(sim);return true;}
 if(!local(sim))return false;
 if(action==='housekeeper-inspect')return request(sim,s.complete?'review':s.inspected&&cleared(s)?'review':'inspect');
 if(action==='housekeeper-pocket')return select(sim,Number(value));
 if(action==='housekeeper-direction'){
  if(s.selected===null||s.mask[s.selected]||!direction(value)||!s.inspected||s.complete)return false;
  release(sim);s.direction=value;return true;
 }
 if(action==='housekeeper-clear'){
  if(!s.inspected||s.selected===null||s.mask[s.selected]||s.complete)return false;
  return request(sim,'clear');
 }
 if(action==='context'){
  if(!s.inspected||cleared(s))return storyAction(sim,'housekeeper-inspect');
  if(s.selected===null||s.mask[s.selected]){const p=COLONY.pockets.filter(p=>!s.mask[p.id]).sort((a,b)=>distance(a,sim.player)-distance(b,sim.player))[0];select(sim,p.id);}
  return storyAction(sim,'housekeeper-clear');
 }
 return false;
}
export function storyClick(sim,x,y){
 if(!playable(sim)||!local(sim)||!Number.isFinite(x)||!Number.isFinite(y))return false;
 const s=initStory(sim),point={x,y};
 const p=COLONY.pockets.find(p=>distance(p,point)<=p.radius+7);
 if(p){
  if(!s.inspected)return request(sim,'inspect');
  if(s.mask[p.id])return request(sim,cleared(s)?'review':'inspect');
  if(!select(sim,p.id))return false;return request(sim,'clear');
 }
 if(distance(COLONY.inspect,point)<COLONY.inspect.radius||distance(COLONY,point)<COLONY.radius)return storyAction(sim,'housekeeper-inspect');
 return false;
}
// Pointer movement is a cancellation, including a move during mouth contact.
// The normal point() handler then receives the same input immediately.
export function storyPointer(sim,x,y){
 if(playable(sim)&&Number.isFinite(x)&&Number.isFinite(y)&&owning(state(sim)))release(sim);
 return false;
}
function contactPlan(sim){
 const s=state(sim),p=COLONY.pockets[s.selected],facing=s.direction==='right'?1:-1;
 const mouth=mouthPoint(sim.player,{facing,rotation:0});
 return {x:p.x-(mouth.x-sim.player.x),y:p.y-(mouth.y-sim.player.y),facing};
}
function swim(e,goal,dt,dock=false,facing=1){
 const dx=goal.x-e.x,dy=goal.y-e.y,d=Math.hypot(dx,dy),heading=facing>0?0:Math.PI;
 e.angle=turnTowards(e.angle||0,dock&&d<60?heading:Math.atan2(dy,dx),e.species.agility*dt);
 const speed=e.species.speed*.72,advance=Math.min(speed*dt,d*6*dt,d);
 if(dock&&d<60){const scale=d?advance/d:0;e.x+=dx*scale;e.y+=dy*scale;}
 else if(d>.2){e.x+=Math.cos(e.angle)*advance;e.y+=Math.sin(e.angle)*advance;}
 e.facing=Math.cos(e.angle)>=0?1:-1;e.hidden=false;e.still=d<3?(e.still||0)+dt:0;
 return d;
}
// Movement owns only the explicitly selected approach/pose, never free swim.
// Contact uses the same horizontal mouth landmark as the authoritative artwork.
export function storyPlayer(sim,dt){
 if(!playable(sim)||!local(sim)||!Number.isFinite(dt)||dt<=0)return false;
 const s=state(sim);if(!owning(s))return false;dt=bounded(dt);
 const e=sim.player;e.target=null;e.feeding=null;
 if(s.intent==='clear'){
  const plan=contactPlan(sim),p=COLONY.pockets[s.selected];
  if(s.approach==='flank'){
   const flank={x:p.x-plan.facing*110,y:p.y};
   if(swim(e,flank,dt)<5)s.approach='contact';
  }else{
   swim(e,plan,dt,true,plan.facing);
   const mouth=mouthPoint(e,{rotation:0});
   const aligned=e.facing===plan.facing&&Math.cos(e.angle-(plan.facing>0?0:Math.PI))>.995;
   if(aligned&&distance(mouth,p)<=3){s.phase='clear';e.activity='housekeeping';}
   else {s.phase='approach';s.elapsed=0;}
  }
 }else{
  const gap=swim(e,COLONY.inspect,dt,true,e.x<COLONY.inspect.x?1:-1);
  if(gap<3){
   if(s.intent==='inspect'){s.inspected=true;release(sim);}
   else {s.phase='review';e.activity='observing';}
  }else{s.phase='approach';s.elapsed=0;}
 }
 sim.pointer={x:e.x,y:e.y};return true;
}
export function tickStory(sim,dt){
 if(!playable(sim)||!local(sim)||!Number.isFinite(dt)||dt<=0)return;
 const s=state(sim);if(!s)return;dt=bounded(dt);
 s.plume=Math.max(0,s.plume-dt);if(s.plume===0)s.plumePocket=null;
 if(s.phase==='clear'&&s.intent==='clear'){
  const p=COLONY.pockets[s.selected],plan=contactPlan(sim);
  if(distance(mouthPoint(sim.player,{rotation:0}),p)>3||sim.player.facing!==plan.facing||Math.cos(sim.player.angle-(plan.facing>0?0:Math.PI))<=.995){s.phase='approach';s.elapsed=0;return;}
  s.elapsed=Math.min(CLEAR_SECONDS,s.elapsed+dt);
  if(s.elapsed>=CLEAR_SECONDS){
   s.plume=PLUME_SECONDS;s.plumePocket=s.selected;s.plumeDirection=s.direction;
   if(s.direction===p.outward){s.mask[s.selected]=1;sim.event?.('message',cleared(s)?'Both pockets are clear. Inspect the uncovered branches below the colony.':'Sediment leaves the open side. Choose the other dusty pocket.');}
   else sim.event?.('message','The particles drift into the sheltered branches and settle. Approach from the other side to blow toward open water.');
   release(sim);
  }
 }
 if(s.phase==='review'&&s.intent==='review'&&distance(sim.player,COLONY.inspect)<3){
  s.elapsed=Math.min(REVIEW_SECONDS,s.elapsed+dt);
  if(s.elapsed>=REVIEW_SECONDS){
   if(cleared(s)&&!s.complete){s.complete=true;sim.event?.('discovery','Coral Housekeeper · Your mouth contact carried sediment out of two branch pockets, revealing the existing coral detail. Direction choice is an authored game interpretation; no coral growth or meal was created.',{value:'coral-housekeeper'});}
   release(sim);
  }
 }
}
export function storyMeal(){return false;}
export function storyNPC(){return false;}
export function housekeeperPose(sim){
 const s=state(sim),p=s?.selected!==null&&COLONY.pockets[s?.selected];
 return active(sim)&&local(sim)&&sim.phase==='playing'&&s?.phase==='clear'&&s.intent==='clear'&&p&&distance(mouthPoint(sim.player,{rotation:0}),p)<=3?{rotation:0,facing:s.direction==='right'?1:-1,progress:s.elapsed/CLEAR_SECONDS}:null;
}
export function safety(sim){
 // Safety is derived during a paused saved pose as well: stopStory captures
 // this read-only descriptor before releasing movement and granting exit grace.
 if(!active(sim)||!local(sim)||sim.phase!=='playing'||sim.player.alive===false||!(sim.player.health>0)||!(sim.player.energy>0)||sim.player.stun>0||distance(sim.player,COLONY)>235)return null;
 const s=state(sim);return {reef:COLONY.reef,x:COLONY.x,y:COLONY.y,radius:235,participants:[],holdNeeds:s?.phase==='clear'||s?.phase==='review'&&s.intent==='review'};
}
export function storyView(sim){
 const s=state(sim);if(!s)return {step:'Visit the branching colony',detail:'Begin as a humbug damselfish in Coral Cathedral.',actions:[],complete:false};
 if(!local(sim))return {step:'Return to Coral Cathedral',detail:'Your Pocillopora colony retains its cleared pockets. Follow the map route to continue.',actions:[{id:'story-route',label:'Show route'}],complete:s.complete};
 const actions=[];let step='Inspect the dusted colony',detail='Click the branching Pocillopora colony, or inspect below it. Swim close to see two sheltered dust pockets.';
 if(!s.inspected)actions.push({id:'housekeeper-inspect',label:'Inspect the colony'});
 else if(!cleared(s)){
  step='Choose a pocket and an exit direction';detail='Sediment is not food. Choose a pocket, then approach from the side that lets your mouth blow toward open water. Moving the pointer cancels the approach or clearing pose.';
  COLONY.pockets.filter(p=>!s.mask[p.id]).forEach(p=>actions.push({id:'housekeeper-pocket',label:p.label,value:p.id}));
  if(s.selected!==null&&!s.mask[s.selected]){
   actions.push({id:'housekeeper-direction',label:'Blow left ←',value:'left'},{id:'housekeeper-direction',label:'Blow right →',value:'right'},{id:'housekeeper-clear',label:'Approach and clear'});
   detail+=' Selected: '+COLONY.pockets[s.selected].label+'; blow '+s.direction+'.';
  }
 }else{
  step=s.complete?'A clear passage, kept in the reef':'Inspect the uncovered branch detail';
  detail=s.complete?'Both sediment pockets remain clear. The revealed polyps and branches already existed; this is no instant coral recovery. Explore freely or inspect your work again.':'Swim to the inspection berth below the colony and settle to see the existing polyp detail revealed. A neighboring resident is optional.';
  actions.push({id:'housekeeper-inspect',label:s.complete?'Inspect again':'Inspect your work'});
 }
 if(s.phase==='approach')step=s.intent==='clear'?'Swimming to the chosen side':'Swimming to the inspection berth';
 if(s.phase==='clear'){step='Mouth contact: a gentle clearing motion';detail='Your fish holds a horizontal contact pose. Particles leave in your chosen direction. Move the pointer to stop immediately.';}
 if(owning(s))actions.push({id:'housekeeper-cancel',label:'Cancel this approach'});
 return {step,detail,actions,complete:s.complete};
}
const object=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const keys=['version','reef','site','phase','intent','selected','direction','approach','mask','elapsed','plume','plumePocket','plumeDirection','inspected','complete'];
export function validStory(s){
 if(s==null)return true;
 if(!object(s)||Object.keys(s).length!==keys.length||Object.keys(s).some(k=>!keys.includes(k))||s.version!==1||s.reef!==COLONY.reef||s.site!==COLONY.id||!['inspect','choose','approach','clear','review','complete'].includes(s.phase)||![null,'inspect','clear','review'].includes(s.intent)||![null,0,1].includes(s.selected)||!direction(s.direction)||!['flank','contact'].includes(s.approach)||!Array.isArray(s.mask)||s.mask.length!==2||!s.mask.every(n=>n===0||n===1)||!Number.isFinite(s.elapsed)||s.elapsed<0||s.elapsed>CLEAR_SECONDS||!Number.isFinite(s.plume)||s.plume<0||s.plume>PLUME_SECONDS||![null,0,1].includes(s.plumePocket)||!direction(s.plumeDirection)||typeof s.inspected!=='boolean'||typeof s.complete!=='boolean')return false;
 if((s.plume>0)!==(s.plumePocket!==null)||s.mask.some(Boolean)&&!s.inspected||s.complete&&(!cleared(s)||!s.inspected))return false;
 if(s.intent!==null&&!['approach','clear','review'].includes(s.phase)||s.phase==='approach'&&s.intent===null||s.phase==='clear'&&s.intent!=='clear'||s.intent==='clear'&&(!s.inspected||s.selected===null||s.mask[s.selected]||s.complete)||s.phase==='clear'&&s.approach!=='contact')return false;
 if(s.intent==='review'&&(!s.inspected||!cleared(s))||s.phase==='review'&&!cleared(s)||s.phase==='complete'&&!s.complete||s.phase==='choose'&&(!s.inspected||cleared(s))||s.phase==='inspect'&&s.inspected)return false;
 if(!['clear','review'].includes(s.phase)&&s.elapsed!==0||s.phase==='review'&&s.elapsed>REVIEW_SECONDS||s.intent===null&&s.elapsed!==0)return false;
 return true;
}
