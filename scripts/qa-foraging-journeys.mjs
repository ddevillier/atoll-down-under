import fs from 'node:fs';import assert from 'node:assert/strict';import {Simulation,edible} from '../src/simulation.js';import {REEFS} from '../src/data.js';import {FORAGING_JOURNEYS,foragingSites} from '../src/foraging-journeys.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),results=[];
for(const seed of [2,42,57])for(const [id,d] of Object.entries(FORAGING_JOURNEYS)){
 const s=new Simulation(seed);s.start('practice',id);const populations=s.sections.map(r=>r.entities.length);let trips=0;
 for(let i=0;i<180*60&&s.phase==='playing'&&!s.adventure.complete;i++){
  if(i%20===0&&!s.player.target&&!s.player.foragingPrep){const j=s.adventure.foragingJourney;
   if(j?.meals.length===2&&d.kind==='browse'){
    if(id==='s25'){const h=[...REEFS[s.current].shelters].sort((a,b)=>distance(a,s.player)-distance(b,s.player))[0];s.point(h.x,h.y);}
    else{const group=s.section.entities.filter(e=>e.alive&&e.species.id==='s4');if(group.length>=1)s.point(group.reduce((n,e)=>n+e.x,0)/group.length,group.reduce((n,e)=>n+e.y,0)/group.length);else if(trips<18){s.transition(1,0);trips++;if(trips%3===0)s.transition(0,Math.floor(s.current/3)===2?-2:1);};}
   }else{const f=foragingSites(s).map(site=>site.food).find(f=>f&&edible(s.player,f));if(f)s.eatAt(f.x,f.y);else if(trips<18){s.transition(1,0);trips++;if(trips%3===0)s.transition(0,Math.floor(s.current/3)===2?-2:1);};}
  }
  s.step(1/60);
 }
 assert.deepEqual(s.sections.map(r=>r.entities.length),populations);results.push({seed,id,complete:s.adventure.complete,seconds:s.time,phase:s.phase,health:s.player.health,energy:s.player.energy,journey:s.adventure.foragingJourney,prep:s.player.foragingPrep,target:s.player.target,current:s.current,trips});
}
const report={scope:'Thirty generated foraging journeys with ordinary meal requests and pointer/group/shelter steering; habitat transitions select another existing food opportunity. No NPC, food, appetite or position replacements.',cases:results.length,completed:results.filter(r=>r.complete).length,results};fs.writeFileSync('artifacts/foraging-journeys-generated.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,results:results.filter(r=>!r.complete)}));assert.equal(report.completed,report.cases);
