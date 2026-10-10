import {test,expect} from '@playwright/test';
import {clickButton} from '../../scripts/ui-actions.mjs';
import {Simulation} from '../../src/simulation.js';
import {exportDive} from '../../src/save-files.js';

async function boot(page){await page.setViewportSize({width:1600,height:900});await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);}
async function start(page){await boot(page);await clickButton(page,{name:/Practice Choose/});await clickButton(page,{name:'Enter the reef',exact:true});}

test('Space activates focused HUD buttons and modal dismissal preserves explicit pause',async({page})=>{
 await start(page);await page.keyboard.press('Escape');
 const before=await page.evaluate(()=>window.atoll.simulation.serialize());
 const settings=page.getByRole('button',{name:'Settings',exact:true});await settings.focus();await page.keyboard.press('Space');
 await expect(page.getByRole('dialog')).toBeVisible();
 expect(await page.evaluate(()=>window.atoll.state.modal)).toBe('settings');
 await page.getByRole('button',{name:'Done',exact:true}).click();
 expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(true);
 expect(await page.evaluate(()=>window.atoll.simulation.serialize())).toBe(before);
 const resume=page.getByRole('button',{name:'Resume',exact:true});await resume.focus();await page.keyboard.press('Space');
 expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(false);
});

test('terminal Close keeps focus contained and failed last-dive save keeps export available',async({page})=>{
 const s=new Simulation(2401);s.start('practice','s1');s.die('Imported terminal test fixture');
 await boot(page);await clickButton(page,{name:'Saved dives',exact:true});
 await page.locator('#dive-file').setInputFiles({name:'terminal.atoll',mimeType:'application/json',buffer:Buffer.from(exportDive(s,'Terminal fixture'))});
 await page.getByRole('button',{name:'Open dive',exact:true}).click();
 await expect(page.getByRole('dialog',{name:'Dive ended',exact:true})).toContainText('Imported terminal test fixture');
 await page.getByRole('button',{name:'Close dialog',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>!!document.activeElement?.closest('.panel'))).toBe(true);
 for(let i=0;i<7;i++){await page.keyboard.press('Tab');expect(await page.evaluate(()=>!!document.activeElement?.closest('.panel'))).toBe(true);}
 // Storage failure injection only: the dive is loaded through the real import UI.
 await page.evaluate(()=>{const original=Storage.prototype.setItem;window.restoreStorage=()=>Storage.prototype.setItem=original;Storage.prototype.setItem=function(key,value){if(key==='atoll-save-0')throw new Error('Test storage full');return original.call(this,key,value);};});
 await page.getByRole('button',{name:'Return home',exact:true}).click();
 await expect(page.getByRole('button',{name:'Export dive file',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>window.atoll.simulation.phase)).toBe('dead');
 expect(await page.evaluate(()=>window.atoll.state.home)).toBe(false);
 await page.evaluate(()=>window.restoreStorage());
 await page.getByRole('button',{name:'Close dialog',exact:true}).click();
 await page.getByRole('button',{name:'Return home',exact:true}).click();
 expect(await page.evaluate(()=>window.atoll.state.home)).toBe(true);
});
