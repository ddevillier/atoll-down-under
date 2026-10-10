import {enterReefLife} from './risk-cues.js';
import {suitableMeal} from './diet.js';
import {REEFS} from './data.js';import {approachMeal} from './feeding-contact.js';import {uncoverSand} from './sand-search.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const rows=[
 ['s6','butterflyfish-crevices','A snout among the crevices','probe',['worm','coral'],'Pick into a worm patch, then explore a different coral feeding place.'],
 ['s10','wrasse-search','Small meals in small places','probe',['worm','shrimp'],'Inspect for a worm, then investigate a separate shrimp patch.'],
 ['s14','sweetlip-bottom-route','Along the nighttime bottom','sift',['worm','shrimp'],'Search the bottom for a worm, then sift a separate shrimp patch.'],
 ['s27','stingray-sifting','Beneath the sand','sift',['shrimp','worm'],'Sift a shrimp patch, then explore another bottom patch for a worm.'],
 ['s22','puffer-shell-meal','A beak for a hard meal','shell',['snail','sponge'],'Open a snail shell, then browse a sponge patch.'],
 ['s24','triggerfish-hard-prey','Opening a different kind of meal','shell',['crab','snail'],'Use your strong mouth on a crab, then find a snail to open.'],
 ['s29','humphead-hard-prey','Strong jaws, careful choices','shell',['snail','crab'],'Open a snail, then choose a crab as a different armored meal.'],
 ['s50','emperor-bottom-hunt','From shell to swimming prey','shell',['crab','fish'],'Open a crab on the bottom, then make a feeding trip for a suitable small fish.'],
 ['s4','idol-browsing-group','Browse, then find your group','browse',['sponge','algae'],'Browse sponge and algae at separate grounds, then come close to a fellow idol.'],
 ['s25','angelfish-quiet-browse','A quiet browsing circuit','browse',['sponge','algae'],'Browse sponge and algae at separate grounds, then settle in quiet cover.']
];
export const FORAGING_JOURNEYS=Object.fromEntries(rows.map(([species,id,name,kind,foods,description])=>[species,{id,name,kind,foods,description,steps:['Find '+foods[0],'Handle your meal, then find '+foods[1],'Finish your feeding trip'],action:kind==='browse'?'Start browsing trip':kind==='shell'?'Open a hard meal':kind==='sift'?'Sift a patch':'Probe a crevice'}]));
export const foragingJourney=p=>FORAGING_JOURNEYS[p?.species?.id];
const validId=id=>typeof id==='string'&&id.length>0&&id.length<100||Number.isInteger(id)&&id>=0;
const validReef=n=>Number.isInteger(n)&&n>=0&&n<9;
export function validForagingPrep(q){return q==null||typeof q==='object'&&!Array.isArray(q)&&validReef(q.reef)&&validId(q.target)&&Number.isInteger(q.incarnation)&&q.incarnation>=0&&['probe','sift','shell'].includes(q.kind)&&Number.isFinite(q.elapsed)&&q.elapsed>=0&&q.elapsed<=1.5&&typeof q.eat==='boolean';}
export function validForagingJourney(j){return j==null||typeof j==='object'&&!Array.isArray(j)&&typeof j.finished==='boolean'&&Number.isFinite(j.rest)&&j.rest>=0&&j.rest<=3&&Array.isArray(j.meals)&&j.meals.length<=2&&(!j.finished||j.meals.length===2)&&j.meals.every(m=>m&&validReef(m.reef)&&validId(m.id)&&Number.isFinite(m.x)&&m.x>=0&&m.x<=1600&&Number.isFinite(m.y)&&m.y>=0&&m.y<=740&&['worm','coral','shrimp','snail','sponge','urchin','crab','fish','algae'].includes(m.food));}
const fresh=()=>({meals:[],rest:0,finished:false});
const foodType=f=>f.kind==='food'?f.food:f.species?.food||'fish';
const openable=f=>!!f.species&&['snail','crab','urchin'].includes(foodType(f));
export function preparationKind(p,f){const d=foragingJourney(p);if(!d||!p.species.diet.includes(foodType(f)))return null;if(d.kind==='shell')return openable(f)?'shell':null;return ['probe','sift'].includes(d.kind)&&f.kind==='food'&&d.foods.includes(f.food)?d.kind:null;}
function targets(sim){const d=foragingJourney(sim.player),j=sim.adventure.foragingJourney,wanted=d.foods[j?.finished?0:j?.meals.length||0],first=j&&!j.finished?j.meals[0]:null;return [...sim.section.food.filter(f=>f.regrow<=0),...sim.section.entities.filter(e=>e.alive)].filter(f=>foodType(f)===wanted&&suitableMeal(sim.player,f)&&(f.kind==='food'||f.species.ability!=='clean')&&(!first||first.reef!==sim.current||distance(first,f)>=120)).sort((a,b)=>distance(a,sim.player)-distance(b,sim.player));}
export function foragingSites(sim){const d=foragingJourney(sim.player);if(!d)return [];const j=sim.adventure.foragingJourney;if(j?.meals.length===2&&!j.finished&&sim.player.species.id==='s4')return sim.section.entities.filter(e=>e.alive&&e.species.id==='s4').map(e=>({id:'reunion-'+e.id,x:e.x,y:e.y,kind:'companion',name:'Fellow idol'}));if(j?.meals.length===2&&!j.finished&&sim.player.species.id==='s25')return REEFS[sim.current].shelters.map((s,i)=>({id:'quiet-'+i,x:s.x,y:s.y,kind:'home',name:'Quiet cover'}));return targets(sim).slice(0,3).map(f=>({id:'forage-'+f.id,x:f.x,y:f.y,kind:'meal',name:(d.kind==='shell'?'Hard prey':d.kind==='sift'?'Bottom search':d.kind==='probe'?'Crevice search':'Browsing ground')+' · '+foodType(f),food:f}));}
export function startForagingPrep(sim,target,eat=false){
 const p=sim.player,kind=preparationKind(p,target);if(!kind)return false;
 p.foragingPrep={reef:sim.current,target:target.id,incarnation:target.incarnation||0,kind,elapsed:0,eat};p.target=null;p.feeding=null;p.cleanerTarget=null;p.cleanTime=0;p.cleaningAmount=0;p.hidden=false;enterReefLife(sim,'meal');sim.pointer={x:p.x,y:p.y};
 sim.event('activity-step',kind==='shell'?'Opening a hard meal':kind==='sift'?'Sifting this patch':'Inspecting with your snout');return true;
}
export function useForagingContext(sim){
 const p=sim.player,d=foragingJourney(p);if(p.foragingPrep){p.foragingPrep=null;sim.pointer={x:p.x,y:p.y};return true;}
 if(sim.adventure.foragingJourney?.finished)sim.adventure.foragingJourney=fresh();
 if(sim.adventure.foragingJourney?.meals.length===2){const site=foragingSites(sim).sort((a,b)=>distance(a,p)-distance(b,p))[0];if(site)sim.point(site.x,site.y);sim.event('message',foragingInstruction(sim));return true;}
 const f=targets(sim).find(f=>distance(f,p)<220);if(!f){sim.event('message','Look for '+d.foods[sim.adventure.foragingJourney?.meals.length||0]+' nearby, or use the map to find another feeding ground.');return false;}
 if(d.kind==='browse'){sim.adventure.foragingJourney??=fresh();sim.point(f.x,f.y);sim.event('activity-step','Browsing ground marked');return true;}
 if(startForagingPrep(sim,f,d.kind==='shell'))return true;
 sim.point(f.x,f.y);sim.event('activity-step','Meal marked');return true;
}
export function tickForagingPrep(sim,dt){
 const p=sim.player,q=p.foragingPrep;if(!q)return false;
 const target=q.reef===sim.current&&[...sim.section.food,...sim.section.entities].find(f=>f.id===q.target&&(f.kind==='food'?f.regrow<=0:f.alive&&(f.incarnation||0)===q.incarnation));
 if(!target||!foragingJourney(p)||p.health<=0||p.energy<=0||p.stun>0||p.target||p.cleanerTarget){p.foragingPrep=null;return false;}
 const contact=approachMeal(p,target,dt,p.species.speed);p.activity=q.kind==='shell'?'feeding':'probing';
 // Progress requires uninterrupted anatomical mouth contact, not just proximity.
 q.elapsed=contact.ready?Math.min(1.5,q.elapsed+dt):0;
 if(q.elapsed>=1.5){
  if(q.kind==='shell'){sim.consume(target);p.foragingPrep=null;}
  else{uncoverSand(sim,target,p);p.foragingPrep=null;sim.pointer={x:p.x,y:p.y};if(q.eat)p.target=target.id;sim.event('sand','A feeding opportunity exposed · Eat it or leave room for a hungry neighbor.',{x:target.x,y:target.y});}
 }
 return true;
}
export function foragingMeal(sim,target){
 const d=foragingJourney(sim.player);if(!d)return;const a=sim.adventure,j=a.foragingJourney??=fresh();if(j.finished||j.meals.length>=2)return;
 const food=foodType(target);if(food!==d.foods[j.meals.length])return;
 if(['probe','sift'].includes(d.kind)&&!(target.uncovered>0&&target.sandSource===sim.player.id))return;
 if(openable(target)&&d.kind==='shell'&&!(sim.player.foragingPrep?.target===target.id&&sim.player.foragingPrep.elapsed>=1.5))return;
 const first=j.meals[0];if(first&&first.reef===sim.current&&distance(first,target)<120){sim.event('message','This meal is too close to your first feeding ground. Explore farther.');return;}
 j.meals.push({reef:sim.current,id:target.id,x:target.x,y:target.y,food});j.rest=0;sim.event('activity-step',j.meals.length===1?'First feeding ground explored':'Second feeding ground explored');
}
export function foragingInstruction(sim){
 const p=sim.player,d=foragingJourney(p),j=sim.adventure.foragingJourney;if(p.foragingPrep)return p.foragingPrep.kind==='shell'?'Opening a shell · Hold contact; move or E to stop':'Inspecting a feeding patch · Move or E to stop';
 if(j?.finished)return 'Discovered · Press E near a feeding ground to begin another trip';
 if(j?.meals.length===2){if(p.species.id!=='s4')return 'Settle in a shelter for three quiet seconds';if(sim.section.entities.some(e=>e.alive&&e.species.id==='s4'))return 'Swim beside a fellow idol for three quiet seconds';const reef=sim.sections.findIndex(r=>r.entities.some(e=>e.alive&&e.species.id==='s4'));return reef>=0?'Find a fellow idol in '+REEFS[reef].name+' · Use the map to plan your swim':'No fellow idol is available yet · Keep exploring, then look again';}
 const food=d.foods[j?.meals.length||0],f=targets(sim)[0];return (j?.meals.length?'Find a different feeding ground · ':'')+(f?'Look for '+food+' · ':'No new '+food+' feeding ground here · Explore another habitat · ')+(d.kind==='browse'?'Click to browse':d.kind==='shell'&&['snail','crab','urchin'].includes(food)?'Click to approach and open it':d.kind==='shell'?'Click to approach and eat':'Click to inspect and eat');
}
export function tickForagingJourney(sim,dt){
 const p=sim.player,d=foragingJourney(p),j=sim.adventure.foragingJourney;if(!d||!j||j.meals.length<2)return false;if(j.finished)return true;
 if(d.kind!=='browse'){j.finished=true;return true;}
 const calm=!p.target&&!p.cleanerTarget&&!p.feeding&&p.actionTime<=0&&p.stun<=0;
 const ready=p.species.id==='s4'?sim.section.entities.filter(e=>e.alive&&e.species.id==='s4'&&!e.target&&!e.feeding&&e.activity!=='avoiding'&&distance(e,p)<180).length>=1:p.hidden&&REEFS[sim.current].shelters.some(s=>distance(s,p)<s.r);
 j.rest=ready&&calm?Math.min(3,j.rest+dt):0;if(j.rest>=3)j.finished=true;return j.finished;
}
