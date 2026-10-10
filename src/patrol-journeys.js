import {REEFS} from './data.js';import {edible,suitableMeal} from './diet.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const rows=[
 ['s17','barracuda-pursuit','A decisive pursuit',230,85,true,0,['fish'],'Survey an open-water lane, use a burst during a real pursuit, then cruise back.'],
 ['s18','needlefish-surface','Along the surface',105,65,false,0,['fish'],'Survey the upper water, pick a small fish, and return to your surface route.'],
 ['s28','runner-speed-trip','Speed with a purpose',270,100,true,0,['fish'],'Look along an open-water route, use a burst to pursue a fish, then recover on your route.'],
 ['s32','blacktip-reef-edge','The edge of the reef',410,100,false,45,['fish'],'Cruise the reef edge, choose a substantial fish, then circle back to your patrol.'],
 ['s34','white-shark-meal','A meal worth the trip',270,115,false,70,['fish'],'Survey open water and choose a larger suitable fish before returning to your route.'],
 ['s35','tiger-varied-route','Two kinds of hunting ground',480,115,false,0,['fish','crab'],'Explore a lower-water route, catch a fish, then find a bottom crab before circling back.'],
 ['s39','trout-reef-trip','Out from the reef',380,90,false,0,['fish'],'Survey a reef-edge lane, catch a small fish, then return to the same edge.'],
 ['s49','mackerel-pursuit','A burst, then a breather',210,85,true,0,['fish'],'Survey open water, use a burst in pursuit of a fish, then make a quiet return.'],
 ['s55','trevally-feeding-route','Across the feeding grounds',300,105,false,0,['shrimp','fish'],'Survey a midwater lane, feed on shrimp, then choose a fish before returning.']
];
export const PATROL_JOURNEYS=Object.fromEntries(rows.map(([species,id,name,y,band,burst,minSize,foods,description])=>[species,{id,name,y,band,burst,minSize,foods,description,steps:['Choose and survey a patrol lane','Make your feeding trip','Return to your route'],action:'Choose patrol route'}]));
export const patrolJourney=p=>PATROL_JOURNEYS[p?.species?.id];
const validId=n=>typeof n==='string'&&n.length>0&&n.length<100||Number.isInteger(n)&&n>=0;
function validPatrolShape(j){return j==null||typeof j==='object'&&!Array.isArray(j)&&Number.isInteger(j.reef)&&j.reef>=0&&j.reef<9&&Number.isFinite(j.x)&&j.x>=40&&j.x<=1560&&Number.isFinite(j.y)&&j.y>=25&&j.y<=720&&[j.left,j.right].every(n=>Number.isFinite(n)&&n>=0&&n<=1600)&&j.left<=j.right&&Number.isInteger(j.stage)&&j.stage>=0&&j.stage<=2&&Number.isFinite(j.rest)&&j.rest>=0&&j.rest<=3&&typeof j.finished==='boolean'&&(!j.finished||j.stage===2)&&Array.isArray(j.meals)&&j.meals.length<=2&&j.meals.every(m=>['fish','shrimp','crab'].includes(m))&&(j.surveyStart===undefined||Number.isFinite(j.surveyStart)&&j.surveyStart>=0&&j.surveyStart<=1600)&&(j.surveyInterrupted===undefined||typeof j.surveyInterrupted==='boolean')&&(j.burst==null||validId(j.burst.id)&&Number.isInteger(j.burst.incarnation)&&j.burst.incarnation>=0);}
export function validPatrolJourney(j,player){
 if(!validPatrolShape(j))return false;if(j==null)return true;
 const definitions=player?[patrolJourney(player)]:Object.values(PATROL_JOURNEYS);
 return definitions.some(d=>d&&j.meals.every((food,i)=>food===d.foods[i])&&(j.stage===0?j.meals.length===0:j.stage===1?j.meals.length<d.foods.length:j.meals.length===d.foods.length));
}
const foodType=f=>f.kind==='food'?f.food:f.species.food||'fish';
export function patrolPrey(sim){const d=patrolJourney(sim.player),j=sim.adventure.patrolJourney;if(!d)return [];const food=d.foods[j?.meals.length||0];return [...sim.section.entities.filter(e=>e.alive),...sim.section.food.filter(f=>f.regrow<=0)].filter(f=>foodType(f)===food&&suitableMeal(sim.player,f)&&(food!=='fish'||f.species.size>=d.minSize)).sort((a,b)=>distance(a,sim.player)-distance(b,sim.player));}
export function patrolSites(sim){const d=patrolJourney(sim.player),j=sim.adventure.patrolJourney;if(!d)return [];if(j&&!j.finished){if(j.reef!==sim.current)return [350,1250].map(x=>({id:'patrol-new-'+x,x,y:d.y,kind:'route',name:'Choose a new patrol here'}));if(j.stage===2)return [{id:'patrol-return',x:j.x,y:j.y,kind:'route',name:'Your patrol · Quiet return'}];if(j.stage===1)return patrolPrey(sim).slice(0,2).map(f=>({id:'patrol-prey-'+f.id,x:f.x,y:f.y,kind:'meal',name:'Suitable '+foodType(f)}));return [{id:'patrol-survey',x:(j.surveyStart??j.x)<800?Math.min(1500,(j.surveyStart??j.x)+460):Math.max(100,(j.surveyStart??j.x)-460),y:d.y,kind:'route',name:'Survey this water lane'}];}return [350,1250].map(x=>({id:'patrol-'+x,x,y:d.y,kind:'route',name:'Patrol starting point'}));}
export function usePatrolContext(sim){const p=sim.player,d=patrolJourney(p),j=sim.adventure.patrolJourney;if(j&&!j.finished&&!(j.reef!==sim.current&&patrolSites(sim).some(site=>distance(site,p)<110))){const site=patrolSites(sim)[0];if(site)sim.point(site.x,site.y);sim.event('message',patrolInstruction(sim));return true;}const site=patrolSites(sim).sort((a,b)=>distance(a,p)-distance(b,p))[0];if(distance(site,p)>110){sim.point(site.x,site.y);sim.event('message','Swim to this patrol starting point, then press E to choose it.');return true;}sim.adventure.patrolJourney={reef:sim.current,x:site.x,y:site.y,left:p.x,right:p.x,stage:0,meals:[],rest:0,burst:null,finished:false};sim.point(site.x<800?site.x+460:site.x-460,d.y);sim.event('activity-step','Patrol started');return true;}
export function patrolInstruction(sim){const d=patrolJourney(sim.player),j=sim.adventure.patrolJourney;if(!j)return 'Choose a marked patrol starting point · Move close and press E';if(j.finished)return 'Discovered · Press E near a starting point to begin another patrol';if(j.reef!==sim.current)return 'Your patrol is in '+REEFS[j.reef].name+' · Return there, or choose a new starting point here with E';if(j.stage===0)return 'Survey across the marked '+(d.y<180?'surface':d.y>400?'lower-water':'open-water')+' lane · Stay near its height';if(j.stage===2)return 'Return to your marked patrol and make a quiet return for three seconds';const prey=patrolPrey(sim),food=d.foods[j.meals.length];return (prey.length?'Choose '+(d.minSize?'a larger ':'a suitable ')+food:'No suitable '+food+' here · Explore another habitat')+(d.burst?' · Click a fish, then use Space during pursuit':' · Click to approach and eat');}
export function patrolMeal(sim,f){const d=patrolJourney(sim.player),j=sim.adventure.patrolJourney;if(!d||!j||j.finished||j.stage!==1||foodType(f)!==d.foods[j.meals.length]||!suitableMeal(sim.player,f))return;if(foodType(f)==='fish'&&f.species.size<d.minSize)return;if(d.burst&&!(j.burst?.id===f.id&&j.burst.incarnation===(f.incarnation||0))){sim.event('message','Use Space during pursuit to count a burst meal.');return;}j.meals.push(foodType(f));j.burst=null;if(j.meals.length===d.foods.length){j.stage=2;j.rest=0;sim.event('activity-step','Feeding trip complete');}else sim.event('activity-step','First meal taken');}
export function tickPatrolJourney(sim,dt){const p=sim.player,d=patrolJourney(p),j=sim.adventure.patrolJourney;if(!d||!j)return false;if(j.finished)return true;
 if(j.stage===0){
  const surveying=j.reef===sim.current&&Math.abs(p.y-d.y)<=d.band&&!p.target;
  if(!surveying)j.surveyInterrupted=true;
  else{
   if(j.surveyInterrupted){
    const previousSite=patrolSites(sim)[0],followingSurvey=sim.pointer.x===previousSite.x&&sim.pointer.y===previousSite.y;
    j.left=p.x;j.right=p.x;j.surveyStart=p.x;j.surveyInterrupted=false;
    // Keep E's guided swim long enough after a turning arc leaves the lane.
    // A separately chosen mouse destination still belongs to the player.
    if(followingSurvey){const site=patrolSites(sim)[0];sim.point(site.x,site.y);}
   }
   j.left=Math.min(j.left,p.x);j.right=Math.max(j.right,p.x);
   if(j.right-j.left>=360){j.stage=1;sim.event('activity-step','Patrol surveyed');}
  }
 }
 if(j.stage===1&&d.burst&&p.abilityTime>0&&p.target!=null){const f=sim.section.entities.find(e=>e.alive&&e.id===p.target&&edible(p,e));if(f)j.burst={id:f.id,incarnation:f.incarnation||0};}
 const calm=!p.target&&!p.feeding&&!p.cleanerTarget&&p.actionTime<=0&&p.abilityTime<=0&&p.stun<=0;
 if(j.stage===2){j.rest=j.reef===sim.current&&distance(p,j)<135&&calm?Math.min(3,j.rest+dt):0;if(j.rest>=3)j.finished=true;}return j.finished;
}
