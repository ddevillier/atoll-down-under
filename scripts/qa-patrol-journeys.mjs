import fs from 'node:fs';import assert from 'node:assert/strict';import {Simulation} from '../src/simulation.js';import {PATROL_JOURNEYS,patrolSites,patrolPrey} from '../src/patrol-journeys.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),results=[];
for(const seed of [2,42,57])for(const id of Object.keys(PATROL_JOURNEYS)){
 const s=new Simulation(seed);s.start('practice',id);const count=s.sections.reduce((n,r)=>n+r.entities.length,0);let trips=0;
 for(let i=0;i<240*60&&s.phase==='playing'&&!s.adventure.complete;i++){
  if(i%12===0){const j=s.adventure.patrolJourney;
   if(!j){const site=patrolSites(s).sort((a,b)=>distance(a,s.player)-distance(b,s.player))[0];if(distance(site,s.player)<90)s.useContext();else s.point(site.x,site.y);}
   else if(j.stage===0){const site=patrolSites(s)[0];s.point(site.x,site.y);}
   else if(j.stage===1){if(!s.player.target){const prey=patrolPrey(s)[0];if(prey)s.eatAt(prey.x,prey.y);else if(trips<18){s.transition(1,0);trips++;if(trips%3===0)s.transition(0,Math.floor(s.current/3)===2?-2:1);}}if(PATROL_JOURNEYS[id].burst&&s.player.target!=null&&s.player.cooldown<=0)s.useAbility();}
   else if(j.reef!==s.current){const dy=Math.floor(j.reef/3)-Math.floor(s.current/3),dx=j.reef%3-s.current%3;s.transition(Math.sign(dx),Math.sign(dy));}
   else s.point(j.x,j.y);
  }
  s.step(1/60);
 }
 assert.equal(s.sections.reduce((n,r)=>n+r.entities.length,0),count);results.push({seed,id,complete:s.adventure.complete,seconds:s.time,phase:s.phase,energy:s.player.energy,health:s.player.health,journey:s.adventure.patrolJourney,current:s.current,trips});
}
const report={scope:'27 generated patrol journeys using ordinary pointer, E, meal and ability requests. Explicit map transitions select existing opportunities and return to the saved route. No entity, food, appetite or position replacements.',cases:results.length,completed:results.filter(r=>r.complete).length,results};fs.writeFileSync('artifacts/patrol-generated.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,results:results.filter(r=>!r.complete)}));assert.equal(report.completed,report.cases);
