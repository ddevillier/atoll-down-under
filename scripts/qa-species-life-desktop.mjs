import {_electron as electron,expect} from '@playwright/test';import fs from 'node:fs';import {clickButton} from './ui-actions.mjs';
const executablePath=process.argv[2],app=await electron.launch({...(executablePath?{executablePath}:{args:['.']}),env:{...process.env,ATOLL_QA:'1'}});
try{
 const profile=await app.evaluate(({app})=>app.getPath('userData'));expect(profile).toMatch(/atoll-qa-/);const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill('Bluestreak cleaner wrasse');await page.getByRole('option').click();await clickButton(page,{name:'Try adventure',exact:true});await page.keyboard.press('Escape');
 const report=await page.evaluate(async()=>{
  const module=path=>import(new URL('src/'+path,location.href).href),{Simulation}=await module('simulation.js'),{canHelp,requestPlayerService}=await module('player-cleaner.js'),{exportDive,importDive}=await module('save-files.js'),{PRACTICE_SPECIES,SPECIES}=await module('data.js'),{ADVENTURES,JOURNEYS}=await module('adventures.js');const roles=[];
  for(const id of ['s43','s45']){
   const s=new Simulation(42);s.start('practice',id);const count=s.section.entities.length;
   for(let n=0;n<3;n++){const c=s.section.entities.filter(e=>canHelp(e)&&!s.adventure.clients?.includes(e.species.id)).sort((a,b)=>Math.hypot(a.x-s.player.x,a.y-s.player.y)-Math.hypot(b.x-s.player.x,b.y-s.player.y))[0];if(!c||!requestPlayerService(s,c))throw Error('Missing cleaning opportunity');for(let i=0;i<3600&&s.player.service;i++)s.step(1/60);}
   s.step(1/60);const restored=importDive(exportDive(s,'Packaged cleaner')).simulation;if(!restored.adventure.complete||restored.adventure.clients.length!==3||s.section.entities.length!==count)throw Error('Packaged cleaner discovery failed');roles.push({id,clients:restored.adventure.clients,complete:restored.adventure.complete,population:count});
  }
  return {practice:PRACTICE_SPECIES.length,adventures:Object.keys(ADVENTURES).length,journeys:Object.keys(JOURNEYS).length,allRoles:SPECIES.every(s=>!!JOURNEYS[s.id]),allPlayable:PRACTICE_SPECIES.every(s=>!!ADVENTURES[s.id]),roles};
 });expect(report.practice).toBe(57);expect(report.adventures).toBe(57);expect(report.journeys).toBe(64);expect(report.allRoles).toBe(true);expect(report.allPlayable).toBe(true);
 // Position only the player as a fixture; keep the generated reef intact.
 const site=await page.evaluate(async()=>{const {Simulation}=await import(new URL('src/simulation.js',location.href).href),{sitesFor}=await import(new URL('src/adventures.js',location.href).href),s=new Simulation(42);s.start('practice','s54');const site=sitesFor(s)[1];Object.assign(s.player,{x:site.x,y:site.y});s.point(site.x,site.y);s.paused=true;s.adventure.visible=true;Object.assign(window.atoll.simulation,s);return site;});
 await page.keyboard.press('Escape');await page.keyboard.press('e');await page.waitForFunction(()=>window.atoll.simulation.player.ambush?.settled>=2,null,{timeout:30000});
 const box=await page.locator('#reef').boundingBox();await page.mouse.move(box.x+(site.x-80)/1600*box.width,box.y+(site.y+55)/900*box.height);expect(await page.evaluate(()=>!!window.atoll.simulation.player.ambush?.aim)).toBe(true);await page.keyboard.press('Escape');
 const checkpoint=await page.evaluate(async()=>{const {exportDive,importDive}=await import(new URL('src/save-files.js',location.href).href),s=window.atoll.simulation,r=importDive(exportDive(s,'Packaged ambush')).simulation,before=r.serialize();r.step(3);return {paused:r.paused,frozen:r.serialize()===before,settled:r.player.ambush.settled,aim:!!r.player.ambush.aim};});expect(checkpoint).toMatchObject({paused:true,frozen:true,settled:2,aim:true});
 await page.keyboard.press('Escape');await page.keyboard.press('e');expect(await page.evaluate(()=>window.atoll.simulation.player.ambush)).toBeNull();expect(errors).toEqual([]);
 const result={surface:executablePath?'packaged Windows':'source Electron',isolatedProfile:true,...report,ambushKeyboardAndAim:true,checkpoint,errors};fs.writeFileSync('artifacts/native-species-life-report.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await app.close();}
