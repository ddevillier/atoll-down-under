import {test,expect} from '@playwright/test';
import {clickButton} from '../../scripts/ui-actions.mjs';
test('attached animals use their visible support and remain selectable at both desktop sizes',async({page})=>{
 for(const [width,height] of [[1600,900],[1024,768]]){
  await page.setViewportSize({width,height});await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
  await clickButton(page,{name:/Practice Choose/});await clickButton(page,{name:'Enter the reef'});
  const target=await page.evaluate(async()=>{
   const {creatureFrame}=await import('/src/geometry.js'),{SPRITE_DIMENSIONS}=await import('/src/sprite-metrics.js'),r=window.atoll.renderer,s=window.atoll.simulation;
   if(!r.sprites.every((sprite,i)=>sprite.width===SPRITE_DIMENSIONS[i][0]&&sprite.height===SPRITE_DIMENSIONS[i][1]))throw Error('Sprite metrics must be regenerated after artwork changes.');
   s.seed=42;s.start('practice','s1');s.current=6;s.event('transition','Seagrass Meadow');s.paused=true;
   const e=s.section.entities.find(e=>e.holdfast),frame=creatureFrame(e);return {id:e.id,x:frame.x,y:frame.y-frame.height*.3,anchor:{...e.holdfast}};
  });
  await expect(page.locator('.scene-name')).toHaveText('Seagrass Meadow');
  const box=await page.locator('#reef').boundingBox();await page.mouse.click(box.x+target.x/1600*box.width,box.y+(target.y+55)/900*box.height);
  await expect(page.locator('.inspect-card h3')).toContainText('Yellow seahorse');
  const held=await page.evaluate(id=>window.atoll.simulation.section.entities.find(e=>e.id===id).holdfast,target.id);expect(held).toEqual(target.anchor);
  await page.screenshot({path:`artifacts/attachment-meadow-${width}.png`});
 }
});
