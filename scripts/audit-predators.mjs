import fs from 'node:fs';
import {Simulation,edible,distance} from '../src/simulation.js';
import {PLAYABLE,BY_ID,REEFS} from '../src/data.js';

// Read-only measurements of the shipped rules. Controlled fixtures below
// remove alternate food and initial protection to isolate chase behavior.
const population=[];
for(const species of PLAYABLE){
 let habitats=0,hunters=0,threats=0,emptyThreatHabitats=0,fasterThreats=0;
 let homeThreats=0,homeEmpty=0;
 for(let seed=1;seed<=30;seed++){
  const s=new Simulation(seed);s.start('practice',species.id);
  for(let id=0;id<9;id++){
   const alive=s.sections[id].entities.filter(e=>e.alive),h=alive.filter(e=>e.species.diet.includes('fish'));
   const possible=h.filter(e=>!species.poison&&edible(e,s.player));
   habitats++;hunters+=h.length;threats+=possible.length;
   if(!possible.length)emptyThreatHabitats++;
   fasterThreats+=possible.filter(e=>e.species.speed*.55>species.speed).length;
   if(id===s.current){homeThreats+=possible.length;if(!possible.length)homeEmpty++;}
  }
 }
 population.push({id:species.id,species:species.name,size:species.size,playerSpeed:species.speed,poisonImmune:species.poison,habitats,hunters,threats,emptyThreatHabitats,fasterThreats,meanHunters:hunters/habitats,meanThreats:threats/habitats,homeMeanThreats:homeThreats/30,homeEmptySeeds:homeEmpty});
}
const controls=[];
for(const hunterId of ['s16','s17','s32','s38'])for(const playerId of ['s1','s2','s8'])for(const movement of ['still','swim-away']){
 const s=new Simulation(42);s.start('practice',playerId);s.protected=false;
 const p=s.player,hunter=structuredClone(s.sections.flatMap(r=>r.entities).find(e=>e.species.ability!=='clean'));
 Object.assign(hunter,{species:BY_ID[hunterId],id:'audit-hunter',x:500,y:150,angle:0,target:null,satiated:0,pursuit:0,rest:0,think:0,health:100,alive:true});
 s.section.entities=[hunter];s.section.food=[];Object.assign(p,{x:610,y:150,angle:0});s.point(movement==='still'?610:1590,150);
 let bites=0,chasedSeconds=0,firstBite=null;
 for(let i=0;i<6*60&&s.phase==='playing';i++){
  s.step(1/60);if(hunter.target==='player')chasedSeconds+=1/60;
  for(const e of s.events)if(e.type==='hurt'){bites++;firstBite??=s.time;}
  s.events=[];
 }
 controls.push({hunter:BY_ID[hunterId].name,player:BY_ID[playerId].name,movement,eligible:edible(hunter,p),hunterChaseSpeed:BY_ID[hunterId].speed*.55,playerSpeed:p.species.speed,bites,firstBite,chasedSeconds,endDistance:distance(hunter,p),health:p.health});
}
const noProtectionDrain=new Simulation(42);noProtectionDrain.start('practice','s1');
for(let i=0;i<60*60;i++)noProtectionDrain.step(1/60);
const tournament=new Simulation(42);tournament.start('tournament');
const scored=()=>{const s=new Simulation(42);s.start('practice','s1');s.mode='challenge';s.protected=false;s.section.entities=[];return s;};
const fullMeal=scored();fullMeal.consume(fullMeal.section.food.find(f=>f.food==='algae'));
const poisoned=scored();poisoned.score=2000;poisoned.stageScore=2000;poisoned.consume(poisoned.section.food.find(f=>f.food==='sponge'));
const healthy=scored(),unhealthy=scored();unhealthy.player.health=20;
for(let i=0;i<60;i++){healthy.step(1/60);unhealthy.step(1/60);}
const scoreChecks={fullEnergyMeal:{energyGained:fullMeal.events.find(e=>e.type==='eat').energyGained,points:fullMeal.score},poisonPenalty:{totalScore:poisoned.score,stageScore:poisoned.stageScore},oneSecondSurvival:{healthyScore:healthy.score,unhealthyScore:unhealthy.score}};
const source={roster:PLAYABLE.length,seedCount:30,habitats:population.reduce((a,r)=>a+r.habitats,0),huntersPerHabitat:population.reduce((a,r)=>a+r.hunters,0)/population.reduce((a,r)=>a+r.habitats,0),speciesWithNoPossiblePredator:population.filter(r=>r.threats===0).map(r=>r.species),speciesWithThreatsButNoFasterHunter:population.filter(r=>r.threats>0&&r.fasterThreats===0).map(r=>r.species)};
const report={baseline:'06e1f58 (fullscreen changes do not alter simulation)',source,population,controls,scoreChecks,protectedAfter60Seconds:{energy:noProtectionDrain.player.energy,health:noProtectionDrain.player.health,protected:noProtectionDrain.protected},tournamentFirst:BY_ID[tournament.sequence[0]].name,tournamentLast:BY_ID[tournament.sequence.at(-1)].name,reefHomes:REEFS.map(r=>({name:r.name,habitat:r.habitat})),limits:'Census counts eligibility, not encounter frequency. Six-second fixtures isolate a single hungry hunter and straight swimming. Neither establishes the original game numerical constants or child play feel.'};
fs.mkdirSync('artifacts',{recursive:true});fs.writeFileSync('artifacts/predator-audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({source,controls:controls.map(({endDistance,...r})=>r),tournamentFirst:report.tournamentFirst,protectedAfter60Seconds:report.protectedAfter60Seconds}));
