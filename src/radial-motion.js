import {pathWeight} from './animal-rigs.js';
import {coreFreedom} from './resident-motion.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
export const RADIAL_IDS=new Set(['s47','s62','s63']);
export const STAR_ARMS=[
 [[.49,.43],[.47,.22],[.425,.015]],
 [[.39,.50],[.21,.40],[.015,.33]],
 [[.61,.49],[.82,.39],[.99,.285]],
 [[.57,.64],[.73,.82],[.855,.99]],
 [[.41,.64],[.27,.82],[.145,.985]]
];
export const ANEMONE_PATHS=[
 [[.48,.38],[.30,.08],[.145,.07]],[[.45,.43],[.21,.21],[.005,.28]],
 [[.46,.46],[.17,.36],[.035,.62]],[[.48,.39],[.46,.12],[.38,.015]],
 [[.55,.38],[.63,.13],[.62,.025]],[[.57,.40],[.71,.09],[.82,.065]],
 [[.59,.43],[.83,.20],[.99,.29]],[[.59,.48],[.83,.34],[.92,.64]],
 [[.48,.46],[.34,.44],[.22,.69]],[[.57,.46],[.69,.46],[.75,.72]],
 [[.52,.45],[.54,.54],[.55,.66]]
];
export const ANEMONE_BASE=[[.40,.56],[.63,.56],[.68,.73],[.81,.92],[.75,.99],[.26,.99],[.22,.92],[.35,.73]];
// Motion is authored for these paintings. In particular, a grouped spine field
// does not identify or simulate every visible spine as a separate bone.
export function radialPoint(p,u,v,time,effort,state={}){
 const phase=time*p.frequency*TAU,a=clamp(effort),feed=clamp(state.feed||0),retract=clamp(state.retract||0);let dx=0,dy=0,keep=1;
 if(p.id==='s47'){
  for(const [i,path] of STAR_ARMS.entries()){
   const tip=path[2],angle=Math.atan2(tip[1]-.53,tip[0]-.50),heading=state.heading||0;
   const lead=clamp((Math.cos(angle-heading)+1)/2)**3,meal=clamp((Math.cos(angle-(state.feedAngle??heading))+1)/2)**4;
   const {weight,progress}=pathWeight(u,v,path,.13),curl=Math.sin(phase+i*2.4-progress*1.2)*.016*(.12+a*.88)*(.25+lead*.75)*(1-feed*.7);
   dx+=(-Math.sin(angle)*curl+(.5-u)*feed*meal*.06)*weight;
   dy+=(Math.cos(angle)*curl+(.53-v)*feed*meal*.06)*weight;
  }
  keep=smooth(.14,.23,Math.hypot(u-.5,v-.53));
 }else if(p.id==='s62'){
  const x=u-.49,y=v-.53,r=Math.hypot(x,y),angle=Math.atan2(y,x);
  // Blend adjacent directional groups. Each group pivots beyond the fixed test
  // surface; opposing groups have independent timing, not a single spin.
  let total=0;
  for(let i=0;i<12;i++){
   const direction=i/12*TAU,difference=Math.atan2(Math.sin(angle-direction),Math.cos(angle-direction));
   const w=Math.max(0,1-Math.abs(difference)/(TAU/12));if(!w)continue;
   const root={x:.49+Math.cos(direction)*.18,y:.53+Math.sin(direction)*.18};
   const theta=Math.sin(phase+i*2.399)*.012*(1-retract*.6)+Math.sin(i*1.9)*retract*.016;
   const xx=u-root.x,yy=v-root.y;dx+=(xx*Math.cos(theta)-yy*Math.sin(theta)-xx)*w;dy+=(xx*Math.sin(theta)+yy*Math.cos(theta)-yy)*w;total+=w;
  }
  if(total){dx/=total;dy/=total;}
  keep=smooth(.18,.25,r)*(1-smooth(.88,.95,v));
 }else{
  let total=0;
  for(const [i,path] of ANEMONE_PATHS.entries()){
   const {weight,progress}=pathWeight(u,v,path,i===10?.045:.075),root=path[0],curl=retract*.02+(i>=8?feed*.045:feed*.01),lag=phase+i*1.7-progress*2.5;
   dx+=(Math.sin(lag)*.022*(1-retract*.8)+(root[0]-u)*curl)*weight;
   dy+=(Math.cos(lag)*.007*(1-retract*.8)+(root[1]-v)*curl)*weight;total+=weight;
  }
  dx/=Math.max(1,total);dy/=Math.max(1,total);
  // A continuous inward crown contraction carries neighboring tentacles together
  // while their local curls stay independent. Narrow, large per-path contractions
  // would fold the mesh between adjacent tentacles.
  const crown=1-smooth(.48,.72,v);dx+=(.53-u)*retract*.20*crown;dy+=(.44-v)*retract*.23*crown;
  keep=coreFreedom(u,v,ANEMONE_BASE);
  keep=Math.min(keep,smooth(.65,1.2,Math.hypot((u-.53)/.07,(v-.44)/.05)));
  for(const path of ANEMONE_PATHS)keep=Math.min(keep,smooth(.015,.05,Math.hypot(u-path[0][0],v-path[0][1])));
  if(v>=.98)keep=0;
 }
 return {x:u+dx*keep,y:v+dy*keep};
}
