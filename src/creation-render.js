import {anatomy} from './creation-appearance.js';
const TAU=Math.PI*2,N=900,clamp=x=>Math.max(0,Math.min(1,x));
export const CREATION_ART=['body-rounded','body-slender','body-sturdy','tail-fan','tail-fork','tail-lyre','tail-point','dorsal-low','dorsal-sail','dorsal-spiny','dorsal-ribbon','pectoral-paddle','pectoral-wing','pectoral-point','pelvic','head-small','head-wide','head-beak','head-tube'];
function surface(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function layer([x,y,w,h],draw){const image=surface(Math.ceil(w*N)+4,Math.ceil(h*N)+4),c=image.getContext('2d');c.translate(2-x*N,2-y*N);c.scale(N,N);draw(c);return {image,x:x-2/N,y:y-2/N,w:image.width/N,h:image.height/N};}
function paint(c,p,width=1){c.drawImage(p.image,p.x*width,p.y*width,p.w*width,p.h*width);}
function tint(source,color){
 const out=surface(source.width,source.height),c=out.getContext('2d');c.drawImage(source,0,0);c.globalCompositeOperation='color';c.fillStyle=color;c.fillRect(0,0,out.width,out.height);c.globalCompositeOperation='destination-in';c.drawImage(source,0,0);
 // Color blending alone discards RGB lightness: black and white would both
 // become the same gray fish. Shift value while preserving painted shading.
 const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255),lightness=(Math.max(...rgb)+Math.min(...rgb))/2;
 c.globalCompositeOperation='source-atop';c.globalAlpha=Math.abs(lightness-.5)*1.5;c.fillStyle=lightness<.5?'#000000':'#ffffff';c.fillRect(0,0,out.width,out.height);return out;
}
function polygon(c,points){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}
function contours(image){const c=image.getContext('2d'),{width:w,height:h}=image,data=c.getImageData(0,0,w,h).data;return Array.from({length:w},(_,x)=>{let top=h,bottom=0;for(let y=0;y<h;y++)if(data[(y*w+x)*4+3]>12){top=Math.min(top,y);bottom=y+1;}return [top,bottom];});}
// Painted components retain fine scales and membrane rays. Cache cropped layers,
// then articulate them about their actual attachment points every rendered frame.
export class CreationPainter{
 constructor(art){this.art=art;this.cache=new Map();this.prepared=0;}
 prepare(s){
  const g=anatomy(s),a=g.a,key=JSON.stringify([s.body,s.color,g.depth,g.length,a]);
  if(this.cache.has(key)){const v=this.cache.get(key);this.cache.delete(key);this.cache.set(key,v);return v;}
  const d=g.depth,root=-.28*g.length,bodyWidth=.45-root,headWidth={small:.31,wide:.36,beak:.33,tube:.43}[a.mouth],headX=g.mouthX-headWidth;
  const headV={small:.65,wide:.50,beak:.64,tube:.66}[a.mouth],headH=d*1.68,headY=-headH*headV;
  const skin=tint(this.art['body-'+s.body],s.color),headSkin=tint(this.art['head-'+a.mouth],s.color),headRect=[headX,headY,headWidth,headH];
  const fullHead=layer(headRect,c=>{
   c.drawImage(headSkin,...headRect);
   // Feather the overlapping collar, preserving the gill plate and eye.
   c.globalCompositeOperation='destination-in';const fade=c.createLinearGradient(headX,0,headX+headWidth*.18,0);fade.addColorStop(0,'#ffffff00');fade.addColorStop(1,'#ffffffff');c.fillStyle=fade;c.fillRect(...headRect);
  });
  const end=headX+headWidth*.27,bodyContour=contours(skin),headContour=contours(headSkin);
  const body=layer([root-.01,Math.min(-d,headY),end-root+.02,Math.max(d*.92,headY+headH)-Math.min(-d,headY)],c=>{
   // Bend the painted collar into the selected head silhouette. Merely cropping
   // the torso leaves a rectangular belly step on mismatched body/head pairs.
   const sw=(end-root)/bodyWidth*skin.width;
   for(let sx=0;sx<sw;sx++){
    const x=root+sx/skin.width*bodyWidth,[st,sb]=bodyContour[sx];if(sb<=st)continue;
    const hx=Math.max(0,Math.min(headSkin.width-1,Math.round(Math.max(.06,(x-headX)/headWidth)*headSkin.width))),[ht,hb]=headContour[hx];
    const t=clamp((x-(headX-.12))/(end-(headX-.12))),blend=t*t*(3-2*t);
    const top=-d+st/skin.height*d*1.92,bottom=-d+sb/skin.height*d*1.92;
    const y=top+(headY+ht/headSkin.height*headH-top)*blend,z=bottom+(headY+hb/headSkin.height*headH-bottom)*blend;
    c.drawImage(skin,sx,st,1,sb-st,x,y,bodyWidth/skin.width+.0008,z-y);
   }
   // Patterns follow the torso surface and retain the painting's light and scales.
   c.globalCompositeOperation='source-atop';c.fillStyle=a.markingColor;c.strokeStyle=a.markingColor;c.globalAlpha=.68;
   if(a.marking==='spots')for(let row=0;row<8;row++)for(let col=0;col<13;col++){const seed=Math.sin(row*127.1+col*311.7)*43758.5453,n=seed-Math.floor(seed),x=root+.04+col*.041+(row%2)*.019+n*.013,y=-d*.83+row*d*.24+n*.018;c.beginPath();c.ellipse(x,y,.006+n*.007,.005+n*.006,n,0,TAU);c.fill();}
   if(a.marking==='stripes'){c.lineWidth=.014;for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(root,i*d*.18);c.bezierCurveTo(-.1,i*d*.33,.16,i*d*.27,.38,i*d*.15);c.stroke();}}
   if(a.marking==='bands')for(let i=0;i<7;i++){polygon(c,[[root+.035+i*.075,-d],[root+.059+i*.075,-d],[root+.12+i*.075,d],[root+.086+i*.075,d]]);c.fill();}
   if(a.marking==='saddle'){const gr=c.createLinearGradient(0,-d,0,d*.25);gr.addColorStop(0,a.markingColor);gr.addColorStop(.6,a.markingColor+'bb');gr.addColorStop(1,a.markingColor+'00');c.fillStyle=gr;c.fillRect(root,-d,bodyWidth,d*1.3);}
  });
  const fin=(name,rect,flip=false)=>{const im=tint(this.art[name],a.finColor);return layer(rect,c=>{if(flip){c.translate(rect[0],rect[1]+rect[3]);c.scale(1,-1);c.drawImage(im,0,0,rect[2],rect[3]);}else c.drawImage(im,...rect);});};
  const tailH={fan:.34,fork:.38,lyre:.46,point:.25}[a.tail],tail=fin('tail-'+a.tail,[-.515,-tailH*.5,root+.522,tailH]);
  const dorsalH={low:.14,sail:.30,spiny:.23,ribbon:.23}[a.dorsal],dorsalY=-d*.66;
  const silhouette=layer([root-.01,Math.min(-d,headY),g.mouthX-root+.02,Math.max(d*.92,headY+headH)-Math.min(-d,headY)],c=>{paint(c,body);paint(c,fullHead);}),outline=contours(silhouette.image);
  const dorsalSkin=tint(this.art['dorsal-'+a.dorsal],a.finColor),finOutline=contours(dorsalSkin),dx=root+.15;
  const dorsal=layer([dx,Math.min(-d,headY)-dorsalH,.40,dorsalH+Math.max(d,headH)],c=>{
   // Each fin ray meets the actual painted back, including free proportions
   // and long/short heads. Body paint then covers the embedded attachment.
   for(let sx=0;sx<dorsalSkin.width;sx++){
    const x=dx+sx/dorsalSkin.width*.40,ix=Math.max(0,Math.min(outline.length-1,Math.round((x-silhouette.x)*N))),back=silhouette.y+outline[ix][0]/N;
    const bottom=finOutline[sx][1];if(!bottom)continue;
    c.drawImage(dorsalSkin,sx,0,1,dorsalSkin.height,x,back+.014-bottom/dorsalSkin.height*dorsalH,.40/dorsalSkin.width+.0008,dorsalH);
   }
  });
  const anal=fin('dorsal-low',[root+.12,d*.62,.32,.12],true);
  const ph=[.14,d*.10],ps={paddle:[.17,.17],wing:[.28,.27],point:[.24,.15]}[a.pectoral];
  const pectoral=fin('pectoral-'+a.pectoral,[ph[0]-ps[0],ph[1],ps[0]+.008,ps[1]]);
  const pelvic=fin('pelvic',[.065,d*.64,.12,.14]);
  // Split the selected painted jaw itself. The black backing is revealed by the
  // opening jaw, while the eye and upper head remain rigid.
  const hinge=[headX+headWidth*.50,headY+headH*Math.min(.90,headV+.20)];
  const jawPoints=[hinge,[g.mouthX+.008,-.004],[g.mouthX+.01,headY+headH+.015],[hinge[0],headY+headH+.015]];
  const jaw=layer(headRect,c=>{polygon(c,jawPoints);c.clip();paint(c,fullHead);});
  const head=layer(headRect,c=>{paint(c,fullHead);c.globalCompositeOperation='destination-out';polygon(c,jawPoints);c.fill();});
  const cavity=layer(headRect,c=>{paint(c,jaw);c.globalCompositeOperation='source-in';c.fillStyle='#173337';c.fillRect(...headRect);});
  const result={body,head,jaw,cavity,tail,dorsal,anal,pectoral,pelvic,root,dh:[root+.35,dorsalY],ph,hinge,g};
  if(this.cache.size>=12)this.cache.delete(this.cache.keys().next().value);this.cache.set(key,result);this.prepared++;return result;
 }
 draw(c,s,texture,width,time,effort,state={}){
  const r=this.prepare(s),feed=clamp(state.feed||0),drive=.18+.82*clamp(effort),phase=time*TAU*(1.15+(s.speed||140)/180),motion=time>0?1:0;
  const joint=(p,x,y,angle,sx=1,sy=1)=>{c.save();c.translate(x*width,y*width);c.rotate(angle);c.scale(sx,sy);c.translate(-x*width,-y*width);paint(c,p,width);c.restore();};
  c.save();c.scale(1,1+clamp(state.puff||0)*.55);
  const bend=Math.sin(phase)*.075*drive+(state.turn||0)*.13;
  joint(r.tail,r.root,0,bend*motion,1-(1-Math.cos(phase))*.25*drive*motion);
  // Compress about the attachment without lifting the ray bases off the back.
  joint(r.dorsal,...r.dh,0,1,1-(1-Math.cos(phase*.6))*.025*motion);
  paint(c,r.anal,width);paint(c,r.pelvic,width);
  paint(c,r.body,width);
  paint(c,r.head,width);paint(c,r.cavity,width);joint(r.jaw,...r.hinge,feed*({small:.15,wide:.28,beak:.19,tube:.08}[r.g.a.mouth]));
  joint(r.pectoral,...r.ph,(-.08+Math.sin(phase+.8)*.20)*motion,1,1-(1-Math.cos(phase+.8))*.32*motion+(state.brake||0)*.25);
  if(s.ability==='lure'){c.save();c.scale(width,width);c.strokeStyle=r.g.a.finColor;c.lineWidth=.004;c.beginPath();c.moveTo(.25,-r.g.depth*.66);c.quadraticCurveTo(.36,-r.g.depth-.16,.43,-r.g.depth-.055+Math.sin(time*3)*.012*motion);c.stroke();c.fillStyle=state.lure>.2?'#fff4b8':r.g.a.finColor;c.beginPath();c.arc(.43,-r.g.depth-.055+Math.sin(time*3)*.012*motion,.012,0,TAU);c.fill();c.restore();}
  c.restore();
 }
}
