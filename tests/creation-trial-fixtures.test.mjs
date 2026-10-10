import test from 'node:test';
import assert from 'node:assert/strict';
import {creationTrial} from '../src/creation-trial.js';
import {DEFAULT_BLUEPRINT,abilityIssue} from '../src/creations.js';
import {edible} from '../src/diet.js';
import {attractingLure} from '../src/lure-motion.js';
import {exportDive} from '../src/save-files.js';

test('legal small lurers have safe visitors that respond through normal lure rules',()=>{
 for(const active of ['day','night'])for(const size of [35,40,45,50,75]){
  const config={...DEFAULT_BLUEPRINT,active,size,diet:'hunter',ability:'lure'};
  assert.equal(abilityIssue(config),'');
  const sim=creationTrial(config);
  assert.equal(sim.section.entities.length,2);
  assert.equal(sim.useAbility(),true);
  for(const visitor of sim.section.entities){
   assert.equal(edible(sim.player,visitor),true,`${active} size ${size}`);
   assert.equal(visitor.species.poison,false);
   assert.equal(visitor.species.diet.includes('fish'),false);
   assert.equal(attractingLure(sim,visitor,edible),sim.player);
  }
 }
});

test('crushing hunters and omnivores can eat an authored shell in the trial',()=>{
 for(const active of ['day','night'])for(const diet of ['hunter','omnivore']){
  const sim=creationTrial({...DEFAULT_BLUEPRINT,active,diet,ability:'crush',size:35});
  const shell=sim.section.entities.find(e=>e.species.food==='crab');
  assert.ok(shell?.groundRoute);
  assert.equal(edible(sim.player,shell),true);
  assert.equal(edible({...sim.player.species,ability:'none'},shell),false);
  sim.consume(shell);
  assert.equal(shell.alive,false);
  assert.ok(sim.player.energy>55);
  assert.deepEqual(sim.creation.memories,[]);
  assert.throws(()=>exportDive(sim,'trial'),/Test swims are not saved/);
  assert.equal(sim.transition(1,0),false);
  const reset=creationTrial({...DEFAULT_BLUEPRINT,active,diet,ability:'crush',size:35});
  assert.equal(reset.section.entities.find(e=>e.species.food==='crab').alive,true);
  assert.equal(reset.player.energy,55);
 }
});
