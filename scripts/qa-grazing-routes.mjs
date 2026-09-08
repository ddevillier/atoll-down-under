import fs from 'node:fs';import assert from 'node:assert/strict';import {Simulation} from '../src/simulation.js';
const results=[];
for(const seed of [1,2,7,17,42,57,78,123])for(const id of ['s5','s15']){
 const s=new Simulation(seed);s.start('practice',id);const count=s.section.entities.length,foods=s.section.food.filter(f=>f.food==='algae').sort((a,b)=>Math.hypot(a.x-s.player.x,a.y-s.player.y)-Math.hypot(b.x-s.player.x,b.y-s.player.y)).slice(0,2);let returning=false;
 for(let i=0;i<120*60&&s.phase==='playing'&&!s.adventure.complete;i++){
  const g=s.adventure.grazing;
  if(i%12===0&&!s.player.target){if(!g&&foods[0].regrow<=0)s.eatAt(foods[0].x,foods[0].y);else if(g&&!g.visitedOther&&foods[1].regrow<=0)s.eatAt(foods[1].x,foods[1].y);else if(g?.visitedOther&&!returning){s.point(foods[0].x,foods[0].y);returning=true;}}
  s.step(1/60);
 }
 const result={seed,id,complete:s.adventure.complete,seconds:s.time,health:s.player.health,energy:s.player.energy,still:s.player.still,homeDistance:Math.hypot(s.player.x-foods[0].x,s.player.y-foods[0].y),homeAmount:foods[0].amount,homeRegrow:foods[0].regrow};results.push(result);assert.equal(s.section.entities.length,count);
}
const report={scope:'Sixteen generated grazing routes with two real mouse-equivalent meal requests and one return steering request; no food, NPC, appetite or position replacements.',cases:results.length,completed:results.filter(r=>r.complete).length,maximumSeconds:Math.max(...results.map(r=>r.seconds)),results};fs.writeFileSync('artifacts/grazing-route-survey.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,results:undefined}));assert.equal(report.completed,report.cases);
