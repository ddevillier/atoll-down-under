import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {companionMeal,inviteCompanion} from '../src/companion-activity.js';
import {tickAdventure} from '../src/adventures.js';

test('a player stun interrupts reunion without losing companion meals',()=>{
 for(const id of ['s8','s48','s52','s40','s56']){
  const sim=new Simulation(42);sim.start('practice',id);
  const partner={...structuredClone(sim.player),id:900,x:sim.player.x+100,ecology:null};
  sim.section.entities=[partner];
  assert.equal(inviteCompanion(sim),true,id);
  const foods=id==='s40'?['algae','plankton']:id==='s56'?['plankton','worm']:[sim.player.species.diet[0]];
  for(const food of foods)companionMeal(sim,sim.player,{kind:'food',food});
  companionMeal(sim,partner,{kind:'food',food:partner.species.diet[0]});
  tickAdventure(sim,2.9);
  assert.equal(sim.adventure.complete,false,id);
  sim.player.stun=1;
  tickAdventure(sim,.2);
  assert.equal(sim.adventure.complete,false,id+' cannot finish while stunned');
  assert.equal(sim.adventure.buddy.rejoined,0,id+' interrupted reunion resets');
  assert.equal(sim.adventure.buddy.playerMeal,true,id);
  assert.equal(sim.adventure.buddy.partnerMeal,true,id);
  sim.player.stun=0;
  tickAdventure(sim,2.9);
  assert.equal(sim.adventure.complete,false,id+' needs a fresh three seconds');
  tickAdventure(sim,.2);
  assert.equal(sim.adventure.complete,true,id+' completes normally after recovery');
 }
});
