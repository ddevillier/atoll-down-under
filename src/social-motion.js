import {creatureFrame} from './geometry.js';import {individualSeed} from './individual-motion.js';
import {animalProfile} from './animal-profiles.js';

export function socialOrder(a,b){return individualSeed(a.id)-individualSeed(b.id)||String(a.id).localeCompare(String(b.id));}

export function sharedMealAvailable(e,meal,entities){
 const social=animalProfile(e.species).social;
 if(social==='pair'&&e.ecology?.partner!=null)return !entities.some(b=>b.alive&&b.id===e.ecology.partner&&b.target===meal.id);
 if(!['school','small-group'].includes(social))return true;
 return entities.filter(b=>b!==e&&b.alive&&b.species.id===e.species.id&&b.target===meal.id).length<2;
}

// Small, time-bounded fin corrections keep broad painted bodies apart even
// before a heading change can take effect. No snapping or extra population.
export function separateCompanions(e,neighbors,dt){
 const a=creatureFrame(e);let x=0,y=0;
 for(const b of neighbors){
  const f=creatureFrame(b),rx=(a.width+f.width)*.44,ry=Math.max(12,(a.height+f.height)*.48);
  let dx=e.x-b.x,dy=e.y-b.y,d=Math.hypot(dx/rx,dy/ry);if(d>=1.4)continue;
  if(d<.001){const first=socialOrder(e,b)<0?e:b,angle=individualSeed(first.id)/4294967296*Math.PI*2,sign=first===e?1:-1;dx=Math.cos(angle)*sign;dy=Math.sin(angle)*sign;}
  const length=Math.hypot(dx,dy),weight=(1.4-d)/1.4;x+=dx/length*weight;y+=dy/length*weight;
 }
 const length=Math.hypot(x,y);if(!length)return;
 const speed=Math.min(e.species.speed*.2,22),step=speed*dt*Math.min(1,length);
 e.x+=x/length*step;e.y+=y/length*step;
}
