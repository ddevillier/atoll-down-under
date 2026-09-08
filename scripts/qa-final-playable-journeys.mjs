import fs from 'node:fs';import assert from 'node:assert/strict';import {Simulation} from '../src/simulation.js';import {suitableMeal} from '../src/diet.js';import {companion,companionCandidates,companionFoods} from '../src/companion-activity.js';import {escortHost,escortCandidates} from '../src/escort-journeys.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),results=[];
for(const seed of [2,42,57])for(const id of ['s40','s56','s41','s53']){
 const s=new Simulation(seed);s.start('practice',id);const count=s.sections.reduce((n,r)=>n+r.entities.length,0);let trips=0;
 for(let i=0;i<300*60&&s.phase==='playing'&&!s.adventure.complete;i++){
  if(i%15===0&&!s.player.target){
   if(['s40','s56'].includes(id)){const e=companion(s),j=s.adventure.buddy;if(!e){const c=companionCandidates(s)[0];if(c){if(distance(c,s.player)<240)s.useContext();else s.point(c.x,c.y);}else if(trips<18){s.transition(1,0);trips++;if(trips%3===0)s.transition(0,Math.floor(s.current/3)===2?-2:1);}}
    else if(!j.playerMeal){const food=companionFoods(s.player)[j.foods?.length||0],f=s.section.food.filter(f=>f.food===food&&f.regrow<=0).sort((a,b)=>distance(a,s.player)-distance(b,s.player))[0];if(f){if(distance(f,e)<250)s.eatAt(f.x,f.y);else s.point(f.x,f.y);}}
    else if(!j.partnerMeal){const f=s.section.food.filter(f=>f.regrow<=0&&e.species.diet.includes(f.food)).sort((a,b)=>distance(a,e)-distance(b,e))[0];if(f)s.point(f.x+70,f.y);}
    else s.point(e.x+70,e.y);
   }else{const j=s.adventure.escortJourney,e=escortHost(s);if(!e){const c=escortCandidates(s)[0];if(c){if(distance(c,s.player)<260)s.useContext();else s.point(c.x,c.y);}else if(trips<18){s.transition(1,0);trips++;if(trips%3===0)s.transition(0,Math.floor(s.current/3)===2?-2:1);}}
    else if(j.joined<3||j.meal){if(!j.following&&escortCandidates(s).some(c=>c.id===e.id))s.useContext();}
    else if(id==='s53'&&!j.flashed){if(distance(s.player,e)<150)s.useAbility();else if(!j.following)s.useContext();}
    else{const foods=[...s.section.food.filter(f=>f.regrow<=0),...s.section.entities.filter(f=>f.alive&&f.id!==e.id)].filter(f=>suitableMeal(s.player,f)&&(id==='s53'?f.food==='plankton'&&distance(f,e)>120&&distance(f,e)<450:distance(f,e)<280)).sort((a,b)=>(a.kind==='food'?0:1)-(b.kind==='food'?0:1)||distance(a,s.player)-distance(b,s.player));if(foods[0])s.eatAt(foods[0].x,foods[0].y);else if(!j.following&&escortCandidates(s).some(c=>c.id===e.id))s.useContext();}
   }
  }const before={x:s.player.x,y:s.player.y,reef:s.current};s.step(1/60);if(['s41','s53'].includes(id)){const limit=s.player.species.speed/60+1e-6;if(s.current===before.reef)assert.ok(distance(before,s.player)<=limit,'Swimming stays inside normal speed');else{const row=Math.floor(before.reef/3),col=before.reef%3,nr=Math.floor(s.current/3),nc=s.current%3;const vertical=col===nc&&Math.abs(s.player.x-before.x)<=limit&&(nr===row+1&&before.y>=732-limit&&s.player.y===35||nr===row-1&&before.y<=8+limit&&s.player.y===705);const horizontal=row===nr&&Math.abs(s.player.y-before.y)<=limit&&(nc===(col+1)%3&&before.x>=1592-limit&&s.player.x===35||nc===(col+2)%3&&before.x<=8+limit&&s.player.x===1565);assert.ok(vertical||horizontal,'A crossing must start at the matching edge and enter an adjacent habitat');}}
 }
 assert.equal(s.sections.reduce((n,r)=>n+r.entities.length,0),count);results.push({seed,id,complete:s.adventure.complete,seconds:s.time,phase:s.phase,energy:s.player.energy,buddy:s.adventure.buddy,escort:s.adventure.escortJourney,current:s.current,trips});
}
const report={scope:'Twelve generated trips using ordinary pointer, E, ability and meal requests, with habitat transitions to existing partners. No food, appetite, position or NPC replacements.',cases:results.length,completed:results.filter(r=>r.complete).length,results};fs.writeFileSync('artifacts/final-playable-generated.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,results:results.filter(r=>!r.complete)}));assert.equal(report.completed,report.cases);
