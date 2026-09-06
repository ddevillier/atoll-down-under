import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,edible,distance} from '../src/simulation.js';
import {SPECIES,REEFS} from '../src/data.js';
import {BOTTOM_RESIDENTS,placeOnGround,walkOnGround,validGroundState} from '../src/ground-motion.js';

function distanceToRoute(e,route){
 return Math.min(...route.slice(1).map((b,i)=>{
  const a=route[i],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((e.x-a[0])*dx+(e.y-a[1])*dy)/(dx*dx+dy*dy)));
  return Math.hypot(e.x-a[0]-t*dx,e.y-a[1]-t*dy);
 }));
}

test('bottom residents remain on their local substrate throughout movement',()=>{
 const s=new Simulation(42);s.start('practice','s53');
 for(let i=0;i<9;i++){
  s.current=i;s.section.entities=s.section.entities.filter(e=>BOTTOM_RESIDENTS.has(e.species.id));
  for(let n=0;n<600;n++)for(const e of s.section.entities){
   s.stepNpc(e,1/30);assert.ok(validGroundState(e));
   assert.ok(distanceToRoute(e,e.groundRoute)<.001);
  }
  assert.equal(s.section.entities.length,6);
 }
});

test('crawlers turn at a ledge end while attached animals remain still',()=>{
 const snail={species:SPECIES[61]},anemone={species:SPECIES[63]},route=[[100,400],[220,400]];
 placeOnGround(snail,route,.9);placeOnGround(anemone,route,.5);
 for(let i=0;i<60*30;i++){walkOnGround(snail,1/30);walkOnGround(anemone,1/30);}
 assert.ok(snail.x>=100&&snail.x<=220);assert.ok(snail.x<200);assert.equal(snail.y,400);
 assert.equal(anemone.x,160);assert.equal(anemone.y,400);
});

test('bottom prey remain edible and return on the same route after consumption',()=>{
 const s=new Simulation(42);s.start('practice','s24');
 const crab=s.section.entities.find(e=>e.species.id==='s46');s.section.entities=[crab];
 assert.equal(edible(s.player,crab),true);s.player.energy=40;
 s.player.x=crab.x-50;s.player.y=crab.y;s.player.angle=0;s.eatAt(crab.x,crab.y);
 for(let i=0;i<3*60;i++)s.step(1/60);
 assert.equal(crab.alive,false);assert.ok(s.player.energy>45);
 for(let i=0;i<21*60;i++)s.stepNpc(crab,1/60);
 assert.equal(crab.alive,true);assert.ok(distanceToRoute(crab,crab.groundRoute)<.001);
});

test('old and damaged route metadata can resume on the nearest local substrate',()=>{
 for(const invalid of [undefined,[[0,0],[0,0]]]){
  const s=new Simulation(42);s.start('practice','s1');const crab=s.section.entities.find(e=>e.species.id==='s46');
  s.section.entities=[crab];crab.x=1500;crab.y=100;crab.groundRoute=invalid;delete crab.groundDistance;
  const restored=Simulation.restore(s.serialize());restored.paused=false;restored.step(1/60);
  const e=restored.section.entities[0];assert.ok(validGroundState(e));
  assert.ok(REEFS[restored.current].bottomRoutes.some(r=>distanceToRoute(e,r)<.001));
  const again=Simulation.restore(restored.serialize());assert.deepEqual(again.section.entities,restored.section.entities);
 }
});

test('the non-playable seahorse occurs beside meadow plants and keeps its holdfast',()=>{
 const s=new Simulation(42);s.start('practice','s1');s.current=6;
 const seahorse=s.section.entities.find(e=>e.species.id==='s44');assert.ok(seahorse);assert.equal(seahorse.species.playable,false);
 assert.ok(s.section.food.some(f=>f.food==='grass'&&distance(f,seahorse)<40));
 const start={x:seahorse.x,y:seahorse.y};
 for(let i=0;i<600;i++)s.stepNpc(seahorse,1/30);
 assert.deepEqual({x:seahorse.x,y:seahorse.y},start);assert.equal(seahorse.behavior,'Among the seagrass');
 const saved=Simulation.restore(s.serialize());assert.deepEqual(saved.section.entities.find(e=>e.id===seahorse.id).holdfast,start);
});
