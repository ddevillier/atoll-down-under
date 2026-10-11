import {activeStory,storyFoodHidden} from './reef-stories.js';
import {clinicPose,drawStory as drawClinic} from './reef-clinic-render.js';
import {artistSprite,appearanceFor,drawStory as drawArtist} from './disappearing-artist-render.js';
import {drawStory as drawEngineer} from './sandcastle-engineer-render.js';
import {barbelPoseFor,drawStory as drawDetective} from './whisker-detective-render.js';
import {loadNurseryArt,nurseryAppearanceFor,drawStory as drawNursery} from './cardinalfish-nursery-render.js';
import {loadHousekeeperArt,appearanceFor as housekeeperAppearance,drawStory as drawHousekeeper} from './coral-housekeeper-render.js';
import {loadLookoutArt,appearanceFor as lookoutAppearance,drawStory as drawLookout} from './rabbitfish-lookout-render.js';
import {loadWalkerArt,drawCreature as drawWalkerCreature,drawStory as drawWalker} from './frogfish-walk-render.js';
import {loadCreviceArt,appearanceFor as creviceAppearance,drawCreviceCreature,drawStory as drawCrevice} from './triggerfish-crevice-render.js';
import {loadNestArt,appearanceFor as nestAppearance,drawStory as drawNest} from './gramma-nest-render.js';
import {appearanceFor as shadeAppearance,drawStory as drawShade} from './squirrelfish-shade-render.js';
import {loadLanternArt,appearanceFor as lanternAppearance,drawStory as drawLantern} from './lantern-company-render.js';
import {CreationPainter,CREATION_ART} from './creation-render.js';
import {displayPose,abilityWater} from './ability-visuals.js';
import {anatomy} from './creation-appearance.js';
import {watchedResident} from './resident-journeys.js';
import {escortCover} from './escort-journeys.js';
import {ArticulatedSprites} from './articulated-motion.js';
import {PaintedParts,PART_RIGS} from './part-motion.js';
import {feedingEnvelope} from './feeding-motion.js';
import {displayedMouthPoint} from './feeding-contact.js';
import {turningPose} from './turn-motion.js';
import {foregroundCleaner,cleaningPresentation} from './cleaner-motion.js';
import {refugeLayers} from './refuge-motion.js';
import {lureDisplay} from './lure-motion.js';
import {TitleReef} from './title-reef.js';
import {REEFS,SPECIES,FOODS} from './data.js';
import {sitesFor,selectedSite,ADVENTURES} from './adventures.js';
import {companion} from './companion-activity.js';
import {animationPhase} from './behaviors.js';
import {poseFor} from './motion.js';
import {creatureWidth,creatureFrame,groundPitch,setCreatureDisplayFrame,creaturePickFrame} from './geometry.js';
import {groundSpeed} from './ground-motion.js';
import {swimmingPropulsion} from './swim-motion.js';
import {SPECIES_SPRITES} from './sprite-assets.js';
import {canUseShelter} from './shelter.js';
import {nearbyFoodHints} from './food-hints.js';
import {arrangeLabels,playerLocator,projectedBounds,creatureLabel,activitySiteLabel} from './world-labels.js';
import {interactionCue,treatmentCues,drawInteractionCue,drawTreatmentCue} from './interaction-cues.js';
const TOP=55;
export class ReefRenderer {
 constructor(canvas){this.titleReef=new TitleReef();this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.reefs=[];this.atlases=[];this.bounds=[];this.sprites=[];this.foodSprites=[];this.customCache=new Map();this.ready=false;this.particles=[];this.clock=0;this.hover=null;this.inspect=false;this.reducedMotion=false;this.effects=[];this.resize();new ResizeObserver(()=>this.resize()).observe(canvas);}
 resize(){const r=this.canvas.getBoundingClientRect();const d=Math.min(window.devicePixelRatio||1,2);this.canvas.width=Math.round(r.width*d);this.canvas.height=Math.round(r.height*d);this.uiUnit=Math.max(1,1600/Math.max(1,r.width));}
 async load(){
  const img=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Could not load '+src));im.src=src;});
  [this.reefs,this.atlases,this.splash]=await Promise.all([Promise.all(REEFS.map(r=>img(r.image))),Promise.all([0,1,2,3].map(n=>img('assets/creatures/fish-atlas-'+n+'.png'))),img('assets/title/splash.png')]);
  this.atlases.forEach((im,a)=>{this.extractAtlas(im).forEach((sprite,cell)=>{this.sprites[a*16+cell]=sprite;this.bounds[a*16+cell]={x:0,y:0,w:sprite.width,h:sprite.height};});});
  await Promise.all(Object.entries(SPECIES_SPRITES).map(async([index,path])=>{
   const sprite=this.extractCell(await img(path),0,1,1,false);
   this.sprites[index]=sprite;this.bounds[index]={x:0,y:0,w:sprite.width,h:sprite.height};
  }));
  const food=await img('assets/creatures/food-atlas.png');
  for(let i=0;i<8;i++){
   // Single food paintings cross the implied grid: overscan before isolating
   // their connected silhouette. The two clusters retain their detached pieces;
   // their empty top margin excludes stray grass from the row above.
   const cw=food.width/4,ch=food.height/2,left=i%4*cw,top=Math.floor(i/4)*ch;
   const x=i<6?Math.max(0,Math.floor(left-cw*.22)):left,y=i<6?Math.max(0,Math.floor(top-ch*.12)):Math.floor(top+ch*.1);
   const right=i<6?Math.min(food.width,Math.ceil(left+cw*1.22)):left+cw,bottom=i<6?Math.min(food.height,Math.ceil(top+ch*1.12)):top+ch;
   this.foodSprites.push(this.extractCell(food,i,4,2,i<6,{x,y,w:right-x,h:bottom-y}));
  }
  this.creationArt=Object.fromEntries(await Promise.all(CREATION_ART.map(async key=>[key,await img('assets/creatures/creation-v1/'+key+'.png')])));
  await Promise.all([loadNurseryArt(this),loadHousekeeperArt(this),loadLookoutArt(this),loadCreviceArt(this),loadWalkerArt(this),loadNestArt(this),loadLanternArt(this)]);this.ready=true;
 }
 extractCell(image,cell,cols,rows,mainOnly,region=null){
  const w=region?.w||Math.floor(image.width/cols),h=region?.h||Math.floor(image.height/rows),c=document.createElement('canvas');c.width=w;c.height=h;const cx=c.getContext('2d',{willReadFrequently:true});cx.drawImage(image,region?.x??cell%cols*w,region?.y??Math.floor(cell/cols)*h,w,h,0,0,w,h);const d=cx.getImageData(0,0,w,h),pixels=d.data;
  const labels=new Int32Array(w*h),queue=new Int32Array(w*h);let label=0,biggest=0,biggestLabel=0;
  if(mainOnly){for(let start=0;start<labels.length;start++){if(labels[start]||pixels[start*4+3]<45)continue;label++;let head=0,tail=1;queue[0]=start;labels[start]=label;while(head<tail){const n=queue[head++],x=n%w,y=Math.floor(n/w);for(const dy of [-1,0,1])for(const dx of [-1,0,1]){if(!dx&&!dy||x+dx<0||x+dx>=w||y+dy<0||y+dy>=h)continue;const k=n+dy*w+dx;if(!labels[k]&&pixels[k*4+3]>=45){labels[k]=label;queue[tail++]=k;}}}if(tail>biggest){biggest=tail;biggestLabel=label;}}}
  let minx=w,miny=h,maxx=0,maxy=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const n=y*w+x;if(mainOnly&&labels[n]!==biggestLabel){let neighbor=false;if(pixels[n*4+3]>0&&pixels[n*4+3]<45){for(let dy=-2;dy<=2&&!neighbor;dy++)for(let dx=-2;dx<=2;dx++){if(x+dx>=0&&x+dx<w&&y+dy>=0&&y+dy<h&&labels[n+dy*w+dx]===biggestLabel){neighbor=true;break;}}}if(!neighbor)pixels[n*4+3]=0;}if(pixels[n*4+3]>40){minx=Math.min(x,minx);maxx=Math.max(x,maxx);miny=Math.min(y,miny);maxy=Math.max(y,maxy);}}
  cx.putImageData(d,0,0);const out=document.createElement('canvas');out.width=Math.max(1,maxx-minx+3);out.height=Math.max(1,maxy-miny+3);out.getContext('2d').drawImage(c,minx,miny,maxx-minx+1,maxy-miny+1,1,1,maxx-minx+1,maxy-miny+1);return out;
 }
 extractAtlas(image){
  // Segment the complete atlas before assigning cells. Grid-first cropping amputated
  // fins, noses and the seahorse's head when artwork crossed an implied cell boundary.
  const w=image.width,h=image.height,c=document.createElement('canvas');c.width=w;c.height=h;
  const cx=c.getContext('2d',{willReadFrequently:true});cx.drawImage(image,0,0);const pixels=cx.getImageData(0,0,w,h).data;
  const labels=new Int32Array(w*h),queue=new Int32Array(w*h),components=[];let label=0;
  for(let start=0;start<labels.length;start++){
   if(labels[start]||pixels[start*4+3]<45)continue;
   label++;let head=0,tail=1,sumx=0,sumy=0,minx=w,miny=h,maxx=0,maxy=0;queue[0]=start;labels[start]=label;
   while(head<tail){const n=queue[head++],x=n%w,y=Math.floor(n/w);sumx+=x;sumy+=y;minx=Math.min(minx,x);maxx=Math.max(maxx,x);miny=Math.min(miny,y);maxy=Math.max(maxy,y);
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy||x+dx<0||x+dx>=w||y+dy<0||y+dy>=h)continue;const k=n+dy*w+dx;if(!labels[k]&&pixels[k*4+3]>=45){labels[k]=label;queue[tail++]=k;}}
   }
   if(tail>400)components.push({label,area:tail,cx:sumx/tail,cy:sumy/tail,minx,miny,maxx,maxy});
  }
  const available=components.sort((a,b)=>b.area-a.area).slice(0,16);if(available.length!==16)throw new Error('A creature atlas does not contain 16 complete silhouettes.');
  return Array.from({length:16},(_,cell)=>{
   const px=(cell%4+.5)*w/4,py=(Math.floor(cell/4)+.5)*h/4;
   const rank=o=>((o.cx-px)/(w/4))**2+((o.cy-py)/(h/4))**2;
   available.sort((a,b)=>rank(a)-rank(b));const part=available.shift();
   const left=Math.max(0,part.minx-2),top=Math.max(0,part.miny-2),right=Math.min(w-1,part.maxx+2),bottom=Math.min(h-1,part.maxy+2);
   const out=document.createElement('canvas');out.width=right-left+3;out.height=bottom-top+3;const oc=out.getContext('2d'),data=oc.createImageData(out.width,out.height);
   for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++){
    const n=y*w+x;let include=labels[n]===part.label;
    if(!include&&pixels[n*4+3]>0&&pixels[n*4+3]<45){for(let dy=-2;dy<=2&&!include;dy++)for(let dx=-2;dx<=2;dx++){if(x+dx>=0&&x+dx<w&&y+dy>=0&&y+dy<h&&labels[n+dy*w+dx]===part.label){include=true;break;}}}
    if(include){const dst=((y-top+1)*out.width+x-left+1)*4;data.data.set(pixels.subarray(n*4,n*4+4),dst);}
   }
   oc.putImageData(data,0,0);return out;
  });
 }
 drawSprite(ctx,species,x,y,width,facing=1,time=0,alpha=1,activity=1,pattern=null,state={}){
  let im=state.sprite||this.sprites[species.index];const b=state.spriteBounds||(state.sprite?{x:0,y:0,w:im?.width,h:im?.height}:this.bounds[species.index]);if(!b||!im)return;
  if(species.id==='custom'&&species.appearance?.appearanceVersion===1){this.creationPainter??=new CreationPainter(this.creationArt);ctx.save();ctx.translate(x,y);ctx.scale(facing,1);ctx.globalAlpha=alpha;this.creationPainter.draw(ctx,species,im,width,this.reducedMotion?0:time,activity,state);ctx.restore();return;}
  if(pattern&&species.id==='s19')im=artistSprite(this,im,pattern);
  if(species.id==='custom'&&species.color){const key=species.index+species.color;if(!this.customCache.has(key)){const tint=document.createElement('canvas');tint.width=im.width;tint.height=im.height;const tc=tint.getContext('2d');tc.drawImage(im,0,0);tc.globalCompositeOperation='source-atop';tc.globalAlpha=.6;tc.fillStyle=species.color;tc.fillRect(0,0,tint.width,tint.height);if(this.customCache.size>=64)this.customCache.delete(this.customCache.keys().next().value);this.customCache.set(key,tint);}im=this.customCache.get(key);}
  const h=width*(state.heightRatio??b.h/b.w);ctx.save();ctx.translate(x,y);ctx.scale(facing,1);ctx.globalAlpha=alpha;
  const animate=!this.reducedMotion&&time>0;
  const partId=species.id==='custom'?'s'+species.index:species.id;
  const heldPose=this.reducedMotion&&(state.brood>0||species.ability==='flash'||state.spines||state.sting||state.feed>0);
  if(state.articulated||state.lantern)ctx.drawImage(im,b.x||0,b.y||0,b.w,b.h,-width/2,-h/2,width,h);
  else if((animate||heldPose)&&PART_RIGS[partId]&&!state.puff){this.parts??=new PaintedParts();this.parts.draw(ctx,im,partId,width,h,this.reducedMotion?2.25:time,this.reducedMotion?0:activity,state);}
  else if(animate||heldPose||state.puff>0){this.articulation??=new ArticulatedSprites();this.articulation.draw(ctx,im,species,width,h,this.reducedMotion?0:time,this.reducedMotion?0:activity,state,Math.max(1,this.canvas.width/1600));}
  else ctx.drawImage(im,0,0,b.w,b.h,-width/2,-h/2,width,h);ctx.restore();
 }
 drawCreature(ctx,e,time,dt,alpha=1,width=creatureWidth(e.species)){
  this.poses??=new Map();
  // Custom walking owns world-space limb contacts and publishes its physical frame.
  const previousContext=this.ctx;this.ctx=ctx;let walked;
  try{walked=drawWalkerCreature(this,this.currentSimulation,e,time);}finally{this.ctx=previousContext;}
  if(walked)return;
  let pose=this.poses.get(e.id);
  if(pose?.walking){this.poses.delete(e.id);pose=null;}
  const crevice=creviceAppearance(this,this.currentSimulation,e,time);
  if(crevice&&drawCreviceCreature(ctx,this,this.currentSimulation,e,crevice,width,alpha)){
   const p=crevice.pose,frame={x:p.x,y:p.y,width:p.width,height:p.height,rotation:p.rotation,facing:p.facing,anchor:[.5,.5]};
   this.poses.set(e.id,{x:e.x,y:e.y,facing:p.facing,incarnation:e.incarnation||0,physical:true,frame});return;
  }
  if(pose?.physical){this.poses.delete(e.id);pose=null;}
  if(!pose||pose.incarnation!==(e.incarnation||0)||Math.hypot(e.x-pose.x,e.y-pose.y)>200){pose={x:e.x,y:e.y,facing:e.facing,activity:.35,motionTime:time+animationPhase(e.id),incarnation:e.incarnation||0};this.poses.set(e.id,pose);}
  pose.yaw??=pose.facing;
  if(dt>0){const normalSpeed=e.groundRoute?groundSpeed(e):e.species.speed,moving=Math.min(1,Math.hypot(e.x-pose.x,e.y-pose.y)/dt/Math.max(.1,normalSpeed)),blend=1-Math.exp(-dt*12);pose.activity+=(moving-pose.activity)*blend;pose.x=e.x;pose.y=e.y;}
  const propulsion=swimmingPropulsion(pose,e,dt);
  if(dt>0)pose.motionTime+=dt*propulsion.rate;
  const cleaning=this.cleaningPresentations?.get(e),stance=cleaning?.mode==='inspect'?{...e,activity:'cleaning'}:e;
  const look=housekeeperAppearance(this,this.currentSimulation,e,time)||lookoutAppearance(this,this.currentSimulation,e,time)||nestAppearance(this,this.currentSimulation,e,time)||shadeAppearance(this,this.currentSimulation,e,time)||lanternAppearance(this,this.currentSimulation,e,time);
  const physical=!!(look?.physical||look?.pose?.anchored),storyPose=look?.pose||{};
  const turn=physical?{facing:look.facing??storyPose.facing??e.facing??1,pivot:0,bank:0,bend:0}:turningPose(pose,stance,dt,this.reducedMotion),facing=turn.facing;
  const clock=pose.motionTime,clinic=clinicPose(this.currentSimulation,e,clock,this.reducedMotion),barbel=barbelPoseFor(this.currentSimulation,e),nursery=nurseryAppearanceFor(this.currentSimulation,e),artist=appearanceFor(this.currentSimulation,e),posture=poseFor(stance,clock,this.reducedMotion),targetPitch=e.groundRoute?groundPitch(e):e.species.id==='s41'&&e.activity==='at-home'?1.1*facing:(look?.rotation??posture.pitch)+(clinic?.pitch||0);
  pose.pitch??=targetPitch;if(cleaning?.mode==='inspect')pose.pitch=0;else if(dt>0)pose.pitch+=(targetPitch-pose.pitch)*(1-Math.exp(-dt*5));
  const rotation=physical?(look.rotation??storyPose.rotation??0):this.reducedMotion?groundPitch(e):pose.pitch,frame=creatureFrame(e,width,rotation);
  if(physical){frame.x=look.x??storyPose.x??e.x;frame.y=look.y??storyPose.y??e.y;frame.anchor=[.5,.5];}
  if(look?.heightRatio)frame.height=width*look.heightRatio;
  else if(look?.sprite){const b=look.spriteBounds;frame.height=width*(b?b.h/b.w:look.sprite.height/look.sprite.width);}
  const underside=['s47','s62'].includes(e.species.id);
  if(e.groundRoute){ctx.save();ctx.globalAlpha=alpha*.18;ctx.translate(e.x,e.y);ctx.scale(width*.42,Math.max(2,width*.065));const shadow=ctx.createRadialGradient(0,0,.05,0,0,1);shadow.addColorStop(0,'#102d27');shadow.addColorStop(1,'#102d2700');ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();ctx.restore();}
  const display=physical?{x:0,y:0,pitch:0}:displayPose(e,clock,this.reducedMotion);
  pose.frame={...frame,x:frame.x+turn.pivot*width+display.x,y:frame.y+display.y,rotation:rotation+turn.bank+display.pitch,width:width*Math.abs(facing),facing};
  setCreatureDisplayFrame(e,pose.frame);
  if(underside)this.drawResidentMorsel(ctx,e,rotation,alpha,pose.frame);
  ctx.save();ctx.translate(frame.x+turn.pivot*width+display.x,frame.y+display.y);ctx.rotate(rotation+turn.bank+display.pitch);
  const feed=storyPose.feed??Math.max(cleaning?.mode==='inspect'?cleaning.feed:feedingEnvelope(e),clinic?.feed||0);
  pose.lure??=0;if(dt>0)pose.lure+=(lureDisplay(e)-pose.lure)*(1-Math.exp(-dt*7));
  const desiredProbe=e.species.id==='s9'&&['searching','probing'].includes(e.activity)?1:0;pose.probe??=0;if(dt>0)pose.probe+=(desiredProbe-pose.probe)*(1-Math.exp(-dt*6));
  const desiredPuff=e.species.ability==='puff'&&e.abilityTime>0?1:0;pose.puff??=desiredPuff;
  if(this.reducedMotion)pose.puff=desiredPuff;else if(dt>0)pose.puff+=(desiredPuff-pose.puff)*(1-Math.exp(-dt*(desiredPuff?4:2.5)));
  const feedAngle=e.residentMeal?Math.atan2(e.residentMeal.y-e.y,e.residentMeal.x-e.x):e.angle||0;
  const effort=storyPose.effort??cleaning?.effort??clinic?.effort??propulsion.effort,brake=storyPose.brake??(this.reducedMotion?0:Math.max(propulsion.brake,cleaning?.brake||0,clinic?.brake||0));
  const blend=Math.min(1,(e.blendTime||0)/2);this.drawSprite(ctx,e.species,0,0,width,facing,clock,alpha,effort,null,{instance:e.id,feed,lure:pose.lure,probe:Math.max(pose.probe,barbel?.probe||0),tactile:barbel?.tactile||0,barbelContact:barbel?.barbelContact||0,...nursery,sting:e.species.ability==='sting'&&e.abilityTime>0?1:0,spines:e.species.ability==='spines'&&e.abilityTime>0?1:0,mimic:e.species.ability==='mimic'&&e.abilityTime>0?1:0,flash:e.species.ability==='flash'&&e.abilityTime>0?1:0,brake,retract:e.retract||0,puff:pose.puff,turn:physical?0:turn.bend,heading:e.angle||0,feedAngle,...storyPose,sprite:look?.sprite,spriteBounds:look?.spriteBounds,heightRatio:look?.heightRatio,articulated:look?.articulated});if((artist?.strength||blend)>0&&(artist||e.blending))this.drawSprite(ctx,e.species,0,0,width,facing,clock,alpha*(artist?.strength??blend),effort,artist?.pattern??e.blending.kind,{instance:e.id,feed,turn:turn.bend});ctx.restore();
  if(!underside)this.drawResidentMorsel(ctx,e,rotation,alpha,pose.frame);
  pose.cleaning=cleaning||null;
 }
 drawResidentMorsel(ctx,e,rotation,alpha,displayFrame){
  const meal=e.residentMeal;
  if(meal&&Number.isFinite(meal.x)&&Number.isFinite(meal.y)&&meal.elapsed<.42){
   const end=displayedMouthPoint(e,displayFrame),progress=this.reducedMotion?1:Math.min(1,meal.elapsed/.22),ease=progress*progress*(3-2*progress);
   ctx.save();ctx.globalAlpha=alpha*(meal.committed?Math.max(0,1-(meal.elapsed-.22)/.2):1);ctx.fillStyle=FOODS[meal.food]?.color||'#e7ce97';ctx.beginPath();ctx.arc(meal.x+(end.x-meal.x)*ease,meal.y+(end.y-meal.y)*ease,2,0,Math.PI*2);ctx.fill();ctx.restore();
  }
 }
 portrait(canvas,species,time=0,pointer=.6){const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);const b=this.bounds[species.index];if(!b)return;this.drawSprite(ctx,species,canvas.width*(.4+pointer*.2),canvas.height/2,(species.appearance?.appearanceVersion===1?Math.min(canvas.width*.78,canvas.height*.78/anatomy(species).height)*(.40+species.size/180*.60):Math.min(canvas.width*.78,canvas.height*.78*b.w/b.h)),pointer<.5?-1:1,time);}
 syncScene(sim,home=false){
  const player=sim?.player??null,section=sim?.current??null;
  if(this.renderedPlayer!==player||this.renderedSection!==section||this.renderedHome!==home){
   this.effects=[];this.poses=new Map();this.cleaningPresentations=new Map();this.hover=null;
   this.renderedPlayer=player;this.renderedSection=section;this.renderedHome=home;
  }
 }
 addEffect(type,x=800,y=350,label=null){if(!Number.isFinite(x)||!Number.isFinite(y))return;this.effects.push({type,x,y,t:0,label});if(this.effects.length>24)this.effects.splice(0,this.effects.length-24);}
 draw(sim,dt,home=false){
  this.currentSimulation=home?null:sim;
  this.syncScene(sim,home);
  this.tagQueue=[];this.labelLayout=[];this.playerMarker=null;
  this.articulation?.beginFrame();
  if(home||!sim||(!sim.paused&&sim.phase==='playing'))this.clock+=dt;const c=this.ctx;c.setTransform(this.canvas.width/1600,0,0,this.canvas.height/900,0,0);c.clearRect(0,0,1600,900);
  const reef=home?this.splash:this.reefs[sim?.current??0];if(reef)c.drawImage(reef,0,0,1600,900);else{c.fillStyle='#1b6c7d';c.fillRect(0,0,1600,900);}
  if(!this.ready)return;
  const t=this.clock;
  // Very fine suspended particles, not a screen-obscuring fog or dark night filter.
  if(!this.reducedMotion){c.fillStyle='#f6f5d3';for(let i=0;i<38;i++){const x=(i*137.53+Math.sin(t*.2+i)*18)%1600,y=(i*73.91-t*(2+i%4)+1800)%900;c.globalAlpha=.07+(i%3)*.025;c.beginPath();c.arc(x,y,.7+i%2*.6,0,Math.PI*2);c.fill();}c.globalAlpha=1;}
  if(home){
   this.titleReef.draw(this,c,dt,this.reducedMotion,this.titleBlocked);
   return;
  }
  if(!sim?.player)return;
  if(this.poses){const live=new Set([sim.player.id,...sim.section.entities.filter(e=>e.alive).map(e=>e.id)]);for(const id of this.poses.keys())if(!live.has(id))this.poses.delete(id);}
  const motionDt=sim.paused||sim.phase!=='playing'?0:dt;
  c.save();c.translate(0,TOP);
  drawHousekeeper(this,sim,t,{layer:'habitat'});drawWalker(this,sim,t);drawCrevice(this,sim,t,'back');
  const buried=['s9','s23'].includes(sim.player.species.id)?new Set(sitesFor(sim).filter(s=>!(s.food.uncovered>0)).map(s=>s.id)):new Set();
  for(const f of sim.section.food){if(f.regrow>0||storyFoodHidden(sim,f)||(f.food==='algae'&&((activeStory(sim)==='engineer'&&[0,1].includes(sim.current))||sim.reefStories?.engineer?.patches.some(p=>p.reef===sim.current&&p.id===f.id))))continue;if(buried.has(f.id)){c.fillStyle='#b8a47e';c.globalAlpha=.6;c.beginPath();c.ellipse(f.x,f.y,22,5,0,0,Math.PI*2);c.fill();c.globalAlpha=1;continue;}this.drawFood(c,f,t);}
  const living=sim.section.entities.filter(e=>e.alive),workingCleaners=living.filter(foregroundCleaner),p=sim.player,playerWidth=creatureWidth(p.species),cover=escortCover(sim),namedPlaces=[];let playerDrawn=false;
  this.cleaningPresentations=new Map([p,...living].map(e=>{const pose=this.poses?.get(e.id),previous=pose?.incarnation===(e.incarnation||0)?pose.cleaning:null;return [e,cleaningPresentation(sim,e,this.reducedMotion,previous)];}));
  for(const e of refugeLayers(living.filter(e=>!foregroundCleaner(e)))){
   if(cover===e){this.drawCreature(c,p,t,motionDt,1,playerWidth);playerDrawn=true;}
   this.drawCreature(c,e,t,motionDt,.98);
   if(this.inspect&&watchedResident(sim)===e&&this.hover!==e)this.tag(c,e.x,e.y-35,creatureLabel(e),1,60);
   if(this.inspect&&e.species.ability==='clean'&&!sim.player.cleanTime&&this.hover!==e)this.tag(c,e.x,e.y-30,'Cleaner');
  }
  const buddy=companion(sim);
  if(!playerDrawn)this.drawCreature(c,p,t,motionDt,['artist','nursery','housekeeper','lookout','walker','nest','crevice','shade','lantern'].includes(activeStory(sim))?1:p.hidden?(p.blending||p.ambush?.65:.25):1,playerWidth);
  for(const e of workingCleaners){this.drawCreature(c,e,t,motionDt,.98);if(this.inspect&&!p.cleanTime&&this.hover!==e)this.tag(c,e.x,e.y-30,'Cleaner');}
  drawCrevice(this,sim,t,'front');drawNest(this,sim,t);drawShade(this,sim,t);drawLantern(this,sim,t);
  if((sim.adventure?.visible||sim.adventure?.homeJourney)&&ADVENTURES[p.species.id]&&(!this.inspect||sim.adventure?.grazing||sim.adventure?.homeJourney||sim.adventure?.patrolJourney||sim.adventure?.watchJourney)){const chosen=selectedSite(sim);for(const site of (activeStory(sim)?[]:sitesFor(sim))){const remembered=sim.adventure?.homeJourney?.reef===sim.current&&site.id===sim.adventure.homeJourney.site||site.kind==='route'&&site.id.startsWith('patrol-')||site.kind==='watch';if(!remembered&&Math.hypot(site.x-p.x,site.y-p.y)>240&&site.id!==chosen?.id)continue;if(!remembered&&Math.hypot(site.x-p.x,site.y-p.y)>420)continue;c.save();c.strokeStyle='#e5d6a4';c.globalAlpha=.65;c.lineWidth=1.5;c.setLineDash([4,7]);c.beginPath();c.ellipse(site.x,site.y,30,15,0,0,Math.PI*2);c.stroke();c.restore();if(site.id===chosen?.id||site.kind==='home'&&sim.adventure.homeJourney?.reef===sim.current&&site.id===sim.adventure.homeJourney.site){this.tag(c,site.x,site.y-28,activitySiteLabel(site));namedPlaces.push(site);}}}
  if(sim.trial||sim.creation&&(sim.adventure?.visible||sim.creation.home?.reef===sim.current)){const saved=sim.creation?.home;for(const [i,site]of REEFS[sim.current].shelters.entries()){if(canUseShelter(p.species)){const own=saved?.reef===sim.current&&saved.index===i;if(!own&&!sim.trial&&!sim.adventure?.visible)continue;c.save();c.strokeStyle=own?'#f4c76e':'#d6ecd2';c.lineWidth=own?2:1;c.beginPath();c.ellipse(site.x,site.y,site.r*.65,site.r*.3,0,0,Math.PI*2);c.stroke();c.restore();this.tag(c,site.x,site.y-35,own?'Home':sim.trial?'Shelter':'Refuge');namedPlaces.push(site);}}}
  if(sim.adventure?.home?.reef===sim.current){const h=sim.adventure.home;c.save();c.strokeStyle='#c5e8c6';c.lineWidth=2;c.beginPath();c.arc(h.x,h.y,35,0,Math.PI*2);c.stroke();c.restore();}
  this.playerMarker=playerLocator(this.poses.get(p.id)?.frame||creatureFrame(p),this.uiUnit);
  for(const actor of [p,...living])abilityWater(c,actor,t,this.reducedMotion);
  for(const cue of treatmentCues(sim,this.cleaningPresentations))drawTreatmentCue(c,cue,this.uiUnit,this.reducedMotion);
  if(this.foodHints&&!this.inspect&&!p.cleanTime&&!sim.mealTarget){
   const hints=nearbyFoodHints(sim);
   for(const [i,food] of hints.entries()){
    const frame=food.species?creaturePickFrame(food):food,width=food.species?frame.width:food.size||25;
    const x=frame.x,y=frame.y,r=width*.6+8;
    c.save();c.beginPath();
    for(const side of [-1,1]){c.moveTo(x+side*(r-7),y-r*.65);c.lineTo(x+side*r,y-r*.65);c.lineTo(x+side*r,y+r*.65);c.lineTo(x+side*(r-7),y+r*.65);}
    c.strokeStyle='#103944';c.lineWidth=4;c.stroke();c.strokeStyle='#fce5a2';c.lineWidth=1.8;c.stroke();c.restore();
    if(i===0)this.tag(c,x,Math.max(30,y-r*.65-22),'Food');
   }
  }
  const meal=sim.mealTarget;
  if(meal&&!sim.paused&&sim.phase==='playing'){
   const frame=meal.species?creaturePickFrame(meal):{x:meal.x,y:meal.y,width:meal.size||25,height:(meal.size||25)*.8,rotation:0};
   c.strokeStyle='#103944';c.lineWidth=4;c.beginPath();c.ellipse(frame.x,frame.y,frame.width*.6+8,frame.height*.5+8,frame.rotation,0,Math.PI*2);c.stroke();
   c.strokeStyle='#fce5a2';c.lineWidth=1.8;c.stroke();
   this.tag(c,frame.x,Math.max(30,frame.y-frame.height*.5-24),'Food',1,60);
  }
  if(this.inspect&&canUseShelter(p.species)){for(const s of REEFS[sim.current].shelters){if(namedPlaces.some(site=>Math.hypot(site.x-s.x,site.y-s.y)<1))continue;c.setLineDash([5,6]);c.strokeStyle='#e2efbba6';c.lineWidth=2;c.beginPath();c.arc(s.x,s.y,s.r,0,Math.PI*2);c.strokeStyle='#103944';c.lineWidth=4;c.stroke();c.strokeStyle='#e2efbb';c.lineWidth=2;c.stroke();c.setLineDash([]);this.tag(c,s.x,Math.max(20,s.y-s.r-16),'Shelter');}}
  if(this.hover?.alive===false||this.hover?.regrow>0)this.hover=null;
  if(this.hover){const h=this.hover,frame=h.species?creaturePickFrame(h):{x:h.x,y:h.y,width:h.size||25,height:(h.size||25)*.8,rotation:0};c.strokeStyle='#fce5a2';c.lineWidth=1.6;c.setLineDash([3,5]);c.beginPath();c.ellipse(frame.x,frame.y,frame.width*.6+8,frame.height*.5+8,frame.rotation,0,Math.PI*2);c.stroke();c.setLineDash([]);this.tag(c,frame.x,Math.max(30,frame.y-frame.height*.5-22),creatureLabel(h),1,80);}
  for(const e of this.effects){if(!sim.paused&&sim.phase==='playing')e.t+=dt;const cue=interactionCue(e.type,e.t,this.reducedMotion);if(cue)drawInteractionCue(c,cue,e.x,e.y,this.uiUnit);else if(e.type==='sand'){c.save();c.globalAlpha=Math.max(0,.6-e.t*.4);c.fillStyle='#e5d4a7';for(let i=0;i<14;i++){const age=this.reducedMotion?0:e.t;c.beginPath();c.arc(e.x+Math.sin(i*2.4)*(12+age*40),e.y-Math.cos(i*1.7)*8-age*18,1.5+i%3,0,Math.PI*2);c.fill();}c.restore();}else if(e.type==='hurt'){c.save();c.globalAlpha=Math.max(0,.85-e.t*.6);c.strokeStyle='#c36850';c.lineWidth=3*this.uiUnit;c.beginPath();c.ellipse(e.x,e.y,playerWidth*.6+10,creatureFrame(p).height*.55+10,0,0,Math.PI*2);c.stroke();c.restore();}else if(!interactionCue(e.type,0)){c.strokeStyle=`rgba(234,246,221,${Math.max(0,.5-e.t*.5)})`;c.lineWidth=2;c.beginPath();c.arc(e.x,e.y,12+(this.reducedMotion?0:e.t*60),0,Math.PI*2);c.stroke();}}
  this.effects=this.effects.filter(e=>e.t<(interactionCue(e.type,0)?.lifetime||1.4));
  const interacting=new Set(living.filter(e=>e.activity==='shadowing'||e.activity==='probing'||e.activity==='investigating-lure'||lureDisplay(e)>.1||e.activity==='at-home'&&e.ecology?.watch||e.cleanTime>0||foregroundCleaner(e)));
  if(buddy)interacting.add(buddy);
  // Inspection should reveal the fish and its nearby companions, including
  // a partner waiting above a meal where the hover label used to cover it.
  const focus=living.find(e=>e===this.hover);
  if(focus){interacting.add(focus);for(const e of living)if(e.id===focus.ecology?.partner||focus.activity==='schooling'&&e.species.id===focus.species.id&&Math.hypot(e.x-focus.x,e.y-focus.y)<260)interacting.add(e);}
  for(const e of [...interacting]){const host=living.find(h=>h.id===(e.ecology?.watch?.id??e.ecology?.host));if(host)interacting.add(host);}
  const clearFrames=[...interacting].map(e=>({...projectedBounds(this.poses.get(e.id)?.frame||creatureFrame(e),4*this.uiUnit),id:e.id}));
  drawEngineer(this,sim,t);drawClinic(this,sim,t);drawArtist(this,sim,t);drawDetective(this,sim,t);drawNursery(this,sim,t);drawHousekeeper(this,sim,t,{layer:'effects'});drawLookout(this,sim,t);this.drawPlayerMarker(c,p.hidden);this.drawTags(c,clearFrames);c.restore();
 }
 tag(c,x,y,text,alpha=1,priority=0){
  if(alpha<=0||!text)return;const unit=this.uiUnit||1;c.save();c.font=`${15*unit}px AtollSans, sans-serif`;
  this.tagQueue.push({anchor:{x,y},text,alpha,width:c.measureText(text).width+22*unit,height:27*unit,priority});c.restore();
 }
 drawPlayerMarker(c,hidden){
  const m=this.playerMarker;if(!m)return;const unit=this.uiUnit||1,x=m.x+m.width/2;
  const tip=m.y+(m.below?7:16)*unit,dir=m.below?-1:1;
  c.save();c.lineJoin='round';c.beginPath();c.moveTo(x-6*unit,tip-dir*5*unit);c.lineTo(x,tip);c.lineTo(x+6*unit,tip-dir*5*unit);c.strokeStyle='#103944';c.lineWidth=4.5*unit;c.stroke();c.lineWidth=2*unit;c.strokeStyle=hidden?'#b9e0bb':'#fff1bd';c.stroke();c.restore();
 }
 drawTags(c,clearFrames=[]){
  const unit=this.uiUnit||1,m=this.playerMarker;
  this.labelObstacles=[...(m?[m,m.body]:[]),...clearFrames];
  this.labelLayout=arrangeLabels(this.tagQueue,this.labelObstacles,undefined,6*unit);
  for(const b of this.labelLayout){
   c.save();c.globalAlpha=Math.max(0,b.alpha);const x=b.x+b.width/2,y=b.y+b.height/2;
   if(Math.hypot(x-b.anchor.x,y-b.anchor.y)>10*unit){const endX=Math.max(b.x,Math.min(b.x+b.width,b.anchor.x)),endY=Math.max(b.y,Math.min(b.y+b.height,b.anchor.y));c.beginPath();c.moveTo(b.anchor.x,b.anchor.y);c.lineTo(endX,endY);c.strokeStyle='#103944';c.lineWidth=3*unit;c.stroke();c.strokeStyle='#e2efbb';c.lineWidth=unit;c.stroke();}
   c.fillStyle='#103944ed';c.beginPath();c.roundRect(b.x,b.y,b.width,b.height,6*unit);c.fill();c.font=`${15*unit}px AtollSans, sans-serif`;let text=b.text;
   // Subtracting fractional-scale padding can lose one floating-point bit.
   // Do not ellipsize a word that fits to a millionth of a canvas pixel.
   const available=b.width-22*unit+1e-6;
   if(c.measureText(text).width>available){while(text.length&&c.measureText(text+'…').width>available)text=text.slice(0,-1);text+='…';}
   c.fillStyle='#fff6da';c.textAlign='center';c.textBaseline='middle';c.fillText(text,x,y);c.restore();
  }
 }
 drawFood(c,f,t){
  if(f.uncovered>0){c.save();c.strokeStyle="#ddc692";c.globalAlpha=.5;c.beginPath();c.ellipse(f.x,f.y,30,12,0,0,Math.PI*2);c.stroke();c.restore();}
  const remaining=Math.max(0,Math.min(1,(f.amount??100)/100)),scale=.6+remaining*.4;
  c.save();c.translate(f.x,f.y);c.scale(scale,scale);c.translate(-f.x,-f.y);
  this.drawFoodBody(c,f,this.reducedMotion?0:t,remaining);c.restore();
 }
 drawFoodBody(c,f,t,remaining){
  const cell={algae:0,grass:1,coral:2,sponge:3,worm:4,shrimp:5}[f.food];
  if(cell!==undefined&&this.foodSprites[cell]){const sprite=this.foodSprites[cell],height=f.food==='grass'?68:f.food==='worm'?15:f.food==='shrimp'?21:44,width=height*sprite.width/sprite.height;c.save();c.translate(f.x,f.y);if(!this.reducedMotion&&['algae','grass'].includes(f.food))c.rotate(Math.sin(t*.65+f.phase)*.035);c.drawImage(sprite,-width/2,-height/2,width,height);c.restore();return;}
  c.save();c.translate(f.x,f.y);const s=f.size;c.lineCap='round';
  if(f.food==='detritus'){c.fillStyle='#c3ad84';for(let i=0;i<Math.ceil(remaining*7);i++){c.beginPath();c.ellipse(Math.sin(i*2.3)*s,Math.cos(i*3.7)*s*.3,1.8,1, i,0,Math.PI*2);c.fill();}}
  else if(f.food==='plankton'){c.fillStyle='#f2e8b4';for(let i=0;i<Math.max(1,Math.ceil(remaining*9));i++){const a=i*2.4+t*.12;c.globalAlpha=.45+i%3*.14;c.beginPath();c.arc(Math.cos(a)*s*.8,Math.sin(a*1.1)*s*.65,1.4+i%2,0,Math.PI*2);c.fill();}}
  else if(['algae','grass'].includes(f.food)){for(let i=0;i<7;i++){c.strokeStyle=i%2?'#779b42':'#b1c971';c.lineWidth=2.5;c.beginPath();c.moveTo((i-3)*4,12);c.quadraticCurveTo((i-3)*7+Math.sin(t*.5+i)*3,-s*.4,(i-3)*4,-s);c.stroke();}}
  else if(f.food==='coral'){c.strokeStyle='#df836a';c.lineWidth=3;for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(0,12);c.lineTo(i*7,-10);c.lineTo(i*9,-s);c.moveTo(i*7,-10);c.lineTo(i*12,-s*.6);c.stroke();}}
  else if(f.food==='sponge'){for(let i=-1;i<=1;i++){c.fillStyle=i===0?'#b87baf':'#926d9e';c.beginPath();c.ellipse(i*9,-i*i*4,8,22-i*i*4,-i*.1,0,Math.PI*2);c.fill();c.fillStyle='#624561';c.beginPath();c.ellipse(i*9,-19-i*i,5,3,0,0,Math.PI*2);c.fill();}}
  else if(f.food==='worm'){c.strokeStyle='#dca478';c.lineWidth=4;c.beginPath();c.moveTo(-14,3);c.bezierCurveTo(-7,-8,2,9,15,-4);c.stroke();}
  else if(f.food==='shrimp'){this.drawSprite(c,SPECIES[45],0,0,30,1,t);}
  c.restore();
 }
}
