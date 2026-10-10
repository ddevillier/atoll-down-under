import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {beginStory} from '../src/reef-stories.js';
import {recoverPatch} from '../src/grazing-activity.js';
import {tickFeeding} from '../src/feeding-motion.js';
import {contactGap} from '../src/feeding-contact.js';
import {initStory,tickStory,tickBackground,storyAction,storyMeal,storyNPC,storyView,validStory} from '../src/sandcastle-engineer.js';

function scene(){const s=new Simulation(42);s.start('practice','s15');s.current=0;s.section.entities=[];s.events=[];s.reefStories={version:1,active:'engineer',clinic:null,artist:null,engineer:null,detective:null,nursery:null};initStory(s);return s;}
const patches=s=>s.section.food.filter(f=>f.food==='algae');
const state=s=>s.reefStories.engineer;
// Exercise this module's pre-consumption hook once and the actual Simulation
// consumption branch once. Disable the dispatcher only to avoid duplicate hooks.
function bite(s,f){s.player.biteCooldown=0;assert.equal(storyMeal(s,f),true);s.reefStories.active=null;s.consume(f);s.reefStories.active='engineer';}
function renew(s,seconds){for(let t=0;t<seconds;t+=.05){for(const f of s.section.food){f.regrow=Math.max(0,f.regrow-.05);recoverPatch(f,.05);}tickStory(s,.05);}}
function leave(s,f){Object.assign(s.player,{x:f.x+180,y:f.y,still:0});tickStory(s,.05);}
function returnTo(s,f){Object.assign(s.player,{x:f.x+70,y:f.y,still:1,target:null,feeding:null});tickStory(s,.05);}
function returned(){const s=scene(),[a,b]=patches(s);bite(s,a);leave(s,a);bite(s,b);renew(s,19);returnTo(s,a);assert.equal(state(s).returned,true);return {s,a,b};}

test('an explicit story starts with bounded choices and no ecology changes',()=>{
 const s=scene(),before=JSON.stringify(s.section.food),count=s.section.entities.length;assert.equal(state(s).patches.length,0);assert.equal(state(s).first,null);assert.equal(validStory(state(s)),true);tickStory(s,100);assert.equal(JSON.stringify(s.section.food),before);assert.equal(s.section.entities.length,count);
 assert.ok(storyView(s).actions.some(a=>a.id==='engineer-reef'&&a.value===1));assert.equal(storyAction(s,'engineer-reef',1),true);assert.equal(s.destination,1);assert.equal(s.current,0);assert.equal(storyAction(s,'engineer-reef',8),false);
});

test('only a consumed local algae meal records the actual reduction and gradual sand',()=>{
 const s=scene(),a=patches(s)[0],coral=s.section.food.find(f=>f.food==='coral');assert.equal(storyMeal(s,coral),false);assert.equal(storyMeal(s,{...a}),false);assert.equal(storyMeal(s,{...a,regrow:8}),false);
 bite(s,a);const p=state(s).patches[0];assert.equal(a.amount,65);assert.equal(p.after,65);assert.equal(p.algae,65);assert.equal(p.sand,0);assert.equal(p.deposit,.35);assert.equal(p.quiet,8);
 tickStory(s,1);assert.ok(p.sand>0&&p.sand<.35);assert.ok(p.deposit>0);tickStory(s,1);assert.equal(p.sand,.35);assert.equal(p.deposit,0);assert.equal(coral.amount,100);assert.equal(validStory(state(s)),true);
});

test('renewal follows the existing resource quiet interval and requires spatial return',()=>{
 const s=scene(),[a,b]=patches(s);bite(s,a);renew(s,7);assert.equal(a.amount,65);assert.equal(state(s).returned,false);leave(s,a);bite(s,b);renew(s,19);assert.ok(a.amount>=85);assert.equal(state(s).returned,false);returnTo(s,a);assert.equal(state(s).returned,true);assert.equal(state(s).complete,false);assert.match(storyView(s).detail,/appetite and care/);
});

test('rest is a meaningful alternate choice and staying over the same patch cannot complete it',()=>{
 const s=scene(),a=patches(s)[0];bite(s,a);returnTo(s,a);assert.equal(storyAction(s,'engineer-rest'),true);renew(s,30);returnTo(s,a);assert.equal(state(s).returned,false);leave(s,a);returnTo(s,a);assert.equal(state(s).returned,true);assert.equal(state(s).visitedOther,false);
});

test('another bite restarts renewal; consumed depletion stays visually bare until regrowth',()=>{
 const s=scene(),a=patches(s)[0];bite(s,a);renew(s,12);const before=a.amount;bite(s,a);assert.equal(a.amount,before-35);assert.equal(state(s).returned,false);renew(s,7);assert.equal(a.amount,before-35);assert.equal(state(s).patches[0].quiet>0,true);
 bite(s,a);bite(s,a);assert.equal(a.regrow,8);tickStory(s,.05);assert.equal(state(s).patches[0].algae,0);assert.equal(state(s).patches[0].deposit<=.8,true);renew(s,9);assert.equal(a.regrow,0);assert.equal(state(s).patches[0].algae,100);
});

test('a real hungry neighbor approaches with mouth contact, consumes renewed algae, and records once',()=>{
 const {s,a}=returned(),e={...structuredClone(s.player),id:901,x:a.x+190,y:a.y,energy:100,health:100,satiated:0,rest:0,think:0,target:null,feeding:null,still:0,biteCooldown:0,incarnation:2};s.section.entities=[e];const count=s.section.entities.length,before=a.amount;
 assert.equal(storyNPC(s,e,.05),true);assert.equal(a.amount,before);assert.equal(state(s).neighborMeal,false);
 let biteGap=null;for(let i=0;i<600&&!state(s).neighborMeal;i++){e.biteCooldown=Math.max(0,e.biteCooldown-.05);tickFeeding(e,.05);const was=a.amount;storyNPC(s,e,.05);if(a.amount!==was)biteGap=contactGap(e,a);tickStory(s,.05);}
 assert.equal(state(s).neighborMeal,true);assert.ok(biteGap<=3);assert.equal(a.amount,before-12);assert.equal(a.patchRest,8);assert.equal(e.satiated,45);assert.equal(s.section.entities.length,count);assert.equal(state(s).complete,true);assert.equal(s.events.filter(e=>e.value==='sandcastle-engineer').length,1);
 tickStory(s,100);bite(s,a);tickStory(s,100);assert.equal(validStory(state(s)),true);assert.equal(s.events.filter(e=>e.value==='sandcastle-engineer').length,1);
});

test('resting, feeding, threatened and cleaning neighbors keep their existing routines',()=>{
 const {s,a}=returned(),e={...structuredClone(s.player),id:902,x:a.x+90,y:a.y,health:100,satiated:0,rest:0,target:null,feeding:null};s.section.entities=[e];
 for(const patch of [{satiated:10},{rest:4},{cleanTime:1},{stun:1},{behavior:'Moving away from a predator'},{health:30},{target:'unrelated-meal'},{feeding:{target:'other',committed:false}}]){
  Object.assign(e,{satiated:0,rest:0,cleanTime:0,stun:0,behavior:'Cruising',health:100,target:null,feeding:null},patch);state(s).neighbor=null;assert.equal(storyNPC(s,e,.1),false);assert.equal(state(s).neighborMeal,false);
 }
 assert.equal(s.section.entities.length,1);
});

test('JSON persistence retains the patch/resource association and rejects malformed ecology',()=>{
 const {s}=returned(),saved=JSON.parse(JSON.stringify(state(s)));assert.deepEqual(saved,state(s));assert.equal(validStory(saved),true);assert.equal(validStory(null),true);
 for(const [field,value] of [['sand',4.01],['deposit',.81],['quiet',9],['algae',101],['after',-1],['meals',0],['reef',8],['x',Infinity]]){const bad=structuredClone(saved);bad.patches[0][field]=value;assert.equal(validStory(bad),false,field);}
 const dup=structuredClone(saved);dup.patches.push({...dup.patches[0]});assert.equal(validStory(dup),false);const ghost=structuredClone(saved);ghost.first='missing';assert.equal(validStory(ghost),false);const timer=structuredClone(saved);timer.neighborMeal=true;timer.returned=false;assert.equal(validStory(timer),false);
});

test('Simulation dispatch consumes once and saves preserve the ecological clocks and story state',()=>{
 const s=scene(),a=patches(s)[0];Object.assign(s.player,{x:a.x+70,y:a.y,energy:60});s.pointer={x:s.player.x,y:s.player.y};s.consume(a);
 assert.equal(a.amount,65);assert.equal(state(s).patches[0].meals,1);assert.equal(state(s).patches[0].deposit,.35);s.step(.05);
 const serialized=s.serialize(),restored=Simulation.restore(serialized);assert.equal(restored.serialize(),serialized);assert.deepEqual(restored.reefStories,s.reefStories);tickStory(restored,100);assert.equal(restored.serialize(),serialized);
 restored.paused=false;for(let i=0;i<60;i++){s.step(.05);restored.step(.05);}assert.equal(restored.serialize(),s.serialize());
 const bad=JSON.parse(serialized);bad.reefStories.engineer.patches[0].sand=5;assert.throws(()=>Simulation.restore(bad));
});


test('inactive local ecology renews real algae and deposits sand without awarding story progress',()=>{
 const s=scene(),a=patches(s)[0];bite(s,a);leave(s,a);storyAction(s,'engineer-rest');returnTo(s,a);s.reefStories.active=null;
 const flags=Object.fromEntries(['departed','returned','visitedOther','neighborMeal','complete'].map(k=>[k,state(s)[k]]));
 for(let i=0;i<400;i++){a.regrow=Math.max(0,a.regrow-.05);recoverPatch(a,.05);tickBackground(s,.05);}
 const p=state(s).patches[0];assert.equal(p.algae,a.amount);assert.ok(p.algae>=85);assert.equal(p.quiet,a.patchRest);assert.equal(p.deposit,0);assert.ok(Math.abs(p.sand-.35)<1e-10);
 for(const [key,value]of Object.entries(flags))assert.equal(state(s)[key],value,key);assert.equal(s.events.filter(e=>e.value==='sandcastle-engineer').length,0);assert.equal(state(s).neighbor,null);
});

test('background updates freeze paused and offscreen patches, then resume only the local patch',()=>{
 const s=scene(),a=patches(s)[0];bite(s,a);const p=state(s).patches[0],before=structuredClone(p);s.reefStories.active=null;s.paused=true;tickBackground(s,100);assert.deepEqual(p,before);
 s.paused=false;s.current=1;a.amount=95;a.patchRest=0;tickBackground(s,100);assert.deepEqual(p,before);
 s.current=0;tickBackground(s,1);assert.equal(p.algae,95);assert.equal(p.quiet,0);assert.equal(p.sand,.175);assert.equal(p.deposit,.175);assert.equal(state(s).returned,false);assert.equal(validStory(state(s)),true);
});

test('watch and E keep ownership of an existing anticipatory bite through Simulation stepping',()=>{
 for(const action of ['engineer-watch','context']){
  const {s,a}=returned(),e={...structuredClone(s.player),id:903,x:a.x+170,y:a.y,health:100,satiated:0,rest:0,target:null,feeding:null,still:0,biteCooldown:0};s.section.entities=[e];s.pointer={x:s.player.x,y:s.player.y};
  let anticipation=false;for(let i=0;i<600&&!e.feeding;i++)s.step(.05);
  assert.ok(e.feeding&&!e.feeding.committed);assert.equal(state(s).neighbor.id,e.id);assert.equal(e.feeding.target,a.id);const owner=structuredClone(state(s).neighbor),before=a.amount;
  assert.equal(storyAction(s,action),true);assert.deepEqual(state(s).neighbor,owner);assert.equal(e.target,a.id);
  let amountBeforeBite=before;for(let i=0;i<100&&!state(s).neighborMeal;i++){if(e.feeding&&!e.feeding.committed)anticipation=true;amountBeforeBite=a.amount;s.step(.05);}
  assert.equal(anticipation,true);assert.equal(state(s).neighborMeal,true);assert.equal(state(s).complete,true);assert.ok(Math.abs(a.amount-(Math.min(100,amountBeforeBite+.1)-12))<1e-9);assert.ok(contactGap(e,a)<=3);assert.equal(e.satiated,45);assert.equal(s.events.filter(e=>e.value==='sandcastle-engineer').length,1);
 }
});



test('an invited digesting browser swims from its real location and nibbles without resetting appetite',()=>{
 const {s,a}=returned(),e={...structuredClone(s.player),id:904,x:a.x+900,y:a.y-150,health:100,satiated:80,rest:4,target:null,feeding:null,still:0,biteCooldown:0};s.section.entities=[e];s.pointer={x:s.player.x,y:s.player.y};const location={x:e.x,y:e.y},count=s.section.entities.length;
 assert.equal(storyNPC(s,e,.05),false);assert.equal(storyAction(s,'engineer-watch'),true);assert.equal(e.satiated,80);assert.equal(e.rest,4);assert.equal(e.x,location.x);assert.equal(e.y,location.y);assert.equal(state(s).invited,true);
 let elapsed=0;for(let i=0;i<800&&!state(s).complete;i++){s.step(.05);elapsed+=.05;}
 assert.equal(state(s).complete,true);assert.ok(elapsed<40);assert.ok(contactGap(e,a)<=3);assert.equal(s.section.entities.length,count);assert.ok(e.satiated>45);assert.ok(Math.abs(e.satiated-(80-elapsed))<1e-8);assert.equal(a.amount,88);assert.equal(validStory(state(s)),true);
});

test('explicit invitations preserve active care and committed other meals',()=>{
 const {s,a}=returned(),e={...structuredClone(s.player),id:905,x:a.x+100,y:a.y,health:100,satiated:60,rest:0,target:null,feeding:null};s.section.entities=[e];
 for(const patch of [{cleanTime:1},{health:30},{stun:1},{behavior:'Moving away from a hunter'},{target:'other-meal',feeding:{target:'other-meal',committed:true}},{target:'cleaning-partner'}]){
  Object.assign(e,{health:100,stun:0,cleanTime:0,behavior:'Cruising',target:null,feeding:null},patch);state(s).neighbor=null;state(s).invited=false;assert.equal(storyAction(s,'engineer-watch'),false);assert.equal(state(s).neighbor,null);assert.equal(e.satiated,60);assert.equal(state(s).neighborMeal,false);
 }
});


test('natural generated habitats accept a real invitation and finish within forty seconds across twelve routes',()=>{
 for(const seed of [42,1,7,123,999,2026])for(const reef of [0,1]){
  const s=new Simulation(seed);s.start('practice','s15');assert.equal(beginStory(s),true);s.transition(0,-1);if(reef===0)s.transition(-1,0);storyAction(s,'engineer-reef',reef);
  const a=s.section.food.find(f=>f.food==='algae'),count=s.section.entities.length;
  assert.equal(s.eatAt(a.x,a.y),true);for(let i=0;i<2400&&!state(s).first&&s.phase==='playing';i++)s.step(.05);assert.equal(state(s).first,a.id,`seed ${seed} reef ${reef} actual player meal`);
  storyAction(s,'engineer-rest');s.point(a.x+200,a.y);for(let i=0;i<500;i++)s.step(.05);s.point(a.x+70,a.y);for(let i=0;i<1000&&!state(s).returned&&s.phase==='playing';i++)s.step(.05);assert.equal(state(s).returned,true);
  assert.equal(storyAction(s,'engineer-watch'),true,`seed ${seed} reef ${reef} invitation`);let elapsed=0;for(let i=0;i<800&&!state(s).complete&&s.phase==='playing';i++){s.step(.05);elapsed+=.05;}
  assert.equal(state(s).complete,true,`seed ${seed} reef ${reef}`);assert.ok(elapsed<40);assert.equal(s.section.entities.length,count);assert.equal(state(s).neighborMeal,true);assert.equal(s.events.filter(e=>e.value==='sandcastle-engineer').length,1);assert.equal(validStory(state(s)),true);
 }
});
