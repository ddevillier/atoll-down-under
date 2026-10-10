import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,edible} from '../src/simulation.js';
import {contactGap} from '../src/feeding-contact.js';

test('player mouths reach stationary prey at both vertical boundaries from mirrored approaches',()=>{
 for(const [species,y] of [['s18',720],['s55',25],['s18',360],['s55',360]])for(const side of [-1,1]){
  const s=new Simulation(42);s.start('practice',species);
  const prey=s.sections.flatMap(q=>q.entities).find(e=>e.species.id==='s2');
  s.section.entities=[prey];s.section.food=[];
  Object.assign(prey,{x:800,y,stun:60,satiated:100});
  Object.assign(s.player,{x:800+side*200,y:360,angle:side<0?0:Math.PI,facing:-side,energy:60});
  assert.ok(edible(s.player,prey));
  let gap;const consume=s.consume;s.consume=function(target){gap=contactGap(this.player,target);return consume.call(this,target);};
  assert.ok(s.eatAt(prey.x,prey.y));
  for(let i=0;i<1200&&!s.events.some(e=>e.type==='eat');i++)s.step(1/60);
  const label=`${species} prey y=${y}, approach ${side}`;
  assert.equal(s.events.filter(e=>e.type==='eat').length,1,label);
  assert.ok(gap<=3,`${label}: anatomical contact required`);
  assert.equal(s.player.target,null,label);
  assert.ok(s.player.x>=1&&s.player.x<=1599&&s.player.y>=1&&s.player.y<=739,label);
 }
});

test('player edge meals choose the water side at left and right boundaries',()=>{
 for(const x of [10,1590]){
  const s=new Simulation(42);s.start('practice','s18');
  const prey=s.sections.flatMap(q=>q.entities).find(e=>e.species.id==='s2');
  s.section.entities=[prey];s.section.food=[];
  Object.assign(prey,{x,y:360,stun:60,satiated:100});
  Object.assign(s.player,{x:x===10?100:1500,y:250,energy:60});
  let gap;const consume=s.consume;s.consume=function(target){gap=contactGap(this.player,target);return consume.call(this,target);};
  s.eatAt(prey.x,prey.y);
  for(let i=0;i<1200&&!s.events.some(e=>e.type==='eat');i++)s.step(1/60);
  assert.equal(s.events.filter(e=>e.type==='eat').length,1,`prey x=${x}`);
  assert.ok(gap<=3);
  assert.equal(s.player.facing,x===10?-1:1);
 }
});
