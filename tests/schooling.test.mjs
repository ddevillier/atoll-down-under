import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,distance} from '../src/simulation.js';

function school(){
 const s=new Simulation(64);s.start('practice','s0');
 const group=s.section.entities.filter(e=>e.species.id==='s0').slice(-3);
 s.section.entities=group;s.section.food=[];s.player.x=1300;s.player.y=650;
 group.forEach((e,i)=>Object.assign(e,{x:600+i*65,y:300,angle:0,health:100,satiated:100,think:10,target:null,behavior:'Digesting a meal'}));
 return {s,group};
}

test('daytime open-water habitats contain a small same-species school',()=>{
 const s=new Simulation(64);s.start('practice','s0');
 for(const section of s.sections.slice(0,3)){
  const group=section.entities.filter(e=>e.species.id==='s0');
  assert.ok(group.length>=3);
  assert.ok(group.every(e=>e.species.active==='day'));
 }
});

test('school neighbors coordinate while maintaining space over an extended swim',()=>{
 const {s,group}=school();
 for(let i=0;i<1200;i++)for(const e of group)s.stepNpc(e,1/60);
 assert.ok(group.every(e=>e.behavior==='Swimming with a school'));
 const gaps=[distance(group[0],group[1]),distance(group[1],group[2]),distance(group[0],group[2])];
 assert.ok(Math.min(...gaps)>20,JSON.stringify(gaps));
 assert.ok(Math.max(...gaps)<200,JSON.stringify(gaps));
 s.observe(group[0]);assert.equal(s.observations[0].behavior,'Swimming with a school');
});

test('a school member can leave to feed and then rejoin its neighbors',()=>{
 const {s,group}=school(),fish=group[0];
 fish.satiated=0;fish.think=0;
 const food={id:'meal',kind:'food',food:'plankton',name:'Plankton',x:fish.x+85,y:fish.y-30,size:20,amount:100,regrow:0};
 s.section.food=[food];s.stepNpc(fish,.05);
 assert.equal(fish.target,'meal');assert.equal(fish.behavior,'Foraging for Plankton');
 fish.x=food.x;fish.y=food.y;s.stepNpc(fish,.05);
 assert.ok(food.amount<100);assert.equal(fish.target,null);assert.equal(fish.behavior,'Swimming with a school');
});

test('matching player fish participates without the school steering the player',()=>{
 const {s,group}=school(),fish=group[0];s.section.entities=[fish];
 s.player.x=fish.x+120;s.player.y=fish.y+80;s.player.angle=.5;
 const before=structuredClone(s.player);s.stepNpc(fish,.05);
 assert.equal(fish.behavior,'Swimming with a school');assert.ok(fish.angle>0);
 assert.deepEqual(s.player,before);
});

test('school movement and observations resume deterministically from a save',()=>{
 const {s}=school();for(let i=0;i<60;i++)s.step(1/60);
 s.observe(s.section.entities[0]);const restored=Simulation.restore(s.serialize());restored.paused=false;
 for(let i=0;i<120;i++){s.step(1/60);restored.step(1/60);}
 assert.equal(restored.serialize(),s.serialize());
});
