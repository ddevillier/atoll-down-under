import {pathWeight} from './animal-rigs.js';
import {coreFreedom} from './resident-motion.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
const bell=(x,c,r)=>Math.exp(-2*((x-c)/r)**2);
export const SPECIALIST_IDS=new Set(['s19','s44']);
export const CUTTLE_CORE=[[.12,.46],[.20,.29],[.38,.16],[.57,.025],[.68,.01],[.71,.17],[.65,.45],[.53,.56],[.31,.65],[.15,.56]];
export const CUTTLE_SKIRT=[[.70,.56],[.62,.74],[.47,.90],[.38,.98],[.23,.68],[.11,.81],[.025,.57]];
export const CUTTLE_ARMS=[
 [[.79,.38],[.85,.53],[.82,.89],[.76,.94]],
 [[.83,.36],[.92,.64],[.90,.94],[.84,.98]],
 [[.85,.32],[.97,.60],[.96,.84],[.91,.92]],
 [[.84,.32],[.995,.55],[.98,.73]]
];
function rotate(u,v,root,angle){const x=u-root[0],y=v-root[1];return {x:root[0]+x*Math.cos(angle)-y*Math.sin(angle),y:root[1]+x*Math.sin(angle)+y*Math.cos(angle)};}
// Presentation fitted to existing paintings. Upper seahorse plates/head move as
// one unit above a soft transition to the fixed tail; no eye-pinning shear.
export function specialistPoint(p,u,v,time,effort,state={}){
 const phase=time*p.frequency*TAU,a=clamp(effort),feed=clamp(state.feed||0);let x=u,y=v;
 if(p.id==='s44'){
  const fin=(1-smooth(.22,.30,u))*smooth(.33,.41,v)*(1-smooth(.57,.65,v));
  const flutter=rotate(u,v,[.25,.50],Math.sin(phase*2)*.12*fin);x=flutter.x;y=flutter.y;
  const upper=1-smooth(.46,.78,v),angle=(Math.sin(phase)*.009+feed*.025)*upper;
  const carried=rotate(x,y,[.32,.75],angle);x=carried.x;y=carried.y;
  const mouth=bell(u,.965,.055)*bell(v,.27,.045);x+=mouth*feed*.006;
  if(v>=.78)return {x:u,y:v};
  return {x,y};
 }
 const skirt=pathWeight(u,v,CUTTLE_SKIRT,.12),wave=phase-skirt.progress*9;
 // pathWeight tapers an appendage from root to tip. A continuous fin ribbon
 // needs a full travelling wave along its length, not an almost-static front.
 const ribbon=skirt.progress>0?skirt.weight/skirt.progress**1.5*smooth(0,.12,skirt.progress):0;
 const drive=(.9+a*.1)*(1-feed*.25);
 x+=Math.cos(wave)*ribbon*.012*drive;y+=Math.sin(wave)*ribbon*.046*drive;
 let dx=0,dy=0,total=0;
 for(const [i,path] of CUTTLE_ARMS.entries()){
  const {weight,progress}=pathWeight(u,v,path,.075),lag=phase+i*1.8-progress*3;
  dx+=(Math.sin(lag)*.022*(1-a*.4)+feed*.028)*weight;
  dy+=Math.cos(lag)*.028*(1-a*.4)*weight;total+=weight;
 }
 x+=dx/Math.max(1,total);y+=dy/Math.max(1,total);
 let keep=coreFreedom(u,v,CUTTLE_CORE);
 keep=Math.min(keep,smooth(.8,1.25,Math.hypot((u-.75)/.095,(v-.21)/.16)));
 for(const root of [CUTTLE_SKIRT[0],...CUTTLE_ARMS.map(p=>p[0])])keep=Math.min(keep,smooth(.015,.06,Math.hypot(u-root[0],v-root[1])));
 return {x:u+(x-u)*keep,y:v+(y-v)*keep};
}
