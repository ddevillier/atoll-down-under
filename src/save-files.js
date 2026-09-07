import {validCare} from './journal.js';
import {Simulation} from './simulation.js';
import {BY_ID,FOODS,ABILITIES} from './data.js';
import {validGroundState} from './ground-motion.js';
import {validFeeding} from './feeding-motion.js';
import {validResidentMeal} from './resident-life.js';
import {validHome} from './refuge-motion.js';

export const MAX_SAVE_BYTES=8*1024*1024;
const own=(o,k)=>Object.hasOwn(o,k);
const object=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const stateKeys=['version','seed','time','uid','mode','phase','score','stage','stageScore','sequence','sections','player','protected','period','current','pointer','custom','visited','destination','difficulty','observations','careProgress','adventure'];
const fail=()=>{throw new Error('This dive file is damaged or incompatible. Choose another file.');};
export const diveName=value=>String(value??'').trim().slice(0,60)||'My reef dive';
export function diveFilename(name){
 const stem=diveName(name).replace(/[<>:"/\\|?*\u0000-\u001f]/g,'-').replace(/[. ]+$/g,'')||'My reef dive';
 return (/^(con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(stem)?'Dive '+stem:stem)+'.atoll';
}
export function exportDive(sim,name){
 return JSON.stringify({format:'atoll-dive',version:1,name:diveName(name),savedAt:new Date().toISOString(),state:JSON.parse(sim.serialize())});
}

// File input is untrusted. Check the complete saved world before restore can
// install it; never copy arbitrary root properties onto a Simulation instance.
function safeTree(value,depth=0){
 if(depth>20)fail();
 if(typeof value==='number'&&!finite(value))fail();
 if(value&&typeof value==='object')for(const [key,child] of Object.entries(value)){
  if(['__proto__','prototype','constructor'].includes(key))fail();
  safeTree(child,depth+1);
 }
}
function numbers(value,keys){if(!object(value)||keys.some(k=>!finite(value[k])))fail();}
function species(s,custom=false){
 if(!object(s)||!(own(BY_ID,s.id)||(custom&&s.id==='custom')))fail();
 if(typeof s.name!=='string'||typeof s.description!=='string'||!own(ABILITIES,s.ability))fail();
 numbers(s,['size','speed','agility','metabolism','atlas','cell']);
 if(s.size<=0||s.speed<0||s.agility<=0||s.metabolism<=0)fail();
 if(!Array.isArray(s.diet)||s.diet.some(f=>typeof f!=='string'))fail();
 if(!['day','night','both'].includes(s.active))fail();
}
function animal(e,player=false){
 numbers(e,['x','y','angle','facing','energy','health','still','cleanTime','cooldown','abilityTime','stun','life','biteCooldown','think']);
 species(e.species,player);
 if(!['string','number'].includes(typeof e.id)||typeof e.alive!=='boolean'||typeof e.behavior!=='string')fail();
 for(const key of ['station','holdfast','homeAnchor','blending'])if(e[key]!=null)numbers(e[key],['x','y']);
 if(e.blending!=null&&!['sand','reef'].includes(e.blending.kind))fail();
 for(const key of ['poisonDamage','biteDamage','recoveryDelay','blendTime','actionTime','routineClock','retract','incarnation'])if(e[key]!==undefined&&(!finite(e[key])||e[key]<0))fail();
 if(e.groundRoute!==undefined&&!validGroundState(e))fail();
 if(!validFeeding(e.feeding))fail();
 if(!validResidentMeal(e.residentMeal))fail();
 if(e.passerExposure!==undefined&&(!finite(e.passerExposure)||e.passerExposure<0||e.passerExposure>4))fail();
 if(e.ecology!=null){
  if(!validHome(e.ecology.home))fail();
  numbers(e.ecology,['reef','clock','point','wait']);
  if(!Number.isInteger(e.ecology.reef)||e.ecology.reef<0||e.ecology.reef>8||e.ecology.clock<0||!Number.isInteger(e.ecology.point)||e.ecology.point<0||e.ecology.wait<0)fail();
  for(const key of ['partner','host'])if(e.ecology[key]!=null&&!['string','number'].includes(typeof e.ecology[key]))fail();
 }
}
export function importDive(text){
 if(typeof text!=='string'||new TextEncoder().encode(text).length>MAX_SAVE_BYTES)throw new Error('This file is too large. Choose an Atoll dive file under 8 MB.');
 let file;try{file=JSON.parse(text);}catch{throw new Error('This is not a readable dive file. Choose a file exported by Atoll.');}
 if(!object(file)||file.format!=='atoll-dive'||file.version!==1)throw new Error('This is not a supported Atoll dive file. Choose a .atoll file exported by this game.');
 safeTree(file);
 const d=file.state;
 if(!object(d)||d.version!==1||Object.keys(d).some(k=>!stateKeys.includes(k)))fail();
 numbers(d,['seed','time','uid','score','stage','stageScore','current']);
 if(!['practice','challenge','tournament','create'].includes(d.mode)||!['playing','advance','dead','won'].includes(d.phase)||!['day','night'].includes(d.period)||typeof d.protected!=='boolean')fail();
 if(!Number.isInteger(d.current)||d.current<0||d.current>8||!Number.isInteger(d.stage)||d.stage<0)fail();
 if(!Array.isArray(d.sequence)||!d.sequence.length||d.sequence.length>100||d.stage>=d.sequence.length||d.sequence.some(id=>!(own(BY_ID,id)||(id==='custom'&&d.mode==='create'))))fail();
 if(d.phase==='advance'&&d.stage+1>=d.sequence.length)fail();
 numbers(d.pointer,['x','y']);animal(d.player,true);
 if(d.player.species.id==='custom'){
  if(d.mode!=='create'||!object(d.custom)||!own(ABILITIES,d.custom.ability))fail();
  numbers(d.custom,['size','speed','agility','endurance']);
 }
 if(!Array.isArray(d.sections)||d.sections.length!==9)fail();
 for(const section of d.sections){
  if(!object(section)||!Array.isArray(section.entities)||!Array.isArray(section.food)||section.entities.length>500||section.food.length>500)fail();
  if(section.residentFoodVersion!==undefined&&![1,2].includes(section.residentFoodVersion))fail();
  section.entities.forEach(e=>animal(e));
  for(const food of section.food){
   numbers(food,['x','y','size','amount','regrow','phase']);
   if(food.uncovered!==undefined&&(!finite(food.uncovered)||food.uncovered<0))fail();
   if(food.kind!=='food'||!own(FOODS,food.food)||typeof food.id!=='string')fail();
  }
 }
 if(!Array.isArray(d.visited)||d.visited.some(id=>!Number.isInteger(id)||id<0||id>8))fail();
 if(d.observations!==undefined&&(!Array.isArray(d.observations)||d.observations.some(n=>!object(n)||typeof n.name!=='string'||typeof n.relationship!=='string')))fail();
 if(d.careProgress!==undefined&&!validCare(d.careProgress))fail();
 const simulation=Simulation.restore(d);
 return {name:diveName(file.name),savedAt:typeof file.savedAt==='string'?file.savedAt:null,simulation};
}
