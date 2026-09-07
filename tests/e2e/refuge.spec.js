import {test,expect} from '@playwright/test';
import {clickButton} from '../../scripts/ui-actions.mjs';

test('trumpetfish follows a player, pauses in place, and renders behind player and NPC hosts',async({page})=>{
 for(const [width,height] of [[1600,900],[1024,768]]){
  await page.setViewportSize({width,height});await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
  await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill('Longfin batfish');await page.getByRole('option').first().click();await clickButton(page,{name:'Enter the reef'});
  await page.keyboard.press('Escape');
  await page.evaluate(async()=>{
   const {SPECIES}=await import('/src/data.js'),s=window.atoll.simulation;
   Object.assign(s.player,{x:800,y:330,angle:0,facing:1,health:100,energy:100});s.point(800,330);s.protected=true;s.section.food=[];
   s.section.entities=[{...structuredClone(s.player),species:SPECIES[41],id:'shadow-guest',x:735,y:330,satiated:120,think:0}];
   s.paused=false;for(let i=0;i<600;i++)s.step(1/60);s.paused=true;
  });
  const settled=await page.evaluate(()=>{const e=window.atoll.simulation.section.entities[0];return {x:e.x,y:e.y,host:e.ecology.host,activity:e.activity};});
  expect(settled.host).toBe('player');expect(settled.activity).toBe('shadowing');
  await page.waitForTimeout(250);expect(await page.evaluate(()=>{const e=window.atoll.simulation.section.entities[0];return {x:e.x,y:e.y};})).toEqual({x:settled.x,y:settled.y});
  const order=await page.evaluate(()=>{
   const {simulation:s,renderer:r}=window.atoll,ids=[],draw=r.drawCreature;
   r.drawCreature=function(ctx,e,...args){ids.push(e.id);return draw.call(this,ctx,e,...args);};
   try{r.draw(s,0);}finally{r.drawCreature=draw;}
   return {guest:ids.indexOf('shadow-guest'),host:ids.indexOf('player'),draws:ids.filter(id=>id==='shadow-guest').length};
  });
  expect(order.guest).toBeGreaterThanOrEqual(0);expect(order.guest).toBeLessThan(order.host);expect(order.draws).toBe(1);
  // Real mouse movement controls the player; the existing guest follows through
  // the ordinary simulation loop. This is an isolated interaction fixture.
  await page.keyboard.press('Escape');const box=await page.locator('#reef').boundingBox();await page.mouse.move(box.x+970/1600*box.width,box.y+385/900*box.height);
  await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.player.x),{timeout:7000}).toBeGreaterThan(935);
  await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.section.entities[0].x),{timeout:10000}).toBeGreaterThan(settled.x+85);
  await page.keyboard.press('Escape');
  await page.screenshot({path:`artifacts/refuge-shadow-player-${width}.png`});
  const npcOrder=await page.evaluate(()=>{
   const {simulation:s,renderer:r}=window.atoll,e=s.section.entities[0],host={...structuredClone(s.player),id:'npc-host',x:e.x,y:e.y-35,satiated:120};
   e.ecology.host=host.id;e.activity='shadowing';s.section.entities=[host,e];s.player.x=1400;s.player.y=90;
   const ids=[],draw=r.drawCreature;r.drawCreature=function(ctx,a,...args){ids.push(a.id);return draw.call(this,ctx,a,...args);};
   try{r.draw(s,0);}finally{r.drawCreature=draw;}
   return {guest:ids.indexOf(e.id),host:ids.indexOf(host.id),draws:ids.filter(id=>id===e.id).length};
  });
  expect(npcOrder.guest).toBeGreaterThanOrEqual(0);expect(npcOrder.guest).toBeLessThan(npcOrder.host);expect(npcOrder.draws).toBe(1);
  const clearance=await page.evaluate(async()=>{const {overlaps}=await import('/src/world-labels.js'),r=window.atoll.renderer;return {protectedIds:r.labelObstacles.filter(o=>o.id).map(o=>o.id),covered:r.labelLayout.some(l=>r.labelObstacles.some(o=>overlaps(l,o)))};});
  expect(clearance.protectedIds).toContain('shadow-guest');expect(clearance.protectedIds).toContain('npc-host');expect(clearance.covered).toBe(false);
 }
});
