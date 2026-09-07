import test from 'node:test';import assert from 'node:assert/strict';
import {creatureFrame,creatureHit,groundPitch} from '../src/geometry.js';import {Simulation} from '../src/simulation.js';
test('painted support points stay on their world attachment through direction and slope changes',()=>{
 const s=new Simulation(42);s.start('practice','s1');s.current=6;
 for(const e of s.section.entities.filter(e=>e.groundRoute||e.holdfast))for(const angle of [-.15,0,.15,Math.PI])for(const facing of [-1,1]){
  e.angle=angle;e.facing=facing;const f=creatureFrame(e),sign=['s44','s46','s47','s62','s63'].includes(e.species.id)?1:facing;
  const dx=(f.anchor[0]-.5)*f.width*sign,dy=(f.anchor[1]-.5)*f.height;
  assert.ok(Math.abs(f.x+dx*Math.cos(f.rotation)-dy*Math.sin(f.rotation)-e.x)<1e-9);
  assert.ok(Math.abs(f.y+dx*Math.sin(f.rotation)+dy*Math.cos(f.rotation)-e.y)<1e-9);
 }
});
test('an upright seahorse is selectable at its visible head, torso and tail',()=>{
 const s=new Simulation(42);s.start('practice','s1');s.current=6;const e=s.section.entities.find(e=>e.holdfast),f=creatureFrame(e);s.section.entities=[e];s.section.food=[];
 for(const y of [f.y-f.height*.34,f.y,f.y+f.height*.4])assert.equal(s.findAt(f.x,y),e);
 assert.equal(creatureHit(e,{x:f.x+f.width,y:f.y}),false);assert.equal(groundPitch(e),0);
});
test('bottom sprites and their selection share a frame while free swimmers retain center selection',()=>{
 const s=new Simulation(42);s.start('practice','s1');
 for(const e of s.section.entities){const frame=creatureFrame(e);assert.equal(creatureHit(e,frame),true);if(!e.groundRoute&&!e.holdfast){assert.equal(frame.x,e.x);assert.equal(frame.y,e.y);}}
});
