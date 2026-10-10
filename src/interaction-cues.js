import {cleaningPresentation} from './cleaner-motion.js';

const clamp=n=>Math.max(0,Math.min(1,n));
const lifetimes={eat:1.1,clean:1.4,reunion:1.8,homecoming:1.8,notice:1.2,release:1.2,discovery:1.6};

// Presentation only. Callers create these marks after the simulation has
// committed the outcome; neither drawing nor replaying one changes the world.
export function interactionCue(type,elapsed,reducedMotion=false){
 const lifetime=lifetimes[type];
 if(!lifetime||!Number.isFinite(elapsed)||elapsed<0||elapsed>=lifetime)return null;
 const phase=elapsed/lifetime;
 return {type,lifetime,alpha:Math.min(1,(1-phase)*2),spread:reducedMotion?0:1-(1-phase)**3};
}

// A queued visit is not treatment. Only an existing, live client/cleaner pair
// whose inspection point has been reached receives picking feedback.
export function treatmentCues(sim,presentations=null){
 if(!sim?.player||!sim.section)return [];
 const cues=[];
 for(const animal of [sim.player,...sim.section.entities]){
  const state=presentations?presentations.get(animal):cleaningPresentation(sim,animal);
  if(state?.role==='cleaner'&&state.mode==='inspect')cues.push({cleaner:state.cleaner,client:state.client,x:state.contact.x,y:state.contact.y,phase:state.phase,picking:state.picking});
 }
 return cues;
}

export function drawInteractionCue(ctx,cue,x,y,unit=1){
 if(!cue)return;
 const {type,alpha,spread}=cue;
 ctx.save();ctx.globalAlpha=alpha;ctx.lineCap='round';ctx.lineWidth=1.8*unit;
 ctx.strokeStyle=type==='notice'?'#ecc78b':type==='release'?'#d2e9e4':'#f3ecd0';
 if(type==='discovery'){
  const r=(5+spread*3)*unit;
  for(let i=0;i<4;i++){const angle=Math.PI*.25+i*Math.PI*.5;ctx.beginPath();ctx.moveTo(x+Math.cos(angle)*2*unit,y-12*unit+Math.sin(angle)*2*unit);ctx.lineTo(x+Math.cos(angle)*r,y-12*unit+Math.sin(angle)*r);ctx.stroke();}
 }else if(type==='reunion'||type==='homecoming'){
  const r=(8+spread*5)*unit;
  for(const side of [-1,1]){ctx.beginPath();ctx.arc(x+side*5*unit,y-9*unit,r,side<0?Math.PI*.68:Math.PI*1.18,side<0?Math.PI*1.32:Math.PI*1.82);ctx.stroke();}
 }else if(type==='notice'||type==='release'){
  for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(x+side*(8+spread*4)*unit,y-10*unit);ctx.lineTo(x+side*(12+spread*4)*unit,y-(type==='notice'?16:10)*unit);ctx.stroke();}
 }else{
  ctx.fillStyle=type==='clean'?'#d7edcc':'#f3ecd0';
  for(let i=0;i<3;i++){
   const dx=(i-1)*(5+spread*6)*unit,dy=(-5-spread*(type==='clean'?12:6)+Math.abs(i-1)*3)*unit;
   ctx.beginPath();ctx.ellipse(x+dx,y+dy,1.5*unit,2.4*unit,(i-1)*.55,0,Math.PI*2);ctx.fill();
  }
 }
 ctx.restore();
}

export function drawTreatmentCue(ctx,cue,unit=1,reducedMotion=false){
 const stroke=reducedMotion?.5:(Math.sin(cue.phase*Math.PI*18)+1)/2;
 ctx.save();ctx.globalAlpha=.6*clamp(cue.picking);ctx.strokeStyle='#f3ecd0';ctx.lineWidth=1.1*unit;ctx.lineCap='round';
 for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(cue.x+side*(2+stroke)*unit,cue.y-2*unit);ctx.lineTo(cue.x+side*(4+stroke*2)*unit,cue.y-4*unit);ctx.stroke();}
 ctx.restore();
}
