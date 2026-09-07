import test from 'node:test';import assert from 'node:assert/strict';
import {Simulation,distance} from '../src/simulation.js';import {SPECIES} from '../src/data.js';
import {localRoutine} from '../src/ecology.js';import {exportDive,importDive} from '../src/save-files.js';
const ticks=(s,n)=>{for(let i=0;i<Math.round(n*60);i++)s.step(1/60);};
function scene(id){const s=new Simulation(42);s.start('practice','s1');const e={...structuredClone(s.section.entities[0]),species:SPECIES[id],id:900,x:650,y:350,angle:0,health:100,satiated:120,think:0,target:null,ecology:null,activity:'cruising',rest:0};s.section.entities=[e];s.section.food=[];s.player.x=1450;s.player.y=100;s.point(1450,100);ticks(s,40);return {s,e,home:{...e.ecology.home}};}
function passer(s,e,side=1){s.player.x=e.x+side*80;s.player.y=e.y-35;s.point(s.player.x,s.player.y);}

test('both hawkfish watch a passer on either side without leaving their home or starting a satiated hunt',()=>{
 for(const id of [31,57]){const {s,e,home}=scene(id);passer(s,e);ticks(s,3);assert.equal(e.ecology.watch.id,'player');assert.equal(e.behavior,'Watching a passing fish from its perch');assert.equal(e.facing,1);assert.equal(e.target,null);assert.ok(distance(e,home)<=12.1);
 passer(s,e,-1);ticks(s,3);assert.equal(e.facing,-1);assert.ok(distance(e,home)<=12.1);assert.equal(e.target,null);
 s.player.hidden=true;localRoutine(s,e,.1,30);assert.equal(e.ecology.watch,null);assert.equal(e.behavior,'Watching from a perch');}
});

test('perch watching yields to a meal and danger and returns to the established home',()=>{
 const {s,e,home}=scene(31);passer(s,e);ticks(s,2);assert.ok(e.ecology.watch);s.player.x=1450;s.player.y=100;s.point(1450,100);
 s.section.food=[{id:'perch-shrimp',kind:'food',food:'shrimp',name:'Small shrimp',x:e.x+100,y:e.y-35,size:22,amount:100,regrow:0,phase:0}];e.satiated=0;e.think=0;
 ticks(s,.1);assert.equal(e.ecology.watch,null);assert.equal(e.target,'perch-shrimp');ticks(s,8);assert.ok(s.section.food[0].amount<100);ticks(s,25);assert.deepEqual(e.ecology.home,home);assert.ok(distance(e,home)<20);
 s.player.species=SPECIES[32];passer(s,e);e.think=0;ticks(s,.1);assert.equal(e.activity,'avoiding');assert.equal(e.ecology.watch,null);
});

test('perch attention survives save replay, releases a dead passer and resets on respawn',()=>{
 const {s,e}=scene(57);passer(s,e);ticks(s,2);assert.ok(e.ecology.watch);
 const copy=importDive(exportDive(s,'Perch')).simulation;copy.paused=false;ticks(s,.5);ticks(copy,.5);assert.equal(copy.serialize(),s.serialize());
 s.player.alive=false;localRoutine(s,e,.1,30);assert.equal(e.ecology.watch,null);
 e.alive=false;e.respawn=0;ticks(s,.05);assert.ok(!e.ecology?.watch);
});

test('malformed optional perch attention is rejected while older saves remain valid',()=>{
 const {s,e}=scene(31);delete e.ecology.watch;assert.doesNotThrow(()=>importDive(exportDive(s,'Legacy perch')));
 for(const watch of [{id:'player',until:Infinity},{id:{},until:1},{id:'player',until:-1}]){e.ecology.watch=watch;assert.throws(()=>importDive(exportDive(s,'Damaged')),/damaged/);assert.throws(()=>Simulation.restore(JSON.parse(s.serialize())),/damaged/);}
});

test('travel clears local attention while preserving the familiar home',()=>{
 const {s,e,home}=scene(31);passer(s,e);ticks(s,2);assert.ok(e.ecology.watch);s.transition(1,0);assert.equal(e.ecology.watch,null);assert.deepEqual(e.ecology.home,home);s.transition(-1,0);ticks(s,.1);assert.equal(e.ecology.watch,null);assert.deepEqual(e.ecology.home,home);
});

test('generated communities produce both hawkfish watch interactions without roster replacement',()=>{
 for(const [seed,id] of [[2,'s57'],[7,'s31']]){const s=new Simulation(seed);s.start('practice','s1');const count=s.section.entities.length;let found=false;for(let i=0;i<20*60;i++){s.step(1/60);if(s.section.entities.some(e=>e.species.id===id&&e.behavior==='Watching a passing fish from its perch'&&e.ecology?.watch))found=true;}assert.ok(found,id);assert.equal(s.section.entities.length,count);}
});
