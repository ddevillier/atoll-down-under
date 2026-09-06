import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,distance} from '../src/simulation.js';

function fixture(){
 const s=new Simulation(42);s.start('practice','s1');s.section.entities=[];
 const food=s.section.food.find(f=>f.food==='algae');food.x=300;food.y=300;
 s.player.x=800;s.player.y=300;s.player.angle=Math.PI;s.player.energy=60;
 return {s,food};
}
function ticks(s,seconds){for(let i=0;i<seconds*60;i++)s.step(1/60);}

test('moving the cursor releases a clicked meal and gives swimming control back',()=>{
 const {s,food}=fixture();assert.equal(s.eatAt(food.x,food.y),true);ticks(s,.5);
 assert.equal(s.player.target,food.id);const turnFrom=s.player.x;
 s.point(1150,250);assert.equal(s.player.target,null);ticks(s,4);
 assert.ok(s.player.x>turnFrom+100,'fish should swim toward the new cursor position');
 assert.equal(food.amount,100,'abandoned food must not be eaten at a distance');
 assert.equal(s.events.some(e=>e.type==='eat'),false);
 assert.equal(s.protected,false,'changing direction does not restore arrival protection');
});

test('clicking empty water abandons a meal even without a pointer-move event',()=>{
 const {s,food}=fixture();s.eatAt(food.x,food.y);
 assert.equal(s.eatAt(1100,250),false);assert.equal(s.player.target,null);
 assert.deepEqual(s.pointer,{x:1100,y:250});ticks(s,5);
 assert.ok(distance(s.player,s.pointer)<8);assert.equal(food.amount,100);
});

test('leaving the cursor at a clicked meal still approaches it and eats on contact',()=>{
 const {s,food}=fixture();s.eatAt(food.x,food.y);ticks(s,.5);
 assert.equal(food.amount,100);assert.equal(s.events.some(e=>e.type==='eat'),false);
 ticks(s,4);assert.equal(food.amount,65);assert.equal(s.player.target,null);
 assert.equal(s.events.filter(e=>e.type==='eat').length,1);
 assert.ok(s.player.energy>70);
});

test('an observation pause does not accept swimming or eating commands',()=>{
 const {s,food}=fixture();s.paused=true;const before=s.serialize();
 s.point(1100,200);assert.equal(s.eatAt(food.x,food.y),false);
 assert.equal(s.serialize(),before);
});

test('a meal consumed by a neighbor cancels the approach without pursuing an empty spot',()=>{
 const {s,food}=fixture();s.eatAt(food.x,food.y);ticks(s,.25);
 const before={x:s.player.x,y:s.player.y};food.regrow=8;
 s.step(1/60);assert.equal(s.mealTarget,null);assert.equal(s.player.target,null);
 assert.deepEqual({x:s.player.x,y:s.player.y},before);
 assert.match(s.events.at(-1).text,/meal is no longer available/);
 ticks(s,9);assert.deepEqual({x:s.player.x,y:s.player.y},before);
 assert.equal(s.events.filter(e=>e.text.includes('no longer available')).length,1);
 assert.equal(s.eatAt(food.x,food.y),true);assert.equal(s.mealTarget,food);ticks(s,5);
 assert.equal(food.amount,65);
});

test('a vanished animal meal is also released and new steering works immediately',()=>{
 const {s}=fixture(),prey=structuredClone(s.player);Object.assign(prey,{id:'meal',x:350,y:300});s.section.entities=[prey];
 s.eatAt(prey.x,prey.y);prey.alive=false;prey.respawn=24;s.step(1/60);
 assert.equal(s.mealTarget,null);assert.equal(s.player.target,null);
 s.point(1100,250);ticks(s,5);assert.ok(distance(s.player,s.pointer)<8);
});

test('meal feedback reports the energy actually gained when the meter is nearly full',()=>{
 const {s,food}=fixture();s.player.energy=98;s.consume(food);
 const meal=s.events.find(e=>e.type==='eat');assert.equal(meal.energyGained,2);assert.equal(s.player.energy,100);
 s.player.biteCooldown=0;s.consume(food);assert.equal(s.events.at(-1).energyGained,0);
});
