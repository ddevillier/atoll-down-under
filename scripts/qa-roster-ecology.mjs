import fs from 'node:fs';import crypto from 'node:crypto';import {Simulation} from '../src/simulation.js';import {PLAYABLE} from '../src/data.js';
const before=process.argv.includes('--baseline'),file=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||(before?'artifacts/roster-before-simulation.json':'artifacts/roster-after-simulation.json');
if(before&&fs.existsSync(file))throw Error('The pre-uplift baseline is already preserved.');
const results=[];
for(const species of PLAYABLE)for(const scenario of ['stationary','swim']){
 const s=new Simulation(scenario==='stationary'?42:123);s.start('practice',species.id);s.protected=false;const counts=s.sections.map(r=>r.entities.length);
 for(let i=0;i<3600;i++){if(scenario==='swim'&&i%600===0){const points=[[500,350],[900,250],[1100,480],[700,400],[950,350],[600,300]],p=points[i/600];s.point(...p);}s.step(1/60);}
 results.push({id:species.id,scenario,counts,health:s.player.health,energy:s.player.energy,bites:s.events.filter(e=>e.type==='hurt').length,phase:s.phase,alive:s.section.entities.filter(e=>e.alive).length});
}
const report={scenarios:results.length,sourceHash:crypto.createHash('sha256').update(fs.readFileSync('src/simulation.js')).digest('hex'),bites:results.reduce((n,r)=>n+r.bites,0),deaths:results.filter(r=>r.phase==='dead').length,results};
report.sourceHashes=Object.fromEntries(fs.readdirSync('src').filter(name=>name.endsWith('.js')).sort().map(name=>[name,crypto.createHash('sha256').update(fs.readFileSync('src/'+name)).digest('hex')]));
if(!before){const baseline=JSON.parse(fs.readFileSync('artifacts/roster-before-simulation.json','utf8'));report.comparison={baselineBites:baseline.bites,baselineDeaths:baseline.deaths,populationsUnchanged:results.every((r,i)=>JSON.stringify(r.counts)===JSON.stringify(baseline.results[i].counts)),healthChanges:results.filter((r,i)=>Math.abs(r.health-baseline.results[i].health)>.01).map(r=>({id:r.id,scenario:r.scenario,health:r.health,before:baseline.results.find(b=>b.id===r.id&&b.scenario===r.scenario).health}))};}
fs.writeFileSync(file,JSON.stringify(report,null,2));console.log(JSON.stringify({...report,results:undefined}));
