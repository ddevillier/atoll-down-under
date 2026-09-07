import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {BOTTOM_RESIDENTS,validGroundState} from '../src/ground-motion.js';
import {exportDive,importDive} from '../src/save-files.js';

test('all resident diets have reachable real meals across all nine authored habitats',()=>{
 const sim=new Simulation(42);sim.start('practice','s53');
 for(let section=0;section<9;section++){
  sim.current=section;sim.section.entities=sim.section.entities.filter(e=>BOTTOM_RESIDENTS.has(e.species.id));
  const seen=new Set();
  for(let frame=0;frame<30*180;frame++)for(const e of sim.section.entities){
   sim.stepNpc(e,1/30);if(e.residentMeal?.committed)seen.add(e.species.id);assert.ok(validGroundState(e));
  }
  assert.deepEqual([...seen].sort(),[...BOTTOM_RESIDENTS].sort(),'habitat '+section);
 }
});
test('attached seahorse performs an actual meal without moving its holdfast',()=>{
 const s=new Simulation(42);s.start('practice','s1');s.current=6;const e=s.section.entities.find(e=>e.holdfast);s.section.entities=[e];
 const food=s.section.food.find(f=>f.food==='plankton'&&Math.hypot(e.x-f.x,e.y-f.y)<60),before=food.amount,position={x:e.x,y:e.y};
 for(let i=0;i<60;i++)s.stepNpc(e,1/60);
 assert.equal(food.amount,before-12);assert.deepEqual({x:e.x,y:e.y},position);assert.deepEqual(e.holdfast,position);
});
test('save during food handling commits exactly once, and loss before contact cancels',()=>{
 const s=new Simulation(42);s.start('practice','s1');const crab=s.section.entities.find(e=>e.species.id==='s46');s.section.entities=[crab];
 s.stepNpc(crab,.05);const food=s.section.food.find(f=>f.id===crab.residentMeal.target),before=food.amount;
 const restore=()=>importDive(exportDive(s,'Contact')).simulation;
 let copy=restore(),e=copy.section.entities[0];
 for(let i=0;i<30;i++)copy.stepNpc(e,1/30);
 assert.equal(copy.section.food.find(f=>f.id===food.id).amount,before-12);
 s.stepNpc(crab,.25);assert.equal(crab.residentMeal.committed,true);copy=restore();e=copy.section.entities[0];
 for(let i=0;i<30;i++)copy.stepNpc(e,1/30);
 assert.equal(copy.section.food.find(f=>f.id===food.id).amount,before-12);
 crab.satiated=0;crab.residentMeal={target:food.id,elapsed:.1,committed:false};food.regrow=8;
 s.stepNpc(crab,.2);assert.equal(food.amount,before-12);assert.equal(crab.residentMeal,null);
});
test('legacy free-swimming residents gain a reachable substrate and resources once',()=>{
 const s=new Simulation(42);s.start('practice','s1');const old=JSON.parse(s.serialize());
 for(const section of old.sections){delete section.residentFoodVersion;section.food=section.food.filter(f=>f.food!=='detritus');for(const e of section.entities){delete e.groundRoute;delete e.groundDistance;delete e.groundDirection;}}
 const restored=Simulation.restore(old);for(const section of restored.sections){assert.equal(section.food.filter(f=>f.food==='detritus').length,2);for(const e of section.entities.filter(e=>BOTTOM_RESIDENTS.has(e.species.id)))assert.ok(validGroundState(e));}
 const again=Simulation.restore(restored.serialize());assert.deepEqual(again.sections,restored.sections);
});
