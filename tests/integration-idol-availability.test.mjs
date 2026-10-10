import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {foragingSites} from '../src/foraging-journeys.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const populations={6:[16,19,16,15,19,13,15,12,10],11:[15,21,14,17,17,13,16,13,9]};
for(const seed of [6,11])test(`idol seed ${seed} has a reunion partner and completes its actual feeding trip`,()=>{
 const s=new Simulation(seed);s.start('practice','s4');
 assert.deepEqual(s.sections.map(r=>r.entities.length),populations[seed],'reuse existing slots without changing generated density');
 assert.ok(s.section.entities.some(e=>e.alive&&e.species.id==='s4'),'a reunion partner must exist in the starting habitat');
 for(let i=0;i<180*60&&s.phase==='playing'&&!s.adventure.complete;i++){
  if(i%20===0&&!s.player.target&&!s.player.foragingPrep){
   const j=s.adventure.foragingJourney;
   if(j?.meals.length===2){const buddy=s.section.entities.filter(e=>e.alive&&e.species.id==='s4').sort((a,b)=>distance(a,s.player)-distance(b,s.player))[0];if(buddy)s.point(buddy.x,buddy.y);}
   else{const food=foragingSites(s)[0]?.food;if(food)s.eatAt(food.x,food.y);}
  }
  s.step(1/60);
 }
 assert.equal(s.adventure.complete,true,'ordinary clicks and swimming must complete the reunion');
 assert.deepEqual(s.adventure.foragingJourney.meals.map(m=>m.food),['sponge','algae']);
 assert.deepEqual(s.sections.map(r=>r.entities.length),populations[seed]);
});
