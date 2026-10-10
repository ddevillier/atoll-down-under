import {nurseryOptions,MAX_JUVENILES} from './cardinalfish-nursery.js';

export const NURSERY_JUVENILE_ASSET='assets/story-nursery/banggai-juvenile-v1.png';
const art=new WeakMap();
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const nurseryActive=sim=>['nursery','cardinalfish-nursery'].includes(sim?.reefStories?.active)&&sim?.player?.species?.id==='s13';

/** Load once with the adult art; a failed asset remains a visible load error. */
export function loadNurseryArt(renderer){
 let entry=art.get(renderer);
 if(entry)return entry.promise;
 entry={sprite:null,promise:null};art.set(renderer,entry);
 entry.promise=new Promise((resolve,reject)=>{
  const image=new Image();
  image.onload=()=>{
   try{entry.sprite=renderer.extractCell(image,0,1,1,true);resolve();}
   catch(error){reject(error);}
  };
  image.onerror=()=>reject(new Error('Could not load nursery juvenile illustration: '+NURSERY_JUVENILE_ASSET));
  image.src=NURSERY_JUVENILE_ASSET;
 });
 return entry.promise;
}

/** Presentation state only: the father carries the brood until the release event. */
export function nurseryAppearanceFor(sim,fish){
 const story=sim?.reefStories?.nursery;
 if(!nurseryActive(sim)||fish!==sim.player||story?.stage!=='brooding')return {brood:0};
 const amount=Number.isFinite(fish.broodPose)&&fish.broodPose>0?fish.broodPose:.7;
 return {brood:clamp(amount,0,1)};
}

function drawCover(renderer,option,selected,stage){
 const c=renderer.ctx,unit=renderer.uiUnit||1;
 c.save();c.beginPath();c.ellipse(option.x,option.y,option.r*.65,option.r*.3,0,0,Math.PI*2);
 c.strokeStyle='#103944';c.lineWidth=3.5*unit;c.globalAlpha=.7;c.stroke();
 c.strokeStyle=selected?'#c5e8c6':option.safe?'#e5d6a4':'#b5d2d0';
 c.lineWidth=(selected?1.6:1)*unit;c.globalAlpha=selected?.95:.65;c.stroke();c.restore();
 const label=selected?'Nursery cover':'Cover '+(option.index+1)+(option.safe?' · quiet':option.threats?' · hunter nearby':' · busy');
 // This is a refuge locator, not a progress meter. Keep the animals unobscured.
 renderer.tag(c,option.x,option.y-option.r*.65-16*unit,label,1,stage==='choose'?55:40);
}

function drawYoung(renderer,sprite,young,index,time){
 const c=renderer.ctx,width=23+(index%2)*2,height=width*sprite.height/sprite.width;
 const clock=renderer.reducedMotion?0:time;
 const facing=young.facing===-1?-1:1;
 const heading=Number.isFinite(young.angle)?young.angle:0;
 // Their route belongs to simulation. Only the tiny fin/hover cadence is decorative.
 const pitch=clamp(Math.atan(Math.tan(heading))*.10,-.13,.13)+(renderer.reducedMotion?0:Math.sin(clock*2.1+young.phase)*.025);
 const bob=renderer.reducedMotion?0:Math.sin(clock*1.35+young.phase)*.6;
 c.save();c.translate(young.x,young.y+bob);c.rotate(pitch);c.scale(facing,1);
 c.globalAlpha=renderer.reducedMotion?1:clamp(.55+(young.age||0)*1.2,.55,1);
 c.drawImage(sprite,-width/2,-height/2,width,height);c.restore();
}

/** Draw within the renderer's translated world canvas; never advances story state. */
export function drawStory(renderer,sim,time=0){
 const story=sim?.reefStories?.nursery;
 if(!story||sim.current!==story.reef)return;
 const active=nurseryActive(sim),released=['released','complete'].includes(story.stage);
 if(active){
  const options=nurseryOptions(sim);
  if(story.stage==='choose')for(const option of options)drawCover(renderer,option,false,story.stage);
  else if(story.nursery){const option=options[story.nursery.index];if(option)drawCover(renderer,option,true,story.stage);}
 }
 if(!released)return;
 const sprite=art.get(renderer)?.sprite;
 if(!sprite)return; // ReefRenderer.load awaits the real illustration, never substitutes adult art.
 const young=story.juveniles.filter(j=>Number.isFinite(j.x)&&Number.isFinite(j.y)).slice(0,MAX_JUVENILES);
 young.forEach((fish,index)=>drawYoung(renderer,sprite,fish,index,time));
 if(young.length&&(active||renderer.inspect)){
  const x=young.reduce((sum,j)=>sum+j.x,0)/young.length;
  const y=Math.min(...young.map(j=>j.y))-28*(renderer.uiUnit||1);
  renderer.tag(renderer.ctx,x,y,'Young cardinalfish',1,65);
 }
}
