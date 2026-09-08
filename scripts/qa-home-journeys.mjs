import fs from 'node:fs';import assert from 'node:assert/strict';import {Simulation,edible} from '../src/simulation.js';import {HOME_JOURNEYS,homeJourneySites,chosenHome} from '../src/home-journeys.js';
const results=[];const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
for(const seed of [2,42,57])for(const [id,d] of Object.entries(HOME_JOURNEYS)){
 const s=new Simulation(seed);s.start('practice',id);const count=s.section.entities.length;let site=homeJourneySites(s).sort((a,b)=>distance(a,s.player)-distance(b,s.player))[0];
 for(let i=0;i<240*60&&s.phase==='playing'&&!s.adventure.complete;i++){
  if(i%20===0){const j=s.adventure.homeJourney;
   if(!j){if(distance(s.player,site)<95)s.useContext();else s.point(site.x,site.y);}
   else if(j.stage===0||j.stage===2){const home=chosenHome(s);if(home)s.point(home.x,home.y);}
   else if(!j.departed){s.point(site.x>800?site.x-220:site.x+220,site.y);}
   else if(!s.player.target){const types=d.ordered?[d.foods[j.meals.length]]:d.foods;
    const food=[...s.section.food.filter(f=>f.regrow<=0),...s.section.entities.filter(e=>e.alive)].filter(f=>edible(s.player,f)&&types.includes(f.kind==='food'?f.food:f.species?.food||'fish')).sort((a,b)=>distance(a,s.player)-distance(b,s.player))[0];if(food)s.eatAt(food.x,food.y);
   }
  }
  s.step(1/60);
 }
 assert.equal(s.section.entities.length,count);results.push({seed,id,complete:s.adventure.complete,seconds:s.time,phase:s.phase,health:s.player.health,energy:s.player.energy,journey:s.adventure.homeJourney,position:{x:s.player.x,y:s.player.y},target:s.player.target,population:count});
}
const report={scope:'Twenty-four generated home journeys, three seeds and all eight species, using pointer steering, E and mouse-equivalent meal requests. No NPC, food, appetite or position replacement.',cases:results.length,completed:results.filter(r=>r.complete).length,results};fs.writeFileSync('artifacts/home-journeys-generated.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,results:report.results.filter(r=>!r.complete)}));assert.equal(report.completed,report.cases);
