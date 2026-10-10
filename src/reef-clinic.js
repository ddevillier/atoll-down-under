import {BY_ID,REEFS} from './data.js';
import {canHelp,parasiteDamage,requestPlayerService,cancelPlayerService} from './player-cleaner.js';
import {approachCleaning} from './cleaning-stations.js';
import {rememberExperience,meetFish} from './reef-memories.js';
import {WORLD_WIDTH as W,WORLD_HEIGHT as H} from './world-dimensions.js';

const roles={s43:4,s45:8},distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const validId=id=>Number.isInteger(id)&&id>=0||typeof id==='string'&&id.length>0&&id.length<100&&id!=='player';
const number=(n,max=1e6)=>Number.isFinite(n)&&n>=0&&n<=max;
const identity=e=>({id:e.id,species:e.species.id,incarnation:e.incarnation||0});
const same=(a,b)=>a.id===b.id&&a.species===b.species.id&&a.incarnation===(b.incarnation||0);
const temperament=e=>{const id=String(e.id);let hash=0;for(const c of id)hash=(hash*31+c.charCodeAt(0))>>>0;return hash%2?'nervous':'bold';};
const validIdentity=r=>!!r&&typeof r==='object'&&validId(r.id)&&!!BY_ID[r.species]&&Number.isInteger(r.incarnation)&&number(r.incarnation)&&['nervous','bold'].includes(r.temperament);
const cleanBaseline=new WeakMap();
const active=sim=>sim.reefStories&&['clinic','reef-clinic'].includes(sim.reefStories.active);
const state=sim=>sim.reefStories?.clinic;
const running=sim=>active(sim)&&!!state(sim)&&sim.phase==='playing'&&!sim.paused&&sim.player?.health>0&&sim.current===state(sim).reef&&sim.player.species.id===state(sim).species;
const clientFor=(sim,a)=>a&&sim.section.entities.find(e=>same(a,e));
const available=e=>!!e?.alive&&e.health>0&&!e.hidden&&!(e.stun>0)&&!e.feeding&&!e.groundRoute&&!e.holdfast&&e.species.speed>0&&e.species.ability!=='clean'&&!(e.cleanTime>0)&&e.activity!=='avoiding'&&!e.behavior?.startsWith('Moving away');
const relationship=(s,e)=>s.relationships.find(r=>same(r,e));
const visitors=sim=>sim.section.entities.filter(e=>available(e)&&(canHelp(e)||relationship(state(sim),e)?.visits>0));

export function validStory(s){
 if(s==null)return true;
 if(!s||typeof s!=='object'||s.version!==1||!Object.hasOwn(roles,s.species)||roles[s.species]!==s.reef||typeof s.open!=='boolean'||typeof s.completed!=='boolean'||typeof s.emitted!=='boolean'||s.emitted&&!s.completed)return false;
 if(!s.station||!Number.isFinite(s.station.x)||!Number.isFinite(s.station.y)||s.station.x<10||s.station.x>W-10||s.station.y<25||s.station.y>H-20)return false;
 if(!Array.isArray(s.relationships)||s.relationships.length>64||!s.relationships.every(r=>validIdentity(r)&&Number.isInteger(r.visits)&&number(r.visits)&&number(r.removed)&&typeof r.returned==='boolean'&&(!r.returned||r.visits>0)&&(!r.visits||r.removed>=1)))return false;
 if(new Set(s.relationships.map(r=>JSON.stringify([r.id,r.species,r.incarnation]))).size!==s.relationships.length)return false;
 const a=s.appointment;
 if(a!==null&&(!validIdentity(a)||!['approach','ready','care'].includes(a.phase)||typeof a.gentle!=='boolean'||typeof a.returning!=='boolean'||typeof a.careStarted!=='boolean'||!['removed','startDamage','total'].every(k=>number(a[k],100))||a.removed>a.total||!number(a.lastElapsed,3.01)||a.phase==='care'&&(!a.careStarted||a.total<=0)||a.returning&&!s.relationships.some(r=>r.id===a.id&&r.species===a.species&&r.incarnation===a.incarnation&&r.visits>0)))return false;
 return !s.completed||s.relationships.filter(r=>r.visits>0).length>=2&&s.relationships.some(r=>r.returned);
}

export function initStory(sim){
 const reef=roles[sim.player?.species.id];
 if(reef===undefined||sim.current!==reef||sim.trial)return false;
 sim.reefStories??={version:1,active:null,clinic:null,artist:null,engineer:null,detective:null,nursery:null};
 if(sim.reefStories.clinic?.species===sim.player.species.id&&validStory(sim.reefStories.clinic))return true;
 sim.reefStories.clinic={version:1,reef,species:sim.player.species.id,station:{x:Math.max(90,Math.min(W-160,sim.player.x)),y:Math.max(80,Math.min(H-100,sim.player.y))},open:true,appointment:null,relationships:[],completed:false,emitted:false};
 return true;
}

function release(sim,message){
 const s=state(sim),a=s.appointment;
 if(a&&sim.player.service?.client===a.id&&sim.player.service.reef===s.reef)cancelPlayerService(sim);
 const client=clientFor(sim,a);
 if(client&&!client.feeding&&!(client.cleanTime>0)){client.activity='exploring';client.behavior='Leaving your clinic';client.think=0;}
 s.appointment=null;cleanBaseline.delete(sim);
 if(message)sim.event('message',message);
}
function finish(sim){
 const s=state(sim);
 if(s.relationships.filter(r=>r.visits>0).length>=2&&s.relationships.some(r=>r.returned))s.completed=true;
 if(s.completed&&!s.emitted){s.emitted=true;sim.event('discovery','Your reef clinic has become a familiar place: two neighbours cared for, and one welcomed back.',{value:'reef-clinic'});}
}
function choose(sim,value){
 const s=state(sim);if(!s.open||s.appointment)return false;
 const c=visitors(sim).find(e=>e.id===value||String(e.id)===String(value));
 if(!c)return false;
 const r=relationship(s,c),returning=!!r?.visits;
 s.appointment={...identity(c),temperament:r?.temperament||temperament(c),phase:'approach',gentle:false,returning,removed:0,startDamage:0,total:0,lastElapsed:0,careStarted:false};
 c.target=null;c.pursuit=0;
 sim.event('activity-step',c.species.name+(returning?' remembers your care and is returning.':s.appointment.temperament==='nervous'?' is nervous; offer a gentle approach.':' is bold and ready to visit.'));
 return true;
}

export function storyAction(sim,action,value){
 if(!running(sim))return false;
 const s=state(sim),a=s.appointment,c=clientFor(sim,a);
 if(action==='context'){
  if(!s.open)return storyAction(sim,'clinic-open');
  if(!a){const nearest=visitors(sim).sort((x,y)=>distance(x,s.station)-distance(y,s.station))[0];return nearest?choose(sim,nearest.id):false;}
  if(a.temperament==='nervous'&&!a.gentle)return storyAction(sim,'clinic-gentle');
  return a.returning?storyAction(sim,'clinic-welcome'):storyAction(sim,'clinic-care');
 }
 if(action==='clinic-cancel'){if(!a)return false;release(sim,'Appointment cancelled. Your visitor is free to explore.');return true;}
 if(action==='clinic-close'){release(sim);s.open=false;return true;}
 if(action==='clinic-open'){s.open=true;return true;}
 if(action==='clinic-move'){
  if(a)return false;
  s.station={x:Math.max(90,Math.min(W-160,sim.player.x)),y:Math.max(80,Math.min(H-100,sim.player.y))};return true;
 }
 if(action==='clinic-choose'||action==='clinic-return')return choose(sim,value);
 if(!a||!c||!available(c)&&a.phase!=='care')return false;
 if(action==='clinic-gentle'&&a.phase!=='care'){a.gentle=true;sim.event('activity-step','You make room and invite a slow, gentle approach.');return true;}
 if(a.phase!=='ready'||distance(sim.player,s.station)>100||a.temperament==='nervous'&&!a.gentle)return false;
 if(action==='clinic-welcome'&&a.returning){
  const r=relationship(s,c);if(!r?.visits)return false;
  r.returned=true;meetFish(sim,c,{record:false});
  rememberExperience(sim,'reunion','Welcomed the same '+c.species.name.toLowerCase()+' back to your clinic in '+REEFS[s.reef].name+' after your earlier parasite care.',{neighbor:c.species.id});
  release(sim);finish(sim);return true;
 }
 if(action==='clinic-care'&&canHelp(c)&&requestPlayerService(sim,c)){
  const service=sim.player.service;a.phase='care';a.careStarted=true;a.startDamage=parasiteDamage(c);a.total=service.total;a.removed=0;a.lastElapsed=0;
  cleanBaseline.set(sim,new Set(sim.events.filter(e=>e.type==='clean')));return true;
 }
 return false;
}

export function tickStory(sim,dt){
 if(!active(sim)||!state(sim)||sim.paused||sim.phase!=='playing'||!Number.isFinite(dt)||dt<=0)return;
 const s=state(sim);
 if(sim.current!==s.reef||sim.player?.species.id!==s.species||sim.player.health<=0){if(s.appointment)release(sim);return;}
 const a=s.appointment;if(!a){finish(sim);return;}
 const c=clientFor(sim,a);
 if(!c?.alive||c.health<=0||c.hidden||c.stun>0||c.feeding||c.activity==='avoiding'||c.behavior?.startsWith('Moving away')){release(sim,'Your visitor needs space. Choose another appointment when they are ready.');return;}
 if(a.phase==='care'){
  const service=sim.player.service;
  if(service?.client===a.id&&service.reef===s.reef&&service.total===a.total){a.removed=Math.max(a.removed,service.removed);a.lastElapsed=service.elapsed;return;}
  // The incumbent contact service is the sole source of care. Its completion
  // event proves the last inspection frame even if its service object cleared.
  const baseline=cleanBaseline.get(sim);
  const completed=sim.events.some(e=>e.type==='clean'&&e.animalId===a.id&&!baseline?.has(e));
  const removed=Math.min(a.total,Math.max(0,a.startDamage-parasiteDamage(c)));
  if(completed&&a.careStarted&&removed>=1){
   let r=relationship(s,c);
   if(!r){r={...identity(c),temperament:a.temperament,visits:0,removed:0,returned:false};s.relationships.push(r);if(s.relationships.length>64){const oldest=s.relationships.findIndex(entry=>!entry.returned);s.relationships.splice(oldest<0?0:oldest,1);}}
   r.visits++;r.removed+=removed;
   if(a.returning)r.returned=true;
   s.appointment=null;cleanBaseline.delete(sim);finish(sim);return;
  }
  release(sim,'The care visit ended early. Removed parasites still count toward your visitor’s health.');return;
 }
 if(!s.open||!available(c)){release(sim);return;}
 const berth={x:s.station.x+65,y:s.station.y};
 a.phase=distance(c,berth)<=18&&distance(sim.player,s.station)<=100?'ready':'approach';
}

export function storyNPC(sim,e,dt){
 if(!running(sim)||!Number.isFinite(dt)||dt<=0)return false;
 const s=state(sim),a=s.appointment;if(!a||a.phase==='care'||!same(a,e)||!available(e))return false;
 const berth={x:s.station.x+65,y:s.station.y};
 // Nervous clients wait at a respectful distance until explicitly reassured.
 const dest=a.temperament==='nervous'&&!a.gentle?{x:s.station.x+150,y:s.station.y}:berth;
 const before={x:e.x,y:e.y};
 approachCleaning(e,dest,dt,e.species.speed*(a.gentle?.18:.32));
 const limit=e.species.speed*(a.gentle?.18:.32)*dt;
 if(distance(e,before)>limit+.001)throw new Error('Clinic approach exceeded the visitor speed limit.');
 e.target=null;e.pursuit=0;e.activity='approaching-cleaner';
 e.behavior=a.temperament==='nervous'&&!a.gentle?'Waiting for your gentle approach':distance(e,berth)>18?a.returning?'Returning to a familiar clinic':a.gentle?'Approaching your clinic cautiously':'Coming to your clinic':'Ready at your clinic';
 // Claiming movement must retain the ordinary metabolism of this living fish.
 e.satiated=Math.max(0,(e.satiated||0)-dt);e.rest=Math.max(0,(e.rest||0)-dt);
 if(e.species.parasites)e.health=Math.max(0,e.health-dt*.045);
 return true;
}
export function storyMeal(){return false;}

export function storyView(sim){
 const s=state(sim);if(!s)return {step:'Open a reef clinic',detail:'Begin as a cleaner wrasse in Coral Cathedral or a cleaner shrimp in Quiet Grotto.',actions:[],complete:false};
 const count=s.relationships.filter(r=>r.visits>0).length,returned=s.relationships.some(r=>r.returned),a=s.appointment,c=clientFor(sim,a);
 const progress=count+' neighbours cared for · '+(returned?'a familiar visitor welcomed back':'welcome a familiar visitor back');
 if(sim.current!==s.reef)return {step:'Return to your clinic',detail:REEFS[s.reef].name+' holds your station and remembered visitors. '+progress,actions:[],complete:s.completed};
 if(!s.open)return {step:'Clinic resting',detail:'Your appointments are optional. '+progress,actions:[{id:'clinic-open',label:'Open the clinic'}],complete:s.completed};
 if(a&&c){
  const tone=a.temperament==='nervous'?'Nervous visitor: leave room and invite them gently.':'Bold visitor: happy to approach your station.';
  const actions=[{id:'clinic-cancel',label:'Cancel appointment'}];
  if(a.phase!=='care'&&a.temperament==='nervous'&&!a.gentle)actions.unshift({id:'clinic-gentle',label:'Invite a gentle approach'});
  if(a.phase==='ready'&&distance(sim.player,s.station)<=100&&(a.temperament!=='nervous'||a.gentle)){
   if(a.returning)actions.unshift({id:'clinic-welcome',label:'Welcome your familiar visitor'});
   if(canHelp(c))actions.unshift({id:'clinic-care',label:'Begin parasite care'});
  }
  const step=a.phase==='care'?'Caring for '+c.species.name:distance(sim.player,s.station)>100?'Return to your station':a.temperament==='nervous'&&!a.gentle?'Invite a gentle approach':a.phase==='ready'?'Your visitor is ready':'Let your visitor approach';
  return {step,detail:c.species.name+' · '+(a.phase==='care'?Math.round(sim.player.service?.removed??a.removed)+' parasite damage removed through contact. '+progress:tone+' '+(a.returning?'They remember your earlier care. ':'')+(a.phase==='ready'?'Your visitor is ready.':'Stay near the station as they approach.')+' '+progress),actions,complete:s.completed};
 }
 const choices=visitors(sim).sort((x,y)=>distance(x,s.station)-distance(y,s.station)).slice(0,6).map(e=>{
  const r=relationship(s,e),tone=r?.temperament||temperament(e);
  // The finite roster order survives travel and saves. Number only otherwise
  // identical species/temperament labels, independently of distance sorting.
  const peers=sim.section.entities.filter(other=>other.species.id===e.species.id&&(relationship(s,other)?.temperament||temperament(other))===tone);
  const ordinal=peers.length>1?' '+(peers.indexOf(e)+1):'';
  return {id:r?.visits?'clinic-return':'clinic-choose',value:e.id,label:e.species.name+' · '+(r?.visits?tone+' familiar visitor'+ordinal:tone+(ordinal?' visitor'+ordinal:'')+' · '+Math.round(parasiteDamage(e))+' parasite damage')};
 });
 return {step:s.completed?'A familiar reef clinic':'Choose your next appointment',detail:progress+'. '+(choices.length?'Choose a real neighbour; gentle visits earn trust through actual care.':'No available visitors need an appointment. Explore and return when a neighbour is ready.'),actions:[...choices,{id:'clinic-move',label:'Set the station here'},{id:'clinic-close',label:'Close the clinic'}],complete:s.completed};
}




