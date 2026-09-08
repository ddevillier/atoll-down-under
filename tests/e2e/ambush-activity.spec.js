import {test,expect} from '@playwright/test';import {clickButton} from '../../scripts/ui-actions.mjs';
test('frogfish aims without leaving its ambush, catches generated prey and records the discovery',async({page})=>{
 test.setTimeout(150000);
 for(const [width,height] of [[1600,900],[1024,768]]){
  await page.setViewportSize({width,height});await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill('Painted frogfish');await page.getByRole('option').click();await clickButton(page,{name:'Try adventure',exact:true});await page.keyboard.press('Escape');
  const site=await page.evaluate(async()=>{const {Simulation,edible}=await import('/src/simulation.js'),{sitesFor}=await import('/src/adventures.js'),s=new Simulation(42);s.start('practice','s54');s.paused=true;s.adventure.visible=true;Object.assign(window.atoll.simulation,s);const score=p=>s.section.entities.filter(e=>e.alive&&edible(s.player,e)&&!e.species.poison&&Math.hypot(e.x-p.x,e.y-p.y)<340).length;return sitesFor(s).sort((a,b)=>score(b)-score(a))[0];});
  const box=await page.locator('#reef').boundingBox(),screen=p=>({x:box.x+p.x/1600*box.width,y:box.y+(p.y+55)/900*box.height});await page.keyboard.press('Escape');const spot=screen(site);await page.mouse.move(spot.x,spot.y);await page.waitForFunction(site=>Math.hypot(window.atoll.simulation.player.x-site.x,window.atoll.simulation.player.y-site.y)<95,site);await page.keyboard.press('e');await page.waitForFunction(()=>window.atoll.simulation.player.ambush?.settled>=2);await page.keyboard.press('Escape');await page.screenshot({path:`artifacts/ambush-${width}-waiting.png`});await page.keyboard.press('Escape');
  await page.mouse.move(spot.x+25,spot.y-20);await page.waitForTimeout(100);expect(await page.evaluate(()=>!!window.atoll.simulation.player.ambush)).toBe(true);
  const end=Date.now()+55000;let complete=false;
  while(Date.now()<end){
   const state=await page.evaluate(async site=>{const {edible}=await import('/src/simulation.js'),{creatureFrame}=await import('/src/geometry.js'),s=window.atoll.simulation,p=s.player,e=s.section.entities.find(e=>e.alive&&!e.hidden&&edible(p,e)&&!e.species.poison&&Math.hypot(p.x-e.x,p.y-e.y)<125);return {complete:s.adventure.complete,ambush:p.ambush,near:Math.hypot(p.x-site.x,p.y-site.y)<95,prey:e?creatureFrame(e):null};},site);
   if(state.complete){complete=true;break;}
   if(!state.ambush){if(state.near)await page.keyboard.press('e');else await page.mouse.move(spot.x,spot.y);}
   else if(state.ambush.settled>=2&&!state.ambush.strike&&state.prey){const pt=screen(state.prey);await page.mouse.click(pt.x,pt.y);}
   await page.waitForTimeout(100);
  }
  expect(complete).toBe(true);await page.keyboard.press('Escape');expect(await page.evaluate(()=>window.atoll.journal.discoveries)).toContain('frogfish-ambush');await page.screenshot({path:`artifacts/ambush-${width}-complete.png`});
 }
});
