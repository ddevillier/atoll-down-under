import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {meetFish,tickFamiliarFish,familiarFish,greetingRoutine,rememberExperience} from '../src/reef-memories.js';
import {homeJourneySites,homeJourneyMeal,HOME_JOURNEYS} from '../src/home-journeys.js';
import {inviteCompanion,companionMeal,tickCompanion} from '../src/companion-activity.js';
import {freshJournal,recordJournalMemory,mergeJournals,persistJournal,validateJournal} from '../src/journal.js';
import {exportDive,importDive} from '../src/save-files.js';
import {REEFS} from '../src/data.js';

const ticks=(s,seconds)=>{for(let i=0;i<seconds*60;i++)s.step(1/60);};
function fishScene(){const s=new Simulation(42);s.start('practice','s48');const e=s.section.entities.find(e=>e.species.id==='s48');assert.ok(e);s.section.entities=[e];Object.assign(e,{x:800,y:320,satiated:100,target:null,rest:0,stun:0,feeding:null,cleanTime:0});return {s,e};}

test('return recognizes the original individual, once per visit, without moving it to a new habitat',()=>{
 const {s,e}=fishScene(),reef=s.current;s.observe(e);assert.equal(s.reefMemory.entries.length,1);s.observe(e);assert.equal(s.reefMemory.entries.length,1);
 s.transition(1,0);assert.ok(s.sections[reef].entities.includes(e));assert.ok(!s.section.entities.includes(e));s.transition(-1,0);
 Object.assign(s.player,{x:700,y:320});tickFamiliarFish(s);tickFamiliarFish(s);
 assert.equal(s.reefMemory.entries.filter(m=>m.kind==='reunion').length,1);assert.ok(familiarFish(s,e).greetUntil>s.time);
 const before=s.serialize();s.paused=true;tickFamiliarFish(s);assert.equal(s.serialize(),before);
});
test('death, respawn, distant neighbors and busy animals never fake a greeting',()=>{
 for(const alter of [e=>{e.alive=false;},e=>{e.incarnation=1;},e=>{e.x=1400;},e=>{e.target='meal';},e=>{e.stun=1;},e=>{e.feeding={target:'meal'};},e=>{e.cleanTime=1;}]){
  const {s,e}=fishScene();meetFish(s,e);s.transition(1,0);s.transition(-1,0);s.player.x=800;s.player.y=320;alter(e);tickFamiliarFish(s);
  assert.equal(s.reefMemory.entries.filter(m=>m.kind==='reunion').length,0);
 }
 const {s,e}=fishScene();const f=meetFish(s,e);f.greetUntil=s.time+3;e.target='meal';assert.equal(greetingRoutine(s,e,1/60,50),null);
});
test('portable save retains familiarity, a parted buddy, specific memories and first discovery',()=>{
 const {s,e}=fishScene();inviteCompanion(s);companionMeal(s,s.player,{kind:'food',food:'algae'});companionMeal(s,e,{kind:'food',food:'algae'});tickCompanion(s,3);
 assert.equal(s.reefMemory.entries.filter(m=>m.kind==='shared-trip').length,1);s.transition(1,0);
 const loaded=importDive(exportDive(s,'Familiar neighbor')).simulation;assert.deepEqual(loaded.reefMemory,s.reefMemory);assert.equal(loaded.adventure.buddy.id,e.id);assert.equal(loaded.adventure.buddy.away,true);
 loaded.paused=false;loaded.transition(-1,0);Object.assign(loaded.player,{x:800,y:300});ticks(loaded,.1);assert.equal(loaded.adventure.buddy.away,false);assert.ok(loaded.reefMemory.entries.some(m=>m.kind==='reunion'));
 for(const mutate of [d=>{d.reefMemory.friends[0].incarnation=-1;},d=>{d.reefMemory.visits=[];},d=>{d.reefMemory.entries[0].kind='invented';},d=>{d.riskCue={reason:'invalid',until:10};}]){const bad=JSON.parse(s.serialize());mutate(bad);assert.throws(()=>Simulation.restore(bad),/damaged/);}
 const old=JSON.parse(s.serialize());delete old.reefMemory;delete old.riskCue;delete old.player.hurtGrace;assert.doesNotThrow(()=>Simulation.restore(old));
});
test('all eight home journeys leave specific memories on repeat trips, while discovery remains earned once',()=>{
 for(const id of Object.keys(HOME_JOURNEYS)){
  const s=new Simulation(42);s.start('practice',id);s.difficulty=0;const site=homeJourneySites(s)[0];
  // Isolate the journey from random hunger/attack events; living hosts remain.
  s.section.entities=s.section.entities.filter(e=>e.species.id==='s63');
  for(let trip=0;trip<2;trip++){
   Object.assign(s.player,{x:site.x,y:site.y});s.point(site.x,site.y);s.useContext();ticks(s,4);const d=HOME_JOURNEYS[id];
   Object.assign(s.player,{x:site.x>800?site.x-160:site.x+160,y:site.y});s.point(s.player.x,s.player.y);ticks(s,.1);
   for(const food of d.ordered?d.foods:[d.foods[0]])homeJourneyMeal(s,{kind:'food',food});
   Object.assign(s.player,{x:site.x,y:site.y});s.point(site.x,site.y);ticks(s,4);
   assert.equal(s.adventure.homeJourney.finished,true,id);assert.equal(s.reefMemory.entries.filter(m=>m.kind==='homecoming').length,trip+1,id);assert.ok(s.reefMemory.entries.at(-1).text.includes(REEFS[s.current].name));
  }
  assert.equal(s.events.filter(e=>e.type==='discovery').length,1,id);assert.deepEqual(importDive(exportDive(s,'Home')).simulation.reefMemory,s.reefMemory);
 }
});
test('goby and created refuge trips preserve concrete feeding memories instead of only a one-time return flag',()=>{
 for(const diet of ['grazer','hunter','omnivore']){
  const s=new Simulation(42);s.start('create','custom',{name:'Moss',diet,size:75});s.difficulty=0;const site=REEFS[s.current].shelters[0];
  for(let trip=0;trip<2;trip++){
   Object.assign(s.player,{x:site.x,y:site.y});s.point(site.x,site.y);s.useContext();Object.assign(s.player,{x:site.x+site.r+30,y:site.y});s.point(s.player.x,s.player.y);ticks(s,.1);
   s.player.energy=50;s.player.biteCooldown=0;const food=s.section.food.find(f=>s.player.species.diet.includes(f.food));s.consume(food);Object.assign(s.player,{x:site.x,y:site.y});s.point(site.x,site.y);ticks(s,1);
   assert.equal(s.creation.recentMemories.filter(m=>m.kind==='homecoming').length,trip+1,diet);assert.ok(s.creation.recentMemories.at(-1).foods.includes(food.food));
  }
  assert.deepEqual(importDive(exportDive(s,'Moss')).simulation.creation.recentMemories,s.creation.recentMemories);
 }
 const s=new Simulation(42);s.start('practice','s2');const site=REEFS[s.current].shelters[0];
 for(let trip=0;trip<2;trip++){Object.assign(s.player,{x:site.x,y:site.y});s.point(site.x,site.y);s.useContext();ticks(s,1);s.player.x=site.x+150;s.point(s.player.x,s.player.y);ticks(s,.1);s.player.biteCooldown=0;s.consume(s.section.food.find(f=>f.food==='plankton'));Object.assign(s.player,{x:site.x,y:site.y});s.point(site.x,site.y);ticks(s,1);assert.equal(s.adventure.homecomingLogged,true);assert.equal(s.reefMemory.entries.filter(m=>m.kind==='homecoming').length,trip+1);}
 s.useContext();assert.equal(s.adventure.homecomingLogged,false);assert.equal(s.adventure.complete,true);assert.equal(s.events.filter(e=>e.type==='discovery').length,1);
});
test('journal merges real memories across stale writers, deduplicates replays and accepts older backups',()=>{
 const {s,e}=fishScene();meetFish(s,e);const first=s.reefMemory.entries[0],a=freshJournal(),b=freshJournal();assert.equal(recordJournalMemory(a,first,'2026-10-02T10:00:00Z'),true);assert.equal(recordJournalMemory(a,first),false);
 const second=rememberExperience(s,'homecoming','Returned to a familiar ledge.');recordJournalMemory(b,second,'2026-10-02T11:00:00Z');let raw=JSON.stringify(a);const storage={getItem:()=>raw,setItem:(_key,value)=>{raw=value;}};const merged=persistJournal(b,storage);assert.deepEqual(merged.memories.map(m=>m.id),[first.id,second.id]);assert.equal(mergeJournals(merged,a).memories.length,2);
 const old=freshJournal();delete old.memories;assert.deepEqual(validateJournal(old).memories,[]);
 for(let i=0;i<80;i++)recordJournalMemory(b,rememberExperience(s,'care','A needed cleaning visit.'),'2026-10-02T12:00:00Z');assert.equal(b.memories.length,64);assert.equal(s.reefMemory.entries.length,16);
});
