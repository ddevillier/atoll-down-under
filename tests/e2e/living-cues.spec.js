import {test,expect} from '@playwright/test';
import {clickButton} from '../../scripts/ui-actions.mjs';

test('ordinary reef feedback stays visual; explicit food hints and inspection remain available',async({page})=>{
 for(const [width,height] of [[1600,900],[1024,768]]){
  await page.setViewportSize({width,height});await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
  await clickButton(page,{name:/Practice/});await page.getByRole('searchbox').fill('Coral grouper');await page.getByRole('option').first().click();await clickButton(page,{name:'Enter the reef'});
  await page.mouse.move(5,5);await page.waitForTimeout(700);
  expect(await page.evaluate(()=>window.atoll.renderer.labelLayout.map(l=>l.text))).toEqual([]);
  await page.keyboard.press('h');await expect.poll(()=>page.evaluate(()=>window.atoll.renderer.foodHints)).toBe(true);
  await page.keyboard.press('h');await expect.poll(()=>page.evaluate(()=>window.atoll.renderer.foodHints)).toBe(false);
  await page.keyboard.press('Escape');
  await expect.poll(()=>page.evaluate(()=>window.atoll.renderer.labelLayout.some(l=>l.text.startsWith('Shelter')))).toBe(true);
 }
});

test('outcome marks never generate text or alter the world, and freeze while paused',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 const result=await page.evaluate(async()=>{
  const {Simulation}=await import('/src/simulation.js'),s=new Simulation(42);s.start('practice','s16');
  const r=window.atoll.renderer;r.syncScene(s);r.inspect=false;r.hover=null;r.foodHints=false;
  const before=JSON.stringify(s.serialize());
  for(const [i,type]of ['eat','clean','reunion','homecoming','notice','release','discovery'].entries())r.addEffect(type,300+i*100,230,'Unwanted text');
  r.draw(s,.15);const labels=r.labelLayout.map(l=>l.text),ages=r.effects.map(e=>e.t),after=JSON.stringify(s.serialize());
  s.paused=true;r.draw(s,.5);const frozen=r.effects.map(e=>e.t);r.reducedMotion=true;r.draw(s,.5);
  return {labels,ages,frozen,worldUnchanged:before===after,held:r.effects.map(e=>e.t),marker:r.playerMarker};
 });
 expect(result.labels).toEqual([]);expect(result.worldUnchanged).toBe(true);expect(result.ages.every(t=>t===.15)).toBe(true);expect(result.frozen).toEqual(result.ages);expect(result.held).toEqual(result.ages);expect(result.marker).toBeTruthy();
});

test('signed display frame and visible resident mouth remain consistent through a turn',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 const result=await page.evaluate(async()=>{
  const {BY_ID}=await import('/src/data.js'),{displayedMouthPoint}=await import('/src/feeding-contact.js');
  const r=window.atoll.renderer,e={id:'display-review',incarnation:0,species:BY_ID.s16,x:800,y:350,facing:1,angle:0,alive:true,health:70};
  r.poses.clear();r.drawCreature(r.ctx,e,1,1/60);e.facing=-1;e.angle=Math.PI;
  for(let i=0;i<12;i++)r.drawCreature(r.ctx,e,1+i/60,1/60);
  const frame=r.poses.get(e.id).frame,point=displayedMouthPoint(e,frame);
  return {facing:frame.facing,finite:[point.x,point.y,frame.x,frame.width].every(Number.isFinite),compressed:frame.width<e.species.size,offset:Math.hypot(point.x-frame.x,point.y-frame.y),width:frame.width};
 });
 expect(result.finite).toBe(true);expect(result.facing).not.toBe(0);expect(result.offset).toBeLessThan(result.width*.6+30);
});
