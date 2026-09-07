import {clickButton} from '../../scripts/ui-actions.mjs';
import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
async function ready(page){await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);}

test('cleaner queues spread waiting fish and complete after a temporary interruption',async({page})=>{
 for(const [species,width,height] of [['Neon',1024,768],['Flashlight',1600,900]]){
  await page.setViewportSize({width,height});await ready(page);await practice(page,species);
  await page.keyboard.press('Escape');
  await page.evaluate(()=>{
   const s=window.atoll.simulation,c=s.section.entities.find(e=>e.species.ability==='clean');
   Object.assign(c,{x:800,y:300,station:{x:800,y:300},stun:6});
   const clients=Array.from({length:3},(_,i)=>({...structuredClone(s.player),id:'queue-'+i,x:835,y:300,health:40,target:c.id,cleanTime:i===0?.5:0,angle:0}));
   s.section.entities=[c,...clients];s.section.food=[];
   Object.assign(s.player,{x:1000,y:400,health:40});s.pointer={x:1000,y:400};
  });
  await page.getByRole('button',{name:'Visit cleaner',exact:true}).click();
  const waiting=await page.evaluate(()=>{
   const s=window.atoll.simulation;for(let i=0;i<240;i++)s.step(1/60);s.paused=true;
   const clients=[s.player,...s.section.entities.filter(e=>e.id.toString().startsWith('queue-'))];
   return {health:s.player.health,minGap:Math.min(...clients.flatMap((a,i)=>clients.slice(i+1).map(b=>Math.hypot(a.x-b.x,a.y-b.y))))};
  });
  expect(waiting.health).toBe(40);expect(waiting.minGap).toBeGreaterThan(40);
  await page.waitForTimeout(100);await page.screenshot({path:`artifacts/cleaner-queue-${species}-${width}.png`});
  const completed=await page.evaluate(()=>{
   const s=window.atoll.simulation,c=s.section.entities[0];c.stun=0;s.paused=false;
   for(let i=0;i<1800;i++)s.step(1/60);s.paused=true;
   return {health:s.player.health,clients:s.section.entities.slice(1).map(e=>e.health),cleanerAlive:c.alive};
  });
  expect(completed.health).toBe(100);expect(completed.cleanerAlive).toBe(true);
  expect(completed.clients.every(h=>h>95)).toBe(true);
 }
});

for(const [species,byClick] of [['Neon',false],['Flashlight',true]])test(`cleaner visits are visible, cancellable and safe for ${species}`,async({page})=>{
 for(const [width,height] of [[1024,768],[1600,900]]){
  await page.setViewportSize({width,height});await ready(page);await practice(page,species);
  await page.keyboard.press('Escape');
  const cleaner=await page.evaluate(()=>{
   const s=window.atoll.simulation,c=s.section.entities.find(e=>e.species.ability==='clean');
   Object.assign(c,{x:800,y:300,station:{x:800,y:300}});s.section.entities=[c];s.section.food=[];
   Object.assign(s.player,{x:650,y:300,angle:0,health:55,biteDamage:15,energy:45,recoveryDelay:60});s.pointer={x:650,y:300};
   return {x:c.x,y:c.y};
  });
  await page.keyboard.press('Escape');
  const box=await page.locator('#reef').boundingBox();
  if(byClick)await page.mouse.click(box.x+cleaner.x/1600*box.width,box.y+(cleaner.y+55)/900*box.height);
  else await page.getByRole('button',{name:'Visit cleaner',exact:true}).click();
  await expect(page.locator('#state-badge')).toContainText('Visiting');
  await page.waitForFunction(()=>window.atoll.simulation.player.cleanTime>.2);
  await page.keyboard.press('Escape');
  const during=await page.evaluate(()=>{const s=window.atoll.simulation;return {health:s.player.health,alive:s.section.entities[0].alive,target:s.player.target};});
  expect(during.health).toBeGreaterThan(55);expect(during.health).toBeLessThan(85);expect(during.alive).toBe(true);expect(during.target).toBeNull();
  await page.screenshot({path:`artifacts/cleaner-${species}-${width}.png`});
  const buttons=await page.locator('.actions button').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,right:r.right};}));
  expect(buttons.every(r=>r.x>=0&&r.right<=width)).toBe(true);
  await page.keyboard.press('Escape');await page.mouse.move(box.x+1100/1600*box.width,box.y+400/900*box.height);
  expect(await page.evaluate(()=>window.atoll.simulation.player.cleanerTarget)).toBeNull();
  await page.keyboard.press('c');
  await page.waitForFunction(()=>window.atoll.simulation.player.health===85);
  await expect(page.locator('.toast')).toContainText('Parasites removed');
  expect(await page.evaluate(()=>window.atoll.simulation.player.biteDamage)).toBe(15);
  await page.getByRole('button',{name:'Visit cleaner',exact:true}).click();await expect(page.locator('.toast')).toContainText('No parasites to remove');
 }
});

test('a food patch beside a poisonous animal can be inspected and eaten with the mouse',async({page})=>{
 for(const [width,height] of [[1600,900],[1024,768]]){
  await page.setViewportSize({width,height});await ready(page);await practice(page,'Foxface');
  await page.keyboard.press('Escape');
  await page.evaluate(()=>{
   const s=window.atoll.simulation,food=s.section.food.find(f=>f.food==='algae'),slug=s.section.entities.find(e=>e.species.id==='s60');
   Object.assign(food,{x:500,y:300,amount:100,regrow:0});
   Object.assign(slug,{x:518,y:300,stun:99});
   s.section.food=[food];s.section.entities=[slug];
   Object.assign(s.player,{x:400,y:300,energy:50,target:null});s.pointer={x:400,y:300};
  });
  const box=await page.locator('#reef').boundingBox(),x=box.x+500/1600*box.width,y=box.y+355/900*box.height;
  await page.mouse.click(x,y);
  await expect(page.locator('.inspect-card h3')).toHaveText('Algae');
  await page.screenshot({path:`artifacts/food-selection-inspect-${width}.png`});
  await page.keyboard.press('Escape');
  await page.mouse.click(x,y);
  await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.section.food[0].amount)).toBeLessThan(100);
  expect(await page.evaluate(()=>window.atoll.simulation.player.poisonDamage)).toBe(0);
  expect(await page.evaluate(()=>window.atoll.simulation.section.entities[0].alive)).toBe(true);
  await page.screenshot({path:`artifacts/food-selection-meal-${width}.png`});
 }
});

test('shelter feedback explains fit and hiding without changing protection rules',async({page})=>{
 for(const [width,height] of [[1600,900],[1024,768]]){
  await page.setViewportSize({width,height});await ready(page);await practice(page,'Neon');
  const badge=page.locator('#state-badge');
  await expect(badge).toContainText('Eating, active abilities or travel end protection');
  await page.evaluate(async()=>{
   const s=window.atoll.simulation,{REEFS}=await import('/src/data.js'),area=REEFS[s.current].shelters[0];
   s.section.entities=[];s.section.food=[];s.protected=false;
   Object.assign(s.player,{x:area.x,y:area.y+area.r*.8,still:0});s.pointer={x:s.player.x,y:s.player.y};
  });
  await expect(badge).toContainText('Hidden · Stay still to avoid being seen');
  await page.keyboard.press('Escape');
  await page.screenshot({path:`artifacts/shelter-small-${width}.png`});
  await page.evaluate(()=>{
   const s=window.atoll.simulation;s.player.species={...s.player.species,size:150};s.player.hidden=false;
  });
  await page.screenshot({path:`artifacts/shelter-large-${width}.png`});
  await page.keyboard.press('Escape');
  await expect(badge).toContainText('This shelter is too small for your fish');
  const bounds=await badge.boundingBox();expect(bounds.x).toBeGreaterThanOrEqual(0);expect(bounds.x+bounds.width).toBeLessThanOrEqual(width);
  await expect(page.locator('.controls-hint')).toBeHidden();
  await page.keyboard.press('Space');
  await expect(badge).toContainText('too small');
  expect(await page.evaluate(()=>window.atoll.simulation.player.hidden)).toBe(false);
 }
});

test('named dive files round-trip through download and import without overwriting other slots',async({page})=>{
 await ready(page);await practice(page,'Foxface');await clickButton(page,{name:'Save / load'});
 await page.getByLabel('Dive name').fill('Zoë’s <reef> 🐠');
 await page.getByRole('button',{name:'Save here'}).first().click();
 const otherSlot=await page.evaluate(()=>localStorage.getItem('atoll-save-1'));
 for(const [width,height] of [[1600,900],[1024,768]]){
  await page.setViewportSize({width,height});
  expect(await page.locator('.panel-body').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
  await page.screenshot({path:`artifacts/saved-dives-${width}.png`});
 }
 const downloading=page.waitForEvent('download');await page.getByRole('button',{name:'Export dive file'}).click();
 const download=await downloading;expect(download.suggestedFilename()).toBe('Zoë’s -reef- 🐠.atoll');
 const raw=await fs.readFile(await download.path(),'utf8'),file=JSON.parse(raw);
 expect(file.name).toBe('Zoë’s <reef> 🐠');
 await page.getByRole('button',{name:'Done',exact:true}).click();
 await page.evaluate(()=>{window.atoll.simulation.score=12345;});
 await clickButton(page,{name:'Save / load'});
 await page.locator('#dive-file').setInputFiles({name:'broken.atoll',mimeType:'application/json',buffer:Buffer.from('{}')});
 await expect(page.getByRole('status')).toContainText('not a supported');
 expect(await page.evaluate(()=>window.atoll.simulation.score)).toBe(12345);
 await expect(page.getByRole('button',{name:'Import dive file'})).toBeFocused();
 await page.locator('#dive-file').setInputFiles({name:'reef.atoll',mimeType:'application/json',buffer:Buffer.from(raw)});
 await expect(page.getByRole('dialog')).toContainText('Open this dive?');
 expect(await page.evaluate(()=>window.atoll.simulation.score)).toBe(12345);
 await page.getByRole('button',{name:'Back',exact:true}).click();
 expect(await page.evaluate(()=>window.atoll.simulation.score)).toBe(12345);
 await page.locator('#dive-file').setInputFiles({name:'reef.atoll',mimeType:'application/json',buffer:Buffer.from(raw)});
 await page.getByRole('button',{name:'Open dive',exact:true}).click();
 expect(await page.evaluate(()=>window.atoll.simulation.score)).toBe(file.state.score);
 expect(await page.evaluate(()=>localStorage.getItem('atoll-save-1'))).toBe(otherSlot);
 await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:'Saved dives'});
 await expect(page.locator('.save-row').first()).toContainText('Zoë’s <reef> 🐠');
 await page.locator('.save-row').first().getByRole('button',{name:'Load dive'}).click();
 await clickButton(page,{name:'Save / load'});await expect(page.getByLabel('Dive name')).toHaveValue('Zoë’s <reef> 🐠');
});

test('Tournament previews every life in the actual play order and supports keyboard scrolling',async({page})=>{
 for(const [width,height] of [[1600,900],[1024,768]]){
  await page.setViewportSize({width,height});await ready(page);
  await clickButton(page,{name:/Tournament Journey/});
  const roster=page.getByRole('region',{name:'Your 55 lives, in order'});
  const names=await roster.locator('li').evaluateAll(rows=>rows.map(r=>r.firstChild.textContent));
  expect(names).toHaveLength(55);expect(new Set(names).size).toBe(55);
  await expect(roster.locator('[aria-current="step"]')).toContainText(names[0]);
  await expect(page.locator('.journey-layout .species-detail h3')).toHaveText(names[0]);
  await roster.focus();await page.keyboard.press('End');
  await expect.poll(()=>roster.evaluate(e=>Math.abs(e.scrollHeight-e.clientHeight-e.scrollTop))).toBeLessThan(2);
  await expect(roster.locator('li').last()).toHaveText('Great white shark');
  expect(await page.locator('.panel-body').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
  await page.keyboard.press('Home');
  await expect.poll(()=>roster.evaluate(e=>e.scrollTop)).toBe(0);
  await page.screenshot({path:`artifacts/tournament-preview-${width}.png`});
  await clickButton(page,{name:'Begin the journey',exact:true});
  const played=await page.evaluate(async()=>{const {BY_ID}=await import('/src/data.js');return window.atoll.simulation.sequence.map(id=>BY_ID[id].name);});
  expect(played).toEqual(names);
  expect(await page.evaluate(()=>window.atoll.simulation.player.species.name)).toBe(names[0]);
 }
});

test('fullscreen controls are available from the title, dive and settings',async({page})=>{
 await ready(page);await clickButton(page,{name:'Fullscreen',exact:true});
 await page.waitForFunction(()=>!!document.fullscreenElement);
 await practice(page,'Foxface');
 await expect(page.getByRole('button',{name:'Leave fullscreen',exact:true})).toBeVisible();
 await clickButton(page,{name:'Leave fullscreen',exact:true});
 await page.waitForFunction(()=>!document.fullscreenElement);
 await clickButton(page,{name:'Settings',exact:true});
 await expect(page.getByRole('dialog')).toContainText('Escape still pauses your dive');
 await page.getByRole('dialog').getByRole('button',{name:'Fullscreen',exact:true}).click();
 await page.waitForFunction(()=>!!document.fullscreenElement);
 await expect(page.getByRole('dialog').getByRole('button',{name:'Leave fullscreen',exact:true})).toBeFocused();
 await page.getByRole('dialog').getByRole('button',{name:'Leave fullscreen',exact:true}).click();
 await clickButton(page,{name:'Done',exact:true});
 for(const [width,height] of [[1600,900],[1024,768]]){
  await page.setViewportSize({width,height});
  expect(await page.locator('.topbar').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
  await page.screenshot({path:`artifacts/fullscreen-controls-${width}.png`});
 }
});

test('the reef map plans an ordinary swim and saves its destination',async({page})=>{
 test.setTimeout(60000);
 for(const [width,height] of [[1600,900],[1024,768]]){
  await page.setViewportSize({width,height});await ready(page);await practice(page,'Foxface');
  await page.getByRole('button',{name:/Open reef map/}).click();
  await expect(page.getByRole('dialog')).toContainText('1 of 9 habitats visited');
  await expect(page.locator('.reef-map-tile')).toHaveCount(9);
  expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(true);
  await page.locator('.reef-map-tile[data-reef="6"]').click();
  await expect(page.locator('.reef-map-detail')).toContainText('Seagrass');
  await expect(page.locator('.reef-map-detail')).toContainText('Swim left');
  await expect(page.locator('.reef-map-detail')).toContainText('Swim down');
  expect(await page.locator('.panel-body').evaluate(el=>el.scrollHeight<=el.clientHeight+1)).toBe(true);
  await page.screenshot({path:`artifacts/reef-map-${width}.png`});
  const before=await page.evaluate(()=>{const s=window.atoll.simulation;return {x:s.player.x,y:s.player.y,current:s.current,energy:s.player.energy};});
  await clickButton(page,{name:'Guide my swim'});
  expect(await page.evaluate(()=>{const s=window.atoll.simulation;return {x:s.player.x,y:s.player.y,current:s.current,energy:s.player.energy};})).toEqual(before);
  await expect(page.locator('#state-badge')).toContainText('Swim left to Sea Fan Garden');
  await page.keyboard.press('Control+s');await ready(page);await clickButton(page,{name:'Saved dives'});await clickButton(page,{name:'Load dive'});
  expect(await page.evaluate(()=>window.atoll.simulation.destination)).toBe(6);
  await page.evaluate(()=>{const s=window.atoll.simulation;for(const section of s.sections)section.entities=[];Object.assign(s.player,{x:120,y:350,angle:Math.PI});s.point(120,350);});
  const box=await page.locator('#reef').boundingBox();
  await page.mouse.move(box.x+14/1600*box.width,box.y+405/900*box.height);
  await page.waitForFunction(()=>window.atoll.simulation.current===3,null,{timeout:5000});
  await expect(page.locator('#state-badge')).toContainText('Swim down to Seagrass Meadow');
  const arrivalX=await page.evaluate(()=>window.atoll.simulation.player.x);
  await page.mouse.move(box.x+arrivalX/1600*box.width,box.y+781/900*box.height);
  await page.waitForFunction(()=>window.atoll.simulation.current===6,null,{timeout:7000});
  await expect(page.locator('.toast')).toContainText('Reached Seagrass Meadow. 3 of 9 habitats visited');
  expect(await page.evaluate(()=>window.atoll.simulation.destination)).toBeNull();
  await page.keyboard.press('m');await expect(page.getByRole('dialog')).toContainText('3 of 9 habitats visited');
  await expect(page.locator('.reef-map-tile[aria-current="location"]')).toContainText('Seagrass Meadow');
  await page.locator('.reef-map-tile[data-reef="6"]').focus();await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.reef-map-tile[data-reef="8"]')).toBeFocused();
  await page.keyboard.press('Enter');await expect(page.locator('.reef-map-detail')).toContainText('Quiet Grotto');
  await clickButton(page,{name:'Guide my swim'});await page.keyboard.press('m');await clickButton(page,{name:'Clear route'});
  expect(await page.evaluate(()=>window.atoll.simulation.destination)).toBeNull();
  await page.screenshot({path:`artifacts/reef-map-visited-${width}.png`});
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.locator('#reef')).toBeFocused();
 }
});

test('a pufferfish can feed on the crabs and snails offered by its diet',async({page})=>{
 await ready(page);await practice(page,'Spotted pufferfish');
 const meals=await page.evaluate(()=>{
  const s=window.atoll.simulation;
  s.section.entities=s.section.entities.filter(e=>['s46','s61'].includes(e.species.id));s.section.food=[];
  const crab=s.section.entities[0];Object.assign(s.player,{x:crab.x-160,y:crab.y,angle:0,energy:40});s.point(s.player.x,s.player.y);
  return s.section.entities.map(e=>({id:e.id,x:e.x,y:e.y}));
 });
 const box=await page.locator('#reef').boundingBox();
 for(const meal of meals){
  await page.mouse.click(box.x+meal.x/1600*box.width,box.y+(meal.y+55)/900*box.height);
  await page.waitForFunction(id=>!window.atoll.simulation.section.entities.find(e=>e.id===id).alive,meal.id,{timeout:15000});
 }
 await page.keyboard.press('Escape');
 expect(await page.evaluate(()=>window.atoll.simulation.player.energy)).toBeGreaterThan(50);
 await expect(page.locator('.toast')).toContainText('A good meal: Spiral snail');
 await page.screenshot({path:'artifacts/puffer-shellfish-meals.png'});
});

test('crushing jaws show their food choices before creation and stay available without activation',async({page})=>{
 test.setTimeout(60000);
 for(const [width,height] of [[1600,900],[1024,768]]){
  await page.setViewportSize({width,height});await ready(page);await clickButton(page,{name:/Create a fish/});
  await page.locator('[data-config="diet"]').selectOption('grazer');
  await page.locator('[data-config="ability"]').selectOption('crush');
  await expect(page.locator('#created-diet')).toContainText('Coral polyps');
  await expect(page.locator('#created-diet')).not.toContainText('crabs');
  await page.locator('[data-config="diet"]').selectOption('hunter');
  await expect(page.locator('#created-diet')).toContainText('crabs · snails · urchins');
  await page.locator('[data-config="diet"]').selectOption('omnivore');
  await expect(page.locator('#created-diet')).toContainText('Algae · Small shrimp · Sand worm · Plankton · crabs · snails · urchins');
  await page.locator('[data-config="ability"]').focus();
  await page.locator('#ability-note').scrollIntoViewIfNeeded();
  await expect(page.locator('#ability-note')).toContainText('no activation or energy cost');
  await page.screenshot({path:`artifacts/crushing-jaws-create-${width}.png`});
  await clickButton(page,{name:'Meet the reef'});
  await expect(page.locator('.passive-ability')).toContainText('Always active');
  await expect(page.locator('[data-action="ability"]')).toHaveCount(0);
  await page.keyboard.press('Space');await expect(page.locator('.toast')).toContainText('Crushing jaws are always available');
  expect(await page.evaluate(()=>{const s=window.atoll.simulation;return {energy:s.player.energy,protected:s.protected,cooldown:s.player.cooldown};})).toEqual({energy:100,protected:true,cooldown:0});
  await page.keyboard.press('Escape');
  const fits=await page.locator('.hud').evaluate(h=>{const b=h.getBoundingClientRect();return [...h.children,...h.querySelectorAll('.diet-reminder,.passive-ability')].every(e=>{const r=e.getBoundingClientRect();return r.left>=b.left&&r.right<=b.right&&r.top>=b.top&&r.bottom<=b.bottom;});});
  expect(fits).toBe(true);await page.screenshot({path:`artifacts/crushing-jaws-hud-${width}.png`});
 }
});

test('feeding shows the chosen meal, actual reward and a diminishing patch at both sizes',async({page})=>{
 test.setTimeout(70000);
 for(const [width,height] of [[1600,900],[1024,768]]){
  await page.setViewportSize({width,height});await ready(page);await practice(page);
  await expect(page.locator('.diet-reminder')).toContainText('Plankton · Algae');
  const site=await page.evaluate(()=>{
   const s=window.atoll.simulation,f=s.section.food.find(f=>f.food==='algae');
   s.section.entities=[];s.section.food=[f];Object.assign(f,{x:300,y:300});
   Object.assign(s.player,{x:900,y:300,angle:Math.PI,energy:40});s.point(900,300);window.atoll.renderer.reducedMotion=true;
   window.foodCoverage=()=>{const c=document.createElement('canvas');c.width=128;c.height=128;const ctx=c.getContext('2d');window.atoll.renderer.drawFood(ctx,{...f,x:64,y:64},0);return Array.from(ctx.getImageData(0,0,128,128).data).filter((a,i)=>i%4===3&&a>25).length;};
   return {x:f.x,y:f.y,full:window.foodCoverage()};
  });
  const box=await page.locator('#reef').boundingBox(),meal={x:box.x+site.x/1600*box.width,y:box.y+(site.y+55)/900*box.height};
  await page.mouse.click(meal.x,meal.y);await expect(page.locator('#state-badge')).toContainText('Approaching Algae');
  await expect(page.locator('.controls-hint')).toBeHidden();
  await page.screenshot({path:`artifacts/feeding-target-${width}.png`});
  await page.mouse.move(box.x+1100/1600*box.width,box.y+305/900*box.height);
  await expect(page.locator('#state-badge')).toBeHidden();expect(await page.evaluate(()=>window.atoll.simulation.mealTarget)).toBeNull();
  await page.mouse.click(meal.x,meal.y);
  await page.evaluate(()=>{window.atoll.simulation.section.food[0].regrow=8;});
  await expect(page.locator('.toast')).toContainText('That meal is no longer available');
  await expect(page.locator('#state-badge')).toBeHidden();
  await page.evaluate(()=>{window.atoll.simulation.section.food[0].regrow=0;});
  await page.mouse.click(meal.x,meal.y);
  await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.section.food[0].amount),{timeout:10000}).toBe(65);
  await page.keyboard.press('Escape');
  expect(await page.evaluate(()=>window.atoll.renderer.effects.find(e=>e.type==='eat')?.label)).toBe('+15 energy');
  expect(await page.evaluate(()=>window.foodCoverage())).toBeLessThan(site.full*.85);
  await page.screenshot({path:`artifacts/feeding-meal-${width}.png`});
  await page.keyboard.press('Escape');
  for(const amount of [30,100]){
   await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.player.biteCooldown)).toBe(0);
   await page.mouse.click(meal.x,meal.y);await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.section.food[0].amount)).toBe(amount);
  }
  await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.section.food[0].regrow)).toBeGreaterThan(0);
  await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.section.food[0].regrow),{timeout:10000}).toBe(0);
  expect(await page.evaluate(()=>window.foodCoverage())).toBe(site.full);
  // A long diet must fit the same HUD without hiding controls or overflowing.
  await ready(page);await practice(page,'Humphead wrasse');await page.keyboard.press('Escape');
  await expect(page.locator('.diet-reminder')).toContainText('crabs · snails · urchins · smaller fish');
  const fits=await page.locator('.hud').evaluate(h=>{const box=h.getBoundingClientRect();return [...h.children,...h.querySelectorAll('.diet-reminder,.tool-button')].every(e=>{const r=e.getBoundingClientRect();return r.left>=box.left&&r.right<=box.right&&r.top>=box.top&&r.bottom<=box.bottom;});});
  expect(fits).toBe(true);await page.screenshot({path:`artifacts/feeding-hud-long-${width}.png`});
 }
});

test('mouse edge travel works at both desktop sizes without a pursuer jumping ahead',async({page})=>{
 test.setTimeout(60000);
 for(const [width,height] of [[1600,900],[1024,768]]){
  await page.setViewportSize({width,height});await ready(page);await practice(page,'Longnose butterflyfish');
  for(const [dx,dy,next] of [[1,0,5],[-1,0,3],[0,1,7],[0,-1,1]]){
   await page.evaluate(({dx,dy})=>{
    const s=window.atoll.simulation,p=s.player,prototype=s.sections.flatMap(r=>r.entities).find(e=>e.species.id==='s50');
    window.travelHunter??=structuredClone(prototype);
    for(const section of s.sections){section.entities=[];section.food=[];}
    s.current=4;s.paused=false;s.protected=false;
    Object.assign(p,{x:dx>0?1480:dx<0?120:800,y:dy>0?620:dy<0?120:350,angle:Math.atan2(dy,dx)+Math.PI*10,health:100,energy:100,biteDamage:0,poisonDamage:0});
    s.point(p.x,p.y);
    const hunter=structuredClone(window.travelHunter);
    Object.assign(hunter,{id:'travel-hunter',x:p.x-dx*220,y:p.y-dy*220,angle:Math.atan2(dy,dx),target:'player',pursuit:0,satiated:0,rest:0,think:1,health:100,alive:true});
    s.section.entities=[hunter];
    const transition=Object.getPrototypeOf(s).transition;
    window.travelCrossing=null;
    s.transition=function(dx,dy){
     const before=Math.hypot(hunter.x-p.x,hunter.y-p.y),changed=transition.call(this,dx,dy);
     if(changed)window.travelCrossing={before,after:Math.hypot(hunter.x-p.x,hunter.y-p.y),entering:hunter.entering};
     return changed;
    };
   },{dx,dy});
   const box=await page.locator('#reef').boundingBox(),x=dx>0?1586:dx<0?14:800,y=dy>0?726:dy<0?14:350;
   await page.mouse.move(box.x+x/1600*box.width,box.y+(y+55)/900*box.height);
   await page.waitForFunction(next=>window.atoll.simulation.current===next,next,{timeout:5000});
   await page.keyboard.press('Escape');
   const result=await page.evaluate(()=>{const s=window.atoll.simulation;return {crossing:window.travelCrossing,injury:s.player.biteDamage,paused:s.paused};});
   expect(result.crossing.after).toBeCloseTo(result.crossing.before,8);expect(result.crossing.after).toBeGreaterThan(180);
   expect(result.crossing.entering).toBe(true);expect(result.injury).toBe(0);expect(result.paused).toBe(true);
  }
  await page.screenshot({path:`artifacts/habitat-travel-${width}.png`});
 }
});

test('a meadow visit supports mouse feeding, resident inspection and a saved return',async({page})=>{
 await ready(page);await practice(page,'Foxface');
 const site=await page.evaluate(()=>{
  const s=window.atoll.simulation;s.transition(-1,0);s.transition(0,1);
  const f=s.section.food.find(f=>f.food==='grass'),resident=s.section.entities.find(e=>e.species.id==='s44');
  // Isolate the interaction from random passing fish, keeping authored sites.
  s.section.entities=[resident];Object.assign(s.player,{x:f.x-160,y:f.y,angle:0,energy:40});s.point(s.player.x,s.player.y);
  return {x:f.x,y:f.y,id:f.id};
 });
 const box=await page.locator('#reef').boundingBox();
 await page.mouse.click(box.x+site.x/1600*box.width,box.y+(site.y+55)/900*box.height);
 await expect.poll(()=>page.evaluate(id=>window.atoll.simulation.section.food.find(f=>f.id===id).amount,site.id)).toBe(65);
 expect(await page.evaluate(()=>window.atoll.simulation.player.energy)).toBeGreaterThan(50);
 await page.keyboard.press('Escape');
 const resident=await page.evaluate(()=>{const e=window.atoll.simulation.section.entities[0];return {x:e.x,y:e.y};});
 await page.mouse.click(box.x+resident.x/1600*box.width,box.y+(resident.y+55)/900*box.height);
 await expect(page.locator('.inspect-card')).toContainText('Yellow seahorse');
 await expect(page.locator('.inspect-card')).toContainText('Among the seagrass');
 await page.screenshot({path:'artifacts/meadow-gameplay.png'});
 await page.keyboard.press('Control+s');await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:'Saved dives'});await clickButton(page,{name:'Load dive'});
 const restored=await page.evaluate(id=>{const s=window.atoll.simulation,f=s.section.food.find(f=>f.id===id);return {habitat:s.current,visited:s.visited,amount:f.amount,x:f.x,y:f.y,holdfast:s.section.entities[0].holdfast,paused:s.paused};},site.id);
 expect(restored).toEqual({habitat:6,visited:[4,3,6],amount:65,x:site.x,y:site.y,holdfast:resident,paused:false});
});

test('a night cleaning visit works while a hungry neighbor forages beside the station',async({page})=>{
 await page.setViewportSize({width:1440,height:810});await ready(page);await practice(page,'flashlight');
 const station=await page.evaluate(()=>{
  const s=window.atoll.simulation,cleaner=s.section.entities.find(e=>e.species.ability==='clean');
  const neighbor=structuredClone(s.player);Object.assign(neighbor,{id:'hungry-neighbor',x:cleaner.x-30,y:cleaner.y,health:100,satiated:0,target:null,think:0});
  s.section.entities=[cleaner,neighbor];
  Object.assign(s.player,{x:cleaner.x+250,y:cleaner.y,health:60,energy:90,angle:Math.PI});
  s.point(s.player.x,s.player.y);s.protected=false;
  return {x:cleaner.station.x+35,y:cleaner.station.y,id:cleaner.id};
 });
 const box=await page.locator('#reef').boundingBox();
 await page.mouse.move(box.x+station.x/1600*box.width,box.y+(station.y+55)/900*box.height);
 await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.player.health),{timeout:10000}).toBeGreaterThan(95);
 expect(await page.evaluate(id=>window.atoll.simulation.section.entities.find(e=>e.id===id).alive,station.id)).toBe(true);
 await page.keyboard.press('Escape');
 const cleaner=await page.evaluate(id=>{const e=window.atoll.simulation.section.entities.find(e=>e.id===id);return {x:e.x,y:e.y};},station.id);
 await page.mouse.click(box.x+cleaner.x/1600*box.width,box.y+(cleaner.y+55)/900*box.height);
 await expect(page.locator('.inspect-card')).toContainText('Banded coral shrimp');
 await expect(page.locator('.inspect-card')).toContainText('A cleaning partner');
 await page.screenshot({path:'artifacts/night-cleaning-visit.png'});
});

test('steering out of a meal approach returns control and a later click still feeds',async({page})=>{
 test.setTimeout(60000);
 for(const [width,height] of [[1600,900],[1024,768]]){
  await page.setViewportSize({width,height});await ready(page);await practice(page);
  const food=await page.evaluate(()=>{
   const s=window.atoll.simulation,f=s.section.food.find(f=>f.food==='algae');
   s.section.entities=[];s.section.food=[f];f.x=300;f.y=300;
   Object.assign(s.player,{x:800,y:300,angle:Math.PI,energy:60});s.point(800,300);
   return {x:f.x,y:f.y,id:f.id};
  });
  const box=await page.locator('#reef').boundingBox();
  const screen=(x,y)=>({x:box.x+x/1600*box.width,y:box.y+(y+55)/900*box.height});
  const meal=screen(food.x,food.y),turn=screen(1100,300);
  await page.mouse.click(meal.x,meal.y);
  await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.player.target)).toBe(food.id);
  await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.player.x)).toBeLessThan(775);
  await page.mouse.move(turn.x,turn.y);
  await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.player.target)).toBeNull();
  await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.player.x)).toBeGreaterThan(850);
  expect(await page.evaluate(()=>window.atoll.simulation.section.food[0].amount)).toBe(100);
  // Observation may add a field note, but cannot queue movement or a meal.
  await page.keyboard.press('Escape');
  const state=()=>page.evaluate(()=>{const s=window.atoll.simulation;return {player:s.player,pointer:s.pointer,time:s.time};});
  const frozen=await state();
  await page.mouse.move(meal.x,meal.y);await page.mouse.click(meal.x,meal.y);
  expect(await state()).toEqual(frozen);
  await page.keyboard.press('Escape');await page.mouse.click(meal.x,meal.y);
  await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.section.food[0].amount),{timeout:10000}).toBe(65);
  await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.player.target)).toBeNull();
  await page.screenshot({path:`artifacts/gameplay-controls-${width}.png`});
 }
});

test('splash uses compact menus and supports keyboard entry to every mode',async({page})=>{
 await ready(page);await page.evaluate(()=>{window.atoll.renderer.reducedMotion=true;window.atoll.renderer.clock=0;});
 for(const [width,height] of [[1600,900],[1024,768]]){
  await page.setViewportSize({width,height});
  await expect(page.locator('.splash-bar')).toBeVisible();await expect(page.locator('.mode-menu')).toHaveCount(0);
  await page.screenshot({path:`artifacts/splash-${width}.png`});
  const game=page.getByText('Game',{exact:true});await game.focus();await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('button',{name:/Practice Choose/})).toBeFocused();
  await page.keyboard.press('ArrowDown');await expect(page.getByRole('button',{name:/Challenge Four/})).toBeFocused();
  await page.keyboard.press('ArrowDown');await expect(page.getByRole('button',{name:/Tournament Journey/})).toBeFocused();
  await page.keyboard.press('ArrowDown');await expect(page.getByRole('button',{name:/Create a fish Shape/})).toBeFocused();
  await page.screenshot({path:`artifacts/splash-menu-${width}.png`});
  await page.keyboard.press('Escape');await expect(game).toBeFocused();await expect(page.locator('.splash-menu[open]')).toHaveCount(0);
 }
 await page.getByText('File',{exact:true}).click();await expect(page.getByRole('button',{name:'Saved dives'})).toBeVisible();
 await page.getByText('Help',{exact:true}).click();await expect(page.getByRole('button',{name:'Field guide'})).toBeVisible();await expect(page.locator('.splash-menu[open]')).toHaveCount(1);
 await page.locator('#reef').click({position:{x:300,y:200}});await expect(page.locator('.splash-menu[open]')).toHaveCount(0);
 await clickButton(page,{name:'Field guide',exact:true});
 await expect(page.locator('.splash-bar')).toHaveAttribute('inert','');
 const stacking=await page.evaluate(()=>({bar:+getComputedStyle(document.querySelector('.splash-bar')).zIndex,overlay:+getComputedStyle(document.querySelector('.overlay')).zIndex}));
 expect(stacking.overlay).toBeGreaterThan(stacking.bar);
 await page.screenshot({path:'artifacts/splash-dialog-1024.png'});
 await clickButton(page,{name:'Return',exact:true});await expect(page.locator('.splash-bar')).not.toHaveAttribute('inert','');
});
async function practice(page,search=null){await clickButton(page,{name:/Practice Choose/});if(search){await page.getByRole('searchbox').fill(search);await page.getByRole('option').first().click();}await clickButton(page,{name:'Enter the reef'});}

test('small creature silhouette edges are inspectable with an immediate close-up',async({page})=>{
 await ready(page);await practice(page,'Silver sprat');await page.keyboard.press('Escape');
 await page.evaluate(()=>{const s=window.atoll.simulation,e=structuredClone(s.player);Object.assign(e,{id:900,x:500,y:240});s.section.entities=[e];s.section.food=[];});
 for(const [width,height] of [[1600,900],[1024,768]]){
  await page.setViewportSize({width,height});
  const box=await page.locator('#reef').boundingBox();
  await page.mouse.click(box.x+520/1600*box.width,box.y+295/900*box.height);
  const portrait=page.getByRole('img',{name:'Close-up illustration of Silver sprat'});
  await expect(portrait).toBeVisible();
  const pixels=await portrait.evaluate(c=>Array.from(c.getContext('2d').getImageData(0,0,c.width,c.height).data).filter((_,i)=>i%4===3).some(a=>a>0));
  expect(pixels).toBe(true);
  await page.screenshot({path:`artifacts/inspect-closeup-${width}.png`});
  await page.getByRole('button',{name:'Field guide entry'}).scrollIntoViewIfNeeded();
  await expect(page.getByRole('button',{name:'Field guide entry'})).toBeVisible();
 }
 await page.keyboard.press('Escape');expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(false);
});

test('health meter distinguishes poisoning from parasite cleaning',async({page})=>{
 await ready(page);await practice(page);
 await page.evaluate(()=>{
  const s=window.atoll.simulation,c=s.section.entities.find(e=>e.species.ability==='clean');s.section.entities=[c];
  s.player.x=c.x+30;s.player.y=c.y;s.point(s.player.x,s.player.y);s.player.health=80;
  s.consume(s.section.food.find(f=>f.food==='sponge'));
 });
 const meter=page.getByRole('meter',{name:'Health',exact:true});
 await expect(meter).toHaveAttribute('aria-valuetext',/20 from parasites.*25 from poison/);
 await expect(meter).toHaveAttribute('aria-valuenow','75',{timeout:5000});
 await expect(meter).toHaveAttribute('aria-valuetext',/0 from parasites.*25 from poison/);
 await expect(meter).toHaveAttribute('title',/Keep Energy at 50/);
});

test('natural history supports scientific-name search and keyboard reading at both desktop sizes',async({page})=>{
 await ready(page);await clickButton(page,{name:'Field guide',exact:true});
 for(const [width,height] of [[1440,810],[1024,768]]){
  await page.setViewportSize({width,height});await page.getByRole('searchbox').fill('Pterapogon');
  await page.getByRole('option').click();
  const summary=page.locator('.natural-history>summary');await summary.focus();await page.keyboard.press('Enter');
  await expect(page.locator('.natural-history')).toHaveAttribute('open','');
  await expect(page.locator('.natural-history-body')).toContainText('Males shelter eggs');
  await page.locator('.history-source>summary').click();
  await expect(page.locator('.history-source .source-url')).toContainText('fisheries.noaa.gov');
  await page.locator('.history-source').scrollIntoViewIfNeeded();
  const bounds=await page.locator('.natural-history-body').evaluate(e=>({scroll:e.scrollWidth,client:e.clientWidth}));
  expect(bounds.scroll).toBeLessThanOrEqual(bounds.client+1);
  await page.screenshot({path:`artifacts/natural-history-${width}.png`});
  await page.getByRole('button',{name:'Return',exact:true}).scrollIntoViewIfNeeded();
  await expect(page.getByRole('button',{name:'Return',exact:true})).toBeVisible();
  await page.getByRole('searchbox').fill('Clown triggerfish');await page.getByRole('option').click();
  await expect(page.locator('.natural-history>summary')).toContainText('Balistoides conspicillum');
 }
});
test('poison feedback updates score and the next-life target together',async({page})=>{
 await ready(page);await practice(page);
 await page.evaluate(()=>{
  const s=window.atoll.simulation;s.mode='tournament';s.score=9000;s.stageScore=4900;
  s.consume(s.section.food.find(f=>f.food==='sponge'));s.paused=true;
 });
 await expect(page.locator('#score')).toHaveText('8,500');
 await expect(page.locator('#goal-label')).toHaveText('600 to next life');
 await expect(page.locator('.toast')).toContainText('Lost 500 points');
 await expect(page.locator('#announcer')).toContainText('Lost 500 points');
});

test('a poisonous meal shows its actual cause in the ending dialog',async({page})=>{
 await ready(page);await practice(page);const food=await page.evaluate(()=>{const s=window.atoll.simulation;s.section.entities=[];const f=s.section.food.find(f=>f.food==='sponge');s.player.health=20;s.player.x=f.x-20;s.player.y=f.y;s.player.angle=0;s.point(s.player.x,s.player.y);return {x:f.x,y:f.y};});
 const box=await page.locator('#reef').boundingBox();await page.mouse.click(box.x+food.x/1600*box.width,box.y+(food.y+55)/900*box.height);
 await expect(page.getByRole('dialog')).toContainText('poisoned by Sponge');await expect(page.getByRole('dialog')).not.toContainText('parasites take over');
});
test('atlas extraction preserves a connected silhouette crossing its nominal cell',async({page})=>{
 await ready(page);const result=await page.evaluate(()=>{
  const c=document.createElement('canvas');c.width=400;c.height=400;const ctx=c.getContext('2d');ctx.fillStyle='#ff8800';
  for(let i=0;i<16;i++){ctx.beginPath();ctx.arc((i%4+.5)*100,(Math.floor(i/4)+.5)*100,18,0,Math.PI*2);ctx.fill();}
  ctx.fillRect(46,278,8,72);const sprites=window.atoll.renderer.extractAtlas(c);return {count:sprites.length,extended:sprites[12].height,neighbor:sprites[8].height};
 });expect(result.count).toBe(16);expect(result.extended).toBeGreaterThan(90);expect(result.neighbor).toBeLessThan(45);
});
test('turn animation preserves continuity and settles on the new direction',async({page})=>{
 await ready(page);const result=await page.evaluate(()=>{const r=window.atoll.renderer,c=document.createElement('canvas'),ctx=c.getContext('2d'),s={index:1,id:'test',speed:100,food:'fish'},e={id:'turn-test',species:s,x:50,y:50,facing:1};r.drawCreature(ctx,e,1,1/60);e.facing=-1;r.drawCreature(ctx,e,1,1/60);const first=r.poses.get(e.id).facing;for(let i=0;i<60;i++)r.drawCreature(ctx,e,1,1/60);return {first,last:r.poses.get(e.id).facing};});
 expect(result.first).toBeGreaterThan(-1);expect(result.first).toBeLessThan(1);expect(result.last).toBeLessThan(-.99);
});
test('food-web connections are navigable and sourced reef lessons fit desktop sizes',async({page})=>{
 await ready(page);await clickButton(page,{name:'Field guide',exact:true});await clickButton(page,{name:'Food web',exact:true});
 await page.getByLabel('Explore a creature').selectOption('s0');await expect(page.locator('.web-center h3')).toHaveText('Silver sprat');await expect(page.locator('.web-resource')).toHaveText('Plankton');
 await clickButton(page,{name:'Coral trout',exact:true});await expect(page.locator('.web-center h3')).toHaveText('Coral trout');await expect(page.getByLabel('Explore a creature')).toBeFocused();
 for(const width of [1440,1024]){
  await page.setViewportSize({width,height:width===1440?810:768});await page.screenshot({path:`artifacts/food-web-${width}.png`});
  expect(await page.locator('.panel-body').evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true);
 }
 await clickButton(page,{name:'Reef life',exact:true});await expect(page.locator('details[open]')).toContainText('A coral polyp is an animal');
 await page.getByText('An animal that filters water',{exact:true}).click();await expect(page.locator('details[open]').last()).toContainText('NOAA Ocean Service');
 await page.screenshot({path:'artifacts/reef-life-1024.png'});
});
test('observation pauses sprite animation as well as the simulation',async({page})=>{
 await ready(page);await practice(page);await page.keyboard.press('Escape');const clock=await page.evaluate(()=>window.atoll.renderer.clock);await page.waitForTimeout(200);expect(await page.evaluate(()=>window.atoll.renderer.clock)).toBe(clock);
 await page.keyboard.press('Escape');await expect.poll(()=>page.evaluate(()=>window.atoll.renderer.clock)).toBeGreaterThan(clock);
});
test('paused observation explains relationships and saves field notes across reloads',async({page})=>{
 await ready(page);await practice(page);await page.keyboard.press('Escape');
 const subject=await page.evaluate(()=>{const s=window.atoll.simulation;const e=s.section.entities.find(e=>e.x<1100&&e.y>100&&e.y<500&&s.findAt(e.x,e.y)===e);return {x:e.x,y:e.y,name:e.species.name};});
 const box=await page.locator('#reef').boundingBox();await page.mouse.click(box.x+subject.x/1600*box.width,box.y+(subject.y+55)/900*box.height);
 await expect(page.locator('.inspect-card')).toContainText(subject.name);await expect(page.locator('.inspect-card')).toContainText('Observation saved');
 expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(true);
 await page.screenshot({path:'artifacts/exploration-inspect.png'});
 await page.keyboard.press('Control+s');await clickButton(page,{name:'Field guide',exact:true});await clickButton(page,{name:'Field notes',exact:true});
 await expect(page.locator('.glossary')).toContainText(subject.name);await page.screenshot({path:'artifacts/exploration-notes.png'});
 await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:'Saved dives'});await clickButton(page,{name:'Load dive'});
 await clickButton(page,{name:'Field guide',exact:true});await clickButton(page,{name:'Field notes',exact:true});await expect(page.locator('.glossary')).toContainText(subject.name);
});
test('all screens load without errors and the complete guide is searchable',async({page})=>{const errors=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);await clickButton(page,{name:'Field guide',exact:true});await expect(page.getByRole('option')).toHaveCount(64);await page.getByRole('searchbox').fill('shark');await expect(page.getByRole('option')).toHaveCount(4);await clickButton(page,{name:'Food & habitats'});await expect(page.getByText('Cleaning partners',{exact:true})).toHaveCount(0);await expect(page.getByText('Plankton',{exact:true})).toBeVisible();await clickButton(page,{name:'Glossary',exact:true});await expect(page.getByText('Symbiosis',{exact:true})).toBeVisible();await clickButton(page,{name:'Return',exact:true});expect(errors).toEqual([]);});
test('mouse movement, clicking food, inspection and resume operate through UI',async({page})=>{await ready(page);await practice(page);const food=await page.evaluate(()=>{const s=window.atoll.simulation;s.section.entities=[];const f=s.section.food.find(f=>f.food==='algae');s.player.x=f.x-30;s.player.y=f.y;s.player.energy=35;s.player.angle=0;s.point(s.player.x,s.player.y);return {x:f.x,y:f.y};});const box=await page.locator('#reef').boundingBox();await page.mouse.click(box.x+food.x/1600*box.width,box.y+(food.y+55)/900*box.height);await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.player.energy)).toBeGreaterThan(45);await page.keyboard.press('Escape');await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.paused)).toBe(true);const time=await page.evaluate(()=>window.atoll.simulation.time);await page.waitForTimeout(350);expect(await page.evaluate(()=>window.atoll.simulation.time)).toBe(time);await clickButton(page,{name:/Continue Esc/});await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.paused)).toBe(false);});
test('an ability activates from Space and saves survive a page reload',async({page})=>{await ready(page);await practice(page,'cuttlefish');await page.keyboard.press('Space');await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.player.cooldown)).toBeGreaterThan(10);expect(await page.evaluate(()=>window.atoll.simulation.period)).toBe('night');await page.keyboard.press('Control+s');const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('atoll-save-0')));expect(saved.species).toBe('Cuttlefish');await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:'Saved dives'});await clickButton(page,{name:'Load dive'});await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.player.species.name)).toBe('Cuttlefish');await expect.poll(()=>page.evaluate(()=>window.atoll.audio.track)).toBe('moon-through-water');});
test('creation budget, anatomy, color, activity, diet and ability reach the game',async({page})=>{await ready(page);await clickButton(page,{name:/Create a fish/});await page.locator('[data-config="name"]').fill('Lagoon test fish');await page.locator('[data-config="active"]').selectOption('night');await page.locator('[data-config="ability"]').selectOption('shock');await page.locator('[data-config="diet"]').selectOption('hunter');await page.locator('[data-config="color"]').fill('#ee7733');await page.locator('[data-config="size"]').fill('180');await page.locator('[data-config="speed"]').fill('220');await page.locator('[data-config="agility"]').fill('250');await page.locator('[data-config="endurance"]').fill('250');await expect(page.getByRole('button',{name:'Meet the reef'})).toBeDisabled();await page.locator('[data-config="size"]').fill('80');await expect(page.getByRole('button',{name:'Meet the reef'})).toBeEnabled();await clickButton(page,{name:'Meet the reef'});const s=await page.evaluate(()=>window.atoll.simulation.player.species);expect(s.name).toBe('Lagoon test fish');expect(s.color).toBe('#ee7733');expect(s.ability).toBe('shock');expect(s.diet).toContain('fish');expect(s.active).toBe('night');});
test('challenge stage completion, ending and local leaderboard work end to end',async({page})=>{await ready(page);await clickButton(page,{name:/Challenge Four lives/});await clickButton(page,{name:'Begin the journey'});for(let i=0;i<4;i++){await page.evaluate(()=>{const s=window.atoll.simulation;s.section.entities=[];s.stageScore=s.required;});if(i<3){await expect(page.getByRole('heading',{name:'Another life awaits'})).toBeVisible();await clickButton(page,{name:/Become /});}else await expect(page.getByRole('heading',{name:'A life well lived.'})).toBeVisible();}await page.locator('#ruler-name').fill('Coral Pilot');await clickButton(page,{name:'Return home'});await clickButton(page,{name:'Reef rulers'});await expect(page.getByText('1. Coral Pilot')).toBeVisible();});
test('all nine backgrounds render, all sprites have useful bounds and music decodes',async({page})=>{await ready(page);await practice(page);const report=await page.evaluate(async()=>{const a=window.atoll;const r=a.renderer;const empty=r.sprites.map((s,i)=>({i,w:s.width,h:s.height})).filter(s=>s.w<5||s.h<5);const audio=await fetch('assets/audio/manifest.json').then(r=>r.json());const context=new AudioContext();let decoded=0;for(const track of audio.music){const bytes=await fetch('assets/audio/'+track.file).then(r=>r.arrayBuffer());const b=await context.decodeAudioData(bytes);if(b.duration>90&&b.numberOfChannels===2)decoded++;}await context.close();return {backgrounds:r.reefs.filter(i=>i.complete&&i.naturalWidth>1000).length,empty,decoded,foods:r.foodSprites.length};});expect(report).toEqual({backgrounds:9,empty:[],decoded:3,foods:8});for(let i=0;i<9;i++){await page.evaluate(i=>{window.atoll.simulation.current=i;window.atoll.simulation.paused=true;},i);await page.waitForTimeout(20);}await clickButton(page,{name:'Settings',exact:true});await page.getByLabel('Enable audio').uncheck();expect(await page.evaluate(()=>window.atoll.audio.music.volume)).toBe(0);});
test('dialog redraws retain keyboard focus and contain Tab navigation',async({page})=>{await ready(page);await clickButton(page,{name:'Field guide',exact:true});await page.getByRole('option',{name:/Silver sprat/}).click();await expect(page.getByRole('option',{name:/Silver sprat/})).toBeFocused();await page.keyboard.press('Tab');expect(await page.evaluate(()=>!!document.activeElement.closest('.panel'))).toBe(true);await clickButton(page,{name:'Glossary',exact:true});await expect(page.getByRole('button',{name:'Glossary',exact:true})).toBeFocused();await page.getByRole('button',{name:'Return',exact:true}).focus();await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Close dialog'})).toBeFocused();await page.keyboard.press('Shift+Tab');await expect(page.getByRole('button',{name:'Return',exact:true})).toBeFocused();});
test('save success, storage failure and invalid load have visible feedback',async({page})=>{await ready(page);await practice(page);await clickButton(page,{name:'Save / load'});await page.getByRole('button',{name:'Save here'}).first().click();await expect(page.getByRole('status')).toContainText('Dive saved');await page.evaluate(()=>{window.savedSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new Error('QuotaExceededError');};});await page.getByRole('button',{name:'Save here'}).nth(1).click();await expect(page.getByRole('status')).toContainText('could not be saved');await page.screenshot({path:'artifacts/save-error.png'});await page.evaluate(()=>{Storage.prototype.setItem=window.savedSetItem;const d=JSON.parse(localStorage.getItem('atoll-save-1'));d.state='{}';localStorage.setItem('atoll-save-1',JSON.stringify(d));});await page.getByRole('button',{name:'Load dive'}).nth(1).click();await expect(page.getByRole('status')).toContainText('Unable to load');await expect(page.getByRole('status')).toContainText('different');await page.screenshot({path:'artifacts/load-error.png'});});
