import {_electron as electron,expect} from '@playwright/test';
import {clickButton} from './ui-actions.mjs';
import fs from 'node:fs';
const output=process.argv[3]||'artifacts/creations-native';fs.mkdirSync(output,{recursive:true});
const executable=process.argv[2],app=await electron.launch({...(executable?{executablePath:executable}:{args:['.']}),env:{...process.env,ATOLL_QA:'1'},recordVideo:{dir:output,size:{width:1280,height:720}}});
const evidence={executable:executable||'source',errors:[]};
try{
 evidence.profile=await app.evaluate(({app})=>app.getPath('userData'));if(!/[\\/]atoll-qa-/.test(evidence.profile))throw Error('Expected isolated profile');
 const page=await app.firstWindow();page.on('pageerror',e=>evidence.errors.push(e.message));await page.waitForFunction(()=>window.atoll?.renderer.ready);
 evidence.fullscreen=await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].isFullScreen());expect(evidence.fullscreen).toBe(true);
 await page.keyboard.press('F11');await expect.poll(()=>app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].isFullScreen())).toBe(false);
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(1280,720));
 await clickButton(page,{name:/Create a fish/});await page.locator('#fish-name').fill('Pebble');
 for(const [key,value] of Object.entries({tail:'lyre',dorsal:'sail',pectoral:'wing',mouth:'beak',marking:'bands'}))await page.locator(`[data-config="${key}"]`).selectOption(value);
 await page.locator('[data-config="finColor"]').fill('#b487d4');await page.locator('[data-config="markingColor"]').fill('#23496a');
 await page.screenshot({path:output+'/editor.png'});await page.getByRole('button',{name:'Test swim',exact:true}).click();
 evidence.appearance=await page.evaluate(()=>window.atoll.simulation.player.species.appearance);
 const box=await page.locator('#reef').boundingBox(),move=async p=>page.mouse.move(box.x+p.x/1600*box.width,box.y+(p.y+55)/900*box.height);
 const home=await page.evaluate(async()=>{const {REEFS}=await import(new URL('src/data.js',location.href));return REEFS[4].shelters[0];});
 await move(home);await page.waitForFunction(()=>window.atoll.simulation.player.hidden,null,{timeout:15000});await page.screenshot({path:output+'/trial-refuge.png'});
 await move({x:800,y:250});await page.waitForFunction(()=>!window.atoll.simulation.player.hidden);await page.getByRole('button',{name:'Change my fish'}).click();
 await page.getByRole('button',{name:'Keep and meet the reef'}).click();evidence.creationId=await page.evaluate(()=>window.atoll.simulation.creation.id);
 await page.getByRole('button',{name:'My creations',exact:true}).click();await expect(page.locator('.creation-row')).toHaveCount(1);
 await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:'My creations',exact:true});await page.getByRole('button',{name:'Resume',exact:true}).click();
 await page.waitForFunction(id=>window.atoll.simulation?.creation?.id===id,evidence.creationId);expect(await page.evaluate(()=>window.atoll.simulation.creation.id)).toBe(evidence.creationId);
 expect(await page.evaluate(()=>window.atoll.simulation.player.species.appearance)).toEqual(evidence.appearance);
 await page.getByRole('button',{name:'Field guide',exact:true}).click();await expect(page.getByText('This is your invention, not a real species.')).toBeVisible();await page.getByRole('button',{name:'Return',exact:true}).click();
 await page.screenshot({path:output+'/resumed-fish.png'});expect(evidence.errors).toEqual([]);evidence.passed=true;
}catch(error){evidence.failure=String(error);process.exitCode=1;}finally{await app.close();fs.writeFileSync(output+'/report.json',JSON.stringify(evidence,null,2));}
