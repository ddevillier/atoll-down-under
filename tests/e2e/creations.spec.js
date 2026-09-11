import {test,expect} from '@playwright/test';
import {clickButton} from '../../scripts/ui-actions.mjs';
async function ready(page){await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);}
async function editor(page){await clickButton(page,{name:'Create a fish',exact:false});await expect(page.locator('#fish-name')).toBeVisible();}
test('creation shelf survives variation, rename, reload and resume',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);await editor(page);
 await page.locator('#fish-name').fill('Pebble');await page.locator('[data-config="ability"]').selectOption('crush');
 await page.getByRole('button',{name:'Keep and meet the reef'}).click();
 const id=await page.evaluate(()=>window.atoll.simulation.creation.id);
 await page.getByRole('button',{name:'My creations',exact:true}).click();await expect(page.locator('.creation-row')).toHaveCount(1);
 await page.getByRole('button',{name:'Make a variation'}).click();await page.locator('#fish-name').fill('Noodle');await page.locator('[data-config="diet"]').selectOption('hunter');
 await page.getByRole('button',{name:'Keep and meet the reef'}).click();await page.getByRole('button',{name:'My creations',exact:true}).click();
 await expect(page.locator('.creation-row')).toHaveCount(2);await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:'My creations',exact:true});const pebble=page.locator('.creation-row').filter({has:page.getByRole('heading',{name:'Pebble'})});await pebble.getByRole('button',{name:'Resume',exact:true}).click();await page.waitForFunction(id=>window.atoll.simulation?.creation?.id===id,id);
 expect(await page.evaluate(()=>({id:window.atoll.simulation.creation.id,diet:window.atoll.simulation.player.species.diet}))).toEqual({id,diet:['algae','grass','plankton','coral']});
 await page.getByRole('button',{name:'Field guide',exact:true}).click();await expect(page.getByText('This is your invention, not a real species.')).toBeVisible();await page.getByRole('button',{name:'Return',exact:true}).click();
 await page.getByRole('button',{name:'My creations',exact:true}).click();await page.locator('.creation-row').filter({has:page.getByRole('heading',{name:'Pebble'})}).getByRole('button',{name:'Rename',exact:true}).click();await page.locator('#rename-creation').fill('Pebble II');await page.getByRole('button',{name:'Save name'}).click();await expect(page.getByRole('heading',{name:'Pebble II'})).toBeVisible();expect(errors).toEqual([]);
});
test('trial resets through ordinary controls and never writes saved progress',async({page})=>{
 await ready(page);await editor(page);const before=await page.evaluate(()=>JSON.stringify(window.atoll.journal));
 await page.getByRole('button',{name:'Test swim',exact:true}).click();await expect(page.getByText('Test swim · Nothing is saved')).toBeVisible();
 await page.keyboard.press('Control+s');await page.getByRole('button',{name:'Reset test',exact:true}).click();
 expect(await page.evaluate(()=>window.atoll.simulation.player.energy)).toBeLessThanOrEqual(55);
 await page.getByRole('button',{name:'Change my fish'}).click();await expect(page.locator('#fish-name')).toHaveValue('Lagoon wanderer');
 expect(await page.evaluate(()=>JSON.stringify(window.atoll.journal))).toBe(before);
 await page.getByRole('button',{name:'My creations',exact:true}).click();await expect(page.locator('.creation-row')).toHaveCount(0);
});
test('creation storage failure stays visible and does not claim successful keeping',async({page})=>{
 await page.addInitScript(()=>{const open=IDBFactory.prototype.open;window.restoreCreationStorage=()=>{IDBFactory.prototype.open=open;};IDBFactory.prototype.open=function(){throw new Error('Storage unavailable for test');};});
 await ready(page);await editor(page);await page.getByRole('button',{name:'Keep and meet the reef'}).click();
 await expect(page.getByRole('button',{name:'Creation unsaved · Export backup'})).toBeVisible();
 expect(await page.evaluate(()=>window.atoll.simulation.player.species.name)).toBe('Lagoon wanderer');
 await page.evaluate(()=>window.restoreCreationStorage());await page.keyboard.press('Control+s');await expect(page.getByRole('button',{name:'Creation unsaved · Export backup'})).toHaveCount(0);await page.getByRole('button',{name:'My creations',exact:true}).click();await expect(page.locator('.creation-row')).toHaveCount(1);
});
test('identical imports reuse identity; conflicting imports preserve both fish',async({page})=>{
 await ready(page);await editor(page);await page.getByRole('button',{name:'Keep and meet the reef'}).click();await page.getByRole('button',{name:'My creations',exact:true}).click();
 const result=await page.evaluate(async()=>{const {getCreation,resolveImportedCreation}=await import('/src/creations.js'),{Simulation}=await import('/src/simulation.js');const current=window.atoll.simulation,record=await getCreation(current.creation.id);const same=Simulation.restore(record.state);await resolveImportedCreation(same);const different=Simulation.restore(record.state);different.player.energy-=1;await resolveImportedCreation(different);return {id:current.creation.id,same:same.creation.id,copy:different.creation.id,parent:different.creation.parentId};});
 expect(result.same).toBe(result.id);expect(result.copy).not.toBe(result.id);expect(result.parent).toBe(result.id);
});
for(const width of [1280,1920])test(`creation editor and shelf render at ${width}`,async({page})=>{
 await page.setViewportSize({width,height:width*9/16});await ready(page);await editor(page);
 await page.screenshot({path:`artifacts/creation-editor-${width}.png`});
 const overflow=await page.locator('.panel').evaluate(e=>e.scrollWidth>e.clientWidth+1);expect(overflow).toBe(false);
 await page.getByRole('button',{name:'Keep and meet the reef'}).click();await page.getByRole('button',{name:'My creations',exact:true}).click();
 await page.screenshot({path:`artifacts/creation-shelf-${width}.png`});await expect(page.locator('.creation-row')).toHaveCount(1);
});
test('created grazer chooses refuge, eats and returns with ordinary controls',async({page})=>{
 test.setTimeout(100000);await ready(page);await editor(page);await page.getByRole('button',{name:'Keep and meet the reef'}).click();
 const canvas=page.locator('#reef');const bounds=await canvas.boundingBox();
 const move=async p=>page.mouse.move(bounds.x+p.x/1600*bounds.width,bounds.y+(p.y+55)/900*bounds.height);
 const home=await page.evaluate(async()=>{const {REEFS}=await import('/src/data.js');const s=window.atoll.simulation;return REEFS[s.current].shelters.reduce((a,b)=>Math.hypot(a.x-s.player.x,a.y-s.player.y)<Math.hypot(b.x-s.player.x,b.y-s.player.y)?a:b);});
 await page.getByRole('button',{name:'Hide adventure'}).click();await move(home);
 await page.waitForFunction(p=>Math.hypot(window.atoll.simulation.player.x-p.x,window.atoll.simulation.player.y-p.y)<p.r*.8,home);
 await page.keyboard.press('e');await page.waitForFunction(()=>!!window.atoll.simulation.creation.home);
 async function meal(){const target=await page.evaluate(()=>{const s=window.atoll.simulation;const h=s.creation.home;return s.section.food.filter(f=>['algae','grass','plankton'].includes(f.food)&&f.regrow<=0&&Math.hypot(f.x-s.player.x,f.y-s.player.y)>40&&s.findAt(f.x,f.y)===f).sort((a,b)=>Math.hypot(a.x-s.player.x,a.y-s.player.y)-Math.hypot(b.x-s.player.x,b.y-s.player.y))[0];});await move(target);await page.mouse.down();await page.mouse.up();await page.waitForFunction(()=>!window.atoll.simulation.player.target);}
 await move({x:800,y:360});await page.waitForFunction(()=>window.atoll.simulation.creation.departed,null,{timeout:15000});await meal();await page.waitForFunction(()=>window.atoll.simulation.player.energy<98,{},{timeout:20000});await meal();
 await page.waitForFunction(()=>window.atoll.simulation.creation.meal,null,{timeout:15000});await move(home);await page.waitForFunction(()=>window.atoll.simulation.creation.memories.includes('return'),{},{timeout:25000});
 expect(await page.evaluate(()=>window.atoll.journal.cared.includes('custom'))).toBe(false);
 await page.getByRole('button',{name:'My creations',exact:true}).click();await expect(page.getByText('Returned home after feeding',{exact:false})).toBeVisible();
});
