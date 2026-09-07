import test from 'node:test';import assert from 'node:assert/strict';
import {PART_RIGS,bodyPoint,partPose} from '../src/part-motion.js';
import {ANIMAL_RIGS} from '../src/animal-rigs.js';

test('hovering reef fish keep their bodies still while pectorals scull at rest',()=>{
 for(const id of ['s1','s2','s7','s30']){
  const poses=[];
  for(let i=0;i<32;i++){
   const time=i/32/PART_RIGS[id].frequency;
   for(const [x,y] of [[.35,.5],[.6,.5],ANIMAL_RIGS[id].eye])assert.deepEqual(bodyPoint(id,x,y,time,0,{turn:1}),{x,y});
   poses.push(partPose(id,'pectoral',time,0));
  }
  assert.ok(Math.max(...poses.map(p=>p.scale))-Math.min(...poses.map(p=>p.scale))>.4,id+' resting scull');
  const tailRange=effort=>{const values=Array.from({length:32},(_,i)=>partPose(id,'tail',i/32/PART_RIGS[id].frequency,effort).scale);return Math.max(...values)-Math.min(...values);};
  assert.ok(tailRange(0)<tailRange(1)*.1,id+' resting tail');
 }
});

test('tail-driven cutouts preserve eyes and the entire needlefish snout through drive and turns',()=>{
 for(const id of ['s0','s17','s18','s28','s32','s33','s34','s35','s42','s49']){
  const [x,y]=ANIMAL_RIGS[id].eye;for(let i=0;i<30;i++)for(const turn of [-1,0,1]){const p=bodyPoint(id,x,y,i/30,1,{turn});assert.ok(Math.hypot(p.x-x,p.y-y)<1e-10,id+' eye');}
 }
 for(let x=.65;x<1;x+=.025)for(const y of [.2,.4,.6])for(let i=0;i<20;i++){const p=bodyPoint('s18',x,y,i/20,1,{turn:1});assert.ok(Math.hypot(p.x-x,p.y-y)<1e-10);}
});

test('the tail joint is continuous and fin projections never invert during braking or feeding',()=>{
 for(const [id,rig] of Object.entries(PART_RIGS)){
  for(const part of rig.parts)for(let i=0;i<40;i++)for(const turn of [-1,1]){const p=partPose(id,part.name,i/40/rig.frequency,1,{turn,brake:i%2,feed:(i%3)/2});assert.ok(p.scale>0&&p.scale<=1,id+' '+part.name);}
  if(!rig.spine)continue;const root=rig.spine.root??.21;
  for(const y of [0,.5,1])for(let i=0;i<20;i++){const a=bodyPoint(id,root,y,i/20,1),b=bodyPoint(id,root+1e-7,y,i/20,1);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<1e-5,id+' tail joint');}
 }
});
