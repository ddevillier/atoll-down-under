import test from 'node:test';
import assert from 'node:assert/strict';
import {BY_ID,SPECIES} from '../src/data.js';
import {creatureFrame,creatureHit,setCreatureDisplayFrame} from '../src/geometry.js';
import {mouthPoint,displayedMouthPoint} from '../src/feeding-contact.js';
import {rigFor} from '../src/animal-rigs.js';

test('displayed mouth follows the actual compressed rotated painting in either facing',()=>{
 for(const id of ['s1','s34','s54','s59'])for(const facing of [-.78,.78]){
  const e={species:BY_ID[id],x:800,y:350,facing:1};
  const base=creatureFrame(e),frame={...base,x:base.x+18,y:base.y-7,width:base.width*.78,rotation:.16,facing};
  const [u,v]=rigFor({id}).mouth,dx=(u-.5)*frame.width*Math.sign(facing),dy=(v-.5)*frame.height;
  const expected={x:frame.x+dx*Math.cos(.16)-dy*Math.sin(.16),y:frame.y+dx*Math.sin(.16)+dy*Math.cos(.16)};
  assert.deepEqual(displayedMouthPoint(e,frame),expected);
  const physics=mouthPoint(e);setCreatureDisplayFrame(e,frame);
  assert.deepEqual(displayedMouthPoint(e),expected);
  assert.deepEqual(mouthPoint(e),physics,'publishing a turn cannot move feeding physics');
 }
});

test('all roster centers remain selectable while long narrow animals do not select empty water',()=>{
 for(const species of SPECIES){
  const e={species,x:800,y:350,facing:-1},f=creatureFrame(e);
  assert.equal(creatureHit(e,{x:f.x,y:f.y}),true,species.name);
 }
 for(const id of ['s34','s38','s41']){
  const e={species:BY_ID[id],x:800,y:350,facing:1},f=creatureFrame(e);
  const displayed={...f,rotation:.2};setCreatureDisplayFrame(e,displayed);
  const offset=Math.max(17,f.height*.5+6)+5;
  assert.equal(creatureHit(e,{x:f.x-Math.sin(.2)*offset,y:f.y+Math.cos(.2)*offset}),false,BY_ID[id].name);
 }
});
