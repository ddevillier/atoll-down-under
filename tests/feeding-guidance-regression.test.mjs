import test from 'node:test';
import assert from 'node:assert/strict';
import {SPECIES,createSpecies} from '../src/data.js';
import {Simulation} from '../src/simulation.js';
import {suitableMeal} from '../src/diet.js';
import {foodWeb} from '../src/learning.js';
import {nearbyFoodHints} from '../src/food-hints.js';

test('safe meal guidance agrees for catalog species and live entities',()=>{
 for(const predator of SPECIES)for(const prey of SPECIES){
  assert.equal(suitableMeal(predator,prey),suitableMeal({species:predator},{species:prey}),`${predator.name} / ${prey.name}`);
 }
 const toxic=createSpecies({diet:'hunter',size:170,ability:'toxic'});
 assert.equal(suitableMeal(toxic,SPECIES[20]),false);
});

test('food web preserves safe poisonous meals but excludes meals that only poison the player',()=>{
 for(const [hunter,advertised] of [[17,false],[35,true]]){
  const sim=new Simulation(42);sim.start('practice','s'+hunter);sim.player.energy=40;
  const prey={id:'guidance-lion',species:SPECIES[20],alive:true,abilityTime:0,x:800,y:300};
  assert.equal(foodWeb(sim.player.species).prey.some(s=>s.id==='s20'),advertised);
  assert.equal(foodWeb(SPECIES[20]).predators.some(s=>s.id===sim.player.species.id),advertised);
  sim.consume(prey);
  assert.equal(sim.events.some(e=>e.type==='eat'),advertised);
  assert.equal(sim.events.some(e=>e.type==='poison'),!advertised);
  assert.equal(sim.player.energy>40,advertised);
 }
});

test('food hints omit active defenses and return the prey after defense expires',()=>{
 const sim=new Simulation(42);sim.start('practice','s17');
 const prey={id:'guidance-spines',species:SPECIES[5],alive:true,abilityTime:4,x:810,y:300};
 sim.section.entities=[prey];sim.section.food=[];
 const before=sim.serialize();
 assert.deepEqual(nearbyFoodHints(sim),[]);
 assert.equal(sim.serialize(),before);
 sim.consume(prey);assert.match(sim.events.at(-1).text,/defending itself/);
 prey.abilityTime=0;
 assert.deepEqual(nearbyFoodHints(sim),[prey]);
 sim.player.energy=40;sim.consume(prey);
 assert.equal(sim.events.at(-1).type,'eat');assert.equal(prey.alive,false);
});
