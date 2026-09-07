import test from 'node:test';import assert from 'node:assert/strict';
import {Simulation,edible} from '../src/simulation.js';import {PLAYABLE} from '../src/data.js';
import {exportDive,importDive} from '../src/save-files.js';import {feedingEnvelope} from '../src/feeding-motion.js';
import {deformPoint} from '../src/articulated-motion.js';import {ANIMAL_PROFILES} from '../src/animal-profiles.js';import {ANIMAL_RIGS} from '../src/animal-rigs.js';
function meal(){const s=new Simulation(42);s.start('practice','s1');s.section.entities=[];const f=s.section.food.find(f=>f.food==='algae');s.player.x=f.x-10;s.player.y=f.y;s.player.angle=0;s.player.facing=1;s.player.energy=40;s.eatAt(f.x,f.y);return {s,f};}
test('ordinary feeding visibly prepares before exactly one contact and permits immediate cancellation',()=>{
 const {s,f}=meal();s.step(.05);assert.equal(f.amount,100);assert.ok(feedingEnvelope(s.player)>0);assert.equal(s.player.feeding.committed,false);
 s.point(s.player.x-100,s.player.y);for(let i=0;i<15;i++)s.step(.05);assert.equal(f.amount,100);assert.equal(s.player.feeding,null);
 s.player.x=f.x-10;s.player.y=f.y;s.player.angle=0;s.eatAt(f.x,f.y);
 for(let i=0;i<20;i++)s.step(.05);assert.equal(f.amount,65);assert.equal(s.events.filter(e=>e.type==='eat').length,1);
});
test('pre-contact and post-contact saves resume without a lost or repeated meal',()=>{
 for(const frames of [1,4]){
  const {s,f}=meal();for(let i=0;i<frames;i++)s.step(.05);const copy=importDive(exportDive(s,'Meal')).simulation;copy.paused=false;
  for(let i=0;i<20;i++)copy.step(.05);
  assert.equal(copy.section.food.find(b=>b.id===f.id).amount,65);assert.equal(copy.player.feeding,null);
 }
});
test('an unavailable meal cancels preparation and malformed action state is rejected',()=>{
 const {s,f}=meal();s.step(.05);f.regrow=8;s.step(.05);assert.equal(f.amount,100);assert.equal(s.player.feeding,null);
 s.player.feeding={target:f.id,x:f.x,y:f.y,elapsed:.05,contactAt:NaN,committed:false};assert.throws(()=>Simulation.restore(s.serialize()),/feeding/);
});
test('every playable species reaches its real contact through normal target steering',()=>{
 for(const species of PLAYABLE){
  const s=new Simulation(42);s.start('practice',species.id);const f=[...s.section.food,...s.section.entities].find(f=>f.alive!==false&&!f.species?.poison&&edible(s.player,f));
  assert.ok(f,species.name);s.section.entities=f.kind==='food'?[]:[f];if(f.kind!=='food'){f.stun=10;f.satiated=100;}
  s.player.x=f.x-10;s.player.y=f.y;s.player.angle=0;s.player.energy=40;s.eatAt(f.x,f.y);
  for(let i=0;i<60;i++)s.step(1/60);
  assert.equal(s.events.filter(e=>e.type==='eat').length,1,species.name);assert.ok(s.player.energy>40,species.name);
 }
});
test('puffer inflation expands the body while protecting the eye and leaving the tail size stable',()=>{
 const p=ANIMAL_PROFILES.s22,rig=ANIMAL_RIGS.s22;
 for(const time of [0,.3,.7]){const normal=deformPoint(p,.55,.82,time,.4),puff=deformPoint(p,.55,.82,time,.4,{puff:1});assert.ok(puff.y-normal.y>.15);const [x,y]=rig.eye,eye=deformPoint(p,x,y,time,.4,{puff:1});assert.deepEqual(eye,{x,y});const a=deformPoint(p,0,.5,time,.4),b=deformPoint(p,0,.5,time,.4,{puff:1});assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<.001);}
});
