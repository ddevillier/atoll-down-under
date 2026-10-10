import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {PRACTICE_SPECIES,REEFS} from '../../src/data.js';
import {DISCOVERIES} from '../../src/adventures.js';
import {freshJournal} from '../../src/journal.js';
import {COSMETIC_PALETTES} from '../../src/cosmetics.js';
import {clickButton} from '../../scripts/ui-actions.mjs';

const artifacts='artifacts/optional-exploration/goals';
async function ready(page){await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready,null,{timeout:15000});}
async function choose(page,id){await clickButton(page,{name:/Practice Choose/});if(await page.getByRole('searchbox').inputValue())await page.getByRole('searchbox').fill('');await page.locator(`[role="option"][data-species="${id}"]`).click();}
async function explore(page,id){await choose(page,id);await page.locator('[data-action="begin-practice"]').click();}
async function reefPointer(page,p,click=false){const b=await page.locator('#reef').boundingBox();const x=b.x+p.x/1600*b.width,y=b.y+(p.y+55)/900*b.height;if(click)await page.mouse.click(x,y);else await page.mouse.move(x,y);}

test('all 57 existing species enter free exploration with real optional journey state and no earned badges',async({page})=>{
 test.setTimeout(600000);await mkdir(artifacts,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);const evidence=[];
 await clickButton(page,{name:/Practice Choose/});await expect(page.getByRole('searchbox')).toHaveValue('');await expect(page.getByRole('option')).toHaveCount(57);await page.locator('[data-action="close"]').click();
 for(const species of PRACTICE_SPECIES){
  await choose(page,species.id);await expect(page.locator('[data-action="begin-practice"]')).toBeEnabled();await page.locator('[data-action="begin-practice"]').click();
  const state=await page.evaluate(async()=>{const s=window.atoll.simulation,{optionalJourney}=await import('/src/exploration-goals.js');return {species:s.player.species.id,mode:s.mode,goalVisible:s.adventure.visible,complete:s.adventure.complete,goal:optionalJourney(s,window.atoll.journal),earned:Object.keys(window.atoll.journal.earned)};});
  expect(state.species).toBe(species.id);expect(state.mode).toBe('practice');expect(state.goalVisible).toBe(false);expect(state.complete).toBe(false);expect(state.earned).toEqual([]);expect(state.goal?.species).toBe(species.id);expect(state.goal?.optional).toBe(true);expect(state.goal?.instruction.length).toBeGreaterThan(8);expect(state.goal?.title.length).toBeGreaterThan(3);expect(state.goal?.step.length).toBeGreaterThan(3);expect(state.goal?.status).toBe('exploring');
  evidence.push(state);await writeFile(`${artifacts}/all-species-progress.json`,JSON.stringify(evidence,null,2));await page.locator('[data-action="home"]').click();
  // Beginning different lives itself records their home habitats. Each access
  // check starts with a genuinely empty profile so those legitimate records
  // cannot accidentally conceal an achievement gate later in this matrix.
  await page.evaluate(()=>{localStorage.removeItem('atoll-journal');});await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready);
 }
 await writeFile(`${artifacts}/all-species.json`,JSON.stringify(evidence,null,2));expect(errors).toEqual([]);
});

test('all nine habitats expose a route before earning any accomplishments',async({page})=>{
 await ready(page);await explore(page,'s1');await page.locator('[data-action="reef-map"]').click();await expect(page.locator('.reef-map-tile')).toHaveCount(9);const current=await page.evaluate(()=>window.atoll.simulation.current);
 for(const reef of REEFS){const tile=page.locator(`[data-action="map-select"][data-reef="${reef.id}"]`);await expect(tile).toBeEnabled();await tile.click();await expect(page.locator('.reef-map-detail h3')).toHaveText(reef.name);if(reef.id!==current)await expect(page.locator('[data-action="map-route"]')).toBeEnabled();}
 expect(await page.evaluate(()=>Object.keys(window.atoll.journal.earned))).toEqual([]);
});

for(const [width,height]of [[1600,900],[1024,768]])test(`ordinary exploration completes sand searching with its goal hidden at ${width}`,async({page})=>{
 test.setTimeout(60000);await mkdir(artifacts,{recursive:true});await page.setViewportSize({width,height});const errors=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);await explore(page,'s23');
 expect(await page.evaluate(()=>window.atoll.simulation.adventure.visible)).toBe(false);await expect(page.locator('[data-action="adventure-toggle"]')).toBeVisible();
 const sites=await page.evaluate(async()=>{const {sitesFor}=await import('/src/adventures.js');const s=window.atoll.simulation;s.section.entities=[];return sitesFor(s).map(({id,x,y})=>({id,x,y}));});expect(sites).toHaveLength(2);
 for(let i=0;i<sites.length;i++){
  const p=sites[i];await page.keyboard.press('Escape');await page.evaluate(p=>{const s=window.atoll.simulation;Object.assign(s.player,{x:p.x-30,y:p.y,angle:0,energy:65});},p);await page.keyboard.press('Escape');await reefPointer(page,p);await page.keyboard.press('e');await reefPointer(page,p,true);
  await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.adventure.meals.length)).toBe(i+1);expect(await page.evaluate(()=>window.atoll.simulation.adventure.visible)).toBe(false);
  if(i===0){await page.locator('[data-action="adventure-toggle"]').click();await expect(page.locator('#optional-goal-counter')).toHaveText('1 / 2 sand sites');await expect(page.locator('#adventure-step')).toBeHidden();await page.screenshot({path:`${artifacts}/sand-progress-${width}.png`});await page.locator('[data-action="adventure-toggle"]').click();}
 }
 await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.adventure.complete)).toBe(true);await expect.poll(()=>page.evaluate(()=>window.atoll.journal.discoveries)).toEqual(['sand-search']);expect(await page.evaluate(()=>!!window.atoll.journal.earned.discovery1)).toBe(true);
 await page.locator('[data-action="adventure-toggle"]').click();await expect(page.locator('#optional-goal-step')).toContainText('Discovered');await expect(page.locator('#adventure-step')).toBeHidden();expect(await page.locator('.adventure-note').evaluate(e=>e.scrollWidth>e.clientWidth+1)).toBe(false);await page.screenshot({path:`${artifacts}/sand-discovered-${width}.png`});
 await page.locator('[data-action="journal"]').count().then(async count=>{if(count)await page.locator('[data-action="journal"]').first().click();else{await page.locator('[data-action="guide"]').click();await page.locator('[data-action="journal"]').click();}});await expect(page.locator('.journal-colors')).toContainText('Lagoon');await expect(page.locator('.panel-body')).toBeVisible();expect(await page.locator('.panel-body').evaluate(e=>e.scrollWidth>e.clientWidth+1)).toBe(false);await page.screenshot({path:`${artifacts}/journal-colors-${width}.png`});
 const earnedDate=await page.evaluate(()=>window.atoll.journal.earned.discovery1);await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready);expect(await page.evaluate(()=>window.atoll.journal.discoveries)).toEqual(['sand-search']);expect(await page.evaluate(()=>window.atoll.journal.earned.discovery1)).toBe(earnedDate);
 await explore(page,'s23');await page.locator('[data-action="adventure-toggle"]').click();expect(await page.evaluate(()=>window.atoll.simulation.adventure.complete)).toBe(false);await expect(page.locator('#optional-goal-record')).toContainText('Recorded');await expect(page.locator('#optional-goal-step')).not.toHaveText('Discovered');expect(errors).toEqual([]);
});

test('older discovery journals reconcile badges on load and merge repeated restores without duplicate accomplishments',async({page})=>{
 const old=freshJournal();old.discoveries=DISCOVERIES.slice(0,5);await page.addInitScript(j=>{if(!localStorage.getItem('atoll-journal'))localStorage.setItem('atoll-journal',JSON.stringify(j));},old);await ready(page);
 expect(await page.evaluate(()=>window.atoll.journal.discoveries)).toEqual(old.discoveries);expect(await page.evaluate(()=>Object.keys(window.atoll.journal.earned).sort())).toEqual(['discovery1','discovery5']);
 await clickButton(page,{name:'Family journal',exact:true});await expect(page.locator('.journal-badge')).toHaveCount(16);await expect(page.getByRole('dialog')).toContainText('Reef Observer');
 const dates=await page.evaluate(()=>window.atoll.journal.earned);const incoming={...old,discoveries:[...old.discoveries,DISCOVERIES[5],DISCOVERIES[5]]};const file={name:'old-journal.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(incoming))};
 await page.locator('#journal-file').setInputFiles(file);await expect.poll(()=>page.evaluate(()=>window.atoll.journal.discoveries.length)).toBe(6);await page.locator('#journal-file').setInputFiles(file);expect(await page.evaluate(()=>window.atoll.journal.discoveries.length)).toBe(6);expect(await page.evaluate(()=>window.atoll.journal.earned)).toEqual(dates);
 await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready);expect(await page.evaluate(()=>window.atoll.journal.discoveries.length)).toBe(6);expect(await page.evaluate(()=>window.atoll.journal.earned)).toEqual(dates);
 await clickButton(page,{name:'Family journal',exact:true});const recipe=COSMETIC_PALETTES.find(p=>p.badge==='discovery1');expect(recipe).toBeTruthy();await expect(page.locator(`.journal-colors [data-palette="${recipe.id}"]`)).toBeVisible();await page.locator(`.journal-colors [data-palette="${recipe.id}"]`).click();await expect(page.getByRole('combobox',{name:'Colors',exact:true})).toHaveValue(recipe.id);for(const [key,value]of Object.entries(recipe.colors))await expect(page.locator(`[data-config="${key}"]`)).toHaveValue(value);
});
