import {_electron as electron,expect} from '@playwright/test';
import fs from 'node:fs';
import {clickButton} from './ui-actions.mjs';

const executablePath=process.argv[2];
const app=await electron.launch({...(executablePath?{executablePath}:{args:['.']}),env:{...process.env,ATOLL_QA:'1'}});
try{
 if(!await app.evaluate(({app})=>/[\\/]atoll-qa-/.test(app.getPath('userData'))))throw Error('Isolated profile required');
 const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill('Neon');
 await page.getByRole('option').click();await clickButton(page,{name:'Enter the reef'});
 await expect(page.locator('#state-badge')).toContainText('Eating, active abilities or travel end protection');
 await page.evaluate(async()=>{
  const s=window.atoll.simulation,{REEFS}=await import(new URL('src/data.js',location.href)),a=REEFS[s.current].shelters[0];
  s.section.entities=[];s.section.food=[];s.protected=false;
  Object.assign(s.player,{x:a.x,y:a.y+a.r*.8,still:0});s.pointer={x:s.player.x,y:s.player.y};
 });
 const settleStarted=Date.now();
 try{await expect(page.locator('#state-badge')).toContainText('Hidden · Stay still',{timeout:20000});}
 catch(error){console.log(await page.evaluate(()=>{const s=window.atoll.simulation;return {visibility:document.visibilityState,time:s.time,still:s.player.still,hidden:s.player.hidden,paused:s.paused,phase:s.phase,x:s.player.x,y:s.player.y,pointer:s.pointer};}));throw error;}
 const settling=await page.evaluate(()=>({visibility:document.visibilityState,still:window.atoll.simulation.player.still}));
 settling.wallSeconds=(Date.now()-settleStarted)/1000;
 await page.keyboard.press('Escape');
 const markers=await page.evaluate(async()=>{
  const r=window.atoll.renderer,c=r.ctx,arc=c.arc,tag=r.tag,arcs=[],labels=[];
  c.arc=function(...args){arcs.push(args.slice(0,3));return arc.apply(this,args);};
  r.tag=function(...args){labels.push(args[3]);return tag.apply(this,args);};
  try{
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   const {REEFS}=await import(new URL('src/data.js',location.href));
   return {arcs,labels,expected:REEFS[window.atoll.simulation.current].shelters};
  }finally{c.arc=arc;r.tag=tag;}
 });
 for(const a of markers.expected)expect(markers.arcs.some(([x,y,r])=>x===a.x&&y===a.y&&r===a.r)).toBe(true);
 expect(markers.labels).toContain('Shelter · Stop here to hide');
 await page.screenshot({path:'artifacts/native-shelter-small.png'});
 await page.evaluate(()=>{const s=window.atoll.simulation;s.player.species={...s.player.species,size:150};s.player.hidden=false;});
 await page.keyboard.press('Escape');
 await expect(page.locator('#state-badge')).toContainText('too small for your fish');
 expect(await page.evaluate(()=>window.atoll.simulation.player.hidden)).toBe(false);
 await page.screenshot({path:'artifacts/native-shelter-large.png'});
 expect(errors).toEqual([]);
 const report={surface:executablePath?'packaged Windows':'source Electron',origin:await page.evaluate(()=>location.origin),settling,protectedEntryText:true,smallFishHides:true,markersMatchSimulationRadius:true,largeFishRejected:true,isolatedProfile:true,errors};
 fs.writeFileSync('artifacts/native-shelter-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await app.close();}
