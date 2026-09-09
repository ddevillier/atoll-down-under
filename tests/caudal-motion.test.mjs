import test from 'node:test';import assert from 'node:assert/strict';import {PART_RIGS,partTransform,bodyPoint} from '../src/part-motion.js';
test('all painted caudal fins retain height, both attachments and positive area through strokes and controls',()=>{
 let count=0;for(const [id,r] of Object.entries(PART_RIGS)){if(id==='s27')continue;const p=r.parts.find(p=>p.name==='tail');if(!p)continue;count++;
 for(const width of [60,300])for(const aspect of [.18,.55,1.1])for(const effort of [0,.15,1])for(const state of [{},{turn:-1,brake:1},{turn:1,feed:1}])for(let i=0;i<24;i++){
 const t=i/24/r.frequency,h=width*aspect,m=partTransform(id,p,width,h,t,effort,state),[a,b,c,d,x,y]=m.matrix;
 assert.ok(a*d-b*c>0,id+' folded tail');
 for(const [u,v] of p.polygon){const qy=b*(u*width-m.ax)+d*(v*h-m.ay)+y;assert.ok(Math.abs(qy-v*h)<1e-9,id+' vertical orbit');}
 for(const [u,v] of p.hinge){const qx=a*(u*width-m.ax)+c*(v*h-m.ay)+x,qy=b*(u*width-m.ax)+d*(v*h-m.ay)+y,B=bodyPoint(id,u,v,t,effort,{...state,aspect});assert.ok(Math.hypot(qx-B.x*width,qy-B.y*h)<1e-8,id+' detached hinge');}
 }}assert.equal(count,44);
});
