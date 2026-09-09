import {animalProfile} from './animal-profiles.js';
import {rigFor,pathWeight} from './animal-rigs.js';
import {rayPoint} from './ray-motion.js';
import {FIN_RIGS,finPoint} from './fin-motion.js';
import {RESIDENT_RIGS,residentPoint} from './resident-motion.js';
import {RADIAL_IDS,radialPoint} from './radial-motion.js';
import {SPECIALIST_IDS,specialistPoint} from './specialist-motion.js';
import {RIGID_RIGS,rigidPoint,inflationOffset} from './rigid-motion.js';
import {SWIM_RIGS,swimPoint} from './swim-motion.js';
const TAU=Math.PI*2,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const bell=(x,c,r)=>Math.exp(-(((x-c)/r)**2)*2);
const directionBin=angle=>Math.round((((angle||0)%TAU+TAU)%TAU)/TAU*8)%8;

// A continuous deformation field keeps painted surfaces joined. The eyes, armored
// bodies, shells and attachment points are protected by local falloffs.
export function deformPoint(p,u,v,time,effort=.5,state={}){
 if(SWIM_RIGS[p.id])return swimPoint(p,u,v,time,effort,state);
 if(RIGID_RIGS[p.id])return rigidPoint(p,u,v,time,effort,state);
 if(FIN_RIGS[p.id])return finPoint(p,u,v,time,effort,state);
 if(RESIDENT_RIGS[p.id])return residentPoint(p,u,v,time,effort,state);
 if(RADIAL_IDS.has(p.id))return radialPoint(p,u,v,time,effort,state);
 if(SPECIALIST_IDS.has(p.id))return specialistPoint(p,u,v,time,effort,state);
 const a=clamp(effort),phase=time*p.frequency*TAU,axis=p.axis,rig=rigFor(p);
 let x=u,y=v;const family=p.family,beat=Math.sin(phase),feed=clamp(state.feed||0);
 const tail=clamp((p.tailRoot-u)/p.tailRoot),finSpan=bell(u,.52,.29);
 if(['cruiser','reef','hover','wrasse','ribbon','heavy','rigid','fan','percher','shark','carpet','needle','frogfish'].includes(family)){
  const drive=(['rigid','hover','fan','frogfish'].includes(family)?.08:.18)+a*.82;
  y+=Math.sin(phase-u*4.5)*tail**1.5*p.tail*drive/Math.max(.25,state.aspect||.5);
  x+=Math.cos(phase)*tail**2*p.tail*.24*drive;
  const edge=clamp((Math.abs(v-axis)-.19)/.33),upper=v<axis?-1:1;
  const finDrive=['rigid','hover','wrasse','ribbon','fan'].includes(family)?.65+a*.35:.3+a*.45;
  if(!['rigid','frogfish'].includes(family)){
   y+=upper*Math.sin(phase+u*6+upper*.9)*edge**1.4*finSpan*p.fin*finDrive*.45;
   x+=Math.cos(phase+u*5)*edge**1.7*finSpan*p.fin*.25*finDrive;
  }
  const pc=pathWeight(u,v,[rig.pectoral.root,rig.pectoral.tip],.075).weight;
  x+=beat*pc*p.fin*(.6+(1-a)*.5);y+=Math.cos(phase)*pc*p.fin*.6;
  // Ventral mouth/gill motion stays below the eye, with no whole-head squash.
  const mouth=bell(u,rig.mouth[0],.07)*bell(v,rig.mouth[1]+.035,.10);
  y+=mouth*(.003*(1+Math.sin(phase))+.018*feed);
  x+=mouth*feed*.012;
 }else if(family==='eel'){
  // The extended painting has a continuous body. A front-to-rear wave moves
  // each cross-section together; the skull does not shear with its markings.
  const rear=clamp((.84-u)/.84)**1.3,drive=.12+a*.88;
  x+=(1-Math.cos(phase+u*7))*.5*rear*p.tail*.6*drive;
  const jaw=bell(u,.95,.07)*bell(v,.45,.13);
  y+=jaw*(.009*(1+Math.sin(phase))+.04*feed);
 }else if(family==='ray'||family==='electric-ray'){
  ({x,y}=rayPoint(p,u,v,time,a,state));
 }
 for(const [i,path] of rig.paths.entries()){
  const {weight,progress}=pathWeight(u,v,path.points,path.radius);
  const amplitude=path.amplitude*(1-clamp(state.retract||0)*.8);
  x+=Math.sin(phase+i*1.7-progress*3)*weight*amplitude*.5;
  y+=Math.cos(phase+i*1.7-progress*3)*weight*amplitude;
 }
 const puff=clamp(state.puff||0);
 if(puff){
  const offset=inflationOffset(p.id,u,v,puff);
  x+=offset.x;y+=offset.y;
 }
 const turn=Math.max(-1,Math.min(1,state.turn||0));
 if(turn&&!['crab','star','slug','snail','urchin','anemone','seahorse','ray','electric-ray'].includes(family)){
  const rear=clamp((.76-u)/.76),rigid=['rigid','fan','frogfish'].includes(family),amplitude=rigid?.012:family==='eel'?.075:.036;
  if(family!=='eel')y+=turn*rear**2*amplitude/Math.max(.2,state.aspect||.5);
 }
 if(rig.eye){const d=Math.hypot((u-rig.eye[0])/.075,(v-rig.eye[1])/.10),keep=clamp((d-.65)/.65);x=u+(x-u)*keep;y=v+(y-v)*keep;}
 return {x,y};
}

function triangle(ctx,image,s0,s1,s2,d0,d1,d2){
 const ux=s1.x-s0.x,uy=s1.y-s0.y,vx=s2.x-s0.x,vy=s2.y-s0.y,det=ux*vy-vx*uy;
 const a=((d1.x-d0.x)*vy-(d2.x-d0.x)*uy)/det,c=(ux*(d2.x-d0.x)-vx*(d1.x-d0.x))/det;
 const b=((d1.y-d0.y)*vy-(d2.y-d0.y)*uy)/det,d=(ux*(d2.y-d0.y)-vx*(d1.y-d0.y))/det;
 ctx.save();ctx.beginPath();const mx=(d0.x+d1.x+d2.x)/3,my=(d0.y+d1.y+d2.y)/3;
 [d0,d1,d2].forEach((p,i)=>{const dx=p.x-mx,dy=p.y-my,len=Math.hypot(dx,dy),x=p.x+dx/len*.38,y=p.y+dy/len*.38;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();ctx.clip();
 ctx.setTransform(a,b,c,d,d0.x-a*s0.x-c*s0.y,d0.y-b*s0.x-d*s0.y);ctx.drawImage(image,0,0);ctx.restore();
}

export class ArticulatedSprites{
 constructor(){this.cache=new Map();this.images=new WeakMap();this.nextImage=0;this.pixels=0;this.maxPixels=12*1024*1024;this.hits=0;this.misses=0;this.deferred=0;this.remaining=Infinity;this.pending=new Map();}
 beginFrame(budgetMs=3.5){
  this.remaining=budgetMs;
  // Deferred animals receive the next frame's budget before draw order can
  // spend it again. Updating a slot replaces its pose without losing its turn.
  for(const [slot,request]of this.pending){if(this.remaining<=0)break;this.pending.delete(slot);if(!this.cache.has(request.key))this.buildFrame(request);}
 }
 buildFrame({image,p,width,w,h,pad,bins,tick,a,feed,retract,puff,turn,heading,feedAngle,group,key}){
  const started=performance.now();this.misses++;const canvas=document.createElement('canvas');canvas.width=w+pad*2;canvas.height=h+pad*2;const c=canvas.getContext('2d');
  const detailed=FIN_RIGS[p.id]||RESIDENT_RIGS[p.id]||RADIAL_IDS.has(p.id)||SPECIALIST_IDS.has(p.id)||RIGID_RIGS[p.id]||SWIM_RIGS[p.id],cols=detailed?20:width<150?10:16,rows=detailed?16:width<150?6:10,src=[],dst=[];
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){const u=i/cols,v=j/rows,q=deformPoint(p,u,v,tick/bins/p.frequency,a,{feed,retract,puff,turn,heading:heading/8*TAU,feedAngle:feedAngle/8*TAU,aspect:image.height/image.width});src.push({x:u*image.width,y:v*image.height});dst.push({x:pad+q.x*w,y:pad+q.y*h});}
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+1,c1=a+cols+1,d=c1+1;triangle(c,image,src[a],src[b],src[c1],dst[a],dst[b],dst[c1]);triangle(c,image,src[b],src[d],src[c1],dst[b],dst[d],dst[c1]);}
  const frame={canvas,pixels:canvas.width*canvas.height,group,tick};this.cache.set(key,frame);this.pixels+=frame.pixels;
  while(this.pixels>this.maxPixels||this.cache.size>512){const first=this.cache.keys().next().value;this.pixels-=this.cache.get(first).pixels;this.cache.delete(first);}
  this.remaining-=performance.now()-started;return frame;
 }
 draw(ctx,image,species,width,height,time,effort,state={},resolution=1){
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0||!image.width||!image.height)return;
  const p=animalProfile(species),baseBins=width<150?16:24;
  // Slow radial cycles need more phase samples, not faster animal motion.
  // Keep whole multiples of the old grid and the same bounded raster cache.
  const bins=p.id==='s19'?48:RADIAL_IDS.has(p.id)?Math.min(96,Math.max(baseBins,Math.ceil(10/(p.frequency*.55)/baseBins)*baseBins)):baseBins;
  const cycle=((time*p.frequency)%1+1)%1,tick=Math.floor(cycle*bins),a=Math.round(clamp(effort)*2)/2,feed=Math.round(clamp(state.feed||0)*5)/5,retract=Math.round(clamp(state.retract||0)*5)/5,puff=Math.round(clamp(state.puff||0)*5)/5;
  const turn=Math.round(Math.max(-1,Math.min(1,state.turn||0))*3)/3;
  const heading=p.id==='s47'?directionBin(state.heading):0,feedAngle=p.id==='s47'&&feed?directionBin(state.feedAngle??state.heading):0;
  if(!this.images.has(image))this.images.set(image,++this.nextImage);
  const w=Math.min(640,Math.max(64,Math.ceil(width*resolution/64)*64)),h=Math.max(8,Math.round(w*height/width)),pad=Math.ceil(Math.max(w,h)*(.09+puff*.16));
  const group=[this.images.get(image),p.id,w,bins,a,feed,retract,puff,turn,heading,feedAngle].join(':'),key=group+':'+tick,slot=state.instance==null?group:[this.images.get(image),p.id,w,bins,state.instance].join(':');let frame=this.cache.get(key);
  if(frame){this.cache.delete(key);this.cache.set(key,frame);this.pending.delete(slot);this.hits++;}
  else{
   // The focal cuttlefish and its camouflage overlay must show the requested
   // phase, even after background creatures spent this frame's mesh budget.
   if(this.remaining<=0&&!(p.id==='s19'&&state.instance==='player')){
    this.pending.set(slot,{image,p,width,w,h,pad,bins,tick,a,feed,retract,puff,turn,heading,feedAngle,group,key});
    while(this.pending.size>128)this.pending.delete(this.pending.keys().next().value);
    this.deferred++;let closest=Infinity;
    for(const candidate of this.cache.values())if(candidate.group===group){const d=Math.abs(candidate.tick-tick),wrapped=Math.min(d,bins-d);if(wrapped<closest){frame=candidate;closest=wrapped;}}
    if(!frame){ctx.drawImage(image,-width/2,-height/2,width,height);return;}
   }else{
   this.pending.delete(slot);frame=this.buildFrame({image,p,width,w,h,pad,bins,tick,a,feed,retract,puff,turn,heading,feedAngle,group,key});
   }
  }
  const scale=width/w;ctx.drawImage(frame.canvas,-width/2-pad*scale,-height/2-pad*scale,frame.canvas.width*scale,frame.canvas.height*scale);
 }
}
