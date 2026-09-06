import fs from 'node:fs';
import {Simulation} from '../src/simulation.js';
import {PLAYABLE,REEFS} from '../src/data.js';
const rows=REEFS.map(r=>({id:r.id,name:r.name,samples:0,min:Infinity,max:0,sum:0,twoHunters:0,foodPatches:0}));
for(const player of PLAYABLE)for(let seed=1;seed<=30;seed++){
 const s=new Simulation(seed);s.start('practice',player.id);
 s.sections.forEach((section,i)=>{const row=rows[i],n=section.entities.length;row.samples++;row.min=Math.min(row.min,n);row.max=Math.max(row.max,n);row.sum+=n;row.twoHunters+=Number(section.entities.filter(e=>e.species.diet.includes('fish')).length===2);row.foodPatches=section.food.length;});
}
const sustained=[];
for(const id of ['s1','s19'])for(const seed of [7,42,91])for(const reef of REEFS){
 const s=new Simulation(seed);s.start('practice',id);s.current=reef.id;
 let min=s.section.entities.length,max=min;
 for(let tick=0;tick<180*10;tick++){
  s.step(.1);
  const alive=s.section.entities.filter(e=>e.alive).length;
  min=Math.min(min,alive);max=Math.max(max,alive);
 }
 sustained.push({period:s.period,seed,reef:reef.id,min,max,final:s.section.entities.filter(e=>e.alive).length});
}
const report={method:'55 playable species × 30 seeds × 9 initial habitats. Sustained: protected stationary player, 180 seconds per habitat at 10 Hz, day/night and seeds 7,42,91; NPC feeding and respawn active. Not a child-play difficulty assessment or original-game census.',initial:rows.map(({sum,...r})=>({...r,mean:+(sum/r.samples).toFixed(2),secondHunterRate:+(r.twoHunters/r.samples).toFixed(3)})),sustained};
fs.mkdirSync('artifacts',{recursive:true});fs.writeFileSync('artifacts/population-audit.json',JSON.stringify(report,null,2));
console.table(report.initial.map(({name,min,max,mean,secondHunterRate})=>({name,min,max,mean,secondHunterRate})));
console.log('Sustained fixtures:',sustained.length);
