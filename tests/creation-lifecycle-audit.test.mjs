import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {DEFAULT_BLUEPRINT} from '../src/creations.js';
import {REEFS} from '../src/data.js';
import {tickCustomLife} from '../src/custom-life.js';
import {creationTrial} from '../src/creation-trial.js';

function atHome(){
 const sim=new Simulation(23);sim.start('create','custom',DEFAULT_BLUEPRINT);
 const home=REEFS[sim.current].shelters[0];
 Object.assign(sim.player,{x:home.x,y:home.y});sim.pointer={x:home.x,y:home.y};
 assert.equal(sim.useContext(),true);return sim;
}
test('paused refuge life cannot advance; travel and reload preserve its exact home',()=>{
 const sim=atHome(),home=structuredClone(sim.creation.home);
 sim.paused=true;const before=sim.serialize();sim.step(.05);assert.equal(sim.serialize(),before);
 sim.paused=false;assert.equal(sim.transition(1,0),true);sim.step(.05);
 assert.equal(sim.creation.departed,true);assert.deepEqual(sim.creation.home,home);
 const restored=Simulation.restore(sim.serialize());assert.deepEqual(restored.creation,sim.creation);
 assert.equal(restored.paused,true);restored.step(.05);assert.deepEqual(restored.creation,sim.creation);
});
test('death continuation resets the trip and world while preserving identity and memories',()=>{
 const sim=atHome();sim.creation.memories=['meal','refuge','return'];sim.creation.departed=true;sim.creation.meal=true;
 const id=sim.creation.id,oldSections=sim.sections;sim.die('Audit death');sim.continueRun();
 assert.equal(sim.phase,'playing');assert.equal(sim.creation.id,id);assert.equal(sim.creation.life,2);
 assert.deepEqual(sim.creation.memories,['meal','refuge','return']);assert.equal(sim.creation.home,null);
 assert.equal(sim.creation.departed,false);assert.equal(sim.creation.meal,false);assert.notEqual(sim.sections,oldSections);
});
test('refuge return requires a needed meal and settles only once per completed trip',()=>{
 const sim=atHome(),home=REEFS[sim.current].shelters[0];
 sim.player.x=home.x+home.r+20;tickCustomLife(sim);sim.player.energy=100;
 sim.consume(sim.section.food.find(f=>f.food==='algae'));assert.equal(sim.creation.meal,false);
 sim.player.biteCooldown=0;sim.player.energy=70;sim.consume(sim.section.food.find(f=>f.food==='algae'));
 assert.equal(sim.creation.meal,true);Object.assign(sim.player,{x:home.x,y:home.y,hidden:false,still:1});
 tickCustomLife(sim);assert.equal(sim.events.filter(e=>e.type==='homecoming').length,0);
 sim.player.hidden=true;tickCustomLife(sim);tickCustomLife(sim);
 assert.equal(sim.events.filter(e=>e.type==='homecoming').length,1);assert.equal(sim.creation.departed,false);
});
test('a terminal or depleted fish does not acquire a homecoming memory',()=>{
 for(const state of ['dead','depleted']){
  const sim=atHome();sim.creation.departed=true;sim.creation.meal=true;sim.player.hidden=true;sim.player.still=1;
  if(state==='dead')sim.die('Audit death');else sim.player.health=0;
  tickCustomLife(sim);assert.ok(!sim.creation.memories.includes('return'));assert.ok(!sim.events.some(e=>e.type==='homecoming'));
 }
});
test('defensive target clearing reports only the pursuit it actually ends',()=>{
 for(const ability of ['ink','poison','spines','puff']){
  const sim=new Simulation(23);sim.start('create','custom',{...DEFAULT_BLUEPRINT,ability});
  const [hunter,neighbor]=sim.section.entities;hunter.x=neighbor.x=sim.player.x+50;hunter.y=neighbor.y=sim.player.y;
  hunter.target='player';neighbor.target=null;sim.events=[];assert.equal(sim.useAbility(),true);
  const releases=sim.events.filter(e=>e.type==='pursuit-release');assert.equal(releases.length,1);
  assert.equal(releases[0].animalId,hunter.id);assert.equal(releases[0].reason,'defense');assert.equal(hunter.target,null);
 }
});
test('reset trials repeat world opportunities and never retain a personal life',()=>{
 const a=creationTrial(DEFAULT_BLUEPRINT),b=creationTrial(DEFAULT_BLUEPRINT);
 assert.deepEqual(a.sections,b.sections);assert.deepEqual(a.player,b.player);
 a.player.energy=20;a.consume(a.section.food.find(f=>f.food==='algae'));a.step(.05);
 assert.deepEqual(a.creation.memories,[]);assert.equal(a.creation.home,null);assert.equal(a.careProgress.played,0);
 assert.equal(a.transition(1,0),false);assert.equal(a.current,4);assert.notDeepEqual(a.player,b.player);
});
test('modern creation metadata cannot disguise inconsistent live species traits',()=>{
 const sim=atHome(),state=JSON.parse(sim.serialize());
 for(const [key,value] of Object.entries({id:'s5',size:150,speed:220,agility:8,metabolism:.1,ability:'crush',active:'night',diet:['fish'],index:42,atlas:2,cell:10,habitat:'school',parasites:false,poison:true,armor:true,food:'shrimp',endurance:200})){
  const damaged=structuredClone(state);damaged.player.species[key]=value;
  assert.throws(()=>Simulation.restore(damaged),/live fish traits/,key);
 }
});
test('static validation preserves transient state and legacy migration remains resumable',()=>{
 const sim=atHome();Object.assign(sim.player,{energy:57,health:83,cooldown:2,abilityTime:1,angle:.35,still:.4});
 const original=JSON.parse(sim.serialize());const restored=Simulation.restore(original);
 assert.deepEqual(restored.player,sim.player);assert.deepEqual(restored.sections,sim.sections);
 delete original.creation;original.custom.diet='hunter';
 const migrated=Simulation.restore(original);assert.equal(migrated.creation.blueprint.diet,'grazer');
 assert.deepEqual(migrated.player,sim.player);
 const resumed=Simulation.restore(migrated.serialize());assert.deepEqual(resumed.player,migrated.player);assert.equal(resumed.creation.id,migrated.creation.id);
});
test('crushing diet migration accepts only its known former base diet',()=>{
 for(const diet of ['grazer','hunter','omnivore']){
  const sim=new Simulation(23);sim.start('create','custom',{...DEFAULT_BLUEPRINT,ability:'crush',diet});
  const state=JSON.parse(sim.serialize()),expected=[...state.player.species.diet];
  state.player.species.diet=expected.filter(food=>!['coral','crab','snail','urchin'].includes(food));
  assert.deepEqual(Simulation.restore(state).player.species.diet,expected);
  state.player.species.diet=['fish'];assert.throws(()=>Simulation.restore(state),/live fish traits/);
 }
});
