import {animalProfile} from './animal-profiles.js';
import {REEFS} from './data.js';
import {creatureWidth,creatureFrame} from './geometry.js';
import {turnTowards} from './steering.js';
import {individualSeed} from './individual-motion.js';
import {socialOrder,separateCompanions} from './social-motion.js';
import {refugeHome,anemoneHome,approachRefuge,compatibleShadow,followShadow} from './refuge-motion.js';
import {SWIM_RIGS,swimmingDrive} from './swim-motion.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const refugeRoutines=new Set(['coral-resident','ledge','ambush-ledge','cave','cave-rest','perch','ambush-bottom','lure']);
const forageRoutines=new Set(['graze','pick','browse','scrape','probe-sand','sand','coral-pick','bottom-forage','sponge-browse','foot-graze']);
export function ecologyState(sim,e){
 if(!e.ecology||e.ecology.reef!==sim.current)e.ecology={reef:sim.current,clock:0,point:0,wait:0,partner:null,host:null};
 return e.ecology;
}
function steer(e,dest,dt,speed,stop=14){
 const d=distance(e,dest);if(d<=stop)return 0;
 e.angle=turnTowards(e.angle,Math.atan2(dest.y-e.y,dest.x-e.x),e.species.agility*dt);
 return Math.min(speed,Math.max(3,(d-stop)*1.3),Math.max(0,(d-stop)/dt));
}
function separateDestination(e,point,seed,radius=30){
 const angle=(seed%997)/997*Math.PI*2;
 return {x:clamp(point.x+Math.cos(angle)*radius,35,1565),y:clamp(point.y+Math.sin(angle)*radius,45,700)};
}
export function clearRelationships(sim,e){
 if(!e.ecology)return;
 for(const key of ['partner','host'])if(e.ecology[key]!=null&&![...sim.section.entities,sim.player].some(b=>b?.alive&&b.id===e.ecology[key])){e.ecology[key]=null;if(key==='host'&&e.ecology.home?.host)e.ecology.home=null;}
}
// Local choices are authored timing/spacing, grounded in the guide where stated.
// No extra animals, damage, meals, calories or random draws are introduced here.
export function localRoutine(sim,e,dt,speed){
 const profile=animalProfile(e.species),state=ecologyState(sim,e),seed=individualSeed(e.id);
 state.clock+=dt;clearRelationships(sim,e);
 if(e.target){if(['shadowing','approaching-cover'].includes(e.activity))e.activity=e.feeding?'feeding':'foraging';return speed;}
 if(e.activity==='avoiding'||e.behavior?.startsWith('Moving away')||e.entering)return speed;
 if(e.rest>0){e.activity='resting';e.behavior='Resting between feeding trips';return speed*.7;}
 if(e.actionTime>0){e.activity='feeding';return speed*.15;}
 if(['s2','s19','s23'].includes(e.species.id))return speed;
 const others=sim.section.entities.filter(b=>b!==e&&b.alive&&b.species.ability!=='clean');
 // A stable pair survives a short individual feeding excursion. Either member
 // can break away for food or safety because those priorities ran before this.
 if(profile.social==='pair'&&e.species.ability!=='clean'){
  let partner=others.find(b=>b.id===state.partner&&b.species.id===e.species.id);
  if(!partner){
   partner=others.filter(b=>b.species.id===e.species.id&&(!b.ecology?.partner||b.ecology.partner===e.id)&&distance(e,b)<420).sort((a,b)=>distance(e,a)-distance(e,b))[0];
   if(partner){state.partner=partner.id;ecologyState(sim,partner).partner=e.id;}
  }
  if(partner&&distance(e,partner)<650){
   const d=distance(e,partner),spacing=Math.max(48,creatureWidth(e.species)*.85);
   separateCompanions(e,[partner],dt);
   const follows=socialOrder(e,partner)>0;
   if(follows&&(d>spacing*1.6||partner.target&&d>spacing)){
    e.activity='companionship';e.behavior='Returning to a familiar companion';
    return steer(e,{x:partner.x-Math.cos(partner.angle)*spacing*.45-Math.sin(partner.angle)*spacing*.8,y:partner.y-Math.sin(partner.angle)*spacing*.45+Math.cos(partner.angle)*spacing*.8},dt,speed);
   }
   if(!follows&&d>spacing*1.6){e.activity='waiting';e.behavior='Slowing for a familiar companion';speed*=.18;}
   if(partner.actionTime>0){e.activity='waiting';e.behavior='Waiting while a companion feeds';return speed*.12;}
  }else if(partner){if(partner.ecology?.partner===e.id)partner.ecology.partner=null;state.partner=null;}
 }
 // A living host is distinct from a generic coral point. Loss releases the
 // association; another local refuge remains available without a teleport.
 if(profile.routine==='anemone-home'){
  let host=others.find(b=>b.id===state.host&&b.species.id==='s63');
  if(!host){host=others.filter(b=>b.species.id==='s63').sort((a,b)=>distance(e,a)-distance(e,b))[0];state.host=host?.id??null;}
  const hostFrame=host?creatureFrame(host):null;
  const refuge=host?anemoneHome(sim,e,host):refugeHome(sim,e,REEFS[sim.current]);
  const excursion=e.satiated>0?0:Math.sin(state.clock*.32+seed)*24;
  const side=hostFrame&&refuge.x<hostFrame.x?-1:1;
  const dest={x:refuge.x+side*(host?.retract||0)*12,y:refuge.y+excursion};
  e.activity=distance(e,dest)<22?'at-home':'returning-home';e.behavior=e.activity==='at-home'?(host?'Nestling beside an anemone':'Resting beside coral'):(host?'Returning to its anemone':'Returning to coral');
  return approachRefuge(e,dest,dt,speed,8,side<0?Math.PI:0);
 }
 if(profile.routine==='shadow'){
  const candidates=[...others,sim.player].filter(b=>b&&compatibleShadow(e,b));
  let host=candidates.find(b=>b.id===state.host);
  if(!host){host=candidates.filter(b=>distance(e,b)<300).sort((a,b)=>distance(e,a)-distance(e,b))[0];state.host=host?.id??null;}
  if(host&&distance(e,host)<430){
   const side=(seed%2?1:-1),spacing=(creatureFrame(host).height+creatureFrame(e).height)*.36;
   const dest={x:host.x-Math.sin(host.angle)*spacing*side,y:host.y+Math.cos(host.angle)*spacing*side};
   const inCover=distance(e,dest)<Math.max(22,creatureFrame(e).width*(e.activity==='shadowing'?.34:.25));
   e.activity=inCover?'shadowing':'approaching-cover';e.behavior=inCover?'Swimming in a broader neighbor’s cover':'Approaching a broader neighbor for cover';
   return followShadow(e,host,dest,dt,speed);
  }
  state.host=null;
 }
 if(refugeRoutines.has(profile.routine)||profile.routine==='shadow'){
  const bottom=['ambush-bottom','lure'].includes(profile.routine);
  const home=refugeHome(sim,e,REEFS[sim.current],bottom);
  // Continuous-swimming sharks use circuits instead of this settling branch.
  // Short excursions make watchful rest different from a permanently frozen NPC.
  const rest=e.satiated>0||state.clock%(18+seed%9)>7;
  const dest=rest?home:{x:clamp(home.x+Math.sin(state.clock*.22+seed)*110,40,1560),y:clamp(home.y-45,45,690)};
  const near=distance(e,dest)<22;
  e.activity=rest&&near?'at-home':rest?'returning-home':'exploring';
  e.behavior=rest?(near?(bottom?'Waiting close to the bottom':profile.routine==='perch'?'Watching from a perch':'Resting beside a familiar refuge'):'Returning to a familiar refuge'):'Making a short feeding excursion';
  if(bottom&&near&&e.species.id==='s59'){e.blending={kind:'sand',x:e.x,y:e.y};e.blendTime=Math.min(2,(e.blendTime||0)+dt);}
  else if(e.species.id==='s59'){e.blending=null;e.blendTime=0;}
  return approachRefuge(e,dest,dt,speed,12,home.x<800?0:Math.PI);
 }
 if(forageRoutines.has(profile.routine)&&e.activity!=='schooling'){
  const patches=sim.section.food.filter(f=>e.species.diet.includes(f.food)&&f.regrow<=0);
  if(patches.length){
   const partner=others.find(b=>b.id===state.partner),patchSeed=partner?Math.min(seed,individualSeed(partner.id)):seed;
   const point=partner&&individualSeed(partner.id)<seed?partner.ecology?.point||0:state.point;
   const f=patches[(patchSeed+point)%patches.length],radius=Math.max(30,creatureWidth(e.species)*.55);
   const pairAngle=(patchSeed%997)/997*Math.PI*2,side=partner?(socialOrder(e,partner)<0?1:-1):0;
   const dest=partner?{x:clamp(f.x+Math.cos(pairAngle)*radius*side,35,1565),y:clamp(f.y+Math.sin(pairAngle)*radius*side,45,700)}:separateDestination(e,f,seed,radius);
   const near=distance(e,dest)<26;
   if(near){state.wait+=dt;if(state.wait>3+seed%3){state.point++;state.wait=0;}e.activity=e.satiated>0?'resting':'searching';e.behavior=e.satiated>0?'Resting beside a feeding patch':profile.routine==='probe-sand'?'Inspecting sand with its barbels':'Inspecting a feeding patch';return speed*.08;}
   state.wait=0;e.activity='foraging';e.behavior='Moving between feeding patches';return steer(e,dest,dt,speed,18);
  }
 }
 if(e.activity==='schooling')return speed*(.78+.22*swimmingDrive(e));
 // Long clear-water circuits have separate coast and drive intervals. They do
 // not add hunt time or override the existing hunt/rest limits.
 const surface=profile.routine==='surface',radius=profile.family==='shark'?420:260;
 const angle=state.clock*.045+(seed%31)/31*Math.PI*2;
 const dest={x:800+Math.cos(angle)*radius,y:surface?85+Math.sin(angle)*30:340+Math.sin(angle)*160};
 e.activity='cruising';e.behavior=surface?'Patrolling below the surface':profile.routine==='light-school'?'Searching the dim water':'Following a familiar swimming circuit';
 if(!SWIM_RIGS[e.species.id]){const coast=(Math.sin(state.clock*.6+seed)+1)*.5;return steer(e,dest,dt,speed*(.7+coast*.3),10);}
 const drive=swimmingDrive(e);
 if(drive<.2){e.activity='coasting';e.behavior=surface?'Gliding below the surface':'Gliding between swimming strokes';}
 return steer(e,dest,dt,speed*(.78+drive*.22),10);
}
