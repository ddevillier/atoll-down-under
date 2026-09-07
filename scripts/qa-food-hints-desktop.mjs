import {_electron as electron,expect} from '@playwright/test';
import fs from 'node:fs';
import {clickButton} from './ui-actions.mjs';

const executablePath=process.argv[2];
const app=await electron.launch({...(executablePath?{executablePath}:{args:['.']}),env:{...process.env,ATOLL_QA:'1'}});
try{
 const isolatedProfile=await app.evaluate(({app})=>/[\\/]atoll-qa-/.test(app.getPath('userData')));expect(isolatedProfile).toBe(true);
 const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.waitForFunction(()=>window.atoll?.renderer.ready);
 expect(await page.evaluate(()=>!!window.atoll.renderer.foodHints)).toBe(false);
 await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill('Neon');await page.getByRole('option').first().click();await clickButton(page,{name:'Enter the reef'});
 await page.keyboard.press('Escape');
 await page.evaluate(()=>{
  const s=window.atoll.simulation;s.section.entities=[];
  const algae=s.section.food.find(f=>f.food==='algae');s.section.food=[{...algae,id:'hint-food',x:700,y:300}];
  Object.assign(s.player,{x:800,y:300,angle:Math.PI,energy:40});s.point(800,300);
 });
 await page.keyboard.press('Escape');await page.keyboard.press('h');
 expect(await page.evaluate(()=>window.atoll.renderer.foodHints)).toBe(true);
 expect(await page.evaluate(()=>window.atoll.simulation.player.target)).toBeNull();
 const box=await page.locator('#reef').boundingBox();await page.mouse.click(box.x+700/1600*box.width,box.y+355/900*box.height);
 await page.waitForFunction(()=>window.atoll.simulation.player.energy>45,null,{timeout:30000});
 await page.getByRole('button',{name:'Settings',exact:true}).click();
 const toggle=page.getByLabel('Highlight nearby suitable food (H)');await expect(toggle).toBeChecked();await toggle.uncheck();
 expect(await page.evaluate(()=>window.atoll.renderer.foodHints)).toBe(false);await toggle.check();
 await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready);
 expect(await page.evaluate(()=>window.atoll.renderer.foodHints)).toBe(true);
 await clickButton(page,{name:'Field guide',exact:true});await page.getByRole('searchbox').fill('h');
 expect(await page.evaluate(()=>window.atoll.renderer.foodHints)).toBe(true);expect(errors).toEqual([]);
 const report={surface:executablePath?'packaged Windows':'source Electron',isolatedProfile,defaultOff:true,shortcutVerified:true,settingsVerified:true,persistenceVerified:true,typingUnaffected:true,manualFeedingVerified:true,errors};
 fs.writeFileSync('artifacts/native-food-hints-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await app.close();}
