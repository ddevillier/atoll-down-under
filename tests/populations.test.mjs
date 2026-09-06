import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,edible} from '../src/simulation.js';
import {PLAYABLE} from '../src/data.js';

test('quiet habitats stay below busy habitats for every starting species and sampled seed',()=>{
 for(const player of PLAYABLE)for(let seed=1;seed<=30;seed++){
  const s=new Simulation(seed);s.start('practice',player.id);
  assert.ok(s.sections[8].entities.length<s.sections[4].entities.length);
  assert.ok(s.sections[7].entities.length<s.sections[1].entities.length);
  for(const section of s.sections){
   assert.ok(section.entities.length>=9&&section.entities.length<=23);
   const hunters=section.entities.filter(e=>e.species.diet.includes('fish'));
   assert.ok(hunters.length>=1&&hunters.length<=2);
   assert.equal(section.entities.filter(e=>e.species.ability==='clean').length,1);
  }
  const meals=s.sections.flatMap(section=>[...section.entities,...section.food]).filter(e=>!e.species?.poison&&edible(s.player,e));
  assert.ok(meals.length>0,player.name+' needs usable food');
 }
});

test('Outer Blue has a modestly greater second-hunter frequency, without a larger maximum',()=>{
 const counts=Array(9).fill(0),samples=1000;
 for(let seed=1;seed<=samples;seed++){
  const s=new Simulation(seed);s.start('practice',seed%2?'s1':'s19');
  s.sections.forEach((section,i)=>{if(section.entities.filter(e=>e.species.diet.includes('fish')).length===2)counts[i]++;});
 }
 for(let i=0;i<9;i++)if(i!==2){
  assert.ok(counts[i]/samples>.18&&counts[i]/samples<.32);
  assert.ok((counts[2]-counts[i])/samples>.1&&(counts[2]-counts[i])/samples<.3);
 }
});

test('loading an existing crowded save preserves its population instead of rerolling it',()=>{
 const s=new Simulation(42);s.start('practice','s1');
 for(const section of s.sections)while(section.entities.length<25){const copy=structuredClone(section.entities[0]);copy.id=++s.uid;section.entities.push(copy);}
 const restored=Simulation.restore(s.serialize());
 assert.deepEqual(restored.sections,s.sections);
 assert.equal(restored.seed,s.seed);
});
