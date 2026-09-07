import test from 'node:test';import assert from 'node:assert/strict';
import {SWIM_RIGS,swimmingDrive} from '../src/swim-motion.js';import {ANIMAL_PROFILES} from '../src/animal-profiles.js';import {ANIMAL_RIGS} from '../src/animal-rigs.js';import {deformPoint} from '../src/articulated-motion.js';import {SPECIES} from '../src/data.js';import {individualSeed} from '../src/individual-motion.js';
const gap=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
test('streamlined swimmer heads and eyes retain shape while tail effort changes',()=>{
 for(const [id,f] of Object.entries(SWIM_RIGS)){const p=ANIMAL_PROFILES[id];for(const effort of [0,1])for(const turn of [-1,1])for(let i=0;i<12;i++){
  const t=i/12/p.frequency,[u,v]=ANIMAL_RIGS[id].eye;assert.ok(gap(deformPoint(p,u,v,t,effort,{turn,feed:1}),{x:u,y:v})<1e-10,id+' eye');
  assert.ok(gap(deformPoint(p,.86,.32,t,effort,{turn}),{x:.86,y:.32})<1e-5,id+' skull');
 }
 let quiet=0,active=0;for(let i=0;i<24;i++){const t=i/24/p.frequency;quiet+=gap(deformPoint(p,.04,.53,t,0),{x:.04,y:.53});active+=gap(deformPoint(p,.04,.53,t,1),{x:.04,y:.53});}assert.ok(active>quiet*3,id+' effort range');
 }
});
test('swimmer meshes keep positive orientation and cyclic continuity at action extremes',()=>{
 const area=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
 for(const id of Object.keys(SWIM_RIGS)){const p=ANIMAL_PROFILES[id];for(const effort of [0,1])for(const feed of [0,1])for(const turn of [-1,1])for(let phase=0;phase<12;phase++)for(let j=0;j<16;j++)for(let i=0;i<20;i++){
 const t=phase/12/p.frequency,state={feed,turn,aspect:id==='s18'?.24:.44},point=(u,v)=>deformPoint(p,u,v,t,effort,state),a=point(i/20,j/16),b=point((i+1)/20,j/16),c=point(i/20,(j+1)/16),d=point((i+1)/20,(j+1)/16);assert.ok(area(a,b,c)>0&&area(b,d,c)>0,id+' mesh '+[i,j,phase,effort,feed,turn]);assert.ok(gap(a,deformPoint(p,i/20,j/16,t+1/p.frequency,effort,state))<1e-10);}
 }
});
test('glide timing is periodic, individual and interrupted by priority activities',()=>{
 for(const [id,f] of Object.entries(SWIM_RIGS)){const e={id:'glide-test',species:SPECIES.find(s=>s.id===id),activity:'cruising',ecology:{clock:0}},offset=individualSeed(e.id)/4294967296;
 e.ecology.clock=(1-offset-f.glide/2)*f.bout;assert.ok(swimmingDrive(e)<.05,id+' glide');const glide=swimmingDrive(e);e.ecology.clock+=f.bout;assert.ok(Math.abs(swimmingDrive(e)-glide)<1e-10);
 for(const activity of ['feeding','avoiding','at-home','cleaning']){e.activity=activity;assert.equal(swimmingDrive(e),1,id+' '+activity);}
 e.activity='schooling';e.target='food';assert.equal(swimmingDrive(e),1);e.target=null;e.entering={};assert.equal(swimmingDrive(e),1);
 }
 const a={id:'a',species:SPECIES[42],activity:'schooling',ecology:{clock:0}},b={...a,id:'b'};let different=false;for(let t=0;t<4;t+=.1){a.ecology.clock=t;if(Math.abs(swimmingDrive(a)-swimmingDrive(b))>.2)different=true;}assert.ok(different);
});

test('real local routines glide, preserve school activity and resume the same cadence after save',async()=>{
 const {Simulation}=await import('../src/simulation.js'),{localRoutine}=await import('../src/ecology.js'),{exportDive,importDive}=await import('../src/save-files.js');
 for(const [id,activity] of [['s32','cruising'],['s42','schooling']]){const s=new Simulation(42);s.start('practice','s1');const f=SWIM_RIGS[id],e={...structuredClone(s.player),id:'saved-glider',species:SPECIES.find(b=>b.id===id),x:1200,y:500,angle:0,activity,target:null,actionTime:0,rest:0,ecology:{reef:s.current,clock:(2-individualSeed('saved-glider')/4294967296-f.glide/2)*f.bout-1/60,point:0,wait:0,partner:null,host:null}};s.section.entities=[e];const speed=localRoutine(s,e,1/60,40);assert.ok(Math.abs(speed-31.2)<.01);assert.equal(e.activity,id==='s42'?'schooling':'coasting');
 const loaded=importDive(exportDive(s,'Gliding')).simulation.section.entities[0];assert.equal(swimmingDrive(loaded),swimmingDrive(e));
 e.target='food';e.activity='feeding';assert.equal(localRoutine(s,e,.1,40),40);assert.equal(swimmingDrive(e),1);
 e.target=null;e.activity='avoiding';assert.equal(localRoutine(s,e,.1,40),40);assert.equal(swimmingDrive(e),1);
 }
});
