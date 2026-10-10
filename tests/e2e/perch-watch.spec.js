import {test,expect} from '@playwright/test';import {clickButton} from '../../scripts/ui-actions.mjs';
test('mouse-driven passer turns a perched hawkfish, with visible hover context and pause stability',async({page})=>{
 for(const [width,height] of [[1600,900],[1024,768]]){
  await page.setViewportSize({width,height});await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill('Neon damselfish');await page.getByRole('option').first().click();await clickButton(page,{name:'Enter the reef'});await page.keyboard.press('Escape');
  const home=await page.evaluate(async()=>{const {SPECIES}=await import('/src/data.js'),s=window.atoll.simulation,e={...structuredClone(s.section.entities[0]),id:'watcher',species:SPECIES[31],x:650,y:350,angle:0,target:null,ecology:null,satiated:120,health:100,rest:0,think:0,activity:'cruising'};s.section.entities=[e];s.section.food=[];s.player.x=1450;s.player.y=100;s.point(1450,100);s.paused=false;for(let i=0;i<40*60;i++)s.step(1/60);s.paused=true;s.player.x=e.x+80;s.player.y=e.y-95;s.point(s.player.x,s.player.y);return {...e.ecology.home,x:e.x,y:e.y};});
  const box=await page.locator('#reef').boundingBox(),move=async(x,y)=>page.mouse.move(box.x+x/1600*box.width,box.y+(y+55)/900*box.height);
  await page.keyboard.press('Escape');await move(home.x+80,home.y-95);
  await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.section.entities[0].ecology?.watch?.id)).toBe('player');
  await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.section.entities[0].facing)).toBe(1);
  await move(home.x-80,home.y-95);await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.section.entities[0].facing),{timeout:12000}).toBe(-1);
  await expect.poll(()=>page.evaluate(()=>window.atoll.renderer.poses.get('watcher')?.frame?.width>10)).toBe(true);await page.waitForTimeout(600);
  expect(await page.evaluate(()=>window.atoll.renderer.labelLayout.some(l=>l.text.includes('Watching a passer')))).toBe(false);
  await page.keyboard.press('Escape');await move(home.x,home.y);
  await expect.poll(()=>page.evaluate(()=>window.atoll.renderer.labelLayout.some(l=>l.text===window.atoll.simulation.section.entities[0].species.name))).toBe(true);
  const state=await page.evaluate(()=>{const e=window.atoll.simulation.section.entities[0];return {x:e.x,y:e.y,angle:e.angle,target:e.target};});expect(Math.hypot(state.x-home.x,state.y-home.y)).toBeLessThan(1);expect(state.target).toBeNull();await page.waitForTimeout(150);expect(await page.evaluate(()=>{const e=window.atoll.simulation.section.entities[0];return {x:e.x,y:e.y,angle:e.angle,target:e.target};})).toEqual(state);
 }
});
