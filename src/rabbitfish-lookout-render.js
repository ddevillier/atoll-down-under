import {LOOKOUT_SITES} from './rabbitfish-lookout.js';
import {PaintedParts,PART_RIGS,partTransform} from './part-motion.js';
import {rigFor} from './animal-rigs.js';
import {creaturePickFrame} from './geometry.js';
import {feedingEnvelope} from './feeding-motion.js';

export const LOOKOUT_RABBITFISH_ASSET='assets/story-lookout/pencilled-rabbitfish-v1.png';
const caches=new WeakMap(),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const wrap=n=>Math.atan2(Math.sin(n),Math.cos(n));
const living=e=>e&&e.alive!==false&&e.health>0&&!e.hidden&&!(e.stun>0)&&!e.cleanTime&&!e.cleanerTarget&&e.activity!=='avoiding';
function cache(renderer){let c=caches.get(renderer);if(!c){c={parts:new PaintedParts(),frames:new Map(),sprite:null,promise:null};caches.set(renderer,c);}return c;}

/** The catalog identity correction also applies outside this optional story. */
export function loadLookoutArt(renderer){
 const c=cache(renderer);if(c.promise)return c.promise;
 c.promise=new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{try{
  c.sprite=renderer.extractCell(im,0,1,1,true);
  renderer.sprites[52]=c.sprite;renderer.bounds[52]={x:0,y:0,w:c.sprite.width,h:c.sprite.height};
  resolve();
 }catch(error){reject(error);}};im.onerror=()=>reject(new Error('Could not load pencilled rabbitfish illustration: '+LOOKOUT_RABBITFISH_ASSET));im.src=LOOKOUT_RABBITFISH_ASSET;});
 return c.promise;
}
function scene(sim){
 const s=sim?.reefStories?.lookout;
 if(sim?.reefStories?.active!=='lookout'||!s||sim.current!==s.reef||!['s8','s52'].includes(sim.player?.species?.id)||!living(sim.player))return null;
 return s;
}
function actor(sim,ref){
 if(!ref||ref.reef!==sim.current)return null;
 return sim.section?.entities.find(e=>e.id===ref.id&&(e.incarnation||0)===ref.incarnation&&e.species.id===ref.species&&living(e))||null;
}

/** Pure, bounded posture parameters. No displayed transform enters feeding physics. */
export function poseFor(renderer,sim,fish,time=0){
 const s=scene(sim),buddy=s&&actor(sim,s.buddy),site=LOOKOUT_SITES.find(p=>p.id===s?.site&&p.reef===s?.reef);
 if(!s||!buddy||!site||!living(fish)||!['s8','s52'].includes(fish.species.id)||!['watch','signal','partner-feed','swap','player-feed','relocating'].includes(s.phase))return null;
 const player=fish===sim.player;if(!player&&fish!==buddy)return null;
 if(['busy','partner-away'].includes(s.status)||fish.feeding&&(!fish.feeding.committed&&s.phase==='swap'))return null;
 const facing=fish.facing===-1?-1:1,reduced=renderer.reducedMotion,clock=reduced?0:time;
 const playerWatch=player&&s.role==='player'&&['watch','signal','partner-feed'].includes(s.phase);
 const partnerWatch=!player&&s.role==='partner'&&['swap','player-feed'].includes(s.phase)&&!fish.target&&!fish.feeding;
 const rise=partnerWatch?clamp(1-distance(fish,site.lookout)/100,0,1):playerWatch?1:0;
 const watch=rise>0;
 const aim=playerWatch&&Number.isFinite(s.aim)?s.aim:Math.atan2(site.lookout.y-site.y,site.lookout.x-site.x);
 const attention=clamp(wrap(aim+Math.PI/2),-.18,.18);
 const signal=playerWatch&&s.phase==='signal'&&s.cueClicked===true;
 // Upright vigilance is a held animal posture. The departing grazer rises as
 // its real route reaches the lookout; meals retain the level contact frame.
 const rotation=watch?(-1.12*facing+attention)*rise:0;
 const feed=watch?0:feedingEnvelope(fish);
 const gaze=watch?{x:Math.cos(aim-rotation)*facing,y:Math.sin(aim-rotation)}:{x:.55,y:.45};
 return {rotation,role:watch?'watch':s.phase==='swap'?'swap':'graze',rise,aim,gaze,
  clock,effort:watch?.08:s.phase==='relocating'?.6:.22,brake:watch?.72:.18,turn:attention,
  signal,finClock:signal?(reduced?.23/PART_RIGS[fish.species.id].frequency:clock*1.6):clock,feed};
}

function surface(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function paint(renderer,fish,source,pose){
 const c=cache(renderer),key=fish===renderer.currentSimulation?.player?'player':fish.id;
 let entry=c.frames.get(key);
 if(!entry||entry.source!==source){entry={source,canvas:surface(source.width,source.height)};c.frames.set(key,entry);}
 // Only a player and the bound companion receive a composited frame. Stale
 // identities cannot leave an accumulating image cache across encounters.
 if(c.frames.size>4)for(const k of c.frames.keys()){if(k!==key){c.frames.delete(k);break;}}
 // A paused or reduced-motion frame is reused at native resolution. Render
 // calls may repeat without any physical pose, eye or fin parameter changing.
 const signature=[pose.clock,pose.finClock,pose.effort,pose.brake,pose.turn,pose.feed,pose.gaze.x,pose.gaze.y,pose.signal].join(':');
 if(entry.signature===signature)return entry.canvas;
 entry.signature=signature;
 const out=entry.canvas,ctx=out.getContext('2d'),w=out.width,h=out.height;
 const {body,pieces}=c.parts.prepare(source,fish.species.id);
 ctx.clearRect(0,0,w,h);ctx.drawImage(body,0,0,w,h);
 for(const p of pieces){
  const isSide=p.name==='pectoral',signal=pose.signal&&isSide;
  const state={brake:signal?.06:pose.brake,turn:pose.turn,feed:pose.feed};
  const effort=signal?.8:pose.effort;
  const m=partTransform(fish.species.id,p,w,h,signal?pose.finClock:pose.clock,effort,state);
  ctx.save();ctx.transform(...m.matrix);ctx.drawImage(p.canvas,p.left/source.width*w-m.ax,p.top/source.height*h-m.ay,p.canvas.width/source.width*w,p.canvas.height/source.height*h);ctx.restore();
 }
 // Move only the small painted pupil within its own painted iris. The eye
 // contour, facial bands, jaw and all mouth landmarks remain rigid.
 const [ex,ey]=rigFor({id:fish.species.id}).eye,px=ex*w,py=ey*h,r=w*.021;
 ctx.save();ctx.beginPath();ctx.ellipse(px,py,r,r*.9,0,0,Math.PI*2);ctx.clip();
 const dx=pose.gaze.x*w*.0045,dy=pose.gaze.y*h*.007;
 ctx.drawImage(source,px-r*1.5,py-r*1.5,r*3,r*3,px-r*1.5+dx,py-r*1.5+dy,r*3,r*3);ctx.restore();
 return out;
}

/** Called for every fish. Active role frames are already articulated paintings. */
export function appearanceFor(renderer,sim,fish,time=0){
 const corrected=fish?.species?.id==='s52'?cache(renderer).sprite:null;
 const source=corrected||renderer.sprites?.[fish?.species?.index];
 const pose=poseFor(renderer,sim,fish,time);
 if(!pose)return corrected?{sprite:corrected,spriteBounds:{x:0,y:0,w:corrected.width,h:corrected.height}}:null;
 if(!source||typeof document==='undefined')return {rotation:pose.rotation,physical:true,pose,role:pose.role};
 const sprite=paint(renderer,fish,source,pose);
 return {sprite,spriteBounds:{x:0,y:0,w:sprite.width,h:sprite.height},articulated:true,physical:true,rotation:pose.rotation,pose,role:pose.role};
}

function line(ctx,color,width,alpha,draw){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.globalAlpha=alpha;ctx.beginPath();draw();ctx.stroke();}
function outlined(ctx,unit,draw,alpha=1,color='#e9e7ba'){line(ctx,'#103944',3.8*unit,.68*alpha,draw);line(ctx,color,1.5*unit,.95*alpha,draw);}
function berth(renderer,site,selected,choose){
 const c=renderer.ctx,u=Math.min(1.55,renderer.uiUnit||1);
 // Open brackets mark the two real food ledges and the lookout above each.
 outlined(c,u,()=>{c.moveTo(site.x-27,site.y+14);c.quadraticCurveTo(site.x,site.y+23,site.x+27,site.y+14);},selected?1:.48);
 const l=site.lookout;outlined(c,u,()=>{c.moveTo(l.x-20,l.y+7);c.lineTo(l.x-20,l.y+14);c.lineTo(l.x-11,l.y+14);c.moveTo(l.x+20,l.y+7);c.lineTo(l.x+20,l.y+14);c.lineTo(l.x+11,l.y+14);},selected?1:.55);
 if(choose)renderer.tag?.(c,l.x,l.y-37*u,site.id==='crest-open'?'Open ledge':'Sheltered nook',1,55);
}
function roleMark(renderer,fish,watch){
 const c=renderer.ctx,u=Math.min(1.55,renderer.uiUnit||1),f=creaturePickFrame(fish);
 const y=Math.max(22,fish.y-Math.max(34,f.width*.48)-15*u),x=fish.x;
 // An eye for the lookout, three short blades for the real grazer. Shape
 // carries the roles in muted/reduced-motion play without extra reef prose.
 outlined(c,u,()=>{if(watch){c.moveTo(x-8*u,y);c.quadraticCurveTo(x,y-7*u,x+8*u,y);c.quadraticCurveTo(x,y+7*u,x-8*u,y);}else{for(const dx of [-5,0,5]){c.moveTo(x+dx*u,y+5*u);c.quadraticCurveTo(x+(dx-2)*u,y,x+(dx+1)*u,y-5*u);}}});
 if(watch){c.fillStyle='#e9e7ba';c.globalAlpha=1;c.beginPath();c.arc(x,y,1.9*u,0,Math.PI*2);c.fill();}
}

/** Local legible role/sightline cues, never a second animal or a progress award. */
export function drawStory(renderer,sim,time=0){
 const s=scene(sim),c=renderer.ctx;if(!s||!c)return;
 const site=LOOKOUT_SITES.find(p=>p.id===s.site&&p.reef===sim.current),buddy=actor(sim,s.buddy);
 c.save();c.lineCap='round';c.lineJoin='round';
 const choose=['choose','approach','relocating'].includes(s.phase);
 if(choose)for(const p of LOOKOUT_SITES)if(p.reef===sim.current)berth(renderer,p,p===site,true);
 else if(site&&!['complete','unavailable'].includes(s.phase))berth(renderer,site,true,false);
 if(site&&buddy&&['watch','signal','partner-feed','swap','player-feed'].includes(s.phase)){
  const playerWatch=s.role==='player',watcher=playerWatch?sim.player:buddy,grazer=playerWatch?buddy:sim.player;
  roleMark(renderer,watcher,true);roleMark(renderer,grazer,false);
  if(playerWatch){
   const p=poseFor(renderer,sim,watcher,time),u=Math.min(1.55,renderer.uiUnit||1),aim=p?.aim??-Math.PI/2;
   const sx=watcher.x+Math.cos(aim)*35,sy=watcher.y+Math.sin(aim)*35;
   // Two separated strokes show attention, leaving all animal paint clear.
   outlined(c,u,()=>{c.moveTo(sx,sy);c.lineTo(sx+Math.cos(aim)*18,sy+Math.sin(aim)*18);},.5);
   const passer=actor(sim,s.passer);
   if(s.phase==='signal'&&passer){const f=creaturePickFrame(passer);outlined(c,u,()=>{c.moveTo(passer.x-f.width*.38,passer.y-f.height*.6-10);c.quadraticCurveTo(passer.x,passer.y-f.height*.6-17,passer.x+f.width*.38,passer.y-f.height*.6-10);},1,'#d4ecc9');}
  }
 }
 c.restore();
}
