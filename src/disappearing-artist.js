import {REEFS} from './data.js';
import {WORLD_WIDTH,WORLD_HEIGHT} from './world-dimensions.js';

// Coordinates follow the painted reef images, scaled to 1600 x 900 and offset
// by the renderer's 55px playfield inset. These are scenery, never new animals.
export const ARTIST_SITES=Object.freeze([
 {id:'pearl-sand',reef:7,x:465,y:315,r:65,kind:'sand',name:'Open pale sand'},
 {id:'pearl-shadow',reef:7,x:1030,y:410,r:65,kind:'shadow',name:'Shadow under the coral shelf'},
 {id:'pearl-rock',reef:7,x:725,y:95,r:60,kind:'mottled',name:'Speckled rock beside the sand'},
 {id:'fan-shadow',reef:3,x:435,y:270,r:65,kind:'shadow',name:'Shade beneath the sea fan ledge'},
 {id:'fan-rock',reef:3,x:570,y:115,r:60,kind:'mottled',name:'Mottled reef ledge'},
 {id:'wreck-sand',reef:5,x:325,y:700,r:55,kind:'sand',name:'Sand beside the wreck'},
 {id:'wreck-shadow',reef:5,x:350,y:380,r:65,kind:'shadow',name:'Dark wreck recess'},
 {id:'wreck-timber',reef:5,x:820,y:210,r:60,kind:'mottled',name:'Encrusted wreck timber'}
]);
const patterns=['sand','shadow','mottled'];
const phases=['choose','pattern','waiting','passing','noticed','overlooked','complete'];
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const state=sim=>sim.reefStories?.artist;
const active=sim=>sim.reefStories?.active==='artist'&&sim.player?.species?.id==='s19';
const playing=sim=>active(sim)&&sim.phase==='playing'&&!sim.paused&&sim.player.alive!==false&&sim.player.health>0&&sim.player.energy>0;
const patch=s=>ARTIST_SITES.find(p=>p.id===s?.site&&p.reef===s?.reef);
const event=(sim,text)=>sim.event('message',text);
const validId=id=>typeof id==='string'&&id.length>0&&id.length<100||Number.isInteger(id)&&id>=0&&id<1e9;
const bounded=(n,max)=>Number.isFinite(n)&&n>=0&&n<=max;
const onlyKeys=(o,keys)=>Object.keys(o).every(k=>keys.includes(k));
const point=p=>!!p&&typeof p==='object'&&!Array.isArray(p)&&bounded(p.x,WORLD_WIDTH)&&bounded(p.y,WORLD_HEIGHT);

export function validStory(s){
 if(s==null)return true;
 if(typeof s!=='object'||Array.isArray(s)||s.version!==1||!phases.includes(s.phase)||!onlyKeys(s,['version','phase','reef','site','pattern','anchor','settle','match','observer','pass','successes','attempts','outcome','logged']))return false;
 if(!(s.reef===null||[3,5,7].includes(s.reef))||!(s.site===null||!!patch(s))||!(s.pattern===null||patterns.includes(s.pattern))||!(s.anchor===null||point(s.anchor)&&onlyKeys(s.anchor,['x','y'])))return false;
 if(!bounded(s.settle,2)||!bounded(s.match,1)||!Number.isInteger(s.attempts)||!bounded(s.attempts,999)||typeof s.logged!=='boolean')return false;
 if(!Array.isArray(s.successes)||s.successes.length>3||s.successes.some(p=>!patterns.includes(p))||new Set(s.successes).size!==s.successes.length)return false;
 if(![null,'noticed','overlooked','moved','unavailable'].includes(s.outcome))return false;
 if(s.observer!==null&&(!s.observer||!validId(s.observer.id)||!Number.isInteger(s.observer.incarnation)||!bounded(s.observer.incarnation,1e6)||!onlyKeys(s.observer,['id','incarnation'])))return false;
 if(s.pass!==null&&(!point(s.pass)||!point({x:s.pass.endX,y:s.pass.endY})||!bounded(s.pass.closest,9999)||!bounded(s.pass.elapsed,60)||typeof s.pass.crossed!=='boolean'||typeof s.pass.seen!=='boolean'||!onlyKeys(s.pass,['x','y','endX','endY','closest','elapsed','crossed','seen'])))return false;
 if(['waiting','passing'].includes(s.phase)&&(!patch(s)||!s.pattern||!s.anchor))return false;
 if(s.phase==='passing'&&(!s.observer||!s.pass))return false;
 if(s.phase==='complete'&&s.successes.length!==3)return false;
 return s.logged===(s.successes.length===3);
}
export function initStory(sim){
 if(sim.player?.species?.id!=='s19'||!sim.reefStories)return false;
 sim.reefStories.artist={version:1,phase:'choose',reef:null,site:null,pattern:null,anchor:null,settle:0,match:0,observer:null,pass:null,successes:[],attempts:0,outcome:null,logged:false};
 return true;
}
export function artistSites(sim){return ARTIST_SITES.filter(p=>p.reef===sim.current).map(p=>({...p}));}
export function artistMatch(sim){
 const s=state(sim),p=sim.player,site=patch(s);
 if(!active(sim)||!site||s.reef!==sim.current||!s.pattern||distance(p,site)>site.r)return 0;
 const base=s.pattern===site.kind?1:s.pattern==='shadow'||site.kind==='shadow'?.16:.32;
 // A disguise covers a real patch: the edge is a weaker match than its centre.
 return clamp(base*(1-.25*distance(p,site)/site.r),0,1);
}
function reveal(sim){
 const p=sim.player;
 if(p.blending?.story==='artist'){p.blending=null;p.blendTime=0;p.hidden=false;}
}
function releaseObserver(sim,s,clear=true){
 const e=sim.section.entities.find(e=>e.id===s.observer?.id&&(e.incarnation||0)===s.observer?.incarnation);
 if(e?.behavior?.startsWith('Camouflage observer')){e.behavior='Cruising';e.activity='cruising';e.think=0;}
 if(clear){s.observer=null;s.pass=null;}
}
function resetRound(sim,s){reveal(sim);releaseObserver(sim,s);s.anchor=null;s.settle=0;s.match=0;s.outcome=null;s.phase=s.site?'pattern':'choose';}
function selectPatch(sim,s,site,route){
 resetRound(sim,s);s.reef=site.reef;s.site=site.id;s.pattern=null;s.phase='pattern';
 if(route)sim.pointer={x:site.x,y:site.y};
 event(sim,'Look at the '+site.name.toLowerCase()+'. Choose a skin pattern, then stay still here.');
}
function beginDisguise(sim,s){
 const site=patch(s),p=sim.player;
 if(!site||site.reef!==sim.current||distance(p,site)>site.r){event(sim,'Swim inside your chosen background before trying the disguise.');return false;}
 if(!s.pattern){event(sim,'Choose pale sand, deep shadow, or mottled skin.');return false;}
 resetRound(sim,s);s.anchor={x:p.x,y:p.y};s.phase='waiting';s.attempts=Math.min(999,s.attempts+1);
 p.target=null;p.cleanerTarget=null;p.cleanTime=0;sim.pointer={x:p.x,y:p.y};
 p.blending={kind:s.pattern==='sand'?'sand':'reef',x:p.x,y:p.y,story:'artist'};p.blendTime=0;
 event(sim,'Hold your chosen pattern. A reef neighbor can pass without being called or fed.');return true;
}
export function storyAction(sim,action,value){
 if(!playing(sim)||!state(sim))return false;
 const s=state(sim);
 if(action==='site'){
  const site=artistSites(sim).find(p=>p.id===value);
  if(!site)return false;selectPatch(sim,s,site,true);return true;
 }
 if(action==='pattern'){
  if(!patterns.includes(value)||!patch(s)||s.reef!==sim.current)return false;
  resetRound(sim,s);s.pattern=value;return beginDisguise(sim,s);
 }
 if(action==='retry'){resetRound(sim,s);return true;}
 if(action==='context'){
  if(['waiting','passing'].includes(s.phase)){resetRound(sim,s);event(sim,'Swimming freely again. Try another pattern whenever you like.');return true;}
  const site=artistSites(sim).filter(site=>distance(sim.player,site)<=site.r).sort((a,b)=>distance(sim.player,a)-distance(sim.player,b))[0];
  if(!site){event(sim,'Find sand, shade, or a mottled surface in Pearl Sands, Sea Fan Garden, or the Old Wreck.');return true;}
  if(s.site!==site.id){selectPatch(sim,s,site,false);return true;}
  beginDisguise(sim,s);return true;
 }
 return false;
}
// This story observes disguise; meals always go through the normal food system.
export function storyMeal(){}
function eligible(e){return e.alive&&e.species?.speed>0&&e.species.playable!==false&&!e.species.diet.includes('fish')&&e.species.ability!=='clean'&&!e.groundRoute&&!e.holdfast&&!e.hidden&&!e.target&&!e.feeding&&!e.cleanTime&&!e.stun&&e.activity!=='avoiding'&&!e.behavior?.startsWith('Moving away');}
function recruitObserver(sim,s){
 const site=patch(s),candidates=sim.section.entities.filter(eligible).sort((a,b)=>distance(a,site)-distance(b,site)),e=candidates[0];
 if(!e)return false;
 // Take one calm existing swimmer along a short passing route, without a lure,
 // spawning, changing its diet, or teleporting it to the player's hiding place.
 const y=clamp(site.y+(site.y>WORLD_HEIGHT-150?-80:80),30,WORLD_HEIGHT-25),x=site.x;
 let dx=x-e.x,dy=y-e.y,d=Math.hypot(dx,dy);if(d<1){dx=e.facing||1;dy=0;d=1;}
 s.observer={id:e.id,incarnation:e.incarnation||0};s.pass={x,y,endX:clamp(x+(e.x<=x?1:-1)*280,20,WORLD_WIDTH-20),endY:y,closest:9999,crossed:false,seen:false,elapsed:0};s.phase='passing';
 return true;
}
function finishPass(sim,s){
 const seen=s.pass.seen;s.outcome=seen?'noticed':'overlooked';s.phase=s.outcome;
 const e=sim.section.entities.find(e=>e.id===s.observer?.id),name=e?.species.name||'Your reef neighbor';
 if(seen)event(sim,name+' noticed your outline. Try a pattern closer to this background; there is no penalty.');
 else{
  if(!s.successes.includes(patch(s).kind))s.successes.push(patch(s).kind);
  event(sim,name+' looked past you and continued swimming. Your '+s.pattern+' disguise matched this place.');
  if(s.successes.length===3){s.phase='complete';if(!s.logged){s.logged=true;sim.event('discovery','The Disappearing Artist · Three backgrounds, three quiet disguises.',{value:'disappearing-artist'});}}
 }
 releaseObserver(sim,s,false);
}
export function tickStory(sim,dt){
 if(!playing(sim)||!state(sim)||!Number.isFinite(dt)||dt<=0)return;
 const s=state(sim),p=sim.player;
 if(!['waiting','passing'].includes(s.phase)){
  if(p.blending?.story==='artist'){
   if(s.reef!==sim.current||!s.anchor||distance(p,s.anchor)>3||p.target||p.cleanerTarget||p.abilityTime>0||p.stun>0)reveal(sim);
   else p.activity='blending';
  }
  return;
 }
 if(s.reef!==sim.current||!s.anchor||distance(p,s.anchor)>3||p.target||p.cleanerTarget||p.abilityTime>0||p.stun>0||p.blending?.story!=='artist'){
  const seen=s.phase==='passing'&&s.pass.closest<=145;
  resetRound(sim,s);s.outcome='moved';if(seen)s.phase='noticed';
  event(sim,seen?'Your movement caught your neighbor’s eye. Settle again for another try.':'Swimming reveals your outline. Choose your pattern and settle again.');return;
 }
 s.match=artistMatch(sim);s.settle=Math.min(2,s.settle+Math.min(dt,.1));
 p.blendTime=s.match>=.72?s.settle:Math.min(1.8,s.settle);p.hidden=s.settle>=2&&s.match>=.72;p.activity='blending';
 if(s.phase==='waiting'&&s.settle>=2){
  if(!recruitObserver(sim,s)){s.outcome='unavailable';}
  else s.outcome=null;
 }
 if(s.phase==='passing'){
  const e=sim.section.entities.find(e=>e.id===s.observer.id&&(e.incarnation||0)===s.observer.incarnation);
  if(e?.alive&&s.pass.seen&&s.pass.closest<=145&&(e.activity==='avoiding'||e.behavior?.startsWith('Moving away'))){finishPass(sim,s);return;}
  if(!e?.alive||e.target||e.stun>0||!eligible(e)){resetRound(sim,s);s.outcome='unavailable';event(sim,'Your neighbor is busy now. Settle again when another swimmer is free.');}
 }
}
export function storyNPC(sim,e,dt){
 const s=state(sim);
 if(!playing(sim)||s?.phase!=='passing'||s.reef!==sim.current||e.id!==s.observer?.id||(e.incarnation||0)!==s.observer.incarnation||!eligible(e)||!Number.isFinite(dt)||dt<=0)return false;
 const p=sim.player,pass=s.pass;
 // Evaluate displacement before the story tick too: movement cannot earn an
 // overlooked result merely because the NPC updates earlier in this frame.
 const exposed=!s.anchor||distance(p,s.anchor)>3||p.target||p.abilityTime>0||p.blending?.story!=='artist';
 pass.elapsed=Math.min(60,pass.elapsed+dt);pass.closest=Math.min(pass.closest,distance(e,p));
 if(exposed&&pass.closest<=145||distance(e,p)<=145&&(exposed||artistMatch(sim)<.72||s.settle<2))pass.seen=true;
 let dest=pass.crossed?{x:pass.endX,y:pass.endY}:pass;
 const dx=dest.x-e.x,dy=dest.y-e.y,d=Math.hypot(dx,dy),advance=Math.min(d,clamp(e.species.speed*.55,35,80)*Math.min(dt,.1));
 if(d>0){e.angle=Math.atan2(dy,dx);e.x+=dx/d*advance;e.y+=dy/d*advance;e.facing=dx>=0?1:-1;}
 e.activity='cruising';e.behavior='Camouflage observer · '+(pass.seen?'noticed an outline':pass.closest<=145?'looking past the disguise':'passing the background');
 if(!pass.crossed&&distance(e,pass)<5)pass.crossed=true;
 if(pass.crossed&&pass.closest<=145&&distance(e,p)>175){finishPass(sim,s);return true;}
 if(pass.elapsed>=60||pass.crossed&&distance(e,{x:pass.endX,y:pass.endY})<5&&pass.closest>145){resetRound(sim,s);s.outcome='unavailable';event(sim,'That neighbor passed too far away. Choose a spot nearer the middle of the background and try again.');}
 return true;
}
export function storyView(sim){
 const s=state(sim),sites=artistSites(sim);
 if(!s)return {step:'Choose a background',detail:'Begin the Disappearing Artist to try a quiet disguise.',actions:[],complete:false};
 const site=patch(s),complete=s.successes.length===3;
 let step='Choose a real background',detail=sites.length?'Swim to pale sand, a shaded recess, or a mottled surface. E chooses a nearby background.':'Explore Pearl Sands, Sea Fan Garden, or the Old Wreck to find a background.';
 let actions=sites.map(p=>({id:'site',label:p.name,value:p.id}));
 if(s.phase==='pattern'){
  step='Choose your skin pattern';detail=(site?.name||'Background')+' · '+(s.outcome==='moved'?'Movement revealed you. Settle again for a gentle retry.':s.outcome==='unavailable'?'A neighbor was busy or too far away. Try again.':'Look at the surface, then choose a pattern. Matching the texture matters.');
  actions=patterns.map(value=>({id:'pattern',label:{sand:'Pale sand',shadow:'Deep shadow',mottled:'Mottled skin'}[value],value})).concat(sites.map(p=>({id:'site',label:p.name,value:p.id})));
 }else if(['waiting','passing'].includes(s.phase)){
  step=s.phase==='waiting'?'Become still':'Let your neighbor pass';detail=s.outcome==='unavailable'?'No calm swimmer is free yet. You can try another background.':s.phase==='waiting'?'Your skin is settling. Swimming or using ink exposes your outline.':'Match '+Math.round(s.match*100)+'% · Stay still while the live swimmer looks across this background.';actions=[{id:'context',label:'Leave disguise'}];
 }else if(s.phase==='noticed'||s.phase==='overlooked'){
  step=s.phase==='noticed'?'Your neighbor noticed':'Your neighbor looked past';detail=s.phase==='noticed'?'A different pattern or a quieter position can help. There is no penalty for experimenting.':s.successes.length+'/3 backgrounds quietly matched. Try another kind of background.';actions=[{id:'retry',label:'Try a pattern again'},...sites.map(p=>({id:'site',label:p.name,value:p.id}))];
 }else if(s.phase==='complete'){
  step='A disappearing artist';detail='Sand, shade, and mottled surfaces each held a quiet disguise. Your discovery is in the journal.';actions=sites.map(p=>({id:'site',label:'Try '+p.name.toLowerCase(),value:p.id}));
 }
 return {step,detail,actions,complete};
}




