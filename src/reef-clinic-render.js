import {creaturePickFrame} from './geometry.js';

const clamp=n=>Math.max(0,Math.min(1,n));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const live=e=>!!e&&e.alive!==false&&e.health>0&&!e.hidden&&!(e.stun>0)&&!e.feeding&&e.activity!=='avoiding';

function clinicScene(sim){
 const clinic=sim?.reefStories?.clinic;
 if(!clinic||!['clinic','reef-clinic'].includes(sim.reefStories.active)||sim.current!==clinic.reef||sim.player?.species.id!==clinic.species||!live(sim.player))return null;
 return clinic;
}
function visitor(sim,clinic){
 const a=clinic.appointment;
 return a&&sim.section?.entities.find(e=>e.id===a.id&&e.species.id===a.species&&(e.incarnation||0)===a.incarnation&&live(e));
}

// Inputs for the incumbent painted jaw and fin rigs, not a second fish draw.
// The reaction depends on the actual visitor, invitation and player distance.
// During care the existing contact pose owns every landmark and appendage.
export function clinicPose(sim,animal,time=0,reducedMotion=false){
 const clinic=clinicScene(sim),a=clinic?.appointment;
 if(!clinic?.open||!a||a.phase==='care'||animal!==visitor(sim,clinic))return null;
 const facing=animal.facing||1,near=clamp(1-(distance(animal,sim.player)-60)/180);
 const settled=clamp(1-distance(animal,{x:clinic.station.x+(a.temperament==='nervous'&&!a.gentle?150:65),y:clinic.station.y})/80);
 const breath=reducedMotion?0:Math.sin(time*1.4)*.006;
 if(a.temperament==='nervous'&&!a.gentle){
  // A raised head and splayed stabilizing fins hold the hesitant visitor back.
  return {pitch:(-.055-.075*near+breath)*facing,brake:.35+.55*settled,effort:.16+.12*(1-settled),feed:0};
 }
 if(a.temperament==='nervous'){
  // Reassurance lowers the head and lets the fins settle as the real fish advances.
  return {pitch:(-.012+breath)*facing,brake:.20+.32*settled,effort:.12+.15*(1-settled),feed:0};
 }
 // A confident invitation uses the painted jaw; familiar clients relax further.
 return {pitch:(a.returning?-.025:.035)*settled*facing,brake:(a.returning?.38:.52)*settled,
  effort:.11+.25*(1-settled),feed:near*settled*(a.returning?.16:.36)};
}

function stroke(ctx,color,width,alpha,draw){
 ctx.strokeStyle=color;ctx.lineWidth=width;ctx.globalAlpha=alpha;ctx.beginPath();draw();ctx.stroke();
}

// Draw in the renderer's translated 1600 x 740 world. All marks are live line
// geometry or suspended particles; reef and animal paintings remain incumbent.
export function drawStory(renderer,sim,time=0){
 const clinic=clinicScene(sim),ctx=renderer.ctx;
 if(!clinic||!ctx)return;
 const {x,y}=clinic.station,unit=Math.min(1.55,renderer.uiUnit||1),open=clinic.open;
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 // A shallow, open footprint leaves the fish and their contact points clear.
 const floor=y+24;
 for(const side of [-1,1]){
  const path=()=>{ctx.moveTo(x+side*38,floor-3);ctx.quadraticCurveTo(x+side*34,floor+3,x+side*23,floor+3);ctx.lineTo(x+side*11,floor+3);};
  stroke(ctx,'#163c43',3.6*unit,open?.42:.22,path);
  stroke(ctx,open?'#efe4b5':'#bfd2c5',1.35*unit,open?.78:.32,path);
 }
 if(open){
  const age=renderer.reducedMotion?0:time;
  ctx.fillStyle='#efe4b5';
  for(let i=0;i<3;i++){
   const cycle=(age*.11+i/3)%1;
   ctx.globalAlpha=.30*Math.sin(Math.PI*(.15+cycle*.7));
   ctx.beginPath();ctx.arc(x+(i-1)*11+Math.sin(age*.4+i)*2,floor-4-cycle*23,1.05*unit,0,Math.PI*2);ctx.fill();
  }
 }
 const a=clinic.appointment,client=visitor(sim,clinic);
 if(open&&a?.returning&&a.phase!=='care'&&client){
  // A real returning individual gets a quiet paired greeting while nearby.
  // It vanishes when the welcome commits, the appointment ends, or identity changes.
  const near=clamp(1-(distance(client,sim.player)-45)/100);
  if(near>0){
   for(const actor of [client,sim.player]){
    const f=creaturePickFrame(actor),headX=f.x+(actor.facing||1)*f.width*.28,headY=f.y-f.height*.38-5;
    const path=()=>{ctx.moveTo(headX-5*unit,headY-3*unit);ctx.quadraticCurveTo(headX,headY-8*unit,headX+5*unit,headY-3*unit);};
    stroke(ctx,'#163c43',3.3*unit,.4*near,path);stroke(ctx,'#e6edc9',1.35*unit,.76*near,path);
   }
  }
 }
 ctx.restore();
}
