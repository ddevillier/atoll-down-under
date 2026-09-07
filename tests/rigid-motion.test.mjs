import test from 'node:test';import assert from 'node:assert/strict';
import {RIGID_RIGS} from '../src/rigid-motion.js';import {ANIMAL_PROFILES,animalProfile} from '../src/animal-profiles.js';import {ANIMAL_RIGS} from '../src/animal-rigs.js';import {deformPoint} from '../src/articulated-motion.js';import {createSpecies} from '../src/data.js';
const gap=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
test('rigid fish retain steady body markings and eyes while fin tips have independent activity',()=>{
 for(const [id,rig] of Object.entries(RIGID_RIGS)){const p=ANIMAL_PROFILES[id];for(const effort of [0,1])for(const turn of [-1,0,1])for(let i=0;i<16;i++){
  const t=i/16/p.frequency,[u,v]=ANIMAL_RIGS[id].eye;assert.ok(gap(deformPoint(p,u,v,t,effort,{turn,feed:1}),{x:u,y:v})<1e-10,id+' eye');
  assert.ok(gap(deformPoint(p,.50,.55,t,effort,{turn}),{x:.50,y:.55})<1e-5,id+' torso');
  for(const [u,v] of [rig.tail.root,...rig.fins.map(f=>f.root),rig.pectoral.root])assert.ok(gap(deformPoint(p,u,v,t,effort,{turn}),{x:u,y:v})<1e-10,id+' attachment');
 }
 const tip=rig.fins[0].tip;assert.ok(gap(deformPoint(p,...tip,0,.1),deformPoint(p,...tip,.25/p.frequency,.1))>.002,id+' median fin');
 }
 for(const [id,u,v] of [['s23',.98,.01],['s48',.60,.02]]){const p=ANIMAL_PROFILES[id];assert.ok(gap(deformPoint(p,u,v,.3,1,{turn:1,feed:1}),{x:u,y:v})<1e-5,id+' horn or spine');}
});
test('rigid meshes stay joined and cyclic across effort, turn, feeding and inflation',()=>{
 const area=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
 for(const id of Object.keys(RIGID_RIGS)){const p=ANIMAL_PROFILES[id];for(const effort of [0,1])for(const feed of [0,1])for(const turn of [-1,1])for(const puff of id==='s22'?[0,.5,1]:[0])for(let phase=0;phase<12;phase++)for(let j=0;j<16;j++)for(let i=0;i<20;i++){
  const t=phase/12/p.frequency,state={feed,turn,puff},point=(u,v)=>deformPoint(p,u,v,t,effort,state),a=point(i/20,j/16),b=point((i+1)/20,j/16),c=point(i/20,(j+1)/16),d=point((i+1)/20,(j+1)/16);
  assert.ok(area(a,b,c)>0&&area(b,d,c)>0,id+' mesh '+[i,j,phase,effort,feed,turn,puff]);assert.ok(gap(a,deformPoint(p,i/20,j/16,t+1/p.frequency,effort,state))<1e-10);
 }}
});
test('all three custom body templates retain visible inflation',()=>{
 for(const config of [{agility:200,speed:100,endurance:100},{agility:100,speed:200,endurance:100},{agility:100,speed:100,endurance:200}]){const species=createSpecies({...config,ability:'puff'}),p=animalProfile(species),a=deformPoint(p,.55,.82,.2,.5),b=deformPoint(p,.55,.82,.2,.5,{puff:1});assert.ok(b.y-a.y>.15,species.index);}
});
