import {chromium} from '@playwright/test';
import fs from 'node:fs';
import {clickButton} from './ui-actions.mjs';

const output=process.argv[2]||'artifacts/living-reef/cues';fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch(),errors=[],ordinary=[],fixtures=[];
try{
 for(const [width,height]of [[1600,900],[1024,768]]){
  for(const name of process.argv.includes('--fixtures-only')?[]:['Coral grouper','Blacktip reef shark','Bluestreak cleaner wrasse']){
   const page=await browser.newPage({viewport:{width,height},recordVideo:{dir:output+'/video'}});page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.atoll?.renderer.ready);
   await clickButton(page,{name:/Practice/});await page.getByRole('searchbox').fill(name);await page.getByRole('option').first().click();await clickButton(page,{name:'Enter the reef'});
   const box=await page.locator('#reef').boundingBox();
   await page.mouse.move(box.x+box.width*.72,box.y+box.height*.45);await page.waitForTimeout(1400);
   await page.mouse.move(box.x+box.width*.34,box.y+box.height*.46);await page.waitForTimeout(1400);
   await page.mouse.move(5,5);await page.screenshot({path:`${output}/${name.replaceAll(' ','-')}-${width}.png`});
   ordinary.push({width,name,...await page.evaluate(()=>({labels:window.atoll.renderer.labelLayout.map(l=>l.text),health:window.atoll.simulation.player.health,population:window.atoll.simulation.section.entities.length}))});
   const video=page.video();await page.close();await video.saveAs(`${output}/${name.replaceAll(' ','-')}-${width}.webm`);
  }
  const page=await browser.newPage({viewport:{width,height}});page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.atoll?.renderer.ready);
  await clickButton(page,{name:/Practice/});await page.getByRole('searchbox').fill('Coral grouper');await page.getByRole('option').first().click();await clickButton(page,{name:'Enter the reef'});await page.mouse.move(5,5);
  const result=await page.evaluate(async()=>{
   const {Simulation}=await import('/src/simulation.js'),s=new Simulation(42);s.start('practice','s16');s.paused=true;
   const r=window.atoll.renderer;r.syncScene(s);r.inspect=false;r.hover=null;r.foodHints=false;
   for(const [i,type]of ['eat','clean','reunion','homecoming','notice','release'].entries())r.addEffect(type,410+i*130,230);
   for(const e of r.effects)e.t=.4;r.draw(s,0);
   // Stop the home screen's ordinary paint only for this labelled controlled
   // fixture. Production rendering and the event source remain unchanged.
   const draw=r.draw.bind(r);r.draw=()=>draw(s,0,false);
   return {labels:r.labelLayout.map(l=>l.text),effects:r.effects.map(e=>e.type),scope:'Controlled committed-outcome cue fixture; no gameplay credit'};
  });
  await page.screenshot({path:`${output}/outcome-fixture-${width}.png`});fixtures.push({width,...result});
  await page.evaluate(()=>{window.atoll.renderer.reducedMotion=true;});await page.screenshot({path:`${output}/outcome-reduced-${width}.png`});await page.close();
 }
}finally{await browser.close();}
const prior=process.argv.includes('--fixtures-only')&&fs.existsSync(output+'/report.json')?JSON.parse(fs.readFileSync(output+'/report.json','utf8')):null;
fs.writeFileSync(output+'/report.json',JSON.stringify({scope:'Ordinary menu/mouse-driven gameplay clips; isolated outcome cue fixtures are separately labelled.',ordinary:prior?.ordinary||ordinary,fixtures,errors},null,2));
console.log(JSON.stringify({ordinary:ordinary.length,fixtures:fixtures.length,errors}));if(errors.length)process.exitCode=1;
