import {COLONY,housekeeperPose} from './coral-housekeeper.js';
import {displayedMouthPoint} from './feeding-contact.js';

export const HOUSEKEEPER_ASSET='assets/story-housekeeper/pocillopora-damicornis-v1.png';
export const COLONY_PAINT=Object.freeze({x:COLONY.x-124,y:COLONY.y-88,width:248,height:184});
const art=new WeakMap(),TAU=Math.PI*2;
const clamp=(x,lo=0,hi=1)=>Math.max(lo,Math.min(hi,x));
const noise=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
const active=sim=>sim?.reefStories?.active==='housekeeper'&&sim.player?.species?.id==='s30';
const local=sim=>sim?.current===COLONY.reef&&sim?.reefStories?.housekeeper?.site===COLONY.id;

/** Real painted coral is loaded once. There is deliberately no geometric coral fallback. */
export function loadHousekeeperArt(renderer){
 let entry=art.get(renderer);if(entry)return entry.promise;
 entry={sprite:null,patches:[],frames:new Map(),promise:null};art.set(renderer,entry);
 entry.promise=new Promise((resolve,reject)=>{
  const image=new Image();
  image.onload=()=>{try{
   entry.sprite=renderer.extractCell(image,0,1,1,true);
   // Sample the actual branch silhouette at twice world resolution. Dust can
   // never cover transparent water between branches or manufacture coral.
   entry.patches=COLONY.pockets.map(p=>{
    const span=58,canvas=document.createElement('canvas');canvas.width=canvas.height=span*2;
    const c=canvas.getContext('2d',{willReadFrequently:true}),x=p.x-span/2,y=p.y-span/2;
    c.drawImage(entry.sprite,(COLONY_PAINT.x-x)*2,(COLONY_PAINT.y-y)*2,COLONY_PAINT.width*2,COLONY_PAINT.height*2);
    return {x,y,span,width:canvas.width,source:c.getImageData(0,0,canvas.width,canvas.height)};
   });resolve();
  }catch(error){reject(error);}};
  image.onerror=()=>reject(new Error('Could not load painted Pocillopora colony: '+HOUSEKEEPER_ASSET));
  image.src=HOUSEKEEPER_ASSET;
 });return entry.promise;
}

/** Deterministic scumbled sediment, constrained by the source painting's alpha. */
export function sedimentPixel(rgba,x,y,pocket,progress=0,direction=pocket.outward){
 if(rgba[3]===0||progress>=1)return [0,0,0,0];
 const dx=(x-pocket.x)/pocket.radius,dy=(y-pocket.y)/(pocket.radius*.82);
 const fleck=noise(Math.floor(x*2),Math.floor(y*2));
 const edge=clamp((1.22-Math.hypot(dx,dy))/.34);
 const rank=clamp((dx*dx+dy*dy)*.60+(direction==='left'?dx+1:1-dx)*.14+fleck*.10);
 if(edge===0||progress>rank)return [0,0,0,0];
 const light=(rgba[0]*.2126+rgba[1]*.7152+rgba[2]*.0722)/255;
 // Preserve painted surface lighting beneath the dust. The irregular matte
 // exposes that same polyp texture progressively; it never adds a new branch.
 const shade=.53+light*.33+fleck*.16;
 return [Math.round(222*shade),Math.round(195*shade),Math.round(144*shade),Math.round(rgba[3]*edge*(.70+fleck*.24))];
}
function dustFrame(entry,id,progress,direction){
 const band=Math.min(16,Math.floor(clamp(progress)*16)),key=id+':'+direction+':'+band;
 if(entry.frames.has(key))return entry.frames.get(key);
 const patch=entry.patches[id],canvas=document.createElement('canvas');canvas.width=canvas.height=patch.width;
 const c=canvas.getContext('2d'),pixels=c.createImageData(patch.width,patch.width),pocket=COLONY.pockets[id];
 for(let y=0;y<patch.width;y++)for(let x=0;x<patch.width;x++){
  const i=(y*patch.width+x)*4;
  pixels.data.set(sedimentPixel(patch.source.data.subarray(i,i+4),patch.x+x/2,patch.y+y/2,pocket,band/16,direction),i);
 }
 c.putImageData(pixels,0,0);entry.frames.set(key,canvas);return canvas;
}

/** Authoritative horizontal contact plus inputs to the existing painted fin/jaw rig. */
export function poseFor(sim,fish,time=0,reducedMotion=false){
 if(fish!==sim?.player)return null;
 const contact=housekeeperPose(sim);if(!contact)return null;
 const pulse=reducedMotion ? .68 : .55+.22*Math.sin(contact.progress*TAU*2);
 return {...contact,feed:pulse,effort:.72,brake:.48,anchored:true};
}
export function appearanceFor(renderer,sim,fish,time=0){
 const pose=poseFor(sim,fish,time,renderer?.reducedMotion);
 return pose?{rotation:pose.rotation,facing:pose.facing,pose}:null;
}

/** Particle positions follow recorded contact time, never the wall clock. */
export function plumeParticles(sim,reducedMotion=false){
 if(!local(sim))return [];
 const s=sim.reefStories.housekeeper,contact=housekeeperPose(sim);
 const working=!!contact&&s.selected!==null;
 const id=working?s.selected:s.plumePocket,pocket=COLONY.pockets[id];
 if(!pocket||!working&&!(s.plume>0))return [];
 const direction=working?s.direction:s.plumeDirection,sign=direction==='left'?-1:1;
 const origin=working?displayedMouthPoint(sim.player):pocket;
 const inward=direction!==pocket.outward;
 if(reducedMotion)return Array.from({length:6},(_,i)=>({x:origin.x+sign*(3+i*3),y:origin.y+(i%3-1)*2.4,r:.7+(i%2)*.35,alpha:.70-i*.06}));
 const elapsed=working?s.elapsed:1.2+(1.6-s.plume),particles=[];
 for(let i=0;i<28;i++){
  const release=i*.036,age=elapsed-release;if(age<0||age>1.25)continue;
  const fan=noise(id*83+i,12)-.5,travel=age*(inward?28:55);
  particles.push({x:origin.x+sign*(2+travel),y:origin.y+fan*(3+travel*.38)+age*age*(inward?21:5),r:.45+noise(i,19)*.65,alpha:clamp(1-age/1.25)*.78});
 }return particles;
}
function locator(renderer,p,label,selected){
 const c=renderer.ctx,unit=Math.min(1.45,renderer.uiUnit||1),span=p.radius+6;
 c.lineCap='round';c.beginPath();
 for(const sign of [-1,1]){c.moveTo(p.x+sign*span,p.y-5);c.lineTo(p.x+sign*span,p.y+5);c.lineTo(p.x+sign*(span-4),p.y+8);}
 c.strokeStyle='#103943';c.lineWidth=3.4*unit;c.stroke();
 c.strokeStyle=selected?'#f6e9b6':'#cee4d0';c.lineWidth=1.2*unit;c.stroke();
 renderer.tag?.(c,p.x,p.y-span-9*unit,label,1,selected?70:40);
}

/** Pure world presentation. Edited colony persists after Stop and on reef return. */
export function drawStory(renderer,sim,time=0,{layer='all'}={}){
 if(!renderer?.ctx||!local(sim))return;
 const entry=art.get(renderer);if(!entry?.sprite)return;
 const c=renderer.ctx,s=sim.reefStories.housekeeper,contact=housekeeperPose(sim);
 c.save();
 if(layer!=='effects'){
 c.drawImage(entry.sprite,COLONY_PAINT.x,COLONY_PAINT.y,COLONY_PAINT.width,COLONY_PAINT.height);
 for(const p of COLONY.pockets){
  if(s.mask[p.id])continue;
  const clearing=contact&&s.selected===p.id&&s.direction===p.outward;
  const progress=clearing?contact.progress:0,patch=entry.patches[p.id];
  const mask=dustFrame(entry,p.id,progress,s.direction);
  c.drawImage(mask,patch.x,patch.y,patch.span,patch.span);
 }
 }
 if(layer==='habitat'){c.restore();return;}
 c.fillStyle='#e4d1a6';
 for(const grain of plumeParticles(sim,renderer.reducedMotion)){
  c.globalAlpha=grain.alpha;c.beginPath();c.ellipse(grain.x,grain.y,grain.r,grain.r*.65,.2,0,TAU);c.fill();
 }c.globalAlpha=1;
 if(active(sim)){
  if(s.inspected&&!s.complete)for(const p of COLONY.pockets)if(!s.mask[p.id])locator(renderer,p,p.id===s.selected?'Blow '+s.direction:p.id===0?'Left pocket':'Right pocket',p.id===s.selected);
  if(!s.inspected||s.mask.every(Boolean)){
   // A grounded berth locator belongs to the inspection action, not the coral.
   const p=COLONY.inspect;c.lineCap='round';c.beginPath();c.moveTo(p.x-22,p.y+12);c.quadraticCurveTo(p.x,p.y+17,p.x+22,p.y+12);
   c.strokeStyle='#103943';c.lineWidth=3.5;c.stroke();c.strokeStyle='#d9e8c6';c.lineWidth=1.2;c.stroke();
   renderer.tag?.(c,p.x,p.y+31,s.complete?'Cleared Pocillopora':'Inspect below',1,55);
  }
 }c.restore();
}
