import fs from 'node:fs';
import {Simulation,edible,distance,healthState,W,H} from '../src/simulation.js';
import {PLAYABLE,REEFS} from '../src/data.js';

// A bounded playability exercise, not a substitute for a person playing.
// Decisions are ten seconds apart. Food is sought below 65 energy, cleaning
// when parasites account for over 35 health points. Otherwise the fish explores,
// including adjacent habitats. Cleaners cannot repair a bite; food supports that.
const report=[];
for(const species of PLAYABLE){
 const sim=new Simulation(42);sim.start('practice',species.id);sim.protected=false;
 let task='explore',nextDecision=0,taskStart=0,meals=0,bites=0,cleanings=0,chased=0;
 let mealTime=0,cleanTime=0,exploreTime=0,mealAttempts=0;
 for(let i=0;i<600*30&&sim.phase==='playing';i++){
  const p=sim.player;
  if(sim.time>=nextDecision){
   nextDecision=sim.time+10;
   // Abandon a missed meal or a visit that cannot settle, as a player can.
   if(task==='meal'&&(!p.target||sim.time-taskStart>20))task='explore';
   if(task==='clean'&&(healthState(p).parasites<1||sim.time-taskStart>30))task='explore';
   if(task==='explore'){
    if(healthState(p).parasites>35&&p.energy>=50&&species.parasites){
     const cleaner=sim.section.entities.find(e=>e.alive&&e.species.ability==='clean');
     if(cleaner){const station=cleaner.station||cleaner;sim.point(station.x+35,station.y);task='clean';taskStart=sim.time;}
    }else if(p.energy<65){
     const targets=[...sim.section.food.filter(f=>f.regrow<=0),...sim.section.entities.filter(e=>e.alive&&!e.species.poison)]
      .filter(e=>edible(p,e)&&sim.findAt(e.x,e.y)===e).sort((a,b)=>distance(p,a)-distance(p,b));
     if(targets.length){const t=targets[0];sim.eatAt(t.x,t.y);task='meal';taskStart=sim.time;mealAttempts++;}
    }
    if(task==='explore'){
     // Keep swimming toward an exit until it is reached; other visits trace
     // large routes through the scene without deliberately avoiding hunters.
     const segment=Math.floor(sim.time/60)%4;
     if(segment===1)sim.point(W,H*.45);
     else if(segment===3){const r=REEFS[sim.current];sim.point(W*.55,r.row<2?H:0);}
     else sim.point(800+Math.cos(sim.time*.025)*500,360+Math.sin(sim.time*.025)*210);
    }
   }
  }
  sim.step(1/30);
  if(task==='meal')mealTime+=1/30;else if(task==='clean')cleanTime+=1/30;else exploreTime+=1/30;
  if(sim.section.entities.some(e=>e.target==='player'))chased+=1/30;
  for(const e of sim.events){if(e.type==='eat'){meals++;task='explore';}if(e.type==='hurt')bites++;if(e.type==='clean'){cleanings++;task='explore';}}
  sim.events=[];
 }
 report.push({species:species.name,id:species.id,phase:sim.phase,seconds:Math.round(sim.time),habitats:sim.visited.length,meals,mealAttempts,cleanings,bites,chasedSeconds:Math.round(chased),mealSeconds:Math.round(mealTime),cleaningSeconds:Math.round(cleanTime),explorationSeconds:Math.round(exploreTime),energy:Math.round(sim.player.energy),health:Math.round(sim.player.health)});
}
const result={scenario:'55 species, seed 42, ten minutes per dive, decisions every ten seconds, meals below 65 energy, cleaning above 35 parasite damage when energy is at least 50, habitat travel, no defensive abilities or deliberate predator avoidance; protection disabled',completed:report.filter(r=>r.phase==='playing').length,total:report.length,ended:report.filter(r=>r.phase!=='playing'),runs:report};
fs.mkdirSync('artifacts',{recursive:true});fs.writeFileSync('artifacts/exploration-'+(process.argv[2]||'current')+'.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,runs:undefined}));
