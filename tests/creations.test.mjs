import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {DEFAULT_BLUEPRINT,newCreation,validateCreation,abilityIssue} from '../src/creations.js';
import {exportDive,importDive} from '../src/save-files.js';
import {createSpecies} from '../src/data.js';
import {REEFS} from '../src/data.js';
import {creationTrial} from '../src/creation-trial.js';
import {tickCustomLife} from '../src/custom-life.js';
test('draft edits cannot change a saved crushing grazer',()=>{
 const draft={...DEFAULT_BLUEPRINT,ability:'crush',name:'Pebble'};
 const a=new Simulation(17);a.start('create','custom',draft);
 draft.diet='hunter';draft.name='Another fish';
 const b=importDive(exportDive(a,'Pebble')).simulation;
 assert.equal(b.player.species.name,'Pebble');assert.deepEqual(b.player.species.diet,['algae','grass','plankton','coral']);
 assert.equal(b.creation.id,a.creation.id);assert.equal(b.creation.blueprint.diet,'grazer');
 b.creation.blueprint.name='Changed';assert.equal(a.creation.blueprint.name,'Pebble');
});
test('variation owns its configuration and records its parent',()=>{
 const a=newCreation(DEFAULT_BLUEPRINT);const b=newCreation(a.blueprint,a.id);b.blueprint.size=120;
 assert.notEqual(a.id,b.id);assert.equal(b.parentId,a.id);assert.equal(a.blueprint.size,75);
});
test('legacy dives migrate without changing live body or state',()=>{
 const a=new Simulation(17);a.start('create','custom',{...DEFAULT_BLUEPRINT,body:'slender'});
 const state=JSON.parse(a.serialize());delete state.creation;
 const b=importDive(JSON.stringify({format:'atoll-dive',version:1,state})).simulation;
 assert.ok(b.creation.id);assert.deepEqual(b.player,a.player);assert.deepEqual(b.sections,a.sections);
});
test('explicit body survives statistic changes and invalid memories are rejected',()=>{
 const c={...DEFAULT_BLUEPRINT,body:'rounded'};const a=createSpecies(c),b=createSpecies({...c,speed:220});
 assert.equal(a.atlas,b.atlas);assert.equal(a.cell,b.cell);assert.equal(a.habitat,b.habitat);
 assert.throws(()=>validateCreation({...newCreation(c),memories:['pretend']}));
 assert.match(abilityIssue({...c,ability:'lure'}),/prey/);
});
test('refuge memories require departure, a needed meal and real concealment',()=>{
 const sim=new Simulation(23);sim.start('create','custom',DEFAULT_BLUEPRINT);
 const home=REEFS[sim.current].shelters[0];sim.player.x=home.x;sim.player.y=home.y;sim.pointer={x:home.x,y:home.y};assert.equal(sim.useContext(),true);
 tickCustomLife(sim);assert.equal(sim.creation.departed,false);assert.deepEqual(sim.creation.memories,[]);
 sim.player.x=800;sim.player.y=300;tickCustomLife(sim);assert.equal(sim.creation.departed,true);
 sim.player.energy=80;sim.consume(sim.section.food.find(f=>f.food==='algae'));assert.equal(sim.creation.meal,true);
 sim.player.x=home.x;sim.player.y=home.y;sim.pointer={x:home.x,y:home.y};
 for(let i=0;i<60;i++)sim.step(1/60);
 assert.ok(sim.creation.memories.includes('return'));assert.equal(sim.creation.departed,false);
 const restored=Simulation.restore(sim.serialize());assert.deepEqual(restored.creation,sim.creation);
 restored.continueRun();assert.equal(restored.creation.life,2);assert.equal(restored.creation.home,null);assert.ok(restored.creation.memories.includes('return'));
});
test('test swims share shelter and hunger rules while excluding persistence rewards',()=>{
 for(const size of [120,125]){const sim=creationTrial({...DEFAULT_BLUEPRINT,size});const home=REEFS[4].shelters[0];sim.player.x=home.x;sim.player.y=home.y;sim.pointer={x:home.x,y:home.y};for(let i=0;i<90;i++)sim.step(1/60);assert.equal(sim.player.hidden,size===120);assert.deepEqual(sim.creation.memories,[]);assert.equal(sim.careProgress.played,0);assert.equal(sim.transition(1,0),false);}
 const a=creationTrial({...DEFAULT_BLUEPRINT,endurance:50}),b=creationTrial({...DEFAULT_BLUEPRINT,endurance:250});
 for(let i=0;i<600;i++){a.step(1/60);b.step(1/60);}assert.ok(b.player.energy>a.player.energy);
 a.player.energy=.01;a.player.health=.01;a.step(1/60);assert.equal(a.phase,'playing');
});
