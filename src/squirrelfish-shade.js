import {REEFS} from './data.js';
import {turnTowards} from './steering.js';
import {edible} from './diet.js';
import {WORLD_WIDTH,WORLD_HEIGHT} from './world-dimensions.js';
import {admissionFor as encounterAdmission} from './adventure-admission.js';

// Neoniphon sammara sound must be read with visible context, not as words.
// The two resting choices and spacing thresholds are authored game rules.
export const SHADE_REEF=8;
const stages=['listen','inspect','space','settle','complete'];
const responses=['hidden','orienting','giving-space','settled'];
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const state=sim=>sim.reefStories?.shade;
const active=sim=>sim.reefStories?.active==='shade'&&sim.player?.species?.id==='s12';
const playing=sim=>active(sim)&&sim.phase==='playing'&&!sim.paused&&sim.player.alive!==false&&sim.player.health>0&&sim.player.energy>0&&!(sim.player.stun>0);
const emit=(sim,text,type='message',extra={})=>sim.event?.(type,text,extra);
const num=(n,a,b)=>Number.isFinite(n)&&n>=a&&n<=b;
const keys=(o,allowed)=>Object.keys(o).every(k=>allowed.includes(k));
const object=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
const point=p=>object(p)&&keys(p,['x','y'])&&num(p.x,10,WORLD_WIDTH-10)&&num(p.y,25,WORLD_HEIGHT-20);
const id=n=>typeof n==='string'&&n.length>0&&n.length<100&&n!=='player'||Number.isInteger(n)&&n>=0&&n<1e9;
const ref=r=>object(r)&&keys(r,['id','incarnation','species'])&&id(r.id)&&Number.isInteger(r.incarnation)&&num(r.incarnation,0,1e6)&&r.species==='s12';

export function shadeSite(input){
 const s=input?.reefStories?state(input):input,cover=REEFS[s?.reef]?.shelters[s?.site];if(!cover)return null;
 const x=cover.x,y=cover.y;
 return {id:`shade-${s.reef}-${s.site}`,reef:s.reef,index:s.site,x,y,r:cover.r,
  home:{x:x-28,y:y-5},inspect:{x:x+48,y:y+35},alcove:{x:clamp(x+185,10,WORLD_WIDTH-10),y:clamp(y+25,25,WORLD_HEIGHT-20)},space:{x:clamp(x-185,10,WORLD_WIDTH-10),y:clamp(y+90,25,WORLD_HEIGHT-20)},edge:{x,y:clamp(y+105,25,WORLD_HEIGHT-20)}};
}
export function shadeNeighbor(sim){
 const s=state(sim);if(!s?.neighbor||s.reef!==sim.current)return null;
 return sim.section?.entities.find(e=>e.alive&&e.species?.id===s.neighbor.species&&e.id===s.neighbor.id&&(e.incarnation||0)===s.neighbor.incarnation)||null;
}
const free=e=>e?.alive&&e.species?.id==='s12'&&e.health>0&&!e.hidden&&!e.target&&!e.feeding&&!e.cleanTime&&!e.cleanerTarget&&!e.service&&!e.stun&&!e.actionTime&&!e.abilityTime&&!e.entering&&!e.ecology?.partner&&e.activity!=='avoiding'&&!e.behavior?.startsWith('Moving away');
const canBind=(e,entities)=>free(e)&&!(entities||[]).some(b=>b!==e&&b.ecology?.partner===e.id);
function danger(sim,e){if(sim.storyProtected?.(e))return false;return [sim.player,...(sim.section?.entities||[])].some(b=>b!==e&&b.alive&&!b.hidden&&edible(b,e)&&distance(b,e)<110&&(b.target===e.id||!(b.satiated>0)));}
const eligible=(sim,e)=>canBind(e,sim.section?.entities)&&!danger(sim,e);
function bind(s,e){
 s.neighbor={id:e.id,incarnation:e.incarnation||0,species:'s12'};s.response='hidden';s.crowded=false;s.reacted=false;s.crowdAt=null;s.crowdPlayer=null;s.settled=0;
 // The turn and spacing belonged to the previous individual. A replacement
 // needs its own close observation before it can respond to a resting choice.
 if(!s.complete){s.observed=false;s.choice=null;s.selected=null;s.stage='listen';}
}
function chooseSite(reef,e){return REEFS[reef].shelters.map((p,index)=>({index,d:distance(p,e)})).sort((a,b)=>a.d-b.d)[0].index;}

export function initStory(sim){
 if(sim.player?.species?.id!=='s12'||!sim.reefStories)return false;
 if(state(sim))return validStory(state(sim));
 const sections=sim.sections||[],order=[SHADE_REEF,sim.current,...REEFS.map(r=>r.id)].filter((r,i,a)=>a.indexOf(r)===i);
 let reef=SHADE_REEF,neighbor=null;
 for(const r of order){const entities=r===sim.current?sim.section?.entities:sections[r]?.entities;const e=entities?.find(e=>canBind(e,entities));if(e){reef=r;neighbor=e;break;}}
 const s=sim.reefStories.shade={version:1,reef,site:neighbor?chooseSite(reef,neighbor):0,stage:'listen',neighbor:null,observed:false,crowded:false,reacted:false,crowdAt:null,crowdPlayer:null,choice:null,selected:null,response:'hidden',pulse:0,pulseClock:0,settled:0,complete:false};
 if(neighbor)bind(s,neighbor);
 if(sim.current!==reef)sim.setDestination?.(reef);
 return true;
}
export function validStory(s){
 if(s==null)return true;
 if(!object(s)||!keys(s,['version','reef','site','stage','neighbor','observed','crowded','reacted','crowdAt','crowdPlayer','choice','selected','response','pulse','pulseClock','settled','complete'])||s.version!==1||!Number.isInteger(s.reef)||!REEFS[s.reef]||!Number.isInteger(s.site)||!shadeSite(s)||!stages.includes(s.stage)||!responses.includes(s.response))return false;
 if(!['observed','crowded','reacted','complete'].every(k=>typeof s[k]==='boolean')||!num(s.pulse,0,1)||!num(s.pulseClock,0,4)||!num(s.settled,0,1)||s.complete!==(s.stage==='complete'))return false;
 if(s.neighbor!==null&&!ref(s.neighbor)||![null,'alcove','space'].includes(s.choice)||s.selected!==null&&!point(s.selected)||s.crowdAt!==null&&!point(s.crowdAt)||s.crowdPlayer!==null&&!point(s.crowdPlayer))return false;
 const site=shadeSite(s),selected=s.choice&&site[s.choice];
 if(s.choice?(s.selected?.x!==selected.x||s.selected?.y!==selected.y):s.selected!==null)return false;
 if(s.crowded!==!!s.crowdAt||s.crowded!==!!s.crowdPlayer||s.reacted&&!s.crowded||s.crowded&&!s.neighbor||s.observed!==['space','settle','complete'].includes(s.stage)||s.choice&&!s.observed)return false;
 if(!['settle','complete'].includes(s.stage)&&s.settled!==0)return false;
 if(['settle','complete'].includes(s.stage)&&(!s.choice||!s.crowded||!s.reacted)||s.complete&&(!s.neighbor||s.settled<1||s.response!=='settled'))return false;
 return true;
}
function steer(sim,p){sim.point?.(p.x,p.y);sim.pointer={x:p.x,y:p.y};}
function inspect(sim,s){
 const e=shadeNeighbor(sim),site=shadeSite(s),p=sim.player;
 if(!e||!eligible(sim,e)){emit(sim,'This opening has no free squirrelfish to observe. Continue when a neighbor is available, or choose a fresh adventure dive.');return true;}
 if(s.stage==='complete'){emit(sim,'Both fish have room beneath the ledge. You can explore freely.');return true;}
 if(s.stage==='settle'){
  if(s.settled>=1&&distance(p,s.selected)<45&&distance(p,e)>=150&&distance(e,site.home)<65){s.stage='complete';s.complete=true;emit(sim,'Room in the shadows · You watched a neighbor shift, then chose a separate resting place.','discovery',{value:'squirrelfish-shade'});}
  else emit(sim,'Swim into your chosen opening and look back once the neighbor has settled.');
  return true;
 }
 if(distance(p,e)>160||distance(e,site.home)>80||distance(p,site)>200||!s.crowded||!['orienting','giving-space'].includes(s.response)){
  steer(sim,site.inspect);emit(sim,'Approach the shaded opening. Watch the fish’s turn and spacing before choosing your place.');return true;
 }
 s.observed=true;s.stage='space';emit(sim,'A squirrelfish turns beside the ledge. Its pulse has no translated meaning; choose another alcove or open a gap.');return true;
}
export function storyAction(sim,action,value){
 const s=state(sim);if(!playing(sim)||!s||sim.current!==s.reef)return false;
 if(action==='shade-inspect'||action==='shade-listen'||action==='context')return inspect(sim,s);
 if(action==='shade-choose'&&['alcove','space'].includes(value)&&s.observed&&!s.complete){s.choice=value;s.selected={...shadeSite(s)[value]};s.stage='space';s.settled=0;steer(sim,s.selected);emit(sim,value==='alcove'?'Swim into the neighboring alcove. Watch the other fish find its own resting position.':'Take the other approach and leave a wider gap beneath the ledge.');return true;}
 if(action==='shade-retry'&&!s.complete){
  let e=sim.section?.entities.find(e=>eligible(sim,e)),reef=sim.current;
  if(!e){const admission=encounterAdmission(sim,'shade'),ref=admission.participants?.[0];if(admission.available&&admission.reef!==sim.current&&ref){reef=admission.reef;e=sim.sections?.[reef]?.entities.find(e=>e.id===ref.id&&(e.incarnation||0)===ref.incarnation&&e.species?.id===ref.species);}}
  if(e){s.reef=reef;s.site=chooseSite(reef,e);s.choice=null;s.selected=null;bind(s,e);if(reef!==sim.current){sim.setDestination?.(reef);emit(sim,'A free squirrelfish is near a ledge in '+REEFS[reef].name+'. Follow the route to continue your observation.');}}
  return true;
 }
 return false;
}
export function storyClick(sim,x,y){
 const s=state(sim);if(!playing(sim)||!s||s.reef!==sim.current||!Number.isFinite(x)||!Number.isFinite(y))return false;
 const p={x,y},site=shadeSite(s),e=shadeNeighbor(sim);
 if(s.observed&&!s.complete)for(const choice of ['alcove','space'])if(distance(p,site[choice])<45)return storyAction(sim,'shade-choose',choice);
 if(distance(p,site.inspect)<50||e&&distance(p,e)<45)return storyAction(sim,'shade-inspect');
 return false;
}
export function storyPointer(sim,x,y){const s=state(sim);if(active(sim)&&s&&!s.complete&&Number.isFinite(x)&&Number.isFinite(y)&&s.selected&&distance({x,y},s.selected)>45)s.settled=0;return false;}
export function storyPlayer(){return false;}
export function storyMeal(){return false;}

export function tickStory(sim,dt){
 const s=state(sim);if(!playing(sim)||!s||sim.current!==s.reef||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.1);
 let e=shadeNeighbor(sim);
 if(!e){if(s.complete)return;s.neighbor=null;s.response='hidden';s.crowded=false;s.reacted=false;s.crowdAt=null;s.crowdPlayer=null;s.settled=0;s.stage=s.observed?'space':'listen';e=sim.section?.entities.find(e=>eligible(sim,e));if(e)bind(s,e);else return;}
 if(!eligible(sim,e)){if(!s.complete){s.settled=0;s.response='hidden';}return;}
 const p=sim.player,site=shadeSite(s),local=distance(p,site)<300&&distance(e,site.home)<85;
 if(!local){s.pulse=0;s.settled=0;return;}
 s.pulse=Math.max(0,s.pulse-dt/1.2);s.pulseClock=Math.min(4,s.pulseClock+dt);
 if(s.pulseClock>=4){s.pulseClock=0;s.pulse=1;emit(sim,'A quiet pulse comes from this shaded opening.','shade-pulse',{value:'squirrelfish-shade',x:e.x,y:e.y,pan:clamp((e.x-p.x)/300,-1,1),gain:.09});}
 if(s.stage==='listen')s.stage='inspect';
 if(s.complete)return;
 const quiet=Math.hypot(p.vx||0,p.vy||0)<16&&!p.target&&!p.feeding&&!p.cleanerTarget&&!p.cleanTime&&!p.actionTime&&!p.abilityTime;
 // Judge the room both fish have now. A close approach can start beside an
 // authored opening, so an arbitrary retreat distance can make that valid
 // choice impossible despite a real response and ample final separation.
 const separate=s.choice&&s.reacted&&distance(p,s.selected)<45&&distance(p,e)>=150&&s.response==='settled';
 if(separate){s.stage='settle';s.settled=quiet?Math.min(1,s.settled+dt*2):0;}else{s.settled=0;if(s.stage==='settle')s.stage='space';}
}
export function storyNPC(sim,e,dt){
 const s=state(sim);if(!playing(sim)||!s||s.reef!==sim.current||shadeNeighbor(sim)!==e||!eligible(sim,e)||!Number.isFinite(dt)||dt<=0)return false;
 const p=sim.player,site=shadeSite(s);if(distance(p,site)>360)return false;dt=Math.min(dt,.1);
 let dest={...site.home};const gap=distance(p,e),near=distance(e,site.home)<85;
 if(near&&(gap<115||s.crowded&&!s.choice&&gap<150)&&!s.complete){
  if(!s.crowded){s.crowded=true;s.crowdAt={x:e.x,y:e.y};s.crowdPlayer={x:p.x,y:p.y};}
  const dx=site.home.x-p.x,dy=site.home.y-p.y,d=Math.hypot(dx,dy)||1;dest={x:site.home.x+dx/d*55,y:site.home.y+dy/d*35};s.response='giving-space';
 }else if(s.choice){dest.x+=s.choice==='alcove'?-32:32;s.response='orienting';}else s.response=near?'orienting':'hidden';
 const dx=dest.x-e.x,dy=dest.y-e.y,d=Math.hypot(dx,dy),step=Math.min(d,clamp(e.species.speed*.35,25,55)*dt);
 if(d>2){e.x=clamp(e.x+dx/d*step,10,WORLD_WIDTH-10);e.y=clamp(e.y+dy/d*step,25,WORLD_HEIGHT-20);}
 const heading=d>12?Math.atan2(dy,dx):p.x<e.x?Math.PI:0;e.angle=turnTowards(e.angle||0,heading,e.species.agility*dt);e.facing=Math.cos(e.angle)>=0?1:-1;
 if(s.crowdAt&&distance(e,s.crowdAt)>=18)s.reacted=true;
 if(s.choice&&gap>=150&&d<=4)s.response='settled';
 if(s.complete)s.response='settled';
 e.activity=s.response==='settled'?'at-home':'cruising';e.behavior='Squirrelfish shade · '+({hidden:'approaching its ledge',orienting:'turning beside the opening','giving-space':'shifting away from close company',settled:'resting independently'}[s.response]);
 return true;
}
export function stopStory(sim){
 const s=state(sim);if(!s)return;const e=(sim.current===s.reef?sim.section:sim.sections?.[s.reef])?.entities.find(e=>e.id===s.neighbor?.id&&(e.incarnation||0)===s.neighbor?.incarnation&&e.species?.id==='s12');
 if(e?.behavior?.startsWith('Squirrelfish shade · ')){e.behavior='Cruising';e.activity='cruising';e.think=0;}
 if(!s.complete){s.settled=0;if(s.stage==='settle')s.stage='space';}s.pulse=0;
}
// Pausing freezes activity, but retains the descriptor so cancellation and a
// restored paused dive can release the same participants with exit grace.
export function safety(sim){const s=state(sim),site=shadeSite(s),p=sim.player;if(!active(sim)||sim.phase!=='playing'||!s||!site||p.alive===false||!(p.health>0)||!(p.energy>0)||s.reef!==sim.current||distance(p,site)>300)return null;return {reef:s.reef,x:site.x,y:site.y,radius:300,participants:s.neighbor?[{...s.neighbor}]:[],holdNeeds:false};}
export function shadeScene(sim){const s=state(sim);if(!s||s.reef!==sim.current)return null;const e=shadeNeighbor(sim);return {...shadeSite(s),neighbor:e,stage:s.stage,response:s.response,pulse:s.pulse,choice:s.choice,selected:s.selected,observed:s.observed,crowded:s.crowded,reacted:s.reacted,complete:s.complete,available:!!e&&eligible(sim,e)};}
export function storyView(sim){
 const s=state(sim);if(!s)return {step:'Someone in the Shade',detail:'Follow a quiet local pulse and inspect the shaded opening.',actions:[],complete:false};
 if(s.complete)return {step:'Room in the shadows',detail:'Two fish settled independently after you opened a gap. The discovery is in your journal.',actions:[],complete:true};
 if(s.reef!==sim.current)return {step:'Visit '+REEFS[s.reef].name,detail:'Your encounter is saved. Follow the route back to its ledge.',actions:[{id:'story-route',label:'Show route'}],complete:false};
 const e=shadeNeighbor(sim);
 if(!e||!eligible(sim,e)){const admission=encounterAdmission(sim,'shade');return {step:e?'Your neighbor is busy':'No available neighbor',detail:admission.available?'Your neighbor is unavailable. Check for another free squirrelfish; a map route can lead to an existing encounter.':'The available neighbors are missing, busy, paired, or need care. Preserve this dive and choose a fresh adventure dive.',actions:[{id:'shade-retry',label:'Check for a free neighbor'}],needsFreshDive:!admission.available,complete:false};}
 if(s.stage==='listen'||s.stage==='inspect')return {step:'Follow the pulse into shade',detail:'The source ripple also works with sound muted. Approach the opening and inspect the real fish’s turn and spacing.',actions:[{id:'shade-inspect',label:'Inspect the shaded opening'}],complete:false};
 if(s.observed&&!s.reacted)return {step:'Watch this neighbor',detail:'Approach the shaded opening and inspect how this fish turns and makes room before choosing your resting place.',actions:[{id:'shade-inspect',label:'Inspect the shaded opening'}],complete:false};
 if(s.stage==='settle')return {step:'Look back across the ledge',detail:'The neighbor has its own resting position. Inspect both places from your chosen opening.',actions:[{id:'shade-inspect',label:'Inspect both resting places'}],complete:false};
 return {step:'Choose your own space',detail:'Swim into another alcove or take the wider approach. Your position changes the neighbor’s movement; its sounds are not translated words.',actions:[{id:'shade-choose',value:'alcove',label:'Use the neighboring alcove'},{id:'shade-choose',value:'space',label:'Give the ledge more space'}],complete:false};
}
