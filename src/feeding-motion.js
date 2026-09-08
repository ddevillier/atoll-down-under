import {animalProfile} from './animal-profiles.js';
const clamp=n=>Math.max(0,Math.min(1,n));
// Authored anticipation intervals, not measured strike speeds. The same action
// owns the visible mouth/appendage cue and the one simulation contact event.
export function contactDelay(species){
 const family=animalProfile(species).family;
 return ['heavy','carpet','frogfish'].includes(family)?.24:['rigid','ray','electric-ray'].includes(family)?.22:['cruiser','shark','needle'].includes(family)?.14:.18;
}
export function cancelPreparation(e){if(e.feeding&&!e.feeding.committed)e.feeding=null;}
export function tickFeeding(e,dt){
 const action=e.feeding;if(!action)return;
 if(!e.alive||e.stun>0){e.feeding=null;return;}
 if(action.committed){action.elapsed+=dt;if(action.elapsed>=action.contactAt+.36){e.feeding=null;e.actionTime=0;}}
 else if(e.target!==action.target)e.feeding=null;
}
export function mealContact(e,target,dt,contact=target){
 if(e.feeding?.committed)return false;
 if(!e.feeding||e.feeding.target!==target.id)e.feeding={target:target.id,elapsed:0,contactAt:contactDelay(e.species),committed:false,x:target.x,y:target.y};
 const action=e.feeding;action.x=contact.x;action.y=contact.y;action.elapsed+=dt;
 if(action.elapsed<action.contactAt)return false;
 action.committed=true;return true;
}
export function feedingEnvelope(e){
 if(e.foragingPrep)return .25+.55*Math.sin(Math.PI*Math.min(1,e.foragingPrep.elapsed/1.5));
 if(e.feeding){const a=e.feeding;return a.committed?1-clamp((a.elapsed-a.contactAt)/.36):Math.sin(clamp(a.elapsed/a.contactAt)*Math.PI/2);}
 if(e.residentMeal)return Math.sin(Math.PI*Math.min(1,e.residentMeal.elapsed/.85));
 return Math.sin(Math.PI*Math.min(1,(e.actionTime||0)/.65));
}
export function validFeeding(a){return a==null||typeof a==='object'&&['string','number'].includes(typeof a.target)&&typeof a.committed==='boolean'&&['elapsed','contactAt','x','y'].every(k=>Number.isFinite(a[k]))&&a.elapsed>=0&&a.elapsed<=1&&a.contactAt>=.1&&a.contactAt<=.3;}
