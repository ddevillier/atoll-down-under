import {clickButton} from '../../scripts/ui-actions.mjs';
import {test,expect} from '@playwright/test';
async function ready(page){await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);}

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
