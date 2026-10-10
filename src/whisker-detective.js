import {mouthPoint,contactGap,approachMeal} from './feeding-contact.js';
import {startSandProbe,witnessSandMeal} from './sand-search.js';
import {mealContact,cancelPreparation} from './feeding-motion.js';
import {animalProfile} from './animal-profiles.js';
import {disturbPatch} from './grazing-activity.js';
import {schoolMeal,startNpcSchoolWave} from './school-activity.js';
import {companionMeal} from './companion-activity.js';
import {enterReefLife} from './risk-cues.js';
import {detectiveBuriedCandidates} from './detective-substrate.js';
import {parasiteDamage} from './player-cleaner.js';

const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const finite=(n,lo,hi)=>Number.isFinite(n)&&n>=lo&&n<=hi;
const validId=id=>typeof id==='string'&&id.length>0&&id.length<100||Number.isInteger(id)&&id>=0;
const state=sim=>sim.reefStories?.detective;
const active=sim=>['detective','whisker-detective'].includes(sim.reefStories?.active)&&sim.player?.species.id==='s9';
const foodFor=(sim,s,patch)=>sim.sections[s.reef]?.food.find(f=>f.id===patch?.id);
const patchFor=(s,food)=>s.patches.find(p=>p.id===food?.id);
// Leaving food is an explicit snack invitation, including during digestion.
// Preserve care, threats and other meals; only this meal's anticipation belongs here.
const eligible=(e,food)=>e?.alive&&e.health>0&&!e.hidden&&!(e.stun>0)&&!e.groundRoute&&!e.holdfast&&e.species.speed>0&&(!e.feeding||!e.feeding.committed&&e.feeding.target===food.id)&&!e.cleanTime&&!e.cleanerTarget&&parasiteDamage(e)<=35&&e.activity!=='avoiding'&&!e.behavior?.startsWith('Moving away')&&e.species.ability!=='clean'&&['probe-sand','sand','pick','bottom-forage'].includes(animalProfile(e.species).routine)&&e.species.diet.includes(food.food);

export function validStory(s){
 if(s==null)return true;
 return typeof s==='object'&&!Array.isArray(s)&&[6,7].includes(s.reef)&&Array.isArray(s.patches)&&s.patches.length>=1&&s.patches.length<=2&&new Set(s.patches.map(p=>p?.id)).size===s.patches.length&&s.patches.every(p=>p&&validId(p.id)&&finite(p.x,1,1599)&&finite(p.y,1,739)&&typeof p.found==='boolean'&&[null,'ate','leave'].includes(p.choice)&&(!p.choice||p.found)&&finite(p.amount,0,100))&&Number.isInteger(s.current)&&s.current>=0&&s.current<s.patches.length&&['search','choice','watch','complete'].includes(s.stage)&&finite(s.cue,0,1)&&finite(s.reveal,0,1.5)&&finite(s.reaction,0,1.2)&&finite(s.shareReveal,0,1.4)&&(s.probe===null||s.patches.some(p=>p.id===s.probe&&!p.found))&&(s.neighbor===null||typeof s.neighbor==='object'&&!Array.isArray(s.neighbor)&&validId(s.neighbor.id)&&Number.isInteger(s.neighbor.incarnation)&&s.neighbor.incarnation>=0)&&typeof s.witnessed==='boolean'&&typeof s.complete==='boolean'&&(!s.complete||s.witnessed&&s.stage==='complete')&&(s.stage!=='complete'||s.complete)&&(['search'].includes(s.stage)||s.patches[s.current].found)&&(s.stage!=='watch'||s.patches[s.current].choice==='leave');
}

export function initStory(sim){
 if(sim.player?.species.id!=='s9')return false;
 if(state(sim))return validStory(state(sim));
 if(![6,7].includes(sim.current))return false;
 const pool=detectiveBuriedCandidates(sim.section,sim.current);
 const patches=[];
 while(pool.length&&patches.length<2){
  const supported=pool.filter(f=>sim.section.entities.some(e=>e.alive&&e.species.ability!=='clean'&&['probe-sand','sand','pick','bottom-forage'].includes(animalProfile(e.species).routine)&&e.species.diet.includes(f.food)&&distance(e,f)<240));
  const choices=supported.length?supported:pool,f=choices[Math.floor(sim.random()*choices.length)];pool.splice(pool.indexOf(f),1);patches.push({id:f.id,x:f.x,y:f.y,found:false,choice:null,amount:f.amount});}
 if(!patches.length){sim.event('message','No unsearched sand meals here yet. Try the other sandy habitat.');return false;}
 sim.reefStories.detective={reef:sim.current,patches,stage:'search',current:0,cue:0,reveal:0,reaction:0,shareReveal:0,probe:null,neighbor:null,witnessed:false,complete:false};
 for(const patch of patches){const f=foodFor(sim,state(sim),patch);if(sim.player.target===f.id)sim.player.target=null;for(const e of sim.section.entities)if(e.target===f.id){e.target=null;cancelPreparation(e);}}
 sim.event('activity-step','Whisker Detective · Explore the sand; your barbels sense only nearby meals.');
 return true;
}

// These meals have no public marker, food painting, pick target or NPC scent
// until the player's local contact probe has uncovered them.
export function storyFoodHidden(sim,food){const s=state(sim);return !!(active(sim)&&s&&sim.current===s.reef&&patchFor(s,food)&&!patchFor(s,food).found);}
// Hold the discovered meal for the player's explicit choice. Ordinary NPC
// scent selection must respect this reservation as well as buried visibility.
export function storyFoodReserved(sim,food,actor){const s=state(sim);if(!active(sim)||!s||s.complete||sim.current!==s.reef||actor===sim.player||actor?.id===sim.player?.id||!patchFor(s,food))return false;return s.stage!=='watch'||s.patches[s.current].id!==food.id||s.neighbor?.id!==actor?.id||(actor?.incarnation||0)!==s.neighbor?.incarnation;}
export function storyCue(sim){
 const p=sim.player,s=state(sim),mouth=p?mouthPoint(p):{x:0,y:0},empty={strength:0,x:mouth.x,y:mouth.y,dx:0,dy:0,contact:false,probing:false,found:null,neighbor:null,reaction:s?.reaction||0,shareReveal:s?.shareReveal||0};
 if(!active(sim)||!s||s.complete||sim.current!==s.reef||p.stun>0||p.health<=0)return empty;
 const patch=s.patches.filter(patch=>!patch.found&&foodFor(sim,s,patch)?.regrow<=0).sort((a,b)=>distance(a,mouth)-distance(b,mouth))[0];
 const d=patch?distance(patch,mouth):Infinity,strength=Math.max(0,1-d/210),current=s.patches[s.current];
 return {...empty,strength,dx:strength?(patch.x-mouth.x)/Math.max(1,d):0,dy:strength?(patch.y-mouth.y)/Math.max(1,d):0,contact:!!(strength&&contactGap(p,foodFor(sim,s,patch))<=65),probing:!!p.sandProbe&&s.probe===p.sandProbe.food,found:s.reveal>0&&current.found?{x:current.x,y:current.y}:null,neighbor:s.neighbor?.id??null};
}

function finish(sim,s){if(s.complete)return;s.complete=true;s.stage='complete';s.witnessed=true;s.cue=0;s.shareReveal=1.4;sim.event('discovery','Whisker Detective · Your hidden discovery fed a reef neighbor.',{value:'whisker-detective'});}
function assignNeighbor(sim,s,food){
 const old=sim.section.entities.find(e=>e.id===s.neighbor?.id&&(e.incarnation||0)===s.neighbor.incarnation);
 if(old&&eligible(old,food)&&(old.target===food.id||!old.target))return old;
 s.neighbor=null;
 // Leaving a found meal invites an available compatible forager in this visible
 // reef. It still swims from its real position and keeps every priority guard.
 const e=sim.section.entities.filter(e=>eligible(e,food)&&(!e.target||e.target===food.id)).sort((a,b)=>distance(a,food)-distance(b,food))[0];
 if(e){s.reaction=1.2;s.neighbor={id:e.id,incarnation:e.incarnation||0};e.target=food.id;e.pursuit=0;e.think=0;}
 return e||null;
}
export function tickStory(sim,dt){
 const s=state(sim);if(!active(sim)||!s||sim.paused||sim.phase!=='playing')return false;
 const elapsed=Math.min(.05,Math.max(0,dt));s.reaction=Math.max(0,s.reaction-elapsed);s.shareReveal=Math.max(0,s.shareReveal-elapsed);s.reveal=Math.max(0,s.reveal-elapsed);if(s.complete)return true;s.cue=storyCue(sim).strength;
 if(sim.current!==s.reef){s.cue=0;s.probe=null;return true;}
 if(s.probe){const patch=s.patches.find(p=>p.id===s.probe),food=foodFor(sim,s,patch);
  if(food?.uncovered>0&&food.sandSource===sim.player.id&&!sim.player.sandProbe){patch.found=true;patch.amount=food.amount;s.current=s.patches.indexOf(patch);s.stage='choice';s.reveal=1.5;s.probe=null;sim.event('activity-step','A buried meal uncovered · Eat it, or leave it for a reef neighbor.');}
  else if(!sim.player.sandProbe)s.probe=null;
 }
 if(s.stage==='watch'){const food=foodFor(sim,s,s.patches[s.current]);if(!food||food.regrow>0){s.stage='choice';s.neighbor=null;return true;}food.uncovered=Math.max(food.uncovered||0,.5);assignNeighbor(sim,s,food);}
 return true;
}
export function storyAction(sim,action,value){
 const s=state(sim),p=sim.player;if(!active(sim)||!s||sim.paused||sim.phase!=='playing')return false;
 if(sim.current!==s.reef){sim.event('message','Return to your search in '+(s.reef===7?'Pearl Sands':'Seagrass Meadow')+'.');return true;}
 if(action==='context'||action==='sweep'){
  if(p.sandProbe){p.sandProbe=null;s.probe=null;sim.pointer={x:p.x,y:p.y};return true;}
  if(s.stage!=='search')return storyAction(sim,s.stage==='choice'?'leave':'watch');
  const patch=s.patches.filter(q=>!q.found&&foodFor(sim,s,q)?.regrow<=0).sort((a,b)=>contactGap(p,foodFor(sim,s,a))-contactGap(p,foodFor(sim,s,b)))[0];
  if(!patch||contactGap(p,foodFor(sim,s,patch))>65){sim.event('message','Sweep closer to the sand. Follow the stronger local barbel signal.');return true;}
  p.cleanerTarget=null;p.cleanTime=0;enterReefLife(sim,'activity');s.current=s.patches.indexOf(patch);s.probe=patch.id;startSandProbe(sim,foodFor(sim,s,patch));return true;
 }
 const patch=s.patches[s.current],food=foodFor(sim,s,patch);
 if(action==='eat'&&s.stage==='choice'&&food&&food.regrow<=0){p.sandProbe=null;p.target=food.id;p.hidden=false;enterReefLife(sim,'meal');return true;}
 if(action==='leave'&&s.stage==='choice'&&food&&food.regrow<=0){patch.choice='leave';patch.amount=food.amount;s.stage='watch';p.target=null;p.feeding=null;sim.pointer={x:p.x,y:p.y};assignNeighbor(sim,s,food);sim.event('activity-step','Meal left in the sand · Invite an available reef forager, then stay to watch its bite.');return true;}
 if(action==='search'&&s.patches.some(q=>!q.found)){s.stage='search';s.neighbor=null;p.target=null;sim.pointer={x:p.x,y:p.y};return true;}
 if(action==='watch'&&s.stage==='watch'){sim.event('message',storyView(sim).detail);return true;}
 return false;
}
export function storyMeal(sim,food){const s=state(sim);if(!active(sim)||!s||s.complete||sim.current!==s.reef)return false;const patch=patchFor(s,food);if(!patch?.found||food.sandSource!==sim.player.id)return false;patch.choice='ate';s.stage='choice';s.neighbor=null;sim.event('activity-step','You ate your discovery. Search again, or leave the remaining meal for a neighbor.');return true;}

// Called after normal danger, cleaning and resident priorities. A selected
// neighbor swims from its real position and uses the same anatomical bite gate.
export function storyNPC(sim,e,dt){
 const s=state(sim);if(!active(sim)||!s||s.complete||s.stage!=='watch'||sim.current!==s.reef||e.id!==s.neighbor?.id||(e.incarnation||0)!==s.neighbor.incarnation)return false;
 const food=foodFor(sim,s,s.patches[s.current]);
 if(!food||food.regrow>0||!eligible(e,food)||(e.target&&e.target!==food.id)){s.neighbor=null;return false;}
 // This branch owns physiology while ordinary NPC stepping is bypassed.
 e.satiated=Math.max(0,(e.satiated||0)-dt);e.rest=Math.max(0,(e.rest||0)-dt);
 if(e.species.parasites)e.health=Math.max(0,e.health-dt*.045);
 e.target=food.id;e.activity='feeding';e.behavior='Approaching the meal you uncovered';
 const contact=approachMeal(e,food,dt,e.species.speed*.55);
 if(!contact.ready){cancelPreparation(e);return true;}
 if(e.biteCooldown>0||!mealContact(e,food,dt,contact.contact))return true;
 schoolMeal(sim,e,food);witnessSandMeal(sim,e,food);companionMeal(sim,e,food);disturbPatch(food);
 food.amount-=12;if(food.amount<=0){food.regrow=8;food.amount=100;}startNpcSchoolWave(sim,e,food);
 e.target=null;e.pursuit=0;e.satiated=Math.max(e.satiated||0,45);e.biteCooldown=2;e.actionTime=.65;e.behavior='Digesting the meal you uncovered';
 if(distance(sim.player,food)<260&&distance(sim.player,e)<300){finish(sim,s);}else{s.stage='choice';s.neighbor=null;sim.event('message','The neighbor ate while you were away. Leave another bite and watch nearby.');}
 return true;
}
export function storyView(sim){
 const s=state(sim);if(!s)return null;
 if(s.complete)return {step:'A discovery shared',detail:'You followed a local barbel signal, uncovered real food, and watched a reef neighbor eat.',actions:[],complete:true};
 if(sim.current!==s.reef)return {step:'Return to your sand search',detail:'Your buried discoveries remain in '+(s.reef===7?'Pearl Sands':'Seagrass Meadow')+'.',actions:[],complete:false};
 if(s.stage==='search'){const cue=storyCue(sim);return {step:cue.probing?'Probing beneath your barbels':cue.contact?'Sweep the sand with E':cue.strength>.65?'A strong trace nearby':cue.strength>.15?'Your barbels feel a trace':'Explore the sand',detail:cue.probing?'Your barbels are probing at mouth contact. Hold close; steering interrupts.':cue.contact?'A strong taste beneath your barbels. Press E to sweep this small patch.':cue.strength>.65?'A strong taste nearby. Swim a little closer to the sand.':cue.strength>0?'A faint taste nearby. Explore slowly as it grows stronger.':'No nearby taste yet. Explore the sand; your whiskers sense only close meals.',actions:[{id:'context',label:cue.probing?'Stop probing':'Sweep with barbels'}],complete:false};}
 if(s.stage==='choice')return {step:'A meal beneath the sand',detail:'Your probe exposed a real meal. Take a bite, or leave it to invite an available reef forager.',actions:[{id:'eat',label:'Eat the discovered meal'},{id:'leave',label:'Leave it for a neighbor'},...(s.patches.some(p=>!p.found)?[{id:'search',label:'Search another patch'}]:[])],complete:false};
 const e=sim.section.entities.find(e=>e.id===s.neighbor?.id);return {step:'Watch your neighbor feed',detail:e?e.species.name+' is approaching. Stay close and watch it reach the meal and bite.':'Nearby foragers are busy with care, danger, or another meal. Leave the snack here and watch for a visitor.',actions:[{id:'watch',label:'Watch this meal'},...(s.patches.some(p=>!p.found)?[{id:'search',label:'Search another patch'}]:[])],complete:false};
}









