import {test,expect} from '@playwright/test';
import {clickButton} from '../../scripts/ui-actions.mjs';

for(const savedPaused of [false,true])test(`background safety preserves explicit saved pause intent ${savedPaused}`,async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill('Foxface');
 await page.getByRole('option').click();await page.locator('[data-action="begin-practice"]').click();
 if(savedPaused)await clickButton(page,{name:'Pause',exact:true});
 await page.keyboard.press('Control+s');
 // Deliver the browser lifecycle event deterministically. The actual reload
 // below also exercises the browser's unload/visibility event ordering.
 await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
 expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(true);
 const before=await page.evaluate(()=>window.atoll.simulation.time);
 await page.waitForTimeout(350);
 expect(await page.evaluate(()=>window.atoll.simulation.time)).toBe(before);
 await page.evaluate(()=>window.dispatchEvent(new Event('beforeunload')));
 expect(await page.evaluate(()=>JSON.parse(JSON.parse(localStorage.getItem('atoll-save-0')).state).paused)).toBe(savedPaused);
 await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:'Saved dives',exact:true});await page.locator('[data-action="load-0"]').click();
 expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(savedPaused);
 if(savedPaused)await clickButton(page,{name:'Resume',exact:true});
 const resumed=await page.evaluate(()=>window.atoll.simulation.time);
 await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.time)).toBeGreaterThan(resumed);
 // A manual save after background pausing deliberately stores the current
 // paused state; it must not inherit the earlier automatic-save override.
 await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
 await page.keyboard.press('Control+s');
 expect(await page.evaluate(()=>JSON.parse(JSON.parse(localStorage.getItem('atoll-save-0')).state).paused)).toBe(true);
});

test('a background-paused dive keeps its exact checkpoint in a fresh adventure backup',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:/^Practice\b/});await page.getByRole('searchbox').fill('Humbug');
 await page.locator('[role="option"][data-species="s30"]').click();
 await page.locator('[data-action="guided-story"][data-story-key="housekeeper"]').click();
 await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
 await page.locator('[data-action="home"]').click();
 await clickButton(page,{name:/^Practice\b/});await page.getByRole('searchbox').fill('Squirrelfish');
 await page.locator('[role="option"][data-species="s12"]').click();
 const checkpoint=await page.evaluate(()=>window.atoll.simulation.serialize());
 await page.locator('[data-action="guided-story"][data-story-key="shade"]').click();
 await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.reefStories.active)).toBe('shade');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('atoll-save-1')).state)).toBe(checkpoint);
 expect(JSON.parse(checkpoint).paused).toBe(true);
});
