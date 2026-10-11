import * as clinic from './reef-clinic.js';
import * as artist from './disappearing-artist.js';
import * as engineer from './sandcastle-engineer.js';
import * as detective from './whisker-detective.js';
import * as nursery from './cardinalfish-nursery.js';
import * as housekeeper from './coral-housekeeper.js';
import * as lookout from './rabbitfish-lookout.js';
import * as walker from './frogfish-walk.js';
import * as nest from './gramma-nest.js';
import * as crevice from './triggerfish-crevice.js';
import * as shade from './squirrelfish-shade.js';
import * as lantern from './lantern-company.js';
import {REEF_STORIES,storyKeyFor,storyCompatible} from './reef-story-data.js';
import {REEFS,BY_ID} from './data.js';
import {cancelPlayerService} from './player-cleaner.js';
import {cancelAmbush} from './ambush-activity.js';
import {cancelWatch} from './watch-journeys.js';
import {releaseEscortFollow} from './escort-journeys.js';
import {releaseAdventureSafety} from './adventure-safety.js';
import {admissionFor as encounterAdmission,releaseAdventureReservations} from './adventure-admission.js';

const modules={clinic,artist,engineer,detective,nursery,housekeeper,lookout,walker,nest,crevice,shade,lantern};
const moduleKeys=Object.keys(modules);
export const freshStories=()=>({version:1,active:null,...Object.fromEntries(moduleKeys.map(key=>[key,null]))});
export function validStories(s){
 return s===undefined||!!s&&typeof s==='object'&&!Array.isArray(s)&&s.version===1&&
  (s.active===null||typeof s.active==='string'&&Object.hasOwn(modules,s.active))&&
  Object.keys(s).every(k=>['version','active',...moduleKeys].includes(k))&&
  Object.entries(modules).every(([key,m])=>m.validStory(s[key]??null));
}
export function activeStory(sim){const key=sim?.reefStories?.active;return sim?.mode==='practice'&&!sim.trial&&storyCompatible(sim.player?.species?.id,key)?key:null;}
const habitatFor=(sim,key=activeStory(sim))=>({clinic:sim.player?.species.id==='s45'?8:4,artist:7,engineer:0,detective:7,nursery:6,housekeeper:4,lookout:0,walker:4,nest:4,crevice:4,shade:8,lantern:8})[key];
const playing=sim=>!!sim&&sim.phase==='playing'&&!sim.paused&&sim.player?.alive!==false&&sim.player?.health>0&&sim.player?.energy>0&&!(sim.player.stun>0);

// Admission reads existing actors and resources. Resume keeps an owned meal or
// held pose; the module will suspend it when a participant becomes busy.
export function admissionFor(sim,key=storyKeyFor(sim?.player?.species?.id)){
 const reef=habitatFor(sim,key),unavailable=reason=>({available:false,reef:reef??null,reason,needsFreshDive:false});
 if(!storyCompatible(sim?.player?.species?.id,key))return unavailable('Choose a fish suited to this adventure.');
 if(sim?.mode!=='practice'||sim.trial)return unavailable('Adventures are available in a Practice dive.');
 if(sim.phase!=='playing'||sim.player?.alive===false||!(sim.player?.health>0)||!(sim.player?.energy>0))return unavailable('Begin this adventure with a living fish in an active dive.');
 const s=sim.reefStories?.[key];
 if(s!=null&&!modules[key].validStory(s))return unavailable('The saved adventure state is damaged.');
 if(s){
  if(key==='clinic'&&s.species!==sim.player.species.id||key==='lookout'&&s.buddy&&s.buddy.species!==sim.player.species.id)return unavailable('The saved adventure does not match this fish.');
  // A saved module owns recovery from missing or busy actors. Continuing never
  // re-runs the fresh admission scan or substitutes a newly initialized actor.
  return {available:true,reef:s.reef??reef,reason:'',needsFreshDive:false};
 }
 const result=encounterAdmission(sim,key);
 return {...result,reef:result.reef??s?.reef??reef};
}
const prepareStory=sim=>{
 const key=activeStory(sim);if(!key||sim.reefStories[key])return;
 modules[key].initStory(sim);
 if(!sim.reefStories[key])sim.setDestination(habitatFor(sim));
};
function releasePlayerAssists(sim){
 cancelAmbush(sim);cancelWatch(sim);releaseEscortFollow(sim);cancelPlayerService(sim);
 const p=sim.player;p.target=null;p.feeding=null;p.actionTime=0;p.cleanerTarget=null;p.cleanTime=0;p.cleaningAmount=0;
 p.sandProbe=null;p.foragingPrep=null;p.blending=null;p.blendTime=0;p.hidden=false;
 sim.pointer={x:p.x,y:p.y};
}
export function beginStory(sim,key=storyKeyFor(sim?.player?.species?.id)){
 const admission=admissionFor(sim,key);
 if(!admission.available){sim?.event?.('message',admission.reason);return false;}
 const currentKey=activeStory(sim);
 if(currentKey&&currentKey!==key)stopStory(sim);
 // Re-entering the same active checkpoint preserves its legitimate owned meal
 // or held pose. A new activation relinquishes normal exploration assists.
 if(currentKey!==key)releasePlayerAssists(sim);
 sim.reefStories??=freshStories();
 // Older valid records retain their old data and gain only absent module slots.
 for(const k of moduleKeys)sim.reefStories[k]??=null;
 sim.reefStories.active=key;sim.residentFocus=null;sim.adventure.visible=true;
 prepareStory(sim);
 const reef=sim.reefStories[key]?.reef??admission.reef;
 if(reef!=null&&reef!==sim.current)sim.setDestination(reef);
 return true;
}
export function stopStory(sim){
 const key=activeStory(sim);if(!key)return false;
 const safety=storySafety(sim);
 modules[key].stopStory?.(sim);
 cancelPlayerService(sim);sim.player.blending=null;sim.player.blendTime=0;sim.player.sandProbe=null;
 sim.player.cardinalBrooding=false;sim.player.broodPose=0;sim.player.target=null;
 sim.pointer={x:sim.player.x,y:sim.player.y};
 releaseAdventureSafety(sim,safety);
 releaseAdventureReservations(sim,key);
 sim.reefStories.active=null;
 return true;
}
export function storyAction(sim,action,value){
 const key=activeStory(sim);if(!key||!playing(sim))return false;
 if(action==='story-route'){sim.setDestination(sim.reefStories[key]?.reef??habitatFor(sim));return true;}
 prepareStory(sim);return sim.reefStories[key]?!!modules[key].storyAction(sim,action,value):false;
}
export function tickStories(sim,dt){
 if(!sim||sim.paused||sim.phase!=='playing'||!Number.isFinite(dt)||dt<=0)return;
 const key=activeStory(sim);
 if(key&&sim.player.health>0&&sim.player.energy>0){prepareStory(sim);if(sim.reefStories[key])modules[key].tickStory(sim,dt);}
 if(key!=='nursery')nursery.tickBackground(sim,dt);
 if(key!=='engineer')engineer.tickBackground(sim,dt);
}
export function storyMeal(sim,food,who=sim?.player){
 const key=activeStory(sim);
 // Older hooks describe player meals; only the lookout contract accepts NPC receipts.
 if(key&&playing(sim)&&(who===sim.player||key==='lookout'))return modules[key].storyMeal(sim,food,who);
 return false;
}
export function storyNPC(sim,e,dt){const key=activeStory(sim);return !!(key&&playing(sim)&&Number.isFinite(dt)&&dt>0&&modules[key].storyNPC(sim,e,dt));}
export function storyClick(sim,x,y){const key=activeStory(sim);return !!(key&&playing(sim)&&Number.isFinite(x)&&Number.isFinite(y)&&modules[key].storyClick?.(sim,x,y));}
export function storyPointer(sim,x,y){const key=activeStory(sim);return !!(key&&playing(sim)&&Number.isFinite(x)&&Number.isFinite(y)&&modules[key].storyPointer?.(sim,x,y));}
export function storyPlayer(sim,dt){const key=activeStory(sim);return !!(key&&playing(sim)&&Number.isFinite(dt)&&dt>0&&modules[key].storyPlayer?.(sim,dt));}
export function validStoryPlayer(sim){
 const key=activeStory(sim);if(!key)return sim?.reefStories?.active==null;
 const s=sim.reefStories[key];
 if(!modules[key].validStory(s??null))return false;
 if(key==='clinic'&&s&&s.species!==sim.player.species.id||key==='lookout'&&s?.buddy&&s.buddy.species!==sim.player.species.id)return false;
 return modules[key].validStoryPlayer?.(sim)??true;
}
const validRef=r=>!!r&&typeof r==='object'&&!Array.isArray(r)&&(typeof r.id==='string'&&r.id.length>0&&r.id.length<100||Number.isInteger(r.id)&&r.id>=0)&&Number.isInteger(r.incarnation)&&r.incarnation>=0&&!!BY_ID[r.species];
export function storySafety(sim){
 const key=activeStory(sim);if(!key||sim.phase!=='playing')return null;
 const m=modules[key],raw=(m.storySafety||m.safety)?.(sim);
 if(!raw||raw.reef!==sim.current||!Number.isFinite(raw.x)||!Number.isFinite(raw.y)||!Number.isFinite(raw.radius)||raw.radius<=0||raw.radius>480||!Array.isArray(raw.participants)||raw.participants.length>4||!raw.participants.every(validRef))return null;
 if(typeof raw.holdNeeds!=='boolean'&&!(Array.isArray(raw.holdNeeds)&&raw.holdNeeds.length<=4&&raw.holdNeeds.every(validRef)))return null;
 return {...raw,participants:raw.participants.map(({id,incarnation,species})=>({id,incarnation,species})),holdNeeds:Array.isArray(raw.holdNeeds)?raw.holdNeeds.map(({id,incarnation,species})=>({id,incarnation,species})):raw.holdNeeds};
}
export function storyView(sim){
 const key=activeStory(sim);if(!key)return null;
 const pending=!sim.reefStories[key],reef=habitatFor(sim);
 const view={...REEF_STORIES[key],key,...(pending?{step:'Visit '+REEFS[reef].name,detail:'Swim along the map route. Your adventure begins when you arrive.',actions:[{id:'story-route',label:'Show route'}],complete:false}:modules[key].storyView(sim))};
 const s=sim.reefStories[key],recruiting=key==='lookout'&&['choose','unavailable'].includes(s?.phase)||key==='lantern'&&s?.stage==='gather';
 if(recruiting){
  // A released lookout may still own a real bite. Let that original fish
  // finish instead of presenting its temporary busy state as a missing cast.
  const buddy=s.buddy&&sim.sections[s.buddy.reef]?.entities.find(e=>e.alive&&e.id===s.buddy.id&&(e.incarnation||0)===s.buddy.incarnation&&e.species.id===s.buddy.species);
  const ownedMeal=buddy&&s.partnerFood!=null&&(buddy.target===s.partnerFood||buddy.feeding?.target===s.partnerFood);
  if(ownedMeal)return {...view,detail:view.detail+' Your original companion is finishing its meal. Let it finish before starting another exchange.',needsFreshDive:false};
  const admission=encounterAdmission(sim,key);
  if(!admission.available)return {...view,detail:view.detail+' '+admission.reason,needsFreshDive:admission.needsFreshDive};
 }
 return view;
}
export function storyFoodHidden(sim,food){return activeStory(sim)==='detective'&&detective.storyFoodHidden(sim,food);}
export function storyFoodReserved(sim,food,actor){return activeStory(sim)==='detective'&&detective.storyFoodReserved(sim,food,actor);}
