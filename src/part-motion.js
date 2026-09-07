// A small set of painted pieces, cut once and posed every frame. Hinge lines stay
// joined as fins fold in projection; body markings follow rigid cross-sections.
// These are authored 2D motion signatures, not measured swimming kinematics.
const clamp=x=>Math.max(0,Math.min(1,x)),TAU=Math.PI*2;
const part=(name,polygon,hinge,fold,sweep,phase=0)=>({name,polygon,hinge,fold,sweep,phase});
export const PART_RIGS={
 s23:{frequency:2.5,parts:[
  part('tail',[[0,0],[.198,0],[.198,1],[0,1]],[[.198,.49],[.198,.64]],.24,.18),
  part('dorsal',[[.28,.45],[.29,0],[.48,0],[.48,.35],[.43,.385],[.33,.445]],[[.33,.435],[.46,.36]],.62,.12,.8),
  part('pectoral',[[.708,.632],[.741,.622],[.751,.711],[.711,.843],[.611,.921],[.629,.853],[.671,.729]],[[.716,.638],[.740,.687]],.72,.32,1.4)
 ]},
 s32:{frequency:1.05,spine:true,parts:[
  part('tail',[[0,0],[.21,0],[.21,1],[0,1]],[[.21,.425],[.21,.65]],.22,.25,1.7),
  part('dorsal',[[.435,.37],[.435,0],[.60,0],[.623,.345]],[[.445,.366],[.613,.345]],.12,.04,.3),
  part('pectoral',[[.605,.633],[.725,.607],[.725,.64],[.647,.877],[.548,1.02],[.557,.88]],[[.610,.640],[.721,.621]],.43,.17,1.1)
 ]},
 s42:{frequency:2.2,spine:true,parts:[
  part('tail',[[0,0],[.21,0],[.21,1],[0,1]],[[.21,.46],[.21,.59]],.30,.34,1.7),
  part('pelvic',[[.625,.765],[.754,.719],[.75,1.02],[.58,1.02]],[[.630,.765],[.742,.730]],.38,.14,1.1)
 ]},
 s27:{frequency:.82,parts:[
  part('tail',[[0,0],[.44,0],[.44,1],[0,1]],[[.44,.38],[.44,.51]],.015,.035,.9),
  part('upper disc',[[.455,.395],[.455,0],[.91,0],[.91,.395]],[[.455,.395],[.91,.395]],.48,.07),
  part('lower disc',[[.445,.49],[.845,.58],[1,.64],[1,1.03],[.42,1.03]],[[.445,.49],[.845,.58]],.43,-.08,.35)
 ]}
};

export function partPose(id,name,time,effort=1,{brake=0,turn=0,feed=0}={}){
 const rig=PART_RIGS[id],part=rig.parts.find(p=>p.name===name),a=clamp(effort),phase=time*rig.frequency*TAU+part.phase;
 // Propulsion is legible at ordinary NPC speed. Braking opens stabilizing fins
 // while the tail comes to rest; the rigid cowfish keeps sculling in place.
 const drive=name==='tail'?.05+.95*Math.sqrt(a):id==='s23'?.78+.22*a:.12+.88*Math.sqrt(a);
 const stroke=(1-Math.cos(phase))*.5,active=drive*(1-clamp(feed)*.65);
 const fold=part.fold*active*(1-clamp(brake)*.75);
 return {scale:1-fold*stroke,shear:Math.sin(phase)*part.sweep*active+Math.max(-1,Math.min(1,turn))*.08,brake:clamp(brake)};
}

export function bodyPoint(id,u,v,time,effort=1,state={}){
 if(!PART_RIGS[id]?.spine)return {x:u,y:v};
 const a=clamp(effort),rear=clamp((.78-u)/.57),phase=time*PART_RIGS[id].frequency*TAU;
 const drive=(.035+.965*Math.sqrt(a))*(1-clamp(state.feed||0)*.75),aspect=state.aspect||.44;
 const bend=q=>Math.sin(phase+q*1.8)*q*q*.060*drive+(state.turn||0)*q*q*.026;
 const offset=bend(rear),derivative=u<.78&&u>.21?(bend(Math.min(1,rear+.001))-bend(Math.max(0,rear-.001)))/.002/-.57:0;
 const angle=Math.atan(derivative),cross=(v-.54)*aspect;
 return {x:u-cross*Math.sin(angle),y:.54+(cross*Math.cos(angle)+offset)/aspect};
}

function path(c,points,w,h){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x*w,y*h):c.moveTo(x*w,y*h));c.closePath();}
function surface(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}

export class PaintedParts{
 constructor(){this.images=new WeakMap();this.prepared=0;this.draws=0;}
 prepare(image,id){
  let versions=this.images.get(image);if(!versions){versions=new Map();this.images.set(image,versions);}if(versions.has(id))return versions.get(id);
  const w=image.width,h=image.height,body=surface(w,h),c=body.getContext('2d');c.drawImage(image,0,0);
  const pieces=PART_RIGS[id].parts.map(p=>{const canvas=surface(w,h),pc=canvas.getContext('2d');pc.save();path(pc,p.polygon,w,h);pc.clip();pc.drawImage(image,0,0);pc.restore();c.save();path(c,p.polygon,w,h);c.clip();c.clearRect(0,0,w,h);c.restore();return {...p,canvas};});
  // The cowfish pectoral lies over the flank. Fill only that small underlay from
  // adjacent painted flank, retaining source bytes and a separate fin cutout.
  if(id==='s23'){const p=PART_RIGS[id].parts.find(p=>p.name==='pectoral');c.save();path(c,p.polygon,w,h);c.clip();c.drawImage(image,.695*w,.47*h,.09*w,.16*h,.665*w,.625*h,.09*w,.16*h);c.restore();}
  const result={body,pieces};versions.set(id,result);this.prepared++;return result;
 }
 draw(c,image,id,width,height,time,effort,state={}){
  const {body,pieces}=this.prepare(image,id),aspect=height/width,s={...state,aspect};this.draws++;
  c.save();c.translate(-width/2,-height/2);
  // Fourteen small triangles replace hundreds of full-image triangle draws.
  // All fin pieces use one affine draw each and have no pose-cache fallback.
  if(PART_RIGS[id].spine){
   const xs=[.21,.30,.40,.50,.60,.70,.78,1];
   for(let i=0;i<xs.length-1;i++){const l=xs[i],r=xs[i+1],source=[[l,0],[r,0],[l,1],[r,1]],dest=source.map(([u,v])=>bodyPoint(id,u,v,time,effort,s));
    triangle(c,body,source[0],source[1],source[2],dest[0],dest[1],dest[2],width,height);
    triangle(c,body,source[1],source[3],source[2],dest[1],dest[3],dest[2],width,height);
   }
  }else c.drawImage(body,0,0,width,height);
  for(const p of pieces){
   const pose=partPose(id,p.name,time,effort,state),[a,b]=p.hinge,A=bodyPoint(id,...a,time,effort,s),B=bodyPoint(id,...b,time,effort,s);
   const ax=a[0]*width,ay=a[1]*height,bx=b[0]*width,by=b[1]*height,length=Math.hypot(bx-ax,by-ay),ux=(bx-ax)/length,uy=(by-ay)/length;
   const vx=(B.x-A.x)*width/length,vy=(B.y-A.y)*height/length;
   // In hinge coordinates, tangent is fixed; normal is foreshortened and swept.
   const nx=-vy*pose.scale+vx*pose.shear,ny=vx*pose.scale+vy*pose.shear;
   c.save();c.translate(A.x*width,A.y*height);c.transform(vx*ux-nx*uy,vy*ux-ny*uy,vx*uy+nx*ux,vy*uy+ny*ux,0,0);c.drawImage(p.canvas,-ax,-ay,width,height);c.restore();
  }
  c.restore();
 }
}

function triangle(c,image,a,b,d,A,B,D,w,h){
 const ux=b[0]-a[0],uy=b[1]-a[1],vx=d[0]-a[0],vy=d[1]-a[1],det=ux*vy-vx*uy;
 const m11=((B.x-A.x)*vy-(D.x-A.x)*uy)/det,m21=((B.y-A.y)*vy-(D.y-A.y)*uy)/det;
 const m12=(ux*(D.x-A.x)-vx*(B.x-A.x))/det,m22=(ux*(D.y-A.y)-vx*(B.y-A.y))/det;
 c.save();c.beginPath();const cx=(A.x+B.x+D.x)/3,cy=(A.y+B.y+D.y)/3;
 [A,B,D].forEach((p,i)=>{const dx=p.x-cx,dy=p.y-cy,len=Math.hypot(dx*w,dy*h),x=p.x*w+dx*w/len*1.3,y=p.y*h+dy*h/len*1.3;i?c.lineTo(x,y):c.moveTo(x,y);});c.closePath();c.clip();
 c.transform(m11,m21*h/w,m12*w/h,m22,(A.x-m11*a[0]-m12*a[1])*w,(A.y-m21*a[0]-m22*a[1])*h);c.drawImage(image,0,0,w,h);c.restore();
}
