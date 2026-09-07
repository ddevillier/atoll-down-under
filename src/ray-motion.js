// Landmarks on the cropped, dorsal-view paintings. These are authored animation
// controls, not measured biological kinematics or species identification.
const clamp=n=>Math.max(0,Math.min(1,n));
const smooth=(a,b,n)=>{const t=clamp((n-a)/(b-a));return t*t*(3-2*t);};
export const RAY_RIGS={
 s27:{axis:.52,rear:.46,center:.73,head:[.875,.54,.15,.20],
  tail:[[.53,.44],[.28,.41],[.06,.51],[.03,.68],[.28,.80]],tailRadius:.105,tailAmplitude:.031,rimAmplitude:.070},
 s37:{axis:.49,rear:.29,center:.63,head:[.865,.445,.17,.23],
  tail:[[.34,.46],[.20,.43],[.08,.39],[.015,.38]],tailRadius:.14,tailAmplitude:.012,rimAmplitude:.023}
};

function tailField(u,v,rig){
 const points=rig.tail,lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
 const total=lengths.reduce((a,b)=>a+b,0);let along=0,best={distance:Infinity,progress:0};
 for(let i=1;i<points.length;i++){
  const [ax,ay]=points[i-1],[bx,by]=points[i],dx=bx-ax,dy=by-ay,length=lengths[i-1];
  const t=clamp(((u-ax)*dx+(v-ay)*dy)/(length*length)),distance=Math.hypot(u-ax-dx*t,v-ay-dy*t);
  if(distance<best.distance)best={distance,progress:(along+length*t)/total};along+=length;
 }
 return {...best,weight:1-smooth(rig.tailRadius*.3,rig.tailRadius,best.distance)};
}

export function rayPoint(p,u,v,time,effort,state={}){
 const rig=RAY_RIGS[p.id]||RAY_RIGS.s27,a=clamp(effort),feed=clamp(state.feed||0),turn=Math.max(-1,Math.min(1,state.turn||0));
 const phase=time*p.frequency*Math.PI*2,side=v<rig.axis?-1:1;
 // Keep the ridge still. Movement grows smoothly toward each painted margin,
 // with a front-to-rear delay; the two sides have a slight phase difference.
 const rim=smooth(.13,.48,Math.abs(v-rig.axis));
 const chord=smooth(rig.rear,rig.rear+.13,u)*(1-smooth(.85,1,u));
 const drive=(.025+a*.975)*(1-feed*.85),wave=Math.sin(phase+(1-u)*5+side*.24);
 let x=u+Math.cos(phase+(1-u)*5)*rim*chord*rig.rimAmplitude*.14*drive;
 let y=v+side*wave*rim*chord*rig.rimAmplitude*drive;
 // Bank through unequal margin flex, without bending the central disc as a
 // fish trunk or converting the short electric-ray tail into a whip.
 y+=turn*rim*chord*rig.rimAmplitude*.42;
 const tail=tailField(u,v,rig),trail=tail.weight*tail.progress**1.55;
 const passive=(.10+a*.50)*(1-feed*.65),aspect=Math.max(.25,state.aspect||.6);
 y+=trail*rig.tailAmplitude*(Math.sin(phase-tail.progress*4)*passive+turn*.6)/aspect;
 x+=trail*rig.tailAmplitude*Math.cos(phase-tail.progress*4)*passive*.16;
 if(p.id==='s37'){
  // Paired pelvic lobes behind the round disc flex close to their roots.
  const rearLobe=smooth(.08,.18,u)*(1-smooth(.27,.36,u))*smooth(.09,.25,Math.abs(v-.45));
  y+=side*Math.sin(phase+side*.4)*rearLobe*.009*drive;
 }
 const [hx,hy,rx,ry]=rig.head,headKeep=smooth(.8,1.25,Math.hypot((u-hx)/rx,(v-hy)/ry));
 return {x:u+(x-u)*headKeep,y:v+(y-v)*headKeep};
}
