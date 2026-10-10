import test from 'node:test';
import assert from 'node:assert/strict';
import {interactionCue,treatmentCues,drawInteractionCue,drawTreatmentCue} from '../src/interaction-cues.js';
import {BY_ID} from '../src/data.js';
import {cleanerInspection} from '../src/cleaner-motion.js';

const animal=(id,species,extra={})=>({id,species:BY_ID[species],alive:true,health:70,x:700,y:330,facing:1,cleanTime:0,stun:0,...extra});
test('committed outcome cues have bounded lifetimes and fixed reduced-motion positions',()=>{
 for(const type of ['eat','clean','reunion','homecoming','notice','release','discovery']){
  const start=interactionCue(type,0),middle=interactionCue(type,start.lifetime*.5),held=interactionCue(type,start.lifetime*.5,true);
  assert.ok(start&&middle);assert.equal(start.spread,0);assert.ok(middle.spread>0);assert.equal(held.spread,0);assert.equal(middle.alpha,held.alpha);
  assert.equal(interactionCue(type,start.lifetime),null);assert.equal(interactionCue(type,-1),null);assert.equal(interactionCue(type,NaN),null);
 }
 assert.equal(interactionCue('message',0),null);
});
test('only treatment at an actual live contact gets picking feedback',()=>{
 const client=animal('player','s16',{cleanerTarget:1,cleanTime:.8}),cleaner=animal(1,'s43'),sim={player:client,current:0,section:{entities:[cleaner]}};
 assert.equal(treatmentCues(sim).length,0);
 Object.assign(cleaner,cleanerInspection(cleaner,client));
 const snapshot=structuredClone(sim),cue=treatmentCues(sim)[0];assert.equal(cue.client,'player');assert.equal(cue.cleaner,1);assert.equal(cue.phase,.4);assert.deepEqual(sim,snapshot);
 for(const patch of [{alive:false},{health:0},{stun:1}]){Object.assign(cleaner,patch);assert.deepEqual(treatmentCues(sim),[]);Object.assign(cleaner,{alive:true,health:70,stun:0});}
 client.cleanTime=0;assert.deepEqual(treatmentCues(sim),[]);
});
test('player cleaner and NPC service use the real visit, never a queued or missing client',()=>{
 const p=animal('player','s43',{service:{reef:0,client:2,elapsed:1}}),client=animal(2,'s16',{cleanTime:1}),sim={player:p,current:0,section:{entities:[client]}};
 Object.assign(p,cleanerInspection(p,client));assert.equal(treatmentCues(sim).length,1);
 p.service.elapsed=0;assert.equal(treatmentCues(sim).length,0);p.service.elapsed=1;p.service.reef=1;assert.equal(treatmentCues(sim).length,0);p.service.reef=0;client.alive=false;assert.equal(treatmentCues(sim).length,0);
 const npc=animal(3,'s16',{target:1,cleanTime:.7}),cleaner=animal(1,'s45');Object.assign(cleaner,cleanerInspection(cleaner,npc));sim.section.entities=[npc,cleaner];p.service=null;
 assert.equal(treatmentCues(sim)[0].client,3);npc.target=9;assert.deepEqual(treatmentCues(sim),[]);
});
test('cue painters draw geometry without world text or simulation mutations',()=>{
 const calls=[],ctx=new Proxy({},{get:(_,k)=>(...args)=>calls.push([k,...args]),set:()=>true});
 for(const type of ['eat','clean','reunion','homecoming','notice','release','discovery'])drawInteractionCue(ctx,interactionCue(type,.4),700,330,1.5);
 drawTreatmentCue(ctx,{x:700,y:330,phase:.5,picking:1},1.5,true);
 assert.equal(calls.some(([k])=>k==='fillText'),false);assert.ok(calls.some(([k])=>k==='stroke'));assert.ok(calls.some(([k])=>k==='fill'));
 assert.equal(calls.filter(([k])=>k==='save').length,calls.filter(([k])=>k==='restore').length);
});
