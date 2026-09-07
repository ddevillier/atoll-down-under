import {_electron as electron,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import {clickButton} from './ui-actions.mjs';
import {validateJournal} from '../src/journal.js';
const executablePath=process.argv[2];
const app=await electron.launch({...(executablePath?{executablePath}:{args:['.']}),env:{...process.env,ATOLL_QA:'1'}});
try{
 const profile=await app.evaluate(({app})=>app.getPath('userData'));expect(profile).toMatch(/atoll-qa-/);
 const destination=path.resolve('artifacts/native-family-journal.json');
 await app.evaluate(({session},destination)=>{globalThis.downloadState='waiting';session.defaultSession.on('will-download',(_e,item)=>{item.setSavePath(destination);item.once('done',(_e,state)=>globalThis.downloadState=state);});},destination);
 const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.waitForFunction(()=>window.atoll?.renderer.ready);
 const auto=await page.evaluate(()=>({track:window.atoll.audio.track,paused:window.atoll.audio.music.paused,blocked:window.atoll.audio.blocked}));
 if(auto.paused)await page.mouse.click(120,350);
 await expect.poll(()=>page.evaluate(()=>window.atoll.audio.music.paused)).toBe(false);await page.waitForTimeout(2100);
 expect(await page.evaluate(()=>Math.abs(window.atoll.audio.music.volume-window.atoll.state.settings.musicVolume)<.01)).toBe(true);
 await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill('Neon');await page.getByRole('option').first().click();await clickButton(page,{name:'Enter the reef'});
 await page.evaluate(()=>{const s=window.atoll.simulation;s.section.entities=[];s.player.energy=70;s.consume({...s.section.food.find(f=>f.food==='algae')});s.careProgress.healthy=29.99;});
 await expect.poll(()=>page.evaluate(()=>window.atoll.journal.cared.length)).toBe(1);
 await clickButton(page,{name:'Field guide',exact:true});await clickButton(page,{name:'Family journal',exact:true});await clickButton(page,{name:'Back up',exact:true});
 await expect.poll(()=>app.evaluate(()=>globalThis.downloadState)).toBe('completed');const backup=validateJournal(JSON.parse(await fs.readFile(destination,'utf8')));expect(backup.cared).toEqual(['s1']);expect(backup.earned.meal).toBeTruthy();
 await page.locator('#journal-file').setInputFiles(destination);await expect(page.getByRole('dialog')).toContainText('Journal restored');expect(await page.evaluate(()=>window.atoll.journal.cared.length)).toBe(1);
 await clickButton(page,{name:'Return',exact:true});await clickButton(page,{name:'Atoll',exact:true});await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready);expect(await page.evaluate(()=>window.atoll.journal.cared.length)).toBe(1);
 expect(errors).toEqual([]);const report={surface:executablePath?'packaged Windows':'source Electron',isolatedProfile:true,titlePlayback:true,titleAutoplay:!auto.paused,twoSecondFade:true,careStamp:true,actualBackupFile:true,restoreDeduplicated:true,persistence:true,errors};await fs.writeFile('artifacts/native-journal-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await app.close();}
