import test from 'node:test';
import assert from 'node:assert/strict';
import {SPECIES} from '../src/data.js';
import {creatureWidth} from '../src/geometry.js';
import {edible,Simulation} from '../src/simulation.js';

test('readable small silhouettes preserve species order and ecological size',()=>{
 const ordered=[...SPECIES].sort((a,b)=>a.size-b.size),sizes=ordered.map(s=>s.size);
 assert.ok(creatureWidth(ordered[0])>=45);
 for(let i=1;i<ordered.length;i++)assert.ok(creatureWidth(ordered[i])>=creatureWidth(ordered[i-1]));
 assert.deepEqual(ordered.map(s=>s.size),sizes);assert.equal(creatureWidth(SPECIES[34]),SPECIES[34].size);
 const fish=SPECIES[0],predator={size:42,diet:['fish']};
 assert.equal(edible(predator,fish),true);assert.ok(creatureWidth(fish)>predator.size*.77);
});

test('enlarged inspection targets still ignore absent creatures and honor the selected center',()=>{
 const s=new Simulation(7);s.start('practice','s0');const e=structuredClone(s.player);Object.assign(e,{id:900,x:500,y:250});s.section.entities=[e];s.section.food=[];
 assert.equal(s.findAt(520,250),e);assert.equal(s.findAt(550,250),null);
 e.alive=false;assert.equal(s.findAt(500,250),null);
});
