import test from 'node:test';import assert from 'node:assert/strict';import {Simulation} from '../src/simulation.js';import {SPECIES} from '../src/data.js';import {contactGap,approachMeal} from '../src/feeding-contact.js';import {recordVelocity} from '../src/motion-velocity.js';
test('a faster player reaches and eats a genuinely fleeing goby without an endless docking gap',()=>{
 const s=new Simulation(42);s.start('practice','s28');s.section.food=[];const prey={...structuredClone(s.player),id:'moving-goby',species:SPECIES[2],x:800,y:400,angle:0,facing:1,health:100,energy:100,satiated:60,target:null,think:0};s.section.entities=[prey];Object.assign(s.player,{x:600,y:400,angle:0,facing:1,energy:60});s.eatAt(prey.x,prey.y);let gap=null;const consume=s.consume;s.consume=function(e){gap=contactGap(this.player,e);consume.call(this,e);};
 for(let i=0;i<360&&!s.events.some(e=>e.type==='eat');i++)s.step(1/60);assert.equal(s.events.filter(e=>e.type==='eat').length,1);assert.ok(gap<=3);assert.ok(s.player.energy>60);assert.ok(prey.x>800);
});
test('moving-meal corrections remain within the animal speed and do not move stationary food',()=>{
 const s=new Simulation(42);s.start('practice','s28');const p=s.player,target={...structuredClone(p),id:'prey',species:SPECIES[2],x:p.x+90,y:p.y,vx:1000,vy:1000};let old={x:p.x,y:p.y};approachMeal(p,target,1/60,100);assert.ok(Math.hypot(p.x-old.x,p.y-old.y)<=100/60+1e-8);
 const food={id:'food',food:'shrimp',size:22,x:p.x+80,y:p.y,vx:1000,vy:1000};old={...food};approachMeal(p,food,1/60,100);assert.deepEqual(food,old);
});
test('travel, respawn and invalid time do not create velocity impulses',()=>{
 const e={species:SPECIES[28],x:100,y:100,alive:true};recordVelocity(e,{x:99,y:100,alive:true},1/60);assert.equal(e.vx,60);recordVelocity(e,{x:1500,y:100,alive:true},1/60);assert.equal(e.vx,0);recordVelocity(e,{x:99,y:100,alive:false},1/60);assert.equal(e.vx,0);recordVelocity(e,{x:99,y:100,alive:true},0);assert.equal(e.vx,0);
});
