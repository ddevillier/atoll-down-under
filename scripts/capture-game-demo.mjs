import {chromium} from '@playwright/test';
import fs from 'node:fs';
import {clickButton} from './ui-actions.mjs';
const out='artifacts/video-demo';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--disable-background-timer-throttling','--disable-renderer-backgrounding']});
const reports=fs.existsSync(out+'/capture.json')?JSON.parse(fs.readFileSync(out+'/capture.json','utf8')):[];
async function shot(name,species,action,seconds){
 if(reports.some(r=>r.name===name))return;
 const context=await browser.newContext({viewport:{width:1920,height:1080},recordVideo:{dir:out,size:{width:1920,height:1080}}});
 const start=Date.now(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 if(species){await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill(species);await page.getByRole('option',{name:new RegExp('^'+species)}).click();await clickButton(page,{name:'Show goal',exact:true});}
 await page.waitForTimeout(1000);const begin=(Date.now()-start)/1000;
 const box=await page.locator('#reef').boundingBox(),move=async(p,click=false)=>{const x=box.x+p.x/1600*box.width,y=box.y+(p.y+55)/900*box.height;await page.mouse[click?'click':'move'](x,y);};
 console.log('Capturing '+name);const t=Date.now();await action(page,move);await page.waitForTimeout(Math.max(0,seconds*1000-(Date.now()-t)));
 await page.screenshot({path:out+'/'+name+'.png'});const duration=(Date.now()-t)/1000;
 const state=await page.evaluate(()=>{const s=window.atoll.simulation;return s?{species:s.player?.species.id,reef:s.current,phase:s.phase,energy:s.player?.energy,adventure:s.adventure}:null;});
 const video=page.video();await context.close();const file=out+'/'+name+'.webm';await video.saveAs(file);reports.push({name,file,begin,duration,errors,state});fs.writeFileSync(out+'/capture.json',JSON.stringify(reports,null,2));if(errors.length)throw Error(errors.join(';'));
}
try{
 await shot('01-title',null,async(page)=>{await page.mouse.move(1000,570);await page.waitForTimeout(3000);await page.mouse.move(1300,650);},10);
 await shot('02-cleaner','Bluestreak cleaner wrasse',async(page,move)=>{
  const client=await page.evaluate(async()=>{const {canHelp,parasiteDamage}=await import('/src/player-cleaner.js'),{creatureFrame}=await import('/src/geometry.js'),s=window.atoll.simulation;const c=s.section.entities.filter(e=>canHelp(e)&&parasiteDamage(e)>10).sort((a,b)=>Math.hypot(a.x-s.player.x,a.y-s.player.y)-Math.hypot(b.x-s.player.x,b.y-s.player.y))[0];if(!c)throw Error('No client');return {id:c.id,...creatureFrame(c)};});await move(client,true);await page.waitForFunction(()=>(window.atoll.simulation.adventure.clients?.length||0)>0,null,{timeout:45000});await page.waitForTimeout(4000);await move({x:950,y:420});
 },34);
 await shot('03-sand-search','Blue-spotted stingray',async(page,move)=>{
  for(let i=0;i<2;i++){const f=await page.evaluate(async()=>{const {foragingSites}=await import('/src/foraging-journeys.js');const f=foragingSites(window.atoll.simulation)[0]?.food;if(!f)throw Error('No feeding patch');return {x:f.x,y:f.y};});await move(f,true);await page.waitForFunction(i=>(window.atoll.simulation.adventure.foragingJourney?.meals.length||0)>i,i,{timeout:35000});await page.waitForTimeout(2500);}
 },34);
 await shot('04-cuttlefish','Cuttlefish',async(page,move)=>{
  const p=await page.evaluate(async()=>{const {sitesFor}=await import('/src/adventures.js');return sitesFor(window.atoll.simulation)[0];});await move(p);await page.waitForFunction(p=>Math.hypot(window.atoll.simulation.player.x-p.x,window.atoll.simulation.player.y-p.y)<20,p,{timeout:25000});await page.keyboard.press('e');await page.waitForTimeout(7500);await move({x:1100,y:450});
 },28);
 await shot('05-night','Flashlight fish',async(page,move)=>{
  const p=await page.evaluate(async()=>{const {escortCandidates}=await import('/src/escort-journeys.js');const e=escortCandidates(window.atoll.simulation)[0];return e?{x:e.x,y:e.y}:null;});if(p){await move(p);await page.waitForTimeout(3500);await page.keyboard.press('e');await page.waitForTimeout(7000);await page.keyboard.press('Space');await page.waitForTimeout(5000);}await move({x:1050,y:330});
 },26);
}finally{await browser.close();}
console.log('Capture complete: '+reports.length+' shots');
