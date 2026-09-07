import {REEFS} from './data.js';
import {SHELTER_SETTLE_SECONDS} from './shelter.js';
export const ADVENTURES={
 s42:{id:'school-life',name:'A place in the school',description:'Join your companions, find a meal, and swim back together.',steps:['Swim beside three schooling companions','Take a suitable meal','Rejoin your companions'],action:null},
 s2:{id:'coral-home',name:'A little home on the reef',description:'Choose a coral refuge, feed nearby, and return to your familiar place.',steps:['Settle into a coral home with E','Leave home and take a meal','Return and settle into your coral home'],action:'Choose coral home'},
 s23:{id:'sand-search',name:'A meal beneath the sand',description:'Blow a little water across the sand. Discover and eat at two different sites.',steps:['Use E near sand to uncover a meal','Eat at two different uncovered sites'],action:'Blow sand'},
 s19:{id:'changing-colors',name:'Colors of the reef',description:'Become still and blend with sand, then try a mottled reef surface.',steps:['Use E to blend into sand','Blend into mottled reef too'],action:'Blend in'}
};
export const DISCOVERIES=Object.values(ADVENTURES).map(a=>a.id);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const freshAdventure=()=>({visible:false,stage:0,joined:0,meals:[],patterns:[],home:null,departed:false,complete:false});
export function adventureInstruction(sim){
 const a=sim.adventure,d=ADVENTURES[sim.player.species.id];if(!d)return '';
 if(a.complete)return 'Discovered · This way of living is in your journal.';
 if(sim.player.species.id==='s42'&&a.stage!==1)return `${a.stage===0?'Swim beside':'Rejoin'} three schooling companions · ${Math.min(a.stage===0?10:5,Math.floor(a.joined))}/${a.stage===0?10:5} seconds`;
 if(sim.player.species.id==='s19')return a.patterns.length?`Use E and stay still on ${a.patterns[0]==='sand'?'mottled reef':'sand'} for two seconds`:'Use E near sand or reef and stay still for two seconds';
 if(sim.player.species.id==='s23')return `Uncover with E, then click the meal · ${Math.min(2,a.meals.length)}/2 sand sites`;
 return d.steps[Math.min(a.stage,d.steps.length-1)];
}
export function validAdventure(a){return !!a&&typeof a.visible==='boolean'&&Number.isInteger(a.stage)&&a.stage>=0&&a.stage<=3&&Number.isFinite(a.joined)&&a.joined>=0&&typeof a.departed==='boolean'&&typeof a.complete==='boolean'&&Array.isArray(a.meals)&&a.meals.length<=100&&a.meals.every(x=>typeof x==='string')&&Array.isArray(a.patterns)&&a.patterns.every(x=>['sand','reef'].includes(x))&&(a.home===null||(Number.isInteger(a.home.reef)&&REEFS[a.home.reef]&&Number.isFinite(a.home.x)&&Number.isFinite(a.home.y)));}
export function sitesFor(sim,fish=sim.player){
 const reef=REEFS[sim.current];
 if(fish.species.id==='s23')return sim.section.food.filter(f=>['worm','shrimp'].includes(f.food)).slice(0,2).filter(f=>f.regrow<=0).map(f=>({id:f.id,x:f.x,y:f.y,kind:'sand',name:'Sand search',food:f}));
 if(fish.species.id==='s2')return reef.shelters.map((s,i)=>({...s,id:'home-'+sim.current+'-'+i,kind:'home',name:'Coral refuge'}));
 if(fish.species.id==='s19'){const sand=reef.feedingSites.worm?.[0]||reef.bottomRoutes[0]?.[0]||[420,600],r=reef.shelters[0];return [{id:'sand-'+sim.current,x:sand[0],y:sand[1],kind:'sand',name:'Sandy background'},...(r?[{id:'reef-'+sim.current,x:r.x,y:r.y,kind:'reef',name:'Mottled reef'}]:[])];}
 return [];
}
export function selectedSite(sim){const sites=sitesFor(sim),pointer=sim.pointer;return sites.sort((a,b)=>dist(a,pointer)-dist(b,pointer)).find(s=>dist(s,pointer)<90)||sites.sort((a,b)=>dist(a,sim.player)-dist(b,sim.player))[0]||null;}
export function contextLabel(sim){const a=ADVENTURES[sim.player.species.id];if(!a?.action)return '';return sim.player.blending?'Stop blending':a.action;}
export function stopBlend(p){p.blending=null;p.blendTime=0;p.hidden=false;}
export function useContext(sim){
 const p=sim.player;if(sim.paused||sim.phase!=='playing')return false;
 if(p.blending){stopBlend(p);return true;}
 const site=selectedSite(sim);if(!site){sim.event('message','This habitat has no suitable spot. Open the map to explore another habitat.');return false;}
 if(dist(p,site)>110){sim.event('message','Move closer to '+site.name.toLowerCase()+', then press E.');return false;}
 p.target=null;p.cleanerTarget=null;p.cleanTime=0;sim.pointer={x:p.x,y:p.y};
 if(p.species.id==='s23'){
  sim.protected=false;site.food.uncovered=8;p.actionTime=1;p.activity='searching-sand';sim.event('sand','A meal beneath the sand. Click it to eat.',{x:site.x,y:site.y});
 }else if(p.species.id==='s2'){
  const same=sim.adventure.home?.reef===sim.current&&dist(sim.adventure.home,site)<1;sim.adventure.home={reef:sim.current,x:site.x,y:site.y};if(!same){sim.adventure.stage=0;sim.adventure.departed=false;}sim.pointer={x:site.x,y:site.y};sim.event('message','Your coral home. Settle here, then make a short feeding trip.');
 }else if(p.species.id==='s19'){
  sim.protected=false;p.abilityTime=0;p.blending={kind:site.kind,x:p.x,y:p.y};p.blendTime=0;sim.event('message','Becoming still. Watch your pattern match the '+(site.kind==='sand'?'sand.':'reef.'));
 }
 return true;
}
export function mealAdventure(sim,food){
 const p=sim.player,a=sim.adventure;if(!a)return;
 if(p.species.id==='s42'&&a.stage===1){a.stage=2;a.joined=0;}
 if(p.species.id==='s2'&&a.home&&a.departed)a.stage=2;
 if(p.species.id==='s23'&&food.kind==='food'&&food.uncovered>0){const id=sim.current+':'+food.id;if(!a.meals.includes(id))a.meals.push(id);a.stage=1;}
}
export function tickAdventure(sim,dt){
 const p=sim.player,a=sim.adventure,definition=ADVENTURES[p.species.id];if(!definition||p.health<=0||p.energy<=0)return;
 if(p.blending){if(dist(p,p.blending)>3||p.target||p.cleanerTarget||p.abilityTime>0)stopBlend(p);else{p.blendTime=(p.blendTime||0)+dt;p.activity='blending';if(p.blendTime>=2){p.hidden=true;if(!a.patterns.includes(p.blending.kind))a.patterns.push(p.blending.kind);a.stage=1;}}}
 if(p.species.id==='s42'){
  const group=sim.section.entities.filter(e=>e.alive&&e.activity==='schooling'&&e.species.id===p.species.id&&dist(e,p)<180);
  a.joined=group.length>=3?a.joined+dt:0;
  if(a.stage===0&&a.joined>=10){a.stage=1;a.joined=0;sim.event('message','Part of the school. Find a meal, then return to your companions.');}
 }
 if(a.home){const near=a.home.reef===sim.current&&dist(p,a.home)<55;if(near&&p.still>SHELTER_SETTLE_SECONDS&&a.stage===0)a.stage=1;if(!near&&a.stage>=1)a.departed=true;}
 const done=p.species.id==='s42'?a.stage===2&&a.joined>=5:p.species.id==='s23'?a.meals.length>=2:p.species.id==='s19'?a.patterns.length>=2:a.stage===2&&a.home?.reef===sim.current&&dist(p,a.home)<55&&p.still>SHELTER_SETTLE_SECONDS;
 if(done&&!a.complete){a.complete=true;sim.event('discovery','A new way of living · '+definition.name,{value:definition.id});}
}
// Lightweight routines share the same food/home/background opportunities as the player.
export function routineStep(sim,e,dt,speed){
 if(e.target||e.activity==='avoiding'||e.behavior?.startsWith('Moving away'))return speed;
 const id=e.species.id;if(!['s2','s19','s23'].includes(id))return speed;
 e.routineClock=(e.routineClock||0)+dt;
 const sites=sitesFor(sim,e);if(!sites.length)return speed;
 const index=Number.isFinite(Number(e.id))?Number(e.id):0;
 const site=sites[index%sites.length],d=dist(e,e.homeAnchor||site);
 if(id==='s2'){
  if(!e.homeAnchor)e.homeAnchor={x:site.x,y:site.y};
  if(e.satiated>0){e.angle=Math.atan2(e.homeAnchor.y-e.y,e.homeAnchor.x-e.x);e.behavior=d<20?'Resting in coral':'Returning to familiar coral';e.activity=d<20?'at-home':'returning-home';return d<20?0:Math.min(speed,d/dt);}
 }else if(id==='s23'&&e.satiated<=0){
  e.angle=Math.atan2(site.y-e.y,site.x-e.x);e.activity='searching-sand';e.behavior='Searching the sand';
  if(d<55){site.food.uncovered=8;e.actionTime=1;e.target=site.food.id;return 0;}
  return speed;
 }else if(id==='s19'&&e.satiated>0){
  e.angle=Math.atan2(site.y-e.y,site.x-e.x);if(d<30){e.blending={kind:site.kind,x:e.x,y:e.y};e.blendTime=Math.min(2,(e.blendTime||0)+dt);e.activity='blending';e.behavior='Matching the background';return 0;}
 }
 e.blending=null;e.blendTime=0;return speed;
}
