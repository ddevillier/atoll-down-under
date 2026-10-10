import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {SPECIES} from '../src/data.js';
import {feedingApproach} from '../src/feeding-contact.js';

function scene(){
 const sim=new Simulation(42);sim.start('practice','s34');
 const puffer={...structuredClone(sim.player),id:999,species:SPECIES[22],x:700,y:300,satiated:100,think:100};
 sim.section.entities=[puffer];sim.section.food=[];
 Object.assign(sim.player,{x:400,y:300,angle:0,facing:1});
 sim.events=[];
 return {sim,puffer};
}
function dock(hunter,prey){
 const plan=feedingApproach(hunter,prey);hunter.x=plan.x;hunter.y=plan.y;
 assert.ok(Math.hypot(hunter.x-prey.x,hunter.y-prey.y)>100,'large mouth reaches prey outside the old center range');
}
function advance(sim){for(let i=0;i<30;i++)sim.step(1/60);}

test('a puffer defends against a player shark approaching with its anatomical mouth',()=>{
 const {sim,puffer}=scene();dock(sim.player,puffer);
 assert.equal(sim.eatAt(puffer.x,puffer.y),true);
 advance(sim);
 assert.equal(puffer.alive,true);
 assert.ok(puffer.cooldown>0);
 assert.ok(sim.events.some(e=>e.type==='ability'&&e.actor===puffer.id));
 assert.equal(sim.player.target,null);
 assert.equal(sim.events.some(e=>e.type==='eat'),false);
});

test('a puffer defends against an NPC shark processed before the prey',()=>{
 const {sim,puffer}=scene();
 const hunter={...structuredClone(sim.player),id:998,target:puffer.id,satiated:0,rest:0,think:100};
 dock(hunter,puffer);
 // Process the attacker first, so the test also covers the visible bite preparation interval.
 sim.section.entities=[hunter,puffer];sim.player.x=1400;sim.player.y=100;sim.point(1400,100);
 advance(sim);
 assert.equal(puffer.alive,true);
 assert.ok(puffer.cooldown>0);
 assert.ok(sim.events.some(e=>e.type==='ability'&&e.actor===puffer.id));
 assert.equal(hunter.target,null);
});

test('a distant shark selecting a puffer does not spend the puffer defense',()=>{
 const {sim,puffer}=scene();sim.player.x=200;sim.player.y=300;
 sim.player.target=puffer.id;
 sim.stepNpc(puffer,1/60);
 assert.equal(puffer.cooldown,0);
 assert.equal(puffer.energy,100);
 assert.equal(sim.events.some(e=>e.type==='ability'),false);
});
