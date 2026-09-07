import test from 'node:test';import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';import {SPECIES} from '../src/data.js';
import {settledCleaningClient} from '../src/cleaning-stations.js';
import {mealContact} from '../src/feeding-motion.js';

function scene(cleanerIndex=43){
 const s=new Simulation(42);s.start('practice','s1');s.protected=false;
 const cleaner=s.section.entities.find(e=>e.species.ability==='clean');Object.assign(cleaner,{species:SPECIES[cleanerIndex],x:700,y:300,station:{x:700,y:300}});
 Object.assign(s.player,{x:1400,y:100});s.point(1400,100);
 const client={...structuredClone(s.player),id:'patient',x:735,y:300,health:40,target:cleaner.id,cleanTime:.5};
 const hunter={...structuredClone(s.player),id:'hunter',species:SPECIES[16],x:755,y:300,health:100,satiated:0,rest:0,target:client.id,think:5};
 s.section.entities=[cleaner,client,hunter];s.section.food=[];return {s,cleaner,client,hunter};
}

test('NPC hunters cancel an imminent bite at a service position and can hunt after the client leaves',()=>{
 for(const cleanerIndex of [43,45]){
  const {s,client,hunter}=scene(cleanerIndex);mealContact(hunter,client,.12);assert.ok(hunter.feeding);
  s.stepNpc(hunter,.05);assert.equal(hunter.target,null);assert.equal(hunter.feeding,null);assert.equal(client.alive,true);
  // The same hungry hunter retains its ordinary diet outside the interaction.
  Object.assign(client,{x:1100,y:400,health:100,target:null,cleanTime:0});Object.assign(hunter,{x:1080,y:400,think:0});
  for(let i=0;i<5*60&&client.alive;i++)s.stepNpc(hunter,1/60);
  assert.equal(client.alive,false,'ordinary hunting resumes outside the service position');assert.ok(hunter.satiated>0);
 }
});

test('waiting positions are respected while a distant request or a lost cleaner gives no protection',()=>{
 const {s,cleaner,client}=scene();const waiting={...structuredClone(client),id:'waiting',x:900,y:300,cleanTime:0};s.section.entities.push(waiting);
 const plan=s.cleaningPlan();Object.assign(waiting,plan.destinations.get(waiting.id));assert.ok(settledCleaningClient(waiting,plan));
 waiting.x+=150;assert.equal(settledCleaningClient(waiting,plan),false);
 Object.assign(s.player,{health:40,x:1400,y:100});s.requestCleaning(cleaner);assert.equal(settledCleaningClient(s.player,s.cleaningPlan()),false);
 cleaner.alive=false;assert.equal(settledCleaningClient(client,s.cleaningPlan()),false);
});

test('a requested player at the dock is spared without practice protection, but moving away releases it',()=>{
 const {s,cleaner,hunter}=scene();s.section.entities=[cleaner,hunter];Object.assign(s.player,{x:735,y:300,health:40});s.requestCleaning(cleaner);
 hunter.target='player';s.stepNpc(hunter,.05);assert.equal(hunter.target,null);assert.equal(s.player.health,40);
 s.point(1000,300);Object.assign(s.player,{x:1000,y:300,still:0});Object.assign(hunter,{x:980,y:300,think:0});
 for(let i=0;i<5*60&&!s.events.some(e=>e.type==='hurt');i++)s.stepNpc(hunter,1/60);
 assert.ok(s.events.some(e=>e.type==='hurt'),'ordinary player predation remains active');
});

test('a treated predator leaves on a bounded foraging pause that survives pause and save',()=>{
 const {s,cleaner,hunter}=scene();s.section.entities=[cleaner,hunter];Object.assign(hunter,{x:735,y:300,health:40,target:cleaner.id,cleanTime:2.98,think:0});
 s.stepNpc(hunter,.05);assert.equal(hunter.health,100);assert.equal(hunter.rest,8);assert.equal(hunter.target,null);
 s.paused=true;const frozen=s.serialize();s.step(.05);assert.equal(s.serialize(),frozen);s.paused=false;
 const copy=Simulation.restore(s.serialize());copy.paused=false;
 for(let i=0;i<9*60;i++){s.step(1/60);copy.step(1/60);}
 assert.equal(copy.serialize(),s.serialize());assert.equal(hunter.rest,0);
});
