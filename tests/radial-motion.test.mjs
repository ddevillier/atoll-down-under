import test from 'node:test';import assert from 'node:assert/strict';
import {RADIAL_IDS,STAR_ARMS,ANEMONE_PATHS,ANEMONE_BASE} from '../src/radial-motion.js';import {ANIMAL_PROFILES} from '../src/animal-profiles.js';import {deformPoint} from '../src/articulated-motion.js';
const gap=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
test('radial animal cores, arm roots and anemone base remain fixed during action extremes',()=>{
 const points={s47:[[.5,.53],...STAR_ARMS.map(p=>p[0])],s62:[[.49,.53],[.49,.40],[.38,.53],[.60,.53],[.5,.95]],s63:[...ANEMONE_BASE,...ANEMONE_PATHS.map(p=>p[0]),[.53,.44],[.5,.98]]};
 for(const [id,pins] of Object.entries(points))for(const [u,v] of pins)for(const effort of [0,1])for(const feed of [0,1])for(const retract of [0,1])for(let i=0;i<12;i++){
  const p=ANIMAL_PROFILES[id];assert.ok(gap(deformPoint(p,u,v,i/12/p.frequency,effort,{feed,retract}),{x:u,y:v})<1e-10,id+' fixed anatomy '+[u,v]);
 }
});
test('radial meshes remain joined and periodic through their cycle and strongest actions',()=>{
 for(const id of RADIAL_IDS){const p=ANIMAL_PROFILES[id];
  for(const effort of [0,1])for(const feed of [0,1])for(const retract of [0,1])for(const heading of [0,Math.PI])for(let i=0;i<8;i++)for(let y=0;y<16;y++)for(let x=0;x<20;x++){
   const t=i/8/p.frequency,state={feed,retract,heading,feedAngle:heading},point=(u,v)=>deformPoint(p,u,v,t,effort,state),a=point(x/20,y/16),b=point((x+1)/20,y/16),c=point(x/20,(y+1)/16),d=point((x+1)/20,(y+1)/16),area=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
   assert.ok(area(a,b,c)>0&&area(b,d,c)>0,id+' folded mesh '+[x,y,i,feed,retract,heading]);assert.ok(gap(a,deformPoint(p,x/20,y/16,t+1/p.frequency,effort,state))<1e-10,id+' cycle');
  }
 }
});
test('sea-star leading arms respond to travel and meal direction while the disc stays steady',()=>{
 const p=ANIMAL_PROFILES.s47,tip=STAR_ARMS[2][2],angle=Math.atan2(tip[1]-.53,tip[0]-.5),distance=state=>gap(deformPoint(p,...tip,.3,1,state),{x:tip[0],y:tip[1]});
 assert.ok(distance({heading:angle})>distance({heading:angle+Math.PI})*2);
 const meal=direction=>gap(deformPoint(p,...tip,.3,0,{feed:1,feedAngle:direction}),deformPoint(p,...tip,.3,0,{}));assert.ok(meal(angle)>meal(angle+Math.PI)*5);
});
