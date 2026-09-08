import {cleanerInspection} from './cleaner-motion.js';
import {approachCleaning} from './cleaning-stations.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const parasiteDamage=e=>Math.max(0,100-e.health-(e.biteDamage||0)-(e.poisonDamage||0));
export function validPlayerService(s){return s==null||typeof s==='object'&&(typeof s.client==='string'&&s.client.length>0&&s.client.length<100||typeof s.client==='number'&&Number.isFinite(s.client))&&Number.isInteger(s.reef)&&s.reef>=0&&s.reef<9&&['total','removed','elapsed'].every(k=>Number.isFinite(s[k])&&s[k]>=0)&&s.total>0&&s.total<=100&&s.removed<=s.total&&s.elapsed<=3.01;}
export function serviceClient(sim){const s=sim.player?.service;return s&&s.reef===sim.current?sim.section.entities.find(e=>e.id===s.client&&e.alive):null;}
export function canHelp(e){return !!e?.alive&&e.health>0&&e.species.parasites&&e.species.ability!=='clean'&&!e.groundRoute&&!e.holdfast&&!e.hidden&&!(e.stun>0)&&!(e.cleanTime>0)&&!e.feeding&&parasiteDamage(e)>1;}
export function cancelPlayerService(sim){
 const p=sim.player,s=p?.service,client=s?sim.sections[s.reef]?.entities.find(e=>e.id===s.client):null;
 const anotherCleaner=client?.target!=null&&sim.sections[s.reef]?.entities.some(e=>e.id===client.target&&e.alive&&e.species.ability==='clean');
 if(client&&!anotherCleaner){client.cleanTime=0;client.behavior='Leaving your cleaning visit';client.rest=Math.max(client.rest||0,2);client.think=0;}
 if(s){p.service=null;p.actionTime=0;p.behavior='Exploring';}
}
export function requestPlayerService(sim,client){
 const p=sim.player;if(!p||p.health<=0||p.species.ability!=='clean'||sim.paused||sim.phase!=='playing')return false;
 cancelPlayerService(sim);
 client=client||sim.section.entities.filter(canHelp).sort((a,b)=>distance(p,a)-distance(p,b))[0];
 if(!canHelp(client)){sim.event('message','Choose a fish with parasites to remove. Cleaning leaves bites and poison to recover naturally.');return false;}
 p.target=null;p.feeding=null;p.cleanerTarget=null;p.hidden=false;
 // A requested visit replaces an unstarted station trip. Active treatment
 // and feeding are excluded by canHelp, so neither can be stolen.
 client.target=null;client.pursuit=0;
 p.service={client:client.id,reef:sim.current,total:parasiteDamage(client),removed:0,elapsed:0};sim.protected=false;
 sim.pointer={x:p.x,y:p.y};sim.event('message','Helping '+client.species.name+' · Swim away to stop.');return true;
}
export function treatingClient(sim,e){const c=serviceClient(sim);return c===e&&sim.player.service.elapsed>0&&distance(sim.player,c)<220;}
export function respondToPlayerService(sim,e,dt){
 if(serviceClient(sim)!==e)return false;
 e.target=null;e.pursuit=0;
 if(distance(sim.player,e)>=220){
  approachCleaning(e,sim.player,dt,e.species.speed*.45);
  e.activity='approaching-cleaner';e.behavior='Coming to you for cleaning';
 }else{e.activity='cleaning';e.behavior='Being helped by you';}
 return true;
}
// Arrival is speed-limited. The three inspection areas only advance while the
// mouth/claws have reached the live client, never from elapsed approach time.
export function tickPlayerService(sim,dt){
 const p=sim.player,s=p.service;if(!s)return false;const c=serviceClient(sim);
 if(!c||c.health<=0||p.health<=0||p.species.ability!=='clean'||c.stun>0||c.hidden||!c.species.parasites||c.feeding||c.target&&sim.section.entities.some(e=>e.id===c.target&&e.species.ability==='clean')){cancelPlayerService(sim);return false;}
 c.cleanTime=s.elapsed;const contact=cleanerInspection(p,c);
 approachCleaning(p,contact,dt,p.species.speed);p.behavior='Approaching a cleaning client';
 if(distance(p,contact)>7)return true;
 p.facing=contact.facing;p.angle=p.facing<0?Math.PI:0;p.behavior='Cleaning '+c.species.name;
 const step=Math.min(dt,3-s.elapsed),removed=Math.min(parasiteDamage(c),s.total-s.removed,s.total*step/3);
 c.health=Math.min(100,c.health+removed);s.removed+=removed;s.elapsed+=step;c.cleanTime=s.elapsed;
 p.actionTime=.12+.12*Math.sin(s.elapsed*Math.PI*6);const gain=Math.min(100-p.energy,removed*.65);p.energy+=gain;
 sim.careProgress.nourishment=(sim.careProgress.nourishment||0)+gain;if(sim.careProgress.nourishment>=10)sim.careProgress.fed=true;
 if(s.elapsed>=3-1e-8||s.removed>=s.total-1e-8){
  const helped=s.removed;cancelPlayerService(sim);c.rest=Math.max(c.rest||0,8);c.behavior='Resting after your help';
  const a=sim.adventure;a.clients??=[];if(helped>=1&&!a.clients.includes(c.species.id))a.clients.push(c.species.id);
  if(helped>=10)sim.event('progress','',{kind:'activity',value:'helper'});
  sim.event('clean','Helped '+c.species.name+' · '+Math.round(helped)+' parasite damage removed.');
 }
 return true;
}
