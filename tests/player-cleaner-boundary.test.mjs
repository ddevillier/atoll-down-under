import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {SPECIES} from '../src/data.js';
import {requestPlayerService,parasiteDamage} from '../src/player-cleaner.js';
import {cleanerInspection} from '../src/cleaner-motion.js';

function edgeScene(id,x,y,facing){
 const s=new Simulation(42);s.start('practice',id);
 const c={...structuredClone(s.section.entities[0]),id:900,species:SPECIES[29],
  x,y,angle:facing<0?Math.PI:0,facing,health:65,biteDamage:10,poisonDamage:5,
  stun:0,alive:true,target:null,feeding:null,cleanTime:0,rest:0,satiated:60,think:10};
 s.section.entities=[c];s.section.food=[];
 Object.assign(s.player,{x:x<800?110:1490,y,angle:0,energy:50});
 s.point(s.player.x,y);assert.equal(requestPlayerService(s,c),true);
 return {s,c};
}

for(const id of ['s43','s45'])test(id+' completes physical inspection at mirrored edges and corners',()=>{
 for(const [x,facing] of [[10,1],[1590,-1]])for(const y of [25,350,720]){
  const {s,c}=edgeScene(id,x,y,facing);
  for(let i=0;i<1800&&s.player.service;i++){
   const oldPlayer={x:s.player.x,y:s.player.y},oldClient={x:c.x,y:c.y};
   const contact=cleanerInspection(s.player,c),before=c.health;
   s.step(1/60);
   assert.ok(Math.hypot(s.player.x-oldPlayer.x,s.player.y-oldPlayer.y)<=s.player.species.speed/60+.001,JSON.stringify({id,x,y,i,oldPlayer,p:[s.player.x,s.player.y],speed:s.player.species.speed}));
   assert.ok(Math.hypot(c.x-oldClient.x,c.y-oldClient.y)<=c.species.speed*.45/60+.001);
   if(c.health>before)assert.ok(Math.hypot(s.player.x-contact.x,s.player.y-contact.y)<=7.001,'healing requires physical contact');
  }
  assert.equal(s.player.service,null,'edge visit must finish');
  assert.ok(parasiteDamage(c)<.02);assert.equal(c.biteDamage,10);assert.equal(c.poisonDamage,5);
  assert.deepEqual(s.adventure.clients,['s29']);
  assert.equal(s.events.filter(e=>e.type==='clean').length,1);
 }
});

test('repositioning an edge client replays deterministically from a paused checkpoint',()=>{
 const {s}=edgeScene('s45',10,25,1);
 for(let i=0;i<12;i++)s.step(1/60);
 const restored=Simulation.restore(s.serialize()),snapshot=restored.serialize();
 restored.step(1);assert.equal(restored.serialize(),snapshot);restored.paused=false;
 for(let i=0;i<1200&&s.player.service;i++){s.step(1/60);restored.step(1/60);}
 assert.equal(s.player.service,null);assert.equal(restored.serialize(),s.serialize());
});
