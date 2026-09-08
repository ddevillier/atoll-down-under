import test from 'node:test';import assert from 'node:assert/strict';import {Simulation} from '../src/simulation.js';import {FORAGING_JOURNEYS,startForagingPrep,foragingMeal,foragingInstruction,validForagingPrep,validForagingJourney} from '../src/foraging-journeys.js';import {exportDive,importDive} from '../src/save-files.js';
const step=(s,n)=>{for(let i=0;i<n*60;i++)s.step(1/60);};
test('a real snail meal requires continuous mouth contact; pointer interruption grants nothing',()=>{
 const s=new Simulation(42);s.start('practice','s22');const snail=s.section.entities.find(e=>e.species.id==='s61');const initial=s.player.energy;startForagingPrep(s,snail,true);s.step(.05);assert.equal(snail.alive,true);assert.equal(s.adventure.foragingJourney,undefined);s.point(800,300);assert.equal(s.player.foragingPrep,null);assert.ok(s.player.energy<=initial);
 startForagingPrep(s,snail,true);for(let i=0;i<30*60&&snail.alive;i++)s.step(1/60);assert.equal(snail.alive,false);assert.deepEqual(s.adventure.foragingJourney.meals.map(m=>m.food),['snail']);assert.equal(s.adventure.complete,false);
});
test('all ten saved feeding trips preserve progress and pause, and replay never removes recognition',()=>{
 for(const [id,d] of Object.entries(FORAGING_JOURNEYS)){
  const s=new Simulation(42);s.start('practice',id);s.adventure.foragingJourney={finished:false,rest:0,meals:[{reef:s.current,id:'recorded-meal',x:400,y:400,food:d.foods[0]}]};
  const r=importDive(exportDive(s,'Feeding trip')).simulation,before=r.serialize();r.step(1);assert.equal(r.serialize(),before);r.paused=false;const copy=Simulation.restore(s.serialize());copy.paused=false;step(r,1);step(copy,1);assert.equal(r.serialize(),copy.serialize(),id);
  s.adventure.foragingJourney.meals.push({reef:s.current,id:'second-meal',x:700,y:400,food:d.foods[1]});s.adventure.foragingJourney.finished=true;s.adventure.complete=true;s.useContext();assert.equal(s.adventure.complete,true);assert.equal(s.adventure.foragingJourney.finished,false);assert.deepEqual(s.adventure.foragingJourney.meals,[]);assert.doesNotMatch(foragingInstruction(s),/Discovered/);
 }
 assert.equal(validForagingJourney({finished:true,rest:0,meals:[]}),false);
});
test('lost or replaced shell prey cannot finish preparation; missing companions have habitat guidance',()=>{
 const s=new Simulation(42);s.start('practice','s24');const crab=s.section.entities.find(e=>e.species.id==='s46');startForagingPrep(s,crab,true);crab.incarnation=(crab.incarnation||0)+1;s.step(.05);assert.equal(s.player.foragingPrep,null);assert.equal(s.adventure.foragingJourney,undefined);
 startForagingPrep(s,crab,true);crab.alive=false;s.step(.05);assert.equal(s.player.foragingPrep,null);
 const b=new Simulation(2);b.start('practice','s4');b.adventure.foragingJourney={finished:false,rest:0,meals:[{reef:4,id:'first',x:300,y:300,food:'sponge'},{reef:4,id:'second',x:600,y:300,food:'algae'}]};b.transition(1,0);assert.match(foragingInstruction(b),/Use the map/);b.useContext();assert.doesNotMatch(foragingInstruction(b),/undefined/);assert.equal(b.adventure.complete,false);
});
test('probing exposes actual food before a committed bite; moving stops inspection and travel releases it',()=>{
 const s=new Simulation(42);s.start('practice','s6');const f=s.section.food.find(f=>f.food==='worm'),amount=f.amount;startForagingPrep(s,f,false);for(let i=0;i<30*60&&s.player.foragingPrep;i++)s.step(1/60);assert.ok(f.uncovered>0);assert.equal(f.sandSource,s.player.id);assert.equal(f.amount,amount);assert.equal(s.adventure.foragingJourney,undefined);s.eatAt(f.x,f.y);for(let i=0;i<10*60&&!s.adventure.foragingJourney?.meals.length;i++)s.step(1/60);assert.equal(s.adventure.foragingJourney.meals[0].food,'worm');
 startForagingPrep(s,f,false);s.transition(1,0);assert.equal(s.player.foragingPrep,null);
});
test('wrong foods, unprepared hard prey and neighboring bites cannot fake a foraging journey',()=>{
 const s=new Simulation(42);s.start('practice','s24');const crab=s.section.entities.find(e=>e.species.id==='s46'),snail=s.section.entities.find(e=>e.species.id==='s61');foragingMeal(s,crab);foragingMeal(s,snail);assert.deepEqual(s.adventure.foragingJourney.meals,[]);
 const b=new Simulation(42);b.start('practice','s4');foragingMeal(b,{kind:'food',id:'one',food:'sponge',x:400,y:400});foragingMeal(b,{kind:'food',id:'two',food:'algae',x:410,y:400});assert.equal(b.adventure.foragingJourney.meals.length,1);foragingMeal(b,{kind:'food',id:'three',food:'algae',x:700,y:400});assert.equal(b.adventure.foragingJourney.meals.length,2);assert.equal(b.adventure.complete,false,'a browsing trip still needs its social return');
});
test('pending preparation checkpoints freeze, resume deterministically and reject invalid progress',()=>{
 const s=new Simulation(42);s.start('practice','s27');startForagingPrep(s,s.section.food.find(f=>f.food==='shrimp'),true);step(s,.5);const restored=importDive(exportDive(s,'Sifting')).simulation,before=restored.serialize();restored.step(1);assert.equal(restored.serialize(),before);restored.paused=false;const copy=Simulation.restore(s.serialize());copy.paused=false;step(restored,3);step(copy,3);assert.equal(restored.serialize(),copy.serialize());
 assert.equal(validForagingPrep({...s.player.foragingPrep,elapsed:Infinity}),false);assert.equal(validForagingJourney({finished:false,rest:0,meals:[{reef:0,id:'f',x:1,y:NaN,food:'worm'}]}),false);
});
test('a defensive ability interrupts inspection and a new meal clears the previous cleaning amount',()=>{
 const s=new Simulation(42);s.start('practice','s27');s.player.cleaningAmount=8;startForagingPrep(s,s.section.food.find(f=>f.food==='shrimp'),true);assert.equal(s.player.cleaningAmount,0);s.useAbility();assert.equal(s.player.foragingPrep,null);assert.equal(s.adventure.foragingJourney,undefined);
});
