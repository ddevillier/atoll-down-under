import {test,expect} from '@playwright/test';
import {clickButton} from '../../scripts/ui-actions.mjs';

test('created fish can inspect a resident, resume watching, and return to its own activity',async({page})=>{
 await page.setViewportSize({width:1600,height:900});
 await page.goto('/');
 await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:/Create a fish/});
 await clickButton(page,{name:'Keep fish',exact:true});
 const creation=page.getByRole('complementary',{name:'Your fish activity',exact:true});
 await expect(creation).toBeVisible();
 await page.keyboard.press('Escape');
 expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(true);

 // Read-only hit-test planning; the observation starts exclusively by clicking.
 const target=await page.evaluate(async()=>{
  const s=window.atoll.simulation,{creatureFrame}=await import('/src/geometry.js');
  for(const e of s.section.entities.filter(e=>e.alive&&e.species.id==='s46')){
   const f=creatureFrame(e);
   for(const dx of [0,-.3,.3])for(const dy of [0,-.3,.3]){
    const p={x:f.x+f.width*dx,y:f.y+f.height*dy};
    if(s.findAt(p.x,p.y)===e)return {...p,id:e.id};
   }
  }
  return null;
 });
 expect(target,'Generated crab should have a selectable hit area').not.toBeNull();
 const box=await page.locator('#reef').boundingBox();
 await page.mouse.click(box.x+target.x/1600*box.width,box.y+(target.y+55)/900*box.height);
 expect(await page.evaluate(()=>window.atoll.simulation.residentFocus)).toBe('s46');
 const resident=page.getByRole('complementary',{name:'Resident observation',exact:true});
 await expect(resident).toBeVisible();
 await expect(creation).toHaveCount(0);
 // Generated residents can finish a real meal while the creator is open.
 // Match the paused observation's actual stage rather than assuming no meal.
 const noticed=await page.evaluate(()=>window.atoll.simulation.residentJourneys.s46.meal);
 await expect(resident.locator('#resident-step')).toContainText(noticed?'Meal noticed':'detritus');
 await expect(page.locator('.inspect-card')).toContainText('detritus');
 await expect(resident.getByRole('button',{name:'Resume watching',exact:true})).toBeVisible();
 const paused=await page.evaluate(()=>window.atoll.simulation.serialize());
 await page.waitForTimeout(150);
 expect(await page.evaluate(()=>window.atoll.simulation.serialize())).toBe(paused);

 await clickButton(page,{name:'Resume watching',exact:true});
 expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(false);
 await expect(resident).toBeVisible();
 await expect(resident.getByRole('button',{name:'Resume watching',exact:true})).toHaveCount(0);
 await clickButton(page,{name:'Stop observing resident',exact:true});
 expect(await page.evaluate(()=>window.atoll.simulation.residentFocus)).toBeNull();
 await expect(resident).toHaveCount(0);
 await expect(creation).toBeVisible();
});
