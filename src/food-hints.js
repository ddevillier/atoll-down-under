import {edible,distance} from './simulation.js';

// Presentation only: never changes targets, food state or simulation randomness.
export function nearbyFoodHints(sim){
 if(!sim?.player||sim.phase!=='playing')return [];
 const p=sim.player;
 return [...sim.section.food.filter(f=>f.regrow<=0),...sim.section.entities.filter(e=>e.alive)]
  .filter(e=>edible(p,e)&&(!e.species?.poison||['crush','poison'].includes(p.species.ability)))
  .map(target=>({target,distance:distance(p,target)}))
  .filter(e=>e.distance<=480)
  .sort((a,b)=>a.distance-b.distance).slice(0,3).map(e=>e.target);
}
