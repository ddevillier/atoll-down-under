import {REEFS} from './data.js';
import {disturbPatch} from './grazing-activity.js';
import {approachMeal} from './feeding-contact.js';
import {mealContact,cancelPreparation} from './feeding-motion.js';
import {parasiteDamage} from './player-cleaner.js';

const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const plant=f=>f?.kind==='food'&&f.food==='algae';
const state=sim=>sim.reefStories?.engineer;
const active=sim=>['engineer','sandcastle-engineer'].includes(sim.reefStories?.active)&&sim.player?.species.id==='s15';
const foods=(sim,reef)=>sim.sections?.[reef]?.food.filter(plant)||[];
const resource=(sim,patch)=>sim.sections?.[patch.reef]?.food.find(f=>f.id===patch.id&&plant(f));
const home=s=>s.patches.find(p=>p.id===s.first);
const renewed=(sim,p)=>{const f=resource(sim,p);return !!f&&f.regrow<=0&&(f.patchRest||0)===0&&f.amount>=Math.min(100,p.after+20);};
const nearby=sim=>{const s=state(sim),p=s&&home(s);return !!p&&p.reef===sim.current&&distance(sim.player,p)<220;};
const identity=n=>typeof n==='string'&&n.length>0&&n.length<100||typeof n==='number'&&Number.isFinite(n);
const number=(n,lo,hi)=>Number.isFinite(n)&&n>=lo&&n<=hi;
const object=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);

// A small, bounded record refers to the existing food resources. It does not
// regrow coral or replace the grazing module's quiet interval and renewal.
export function initStory(sim){
 if(sim.player?.species.id!=='s15')return null;
 sim.reefStories??={version:1,active:null,clinic:null,artist:null,engineer:null,detective:null,nursery:null};
 if(state(sim))return state(sim);
 const reef=[0,1].includes(sim.current)?sim.current:0;
 return sim.reefStories.engineer={version:1,reef,selected:foods(sim,reef)[0]?.id||'',first:null,patches:[],choice:'change',departed:false,visitedOther:false,returned:false,neighborMeal:false,neighbor:null,invited:false,complete:false};
}

export function storyAction(sim,action,value){
 if(!active(sim))return false;
 const s=initStory(sim);
 if(action==='engineer-reef'){
  const reef=Number(value);if(![0,1].includes(reef))return false;
  s.reef=reef;s.selected=foods(sim,reef)[0]?.id||'';sim.destination=sim.current===reef?null:reef;return true;
 }
 if(action==='engineer-patch'){
  const f=foods(sim,sim.current).find(f=>f.id===value);if(![0,1].includes(sim.current)||!f)return false;
  s.reef=sim.current;s.selected=f.id;s.choice='change';return true;
 }
 if(action==='context'&&!s.first){
  const f=foods(sim,sim.current).filter(f=>distance(sim.player,f)<130).sort((a,b)=>distance(sim.player,a)-distance(sim.player,b))[0];
  return !!f&&storyAction(sim,'engineer-patch',f.id);
 }
 if(action==='context'&&!s.returned)return storyAction(sim,'engineer-rest');
 if(action==='engineer-rest'){
  if(!s.first)return false;s.choice='rest';sim.player.target=null;cancelPreparation(sim.player);return true;
 }
 if(action==='engineer-watch'||action==='context'){
  const p=home(s);if(!p||!nearby(sim)||!s.returned||!renewed(sim,p))return false;
  // A deliberate invitation can reach a compatible browser anywhere in this
  // visible habitat, including one digesting. It still takes a real nibble.
  // Keep an existing approach so the watch button cannot steal bite ownership.
  const previous=s.neighbor&&sim.section.entities.find(e=>same(e,s.neighbor));
  const n=previous&&eligible(sim,previous,p,true)?previous:sim.section.entities.filter(e=>eligible(sim,e,p,true)&&(e.target==null||e.target===p.id)).sort((a,b)=>distance(a,p)-distance(b,p)||String(a.id).localeCompare(String(b.id)))[0];
  if(!n){sim.event('message','Nearby browsers are busy with care or another meal. Explore this patch and invite one again.');return false;}
  s.invited=true;s.neighbor={id:n.id,incarnation:n.incarnation||0,patch:p.id};return true;
 }
 return false;
}

// Called only by the successful-consumption branch, BEFORE its standard 35
// algae reduction. The story records that same bite, never a second meal.
export function storyMeal(sim,food){
 if(!active(sim)||![0,1].includes(sim.current)||!plant(food)||food.regrow>0||food.amount<=0||!foods(sim,sim.current).includes(food))return false;
 const s=initStory(sim);let p=s.patches.find(p=>p.id===food.id);
 if(!p){if(s.patches.length>=7)return false;p={id:food.id,reef:sim.current,x:food.x,y:food.y,baseline:food.amount,after:0,algae:food.amount,sand:0,deposit:0,quiet:0,meals:0};s.patches.push(p);}
 p.after=Math.max(0,food.amount-35);p.algae=p.after;p.quiet=8;p.meals=Math.min(100,p.meals+1);p.deposit=Math.min(.8,p.deposit+.35);
 if(!s.first)s.first=p.id;else if(s.first!==p.id)s.visitedOther=true;
 if(s.first===p.id&&!s.complete){s.returned=false;s.departed=false;s.neighborMeal=false;s.neighbor=null;s.invited=false;}
 s.selected=food.id;s.reef=sim.current;
 return true;
}

// Local ecology keeps changing after the optional adventure is stopped.
// This mirrors the same visible reef resources as ordinary recoverPatch;
// offscreen reefs and paused dives retain their saved clocks and deposits.
export function tickBackground(sim,dt){
 if(sim.paused||!(dt>0))return;
 const s=state(sim);if(!s)return;
 for(const p of s.patches){
  if(p.reef!==sim.current)continue;
  const f=resource(sim,p);if(!f)continue;
  p.algae=f.regrow>0?0:clamp(f.amount,0,100);p.quiet=clamp(f.patchRest||0,0,8);
  // Grain deposition is visible over a short interval. Both this interval and
  // algae renewal compress ecological time for play; coral never grows here.
  const deposited=Math.min(p.deposit,dt*.175);p.deposit=Math.max(0,p.deposit-deposited);p.sand=Math.min(4,p.sand+deposited);
 }
}

export function tickStory(sim,dt){
 if(!active(sim)||sim.paused||!(dt>0))return;
 const s=initStory(sim);tickBackground(sim,dt);
 const p=home(s);if(!p)return;
 if(sim.current!==p.reef||distance(sim.player,p)>130)s.departed=true;
 if(s.departed&&(s.visitedOther||s.choice==='rest')&&nearby(sim)&&renewed(sim,p)&&!sim.player.target&&!sim.player.feeding&&sim.player.still>.6)s.returned=true;
 if(s.returned&&s.neighborMeal&&!s.complete){s.complete=true;sim.event('discovery','Sandcastle Engineer · Your grazing left sand, the algae renewed, and a reef neighbor fed at the patch. Renewal is compressed for play; coral growth takes far longer.',{value:'sandcastle-engineer'});}
}

const eligible=(sim,e,p,invited=false)=>e!==sim.player&&e.alive&&!e.hidden&&!(e.stun>0)&&!(e.cleanTime>0)&&!e.cleanerTarget&&(!e.feeding||!e.feeding.committed&&e.feeding.target===p.id)&&!e.groundRoute&&!e.holdfast&&e.species.speed>0&&e.species.ability!=='clean'&&e.species.diet.includes('algae')&&(invited||(e.satiated||0)<=0&&(e.rest||0)<=0)&&parasiteDamage(e)<=35&&(invited||distance(e,p)<300)&&!e.behavior?.startsWith('Moving away');
const same=(e,n)=>e.id===n.id&&(e.incarnation||0)===n.incarnation;
// Runs after normal threat/cleaning priority, before ordinary food selection.
// One existing grazer approaches with the normal mouth-contact motion. Hungry
// browsers notice passively; an explicit invitation permits a small nibble
// during digestion and can pass to another safe browser after an interruption.
// No spawning, appetite reset, or timed "neighbor arrived" event is involved.
export function storyNPC(sim,e,dt){
 if(!active(sim))return false;
 const s=state(sim),p=s&&home(s);if(!p||!s.returned||s.neighborMeal||!nearby(sim)||!renewed(sim,p))return false;
 const f=resource(sim,p);if(!f)return false;
 if(s.neighbor){const n=sim.section.entities.find(e=>same(e,s.neighbor));if(!n||!eligible(sim,n,p,s.invited===true)||n.target!=null&&n.target!==f.id){s.neighbor=null;} }
 if(!s.neighbor){
  const invited=s.invited===true;
  const n=sim.section.entities.filter(n=>eligible(sim,n,p,invited)&&(n.target==null||n.target===f.id)).sort((a,b)=>distance(a,p)-distance(b,p)||String(a.id).localeCompare(String(b.id)))[0];
  if(n){s.invited=invited;s.neighbor={id:n.id,incarnation:n.incarnation||0,patch:p.id};}
 }
 if(!s.neighbor||!same(e,s.neighbor)||!eligible(sim,e,p,s.invited===true))return false;
 e.satiated=Math.max(0,(e.satiated||0)-dt);e.rest=Math.max(0,(e.rest||0)-dt);
 if(e.species.parasites)e.health=Math.max(0,e.health-dt*.045);
 e.target=f.id;e.behavior='Browsing the renewed algae patch';e.activity='feeding';
 const contact=approachMeal(e,f,dt,e.species.speed*.55);
 if(contact.ready&&(e.biteCooldown||0)<=0&&mealContact(e,f,dt,contact.contact)){
  disturbPatch(f);f.amount-=12;if(f.amount<=0){f.regrow=8;f.amount=100;}
  p.algae=f.regrow>0?0:f.amount;p.quiet=8;
  e.biteCooldown=2;e.actionTime=.65;e.target=null;e.pursuit=0;e.satiated=Math.max(e.satiated||0,45);e.behavior='Digesting a meal';s.neighborMeal=true;
 }
 return true;
}

export function storyView(sim){
 const s=state(sim);if(!s)return {step:'Choose an algae patch',detail:'Begin as a parrotfish in Sunlit Crest or Table Coral Terrace.',actions:[],complete:false};
 const p=home(s),actions=[{id:'engineer-reef',label:'Sunlit Crest',value:0},{id:'engineer-reef',label:'Table Coral Terrace',value:1}];
 if([0,1].includes(sim.current))foods(sim,sim.current).forEach((f,i)=>actions.push({id:'engineer-patch',label:'Grazing patch '+(i+1),value:f.id}));
 let step='Take an algae meal',detail='Choose a patch and click its algae. A real bite removes algae and leaves a little sand.';
 if(s.first&&!s.returned){step=s.departed&&(s.visitedOther||s.choice==='rest')?'Return to your first patch':'Give the patch a rest';detail='Move away and rest, or take a meal at a different algae patch. Return when the first patch renews. Algae renewal and sand deposition use compressed game time; coral growth is much slower.';actions.push({id:'engineer-rest',label:'Rest this patch'});if(p&&sim.current!==p.reef)detail='Return to '+REEFS[p.reef].name+' to revisit your first patch. '+detail;}
 if(s.returned&&!s.neighborMeal){step='Invite a browsing neighbor';detail='Stay near the renewed first patch and invite a compatible reef browser for a small real nibble. Browsers can accept while digesting; their appetite and care routines continue.';actions.push({id:'engineer-watch',label:'Invite a browsing neighbor'});}
 if(s.complete){step='A changed patch, shared again';detail='Your bites left sand and reduced local algae. The renewed patch fed a reef neighbor. You can continue exploring and grazing.';}
 return {step,detail,actions,complete:s.complete};
}

export function validStory(s){
 if(s==null)return true;
 if(!object(s)||!(s.invited===undefined||typeof s.invited==='boolean')||s.version!==1||![0,1].includes(s.reef)||typeof s.selected!=='string'||s.selected.length>=100||!(s.first===null||typeof s.first==='string'&&s.first.length>0&&s.first.length<100)||!['rest','change'].includes(s.choice)||!['departed','visitedOther','returned','neighborMeal','complete'].every(k=>typeof s[k]==='boolean')||!Array.isArray(s.patches)||s.patches.length>7)return false;
 if(s.patches.some(p=>!object(p)||typeof p.id!=='string'||!p.id.length||p.id.length>=100||![0,1].includes(p.reef)||!number(p.x,0,1600)||!number(p.y,0,740)||!number(p.baseline,0,100)||!number(p.after,0,100)||!number(p.algae,0,100)||!number(p.sand,0,4)||!number(p.deposit,0,.8)||!number(p.quiet,0,8)||!Number.isInteger(p.meals)||p.meals<1||p.meals>100))return false;
 if(new Set(s.patches.map(p=>p.id)).size!==s.patches.length||s.first!==null&&!home(s))return false;
 if(s.neighbor!==null&&(!object(s.neighbor)||!identity(s.neighbor.id)||!Number.isInteger(s.neighbor.incarnation)||s.neighbor.incarnation<0||s.neighbor.incarnation>1e6||s.neighbor.patch!==s.first))return false;
 return (!s.returned||s.first!==null&&s.departed&&(s.visitedOther||s.choice==='rest'))&&(!s.neighborMeal||s.returned)&&(!s.complete||s.neighborMeal);
}







