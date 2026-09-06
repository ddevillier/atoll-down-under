import fs from 'node:fs';
fs.mkdirSync('artifacts',{recursive:true});
import {Simulation} from '../src/simulation.js';
const runs=[];
for(const species of ['s0','s1','s2'])for(let seed=1;seed<=10;seed++){
 const sim=new Simulation(seed);sim.start('practice',species);sim.protected=false;
 let chased=0,bites=0;
 for(let i=0;i<120*30&&sim.phase==='playing';i++){
  const t=i/30;sim.point(800+Math.cos(t*.065)*350,330+Math.sin(t*.065)*160);
  sim.step(1/30);
  if(sim.section.entities.some(e=>e.target==='player'))chased+=1/30;
  bites+=sim.events.filter(e=>e.type==='hurt').length;sim.events=[];
 }
 runs.push({species,seed,seconds:Math.round(sim.time),chased:Math.round(chased),bites,phase:sim.phase});
}
const report={scenario:'30 small-fish dives; two-minute open-water circuit; no food, abilities or deliberate hiding; initial protection disabled',survived:runs.filter(r=>r.phase==='playing').length,total:runs.length,meanChasedSeconds:runs.reduce((n,r)=>n+r.chased,0)/runs.length,bites:runs.reduce((n,r)=>n+r.bites,0),runs};
fs.writeFileSync('artifacts/ecology-'+(process.argv[2]||'current')+'.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,runs:undefined}));
