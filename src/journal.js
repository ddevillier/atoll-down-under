import {DISCOVERIES} from './adventures.js';
import {PLAYABLE} from './data.js';
const speciesIds=new Set(PLAYABLE.map(s=>s.id));
export const BADGES=[
 ['meal','First Good Meal','Restore 10 energy with one suitable meal.'],
 ['clean','Fresh Again','Remove 10 parasite damage in a completed cleaner visit.'],
 ['shelter','Safe Harbour','Stay hidden in a suitable shelter for five seconds.'],
 ['care1','Well Cared For','Earn a species care stamp.'],
 ['care3','Care Keeper','Care stamps for three species.','cuttlefish'],
 ['play3','New Perspective','Play three species for at least a minute each.','ray'],
 ['play10','Many Lives','Play ten species for at least a minute each.','school'],
 ['visit3','Local Explorer','Visit three habitats.','seahorse'],
 ['visit9','Around the Atoll','Visit all nine habitats.'],
 ['night','Night Owl','Take a needed meal at night.',null,true],
 ['neighbor','Good Neighbours','Inspect a fish while it receives cleaning.',null,true],
 ['school','School Guest','Spend ten seconds beside three schooling companions.',null,true]
].map(([id,name,description,reward,secret])=>({id,name,description,reward,secret:!!secret}));
export const freshJournal=()=>({version:1,played:[],cared:[],habitats:[],activities:[],discoveries:[],earned:{}});
const activityIds=new Set(['meal','clean','shelter','night','neighbor','school']);
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
 const found=value.discoveries??[];if(!Array.isArray(found)||found.some(id=>!DISCOVERIES.includes(id)))fail();result.discoveries=[...new Set(found)];
 return result;
}
function eligible(j,b){
 if(b.id.startsWith('care'))return j.cared.length>=Number(b.id.slice(4));
 if(b.id.startsWith('play'))return j.played.length>=Number(b.id.slice(4));
 if(b.id.startsWith('visit'))return j.habitats.length>=Number(b.id.slice(5));
 return j.activities.includes(b.id);
}
export function recordProgress(j,kind,value,now=new Date().toISOString()){
 if(kind==='discovery'){if(DISCOVERIES.includes(value)&&!j.discoveries.includes(value))j.discoveries.push(value);return [];}
 let key=kind==='played'?'played':kind==='cared'?'cared':kind==='habitat'?'habitats':'activities';
 const valid=key==='habitats'?Number.isInteger(value)&&value>=0&&value<9:key==='activities'?activityIds.has(value):speciesIds.has(value);
 if(!valid)return [];
 if(!j[key].includes(value))j[key].push(value);
 const newly=[];for(const badge of BADGES)if(!j.earned[badge.id]&&eligible(j,badge)){j.earned[badge.id]=now;newly.push(badge);}
 return newly;
}
export function mergeJournals(a,b){
 const result=validateJournal(a),incoming=validateJournal(b);
 for(const key of ['played','cared','habitats','activities','discoveries'])result[key]=[...new Set([...result[key],...incoming[key]])];
 for(const [id,date]of Object.entries(incoming.earned))if(!result.earned[id]||Date.parse(date)<Date.parse(result.earned[id]))result.earned[id]=date;
 for(const badge of BADGES)if(!result.earned[badge.id]&&eligible(result,badge))result.earned[badge.id]=new Date().toISOString();
 return result;
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
 if(p.energy<(previous==='food'?70:60))return {kind:'food',text:'A meal would help · Check your diet or press H for food hints'};
 if(parasites>=(previous==='clean'?3:10))return {kind:'clean',text:'Time for a cleaner · Click the partner or press C'};
 if((p.biteDamage||p.poisonDamage)&&p.energy>=50)return {kind:'rest',text:'Fed and recovering · Food and time help with injury and poison'};
 return {kind:'well',text:'Comfortably fed and healthy'};
}
