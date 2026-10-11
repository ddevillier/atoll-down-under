import {test,expect} from '@playwright/test';
import {clickButton} from '../../scripts/ui-actions.mjs';

const stories=[['housekeeper','Humbug','s30'],['lookout','Foxface','s8'],['walker','Painted frogfish','s54'],['nest','Royal gramma','s3'],['crevice','Clown triggerfish','s24'],['shade','Squirrelfish','s12'],['lantern','Flashlight fish','s53']];
async function ready(page){await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);}
async function choose(page,[key,name,id]){await clickButton(page,{name:/^Practice\b/});await page.getByRole('searchbox').fill(name);await page.locator(`[role="option"][data-species="${id}"]`).click();await page.locator(`[data-action="guided-story"][data-story-key="${key}"]`).click();}

for(const story of stories)test(`${story[0]} spoken instructions respect pause and return control`,async({page})=>{
 await ready(page);await choose(page,story);await expect(page.locator('#reef-story')).toBeVisible();
 await page.locator('[data-action="story-help"]').click();await expect.poll(()=>page.evaluate(()=>window.atoll.state.modal)).toBe('story-help');
 await expect.poll(()=>page.evaluate(()=>window.atoll.audio.narrationState)).toBe('playing');
 const before=await page.evaluate(()=>({time:window.atoll.simulation.time,state:structuredClone(window.atoll.simulation.reefStories)}));await page.waitForTimeout(200);
 expect(await page.evaluate(()=>({time:window.atoll.simulation.time,state:structuredClone(window.atoll.simulation.reefStories)}))).toEqual(before);
 const helpId=await page.evaluate(()=>window.atoll.audio.narrationId);await page.getByRole('button',{name:'Return to the reef',exact:true}).click();expect(await page.evaluate(()=>window.atoll.audio.narrationId)).not.toBe(helpId);
 await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.paused)).toBe(false);await page.locator('[data-action="pause"]').click();
 await page.locator('[data-action="story-help"]').click();await page.getByRole('button',{name:'Return to the reef',exact:true}).click();
 expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(true);
 await page.locator('[data-action="story-stop"]').click();expect(await page.evaluate(()=>window.atoll.simulation.reefStories.active)).toBeNull();
});

test('a fresh adventure preserves a full save shelf until the current dive is exported',async({page})=>{
 await ready(page);await choose(page,stories[0]);await page.locator('[data-action="saves"]').click();
 for(const slot of [1,2,3])await page.locator(`[data-action="save-${slot}"]`).click();
 const shelf=await page.evaluate(()=>[1,2,3].map(i=>localStorage.getItem('atoll-save-'+i)));
 await page.getByRole('button',{name:'Done',exact:true}).click();await page.locator('[data-action="home"]').click();await choose(page,stories[5]);
 await expect(page.locator('[data-action="start-fresh-story"]')).toBeDisabled();expect(await page.evaluate(()=>window.atoll.simulation.player.species.id)).toBe('s30');
 const download=page.waitForEvent('download');await page.locator('[data-action="export-dive"]').click();expect((await download).suggestedFilename()).toMatch(/\.atoll$/);
 await expect(page.locator('[data-action="start-fresh-story"]')).toBeEnabled();await page.locator('[data-action="start-fresh-story"]').click();
 expect(await page.evaluate(()=>[1,2,3].map(i=>localStorage.getItem('atoll-save-'+i)))).toEqual(shelf);
 expect(await page.evaluate(()=>[window.atoll.simulation.player.species.id,window.atoll.simulation.reefStories.active,window.atoll.simulation.current])).toEqual(['s12','shade',8]);
});
