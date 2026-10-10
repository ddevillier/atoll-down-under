import {test,expect} from '@playwright/test';import {clickButton} from '../../scripts/ui-actions.mjs';
test('filefish invites a generated companion, both feed, and regroup through real controls',async({page})=>{
 test.setTimeout(100000);
 for(const [width,height] of [[1600,900],[1024,768]]){
  await page.setViewportSize({width,height});await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill('Orange-spotted filefish');await page.getByRole('option').click();await clickButton(page,{name:'Show goal',exact:true});await page.keyboard.press('Escape');
  // A reproducible generated reef; no NPC, food, hunger or position edits.
  await page.evaluate(async()=>{const {Simulation}=await import('/src/simulation.js'),s=new Simulation(42);s.start('practice','s48');s.paused=true;s.adventure.visible=true;Object.assign(window.atoll.simulation,s);});
  const box=await page.locator('#reef').boundingBox(),screen=p=>({x:box.x+p.x/1600*box.width,y:box.y+(p.y+55)/900*box.height});await page.keyboard.press('Escape');await page.keyboard.press('e');await page.waitForFunction(()=>!!window.atoll.simulation.adventure.buddy);
  const food=await page.evaluate(()=>{const s=window.atoll.simulation,e=s.section.entities.find(e=>e.id===s.adventure.buddy.id);return s.section.food.filter(f=>f.regrow<=0&&s.player.species.diet.includes(f.food)).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y))[0];});const meal=screen(food);await page.mouse.click(meal.x,meal.y);
  await page.waitForFunction(()=>window.atoll.simulation.adventure.buddy?.playerMeal,null,{timeout:20000});await page.keyboard.press('Escape');await page.screenshot({path:`artifacts/companion-${width}-waiting.png`});expect(await page.evaluate(()=>window.atoll.simulation.adventure.complete)).toBe(false);
  await page.keyboard.press('Escape');await page.waitForFunction(()=>window.atoll.simulation.adventure.complete,null,{timeout:45000});await page.keyboard.press('Escape');
  const result=await page.evaluate(()=>({buddy:window.atoll.simulation.adventure.buddy,journal:window.atoll.journal.discoveries}));expect(result.buddy.partnerMeal).toBe(true);expect(result.buddy.rejoined).toBe(3);expect(result.journal).toContain('filefish-companion');await page.screenshot({path:`artifacts/companion-${width}-complete.png`});
 }
});
