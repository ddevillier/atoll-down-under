import fs from 'node:fs';
import {Simulation} from '../src/simulation.js';
import {DEFAULT_BLUEPRINT} from '../src/creations.js';
import {REEFS} from '../src/data.js';
import {edible} from '../src/diet.js';
// Search generated communities using steering and feeding commands only.
// Simulation time is accelerated; animals, hunger and opportunities are not replaced.
const attempts=[];let proof;
for(let seed=1;seed<=30&&!proof;seed++){
 const sim=new Simulation(seed);sim.start('create','custom',{...DEFAULT_BLUEPRINT,size:30,speed:220,agility:250});
 const meal=sim.section.food.find(f=>f.food==='algae'&&sim.findAt(f.x,f.y)===f);if(!meal)continue;
 sim.eatAt(meal.x,meal.y);for(let i=0;i<900&&sim.player.target;i++)sim.step(1/60);
 if(sim.protected)continue;
 let acquired=null,release=null;
 for(let i=0;i<3600&&sim.phase==='playing';i++){
  if(!acquired&&i%30===0){const hunter=sim.section.entities.filter(e=>e.alive&&edible(e,sim.player)&&e.satiated<=0).sort((a,b)=>Math.hypot(a.x-sim.player.x,a.y-sim.player.y)-Math.hypot(b.x-sim.player.x,b.y-sim.player.y))[0];if(hunter)sim.point(hunter.x,hunter.y);}
  sim.step(1/60);
  for(const event of sim.events.splice(0)){
   if(event.type==='pursuit-start'&&!acquired){acquired={...event,time:sim.time};const refuge=REEFS[sim.current].shelters.reduce((a,b)=>Math.hypot(a.x-sim.player.x,a.y-sim.player.y)<Math.hypot(b.x-sim.player.x,b.y-sim.player.y)?a:b);sim.point(refuge.x,refuge.y);}
   if(acquired&&event.type==='pursuit-release'&&event.animalId===acquired.animalId){release={...event,time:sim.time};break;}
  }
  if(release)break;
 }
 attempts.push({seed,acquired:!!acquired,release:release?.reason,phase:sim.phase});
 if(release?.reason==='concealment')proof={seed,acquired,release,hidden:sim.player.hidden,health:sim.player.health,reef:sim.current};
}
fs.writeFileSync('artifacts/creation-generated-refuge.json',JSON.stringify({scope:'Generated communities, accelerated production simulation, only steering/feeding commands; no entity or appetite overrides.',proof,attempts},null,2));
console.log(JSON.stringify({proof,attempts:attempts.length}));if(!proof)process.exitCode=1;
