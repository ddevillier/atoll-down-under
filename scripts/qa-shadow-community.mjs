import fs from 'node:fs';import {chromium} from '@playwright/test';import {clickButton} from './ui-actions.mjs';
const out='artifacts/trumpet-shadow',browser=await chromium.launch(),results=[],errors=[];
try{
 for(const [width,height] of [[1600,900],[1024,768]]){
  const page=await browser.newPage({viewport:{width,height}});page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.atoll?.renderer.ready);
  await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill('Longfin batfish');await page.getByRole('option').first().click();await clickButton(page,{name:'Enter the reef'});await page.keyboard.press('Escape');
  // Let the real-time welcome toast finish before the accelerated observation.
  await page.waitForTimeout(4500);
  await page.evaluate(async()=>{const {Simulation}=await import('/src/simulation.js'),s=new Simulation(19);s.start('practice','s40');Object.assign(window.atoll.simulation,s);window.atoll.simulation.paused=true;window.atoll.renderer.poses.clear();});
  for(const seconds of [12,20,26]){
   const result=await page.evaluate(seconds=>{const s=window.atoll.simulation,r=window.atoll.renderer;s.paused=false;while(s.time<seconds){s.step(1/60);r.draw(s,1/60);}s.paused=true;r.draw(s,0);const e=s.section.entities.find(e=>e.species.id==='s41'),host=s.section.entities.find(h=>h.id===e.ecology?.host);return {time:s.time,guest:{id:e.id,x:e.x,y:e.y,activity:e.activity,host:e.ecology?.host},host:host?{id:host.id,name:host.species.name,x:host.x,y:host.y,vx:host.vx,vy:host.vy}:null,count:s.section.entities.length};},seconds);
   await page.screenshot({path:`${out}/community-${seconds}-${width}.png`});results.push({width,...result});
  }
  await page.close();
 }
 fs.writeFileSync(out+'/community-report.json',JSON.stringify({seed:19,scope:'Generated community selected from seeds 1–40 because an NPC trumpetfish naturally acquired an NPC host. No entity, food or position replacements. Deterministic simulation/renderer advance to snapshots after ordinary Practice menu entry.',results,errors},null,2));console.log(JSON.stringify({results,errors}));
}finally{await browser.close();}
