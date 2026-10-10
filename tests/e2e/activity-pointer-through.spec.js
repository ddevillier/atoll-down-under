import {test,expect} from '@playwright/test';
import {clickButton} from '../../scripts/ui-actions.mjs';

test('expanded cuttlefish guidance passes the actual sand-site pointer through while buttons work',async({page})=>{
 await page.setViewportSize({width:1600,height:900});
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:/Practice Choose/});
 await page.getByRole('searchbox').fill('Cuttlefish');
 await page.getByRole('option').click();
 await clickButton(page,{name:'Show goal',exact:true});
 await page.getByText('Activity details',{exact:true}).click();
 await expect(page.locator('#adventure-step')).toBeVisible();
 const target=await page.evaluate(async()=>{
  const {sitesFor}=await import('/src/adventures.js');
  const site=sitesFor(window.atoll.simulation).find(s=>s.kind==='sand');
  const canvas=document.querySelector('#reef'),b=canvas.getBoundingClientRect();
  const x=b.left+site.x/1600*b.width,y=b.top+(site.y+55)/900*b.height;
  const card=document.querySelector('.adventure-note').getBoundingClientRect();
  return {site,x,y,insideCard:x>=card.left&&x<=card.right&&y>=card.top&&y<=card.bottom,hit:document.elementFromPoint(x,y)?.id};
 });
 // This guards the original obstruction rather than a point beside the card.
 expect(target.insideCard).toBe(true);
 expect(target.hit).toBe('reef');
 await page.mouse.move(target.x,target.y);
 await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.pointer.x)).toBeCloseTo(target.site.x,1);
 await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.pointer.y)).toBeCloseTo(target.site.y,1);
 await expect(page.locator('#adventure-step')).toBeVisible();
 await clickButton(page,{name:'Hide goal',exact:true});
 await expect(page.locator('#adventure-step')).toHaveCount(0);
 await clickButton(page,{name:'Activity',exact:true});
 await expect(page.locator('#adventure-step')).toBeHidden();
 await page.getByText('Activity details',{exact:true}).click();
 await expect(page.locator('#adventure-step')).toBeVisible();
 await clickButton(page,{name:'Hear this activity',exact:true});
 await expect(page.locator('.guide-narration')).toBeVisible();
});
