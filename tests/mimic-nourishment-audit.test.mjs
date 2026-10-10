import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {SPECIES} from '../src/data.js';
import {DEFAULT_BLUEPRINT} from '../src/creations.js';
import {mimicTrusted} from '../src/ability-rules.js';

function encounter(health){
 const sim=new Simulation(42);
 sim.start('create','custom',{...DEFAULT_BLUEPRINT,ability:'mimic',diet:'hunter'});
 sim.player.energy=20;
 const host={...structuredClone(sim.player),id:'nourishment-host',species:SPECIES[16],x:sim.player.x+70,health,life:100,target:null};
 sim.section.entities=[host];sim.section.food=[];
 return {sim,host};
}

for(const [health,gain,remaining] of [[100,16,94],[4,8,1],[1,0,1],[0,0,0]]){
 test(`mimic nourishment matches available injury at host health ${health}`,()=>{
  const {sim,host}=encounter(health),before=sim.careProgress.nourishment||0;
  sim.consume(host);
  assert.equal(sim.player.energy,20+gain);
  assert.equal(sim.careProgress.nourishment||0,before+gain);
  assert.equal(host.health,remaining);
  assert.equal(host.alive,true);
  assert.equal(sim.player.abilityTime,0);
 });
}

test('a depleted mimic host cannot supply additional nourishment on repeated direct contact',()=>{
 const {sim,host}=encounter(4);
 sim.consume(host);
 assert.equal(sim.player.energy,28);
 for(let i=0;i<8;i++){sim.player.biteCooldown=0;sim.consume(host);}
 assert.equal(sim.player.energy,28);
 assert.equal(sim.careProgress.nourishment,8);
 assert.equal(host.health,1);
 assert.equal(host.alive,true);
});

test('mimic conservation retains passive disguise and a full healthy unactivated nip',()=>{
 const {sim,host}=encounter(100);
 assert.equal(sim.player.abilityTime,0);
 assert.equal(mimicTrusted(sim,host,sim.player),true);
 sim.consume(host);
 assert.equal(sim.player.energy,36);
 assert.equal(host.health,94);
 assert.equal(host.mimicMemory.actor,'player');
 assert.equal(host.mimicMemory.until,sim.time+60);
 assert.equal(mimicTrusted(sim,host,sim.player),false);
});

for(const [health,points] of [[100,500],[4,500],[1,0],[0,0]]){
 test(`Create mimic score reflects a nourishing nip at host health ${health}`,()=>{
  const {sim,host}=encounter(health);sim.score=1200;sim.stageScore=700;
  sim.consume(host);
  assert.equal(sim.score,1200+points);
  assert.equal(sim.stageScore,700+points);
 });
}

test('depleted nips cannot satisfy meal adventure credit, while nourishing nips can',()=>{
 for(const [health,stage] of [[100,2],[4,2],[1,1],[0,1]]){
  const {sim,host}=encounter(health);
  // Attach the simple departed-home journey to this feeding harness so the
  // real mealAdventure dispatcher has observable progress to grant.
  sim.player.species={...sim.player.species,id:'s2'};
  sim.adventure.home={reef:sim.current,x:100,y:100};
  sim.adventure.departed=true;sim.adventure.stage=1;
  sim.consume(host);
  assert.equal(sim.adventure.stage,stage,`host health ${health}`);
 }
});

test('ordinary renewable food still earns Create points at full player energy',()=>{
 const {sim}=encounter(100);sim.player.energy=100;
 const shrimp={id:'scoring-shrimp',kind:'food',food:'shrimp',name:'Small shrimp',x:sim.player.x,y:sim.player.y,size:22,amount:100,regrow:0};
 sim.section.food=[shrimp];sim.score=1200;sim.stageScore=700;
 sim.consume(shrimp);
 assert.equal(sim.player.energy,100);
 assert.equal(sim.score,1700);
 assert.equal(sim.stageScore,1200);
 assert.equal(shrimp.amount,65);
});
