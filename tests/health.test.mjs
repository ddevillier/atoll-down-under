import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,healthState} from '../src/simulation.js';
const ticks=(s,seconds)=>{for(let i=0;i<seconds*60;i++)s.step(1/60);};
function station(){
 const s=new Simulation(71);s.start('practice','s1');
 const cleaner=s.section.entities.find(e=>e.species.ability==='clean');s.section.entities=[cleaner];
 s.player.x=cleaner.x+30;s.player.y=cleaner.y;s.point(s.player.x,s.player.y);
 return s;
}

test('cleaning removes the parasite portion without healing a poisonous meal',()=>{
 const s=station();s.player.health=80;
 s.consume(s.section.food.find(f=>f.food==='sponge'));
 assert.deepEqual(healthState(s.player),{parasites:20,poison:25,injury:0});
 ticks(s,3);
 assert.equal(s.player.health,75);assert.equal(s.player.poisonDamage,25);
 assert.equal(healthState(s.player).parasites,0);assert.ok(s.events.some(e=>e.type==='clean'));
});

test('cleaning removes parasites while preserving bite injury and its cause',()=>{
 const s=station();Object.assign(s.player,{health:45,biteDamage:35,recoveryDelay:10,lastHarm:{type:'bite',name:'Coral grouper'}});
 ticks(s,3);assert.equal(s.player.health,65);assert.equal(s.player.biteDamage,35);assert.equal(s.player.lastHarm.name,'Coral grouper');
});

test('cleaners do not perform a fake treatment when there are no parasites',()=>{
 const s=station();s.consume(s.section.food.find(f=>f.food==='sponge'));ticks(s,3);
 assert.equal(s.player.cleanTime,0);assert.equal(s.player.health,75);assert.ok(!s.events.some(e=>e.type==='clean'));
});

test('a fed fish recovers gradually without needing a cleaner',()=>{
 const s=station();s.section.entities=[];s.consume(s.section.food.find(f=>f.food==='sponge'));
 ticks(s,9);assert.equal(s.player.health,75);
 ticks(s,70);assert.ok(s.player.health>99.9);assert.equal(s.player.poisonDamage,0);
 assert.equal(s.player.lastHarm,null);assert.ok(s.events.some(e=>e.type==='recover'));
});

test('recovery does not remove parasites and resumes after adequate feeding',()=>{
 const s=station();s.section.entities=[];s.player.health=80;s.consume(s.section.food.find(f=>f.food==='sponge'));s.player.energy=35;
 ticks(s,20);assert.equal(s.player.health,55);
 s.player.biteCooldown=0;s.consume(s.section.food.find(f=>f.food==='algae'));ticks(s,70);
 assert.ok(Math.abs(s.player.health-80)<.001);assert.ok(Math.abs(healthState(s.player).parasites-20)<.001);
});

test('saved injury and poison recover deterministically after loading',()=>{
 const s=station();s.section.entities=[];s.consume(s.section.food.find(f=>f.food==='sponge'));ticks(s,13);
 const loaded=Simulation.restore(s.serialize());loaded.paused=false;
 ticks(s,15);ticks(loaded,15);assert.equal(loaded.serialize(),s.serialize());
});

test('legacy saves preserve known poison loss and reject corrupt recovery state',()=>{
 const s=station();s.consume(s.section.food.find(f=>f.food==='sponge'));
 const old=JSON.parse(s.serialize());for(const k of ['poisonDamage','biteDamage','recoveryDelay'])delete old.player[k];
 const loaded=Simulation.restore(old);assert.equal(loaded.player.health,75);assert.equal(loaded.player.poisonDamage,25);
 assert.equal(healthState(loaded.player).parasites,0);
 const bad=JSON.parse(s.serialize());bad.player.biteDamage=-1;assert.throws(()=>Simulation.restore(bad),/damaged/);
});
