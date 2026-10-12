import {test,expect} from '@playwright/test';
import {clickButton} from '../../scripts/ui-actions.mjs';

for(const [width,height] of [[1600,900],[1024,768]])test(`journal access, earned-entry focus and separate goals at ${width}`,async({page},testInfo)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width,height});
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:/^Practice\b/});await page.getByRole('searchbox').fill('Cuttlefish');await page.locator('[data-species="s19"][role="option"]').click();await clickButton(page,{name:'Enter the reef',exact:true});
 await page.getByRole('button',{name:'Journal',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('Our family journal');
 const frozen=await page.evaluate(()=>window.atoll.simulation.time);await page.waitForTimeout(250);expect(await page.evaluate(()=>window.atoll.simulation.time)).toBe(frozen);
 await clickButton(page,{name:'Return',exact:true});expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(false);
 await page.keyboard.press('p');await page.keyboard.press('j');await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(true);await page.keyboard.press('p');
 // Explicit event fixture tests presentation priority. Actual earned-contact
 // integration remains in the four real rabbitfish exchange cases.
 await page.evaluate(()=>{const s=window.atoll.simulation;s.event('message','Carry the old silt');s.event('discovery','Three disguises discovered.',{value:'disappearing-artist'});s.event('message','Completed the disguise adventure');});
 const entry=page.locator('.toast [data-action="journal-entry"][data-id="disappearing-artist"]');await expect(entry).toBeVisible();await expect(page.locator('.toast')).not.toContainText('old silt');
 await entry.focus();await page.waitForTimeout(4100);await expect(entry).toBeFocused();await page.keyboard.press('Enter');
 const discovered=page.locator('[data-journal-entry="disappearing-artist"]');await expect(discovered).toBeFocused();await expect(page.locator('.journal-ways')).toHaveAttribute('open','');await expect(discovered).toContainText('Discovered');
 await page.screenshot({path:`artifacts/polish-journal-${width}.png`});await page.keyboard.press('Escape');
 // The expanded discovery must not turn the ordinary goal into completion.
 await page.getByRole('button',{name:'Activity',exact:true}).click();await expect(page.locator('.goal-context')).toContainText('separate goal explores two backgrounds');expect(await page.evaluate(()=>window.atoll.simulation.adventure.complete)).toBe(false);
 await expect(page.locator('#optional-goal-counter')).toContainText('0 / 2');
 await page.screenshot({path:`artifacts/polish-activity-${width}.png`});
 const badgeLink=page.locator('.toast [data-action="journal-entry"][data-kind="badge"]');await expect(badgeLink).toBeVisible();const badgeId=await badgeLink.getAttribute('data-id');await badgeLink.click();
 await expect(page.locator(`[data-journal-entry="${badgeId}"]`)).toBeFocused();await expect(page.locator(`[data-journal-entry="${badgeId}"]`)).toContainText('Earned');await page.keyboard.press('Escape');expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(false);
 const layout=await page.evaluate(()=>{const app=document.querySelector('#app').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,buttons:[...document.querySelectorAll('.topbar button')].map(b=>{const r=b.getBoundingClientRect();return r.left>=app.left-1&&r.right<=app.right+1;})};});
 expect(layout.overflow).toBe(false);expect(layout.buttons.every(Boolean)).toBe(true);expect(errors).toEqual([]);
 await testInfo.attach('polish-layout',{body:JSON.stringify(layout),contentType:'application/json'});
});
