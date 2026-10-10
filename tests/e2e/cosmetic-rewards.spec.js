import {test,expect} from '@playwright/test';
import {clickButton} from '../../scripts/ui-actions.mjs';
import {freshJournal,recordProgress} from '../../src/journal.js';
import {COSMETIC_PALETTES} from '../../src/cosmetics.js';
import {DISCOVERIES} from '../../src/adventures.js';

async function ready(page,journal){
 if(journal)await page.addInitScript(j=>localStorage.setItem('atoll-journal',JSON.stringify(j)),journal);
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
}
async function editor(page){await clickButton(page,{name:'Create a fish',exact:false});await expect(page.locator('#fish-name')).toBeVisible();}
const earned=()=>{const j=freshJournal();for(const a of ['meal','clean','helper','shelter','night'])recordProgress(j,'activity',a);for(const id of ['s0','s1','s2'])recordProgress(j,'cared',id);for(const r of [0,1,2])recordProgress(j,'habitat',r);for(const d of DISCOVERIES.slice(0,15))recordProgress(j,'discovery',d);return j;};

test('earned recipe applies in preview, trial, keep, variation and resume without changing traits',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await ready(page,earned());await editor(page);
 const select=page.getByRole('combobox',{name:'Colors',exact:true});await expect(select.locator('option')).toHaveCount(COSMETIC_PALETTES.length+1);
 const rendered=[];
 for(const palette of COSMETIC_PALETTES){
  await select.selectOption(palette.id);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  rendered.push(await page.locator('#custom-portrait').screenshot({path:`artifacts/optional-exploration/cosmetics/${palette.id}.png`}));
 }
 for(let i=0;i<rendered.length;i++)for(let k=0;k<i;k++)expect(rendered[i].equals(rendered[k])).toBe(false);
 const recipe=COSMETIC_PALETTES.find(p=>p.id==='tidepool');
 await page.locator('#fish-name').fill('Tidepool friend');
 await select.selectOption(recipe.id);
 for(const [key,value]of Object.entries(recipe.colors))await expect(page.locator(`[data-config="${key}"]`)).toHaveValue(value);
 await page.getByRole('button',{name:'Test swim',exact:true}).click();
 const view=()=>page.evaluate(()=>{const s=window.atoll.simulation;return {name:s.player.species.name,color:s.player.species.color,appearance:s.player.species.appearance,diet:s.creation.blueprint.diet,trial:!!s.trial};});
 let fish=await view();expect(fish.color).toBe(recipe.colors.color);expect(fish.appearance.finColor).toBe(recipe.colors.finColor);expect(fish.diet).toBe('grazer');expect(fish.trial).toBe(true);
 await page.getByRole('button',{name:'Change my fish'}).click();await expect(select).toHaveValue(recipe.id);
 await page.getByRole('button',{name:'Keep fish',exact:true}).click();
 fish=await view();expect(fish.trial).toBe(false);expect(fish.appearance.marking).toBe(recipe.colors.marking);
 await clickButton(page,{name:'My creations',exact:true});await expect(page.locator('.creation-row')).toHaveCount(1);
 await page.getByRole('button',{name:'Make a variation',exact:true}).click();await expect(select).toHaveValue(recipe.id);
 await page.locator('[data-config="finColor"]').fill('#112233');await expect(select).toHaveValue('');await expect(page.locator('[data-config="color"]')).toHaveValue(recipe.colors.color);
 await clickButton(page,{name:'My creations',exact:true});await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:'My creations',exact:true});await page.getByRole('button',{name:'Resume',exact:true}).click();
 // Resume reads IndexedDB before entering the dive; wait for the live fish.
 await expect(page.locator('.fish-identity strong')).toHaveText('Tidepool friend');
 await expect(page.locator('#hud-fish')).toBeVisible();
 fish=await view();expect(fish.color).toBe(recipe.colors.color);expect(fish.appearance.finColor).toBe(recipe.colors.finColor);expect(fish.name).toBe('Tidepool friend');expect(fish.diet).toBe('grazer');expect(errors).toEqual([]);
});

for(const width of [1600,1024])test(`creator earned and locked colors stay quiet and usable at ${width}`,async({page})=>{
 await page.setViewportSize({width,height:width*9/16});const j=freshJournal();recordProgress(j,'activity','meal');await ready(page,j);await editor(page);
 const select=page.getByRole('combobox',{name:'Colors',exact:true});await expect(select.locator('option')).toHaveCount(2);
 await expect(page.getByText('Take a needed meal at night.',{exact:false})).not.toBeVisible();
 await page.getByText('Earn more colors',{exact:true}).click();await expect(page.getByText('Take a needed meal at night.',{exact:false})).toBeVisible();
 expect(await page.locator('.panel').evaluate(e=>e.scrollWidth>e.clientWidth+1)).toBe(false);
 await page.getByText('Earn more colors',{exact:true}).click();await select.selectOption('sunlit');await expect(select).toHaveValue('sunlit');
 await page.screenshot({path:`artifacts/optional-exploration/cosmetics/editor-${width}.png`});
 await page.locator('[data-config="color"]').fill('#45ab8e');await expect(select).toHaveValue('');
 await page.locator('[data-config="marking"]').selectOption('plain');await expect(page.getByRole('button',{name:'Keep fish',exact:true})).toBeEnabled();
});

