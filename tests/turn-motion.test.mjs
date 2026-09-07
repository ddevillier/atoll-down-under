import test from 'node:test';import assert from 'node:assert/strict';
import {SPECIES} from '../src/data.js';import {turningPose,turnDuration} from '../src/turn-motion.js';
test('swimming turns settle within their authored duration and keep a readable silhouette',()=>{
 for(const species of SPECIES){const p={yaw:1},e={species,facing:-1,angle:-Math.PI*.6};let last;
  for(let i=0;i<60;i++){last=turningPose(p,e,1/60);assert.ok(Math.abs(last.facing)>=.78);assert.ok(Number.isFinite(last.pivot));}
  assert.equal(p.yaw,-1);assert.equal(last.amount,0);assert.equal(last.pivot,0);assert.ok(turnDuration(species)<=.46);
 }
});
test('paused turns freeze and a reversed request resumes from the current pose',()=>{
 const species=SPECIES[32],e={species,facing:-1,angle:2},p={yaw:1};turningPose(p,e,.1);const yaw=p.yaw;
 const a=turningPose(p,e,0),b=turningPose(p,e,0);assert.deepEqual(a,b);assert.equal(p.yaw,yaw);
 e.facing=1;turningPose(p,e,.01);assert.ok(p.yaw>yaw&&p.yaw<1);
});
test('grounded and attached animals do not inherit a swimming bank or pivot',()=>{
 for(const index of [44,46,47,60,61,62,63]){const e={species:SPECIES[index],facing:-1,groundRoute:[[0,0],[100,0]]},p={yaw:1};const a=turningPose(p,e,.05);assert.equal(a.bank,0);assert.equal(a.bend,0);assert.equal(a.pivot,0);}
 const e={species:SPECIES[34],facing:-1},p={yaw:.2};assert.equal(turningPose(p,e,.1,true).facing,-1);assert.equal(p.yaw,-1);
});
