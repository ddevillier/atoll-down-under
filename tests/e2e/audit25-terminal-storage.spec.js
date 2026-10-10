import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {clickButton} from '../../scripts/ui-actions.mjs';
import {Simulation} from '../../src/simulation.js';
import {DEFAULT_BLUEPRINT} from '../../src/creations.js';
import {exportDive,importDive} from '../../src/save-files.js';

// Focused terminal UI regressions: import checkpoints through the real file UI.
// These do not claim earned deaths, scores, or a full Challenge playthrough.
async function openFixture(page,simulation){
 await page.setViewportSize({width:1600,height:900});await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:'Saved dives',exact:true});
 await page.locator('#dive-file').setInputFiles({name:'terminal.atoll',mimeType:'application/json',buffer:Buffer.from(exportDive(simulation,'Terminal checkpoint'))});
 await clickButton(page,{name:'Open dive',exact:true});await expect(page.getByRole('dialog')).toContainText(simulation.deathReason);
}
async function reloadLast(page){await clickButton(page,{name:'Saved dives',exact:true});await page.locator('[data-action="load-0"]').click();await expect(page.getByRole('dialog',{name:'Dive ended',exact:true})).toContainText('Scored terminal checkpoint');}

for(const failLocal of [false,true])test(`creation ending retains export and retries after IndexedDB failure (local failure ${failLocal})`,async({page})=>{
 const s=new Simulation(2501);s.start('create','custom',DEFAULT_BLUEPRINT);s.die('Creation terminal checkpoint');
 await openFixture(page,s);
 await page.evaluate(failLocal=>{
  const put=IDBObjectStore.prototype.put,set=Storage.prototype.setItem;
  window.audit25RestoreStorage=()=>{IDBObjectStore.prototype.put=put;Storage.prototype.setItem=set;};
  IDBObjectStore.prototype.put=function(...args){if(this.name==='fish')throw new DOMException('Audit creation write failed','QuotaExceededError');return put.apply(this,args);};
  if(failLocal)Storage.prototype.setItem=function(key,value){if(this===localStorage&&key==='atoll-save-0')throw new DOMException('Audit last dive failed','QuotaExceededError');return set.call(this,key,value);};
 },failLocal);
 try{
  await clickButton(page,{name:'Return home',exact:true});
  await expect(page.getByRole('dialog',{name:'Your saved dives',exact:true})).toBeVisible();
  await expect(page.getByRole('status')).toContainText(/still open.*Export a backup or retry saving/i);
  expect(await page.evaluate(()=>({home:window.atoll.state.home,id:window.atoll.simulation.creation.id,phase:window.atoll.simulation.phase,recorded:window.atoll.simulation.recorded}))).toEqual({home:false,id:s.creation.id,phase:'dead',recorded:true});
  const downloading=page.waitForEvent('download');await clickButton(page,{name:'Export dive file',exact:true});const download=await downloading;
  expect(await download.failure()).toBeNull();const restored=importDive(await readFile(await download.path(),'utf8')).simulation;
  expect(restored.creation.id).toBe(s.creation.id);expect(restored.deathReason).toBe(s.deathReason);expect(restored.recorded).toBe(true);
  if(!failLocal)expect(await page.evaluate(()=>JSON.parse(JSON.parse(localStorage.getItem('atoll-save-0')).state).recorded)).toBe(true);
 }finally{await page.evaluate(()=>window.audit25RestoreStorage?.());}
 await clickButton(page,{name:'Done',exact:true});await clickButton(page,{name:'Return home',exact:true});
 await expect.poll(()=>page.evaluate(()=>window.atoll.state.home)).toBe(true);
 const stored=await page.evaluate(async id=>{const {getCreation}=await import('/src/creations.js');return getCreation(id);},s.creation.id);
 expect(stored.state.recorded).toBe(true);expect(stored.state.phase).toBe('dead');expect(stored.state.deathReason).toBe(s.deathReason);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('atoll-scores')).length)).toBe(1);
});

test('recorded scored ending survives Last dive reload and retry clears the next-attempt marker',async({page})=>{
 const s=new Simulation(2502);s.start('challenge');s.score=4321;s.stageScore=4321;s.die('Scored terminal checkpoint');
 await openFixture(page,s);await page.locator('#ruler-name').fill('One checkpoint');await clickButton(page,{name:'Return home',exact:true});
 const original=await page.evaluate(()=>JSON.parse(localStorage.getItem('atoll-scores')));expect(original).toHaveLength(1);expect(original[0].name).toBe('One checkpoint');expect(original[0].score).toBe(4321);
 for(let i=0;i<2;i++){
  await reloadLast(page);expect(await page.evaluate(()=>window.atoll.simulation.recorded)).toBe(true);
  await clickButton(page,{name:'Return home',exact:true});expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('atoll-scores')))).toEqual(original);
 }
 await reloadLast(page);await clickButton(page,{name:'Try this life again',exact:true});
 expect(await page.evaluate(()=>({phase:window.atoll.simulation.phase,recorded:window.atoll.simulation.recorded,score:window.atoll.simulation.score,stage:window.atoll.simulation.stage}))).toEqual({phase:'playing',recorded:false,score:0,stage:0});
 expect(await page.evaluate(()=>JSON.parse(JSON.parse(localStorage.getItem('atoll-save-0')).state).recorded)).toBe(false);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('atoll-scores')))).toEqual(original);
});
