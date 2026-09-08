import test from 'node:test';import assert from 'node:assert/strict';
import {Simulation,healthState} from '../src/simulation.js';
import {SPECIES,PLAYABLE,PRACTICE_SPECIES} from '../src/data.js';
import {requestPlayerService,parasiteDamage,treatingClient} from '../src/player-cleaner.js';
import {recordProgress,freshJournal,validateJournal} from '../src/journal.js';
const step=s=>s.step(1/60);
function scene(id='s43'){
 const s=new Simulation(42);s.start('practice',id);const c={...structuredClone(s.section.entities[0]),id:900,species:SPECIES[29],x:900,y:350,angle:0,facing:1,health:65,biteDamage:10,poisonDamage:5,stun:0,alive:true,target:null,feeding:null,cleanTime:0,rest:0,satiated:60,think:10};s.section.entities=[c];s.section.food=[];Object.assign(s.player,{x:700,y:350,angle:0,energy:50});s.point(700,350);return {s,c};
}
test('both Practice cleaner roles approach at bounded speed and nourish themselves by removing only parasites',()=>{
 for(const id of ['s43','s45']){const {s,c}=scene(id);assert.equal(requestPlayerService(s,c),true);let moving=false,working=false;
  for(let i=0;i<30*60&&s.player.service;i++){const before={x:s.player.x,y:s.player.y};step(s);assert.ok(Math.hypot(s.player.x-before.x,s.player.y-before.y)<=s.player.species.speed/60+.001);moving=true;if(s.player.service?.elapsed>0)working=true;}
  assert.ok(moving&&working);assert.equal(s.player.service,null);assert.ok(parasiteDamage(c)<.02);assert.equal(c.biteDamage,10);assert.equal(c.poisonDamage,5);assert.ok(s.player.energy>50);assert.deepEqual(s.adventure.clients,['s29']);assert.equal(s.events.filter(e=>e.type==='clean').length,1);
 }
});
test('steering away stops treatment and repeated requests cannot create more nutrition than real parasite removal',()=>{
 const {s,c}=scene();requestPlayerService(s,c);for(let i=0;i<900&&!(s.player.service?.removed>5);i++)step(s);assert.ok(s.player.service.removed>5);const before=healthState(c),energy=s.player.energy;s.point(500,150);assert.equal(s.player.service,null);assert.equal(c.cleanTime,0);assert.deepEqual(healthState(c),before);
 for(let i=0;i<10;i++)step(s);assert.ok(s.player.energy<=energy);requestPlayerService(s,c);for(let i=0;i<1500&&s.player.service;i++)step(s);assert.ok(parasiteDamage(c)<.02);assert.ok(s.player.energy<=63.02);assert.equal(requestPlayerService(s,c),false);
});
test('service progress survives a checkpoint, freezes on pause, and releases its client on travel',()=>{
 const {s,c}=scene();requestPlayerService(s,c);for(let i=0;i<900&&!(s.player.service?.removed>3);i++)step(s);const restored=Simulation.restore(s.serialize());const paused=restored.serialize();restored.step(10);assert.equal(restored.serialize(),paused);restored.paused=false;
 for(let i=0;i<120;i++){step(s);step(restored);}assert.equal(restored.serialize(),s.serialize());
 const next=scene();requestPlayerService(next.s,next.c);step(next.s);next.s.transition(1,0);assert.equal(next.s.player.service,null);assert.equal(next.c.cleanTime,0);
 const corrupted=JSON.parse(s.serialize());corrupted.player.service={client:900,reef:4,total:10,removed:20,elapsed:1};assert.throws(()=>Simulation.restore(corrupted));
});
test('client loss or competing treatment cancels without awarding a completed visit',()=>{
 for(const interrupt of [c=>{c.alive=false;},c=>{c.stun=1;}]){const {s,c}=scene();requestPlayerService(s,c);interrupt(c);step(s);assert.equal(s.player.service,null);assert.equal(s.events.filter(e=>e.type==='clean').length,0);}
});
test('Practice cleaner choices and persistent care recognition do not change survival rosters or NPC counts',()=>{
 assert.equal(PLAYABLE.length,55);assert.equal(PRACTICE_SPECIES.length,57);
 for(const id of ['s43','s45']){const s=new Simulation(42);s.start('practice',id);const baseline=new Simulation(42);baseline.start('practice',id==='s43'?'s1':'s13');assert.deepEqual(s.sections.map(r=>r.entities.length),baseline.sections.map(r=>r.entities.length));assert.ok(s.sections.every(r=>r.entities.filter(e=>e.species.ability==='clean').length===1));const j=freshJournal();recordProgress(j,'played',id);recordProgress(j,'activity','helper');assert.ok(j.earned.helper);assert.deepEqual(validateJournal(j).played,[id]);}
});

test('a distant invited client redirects an unstarted station trip and approaches at bounded speed',()=>{
 const {s,c}=scene();c.x=1300;c.target=901;
 const cleaner={...structuredClone(c),id:901,species:SPECIES[43],x:1400,station:{x:1400,y:350},target:null,health:100};s.section.entities.push(cleaner);
 assert.equal(requestPlayerService(s,c),true);assert.equal(c.target,null);assert.equal(treatingClient(s,c),false);
 assert.notEqual(s.cleaningPlan().client,c);assert.equal(s.cleaningPlan().destinations.has(c.id),false);
 const x=c.x,y=c.y;step(s);assert.ok(s.player.service);assert.equal(c.behavior,'Coming to you for cleaning');
 assert.ok(Math.hypot(c.x-x,c.y-y)<=c.species.speed*.45/60+.001);assert.equal(s.player.service.removed,0);
 for(let i=0;i<1800&&s.player.service;i++)step(s);
 assert.equal(s.player.service,null);assert.ok(parasiteDamage(c)<.02);assert.equal(s.events.filter(e=>e.type==='clean').length,1);
});

test('active station treatment cannot be stolen and a dead client releases partial inspection state',()=>{
 const {s,c}=scene();c.cleanTime=.5;assert.equal(requestPlayerService(s,c),false);assert.equal(c.cleanTime,.5);
 c.cleanTime=0;assert.equal(requestPlayerService(s,c),true);
 for(let i=0;i<900&&!(s.player.service?.removed>3);i++)step(s);
 assert.ok(c.cleanTime>0);c.alive=false;step(s);assert.equal(s.player.service,null);assert.equal(c.cleanTime,0);
 assert.equal(s.events.filter(e=>e.type==='clean').length,0);assert.equal(s.adventure.clients,undefined);
});
