import {FOODS} from './data.js';
import {BOTTOM_RESIDENTS,groundSpeed,projectToGround,positionOnGround,walkOnGround,validGroundState,attachToNearestGround} from './ground-motion.js';
import {mouthPoint} from './feeding-contact.js';
import {groundPitch} from './geometry.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const mouth=e=>mouthPoint(e,{rotation:groundPitch(e)});
const reach=(e,f)=>(e.holdfast?12:e.species.id==='s63'?21:e.species.id==='s46'?18:e.species.id==='s47'?12:7)+f.size*.35;
const mouthGap=(e,f)=>distance(mouth(e),f);
export function validResidentMeal(a){return a==null||typeof a==='object'&&typeof a.target==='string'&&typeof a.committed==='boolean'&&Number.isFinite(a.elapsed)&&a.elapsed>=0&&a.elapsed<=1&&['x','y'].every(k=>a[k]===undefined||Number.isFinite(a[k]))&&(a.food===undefined||Object.hasOwn(FOODS,a.food));}
function groundMeal(e,f){
 const origin=mouth(e),on=projectToGround({x:f.x-(origin.x-e.x),y:f.y-(origin.y-e.y)},e.groundRoute);
 return {...on,distance:distance({x:on.x+origin.x-e.x,y:on.y+origin.y-e.y},f)};
}

// Authored placement: two small renewable detritus patches and existing food
// patches aligned to the substrate. No animal slots or calorie values change.
// Existing patches move rather than being duplicated for each resident.
export function prepareResidentFood(entities,food,reef){
 const claimed=new Set(),assigned=new Map();
 for(const e of entities.filter(e=>BOTTOM_RESIDENTS.has(e.species.id)||e.holdfast)){
  if(BOTTOM_RESIDENTS.has(e.species.id)&&!validGroundState(e))attachToNearestGround(e,reef.bottomRoutes);
  if(e.species.diet.includes('detritus')){
   const def=FOODS.detritus;
   const id=`detritus-${reef.id}-${e.species.id}`,origin=mouth(e);
   let f=food.find(f=>f.id===id);if(!f){f={id,kind:'food',food:'detritus',...def,x:origin.x+12,y:origin.y,size:def.size,amount:100,regrow:0,phase:reef.id*.7};food.push(f);}
   assigned.set(f,e);
   continue;
  }
  const candidates=food.filter(f=>!claimed.has(f.id)&&e.species.diet.includes(f.food));
  if(!candidates.length)continue;
  candidates.sort((a,b)=>distance(e,a)-distance(e,b));const f=candidates[0];claimed.add(f.id);assigned.set(f,e);
  if(e.holdfast){const origin=mouth(e);f.x=origin.x+8;f.y=origin.y;}
  else{
   const origin=mouth(e),on=groundMeal(e,f);
   if(on.distance>reach(e,f)-5){f.x=on.x+origin.x-e.x;f.y=on.y+origin.y-e.y;}
   if(e.species.id==='s62'){e.groundDistance=on.along;positionOnGround(e);}
   // Fixed tentacles need a passing resource at their own attachment.
   if(e.species.id==='s63'){const origin=mouth(e);f.x=origin.x+12;f.y=origin.y;}
  }
 }
 // Keep learned resources independently selectable. Resolve only the authored
 // resident placements against the existing patch layout, within feeding reach.
 const placed=food.filter(f=>!assigned.has(f));
 for(const [f,e] of [...assigned].sort((a,b)=>(b[1].holdfast||b[1].species.id==='s63'?1:0)-(a[1].holdfast||a[1].species.id==='s63'?1:0))){
  const origin={x:f.x,y:f.y},fixed=!!e.holdfast||e.species.id==='s63',options=[origin];
  for(let radius=10;radius<=200;radius+=10)for(let i=0;i<24;i++){const angle=i*Math.PI/12;options.push({x:origin.x+Math.cos(angle)*radius,y:origin.y+Math.sin(angle)*radius});}
  const fits=p=>p.x>40&&p.x<1560&&p.y>35&&p.y<=700&&placed.every(b=>distance(p,b)>=50)&&
   (fixed?mouthGap(e,p)<reach(e,f)-2:groundMeal(e,p).distance<reach(e,f)-5);
  let choice=options.find(fits);
  if(!choice&&fixed){
   // A fixed mouth cannot follow a patch displaced far down the reef. Make
   // room by shifting a conflicting unassigned patch locally, preserving its
   // amount/regrowth and keeping all resources independently selectable.
   for(const b of placed.filter(b=>!assigned.has(b)&&distance(b,origin)<50)){
    const alternatives=[];
    for(let radius=10;radius<=160;radius+=10)for(let i=0;i<24;i++){const angle=i*Math.PI/12;alternatives.push({x:b.x+Math.cos(angle)*radius,y:b.y+Math.sin(angle)*radius});}
    const room=alternatives.find(p=>p.x>40&&p.x<1560&&p.y>35&&p.y<=700&&distance(p,origin)>=50&&food.every(other=>other===b||other===f||distance(p,other)>=50));
    if(room){b.x=room.x;b.y=room.y;}
   }
   choice=options.find(fits);
  }
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
  if(!e.residentMeal.committed&&mouthGap(e,meal)>reach(e,meal)){e.residentMeal=null;}
  else{
   const action=e.residentMeal;action.x??=meal.x;action.y??=meal.y;action.food??=meal.food;action.elapsed+=dt;e.activity='feeding';e.behavior='Feeding on '+meal.name;
   if(!action.committed&&action.elapsed>=.22){
    meal.amount-=12;if(meal.amount<=0){meal.amount=100;meal.regrow=meal.food==='detritus'?30:8;}
    action.committed=true;e.satiated=60;e.actionTime=.65;
   }
   if(action.elapsed>=.85)e.residentMeal=null;
   return;
  }
 }
 if(e.satiated<=0){
  const candidates=sim.section.food.filter(eligible).map(f=>({f,on:attached?null:groundMeal(e,f)}))
   .filter(({f,on})=>stationary?mouthGap(e,f)<reach(e,f):on.distance<reach(e,f))
   .sort((a,b)=>distance(e,a.f)-distance(e,b.f));
  const next=candidates[0];
  if(next){
   if(mouthGap(e,next.f)<reach(e,next.f)){
    e.residentMeal={target:next.f.id,elapsed:0,committed:false,x:next.f.x,y:next.f.y,food:next.f.food};e.activity='feeding';e.behavior='Reaching for '+next.f.name;return;
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
