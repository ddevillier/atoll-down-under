import test from 'node:test';import assert from 'node:assert/strict';
import {Simulation,distance} from '../src/simulation.js';import {SPECIES} from '../src/data.js';
import {localRoutine} from '../src/ecology.js';import {exportDive,importDive} from '../src/save-files.js';
function scene(ids){const s=new Simulation(42);s.start('practice','s1');const base=s.section.entities[0];s.section.entities=ids.map((id,i)=>({...structuredClone(base),id:900+i,species:SPECIES[id],x:600+i*80,y:400,angle:0,health:100,satiated:60,rest:0,target:null,think:1,activity:'cruising',behavior:'Exploring'}));s.player.x=1400;s.player.y=100;return s;}
test('a rabbitfish pair persists through a feeding excursion, save and death cleanup',()=>{
 const s=scene([8,8]);const [a,b]=s.section.entities;
 localRoutine(s,a,.1,20);assert.equal(a.ecology.partner,b.id);assert.equal(b.ecology.partner,a.id);
 b.target='meal';localRoutine(s,a,.1,20);assert.equal(a.ecology.partner,b.id);
 const copy=importDive(exportDive(s,'Pair')).simulation;assert.equal(copy.section.entities[0].ecology.partner,b.id);
 b.alive=false;localRoutine(s,a,.1,20);assert.equal(a.ecology.partner,null);
});
test('anemonefish returns to a living host then releases a missing host',()=>{
 const s=scene([7,63]),[fish,host]=s.section.entities;host.x=800;host.y=500;const before=distance(fish,host);
 for(let i=0;i<30*20;i++){const speed=localRoutine(s,fish,1/30,25);fish.x+=Math.cos(fish.angle)*speed/30;fish.y+=Math.sin(fish.angle)*speed/30;}
 assert.equal(fish.ecology.host,host.id);assert.ok(distance(fish,host)<before/2);assert.equal(fish.activity,'at-home');
 host.alive=false;localRoutine(s,fish,.1,20);assert.equal(fish.ecology.host,null);
});
test('trumpetfish shadows a broader compatible neighbor without overriding a meal or avoidance',()=>{
 const s=scene([41,40]),[fish,host]=s.section.entities;localRoutine(s,fish,.1,20);assert.equal(fish.ecology.host,host.id);assert.equal(fish.activity,'shadowing');
 fish.target='meal';fish.activity='feeding';assert.equal(localRoutine(s,fish,.1,35),35);assert.equal(fish.activity,'feeding');
 fish.target=null;fish.activity='avoiding';assert.equal(localRoutine(s,fish,.1,40),40);
});
test('new local ecology fields reject invalid save state',()=>{
 const s=scene([8,8]);localRoutine(s,s.section.entities[0],.1,20);
 const file=JSON.parse(exportDive(s,'Damaged'));file.state.sections[s.current].entities[0].ecology.reef=99;
 assert.throws(()=>importDive(JSON.stringify(file)),/damaged/);
});
