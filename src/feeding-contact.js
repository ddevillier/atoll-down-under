import {anatomy} from './creation-appearance.js';
import {creatureWidth,creatureFrame} from './geometry.js';
import {rigFor} from './animal-rigs.js';
import {turnTowards} from './steering.js';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

// Feeding settles the side-view painting before contact. The authored mouth
// landmark is shared with articulation; size-based diet rules stay separate.
export function mouthPoint(e,{facing=e.facing||1,rotation=0}={}){
 const frame=creatureFrame({...e,facing},creatureWidth(e.species),rotation),rig=rigFor({id:e.species.id==='custom'?'s'+e.species.index:e.species.id});
 const direction=['s44','s46','s47','s62','s63'].includes(e.species.id)?1:facing;
 const custom=e.species.appearance?.appearanceVersion===1;
 const dx=(custom?anatomy(e.species).mouthX:rig.mouth[0]-.5)*frame.width*direction,dy=custom?0:(rig.mouth[1]-.5)*frame.height;
 return {x:frame.x+dx*Math.cos(rotation)-dy*Math.sin(rotation),y:frame.y+dx*Math.sin(rotation)+dy*Math.cos(rotation)};
}
export function feedingSurface(target,facing){
 if(target.species){
  const frame=creatureFrame(target);
  // Aim into the visible body/underside rather than a tail or long streamer.
  return {x:frame.x-facing*frame.width*.27,y:frame.y};
 }
 const radius=target.food==='detritus'?target.size*.55:target.food==='plankton'?target.size*.55:['worm','shrimp'].includes(target.food)?6:10;
 return {x:target.x-facing*radius,y:target.y};
}
export function feedingApproach(e,target){
 const frame=target.species?creatureFrame(target):target;
 // Choose the side from relative position, not the currently turning heading.
 // Otherwise a vertical approach can alternate its destination every frame.
 let facing=Math.sign(frame.x-e.x)||1;
 if(e.species.id==='s44')facing=1;
 function plan(side){const mouth=mouthPoint(e,{facing:side}),contact=feedingSurface(target,side);return {x:contact.x-(mouth.x-e.x),y:contact.y-(mouth.y-e.y),contact,facing:side};}
 let result=plan(facing);
 // At an edge, approach from the water side instead of waiting beyond the map.
 if(!e.entering){
  if((result.x<10||result.x>1590)&&e.species.id!=='s44')result=plan(-facing);
  result.x=clamp(result.x,10,1590);result.y=clamp(result.y,25,720);
 }
 return result;
}
export function contactGap(e,target){
 const a=mouthPoint(e),b=feedingSurface(target,e.species.id==='s44'?1:e.facing||1);
 return Math.hypot(a.x-b.x,a.y-b.y);
}

// A visible search cue on the final approach to an existing bottom-food meal.
// This does not reveal food, extend bite reach or grant an extra meal.
export function inspectingWithBarbels(e,target){
 if(!(e.species.id==='s9'&&e.alive&&!e.hidden&&!(e.stun>0)&&!(e.cleanTime>0)&&!e.cleanerTarget&&target?.kind==='food'&&['worm','shrimp'].includes(target.food)&&!(target.regrow>0)&&contactGap(e,target)<65))return false;
 const side=feedingApproach(e,target).facing;
 return Math.cos((e.angle||0)-(side>0?0:Math.PI))>.85;
}

export function approachMeal(e,target,dt,speed,turnRate=e.species.agility){
 const plan=feedingApproach(e,target),dx=plan.x-e.x,dy=plan.y-e.y,d=Math.hypot(dx,dy);
 const docking=d<Math.max(55,creatureWidth(e.species)*.55),heading=plan.facing===1?0:Math.PI;
 e.angle=turnTowards(e.angle,docking?heading:Math.atan2(dy,dx),turnRate*dt);
 const amount=Math.min(speed*dt,d);
 if(docking){
  // Match a moving meal's velocity while closing the remaining mouth gap.
  // Pure distance damping leaves a permanent gap of preySpeed / 7, making
  // slower fleeing fish impossible to catch despite available swimming speed.
  const vx=target.species&&Number.isFinite(target.vx)?target.vx:0,vy=target.species&&Number.isFinite(target.vy)?target.vy:0;
  const x=(dx*7+vx)*dt,y=(dy*7+vy)*dt,length=Math.hypot(x,y),scale=length?Math.min(1,speed*dt/length):0;
  e.x+=x*scale;e.y+=y*scale;
 }else if(d>.5){
  // Larger approach distances follow the species' turning rate.
  e.x+=Math.cos(e.angle)*amount;e.y+=Math.sin(e.angle)*amount;
 }
 e.facing=Math.cos(e.angle)>=0?1:-1;
 const aligned=Math.cos(e.angle-heading)>.995;
 return {ready:aligned&&contactGap(e,target)<=3,contact:feedingSurface(target,plan.facing),docking};
}
