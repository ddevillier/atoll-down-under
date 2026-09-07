import {chromium} from '@playwright/test';import fs from 'node:fs';import {clickButton} from './ui-actions.mjs';
const output=process.argv[2]||'artifacts/turn-motion';fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch(),errors=[];
const page=await browser.newPage({viewport:{width:1600,height:900},recordVideo:{dir:output+'/video'}});page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.atoll?.renderer.ready);
await page.evaluate(async()=>{
 const {SPECIES}=await import('/src/data.js'),{turnDuration}=await import('/src/turn-motion.js'),r=window.atoll.renderer;
 const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=900;canvas.style='position:fixed;inset:0;width:100%;height:100%;z-index:10000';document.body.append(canvas);const c=canvas.getContext('2d');
 window.turnReview={batch:0,started:performance.now(),paused:false};let last=performance.now();
 function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;const review=window.turnReview,t=(now-review.started)/1000%3;
  c.fillStyle='#123e47';c.fillRect(0,0,1600,900);c.fillStyle='#f1efda';c.font='23px sans-serif';c.fillText('Turn review · '+(review.batch+1)+'/8 · controlled side-view illustration',24,40);
  r.articulation?.beginFrame(Infinity);
  for(let cell=0;cell<8;cell++){const s=SPECIES[review.batch*8+cell],x=200+cell%4*400,y=235+Math.floor(cell/4)*410,b=r.bounds[s.index],width=Math.min(300,200*b.w/b.h),facing=t<.5||t>2?1:-1;
   const e={id:'review-'+s.id,species:s,x,y,angle:facing===1?-.6:2.3,facing};
   if(['s46','s47','s60','s61','s62','s63'].includes(s.id))e.groundRoute=[[0,0],[1600,0]];
   if(s.id==='s44')e.holdfast={x,y};
   r.drawCreature(c,e,t+1,review.paused?0:dt,1,width);c.fillStyle='#f1efda';c.textAlign='center';c.font='17px sans-serif';c.fillText(s.id+' '+s.name,x,y+130);c.font='13px sans-serif';c.fillText(e.groundRoute||e.holdfast?'Ground / attachment preserved':Math.round(turnDuration(s)*1000)+' ms turn',x,y+153);c.textAlign='left';
  }
  requestAnimationFrame(frame);
 }requestAnimationFrame(frame);
});
for(let batch=0;batch<8;batch++){
 await page.evaluate(batch=>{window.turnReview.batch=batch;window.turnReview.started=performance.now();window.atoll.renderer.poses?.clear();},batch);
 await page.waitForTimeout(670);
 await page.evaluate(()=>{window.turnReview.paused=true;for(const p of window.atoll.renderer.poses.values())p.yaw=.02;});
 await page.screenshot({path:`${output}/turn-${batch}.png`});await page.evaluate(()=>{window.turnReview.paused=false;});await page.waitForTimeout(2500);
}
const video=page.video();await page.close();await video.saveAs(output+'/roster-turns.webm');
for(const viewport of [{width:1600,height:900},{width:1024,height:768}]){
 const p=await browser.newPage({viewport,recordVideo:{dir:output+'/video'}});p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4173');await p.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(p,{name:/Practice Choose/});await p.getByRole('searchbox').fill('Blacktip reef shark');await p.getByRole('option').first().click();await clickButton(p,{name:'Enter the reef'});
 const box=await p.locator('#reef').boundingBox();await p.mouse.move(box.x+box.width*.8,box.y+box.height*.4);await p.waitForTimeout(1000);await p.mouse.move(box.x+box.width*.2,box.y+box.height*.4);await p.waitForTimeout(1800);await p.keyboard.press('Escape');await p.screenshot({path:`${output}/ordinary-shark-${viewport.width}.png`});const v=p.video();await p.close();await v.saveAs(output+'/ordinary-shark-'+viewport.width+'.webm');
}
await browser.close();fs.writeFileSync(output+'/report.json',JSON.stringify({species:64,errors,scope:'Recorded full pose turns in a controlled gallery; ordinary mouse-driven shark movement at both desktop sizes.'},null,2));console.log(JSON.stringify({species:64,errors}));if(errors.length)process.exitCode=1;
