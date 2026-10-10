import {test,expect} from '@playwright/test';
import {clickButton} from '../../scripts/ui-actions.mjs';

test('real canvas pointer input selects an opaque part of a frozen left/right turn',async({page},testInfo)=>{
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:/Practice Choose/});await clickButton(page,{name:'Enter the reef',exact:true});
 await page.keyboard.press('Escape');
 // Controlled visual/input fixture: isolate one catalog shark and freeze the
 // renderer yaw at a midpoint. This does not claim natural AI turn coverage.
 for(const [width,height,side] of [[1600,900,-1],[1024,768,1]]){
  await page.setViewportSize({width,height});
  const target=await page.evaluate(async side=>{
   const {BY_ID}=await import('/src/data.js'),{creatureWidth}=await import('/src/geometry.js');
   const s=window.atoll.simulation,r=window.atoll.renderer;
   s.paused=true;r.inspect=true;r.reducedMotion=false;s.section.food=[];
   const e={...structuredClone(s.player),id:'controlled-turn-shark',species:BY_ID.s34,x:800,y:350,facing:side,angle:side>0?0:Math.PI,alive:true,hidden:false,target:null,groundRoute:null,holdfast:null,cleanTime:0,abilityTime:0,feeding:null,ecology:null};
   s.section.entities=[e];r.syncScene(s,false);
   r.poses.set(e.id,{x:e.x,y:e.y,facing:e.facing,yaw:0,activity:0,motionTime:3,incarnation:e.incarnation||0});
   // Inspect pixels from the real drawCreature/articulation path on a transparent
   // canvas, so the clicked point is proven to contain painted animal pixels.
   const probe=document.createElement('canvas');probe.width=1600;probe.height=900;
   const ctx=probe.getContext('2d');r.drawCreature(ctx,e,r.clock,0);
   const displayed=r.poses.get(e.id).frame,pixels=ctx.getImageData(0,0,1600,900).data;
   let selected=null;
   for(let y=Math.floor(displayed.y-30);y<=Math.ceil(displayed.y+30);y++)for(let x=Math.floor(displayed.x-displayed.width*.4);x<=Math.ceil(displayed.x+displayed.width*.4);x++){
    const distance=Math.hypot(x-e.x,y-e.y);
    if(pixels[(y*1600+x)*4+3]>240&&Math.hypot(x-displayed.x,y-displayed.y)<displayed.width*.3&&(!selected||distance<selected.distance))selected={x,y,distance};
   }
   if(!selected)throw new Error('No opaque body point in the rendered midpoint');
   r.draw(s,0,false);
   return {...selected,center:{x:e.x,y:e.y},frame:displayed};
  },side);
  expect(target.frame.x).toBeCloseTo(target.center.x,5);
  expect(target.distance).toBeLessThan(target.frame.width*.3);
  await page.screenshot({path:testInfo.outputPath(`turn-before-selection-${width}.png`)});
  const box=await page.locator('#reef').boundingBox();
  await page.mouse.click(box.x+target.x/1600*box.width,box.y+(target.y+55)/900*box.height);
  await expect(page.locator('.inspect-card h3')).toHaveText('Great white shark');
  await page.screenshot({path:testInfo.outputPath(`turn-selected-${width}.png`)});
 }
});
