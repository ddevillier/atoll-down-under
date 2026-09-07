import {SPECIES,BY_ID,PLAYABLE,REEFS,FOODS,createSpecies} from './data.js';
import {creatureWidth} from './geometry.js';
import {BOTTOM_RESIDENTS,placeOnGround,walkOnGround,positionOnGround,attachToNearestGround,validGroundState} from './ground-motion.js';
import {turnTowards,edgeDestination} from './steering.js';
import {populationFor} from './populations.js';
import {canUseShelter,shelterAt,SHELTER_SETTLE_SECONDS} from './shelter.js';
export const W=1600,H=740;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function edible(predator,prey){
 const a=predator.species||predator,b=prey.species||prey;
 const food=prey.kind==='food'?prey.food:b.food||'fish';
 if(!a.diet.includes(food))return false;
 if(food==='fish' && b.size>=a.size*.77)return false;
 // A listed crab/snail diet includes smaller shells that the mouth can handle.
 // Larger shells, spiny urchins and armored fish retain the stronger-jaw gate.
 const smallShellfish=['crab','snail'].includes(food)&&b.size<a.size*.77;
 if(b.armor&&!smallShellfish&&a.ability!=='crush'&&a.size<100)return false;
 return true;
}
export function healthState(fish){
 const poison=fish.poisonDamage||0,injury=fish.biteDamage||0;
 return {poison,injury,parasites:Math.max(0,100-fish.health-poison-injury)};
}
function entity(species,id,x,y){return {id,species,x,y,vx:0,vy:0,angle:0,facing:1,energy:100,health:100,poisonDamage:0,biteDamage:0,recoveryDelay:0,hidden:false,still:0,cleanTime:0,cooldown:0,abilityTime:0,stun:0,life:100,target:null,alive:true,behavior:'Cruising',biteCooldown:0,think:0};}
export class Simulation {
 constructor(seed=123456){this.seed=seed>>>0;this.time=0;this.uid=0;this.events=[];this.mode='practice';this.phase='idle';this.score=0;this.stage=0;this.stageScore=0;this.sequence=[];this.sections=[];this.player=null;this.protected=true;this.paused=false;this.period='day';this.current=4;this.pointer={x:800,y:330};this.difficulty=1;this.visited=[];this.observations=[];}
 random(){this.seed=(Math.imul(1664525,this.seed)+1013904223)>>>0;return this.seed/4294967296;}
 event(type,text,extra={}){this.events.push({type,text,...extra});}
 start(mode='practice',speciesId='s1',custom=null){
  this.mode=mode;this.phase='playing';this.time=0;this.score=0;this.stage=0;this.stageScore=0;this.events=[];this.custom=custom;this.visited=[];this.observations=[];
  if(mode==='tournament')this.sequence=[...PLAYABLE.filter(s=>s.id!=='s34').map(s=>s.id),'s34'];
  else if(mode==='challenge'){const bands=[PLAYABLE.slice(0,14),PLAYABLE.slice(14,28),PLAYABLE.slice(28,42),PLAYABLE.slice(42)];this.sequence=bands.map(a=>a[Math.floor(this.random()*a.length)].id);}
  else this.sequence=[speciesId];
  this.spawnPlayer(mode==='create'?createSpecies(custom):BY_ID[this.sequence[0]]);
  this.event('start','Welcome to '+REEFS[this.current].name+'. Swim and look around; press Esc to observe.');
 }
 spawnPlayer(species){
  this.destination=null;
  this.player=entity(species,'player',800,300);this.period=species.active==='night'?'night':'day';this.current=species.habitat==='sand'?7:species.habitat==='open'||species.habitat==='school'?1:4;
  this.pointer={x:800,y:300};this.protected=true;this.paused=false;this.sections=REEFS.map(r=>this.populate(r));this.visited.push(this.current);this.phase='playing';
 }
 populate(reef){
  const available=SPECIES.filter(s=>s.active===this.period||s.active==='both');
  const entities=[];
  const population=populationFor(reef.id,()=>this.random());
  for(let i=0;i<population.foragers+population.hunters;i++){
   // One hunter plus a possible second: Outer Blue has a modestly higher
   // second-hunter chance, without requiring a shark or targeting the player.
   const seekHunter=i>=population.foragers;
   let pool=available.filter(s=>s.playable&&s.ability!=='clean'&&s.diet.includes('fish')===seekHunter&&(seekHunter||s.size<130));
   // Prefer local residents without filling an entire habitat with copies of
   // its one eligible forager. Small explicit schools are added separately.
   const varied=pool.filter(s=>entities.filter(e=>e.species.id===s.id).length<3);if(varied.length)pool=varied;
   const local=pool.filter(s=>s.habitat===reef.habitat);if(local.length)pool=local;
   const s=pool[Math.floor(this.random()*pool.length)]||SPECIES[1];const fish=entity(s,++this.uid,70+this.random()*(W-140),80+this.random()*(H-170));fish.angle=this.random()*Math.PI*2;fish.facing=fish.angle>Math.PI?1:-1;fish.satiated=this.random()*65;fish.pursuit=0;fish.rest=0;fish.health=60+this.random()*40;entities.push(fish);
  }
  const small=available.filter(s=>s.playable&&s.size<50&&!s.diet.includes('fish'));
  const schooling=available.filter(s=>s.habitat==='school');
  const school=reef.habitat==='open'&&schooling.length?(schooling.find(s=>s.id===this.player.species.id)||schooling[Math.floor(this.random()*schooling.length)]):null;
  const schoolX=500+this.random()*450,schoolY=170+this.random()*140,schoolAngle=this.random()*Math.PI*2;
  for(let i=0;i<population.companions;i++){
   const s=school||small[Math.floor(this.random()*small.length)];
   const fish=entity(s,++this.uid,school?schoolX+i*55:100+this.random()*(W-200),school?schoolY+(i%2)*35:100+this.random()*(H-220));
   if(school){fish.angle=schoolAngle;fish.satiated=20+this.random()*20;fish.behavior='Swimming with a school';}
   entities.push(fish);
  }
  const clean=entity(SPECIES[this.period==='day'?43:45],++this.uid,reef.cleaner.x,reef.cleaner.y);clean.station={...reef.cleaner};entities.push(clean);
  const food=[];
  for(const [kind,sites]of Object.entries(reef.feedingSites))for(const [x,y]of sites){
   const def=FOODS[kind];
   food.push({id:'f'+(++this.uid),kind:'food',food:kind,name:def.name,x,y,size:def.size,amount:100,regrow:0,phase:this.random()*6});
  }
  const residents=[46,47,61,62,60,63].filter(i=>SPECIES[i].active!=='night'||this.period==='night');
  residents.forEach((i,n)=>{
   const resident=entity(SPECIES[i],++this.uid,0,0),route=reef.bottomRoutes[n%reef.bottomRoutes.length];
   placeOnGround(resident,route,n<reef.bottomRoutes.length?.2:.8);
   resident.behavior=resident.species.speed>0?'Crawling along the reef':i===63?'Attached to the reef':'On the reef floor';entities.push(resident);
  });
  // The catalog's non-playable seahorse now occurs beside meadow plants.
  if(this.period==='day'&&reef.id===6){
   const [x,y]=reef.feedingSites.grass[2],seahorse=entity(SPECIES[44],++this.uid,x+12,y-22);
   seahorse.holdfast={x:seahorse.x,y:seahorse.y};seahorse.behavior='Among the seagrass';entities.push(seahorse);
  }
  return {entities,food};
 }
 get section(){return this.sections[this.current];}
 get mealTarget(){
  const id=this.player?.target;
  return id?(this.section?.entities.find(e=>e.id===id&&e.alive)||this.section?.food.find(f=>f.id===id&&f.regrow<=0)||null):null;
 }
 relationship(e){
  if(e.species?.ability==='clean')return 'A cleaning partner. Wait nearby to observe the cleaning interaction; clicking during swimming attempts to eat it.';
  if(e.species?.poison||(e.food==='sponge'&&!this.player.species.diet.includes('sponge')))return 'Unsuitable food for many reef dwellers. Compare this organism with your fish’s diet in the field guide.';
  if(edible(this.player,e))return 'Part of your fish’s food web in this model. Compare its size and food type with the diet in your field guide.';
  if(e.species&&edible(e,this.player))return 'Your fish is potential prey in this model. Watch whether this animal is feeding, digesting, or resting; it does not hunt continuously.';
  if(e.behavior==='Swimming with a school')return 'These fish coordinate their direction and spacing with nearby members of the same species. Watch one leave to feed, then look for it rejoining the group. This is a simplified schooling model.';
  return 'A neighbor rather than a meal for your fish. Compare its diet and activity with yours to see how different lives share the reef.';
 }
 observe(e){
  if(!e)return;
  const subject=e.species?.id||e.food,behavior=e.behavior||'Stationary reef life';
  if(this.observations.some(n=>n.subject===subject&&n.habitat===this.current&&n.behavior===behavior))return;
  this.observations.push({subject,name:e.species?.name||e.name,behavior,habitat:this.current,period:this.period,time:this.time,relationship:this.relationship(e)});
 }
 get required(){return this.mode==='challenge'?(this.stage+1)*5000:5000;}
 setDestination(id){
  if(!this.player||this.phase!=='playing'||(id!==null&&(!Number.isInteger(id)||!REEFS[id])))return false;
  this.destination=id===this.current?null:id;return true;
 }
 point(x,y){
  if(!this.player||this.paused||this.phase!=='playing')return;
  this.pointer={x:edgeDestination(x,W),y:edgeDestination(y,H)};
  // A meal click assists the approach until the player steers again. Cursor
  // movement must always give control back, including during a pursuit.
  this.player.target=null;
 }
 findAt(x,y){
  const p={x,y};return this.section?.entities.filter(e=>e.alive).sort((a,b)=>distance(a,p)-distance(b,p)).find(e=>distance(e,p)<Math.max(17,creatureWidth(e.species)*.45))||this.section?.food.find(f=>f.regrow<=0&&distance(f,p)<f.size+9)||null;
 }
 eatAt(x,y){
  if(!this.player||this.paused||this.phase!=='playing')return false;
  const t=this.findAt(x,y);if(!t){this.point(x,y);return false;}
  this.protected=false;this.player.target=t.id;this.pointer={x:t.x,y:t.y};this.player.hidden=false;return true;
 }
 useAbility(){
  const p=this.player;if(!p||this.phase!=='playing'||this.paused)return false;
  if(p.species.ability==='none'){this.event('message','This species relies on swimming and shelter.');return false;}
  if(p.species.ability==='crush'){this.event('message','Crushing jaws are always available. Click a food in your diet to use them.');return false;}
  if(p.cooldown>0){this.event('message','Your ability is recovering.');return false;}
  if(p.energy<12){this.event('message','Find food before using more energy.');return false;}
  this.protected=false;p.energy-=8;p.cooldown=12;p.abilityTime=['lure','camouflage'].includes(p.species.ability)?6:4;
  const ability=p.species.ability;
  for(const e of this.section.entities){if(distance(p,e)>230)continue;if(['shock','sting','sonic','flash'].includes(ability))e.stun=4;if(['ink','poison','spines','puff'].includes(ability)){e.target=null;e.stun=1.5;e.angle=Math.atan2(e.y-p.y,e.x-p.x);}}
  this.event('ability',ability,{ability,x:p.x,y:p.y});return true;
 }
 consume(target){
  const p=this.player;if(p.biteCooldown>0)return;p.biteCooldown=.45;
  const b=target.species;const good=edible(p,target);const poison=target.kind==='food'?target.food==='sponge'&&!p.species.diet.includes('sponge'):b?.poison&&!['crush','poison'].includes(p.species.ability);
  const name=target.name||b?.name;
  if(poison){
   p.health-=25;p.poisonDamage=(p.poisonDamage||0)+25;p.recoveryDelay=10;p.energy-=10;p.lastHarm={type:'poison',name};
   let pointsLost=0,progressLost=0;
   if(this.mode!=='practice'){
    pointsLost=Math.min(500,this.score);progressLost=Math.min(500,this.stageScore);
    this.score-=pointsLost;this.stageScore-=progressLost;
   }
   const penalty=pointsLost>0?' Lost '+pointsLost+' points.':'';
   this.event('poison',name+' was poisonous to your fish.'+penalty+' Inspect it and compare your diet before another bite.',{pointsLost,progressLost});
   if(p.health<=0)this.die('Your fish was poisoned by '+name+'.');
  }
  else if(!good){
   p.energy-=2;const food=target.kind==='food'?target.food:b?.food||'fish';
   const reason=!p.species.diet.includes(food)?' is not part of your diet.':b?.armor?' is too well armored for your fish.':' is too large for your fish.';
   this.event('reject',name+reason);
  }
  else{
   const whole=target.kind!=='food';const gain=whole?clamp(b.size*.33,12,65):FOODS[target.food].nutrition;
   const energyBefore=p.energy;p.energy=clamp(p.energy+gain,0,100);const points=whole?1000:500;if(this.mode!=='practice'){this.score+=points;this.stageScore+=points;}
   if(whole){target.alive=false;target.respawn=20;}else{target.amount-=35;if(target.amount<=0){target.regrow=8;target.amount=100;}}
   this.event('eat','A good meal: '+name+'.',{points:this.mode==='practice'?0:points,energyGained:p.energy-energyBefore,x:target.x,y:target.y});
  }
  p.target=null;this.pointer={x:p.x,y:p.y};
 }
 transition(dx,dy){
  const r=Math.floor(this.current/3),c=this.current%3,nr=clamp(r+dy,0,2),nc=(c+dx+3)%3;if(nr===r&&dy)return false;
  const old=this.current,departure={x:this.player.x,y:this.player.y};this.current=nr*3+nc;this.player.x=dx>0?35:dx<0?W-35:this.player.x;this.player.y=dy>0?35:dy<0?H-35:this.player.y;
  // Carry the same relative positions across the boundary. A pursuer can still
  // be outside the painting; it must swim through that gap before it can bite.
  const pursuing=this.sections[old].entities.filter(e=>e.alive&&e.target==='player');
  for(const e of pursuing){this.sections[old].entities=this.sections[old].entities.filter(x=>x!==e);e.x+=this.player.x-departure.x;e.y+=this.player.y-departure.y;e.entering=true;this.section.entities.push(e);}
  this.pointer={x:this.player.x,y:this.player.y};this.player.target=null;this.protected=false;if(!this.visited.includes(this.current))this.visited.push(this.current);
  const arrived=this.destination===this.current;if(arrived)this.destination=null;
  this.event('transition',arrived?'Reached '+REEFS[this.current].name+'. '+new Set(this.visited).size+' of 9 habitats visited.':REEFS[this.current].name);return true;
 }
 step(dt){
  if(this.paused||this.phase!=='playing'||!this.player)return;
  dt=Math.min(dt,.05);this.time+=dt;const p=this.player;p.cooldown=Math.max(0,p.cooldown-dt);p.abilityTime=Math.max(0,p.abilityTime-dt);p.biteCooldown=Math.max(0,p.biteCooldown-dt);
  const target=this.mealTarget;
  if(p.target&&!target){p.target=null;this.pointer={x:p.x,y:p.y};this.event('message','That meal is no longer available. Choose another meal or keep swimming.');}
  const dest=target||this.pointer;const dx=dest.x-p.x,dy=dest.y-p.y,dist=Math.hypot(dx,dy);const old={x:p.x,y:p.y};
  if(dist>7){
   p.angle=turnTowards(p.angle,Math.atan2(dy,dx),p.species.agility*dt);
   const speed=p.species.speed*(p.species.ability==='dash'&&p.abilityTime>0?1.9:1);const advance=Math.min(speed*dt,dist);p.x+=Math.cos(p.angle)*advance;p.y+=Math.sin(p.angle)*advance;p.facing=Math.cos(p.angle)>=0?1:-1;p.still=0;
  }else p.still+=dt;
  const moving=distance(old,p)>dt*6;
  const shelter=canUseShelter(p.species)&&shelterAt(REEFS[this.current],p);
  const wasHidden=p.hidden;p.hidden=!!((shelter&&p.still>SHELTER_SETTLE_SECONDS)||(p.species.ability==='camouflage'&&p.abilityTime>0&&!moving));
  if(p.hidden&&!wasHidden)this.event('hide','Hidden. Remain still to stay concealed.');
  if(!p.hidden&&wasHidden)this.event('reveal','Back in open water.');
  if(target&&distance(p,target)<p.species.size*.38+(target.species?.size||target.size)*.25+12)this.consume(target);
  if(this.phase!=='playing')return;
  if(!this.protected){p.energy-=dt*p.species.metabolism*(moving?1.55:.7)*this.difficulty;if(p.species.parasites)p.health-=dt*.105*this.difficulty;if(!p.hidden&&this.mode!=='practice'){this.score+=dt*8;this.stageScore+=dt*8;}}
  // Recovery is a gentle game abstraction, separate from parasite removal.
  // Feeding supports recovery; a cleaner cannot undo an injury or toxic meal.
  p.recoveryDelay=Math.max(0,(p.recoveryDelay||0)-dt);
  const damage=(p.poisonDamage||0)+(p.biteDamage||0);
  if(damage>0&&p.energy>=50&&p.recoveryDelay===0){
   const recovered=Math.min(damage,dt*.4),remaining=Math.max(0,1-recovered/damage);
   p.poisonDamage*=remaining;p.biteDamage*=remaining;p.health=Math.min(100,p.health+recovered);
   if(remaining===0){p.lastHarm=null;this.event('recover','Your fish has recovered from its injury or poisonous meal. Cleaning still removes parasites.');}
  }
  const cleaner=this.section.entities.find(e=>e.alive&&e.species.ability==='clean'&&distance(e,p)<105);
  if(cleaner&&p.still>.6&&!p.target&&healthState(p).parasites>1){p.cleanTime+=dt;cleaner.behavior='Cleaning';if(p.cleanTime>=2){p.health=Math.max(0,100-(p.poisonDamage||0)-(p.biteDamage||0));p.cleanTime=0;this.event('clean','Parasites removed. Thank you, '+cleaner.species.name+'.');}}else p.cleanTime=0;
  if(p.x>W-8&&this.pointer.x>W-10)this.transition(1,0);else if(p.x<8&&this.pointer.x<10)this.transition(-1,0);else if(p.y>H-8&&this.pointer.y>H-10){if(!this.transition(0,1))p.y=H-8;}else if(p.y<8&&this.pointer.y<10){if(!this.transition(0,-1))p.y=8;}
  p.x=clamp(p.x,1,W-1);p.y=clamp(p.y,1,H-1);
  for(const f of this.section.food)f.regrow=Math.max(0,f.regrow-dt);
  for(const e of [...this.section.entities])this.stepNpc(e,dt);
  if(p.energy<=0)this.die('Your energy ran out. Look for food that suits your fish.');else if(p.health<=0)this.die(p.lastHarm?.type==='poison'?'Your fish did not recover after eating '+p.lastHarm.name+'.':p.lastHarm?.type==='bite'?'Your fish did not recover after a bite from '+p.lastHarm.name+'.':'Parasites overwhelmed your fish. Observe a cleaning station on your next dive.');
  if(this.phase==='playing'&&['challenge','tournament'].includes(this.mode)&&this.stageScore>=this.required){this.score+=1500;this.phase=this.stage>=this.sequence.length-1?'won':'advance';this.event(this.phase,this.phase==='won'?'You have mastered this stretch of reef.':'A new life on the reef awaits.');}
 }
 stepNpc(e,dt){
  if(!e.alive){e.respawn-=dt;if(e.respawn<=0){
   e.alive=true;e.life=100;e.x=60+this.random()*(W-120);e.y=80+this.random()*(H-180);e.target=null;e.satiated=30;e.pursuit=0;
   // A returning cleaner belongs to the established station, where players
   // and clients know to wait, rather than an arbitrary point in open water.
   if(e.species.ability==='clean'&&e.station){e.x=e.station.x;e.y=e.station.y;}
   if(validGroundState(e))positionOnGround(e);
   if(e.holdfast){e.x=e.holdfast.x;e.y=e.holdfast.y;}
  }return;}
  e.stun=Math.max(0,e.stun-dt);e.biteCooldown=Math.max(0,e.biteCooldown-dt);if(e.stun>0)return;
  if(e.entering&&e.x>=10&&e.x<=W-10&&e.y>=25&&e.y<=H-20)delete e.entering;
  if(BOTTOM_RESIDENTS.has(e.species.id)){
   if(!validGroundState(e))attachToNearestGround(e,REEFS[this.current].bottomRoutes);
   e.target=null;e.satiated=Math.max(0,(e.satiated||0)-dt);
   walkOnGround(e,dt);
   e.behavior=e.species.speed>0?(e.satiated>0?'Digesting a meal':'Crawling along the reef'):e.species.id==='s63'?'Attached to the reef':'On the reef floor';
   const food=e.satiated<=0?this.section.food.find(f=>f.regrow<=0&&edible(e,f)&&distance(e,f)<e.species.size*.4+f.size+10):null;
   if(food){food.amount-=12;if(food.amount<=0){food.regrow=8;food.amount=100;}e.satiated=45+this.random()*35;e.behavior='Feeding on '+food.name;}
   return;
  }
  if(e.holdfast){e.x=e.holdfast.x;e.y=e.holdfast.y;e.behavior='Among the seagrass';return;}
  const p=this.player;e.think-=dt;
  if(e.species.ability==='clean'){
   const client=p.cleanTime>0?p:this.section.entities.find(b=>b.alive&&b.cleanTime>0&&b.target===e.id);
   const dest=client?{x:client.x-client.facing*20,y:client.y+10}:e.station;
   e.behavior=client?'Cleaning '+client.species.name:'At a cleaning station';
   if(dest){e.x+=(dest.x-e.x)*dt*1.5;e.y+=(dest.y-e.y)*dt*1.5;}e.facing=client?client.facing:Math.sin(this.time*.5)>0?1:-1;return;
  }
  if(e.species.speed===0)return;
  e.satiated=Math.max(0,(e.satiated??0)-dt);e.rest=Math.max(0,(e.rest??0)-dt);e.pursuit=e.pursuit??0;
  if(e.species.parasites)e.health=Math.max(0,e.health-dt*.045);
  const cleaner=e.species.parasites&&e.health<65?this.section.entities.find(b=>b.alive&&b.species.ability==='clean'):null;
  if(cleaner){
   e.target=cleaner.id;e.pursuit=0;
   const station=cleaner.station||cleaner,dx=station.x+35-e.x,dy=station.y-e.y,dist=Math.hypot(dx,dy);
   if(dist>12){e.angle=turnTowards(e.angle,Math.atan2(dy,dx),e.species.agility*dt);e.x+=Math.cos(e.angle)*Math.min(dist,e.species.speed*.45*dt);e.y+=Math.sin(e.angle)*Math.min(dist,e.species.speed*.45*dt);e.facing=Math.cos(e.angle)>=0?1:-1;e.cleanTime=0;e.behavior='Visiting a cleaning station';}
   else{
    const busy=p.cleanTime>0||this.section.entities.some(b=>b!==e&&b.alive&&b.target===cleaner.id&&b.cleanTime>0);
    e.behavior=busy?'Waiting for a cleaner':'Being cleaned';if(!busy)e.cleanTime+=dt;
    if(e.cleanTime>=3){e.health=100;e.cleanTime=0;e.target=null;e.behavior='Leaving the cleaning station';e.angle+=Math.PI;e.think=2;}
   }
   return;
  }
  // Old saves can contain a meal target aimed at a cleaner. A healthy client
  // releases that target; parasite-driven visits are handled above.
  if(e.target&&this.section.entities.some(b=>b.id===e.target&&b.species.ability==='clean')){e.target=null;e.pursuit=0;e.think=0;}
  const defended=p.abilityTime>0&&['spines','puff','poison','ink','shock','sting'].includes(p.species.ability);
  const canEatPlayer=!p.hidden&&!this.protected&&!defended&&!p.species.poison&&edible(e,p);
  if(e.target==='player'&&!canEatPlayer&&e.behavior!=='Following lure'){e.target=null;e.pursuit=0;e.think=0;}
  if(e.target){e.pursuit+=dt;if(e.pursuit>6){e.target=null;e.pursuit=0;e.rest=15;e.think=0;}}
  let speed=e.species.speed*.35;
  if(e.think<=0){
   e.think=.65+this.random()*.55;
   const pd=distance(e,p);
   const threats=this.section.entities.filter(b=>b!==e&&b.alive&&b.satiated<=0&&edible(b,e)&&distance(e,b)<100);
   if((edible(p,e)&&pd<100&&!p.hidden)||defended&&pd<150)threats.push(p);
   const threat=threats.sort((a,b)=>distance(e,a)-distance(e,b))[0];
   if(threat){e.target=null;e.pursuit=0;e.angle=Math.atan2(e.y-threat.y,e.x-threat.x);e.behavior='Moving away from '+threat.species.name;}
   else if(!e.target){
    const candidates=e.satiated<=0&&e.rest<=0?[
     // Routine foraging recognizes cleaning partners. The player's explicit
     // food choices still use the ordinary diet rules, including cleaners.
     ...this.section.entities.filter(b=>b!==e&&b.alive&&b.species.ability!=='clean'&&edible(e,b)&&!b.species.poison),
     ...this.section.food.filter(f=>f.regrow<=0&&edible(e,f)),
     ...(canEatPlayer?[p]:[])
    ].filter(b=>distance(e,b)<165).sort((a,b)=>distance(e,a)-distance(e,b)):[];
    const near=candidates[0];e.target=near?.id||null;e.pursuit=0;
    e.behavior=near?(near.kind==='food'?'Foraging for ':'Hunting ')+(near.name||near.species.name):e.satiated>0?'Digesting a meal':e.rest>0?'Resting between feeding trips':'Exploring';
    if(!near&&this.random()<.45)e.angle+=(this.random()-.5)*1.1;
   }
   if(p.species.ability==='lure'&&p.abilityTime>0&&edible(p,e)&&pd<340){e.target='player';e.behavior='Following lure';}
  }
  if(e.target){
   const dest=e.target==='player'?p:this.section.entities.find(b=>b.id===e.target&&b.alive)||this.section.food.find(f=>f.id===e.target&&f.regrow<=0);
   if(dest){
    e.angle=turnTowards(e.angle,Math.atan2(dest.y-e.y,dest.x-e.x),e.species.agility*dt);speed=e.species.speed*.55;
    if(distance(e,dest)<(e.species.size+(dest.species?.size||dest.size||0))*.28&&e.biteCooldown<=0){
     e.biteCooldown=2;
     if(dest===p&&canEatPlayer){p.health-=35;p.biteDamage=(p.biteDamage||0)+35;p.recoveryDelay=10;p.lastHarm={type:'bite',name:e.species.name};p.energy-=8;p.cooldown=Math.max(p.cooldown,1);this.event('hurt',e.species.name+' took a bite. Pause to learn about its diet.',{x:p.x,y:p.y});if(p.health<=0)this.die('You were eaten by a '+e.species.name+'.');}
     else if(dest!==p&&dest.kind==='food'){dest.amount-=12;if(dest.amount<=0){dest.regrow=8;dest.amount=100;}}
     else if(dest!==p){dest.alive=false;dest.respawn=24;}
     e.target=null;e.pursuit=0;e.satiated=45+this.random()*35;e.behavior='Digesting a meal';
    }
   }else{e.target=null;e.pursuit=0;}
  }
  else if(e.behavior.startsWith('Moving away'))speed=e.species.speed*.65;
  // Group movement is a simplified observation model. Feeding, cleaning and
  // immediate avoidance take precedence, so schools can separate and re-form.
  if(e.species.habitat==='school'&&!e.target&&!e.behavior.startsWith('Moving away')){
   const neighbors=[...this.section.entities,p].filter(b=>b!==e&&b.alive&&!b.hidden&&b.species.id===e.species.id&&distance(e,b)<260);
   if(neighbors.length){
    let x=0,y=0;
    for(const b of neighbors){
     const dx=b.x-e.x,dy=b.y-e.y,d=Math.max(1,Math.hypot(dx,dy)),spacing=Math.max(38,e.species.size*.85);
     x+=Math.cos(b.angle)*.9+dx/120;y+=Math.sin(b.angle)*.9+dy/120;
     if(d<spacing){const repel=(spacing-d)/spacing*4;x-=dx/d*repel;y-=dy/d*repel;}
    }
    // Turn the group before it piles up against the rectangular world edge.
    x/=neighbors.length;y/=neighbors.length;
    x+=e.x<100?(100-e.x)/35:e.x>W-100?-(e.x-W+100)/35:0;
    y+=e.y<90?(90-e.y)/35:e.y>H-90?-(e.y-H+90)/35:0;
    if(Math.hypot(x,y)>.01)e.angle=turnTowards(e.angle,Math.atan2(y,x),e.species.agility*dt);
    e.behavior='Swimming with a school';
   }else if(e.behavior==='Swimming with a school')e.behavior='Exploring';
  }
  // If the pursuit ends outside the scene, finish entering at cruising speed.
  // Rest/digestion still applies; entry grants no fresh hunt or instant move.
  if(e.entering&&!e.target)e.angle=turnTowards(e.angle,Math.atan2(clamp(e.y,45,H-40)-e.y,clamp(e.x,30,W-30)-e.x),e.species.agility*dt);
  e.x+=Math.cos(e.angle)*speed*dt;e.y+=Math.sin(e.angle)*speed*dt;e.facing=Math.cos(e.angle)>=0?1:-1;
  if(!e.entering){
   if(e.x<10||e.x>W-10){e.x=clamp(e.x,10,W-10);e.angle=Math.PI-e.angle;}if(e.y<25||e.y>H-20){e.y=clamp(e.y,25,H-20);e.angle=-e.angle;}
  }
 }
 next(){if(this.phase==='advance'){this.stage++;this.stageScore=0;this.spawnPlayer(BY_ID[this.sequence[this.stage]]);}}
 die(reason){if(this.phase!=='playing')return;this.phase='dead';this.event('death',reason);}
 continueRun(){this.score=0;this.stageScore=0;this.spawnPlayer(this.player.species);}
 serialize(){return JSON.stringify({version:1,seed:this.seed,time:this.time,uid:this.uid,mode:this.mode,phase:this.phase,score:this.score,stage:this.stage,stageScore:this.stageScore,sequence:this.sequence,sections:this.sections,player:this.player,protected:this.protected,period:this.period,current:this.current,pointer:this.pointer,custom:this.custom,visited:this.visited,destination:this.destination,difficulty:this.difficulty,observations:this.observations});}
 static restore(raw){
  const d=typeof raw==='string'?JSON.parse(raw):raw;
  if(d.version!==1||!Array.isArray(d.sections)||d.sections.length!==9||!d.player?.species||!Number.isInteger(d.current)||d.current<0||d.current>8||!['practice','challenge','tournament','create'].includes(d.mode))throw new Error('This save is not a compatible Atoll game.');
  for(const k of ['x','y','energy','health'])if(!Number.isFinite(d.player[k]))throw new Error('The saved fish is damaged.');
  // Older saves only recorded aggregate health. Preserve known poison loss;
  // unlabelled historical loss retains its former parasite interpretation.
  if(d.player.poisonDamage===undefined)d.player.poisonDamage=d.player.lastHarm?.type==='poison'?Math.max(0,100-d.player.health):0;
  if(d.player.biteDamage===undefined)d.player.biteDamage=0;
  if(d.player.recoveryDelay===undefined)d.player.recoveryDelay=0;
  for(const k of ['poisonDamage','biteDamage','recoveryDelay'])if(!Number.isFinite(d.player[k])||d.player[k]<0)throw new Error('The saved fish is damaged.');
  // Correct the omitted original-game lionfish food without repopulating saves.
  // A custom fish using a lionfish illustration keeps its chosen diet.
  for(const fish of [d.player,...d.sections.flatMap(section=>section.entities||[])]){
   if(fish.species?.id==='s20'&&Array.isArray(fish.species.diet)&&!fish.species.diet.includes('crab'))fish.species={...fish.species,diet:[...fish.species.diet,'crab']};
  }
  if(d.player.species.ability==='crush'){
   d.player.cooldown=0;d.player.abilityTime=0;
   if(d.player.species.id==='custom'&&d.custom)d.player.species.diet=createSpecies({...d.custom,ability:'crush'}).diet;
  }
  if(!Number.isInteger(d.destination)||!REEFS[d.destination]||d.destination===d.current)d.destination=null;
  const sim=new Simulation();Object.assign(sim,d);sim.events=[];sim.paused=true;return sim;
 }
}
