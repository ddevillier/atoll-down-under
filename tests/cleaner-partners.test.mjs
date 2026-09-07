import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,edible} from '../src/simulation.js';
import {SPECIES} from '../src/data.js';

function fixture(id='s53'){
 const s=new Simulation(42);s.start('practice',id);
 const cleaner=s.section.entities.find(e=>e.species.ability==='clean');
 const client=structuredClone(s.player);Object.assign(client,{id:'client',x:600,y:300,angle:0,health:100,target:null,think:0,satiated:0,rest:0,pursuit:0});
 Object.assign(cleaner,{x:620,y:300,station:{x:620,y:300}});
 s.player.x=1300;s.player.y=300;s.section.entities=[client,cleaner];s.section.food=[];
 return {s,client,cleaner};
}

test('hungry night residents leave the cleaner shrimp available and choose ordinary food',()=>{
 for(const id of ['s12','s13','s14','s53']){
  const {s,client,cleaner}=fixture(id);
  assert.equal(edible(client,cleaner),false,'cleaning partners are helpers, not meal targets');
  const food={id:'ordinary-shrimp',kind:'food',food:'shrimp',name:'Small shrimp',x:655,y:300,size:22,amount:100,regrow:0};
  s.section.food=[food];s.stepNpc(client,.05);
  assert.equal(cleaner.alive,true);assert.equal(client.target,food.id);
  for(let i=0;i<300;i++)s.stepNpc(client,1/60);
  assert.ok(food.amount<100,'ordinary shrimp remain food');assert.equal(cleaner.alive,true);
 }
});

test('hungry daytime hunters also recognize the wrasse as a cleaning partner',()=>{
 const {s,client,cleaner}=fixture('s16');assert.equal(edible(client,cleaner),false);
 for(let i=0;i<60;i++)s.stepNpc(client,1/60);
 assert.equal(cleaner.alive,true);assert.equal(client.target,null);
});

test('old saved meal targets do not cause a client to consume its cleaner after loading',()=>{
 const {s,client,cleaner}=fixture();client.target=cleaner.id;client.behavior='Hunting Banded coral shrimp';client.think=5;
 const restored=Simulation.restore(s.serialize());restored.paused=false;
 const eater=restored.section.entities.find(e=>e.id===client.id),partner=restored.section.entities.find(e=>e.id===cleaner.id);
 restored.stepNpc(eater,.05);assert.equal(partner.alive,true);assert.equal(eater.target,null);
 assert.equal(eater.pursuit,0);
});

test('clients still approach and receive parasite removal instead of losing their cleaning target',()=>{
 const {s,client,cleaner}=fixture();client.health=40;client.x=cleaner.station.x+35;
 s.stepNpc(client,.05);assert.equal(client.target,cleaner.id);assert.equal(client.behavior,'Being cleaned');
 for(let i=0;i<190;i++){s.stepNpc(client,1/60);s.stepNpc(cleaner,1/60);}
 assert.ok(client.health>99);assert.equal(client.target,null);assert.equal(cleaner.alive,true);
});

test('a stunned cleaner pauses NPC service and resumes when it can help again',()=>{
 const {s,client,cleaner}=fixture();client.health=40;client.x=cleaner.station.x+35;
 client.target=cleaner.id;client.cleanTime=1;cleaner.stun=5;
 for(let i=0;i<60;i++){s.stepNpc(client,1/60);s.stepNpc(cleaner,1/60);}
 assert.equal(client.cleanTime,1);assert.ok(client.health<41);
 assert.equal(client.behavior,'Waiting for a cleaner');
 cleaner.stun=0;
 for(let i=0;i<130;i++){s.stepNpc(client,1/60);s.stepNpc(cleaner,1/60);}
 assert.ok(client.health>99);assert.equal(client.target,null);
});

test('a recovered saved client releases stale treatment so the player can use the station',()=>{
 const {s,client,cleaner}=fixture();Object.assign(client,{health:100,target:cleaner.id,cleanTime:1});
 Object.assign(s.player,{health:40,x:cleaner.station.x+35,y:cleaner.station.y});
 s.requestCleaning(cleaner);
 const restored=Simulation.restore(s.serialize());restored.paused=false;
 for(let i=0;i<300;i++)restored.step(1/60);
 assert.equal(restored.player.health,100);
 assert.equal(restored.section.entities.find(e=>e.id===client.id).cleanTime,0);
});

test('cleaners reject direct consumption and legacy absent partners return to their station',()=>{
 const {s,cleaner}=fixture();s.player.species=SPECIES[53];s.player.energy=40;
 s.consume(cleaner);assert.equal(cleaner.alive,true);assert.equal(s.player.energy,40);
 cleaner.alive=false;cleaner.respawn=20;
 const restored=Simulation.restore(s.serialize()),returning=restored.section.entities.find(e=>e.id===cleaner.id);
 for(let i=0;i<21*60;i++)restored.stepNpc(returning,1/60);
 assert.equal(returning.alive,true);assert.equal(returning.x,returning.station.x);assert.equal(returning.y,returning.station.y);
});
