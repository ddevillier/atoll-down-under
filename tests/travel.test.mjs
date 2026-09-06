import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,distance,W,H} from '../src/simulation.js';
import {SPECIES} from '../src/data.js';

function quiet(id='s6'){
 const s=new Simulation(42);s.start('practice',id);
 for(const section of s.sections){section.entities=[];section.food=[];}
 s.protected=false;return s;
}
function pursuit(dx,dy){
 const s=quiet(),p=s.player;
 Object.assign(p,{x:dx>0?W-5:dx<0?5:800,y:dy>0?H-5:dy<0?5:350,angle:Math.atan2(dy,dx)});
 s.point(p.x,p.y);
 const hunter=structuredClone(p);
 Object.assign(hunter,{id:'pursuer',species:SPECIES[50],x:p.x-dx*150,y:p.y-dy*150,target:'player',pursuit:2,satiated:0,rest:0,think:1,health:100});
 s.section.entities=[hunter];return {s,hunter};
}

test('crossing a habitat preserves a pursuer position relative to the player',()=>{
 for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const {s,hunter}=pursuit(dx,dy),old=s.section;
  const offset={x:hunter.x-s.player.x,y:hunter.y-s.player.y},seed=s.seed;
  s.transition(dx,dy);
  assert.deepEqual({x:hunter.x-s.player.x,y:hunter.y-s.player.y},offset);
  assert.equal(s.seed,seed,'crossing must not randomize the pursuer location');
  assert.equal(old.entities.includes(hunter),false);assert.equal(s.section.entities.includes(hunter),true);
  assert.equal(hunter.pursuit,2);assert.equal(hunter.target,'player');
 }
});

test('a following predator swims into the new habitat without snapping into bite range',()=>{
 for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const {s,hunter}=pursuit(dx,dy);s.transition(dx,dy);
  for(let i=0;i<15;i++){
   const before={x:hunter.x,y:hunter.y};s.step(1/60);
   assert.ok(distance(before,hunter)<=hunter.species.speed/60+.01,'one frame cannot move a predator across the gap');
  }
  assert.equal(s.events.some(e=>e.type==='hurt'),false);
  assert.ok(distance(hunter,s.player)>120);
  // A genuine continued pursuit still reaches the fish if it waits in place.
  for(let i=0;i<3*60;i++)s.step(1/60);
  assert.ok(s.events.some(e=>e.type==='hurt'));assert.equal(hunter.target,null);
 }
});

test('ending a pursuit at an entry edge permits a calm arrival without an attack',()=>{
 const {s,hunter}=pursuit(0,-1);s.transition(0,-1);hunter.pursuit=5.99;
 for(let i=0;i<5*60;i++)s.step(1/60);
 assert.ok(hunter.y>=25&&hunter.y<=H-20);assert.equal(hunter.target,null);
 assert.ok(hunter.rest>9);assert.equal(s.events.some(e=>e.type==='hurt'),false);
});

test('saved crossings preserve the incoming pursuit and deterministic continuation',()=>{
 const {s}=pursuit(-1,0);s.transition(-1,0);s.step(1/60);
 const restored=Simulation.restore(s.serialize());restored.paused=false;s.events=[];
 for(let i=0;i<180;i++){s.step(1/60);restored.step(1/60);}
 assert.equal(restored.serialize(),s.serialize());assert.deepEqual(restored.events,s.events);
});

test('aiming near each visible water edge reliably enters the adjacent habitat',()=>{
 for(const [x,y,next] of [[W-14,350,5],[14,350,3],[800,H-14,7],[800,14,1]]){
  const s=quiet();s.point(x,y);
  for(let i=0;i<12*60&&s.current===4;i++)s.step(1/60);
  assert.equal(s.current,next,'an edge command must not stop a few pixels short');
  for(let i=0;i<120;i++)s.step(1/60);
  assert.equal(s.current,next,'one unchanged edge command enters one habitat');
 }
});

test('interior steering and food near an edge remain local interactions',()=>{
 const s=quiet();s.point(30,350);
 for(let i=0;i<12*60;i++)s.step(1/60);
 assert.equal(s.current,4);assert.ok(distance(s.player,s.pointer)<8);
 const food={id:'near-edge',kind:'food',food:'worm',name:'Sand worm',size:20,x:14,y:350,amount:100,regrow:0};s.section.food=[food];
 assert.equal(s.eatAt(food.x,food.y),true);
 for(let i=0;i<120;i++)s.step(1/60);
 assert.equal(food.amount,65);assert.equal(s.current,4);
});
