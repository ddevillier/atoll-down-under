import fs from 'node:fs';import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';import {exportDive,importDive} from '../src/save-files.js';
const cases=[];
for(const seed of [2,42,57])for(const id of ['s1','s13'])for(let reef=0;reef<9;reef++){
 const s=new Simulation(seed);s.start('practice',id);if(s.current!==reef)s.transition(reef%3-s.current%3,Math.floor(reef/3)-Math.floor(s.current/3));s.protected=false;s.point(800,330);
 const initial=s.section.entities.length,foodCount=s.section.food.length;let minimumAlive=initial,maximumAlive=0,minimumFood=100,checkpoint=false;
 for(let i=0;i<180*30&&s.phase==='playing';i++){
  s.step(1/30);
  if(i%30===0){
   assert.equal(s.section.entities.length,initial);assert.equal(s.section.food.length,foodCount);
   const alive=s.section.entities.filter(e=>e.alive).length;minimumAlive=Math.min(minimumAlive,alive);maximumAlive=Math.max(maximumAlive,alive);
   for(const e of [s.player,...s.section.entities])for(const k of ['x','y','health','energy'])assert.ok(Number.isFinite(e[k]),`${seed}/${id}/${reef}: ${k}`);
   for(const f of s.section.food){assert.ok(f.amount>0&&f.amount<=100);assert.ok(f.regrow>=0);if(f.regrow<=0)minimumFood=Math.min(minimumFood,f.amount);}
  }
  if(i===90*30){const copy=importDive(exportDive(s,'Pressure checkpoint')).simulation;const before=copy.serialize();copy.step(2);assert.equal(copy.serialize(),before);copy.paused=false;const reference=Simulation.restore(s.serialize());reference.paused=false;for(let k=0;k<30;k++){copy.step(1/30);reference.step(1/30);}assert.equal(copy.serialize(),reference.serialize());checkpoint=true;}
 }
 cases.push({seed,id,reef,seconds:s.time,initial,minimumAlive,maximumAlive,foodCount,minimumFood,checkpoint,phase:s.phase,bites:s.events.filter(e=>e.type==='hurt').length,health:s.player.health,energy:s.player.energy});
}
const report={scope:'54 generated habitat/period/seed cases; ordinary steering to the center followed by inactivity for up to 180 seconds. No animal, food, appetite or player-resource replacement; deaths end their case. This is a stability/pressure survey, not an active-play survival estimate.',cases:cases.length,populationRange:[Math.min(...cases.map(c=>c.initial)),Math.max(...cases.map(c=>c.initial))],bites:cases.reduce((n,c)=>n+c.bites,0),deaths:cases.filter(c=>c.phase==='dead'),checkpoints:cases.filter(c=>c.checkpoint).length,results:cases};
fs.writeFileSync('artifacts/gameplay-pressure.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,results:undefined,deaths:report.deaths.map(c=>({seed:c.seed,id:c.id,reef:c.reef,seconds:c.seconds,bites:c.bites,health:c.health,energy:c.energy}))}));
