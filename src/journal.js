import {DISCOVERIES} from './adventures.js';
import {PRACTICE_SPECIES} from './data.js';
import {validMemory} from './reef-memories.js';
const speciesIds=new Set(PRACTICE_SPECIES.map(s=>s.id));
export const BADGES=[
 ['helper','A Helping Fin','Remove 10 parasite damage while helping another fish.'],
 ['meal','First Good Meal','Restore 10 energy with one suitable meal.'],
 ['clean','Fresh Again','Remove 10 parasite damage in a completed cleaner visit.'],
 ['shelter','Safe Harbour','Stay hidden in a suitable shelter for five seconds.'],
 ['care1','Well Cared For','Earn a species care stamp.'],
 ['care3','Care Keeper','Care stamps for three species.','cuttlefish'],
 ['play3','New Perspective','Play three species for at least a minute each.','ray'],
 ['play10','Many Lives','Play ten species for at least a minute each.','school'],
 ['visit3','Local Explorer','Visit three habitats.','seahorse'],
 ['visit9','Around the Atoll','Visit all nine habitats.'],
 ['discovery1','A New Discovery','Discover one way of living on the reef.'],
 ['discovery5','Reef Observer','Discover five different ways of living.'],
 ['discovery15','Curious Explorer','Discover fifteen different ways of living.'],
 ['night','Night Owl','Take a needed meal at night.',null,true],
 ['neighbor','Good Neighbours','Inspect a fish while it receives cleaning.',null,true],
 ['school','School Guest','Spend ten seconds beside three schooling companions.',null,true]
].map(([id,name,description,reward,secret])=>({id,name,description,reward,secret:!!secret}));
export const freshJournal=()=>({version:1,played:[],cared:[],habitats:[],activities:[],discoveries:[],memories:[],earned:{}});
const activityIds=new Set(['helper','meal','clean','shelter','night','neighbor','school']);
export function validateJournal(value){
 const fail=()=>{throw new Error('This is not a valid Atoll family journal.');};
 if(!value||value.version!==1||!value.earned||typeof value.earned!=='object'||Array.isArray(value.earned))fail();
 const result=freshJournal();
 for(const key of ['played','cared','habitats','activities']){
  const list=value[key];if(!Array.isArray(list)||list.length>100)fail();
  if(list.some(id=>key==='habitats'?(!Number.isInteger(id)||id<0||id>8):key==='activities'?!activityIds.has(id):!speciesIds.has(id)))fail();
  result[key]=[...new Set(list)];
 }
 for(const [id,date]of Object.entries(value.earned)){
  if(!BADGES.some(b=>b.id===id)||typeof date!=='string'||!Number.isFinite(Date.parse(date)))fail();
  result.earned[id]=date;
 }
 const found=value.discoveries??[];if(!Array.isArray(found)||found.length>DISCOVERIES.length||found.some(id=>!DISCOVERIES.includes(id)))fail();result.discoveries=[...new Set(found)];
 const memories=value.memories??[];if(!Array.isArray(memories)||memories.length>64||!memories.every(validMemory)||new Set(memories.map(m=>m.id)).size!==memories.length)fail();result.memories=structuredClone(memories);
 return result;
}
export function recordJournalMemory(j,m,now=new Date().toISOString()){
 if(!validMemory(m)||!Number.isFinite(Date.parse(now)))return false;
 j.memories??=[];if(j.memories.some(e=>e.id===m.id))return false;
 j.memories.push({...structuredClone(m),recordedAt:now});j.memories=j.memories.slice(-64);return true;
}
export function badgeProgress(j,badge){
 const b=typeof badge==='string'?BADGES.find(b=>b.id===badge):badge;
 if(!b||!BADGES.some(entry=>entry.id===b.id))return null;
 const id=b.id;
 const [key,target]=id.startsWith('care')?['cared',Number(id.slice(4))]:id.startsWith('play')?['played',Number(id.slice(4))]:id.startsWith('visit')?['habitats',Number(id.slice(5))]:id.startsWith('discovery')?['discoveries',Number(id.slice(9))]:['activities',1];
 const count=key==='activities'?(j.activities.includes(id)?1:0):new Set(j[key]||[]).size;
 return {current:Math.min(count,target),target,complete:!!j.earned[id],eligible:count>=target};
}
function eligible(j,b){return badgeProgress(j,b).eligible;}
// An old journal may already contain discoveries earned before these badges
// existed. Reconcile deliberately on load/persist; validation itself stays pure.
export function reconcileJournal(j,now=new Date().toISOString()){
 if(typeof now!=='string'||!Number.isFinite(Date.parse(now)))return [];
 const newly=[];for(const badge of BADGES)if(!j.earned[badge.id]&&eligible(j,badge)){j.earned[badge.id]=now;newly.push(badge);}
 return newly;
}
export function recordProgress(j,kind,value,now=new Date().toISOString()){
 if(!['discovery','played','cared','habitat','activity'].includes(kind)||typeof now!=='string'||!Number.isFinite(Date.parse(now)))return [];
 if(kind==='discovery'){
  if(!DISCOVERIES.includes(value))return [];
  j.discoveries??=[];if(!j.discoveries.includes(value))j.discoveries.push(value);
  return reconcileJournal(j,now);
 }
 let key=kind==='played'?'played':kind==='cared'?'cared':kind==='habitat'?'habitats':'activities';
 const valid=key==='habitats'?Number.isInteger(value)&&value>=0&&value<9:key==='activities'?activityIds.has(value):speciesIds.has(value);
 if(!valid)return [];
 if(!j[key].includes(value))j[key].push(value);
 return reconcileJournal(j,now);
}
export function mergeJournals(a,b){
 const result=validateJournal(a),incoming=validateJournal(b);
 for(const key of ['played','cared','habitats','activities','discoveries'])result[key]=[...new Set([...result[key],...incoming[key]])];
 result.memories=[...new Map([...incoming.memories,...result.memories].map(m=>[m.id,m])).values()].sort((a,b)=>(Date.parse(a.recordedAt)||0)-(Date.parse(b.recordedAt)||0)||a.id.localeCompare(b.id)).slice(-64);
 for(const [id,date]of Object.entries(incoming.earned))if(!result.earned[id]||Date.parse(date)<Date.parse(result.earned[id]))result.earned[id]=date;
 reconcileJournal(result);
 return result;
}
export function persistJournal(j,storage){
 const raw=storage.getItem('atoll-journal');let stored=null;
 // A damaged old snapshot must not prevent backing up new valid progress.
 if(raw)try{stored=validateJournal(JSON.parse(raw));}catch{}
 const merged=stored?mergeJournals(j,stored):validateJournal(j);
 reconcileJournal(merged);
 storage.setItem('atoll-journal',JSON.stringify(merged));
 return merged;
}
export function journalRewards(j){return BADGES.filter(b=>b.reward&&j.earned[b.id]).map(b=>b.reward);}
export const freshCare=()=>({nourishment:0,played:0,healthy:0,shelter:0,school:0,fed:false,playedDone:false,careDone:false,shelterDone:false,schoolDone:false});
export function validCare(c){return !!c&&(c.nourishment===undefined||(Number.isFinite(c.nourishment)&&c.nourishment>=0))&&['played','healthy','shelter','school'].every(k=>Number.isFinite(c[k])&&c[k]>=0)&&['fed','playedDone','careDone','shelterDone','schoolDone'].every(k=>typeof c[k]==='boolean');}
export function tickCare(sim,dt,sheltered){
 const p=sim.player,c=sim.careProgress||(sim.careProgress=freshCare());
 const emit=(kind,value)=>sim.event('progress','',{kind,value});
 c.played+=dt;
 if(c.played>=60&&!c.playedDone){c.playedDone=true;emit('played',p.species.id);}
 c.healthy=c.fed&&p.energy>=70&&p.health>=80?c.healthy+dt:0;
 if(c.healthy>=30&&!c.careDone){c.careDone=true;emit('cared',p.species.id);}
 c.shelter=sheltered&&p.hidden?c.shelter+dt:0;
 if(c.shelter>=5&&!c.shelterDone){c.shelterDone=true;emit('activity','shelter');}
 const neighbors=sim.section.entities.filter(e=>e.alive&&e.species.id===p.species.id&&e.activity==='schooling'&&Math.hypot(e.x-p.x,e.y-p.y)<180);
 c.school=neighbors.length>=3?c.school+dt:0;
 if(c.school>=10&&!c.schoolDone){c.schoolDone=true;emit('activity','school');}
}
export function careHint(p,previous=''){
 const parasites=Math.max(0,100-p.health-(p.biteDamage||0)-(p.poisonDamage||0));
 if(p.species?.ability==='clean'&&p.energy<(previous==='food'?70:60))return {kind:'food',text:'Helping fish nourishes you · Click a client or press E'};
 if(p.energy<(previous==='food'?70:60))return {kind:'food',text:'A meal would help · Check your diet or press H for food hints'};
 if(parasites>=(previous==='clean'?3:10))return {kind:'clean',text:'Time for a cleaner · Click the partner or press C'};
 if((p.biteDamage||p.poisonDamage)&&p.energy>=50)return {kind:'rest',text:'Fed and recovering · Food and time help with injury and poison'};
 return {kind:'well',text:'Comfortably fed and healthy'};
}
