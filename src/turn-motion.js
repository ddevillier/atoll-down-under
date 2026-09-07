import {animalProfile} from './animal-profiles.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const upright=new Set(['s44','s46','s47','s62','s63']);
// Authored, short side-view turns. A nose-led pivot and trailing body bend
// soften the mirror change; this does not manufacture a frontal illustration.
export function turnDuration(species){
 const family=animalProfile(species).family;
 return ['shark','carpet','heavy','eel'].includes(family)?.42:['ray','electric-ray'].includes(family)?.46:['rigid','hover','fan','frogfish'].includes(family)?.28:.32;
}
export function turningPose(pose,e,dt,reduced=false){
 const target=e.facing<0?-1:1;
 if(reduced||e.groundRoute||e.holdfast||e.activity==='cleaning'||upright.has(e.species.id)){
  pose.yaw=target;pose.turnDirection=0;
  return {facing:upright.has(e.species.id)?1:target,amount:0,bank:0,pivot:0,bend:0};
 }
 pose.yaw??=target;
 if(dt>0&&pose.yaw!==target){
  if(Math.abs(pose.yaw)===1)pose.turnDirection=Math.sign(Math.sin(e.angle||0))||1;
  const duration=e.feeding ? .16 : turnDuration(e.species);
  pose.yaw+=clamp(target-pose.yaw,-dt*2/duration,dt*2/duration);
 }
 const q=clamp(pose.yaw,-1,1),amount=1-q*q,side=q<0?-1:q>0?1:target;
 const family=animalProfile(e.species).family,compression=family==='eel'||[18,41].includes(e.species.index)?.12:.22;
 const width=1-amount*compression,facing=side*width,direction=pose.turnDirection||1;
 return {facing,amount,bank:Math.sin(Math.PI*(q+1)/2)*.16*direction,pivot:-facing*amount*.40,bend:amount*direction};
}
