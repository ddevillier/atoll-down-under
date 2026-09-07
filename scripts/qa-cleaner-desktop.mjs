import {_electron as electron,expect} from '@playwright/test';
import fs from 'node:fs';
import {clickButton} from './ui-actions.mjs';
const executablePath=process.argv[2];
const app=await electron.launch({...(executablePath?{executablePath}:{args:['.']}),env:{...process.env,ATOLL_QA:'1'}});
try{
 const isolated=await app.evaluate(({app})=>/[\\/]atoll-qa-/.test(app.getPath('userData')));expect(isolated).toBe(true);
 const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.waitForFunction(()=>window.atoll?.renderer.ready);
 const runs=[],queues=[];
 for(const species of ['Neon','Flashlight']){
  await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill(species);await page.getByRole('option').first().click();await clickButton(page,{name:'Enter the reef'});
  await page.keyboard.press('Escape');
  await page.evaluate(()=>{
   const s=window.atoll.simulation,c=s.section.entities.find(e=>e.species.ability==='clean');
   Object.assign(c,{x:800,y:300,station:{x:800,y:300}});s.section.entities=[c];s.section.food=[];
   Object.assign(s.player,{x:800,y:300,angle:0,health:55,biteDamage:15,energy:45,recoveryDelay:60});s.pointer={x:800,y:300};
  });
  await page.getByRole('button',{name:'Visit cleaner',exact:true}).click();
  await page.waitForFunction(()=>window.atoll.simulation.player.cleanTime>.2,null,{timeout:30000});
  await page.keyboard.press('Escape');
  const intermediate=await page.evaluate(()=>window.atoll.simulation.player.health);expect(intermediate).toBeGreaterThan(55);expect(intermediate).toBeLessThan(85);
  await page.screenshot({path:`artifacts/native-cleaner-${species}.png`});await page.keyboard.press('Escape');
  const box=await page.locator('#reef').boundingBox();await page.mouse.move(box.x+box.width*.7,box.y+box.height*.45);
  expect(await page.evaluate(()=>window.atoll.simulation.player.cleanerTarget)).toBeNull();
  await page.keyboard.press('c');await page.waitForFunction(()=>window.atoll.simulation.player.health===85,null,{timeout:45000});
  const result=await page.evaluate(()=>{const s=window.atoll.simulation;return {health:s.player.health,injury:s.player.biteDamage,cleanerAlive:s.section.entities[0].alive,mealTarget:s.player.target};});
  expect(result).toEqual({health:85,injury:15,cleanerAlive:true,mealTarget:null});runs.push({species,intermediate,...result});
  await page.getByRole('button',{name:'Visit cleaner',exact:true}).click();await expect(page.locator('.toast')).toContainText('No parasites');
  await page.evaluate(()=>{
   const s=window.atoll.simulation,c=s.section.entities[0];
   Object.assign(c,{x:800,y:300,station:{x:800,y:300},stun:6});
   Object.assign(s.player,{x:1000,y:400,health:40,biteDamage:0,poisonDamage:0,energy:90,cleanTime:0});
   s.pointer={x:1000,y:400};
   const clients=Array.from({length:3},(_,i)=>({...structuredClone(s.player),id:'queue-'+i,x:835,y:300,health:40,target:c.id,cleanTime:i===0?.5:0,angle:0}));
   s.section.entities=[c,...clients];s.paused=true;
  });
  await page.getByRole('button',{name:'Visit cleaner',exact:true}).click();
  const waiting=await page.evaluate(()=>{
   const s=window.atoll.simulation;for(let i=0;i<240;i++)s.step(1/60);s.paused=true;
   const clients=[s.player,...s.section.entities.slice(1)];
   return {health:s.player.health,minGap:Math.min(...clients.flatMap((a,i)=>clients.slice(i+1).map(b=>Math.hypot(a.x-b.x,a.y-b.y))))};
  });
  expect(waiting.health).toBe(40);expect(waiting.minGap).toBeGreaterThan(40);
  const completed=await page.evaluate(()=>{
   const s=window.atoll.simulation,c=s.section.entities[0];c.stun=0;s.paused=false;
   for(let i=0;i<1800;i++)s.step(1/60);s.paused=true;
   return {health:s.player.health,clients:s.section.entities.slice(1).map(e=>e.health),cleanerAlive:c.alive};
  });
  expect(completed.health).toBe(100);expect(completed.cleanerAlive).toBe(true);expect(completed.clients.every(h=>h>95)).toBe(true);
  queues.push({species,waiting,completed});
  await clickButton(page,{name:'Atoll',exact:true});
 }
 expect(errors).toEqual([]);const report={surface:executablePath?'packaged Windows':'source Electron',isolatedProfile:isolated,runs,queues,errors};
 fs.writeFileSync('artifacts/native-cleaner-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await app.close();}
