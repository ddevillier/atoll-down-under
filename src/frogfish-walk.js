import {creatureWidth} from './geometry.js';
import {cancelAmbush} from './ambush-activity.js';
import {cancelPreparation} from './feeding-motion.js';

// These short routes are authored play geometry, not a claim that real frogfish
// follow a stepping-stone graph. Each node has a real supporting surface.
const node=(id,x,y,label)=>({id,x,y,label,surface:[x-19,y,x+19,y]});
export const WALK_GRAPH=Object.freeze({reef:4,
 nodes:[node('start',800,620,'First foothold'),node('upper',720,596,'High shelf'),node('upper-lookout',640,560,'High lookout'),node('lower',880,620,'Low shelf'),node('lower-lookout',960,632,'Low lookout')],
 edges:[{from:'start',to:'upper',surface:[781,620,739,596]},{from:'upper',to:'upper-lookout',surface:[701,596,659,560]},{from:'start',to:'lower',surface:[819,620,861,620]},{from:'lower',to:'lower-lookout',surface:[899,620,941,632]}],
 obstacles:[{id:'sponge',x:800,y:540,radius:12}],
 footprint:Object.freeze({pad:5,depth:24}),
 gap:{from:'upper',to:'lower-lookout',label:'No supporting foothold across this gap'},
});
for(const list of [WALK_GRAPH.nodes,WALK_GRAPH.edges,WALK_GRAPH.obstacles]){for(const entry of list){if(entry.surface)Object.freeze(entry.surface);Object.freeze(entry);}Object.freeze(list);}Object.freeze(WALK_GRAPH.gap);
const nodes=new Map(WALK_GRAPH.nodes.map(n=>[n.id,n]));
const phases=['turn','swing-front','shift-front','swing-rear','shift-rear'];
const duration=phase=>phase==='turn'?.8:phase.startsWith('swing')?.25:.3;
const stageForNode=id=>id.endsWith('lookout')?'settle':'walk';
const depth=id=>id==='start'?0:id.endsWith('lookout')?2:1;
const state=sim=>sim.reefStories?.walker;
const active=sim=>['walker','frogfish-walk'].includes(sim.reefStories?.active)&&sim.player?.species?.id==='s54'&&sim.mode==='practice'&&!sim.trial;
const object=n=>!!n&&typeof n==='object'&&!Array.isArray(n);
const bounded=(n,a,b)=>Number.isFinite(n)&&n>=a&&n<=b;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const bodyAt=n=>({x:n.x,y:n.y-32,rotation:0});
const lerp=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,rotation:(a.rotation||0)+((b.rotation||0)-(a.rotation||0))*t});
const ease=t=>t*t*(3-2*t);
const contactsAt=(n,facing=1)=>[
 {id:'pectoral-near',kind:'pectoral',x:n.x-7*facing,y:n.y,planted:true},
 {id:'pectoral-far',kind:'pectoral',x:n.x-11*facing,y:n.y,planted:true},
 {id:'pelvic-near',kind:'pelvic',x:n.x+15*facing,y:n.y,planted:true},
 {id:'pelvic-far',kind:'pelvic',x:n.x+11*facing,y:n.y,planted:true},
];
const strideCount=(a,b)=>Math.ceil(distance(a,b)/14);
function roof(a,b,x){
 const e=WALK_GRAPH.edges.find(e=>e.from===a.id&&e.to===b.id),[x1,y1,x2,y2]=e.surface;
 const t=Math.max(0,Math.min(1,(x-x1)/(x2-x1)));
 return {y:y1+(y2-y1)*t,rotation:t>0&&t<1?Math.atan((y2-y1)/(x2-x1)):0};
}
function strideStance(a,b,i,count,originFacing){
 const n=lerp(a,b,i/count),r=roof(a,b,n.x),direction=Math.sign(b.x-a.x),contacts=contactsAt({...n,y:r.y},i===0?originFacing:direction);
 for(const c of contacts)c.y=roof(a,b,c.x).y;
 return {body:{x:n.x,y:r.y-32,rotation:r.rotation},contacts};
}

// The rendered stones and ramps have the same conservative solid volumes.
const terrain=WALK_GRAPH.nodes.map(n=>{const [a,y,b]=n.surface;return [[a-5,y],[b+5,y],[b+5,y+24],[a-5,y+24]];}).concat(WALK_GRAPH.edges.map(e=>{let [a,y,b,z]=e.surface;const length=Math.hypot(b-a,z-y),dx=(b-a)/length*5,dy=(z-y)/length*5;return [[a-dx,y-dy],[b+dx,z+dy],[b+dx,z+dy+24],[a-dx,y-dy+24]];}));
function hitsTerrain(body,polygon){
 const angle=body.rotation??body.angle??0,cos=Math.cos(angle),sin=Math.sin(angle);
 const p=polygon.map(([x,y])=>{const dx=x-body.x,dy=y-body.y;return {x:(dx*cos+dy*sin)/34,y:(-dx*sin+dy*cos)/19};});
 let inside=true,sign=0;
 for(let i=0;i<p.length;i++){
  const a=p[i],b=p[(i+1)%p.length],dx=b.x-a.x,dy=b.y-a.y,cross=dx*(-a.y)-dy*(-a.x);
  if(cross){if(sign&&Math.sign(cross)!==sign)inside=false;sign=Math.sign(cross);}
  const t=Math.max(0,Math.min(1,-(a.x*dx+a.y*dy)/(dx*dx+dy*dy)));
  if((a.x+t*dx)**2+(a.y+t*dy)**2<=1)return true;
 }
 return inside;
}

// Conservative ellipse/circle clearance accounts for the animal's body, not
// just its center. Sweeping the whole transfer prevents tunneling past a rock.
export function walkBodyClear(body,obstacles=WALK_GRAPH.obstacles){
 const angle=body?.rotation??body?.angle??0;
 return bounded(body?.x,35,1565)&&bounded(body?.y,20,720)&&Number.isFinite(angle)&&!terrain.some(p=>hitsTerrain(body,p))&&obstacles.every(o=>{if(!object(o)||!bounded(o.radius,0,200)||!Number.isFinite(o.x)||!Number.isFinite(o.y))return false;const dx=body.x-o.x,dy=body.y-o.y;return ((dx*Math.cos(angle)+dy*Math.sin(angle))/(34+o.radius))**2+((-dx*Math.sin(angle)+dy*Math.cos(angle))/(19+o.radius))**2>1;});
}
export function walkSweepClear(from,to,obstacles=WALK_GRAPH.obstacles){
 if(!object(from)||!object(to)||![from.x,from.y,to.x,to.y].every(Number.isFinite))return false;
 const a={...from,rotation:from.rotation??from.angle??0},b={...to,rotation:to.rotation??to.angle??0};
 if(!Number.isFinite(a.rotation)||!Number.isFinite(b.rotation))return false;
 const samples=Math.max(1,Math.ceil(distance(from,to)/2),Math.ceil(Math.abs(a.rotation-b.rotation)/.04));
 if(samples>1000)return false;
 for(let i=0;i<=samples;i++)if(!walkBodyClear(lerp(a,b,i/samples),obstacles))return false;
 return true;
}

function physicalPose(s){
 const a=nodes.get(s.node),b=s.gait&&nodes.get(s.gait.to);
 let body=bodyAt(a),contacts=contactsAt(a,s.facing),phase=s.phase,facing=s.facing;
 if(s.gait&&b){
  phase=s.gait.phase;const t=ease(s.gait.elapsed/duration(phase)),count=strideCount(a,b),index=s.gait.stride;
  const direction=Math.sign(b.x-a.x);
  if(phase==='turn')return {body:{...body,facing:s.facing*Math.cos(Math.PI*t)},x:body.x,y:body.y,angle:0,facing:s.facing*Math.cos(Math.PI*t),phase,moving:true,contacts};
  facing=direction;
  const start=strideStance(a,b,index,count,s.facing),finish=strideStance(a,b,index+1,count,s.facing),origin=start.body,end=finish.body,destination=finish.contacts;
  body=origin;contacts=start.contacts;
  const front=phase==='swing-front',rear=phase==='swing-rear';
  if(phase==='shift-front')body=lerp(origin,end,t*.5);
  if(rear)body=lerp(origin,end,.5);
  if(phase==='shift-rear')body=lerp(origin,end,.5+t*.5);
  contacts=contacts.map((c,i)=>{
   const forward=c.kind==='pectoral',swing=front&&forward||rear&&!forward;
   if(swing){const p=lerp(c,destination[i],t);return {...c,x:p.x,y:p.y-8*Math.sin(Math.PI*t),planted:false};}
   return {...(forward&&phase!=='swing-front'||phase==='shift-rear'?destination[i]:c)};
  });
 }
 return {body:{...body,facing},x:body.x,y:body.y,angle:body.rotation,facing,phase,moving:!!s.gait,contacts};
}
const reachOK=pose=>pose.contacts.every(c=>{const x=(c.kind==='pectoral'?11.6:12.8)*pose.facing,y=c.kind==='pectoral'?8.5:17.6,angle=pose.angle;return distance(c,{x:pose.x+x*Math.cos(angle)-y*Math.sin(angle),y:pose.y+x*Math.sin(angle)+y*Math.cos(angle)})<=50;});
export function canWalkEdge(from,to,obstacles=WALK_GRAPH.obstacles){
 const a=nodes.get(from),b=nodes.get(to);
 if(!a||!b||!WALK_GRAPH.edges.some(e=>e.from===from&&e.to===to)||distance(a,b)>110)return false;
 const facing=from==='start'?1:Math.sign(a.x-800);let previous=null;
 for(let stride=0;stride<strideCount(a,b);stride++)for(const phase of phases.filter(p=>p!=='turn'||stride===0&&facing!==Math.sign(b.x-a.x)))for(let i=0;i<=16;i++){
  const pose=physicalPose({node:from,facing,phase:'stance',gait:{from,to,phase,stride,elapsed:duration(phase)*i/16}});
  if(!reachOK(pose)||!walkBodyClear(pose.body,obstacles)||previous&&!walkSweepClear(previous,pose.body,obstacles))return false;previous=pose.body;
 }
 return true;
}

export function initStory(sim){
 if(sim.player?.species?.id!=='s54')return null;
 sim.reefStories??={version:1,active:null};
 if(state(sim))return state(sim);
 return sim.reefStories.walker={version:1,reef:4,stage:'inspect',phase:'detached',node:'start',selected:'start',choice:'upper',facing:1,steps:0,gait:null,approach:null,settled:0,complete:false};
}
export function validStory(s){
 if(s==null)return true;
 if(!object(s)||s.version!==1||s.reef!==4||!['inspect','walk','settle','done'].includes(s.stage)||!['detached','approach','stance',...phases].includes(s.phase)||!nodes.has(s.node)||!nodes.has(s.selected)||!['upper','lower'].includes(s.choice)||![-1,1].includes(s.facing)||s.facing!==(s.node==='start'?1:Math.sign(nodes.get(s.node).x-800))||!Number.isInteger(s.steps)||s.steps!==depth(s.node)||!bounded(s.settled,0,1.2)||typeof s.complete!=='boolean')return false;
 if(Object.keys(s).some(k=>!['version','reef','stage','phase','node','selected','choice','facing','steps','gait','approach','settled','complete'].includes(k)))return false;
 if(s.node!=='start'&&s.choice!==(s.node.startsWith('upper')?'upper':'lower')||s.node==='start'&&s.gait&&s.choice!==s.gait.to)return false;
 if(s.stage==='inspect'&&s.steps!==0||s.stage==='walk'&&s.steps===2||['settle','done'].includes(s.stage)&&s.steps!==2||s.stage==='done'&&(!s.complete||s.settled!==1.2)||['inspect','walk'].includes(s.stage)&&s.settled!==0)return false;
 if(s.phase==='approach'){
  if(!Array.isArray(s.approach)||s.approach.length<1||s.approach.length>4||s.approach.some(p=>!object(p)||Object.keys(p).some(k=>!['x','y'].includes(k))||!walkBodyClear(p)))return false;
  if(distance(s.approach.at(-1),bodyAt(nodes.get(s.node)))>.001)return false;
  for(let i=1;i<s.approach.length;i++)if(!walkSweepClear(s.approach[i-1],s.approach[i]))return false;
 }else if(s.approach!==null)return false;
 if(['approach','detached'].includes(s.phase)&&s.gait!==null||s.phase==='approach'&&s.selected!==s.node)return false;
 if(s.gait===null)return !phases.includes(s.phase)&&s.selected===s.node&&(s.phase!=='stance'||s.stage!=='inspect');
 const g=s.gait;
 return object(g)&&Object.keys(g).every(k=>['from','to','phase','stride','elapsed'].includes(k))&&g.from===s.node&&g.to===s.selected&&phases.includes(g.phase)&&g.phase===s.phase&&bounded(g.elapsed,0,duration(g.phase))&&canWalkEdge(g.from,g.to)&&Number.isInteger(g.stride)&&g.stride>=0&&g.stride<strideCount(nodes.get(g.from),nodes.get(g.to))&&(g.phase!=='turn'||g.stride===0&&s.facing!==Math.sign(nodes.get(g.to).x-nodes.get(g.from).x))&&s.stage==='walk';
}

function releaseInputs(sim){
 const p=sim.player;cancelAmbush(sim);p.target=null;cancelPreparation(p);p.cleanerTarget=null;p.cleanTime=0;p.sandProbe=null;p.foragingPrep=null;
 sim.destination=null;sim.pointer={x:p.x,y:p.y};
}
function applyPose(sim,s){
 const pose=physicalPose(s),p=sim.player;p.x=pose.x;p.y=pose.y;p.angle=pose.angle;p.facing=pose.facing;p.vx=0;p.vy=0;p.activity=s.gait?'walking':'fin-stance';
 sim.pointer={x:p.x,y:p.y};
}
function abortTransfer(sim,s){
 // The swept body is already collision-safe. Lift its fins at its actual
 // position; a later approach swims back to the last complete graph stance.
 s.gait=null;s.approach=null;s.phase='detached';s.selected=s.node;s.settled=0;
 if(s.stage==='done')s.settled=1.2;
 sim.pointer={x:sim.player.x,y:sim.player.y};
 sim.player.activity='cruising';
}
export function stopStory(sim){const s=state(sim);if(!s)return false;abortTransfer(sim,s);return true;}

function nextNode(s){return s.node==='start'?s.choice:s.node==='upper'?'upper-lookout':s.node==='lower'?'lower-lookout':null;}
function approachPath(from,end){
 const start={x:from.x,y:from.y};
 const candidates=[[end],...[600,1000,860,740].map(x=>[{x,y:start.y},{x,y:Math.min(start.y,end.y,470)},{x:end.x,y:Math.min(start.y,end.y,470)},end]),...[860,740,1000,600].map(x=>[{x,y:start.y},{x,y:end.y},end])];
 return candidates.filter(points=>{let prior=start;for(const p of points){if(!walkSweepClear(prior,p))return false;prior=p;}return true;}).sort((a,b)=>{const len=points=>points.reduce((sum,p,i)=>sum+distance(i?points[i-1]:start,p),0);return len(a)-len(b);})[0]?.map(p=>({x:p.x,y:p.y}))??null;
}
export function storyAction(sim,action,value){
 if(!active(sim)||sim.paused||sim.phase!=='playing'||sim.player.stun>0||sim.player.health<=0||sim.player.energy<=0)return false;
 const s=initStory(sim);
 if(action==='walker-swim'||action==='walker-cancel'){abortTransfer(sim,s);return true;}
 if(action==='walker-restart'){abortTransfer(sim,s);Object.assign(s,{stage:'inspect',phase:'detached',node:'start',selected:'start',facing:1,steps:0,gait:null,approach:null,settled:0});return true;}
 if(action==='walker-route'){
  if(!['upper','lower'].includes(value)||s.node!=='start'||s.gait)return false;s.choice=value;return true;
 }
 if(sim.current!==s.reef)return false;
 if(action==='context'){
  if(s.phase==='detached')return storyAction(sim,'walker-plant',s.node);
  if(s.phase==='stance'&&s.stage==='settle')return storyAction(sim,'walker-settle');
  if(s.phase==='stance'&&nextNode(s))return storyAction(sim,'walker-step',nextNode(s));
  return false;
 }
 if(action==='walker-plant'){
  if(s.phase!=='detached'||value!==undefined&&value!==s.node)return false;
  const path=approachPath(sim.player,bodyAt(nodes.get(s.node)));if(!path){sim.event?.('message','Swim into clear water above the shelves before planting your fins.');return false;}
  s.phase='approach';s.approach=path;s.selected=s.node;releaseInputs(sim);return true;
 }
 if(action==='walker-step'){
  if(s.phase!=='stance'||s.stage!=='walk'||!canWalkEdge(s.node,value)){sim.event?.('message','That foothold cannot support this step. Choose a connected shelf, or swim away.');return false;}
  releaseInputs(sim);s.selected=value;const phase=s.facing!==Math.sign(nodes.get(value).x-nodes.get(s.node).x)?'turn':'swing-front';s.gait={from:s.node,to:value,phase,stride:0,elapsed:0};s.phase=phase;
  if(['upper','lower'].includes(value))s.choice=value;return true;
 }
 if(action==='walker-settle'){
  if(s.stage!=='settle'||s.phase!=='stance'||distance(sim.player,bodyAt(nodes.get(s.node)))>2)return false;
  s.settled=Math.max(.001,s.settled);return true;
 }
 return false;
}

// Explicit canvas foothold hits can choose a step. All other pointer motion
// releases assistance immediately, including an unfinished weight transfer.
export function storyClick(sim,x,y){
 if(!active(sim)||sim.current!==4||!Number.isFinite(x)||!Number.isFinite(y))return false;
 const n=WALK_GRAPH.nodes.filter(n=>distance(n,{x,y})<=25).sort((a,b)=>distance(a,{x,y})-distance(b,{x,y}))[0];
 if(!n)return false;
 const s=initStory(sim);
 if(s.phase==='detached'){
  if(n.id===s.node){storyAction(sim,'walker-plant',n.id);return true;}
  // Moving the mouse released the stance. An explicit adjacent foothold click
  // can replant at that same physical stance, then choose the next step.
  if(s.stage==='walk'&&distance(sim.player,bodyAt(nodes.get(s.node)))<=.5&&canWalkEdge(s.node,n.id))s.phase='stance';
  else{sim.event?.('message','Plant at your last foothold first. The other shelves need connected support.');return true;}
 }
 storyAction(sim,'walker-step',n.id);return true;
}
export function storyPointer(sim){
 if(!active(sim))return false;const s=state(sim);if(s&&s.phase!=='detached')abortTransfer(sim,s);return false;
}

export function storyPlayer(sim,dt){
 if(!active(sim))return false;
 const s=state(sim);if(!s||s.phase==='detached'||sim.current!==s.reef)return false;
 if(sim.paused||!(dt>0)||!Number.isFinite(dt))return true;
 if(sim.player.health<=0||sim.player.energy<=0||sim.player.stun>0){abortTransfer(sim,s);return false;}
 dt=Math.min(dt,.05);
 if(s.phase==='approach'){
  const end=bodyAt(nodes.get(s.node)),p=sim.player,remaining=distance(p,end);
  if(remaining<.5){
   if(!walkBodyClear(end)){abortTransfer(sim,s);return false;}
   s.phase='stance';s.approach=null;s.stage=stageForNode(s.node);applyPose(sim,s);return true;
  }
  let waypoint=s.approach[0];
  while(s.approach.length>1&&distance(p,waypoint)<.01){s.approach.shift();waypoint=s.approach[0];}
  const advance=Math.min(p.species.speed*.72*dt,distance(p,waypoint));
  const next=lerp(p,waypoint,advance/Math.max(.001,distance(p,waypoint)));
  if(!walkSweepClear({...p,rotation:0},next)){abortTransfer(sim,s);sim.event?.('message','There is no clear approach from here. Swim above the shelves and try again.');return false;}
  p.x=next.x;p.y=next.y;p.angle=0;p.facing=waypoint.x-p.x>=0?1:-1;sim.pointer={x:p.x,y:p.y};return true;
 }
 const expected=physicalPose(s);
 if(distance(sim.player,expected)>4){abortTransfer(sim,s);return false;}
 if(s.gait){
  const g=s.gait;
  g.elapsed=Math.min(duration(g.phase),g.elapsed+dt);s.phase=g.phase;
  const pose=physicalPose(s);
  if(!walkSweepClear(sim.player,pose)||!reachOK(pose)){abortTransfer(sim,s);return false;}
  applyPose(sim,s);
  if(g.elapsed>=duration(g.phase)){
   const i=phases.indexOf(g.phase);
   if(i<phases.length-1){g.phase=phases[i+1];g.elapsed=0;s.phase=g.phase;}
   else if(g.stride+1<strideCount(nodes.get(g.from),nodes.get(g.to))){g.stride++;g.phase='swing-front';g.elapsed=0;s.phase=g.phase;}
   else{s.facing=Math.sign(nodes.get(g.to).x-nodes.get(g.from).x);s.node=g.to;s.selected=s.node;s.steps=depth(s.node);s.gait=null;s.phase='stance';s.stage=stageForNode(s.node);applyPose(sim,s);}
  }
 }else applyPose(sim,s);
 return true;
}
export function tickStory(sim,dt){
 if(!active(sim)||sim.paused||sim.current!==4||!Number.isFinite(dt)||dt<=0)return;
 const s=state(sim);if(!s||s.phase!=='stance'||s.stage!=='settle'||s.settled===0||distance(sim.player,bodyAt(nodes.get(s.node)))>2)return;
 s.settled=Math.min(1.2,s.settled+Math.min(.05,dt));
 if(s.settled===1.2){s.stage='done';if(!s.complete){s.complete=true;sim.event?.('discovery','A Walk Along the Reef · Your pectoral and pelvic fins found support, carried your body around the sponge, and settled at a chosen lookout.',{value:'frogfish-walk'});}}
}
export const storyMeal=()=>false;
export const storyNPC=()=>false;
export function safety(sim){
 const s=state(sim);if(!active(sim)||!s||sim.current!==s.reef||s.phase==='detached')return null;
 return {reef:4,x:800,y:600,radius:195,participants:[],holdNeeds:s.phase!=='approach'};
}
export function walkerPose(sim,e=sim?.player){
 const s=state(sim);if(!active(sim)||e!==sim.player||!s||sim.current!==s.reef||['detached','approach'].includes(s.phase))return null;
 const width=creatureWidth(e.species);return {...physicalPose(s),width,height:width*243/343};
}
export function validStoryPlayer(sim){
 const s=state(sim);if(!validStory(s))return false;
 if(active(sim)&&s?.phase==='approach')return walkBodyClear({...sim.player,rotation:0})&&walkSweepClear({...sim.player,rotation:0},s.approach[0]);
 const pose=walkerPose(sim);return !pose||distance(sim.player,pose.body)<=.01&&Math.abs(sim.player.angle-pose.angle)<=.01&&Math.abs(sim.player.facing-pose.facing)<=.01&&walkBodyClear(pose.body);
}
export function storyView(sim){
 const s=state(sim);if(!s)return {step:'Inspect the walking shelves',detail:'Visit Coral Cathedral as a painted frogfish.',actions:[],complete:false};
 let step='Inspect two short routes',detail='Choose the high or low shelves around the sponge. The diagonal gap has no reachable support. Plant your pectoral and pelvic fins to begin; mouse steering releases the walk.';
 const actions=s.node==='start'&&!s.gait?[{id:'walker-route',label:'Choose high route',value:'upper'},{id:'walker-route',label:'Choose low route',value:'lower'}]:[];
 if(s.phase==='detached')actions.push({id:'walker-plant',label:s.steps?'Return to your last foothold':'Plant fins at first foothold',value:s.node});
 if(s.stage==='done'){step=s.node==='upper-lookout'?'The high lookout':'The low lookout';detail='You walked around the sponge with supported pectoral and pelvic fins. These routes and reach limits are a game interpretation. Swim away whenever you like.';actions.push({id:'walker-restart',label:'Try the other route'});}
 else if(s.phase==='approach'){step='Swim to the supporting shelf';detail='Approach the shelf through clear water. Fins plant only when your body reaches it. Mouse steering cancels the approach.';}
 else if(s.phase==='detached'&&s.steps){step='Return to your last foothold';detail='Swim freely, or approach your last supported stance to resume this route. The fins plant after your body arrives.';}
 else if(s.stage==='walk'&&s.phase!=='detached'){
  step=s.gait?'Carry your weight onto the next shelf':'Choose your next foothold';detail=s.gait?'A pair of fins swings and replants before your body transfers its weight. The supporting contacts stay fixed on the reef.':'Choose a connected shelf. E takes the next step along your chosen '+(s.choice==='upper'?'high':'low')+' route.';
  if(!s.gait)WALK_GRAPH.edges.filter(e=>e.from===s.node).forEach(e=>actions.push({id:'walker-step',label:'Step to '+nodes.get(e.to).label.toLowerCase(),value:e.to}));
 }else if(s.stage==='settle'){step='Settle at your chosen lookout';detail='Both pairs of walking fins now support your body. Press E or settle to inspect the view from this shelf.';actions.push({id:'walker-settle',label:'Settle at this lookout'});}
 if(s.phase!=='detached')actions.push({id:'walker-swim',label:'Release fins and swim'});
 return {step,detail,actions,complete:s.complete};
}
