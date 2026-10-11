import {CREVICE_REEF,CREVICES,creviceOptions,crevicePose} from './triggerfish-crevice.js';
import {setCreatureDisplayFrame} from './geometry.js';

// Fish identity is supplied by the named-species painting; rock material comes
// from the incumbent Coral Cathedral painting.
// The anterior first dorsal spine is cut from the fish, never drawn on top of it.
export const CREVICE_FISH_ASSET='assets/story-crevice/clown-triggerfish-v1.png';
export const CREVICE_FISH_FRAME=Object.freeze({width:355,height:219});
export const SPINE_ART=Object.freeze({root:[.697,.256],tip:[.637,.037],polygon:[[.627,.027],[.646,.027],[.716,.261],[.627,.238]]});
const cache=new WeakMap();
const loads=new WeakMap();
const active=sim=>['crevice','triggerfish-crevice'].includes(sim?.reefStories?.active)&&sim.player?.species?.id==='s24'&&sim.current===CREVICE_REEF;
const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const clamp=n=>Math.max(0,Math.min(1,n));

/** Replace the incorrect atlas cell in every surface, preserving the authored frame. */
export function loadCreviceArt(renderer){
 if(loads.has(renderer))return loads.get(renderer);
 const promise=new Promise((resolve,reject)=>{
  const image=new Image();image.onload=()=>{
   if(image.width!==CREVICE_FISH_FRAME.width||image.height!==CREVICE_FISH_FRAME.height){reject(new Error('Clown triggerfish art does not match its physical frame'));return;}
   // Do not extractCell: transparent fin clearance is part of the agreed frame.
   renderer.sprites[24]=image;renderer.bounds[24]={x:0,y:0,w:image.width,h:image.height};resolve();
  };image.onerror=()=>reject(new Error('Could not load named clown triggerfish illustration: '+CREVICE_FISH_ASSET));image.src=CREVICE_FISH_ASSET;
 });loads.set(renderer,promise);return promise;
}

function sourceArt(renderer){
 const source=renderer.sprites?.[24],reef=renderer.reefs?.[CREVICE_REEF];
 if(!source||!reef)return null;
 let entry=cache.get(renderer);if(entry?.source===source&&entry.reef===reef)return entry;
 const body=canvas(source.width,source.height),spine=canvas(source.width,source.height);
 const b=body.getContext('2d'),s=spine.getContext('2d');b.drawImage(source,0,0);
 const cut=c=>{c.beginPath();SPINE_ART.polygon.forEach(([x,y],i)=>c[i?'lineTo':'moveTo'](x*source.width,y*source.height));c.closePath();};
 // Lift the original blade's painted rim in the shaded cavity; no second
 // silhouette is added. This keeps its real articulation readable at body size.
 cut(s);s.clip();s.filter='brightness(2.1)';s.drawImage(source,0,0);cut(b);b.globalCompositeOperation='destination-out';b.fill();
 // Preserve the painted recess, but let its own light/dark boundary dissolve
 // into the reef. A rounded falloff removes the four corners of the crop.
 const cavity=canvas(280,180),cc=cavity.getContext('2d',{willReadFrequently:true});
 cc.drawImage(reef,reef.width*.255,reef.height*.245,reef.width*.175,reef.height*.19,0,0,280,180);
 const pixels=cc.getImageData(0,0,280,180);
 for(let y=0;y<180;y++)for(let x=0;x<280;x++){
  const n=(y*280+x)*4,light=(pixels.data[n]+pixels.data[n+1]+pixels.data[n+2])/765;
  const nx=(x-140)/140,ny=(y-90)/90;
  const edge=1-nx*nx-ny*ny+(.5-light)*.12,t=clamp(edge/.38);
  pixels.data[n+3]*=t*t*(3-2*t);
 }
 cc.putImageData(pixels,0,0);
 entry={source,reef,body,spine,cavity,rocks:new Map()};cache.set(renderer,entry);return entry;
}

// A small matte derived from the actual limestone painting's pixel values.
// Texture determines the ragged contact edge; the spine's contact column is pinned.
function rock(entry,index,upper){
 const key=index+':'+upper;if(entry.rocks.has(key))return entry.rocks.get(key);
 const c=canvas(224,60),ctx=c.getContext('2d',{willReadFrequently:true}),reef=entry.reef;
 ctx.drawImage(reef,reef.width*(upper?.715:.685),reef.height*(upper?.32:.61),reef.width*.13,reef.height*.12,0,0,c.width,c.height);
 const image=ctx.getImageData(0,0,c.width,c.height),edges=[];
 for(let x=0;x<c.width;x++){
  // Sample a small stretch of actual painted limestone, rather than noise.
  let light=0;for(let k=-5;k<=5;k++){
   const sample=(38*c.width+Math.max(0,Math.min(c.width-1,x+k)))*4;
   light+=(image.data[sample]+image.data[sample+1]+image.data[sample+2])/765;
  }light/=11;
  const taper=clamp((Math.abs(x-97)-2)/28),offset=-(.25+light)*12*taper;
  const endInset=Math.pow(Math.abs((x-112)/112),2)*24;
  edges.push(offset);
  for(let y=0;y<c.height;y++){
   const edge=upper?58+offset:2-offset,coverage=clamp(upper?edge-y:y-edge);
   const feather=clamp(Math.min(x,c.width-1-x)/24)*clamp(((upper?y:c.height-y)-endInset)/18);
   image.data[(y*c.width+x)*4+3]*=coverage*feather;
  }
 }
 ctx.putImageData(image,0,0);const result={image:c,edges};entry.rocks.set(key,result);return result;
}

/** A physical pose overrides hover, continuous-turn banking and reduced-motion flattening. */
export function appearanceFor(renderer,sim,fish,time=0){
 if(!active(sim)||fish!==sim.player)return null;
 const pose=crevicePose(sim);if(!pose)return null;
 return {rotation:pose.rotation,pose,physical:true};
}

/** Affine mapping of the existing painted spine to the simulation-owned contact. */
export function spineTransform(pose){
 const cs=Math.cos(pose.rotation),sn=Math.sin(pose.rotation);
 const dx=pose.spineTip.x-pose.spineRoot.x,dy=pose.spineTip.y-pose.spineRoot.y;
 const target={x:dx*cs+dy*sn,y:-dx*sn+dy*cs};
 const original={x:(SPINE_ART.tip[0]-SPINE_ART.root[0])*pose.width,y:(SPINE_ART.tip[1]-SPINE_ART.root[1])*pose.height};
 const rx=pose.spineRoot.x-pose.x,ry=pose.spineRoot.y-pose.y;
 return {angle:Math.atan2(target.y,target.x)-Math.atan2(original.y,original.x),scale:Math.hypot(target.x,target.y)/Math.hypot(original.x,original.y),root:{x:rx*cs+ry*sn,y:-rx*sn+ry*cs},sourceRoot:{x:(SPINE_ART.root[0]-.5)*pose.width,y:(SPINE_ART.root[1]-.5)*pose.height}};
}

/** Called before the renderer's decorative creature transform. Returns ownership. */
export function drawCreviceCreature(ctx,renderer,sim,fish,appearance=null,width=null,alpha=1){
 const look=appearance||appearanceFor(renderer,sim,fish);if(!look?.physical)return false;
 const art=sourceArt(renderer);if(!art)return false;
 const p=look.pose,hinge=spineTransform(p);setCreatureDisplayFrame(fish,{x:p.x,y:p.y,width:p.width,height:p.height,rotation:p.rotation,facing:p.facing,anchor:[.5,.5]});
 ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotation);ctx.scale(p.facing,1);ctx.globalAlpha=alpha;
 ctx.drawImage(art.body,-p.width/2,-p.height/2,p.width,p.height);
 ctx.translate(hinge.root.x,hinge.root.y);ctx.rotate(hinge.angle);ctx.scale(hinge.scale,hinge.scale);
 ctx.drawImage(art.spine,-p.width/2-hinge.sourceRoot.x,-p.height/2-hinge.sourceRoot.y,p.width,p.height);ctx.restore();return true;
}

function aperture(renderer,site,option,selected){
 const c=renderer.ctx,u=renderer.uiUnit||1;
 // Painted edges and the actual-size fish preview communicate fit. A label
 // names the opening without turning the rock mouth into an outlined box.
 renderer.tag?.(c,site.x-30,site.y-site.gap/2-27*u,option.occupied?'Opening in use':site.label,1,50);
}

function fitPreview(renderer,sim,site,option,art){
 const c=renderer.ctx,width=100,height=100*art.source.height/art.source.width;
 c.save();c.translate(site.x+75*Math.cos(site.angle),site.y+75*Math.sin(site.angle));c.rotate(site.angle);c.globalAlpha=option.fits?.28:.42;
 c.drawImage(art.body,-width/2,-height/2,width,height);c.restore();
 // The fish is shown at full body size: narrow edges visibly cut through it,
 // while the wide gap leaves empty water above the dorsal spine.
}

/** Pass 'back' before creatures and 'front' after them to retain real rock overlap. */
export function drawStory(renderer,sim,time=0,layer='front'){
 if(!active(sim))return;
 const story=sim.reefStories.crevice;if(!story)return;
 const art=sourceArt(renderer);if(!art)return;
 const c=renderer.ctx,options=creviceOptions(sim),choose=['choose','approach'].includes(story.stage);
 for(const site of CREVICES){
  c.save();c.translate(site.x,site.y);c.rotate(site.angle);
  if(layer==='back'){
   c.drawImage(art.cavity,-36,-site.gap/2-40,250,site.gap+80);
  }else{
   const roof=rock(art,site.index,true),floor=rock(art,site.index,false);
   c.drawImage(roof.image,-8,-site.gap/2-58,224,60);c.drawImage(floor.image,-8,site.gap/2-2,224,60);
  }
  c.restore();
  if(layer==='back'&&choose)fitPreview(renderer,sim,site,options[site.index],art);
  if(layer==='front'&&choose)aperture(renderer,site,options[site.index],story.crevice===site.index);
 }
 const p=crevicePose(sim);
 if(layer==='front'&&p?.spine>.92){
  // A stationary contact glint at the actual ceiling, unchanged while paused.
  c.save();c.strokeStyle='#ffe5ab';c.globalAlpha=.88;c.lineWidth=1.2;
  c.beginPath();c.moveTo(p.spineContact.x-3,p.spineContact.y-.6);c.lineTo(p.spineContact.x+3,p.spineContact.y+.6);c.stroke();c.restore();
 }
}
