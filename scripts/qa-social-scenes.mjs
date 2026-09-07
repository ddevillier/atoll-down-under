import {chromium} from '@playwright/test';import fs from 'node:fs';import {clickButton} from './ui-actions.mjs';
const output=process.argv[2]||'artifacts/social-scenes';fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch(),results=[],errors=[];
for(const species of ['Yellowtail fusilier','Foxface rabbitfish','Orange-spotted filefish','Flashlight fish'])for(const viewport of [{width:1600,height:900},{width:1024,height:768}]){
 const page=await browser.newPage({viewport,recordVideo:{dir:output+'/video'}});page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill(species);await page.getByRole('option').first().click();await clickButton(page,{name:'Enter the reef'});
 const initial=await page.evaluate(()=>{const s=window.atoll.simulation,id=s.player.species.id;
  // Choose a naturally generated habitat with companions. Its population,
  // positions and food remain intact; selection is a harness shortcut.
  const ranked=s.sections.map((r,i)=>({i,count:r.entities.filter(e=>e.species.id===id).length})).sort((a,b)=>b.count-a.count);s.current=ranked[0].i;s.protected=true;
  return {reef:s.current,count:s.section.entities.length,sameSpecies:ranked[0].count,id};
 });
 const box=await page.locator('#reef').boundingBox();await page.mouse.move(box.x+box.width*.82,box.y+box.height*.30);await page.waitForTimeout(8000);
 await page.keyboard.press('Escape');const stem=species.replaceAll(' ','-')+'-'+viewport.width;await page.screenshot({path:output+'/'+stem+'.png'});
 const observations=await page.evaluate(()=>{const s=window.atoll.simulation;return s.section.entities.filter(e=>e.alive&&e.species.id===s.player.species.id).map(e=>({id:e.id,x:e.x,y:e.y,activity:e.activity,behavior:e.behavior,partner:e.ecology?.partner,target:e.target}));});
 results.push({species,...viewport,...initial,observations});const video=page.video();await page.close();await video.saveAs(output+'/'+stem+'.webm');
}
await browser.close();fs.writeFileSync(output+'/report.json',JSON.stringify({scope:'Ordinary generated communities; harness selects an existing habitat; mouse movement and Escape use normal UI; protection enabled.',results,errors},null,2));console.log(JSON.stringify({scenes:results.length,errors,companions:results.map(r=>({species:r.species,width:r.width,count:r.sameSpecies,paired:r.observations.filter(e=>e.partner!=null).length,schooling:r.observations.filter(e=>e.activity==='schooling').length}))}));if(errors.length)process.exitCode=1;
