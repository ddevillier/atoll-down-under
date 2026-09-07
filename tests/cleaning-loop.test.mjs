import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,healthState} from '../src/simulation.js';
const ticks=(s,n)=>{for(let i=0;i<n*60;i++)s.step(1/60);};
function visit(id='s1'){
 const s=new Simulation(42);s.start('practice',id);
 const c=s.section.entities.find(e=>e.species.ability==='clean');
 Object.assign(c,{x:700,y:300,station:{x:700,y:300}});
 s.section.entities=[c];s.section.food=[];
 Object.assign(s.player,{x:500,y:300,angle:0,health:60,energy:90});s.point(500,300);
 return {s,c};
}
test('day and night cleaner clicks request a visit rather than a meal',()=>{
 for(const id of ['s1','s53']){
  const {s,c}=visit(id);assert.equal(s.eatAt(c.x,c.y),true);
  assert.equal(s.player.target,null);assert.equal(s.mealTarget,null);assert.equal(s.player.cleanerTarget,c.id);
  assert.match(s.cleaningStatus,/Visiting/);ticks(s,6);
  assert.equal(c.alive,true);assert.equal(s.player.health,100);assert.equal(s.player.cleanerTarget,null);
  assert.ok(s.events.some(e=>e.type==='clean'));assert.ok(!s.events.some(e=>e.type==='eat'));
 }
});
test('cleaning restores health visibly over time and steering cancels without losing that benefit',()=>{
 const {s,c}=visit();s.player.x=735;s.point(735,300);s.requestCleaning(c);ticks(s,1.2);
 assert.ok(s.player.health>60&&s.player.health<100);assert.match(s.cleaningStatus,/% complete/);
 const health=s.player.health;s.point(1000,300);
 assert.equal(s.player.cleanerTarget,null);assert.equal(s.player.cleanTime,0);ticks(s,.4);assert.equal(s.player.health,health);
 assert.equal(s.events.some(e=>e.type==='clean'),false);
});
test('a requested visit waits for an existing NPC treatment and then completes',()=>{
 const {s,c}=visit();s.player.x=735;s.point(735,300);
 const client=structuredClone(s.player);Object.assign(client,{id:990,health:40,target:c.id,cleanTime:1,cleanerTarget:null,think:0});s.section.entities.push(client);
 s.requestCleaning(c);assert.match(s.cleaningStatus,/Waiting your turn/);ticks(s,.8);
 assert.equal(s.player.cleanTime,0);assert.equal(s.player.health,60);ticks(s,5);
 assert.ok(client.health>99);assert.equal(s.player.health,100);assert.equal(c.alive,true);
});
test('no-need requests do not fake treatment and unavailable cleaners release the approach',()=>{
 const {s,c}=visit();s.player.health=100;assert.equal(s.requestCleaning(c),false);assert.match(s.events.at(-1).text,/No parasites/);
 s.player.health=60;s.requestCleaning(c);c.alive=false;c.respawn=20;ticks(s,.1);
 assert.equal(s.player.cleanerTarget,null);assert.equal(s.player.cleanTime,0);assert.match(s.events.at(-1).text,/no longer available/);
});
test('a saved cleaning visit resumes deterministically and preserves non-parasite harm',()=>{
 const {s,c}=visit();Object.assign(s.player,{x:735,health:35,biteDamage:25,poisonDamage:10,recoveryDelay:10});s.point(735,300);
 s.requestCleaning(c);ticks(s,1);
 const loaded=Simulation.restore(s.serialize());loaded.paused=false;ticks(s,2);ticks(loaded,2);
 assert.equal(loaded.serialize(),s.serialize());assert.deepEqual(healthState(s.player),{parasites:0,injury:25,poison:10});
});
test('a legacy player meal target aimed at a cleaner is released without a bite',()=>{
 const {s,c}=visit('s53');s.player.x=c.x;s.player.y=c.y;s.player.target=c.id;
 const loaded=Simulation.restore(s.serialize());loaded.paused=false;ticks(loaded,.1);
 assert.equal(loaded.section.entities[0].alive,true);assert.equal(loaded.player.target,null);
 assert.equal(loaded.events.some(e=>e.type==='eat'),false);
});
