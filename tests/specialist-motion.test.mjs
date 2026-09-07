import test from 'node:test';import assert from 'node:assert/strict';
import {CUTTLE_CORE,CUTTLE_ARMS,CUTTLE_SKIRT} from '../src/specialist-motion.js';import {ANIMAL_PROFILES} from '../src/animal-profiles.js';import {deformPoint} from '../src/articulated-motion.js';
const gap=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
test('cuttlefish mantle, eye and appendage roots remain steady while its skirt and arms move',()=>{
 const p=ANIMAL_PROFILES.s19,pins=[...CUTTLE_CORE,[.75,.21],CUTTLE_SKIRT[0],...CUTTLE_ARMS.map(p=>p[0])];
 for(const [u,v] of pins)for(const effort of [0,1])for(const feed of [0,1])for(let i=0;i<16;i++)assert.ok(gap(deformPoint(p,u,v,i/16/p.frequency,effort,{feed}),{x:u,y:v})<1e-10);
 const tip=CUTTLE_ARMS[1][3],normal=deformPoint(p,...tip,.2,.1),meal=deformPoint(p,...tip,.2,.1,{feed:1});assert.ok(meal.x>normal.x+.01);
});
test('seahorse keeps its tail fixed and carries the eye and head together through feeding',()=>{
 const p=ANIMAL_PROFILES.s44,head=[[.71,.16],[.83,.17]];
 for(const feed of [0,1])for(let i=0;i<16;i++){
  const t=i/16/p.frequency;
  for(let y=.8;y<=1;y+=.05)for(let x=0;x<=1;x+=.1)assert.ok(gap(deformPoint(p,x,y,t,.5,{feed}),{x,y})<1e-10);
  const a=deformPoint(p,...head[0],t,.5,{feed}),b=deformPoint(p,...head[1],t,.5,{feed});assert.ok(Math.abs(gap(a,b)-Math.hypot(head[1][0]-head[0][0],head[1][1]-head[0][1]))<1e-8);
 }
 const eye=deformPoint(p,.71,.16,.2,0),feeding=deformPoint(p,.71,.16,.2,0,{feed:1});assert.ok(feeding.x>eye.x+.01);
});
test('specialist meshes retain positive orientation and repeat through swim, feeding and turn extremes',()=>{
 for(const id of ['s19','s44']){const p=ANIMAL_PROFILES[id];for(const effort of [0,1])for(const feed of [0,1])for(const turn of [-1,1])for(let i=0;i<12;i++)for(let y=0;y<16;y++)for(let x=0;x<20;x++){
  const t=i/12/p.frequency,state={feed,turn},point=(u,v)=>deformPoint(p,u,v,t,effort,state),a=point(x/20,y/16),b=point((x+1)/20,y/16),c=point(x/20,(y+1)/16),d=point((x+1)/20,(y+1)/16),area=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
  assert.ok(area(a,b,c)>0&&area(b,d,c)>0,id+' folded mesh '+[x,y,i,effort,feed]);assert.ok(gap(a,deformPoint(p,x/20,y/16,t+1/p.frequency,effort,state))<1e-10,id+' cycle');
 }}
});
