import {rigFor} from './animal-rigs.js';
import {coreFreedom} from './resident-motion.js';
import {rotateFin} from './fin-motion.js';
const clamp=n=>Math.max(0,Math.min(1,n));
const smooth=(a,b,n)=>{const t=clamp((n-a)/(b-a));return t*t*(3-2*t);};
const fin=(root,tip,radius,angle,phase=0)=>({root,tip,radius,angle,phase});
// Authored against the existing paintings. Median fins pivot outside a stable
// body; the overlaid pectoral fin has its own small, rooted field.
export const RIGID_RIGS={
 s22:{core:[[.20,.44],[.40,.22],[.68,.09],[.85,.20],[.92,.38],[.94,.68],[.82,.85],[.62,.96],[.40,.86],[.20,.65]],tail:fin([.20,.55],[.025,.53],.38,.065),fins:[fin([.40,.25],[.31,.045],.12,.07),fin([.35,.75],[.28,.97],.10,.085,1.2)],pectoral:fin([.70,.54],[.60,.52],.18,.16,.6)},
 s23:{core:[[.18,.48],[.47,.35],[.70,.21],[.79,.08],[.985,.005],[.85,.27],[.92,.58],[.92,.70],[.75,.80],[.46,.81],[.23,.99],[.39,.71],[.18,.62]],tail:fin([.195,.55],[.025,.59],.35,.045),fins:[fin([.46,.35],[.35,.10],.12,.10)],pectoral:fin([.735,.62],[.655,.865],.055,.11,1.1)},
 s24:{core:[[.22,.46],[.36,.31],[.65,.24],[.80,.34],[.95,.52],[.95,.62],[.78,.79],[.57,.85],[.38,.73],[.22,.60]],tail:fin([.235,.54],[.045,.55],.33,.065),fins:[fin([.48,.26],[.38,.035],.14,.10),fin([.405,.72],[.35,.93],.13,.10,1.4),fin([.66,.82],[.60,.95],.07,.06,.5)],pectoral:fin([.72,.61],[.59,.58],.115,.14,.8)},
 s48:{core:[[.17,.50],[.33,.36],[.57,.29],[.60,.01],[.72,.30],[.84,.39],[.97,.58],[.97,.67],[.75,.85],[.57,.98],[.59,.82],[.38,.74],[.18,.65]],tail:fin([.185,.58],[.025,.58],.28,.055),fins:[fin([.48,.32],[.38,.19],.135,.11),fin([.41,.75],[.30,.93],.13,.11,1.2)],pectoral:fin([.70,.65],[.61,.63],.09,.16,.7)}
};

// Shared with generic custom templates. Inflation affects tissue, while the
// puffer's painted fins ride their own body attachments without expanding.
export function inflationOffset(id,u,v,puff){
 const inflate=(u,v)=>{const body=smooth(.18,.38,u)*(1-smooth(.72,.92,u));return {x:(u-.55)*body*puff*.12,y:(v-.52)*body*puff*.65};};
 let offset=inflate(u,v);
 if(id==='s22')for(const [cx,cy,rx,ry,root] of [[.61,.54,.10,.17,[.70,.54]],[.34,.15,.09,.20,[.40,.25]],[.35,.80,.08,.18,[.35,.75]]]){
  const d=Math.hypot((u-cx)/rx,(v-cy)/ry),weight=clamp((1.2-d)/.35),pin=inflate(...root);
  offset={x:offset.x+(pin.x-offset.x)*weight,y:offset.y+(pin.y-offset.y)*weight};
 }
 return offset;
}

export function rigidPoint(p,u,v,time,effort,state={}){
 const f=RIGID_RIGS[p.id],rig=rigFor(p),a=clamp(effort),feed=clamp(state.feed||0),turn=Math.max(-1,Math.min(1,state.turn||0)),phase=time*p.frequency*Math.PI*2;
 const tail=rotateFin(u,v,f.tail,(Math.sin(phase)*(.12+.88*a)*(1-feed*.6)+turn*.5)*f.tail.angle);
 let dx=tail.x,dy=tail.y;
 for(const part of f.fins){const offset=rotateFin(u,v,part,(Math.sin(phase+part.phase)*(.7+a*.3)*(1-feed*.2)+turn*.15)*part.angle);dx+=offset.x;dy+=offset.y;}
 const freedom=coreFreedom(u,v,f.core);dx*=freedom;dy*=freedom;
 const pc=rotateFin(u,v,f.pectoral,Math.sin(phase+f.pectoral.phase)*f.pectoral.angle*(1-a*.2));dx+=pc.x;dy+=pc.y;
 // Small jaw action preserves the long cowfish horns and the trigger/file spines.
 const mouth=Math.exp(-2*((u-rig.mouth[0])/.045)**2-2*((v-rig.mouth[1]-.025)/.065)**2);
 dx+=mouth*feed*.009;dy+=mouth*(.0015*(1+Math.sin(phase))+.012*feed);
 let keep=1;for(const root of [f.tail.root,...f.fins.map(f=>f.root),f.pectoral.root])keep=Math.min(keep,smooth(.012,.055,Math.hypot(u-root[0],v-root[1])));
 dx*=keep;dy*=keep;
 if(state.puff){const d=inflationOffset(p.id,u,v,clamp(state.puff));dx+=d.x;dy+=d.y;}
 if(rig.eye){const eye=smooth(.65,1.3,Math.hypot((u-rig.eye[0])/.075,(v-rig.eye[1])/.10));dx*=eye;dy*=eye;}
 return {x:u+dx,y:v+dy};
}
