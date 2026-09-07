// One batched capture of all catalog animals plus ordinary populated scenes.
// The report is evidence for review; it never marks an animal visually accepted.
import {chromium} from '@playwright/test';import fs from 'node:fs';
import {clickButton} from './ui-actions.mjs';
fs.mkdirSync('artifacts/roster-motion',{recursive:true});
const browser=await chromium.launch({headless:true}),report={environment:'Headless Chromium on local Windows host',scenes:[],errors:[]};
for(const viewport of [{width:1600,height:900},{width:1024,height:768}]){
 const page=await browser.newPage({viewport,recordVideo:{dir:'artifacts/roster-motion/video',size:viewport}});page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:/Practice Choose/});await clickButton(page,{name:'Enter the reef'});
 for(const [id,section] of [['s1',4],['s34',2],['s53',5],['s1',6]]){
  await page.evaluate(({id,section})=>{const s=window.atoll.simulation,r=window.atoll.renderer;s.start('practice',id);s.current=section;s.protected=true;r.articulation?.cache.clear();if(r.articulation)r.articulation.pixels=0;window.upliftSamples=[];if(!r.originalDraw){r.originalDraw=r.draw;r.draw=function(...args){const before=performance.now();this.originalDraw(...args);window.upliftSamples.push({draw:performance.now()-before,dt:args[1]*1000});};}},{id,section});
  await page.waitForTimeout(4500);
  const result=await page.evaluate(()=>{const r=window.atoll.renderer,s=window.atoll.simulation,samples=window.upliftSamples;const values=samples.slice(30).map(x=>x.draw).sort((a,b)=>a-b),frame=samples.slice(30).map(x=>x.dt).sort((a,b)=>a-b);return {frames:samples.length,p50DrawMs:values[Math.floor(values.length*.5)],p95DrawMs:values[Math.floor(values.length*.95)],p99DrawMs:values[Math.floor(values.length*.99)],p95FrameMs:frame[Math.floor(frame.length*.95)],cache:{frames:r.articulation.cache.size,pixels:r.articulation.pixels,hits:r.articulation.hits,misses:r.articulation.misses},animals:s.section.entities.length};});
  report.scenes.push({viewport,id,section,...result});await page.screenshot({path:`artifacts/roster-motion/scene-${viewport.width}-${id}-${section}.png`});
 }
 if(viewport.width===1600){
  await page.evaluate(async()=>{window.atoll.simulation.paused=true;const {SPECIES}=await import('/src/data.js');const {creatureWidth}=await import('/src/geometry.js');const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=900;canvas.style='position:fixed;inset:0;width:100%;height:100%;z-index:9999;background:#f4f0df';document.body.append(canvas);const c=canvas.getContext('2d');window.reviewBatch=0;window.reviewStarted=performance.now();let before=performance.now();
   function draw(now){const time=(now-window.reviewStarted)/1000,dt=Math.min(.05,(now-before)/1000);before=now;c.fillStyle='#f4f0df';c.fillRect(0,0,1600,900);c.fillStyle='#163c43';c.font='24px sans-serif';c.fillText('Whole-roster rig review · '+(window.reviewBatch+1)+'/8 · provisional',30,40);c.font='15px sans-serif';c.fillText('Large and thumbnail sizes · isolated deformation · both facings',30,68);
    window.atoll.renderer.articulation?.beginFrame(Infinity);
    for(let i=0;i<8;i++){const s=SPECIES[window.reviewBatch*8+i],x=200+i%4*400,y=260+Math.floor(i/4)*410,r=window.atoll.renderer,b=r.bounds[s.index],w=Math.min(290,220*b.w/b.h),phase=time%6,activity=phase<2?.8:phase<4?.05:.25,feed=phase>4?Math.sin((phase-4)*Math.PI):0,facing=time<3?1:-1;
     r.drawSprite(c,s,x,y-35,w,facing,time+.01,1,activity,null,{feed:Math.max(0,feed)});r.drawSprite(c,s,x,y+150,Math.min(170,creatureWidth(s)),facing,time+.01,1,activity,null,{feed:Math.max(0,feed)});c.fillStyle='#163c43';c.font='17px sans-serif';c.textAlign='center';c.fillText(s.id+' '+s.name,x,y+215);c.textAlign='left';}
    window.reviewAnimation=requestAnimationFrame(draw);
   }window.reviewAnimation=requestAnimationFrame(draw);
  });
  for(let batch=0;batch<8;batch++){
   await page.evaluate(batch=>{window.reviewBatch=batch;window.reviewStarted=performance.now();},batch);await page.waitForTimeout(1500);await page.screenshot({path:`artifacts/roster-motion/gallery-${batch}-right.png`});await page.waitForTimeout(4000);await page.screenshot({path:`artifacts/roster-motion/gallery-${batch}-left-feed.png`});
  }
 }
 const video=page.video();await page.close();await video.saveAs(`artifacts/roster-motion/review-${viewport.width}.webm`);
}
await browser.close();fs.writeFileSync('artifacts/roster-motion/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(report.errors.length)process.exitCode=1;
