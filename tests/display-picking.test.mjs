import test from 'node:test';
import assert from 'node:assert/strict';
import {BY_ID} from '../src/data.js';
import {creatureFrame,creatureHit,creaturePickFrame,setCreatureDisplayFrame} from '../src/geometry.js';
import {turningPose} from '../src/turn-motion.js';
import {Simulation} from '../src/simulation.js';
import {ReefRenderer} from '../src/render.js';

function turningFish(side,yaw=0){
 const e={id:'turning-shark',species:BY_ID.s34,x:800,y:350,facing:side,angle:side>0?0:Math.PI,alive:true};
 const frame=creatureFrame(e),turn=turningPose({yaw,turnDirection:1},e,0);
 const displayed={...frame,x:frame.x+turn.pivot*frame.width,rotation:turn.bank,width:frame.width*Math.abs(turn.facing)};
 setCreatureDisplayFrame(e,displayed);
 return {e,frame,displayed,side};
}

test('left and right paused turns select the displayed body and exclude water above thin fish',()=>{
 for(const side of [-1,1]){
  const {e,frame,displayed}=turningFish(side);
  const body={x:displayed.x-side*displayed.width*.3*Math.cos(displayed.rotation),y:displayed.y-side*displayed.width*.3*Math.sin(displayed.rotation)};
  assert.equal(creatureHit(e,body),true);
  const empty={x:displayed.x-Math.sin(displayed.rotation)*(displayed.height/2+24),y:displayed.y+Math.cos(displayed.rotation)*(displayed.height/2+24)};
  assert.equal(creatureHit(e,empty),false);
  assert.deepEqual(creaturePickFrame(e),displayed,'paused pose stays stable across repeated picks');
 }
});

test('display frame tracks ordinary motion but resets on respawn, species change, or teleport',()=>{
 const {e,displayed}=turningFish(-1);
 e.x+=2;e.y-=3;
 assert.equal(creaturePickFrame(e).x,displayed.x+2);
 assert.equal(creaturePickFrame(e).y,displayed.y-3);
 e.incarnation=1;
 assert.deepEqual(creaturePickFrame(e),creatureFrame(e));
 setCreatureDisplayFrame(e,displayed);e.species=BY_ID.s32;
 assert.deepEqual(creaturePickFrame(e),creatureFrame(e));
 setCreatureDisplayFrame(e,displayed);e.x+=300;
 assert.deepEqual(creaturePickFrame(e),creatureFrame(e));
 assert.equal(Object.hasOwn(e,'displayFrame'),false);
});

test('closest-target ranking uses the displayed center during a paused turn',()=>{
 const sim=new Simulation(42);sim.start('practice','s8');sim.paused=true;
 const {e,displayed}=turningFish(-1);
 const food={id:'nearby-food',kind:'food',food:'algae',x:displayed.x+15,y:displayed.y,size:28,regrow:0};
 sim.section.entities=[e];sim.section.food=[food];
 assert.equal(sim.findAt(displayed.x,displayed.y),e);
 assert.equal(sim.findAt(food.x,food.y),food);
});

test('entities without a published display frame retain existing selection geometry',()=>{
 const e={species:BY_ID.s34,x:800,y:350,facing:1};
 assert.deepEqual(creaturePickFrame(e),creatureFrame(e));
 assert.equal(creatureHit(e,{x:800,y:350}),true);
 assert.equal(creatureHit(e,{x:1000,y:350}),false);
});

test('renderer publishes the actual frozen turn transform used by picking',()=>{
 const e={id:'paused-turn',species:BY_ID.s34,x:800,y:350,facing:-1,angle:Math.PI,alive:true};
 const translations=[],ctx={save(){},restore(){},translate(x,y){translations.push({x,y});},rotate(){}};
 const renderer=Object.assign(Object.create(ReefRenderer.prototype),{reducedMotion:false,poses:new Map([[e.id,{x:e.x,y:e.y,facing:e.facing,yaw:0,activity:0,motionTime:3,incarnation:0}]]),drawSprite(){}});
 renderer.drawCreature(ctx,e,3,0);
 const picked=creaturePickFrame(e);
 assert.deepEqual({x:picked.x,y:picked.y},translations[0]);
 assert.equal(picked.x,e.x,'the mirror midpoint keeps the visible center continuous');
 assert.deepEqual(picked,renderer.poses.get(e.id).frame);
 assert.equal(creatureHit(e,{x:picked.x+picked.width*.3,y:picked.y}),true);
});

test('restored entity identities do not inherit a previously published display frame',()=>{
 const sim=new Simulation(42);sim.start('practice','s34');
 const before=creatureFrame(sim.player);
 setCreatureDisplayFrame(sim.player,{...before,x:before.x+80});
 assert.notDeepEqual(creaturePickFrame(sim.player),before);
 const restored=Simulation.restore(sim.serialize());
 assert.notEqual(restored.player,sim.player);
 assert.deepEqual(creaturePickFrame(restored.player),creatureFrame(restored.player));
});

test('reentering a scene republishes its entity frame from a fresh renderer pose',()=>{
 const sim=new Simulation(42);sim.start('practice','s34');sim.paused=true;
 const e=sim.player,ctx={save(){},restore(){},translate(){},rotate(){}};
 const renderer=Object.assign(Object.create(ReefRenderer.prototype),{reducedMotion:false,drawSprite(){}});
 renderer.syncScene(sim);e.facing=-1;e.angle=Math.PI;
 renderer.poses.set(e.id,{x:e.x,y:e.y,facing:-1,yaw:0,activity:0,motionTime:3,incarnation:0});
 renderer.drawCreature(ctx,e,3,0);
 assert.equal(creaturePickFrame(e).x,e.x);
 const original=sim.current;sim.current=(original+1)%9;renderer.syncScene(sim);
 sim.current=original;renderer.syncScene(sim);renderer.drawCreature(ctx,e,3,0);
 assert.equal(creaturePickFrame(e).x,e.x);
 assert.equal(creaturePickFrame(e).width,creatureFrame(e).width);
});

test('published turn centers stay continuous across the mirror midpoint in both directions',()=>{
 for(const side of [-1,1]){
  const before=turningFish(side,-.001),after=turningFish(side,.001);
  assert.ok(Math.abs(before.displayed.x-after.displayed.x)<1,'the fish cannot jump across its body width');
  assert.equal(creatureHit(before.e,{x:before.displayed.x,y:before.displayed.y}),true);
  assert.equal(creatureHit(after.e,{x:after.displayed.x,y:after.displayed.y}),true);
 }
});
