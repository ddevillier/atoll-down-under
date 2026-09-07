import {chromium,_electron as electron,expect} from '@playwright/test';
import fs from 'node:fs';
import {clickButton} from './ui-actions.mjs';

const executable=process.argv[2],prefix=executable?'native':'browser';
const app=executable?await electron.launch({executablePath:executable,env:{...process.env,ATOLL_QA:'1'}}):null;
const browser=app?null:await chromium.launch({headless:true});
try{
 if(app&&!await app.evaluate(({app})=>/[\\/]atoll-qa-/.test(app.getPath('userData'))))throw Error('Isolated QA profile required');
 const page=app?await app.firstWindow():await browser.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 if(!app)await page.goto('http://127.0.0.1:4173');
 await page.waitForFunction(()=>window.atoll?.renderer.ready);
 const report={origin:await page.evaluate(()=>location.origin),entries:[],errors};
 await clickButton(page,{name:'Field guide',exact:true});
 for(const width of (app?[null]:[1024,1600])){
  if(width)await page.setViewportSize({width,height:900});
  for(const [id,scientific,phrase] of [['s6','Forcipiger flavissimus','yellow body'],['s16','Cephalopholis miniata','orange-red body'],['s37','Hypnos monopterygius','pear-shaped'],['s39','Variola louti','crescent-shaped tail'],['s40','Platax teira','nearly circular body']]){
   await page.getByRole('searchbox').fill(scientific);await page.getByRole('option').click();
   await expect(page.locator('.species-portrait')).toHaveAttribute('data-species',id);
   await page.locator('.natural-history>summary').click();
   await expect(page.locator('.natural-history-body')).toContainText(phrase);
   const bounds=await page.locator('.natural-history-body').evaluate(e=>({scroll:e.scrollWidth,client:e.clientWidth}));
   expect(bounds.scroll).toBeLessThanOrEqual(bounds.client+1);
   const sprite=await page.evaluate(id=>{const b=window.atoll.renderer.bounds[Number(id.slice(1))];return {w:b.w,h:b.h};},id);
   if(id!=='s16')expect(sprite.w).toBeGreaterThan(1000);
   await page.screenshot({path:`artifacts/${prefix}-${id}-guide-${width||'fullscreen'}.png`});
   report.entries.push({id,width:width||'fullscreen',sprite,searchAndText:true,noOverflow:true});
  }
 }
 await page.getByRole('button',{name:'Return',exact:true}).click();
 report.practiceEntries=[];
 for(const [id,name] of [['s40','Longfin batfish'],['s37','Electric ray'],['s39','Coral trout']]){
  await clickButton(page,{name:/Practice Choose/});
  await page.getByRole('searchbox').fill(name);await page.getByRole('option').click();
  await clickButton(page,{name:'Enter the reef'});
  expect(await page.evaluate(()=>window.atoll.simulation.player.species.id)).toBe(id);
  if(id==='s37'){
   await page.keyboard.press('Space');
   expect(await page.evaluate(()=>window.atoll.simulation.player.cooldown)).toBeGreaterThan(0);
   report.electricPulseControl=true;
  }
  await page.keyboard.press('Escape');
  await page.screenshot({path:`artifacts/${prefix}-${id}-practice.png`});
  report.practiceEntries.push(id);
  await clickButton(page,{name:'Atoll',exact:true});
 }
 report.practiceBatfish=true;expect(errors).toEqual([]);
 fs.writeFileSync(`artifacts/${prefix}-species-corrections.json`,JSON.stringify(report,null,2));
 console.log(JSON.stringify(report));
}finally{if(app)await app.close();else await browser.close();}
