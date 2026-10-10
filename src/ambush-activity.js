import {enterReefLife} from './risk-cues.js';
import {REEFS} from './data.js';
import {turnTowards} from './steering.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const ambushHunter=p=>['s16','s21','s54','s59'].includes(p.species.id);
export function validAmbush(a){return a==null||typeof a==='object'&&(a.aim===undefined||a.aim&&Number.isFinite(a.aim.x)&&a.aim.x>=0&&a.aim.x<=1600&&Number.isFinite(a.aim.y)&&a.aim.y>=0&&a.aim.y<=740)&&Number.isInteger(a.reef)&&a.reef>=0&&a.reef<9&&Number.isFinite(a.x)&&a.x>=10&&a.x<=1590&&Number.isFinite(a.y)&&a.y>=25&&a.y<=720&&Number.isFinite(a.settled)&&a.settled>=0&&a.settled<=2&&Number.isFinite(a.clock)&&a.clock>=0&&Number.isFinite(a.strike)&&a.strike>=0&&a.strike<=.8&&(a.target==null||typeof a.target==='string'||Number.isFinite(a.target));}
export function ambushSites(sim){
 const reef=REEFS[sim.current],bottom=['s21','s54','s59'].includes(sim.player.species.id);
 const points=bottom?reef.bottomRoutes.map(r=>r[Math.floor(r.length/2)]).map(([x,y])=>({x,y:Math.max(25,y-25)})):reef.shelters;
 return points.map((p,i)=>({id:'ambush-'+sim.current+'-'+i,x:p.x,y:p.y,kind:'ambush',name:bottom?'Bottom ambush spot':'Ambush ledge'}));
}
export function cancelAmbush(sim){const p=sim.player;if(p?.ambush){if(p.ambush.target!=null&&p.target===p.ambush.target){p.target=null;p.feeding=null;sim.pointer={x:p.x,y:p.y};}p.ambush=null;p.hidden=false;}}
export function beginAmbush(sim,site){
 const p=sim.player;p.target=null;p.feeding=null;p.cleanerTarget=null;p.cleanTime=0;
 p.ambush={reef:sim.current,x:p.x,y:p.y,settled:0,clock:0,strike:0,target:null};sim.pointer={x:p.x,y:p.y};enterReefLife(sim,'activity');
 sim.event('activity-step','Settling into ambush');
}
export function aimAmbush(sim,x,y){const a=sim.player?.ambush;if(a&&!a.strike&&Number.isFinite(x)&&Number.isFinite(y))a.aim={x:Math.max(0,Math.min(1600,x)),y:Math.max(0,Math.min(740,y))};}
export const ambushConcealed=p=>!!p.ambush&&p.ambush.settled>=2&&p.ambush.strike===0&&!p.target;
export function startAmbushStrike(sim,target){
 const p=sim.player,a=p.ambush;if(!a)return;
 if(a.settled>=2&&target.species&&target.alive&&distance(p,target)<=160){
  // Retargeting spends the remaining strike time; it cannot renew the burst.
  if(a.strike>0){a.target=target.id;return;}
  a.strike=.8;a.target=target.id;p.hidden=false;sim.event('activity-step','Short strike');
 }
 else cancelAmbush(sim);
}
export function tickAmbush(sim,dt){
 const p=sim.player,a=p.ambush;if(!a)return;
 if(!ambushHunter(p)||a.reef!==sim.current||p.health<=0||p.cleanerTarget||p.stun>0){cancelAmbush(sim);return;}
 a.clock+=dt;
 if(a.strike>0){
  a.strike=Math.max(0,a.strike-dt);
  if(a.strike===0){if(p.target===a.target){p.target=null;p.feeding=null;sim.pointer={x:p.x,y:p.y};sim.event('message','The fish escaped. Settle again.');}cancelAmbush(sim);}
 }else if(distance(p,a)>7||p.target)cancelAmbush(sim);
 else{a.settled=Math.min(2,a.settled+dt);if(a.aim&&distance(p,a.aim)>15){p.angle=turnTowards(p.angle,Math.atan2(a.aim.y-p.y,a.aim.x-p.x),p.species.agility*dt);p.facing=Math.cos(p.angle)>=0?1:-1;}}
}
export function ambushMeal(sim,food){
 const a=sim.player.ambush;if(a?.strike>0&&a.target===food.id&&food.species){sim.adventure.ambushCatch=true;cancelAmbush(sim);}
}
