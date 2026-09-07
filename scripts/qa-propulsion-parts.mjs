import {chromium} from '@playwright/test';import fs from 'node:fs';
const output=process.argv[2]||'artifacts/propulsion-parts';fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch(),errors=[];
try{
 for(const group of ['sharks','schools','long']){
  const page=await browser.newPage({viewport:{width:1600,height:1450},recordVideo:{dir:output+'/video'}});page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/scripts/motion-preview.html');await page.waitForFunction(()=>window.motionPreview);await page.evaluate(()=>window.motionPreview.setPaused(true));await page.selectOption('#animals',group);await page.selectOption('#size','2.4');
  for(const [name,time] of [['stroke-a',.12],['stroke-b',.55]]){await page.evaluate(t=>window.motionPreview.setTime(t),time);await page.locator('canvas').screenshot({path:output+'/'+group+'-'+name+'.png'});}
  await page.selectOption('#size','1');await page.check('#reef');await page.screenshot({path:output+'/'+group+'-1600.png'});await page.setViewportSize({width:1024,height:1100});await page.screenshot({path:output+'/'+group+'-1024.png'});
  await page.uncheck('#reef');await page.evaluate(()=>{window.motionPreview.setTime(0);window.motionPreview.setPaused(false);});await page.waitForTimeout(10000);await page.close();const video=await page.video().path();fs.copyFileSync(video,output+'/'+group+'-normal-size.webm');console.log(group+' captured');
 }
 fs.writeFileSync(output+'/report.json',JSON.stringify({groups:3,errors},null,2));
}finally{await browser.close();}
