const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const plantPatch=f=>f?.kind==='food'&&['algae','grass'].includes(f.food);
export const routeGrazer=p=>['s5','s15'].includes(p.species.id);
export const patchCrowdingCost=f=>plantPatch(f)&&f.amount<40?100:0;
export const validPatchRest=n=>n===undefined||Number.isFinite(n)&&n>=0&&n<=8;
export function validGrazing(g){return g==null||typeof g==='object'&&Number.isInteger(g.reef)&&g.reef>=0&&g.reef<9&&typeof g.first==='string'&&g.first.length>0&&g.first.length<100&&Number.isFinite(g.after)&&g.after>=0&&g.after<=100&&typeof g.visitedOther==='boolean';}
export function disturbPatch(food){if(plantPatch(food))food.patchRest=8;}
// These are game-time renewal rates, not claims about wild growth. A partly
// grazed plant patch recovers between visits; depleted patches keep the
// established full-regrowth delay. No recovery applies to animals or coral.
export function recoverPatch(food,dt){
 if(!plantPatch(food)||food.patchRest===undefined)return;
 const waiting=Math.min(dt,food.patchRest);food.patchRest=Math.max(0,food.patchRest-dt);
 if(food.regrow<=0&&food.patchRest===0)food.amount=Math.min(100,food.amount+2*(dt-waiting));
}
export function grazeMeal(sim,food){
 if(!routeGrazer(sim.player)||!plantPatch(food))return;
 const a=sim.adventure;
 if(!a.grazing)a.grazing={reef:sim.current,first:food.id,after:Math.max(0,food.amount-35),visitedOther:false};
 else if(a.grazing.first!==food.id||a.grazing.reef!==sim.current)a.grazing.visitedOther=true;
}
export function grazingHome(sim){const g=sim.adventure?.grazing;return g&&g.reef===sim.current?sim.section.food.find(f=>f.id===g.first):null;}
export function grazingRecovered(sim){const g=sim.adventure?.grazing,f=grazingHome(sim);return !!f&&f.regrow<=0&&f.amount>=Math.min(100,g.after+20);}
export function tickGrazing(sim){const g=sim.adventure?.grazing,f=grazingHome(sim);return !!g?.visitedOther&&grazingRecovered(sim)&&distance(sim.player,f)<100&&sim.player.still>.6&&!sim.player.target;}
