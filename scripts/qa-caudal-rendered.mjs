import {chromium} from '@playwright/test';import fs from 'node:fs';
const out='artifacts/caudal-rendered';fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true});
try{const page=await browser.newPage({viewport:{width:1400,height:900},recordVideo:{dir:out,size:{width:1400,height:900}}});await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.atoll?.renderer.ready);
const report=await page.evaluate(async()=>{
 const old=await import('/artifacts/caudal-baseline/src/part-motion.js'),next=await import('/src/part-motion.js'),{SPECIES}=await import('/src/data.js'),{creatureWidth}=await import('/src/geometry.js'),r=window.atoll.renderer,results=[];
 const c=document.createElement('canvas');c.width=700;c.height=500;const ctx=c.getContext('2d');
 for(const id of ['s42','s32','s35','s11','s43','s54','s23','s6'])for(const [label,module] of [['before',old],['after',next]]){
  const parts=new module.PaintedParts(),s=SPECIES[Number(id.slice(1))],im=r.sprites[s.index],tail=parts.prepare(im,id).pieces.find(p=>p.name==='tail'),data=tail.canvas.getContext('2d').getImageData(0,0,tail.canvas.width,tail.canvas.height).data,opaque=[];
  for(let y=0;y<tail.canvas.height;y++)for(let x=0;x<tail.canvas.width;x++)if(data[(y*tail.canvas.width+x)*4+3]>200)opaque.push([x,y]);
  const minX=Math.min(...opaque.map(p=>p[0])),distal=opaque.filter(p=>p[0]<minX+Math.max(2,tail.canvas.width*.08)),landmark=distal.reduce((a,p)=>[a[0]+p[0]/distal.length,a[1]+p[1]/distal.length],[0,0]);
  const original=ctx.drawImage.bind(ctx);let sample;ctx.drawImage=(image,...args)=>{if(image===tail.canvas){const [dx,dy,dw,dh]=args,m=ctx.getTransform(),x=dx+landmark[0]/tail.canvas.width*dw,y=dy+landmark[1]/tail.canvas.height*dh;sample={x:m.a*x+m.c*y+m.e,y:m.b*x+m.d*y+m.f};}return original(image,...args);};
  for(const effort of [.15,.5,1]){const points=[];for(let i=0;i<120;i++){ctx.clearRect(0,0,700,500);ctx.save();ctx.translate(350,250);parts.draw(ctx,im,id,300,300*im.height/im.width,i/120/module.PART_RIGS[id].frequency,effort);ctx.restore();points.push(sample);}const span=k=>Math.max(...points.map(p=>p[k]))-Math.min(...points.map(p=>p[k]));results.push({id,name:s.name,label,effort,opaqueDistalPixels:distal.length,verticalPercent:span('y')/3,verticalGameplayPixels:span('y')/300*creatureWidth(s),horizontalPercent:span('x')/3});}
  ctx.drawImage=original;
 }
 return {method:'Actual canvas draw transforms track the centroid of opaque pixels in the distal 8% of the painted tail. Same artwork, width and phase sweep; translations and whole-body pitch excluded.',results};
});fs.writeFileSync(out+'/measurements.json',JSON.stringify(report,null,2));
await page.evaluate(async()=>{
 const {PaintedParts:Old}=await import('/artifacts/caudal-baseline/src/part-motion.js'),{ArticulatedSprites:OldMesh}=await import('/artifacts/caudal-baseline/src/articulated-motion.js'),{SPECIES}=await import('/src/data.js'),r=window.atoll.renderer,old=new Old(),mesh=new OldMesh();
 document.body.innerHTML='<canvas id="comparison" width="1400" height="900" style="width:100vw;height:100vh"></canvas>';const c=document.querySelector('#comparison'),ctx=c.getContext('2d');window.compareId=0;window.comparePaused=false;let start=performance.now();
 const sets=[[32,42,43],[6,23,54],[19,19,19]];function draw(now){ctx.fillStyle='#11343e';ctx.fillRect(0,0,1400,900);ctx.fillStyle='#f4f0df';ctx.font='24px sans-serif';ctx.fillText('Previous game cycle',170,40);ctx.fillText('Corrected cycle',890,40);const t=(now-start)/1000;
 for(const [j,id] of sets[window.compareId].entries()){const s=SPECIES[id],im=r.sprites[id],y=180+j*275,width=window.compareId===2?[260,130,85][j]:[300,140,85][j],effort=.65;ctx.font='18px sans-serif';ctx.fillText(s.name+(window.compareId===2?' · '+width+' px':''),30,y-85);for(const x of [350,1050]){ctx.strokeStyle='#44616a';ctx.beginPath();ctx.moveTo(x-width*.7,y);ctx.lineTo(x+width*.7,y);ctx.stroke();ctx.save();ctx.translate(x,y);if(x===350){if(id===19){mesh.beginFrame(Infinity);mesh.draw(ctx,im,s,width,width*im.height/im.width,t+.001,effort);}else old.draw(ctx,im,s.id,width,width*im.height/im.width,t,effort);}else{r.articulation?.beginFrame(Infinity);r.drawSprite(ctx,s,0,0,width,1,t+.001,1,effort);}ctx.restore();}}
 requestAnimationFrame(draw);
 }requestAnimationFrame(draw);
});
for(let i=0;i<3;i++){await page.evaluate(i=>window.compareId=i,i);await page.waitForTimeout(8000);await page.screenshot({path:out+'/comparison-'+i+'.png'});}
const video=page.video();await page.close();await video.saveAs(out+'/comparison.webm');console.log(JSON.stringify({measurements:report.results.length,errors:[],video:out+'/comparison.webm'}));
}finally{await browser.close();}
