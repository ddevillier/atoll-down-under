import test from 'node:test';import assert from 'node:assert/strict';
import {animationPhase} from '../src/behaviors.js';import {individualSeed} from '../src/individual-motion.js';import {Simulation} from '../src/simulation.js';
test('consecutive individuals occupy different parts of a swim cycle instead of moving in lockstep',()=>{
 const phases=Array.from({length:64},(_,i)=>animationPhase(700+i));
 const bins=new Set(phases.map(t=>Math.floor(t/(Math.PI*2)*12)));assert.ok(bins.size>=10,'individuals should spread over most of the cycle');
 const differences=phases.slice(1).map((p,i)=>Math.abs(Math.sin(p)-Math.sin(phases[i])));
 assert.ok(differences.reduce((a,b)=>a+b,0)/differences.length>.5);
 for(const id of ['player',0,7,5000])assert.equal(individualSeed(id),individualSeed(id));
});
test('normal terrace populations expose anemone residents without adding animal slots or hunters',()=>{
 let habitatsWithResident=0;
 for(let seed=1;seed<=20;seed++){
  const s=new Simulation(seed);s.start('practice','s1');const e=s.sections[1].entities;
  if(e.some(e=>e.species.id==='s7'))habitatsWithResident++;
  assert.ok(e.some(e=>e.species.id==='s63'));assert.ok(e.filter(e=>e.species.diet.includes('fish')).length<=2);assert.ok(e.length<=23);
 }
 assert.ok(habitatsWithResident>=6);
});
