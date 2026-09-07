import {chromium} from '@playwright/test';import fs from 'node:fs';import {clickButton} from './ui-actions.mjs';
const out=process.argv[2]||'artifacts/world-readability';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch(),errors=[],results=[];
const names=process.argv.find(a=>a.startsWith('--species='))?.slice(10).split(',')||['Orange coral goby','Needlefish','Blacktip reef shark','Longfin batfish'];
const save=()=>fs.writeFileSync(out+'/report.json',JSON.stringify({scope:'Ordinary Practice menu entry, mouse movement/reversal and inspection pause. Populations and player positions are not replaced.',results,errors},null,2));
try{
 for(const name of names)for(const [width,height] of [[1600,900],[1024,768]]){
  const page=await browser.newPage({viewport:{width,height}});page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.atoll?.renderer.ready);
  await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill(name);await page.getByRole('option').first().click();await clickButton(page,{name:'Enter the reef'});
  const box=await page.locator('#reef').boundingBox();await page.mouse.move(box.x+box.width*.72,box.y+box.height*.48);await page.waitForTimeout(1200);await page.mouse.move(box.x+box.width*.42,box.y+box.height*.46);await page.waitForTimeout(1500);
  await page.keyboard.press('Escape');await page.waitForTimeout(200);
  const result=await page.evaluate(()=>{const s=window.atoll.simulation,r=window.atoll.renderer;return {id:s.player.species.id,marker:r.playerMarker,labels:r.labelLayout,unit:r.uiUnit,population:s.section.entities.length};});
  await page.screenshot({path:`${out}/${result.id}-${width}.png`});results.push({name,width,...result});save();await page.close();
 }
 save();
 console.log(JSON.stringify({scenes:results.length,errors}));if(errors.length)process.exitCode=1;
}finally{await browser.close();}
