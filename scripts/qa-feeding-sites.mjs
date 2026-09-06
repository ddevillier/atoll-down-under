import {chromium} from '@playwright/test';
import fs from 'node:fs';
import {REEFS} from '../src/data.js';
import {clickButton} from './ui-actions.mjs';

fs.mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.atoll?.renderer.ready);
await clickButton(page,{name:/Practice Choose/});await clickButton(page,{name:'Enter the reef'});
await page.evaluate(()=>{document.querySelector('#ui').style.visibility='hidden';window.atoll.renderer.reducedMotion=true;});
const focus=['algae','coral','plankton','sponge','coral','sponge','grass','worm','sponge'],report=[];
for(const reef of REEFS){
 report.push(await page.evaluate(({id,food})=>{
  const s=window.atoll.simulation;s.current=id;s.paused=true;
  window.atoll.renderer.inspect=false;window.atoll.renderer.hover=s.section.food.find(f=>f.food===food);
  return {id,counts:s.section.food.reduce((r,f)=>(r[f.food]=(r[f.food]||0)+1,r),{})};
 },{id:reef.id,food:focus[reef.id]}));
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await page.screenshot({path:`artifacts/feeding-reef-${reef.id}.png`});
}
// A QA contact sheet of browser captures; original game art is unchanged.
await page.setViewportSize({width:1500,height:960});
await page.setContent(`<html><head><style>body{margin:12px;background:#163c43;color:#f4f0df;font:13px Arial}main{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.tile img{display:block;width:100%;margin-top:6px}</style></head><body><main>${REEFS.map(r=>`<div class="tile">${r.name}<img src="data:image/png;base64,${fs.readFileSync(`artifacts/feeding-reef-${r.id}.png`).toString('base64')}"></div>`).join('')}</main></body></html>`);
await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
await page.screenshot({path:'artifacts/feeding-sites-contact-sheet.png',fullPage:true});
fs.writeFileSync('artifacts/feeding-sites-report.json',JSON.stringify({errors,reefs:report},null,2));
console.log(JSON.stringify({errors,scenes:report.length}));await browser.close();
if(errors.length)process.exitCode=1;
