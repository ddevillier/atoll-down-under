import {FOODS} from './data.js';
import {BOTTOM_RESIDENTS,groundSpeed,projectToGround,positionOnGround,walkOnGround,validGroundState,attachToNearestGround} from './ground-motion.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const reach=(e,f)=>e.species.size*.4+f.size+10;

// Authored placement: two small renewable detritus patches and existing food
// patches aligned to the substrate. No animal slots or calorie values change.
// Existing patches move rather than being duplicated for each resident.
export function prepareResidentFood(entities,food,reef){
 const claimed=new Set(),assigned=new Map();
 for(const e of entities.filter(e=>BOTTOM_RESIDENTS.has(e.species.id)||e.holdfast)){
  if(BOTTOM_RESIDENTS.has(e.species.id)&&!validGroundState(e))attachToNearestGround(e,reef.bottomRoutes);
  if(e.species.diet.includes('detritus')){
   const def=FOODS.detritus;
   const f={id:`detritus-${reef.id}-${e.species.id}`,kind:'food',food:'detritus',...def,x:e.x+12,y:e.y,size:def.size,amount:100,regrow:0,phase:reef.id*.7};food.push(f);assigned.set(f,e);
   continue;
  }
  const candidates=food.filter(f=>!claimed.has(f.id)&&e.species.diet.includes(f.food));
  if(!candidates.length)continue;
  candidates.sort((a,b)=>distance(e,a)-distance(e,b));const f=candidates[0];claimed.add(f.id);assigned.set(f,e);
  if(e.holdfast){f.x=e.x+28;f.y=e.y-14;}
  else{
   const on=projectToGround(f,e.groundRoute);
   if(on.distance>reach(e,f)-8){f.x=on.x;f.y=on.y-8;}
   if(e.species.id==='s62'){e.groundDistance=on.along;positionOnGround(e);}
   // Fixed tentacles need a passing resource at their own attachment.
   if(e.species.id==='s63'){f.x=e.x+18;f.y=e.y-12;}
  }
 }
 // Keep learned resources independently selectable. Resolve only the authored
 // resident placements against the existing patch layout, within feeding reach.
 const placed=food.filter(f=>!assigned.has(f));
 for(const [f,e] of [...assigned].sort((a,b)=>(b[1].holdfast||b[1].species.id==='s63'?1:0)-(a[1].holdfast||a[1].species.id==='s63'?1:0))){
  const origin={x:f.x,y:f.y},fixed=!!e.holdfast||e.species.id==='s63',options=[origin];
  for(let radius=10;radius<=200;radius+=10)for(let i=0;i<24;i++){const angle=i*Math.PI/12;options.push({x:origin.x+Math.cos(angle)*radius,y:origin.y+Math.sin(angle)*radius});}
  const choice=options.find(p=>p.x>40&&p.x<1560&&p.y>35&&p.y<=700&&placed.every(b=>distance(p,b)>=50)&&
   (fixed?distance(e,p)<reach(e,f)-2:projectToGround(p,e.groundRoute).distance<reach(e,f)-5));
  if(choice){f.x=choice.x;f.y=choice.y;}
  placed.push(f);
 }
}

// Feeding has a visible preparation before contact and a brief handling pause.
// The simulation commits the resource only once; the renderer only reads phase.
export function residentStep(sim,e,dt,edible){
 const attached=!!e.holdfast,stationary=attached||e.species.id==='s63';
 const disturbance=[sim.player,...sim.section.entities].some(b=>b!==e&&b.alive&&b.species.id!=='s7'&&b.species.size>e.species.size*1.5&&distance(e,b)<55);
 e.retract=Math.max(0,Math.min(1,(e.retract||0)+(disturbance?dt*2:-dt*.65)));
 e.target=null;e.satiated=Math.max(0,(e.satiated||0)-dt);
 const eligible=f=>f.regrow<=0&&edible(e,f);
 let meal=e.residentMeal&&sim.section.food.find(f=>f.id===e.residentMeal.target&&eligible(f));
 if(e.residentMeal&&!meal)e.residentMeal=null;
 if(meal){
  if(distance(e,meal)>reach(e,meal)){e.residentMeal=null;}
  else{
   const action=e.residentMeal;action.elapsed+=dt;e.activity='feeding';e.behavior='Feeding on '+meal.name;
   if(!action.committed&&action.elapsed>=.22){
    meal.amount-=12;if(meal.amount<=0){meal.amount=100;meal.regrow=meal.food==='detritus'?30:8;}
    action.committed=true;e.satiated=60;e.actionTime=.65;
   }
   if(action.elapsed>=.85)e.residentMeal=null;
   return;
  }
 }
 if(e.satiated<=0){
  const candidates=sim.section.food.filter(eligible).map(f=>({f,on:attached?null:projectToGround(f,e.groundRoute)}))
   .filter(({f,on})=>stationary?distance(e,f)<reach(e,f):on.distance<reach(e,f))
   .sort((a,b)=>distance(e,a.f)-distance(e,b.f));
  const next=candidates[0];
  if(next){
   if(distance(e,next.f)<reach(e,next.f)){
    e.residentMeal={target:next.f.id,elapsed:0,committed:false};e.activity='feeding';e.behavior='Reaching for '+next.f.name;return;
   }
   const delta=next.on.along-e.groundDistance;e.groundDirection=delta>=0?1:-1;
   walkOnGround(e,dt,Math.min(groundSpeed(e),Math.abs(delta)/dt));
   e.activity='foraging';e.behavior='Approaching '+next.f.name.toLowerCase();return;
  }
 }
 e.activity=stationary?'at-home':e.satiated>0?'resting':'cruising';
 e.behavior=attached?'Among the seagrass':e.species.id==='s63'?'Attached to the reef':e.satiated>0?'Digesting a meal':'Crawling along the reef';
 if(e.retract>.4&&e.species.id==='s63'){e.activity='alert';e.behavior='Tentacles drawing inward';}
 // An occasional pause makes slow travel legible; fixed feeders never drift.
 if(!stationary)walkOnGround(e,dt,e.actionTime>0?0:groundSpeed(e)*(e.satiated>0?.45:1));
}
