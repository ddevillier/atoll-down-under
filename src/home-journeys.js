import {REEFS} from './data.js';
import {meetFish,rememberHomecoming} from './reef-memories.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const rows=[
 ['s1','damsel-territory','A familiar coral patch','coral refuge',['algae','plankton'],'Graze near your chosen coral, then make a plankton excursion before coming home.'],
 ['s3','gramma-ledge','Under the ledge','ledge',['shrimp'],'Choose a ledge, take a small shrimp meal away from it, then return to cover.'],
 ['s7','anemone-partner','Back to the tentacles','living anemone',['plankton'],'Choose a living anemone, feed in the nearby water, then return to the same host.'],
 ['s12','squirrelfish-night-trip','After the reef grows quiet','night refuge',['shrimp','crab'],'Leave a nighttime refuge for two kinds of crustacean meal, then return to rest.'],
 ['s13','cardinalfish-cover','A short trip from cover','coral refuge',['plankton'],'Choose cover, make a short plankton trip, and return without needing a fast chase.'],
 ['s26','moray-cave-trip','A cave to come home to','cave',['fish','shrimp','crab'],'Leave your cave for one suitable animal meal and come back to rest.'],
 ['s30','humbug-coral-trip','Between the branches','coral refuge',['plankton'],'Settle beside coral, venture out for plankton, then find the same refuge again.'],
 ['s33','whitetip-rest-trip','Rest between feeding trips','resting ledge',['fish','crab'],'Rest at a ledge, leave for a suitable nighttime meal, then return to rest again.']
];
export const HOME_JOURNEYS=Object.fromEntries(rows.map(([species,id,name,home,foods,description])=>[species,{id,name,home,foods,description,steps:['Choose a '+home+' with E','Take your feeding trip','Return to your chosen '+home],action:'Choose '+home,ordered:['s1','s12'].includes(species),host:species==='s7',departure:species==='s13'?80:130,rest:['s26','s33'].includes(species)?3:1.5}]));
export const homeJourney=p=>HOME_JOURNEYS[p?.species?.id];
const validId=id=>typeof id==='string'&&id.length>0&&id.length<100||Number.isInteger(id)&&id>=0;
export function validHomeJourney(j){return j==null||typeof j==='object'&&!Array.isArray(j)&&(j.finished===undefined||typeof j.finished==='boolean')&&Number.isInteger(j.reef)&&j.reef>=0&&j.reef<9&&typeof j.site==='string'&&j.site.length<100&&Number.isFinite(j.x)&&j.x>=0&&j.x<=1600&&Number.isFinite(j.y)&&j.y>=0&&j.y<=740&&Number.isInteger(j.stage)&&j.stage>=0&&j.stage<=2&&Number.isFinite(j.rest)&&j.rest>=0&&j.rest<=3&&typeof j.departed==='boolean'&&Array.isArray(j.meals)&&j.meals.length<=2&&j.meals.every(m=>['algae','plankton','shrimp','crab','fish'].includes(m))&&(j.host==null||validId(j.host)&&Number.isInteger(j.incarnation)&&j.incarnation>=0);}
function hostFor(sim,j){return sim.sections[j.reef].entities.find(e=>e.id===j.host&&e.species.id==='s63'&&e.alive&&(e.incarnation||0)===(j.incarnation||0));}
export function homeJourneySites(sim){
 const d=homeJourney(sim.player);if(!d)return [];
 const j=sim.adventure?.homeJourney;
 const sites=d.host?sim.section.entities.filter(e=>e.alive&&e.species.id==='s63').map(e=>({id:'host-'+e.id,x:Math.max(25,Math.min(1575,e.x+45)),y:Math.max(25,e.y-25),host:e.id,incarnation:e.incarnation||0,kind:'home',name:'Living anemone'})):REEFS[sim.current].shelters.map((s,i)=>({id:'refuge-'+sim.current+'-'+i,x:s.x,y:s.y,kind:'home',name:d.home}));
 return sites.map(s=>({...s,name:j?.reef===sim.current&&j.site===s.id?'Your '+d.home:s.name}));
}
export function chosenHome(sim){const j=sim.adventure?.homeJourney;if(!j||j.reef!==sim.current)return null;if(j.host!=null&&!hostFor(sim,j))return null;return homeJourneySites(sim).find(s=>s.id===j.site)||null;}
export function chooseJourneyHome(sim){
 const p=sim.player,d=homeJourney(p),sites=homeJourneySites(sim),site=sites.filter(s=>distance(s,p)<=110).sort((a,b)=>distance(a,sim.pointer)-distance(b,sim.pointer)||distance(a,p)-distance(b,p))[0];
 if(!site){sim.event('message',d.host?'Find a living anemone in this reef or use the map to explore another habitat.':'Move close to a marked '+d.home+', then press E.');return false;}
 const old=sim.adventure.homeJourney;
 if(site.host!=null)meetFish(sim,sim.section.entities.find(e=>e.id===site.host));
 if(!old||old.finished||old.reef!==sim.current||old.site!==site.id||(old.incarnation||0)!==(site.incarnation||0))sim.adventure.homeJourney={reef:sim.current,site:site.id,x:site.x,y:site.y,host:site.host??null,incarnation:site.incarnation||0,stage:0,rest:0,departed:false,meals:[],finished:false};
 sim.point(site.x,site.y);sim.player.target=null;sim.event('activity-step','Marked your '+d.home);return true;
}
export function homeJourneyInstruction(sim){
 const d=homeJourney(sim.player),j=sim.adventure.homeJourney;if(!j)return 'Move close to a marked '+d.home+' · Press E to choose it';
 if(j.host!=null&&!hostFor(sim,j))return 'Your anemone is no longer here · Choose another living host with E';
 if(j.reef!==sim.current)return 'Your '+d.home+' is in '+REEFS[j.reef].name+' · Return there, or choose a new home';
 if(j.finished)return 'Discovered · Home again in '+REEFS[j.reef].name+' · Press E here for another feeding trip';
 if(j.stage===0)return 'Settle close to your marked '+d.home+' before leaving';
 if(j.stage===2)return 'Return to your marked '+d.home+' and become still';
 const food=d.ordered?d.foods[j.meals.length]:d.foods.join(' or ');
 return (j.departed?'Find '+food+' for your feeding trip':'Leave your '+d.home+' and look for '+food)+(d.ordered?' · '+j.meals.length+'/'+d.foods.length+' meal types':'');
}
export function homeJourneyMeal(sim,target){
 const j=sim.adventure.homeJourney,d=homeJourney(sim.player);if(!d||!j||j.stage!==1||!j.departed||j.reef!==sim.current)return;
 if(j.host!=null&&!hostFor(sim,j))return;
 const food=target.kind==='food'?target.food:target.species?.food||'fish';
 if(d.ordered?food!==d.foods[j.meals.length]:!d.foods.includes(food))return;
 j.meals.push(food);if(!d.ordered||j.meals.length===d.foods.length){j.stage=2;j.rest=0;sim.event('activity-step','Feeding trip complete');}
}
export function tickHomeJourney(sim,dt){
 const p=sim.player,d=homeJourney(p),j=sim.adventure.homeJourney;if(!d||!j)return false;const site=chosenHome(sim);
 if(!site){j.rest=0;return false;}
 const near=distance(p,site)<50;
 if(j.stage>=1&&distance(p,site)>d.departure)j.departed=true;
 const settled=near&&p.still>.7&&!p.target&&!p.cleanerTarget&&p.actionTime<=0&&p.stun<=0;
 j.rest=settled?Math.min(3,j.rest+dt):0;
 if(settled)p.activity='at-home';
 if(j.stage===0&&j.rest>=d.rest){j.stage=1;j.rest=0;sim.event('activity-step','Settled at your '+d.home);}
 if(j.stage===2&&j.rest>=d.rest&&!j.finished){j.finished=true;rememberHomecoming(sim,d.home,j.meals);sim.event('homecoming','Home again · Your '+d.home+' in '+REEFS[j.reef].name+'. Rest, or press E for another trip.',{x:site.x,y:site.y});}
 return !!j.finished;
}
