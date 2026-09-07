import test from 'node:test';import assert from 'node:assert/strict';
import {PART_RIGS,bodyPoint,partPose} from '../src/part-motion.js';
import {ANIMAL_RIGS} from '../src/animal-rigs.js';

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
