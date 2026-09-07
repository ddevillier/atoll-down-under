import fs from 'node:fs';import {Simulation} from '../src/simulation.js';import {PLAYABLE} from '../src/data.js';import {animalProfile} from '../src/animal-profiles.js';import {creatureFrame} from '../src/geometry.js';
const output=process.argv[2]||'artifacts/social-spacing-current.json';if(fs.existsSync(output))throw Error('Use a fresh evidence filename.');
const results=[];
const gap=(a,b)=>{const x=creatureFrame(a),y=creatureFrame(b);return Math.hypot((a.x-b.x)/((x.width+y.width)*.38),(a.y-b.y)/((x.height+y.height)*.32));};
for(const species of PLAYABLE.filter(s=>['school','small-group','pair'].includes(animalProfile(s).social)))for(const seed of [42,123]){
 const s=new Simulation(seed);s.start('practice',species.id);s.protected=true;s.point(1300,120);const counts=s.sections.map(r=>r.entities.length);let samples=0,overlaps=0,pairSamples=0,pairOverlaps=0,sumNearest=0;
 for(let frame=0;frame<1800;frame++){s.step(1/30);if(frame<150||frame%6)continue;const fish=s.section.entities.filter(e=>e.alive&&!e.target&&!e.cleanTime&&!e.actionTime);
  for(const e of fish){if(e.activity==='schooling'){const same=fish.filter(b=>b!==e&&b.species.id===e.species.id);if(same.length){const near=same.sort((a,b)=>Math.hypot(e.x-a.x,e.y-a.y)-Math.hypot(e.x-b.x,e.y-b.y))[0];samples++;sumNearest+=Math.hypot(e.x-near.x,e.y-near.y);if(gap(e,near)<1)overlaps++;}}
   const partner=fish.find(b=>b.id===e.ecology?.partner);if(partner){pairSamples++;if(gap(e,partner)<1)pairOverlaps++;}
  }
 }
 results.push({species:species.id,seed,counts,samples,overlaps,pairSamples,pairOverlaps,meanNearest:samples?sumNearest/samples:null});
}
const totals=results.reduce((a,r)=>{for(const k of ['samples','overlaps','pairSamples','pairOverlaps'])a[k]+=r[k];return a;},{samples:0,overlaps:0,pairSamples:0,pairOverlaps:0});
const report={scope:'Existing generated communities; body-ellipse overlap proxy among free NPCs, sampled after five seconds. No animals injected. Not pixel collision or visual acceptance.',runs:results.length,...totals,results};fs.writeFileSync(output,JSON.stringify(report,null,2));console.log(JSON.stringify({...report,results:undefined}));
