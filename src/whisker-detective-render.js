import {storyCue} from './whisker-detective.js';
import {creatureWidth,creaturePickFrame} from './geometry.js';
import {PART_RIGS,partTransform} from './part-motion.js';
import {rigFor} from './animal-rigs.js';
import {interactionCue,drawInteractionCue} from './interaction-cues.js';

const clamp=n=>Math.max(0,Math.min(1,Number.isFinite(n)?n:0));
const story=sim=>sim?.reefStories?.detective;
const onReef=sim=>['detective','whisker-detective'].includes(sim?.reefStories?.active)&&sim.player?.species.id==='s9'&&story(sim)?.reef===sim.current;

// Only tactile intensity enters the existing painted barbel rig. Direction and
// the location of an undiscovered meal never enter presentation geometry.
export function barbelPoseFor(sim,fish){
 if(!onReef(sim)||fish!==sim.player||story(sim).complete||story(sim).stage!=='search'||fish.hidden||fish.stun>0||fish.cleanTime>0||fish.cleanerTarget||fish.health<=0)return null;
 const cue=storyCue(sim),strength=clamp(cue.strength);
 return {probe:cue.probing?1:strength*.9,tactile:strength,barbelContact:cue.contact?1:0};
}

function worldPoint(frame,width,height,x,y){
 const facing=frame.facing??1,rotation=frame.rotation||0,dx=(x-width/2)*facing,dy=y-height/2;
 return {x:frame.x+dx*Math.cos(rotation)-dy*Math.sin(rotation),y:frame.y+dx*Math.sin(rotation)+dy*Math.cos(rotation)};
}

// Use precisely the same affine pose as the real artwork, including turns.
// These are the ends of the authored painted strips, not an extra pair drawn
// over the animal. Exposed for landmark QA without requiring a live Canvas.
export function barbelTips(renderer,sim,time){
 if(!onReef(sim))return [];
 const fish=sim.player,pose=renderer.poses?.get(fish.id),display=pose?.frame||creaturePickFrame(fish),frame={...display,facing:display.facing??fish.facing??1},width=creatureWidth(fish.species),height=frame.height;
 const tactile=barbelPoseFor(sim,fish);
 if(!tactile)return [];
 const clock=renderer.reducedMotion?2.25:pose?.motionTime??time,state={...tactile,probe:Math.max(pose?.probe||0,tactile.probe)},effort=pose?.activity??.2;
 return PART_RIGS.s9.parts.filter(part=>part.mode==='barbel').map((part,i)=>{
  const uv=i?[.947,1.005]:[.894,1.005],m=partTransform('s9',part,width,height,clock,effort,state),[a,b,c,d,e,f]=m.matrix;
  const x=uv[0]*width-m.ax,y=uv[1]*height-m.ay;
  return {...worldPoint(frame,width,height,a*x+c*y+e,b*x+d*y+f),name:part.name};
 });
}

function tactileGrains(ctx,tips,strength,probing,time,reduced){
 const power=clamp(strength),amount=4+Math.floor(power*6),lift=probing?1.8:1;
 for(const [side,tip] of tips.entries()){
  for(let i=0;i<amount;i++){
   // Small irregular grains trace the water disturbed directly by each tip.
   const phase=i*2.399+side*1.8,cycle=reduced?.5:((time*(.6+power*.9)+i*.173+side*.31)%1+1)%1;
   const spread=3+cycle*(4+power*9),x=tip.x+Math.cos(phase)*spread,y=tip.y+3+Math.sin(phase)*spread*.22-cycle*(1+power*3)*lift;
   ctx.globalAlpha=(.09+power*.44)*(1-cycle*.7);ctx.fillStyle=i%3===0?'#eddfbc':i%3===1?'#c1ad7f':'#fff2d0';
   ctx.beginPath();ctx.ellipse(x,y,.65+power*.65+(i%2)*.25,.45+power*.3,phase,0,Math.PI*2);ctx.fill();
  }
  // A caught glint is local and brief; it is never a compass or a patch marker.
  if(power>.15){
   const gleam=reduced?.55:Math.max(0,Math.sin(time*(3.6+power*2)+side*2.1));
   ctx.globalAlpha=gleam*(.12+power*.38);ctx.strokeStyle='#fff0b9';ctx.lineWidth=.75+power*.45;
   ctx.beginPath();ctx.moveTo(tip.x-1.5,tip.y+.7);ctx.lineTo(tip.x+1.7,tip.y+.1);ctx.stroke();
  }
 }
}

function revealGrains(ctx,point,remaining,reduced){
 const progress=1-clamp(remaining/1.5),spread=reduced?.25:1-(1-progress)**2;
 for(let i=0;i<18;i++){
  const angle=i*2.399,x=point.x+Math.cos(angle)*(4+spread*(10+i%4*3)),y=point.y+Math.sin(angle)*3-spread*(3+i%5*3);
  ctx.globalAlpha=(.42-progress*.32)*(1-(i%4)*.1);ctx.fillStyle=i%3?'#ddc79a':'#fff0c8';
  ctx.beginPath();ctx.ellipse(x,y,.8+i%3*.3,.55+i%2*.25,angle,0,Math.PI*2);ctx.fill();
 }
}

function neighborReaction(renderer,sim,ctx,s){
 const e=sim.section?.entities.find(e=>e.alive&&e.id===s.neighbor?.id&&(e.incarnation||0)===s.neighbor.incarnation);
 if(!e)return;
 const frame=renderer.poses?.get(e.id)?.frame||creaturePickFrame(e),rig=rigFor(e.species),eye=worldPoint({...frame,facing:frame.facing??e.facing??1},creatureWidth(e.species),frame.height,rig.eye[0]*creatureWidth(e.species),rig.eye[1]*frame.height);
 if(s.reaction>0)drawInteractionCue(ctx,interactionCue('notice',Math.max(0,1.2-s.reaction),renderer.reducedMotion),eye.x,eye.y,1);
 if(s.witnessed&&(s.shareReveal>0||e.actionTime>0)){
  const remaining=s.shareReveal??Math.min(1.1,e.actionTime||0);
  drawInteractionCue(ctx,interactionCue('eat',Math.max(0,1.1-Math.min(1.1,remaining)),renderer.reducedMotion),eye.x,eye.y,1);
 }
}

// Call after creatures, with the same gameplay translation as drawFood. This
// paints only committed presentation state and never advances a story timer.
export function drawStory(renderer,sim,time=0){
 if(!onReef(sim)||!renderer.ctx)return;
 const ctx=renderer.ctx,s=story(sim),cue=storyCue(sim),pose=barbelPoseFor(sim,sim.player);
 ctx.save();ctx.beginPath();ctx.rect(0,0,1600,740);ctx.clip();ctx.lineCap='round';
 if(pose&&(cue.strength>0||cue.probing))tactileGrains(ctx,barbelTips(renderer,sim,time),cue.strength,cue.probing,time,renderer.reducedMotion);
 if(cue.found&&s.reveal>0)revealGrains(ctx,cue.found,s.reveal,renderer.reducedMotion);
 neighborReaction(renderer,sim,ctx,s);
 ctx.restore();
}

