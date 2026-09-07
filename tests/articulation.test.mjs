import test from 'node:test';import assert from 'node:assert/strict';import {SPECIES} from '../src/data.js';import {ANIMAL_PROFILES,animalProfile} from '../src/animal-profiles.js';import {deformPoint} from '../src/articulated-motion.js';
test('extended moray keeps its eye steady and increases the travelling wave toward its tail',()=>{
 const p=ANIMAL_PROFILES.s26,range=(u,v,effort)=>{const ys=Array.from({length:32},(_,i)=>deformPoint(p,u,v,i/32,effort,{aspect:353/1902}).y);return Math.max(...ys)-Math.min(...ys);};
 assert.ok(range(.12,.5,1)>range(.65,.5,1)*3);
 assert.ok(range(.12,.5,.01)<range(.12,.5,1)*.2);
 assert.ok(range(.952,.205,1)<1e-10);
});
test('all 64 silhouettes have explicit profiles and finite, continuous deformation fields',()=>{
 assert.equal(Object.keys(ANIMAL_PROFILES).length,64);
 for(const s of SPECIES){const p=animalProfile(s);assert.equal(p.id,s.id);assert.equal(p.name,s.name);let changes=0;
  for(const time of [0,.17,.53,1.09])for(const effort of [0,1])for(let j=0;j<=8;j++)for(let i=0;i<=12;i++){const x=i/12,y=j/8,a=deformPoint(p,x,y,time,effort,{feed:.7,aspect:.35}),b=deformPoint(p,x,y,time+.001,effort,{feed:.7,aspect:.35});assert.ok(Number.isFinite(a.x)&&Number.isFinite(a.y),s.id);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<.02,s.id+' discontinuity');if(Math.hypot(a.x-x,a.y-y)>.001)changes++;}
  assert.ok(changes>0,s.id+' lacks articulation');
 }
});
test('armor and attachment points stay rigid while fins and soft tissue move',()=>{
 for(const id of ['s22','s23','s24'])for(const time of [0,.4,1]){const a=deformPoint(ANIMAL_PROFILES[id],.5,.5,time,1);assert.ok(Math.hypot(a.x-.5,a.y-.5)<.0001,id);}
 for(const [id,x,y] of [['s44',.5,.95],['s61',.4,.4],['s63',.5,.95],['s62',.5,.5]])for(const t of [0,.5,1]){const a=deformPoint(ANIMAL_PROFILES[id],x,y,t,1);assert.ok(Math.hypot(a.x-x,a.y-y)<.0001,id+' anchor');}
});
test('cached cycle endpoints repeat without snapping a second oscillation',()=>{
 for(const p of Object.values(ANIMAL_PROFILES))for(const [u,v] of [[.12,.3],[.5,.2],[.8,.8]]){
  const a=deformPoint(p,u,v,.31,.5),b=deformPoint(p,u,v,.31+1/p.frequency,.5);
  assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<1e-10,p.id+' must repeat for phase cache');
 }
});
