import test from 'node:test';import assert from 'node:assert/strict';
import {RESIDENT_RIGS,coreFreedom} from '../src/resident-motion.js';import {ANIMAL_PROFILES} from '../src/animal-profiles.js';import {deformPoint} from '../src/articulated-motion.js';
import {Simulation} from '../src/simulation.js';
import {exportDive,importDive} from '../src/save-files.js';
const gap=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
test('resident shells, carapaces, eyes and appendage roots remain fixed through all action extremes',()=>{
 for(const [id,r] of Object.entries(RESIDENT_RIGS)){
  const p=ANIMAL_PROFILES[id],pins=[...r.core,...r.eyes,...[...r.legs,...r.claws,...r.feelers].map(l=>l.points[0])];
  for(let y=0;y<=16;y++)for(let x=0;x<=20;x++)if(coreFreedom(x/20,y/16,r.core)===0)pins.push([x/20,y/16]);
  if(['s60','s61'].includes(id))for(let x=0;x<=20;x++)pins.push([x/20,1]);
  for(const [u,v] of pins)for(const effort of [0,1])for(const feed of [0,1])for(const retract of [0,1])for(let i=0;i<12;i++)
   assert.ok(gap(deformPoint(p,u,v,i/12/p.frequency,effort,{feed,retract}),{x:u,y:v})<1e-10,id+' fixed anatomy '+[u,v]);
 }
});

test('close passers interrupt an uncommitted resident reach, preserve saves and release feeding when they leave',()=>{
 for(const id of ['s46','s60','s61']){
  const s=new Simulation(42);s.start('practice','s38');s.current=4;let e=s.section.entities.find(e=>e.species.id===id);s.section.entities=[e];s.player.x=40;s.player.y=40;
  for(let i=0;i<6000&&!e.residentMeal;i++)s.stepNpc(e,1/60);assert.ok(e.residentMeal,id+' reaches food');
  const f=s.section.food.find(f=>f.id===e.residentMeal.target),amount=f.amount;e.retract=.5;s.player.x=e.x;s.player.y=e.y-10;s.stepNpc(e,1/60);
  assert.equal(e.activity,'alert');assert.equal(e.residentMeal,null);assert.equal(f.amount,amount);
  const position=[e.x,e.y];for(let i=0;i<60;i++)s.stepNpc(e,1/60);assert.deepEqual([e.x,e.y],position,id+' withdrawal must not slide');
  const restored=Simulation.restore(s.serialize());e=restored.section.entities[0];assert.equal(e.activity,'alert');restored.player.x=40;restored.player.y=40;
  for(let i=0;i<600&&!e.residentMeal?.committed;i++)restored.stepNpc(e,1/60);
  assert.ok(e.residentMeal?.committed,id+' resumes actual feeding');assert.equal(restored.section.food.find(b=>b.id===f.id).amount,amount-12);
 }
});

test('a committed resident meal completes once even when a large passer arrives',()=>{
 for(const id of ['s46','s60','s61']){
  const s=new Simulation(42);s.start('practice','s38');s.current=4;const e=s.section.entities.find(e=>e.species.id===id);s.section.entities=[e];s.player.x=40;s.player.y=40;
  for(let i=0;i<6000&&!e.residentMeal?.committed;i++)s.stepNpc(e,1/60);assert.ok(e.residentMeal?.committed,id);
  const f=s.section.food.find(f=>f.id===e.residentMeal.target),amount=f.amount;s.player.x=e.x;s.player.y=e.y;
  for(let i=0;i<120;i++)s.stepNpc(e,1/60);assert.equal(e.residentMeal,null);assert.equal(f.amount,amount);assert.equal(e.activity,'alert');
 }
});

test('residents habituate to a lingering neighbor, recover after quiet, and reject damaged response saves',()=>{
 for(const id of ['s46','s60','s61']){
  const s=new Simulation(42);s.start('practice','s38');s.current=4;const e=s.section.entities.find(e=>e.species.id===id);s.section.entities=[e];s.player.x=40;s.player.y=40;
  for(let i=0;i<6000&&!e.residentMeal;i++)s.stepNpc(e,1/60);assert.ok(e.residentMeal,id);e.residentMeal=null;e.retract=.5;s.player.x=e.x;s.player.y=e.y;
  for(let i=0;i<600&&!e.residentMeal?.committed;i++)s.stepNpc(e,1/60);
  assert.ok(e.residentMeal?.committed,id+' lingering neighbor must not lock out meals');assert.ok(e.passerExposure>=1.25);
  s.player.x=40;s.player.y=40;for(let i=0;i<180;i++)s.stepNpc(e,1/60);assert.equal(e.passerExposure,0);assert.equal(e.retract,0);
  s.player.x=e.x;s.player.y=e.y;for(let i=0;i<30;i++)s.stepNpc(e,1/60);assert.equal(e.activity,'alert',id+' new close pass after quiet');
  const valid=importDive(exportDive(s,'Resident response')).simulation;assert.equal(valid.section.entities[0].passerExposure,e.passerExposure);
  for(const value of [-1,5,'bad']){e.passerExposure=value;assert.throws(()=>Simulation.restore(s.serialize()));assert.throws(()=>importDive(exportDive(s,'Damaged')));}
  e.passerExposure=4;e.retract=1;e.alive=false;e.respawn=.001;s.stepNpc(e,1/60);assert.equal(e.alive,true);assert.equal(e.passerExposure,undefined);assert.equal(e.retract,0);
 }
});
test('resident joint meshes keep positive orientation and cyclic continuity while walking, eating and retracting',()=>{
 for(const id of Object.keys(RESIDENT_RIGS)){
  const p=ANIMAL_PROFILES[id];
  for(const effort of [0,1])for(const feed of [0,1])for(const retract of [0,1])for(let i=0;i<12;i++)for(let y=0;y<16;y++)for(let x=0;x<20;x++){
   const t=i/12/p.frequency,point=(u,v)=>deformPoint(p,u,v,t,effort,{feed,retract}),a=point(x/20,y/16),b=point((x+1)/20,y/16),c=point(x/20,(y+1)/16),d=point((x+1)/20,(y+1)/16);
   const area=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
   assert.ok(area(a,b,c)>0&&area(b,d,c)>0,id+' folded mesh at '+[x,y,i,effort,feed,retract]);
   assert.ok(gap(a,deformPoint(p,x/20,y/16,t+1/p.frequency,effort,{feed,retract}))<1e-10,id+' cycle');
  }
 }
});
