import {animalProfile} from './animal-profiles.js';
import {rigFor,pathWeight} from './animal-rigs.js';
import {rayPoint} from './ray-motion.js';
import {FIN_RIGS,finPoint} from './fin-motion.js';
const TAU=Math.PI*2,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const bell=(x,c,r)=>Math.exp(-(((x-c)/r)**2)*2);

// A continuous deformation field keeps painted surfaces joined. The eyes, armored
// bodies, shells and attachment points are protected by local falloffs.
export function deformPoint(p,u,v,time,effort=.5,state={}){
 if(FIN_RIGS[p.id])return finPoint(p,u,v,time,effort,state);
 const a=clamp(effort),phase=time*p.frequency*TAU,axis=p.axis,rig=rigFor(p);
 let x=u,y=v;const family=p.family,beat=Math.sin(phase),feed=clamp(state.feed||0);
 const tail=clamp((p.tailRoot-u)/p.tailRoot),finSpan=bell(u,.52,.29);
 if(['cruiser','reef','hover','wrasse','ribbon','heavy','rigid','fan','percher','shark','carpet','needle','frogfish'].includes(family)){
  const drive=(['rigid','hover','fan','frogfish'].includes(family)?.08:.18)+a*.82;
  y+=Math.sin(phase-u*4.5)*tail**1.5*p.tail*drive/Math.max(.25,state.aspect||.5);
  x+=Math.cos(phase)*tail**2*p.tail*.24*drive;
  const edge=clamp((Math.abs(v-axis)-.19)/.33),upper=v<axis?-1:1;
  const finDrive=['rigid','hover','wrasse','ribbon','fan'].includes(family)?.65+a*.35:.3+a*.45;
  if(!['rigid','frogfish'].includes(family)){
   y+=upper*Math.sin(phase+u*6+upper*.9)*edge**1.4*finSpan*p.fin*finDrive*.45;
   x+=Math.cos(phase+u*5)*edge**1.7*finSpan*p.fin*.25*finDrive;
  }
  const pc=pathWeight(u,v,[rig.pectoral.root,rig.pectoral.tip],.075).weight;
  x+=beat*pc*p.fin*(.6+(1-a)*.5);y+=Math.cos(phase)*pc*p.fin*.6;
  // Ventral mouth/gill motion stays below the eye, with no whole-head squash.
  const mouth=bell(u,rig.mouth[0],.07)*bell(v,rig.mouth[1]+.035,.10);
  y+=mouth*(.003*(1+Math.sin(phase))+.018*feed);
  x+=mouth*feed*.012;
 }else if(family==='eel'){
  // The extended painting has a continuous body. A front-to-rear wave moves
  // each cross-section together; the skull does not shear with its markings.
  const rear=clamp((.84-u)/.84)**1.3,drive=.12+a*.88;
  y+=Math.sin(phase+u*7)*rear*p.tail*drive/Math.max(.15,state.aspect||.2);
  x+=Math.cos(phase+u*7)*rear*p.tail*.13*drive;
  const jaw=bell(u,.95,.07)*bell(v,.45,.13);
  y+=jaw*(.009*(1+Math.sin(phase))+.04*feed);
 }else if(family==='ray'||family==='electric-ray'){
  ({x,y}=rayPoint(p,u,v,time,a,state));
 }else if(family==='cuttlefish'){
  const skirt=pathWeight(u,v,[[.68,.44],[.53,.69],[.40,.89],[.23,.62],[.02,.55]],.075).weight;
  y+=Math.sin(phase-u*10)*skirt*p.fin;
  const arm=clamp((u-.75)/.25)*clamp((v-.40)/.55);
  x+=arm*(Math.sin(phase+v*7)*.022+feed*.06);
  y+=Math.cos(phase+v*8)*arm*.028;
 }else if(family==='seahorse'){
  const upper=clamp((.82-v)/.65),angle=Math.sin(phase)*.024;
  x+=(v-.82)*angle*upper;y-=(u-.48)*angle*upper;
  x+=bell(u,.3,.17)*bell(v,.42,.22)*beat*p.fin;
  x+=bell(u,.77,.18)*bell(v,.23,.16)*feed*.025;
 }else if(family==='shrimp'){
  const legs=clamp((v-.69)/.28)*bell(u,.48,.25);x+=Math.sin(phase+u*16)*legs*p.fin*(.35+a*.65);y+=Math.cos(phase+u*16)*legs*p.fin*.4;
  const claw=pathWeight(u,v,[[.47,.62],[.66,.62],[.90,.74],[.97,.88]],.055).weight;
  x-=claw*feed*.025;y-=claw*feed*.025;
 }else if(family==='crab'){
  const legs=clamp((Math.abs(u-.5)-.2)/.3)*clamp((v-.25)/.45);
  x+=Math.sin(phase+u*15)*legs*p.fin*(.3+a*.7);y+=Math.cos(phase+u*15)*legs*p.fin*.65;
  const claws=Math.max(pathWeight(u,v,[[.29,.46],[.43,.59],[.58,.68]],.11).weight,pathWeight(u,v,[[.81,.43],[.79,.61],[.68,.86]],.10).weight);
  y-=feed*claws*.045;x+=(.5-u)*feed*claws*.08;
 }else if(family==='star'){
  const dx=u-.5,dy=v-.5,r=Math.hypot(dx,dy),tip=clamp((r-.23)/.28),wave=Math.sin(phase+Math.atan2(dy,dx)*5)*tip*p.fin;
  x+=dx*wave;y+=dy*wave;
 }else if(family==='slug'){
  const foot=clamp((v-.65)/.35);y+=Math.sin(phase-u*10)*foot*p.fin*.5;
  x+=Math.sin(phase-u*8)*bell(v,.7,.2)*.004;
 }else if(family==='snail'){
  const foot=clamp((v-.78)/.22);y+=Math.sin(phase-u*11)*foot*p.fin*.5;
 }else if(family==='urchin'){
  const dx=u-.5,dy=v-.5,tip=clamp((Math.hypot(dx,dy)-.22)/.4),angle=Math.sin(phase+Math.atan2(dy,dx)*7)*tip*p.fin;
  x-=dy*angle;y+=dx*angle;
 }else if(family==='anemone'){
  const tip=clamp((.78-v)/.7);x+=Math.sin(phase+u*5)*tip**1.5*p.fin;
  y+=Math.cos(phase+u*8)*tip*p.fin*.23+clamp(state.retract||0)*tip*.14;
  x+=(.5-u)*tip*feed*.14;y+=tip*feed*.08;
 }
 for(const [i,path] of rig.paths.entries()){
  const {weight,progress}=pathWeight(u,v,path.points,path.radius);
  const amplitude=path.amplitude*(1-clamp(state.retract||0)*.8);
  x+=Math.sin(phase+i*1.7-progress*3)*weight*amplitude*.5;
  y+=Math.cos(phase+i*1.7-progress*3)*weight*amplitude;
 }
 const puff=clamp(state.puff||0);
 if(puff){
  const smooth=(a,b,n)=>{const t=clamp((n-a)/(b-a));return t*t*(3-2*t);};
  const inflation=(u,v)=>{const body=smooth(.18,.38,u)*(1-smooth(.72,.92,u));return {x:(u-.55)*body*puff*.12,y:(v-.52)*body*puff*.65};};
  let offset=inflation(u,v);
  if(p.id==='s22'){
   // Fins are carried by their attachment; their painted rays do not inflate.
   for(const [cx,cy,rx,ry,root] of [[.61,.54,.10,.17,[.64,.58]],[.34,.15,.09,.20,[.40,.39]],[.35,.80,.08,.18,[.39,.69]]]){
    const d=Math.hypot((u-cx)/rx,(v-cy)/ry),weight=clamp((1.2-d)/.35),pin=inflation(...root);
    offset={x:offset.x+(pin.x-offset.x)*weight,y:offset.y+(pin.y-offset.y)*weight};
   }
  }
  x+=offset.x;y+=offset.y;
 }
 const turn=Math.max(-1,Math.min(1,state.turn||0));
 if(turn&&!['crab','star','slug','snail','urchin','anemone','seahorse','ray','electric-ray'].includes(family)){
  const rear=clamp((.76-u)/.76),rigid=['rigid','fan','frogfish'].includes(family),amplitude=rigid?.012:family==='eel'?.075:.036;
  y+=turn*rear**2*amplitude/Math.max(.2,state.aspect||.5);
 }
 if(rig.eye){const d=Math.hypot((u-rig.eye[0])/.075,(v-rig.eye[1])/.10),keep=clamp((d-.65)/.65);x=u+(x-u)*keep;y=v+(y-v)*keep;}
 if(family==='crab'){const d=Math.hypot((u-.5)/.27,(v-.24)/.18),keep=clamp((d-.82)/.35);x=u+(x-u)*keep;y=v+(y-v)*keep;}
 if(family==='seahorse'){const keep=clamp((.83-v)/.15);x=u+(x-u)*keep;y=v+(y-v)*keep;}
 return {x,y};
}

function triangle(ctx,image,s0,s1,s2,d0,d1,d2){
 const ux=s1.x-s0.x,uy=s1.y-s0.y,vx=s2.x-s0.x,vy=s2.y-s0.y,det=ux*vy-vx*uy;
 const a=((d1.x-d0.x)*vy-(d2.x-d0.x)*uy)/det,c=(ux*(d2.x-d0.x)-vx*(d1.x-d0.x))/det;
 const b=((d1.y-d0.y)*vy-(d2.y-d0.y)*uy)/det,d=(ux*(d2.y-d0.y)-vx*(d1.y-d0.y))/det;
 ctx.save();ctx.beginPath();const mx=(d0.x+d1.x+d2.x)/3,my=(d0.y+d1.y+d2.y)/3;
 [d0,d1,d2].forEach((p,i)=>{const dx=p.x-mx,dy=p.y-my,len=Math.hypot(dx,dy),x=p.x+dx/len*.38,y=p.y+dy/len*.38;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();ctx.clip();
 ctx.setTransform(a,b,c,d,d0.x-a*s0.x-c*s0.y,d0.y-b*s0.x-d*s0.y);ctx.drawImage(image,0,0);ctx.restore();
}

export class ArticulatedSprites{
 constructor(){this.cache=new Map();this.images=new WeakMap();this.nextImage=0;this.pixels=0;this.maxPixels=12*1024*1024;this.hits=0;this.misses=0;this.deferred=0;this.remaining=Infinity;}
 beginFrame(budgetMs=3.5){this.remaining=budgetMs;}
 draw(ctx,image,species,width,height,time,effort,state={},resolution=1){
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0||!image.width||!image.height)return;
  const p=animalProfile(species),bins=width<150?16:24,cycle=((time*p.frequency)%1+1)%1,tick=Math.floor(cycle*bins),a=Math.round(clamp(effort)*2)/2,feed=Math.round(clamp(state.feed||0)*5)/5,retract=Math.round(clamp(state.retract||0)*5)/5,puff=Math.round(clamp(state.puff||0)*5)/5;
  const turn=Math.round(Math.max(-1,Math.min(1,state.turn||0))*3)/3;
  if(!this.images.has(image))this.images.set(image,++this.nextImage);
  const w=Math.min(640,Math.max(64,Math.ceil(width*resolution/64)*64)),h=Math.max(8,Math.round(w*height/width)),pad=Math.ceil(Math.max(w,h)*(.09+puff*.16));
  const group=[this.images.get(image),p.id,w,bins,a,feed,retract,puff,turn].join(':'),key=group+':'+tick;let frame=this.cache.get(key);
  if(frame){this.cache.delete(key);this.cache.set(key,frame);this.hits++;}
  else{
   if(this.remaining<=0){
    this.deferred++;let closest=Infinity;
    for(const candidate of this.cache.values())if(candidate.group===group){const d=Math.abs(candidate.tick-tick),wrapped=Math.min(d,bins-d);if(wrapped<closest){frame=candidate;closest=wrapped;}}
    if(!frame){ctx.drawImage(image,-width/2,-height/2,width,height);return;}
   }else{
   const started=performance.now();this.misses++;const canvas=document.createElement('canvas');canvas.width=w+pad*2;canvas.height=h+pad*2;const c=canvas.getContext('2d');
   const cols=FIN_RIGS[p.id]?20:width<150?10:16,rows=FIN_RIGS[p.id]?16:width<150?6:10,src=[],dst=[];
   for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){const u=i/cols,v=j/rows,q=deformPoint(p,u,v,tick/bins/p.frequency,a,{feed,retract,puff,turn,aspect:image.height/image.width});src.push({x:u*image.width,y:v*image.height});dst.push({x:pad+q.x*w,y:pad+q.y*h});}
   for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+1,c1=a+cols+1,d=c1+1;triangle(c,image,src[a],src[b],src[c1],dst[a],dst[b],dst[c1]);triangle(c,image,src[b],src[d],src[c1],dst[b],dst[d],dst[c1]);}
   frame={canvas,pixels:canvas.width*canvas.height,group,tick};this.cache.set(key,frame);this.pixels+=frame.pixels;
   while(this.pixels>this.maxPixels||this.cache.size>512){const first=this.cache.keys().next().value;this.pixels-=this.cache.get(first).pixels;this.cache.delete(first);}
   this.remaining-=performance.now()-started;
   }
  }
  const scale=width/w;ctx.drawImage(frame.canvas,-width/2-pad*scale,-height/2-pad*scale,frame.canvas.width*scale,frame.canvas.height*scale);
 }
}
