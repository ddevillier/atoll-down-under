import fs from 'node:fs';import assert from 'node:assert/strict';import {Simulation} from '../src/simulation.js';import {WATCH_JOURNEYS,watchPlaces,watchPrey,aimWatch} from '../src/watch-journeys.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),results=[];
for(const seed of [2,42,57])for(const [id,d] of Object.entries(WATCH_JOURNEYS)){
 const s=new Simulation(seed);s.start('practice',id);const count=s.sections.reduce((n,r)=>n+r.entities.length,0);let waiting=0,trips=0;
 for(let i=0;i<240*60&&s.phase==='playing'&&!s.adventure.complete;i++){
  if(i%12===0){const j=s.adventure.watchJourney;
   if(j?.watching&&j.stage<2){const f=watchPrey(s).find(f=>distance(f,s.player)<=d.range);if(f){aimWatch(s,f.x,f.y);waiting=0;if(j.noticed>=1&&j.focus?.id===f.id)s.eatAt(f.x,f.y);}else{waiting+=.2;if(waiting>12){s.useContext();waiting=0;}}}
   else if(!s.player.target&&!j?.watching){let site;if(j?.stage===2)site=d.relocate&&!j.relocated?watchPlaces(s).filter(p=>p.id!==j.site).sort((a,b)=>distance(a,s.player)-distance(b,s.player))[0]:{x:j.x,y:j.y};else{const foods=watchPrey(s);site=watchPlaces(s).sort((a,b)=>Math.min(...foods.map(f=>distance(a,f)))-Math.min(...foods.map(f=>distance(b,f))))[0];if(!foods.some(f=>distance(f,site)<d.range)&&trips<12){s.transition(1,0);trips++;if(trips%3===0)s.transition(0,Math.floor(s.current/3)===2?-2:1);site=null;}}
    if(site){if(distance(site,s.player)<45)s.useContext();else s.point(site.x,site.y);}
   }
  }
  s.step(1/60);
 }
 assert.equal(s.sections.reduce((n,r)=>n+r.entities.length,0),count);results.push({seed,id,complete:s.adventure.complete,seconds:s.time,phase:s.phase,energy:s.player.energy,journey:s.adventure.watchJourney,current:s.current,trips});
}
const report={scope:'21 generated watch journeys with pointer steering, E, aim and ordinary meal requests; explicit habitat transitions search existing opportunities. No NPC, food, appetite or position replacements.',cases:results.length,completed:results.filter(r=>r.complete).length,results};fs.writeFileSync('artifacts/watch-generated.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,results:results.filter(r=>!r.complete)}));assert.equal(report.completed,report.cases);
