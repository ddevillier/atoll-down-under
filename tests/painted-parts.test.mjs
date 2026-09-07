import test from 'node:test';import assert from 'node:assert/strict';
import {PART_RIGS,bodyPoint,partPose} from '../src/part-motion.js';
import {ANIMAL_RIGS} from '../src/animal-rigs.js';
import {SPECIES} from '../src/data.js';
import {contactDelay,mealContact,tickFeeding,feedingEnvelope} from '../src/feeding-motion.js';

test('hunter jaws follow one real meal contact and return to rest without an idle gape loop',()=>{
 for(const id of ['s16','s21','s38','s39']){
  const species=SPECIES.find(s=>s.id===id),target={id:123,x:10,y:20},e={species,alive:true,target:123},delay=contactDelay(species),angle=()=>partPose(id,'jaw',10,1,{feed:feedingEnvelope(e)}).angle;
  for(const time of [0,.2,2,20])assert.equal(partPose(id,'jaw',time,1).angle,0);
  assert.equal(mealContact(e,target,delay/2),false);const preparation=angle();assert.ok(preparation>0);
  assert.equal(mealContact(e,target,delay/2),true);const contact=angle();assert.ok(contact>preparation);
  assert.equal(mealContact(e,target,.01),false);
  tickFeeding(e,.18);assert.ok(angle()<preparation&&angle()>0);
  tickFeeding(e,.19);assert.equal(angle(),0);assert.equal(e.feeding,null);
  const jaw=PART_RIGS[id].parts.find(p=>p.mode==='jaw'),eye=ANIMAL_RIGS[id].eye;
  assert.ok(eye[1]<Math.min(...jaw.polygon.map(p=>p[1])),id+' eye stays above the mouth cut');
  if(PART_RIGS[id].spine)assert.ok(Math.min(...jaw.polygon.map(p=>p[0]))>PART_RIGS[id].spine.front,id+' jaw remains on rigid snout');
 }
});

test('trumpetfish keeps its tube snout and body rigid while rear fins work at rest',()=>{
 for(let i=0;i<24;i++)for(let x=.14;x<1;x+=.04)for(const y of [.35,.5,.65])assert.deepEqual(bodyPoint('s41',x,y,i/24,1,{turn:1}),{x,y});
 for(const name of ['dorsal','anal']){const poses=Array.from({length:32},(_,i)=>partPose('s41',name,i/32/PART_RIGS.s41.frequency,0));assert.ok(Math.max(...poses.map(p=>p.scale))-Math.min(...poses.map(p=>p.scale))>.35);}
});

test('pectoral-driven reef fish keep their bodies still while side fins scull at rest',()=>{
 for(const id of ['s1','s2','s5','s7','s8','s10','s15','s29','s30','s52']){
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
