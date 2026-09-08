import {test,expect} from '@playwright/test';import {clickButton} from '../../scripts/ui-actions.mjs';
for(const [name,id] of [['Bluestreak cleaner wrasse','s43'],['Banded coral shrimp','s45']])test(name+' helps an actual generated client through mouse controls',async({page})=>{
 test.setTimeout(90000);
 for(const [width,height] of [[1600,900],[1024,768]]){
  await page.setViewportSize({width,height});await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill(name);await page.getByRole('option').click();await clickButton(page,{name:'Try adventure',exact:true});await page.keyboard.press('Escape');
  const client=await page.evaluate(async()=>{const {canHelp,parasiteDamage}=await import('/src/player-cleaner.js'),{creatureFrame}=await import('/src/geometry.js'),s=window.atoll.simulation;s.player.energy=50;const c=s.section.entities.filter(e=>canHelp(e)&&parasiteDamage(e)>10).sort((a,b)=>Math.hypot(a.x-s.player.x,a.y-s.player.y)-Math.hypot(b.x-s.player.x,b.y-s.player.y))[0];if(!c)throw Error('No generated client needs help');return {id:c.id,...creatureFrame(c),health:c.health,count:s.section.entities.length};});
  const box=await page.locator('#reef').boundingBox();await page.keyboard.press('Escape');await page.mouse.click(box.x+client.x/1600*box.width,box.y+(client.y+55)/900*box.height);
  await page.waitForFunction(id=>window.atoll.simulation.player.service?.client===id,client.id);await page.waitForFunction(()=>window.atoll.simulation.player.service?.elapsed>.5,null,{timeout:30000});await page.keyboard.press('Escape');
  await page.screenshot({path:`artifacts/player-cleaner-${id}-${width}-working.png`});const held=await page.evaluate(()=>JSON.stringify(window.atoll.simulation.player.service));await page.waitForTimeout(100);expect(await page.evaluate(()=>JSON.stringify(window.atoll.simulation.player.service))).toBe(held);
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!window.atoll.simulation.player.service,null,{timeout:15000});await page.keyboard.press('Escape');
  const result=await page.evaluate(id=>{const s=window.atoll.simulation,c=s.section.entities.find(e=>e.id===id);return {health:c.health,energy:s.player.energy,clients:s.adventure.clients,count:s.section.entities.length,helper:!!window.atoll.journal.earned.helper};},client.id);expect(result.health).toBeGreaterThan(client.health+9);expect(result.energy).toBeGreaterThan(45);expect(result.clients.length).toBe(1);expect(result.count).toBe(client.count);expect(result.helper).toBe(true);
  await page.screenshot({path:`artifacts/player-cleaner-${id}-${width}-complete.png`});
 }
});
