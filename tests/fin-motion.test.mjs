import test from 'node:test';import assert from 'node:assert/strict';
import {FIN_RIGS} from '../src/fin-motion.js';import {ANIMAL_PROFILES} from '../src/animal-profiles.js';import {rigFor} from '../src/animal-rigs.js';import {deformPoint} from '../src/articulated-motion.js';
const gap=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
test('long-fin attachments and eyes stay pinned through swimming, hovering, feeding and turns',()=>{
 for(const [id,f] of Object.entries(FIN_RIGS)){
  const p=ANIMAL_PROFILES[id],rig=rigFor(p),roots=[f.tail.root,...f.fins.map(f=>f.root),...f.streamers.map(f=>f.points[0]),rig.eye];
  for(const [u,v] of roots)for(const effort of [0,1])for(const turn of [-1,0,1])for(const feed of [0,1])for(let i=0;i<16;i++)
   assert.ok(gap(deformPoint(p,u,v,i/16/p.frequency,effort,{turn,feed}),{x:u,y:v})<1e-10,id+' attachment');
 }
});
test('long-fin render meshes remain joined and periodic at motion extremes',()=>{
 for(const id of Object.keys(FIN_RIGS)){
  const p=ANIMAL_PROFILES[id];
  for(const effort of [0,1])for(const turn of [-1,1])for(const feed of [0,1])for(let i=0;i<12;i++)for(let y=0;y<16;y++)for(let x=0;x<20;x++){
   const t=i/12/p.frequency,point=(u,v)=>deformPoint(p,u,v,t,effort,{turn,feed}),a=point(x/20,y/16),b=point((x+1)/20,y/16),c=point(x/20,(y+1)/16),d=point((x+1)/20,(y+1)/16);
   const area=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
   assert.ok(area(a,b,c)>0&&area(b,d,c)>0,id+' folded mesh at '+[x,y,i,effort,turn,feed]);
   assert.ok(gap(a,deformPoint(p,x/20,y/16,t+1/p.frequency,effort,{turn,feed}))<1e-10,id+' cyclic continuity');
  }
 }
});
