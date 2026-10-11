import {_electron as electron,expect} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import {clickButton} from './ui-actions.mjs';
const executable=process.argv[2]&&process.argv[2]!=='source'?process.argv[2]:undefined;
const output=path.resolve(process.argv[3]||'artifacts/species-adventures/native-background');fs.mkdirSync(output,{recursive:true});
const app=await electron.launch({...executable?{executablePath:executable}:{args:['.']},env:{...process.env,ATOLL_QA:'1'}});
const report={executable:executable||'source'};
const write=()=>fs.writeFileSync(path.join(output,'native-background-report.json'),JSON.stringify(report,null,2)+'\n');
try{
 report.isolated=await app.evaluate(({app})=>/[\\/]atoll-qa-/.test(app.getPath('userData')));if(!report.isolated)throw Error('Native focus verification requires isolated storage.');
 const page=await app.firstWindow();await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];globalThis.__backgroundWindow=w;globalThis.__backgroundEvents=[];for(const name of ['blur','focus','minimize','restore','hide','show'])w.on(name,()=>globalThis.__backgroundEvents.push({name,at:Date.now(),focused:w.isFocused(),minimized:w.isMinimized(),visible:w.isVisible()}));w.webContents.setBackgroundThrottling(true);w.show();w.focus();});
 await expect.poll(()=>app.evaluate(()=>globalThis.__backgroundWindow.isFocused())).toBe(true);
 await page.evaluate(()=>{window.__backgroundEvents=[];for(const name of ['blur','focus'])window.addEventListener(name,e=>window.__backgroundEvents.push({name,trusted:e.isTrusted,hidden:document.hidden,focused:document.hasFocus(),at:Date.now()}));document.addEventListener('visibilitychange',e=>window.__backgroundEvents.push({name:'visibilitychange',trusted:e.isTrusted,hidden:document.hidden,focused:document.hasFocus(),at:Date.now()}));});
 await clickButton(page,{name:/^Practice\b/});await page.getByRole('searchbox').fill('Painted frogfish');await page.locator('[role="option"][data-species="s54"]').click();await page.locator('[data-action="guided-story"][data-story-key="walker"]').click();
 await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.paused)).toBe(false);await page.keyboard.press('F11');await expect.poll(()=>app.evaluate(()=>globalThis.__backgroundWindow.isFullScreen())).toBe(false);
 const snapshot=()=>page.evaluate(()=>({time:window.atoll.simulation.time,player:{x:window.atoll.simulation.player.x,y:window.atoll.simulation.player.y,energy:window.atoll.simulation.player.energy},story:structuredClone(window.atoll.simulation.reefStories)}));
 const evidence=async()=>({native:await app.evaluate(()=>{const w=globalThis.__backgroundWindow;return {events:globalThis.__backgroundEvents,focused:w.isFocused(),minimized:w.isMinimized(),visible:w.isVisible()};}),renderer:await page.evaluate(()=>({events:window.__backgroundEvents,hidden:document.hidden,focused:document.hasFocus(),paused:window.atoll.simulation.paused}))});
 await app.evaluate(()=>{globalThis.__backgroundEvents=[];globalThis.__backgroundWindow.minimize();});
 await expect.poll(()=>app.evaluate(()=>globalThis.__backgroundWindow.isMinimized())).toBe(true);
 await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.paused)).toBe(true);
 report.minimize=await evidence();expect(report.minimize.native.events.some(e=>e.name==='minimize')).toBe(true);expect(report.minimize.native.focused).toBe(false);
 const frozen=await snapshot();await page.waitForTimeout(350);expect(await snapshot()).toEqual(frozen);report.minimizeFrozen=true;write();
 await app.evaluate(()=>{const w=globalThis.__backgroundWindow;w.restore();w.focus();});await expect.poll(()=>app.evaluate(()=>globalThis.__backgroundWindow.isFocused())).toBe(true);
 expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(true);report.restorePreservedPause=true;await page.screenshot({path:path.join(output,'native-restored-paused.png')});
 await clickButton(page,{name:'Resume',exact:true});await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.time)).toBeGreaterThan(frozen.time);report.actualUIResume=true;
 // A second actual native window takes OS focus without minimizing the game.
 await app.evaluate(async({BrowserWindow})=>{globalThis.__backgroundEvents=[];const helper=new BrowserWindow({width:320,height:180,show:false,title:'Atoll native focus verification',webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});globalThis.__backgroundHelper=helper;await helper.loadURL('data:text/html,<title>Native focus verification</title><p>Atoll focus verification</p>');helper.show();helper.focus();});
 await expect.poll(()=>app.evaluate(()=>globalThis.__backgroundHelper.isFocused()&&!globalThis.__backgroundWindow.isFocused())).toBe(true);await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.paused)).toBe(true);
 report.nativeFocusTransfer=await evidence();expect(report.nativeFocusTransfer.native.events.some(e=>e.name==='blur')).toBe(true);expect(report.nativeFocusTransfer.native.minimized).toBe(false);
 const blurred=await snapshot();await page.waitForTimeout(350);expect(await snapshot()).toEqual(blurred);report.nativeBlurFrozen=true;
 await app.evaluate(()=>{globalThis.__backgroundHelper.close();globalThis.__backgroundWindow.focus();});await expect.poll(()=>app.evaluate(()=>globalThis.__backgroundWindow.isFocused())).toBe(true);expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(true);
 await clickButton(page,{name:'Resume',exact:true});await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.time)).toBeGreaterThan(blurred.time);report.focusTransferUIResume=true;report.passed=true;write();console.log(JSON.stringify(report));
}catch(error){report.passed=false;report.error=String(error);write();throw error;}finally{await app.close();}
