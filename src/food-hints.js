import {storyFoodHidden} from './reef-stories.js';
import {distance} from './simulation.js';
import {suitableMeal} from './diet.js';
import {defended} from './ability-rules.js';

// Presentation only: never changes targets, food state or simulation randomness.
export function nearbyFoodHints(sim){
 if(!sim?.player||sim.phase!=='playing')return [];
 const p=sim.player;
 return [...sim.section.food.filter(f=>f.regrow<=0&&!storyFoodHidden(sim,f)),...sim.section.entities.filter(e=>e.alive)]
  .filter(e=>suitableMeal(p,e)&&(!e.species||!defended(e)))
  .map(target=>({target,distance:distance(p,target)}))
  .filter(e=>e.distance<=480)
  .sort((a,b)=>a.distance-b.distance).slice(0,3).map(e=>e.target);
}
