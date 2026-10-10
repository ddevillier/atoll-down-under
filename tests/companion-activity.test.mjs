import test from 'node:test';import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';import {SPECIES} from '../src/data.js';
import {companion,inviteCompanion,companionMeal,tickCompanion} from '../src/companion-activity.js';
import {tickAdventure} from '../src/adventures.js';import {localRoutine} from '../src/ecology.js';
import {mouthPoint} from '../src/feeding-contact.js';
function scene(id=8){const s=new Simulation(42);s.start('practice','s'+id);const e={...structuredClone(s.player),species:SPECIES[id],id:900,x:s.player.x+100,y:s.player.y,health:100,satiated:0,rest:0,target:null,feeding:null,cleanTime:0,stun:0,ecology:null};s.section.entities=[e];s.events=[];return {s,e};}
test('paired browsers invite a real neighbor and complete only after both meals and a calm reunion',()=>{
 for(const id of [8,48,52]){const {s,e}=scene(id),food=s.section.food.find(f=>e.species.diet.includes(f.food));assert.equal(inviteCompanion(s),true);assert.equal(companion(s),e);
  tickAdventure(s,5);assert.equal(s.adventure.complete,false);companionMeal(s,s.player,food);tickAdventure(s,5);assert.equal(s.adventure.complete,false);
  companionMeal(s,e,food);e.target=food.id;tickAdventure(s,5);assert.equal(s.adventure.complete,false);e.target=null;
  tickAdventure(s,2);assert.equal(s.adventure.complete,false);tickAdventure(s,1);assert.equal(s.adventure.complete,true);assert.equal(s.events.filter(e=>e.type==='discovery').length,1);
 }
});
test('companion moves at bounded speed and yields to actual feeding, danger and cleaning',()=>{
 const {s,e}=scene();inviteCompanion(s);e.satiated=30;e.x=s.player.x+300;const x=e.x,y=e.y;assert.equal(localRoutine(s,e,1/60,70),0);assert.ok(Math.hypot(e.x-x,e.y-y)<=70/60+.001);assert.equal(e.behavior,'Returning to your side');
 e.target='food';assert.equal(localRoutine(s,e,1/60,70),70);e.target=null;e.activity='avoiding';assert.equal(localRoutine(s,e,1/60,70),70);
 e.activity='cruising';e.cleanTime=1;assert.equal(tickCompanion(s,3),false);
});
test('a hungry generated companion makes a real nearby feeding excursion and reunites without hunger or position edits',()=>{
 const s=new Simulation(42);s.start('practice','s48');for(let i=0;i<30;i++)s.step(1/60);s.useContext();const e=companion(s);
 const food=s.section.food.filter(f=>f.regrow<=0&&s.player.species.diet.includes(f.food)).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y))[0];s.eatAt(food.x,food.y);
 for(let i=0;i<30*60;i++)s.step(1/60);
 assert.equal(s.adventure.buddy.playerMeal,true);assert.equal(s.adventure.buddy.partnerMeal,true);assert.equal(s.adventure.complete,true);assert.equal(s.reefMemory.entries.filter(m=>m.kind==='shared-trip').length,1);assert.ok(e.satiated>0);
});
test('invitation cleanly releases an earlier pair and cannot recruit a busy fish',()=>{
 const {s,e}=scene(),other={...structuredClone(e),id:901,ecology:{partner:e.id}};e.ecology={reef:s.current,partner:other.id};s.section.entities.push(other);
 e.feeding={target:'meal'};other.feeding={target:'meal'};assert.equal(inviteCompanion(s),false);e.feeding=null;assert.equal(inviteCompanion(s),true);assert.equal(other.ecology.partner,null);assert.equal(e.ecology.partner,s.player.id);
 assert.equal(inviteCompanion(s),true);assert.equal(e.ecology.partner,null);assert.equal(companion(s),null);
});
test('companion identity survives saves and releases on death or reincarnation',()=>{
 for(const change of [(s,e)=>{e.alive=false;},(s,e)=>{e.incarnation=1;}]){
  const {s,e}=scene();inviteCompanion(s);const restored=Simulation.restore(s.serialize());assert.equal(companion(restored).id,e.id);change(s,e);tickAdventure(s,.1);assert.equal(s.adventure.buddy,null);assert.equal(e.ecology.partner,null);
 }
 const {s}=scene();inviteCompanion(s);const bad=JSON.parse(s.serialize());bad.adventure.buddy.rejoined=-1;assert.throws(()=>Simulation.restore(bad));
});
test('distance and travel part companions without forgetting or teleporting them',()=>{
 for(const leave of [(s,e)=>{e.x=s.player.x+700;},s=>s.transition(1,0)]){
  const {s,e}=scene();inviteCompanion(s);const reef=s.current,id=e.id;leave(s,e);tickAdventure(s,.1);
  assert.equal(s.adventure.buddy.id,id);assert.equal(s.adventure.buddy.away,true);assert.equal(e.ecology.partner,null);assert.ok(s.sections[reef].entities.includes(e));
  if(s.current!==reef)s.transition(-1,0);Object.assign(s.player,{x:e.x-100,y:e.y});s.point(s.player.x,s.player.y);tickAdventure(s,.1);
  assert.equal(companion(s),e);assert.equal(s.adventure.buddy.away,false);assert.equal(e.ecology.partner,'player');
 }
});

test('real player and NPC feeding commits complete a companion trip without adding food or animals',()=>{
 for(const id of [8,48,52]){const {s,e}=scene(id),foods=s.section.food.filter(f=>e.species.diet.includes(f.food)).slice(0,2);s.section.food=foods;
  for(const [fish,food] of [[s.player,foods[0]],[e,foods[1]]]){const mouth=mouthPoint(fish);food.x=mouth.x+10;food.y=mouth.y;}
  inviteCompanion(s);s.eatAt(foods[0].x,foods[0].y);
  let minimum=200;for(let i=0;i<1800&&!s.adventure.complete;i++){s.step(1/60);minimum=Math.min(minimum,foods.reduce((sum,f)=>sum+f.amount,0));}
  assert.equal(s.adventure.complete,true);assert.ok(minimum<=153);assert.equal(s.section.entities.length,1);assert.equal(s.section.food.length,2);
 }
});
