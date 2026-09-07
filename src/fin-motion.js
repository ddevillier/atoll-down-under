import {rigFor,pathWeight} from './animal-rigs.js';
const clamp=n=>Math.max(0,Math.min(1,n));
const smooth=(a,b,n)=>{const t=clamp((n-a)/(b-a));return t*t*(3-2*t);};
const fin=(root,tip,radius,angle,phase=0)=>({root,tip,radius,angle,phase});
const streamer=(points,radius,amplitude,phase=0)=>({points,radius,amplitude,phase});
// Attachment geometry follows the current cropped paintings. Fin angles and
// trailing delays are authored presentation, not measured animal kinematics.
export const FIN_RIGS={
 s4:{tail:fin([.43,.59],[.23,.53],.22,.045),fins:[fin([.57,.72],[.36,.97],.16,.045),fin([.72,.69],[.63,.97],.09,.04)],streamers:[streamer([[.65,.35],[.58,.08],[.35,.025],[.02,.055]],.065,.035)]},
 s11:{tail:fin([.29,.56],[.025,.53],.37,.06),fins:[fin([.59,.36],[.39,.05],.13,.025),fin([.66,.7],[.54,.93],.08,.045)],streamers:[streamer([[.57,.23],[.47,.09],[.35,.015]],.065,.025),streamer([[.49,.72],[.37,.85],[.13,.98]],.08,.026,1)]},
 s13:{tail:fin([.47,.52],[.03,.51],.20,.028),fins:[fin([.62,.64],[.48,.98],.095,.025),fin([.76,.65],[.69,.98],.08,.024)],streamers:[streamer([[.71,.37],[.58,.09],[.31,.015],[.03,.055]],.065,.035)]},
 s20:{tail:fin([.35,.58],[.04,.54],.24,.028),fins:[fin([.72,.58],[.26,.42],.21,.070),fin([.72,.58],[.39,.93],.21,.065,.35),fin([.62,.42],[.18,.04],.065,.015,.5),fin([.69,.43],[.49,.015],.07,.018,.8),fin([.74,.42],[.78,.11],.045,.015,1)],streamers:[]},
 s40:{tail:fin([.30,.57],[.04,.53],.19,.025),fins:[fin([.59,.35],[.26,.035],.27,.055),fin([.65,.71],[.64,.98],.19,.050,.8)],streamers:[]},
 s55:{tail:fin([.21,.52],[.035,.48],.35,.065),fins:[fin([.72,.7],[.64,.97],.07,.035)],streamers:[streamer([[.57,.25],[.52,.10],[.23,.01]],.07,.027),streamer([[.64,.72],[.43,.92],[.32,.99]],.075,.025,.7)]},
 s56:{tail:fin([.42,.58],[.22,.51],.22,.04),fins:[fin([.56,.72],[.35,.97],.16,.04),fin([.72,.69],[.62,.97],.09,.035)],streamers:[streamer([[.64,.35],[.59,.08],[.34,.025],[.02,.055]],.065,.030,.45)]},
 s58:{tail:fin([.29,.56],[.025,.55],.34,.055),fins:[fin([.65,.71],[.55,.95],.075,.04)],streamers:[streamer([[.57,.28],[.42,.10],[.18,.055]],.065,.025,.4),streamer([[.47,.74],[.35,.90],[.27,.94]],.075,.022,1)]}
};

export function finWeight(u,v,f){
 const dx=f.tip[0]-f.root[0],dy=f.tip[1]-f.root[1],length=Math.hypot(dx,dy),x=u-f.root[0],y=v-f.root[1];
 const t=(x*dx+y*dy)/(length*length),cross=Math.abs(x*dy-y*dx)/length;
 const span=f.radius*(.12+.88*clamp(t));
 return smooth(0,.3,t)*(1-smooth(1,1.35,t))*(1-smooth(span*.45,span,cross));
}
export function rotateFin(u,v,f,angle){
 const weight=finWeight(u,v,f),x=u-f.root[0],y=v-f.root[1];
 const a=angle*weight,cos=Math.cos(a),sin=Math.sin(a);
 return {x:x*cos-y*sin-x,y:x*sin+y*cos-y};
}

export function finPoint(p,u,v,time,effort,state={}){
 const f=FIN_RIGS[p.id],rig=rigFor(p),a=clamp(effort),feed=clamp(state.feed||0),turn=Math.max(-1,Math.min(1,state.turn||0));
 const phase=time*p.frequency*Math.PI*2;let x=u,y=v;
 const tail=rotateFin(u,v,f.tail,Math.sin(phase)*f.tail.angle*(.07+a*.93)*(1-feed*.7)+turn*.07);
 x+=tail.x;y+=tail.y;
 // Broad fin sectors pivot around their shoulders. Stationary fish keep
 // stabilizing strokes; this does not make the rigid torso breathe or sway.
 for(const sector of f.fins){const d=rotateFin(u,v,sector,(Math.sin(phase+sector.phase)*(.95-a*.28)*(1-feed*.25)+turn*.35)*sector.angle);x+=d.x;y+=d.y;}
 for(const path of f.streamers){
  const {weight,progress}=pathWeight(u,v,path.points,path.radius);
  const lag=phase+path.phase-progress*3.5,drive=.5+a*.5;
  x+=Math.sin(lag)*weight*path.amplitude*.3*drive;
  y+=(Math.cos(lag)*drive+turn*.6)*weight*path.amplitude;
 }
 if(p.id!=='s20'){
  const pc=pathWeight(u,v,[rig.pectoral.root,rig.pectoral.tip],.075).weight;
  x+=Math.sin(phase)*pc*p.fin*(1-a*.3);y+=Math.cos(phase)*pc*p.fin*.45;
 }
 const mouth=Math.exp(-2*((u-rig.mouth[0])/.07)**2-2*((v-rig.mouth[1]-.035)/.1)**2);
 x+=mouth*feed*.012;y+=mouth*(.003*(1+Math.sin(phase))+.018*feed);
 // Roots must stay with the body even where an adjacent sector overlaps.
 let keep=1;for(const root of [f.tail.root,...f.fins.map(f=>f.root),...f.streamers.map(f=>f.points[0])])keep=Math.min(keep,smooth(.025,.085,Math.hypot(u-root[0],v-root[1])));
 if(rig.eye)keep=Math.min(keep,smooth(.7,1.3,Math.hypot((u-rig.eye[0])/.08,(v-rig.eye[1])/.11)));
 return {x:u+(x-u)*keep,y:v+(y-v)*keep};
}
