import {REEFS} from './data.js';
import {refugeRole,remember} from './creations.js';
import {shelterAt,canUseShelter,SHELTER_SETTLE_SECONDS} from './shelter.js';
import {rememberHomecoming} from './reef-memories.js';
export function chooseCustomRefuge(sim){
 if(!refugeRole(sim.creation)||sim.trial||sim.paused||sim.phase!=='playing')return false;
 const site=shelterAt(REEFS[sim.current],sim.player);
 if(!site){sim.event('message','Swim to a marked refuge, then press E to make it home.');return false;}
 const index=REEFS[sim.current].shelters.indexOf(site);
 if(sim.creation.home?.reef===sim.current&&sim.creation.home.index===index){
  sim.event('message',customInstruction(sim),{x:site.x,y:site.y});return true;
 }
 sim.creation.home={reef:sim.current,index};sim.creation.departed=false;sim.creation.meal=false;
 sim.event('message','This is your refuge. Take a needed meal, then return and settle.',{x:site.x,y:site.y,creationChanged:true});return true;
}
export function customInstruction(sim){const c=sim.creation;if(!c)return '';
 if(!refugeRole(c))return 'Explore freely. Needed meals and good care become memories for this fish.';
 if(!c.home)return 'Choose a refuge · Swim to a marked shelter and press E';
 if(c.home.reef!==sim.current)return 'Your refuge is in '+REEFS[c.home.reef].name+' · Open the map to return';
 return !c.departed?'Leave your refuge and find a needed meal':!c.meal?'Take a suitable meal while you need energy':'Return to your refuge and become still';
}
export function customMeal(sim,gained,food){if(sim.trial||!sim.creation||gained<1)return;remember(sim.creation,'meal');if(sim.creation.home&&sim.creation.departed){sim.creation.meal=true;sim.creation.tripFood=food?.kind==='food'?food.food:food?.species?.food||'fish';}}
export function tickCustomLife(sim){const c=sim.creation;if(!c||sim.trial||sim.paused||sim.phase!=='playing')return;const p=sim.player;if(!p||p.health<=0||p.energy<=0)return;
 if(p.hidden&&canUseShelter(p.species)&&shelterAt(REEFS[sim.current],p))remember(c,'refuge');
 if(sim.careProgress?.healthy>=30)remember(c,'care');
 if(!c.home)return;const site=REEFS[c.home.reef].shelters[c.home.index];
 if(!site){c.home=null;c.departed=false;c.meal=false;return;}
 const near=c.home.reef===sim.current&&Math.hypot(p.x-site.x,p.y-site.y)<site.r;
 if(!near)c.departed=true;
 if(near&&p.hidden&&p.still>SHELTER_SETTLE_SECONDS&&c.departed&&c.meal){remember(c,'return');rememberHomecoming(sim,'your refuge',c.tripFood?[c.tripFood]:[]);c.departed=false;c.meal=false;delete c.tripFood;sim.event('homecoming','Back at your refuge in '+REEFS[sim.current].name+'. Rest here, or head out for another swim.',{x:site.x,y:site.y});}
}
