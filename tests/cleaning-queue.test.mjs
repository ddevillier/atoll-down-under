import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,W,H,distance} from '../src/simulation.js';
import {REEFS,BY_ID} from '../src/data.js';
import {creatureWidth} from '../src/geometry.js';

const ticks=(s,seconds)=>{for(let i=0;i<seconds*60;i++)s.step(1/60);};
function queue(id='s1',reef=4){
 const s=new Simulation(42);s.start('practice',id);s.current=reef;
 const cleaner=s.section.entities.find(e=>e.species.ability==='clean');
 const dock={x:cleaner.station.x+35,y:cleaner.station.y};
 // This fixture measures queue service. A hungry recovered grouper can eat a
 // later client, so keep these clients fed while testing eventual treatment.
 const clients=['s1','s12','s16','s22'].map((id,i)=>({...structuredClone(s.player),id:'client-'+i,species:BY_ID[id],...dock,health:40,satiated:60,target:cleaner.id,cleanTime:i===0?1:0}));
 s.section.entities=[cleaner,...clients];s.section.food=[];
 Object.assign(s.player,{x:800,y:600,health:40});s.point(800,600);
 return {s,cleaner,clients};
}

test('waiting clients have distinct body-spaced destinations inside every reef',()=>{
 for(const id of ['s1','s53'])for(const reef of REEFS){
  const {s,clients}=queue(id,reef.id),plan=s.cleaningPlan();
  assert.equal(plan.client,clients[0]);
  const positions=clients.map(e=>({...plan.destinations.get(e.id),r:creatureWidth(e.species)/2+12}));
  for(let i=1;i<positions.length;i++){
   const a=positions[i];assert.ok(a.x>=a.r&&a.x<=W-a.r&&a.y>=a.r&&a.y<=H-a.r);
   for(let j=0;j<i;j++)assert.ok(distance(a,positions[j])>=a.r+positions[j].r-1e-8);
  }
 }
});

test('a player joins without displacing current treatment and is served before waiting NPCs',()=>{
 const {s,cleaner,clients}=queue();s.requestCleaning(cleaner);
 const plan=s.cleaningPlan(),playerSpot=plan.destinations.get('player');
 assert.equal(plan.client,clients[0]);assert.ok(distance(playerSpot,plan.destinations.get(clients[0].id))>80);
 ticks(s,1);assert.equal(s.player.cleanTime,0);assert.ok(clients[0].cleanTime>1);
 ticks(s,1.2);assert.ok(clients[0].health>99);assert.equal(s.cleaningPlan().client,s.player);
 const clientHealth=clients.slice(1).map(e=>e.health);ticks(s,10);
 assert.equal(s.player.health,100);assert.equal(cleaner.alive,true);
 assert.equal(s.section.entities.length,5);
 assert.ok(clientHealth.every(h=>h<41));
});

test('queued visits survive saves and every NPC eventually receives treatment',()=>{
 const {s,cleaner,clients}=queue();s.requestCleaning(cleaner);ticks(s,.5);
 const restored=Simulation.restore(s.serialize());restored.paused=false;
 ticks(s,45);ticks(restored,45);
 assert.equal(s.serialize(),restored.serialize());
 assert.equal(s.player.health,100);
 for(const client of clients)assert.ok(client.health>95,client.id+' should have completed treatment');
});
