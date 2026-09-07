import {_electron as electron,expect} from '@playwright/test';
import fs from 'node:fs';
import {clickButton} from './ui-actions.mjs';
const executablePath=process.argv[2];
const app=await electron.launch({...(executablePath?{executablePath}:{args:['.']}),env:{...process.env,ATOLL_QA:'1'}});
try{
 const isolated=await app.evaluate(({app})=>/[\\/]atoll-qa-/.test(app.getPath('userData')));
 expect(isolated).toBe(true);
 const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:/Practice Choose/});
 await page.getByRole('searchbox').fill('Foxface');await page.getByRole('option').first().click();
 await clickButton(page,{name:'Enter the reef'});await page.keyboard.press('Escape');
 await page.evaluate(()=>{
  const s=window.atoll.simulation,food=s.section.food.find(f=>f.food==='algae'),slug=s.section.entities.find(e=>e.species.id==='s60');
  Object.assign(food,{x:500,y:300,amount:100,regrow:0});Object.assign(slug,{x:518,y:300,stun:99});
  s.section.food=[food];s.section.entities=[slug];
  Object.assign(s.player,{x:450,y:300,energy:50,target:null});s.pointer={x:450,y:300};
 });
 const box=await page.locator('#reef').boundingBox(),x=box.x+500/1600*box.width,y=box.y+355/900*box.height;
 await page.mouse.click(x,y);await expect(page.locator('.inspect-card h3')).toHaveText('Algae');
 await page.screenshot({path:'artifacts/native-food-selection-inspect.png'});
 await page.keyboard.press('Escape');await page.mouse.click(x,y);
 await page.waitForFunction(()=>window.atoll.simulation.section.food[0].amount<100,null,{timeout:20000});
 const result=await page.evaluate(()=>{const s=window.atoll.simulation;return {amount:s.section.food[0].amount,poisonDamage:s.player.poisonDamage,slugAlive:s.section.entities[0].alive,energy:s.player.energy};});
 expect(result.poisonDamage).toBe(0);expect(result.slugAlive).toBe(true);expect(result.energy).toBeGreaterThan(50);expect(errors).toEqual([]);
 await page.screenshot({path:'artifacts/native-food-selection-meal.png'});
 const report={surface:executablePath?'packaged Windows':'source Electron',isolatedProfile:isolated,inspected:'Algae',...result,errors};
 fs.writeFileSync('artifacts/native-selection-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await app.close();}
