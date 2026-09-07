import test from 'node:test';import assert from 'node:assert/strict';
import {deformPoint} from '../src/articulated-motion.js';import {ANIMAL_PROFILES} from '../src/animal-profiles.js';
import {RAY_RIGS} from '../src/ray-motion.js';

const gap=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
test('ray eyes and central ridges remain fixed through strokes, feeding and banks',()=>{
 for(const id of ['s27','s37']){
  const p=ANIMAL_PROFILES[id],rig=RAY_RIGS[id];
  for(const [u,v] of [[rig.center,rig.axis],[rig.head[0],rig.head[1]],[rig.head[0],rig.head[1]-.07],[rig.head[0],rig.head[1]+.07]])
   for(const turn of [-1,0,1])for(const feed of [0,1])for(let i=0;i<24;i++)
    assert.ok(gap(deformPoint(p,u,v,i/24/p.frequency,1,{turn,feed}),{x:u,y:v})<.001,id+' head/ridge');
 }
});

test('ray margins and tails retain periodic joined fields without folds, and settle with effort',()=>{
 for(const id of ['s27','s37']){
  const p=ANIMAL_PROFILES[id],rig=RAY_RIGS[id];let swimming=0,resting=0,feeding=0;
  for(let i=0;i<24;i++){
   const t=i/24/p.frequency,u=rig.center,v=.03,base={x:u,y:v};
   swimming+=gap(deformPoint(p,u,v,t,1),base);resting+=gap(deformPoint(p,u,v,t,0),base);feeding+=gap(deformPoint(p,u,v,t,1,{feed:1}),base);
   for(const turn of [-1,0,1])for(const feed of [0,1])for(let y=0;y<16;y++)for(let x=0;x<24;x++){
    const point=(u,v)=>deformPoint(p,u,v,t,1,{turn,feed,aspect:.6});
    const a=point(x/24,y/16),b=point((x+1)/24,y/16),c=point(x/24,(y+1)/16),d=point((x+1)/24,(y+1)/16);
    const area=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
    assert.ok(area(a,b,c)>0&&area(b,d,c)>0,id+' positive mesh orientation');
    assert.ok(gap(a,deformPoint(p,x/24,y/16,t+1/p.frequency,1,{turn,feed,aspect:.6}))<1e-10,id+' cyclic cache continuity');
   }
  }
  assert.ok(resting<swimming*.1,id+' quiet rest');assert.ok(feeding<swimming*.25,id+' settles for contact');
 }
});
