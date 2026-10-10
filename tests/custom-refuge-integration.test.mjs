import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,edible} from '../src/simulation.js';
import {REEFS} from '../src/data.js';
import {refugeRole} from '../src/creations.js';
import {customInstruction,tickCustomLife} from '../src/custom-life.js';

function setup(diet,size=75){
 const sim=new Simulation(42);sim.start('create','custom',{diet,size});
 const site=REEFS[sim.current].shelters[0];
 Object.assign(sim.player,{x:site.x,y:site.y});sim.point(site.x,site.y);
 return {sim,site};
}

test('every shelter-sized custom diet can choose, feed, save, and return to its refuge',()=>{
 for(const diet of ['grazer','hunter','omnivore']){
  const {sim,site}=setup(diet);
  assert.equal(refugeRole(sim.creation),true,diet);
  assert.equal(sim.useContext(),true,diet);
  sim.player.x=site.x+site.r+20;tickCustomLife(sim);
  sim.player.energy=60;
  const meal=[...sim.section.food,...sim.section.entities].find(f=>edible(sim.player,f));
  assert.ok(meal,diet+' has a suitable meal');sim.consume(meal);
  assert.equal(sim.creation.meal,true,diet);
  const saved=Simulation.restore(sim.serialize());saved.paused=false;
  Object.assign(saved.player,{x:site.x,y:site.y,hidden:false,still:0});
  assert.equal(saved.useContext(),true,diet);
  assert.equal(saved.creation.departed,true);assert.equal(saved.creation.meal,true);
  assert.match(customInstruction(saved),/Return to your refuge/);
  Object.assign(saved.player,{hidden:true,still:1});tickCustomLife(saved);tickCustomLife(saved);
  assert.ok(saved.creation.memories.includes('return'),diet);
  assert.equal(saved.events.filter(e=>e.type==='homecoming').length,1);
 }
});

test('changing custom refuges resets the trip while the size limit remains enforced',()=>{
 const {sim}=setup('omnivore');sim.useContext();
 sim.creation.departed=true;sim.creation.meal=true;
 const other=REEFS[sim.current].shelters[1];Object.assign(sim.player,{x:other.x,y:other.y});
 assert.equal(sim.useContext(),true);assert.equal(sim.creation.home.index,1);
 assert.equal(sim.creation.departed,false);assert.equal(sim.creation.meal,false);
 for(const diet of ['grazer','hunter','omnivore']){
  const {sim:large}=setup(diet,125);
  assert.equal(refugeRole(large.creation),false);assert.equal(large.useContext(),false);
  assert.equal(large.creation.home,null);
 }
});
