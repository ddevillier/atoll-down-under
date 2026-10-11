import {REEFS} from './data.js';
import {mouthPoint} from './feeding-contact.js';
import {WORLD_WIDTH,WORLD_HEIGHT} from './world-dimensions.js';

// Gramma loreto males line crevices with algae and remove silt. Nest construction
// here is an optional adult role; it neither creates eggs nor simulates courtship.
// https://doi.org/10.2307/1446936
// The two ledges and short contact intervals are authored game interpretation.
export const NEST_REEF=4;
export const NEST_LEDGES=Object.freeze(REEFS[NEST_REEF].shelters.slice(0,2).map((cover,index)=>Object.freeze({
 id:'gramma-ledge-'+index,index,x:cover.x,y:cover.y,width:170,roofY:cover.y-38,openingY:cover.y+12,
 sockets:Object.freeze({left:Object.freeze({x:cover.x-43,y:cover.y+4}),right:Object.freeze({x:cover.x+43,y:cover.y+4})}),
 clear:Object.freeze({x:cover.x,y:cover.y+18}),inspect:Object.freeze({x:cover.x,y:cover.y+35})
})));
export const NEST_MATERIAL_ID='gramma-algae';
const SOURCE=Object.freeze({x:NEST_LEDGES[0].x-150,y:NEST_LEDGES[0].y+110});
const jobs=new WeakMap();
const state=sim=>sim?.reefStories?.nest;
const active=sim=>['nest','gramma-nest'].includes(sim?.reefStories?.active)&&sim.player?.species?.id==='s3';
const live=sim=>active(sim)&&!sim.paused&&(!sim.phase||sim.phase==='playing')&&!(sim.player.stun>0)&&!(sim.player.health<=0)&&!(sim.player.energy<=0);
const onReef=sim=>sim.current===NEST_REEF;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const emit=(sim,text,type='message',extra={})=>sim.event?.(type,text,extra);
const ledge=s=>NEST_LEDGES[s?.ledge];
const bounded=(n,min,max)=>Number.isFinite(n)&&n>=min&&n<=max;
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

export function initStory(sim){
 if(sim.player?.species?.id!=='s3')return false;
 sim.reefStories??={version:1,active:null};
 sim.reefStories.nest??={version:1,reef:NEST_REEF,stage:'role',role:null,ledge:null,side:null,
  material:{id:NEST_MATERIAL_ID,...SOURCE,carried:false,placed:false},cleared:false,inspected:false,completed:false};
 if(!onReef(sim))sim.setDestination?.(NEST_REEF);
 return state(sim);
}

// This pose is authoritative interaction geometry, not decorative render motion.
// The renderer must use this exact rotation/facing without yaw, bank or offsets.
// An upright mouth handles loose algae; a belly-up mouth handles the roof opening.
export function nestPhysicalPose(sim,e=sim?.player){
 const s=state(sim);if(e!==sim?.player||!active(sim)||!s||!onReef(sim))return null;
 const job=jobs.get(sim);
 if(job)return {rotation:job.rotation,facing:job.facing};
 if(s.material.carried)return {rotation:0,facing:e.facing||1};
 if(s.role==='nesting-male'&&!e.target&&!e.cleanerTarget&&!(e.cleanTime>0)&&!(e.stun>0)){
  const roof=ledge(s)||NEST_LEDGES.find(l=>Math.abs(e.x-l.x)<l.width*.5&&e.y>l.roofY+8&&e.y<l.openingY+58);
  if(roof&&Math.abs(e.x-roof.x)<roof.width*.5&&e.y>roof.roofY+8&&e.y<roof.openingY+58)return {rotation:Math.PI,facing:e.facing||1};
 }
 return null;
}
export function nestMouth(sim){const pose=nestPhysicalPose(sim);return sim?.player?mouthPoint(sim.player,pose||{}):null;}

// A pure scene projection is available after the story is stopped, so the
// selected lining and cleared entrance remain part of free exploration.
export function nestScene(sim){
 const s=state(sim);if(!s||!onReef(sim))return null;
 const job=jobs.get(sim),mouth=nestMouth(sim);
 return {ledges:NEST_LEDGES,selected:ledge(s)||null,state:s,
  material:{...s.material,...(s.material.carried&&active(sim)?mouth:{}),available:!s.material.carried&&!s.material.placed},
  pose:nestPhysicalPose(sim),job:job?{kind:job.kind,contact:job.elapsed,target:{...job.target},mouth}:null};
}

function cancel(sim){
 const had=jobs.delete(sim);if(had){sim.player.vx=0;sim.player.vy=0;sim.player.activity='cruising';}
 return had;
}
// Cursor movement always restores normal steering. A held lining is never
// silently consumed or lost when an assisted approach is interrupted.
export function storyPointer(sim){if(active(sim))cancel(sim);return false;}
export function stopStory(sim){
 const s=state(sim);cancel(sim);if(!s)return false;
 if(s.material.carried){
  const p=onReef(sim)?mouthPoint(sim.player,nestPhysicalPose(sim)||{}):s.material;
  s.material.x=clamp(p.x,30,WORLD_WIDTH-30);s.material.y=clamp(p.y,30,WORLD_HEIGHT-30);
  s.material.carried=false;s.stage='gather';
 }
 return true;
}

function plan(sim,target,rotation){
 const p=sim.player,worldSide=Math.sign(target.x-p.x)||Math.sign(Math.cos(p.angle||0))||1;
 const facing=rotation===Math.PI?-worldSide:worldSide;
 const mouth=mouthPoint(p,{rotation,facing});
 return {x:target.x-(mouth.x-p.x),y:target.y-(mouth.y-p.y),facing};
}
function begin(sim,kind,target,rotation=0,extra={}){
 const p=sim.player,dock=plan(sim,target,rotation);
 // A remote click only travels. A second deliberate action near the target
 // starts work, and every beat still waits for actual mouth contact.
 if(distance(p,target)>115){cancel(sim);sim.point?.(dock.x,dock.y);emit(sim,'Swim close to '+(kind==='pickup'?'the loose lining':'the ledge opening')+', then inspect it again.');return true;}
 cancel(sim);sim.point?.(p.x,p.y);p.target=null;p.feeding=null;p.cleanerTarget=null;p.cleanTime=0;
 jobs.set(sim,{kind,target:{...target},rotation,facing:dock.facing,elapsed:0,...extra});
 return true;
}

export function storyAction(sim,action,value){
 if(!live(sim))return false;const s=initStory(sim);
 if(action==='nest-role'&&s.stage==='role'){s.role='nesting-male';s.stage='choose';emit(sim,'Optional nesting-male role · Choose a sheltered opening to construct a nest.');return true;}
 if(action==='nest-cancel'){cancel(sim);sim.pointer={x:sim.player.x,y:sim.player.y};return true;}
 if(!onReef(sim)){if(action==='context'||action.startsWith('nest-')){sim.setDestination?.(NEST_REEF);return true;}return false;}
 if(action==='context'){
  if(s.stage==='role')return storyAction(sim,'nest-role');
  if(s.stage==='choose'){const l=NEST_LEDGES.slice().sort((a,b)=>distance(a,sim.pointer||sim.player)-distance(b,sim.pointer||sim.player))[0];return storyAction(sim,'nest-choose',l.index);}
  if(s.stage==='gather')return storyAction(sim,'nest-pickup');
  if(s.stage==='carry'){const l=ledge(s);return storyAction(sim,'nest-place',(sim.pointer?.x??sim.player.x)<l.x?'left':'right');}
  if(s.stage==='clear')return storyAction(sim,'nest-clear');
  if(s.stage==='inspect')return storyAction(sim,'nest-inspect');
  return false;
 }
 if(action==='nest-choose'&&s.stage==='choose'){
  const l=NEST_LEDGES.find(l=>l.index===Number(value)||l.id===value);return l?begin(sim,'choose',l.inspect,Math.PI,{ledge:l.index}):false;
 }
 if(action==='nest-pickup'&&s.stage==='gather'&&!s.material.carried&&!s.material.placed)return begin(sim,'pickup',s.material);
 if(action==='nest-place'&&s.stage==='carry'&&['left','right'].includes(value))return begin(sim,'place',ledge(s).sockets[value],Math.PI,{side:value});
 if(action==='nest-clear'&&s.stage==='clear')return begin(sim,'clear',ledge(s).clear,Math.PI);
 if(action==='nest-inspect'&&s.stage==='inspect')return begin(sim,'inspect',ledge(s).inspect,Math.PI);
 return false;
}

export function storyClick(sim,x,y){
 if(!live(sim)||!onReef(sim))return false;
 const s=state(sim);if(!s||s.stage==='role')return false;const point={x,y};
 if(s.stage==='choose'){
  const l=NEST_LEDGES.find(l=>Math.abs(x-l.x)<l.width*.6&&y>l.roofY-20&&y<l.openingY+60);
  if(l)return storyAction(sim,'nest-choose',l.index);
 }
 if(s.stage==='gather'&&distance(point,s.material)<30)return storyAction(sim,'nest-pickup');
 const l=ledge(s);if(!l)return false;
 if(s.stage==='carry'){const side=['left','right'].find(side=>distance(point,l.sockets[side])<30);if(side)return storyAction(sim,'nest-place',side);}
 if(s.stage==='clear'&&distance(point,l.clear)<32)return storyAction(sim,'nest-clear');
 if(s.stage==='inspect'&&distance(point,l.inspect)<40)return storyAction(sim,'nest-inspect');
 cancel(sim);return false;
}

// Own movement only while a deliberate, nearby interaction is running.
export function storyPlayer(sim,dt){
 const job=jobs.get(sim);if(!job)return false;
 if(!live(sim)||!onReef(sim)||!Number.isFinite(dt)||dt<=0){if(!sim.paused&&!onReef(sim))cancel(sim);return false;}
 dt=Math.min(dt,.05);const p=sim.player,mouth=mouthPoint(p,{rotation:job.rotation,facing:job.facing});
 const dx=job.target.x-mouth.x,dy=job.target.y-mouth.y,d=Math.hypot(dx,dy),travel=Math.min(d,p.species.speed*.65*dt),scale=d?travel/d:0;
 p.x+=dx*scale;p.y+=dy*scale;p.facing=job.facing;p.angle=job.facing>0?0:Math.PI;
 p.vx=dx*scale/dt;p.vy=dy*scale/dt;p.target=null;p.feeding=null;p.hidden=false;p.activity=job.kind==='pickup'?'nest-carrying':job.kind==='release'?'nest-clearing':'nest-tending';
 sim.pointer={x:p.x,y:p.y};return true;
}

export function tickStory(sim,dt){
 const s=state(sim),job=jobs.get(sim);
 if(!s||!job||!live(sim)||!onReef(sim)||!Number.isFinite(dt)||dt<=0)return;
 const mouth=mouthPoint(sim.player,{rotation:job.rotation,facing:job.facing});
 const ready=distance(mouth,job.target)<=3&&Math.hypot(sim.player.vx||0,sim.player.vy||0)<12;
 job.elapsed=ready?Math.min(1.2,job.elapsed+Math.min(dt,.05)):0;
 const duration=job.kind==='clear'?1.1:job.kind==='inspect'?.8:.35;
 if(job.elapsed<duration)return;
 if(job.kind==='choose'){s.ledge=job.ledge;s.stage='gather';emit(sim,'Sheltered opening chosen · Pick up the loose algae lining. It is building material.');}
 if(job.kind==='pickup'){s.material.carried=true;s.stage='carry';emit(sim,'One algae tuft held in your mouth · Choose the left or right entrance edge.');}
 if(job.kind==='place'){s.material.carried=false;s.material.placed=true;s.side=job.side;Object.assign(s.material,ledge(s).sockets[job.side]);s.stage='clear';emit(sim,'Lining placed on the '+job.side+' · Clear the silt from this entrance.');}
 if(job.kind==='clear'){
  const target={x:ledge(s).x+(s.side==='left'?85:-85),y:ledge(s).openingY+72},dock=plan(sim,target,0);
  jobs.set(sim,{kind:'release',target,rotation:0,facing:dock.facing,elapsed:0});
  emit(sim,'Silt lifted from the entrance · Carrying it clear of the opening.');return;
 }
 if(job.kind==='release'){s.cleared=true;s.stage='inspect';emit(sim,'Silt released away from the opening · Return and inspect the finished nest.','activity-step',{value:'gramma-nest-clear',x:mouth.x,y:mouth.y});}
 if(job.kind==='inspect'&&!s.completed){s.inspected=true;s.completed=true;s.stage='complete';emit(sim,'A cared-for corner · Algae lines your chosen entrance and the silt has been removed.','discovery',{value:'gramma-nest'});}
 cancel(sim);
}
export function storyMeal(){return false;}
export function storyNPC(){return false;}
export function safety(sim){
 // Protection is derived while paused as well, including a paused imported
 // dive. Stopping that dive can then release ownership before exit grace.
 const s=state(sim);if(!active(sim)||!onReef(sim)||sim.phase&&sim.phase!=='playing'||sim.player.alive===false||sim.player.health<=0||sim.player.energy<=0||!s||s.role!=='nesting-male'||s.completed)return null;
 const job=jobs.get(sim),center=job?.target||(s.stage==='gather'?s.material:ledge(s));
 if(!center||distance(sim.player,center)>135)return null;
 return {reef:NEST_REEF,x:center.x,y:center.y,radius:165,participants:[],holdNeeds:!!job};
}

export function storyView(sim){
 const s=state(sim);if(!s)return {step:'A little room under the roof',detail:'Begin this optional Royal gramma construction story.',actions:[],complete:false};
 if(s.completed)return {step:'A cared-for corner',detail:'Your '+s.side+' lining and clear entrance remain here while you explore. Nest construction has not produced eggs.',actions:[],complete:true};
 if(!onReef(sim))return {step:'Visit Coral Cathedral',detail:'The carried lining and completed nest work are saved while you explore.',actions:[{id:'story-route',label:'Show the route'}],complete:false};
 if(s.stage==='role')return {step:'Choose an optional adult role',detail:'For this story, take the role of a nesting male Royal gramma. Build one algae-lined opening and remove silt.',actions:[{id:'nest-role',label:'Take the nesting-male role'}],complete:false};
 const job=jobs.get(sim),actions=job?[{id:'nest-cancel',label:'Stop this approach'}]:[];
 const views={
  choose:['Choose a roof','Inspect either opening from its underside. Both ledges are usable.',NEST_LEDGES.map(l=>({id:'nest-choose',value:l.index,label:'Inspect ledge '+(l.index+1)}))],
  gather:['Collect the loose lining','Click the single loose algae tuft, or press E nearby. Your mouth must reach it; it provides no calories.',[{id:'nest-pickup',label:'Pick up the algae lining'}]],
  carry:['Choose an entrance edge','Carry the tuft back. Left and right are both valid and leave different visible arrangements.',[{id:'nest-place',value:'left',label:'Place on the left'},{id:'nest-place',value:'right',label:'Place on the right'}]],
  clear:['Remove entrance silt','Reach the entrance with your mouth, then carry the silt into the water away from the opening.',[{id:'nest-clear',label:'Clear the entrance'}]],
  inspect:['Inspect your finished nest','Return to the opening and inspect the lining and clear entrance through physical contact.',[{id:'nest-inspect',label:'Inspect the finished nest'}]]
 };
 const [step,detail,buttons]=views[s.stage];return {step:job?'Working · '+step:step,detail:detail+' Move the pointer to steer freely.',actions:[...buttons,...actions],complete:false};
}

const object=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
export function validStory(s){
 if(s==null)return true;
 const keys=['version','reef','stage','role','ledge','side','material','cleared','inspected','completed'];
 if(!object(s)||Object.keys(s).some(k=>!keys.includes(k))||s.version!==1||s.reef!==NEST_REEF||!['role','choose','gather','carry','clear','inspect','complete'].includes(s.stage)||![null,'nesting-male'].includes(s.role)||![null,0,1].includes(s.ledge)||![null,'left','right'].includes(s.side)||!['cleared','inspected','completed'].every(k=>typeof s[k]==='boolean'))return false;
 const m=s.material;
 if(!object(m)||Object.keys(m).some(k=>!['id','x','y','carried','placed'].includes(k))||m.id!==NEST_MATERIAL_ID||!bounded(m.x,30,WORLD_WIDTH-30)||!bounded(m.y,30,WORLD_HEIGHT-30)||typeof m.carried!=='boolean'||typeof m.placed!=='boolean'||m.carried&&m.placed)return false;
 if((s.stage==='role')!==(s.role===null)||(['role','choose'].includes(s.stage))!==(s.ledge===null)||(s.stage==='carry')!==m.carried||(['clear','inspect','complete'].includes(s.stage))!==m.placed||(m.placed)!==(s.side!==null))return false;
 if(s.cleared!==['inspect','complete'].includes(s.stage)||s.inspected!==(s.stage==='complete')||s.completed!==s.inspected)return false;
 if(m.placed){const socket=ledge(s).sockets[s.side];if(m.x!==socket.x||m.y!==socket.y)return false;}
 return true;
}
