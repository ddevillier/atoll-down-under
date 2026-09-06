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
 constructor(seed=123456){this.seed=seed>>>0;this.time=0;this.uid=0;this.events=[];this.mode='practice';this.phase='idle';this.score=0;this.stage=0;this.stageScore=0;this.sequence=[];this.sections=[];this.player=null;this.protected=true;this.paused=false;this.period='day';this.current=4;this.pointer={x:800,y:330};this.difficulty=1;this.visited=[];}
 random(){this.seed=(Math.imul(1664525,this.seed)+1013904223)>>>0;return this.seed/4294967296;}
 event(type,text,extra={}){this.events.push({type,text,...extra});}
 start(mode='practice',speciesId='s1',custom=null){
  this.mode=mode;this.phase='playing';this.time=0;this.score=0;this.stage=0;this.stageScore=0;this.events=[];this.custom=custom;this.visited=[];
  if(mode==='tournament')this.sequence=[...PLAYABLE.filter(s=>s.id!=='s34').map(s=>s.id),'s34'];
  else if(mode==='challenge'){const bands=[PLAYABLE.slice(0,14),PLAYABLE.slice(14,28),PLAYABLE.slice(28,42),PLAYABLE.slice(42)];this.sequence=bands.map(a=>a[Math.floor(this.random()*a.length)].id);}
  else this.sequence=[speciesId];
  this.spawnPlayer(mode==='create'?createSpecies(custom):BY_ID[this.sequence[0]]);
  this.event('start','Welcome to '+REEFS[this.current].name+'. Move to begin.');
 }
 spawnPlayer(species){
  this.player=entity(species,'player',800,300);this.period=species.active==='night'?'night':'day';this.current=species.habitat==='sand'?7:species.habitat==='open'||species.habitat==='school'?1:4;
  this.pointer={x:800,y:300};this.protected=true;this.paused=false;this.sections=REEFS.map(r=>this.populate(r));this.visited.push(this.current);this.phase='playing';
 }
 populate(reef){
  const available=SPECIES.filter(s=>s.active===this.period||s.active==='both');
  const entities=[];
  for(let i=0;i<15;i++){
   let pool=available.filter(s=>s.habitat===reef.habitat&&s.ability!=='clean');if(i%3===0)pool=available.filter(s=>s.playable&&s.size<130);
   const s=pool[Math.floor(this.random()*pool.length)]||SPECIES[1];const fish=entity(s,++this.uid,70+this.random()*(W-140),80+this.random()*(H-170));fish.angle=this.random()*Math.PI*2;fish.facing=fish.angle>Math.PI?1:-1;entities.push(fish);
  }
  // Each section includes small prey and one substantial predator, so the food web is viable at every player size.
  for(const s of [SPECIES[2],SPECIES[2],SPECIES[11],SPECIES[16],SPECIES[this.period==='day'?32:33]])entities.push(entity(s,++this.uid,100+this.random()*(W-200),100+this.random()*(H-220)));
  const clean=entity(SPECIES[this.period==='day'?43:45],++this.uid,reef.cleaner.x,reef.cleaner.y);clean.station={...reef.cleaner};entities.push(clean);
  const food=[];let n=0;
  for(const [kind,def]of Object.entries(FOODS))for(let k=0;k<(kind==='plankton'?6:3);k++){
   food.push({id:'f'+(++this.uid),kind:'food',food:kind,name:def.name,x:90+((n++*181+reef.id*83)%1400),y:kind==='plankton'?90+this.random()*310:470+this.random()*205,size:def.size,amount:100,regrow:0,phase:this.random()*6});
  }
  for(const i of [46,47,61,62,60,63])if(SPECIES[i].active!=='night'||this.period==='night')entities.push(entity(SPECIES[i],++this.uid,100+this.random()*1400,565+this.random()*140));
  return {entities,food};
 }
 get section(){return this.sections[this.current];}
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
  if(poison){p.health-=25;p.energy-=10;this.score=Math.max(0,this.score-500);this.event('poison',name+' was poisonous. Find a cleaner.');}
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
   this.protected=false;const wanted=Math.atan2(dy,dx);let da=(wanted-p.angle+Math.PI*3)%(Math.PI*2)-Math.PI;p.angle+=clamp(da,-p.species.agility*dt,p.species.agility*dt);
   const speed=p.species.speed*(p.species.ability==='dash'&&p.abilityTime>0?1.9:1);const advance=Math.min(speed*dt,dist);p.x+=Math.cos(p.angle)*advance;p.y+=Math.sin(p.angle)*advance;p.facing=Math.cos(p.angle)>=0?1:-1;p.still=0;
  }else p.still+=dt;
  const moving=distance(old,p)>dt*6;
  const shelter=REEFS[this.current].shelters.find(s=>distance(p,s)<s.r&&p.species.size<125);
  const wasHidden=p.hidden;p.hidden=!!((shelter&&p.still>.7)||(p.species.ability==='camouflage'&&p.abilityTime>0&&!moving));
  if(p.hidden&&!wasHidden)this.event('hide','Hidden. Remain still to stay concealed.');
  if(!p.hidden&&wasHidden)this.event('reveal','Back in open water.');
  if(target&&distance(p,target)<p.species.size*.38+(target.species?.size||target.size)*.25+12)this.consume(target);
  if(!this.protected){p.energy-=dt*p.species.metabolism*(moving?1.55:.7)*this.difficulty;if(p.species.parasites)p.health-=dt*.105*this.difficulty;if(!p.hidden&&this.mode!=='practice'){this.score+=dt*8;this.stageScore+=dt*8;}}
  const cleaner=this.section.entities.find(e=>e.alive&&e.species.ability==='clean'&&distance(e,p)<105);
  if(cleaner&&p.still>.6&&!p.target&&p.health<99){p.cleanTime+=dt;cleaner.behavior='Cleaning';if(p.cleanTime>=2){p.health=100;p.cleanTime=0;this.event('clean','Parasites removed. Thank you, '+cleaner.species.name+'.');}}else p.cleanTime=0;
  if(p.x>W-8&&this.pointer.x>W-10)this.transition(1,0);else if(p.x<8&&this.pointer.x<10)this.transition(-1,0);else if(p.y>H-8&&this.pointer.y>H-10){if(!this.transition(0,1))p.y=H-8;}else if(p.y<8&&this.pointer.y<10){if(!this.transition(0,-1))p.y=8;}
  p.x=clamp(p.x,1,W-1);p.y=clamp(p.y,1,H-1);
  for(const f of this.section.food)f.regrow=Math.max(0,f.regrow-dt);
  for(const e of [...this.section.entities])this.stepNpc(e,dt);
  if(p.energy<=0)this.die('Your energy ran out. Short trips between good meals help you survive.');else if(p.health<=0)this.die('Your health failed. Visit a cleaner before parasites take over.');
  if(this.phase==='playing'&&['challenge','tournament'].includes(this.mode)&&this.stageScore>=this.required){this.score+=1500;this.phase=this.stage>=this.sequence.length-1?'won':'advance';this.event(this.phase,this.phase==='won'?'You have mastered this stretch of reef.':'A new life on the reef awaits.');}
 }
 stepNpc(e,dt){
  if(!e.alive){e.respawn-=dt;if(e.respawn<=0){e.alive=true;e.life=100;e.x=60+this.random()*(W-120);e.y=80+this.random()*(H-180);e.target=null;}return;}
  e.stun=Math.max(0,e.stun-dt);e.biteCooldown=Math.max(0,e.biteCooldown-dt);if(e.stun>0)return;
  const p=this.player;e.think-=dt;
  if(e.species.ability==='clean'){const dest=p.cleanTime>0?{x:p.x-p.facing*20,y:p.y+10}:e.station;if(dest){e.x+=(dest.x-e.x)*dt*1.5;e.y+=(dest.y-e.y)*dt*1.5;}e.facing=Math.sin(this.time*.5)>0?1:-1;return;}
  if(e.species.speed===0)return;
  let speed=e.species.speed*.35;
  if(e.think<=0){
   e.think=.35+this.random()*.35;
   const pd=distance(e,p),defended=p.abilityTime>0&&['spines','puff','poison','ink','shock','sting'].includes(p.species.ability);
   if(!p.hidden&&!this.protected&&edible(e,p)&&pd<330&&!defended){e.target='player';e.behavior='Hunting '+p.species.name;}
   else if((edible(p,e)&&pd<185&&!p.hidden)||defended&&pd<220){e.target=null;e.angle=Math.atan2(e.y-p.y,e.x-p.x);e.behavior='Fleeing';}
   else{
    const near=this.section.entities.find(b=>b!==e&&b.alive&&edible(e,b)&&distance(e,b)<140);
    e.target=near?.id||null;e.behavior=near?'Hunting '+near.species.name:'Cruising';if(!near&&this.random()<.25)e.angle+=(this.random()-.5)*1.8;
   }
   if(p.species.ability==='lure'&&p.abilityTime>0&&edible(p,e)&&pd<340){e.target='player';e.behavior='Following lure';}
  }
  if(e.target){const dest=e.target==='player'?p:this.section.entities.find(b=>b.id===e.target&&b.alive);if(dest){e.angle=Math.atan2(dest.y-e.y,dest.x-e.x);speed=e.species.speed*(e.target==='player'?.72:.65);if(distance(e,dest)<(e.species.size+(dest.species?.size||0))*.28&&e.biteCooldown<=0){e.biteCooldown=2;if(dest===p&&!p.hidden&&!this.protected&&edible(e,p)&&!(p.abilityTime>0&&['spines','puff','ink','poison','shock','sting'].includes(p.species.ability))){p.health-=35;p.energy-=8;p.cooldown=Math.max(p.cooldown,1);e.stun=1;this.event('hurt',e.species.name+' bit you. Find shelter!',{x:p.x,y:p.y});if(p.health<=0)this.die('You were eaten by a '+e.species.name+'.');}else if(dest!==p){dest.alive=false;dest.respawn=24;e.target=null;}}}else e.target=null;}
  else if(e.behavior==='Fleeing')speed=e.species.speed*.85;
  e.x+=Math.cos(e.angle)*speed*dt;e.y+=Math.sin(e.angle)*speed*dt;e.facing=Math.cos(e.angle)>=0?1:-1;
  if(e.x<10||e.x>W-10){e.x=clamp(e.x,10,W-10);e.angle=Math.PI-e.angle;}if(e.y<25||e.y>H-20){e.y=clamp(e.y,25,H-20);e.angle=-e.angle;}
 }
 next(){if(this.phase==='advance'){this.stage++;this.stageScore=0;this.spawnPlayer(BY_ID[this.sequence[this.stage]]);}}
 die(reason){if(this.phase!=='playing')return;this.phase='dead';this.event('death',reason);}
 continueRun(){this.score=0;this.stageScore=0;this.spawnPlayer(this.player.species);}
 serialize(){return JSON.stringify({version:1,seed:this.seed,time:this.time,uid:this.uid,mode:this.mode,phase:this.phase,score:this.score,stage:this.stage,stageScore:this.stageScore,sequence:this.sequence,sections:this.sections,player:this.player,protected:this.protected,period:this.period,current:this.current,pointer:this.pointer,custom:this.custom,visited:this.visited,difficulty:this.difficulty});}
 static restore(raw){
  const d=typeof raw==='string'?JSON.parse(raw):raw;
  if(d.version!==1||!Array.isArray(d.sections)||d.sections.length!==9||!d.player?.species||!Number.isInteger(d.current)||d.current<0||d.current>8||!['practice','challenge','tournament','create'].includes(d.mode))throw new Error('This save is not a compatible Atoll game.');
  for(const k of ['x','y','energy','health'])if(!Number.isFinite(d.player[k]))throw new Error('The saved fish is damaged.');
  const sim=new Simulation();Object.assign(sim,d);sim.events=[];sim.paused=true;return sim;
 }
}
