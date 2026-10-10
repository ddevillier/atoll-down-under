import {chromium} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {clickButton} from './ui-actions.mjs';

const output=process.argv[2]||'artifacts/living-reef/care';fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch(),errors=[],results=[],servedSources=new Map(),workspace=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
try{
 for(const name of ['Bluestreak cleaner wrasse','Banded coral shrimp'])for(const [width,height]of [[1600,900],[1024,768]]){
  const page=await browser.newPage({viewport:{width,height},recordVideo:{dir:output+'/video',size:{width,height}}});page.on('pageerror',e=>errors.push(e.message));
  const responses=[];page.on('response',response=>{const url=new URL(response.url()),source=url.pathname;if(source.startsWith('/src/')&&source.endsWith('.js'))responses.push((async()=>{const sha256=digest(await response.body()),prior=servedSources.get(source);if(prior&&prior!==sha256)errors.push('Source changed during capture: '+source);servedSources.set(source,sha256);})());});
  await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:/Practice/});await page.getByRole('searchbox').fill(name);await page.getByRole('option').click();await clickButton(page,{name:'Enter the reef'});await page.keyboard.press('Escape');
  const client=await page.evaluate(async()=>{
   const {canHelp,parasiteDamage}=await import('/src/player-cleaner.js'),{creaturePickFrame}=await import('/src/geometry.js'),s=window.atoll.simulation;
   const client=s.section.entities.filter(e=>canHelp(e)&&parasiteDamage(e)>10).sort((a,b)=>Math.hypot(a.x-s.player.x,a.y-s.player.y)-Math.hypot(b.x-s.player.x,b.y-s.player.y))[0];
   if(!client)throw Error('No generated client needs care');
   return {id:client.id,health:client.health,name:client.species.name,population:s.section.entities.length,...creaturePickFrame(client)};
  });
  const box=await page.locator('#reef').boundingBox();await page.keyboard.press('Escape');await page.mouse.click(box.x+client.x/1600*box.width,box.y+(client.y+55)/900*box.height);
  await page.waitForFunction(id=>window.atoll.simulation.player.service?.client===id,client.id);await page.waitForFunction(()=>window.atoll.simulation.player.service?.elapsed>.5,null,{timeout:35000});await page.keyboard.press('Escape');await page.mouse.move(5,5);
  const working=await page.evaluate(id=>{const s=window.atoll.simulation,r=window.atoll.renderer,c=s.section.entities.find(e=>e.id===id);r.draw(s,0);return {time:s.time,service:structuredClone(s.player.service),clientHealth:c.health,pose:r.cleaningPresentations.get(s.player),cleanerFrame:r.poses.get(s.player.id)?.frame,clientFrame:r.poses.get(c.id)?.frame,canvasBox:r.canvas.getBoundingClientRect().toJSON(),labels:r.labelLayout.map(l=>l.text)};},client.id);
  await page.screenshot({path:`${output}/${name.replaceAll(' ','-')}-${width}-working.png`});
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!window.atoll.simulation.player.service,null,{timeout:15000});await page.mouse.move(5,5);await page.waitForTimeout(400);await page.keyboard.press('Escape');
  const complete=await page.evaluate(id=>{const s=window.atoll.simulation,r=window.atoll.renderer,c=s.section.entities.find(e=>e.id===id);return {clientHealth:c.health,clientAlive:c.alive,clients:s.adventure.clients,population:s.section.entities.length,labels:r.labelLayout.map(l=>l.text),events:r.effects.map(e=>e.type)};},client.id);
  await page.screenshot({path:`${output}/${name.replaceAll(' ','-')}-${width}-complete.png`});
  results.push({name,width,client,working,complete});
  const video=page.video();await page.close();await video.saveAs(`${output}/${name.replaceAll(' ','-')}-${width}.webm`);
  await Promise.all(responses);
 }
}finally{await browser.close();}
const sourceBindings=[...servedSources].sort(([a],[b])=>a.localeCompare(b)).map(([source,sha256])=>{const file=path.join(workspace,source.slice(1)),currentSha256=digest(fs.readFileSync(file));if(sha256!==currentSha256)errors.push('Current source differs from captured source: '+source);return {source,sha256,currentSha256};});
fs.writeFileSync(output+'/report.json',JSON.stringify({scope:'Ordinary menus, live generated clients, mouse-selected treatment, inspection pause/resume and completion. No animals, health or rewards are replaced.',sourceBindings,results,errors},null,2));
console.log(JSON.stringify({results:results.length,errors}));if(errors.length||results.some(r=>r.complete.clientHealth<=r.client.health+9||!r.complete.clientAlive))process.exitCode=1;
