import {pathWeight} from './animal-rigs.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
const bell=(x,c,r)=>Math.exp(-2*((x-c)/r)**2);
const limb=(points,radius,phase=0)=>({points,radius,phase});

// Geometry is authored against the current cropped paintings. These are small
// joined-surface articulations, not measured gait or rigid skeletal simulation.
export const RESIDENT_RIGS={
 s45:{core:[[.40,.55],[.51,.43],[.59,.41],[.62,.49],[.56,.59],[.46,.66]],eyes:[[.63,.43]],
  legs:[limb([[.40,.67],[.31,.80],[.26,.96]],.028),limb([[.44,.68],[.46,.86],[.49,.98]],.024,Math.PI),limb([[.47,.68],[.51,.83],[.53,.99]],.022,.7),limb([[.50,.67],[.56,.78],[.60,.97]],.025,Math.PI+.7),limb([[.54,.65],[.61,.74],[.65,.89]],.027,1.4)],
  claws:[limb([[.49,.64],[.73,.72],[.94,.97]],.09),limb([[.52,.60],[.77,.54],[.97,.73]],.075,1.4)],
  feelers:[limb([[.65,.40],[.68,.27],[.40,.05],[.08,.14]],.024),limb([[.62,.43],[.42,.17],[.22,.20],[.01,.46]],.023,1.3),limb([[.65,.44],[.82,.37],[.99,.51]],.022,2.1)]},
 s46:{core:[[.18,.18],[.31,.04],[.65,.035],[.78,.16],[.73,.33],[.57,.43],[.37,.40],[.22,.31]],eyes:[[.52,.26],[.65,.24]],
  legs:[limb([[.22,.28],[.08,.45],[.015,.60]],.055),limb([[.20,.35],[.105,.60],[.18,.86]],.052,Math.PI),limb([[.27,.45],[.26,.76],[.36,.97]],.052,.8),limb([[.75,.25],[.91,.45],[.98,.65]],.054,Math.PI),limb([[.79,.39],[.93,.67],[.92,.86]],.05,0)],
  claws:[limb([[.30,.44],[.37,.59],[.59,.66]],.105),limb([[.80,.32],[.80,.56],[.69,.83]],.10,1.2)],feelers:[]},
 s60:{core:[[.29,.54],[.52,.43],[.70,.46],[.76,.59],[.67,.67],[.45,.66]],eyes:[],legs:[],claws:[],
  feelers:[limb([[.31,.49],[.21,.32],[.15,.15]],.065),limb([[.31,.49],[.28,.23],[.28,.02]],.068,1.2),limb([[.31,.49],[.36,.24],[.37,.07]],.058,2.2),limb([[.79,.48],[.82,.19],[.86,.12]],.055,.6),limb([[.81,.53],[.89,.29],[.94,.19]],.045,2)]},
 s61:{core:[[.02,.47],[.09,.20],[.28,.025],[.42,.005],[.55,.10],[.64,.31],[.715,.62],[.55,.81],[.33,.89],[.13,.81],[.035,.63]],eyes:[],legs:[],claws:[],
  feelers:[limb([[.74,.68],[.85,.46],[.93,.32]],.028),limb([[.75,.72],[.88,.51],[.995,.39]],.026,1.5)]}
};

// Distance feather outside the protected polygon keeps adjacent painted tissue
// connected while every vertex inside the carapace/shell remains unchanged.
export function coreFreedom(u,v,polygon){
 let inside=false,distance=Infinity;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const a=polygon[j],b=polygon[i],dx=b[0]-a[0],dy=b[1]-a[1];
  if((a[1]>v)!==(b[1]>v)&&u<(b[0]-a[0])*(v-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  const t=clamp(((u-a[0])*dx+(v-a[1])*dy)/(dx*dx+dy*dy));distance=Math.min(distance,Math.hypot(u-a[0]-t*dx,v-a[1]-t*dy));
 }
 return inside?0:smooth(0,.035,distance);
}
function rotate(x,y,root,a){const dx=x-root[0],dy=y-root[1];return {x:root[0]+dx*Math.cos(a)-dy*Math.sin(a),y:root[1]+dx*Math.sin(a)+dy*Math.cos(a)};}
function jointOffset(u,v,path,shoulder,knee){
 const {weight}=pathWeight(u,v,path.points,path.radius),root=path.points[0],hinge=path.points[1];
 const distal=pathWeight(u,v,path.points.slice(1),path.radius).weight;
 // Distal bend is applied around the elbow before the whole limb rotates around
 // its shoulder. Soft influences preserve the uncut painted joint connection.
 const bent=rotate(u,v,hinge,knee*distal),posed=rotate(bent.x,bent.y,root,shoulder*weight);
 return {x:posed.x-u,y:posed.y-v};
}
export function residentPoint(p,u,v,time,effort,state={}){
 const r=RESIDENT_RIGS[p.id],a=clamp(effort),feed=clamp(state.feed||0),retract=clamp(state.retract||0),phase=time*p.frequency*TAU;let dx=0,dy=0;
 for(const leg of r.legs){
  const beat=Math.sin(phase+leg.phase),drive=a*(1-feed*.85)*(1-retract);
  const d=jointOffset(u,v,leg,beat*.055*drive,Math.sin(phase+leg.phase+.8)*.075*drive);dx+=d.x;dy+=d.y;
 }
 for(const claw of r.claws){
  const d=jointOffset(u,v,claw,Math.sin(phase+claw.phase)*.008-feed*.025+retract*.025,Math.sin(phase+claw.phase+.8)*.012-feed*.08-retract*.05);
  dx+=d.x;dy+=d.y;
 }
 for(const [i,path] of r.feelers.entries()){
  const {weight,progress}=pathWeight(u,v,path.points,path.radius),angle=phase+path.phase-progress*2.2;
  const amplitude=p.id==='s45'?.017:p.id==='s60'&&i<3?.018:.012;
  dx+=(Math.sin(angle)*amplitude*(1-retract*.8)-retract*.017)*weight;
  dy+=(Math.cos(angle)*amplitude*.45+retract*.015)*weight;
 }
 if(p.id==='s45'){
  const tail=pathWeight(u,v,[[.40,.61],[.25,.51],[.10,.67]],.10).weight;
  dy+=Math.sin(phase-1)*tail*.009*(.1+a*.9);dx+=tail*Math.cos(phase)*.003*a;
 }else if(p.id==='s60'||p.id==='s61'){
  const foot=smooth(.71,.90,v)*(1-smooth(.94,1,v));
  dx+=Math.sin(phase-u*9)*foot*.007*a*(1-feed);dy+=Math.cos(phase-u*9)*foot*.003*a*(1-feed);
  const head=bell(u,.82,.15)*bell(v,.73,.17);
  dx+=head*(feed*.015-retract*.012);dy+=head*feed*.010;
  // Keep the substrate support strip still, even as the foot advances above it.
  const support=1-smooth(.95,.99,v);dx*=support;dy*=support;
 }
 let keep=coreFreedom(u,v,r.core);
 for(const [x,y] of r.eyes)keep=Math.min(keep,smooth(.5,1.2,Math.hypot((u-x)/.05,(v-y)/.07)));
 for(const path of [...r.legs,...r.claws,...r.feelers])keep=Math.min(keep,smooth(.015,.06,Math.hypot(u-path.points[0][0],v-path.points[0][1])));
 return {x:u+dx*keep,y:v+dy*keep};
}
