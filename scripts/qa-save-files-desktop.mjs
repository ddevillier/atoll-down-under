import {_electron as electron,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import {clickButton} from './ui-actions.mjs';
import {importDive} from '../src/save-files.js';

// Source Electron by default; pass a packaged Windows executable to check it.
const executablePath=process.argv[2];
const app=await electron.launch({...(executablePath?{executablePath}:{args:['.']}),env:{...process.env,ATOLL_QA:'1'}});
try{
 const downloadPath=path.resolve('artifacts/native-portable-dive.atoll');
 await fs.mkdir('artifacts',{recursive:true});
 await app.evaluate(({session},destination)=>{
  globalThis.atollDownloadState='waiting';
  session.defaultSession.on('will-download',(_event,item)=>{
   item.setSavePath(destination);item.once('done',(_event,state)=>{globalThis.atollDownloadState=state;});
  });
 },downloadPath);
 const page=await app.firstWindow();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill('Cuttlefish');
 await page.getByRole('option').first().click();await clickButton(page,{name:'Enter the reef'});
 await clickButton(page,{name:'Save / load'});await page.getByLabel('Dive name').fill('Night reef test');
 await page.getByRole('button',{name:'Export dive file'}).click();
 await expect.poll(()=>app.evaluate(()=>globalThis.atollDownloadState)).toBe('completed');
 const raw=await fs.readFile(downloadPath,'utf8'),saved=importDive(raw);
 expect(saved.name).toBe('Night reef test');expect(saved.simulation.player.species.name).toBe('Cuttlefish');
 await page.locator('#dive-file').setInputFiles(downloadPath);
 await expect(page.getByRole('dialog')).toContainText('Open this dive?');
 await page.getByRole('button',{name:'Open dive',exact:true}).click();
 expect(await page.evaluate(()=>window.atoll.simulation.player.species.name)).toBe('Cuttlefish');
 expect(await page.evaluate(()=>window.atoll.simulation.period)).toBe('night');
 const report={surface:executablePath?'packaged Windows':'source Electron',origin:await page.evaluate(()=>location.origin),downloaded:true,imported:true,name:saved.name,species:saved.simulation.player.species.name,isolatedProfile:true,errors};
 expect(errors).toEqual([]);
 await fs.writeFile('artifacts/native-save-files-report.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify(report));
}finally{await app.close();}
