import {lanternCue,LANTERN_CASE_STUDY} from './lantern-company.js';
import {creaturePickFrame} from './geometry.js';

export const LANTERN_ASSET='assets/story-lantern/anomalops-katoptron-v1.png';
export const LANTERN_OUTCROP_ASSET='assets/story-lantern/grotto-outcrop-v1.png';
const art=new WeakMap(),TAU=Math.PI*2;
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));
// Landmarks follow the trimmed painting, never the unresolved family atlas rig.
export const LANTERN_ORGAN=Object.freeze({x:.888,y:.595,width:.052,height:.057,angle:.48});
const fins=[
 {name:'tail',polygon:[[0,0],[.26,0],[.26,1],[0,1]],hinge:[.26,.5],fold:.13,shear:.10,phase:0},
 {name:'soft dorsal',polygon:[[.322,.371],[.322,0],[.557,0],[.56,.255],[.445,.29]],hinge:[.45,.31],fold:.025,shear:.025,phase:1.5},
 {name:'spiny dorsal',polygon:[[.606,.25],[.606,0],[.757,0],[.757,.248]],hinge:[.68,.248],fold:.015,shear:.017,phase:2.1},
 {name:'anal',polygon:[[.3,.632],[.398,.744],[.492,.799],[.492,1],[.3,1]],hinge:[.40,.73],fold:.035,shear:.025,phase:2.8},
 {name:'pelvic',polygon:[[.628,.795],[.755,.783],[.755,1],[.628,1]],hinge:[.69,.79],fold:.05,shear:.035,phase:.8}
];
function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function polygon(c,points,w,h){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x*w,y*h):c.moveTo(x*w,y*h));c.closePath();}
function isolate(sprite){
 const w=sprite.width,h=sprite.height,body=canvas(w,h),b=body.getContext('2d');b.drawImage(sprite,0,0);
 const layers=fins.map(fin=>{
  const image=canvas(w,h),c=image.getContext('2d');c.save();polygon(c,fin.polygon,w,h);c.clip();c.drawImage(sprite,0,0);c.restore();
  b.save();b.globalCompositeOperation='destination-out';polygon(b,fin.polygon,w,h);b.fill();b.restore();
  return {...fin,image};
 });
 return {body,layers};
}

/** Optional load hook; failures remain visible load errors, never taxonomic fallback. */
export function loadLanternArt(renderer){
 let entry=art.get(renderer);if(entry)return entry.promise;
 entry={sprite:null,outcrop:null,rig:null,frames:new WeakMap(),promise:null};art.set(renderer,entry);
 const load=path=>new Promise((resolve,reject)=>{
  const image=new Image();image.onload=()=>{try{
   const trimmed=renderer.extractCell(image,0,1,1,false),limit=path===LANTERN_ASSET?720:384;
   if(trimmed.width<=limit){resolve(trimmed);return;}
   const sprite=canvas(limit,Math.round(trimmed.height*limit/trimmed.width));sprite.getContext('2d').drawImage(trimmed,0,0,sprite.width,sprite.height);resolve(sprite);
  }catch(error){reject(error);}};
  image.onerror=()=>reject(new Error('Could not load Lantern Company illustration: '+path));image.src=path;
 });
 entry.promise=Promise.all([load(LANTERN_ASSET),load(LANTERN_OUTCROP_ASSET)]).then(([sprite,outcrop])=>{
  entry.sprite=sprite;entry.outcrop=outcrop;entry.rig=isolate(sprite);
  const pixels=outcrop.getContext?.('2d').getImageData?.(0,0,outcrop.width,outcrop.height)?.data;
  let radius=0;
  if(pixels)for(let y=0;y<outcrop.height;y++)for(let x=0;x<outcrop.width;x++)if(pixels[(y*outcrop.width+x)*4+3]>40)radius=Math.max(radius,Math.hypot(x-outcrop.width/2,y-outcrop.height/2));
  entry.outcropRadius=radius||Math.max(outcrop.width,outcrop.height)/2;
 });
 return entry.promise;
}

/** A rotating light-emitting surface, confined to the actual subocular organ. */
export function drawLanternOrgan(c,w,h,light,shown,stable=false){
 const organ=LANTERN_ORGAN,exposure=shown?clamp(light):0,x=w*organ.x,y=h*organ.y;
 const rw=w*organ.width*.5,rh=h*organ.height*.5;
 c.save();c.translate(x,y);c.rotate(organ.angle);
 if(exposure>0){
  // The bacterial light stays on; a shrinking exposed face models organ rotation.
  if(!stable){
   const radius=rw*2.3,g=c.createRadialGradient(0,0,rw*.15,0,0,radius);
   g.addColorStop(0,'rgba(101,247,245,'+(.23*exposure)+')');g.addColorStop(1,'rgba(101,247,245,0)');
   c.fillStyle=g;c.beginPath();c.ellipse(0,0,radius,rh*2.5,0,0,TAU);c.fill();
  }
  c.fillStyle=stable?'#87ece9':'#a4fff4';c.globalAlpha=stable?.9: .35+.65*exposure;
  c.beginPath();c.ellipse(0,rh*(1-exposure)*.35,rw*.9,Math.max(rh*.08,rh*.83*exposure),0,0,TAU);c.fill();
 }
 // Stable exposure/occlusion outline keeps the state readable without pulsing.
 if(stable){c.globalAlpha=1;c.strokeStyle=shown?'#bcfff2':'#82b8c6';c.lineWidth=Math.max(1,w*.009);c.beginPath();c.ellipse(0,0,rw*.92,rh*.85,0,0,TAU);c.stroke();}
 c.restore();
}

function actorAllowed(sim,e){
 if(!e||e.species?.id!=='s53'||e.lanternCaseStudy!==LANTERN_CASE_STUDY||!e.alive||e.health<=0||e.hidden)return false;
 const cue=lanternCue(sim);if(!cue)return false;
 return e===sim.player||cue.participants.some(m=>m.id===e.id&&m.incarnation===(e.incarnation||0));
}

/** Return a fully composited painting; callers bypass the old s53 part rig. */
export function appearanceFor(renderer,sim,e,time=0){
 const entry=art.get(renderer);if(!entry?.sprite||!actorAllowed(sim,e))return null;
 const stable=!!(renderer.reducedMotion||renderer.reducedFlash),t=renderer.reducedMotion?0:clamp(time,0,1e10);
 const w=entry.sprite.width,h=entry.sprite.height,shown=e.lanternOrganShown===true;
 let frame=entry.frames.get(e);if(!frame){frame=canvas(w,h);entry.frames.set(e,frame);}
 const c=frame.getContext('2d');c.clearRect(0,0,w,h);
 for(const part of entry.rig.layers){
  c.save();const x=part.hinge[0]*w,y=part.hinge[1]*h,phase=t*TAU*1.3+part.phase;
  c.translate(x,y);if(!renderer.reducedMotion)c.transform(1-part.fold*(1-Math.cos(phase))*.5,Math.sin(phase)*part.shear,0,1,0,0);
  c.drawImage(part.image,-x,-y);c.restore();
 }
 c.drawImage(entry.rig.body,0,0);
 drawLanternOrgan(c,w,h,stable&&shown?1:clamp(e.lanternLight),shown,stable);
 return {sprite:frame,pose:{flash:0,lantern:true},heightRatio:h/w};
}

function stroke(c,color,width,alpha,path){c.globalAlpha=alpha;c.strokeStyle=color;c.lineWidth=width;c.beginPath();path();c.stroke();}
function routeTicks(renderer,cue){
 const c=renderer.ctx,u=renderer.uiUnit||1;
 const routes=cue.route?cue.routes.filter(r=>r.id===cue.route):cue.routes;
 for(const route of routes){
  for(const [i,p] of route.points.entries()){
   if(!cue.route&&(i===0||i===3)&&route.id==='lower')continue;
   if(cue.route&&i<cue.playerGate)continue;
   const current=cue.route&&i===cue.playerGate;
   const path=()=>{c.moveTo(p.x-8*u,p.y-4*u);c.lineTo(p.x-8*u,p.y+4*u);c.moveTo(p.x+8*u,p.y-4*u);c.lineTo(p.x+8*u,p.y+4*u);};
   stroke(c,'#103944',3.8*u,current?.95:.6,path);stroke(c,current?'#fff1bd':'#bfdcd2',1.3*u,current?.95:.48,path);
  }
 }
}

/** Draw in world coordinates. Uses real display poses, identity and sight geometry. */
export function drawStory(renderer,sim,time=0){
 const cue=lanternCue(sim),c=renderer.ctx;if(!cue||!c)return;
 c.save();c.lineCap='round';c.lineJoin='round';
 const o=cue.obstacle,entry=art.get(renderer),outcrop=entry?.outcrop;
 // Keep art within the scientific/game occluder's circle. Its real silhouette
 // carries the scene; the sight circle is an inspection-only geometry cue.
 if(outcrop){const scale=o.r/entry.outcropRadius;c.drawImage(outcrop,o.x-outcrop.width*scale/2,o.y-outcrop.height*scale/2,outcrop.width*scale,outcrop.height*scale);}
 if(!cue.complete)routeTicks(renderer,cue);
 if(renderer.inspect){
  const path=()=>c.arc(o.x,o.y,o.r,0,TAU);stroke(c,'#103944',3.5,.75,path);stroke(c,'#bfdcd2',1,.68,path);
  renderer.tag?.(c,o.x,o.y-o.r-18,'Sight-blocking outcrop',1,50);
  for(const member of cue.participants){
   const e=sim.section?.entities?.find(e=>e.id===member.id&&(e.incarnation||0)===member.incarnation&&e.alive&&e.health>0&&!e.hidden);
   if(!e)continue;
   const f=creaturePickFrame(e),x=f.x+(e.facing||1)*f.width*.28,y=f.y-f.height*.55-7;
   const path=()=>{c.moveTo(x-4,y);c.lineTo(x,y-4);c.lineTo(x+4,y);};
   stroke(c,'#103944',3.6,.85,path);stroke(c,member.visible?'#b0fff0':'#a0bfc1',1.3,.9,path);
   if(member.visible){const p=creaturePickFrame(sim.player),dx=f.x-p.x,dy=f.y-p.y,d=Math.hypot(dx,dy);if(d>45){
    // A short sight tick points to the actual neighbor; no full-reef laser beam.
    const k=22/d,l=36/d;stroke(c,'#b0fff0',1,.48,()=>{c.moveTo(p.x+dx*k,p.y+dy*k);c.lineTo(p.x+dx*l,p.y+dy*l);});
   }}
  }
  renderer.tag?.(c,sim.player.x,sim.player.y-52,'Anomalops katoptron case study',1,45);
 }
 c.restore();
}
