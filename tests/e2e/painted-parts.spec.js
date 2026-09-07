import {test,expect} from '@playwright/test';

test('painted parts keep moving with the mesh budget exhausted and freeze on pause/reduced motion',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 const results=await page.evaluate(async()=>{
  const {SPECIES}=await import('/src/data.js'),{ArticulatedSprites}=await import('/src/articulated-motion.js'),r=window.atoll.renderer;
  r.articulation=new ArticulatedSprites();const c=document.createElement('canvas');c.width=600;c.height=350;const ctx=c.getContext('2d'),results=[];
  for(const id of [23,32,42,27]){
   const e={id:'parts-'+id,species:SPECIES[id],x:300,y:175,angle:0,facing:1,activity:'cruising'};
   const paint=(time,dt)=>{ctx.clearRect(0,0,600,350);r.articulation.beginFrame(0);r.drawCreature(ctx,e,time,dt,1,260);return c.toDataURL();};
   r.reducedMotion=false;paint(1,1/60);const still=paint(2,0),paused=still===paint(8,0);let changes=0,previous=still;
   for(let i=0;i<30;i++){const now=paint(2+i/60,1/60);if(now!==previous)changes++;previous=now;}
   r.reducedMotion=true;const reduced=paint(3,1/60)===paint(9,1/60);results.push({id,paused,reduced,changes});
  }
  r.reducedMotion=false;return {results,prepared:r.parts.prepared,meshMisses:r.articulation.misses,meshDeferred:r.articulation.deferred};
 });
 expect(results.prepared).toBe(4);expect(results.meshMisses).toBe(0);expect(results.meshDeferred).toBe(0);
 for(const r of results.results){expect(r.paused).toBe(true);expect(r.reduced).toBe(true);expect(r.changes).toBeGreaterThan(25);}
});

test('the live comparison offers pause, gameplay size and reduced-motion defaults',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/scripts/motion-preview.html');await page.waitForFunction(()=>window.motionPreview);
 await expect(page.getByRole('button',{name:'Play motion',exact:true})).toBeVisible();await expect(page.locator('#size')).toHaveValue('1');
 const before=await page.locator('canvas').evaluate(c=>c.toDataURL());await page.waitForTimeout(150);expect(await page.locator('canvas').evaluate(c=>c.toDataURL())).toBe(before);
 await page.getByRole('button',{name:'Play motion',exact:true}).click();await page.waitForTimeout(150);expect(await page.locator('canvas').evaluate(c=>c.toDataURL())).not.toBe(before);await page.getByRole('button',{name:'Pause motion',exact:true}).click();
});
