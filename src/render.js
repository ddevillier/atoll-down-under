import {REEFS,SPECIES,FOODS} from './data.js';
import {motionKind,bodyMotion} from './motion.js';
import {creatureWidth} from './geometry.js';
const TOP=55;
export class ReefRenderer {
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.reefs=[];this.atlases=[];this.bounds=[];this.sprites=[];this.foodSprites=[];this.customCache=new Map();this.ready=false;this.particles=[];this.clock=0;this.hover=null;this.inspect=false;this.reducedMotion=false;this.effects=[];this.resize();new ResizeObserver(()=>this.resize()).observe(canvas);}
 resize(){const r=this.canvas.getBoundingClientRect();const d=Math.min(window.devicePixelRatio||1,2);this.canvas.width=Math.round(r.width*d);this.canvas.height=Math.round(r.height*d);}
 async load(){
  const img=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Could not load '+src));im.src=src;});
  [this.reefs,this.atlases,this.splash]=await Promise.all([Promise.all(REEFS.map(r=>img(r.image))),Promise.all([0,1,2,3].map(n=>img('assets/creatures/fish-atlas-'+n+'.png'))),img('assets/title/splash.png')]);
  this.atlases.forEach((im,a)=>{this.extractAtlas(im).forEach((sprite,cell)=>{this.sprites[a*16+cell]=sprite;this.bounds[a*16+cell]={x:0,y:0,w:sprite.width,h:sprite.height};});});
  const food=await img('assets/creatures/food-atlas.png');for(let i=0;i<8;i++)this.foodSprites.push(this.extractCell(food,i,4,2,false));
  this.ready=true;
 }
 extractCell(image,cell,cols,rows,mainOnly,region=null){
  const w=region?.w||Math.floor(image.width/cols),h=region?.h||Math.floor(image.height/rows),c=document.createElement('canvas');c.width=w;c.height=h;const cx=c.getContext('2d',{willReadFrequently:true});cx.drawImage(image,region?.x??cell%cols*w,region?.y??Math.floor(cell/cols)*h,w,h,0,0,w,h);const d=cx.getImageData(0,0,w,h),pixels=d.data;
  const labels=new Int32Array(w*h),queue=new Int32Array(w*h);let label=0,biggest=0,biggestLabel=0;
  if(mainOnly){for(let start=0;start<labels.length;start++){if(labels[start]||pixels[start*4+3]<45)continue;label++;let head=0,tail=1;queue[0]=start;labels[start]=label;while(head<tail){const n=queue[head++],x=n%w,y=Math.floor(n/w);for(const dy of [-1,0,1])for(const dx of [-1,0,1]){if(!dx&&!dy||x+dx<0||x+dx>=w||y+dy<0||y+dy>=h)continue;const k=n+dy*w+dx;if(!labels[k]&&pixels[k*4+3]>=45){labels[k]=label;queue[tail++]=k;}}}if(tail>biggest){biggest=tail;biggestLabel=label;}}}
  let minx=w,miny=h,maxx=0,maxy=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const n=y*w+x;if(mainOnly&&labels[n]!==biggestLabel){let neighbor=false;if(pixels[n*4+3]>0&&pixels[n*4+3]<45){for(let dy=-2;dy<=2&&!neighbor;dy++)for(let dx=-2;dx<=2;dx++){if(x+dx>=0&&x+dx<w&&y+dy>=0&&y+dy<h&&labels[n+dy*w+dx]===biggestLabel){neighbor=true;break;}}}if(!neighbor)pixels[n*4+3]=0;}if(pixels[n*4+3]>40){minx=Math.min(x,minx);maxx=Math.max(x,maxx);miny=Math.min(y,miny);maxy=Math.max(y,maxy);}}
  cx.putImageData(d,0,0);const out=document.createElement('canvas');out.width=Math.max(1,maxx-minx+3);out.height=Math.max(1,maxy-miny+3);out.getContext('2d').drawImage(c,minx,miny,maxx-minx+1,maxy-miny+1,1,1,maxx-minx+1,maxy-miny+1);return out;
 }
 extractAtlas(image){
  // Segment the complete atlas before assigning cells. Grid-first cropping amputated
  // fins, noses and the seahorse's head when artwork crossed an implied cell boundary.
  const w=image.width,h=image.height,c=document.createElement('canvas');c.width=w;c.height=h;
  const cx=c.getContext('2d',{willReadFrequently:true});cx.drawImage(image,0,0);const pixels=cx.getImageData(0,0,w,h).data;
  const labels=new Int32Array(w*h),queue=new Int32Array(w*h),components=[];let label=0;
  for(let start=0;start<labels.length;start++){
   if(labels[start]||pixels[start*4+3]<45)continue;
   label++;let head=0,tail=1,sumx=0,sumy=0,minx=w,miny=h,maxx=0,maxy=0;queue[0]=start;labels[start]=label;
   while(head<tail){const n=queue[head++],x=n%w,y=Math.floor(n/w);sumx+=x;sumy+=y;minx=Math.min(minx,x);maxx=Math.max(maxx,x);miny=Math.min(miny,y);maxy=Math.max(maxy,y);
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy||x+dx<0||x+dx>=w||y+dy<0||y+dy>=h)continue;const k=n+dy*w+dx;if(!labels[k]&&pixels[k*4+3]>=45){labels[k]=label;queue[tail++]=k;}}
   }
   if(tail>400)components.push({label,area:tail,cx:sumx/tail,cy:sumy/tail,minx,miny,maxx,maxy});
  }
  const available=components.sort((a,b)=>b.area-a.area).slice(0,16);if(available.length!==16)throw new Error('A creature atlas does not contain 16 complete silhouettes.');
  return Array.from({length:16},(_,cell)=>{
   const px=(cell%4+.5)*w/4,py=(Math.floor(cell/4)+.5)*h/4;
   const rank=o=>((o.cx-px)/(w/4))**2+((o.cy-py)/(h/4))**2;
   available.sort((a,b)=>rank(a)-rank(b));const part=available.shift();
   const left=Math.max(0,part.minx-2),top=Math.max(0,part.miny-2),right=Math.min(w-1,part.maxx+2),bottom=Math.min(h-1,part.maxy+2);
   const out=document.createElement('canvas');out.width=right-left+3;out.height=bottom-top+3;const oc=out.getContext('2d'),data=oc.createImageData(out.width,out.height);
   for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++){
    const n=y*w+x;let include=labels[n]===part.label;
    if(!include&&pixels[n*4+3]>0&&pixels[n*4+3]<45){for(let dy=-2;dy<=2&&!include;dy++)for(let dx=-2;dx<=2;dx++){if(x+dx>=0&&x+dx<w&&y+dy>=0&&y+dy<h&&labels[n+dy*w+dx]===part.label){include=true;break;}}}
    if(include){const dst=((y-top+1)*out.width+x-left+1)*4;data.data.set(pixels.subarray(n*4,n*4+4),dst);}
   }
   oc.putImageData(data,0,0);return out;
  });
 }
 drawSprite(ctx,species,x,y,width,facing=1,time=0,alpha=1,activity=1){
  const b=this.bounds[species.index];let im=this.sprites[species.index];if(!b||!im)return;
  if(species.id==='custom'&&species.color){const key=species.index+species.color;if(!this.customCache.has(key)){const tint=document.createElement('canvas');tint.width=im.width;tint.height=im.height;const tc=tint.getContext('2d');tc.drawImage(im,0,0);tc.globalCompositeOperation='source-atop';tc.globalAlpha=.6;tc.fillStyle=species.color;tc.fillRect(0,0,tint.width,tint.height);this.customCache.set(key,tint);}im=this.customCache.get(key);}
  const h=width*b.h/b.w,kind=motionKind(species);ctx.save();ctx.translate(x,y);ctx.scale(facing,1);ctx.globalAlpha=alpha;
  const animate=!this.reducedMotion&&time>0;
  if(animate&&kind==='seahorse')ctx.rotate(Math.sin(time*1.8)*.028);
  if(animate&&['fish','shark','eel','ray','cuttlefish'].includes(kind)){const strips=28,sw=b.w/strips,dw=width/strips;for(let i=0;i<strips;i++){const m=bodyMotion(kind,i/(strips-1),time,activity),height=h*m.stretch;ctx.drawImage(im,i*sw,0,Math.min(sw+1,b.w-i*sw),b.h,-width/2+i*dw,-height/2+m.offset*width,dw+.6,height);}}
  else ctx.drawImage(im,0,0,b.w,b.h,-width/2,-h/2,width,h);ctx.restore();
 }
 drawCreature(ctx,e,time,dt,alpha=1,width=creatureWidth(e.species)){
  this.poses??=new Map();let pose=this.poses.get(e.id);
  if(!pose){pose={x:e.x,y:e.y,facing:e.facing,activity:.35};this.poses.set(e.id,pose);}
  if(dt>0){const moving=Math.min(1,Math.hypot(e.x-pose.x,e.y-pose.y)/dt/Math.max(1,e.species.speed)),blend=1-Math.exp(-dt*12);pose.activity+=(moving-pose.activity)*blend;pose.facing+=(e.facing-pose.facing)*blend;pose.x=e.x;pose.y=e.y;}
  const facing=this.reducedMotion?e.facing:Math.sign(pose.facing||e.facing)*Math.max(.16,Math.abs(pose.facing));
  this.drawSprite(ctx,e.species,e.x,e.y,width,facing,time,alpha,pose.activity);
 }
 portrait(canvas,species){const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);const b=this.bounds[species.index];if(!b)return;this.drawSprite(ctx,species,canvas.width/2,canvas.height/2,Math.min(canvas.width*.78,canvas.height*.78*b.w/b.h));}
 addEffect(type,x=800,y=350,label=null){this.effects.push({type,x,y,t:0,label});}
 draw(sim,dt,home=false){
  if(home||!sim||(!sim.paused&&sim.phase==='playing'))this.clock+=dt;const c=this.ctx;c.setTransform(this.canvas.width/1600,0,0,this.canvas.height/900,0,0);c.clearRect(0,0,1600,900);
  const reef=home?this.splash:this.reefs[sim?.current??0];if(reef)c.drawImage(reef,0,0,1600,900);else{c.fillStyle='#1b6c7d';c.fillRect(0,0,1600,900);}
  if(!this.ready)return;
  const t=this.clock;
  // Very fine suspended particles, not a screen-obscuring fog or dark night filter.
  if(!this.reducedMotion){c.fillStyle='#f6f5d3';for(let i=0;i<38;i++){const x=(i*137.53+Math.sin(t*.2+i)*18)%1600,y=(i*73.91-t*(2+i%4)+1800)%900;c.globalAlpha=.07+(i%3)*.025;c.beginPath();c.arc(x,y,.7+i%2*.6,0,Math.PI*2);c.fill();}c.globalAlpha=1;}
  if(home){
   const homeFish=[{i:5,x:1330,y:390,w:120,v:-9},{i:7,x:1390,y:705,w:68,v:-8},{i:4,x:310,y:680,w:80,v:7},...[0,1,2,3,4].map(n=>({i:0,x:140+n*48,y:455+n%2*23,w:43,v:12}))];
   for(const f of homeFish){const x=(f.x+(this.reducedMotion?0:t*f.v)+1800)%1800-100;this.drawSprite(c,SPECIES[f.i],x,f.y+Math.sin(t+f.i)*8,f.w,f.v>0?1:-1,t);}
   return;
  }
  if(!sim?.player)return;
  if(this.renderedPlayer!==sim.player){this.poses=new Map();this.renderedPlayer=sim.player;}
  const motionDt=sim.paused||sim.phase!=='playing'?0:dt;
  c.save();c.translate(0,TOP);
  for(const f of sim.section.food){if(f.regrow>0)continue;this.drawFood(c,f,t);}
  for(const e of sim.section.entities.filter(e=>e.alive).sort((a,b)=>a.species.size-b.species.size)){
   this.drawCreature(c,e,t+e.id,motionDt,.98);
   if(e.species.ability==='clean'&&this.inspect)this.tag(c,e.x,e.y-30,'Cleaner');
  }
  const p=sim.player;const puff=p.species.ability==='puff'&&p.abilityTime>0?1.5:1;
  const playerWidth=creatureWidth(p.species)*puff;
  this.drawCreature(c,p,t,motionDt,p.hidden?.25:1,playerWidth);
  // A small player marker is always readable without outlining the entire fish.
  c.fillStyle=p.hidden?'#b9e0bb':'#fff1bd';c.beginPath();c.moveTo(p.x,p.y-playerWidth*.42-10);c.lineTo(p.x-5,p.y-playerWidth*.42-18);c.lineTo(p.x+5,p.y-playerWidth*.42-18);c.fill();
  if(p.abilityTime>0){const a=p.species.ability;c.save();c.globalAlpha=.22;c.fillStyle=['ink','poison'].includes(a)?'#112f3d':'#caedcf';c.strokeStyle='#e0f6b9';c.lineWidth=2;if(['ink','poison'].includes(a)){c.beginPath();c.ellipse(p.x-p.facing*35,p.y,90,48,Math.sin(t)*.2,0,Math.PI*2);c.fill();}else if(a!=='camouflage'){c.beginPath();c.arc(p.x,p.y,p.species.size*.7+12+Math.sin(t*5)*5,0,Math.PI*2);c.stroke();}c.restore();}
  if(p.cleanTime>0)this.tag(c,p.x,p.y-45,'Cleaning…');
  const meal=sim.mealTarget;
  if(meal&&!sim.paused&&sim.phase==='playing'){
   const width=meal.species?creatureWidth(meal.species):meal.size||25;
   c.strokeStyle='#103944';c.lineWidth=4;c.beginPath();c.ellipse(meal.x,meal.y,width*.6+8,width*.4+8,0,0,Math.PI*2);c.stroke();
   c.strokeStyle='#fce5a2';c.lineWidth=1.8;c.stroke();
   this.tag(c,meal.x,Math.max(30,meal.y-width*.4-24),meal.name||meal.species.name);
  }
  if(this.inspect){for(const s of REEFS[sim.current].shelters){c.setLineDash([5,6]);c.strokeStyle='#e2efbba6';c.lineWidth=2;c.beginPath();c.ellipse(s.x,s.y,s.r,s.r*.5,0,0,Math.PI*2);c.stroke();c.setLineDash([]);this.tag(c,s.x,s.y-s.r*.5-10,'Shelter');}}
  if(this.hover){const h=this.hover,sz=h.species?creatureWidth(h.species):h.size||25;c.strokeStyle='#fce5a2';c.lineWidth=1.6;c.setLineDash([3,5]);c.beginPath();c.ellipse(h.x,h.y,sz*.6+8,sz*.4+8,0,0,Math.PI*2);c.stroke();c.setLineDash([]);this.tag(c,h.x,Math.max(30,h.y-sz*.4-22),h.name||h.species?.name||'');}
  for(const e of this.effects){if(!sim.paused)e.t+=dt;if(e.type==='eat'){this.tag(c,e.x,e.y-28-(this.reducedMotion?0:e.t*20),e.label||'Meal taken',Math.min(1,(2.2-e.t)/1.2));}else if(e.type==='hurt'){c.fillStyle=`rgba(209,70,47,${Math.max(0,.13-e.t*.3)})`;c.fillRect(0,-TOP,1600,900);}else{c.strokeStyle=`rgba(234,246,221,${Math.max(0,.5-e.t*.5)})`;c.lineWidth=2;c.beginPath();c.arc(e.x,e.y,12+e.t*60,0,Math.PI*2);c.stroke();}}
  this.effects=this.effects.filter(e=>e.t<(e.type==='eat'?2.2:1.4));c.restore();
 }
 tag(c,x,y,text,alpha=1){c.save();c.globalAlpha=Math.max(0,alpha);c.font='15px AtollSans, sans-serif';const w=c.measureText(text).width+22;x=Math.min(1590-w/2,Math.max(w/2+10,x));c.fillStyle='#103944ed';c.beginPath();c.roundRect(x-w/2,y-13,w,27,6);c.fill();c.fillStyle='#fff6da';c.textAlign='center';c.fillText(text,x,y+5);c.restore();}
 drawFood(c,f,t){
  const remaining=Math.max(0,Math.min(1,(f.amount??100)/100)),scale=.6+remaining*.4;
  c.save();c.translate(f.x,f.y);c.scale(scale,scale);c.translate(-f.x,-f.y);
  this.drawFoodBody(c,f,this.reducedMotion?0:t,remaining);c.restore();
 }
 drawFoodBody(c,f,t,remaining){
  const cell={algae:0,grass:1,coral:2,sponge:3,worm:4,shrimp:5}[f.food];
  if(cell!==undefined&&this.foodSprites[cell]){const sprite=this.foodSprites[cell],height=f.food==='grass'?68:f.food==='worm'?15:f.food==='shrimp'?21:44,width=height*sprite.width/sprite.height;c.save();c.translate(f.x,f.y);if(!this.reducedMotion&&['algae','grass'].includes(f.food))c.rotate(Math.sin(t*.65+f.phase)*.035);c.drawImage(sprite,-width/2,-height/2,width,height);c.restore();return;}
  c.save();c.translate(f.x,f.y);const s=f.size;c.lineCap='round';
  if(f.food==='plankton'){c.fillStyle='#f2e8b4';for(let i=0;i<Math.max(1,Math.ceil(remaining*9));i++){const a=i*2.4+t*.12;c.globalAlpha=.45+i%3*.14;c.beginPath();c.arc(Math.cos(a)*s*.8,Math.sin(a*1.1)*s*.65,1.4+i%2,0,Math.PI*2);c.fill();}}
  else if(['algae','grass'].includes(f.food)){for(let i=0;i<7;i++){c.strokeStyle=i%2?'#779b42':'#b1c971';c.lineWidth=2.5;c.beginPath();c.moveTo((i-3)*4,12);c.quadraticCurveTo((i-3)*7+Math.sin(t*.5+i)*3,-s*.4,(i-3)*4,-s);c.stroke();}}
  else if(f.food==='coral'){c.strokeStyle='#df836a';c.lineWidth=3;for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(0,12);c.lineTo(i*7,-10);c.lineTo(i*9,-s);c.moveTo(i*7,-10);c.lineTo(i*12,-s*.6);c.stroke();}}
  else if(f.food==='sponge'){for(let i=-1;i<=1;i++){c.fillStyle=i===0?'#b87baf':'#926d9e';c.beginPath();c.ellipse(i*9,-i*i*4,8,22-i*i*4,-i*.1,0,Math.PI*2);c.fill();c.fillStyle='#624561';c.beginPath();c.ellipse(i*9,-19-i*i,5,3,0,0,Math.PI*2);c.fill();}}
  else if(f.food==='worm'){c.strokeStyle='#dca478';c.lineWidth=4;c.beginPath();c.moveTo(-14,3);c.bezierCurveTo(-7,-8,2,9,15,-4);c.stroke();}
  else if(f.food==='shrimp'){this.drawSprite(c,SPECIES[45],0,0,30,1,t);}
  c.restore();
 }
}
