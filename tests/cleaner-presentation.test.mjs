import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,healthState} from '../src/simulation.js';
import {SPECIES} from '../src/data.js';
import {cleanerInspection,cleaningPresentation} from '../src/cleaner-motion.js';
import {requestPlayerService} from '../src/player-cleaner.js';

function station(index=43){
 const sim=new Simulation(42);sim.start('practice','s16');
 const cleaner=sim.section.entities.find(e=>e.species.ability==='clean');
 Object.assign(cleaner,{species:SPECIES[index],x:700,y:300,station:{x:700,y:300}});
 sim.section.entities=[cleaner];sim.section.food=[];
 Object.assign(sim.player,{x:500,y:300,health:40,biteDamage:15,poisonDamage:5,recoveryDelay:60,angle:0,facing:1});
 sim.requestCleaning(cleaner);return {sim,cleaner};
}

test('both real station visits visibly pick three areas without changing treatment or saved state',()=>{
 for(const index of [43,45]){
  const {sim,cleaner}=station(index),stages=new Set(),feeding=[];
  for(let ticks=0;ticks<15*60&&!sim.events.some(e=>e.type==='clean');ticks++){
   sim.step(1/60);const before=sim.serialize();
   const work=cleaningPresentation(sim,cleaner),client=cleaningPresentation(sim,sim.player);
   if(work?.mode==='inspect'){
    stages.add(work.stage);feeding.push(work.feed);
    assert.equal(work.role,'cleaner');assert.equal(client.role,'client');
    assert.equal(client.mode,'inspect');assert.equal(client.feed,0);assert.ok(client.brake>.5);
    assert.deepEqual(work.contact,cleanerInspection(cleaner,sim.player).contact);
   const held=cleaningPresentation(sim,cleaner,true);assert.equal(held.phase,work.phase);assert.equal(held.stage,work.stage);
    if(stages.size===1&&feeding.length===1){
     const checkpoint=Simulation.restore(sim.serialize()),partner=checkpoint.section.entities.find(e=>e.id===cleaner.id);
     assert.deepEqual(cleaningPresentation(checkpoint,partner),work,'a saved inspection keeps the same real pose');
    }
   }
   assert.equal(sim.serialize(),before,'pose inspection cannot mutate even saved progress');
  }
  assert.deepEqual([...stages],[0,1,2]);assert.ok(Math.max(...feeding)-Math.min(...feeding)>.3);
  assert.deepEqual(healthState(sim.player),{parasites:0,injury:15,poison:5});
  assert.equal(sim.events.filter(e=>e.type==='clean').length,1);assert.equal(sim.section.entities.length,1);
  assert.equal(cleaningPresentation(sim,sim.player),null,'completed player is free to swim');
  sim.step(1/60);assert.equal(cleaningPresentation(sim,cleaner)?.mode,'depart');
 }
});

test('known departure expires on real rest and immediately yields to danger or feeding',()=>{
 const {sim,cleaner}=station();
 const client={...structuredClone(sim.player),id:'departing',cleanTime:0,target:null,rest:7.8,behavior:'Digesting a meal',activity:'cruising'};
 sim.section.entities.push(client);
 const previous={role:'client',mode:'inspect',cleaner:cleaner.id,client:client.id};
 assert.equal(cleaningPresentation(sim,client),null,'ordinary rest alone is not a cleaning reaction');
 const first=cleaningPresentation(sim,client,false,previous);assert.equal(first.mode,'depart');
 client.rest=2;const later=cleaningPresentation(sim,client,false,first);assert.ok(later.release>first.release);assert.ok(later.brake<first.brake);
 for(const patch of [{rest:0},{target:'food'},{feeding:{target:'food'}},{activity:'avoiding'},{alive:false},{stun:1}]){
  const baseline=structuredClone(client);Object.assign(client,patch);
  assert.equal(cleaningPresentation(sim,client,false,previous),null);Object.assign(client,baseline);
 }
 assert.equal(cleaningPresentation(sim,client,false,{...previous,client:'another-fish'}),null);
 cleaner.alive=false;assert.equal(cleaningPresentation(sim,client,false,previous),null);
});

test('queued, distant, missing and interrupted partners cannot show picking or gain health from drawing',()=>{
 const {sim,cleaner}=station();
 Object.assign(sim.player,{cleanTime:.8,x:800,y:300});Object.assign(cleaner,{x:300,y:150});
 const before=sim.serialize(),distant=cleaningPresentation(sim,cleaner);
 assert.equal(distant.mode,'approach');assert.equal(distant.feed,0);assert.equal(distant.picking,0);
 const client={...structuredClone(sim.player),id:'queued',target:cleaner.id,cleanTime:0,behavior:'Waiting for a cleaner'};
 sim.section.entities.push(client);assert.equal(cleaningPresentation(sim,client),null);
 sim.section.entities.pop();assert.equal(sim.serialize(),before);
 for(const patch of [{alive:false},{stun:1},{hidden:true},{health:0}]){
  const saved={alive:cleaner.alive,stun:cleaner.stun,hidden:cleaner.hidden,health:cleaner.health};
  Object.assign(cleaner,patch);assert.equal(cleaningPresentation(sim,cleaner),null);assert.equal(cleaningPresentation(sim,sim.player),null);
  Object.assign(cleaner,saved);
 }
 sim.section.entities=[];assert.equal(cleaningPresentation(sim,sim.player),null);
});

test('wrasse and shrimp have distinct picking poses while client contact geometry stays unchanged',()=>{
 const {sim,cleaner}=station();Object.assign(sim.player,{cleanTime:.45});
 const samples=[];
 for(const index of [43,45]){
  cleaner.species=SPECIES[index];Object.assign(cleaner,cleanerInspection(cleaner,sim.player));
  const original={x:sim.player.x,y:sim.player.y,angle:sim.player.angle,facing:sim.player.facing};
  const plan=cleaningPresentation(sim,cleaner),client=cleaningPresentation(sim,sim.player);
  assert.equal(plan.mode,'inspect');assert.equal(client.mode,'inspect');samples.push(plan);
  assert.deepEqual({x:sim.player.x,y:sim.player.y,angle:sim.player.angle,facing:sim.player.facing},original);
 }
 assert.notEqual(samples[0].feed,samples[1].feed);assert.notEqual(samples[0].effort,samples[1].effort);
 assert.notEqual(samples[0].contact.y,samples[1].contact.y,'mouth below flank and shrimp claws above remain distinct');
});

test('player helper completion stays at its real client and releases pose on cancel, travel or death',()=>{
 for(const id of ['s43','s45']){
  const scene=()=>{
   const sim=new Simulation(42);sim.start('practice',id);
   const client={...structuredClone(sim.player),id:'patient',species:SPECIES[29],x:900,y:350,health:65,biteDamage:10,poisonDamage:5,stun:0,alive:true,target:null,feeding:null,cleanTime:0,rest:0,satiated:60,think:10};
   sim.section.entities=[client];sim.section.food=[];Object.assign(sim.player,{x:700,y:350,energy:50,angle:0});return {sim,client};
  };
  const {sim,client}=scene();let committedPosition;
  const emit=sim.event.bind(sim);sim.event=(type,...args)=>{if(type==='clean')committedPosition={x:client.x,y:client.y};emit(type,...args);};
  assert.equal(requestPlayerService(sim,client),true);
  let work=null,clientPose=null;for(let ticks=0;ticks<1800&&sim.player.service;ticks++){sim.step(1/60);work=cleaningPresentation(sim,sim.player)||work;clientPose=cleaningPresentation(sim,client,false,clientPose);}
  assert.equal(work.mode,'inspect');const completion=sim.events.find(e=>e.type==='clean');
  assert.equal(completion.animalId,client.id);assert.deepEqual({x:completion.x,y:completion.y},committedPosition);
  assert.equal(cleaningPresentation(sim,sim.player),null);assert.equal(clientPose?.mode,'depart');
  assert.equal(client.biteDamage,10);assert.equal(client.poisonDamage,5);assert.equal(sim.section.entities.length,1);
  for(const interrupt of ['cancel','travel','death']){
   const next=scene();requestPlayerService(next.sim,next.client);next.sim.step(1/60);
   if(interrupt==='cancel')next.sim.point(200,100);
   else if(interrupt==='travel')next.sim.transition(1,0);
   else{next.client.alive=false;next.sim.step(1/60);}
   assert.equal(next.sim.player.service,null);assert.equal(cleaningPresentation(next.sim,next.sim.player),null);
  }
 }
});
