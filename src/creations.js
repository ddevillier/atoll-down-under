import {APPEARANCE_DEFAULTS,appearance} from './creation-appearance.js';
// Creation identity is independent of scientific species and of a mutable editor draft.
import {edible} from './diet.js';
import {createSpecies,BY_ID,ABILITIES} from './data.js';
export const BODY_FORMS={rounded:'s5',slender:'s42',sturdy:'s16'};
export const DEFAULT_BLUEPRINT={name:'Lagoon wanderer',size:75,speed:140,endurance:150,agility:150,ability:'none',active:'day',diet:'grazer',color:'#60bba5',body:'rounded',...APPEARANCE_DEFAULTS};
export function blueprint(config={}){
 const c={...DEFAULT_BLUEPRINT,...structuredClone(config),...appearance(config)};
 if(!config.body)c.body=c.agility>=c.speed&&c.agility>=c.endurance?'rounded':c.speed>=c.endurance?'slender':'sturdy';
 const ranges={size:[30,180],speed:[70,220],endurance:[50,250],agility:[50,250]};
 for(const [k,[min,max]]of Object.entries(ranges))if(!Number.isFinite(c[k])||c[k]<min||c[k]>max)throw new Error('This creation has an invalid '+k+'.');
 if(!Object.hasOwn(BODY_FORMS,c.body)||!['grazer','hunter','omnivore'].includes(c.diet)||!['day','night'].includes(c.active)||!Object.hasOwn(ABILITIES,c.ability)||c.ability==='clean'||!/^#[0-9a-f]{6}$/i.test(c.color))throw new Error('This creation has invalid traits.');
 c.name=String(c.name).trim().slice(0,36)||'Lagoon wanderer';
 return Object.fromEntries(Object.keys(DEFAULT_BLUEPRINT).map(k=>[k,c[k]]));
}
export const newCreation=(config,parentId=null,id=globalThis.crypto.randomUUID())=>({version:1,id,parentId,revision:1,blueprint:blueprint(config),memories:[],life:1,home:null,departed:false,meal:false});
export function legacyCreation(config,species,seed){
 const c=blueprint({...config,name:species.name,color:species.color||config?.color||DEFAULT_BLUEPRINT.color,size:species.size,speed:species.speed,agility:species.agility*45,endurance:species.endurance||config?.endurance||150,ability:species.ability,active:species.active,diet:species.diet.includes('grass')?'grazer':species.diet.includes('fish')?'hunter':'omnivore',body:Object.keys(BODY_FORMS).find(k=>BY_ID[BODY_FORMS[k]].index===species.index)||'rounded'});
 let hash=2166136261;for(const ch of JSON.stringify([seed,c]))hash=Math.imul(hash^ch.charCodeAt(0),16777619)>>>0;
 return newCreation(c,null,'legacy-'+seed+'-'+hash.toString(16));
}
export function validateCreation(value){
 if(!value||value.version!==1||typeof value.id!=='string'||!/^[\w-]{1,100}$/.test(value.id)||value.parentId!==null&&(typeof value.parentId!=='string'||!/^[\w-]{1,100}$/.test(value.parentId))||!Number.isInteger(value.revision)||value.revision<1||!Number.isInteger(value.life)||value.life<1)throw new Error('This creation record is damaged.');
 const c={...structuredClone(value),blueprint:blueprint(value.blueprint)};
 if(!Array.isArray(c.memories)||c.memories.length>32||c.memories.some(m=>!['meal','refuge','return','care'].includes(m)))throw new Error('This creation memory is damaged.');
 if(c.home!==null&&(!c.home||!Number.isInteger(c.home.reef)||c.home.reef<0||c.home.reef>8||!Number.isInteger(c.home.index)||c.home.index<0||c.home.index>20))throw new Error('This creation refuge is damaged.');
 if(typeof c.departed!=='boolean'||typeof c.meal!=='boolean')throw new Error('This creation activity is damaged.');
 return c;
}
export function remember(c,m){if(c&&!c.memories.includes(m)&&c.memories.length<32)c.memories.push(m);}
export function abilityIssue(config){
 const s=createSpecies(config);
 if(s.ability==='mimic'&&!s.diet.includes('fish'))return 'Imitating a cleaner needs a hunter diet: this fish eats small bites from other fish.';
 if(s.ability==='lure'&&!Object.values(BY_ID).some(p=>edible({species:s},{species:p})))return 'Lure needs suitable animal prey. Choose a hunter diet and a larger body, or another ability.';
 return '';
}
export const refugeRole=c=>!!c&&c.blueprint.diet==='grazer'&&c.blueprint.size<125;

let database;
function db(){return database??=new Promise((resolve,reject)=>{
 let blocked=false;
 const r=indexedDB.open('atoll-creations',1);r.onupgradeneeded=()=>r.result.createObjectStore('fish',{keyPath:'id'});r.onsuccess=()=>{
  const connection=r.result;
  if(blocked){connection.close();return;}
  const opened=database;
  const clear=()=>{if(database===opened)database=null;};
  connection.onclose=clear;
  connection.onversionchange=()=>{clear();connection.close();};
  resolve(connection);
 };r.onerror=()=>{database=null;reject(r.error);};r.onblocked=()=>{blocked=true;database=null;reject(new Error('Close another Atoll window to save creations.'));};
}).catch(err=>{database=null;throw err;});}
async function transaction(mode,action){const d=await db();return new Promise((resolve,reject)=>{const t=d.transaction('fish',mode),r=action(t.objectStore('fish'));let result;r.onsuccess=()=>{result=r.result;};t.oncomplete=()=>resolve(result);t.onerror=t.onabort=()=>reject(t.error||new Error('Creation storage unavailable.'));});}
export const listCreations=()=>transaction('readonly',s=>s.getAll());
export const getCreation=id=>transaction('readonly',s=>s.get(id));
export function storeCreation(sim){
 if(sim.trial)throw new Error('Test swims cannot be saved as creations.');
 const c=validateCreation(sim.creation),state=JSON.parse(sim.serialize());
 return transaction('readwrite',s=>s.put({id:c.id,creation:c,state,savedAt:Date.now()}));
}
// JSON object property order is not part of a portable save's identity.
function sameState(a,b){
 if(a===b)return true;
 if(!a||!b||typeof a!=='object'||typeof b!=='object'||Array.isArray(a)!==Array.isArray(b))return false;
 const keys=Object.keys(a);
 return keys.length===Object.keys(b).length&&keys.every(k=>Object.hasOwn(b,k)&&sameState(a[k],b[k]));
}
export async function resolveImportedCreation(sim){
 if(!sim.creation)return sim;
 const existing=await getCreation(sim.creation.id);
 if(existing&&!sameState(existing.state,JSON.parse(sim.serialize()))){
  const previous=sim.creation.id;sim.creation.id=globalThis.crypto.randomUUID();sim.creation.parentId=previous;
 }
 return sim;
}
