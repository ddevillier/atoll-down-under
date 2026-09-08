import {creatureFrame} from './geometry.js';import {individualSeed} from './individual-motion.js';import {approachRefuge} from './refuge-motion.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
// Short, authored display windows during the established refuge-rest cycle.
// The existing player ability remains the explicit six-second invitation.
export function lureDisplay(e){
 if(!e?.alive||e.species.ability!=='lure'||e.stun>0||e.cleanTime>0||e.cleanerTarget)return 0;
 if(e.id==='player')return e.abilityTime>0||e.ambush?.settled>=2&&!e.ambush.strike&&!e.target&&e.ambush.clock%8<5?1:0;
 if(e.hidden||e.target||e.feeding||e.actionTime>0||e.satiated>0||e.rest>0||e.activity!=='at-home'||!e.ecology)return 0;
 const phase=e.ecology.clock%(18+individualSeed(e.id)%9);
 return clamp((phase-9)/.5,0,1)*clamp((13-phase)/.5,0,1);
}
export function lurePoint(e){const f=creatureFrame(e);return {x:f.x+f.width*.48*(e.facing||1),y:f.y-f.height*.39};}
export function attractingLure(sim,e,edible){
 if(e.target||e.feeding||e.actionTime>0||e.rest>0||e.hidden||e.stun>0||e.cleanTime>0||e.cleanerTarget||e.species.ability==='clean'||e.activity==='avoiding'||e.behavior?.startsWith('Moving away'))return null;
 return [...sim.section.entities,sim.player].filter(b=>b!==e&&lureDisplay(b)>.1&&edible(b,e)&&!e.species.poison&&Math.hypot(b.x-e.x,b.y-e.y)<(b.id==='player'?340:240)).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y))[0]||null;
}
export function approachLure(e,lurer,dt,speed){
 const tip=lurePoint(lurer),own=creatureFrame(e),host=creatureFrame(lurer),side=e.x<tip.x?-1:1;
 const dest={x:clamp(tip.x+side*(own.width*.5+host.width*.2+16),20,1580),y:clamp(tip.y,35,705)};
 const advance=approachRefuge(e,dest,dt,speed*.7,8,side<0?0:Math.PI);
 e.x+=Math.cos(e.angle)*advance*dt;e.y+=Math.sin(e.angle)*advance*dt;e.facing=Math.cos(e.angle)>=0?1:-1;
 e.activity='investigating-lure';e.behavior='Watching a moving lure';
}
