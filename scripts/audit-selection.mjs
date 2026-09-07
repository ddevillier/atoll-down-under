import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {PLAYABLE} from '../src/data.js';

const baseline='0851982';
let source=execFileSync('git',['show',`${baseline}:src/simulation.js`],{encoding:'utf8'});
source=source.replace(/from '(\.\/[^']+)'/g,(_,p)=>`from '${new URL(p,new URL('../src/simulation.js',import.meta.url)).href}'`);
const {Simulation:Before}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const rows=[];
for(const [label,Model] of [['before',Before],['after',Simulation]]){
 let patches=0,animalSelected=0,wrongPatch=0;
 for(const player of PLAYABLE)for(let seed=1;seed<=30;seed++){
  const sim=new Model(seed);sim.start('practice',player.id);
  for(let i=0;i<9;i++){
   sim.current=i;
   for(const f of sim.section.food){
    patches++;const hit=sim.findAt(f.x,f.y);
    if(hit?.species)animalSelected++;else if(hit!==f)wrongPatch++;
   }
  }
 }
 rows.push({label,patches,animalSelected,wrongPatch});
}
assert.equal(rows[1].animalSelected,0);assert.equal(rows[1].wrongPatch,0);
const report={baseline,method:'55 playable species × 30 seeds × 9 initial scenes; cursor at every renewable food center. Counts potential selection conflicts, not player errors or later overlap frequency.',rows};
fs.mkdirSync('artifacts',{recursive:true});
fs.writeFileSync('artifacts/selection-audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
