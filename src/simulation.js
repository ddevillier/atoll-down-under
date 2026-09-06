import {SPECIES,BY_ID,PLAYABLE,REEFS,FOODS,createSpecies} from './data.js';
export const W=1600,H=740;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function edible(predator,prey){
 const a=predator.species||predator,b=prey.species||prey;
 const food=prey.kind==='food'?prey.food:b.food||'fish';
 if(!a.diet.includes(food))return false;
 if(food==='fish' && b.size>=a.size*.77)return false;
 if(b.armor&&a.ability!=='crush'&&a.size<100)return false;
 return true;
}
function entity(species,id,x,y){return {id,species,x,y,vx:0,vy:0,angle:0,facing:1,energy:100,health:100,hidden:false,still:0,cleanTime:0,cooldown:0,abilityTime:0,stun:0,life:100,target:null,alive:true,behavior:'Cruising',biteCooldown:0,think:0};}
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
  this.player=entity(species,'player',800,300);this.period=species.active==='night'?'night':'day';this.current=species.habitat==='sand'?7:species.habitat==='open'||species.habitat==='school'?1:4;
  this.pointer={x:800,y:300};this.protected=true;this.paused=false;this.sections=REEFS.map(r=>this.populate(r));this.visited.push(this.current);this.phase='playing';
 }
 populate(reef){
  const available=SPECIES.filter(s=>s.active===this.period||s.active==='both');
  const entities=[];
  for(let i=0;i<15;i++){
   // A community of grazers and small foragers, with occasional hunters.
   // No habitat is required to contain a shark or a predator for the player.
   const hunters=entities.filter(e=>e.species.diet.includes('fish')).length;
   const seekHunter=i%6===5&&hunters<2;
   let pool=available.filter(s=>s.playable&&s.ability!=='clean'&&s.diet.includes('fish')===seekHunter&&(seekHunter||s.size<130));
   const local=pool.filter(s=>s.habitat===reef.habitat);if(local.length)pool=local;
   const s=pool[Math.floor(this.random()*pool.length)]||SPECIES[1];const fish=entity(s,++this.uid,70+this.random()*(W-140),80+this.random()*(H-170));fish.angle=this.random()*Math.PI*2;fish.facing=fish.angle>Math.PI?1:-1;fish.satiated=this.random()*65;fish.pursuit=0;fish.rest=0;fish.health=60+this.random()*40;entities.push(fish);
  }
  const small=available.filter(s=>s.playable&&s.size<50&&!s.diet.includes('fish'));
  const schooling=available.filter(s=>s.habitat==='school');
  const school=reef.habitat==='open'&&schooling.length?(schooling.find(s=>s.id===this.player.species.id)||schooling[Math.floor(this.random()*schooling.length)]):null;
  const schoolX=500+this.random()*450,schoolY=170+this.random()*140,schoolAngle=this.random()*Math.PI*2;
  for(let i=0;i<3;i++){
   const s=school||small[Math.floor(this.random()*small.length)];
   const fish=entity(s,++this.uid,school?schoolX+i*55:100+this.random()*(W-200),school?schoolY+(i%2)*35:100+this.random()*(H-220));
   if(school){fish.angle=schoolAngle;fish.satiated=20+this.random()*20;fish.behavior='Swimming with a school';}
   entities.push(fish);
  }
  const clean=entity(SPECIES[this.period==='day'?43:45],++this.uid,reef.cleaner.x,reef.cleaner.y);clean.station={...reef.cleaner};entities.push(clean);
  const food=[];let n=0;
  for(const [kind,def]of Object.entries(FOODS))for(let k=0;k<(kind==='plankton'?6:3);k++){
   food.push({id:'f'+(++this.uid),kind:'food',food:kind,name:def.name,x:90+((n++*181+reef.id*83)%1400),y:kind==='plankton'?90+this.random()*310:470+this.random()*205,size:def.size,amount:100,regrow:0,phase:this.random()*6});
  }
  for(const i of [46,47,61,62,60,63])if(SPECIES[i].active!=='night'||this.period==='night')entities.push(entity(SPECIES[i],++this.uid,100+this.random()*1400,565+this.random()*140));
  return {entities,food};
 }
 get section(){return this.sections[this.current];}
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
 point(x,y){this.pointer={x:clamp(x,0,W),y:clamp(y,0,H)};}
 findAt(x,y){
  const p={x,y};return this.section?.entities.filter(e=>e.alive).sort((a,b)=>distance(a,p)-distance(b,p)).find(e=>distance(e,p)<Math.max(17,e.species.size*.45))||this.section?.food.find(f=>f.regrow<=0&&distance(f,p)<f.size+9)||null;
 }
 eatAt(x,y){const t=this.findAt(x,y);if(!t)return false;this.protected=false;this.player.target=t.id;this.pointer={x:t.x,y:t.y};this.player.hidden=false;return true;}
 useAbility(){
  const p=this.player;if(!p||this.phase!=='playing'||this.paused)return false;
  if(p.species.ability==='none'){this.event('message','This species relies on swimming and shelter.');return false;}
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
  if(poison){p.health-=25;p.energy-=10;p.lastHarm={type:'poison',name};this.score=Math.max(0,this.score-500);this.event('poison',name+' was poisonous to your fish. Inspect it and compare your diet before another bite.');if(p.health<=0)this.die('Your fish was poisoned by '+name+'.');}
  else if(!good){p.energy-=2;this.event('reject',b?.armor?name+' is too well armored for your fish.':name+' is not part of your diet.');}
  else{
   const whole=target.kind!=='food';const gain=whole?clamp(b.size*.33,12,65):FOODS[target.food].nutrition;
   p.energy=clamp(p.energy+gain,0,100);const points=whole?1000:500;if(this.mode!=='practice'){this.score+=points;this.stageScore+=points;}
   if(whole){target.alive=false;target.respawn=20;}else{target.amount-=35;if(target.amount<=0){target.regrow=8;target.amount=100;}}
   this.event('eat','A good meal: '+name+'.',{points:this.mode==='practice'?0:points,x:target.x,y:target.y});
  }
  p.target=null;this.pointer={x:p.x,y:p.y};
 }
 transition(dx,dy){
  const r=Math.floor(this.current/3),c=this.current%3,nr=clamp(r+dy,0,2),nc=(c+dx+3)%3;if(nr===r&&dy)return false;
  const old=this.current;this.current=nr*3+nc;this.player.x=dx>0?35:dx<0?W-35:this.player.x;this.player.y=dy>0?35:dy<0?H-35:this.player.y;
  // Nearby predators retain their pursuit through a section boundary.
  const pursuing=this.sections[old].entities.filter(e=>e.alive&&e.target==='player');
  for(const e of pursuing){this.sections[old].entities=this.sections[old].entities.filter(x=>x!==e);e.x=dx?this.player.x-dx*150:clamp(this.player.x+(this.random()-.5)*130,20,W-20);e.y=dy?this.player.y-dy*100:clamp(this.player.y+(this.random()-.5)*100,20,H-20);this.section.entities.push(e);}
  this.pointer={x:this.player.x,y:this.player.y};this.player.target=null;this.protected=false;if(!this.visited.includes(this.current))this.visited.push(this.current);this.event('transition',REEFS[this.current].name);return true;
 }
 step(dt){
  if(this.paused||this.phase!=='playing'||!this.player)return;
  dt=Math.min(dt,.05);this.time+=dt;const p=this.player;p.cooldown=Math.max(0,p.cooldown-dt);p.abilityTime=Math.max(0,p.abilityTime-dt);p.biteCooldown=Math.max(0,p.biteCooldown-dt);
  let target=p.target?this.section.entities.find(e=>e.id===p.target&&e.alive)||this.section.food.find(f=>f.id===p.target&&f.regrow<=0):null;
  if(p.target&&!target)p.target=null;
  const dest=target||this.pointer;const dx=dest.x-p.x,dy=dest.y-p.y,dist=Math.hypot(dx,dy);const old={x:p.x,y:p.y};
  if(dist>7){
   const wanted=Math.atan2(dy,dx);let da=(wanted-p.angle+Math.PI*3)%(Math.PI*2)-Math.PI;p.angle+=clamp(da,-p.species.agility*dt,p.species.agility*dt);
   const speed=p.species.speed*(p.species.ability==='dash'&&p.abilityTime>0?1.9:1);const advance=Math.min(speed*dt,dist);p.x+=Math.cos(p.angle)*advance;p.y+=Math.sin(p.angle)*advance;p.facing=Math.cos(p.angle)>=0?1:-1;p.still=0;
  }else p.still+=dt;
  const moving=distance(old,p)>dt*6;
  const shelter=REEFS[this.current].shelters.find(s=>distance(p,s)<s.r&&p.species.size<125);
  const wasHidden=p.hidden;p.hidden=!!((shelter&&p.still>.7)||(p.species.ability==='camouflage'&&p.abilityTime>0&&!moving));
  if(p.hidden&&!wasHidden)this.event('hide','Hidden. Remain still to stay concealed.');
  if(!p.hidden&&wasHidden)this.event('reveal','Back in open water.');
  if(target&&distance(p,target)<p.species.size*.38+(target.species?.size||target.size)*.25+12)this.consume(target);
  if(this.phase!=='playing')return;
  if(!this.protected){p.energy-=dt*p.species.metabolism*(moving?1.55:.7)*this.difficulty;if(p.species.parasites)p.health-=dt*.105*this.difficulty;if(!p.hidden&&this.mode!=='practice'){this.score+=dt*8;this.stageScore+=dt*8;}}
  const cleaner=this.section.entities.find(e=>e.alive&&e.species.ability==='clean'&&distance(e,p)<105);
  if(cleaner&&p.still>.6&&!p.target&&p.health<99){p.cleanTime+=dt;cleaner.behavior='Cleaning';if(p.cleanTime>=2){p.health=100;p.lastHarm=null;p.cleanTime=0;this.event('clean','Parasites removed. Thank you, '+cleaner.species.name+'.');}}else p.cleanTime=0;
  if(p.x>W-8&&this.pointer.x>W-10)this.transition(1,0);else if(p.x<8&&this.pointer.x<10)this.transition(-1,0);else if(p.y>H-8&&this.pointer.y>H-10){if(!this.transition(0,1))p.y=H-8;}else if(p.y<8&&this.pointer.y<10){if(!this.transition(0,-1))p.y=8;}
  p.x=clamp(p.x,1,W-1);p.y=clamp(p.y,1,H-1);
  for(const f of this.section.food)f.regrow=Math.max(0,f.regrow-dt);
  for(const e of [...this.section.entities])this.stepNpc(e,dt);
  if(p.energy<=0)this.die('Your energy ran out. Look for food that suits your fish.');else if(p.health<=0)this.die(p.lastHarm?.type==='poison'?'Your fish did not recover after eating '+p.lastHarm.name+'.':'Parasites overwhelmed your fish. Observe a cleaning station on your next dive.');
  if(this.phase==='playing'&&['challenge','tournament'].includes(this.mode)&&this.stageScore>=this.required){this.score+=1500;this.phase=this.stage>=this.sequence.length-1?'won':'advance';this.event(this.phase,this.phase==='won'?'You have mastered this stretch of reef.':'A new life on the reef awaits.');}
 }
 stepNpc(e,dt){
  if(!e.alive){e.respawn-=dt;if(e.respawn<=0){e.alive=true;e.life=100;e.x=60+this.random()*(W-120);e.y=80+this.random()*(H-180);e.target=null;e.satiated=30;e.pursuit=0;}return;}
  e.stun=Math.max(0,e.stun-dt);e.biteCooldown=Math.max(0,e.biteCooldown-dt);if(e.stun>0)return;
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
   if(dist>12){const wanted=Math.atan2(dy,dx),da=(wanted-e.angle+Math.PI*3)%(Math.PI*2)-Math.PI;e.angle+=clamp(da,-e.species.agility*dt,e.species.agility*dt);e.x+=Math.cos(e.angle)*Math.min(dist,e.species.speed*.45*dt);e.y+=Math.sin(e.angle)*Math.min(dist,e.species.speed*.45*dt);e.facing=Math.cos(e.angle)>=0?1:-1;e.cleanTime=0;e.behavior='Visiting a cleaning station';}
   else{
    const busy=p.cleanTime>0||this.section.entities.some(b=>b!==e&&b.alive&&b.target===cleaner.id&&b.cleanTime>0);
    e.behavior=busy?'Waiting for a cleaner':'Being cleaned';if(!busy)e.cleanTime+=dt;
    if(e.cleanTime>=3){e.health=100;e.cleanTime=0;e.target=null;e.behavior='Leaving the cleaning station';e.angle+=Math.PI;e.think=2;}
   }
   return;
  }
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
     ...this.section.entities.filter(b=>b!==e&&b.alive&&edible(e,b)&&!b.species.poison),
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
    const wanted=Math.atan2(dest.y-e.y,dest.x-e.x),da=(wanted-e.angle+Math.PI*3)%(Math.PI*2)-Math.PI;e.angle+=clamp(da,-e.species.agility*dt,e.species.agility*dt);speed=e.species.speed*.55;
    if(distance(e,dest)<(e.species.size+(dest.species?.size||dest.size||0))*.28&&e.biteCooldown<=0){
     e.biteCooldown=2;
     if(dest===p&&canEatPlayer){p.health-=35;p.energy-=8;p.cooldown=Math.max(p.cooldown,1);this.event('hurt',e.species.name+' took a bite. Pause to learn about its diet.',{x:p.x,y:p.y});if(p.health<=0)this.die('You were eaten by a '+e.species.name+'.');}
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
    if(Math.hypot(x,y)>.01){const da=(Math.atan2(y,x)-e.angle+Math.PI*3)%(Math.PI*2)-Math.PI;e.angle+=clamp(da,-e.species.agility*dt,e.species.agility*dt);}
    e.behavior='Swimming with a school';
   }else if(e.behavior==='Swimming with a school')e.behavior='Exploring';
  }
  e.x+=Math.cos(e.angle)*speed*dt;e.y+=Math.sin(e.angle)*speed*dt;e.facing=Math.cos(e.angle)>=0?1:-1;
  if(e.x<10||e.x>W-10){e.x=clamp(e.x,10,W-10);e.angle=Math.PI-e.angle;}if(e.y<25||e.y>H-20){e.y=clamp(e.y,25,H-20);e.angle=-e.angle;}
 }
 next(){if(this.phase==='advance'){this.stage++;this.stageScore=0;this.spawnPlayer(BY_ID[this.sequence[this.stage]]);}}
 die(reason){if(this.phase!=='playing')return;this.phase='dead';this.event('death',reason);}
 continueRun(){this.score=0;this.stageScore=0;this.spawnPlayer(this.player.species);}
 serialize(){return JSON.stringify({version:1,seed:this.seed,time:this.time,uid:this.uid,mode:this.mode,phase:this.phase,score:this.score,stage:this.stage,stageScore:this.stageScore,sequence:this.sequence,sections:this.sections,player:this.player,protected:this.protected,period:this.period,current:this.current,pointer:this.pointer,custom:this.custom,visited:this.visited,difficulty:this.difficulty,observations:this.observations});}
 static restore(raw){
  const d=typeof raw==='string'?JSON.parse(raw):raw;
  if(d.version!==1||!Array.isArray(d.sections)||d.sections.length!==9||!d.player?.species||!Number.isInteger(d.current)||d.current<0||d.current>8||!['practice','challenge','tournament','create'].includes(d.mode))throw new Error('This save is not a compatible Atoll game.');
  for(const k of ['x','y','energy','health'])if(!Number.isFinite(d.player[k]))throw new Error('The saved fish is damaged.');
  const sim=new Simulation();Object.assign(sim,d);sim.events=[];sim.paused=true;return sim;
 }
}
