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
