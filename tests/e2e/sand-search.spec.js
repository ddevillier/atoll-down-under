import {test,expect} from '@playwright/test';import {clickButton} from '../../scripts/ui-actions.mjs';
test('goatfish discovers and eats generated sand food through E and mouse controls',async({page})=>{
 test.setTimeout(90000);
 for(const [width,height] of [[1600,900],[1024,768]]){
  await page.setViewportSize({width,height});await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
  await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill('Yellow goatfish');await page.getByRole('option').click();await clickButton(page,{name:'Show goal',exact:true});await page.keyboard.press('Escape');
  const site=await page.evaluate(async()=>{const {sitesFor}=await import('/src/adventures.js'),{feedingApproach}=await import('/src/feeding-contact.js'),s=window.atoll.simulation;const f=sitesFor(s).sort((a,b)=>Math.hypot(a.x-s.player.x,a.y-s.player.y)-Math.hypot(b.x-s.player.x,b.y-s.player.y))[0].food;return {id:f.id,x:f.x,y:f.y,dock:feedingApproach(s.player,f),amount:f.amount,count:s.section.entities.length};});
  const box=await page.locator('#reef').boundingBox(),screen=p=>({x:box.x+p.x/1600*box.width,y:box.y+(p.y+55)/900*box.height});
  await page.keyboard.press('Escape');const dock=screen(site.dock);await page.mouse.move(dock.x,dock.y);
  await page.waitForFunction(({x,y})=>{const p=window.atoll.simulation.player;return Math.hypot(p.x-x,p.y-y)<12;},site.dock,{timeout:25000});
  await page.keyboard.press('e');await page.waitForFunction(()=>window.atoll.simulation.player.sandProbe?.elapsed>.3);await page.keyboard.press('Escape');
  await page.screenshot({path:`artifacts/sand-search-${width}-probing.png`});const held=await page.evaluate(()=>JSON.stringify(window.atoll.simulation.player.sandProbe));await page.waitForTimeout(100);expect(await page.evaluate(()=>JSON.stringify(window.atoll.simulation.player.sandProbe))).toBe(held);
  await page.keyboard.press('Escape');await page.waitForFunction(id=>{const s=window.atoll.simulation;return !s.player.sandProbe&&s.section.food.find(f=>f.id===id).uncovered>0;},site.id);
  const meal=screen(site);await page.mouse.click(meal.x,meal.y);await page.waitForFunction(()=>window.atoll.simulation.adventure.meals.length>0);await page.keyboard.press('Escape');
  const result=await page.evaluate(id=>{const s=window.atoll.simulation;return {amount:s.section.food.find(f=>f.id===id).amount,count:s.section.entities.length,complete:s.adventure.complete};},site.id);expect(result.amount).toBeLessThan(site.amount);expect(result.count).toBe(site.count);expect(result.complete).toBe(false);
  await page.screenshot({path:`artifacts/sand-search-${width}-meal.png`});
 }
});
