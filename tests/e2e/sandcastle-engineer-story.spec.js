import {test,expect} from '@playwright/test';
import {clickButton} from '../../scripts/ui-actions.mjs';
import {Simulation} from '../../src/simulation.js';
import {beginStory,storyAction,stopStory} from '../../src/reef-stories.js';
import {exportDive,importDive} from '../../src/save-files.js';

const ticks=(s,seconds)=>{for(let i=0;i<Math.ceil(seconds*60);i++)s.step(1/60);};
function scene(){
 const s=new Simulation(42);s.start('practice','s15');s.current=0;s.section.entities=[];
 const [a,b]=s.section.food.filter(f=>f.food==='algae');Object.assign(a,{x:700,y:350});Object.assign(b,{x:1100,y:350});
 Object.assign(s.player,{x:a.x,y:a.y,still:1,target:null,feeding:null});s.pointer={x:a.x,y:a.y};
 expect(beginStory(s)).toBe(true);return {s,a,b};
}

test('Engineer integration keeps real algae changes, gradual sand and spatial rest across portable saves',()=>{
 const {s,a}=scene(),coral=s.section.food.find(f=>f.food==='coral');const coralBefore=coral.amount;
 s.consume(a);const p=s.reefStories.engineer.patches[0];
 expect(a.amount).toBe(65);expect(p.after).toBe(65);expect(p.sand).toBe(0);expect(p.deposit).toBe(.35);
 ticks(s,.5);expect(p.sand).toBeGreaterThan(0);expect(p.sand).toBeLessThan(.35);expect(a.amount).toBe(65);
 expect(storyAction(s,'engineer-rest')).toBe(true);ticks(s,20);
 expect(a.amount).toBeGreaterThanOrEqual(85);expect(s.reefStories.engineer.returned).toBe(false);
 expect(s.reefStories.engineer.complete).toBe(false);expect(coral.amount).toBe(coralBefore);
 Object.assign(s.player,{x:a.x+300,y:a.y,still:0});s.point(s.player.x,s.player.y);ticks(s,.1);
 expect(s.reefStories.engineer.departed).toBe(true);expect(s.reefStories.engineer.returned).toBe(false);
 const saved=s.serialize(),restored=importDive(exportDive(s,'Engineer revisit')).simulation;
 expect(restored.serialize()).toBe(saved);const paused=restored.serialize();restored.step(50);expect(restored.serialize()).toBe(paused);
 restored.paused=false;Object.assign(restored.player,{x:a.x+70,y:a.y,still:1,target:null,feeding:null});restored.point(restored.player.x,restored.player.y);ticks(restored,.1);
 expect(restored.reefStories.engineer.returned).toBe(true);expect(restored.reefStories.engineer.neighborMeal).toBe(false);
 for(const [field,value] of [['sand',4.1],['deposit',.81],['algae',101],['quiet',9]]){
  const bad=JSON.parse(saved);bad.reefStories.engineer.patches[0][field]=value;expect(()=>Simulation.restore(bad)).toThrow();
 }
 const old=JSON.parse(saved);delete old.reefStories;const legacy=Simulation.restore(old);expect(legacy.reefStories.active).toBeNull();expect(legacy.reefStories.engineer).toBeNull();
});

test('Engineer integration records a second actual meal and preserves bounded repeated grazing',()=>{
 const {s,a,b}=scene();s.consume(a);Object.assign(s.player,{x:a.x+300,y:a.y,still:0});s.point(s.player.x,s.player.y);ticks(s,.1);
 s.player.biteCooldown=0;s.consume(b);expect(b.amount).toBe(65);expect(s.reefStories.engineer.visitedOther).toBe(true);
 ticks(s,19);expect(s.reefStories.engineer.returned).toBe(false);
 Object.assign(s.player,{x:a.x+70,y:a.y,still:1,target:null,feeding:null});s.point(s.player.x,s.player.y);ticks(s,.1);expect(s.reefStories.engineer.returned).toBe(true);
 for(let i=0;i<120;i++){a.amount=100;a.regrow=0;s.player.biteCooldown=0;s.consume(a);ticks(s,.05);}
 for(let i=0;i<20;i++){a.amount=100;a.regrow=0;s.player.biteCooldown=0;s.consume(a);ticks(s,2);}
 const p=s.reefStories.engineer.patches.find(p=>p.id===a.id);expect(p.sand).toBe(4);expect(p.deposit).toBeLessThanOrEqual(.8);expect(p.meals).toBe(100);expect(s.reefStories.engineer.patches.length).toBeLessThanOrEqual(7);
 expect(()=>Simulation.restore(s.serialize())).not.toThrow();expect(stopStory(s)).toBe(true);s.player.biteCooldown=0;s.consume(a);ticks(s,.1);expect(p.algae).toBe(a.regrow>0?0:a.amount);const paused=s.serialize();s.paused=true;s.step(50);expect(s.serialize()).toBe(paused);
});

for(const [width,height] of [[1600,900],[1024,768]])test('Engineer real mouse grazing, rest/revisit and existing neighbor meal at '+width,async({page},testInfo)=>{
 test.setTimeout(65000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width,height});
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:/Practice Choose/});
 await page.getByRole('searchbox').fill('Parrotfish');await page.getByRole('option',{name:/^Parrotfish/}).click();await clickButton(page,{name:'Show goal',exact:true});
 // Keep generated food identities and one existing grazer. Place the scene to
 // make mouse contact and the story's actual ecology easy to observe.
 const fixture=await page.evaluate(()=>{
  const s=window.atoll.simulation;s.paused=true;s.current=0;s.destination=null;window.__engineerNeighbor=s.section.entities.filter(e=>e.alive&&e.species.speed>0&&e.species.diet.includes('algae')&&!e.groundRoute&&!e.holdfast&&e.species.ability!=='clean').sort((a,b)=>(b.satiated||0)-(a.satiated||0))[0];s.section.entities=[];
  const [a,b]=s.section.food.filter(f=>f.food==='algae');Object.assign(a,{x:850,y:350,amount:100,regrow:0});Object.assign(b,{x:1150,y:350});
  Object.assign(s.player,{x:660,y:350,angle:0,energy:45,target:null,feeding:null,still:0});s.point(s.player.x,s.player.y);
  return {a:{id:a.id,x:a.x,y:a.y},b:{id:b.id,x:b.x,y:b.y}};
 });
 await page.getByText('Another way to explore',{exact:true}).click();await page.locator('[data-action="story-begin"]').click();await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.reefStories.active)).toBe('engineer');await expect(page.locator('#story-step')).toHaveText('Take an algae meal');await page.screenshot({path:testInfo.outputPath('before-meal.png')});
 await page.evaluate(()=>window.atoll.simulation.paused=false);await page.locator(`[data-action="story-action"][data-story-action="engineer-patch"][data-value="${fixture.a.id}"]`).click();
 const box=await page.locator('#reef').boundingBox(),screen=p=>({x:box.x+p.x/1600*box.width,y:box.y+(p.y+55)/900*box.height});
 const food=screen(fixture.a);await page.mouse.click(food.x,food.y);
 await page.waitForFunction(()=>window.atoll.simulation.reefStories.engineer.first!==null);
 const bitten=await page.evaluate(()=>{const s=window.atoll.simulation;s.paused=true;const p=s.reefStories.engineer.patches[0],f=s.section.food.find(f=>f.id===p.id);return {amount:f.amount,energy:s.player.energy,sand:p.sand,deposit:p.deposit,meals:p.meals};});
 expect(bitten.amount).toBe(65);expect(bitten.energy).toBeGreaterThan(45);expect(bitten.meals).toBe(1);expect(bitten.sand).toBeLessThan(.35);expect(bitten.deposit).toBeGreaterThan(0);await expect(page.locator('#story-step')).toHaveText('Give the patch a rest');await expect(page.locator('#story-detail')).toContainText('compressed game time');await page.screenshot({path:testInfo.outputPath('after-meal.png')});
 await page.evaluate(()=>window.atoll.simulation.paused=false);await page.locator('[data-action="story-action"][data-story-action="engineer-rest"]').click();
 const rested=await page.evaluate(()=>{
  const s=window.atoll.simulation,p=s.reefStories.engineer.patches[0],f=s.section.food.find(f=>f.id===p.id);
  s.paused=false;Object.assign(s.player,{x:p.x+300,y:p.y,still:0,target:null,feeding:null});s.point(s.player.x,s.player.y);
  for(let i=0;i<7*60;i++)s.step(1/60);const before=f.amount;for(let i=0;i<12*60;i++)s.step(1/60);s.paused=true;
  return {before,amount:f.amount,sand:p.sand,deposit:p.deposit,returned:s.reefStories.engineer.returned,complete:s.reefStories.engineer.complete};
 });
 expect(rested.before).toBe(65);expect(rested.amount).toBeGreaterThanOrEqual(85);expect(rested.sand).toBeCloseTo(.35,4);expect(rested.deposit).toBe(0);expect(rested.returned).toBe(false);expect(rested.complete).toBe(false);await expect(page.locator('#story-step')).toHaveText('Return to your first patch');await page.screenshot({path:testInfo.outputPath('renewed-patch.png')});
 await page.evaluate(()=>window.atoll.simulation.paused=false);const revisit=screen({x:fixture.a.x-180,y:fixture.a.y});await page.mouse.move(revisit.x,revisit.y);
 await page.waitForFunction(()=>window.atoll.simulation.reefStories.engineer.returned,null,{timeout:15000});await expect(page.locator('#story-step')).toHaveText('Invite a browsing neighbor');await page.locator('[data-action="pause"]') .click();expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(true);
 // Use an already generated reef grazer; its real approach and mouth contact
 // must change the same resource. No timer or new animal can satisfy this check.
 const neighbor=await page.evaluate(async()=>{
  const {contactGap}=await import('/src/feeding-contact.js');
  const s=window.atoll.simulation,p=s.reefStories.engineer.patches[0],f=s.section.food.find(f=>f.id===p.id);
  const e=window.__engineerNeighbor;Object.assign(e,{x:p.x+500,y:p.y,angle:Math.PI,health:100,target:null,feeding:null,think:0,biteCooldown:0,behavior:'Exploring',stun:0,cleanTime:0,cleanerTarget:null,hidden:false,actionTime:0});
  s.section.entities=[e];s.paused=true;const stepNpc=s.stepNpc.bind(s);s.stepNpc=(animal,dt,plan)=>{const before=f.amount,was=s.reefStories.engineer.neighborMeal;stepNpc(animal,dt,plan);if(!was&&s.reefStories.engineer.neighborMeal)window.__engineerNeighborBite={before,after:f.amount,gap:contactGap(animal,f)};};return {id:e.id,x:e.x,y:e.y,satiated:e.satiated||0,rest:e.rest||0,amount:f.amount,count:s.section.entities.length};
 });
 expect(neighbor.satiated).toBeGreaterThan(0);const invite=page.getByRole('button',{name:'Invite a browsing neighbor',exact:true});await expect(invite).toHaveAttribute('data-story-action','engineer-watch');
 const frozen=await page.evaluate(()=>window.atoll.simulation.serialize());await invite.click();await page.waitForTimeout(200);expect(await page.evaluate(()=>window.atoll.simulation.serialize())).toBe(frozen);expect(await page.evaluate(()=>window.atoll.simulation.reefStories.engineer.invited)).toBe(false);
 await page.locator('[data-action="pause"]').click();expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(false);await invite.click();
 const invited=await page.evaluate(()=>{const s=window.atoll.simulation,e=s.section.entities[0];return {invited:s.reefStories.engineer.invited,neighbor:s.reefStories.engineer.neighbor?.id,x:e.x,y:e.y,satiated:e.satiated,rest:e.rest||0};});
 expect(invited.invited).toBe(true);expect(invited.neighbor).toBe(neighbor.id);expect(Math.hypot(invited.x-neighbor.x,invited.y-neighbor.y)).toBeLessThan(20);expect(invited.satiated).toBeGreaterThan(neighbor.satiated-.5);expect(invited.satiated).toBeLessThanOrEqual(neighbor.satiated);expect(invited.rest).toBeLessThanOrEqual(neighbor.rest);
 try{await page.waitForFunction(()=>window.atoll.simulation.reefStories.engineer.complete,null,{timeout:40000});}catch(error){console.log('Engineer neighbor diagnostic',await page.evaluate(()=>{const s=window.atoll.simulation;return JSON.stringify({story:s.reefStories.engineer,player:{x:s.player.x,y:s.player.y,target:s.player.target,pointer:s.pointer},neighbor:s.section.entities[0]});}));throw error;}
 const complete=await page.evaluate(()=>{const s=window.atoll.simulation;s.paused=true;const p=s.reefStories.engineer.patches[0],f=s.section.food.find(f=>f.id===p.id),e=s.section.entities[0];return {amount:f.amount,count:s.section.entities.length,neighbor:s.reefStories.engineer.neighbor?.id,neighborMeal:s.reefStories.engineer.neighborMeal,satiated:e.satiated,patchRest:f.patchRest,complete:s.reefStories.engineer.complete,bite:window.__engineerNeighborBite};});
 expect(complete.neighborMeal).toBe(true);expect(complete.complete).toBe(true);expect(complete.count).toBe(neighbor.count);expect(complete.neighbor).toBe(neighbor.id);expect(complete.bite.before-complete.bite.after).toBe(12);expect(complete.bite.gap).toBeLessThanOrEqual(3);expect(complete.amount).toBeLessThan(neighbor.amount);expect(complete.satiated).toBeGreaterThan(40);expect(complete.patchRest).toBeGreaterThan(7);await expect(page.locator('#story-step')).toHaveText('A changed patch, shared again');await expect(page.locator('#story-record')).toHaveText('Discovered');await page.screenshot({path:testInfo.outputPath('shared-patch.png')});
 expect(await page.locator('body').evaluate(e=>e.scrollWidth<=window.innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});
