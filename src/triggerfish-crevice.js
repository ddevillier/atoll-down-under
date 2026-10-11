import {creatureFrame,creatureWidth} from './geometry.js';
import {turnTowards} from './steering.js';

// B. conspicillum retracts and locks its dorsal spine in reef crevices.
// Three openings, clearance and timings below are authored game geometry.
export const CREVICE_REEF=4;
export const CREVICES=Object.freeze([
 Object.freeze({index:0,id:'cathedral-narrow',x:560,y:340,angle:-.16,gap:43,length:160,label:'Narrow opening'}),
 Object.freeze({index:1,id:'cathedral-fitted',x:1030,y:492,angle:.12,gap:68,length:160,label:'Body-sized opening'}),
 Object.freeze({index:2,id:'cathedral-wide',x:700,y:390,angle:-.08,gap:112,length:160,label:'Wide opening'})
]);
const STAGES=['choose','approach','entering','inside','locking','locked','releasing','exiting','complete'];
const HELD=['entering','inside','locking','locked','releasing','exiting'];
const FOLDED=['choose','approach','entering','inside','exiting','complete'];
const state=sim=>sim.reefStories?.crevice;
const active=sim=>['crevice','triggerfish-crevice'].includes(sim.reefStories?.active);
const eligible=sim=>active(sim)&&sim.player?.species?.id==='s24'&&sim.player.alive!==false;
const running=sim=>!sim.paused&&(!sim.phase||sim.phase==='playing');
const emit=(sim,text,type='message',extra={})=>sim.event?.(type,text,extra);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const actorFor=p=>({id:p.id??'player',incarnation:p.incarnation??0,species:'s24'});
const sameActor=(s,p)=>s.actor.id===(p.id??'player')&&s.actor.incarnation===(p.incarnation??0)&&p.species.id===s.actor.species;
const siteFor=s=>CREVICES[s?.crevice];
const local=(site,p)=>({x:(p.x-site.x)*Math.cos(site.angle)+(p.y-site.y)*Math.sin(site.angle),y:-(p.x-site.x)*Math.sin(site.angle)+(p.y-site.y)*Math.cos(site.angle)});
const world=(site,x,y)=>({x:site.x+x*Math.cos(site.angle)-y*Math.sin(site.angle),y:site.y+x*Math.sin(site.angle)+y*Math.cos(site.angle)});
export const crevicePosition=(site,depth)=>world(site,-55+130*depth,0);
const bodyFor=p=>{const frame=creatureFrame(p);return {width:creatureWidth(p.species),height:frame.height};};
const axisError=(p,site)=>Math.acos(clamp(Math.cos((p.angle||0)-site.angle),-1,1));
const clearance=(p,site)=>{const b=bodyFor(p),a=axisError(p,site);return Math.abs(Math.sin(a))*b.width+Math.abs(Math.cos(a))*b.height;};
const bodyFits=(p,site)=>{const height=bodyFor(p).height;return site.gap>=height+4&&site.gap<=height+15&&clearance(p,site)+4<=site.gap;};
function occupied(sim,site){
 return (sim.sections?.[CREVICE_REEF]?.entities||[]).some(e=>{
  if(e===sim.player||e.alive===false||!e.species)return false;
  const q=local(site,e),b=bodyFor(e);
  return q.x+b.width*.4>0&&q.x-b.width*.4<site.length&&Math.abs(q.y)<site.gap/2+b.height*.35;
 });
}
export function creviceOptions(sim){
 return CREVICES.map(site=>{
  const body=sim.player&&bodyFor(sim.player),width=body?.height??62;
  const tooNarrow=site.gap<width+4,tooWide=site.gap>width+15,busy=occupied(sim,site);
  return {...site,occupied:busy,fits:!tooNarrow&&!tooWide&&!busy,reason:busy?'Another fish is using this opening':tooNarrow?'Too narrow for your body':tooWide?'Too open to brace the spine':'Room for the body and an upper edge for the spine'};
 });
}
// This geometry is authoritative for both interaction and spine presentation.
export function crevicePose(sim){
 const s=state(sim),site=siteFor(s),p=sim.player;
 if(!eligible(sim)||!site||sim.current!==CREVICE_REEF||!HELD.includes(s.stage)||!validStory(s)||!sameActor(s,p)||!physicalStateMatches(sim,s))return null;
 // The corrected 355 × 219 painting places the first dorsal-spine hinge
 // at normalized [.697, .256]. Keep this pivot in the interaction pose.
 const b=bodyFor(p),root=world({...site,x:p.x,y:p.y},b.width*.197,-b.height*.244);
 const folded=world({...site,x:p.x,y:p.y},-5,-14.5);
 const contact=world({...site,x:p.x,y:p.y},b.width*.14,-site.gap/2);
 return {x:p.x,y:p.y,width:b.width,height:b.height,rotation:site.angle,facing:1,depth:s.depth,spine:s.spine,stage:s.stage,crevice:site.index,
  spineRoot:root,spineTip:{x:folded.x+(contact.x-folded.x)*s.spine,y:folded.y+(contact.y-folded.y)*s.spine},spineContact:contact,
  upperEdge:world(site,75+b.width*.14,-site.gap/2),lowerEdge:world(site,75,site.gap/2),occluded:s.depth>.42};
}
export function creviceFit(sim,index=state(sim)?.crevice,{inside=false}={}){
 const site=CREVICES[index],p=sim.player;
 if(!eligible(sim)||sim.current!==CREVICE_REEF||!site)return {fits:false,reason:'Visit Coral Cathedral as a clown triggerfish'};
 if(!Number.isFinite(p.x)||!Number.isFinite(p.y)||!Number.isFinite(p.angle??0))return {fits:false,reason:'Return to the entrance in a supported body pose'};
 const option=creviceOptions(sim)[index];
 // Admission checks the living occupants. After admission the player owns
 // this cavity until it releases; passing swimmers cannot revoke that pose.
 const owns=inside&&state(sim)?.crevice===index&&HELD.includes(state(sim)?.stage)&&validStory(state(sim))&&sameActor(state(sim),p)&&physicalStateMatches(sim,state(sim));
 if(!option.fits&&!owns)return {fits:false,reason:option.reason};
 const q=local(site,p),body=bodyFor(p);
 if(axisError(p,site)>.055)return {fits:false,reason:'Align your body with the opening before entering'};
 if(clearance(p,site)+4>site.gap||Math.abs(q.y)>(site.gap-clearance(p,site))/2-1)return {fits:false,reason:'Your body needs more clearance between the rock edges'};
 if(inside?(q.x<body.width/2+3||q.x>site.length-body.width/2-3):(Math.hypot(q.x+55,q.y)>1.5))return {fits:false,reason:inside?'Ease fully inside before raising the spine':'Swim to the entrance before easing inside'};
 return {fits:true,reason:option.reason,clearance:site.gap-clearance(p,site)};
}
function clearPose(sim){if(sim.player){sim.player.triggerfishSpine=0;sim.player.crevicePose=null;}}
function publish(sim){const pose=crevicePose(sim);if(sim.player){sim.player.triggerfishSpine=pose?.spine||0;sim.player.crevicePose=pose;}}
function reset(sim,s){
 s.stage=s.completed?'complete':'choose';s.crevice=s.completed?s.crevice:null;s.depth=0;s.spine=0;
 if(!s.completed){s.entered=false;s.lockedOnce=false;}
 clearPose(sim);const p=sim.player;if(p){p.hidden=false;p.target=null;p.vx=0;p.vy=0;sim.pointer={x:p.x,y:p.y};}
 if(p?.species?.id==='s24')s.actor=actorFor(p);
}
function physicalStateMatches(sim,s){
 if(!HELD.includes(s.stage))return true;
 const site=siteFor(s),p=sim.player,expected=site&&crevicePosition(site,s.depth);
 const tolerance=s.stage==='entering'?2:.001;
 const angleTolerance=s.stage==='entering'?.055:1e-6;
 if(!expected||!Number.isFinite(p.x)||!Number.isFinite(p.y)||!Number.isFinite(p.angle)||Math.hypot(p.x-expected.x,p.y-expected.y)>tolerance||axisError(p,site)>angleTolerance)return false;
 return bodyFits(p,site);
}
// Restore validation must inspect the saved actor and physical pose before
// initStory can safely release a contradiction. This hook never edits a save.
export function validStoryPlayer(sim){
 const s=state(sim);if(s==null)return true;
 if(!validStory(s))return false;
 if(!active(sim))return true;
 const p=sim.player;
 return !!(p?.species?.id==='s24'&&p.alive!==false&&sameActor(s,p)&&
  (sim.current!==CREVICE_REEF||physicalStateMatches(sim,s)));
}
function revalidate(sim){
 const s=state(sim);if(!s)return false;
 if(!validStory(s)||!sim.player||!sameActor(s,sim.player)||!eligible(sim)){reset(sim,s);return false;}
 if(sim.current===CREVICE_REEF&&!physicalStateMatches(sim,s)){reset(sim,s);emit(sim,'The crevice is no longer clear. The spine is released; you can swim freely.');return false;}
 return true;
}
export function initStory(sim){
 if(sim.player?.species?.id!=='s24')return false;
 sim.reefStories??={version:1,active:'crevice'};
 if(!state(sim))sim.reefStories.crevice={version:1,reef:CREVICE_REEF,actor:actorFor(sim.player),stage:'choose',crevice:null,depth:0,spine:0,entered:false,lockedOnce:false,completed:false};
 revalidate(sim);publish(sim);
 if(sim.current!==CREVICE_REEF)sim.setDestination?.(CREVICE_REEF);
 return true;
}
function select(sim,s,index){
 const site=CREVICES[Number(index)];if(!site){emit(sim,'Choose one of the three outlined openings.');return true;}
 if(sim.current!==CREVICE_REEF){sim.setDestination?.(CREVICE_REEF);emit(sim,'Compare the crevices in Coral Cathedral.');return true;}
 if(HELD.includes(s.stage)){emit(sim,'Release and back out before choosing another opening.');return true;}
 if(s.completed)return true;
 const option=creviceOptions(sim)[site.index];
 emit(sim,site.label+' · '+option.reason+'.');
 if(!option.fits)return true;
 s.crevice=site.index;s.stage='approach';s.depth=0;s.spine=0;s.entered=false;s.lockedOnce=false;
 const dest=crevicePosition(site,0);sim.player.target=null;sim.pointer={...dest};return true;
}
export function storyAction(sim,action,value){
 const s=state(sim);if(!s||!eligible(sim))return false;
 if(['crevice-cancel','cancel'].includes(action)){stopStory(sim);return true;}
 if(!running(sim))return false;
 if(!revalidate(sim))return true;
 if(action==='crevice-choose'||action==='crevice-inspect')return select(sim,s,value??1);
 if(action==='context')action=({choose:'crevice-choose',approach:'crevice-enter',inside:'crevice-lock',locked:'crevice-release'})[s.stage]||'';
 if(action==='crevice-choose')return select(sim,s,value??1);
 if(action==='crevice-enter'&&s.stage==='approach'){
  const fit=creviceFit(sim);if(!fit.fits){emit(sim,fit.reason+'.');return true;}
  s.stage='entering';sim.player.target=null;publish(sim);emit(sim,'Ease between the rock edges. The dorsal spine stays folded.');return true;
 }
 if(action==='crevice-lock'&&s.stage==='inside'){
  const fit=creviceFit(sim,s.crevice,{inside:true});if(!fit.fits){emit(sim,fit.reason+'.');return true;}
  s.stage='locking';publish(sim);emit(sim,'Raise the first dorsal spine against the upper edge; the smaller spine holds it.');return true;
 }
 if(action==='crevice-release'&&['locking','locked','inside'].includes(s.stage)){
  if(!s.lockedOnce){reset(sim,s);emit(sim,'Spine folded. You can swim out freely and try another opening.');return true;}
  s.stage='releasing';publish(sim);emit(sim,'Retract the spine, then back out through the same opening.');return true;
 }
 return false;
}
function move(sim,dest,dt,speed){
 const p=sim.player,dx=dest.x-p.x,dy=dest.y-p.y,d=Math.hypot(dx,dy),amount=Math.min(d,speed*dt);
 const old={x:p.x,y:p.y};if(d){p.x+=dx/d*amount;p.y+=dy/d*amount;}
 p.vx=(p.x-old.x)/dt;p.vy=(p.y-old.y)/dt;
}
export function storyPlayer(sim,dt){
 const s=state(sim);if(!s)return false;
 if(!eligible(sim)){reset(sim,s);return false;}
 if(sim.current!==CREVICE_REEF){clearPose(sim);return false;}
 if(!running(sim)||!Number.isFinite(dt)||dt<=0)return HELD.includes(s.stage)||s.stage==='approach';
 if(!revalidate(sim))return false;
 dt=Math.min(dt,.05);const p=sim.player,site=siteFor(s);
 if(s.stage==='approach'){
  const dest=crevicePosition(site,0),distance=Math.hypot(p.x-dest.x,p.y-dest.y);
  const desired=distance>12?Math.atan2(dest.y-p.y,dest.x-p.x):site.angle;
  p.angle=turnTowards(p.angle||0,desired,(p.species.agility||2)*dt);p.facing=Math.cos(p.angle)>=0?1:-1;
  if(distance>.001&&Math.cos(p.angle-desired)>.9)move(sim,dest,dt,Math.min(p.species.speed||50,48));else{p.vx=0;p.vy=0;}
  return true;
 }
 if(!HELD.includes(s.stage))return false;
 p.angle=site.angle;p.facing=1;p.target=null;p.vx=0;p.vy=0;
 if(s.stage==='entering'){
  // Two pixels/second of catch-up absorb the entrance's 1.5px tolerance
  // through actual movement before the body reaches its fixed roof contact.
  s.depth=Math.min(1,s.depth+dt*30/130);move(sim,crevicePosition(site,s.depth),dt,32);
  if(s.depth===1){s.stage='inside';s.entered=true;emit(sim,'Body inside · The upper edge is within reach. Raise the dorsal spine when ready.');}
 }else if(s.stage==='locking'){
  s.spine=Math.min(1,s.spine+dt/ .65);
  if(s.spine===1){s.stage='locked';s.lockedOnce=true;emit(sim,'Spine braced against the upper rock edge. Release it to leave.');}
 }else if(s.stage==='releasing'){
  s.spine=Math.max(0,s.spine-dt/.5);if(s.spine===0)s.stage='exiting';
 }else if(s.stage==='exiting'){
  s.depth=Math.max(0,s.depth-dt*34/130);move(sim,crevicePosition(site,s.depth),dt,34);
  if(s.depth===0){s.stage='complete';s.completed=true;clearPose(sim);sim.pointer={x:p.x,y:p.y};emit(sim,'The Just-Right Crevice · You fitted the body, locked the spine, released it and backed out.','discovery',{value:'triggerfish-crevice'});}
 }
 publish(sim);return true;
}
export function tickStory(sim){
 const s=state(sim);if(!s)return;
 if(!eligible(sim)){reset(sim,s);return;}
 if(!running(sim)){publish(sim);return;}
 if(sim.current===CREVICE_REEF)revalidate(sim);
 publish(sim);
}
export function stopStory(sim){const s=state(sim);if(!s)return false;reset(sim,s);return true;}
export function storyPointer(sim){
 const s=state(sim);if(!eligible(sim)||!s||!['approach',...HELD].includes(s.stage))return false;
 reset(sim,s);emit(sim,'Spine released. Follow your pointer to swim freely.');return false;
}
export function storyClick(sim,x,y){
 if(!eligible(sim)||sim.current!==CREVICE_REEF)return false;
 const site=CREVICES.find(c=>Math.hypot(x-c.x,y-c.y)<Math.max(32,c.gap*.55));
 return !!site&&storyAction(sim,'crevice-choose',site.index);
}
export function storySafety(sim){
 const s=state(sim),site=siteFor(s);
 if(!eligible(sim)||sim.current!==CREVICE_REEF||!HELD.includes(s?.stage)||!site||!validStory(s)||!sameActor(s,sim.player)||!physicalStateMatches(sim,s))return null;
 return {reef:CREVICE_REEF,x:site.x,y:site.y,radius:180,participants:[],holdNeeds:true};
}
export const safety=storySafety;
export function storyMeal(){return false;}
export function storyNPC(sim,e,dt){
 const s=state(sim),site=siteFor(s);
 if(!running(sim)||!(dt>0)||!Number.isFinite(dt)||!storySafety(sim)||!site||e===sim.player||!e?.alive||!e.species||!Number.isFinite(e.x)||!Number.isFinite(e.y)||!Number.isFinite(e.angle)||e.groundRoute||e.holdfast||e.species.ability==='clean'||!(e.species.speed>0)||e.stun>0)return false;
 // Ordinary swimmers keep their own targets and needs. Only their motion at
 // the occupied rock footprint is guided around its outside edge.
 const q=local(site,e),b=bodyFor(e),a=axisError(e,site);
 const extentX=(Math.abs(Math.cos(a))*b.width+Math.abs(Math.sin(a))*b.height)/2+8;
 const extentY=(Math.abs(Math.sin(a))*b.width+Math.abs(Math.cos(a))*b.height)/2+8;
 const bounds={left:-extentX,right:site.length+extentX,top:-site.gap/2-extentY,bottom:site.gap/2+extentY};
 const edges=p=>[p.x-bounds.left,bounds.right-p.x,p.y-bounds.top,bounds.bottom-p.y];
 const signed=p=>-Math.min(...edges(p));
 const distances=edges(q),nearest=distances.indexOf(Math.min(...distances)),speed=e.species.speed*.45,advance=speed*Math.min(dt,.05);
 if(signed(q)>advance+3)return false;
 const outward=[Math.PI,0,-Math.PI/2,Math.PI/2][nearest]+site.angle;
 e.angle=turnTowards(e.angle||0,outward,(e.species.agility||2)*Math.min(dt,.05));e.facing=Math.cos(e.angle)>=0?1:-1;
 const next={x:e.x+Math.cos(e.angle)*advance,y:e.y+Math.sin(e.angle)*advance};
 // Turning has a radius: wait at the edge while turning inward instead of
 // stepping through the rock or snapping the fish to an outside position.
 if(signed(local(site,next))>=signed(q)){e.x=next.x;e.y=next.y;}
 e.activity='cruising';e.behavior='Swimming around an occupied crevice';return true;
}
export function storyView(sim){
 const s=state(sim);if(!s)return {step:'Compare the crevices',detail:'Begin as a clown triggerfish in Coral Cathedral.',actions:[],complete:false};
 if(s.completed)return {step:'Free of the crevice',detail:'Your body fitted between the edges. You locked and released the dorsal spine, then backed out.',actions:[],complete:true};
 if(sim.current!==CREVICE_REEF)return {step:'Visit Coral Cathedral',detail:'The three openings and your progress wait here while you explore.',actions:[{id:'story-route',label:'Show route'}],complete:false};
 const actions=creviceOptions(sim).map(c=>({id:'crevice-choose',value:c.index,label:c.label+' · '+(c.occupied?'occupied':c.fits?'fits':c.gap<60?'too narrow':'too wide')}));
 if(s.stage==='choose')return {step:'Compare three openings',detail:'Choose a gap with body clearance and an upper edge close enough to brace the spine. Click an outlined opening or use a button.',actions,complete:false};
 if(s.stage==='approach')return {step:'Align at the entrance',detail:'Swim to the selected opening. Your body must line up with its angle before entering. Point elsewhere to cancel.',actions:[{id:'crevice-enter',label:'Ease inside'},...actions],complete:false};
 const views={entering:['Easing inside','The folded spine and body pass between the edges.',[]],inside:['Body fits inside','Raise the first dorsal spine to the upper edge.',[{id:'crevice-lock',label:'Lock the dorsal spine'},{id:'crevice-release',label:'Back out freely'}]],locking:['Spine rising','The spine is moving toward the upper rock edge.',[{id:'crevice-release',label:'Release and leave'}]],locked:['Spine locked at the rock','The smaller spine holds the first upright. Release it before backing out.',[{id:'crevice-release',label:'Release and back out'}]],releasing:['Spine retracting','The spine folds away from the rock before the body moves.',[]],exiting:['Backing out','The folded spine clears the entrance as your body returns to open water.',[]]};
 const [step,detail,next]=views[s.stage]||views.entering;return {step,detail:detail+' Point elsewhere at any time to release and swim freely.',actions:next,complete:false};
}
const number=(n,min,max)=>Number.isFinite(n)&&n>=min&&n<=max;
export function validStory(s){
 if(s==null)return true;
 const keys=['version','reef','actor','stage','crevice','depth','spine','entered','lockedOnce','completed'];
 if(!s||typeof s!=='object'||Array.isArray(s)||Object.keys(s).some(k=>!keys.includes(k))||s.version!==1||s.reef!==CREVICE_REEF||!STAGES.includes(s.stage))return false;
 const a=s.actor;if(!a||typeof a!=='object'||Array.isArray(a)||Object.keys(a).some(k=>!['id','incarnation','species'].includes(k))||!(a.id==='player'||Number.isInteger(a.id)&&a.id>=0)||!Number.isInteger(a.incarnation)||a.incarnation<0||a.incarnation>1e9||a.species!=='s24')return false;
 if(!number(s.depth,0,1)||!number(s.spine,0,1)||typeof s.entered!=='boolean'||typeof s.lockedOnce!=='boolean'||typeof s.completed!=='boolean'||s.completed!==(s.stage==='complete'))return false;
 if(s.stage==='choose')return s.crevice===null&&s.depth===0&&s.spine===0&&!s.entered&&!s.lockedOnce;
 if(!Number.isInteger(s.crevice)||!CREVICES[s.crevice])return false;
 // Only the body-sized cavity supports a full sequence. Other openings are comparisons.
 if(s.crevice!==1)return false;
 if(FOLDED.includes(s.stage)&&s.spine!==0)return false;
 if(['approach','complete'].includes(s.stage)&&s.depth!==0)return false;
 if(['inside','locking','locked','releasing'].includes(s.stage)&&s.depth!==1)return false;
 if(s.stage==='entering'&&(s.depth===1||s.entered||s.lockedOnce))return false;
 if(s.stage==='approach'&&(s.entered||s.lockedOnce))return false;
 if(['inside','locking'].includes(s.stage)&&(!s.entered||s.lockedOnce))return false;
 if(s.stage==='locking'&&s.spine===1)return false;
 if(s.stage==='releasing'&&s.spine===0||s.stage==='exiting'&&s.depth===0)return false;
 if(s.stage==='locked'&&s.spine!==1)return false;
 if(['locked','releasing','exiting','complete'].includes(s.stage)&&(!s.entered||!s.lockedOnce))return false;
 return true;
}
