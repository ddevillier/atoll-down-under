// A small set of painted pieces, cut once and posed every frame. Hinge lines stay
// joined as fins fold in projection; body markings follow rigid cross-sections.
// These are authored 2D motion signatures, not measured swimming kinematics.
const clamp=x=>Math.max(0,Math.min(1,x)),TAU=Math.PI*2;
const part=(name,polygon,hinge,fold,sweep,phase=0)=>({name,polygon,hinge,fold,sweep,phase});
export const PART_RIGS={
 s5:{frequency:2.1,scull:.70,underlay:{from:[.625,.30,.16,.17],to:[.615,.465,.18,.215]},parts:[
  part('tail',[[0,0],[.205,0],[.205,1],[0,1]],[[.205,.445],[.205,.574]],.28,.28,1.5),
  part('pectoral',[[.617,.471],[.682,.489],[.788,.545],[.770,.627],[.748,.671],[.708,.649],[.661,.578]],[[.770,.556],[.758,.624]],.72,.25,.6),
  part('pelvic',[[.653,.821],[.790,.798],[.76,1.05],[.568,1.05]],[[.654,.831],[.774,.808]],.39,.14,1.1)
 ]},
 s8:{frequency:1.8,scull:.72,underlay:{from:[.57,.635,.16,.075],to:[.562,.31,.168,.31]},parts:[
  part('tail',[[0,0],[.20,0],[.20,1],[0,1]],[[.20,.425],[.20,.530]],.26,.25,1.6),
  part('pectoral',[[.565,.314],[.622,.329],[.692,.388],[.724,.490],[.724,.590],[.668,.615],[.610,.580],[.570,.470]],[[.697,.417],[.705,.537]],.71,.23,.7),
  part('pelvic',[[.610,.732],[.717,.708],[.71,1.05],[.515,1.05]],[[.627,.735],[.706,.718]],.40,.15,1.3)
 ]},
 s10:{frequency:2.65,scull:.70,underlay:{from:[.48,.395,.15,.19],to:[.627,.395,.15,.19]},parts:[
  part('tail',[[0,0],[.176,0],[.176,1],[0,1]],[[.176,.404],[.176,.640]],.30,.32,1.6),
  part('pectoral',[[.664,.445],[.705,.424],[.759,.454],[.739,.540],[.680,.580],[.636,.582]],[[.753,.460],[.738,.514]],.67,.24,.5),
  part('pelvic',[[.645,.732],[.742,.725],[.74,1.05],[.604,1.05]],[[.658,.744],[.730,.738]],.44,.15,1.2)
 ]},
 s15:{frequency:1.55,scull:.70,underlay:{from:[.31,.38,.23,.32],to:[.528,.377,.23,.32]},parts:[
  part('tail',[[0,0],[.22,0],[.22,1],[0,1]],[[.22,.379],[.22,.610]],.23,.26,1.6),
  part('pectoral',[[.530,.382],[.632,.427],[.746,.523],[.754,.640],[.674,.685],[.597,.623],[.552,.509]],[[.735,.547],[.731,.623]],.73,.25,.8),
  part('pelvic',[[.614,.768],[.765,.729],[.77,1.04],[.55,1.04]],[[.625,.780],[.744,.746]],.35,.14,1.3)
 ]},
 s29:{frequency:1.12,scull:.75,underlay:{from:[.34,.43,.155,.295],to:[.494,.43,.185,.31]},parts:[
  part('tail',[[0,0],[.197,0],[.197,1],[0,1]],[[.197,.340],[.197,.568]],.19,.21,1.6),
  part('pectoral',[[.498,.435],[.553,.462],[.637,.538],[.669,.590],[.642,.669],[.584,.731],[.529,.709],[.507,.641]],[[.653,.566],[.659,.652]],.67,.25,.6),
  part('pelvic',[[.559,.780],[.694,.771],[.70,1.03],[.46,1.03]],[[.561,.787],[.678,.774]],.33,.12,1.2)
 ]},
 s52:{frequency:1.9,scull:.72,underlay:{from:[.388,.43,.195,.28],to:[.574,.464,.181,.227]},parts:[
  part('tail',[[0,0],[.20,0],[.20,1],[0,1]],[[.20,.435],[.20,.565]],.26,.28,1.6),
  part('pectoral',[[.576,.470],[.657,.479],[.746,.570],[.739,.627],[.697,.679],[.636,.650],[.598,.576]],[[.738,.573],[.722,.644]],.73,.26,.65),
  part('pelvic',[[.610,.784],[.710,.764],[.72,1.04],[.558,1.04]],[[.620,.790],[.701,.775]],.37,.13,1.2)
 ]},
 s41:{frequency:2.35,scull:.72,parts:[
  part('tail',[[0,0],[.117,0],[.117,1],[0,1]],[[.117,.423],[.117,.588]],.26,.23,1.5),
  part('dorsal',[[.177,.302],[.177,0],[.365,0],[.365,.282]],[[.195,.316],[.349,.282]],.60,.15,.2),
  part('anal',[[.177,.643],[.345,.615],[.36,1.03],[.16,1.03]],[[.192,.656],[.332,.628]],.56,.13,1.5),
  part('pelvic',[[.558,.682],[.638,.672],[.643,1.04],[.547,1.04]],[[.570,.690],[.627,.686]],.43,.13,.8)
 ]},
 s1:{frequency:2.6,scull:.70,underlay:{from:[.51,.34,.23,.16],to:[.51,.50,.23,.18]},parts:[
  part('tail',[[0,0],[.235,0],[.235,1],[0,1]],[[.235,.438],[.235,.593]],.30,.30,1.6),
  part('pectoral',[[.51,.50],[.64,.52],[.744,.56],[.749,.60],[.71,.657],[.60,.684],[.503,.611]],[[.735,.556],[.739,.610]],.76,.23,.7),
  part('pelvic',[[.597,.750],[.744,.721],[.755,1.05],[.525,1.05]],[[.609,.749],[.736,.734]],.38,.13,1.1)
 ]},
 s2:{frequency:2.0,scull:.82,underlay:{from:[.55,.265,.22,.14],to:[.545,.400,.218,.325]},parts:[
  part('tail',[[0,0],[.267,0],[.267,1],[0,1]],[[.267,.391],[.267,.640]],.27,.24,1.6),
  part('pectoral',[[.730,.475],[.676,.425],[.615,.397],[.573,.418],[.543,.495],[.550,.599],[.596,.690],[.680,.730],[.733,.680],[.763,.645],[.763,.477]],[[.749,.485],[.756,.647]],.70,.21,.6)
 ]},
 s7:{frequency:2.2,scull:.68,underlay:{from:[.596,.249,.146,.15],to:[.549,.372,.21,.342]},parts:[
  part('tail',[[0,0],[.262,0],[.262,1],[0,1]],[[.262,.423],[.262,.638]],.32,.29,1.6),
  part('pectoral',[[.72,.56],[.697,.434],[.635,.370],[.579,.380],[.550,.439],[.548,.630],[.590,.715],[.650,.717],[.727,.650],[.760,.616]],[[.738,.549],[.739,.624]],.70,.23,.7),
  part('pelvic',[[.618,.754],[.742,.728],[.75,1.04],[.55,1.04]],[[.628,.750],[.733,.738]],.40,.16,1.2)
 ]},
 s30:{frequency:2.8,scull:.75,underlay:{from:[.625,.405,.135,.115],to:[.622,.510,.138,.195]},parts:[
  part('tail',[[0,0],[.294,0],[.294,1],[0,1]],[[.294,.382],[.294,.590]],.31,.28,1.6),
  part('pectoral',[[.625,.509],[.692,.535],[.762,.584],[.749,.632],[.704,.675],[.655,.698],[.620,.644]],[[.748,.570],[.750,.626]],.73,.22,.8),
  part('pelvic',[[.605,.803],[.745,.752],[.75,1.05],[.51,1.05]],[[.623,.790],[.732,.765]],.36,.11,1.1)
 ]},
 s0:{frequency:2.7,spine:{root:.19,front:.79,axis:.52,amplitude:.045,lag:2.0},parts:[
  part('tail',[[0,0],[.19,0],[.19,1],[0,1]],[[.19,.435],[.19,.615]],.35,.38,1.6),
  part('dorsal',[[.397,.335],[.397,0],[.615,0],[.615,.285]],[[.407,.322],[.601,.283]],.30,.08,.4),
  part('pelvic',[[.532,.78],[.632,.774],[.64,1.02],[.51,1.02]],[[.537,.786],[.626,.777]],.48,.14,1.2)
 ]},
 s17:{frequency:1.65,spine:{root:.20,front:.79,axis:.54,amplitude:.031,lag:1.5},parts:[
  part('tail',[[0,0],[.20,0],[.20,1],[0,1]],[[.20,.45],[.20,.63]],.28,.34,1.6),
  part('dorsal',[[.325,.368],[.325,0],[.513,0],[.513,.341]],[[.337,.36],[.505,.346]],.22,.07,.3),
  part('rear dorsal',[[.657,.347],[.657,.1],[.744,.1],[.744,.355]],[[.662,.347],[.735,.351]],.18,.05,.7),
  part('pelvic',[[.687,.714],[.748,.699],[.75,1.02],[.674,1.02]],[[.690,.719],[.743,.706]],.43,.15,1.0)
 ]},
 s18:{frequency:2.15,spine:{root:.106,front:.585,axis:.56,amplitude:.020,lag:1.45},parts:[
  part('tail',[[0,0],[.106,0],[.106,1],[0,1]],[[.106,.49],[.106,.66]],.42,.42,1.6),
  part('dorsal',[[.171,.447],[.171,0],[.298,0],[.298,.356]],[[.181,.432],[.289,.367]],.38,.09,.4),
  part('pelvic',[[.339,.735],[.391,.722],[.40,1.02],[.32,1.02]],[[.343,.738],[.384,.726]],.48,.11,1.1)
 ]},
 s23:{frequency:2.5,scull:.78,underlay:{from:[.695,.47,.09,.16],to:[.665,.625,.09,.16]},parts:[
  part('tail',[[0,0],[.198,0],[.198,1],[0,1]],[[.198,.49],[.198,.64]],.24,.18),
  part('dorsal',[[.28,.45],[.29,0],[.48,0],[.48,.35],[.43,.385],[.33,.445]],[[.33,.435],[.46,.36]],.62,.12,.8),
  part('pectoral',[[.708,.632],[.741,.622],[.751,.711],[.711,.843],[.611,.921],[.629,.853],[.671,.729]],[[.716,.638],[.740,.687]],.72,.32,1.4)
 ]},
 s28:{frequency:1.95,spine:{root:.20,front:.78,axis:.535,amplitude:.044,lag:1.8},parts:[
  part('tail',[[0,0],[.20,0],[.20,1],[0,1]],[[.20,.466],[.20,.604]],.30,.40,1.6),
  part('dorsal',[[.443,.292],[.44,0],[.64,0],[.64,.215],[.585,.215],[.51,.237]],[[.448,.289],[.626,.214]],.25,.07,.3),
  part('pelvic',[[.664,.757],[.748,.742],[.76,1.02],[.65,1.02]],[[.670,.764],[.741,.748]],.44,.18,1.1)
 ]},
 s32:{frequency:1.05,spine:true,parts:[
  part('tail',[[0,0],[.21,0],[.21,1],[0,1]],[[.21,.425],[.21,.65]],.22,.25,1.7),
  part('dorsal',[[.435,.37],[.435,0],[.60,0],[.623,.345]],[[.445,.366],[.613,.345]],.12,.04,.3),
  part('pectoral',[[.605,.633],[.728,.606],[.725,.652],[.69,.800],[.627,.92],[.562,1.08],[.50,1.08],[.545,.84]],[[.610,.640],[.721,.621]],.43,.17,1.1)
 ]},
 s33:{frequency:.90,spine:{root:.20,front:.79,axis:.56,amplitude:.070,lag:2.4},parts:[
  part('tail',[[0,0],[.20,0],[.20,1],[0,1]],[[.20,.455],[.20,.643]],.16,.23,1.8),
  part('dorsal',[[.43,.412],[.43,0],[.624,0],[.624,.34]],[[.440,.401],[.615,.348]],.11,.04,.3),
  part('pectoral',[[.627,.660],[.732,.61],[.73,.73],[.61,.96],[.55,1.03],[.575,.86]],[[.638,.661],[.725,.632]],.40,.16,1.1)
 ]},
 s34:{frequency:.72,spine:{root:.188,front:.76,axis:.56,amplitude:.040,lag:1.7},parts:[
  part('tail',[[0,0],[.188,0],[.188,1],[0,1]],[[.188,.476],[.188,.614]],.15,.20,1.8),
  part('dorsal',[[.430,.32],[.43,0],[.632,0],[.632,.28]],[[.443,.308],[.620,.287]],.085,.025,.3),
  part('pectoral',[[.515,.712],[.670,.604],[.68,.650],[.626,.81],[.55,.94],[.48,1.10],[.405,1.10],[.448,.89]],[[.529,.692],[.664,.628]],.32,.12,1.1)
 ]},
 s35:{frequency:.82,spine:{root:.18,front:.78,axis:.58,amplitude:.060,lag:2.4},parts:[
  part('tail',[[0,0],[.18,0],[.18,1],[0,1]],[[.18,.507],[.18,.657]],.20,.27,1.8),
  part('dorsal',[[.430,.367],[.43,0],[.631,0],[.631,.303]],[[.444,.359],[.621,.312]],.12,.04,.3),
  part('pectoral',[[.578,.72],[.711,.631],[.713,.69],[.665,.80],[.603,.90],[.54,1.1],[.465,1.1],[.525,.87]],[[.591,.704],[.698,.655]],.37,.16,1.1)
 ]},
 s42:{frequency:2.2,spine:true,parts:[
  part('tail',[[0,0],[.21,0],[.21,1],[0,1]],[[.21,.46],[.21,.59]],.30,.34,1.7),
  part('pelvic',[[.625,.765],[.754,.719],[.75,1.02],[.58,1.02]],[[.630,.765],[.742,.730]],.38,.14,1.1)
 ]},
 s49:{frequency:2.25,spine:{root:.20,front:.78,axis:.52,amplitude:.031,lag:1.7},parts:[
  part('tail',[[0,0],[.20,0],[.20,1],[0,1]],[[.20,.420],[.20,.609]],.35,.37,1.6),
  part('dorsal',[[.365,.337],[.365,0],[.593,0],[.593,.260]],[[.375,.328],[.583,.268]],.25,.08,.3),
  part('pelvic',[[.632,.797],[.709,.787],[.72,1.02],[.61,1.02]],[[.638,.802],[.702,.793]],.45,.17,1.1)
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
 // while the tail comes to rest; hoverers and cowfish keep sculling in place.
 const drive=name==='tail'?.05+.95*Math.sqrt(a):rig.scull!=null?rig.scull+(1-rig.scull)*a:.12+.88*Math.sqrt(a);
 const stroke=(1-Math.cos(phase))*.5,active=drive*(1-clamp(feed)*.65);
 const fold=part.fold*active*(1-clamp(brake)*.75);
 return {scale:1-fold*stroke,shear:Math.sin(phase)*part.sweep*active+Math.max(-1,Math.min(1,turn))*.08,brake:clamp(brake)};
}

export function bodyPoint(id,u,v,time,effort=1,state={}){
 if(!PART_RIGS[id]?.spine)return {x:u,y:v};
 const rig=PART_RIGS[id],f=rig.spine===true?{root:.21,front:.78,axis:.54,amplitude:.060,lag:1.8}:rig.spine;
 const a=clamp(effort),span=f.front-f.root,rear=clamp((f.front-u)/span),phase=time*rig.frequency*TAU;
 const drive=(.035+.965*Math.sqrt(a))*(1-clamp(state.feed||0)*.75),aspect=state.aspect||.44;
 const bend=q=>Math.sin(phase+q*f.lag)*q*q*f.amplitude*drive+(state.turn||0)*q*q*.026;
 // The tail hinge uses the same tangent as the final body section. Switching
 // to zero slope exactly at the joint made that cross-section discontinuous.
 const derivative=u<f.front?-(Math.cos(phase+rear*f.lag)*f.lag*rear*rear*f.amplitude*drive+Math.sin(phase+rear*f.lag)*2*rear*f.amplitude*drive+(state.turn||0)*2*rear*.026)/span:0;
 const angle=Math.atan(derivative),cross=(v-f.axis)*aspect;
 return {x:u-cross*Math.sin(angle),y:f.axis+(cross*Math.cos(angle)+bend(rear))/aspect};
}

function path(c,points,w,h){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x*w,y*h):c.moveTo(x*w,y*h));c.closePath();}
function surface(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}

export class PaintedParts{
 constructor(){this.images=new WeakMap();this.prepared=0;this.preparedPixels=0;this.draws=0;}
 prepare(image,id){
  let versions=this.images.get(image);if(!versions){versions=new Map();this.images.set(image,versions);}if(versions.has(id))return versions.get(id);
  const w=image.width,h=image.height,body=surface(w,h),c=body.getContext('2d');c.drawImage(image,0,0);
  const pieces=PART_RIGS[id].parts.map(p=>{
   const left=Math.max(0,Math.floor(Math.min(...p.polygon.map(p=>p[0]))*w)-2),top=Math.max(0,Math.floor(Math.min(...p.polygon.map(p=>p[1]))*h)-2),right=Math.min(w,Math.ceil(Math.max(...p.polygon.map(p=>p[0]))*w)+2),bottom=Math.min(h,Math.ceil(Math.max(...p.polygon.map(p=>p[1]))*h)+2);
   const canvas=surface(right-left,bottom-top),pc=canvas.getContext('2d');pc.save();pc.translate(-left,-top);path(pc,p.polygon,w,h);pc.clip();pc.drawImage(image,0,0);pc.restore();c.save();path(c,p.polygon,w,h);c.clip();c.clearRect(0,0,w,h);c.restore();return {...p,canvas,left,top};
  });
  // Overlaid pectorals need a painted flank beneath them as they fold. Keep
  // this local reconstruction inside the authored cut, preserving source bytes.
  const underlay=PART_RIGS[id].underlay;
  if(underlay){const p=PART_RIGS[id].parts.find(p=>p.name==='pectoral'),[x,y,sw,sh]=underlay.from,[dx,dy,dw,dh]=underlay.to;c.save();path(c,p.polygon,w,h);c.clip();c.drawImage(image,x*w,y*h,sw*w,sh*h,dx*w,dy*h,dw*w,dh*h);c.restore();}
  const result={body,pieces};versions.set(id,result);this.prepared++;this.preparedPixels+=w*h+pieces.reduce((n,p)=>n+p.canvas.width*p.canvas.height,0);return result;
 }
 draw(c,image,id,width,height,time,effort,state={}){
  const {body,pieces}=this.prepare(image,id),aspect=height/width,s={...state,aspect};this.draws++;
  c.save();c.translate(-width/2,-height/2);
  // Fourteen small triangles replace hundreds of full-image triangle draws.
  // All fin pieces use one affine draw each and have no pose-cache fallback.
  if(PART_RIGS[id].spine){
   const f=PART_RIGS[id].spine,root=f.root??.21,front=f.front??.78;
   const xs=[0,.16,.33,.50,.67,.85,1].map(t=>root+(front-root)*t);xs.push(1);
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
   c.save();c.translate(A.x*width,A.y*height);c.transform(vx*ux-nx*uy,vy*ux-ny*uy,vx*uy+nx*ux,vy*uy+ny*ux,0,0);c.drawImage(p.canvas,p.left/image.width*width-ax,p.top/image.height*height-ay,p.canvas.width/image.width*width,p.canvas.height/image.height*height);c.restore();
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
