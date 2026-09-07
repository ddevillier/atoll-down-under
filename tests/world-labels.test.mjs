import test from 'node:test';import assert from 'node:assert/strict';
import {arrangeLabels,overlaps,playerLocator,projectedBounds} from '../src/world-labels.js';
import {SPECIES} from '../src/data.js';import {creatureFrame} from '../src/geometry.js';

test('player locators follow the visible height, stay in view and clear every roster body at center',()=>{
 for(const species of SPECIES)for(const unit of [1,1600/1024]){
  const frame=creatureFrame({species,x:800,y:360,facing:1}),marker=playerLocator(frame,unit);
  assert.ok(!overlaps(marker,projectedBounds(frame)),species.name);
  assert.ok(Math.abs(marker.y+marker.height-(marker.body.y-10*unit))<1e-8,species.name+' height-based attachment');
  for(const [x,y] of [[1,1],[1599,1],[1,744],[1599,744]]){
   const edge=playerLocator({...frame,x,y},unit);
   assert.ok(edge.x>=0&&edge.y>=0&&edge.x+edge.width<=1600&&edge.y+edge.height<=745,species.name+' edge');
  }
 }
});

test('crowded labels stay distinct, honor player space and put the selected target first',()=>{
 for(const unit of [1,1600/1024])for(const anchor of [{x:650,y:210},{x:0,y:0},{x:1600,y:745}]){
  const obstacle={x:630,y:200,width:70,height:75};
  const labels=Array.from({length:6},(_,i)=>({text:'label '+i,anchor,width:(i%2?220:280)*unit,height:27*unit,priority:i===4?80:0}));
  const result=arrangeLabels(labels,[obstacle],undefined,6*unit);
  assert.equal(result[0].text,'label 4');assert.equal(result.length,labels.length);
  for(let i=0;i<result.length;i++){
   const box=result[i];assert.ok(!overlaps(box,obstacle));assert.ok(box.x>=0&&box.y>=0&&box.x+box.width<=1600&&box.y+box.height<=745);
   for(const other of result.slice(i+1))assert.ok(!overlaps(box,other,6*unit));
  }
  assert.deepEqual(result,arrangeLabels(labels,[obstacle],undefined,6*unit));
 }
});
