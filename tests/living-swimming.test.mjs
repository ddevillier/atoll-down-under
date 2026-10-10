import test from 'node:test';
import assert from 'node:assert/strict';
import {SPECIES} from '../src/data.js';
import {ANIMAL_PROFILES} from '../src/animal-profiles.js';
import {turningPose} from '../src/turn-motion.js';
import {SWIM_RIGS,swimmingPropulsion} from '../src/swim-motion.js';
import {individualSeed} from '../src/individual-motion.js';
import {PART_RIGS,SWIMMING_PART_IDS,partTransform,partPose,bodyPoint} from '../src/part-motion.js';
import {creatureFrame,creatureHit,setCreatureDisplayFrame} from '../src/geometry.js';
import {ANIMAL_RIGS} from '../src/animal-rigs.js';
import {mealContact,tickFeeding,feedingEnvelope,contactDelay} from '../src/feeding-motion.js';

const byId=id=>SPECIES.find(s=>s.id===id);
const transform=(e,pose,dt=0)=>{
 const turn=turningPose(pose,e,dt),frame=creatureFrame(e);
 return {...frame,x:frame.x+turn.pivot*frame.width,rotation:turn.bank,width:frame.width*Math.abs(turn.facing)};
};

test('a mirror midpoint cannot teleport the displayed body in either turn direction',()=>{
 for(const species of SPECIES)for(const side of [-1,1]){
  const e={species,x:800,y:350,facing:side,angle:side>0?0:Math.PI,alive:true},pose={yaw:-side*.00001,turnDirection:1};
  const before=transform(e,pose),after=transform(e,pose,.00001);
  assert.ok(Math.abs(after.x-before.x)<creatureFrame(e).width*.0001,species.id+' crossing');
  setCreatureDisplayFrame(e,after);
  assert.equal(creatureHit(e,{x:after.x,y:after.y}),true,species.id+' visible center');
  assert.ok(Math.abs(after.x-e.x)<.01,species.id+' midpoint stays over animal');
 }
});

test('a feeding reversal starts from the current body center and paused turns remain identical',()=>{
 for(const id of ['s1','s17','s32','s34'])for(const side of [-1,1]){
  const e={species:byId(id),x:800,y:350,facing:side,angle:1,feeding:{elapsed:.1}},pose={yaw:-side*.35,turnDirection:1};
  const before=transform(e,pose);e.facing=-side;
  const paused=transform(e,pose);assert.deepEqual(paused,before,id+' interrupted pause');
  const after=transform(e,pose,1/240);
  assert.ok(Math.abs(after.x-before.x)<creatureFrame(e).width*.015,id+' reversal center');
  const frozen=structuredClone(pose);assert.deepEqual(transform(e,pose),after);assert.deepEqual(pose,frozen);
 }
});

test('reduced motion and attached or actively cleaning animals keep their stable support pose',()=>{
 for(const condition of [{groundRoute:[[0,0],[10,0]]},{holdfast:'coral'},{activity:'cleaning'}]){
  const pose={yaw:.4},e={species:byId('s43'),facing:-1,...condition};
  const turn=turningPose(pose,e,1/60);
  assert.equal(turn.pivot,0);assert.equal(turn.bank,0);assert.equal(turn.bend,0);assert.equal(turn.facing,-1);
 }
 const pose={yaw:.4};assert.deepEqual(turningPose(pose,{species:byId('s34'),facing:-1},1/60,true),{facing:-1,amount:0,bank:0,pivot:0,bend:0});
});

test('actual displacement effort gives fish an acceleration stroke, a relaxed coast, and settling brakes',()=>{
 for(const id of ['s1','s32','s34']){
  const e={id:'power-test',species:byId(id),activity:'cruising'},pose={activity:0};
  swimmingPropulsion(pose,e,1/60);
  for(let i=1;i<=12;i++){pose.activity=i/12*.65;swimmingPropulsion(pose,e,1/60);}
  assert.ok(pose.swimAcceleration>.1,id+' acceleration signal');
  assert.ok(pose.propulsion>.3,id+' tail begins driving');
  const accelerating=pose.propulsion;
  for(let i=11;i>=0;i--){pose.activity=i/12*.65;swimmingPropulsion(pose,e,1/60);}
  assert.ok(pose.brake>.3,id+' stopping fins');
  assert.ok(pose.propulsion<accelerating,id+' tail relaxes');
  for(let i=0;i<120;i++)swimmingPropulsion(pose,e,1/60);
  assert.ok(pose.propulsion<.0001&&pose.brake<.001,id+' settles after stop');
 }
});

test('every authored glider relaxes without changing velocity or game state and resumes for a meal',()=>{
 for(const [id,rig] of Object.entries(SWIM_RIGS)){
  const e={id:'glide-polish',species:byId(id),activity:'coasting',x:100,y:200,vx:100,vy:0,ecology:{clock:(2-individualSeed('glide-polish')/4294967296-rig.glide/2)*rig.bout}};
  const original=structuredClone(e),pose={activity:.78,propulsion:.78};
  for(let i=0;i<30;i++)swimmingPropulsion(pose,e,1/60);
  assert.ok(pose.propulsion<.05,id+' relaxed caudal fin');assert.deepEqual(e,original,id+' presentation only');
  const frozen=structuredClone(pose),a=swimmingPropulsion(pose,e,0),b=swimmingPropulsion(pose,e,0);assert.deepEqual(a,b);assert.deepEqual(pose,frozen);
  e.activity='feeding';e.target='existing-meal';
  for(let i=0;i<30;i++)swimmingPropulsion(pose,e,1/60);
  assert.ok(pose.propulsion>.73,id+' priority resumes');
 }
});

test('cuttlefish, bottom crawlers and attached fish retain their existing cadence',()=>{
 for(const id of ['s19','s27','s37','s44','s45','s46','s47','s60','s61','s62','s63']){
  const pose={activity:.6,brake:.2},original=structuredClone(pose);
  assert.deepEqual(swimmingPropulsion(pose,{species:byId(id),x:100,y:200},0),{effort:.6,brake:.2,rate:1.03});
  assert.deepEqual(pose,original,id+' untouched');
 }
});

test('ray braking preserves its prior displacement sampling and freezes while paused',()=>{
 const e={species:byId('s27'),x:100,y:200},pose={activity:.6};
 swimmingPropulsion(pose,e,.1);e.x+=e.species.speed*.1;
 const moving=swimmingPropulsion(pose,e,.1);assert.equal(moving.brake,0);assert.equal(moving.rate,1.03);
 const stop=swimmingPropulsion(pose,e,.1);assert.equal(stop.brake,1);assert.equal(stop.effort,.6);
 const frozen=structuredClone(pose);assert.deepEqual(swimmingPropulsion(pose,e,0),stop);assert.deepEqual(pose,frozen);
 const settling=swimmingPropulsion(pose,e,.2);assert.ok(Math.abs(settling.brake-Math.exp(-1))<1e-12);
});

test('every changed painted tail has a real stroke with both hinges joined and no head motion',()=>{
 assert.equal(SWIMMING_PART_IDS.length,42);
 for(const id of SWIMMING_PART_IDS){
  const rig=PART_RIGS[id],tail=rig.parts.find(p=>p.name==='tail'),width=300,height=100;
  const points=[];
  for(let i=0;i<48;i++){
   const time=i/48/rig.frequency,state={feed:i%2,turn:i%2?1:-1,brake:i%3===0?1:0};
   const m=partTransform(id,tail,width,height,time,.8,state),[a,b,c,d,x,y]=m.matrix;
   assert.ok(a*d-b*c>0,id+' positive projected tail');
   for(const [u,v] of tail.hinge){
    const expected=bodyPoint(id,u,v,time,.8,{...state,aspect:height/width});
    const actual={x:a*(u*width-m.ax)+c*(v*height-m.ay)+x,y:b*(u*width-m.ax)+d*(v*height-m.ay)+y};
    assert.ok(Math.hypot(actual.x-expected.x*width,actual.y-expected.y*height)<1e-8,id+' pinned hinge');
   }
   points.push(a);
   assert.deepEqual(bodyPoint(id,.99,.5,time,.8,state),{x:.99,y:.5},id+' head');
  }
  assert.ok(Math.max(...points)-Math.min(...points)>.03,id+' visible span change');
 }
 // Rigid boxfish and the ray keep their previous authored stroke family.
 for(const id of ['s23','s27']){
  const rig=PART_RIGS[id],tail=rig.parts.find(p=>p.name==='tail'),time=.13/rig.frequency;
  const a=partTransform(id,tail,300,100,time,.8,{}).matrix[0];
  assert.ok(Number.isFinite(a));assert.equal(ANIMAL_PROFILES[id].family==='rigid'||ANIMAL_PROFILES[id].family==='ray',true);
  assert.equal(SWIMMING_PART_IDS.includes(id),false);
 }
});

test('shark mandibles open only for a real contact envelope and close on interruption or recovery',()=>{
 for(const id of ['s32','s33','s34','s35']){
  const species=byId(id),jaw=PART_RIGS[id].parts.find(part=>part.mode==='jaw'),eye=ANIMAL_RIGS[id].eye,target={id:'meal',x:20,y:30},e={species,alive:true,target:target.id};
  assert.ok(jaw&&Math.min(...jaw.polygon.map(p=>p[1]))>eye[1],id+' eye outside jaw');
  for(const time of [0,.1,2,10])assert.equal(partPose(id,'jaw',time,1).angle,0,id+' no idle gape');
  assert.equal(mealContact(e,target,contactDelay(species)/2),false);
  assert.ok(partPose(id,'jaw',4,1,{feed:feedingEnvelope(e)}).angle>0,id+' anticipation');
  assert.equal(mealContact(e,target,contactDelay(species)/2),true);
  tickFeeding(e,.4);assert.equal(partPose(id,'jaw',4,1,{feed:feedingEnvelope(e)}).angle,0,id+' recovery');
  mealContact(e,target,.03);e.target=null;tickFeeding(e,.03);
  assert.equal(e.feeding,null);assert.equal(partPose(id,'jaw',4,1,{feed:feedingEnvelope(e)}).angle,0,id+' cancellation');
 }
});
