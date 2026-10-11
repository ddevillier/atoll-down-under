import {nestScene,nestPhysicalPose} from './gramma-nest.js';
import {mouthPoint} from './feeding-contact.js';

export const NEST_LEDGE_ASSET='assets/story-nest/limestone-roof-v1.png';
const art=new WeakMap(),jaws=new WeakMap();
const active=sim=>['nest','gramma-nest'].includes(sim?.reefStories?.active)&&sim.player?.species?.id==='s3';
const TAU=Math.PI*2;

export function loadNestArt(renderer){
 let entry=art.get(renderer);if(entry)return entry.promise;
 entry={ledge:null,promise:null};art.set(renderer,entry);
 entry.promise=new Promise((resolve,reject)=>{
  const image=new Image();image.onload=()=>{entry.ledge=image;resolve();};
  image.onerror=()=>reject(new Error('Could not load painted nest roof: '+NEST_LEDGE_ASSET));image.src=NEST_LEDGE_ASSET;
 });return entry.promise;
}

// Only the painted mandible moves. Upper lip/contact point, eye, head markings,
// and the fin/tail rig retain their original landmarks and source pixels.
export const NEST_JAW=Object.freeze({polygon:[[.885,.55],[.963,.535],[1.03,.53],[1.03,.61],[.925,.67],[.885,.62]],root:[.89,.615],open:.24});
export function jawOpening(scene,time,reduced=false){
 if(!scene)return 0;
 const working=scene.job&&['pickup','place','clear','release','inspect'].includes(scene.job.kind);
 if(!working&&!scene.material.carried)return 0;
 return reduced?.45:scene.material.carried?.38:.25+.65*(.5+.5*Math.sin(time*9));
}
function jawPath(c,w,h){c.beginPath();NEST_JAW.polygon.forEach(([x,y],i)=>i?c.lineTo(x*w,y*h):c.moveTo(x*w,y*h));c.closePath();}
export function nestJawSprite(base,opening){
 if(!base||opening<=0||typeof document==='undefined')return base;
 const level=Math.max(1,Math.min(7,Math.round(opening*7)));
 let cache=jaws.get(base);if(!cache){cache=new Map();jaws.set(base,cache);}if(cache.has(level))return cache.get(level);
 const w=base.width,h=base.height,create=()=>{const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;return canvas;};
 const patch=create(),pc=patch.getContext('2d');pc.save();jawPath(pc,w,h);pc.clip();pc.drawImage(base,0,0);pc.restore();
 const cavity=create(),cc=cavity.getContext('2d');cc.drawImage(patch,0,0);cc.globalCompositeOperation='source-in';cc.fillStyle='#24143e';cc.fillRect(0,0,w,h);
 const result=create(),c=result.getContext('2d');c.drawImage(base,0,0);c.save();jawPath(c,w,h);c.clip();c.clearRect(0,0,w,h);c.restore();c.drawImage(cavity,0,0);
 const [x,y]=NEST_JAW.root;c.save();c.translate(x*w,y*h);c.rotate(NEST_JAW.open*level/7);c.drawImage(patch,-x*w,-y*h);c.restore();cache.set(level,result);return result;
}

/** A physical transform replaces decorative banking, yaw and hover in render.js. */
export function appearanceFor(renderer,sim,fish,time=0){
 if(fish!==sim?.player||!active(sim))return null;
 const scene=nestScene(sim);if(!scene)return null;
 const physical=nestPhysicalPose(sim,fish),feed=jawOpening(scene,time,renderer.reducedMotion);
 if(!physical&&!feed)return null;
 return {...physical,physical:!!physical,sprite:nestJawSprite(renderer.sprites?.[fish.species.index],feed),pose:{feed,brake:scene.job?.contact>0?.65:0,turn:0}};
}
export const poseFor=appearanceFor;

/** The attachment is the authoritative upper-lip landmark in both directions. */
export function materialFrame(sim){
 const scene=nestScene(sim);if(!scene)return null;
 const {material,state}=scene;
 if(material.carried&&active(sim)){
  const pose=nestPhysicalPose(sim,sim.player)||{rotation:0,facing:sim.player.facing||1};
  return {...mouthPoint(sim.player,pose),rotation:pose.rotation,facing:pose.facing,width:21,height:23,carried:true};
 }
 if(material.placed)return {x:material.x,y:material.y,rotation:state.side==='left'?-.52:.52,facing:state.side==='left'?1:-1,width:34,height:33,carried:false};
 return {x:material.x,y:material.y,rotation:-.16,facing:1,width:29,height:32,carried:false};
}
function drawTuft(c,sprite,frame,time,reduced){
 if(!sprite||!frame)return;
 c.save();c.translate(frame.x,frame.y);c.rotate(frame.rotation);c.scale(frame.facing,1);
 // Crop the existing algae painting above its rock. Its stalk crosses the mouth
 // origin; loose blades extend away from the upper lip, never toward a UI cue.
 const sway=reduced||frame.carried?0:Math.sin(time*.8)*.022;c.rotate(sway);
 c.drawImage(sprite,0,0,sprite.width,sprite.height*.74,-frame.width*.5,-frame.height*.42,frame.width,frame.height);c.restore();
}
function grains(c,point,removed,time,reduced,intensity=1){
 const clock=reduced?0:time,colors=['#c9b482','#e6d1a1','#938967'];
 for(let i=0;i<28;i++){
  const angle=i*2.399,spread=3+(i%7)*2.2;
  const drift=removed&&!reduced?Math.sin(clock*.55+i)*2:0;
  c.globalAlpha=(removed?.24:.62)*intensity;c.fillStyle=colors[i%3];c.beginPath();
  c.ellipse(point.x+Math.cos(angle)*spread+drift,point.y+Math.sin(angle)*spread*.35+(i%3),.55+i%3*.27,.35+i%2*.16,angle,0,TAU);c.fill();
 }c.globalAlpha=1;
}
function locator(renderer,point,label){
 const c=renderer.ctx,u=renderer.uiUnit||1;
 // Two small high-contrast contact ticks leave all of the painted target visible.
 c.save();c.lineCap='round';c.beginPath();for(const side of [-1,1]){c.moveTo(point.x+side*14,point.y+5);c.lineTo(point.x+side*14,point.y+11);c.lineTo(point.x+side*9,point.y+11);}
 c.strokeStyle='#153f44';c.lineWidth=3*u;c.stroke();c.strokeStyle='#f5e5b0';c.lineWidth=1.2*u;c.stroke();c.restore();
 renderer.tag?.(c,point.x,point.y+28*u,label,1,55);
}

/** Draw after animals in the world transform. No state, timers or awards change. */
export function drawStory(renderer,sim,time=0){
 const scene=nestScene(sim),c=renderer.ctx;if(!scene||!c)return;
 const {state:s,selected,job}=scene,playing=active(sim),reduced=!!renderer.reducedMotion;
 const ledge=art.get(renderer)?.ledge;
 c.save();
 // The real painted roof supplies occlusion. Both roof undersides are aligned to
 // mechanics, with supports outside the usable 170-unit opening.
 if(ledge)for(const l of scene.ledges)c.drawImage(ledge,l.x-l.width*.8,l.roofY-62,l.width*1.6,156);
 if(selected){
  if(!s.cleared&&job?.kind!=='release')grains(c,selected.clear,false,time,reduced,job?.kind==='clear'?Math.max(.25,1-job.contact/1.1):1);
  if(s.cleared)grains(c,{x:selected.x+(s.side==='left'?85:-85),y:selected.openingY+72},true,time,reduced);
 }
 if(scene.material.available||scene.material.placed||scene.material.carried&&playing)drawTuft(c,renderer.foodSprites?.[0],materialFrame(sim),time,reduced);
 if(job?.kind==='release')grains(c,job.mouth,true,time,reduced,2);
 if(playing){
  if(s.stage==='choose')for(const l of scene.ledges)locator(renderer,l.inspect,'Ledge '+(l.index+1));
  else if(s.stage==='gather')locator(renderer,scene.material,'Loose lining');
  else if(s.stage==='carry'&&selected){locator(renderer,selected.sockets.left,'Left edge');locator(renderer,selected.sockets.right,'Right edge');}
  else if(s.stage==='clear'&&selected)locator(renderer,selected.clear,'Entrance silt');
  else if(s.stage==='inspect'&&selected)locator(renderer,selected.inspect,'Inspect nest');
 }
 c.restore();
}
