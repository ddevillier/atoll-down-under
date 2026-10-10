import {test,expect} from '@playwright/test';
import {clickButton} from '../../scripts/ui-actions.mjs';

for(const [width,height] of [[1600,900],[1024,768]])test(`Cuttlefish HUD controls stay within the reef at ${width}`,async({page})=>{
 await page.setViewportSize({width,height});await page.goto('/');
 await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill('Cuttlefish');
 await page.getByRole('option').click();await clickButton(page,{name:'Explore freely',exact:true});
 for(const paused of [false,true]){
  if(paused)await page.keyboard.press('Escape');
  const bounds=await page.evaluate(()=>{
   const app=document.querySelector('#app').getBoundingClientRect(),hud=document.querySelector('.hud');
   return {app:{left:app.left,right:app.right,bottom:app.bottom},scroll:hud.scrollWidth,client:hud.clientWidth,
    controls:[...document.querySelectorAll('.hud-actions button')].map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent,left:r.left,right:r.right,bottom:r.bottom,scroll:e.scrollWidth,client:e.clientWidth,hit:document.elementFromPoint(r.right-2,r.top+r.height/2)?.closest('button')===e};})};
  });
  expect(bounds.scroll).toBeLessThanOrEqual(bounds.client+1);
  for(const b of bounds.controls){expect(b.left).toBeGreaterThanOrEqual(bounds.app.left);expect(b.right).toBeLessThanOrEqual(bounds.app.right);expect(b.bottom).toBeLessThanOrEqual(bounds.app.bottom);expect(b.scroll).toBeLessThanOrEqual(b.client+1);expect(b.hit).toBe(true);}
 }
});
