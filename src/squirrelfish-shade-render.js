import {shadeScene} from './squirrelfish-shade.js';
import {creaturePickFrame} from './geometry.js';

const TOP=55,clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const foregrounds=new WeakMap();
const active=sim=>sim?.reefStories?.active==='shade'&&sim.player?.species?.id==='s12';

/** Read the real encounter. Fin articulation and position remain incumbent. */
export function appearanceFor(renderer,sim,fish,time=0){
 if(!active(sim))return null;
 const scene=shadeScene(sim);if(!scene?.available||distance(sim.player,scene)>360)return null;
 const neighbor=fish===scene.neighbor;
 const restingPlayer=fish===sim.player&&scene.selected&&['settle','complete'].includes(scene.stage)&&distance(fish,scene.selected)<45;
 if(!neighbor&&!restingPlayer||neighbor&&distance(fish,scene.home)>90)return null;
 const response=restingPlayer?'settled':scene.response,facing=fish.facing||1;
 const poses={hidden:{effort:.08,brake:.56,pitch:-.025},orienting:{effort:.20,brake:.76,pitch:-.045},'giving-space':{effort:.36,brake:.62,pitch:-.03},settled:{effort:.07,brake:.48,pitch:-.008}};
 const pose={...poses[response],feed:0};pose.pitch*=facing;
 return {rotation:pose.pitch,pose};
}
export function poseFor(renderer,sim,fish,time=0){return appearanceFor(renderer,sim,fish,time)?.pose||null;}

/** Foreground membership comes from painted rock/coral pixels, not a drawn cave. */
export function ledgeAlpha(r,g,b){
 const luminance=r*.2126+g*.7152+b*.0722;
 // Dark turquoise cavity pixels remain open; warm rock/coral carries the matte.
 const stone=clamp((luminance-24)/24),water=clamp((Math.max(r,g)-b+8)/18);
 return Math.round(stone*water*255);
}

function foreground(renderer,scene){
 const source=renderer.reefs?.[scene.reef];
 if(!source||typeof document==='undefined')return null;
 let cache=foregrounds.get(renderer);if(!cache){cache=new Map();foregrounds.set(renderer,cache);}
 const key=scene.id;let entry=cache.get(key);if(entry?.source===source)return entry;
 // Re-project the identical habitat pixels, at their original world position.
 // A small crop bounds work; its alpha follows the painting's actual material.
 const x=Math.max(0,Math.round(scene.home.x-100)),y=Math.max(0,Math.round(scene.home.y+4));
 const width=Math.min(180,1600-x),height=Math.min(85,900-TOP-y);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const c=canvas.getContext('2d',{willReadFrequently:true});
 c.drawImage(source,x*source.width/1600,(y+TOP)*source.height/900,width*source.width/1600,height*source.height/900,0,0,width,height);
 const pixels=c.getImageData(0,0,width,height);
 for(let row=0;row<height;row++)for(let col=0;col<width;col++){
  const i=(row*width+col)*4,edge=clamp(Math.min(col,width-1-col,row,height-1-row)/3);
  pixels.data[i+3]=Math.round(ledgeAlpha(pixels.data[i],pixels.data[i+1],pixels.data[i+2])*edge);
 }
 c.putImageData(pixels,0,0);entry={source,canvas,x,y,width,height};cache.set(key,entry);return entry;
}
function stroke(c,color,width,draw){c.beginPath();draw();c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function point(frame,u,v){
 const facing=frame.facing??1,dx=(u-.5)*frame.width*Math.sign(facing),dy=(v-.5)*frame.height,rotation=frame.rotation||0;
 return {x:frame.x+dx*Math.cos(rotation)-dy*Math.sin(rotation),y:frame.y+dx*Math.sin(rotation)+dy*Math.cos(rotation)};
}
function restMark(c,p,chosen,unit){
 const path=()=>{for(const sign of [-1,1]){c.moveTo(p.x+sign*25,p.y+14);c.lineTo(p.x+sign*25,p.y+21);c.quadraticCurveTo(p.x+sign*21,p.y+24,p.x+sign*13,p.y+24);}};
 c.globalAlpha=chosen?.9:.68;stroke(c,'#103944',3.9*unit,path);stroke(c,chosen?'#f4c76e':'#e5e7c7',1.4*unit,path);
}
function orientation(c,neighbor,player,unit){
 const frame={...creaturePickFrame(neighbor),facing:neighbor.facing||1},eye=point(frame,.882,.485),fin=point(frame,.72,.59);
 const dx=player.x-eye.x,dy=player.y-eye.y,d=Math.hypot(dx,dy);if(d<1)return;
 // Two brief highlights meet the painted eye and stabilizing pectoral fin.
 // Their direction is visible in muted and reduced-motion play, without words
 // assigned to the call or a line stretching across the whole scene.
 c.globalAlpha=.72;
 stroke(c,'#fff1bd',1.1*unit,()=>{c.moveTo(eye.x+dx/d*7,eye.y+dy/d*7);c.lineTo(eye.x+dx/d*18,eye.y+dy/d*18);});
 c.globalAlpha=.62;
 stroke(c,'#f4d3a5',1.05*unit,()=>{c.moveTo(fin.x,fin.y);c.quadraticCurveTo(fin.x-(neighbor.facing||1)*7,fin.y+4,fin.x-(neighbor.facing||1)*11,fin.y+2);});
}

/** Painting is pure: no timers, locomotion, awards, audio, or saved-state writes. */
export function drawStory(renderer,sim,time=0){
 if(!active(sim)||!renderer?.ctx)return;
 const scene=shadeScene(sim);if(!scene?.available||!scene.neighbor)return;
 const player=sim.player,neighbor=scene.neighbor;
 if(distance(player,scene)>360||distance(neighbor,scene.home)>90)return;
 const c=renderer.ctx,unit=Math.min(1.65,renderer.uiUnit||1),art=foreground(renderer,scene);
 c.save();c.lineCap='round';c.lineJoin='round';
 // The neighbor really sits behind the original painted ledge. A rectangular
 // work bound contains an image-derived organic alpha matte, never a flat veil.
 if(art){
  const frame=creaturePickFrame(neighbor);
  // Only this resident occupies the back depth. The freely swimming player
  // remains in front of the ledge even while inspecting at close range.
  c.save();c.beginPath();c.rect(frame.x-frame.width*.57,frame.y-frame.height*.65,frame.width*1.14,frame.height*1.3);c.clip();
  c.globalAlpha=1;c.drawImage(art.canvas,art.x,art.y,art.width,art.height);c.restore();
 }
 const source={x:neighbor.x+(neighbor.facing||1)*9,y:neighbor.y-3};
 if(!scene.complete){
  const angle=Math.atan2(player.y-source.y,player.x-source.x),pulse=clamp(scene.pulse||0);
  const expansion=renderer.reducedMotion?4:(1-pulse)*7;
  for(let i=0;i<2;i++){
   const radius=12+i*10+expansion;
   const path=()=>c.arc(source.x,source.y,radius,angle-.58,angle+.58);
   c.globalAlpha=.40+pulse*.22;stroke(c,'#103944',3.5*unit,path);stroke(c,'#dce8c9',1.35*unit,path);
  }
  // This caption also locates a quiet interval between pulses. Listening is not
  // a one-frame test, and accessibility does not depend on the audio setting.
  renderer.tag?.(c,scene.x,scene.y-48*unit,'Pulse in the shade',1,72);
 }
 if(['orienting','giving-space'].includes(scene.response))orientation(c,neighbor,player,unit);
 if(scene.observed&&!scene.complete){
  for(const choice of ['alcove','space']){
   const selected=scene.choice===choice,p=scene[choice];restMark(c,p,selected,unit);
   renderer.tag?.(c,p.x,p.y+39*unit,selected?'Your resting place':choice==='alcove'?'Alcove':'More room',1,selected?70:52);
  }
 }
 if(scene.complete||scene.stage==='settle'){
  if(scene.selected)restMark(c,scene.selected,true,unit);
  if(renderer.inspect||scene.stage==='settle')renderer.tag?.(c,neighbor.x,neighbor.y-43*unit,'Resting separately',1,65);
 }
 c.restore();
}
