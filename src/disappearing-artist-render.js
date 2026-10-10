import {creaturePickFrame} from './geometry.js';
import {artistSites} from './disappearing-artist.js';

const TAU=Math.PI*2;
const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
const validPattern=p=>p==='reef'?'mottled':['sand','shadow','mottled'].includes(p)?p:null;
const pigmentCache=new WeakMap();
const palette={sand:[222,205,160],shadow:[66,85,88],mottled:[137,155,118]};
const smooth=(lo,hi,n)=>{const t=clamp((n-lo)/(hi-lo));return t*t*(3-2*t);};

// The pigment changes are sampled in the painting's coordinate system. Every
// transparent pixel and every painted edge is retained; the renderer deforms
// this complete painting through the same fin/arm mesh as the original.
export function skinPixel(pattern,x,y,width,height,original){
 const kind=validPattern(pattern);if(!kind)return original.slice(0,3);
 const u=x/width,v=y/height;
 const eye=((u-.745)/.066)**2+((v-.20)/.115)**2;
 if(eye<1)return original.slice(0,3);
 const light=(original[0]*.2126+original[1]*.7152+original[2]*.0722)/255;
 const ink=smooth(.025,.15,light);
 const grain=(Math.sin(x*12.9898+y*78.233)*43758.5453)%1;
 const detail=(light-.48)*.18;
 let brightness;
 if(kind==='sand'){
  // Fine, low-contrast grains let the mantle become a pale sandy surface.
  const ripple=Math.sin(x*.09+Math.sin(y*.075)*1.5)*.021;
  brightness=.85+detail+grain*.035+ripple;
 }else if(kind==='shadow'){
  // Broad soft bands remove the high-contrast white spots of the base painting.
  const band=Math.sin(u*TAU*2.8+v*1.4+Math.sin(v*TAU)*.3);
  brightness=.84+detail+band*.10+grain*.011;
 }else{
  // Irregular connected blotches, at mantle scale rather than grain scale.
  const field=Math.sin(u*TAU*3.1+Math.sin(v*TAU*2.2))+
   Math.sin(v*TAU*3.4-u*6.2)*.72+Math.sin((u+v)*TAU*5.2)*.35;
  const patch=smooth(-.28,.18,field);
  brightness=.55+patch*.58+detail+grain*.018;
 }
 const color=palette[kind];
 return color.map((channel,i)=>Math.round(clamp(channel*brightness*ink+original[i]*(1-ink),0,255)));
}

export function artistSprite(renderer,image,pattern){
 const kind=validPattern(pattern);if(!kind||!image)return image;
 let variants=pigmentCache.get(image);
 if(!variants){variants=new Map();pigmentCache.set(image,variants);}
 if(variants.has(kind))return variants.get(kind);
 const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
 const painting=ctx.getImageData(0,0,canvas.width,canvas.height),pixels=painting.data;
 for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
  const offset=(y*canvas.width+x)*4;if(!pixels[offset+3])continue;
  const rgb=skinPixel(kind,x,y,canvas.width,canvas.height,pixels.subarray(offset,offset+3));
  pixels[offset]=rgb[0];pixels[offset+1]=rgb[1];pixels[offset+2]=rgb[2];
 }
 ctx.putImageData(painting,0,0);variants.set(kind,canvas);return canvas;
}

export function appearanceFor(sim,fish){
 if(sim?.reefStories?.active!=='artist'||fish!==sim.player||fish?.species?.id!=='s19')return null;
 const story=sim.reefStories.artist;
 if(!story||story.reef!==sim.current||!story.anchor||!validPattern(story.pattern))return null;
 if(Math.hypot(fish.x-story.anchor.x,fish.y-story.anchor.y)>3||!fish.blending)return null;
 return {pattern:validPattern(story.pattern),strength:clamp((story.settle||0)/2)};
}

function worldPoint(frame,u,v){
 const x=(u-.5)*frame.width*(frame.facing??1),y=(v-.5)*frame.height;
 const cos=Math.cos(frame.rotation||0),sin=Math.sin(frame.rotation||0);
 return {x:frame.x+x*cos-y*sin,y:frame.y+x*sin+y*cos};
}
function stroke(c,color,width=1.5){
 c.strokeStyle='#103944';c.lineWidth=width+2;c.stroke();
 c.strokeStyle=color;c.lineWidth=width;c.stroke();
}
function eyeCue(c,x,y,unit,mode){
 c.save();c.translate(x,y);c.scale(unit,unit);c.lineCap='round';c.lineJoin='round';
 const color=mode==='noticed'?'#f4c76e':mode==='overlooked'?'#c2d9c0':'#fff1bd';
 c.beginPath();c.moveTo(-9,0);c.quadraticCurveTo(0,mode==='overlooked'?-1:-8,9,0);
 if(mode!=='overlooked')c.quadraticCurveTo(0,8,-9,0);
 stroke(c,color,1.7);
 if(mode!=='overlooked'){
  c.beginPath();c.arc(0,0,2.8,0,TAU);c.fillStyle='#103944';c.fill();
  c.beginPath();c.arc(0,0,1.4,0,TAU);c.fillStyle=color;c.fill();
 }else{
  c.beginPath();for(const x of [-5,0,5]){c.moveTo(x,0);c.lineTo(x+1.5,3.5);}stroke(c,color,1.2);
 }
 if(mode==='noticed'){
  c.beginPath();c.moveTo(-13,-7);c.lineTo(-17,-11);c.moveTo(13,-7);c.lineTo(17,-11);stroke(c,color,1.8);
 }
 c.restore();
}
function revealBrackets(c,frame,unit,color){
 c.save();c.translate(frame.x,frame.y);c.rotate(frame.rotation||0);c.beginPath();
 const x=frame.width*.55+6*unit,y=frame.height*.36;
 for(const side of [-1,1]){c.moveTo(side*(x-7*unit),-y);c.lineTo(side*x,-y);c.lineTo(side*x,y);c.lineTo(side*(x-7*unit),y);}
 stroke(c,color,1.4*unit);c.restore();
}
function siteCorners(c,site,chosen,unit){
 c.save();c.globalAlpha=chosen?.8:.48;c.lineCap='round';c.beginPath();
 const radius=site.r||65;
 // Small opposing marks identify actual terrain; the reef painting supplies it.
 for(const side of [-1,1]){
  c.moveTo(site.x+side*(radius-11),site.y-13);c.quadraticCurveTo(site.x+side*radius,site.y,site.x+side*(radius-11),site.y+13);
 }
 stroke(c,chosen?'#fff1bd':'#d6ecd2',1.3*unit);c.restore();
}

// Presentation only. Observer locomotion, detection and accomplishments belong
// to disappearing-artist.js; this reads their outcome and never advances it.
export function drawStory(renderer,sim,time){
 if(sim?.reefStories?.active!=='artist'||sim.player?.species?.id!=='s19')return;
 const story=sim.reefStories.artist;if(!story)return;
 const c=renderer.ctx,unit=Math.min(1.65,renderer.uiUnit||1),player=sim.player;
 if(story.phase==='choose'||story.phase==='pattern'){
  for(const site of artistSites(sim))siteCorners(c,site,site.id===story.site,unit);
 }
 if(story.reef!==sim.current)return;
 const observer=sim.section.entities.find(e=>e.alive&&e.id===story.observer?.id&&(e.incarnation||0)===(story.observer?.incarnation||0));
 const stage=story.phase;
 if(observer&&['waiting','passing','noticed','overlooked','complete'].includes(stage)){
  const frame=creaturePickFrame(observer),focus=creaturePickFrame(player),eye=worldPoint(frame,.82,.31);
  const icon=worldPoint(frame,.63,-.18),mode=story.pass?.seen||story.outcome==='noticed'||stage==='noticed'?'noticed':story.outcome==='overlooked'||stage==='overlooked'||stage==='complete'||story.pass?.closest<=145&&!story.pass?.seen?'overlooked':'looking';
  c.save();c.lineCap='round';c.globalAlpha=mode==='overlooked'?.57:.78;
  const end=mode==='overlooked'&&story.pass?{x:story.pass.endX,y:story.pass.endY}:focus;
  const dx=end.x-eye.x,dy=end.y-eye.y,d=Math.hypot(dx,dy);
  if(d>20&&Number.isFinite(d)){
   // A short gaze reaches toward the target; an overlooked gaze continues
   // along the observer's route, making its changed attention legible.
   const length=Math.min(mode==='noticed'?125:95,d-15),ratio=length/d;
   c.setLineDash(mode==='noticed'?[]:[3*unit,7*unit]);c.beginPath();
   c.moveTo(eye.x+dx/d*12,eye.y+dy/d*12);c.lineTo(eye.x+dx*ratio,eye.y+dy*ratio);
   stroke(c,mode==='noticed'?'#f4c76e':mode==='overlooked'?'#c2d9c0':'#fff1bd',1.15*unit);c.setLineDash([]);
  }
  c.restore();eyeCue(c,icon.x,icon.y,unit,mode);
  if(mode==='noticed')revealBrackets(c,focus,unit,'#f4c76e');
 }
 if(story.outcome==='moved'&&stage==='noticed'){
  const frame=creaturePickFrame(player);revealBrackets(c,frame,unit,'#f4c76e');
  c.save();c.translate(frame.x,frame.y);c.rotate(frame.rotation||0);c.scale(frame.facing??player.facing??1,1);c.globalAlpha=.55;c.lineCap='round';c.beginPath();
  for(const side of [-1,1]){const x=-frame.width*.57;c.moveTo(x+8,side*frame.height*.27);c.quadraticCurveTo(x-11,side*(frame.height*.33+4),x-21,side*frame.height*.2);}
  stroke(c,'#fff1bd',1.3*unit);c.restore();
 }
}

