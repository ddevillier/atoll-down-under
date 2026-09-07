import {rigFor} from './animal-rigs.js';
import {finWeight,rotateFin} from './fin-motion.js';
import {inflationOffset} from './rigid-motion.js';
import {individualSeed} from './individual-motion.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
const fin=(root,tip,radius,angle=0)=>({root,tip,radius,angle});
// Coordinates follow the actual cropped paintings; drive, lag and bout lengths
// are authored game motion. Fins travel with their roots, not with a sheet wave.
export const SWIM_RIGS={
 s0:{front:.78,tail:fin([.19,.51],[.015,.53],.40,.13),bend:.015,lag:2.5,idle:.035,bout:3.4,glide:.22,fins:[fin([.58,.33],[.50,.05],.16),fin([.42,.67],[.36,.81],.11),fin([.62,.78],[.55,.94],.09,.07)],pc:fin([.77,.64],[.67,.68],.06,.07)},
 s17:{front:.79,tail:fin([.20,.54],[.025,.52],.40,.12),bend:.010,lag:1.8,idle:.025,bout:5.2,glide:.32,fins:[fin([.49,.35],[.41,.07],.14),fin([.72,.35],[.68,.22],.07),fin([.45,.70],[.36,.93],.14),fin([.72,.73],[.68,.88],.065,.035)],pc:fin([.775,.59],[.73,.64],.035,.025)},
 s18:{front:.59,tail:fin([.105,.58],[.02,.57],.32,.09),bend:.0045,lag:1.4,idle:.02,bout:4.6,glide:.30,fins:[fin([.28,.34],[.215,.075],.10),fin([.26,.70],[.21,.89],.08),fin([.38,.72],[.34,.88],.065,.025)],pc:fin([.59,.55],[.53,.49],.065,.035)},
 s28:{front:.78,tail:fin([.20,.53],[.025,.54],.39,.13),bend:.014,lag:1.8,idle:.025,bout:4.2,glide:.27,fins:[fin([.62,.22],[.50,.035],.16),fin([.43,.73],[.37,.88],.085),fin([.74,.75],[.67,.95],.07,.045)],pc:fin([.755,.54],[.66,.49],.07,.055)},
 s32:{front:.79,tail:fin([.205,.55],[.065,.42],.48,.095),bend:.021,lag:2.7,idle:.12,bout:5.5,glide:.22,fins:[fin([.59,.345],[.49,.045],.14),fin([.34,.46],[.29,.38],.065),fin([.43,.64],[.40,.73],.07),fin([.70,.62],[.575,.94],.095,.022)],pc:null},
 s33:{front:.78,tail:fin([.20,.55],[.075,.45],.46,.09),bend:.024,lag:3.1,idle:.02,bout:6.2,glide:.26,fins:[fin([.57,.34],[.46,.055],.14),fin([.32,.46],[.28,.40],.05),fin([.43,.66],[.40,.74],.065),fin([.69,.64],[.57,.95],.12,.022)],pc:null},
 s34:{front:.78,tail:fin([.19,.56],[.065,.44],.42,.09),bend:.012,lag:1.8,idle:.10,bout:7.1,glide:.32,fins:[fin([.585,.29],[.48,.04],.14),fin([.27,.44],[.25,.39],.04),fin([.66,.64],[.475,.965],.105,.016),fin([.71,.62],[.67,.80],.07)],pc:null},
 s35:{front:.78,tail:fin([.18,.58],[.07,.49],.41,.10),bend:.024,lag:2.5,idle:.07,bout:6.1,glide:.30,fins:[fin([.58,.31],[.45,.035],.15),fin([.27,.46],[.25,.41],.045),fin([.43,.68],[.39,.74],.065),fin([.675,.655],[.525,.94],.11,.026)],pc:null},
 s42:{front:.80,tail:fin([.205,.52],[.035,.52],.39,.135),bend:.016,lag:2.3,idle:.03,bout:3.6,glide:.20,fins:[fin([.59,.24],[.50,.075],.14),fin([.43,.72],[.37,.84],.10),fin([.74,.75],[.66,.95],.075,.065)],pc:fin([.77,.64],[.69,.64],.07,.07)},
 s49:{front:.79,tail:fin([.20,.51],[.035,.52],.40,.125),bend:.010,lag:1.7,idle:.025,bout:4.8,glide:.30,fins:[fin([.56,.25],[.465,.045],.14),fin([.40,.70],[.355,.87],.10),fin([.71,.78],[.635,.95],.08,.04)],pc:fin([.74,.54],[.65,.55],.065,.045)}
};

// Shared simulation/presentation cadence. Priority activities never inherit a
// passive glide; absent ecology state (player/custom) uses direct mouse effort.
export function swimmingDrive(e){
 const f=SWIM_RIGS[e.species.id==='custom'?'s'+e.species.index:e.species.id];
 if(!f||!e.ecology||e.target||e.entering||e.actionTime>0||!['cruising','coasting','schooling'].includes(e.activity))return 1;
 const phase=((e.ecology.clock/f.bout+individualSeed(e.id)/4294967296)%1+1)%1;
 const end=1-f.glide,fade=.075;
 return phase<end?1:1-smooth(end,end+fade,phase)*(1-smooth(1-fade,1,phase));
}

export function swimPoint(p,u,v,time,effort,state={}){
 const f=SWIM_RIGS[p.id],rig=rigFor(p),a=clamp(effort),feed=clamp(state.feed||0),turn=Math.max(-1,Math.min(1,state.turn||0)),aspect=Math.max(.15,state.aspect||.45),phase=time*p.frequency*TAU;
 const drive=(f.idle+(1-f.idle)*a)*(1-feed*.7),root=f.tail.root;
 const spine=q=>{const rear=clamp((f.front-Math.max(root[0],q))/(f.front-root[0]));return (Math.sin(phase+rear*f.lag)*f.bend*drive+turn*.022)*rear**2/aspect;};
 const rear=spine(u);let dx=0,dy=rear;
 // The caudal lobes share a peduncle and rotate together, retaining unequal
 // shark lobes. A broad tail field is restricted to the rear of the painting.
 const tailWeight=1-smooth(root[0]-.015,root[0]+.06,u),tailAngle=(Math.sin(phase+f.lag)*drive+turn*.3)*f.tail.angle*tailWeight;
 const tx=u-root[0],ty=(v-root[1])*aspect;
 dx+=tx*Math.cos(tailAngle)-ty*Math.sin(tailAngle)-tx;dy+=(tx*Math.sin(tailAngle)+ty*Math.cos(tailAngle)-ty)/aspect;
 for(const part of f.fins){
  const weight=finWeight(u,v,part),carried=spine(part.root[0]);dy+=(carried-rear)*weight;
  const d=rotateFin(u,v,part,(Math.sin(phase+.7)*(.2+a*.3)+turn*.8)*part.angle);dx+=d.x;dy+=d.y;
 }
 if(f.pc){const d=rotateFin(u,v,f.pc,Math.sin(phase+.9)*f.pc.angle*(1-a*.65)+turn*.015);dx+=d.x;dy+=d.y;}
 const mouth=Math.exp(-2*((u-rig.mouth[0])/.045)**2-2*((v-rig.mouth[1]+.025)/.065)**2);
 dx+=mouth*feed*.007;dy+=mouth*(.001*(1+Math.sin(phase))+.012*feed);
 if(state.puff){const d=inflationOffset(p.id,u,v,clamp(state.puff));dx+=d.x;dy+=d.y;}
 if(rig.eye){const keep=smooth(.65,1.3,Math.hypot((u-rig.eye[0])/.075,(v-rig.eye[1])/.10));dx*=keep;dy*=keep;}
 return {x:u+dx,y:v+dy};
}
