import fs from 'node:fs';
import {Simulation} from '../src/simulation.js';
import {REEFS} from '../src/data.js';

// A fixed-seed starting snapshot, not a census or a visual-contrast score.
const simulation=new Simulation(42);simulation.start('practice','s1');
const reefs=REEFS.map(reef=>{
 const section=simulation.sections[reef.id];
 return {reef:reef.name,animals:section.entities.length,foodPatches:section.food.length,
  foodTypes:[...new Set(section.food.map(food=>food.food))],
  closestFoodCenters:Math.round(Math.min(...section.food.flatMap((a,i)=>section.food.slice(i+1).map(b=>Math.hypot(a.x-b.x,a.y-b.y)))))};
});
const report={seed:42,species:'s1',period:'day',scope:'Initial state; animals include bottom residents and cleaner. Food distances are world-coordinate centers, not silhouette gaps.',reefs};
fs.mkdirSync('artifacts',{recursive:true});
fs.writeFileSync('artifacts/reef-readability-baseline.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
