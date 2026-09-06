import fs from 'node:fs';
fs.mkdirSync('artifacts',{recursive:true});
import {Simulation,edible,distance} from '../src/simulation.js';
import {PLAYABLE} from '../src/data.js';
const report=[];
for(const species of PLAYABLE){
 const sim=new Simulation(42);sim.start('practice',species.id);sim.protected=false;
 let meals=0,attempts=0,lastAttempt=-10;
 for(let i=0;i<180*30&&sim.phase==='playing';i++){
  const p=sim.player;
  if(!p.target&&sim.time-lastAttempt>2){
   const targets=[...sim.section.food.filter(f=>f.regrow<=0),...sim.section.entities.filter(e=>e.alive&&!e.species.poison)].filter(e=>edible(p,e)&&sim.findAt(e.x,e.y)===e).sort((a,b)=>distance(p,a)-distance(p,b));
   if(targets.length){const t=targets[0];if(sim.eatAt(t.x,t.y)){lastAttempt=sim.time;attempts++;}}
  }
  sim.step(1/30);meals+=sim.events.filter(e=>e.type==='eat').length;sim.events=[];
 }
 report.push({species:species.name,id:species.id,phase:sim.phase,seconds:Math.round(sim.time),meals,attempts,energy:Math.round(sim.player.energy),health:Math.round(sim.player.health)});
}
const result={scenario:'All 55 playable species; three minutes in initial habitat; choose nearest suitable, unobscured food through normal click targeting every two seconds; no abilities or cleaner use',completed:report.filter(r=>r.phase==='playing').length,total:report.length,noMeals:report.filter(r=>r.meals===0),ended:report.filter(r=>r.phase!=='playing'),runs:report};
fs.writeFileSync('artifacts/roster-'+(process.argv[2]||'current')+'.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,runs:undefined}));
