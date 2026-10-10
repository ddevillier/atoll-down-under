import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {edible} from '../src/diet.js';
import {compatibleShadow} from '../src/refuge-motion.js';
import {escortCandidates,tickEscortFollow,tickEscortJourney} from '../src/escort-journeys.js';

test('generated trumpetfish cover excludes edible filefish and retains the broader parrotfish',()=>{
 const s=new Simulation(42);s.start('practice','s41');
 const prey=s.section.entities.filter(e=>e.species.id==='s48');
 assert.ok(prey.length);
 for(const e of prey){assert.equal(edible(s.player,e),true);assert.equal(compatibleShadow(s.player,e),false);}
 const host=s.section.entities.find(e=>e.species.id==='s15');
 assert.ok(host);assert.equal(edible(s.player,host),false);assert.equal(compatibleShadow(s.player,host),true);
 assert.ok(escortCandidates(s).includes(host));
 assert.ok(escortCandidates(s).every(e=>!edible(s.player,e)));
});

test('night escort releases avoidance and restarts a full quiet reunion afterward',()=>{
 for(const fleeing of [{activity:'avoiding',behavior:'Cruising'},{activity:'cruising',behavior:'Moving away from predator'}]){
  const s=new Simulation(42);s.start('practice','s53');const e=escortCandidates(s)[0];
  s.player.x=e.x;s.player.y=e.y;s.useContext();const j=s.adventure.escortJourney;
  Object.assign(j,{joined:3,flashed:true,meal:true,returned:2.9,following:true});
  Object.assign(e,fleeing);
  assert.equal(escortCandidates(s).includes(e),false);
  assert.equal(tickEscortJourney(s,.2),false);assert.equal(j.returned,0);
  assert.equal(tickEscortFollow(s,1/60),false);assert.equal(j.following,false);
  e.activity='cruising';e.behavior='Exploring';
  assert.equal(tickEscortJourney(s,3),false,'becoming calm alone does not resume following');
  s.useContext();assert.equal(j.following,true);
  assert.equal(tickEscortJourney(s,2),false);assert.equal(tickEscortJourney(s,1),true);
 }
});
