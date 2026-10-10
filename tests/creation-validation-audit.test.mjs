import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_BLUEPRINT,blueprint,abilityIssue} from '../src/creations.js';
import {ABILITIES,createSpecies} from '../src/data.js';
import {Simulation} from '../src/simulation.js';
import {exportDive,importDive} from '../src/save-files.js';

const atBudget={...DEFAULT_BLUEPRINT,size:170,speed:190,endurance:250,agility:160,ability:'toxic'};

test('a legal creation exactly at the workshop budget survives portable import',()=>{
 assert.equal(createSpecies(atBudget).cost,1600);
 const sim=new Simulation(42);sim.start('create','custom',atBudget);
 const restored=importDive(exportDive(sim,'At budget')).simulation;
 assert.deepEqual(restored.creation.blueprint,sim.creation.blueprint);
 assert.deepEqual(restored.player.species,sim.player.species);
});

test('matching imported blueprint and live traits cannot bypass workshop legality',()=>{
 const sim=new Simulation(42);sim.start('create','custom',DEFAULT_BLUEPRINT);
 for(const [config,message] of [
  [{...atBudget,agility:165},/1600 point budget/],
  [{...DEFAULT_BLUEPRINT,ability:'mimic'},/hunter diet/],
  [{...DEFAULT_BLUEPRINT,ability:'lure'},/suitable animal prey/],
  [{...DEFAULT_BLUEPRINT,size:30,diet:'hunter',ability:'lure'},/suitable animal prey/]
 ]){
  const file=JSON.parse(exportDive(sim,'Invalid creation'));
  file.state.custom=structuredClone(config);
  file.state.creation.blueprint=structuredClone(config);
  file.state.player.species=createSpecies(config);
  assert.throws(()=>importDive(JSON.stringify(file)),message);
 }
});

test('all legal standard workshop combinations retain their normalized blueprint',()=>{
 for(const body of ['rounded','slender','sturdy'])for(const diet of ['grazer','omnivore','hunter'])for(const ability of Object.keys(ABILITIES)){
  if(ability==='clean')continue;
  const config={...DEFAULT_BLUEPRINT,body,diet,ability};
  if(abilityIssue(config))continue;
  assert.deepEqual(blueprint(config),config);
 }
 const smallLure={...DEFAULT_BLUEPRINT,size:35,diet:'hunter',ability:'lure'};
 assert.deepEqual(blueprint(smallLure),smallLure);
});

test('legal legacy appearance remains legacy when validated and restored',()=>{
 const legacy={name:'Legacy',body:'sturdy',size:75,speed:140,endurance:150,agility:150,ability:'none',active:'day',diet:'grazer',color:'#60bba5'};
 const sim=new Simulation(42);sim.start('create','custom',legacy);
 assert.equal(sim.creation.blueprint.appearanceVersion,0);
 const restored=importDive(exportDive(sim,'Legacy')).simulation;
 assert.deepEqual(restored.creation,sim.creation);
 assert.deepEqual(restored.player.species,sim.player.species);
});

test('modern creation live identity must match its blueprint',()=>{
 const sim=new Simulation(42);sim.start('create','custom',DEFAULT_BLUEPRINT);
 for(const [key,value] of [['name','Different'],['color','#ff0000']]){
  const state=JSON.parse(sim.serialize());state.player.species[key]=value;
  assert.throws(()=>Simulation.restore(state),/live fish traits/);
  const portable=JSON.parse(exportDive(sim,'Identity'));portable.state.player.species[key]=value;
  assert.throws(()=>importDive(JSON.stringify(portable)),/live fish traits/);
 }
});
