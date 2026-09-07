import {chromium} from '@playwright/test';import fs from 'node:fs';
const output=process.argv[2]||'artifacts/propulsion-parts';fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch(),errors=[];
try{
 const groups=process.argv.find(a=>a.startsWith('--groups='))?.slice(9).split(',')||['sharks','schools','long'];
 for(const group of groups){
  const page=await browser.newPage({viewport:{width:1600,height:1450},recordVideo:{dir:output+'/video'}});page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/scripts/motion-preview.html');await page.waitForFunction(()=>window.motionPreview);await page.evaluate(()=>window.motionPreview.setPaused(true));await page.selectOption('#animals',group);await page.selectOption('#size','2.4');
  const phases=['hover','grazers','wrasses'].includes(group)?[['stroke-a',.12],['stroke-b',.28],['hover-a',5.12],['hover-b',5.28]]:[['stroke-a',.12],['stroke-b',.55]];
  for(const [name,time] of phases){await page.evaluate(t=>window.motionPreview.setTime(t),time);await page.locator('canvas').screenshot({path:output+'/'+group+'-'+name+'.png'});}
  await page.selectOption('#size','1');await page.check('#reef');await page.screenshot({path:output+'/'+group+'-1600.png'});await page.setViewportSize({width:1024,height:1100});await page.screenshot({path:output+'/'+group+'-1024.png'});
  await page.uncheck('#reef');await page.evaluate(()=>{window.motionPreview.setTime(0);window.motionPreview.setPaused(false);});await page.waitForTimeout(10000);await page.close();const video=await page.video().path();fs.copyFileSync(video,output+'/'+group+'-normal-size.webm');console.log(group+' captured');
 }
 fs.writeFileSync(output+'/report.json',JSON.stringify({groups:groups.length,errors},null,2));
}finally{await browser.close();}
