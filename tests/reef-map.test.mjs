import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {SPECIES} from '../src/data.js';
import {routeBetween,availableMeals} from '../src/reef-map.js';

test('map routes follow real reef transitions for all 81 pairs',()=>{
 for(let from=0;from<9;from++)for(let to=0;to<9;to++){
  const s=new Simulation(42);s.start();s.current=from;
  const route=routeBetween(from,to);
  assert.ok(route.length<=3);
  for(const leg of route){assert.equal(s.current,leg.from);assert.equal(s.transition(leg.dx,leg.dy),true);assert.equal(s.current,leg.to);}
  assert.equal(s.current,to);
 }
 assert.deepEqual(routeBetween(0,8).map(s=>[s.to,s.direction]),[[2,'left'],[5,'down'],[8,'down']]);
 assert.deepEqual(routeBetween(8,0).map(s=>[s.to,s.direction]),[[6,'right'],[3,'up'],[0,'up']]);
});

test('planning a swim changes only the destination, including while paused',()=>{
 const s=new Simulation(42);s.start();s.paused=true;const before=JSON.parse(s.serialize());
 assert.equal(s.setDestination(6),true);const after=JSON.parse(s.serialize());after.destination=before.destination;
 assert.deepEqual(after,before);assert.equal(s.paused,true);
 for(const id of [-1,9,1.5,'6',undefined])assert.equal(s.setDestination(id),false);
 assert.equal(s.destination,6);assert.equal(s.setDestination(null),true);assert.equal(s.destination,null);
});

test('arrival clears guidance, records the visit and does not teleport on planning',()=>{
 const s=new Simulation(42);s.start();s.setDestination(6);assert.equal(s.current,4);
 s.transition(-1,0);assert.equal(s.destination,6);assert.equal(routeBetween(s.current,s.destination)[0].direction,'down');
 s.transition(0,1);assert.equal(s.current,6);assert.equal(s.destination,null);
 assert.deepEqual(s.visited,[4,3,6]);assert.match(s.events.at(-1).text,/Reached Seagrass Meadow.*3 of 9/);
 s.transition(0,-1);assert.deepEqual(s.visited,[4,3,6]);
});

test('a detour and a saved return retain an optional destination and all dive state',()=>{
 const s=new Simulation(42);s.start();s.setDestination(6);s.transition(1,0);
 const loaded=Simulation.restore(s.serialize());assert.equal(loaded.destination,6);assert.equal(loaded.serialize(),s.serialize());
 assert.deepEqual(routeBetween(loaded.current,loaded.destination).map(s=>s.to),[3,6]);
 loaded.setDestination(loaded.current);assert.equal(loaded.destination,null);
 loaded.setDestination(2);loaded.continueRun();assert.equal(loaded.destination,null);
});

test('old and damaged optional map markers do not prevent loading a dive',()=>{
 const s=new Simulation(42);s.start();const old=JSON.parse(s.serialize());delete old.destination;
 for(const destination of [undefined,-1,9,'2',{},old.current]){
  const loaded=Simulation.restore({...old,destination});assert.equal(loaded.destination,null);assert.equal(loaded.player.health,100);
 }
});

test('meal ideas use present food state and retain dietary and poison rules',()=>{
 const s=new Simulation(42);s.start('practice','s22');
 const crab=s.section.entities.find(e=>e.species.id==='s46'),snail=s.section.entities.find(e=>e.species.id==='s61');
 const sponge=s.section.food.find(e=>e.food==='sponge');
 const section={food:[sponge],entities:[crab,snail]};
 assert.deepEqual(availableMeals(s.player.species,section),['Snails','Crabs','Sponge']);
 crab.alive=false;sponge.regrow=8;assert.deepEqual(availableMeals(s.player.species,section),['Snails']);
 assert.deepEqual(availableMeals(SPECIES[1],section),[]);
 const cleaner=s.sections[0].entities.find(e=>e.species.ability==='clean');
 assert.deepEqual(availableMeals(SPECIES[34],{food:[],entities:[cleaner]}),[]);
 const poison={species:SPECIES[60],alive:true};
 assert.deepEqual(availableMeals({...SPECIES[34],diet:['slug']},{food:[],entities:[poison]}),[]);
});
