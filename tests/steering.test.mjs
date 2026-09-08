import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,distance} from '../src/simulation.js';
import {SPECIES,PRACTICE_SPECIES} from '../src/data.js';

function fixture(angle){
 const s=new Simulation(42);s.start('practice','s1');s.section.entities=[];s.section.food=[];
 s.player.angle=angle;return s;
}
function samePose(a,b){
 assert.ok(distance(a,b)<.00001,'whole rotations must not change the swimming path');
 assert.ok(Math.abs(Math.sin(a.angle)-Math.sin(b.angle))<.00001);
 assert.ok(Math.abs(Math.cos(a.angle)-Math.cos(b.angle))<.00001);
}

test('all Practice species settle at nearby mouse destinations instead of circling indefinitely',()=>{
 for(const species of PRACTICE_SPECIES)for(const angle of [0,Math.PI/2,Math.PI,-Math.PI/2]){
  const s=new Simulation(42);s.start('practice',species.id);s.section.entities=[];s.section.food=[];Object.assign(s.player,{x:800,y:300,angle});s.point(800,330);
  for(let i=0;i<10*60;i++)s.step(1/60);
  assert.ok(distance(s.player,{x:800,y:330})<=7,species.name+' should arrive from heading '+angle);assert.ok(s.player.still>1,species.name+' should settle');
 }
});

test('steering remains responsive after accumulated full turns, including a loaded dive',()=>{
 const baseline=fixture(0);baseline.point(1100,330);
 const others=[-10,10,50].map(n=>{const s=fixture(n*Math.PI*2);s.point(1100,330);const saved=Simulation.restore(s.serialize());saved.paused=false;return saved;});
 for(let i=0;i<120;i++){
  baseline.step(1/60);
  for(const s of others){s.step(1/60);samePose(s.player,baseline.player);}
 }
});

function npcCase(turns,behavior){
 const s=fixture(0);s.player.x=100;s.player.y=100;
 const e=structuredClone(s.player);Object.assign(e,{id:'client',species:SPECIES[behavior==='school'?0:1],x:800,y:300,angle:turns*Math.PI*2,target:null,think:100,satiated:100,rest:0,pursuit:0});
 s.section.entities=[e];
 if(behavior==='food'){
  s.section.food=[{id:'algae',kind:'food',food:'algae',name:'Algae',x:1100,y:330,size:28,amount:100,regrow:0}];e.target='algae';e.satiated=0;
 }else if(behavior==='clean'){
  const cleaner=structuredClone(e);Object.assign(cleaner,{id:'cleaner',species:SPECIES[43],x:1100,y:330,station:{x:1100,y:330}});s.section.entities.push(cleaner);e.health=40;
 }else{
  const neighbor=structuredClone(e);Object.assign(neighbor,{id:'neighbor',x:940,y:330,angle:0});s.section.entities.push(neighbor);
 }
 return {s,e};
}
for(const behavior of ['food','clean','school'])test(`a ${behavior} approach uses the same turn after a full rotation`,()=>{
 const normal=npcCase(0,behavior),rotated=npcCase(5,behavior);
 for(let i=0;i<90;i++){
  normal.s.stepNpc(normal.e,1/60);rotated.s.stepNpc(rotated.e,1/60);samePose(normal.e,rotated.e);
 }
});
