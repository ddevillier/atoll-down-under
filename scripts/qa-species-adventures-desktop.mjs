import {_electron as electron,expect} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import {clickButton} from './ui-actions.mjs';

// Each launch has Electron's isolated ATOLL_QA profile. This proof uses actual
// controls; it neither creates progress nor assigns actor coordinates.
const executable=process.argv[2]&&process.argv[2]!=='source'?process.argv[2]:undefined;
const output=path.resolve(process.argv[3]||'artifacts/species-adventures/native');fs.mkdirSync(output,{recursive:true});
const stories=[['housekeeper','Humbug','s30',4],['lookout','Foxface','s8',0],['walker','Painted frogfish','s54',4],['nest','Royal gramma','s3',4],['crevice','Clown triggerfish','s24',4],['shade','Squirrelfish','s12',8],['lantern','Flashlight fish','s53',8]];
const report={executable:executable||'source',cases:[]};
for(const [key,name,id,reef] of stories){
 const app=await electron.launch({...executable?{executablePath:executable}:{args:['.']},env:{...process.env,ATOLL_QA:'1'}});
 try{
  const isolated=await app.evaluate(({app})=>/[\\/]atoll-qa-/.test(app.getPath('userData')));if(!isolated)throw Error('Native adventure verification requires isolated storage.');
  const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.waitForFunction(()=>window.atoll?.renderer.ready);
  const fullscreen=await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].isFullScreen());expect(fullscreen).toBe(true);
  await clickButton(page,{name:/^Practice\b/});await page.getByRole('searchbox').fill(name);await page.locator(`[role="option"][data-species="${id}"]`).click();await page.locator(`[data-action="guided-story"][data-story-key="${key}"]`).click();
  await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.reefStories.active)).toBe(key);expect(await page.evaluate(()=>window.atoll.simulation.current)).toBe(reef);
  await page.locator('[data-action="pause"]').click();const frozen=await page.evaluate(()=>({time:window.atoll.simulation.time,story:structuredClone(window.atoll.simulation.reefStories)}));await page.waitForTimeout(200);expect(await page.evaluate(()=>({time:window.atoll.simulation.time,story:structuredClone(window.atoll.simulation.reefStories)}))).toEqual(frozen);
  await page.screenshot({path:path.join(output,key+'-fullscreen.png')});await page.locator('[data-action="story-help"]').click();await expect.poll(()=>page.evaluate(()=>window.atoll.audio.narrationState)).toBe('playing');const clip=await page.evaluate(()=>window.atoll.audio.narrationId);await page.getByRole('button',{name:'Return to the reef',exact:true}).click();expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(true);
  await page.keyboard.press('F11');await expect.poll(()=>app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].isFullScreen())).toBe(false);
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(1024,768));await expect(page.locator('#reef-story')).toBeVisible();await page.screenshot({path:path.join(output,key+'-1024.png')});
  const box=await page.locator('#reef-story').boundingBox(),viewport=page.viewportSize()||await page.evaluate(()=>({width:innerWidth,height:innerHeight}));expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(viewport.width+1);expect(box.y+box.height).toBeLessThanOrEqual(viewport.height+1);
  await page.locator('[data-action="story-stop"]').click();expect(await page.evaluate(()=>window.atoll.simulation.reefStories.active)).toBeNull();expect(errors).toEqual([]);
  report.cases.push({key,id,reef,fullscreen,isolated,clip,pauseFrozen:true,returnPreservedPause:true,windowedControlsWithinViewport:true,errors});console.log(key+' native controls/audio/fullscreen passed');
 }finally{await app.close();}
}
report.passed=report.cases.length===stories.length;fs.writeFileSync(path.join(output,'native-adventures-report.json'),JSON.stringify(report,null,2)+'\n');
