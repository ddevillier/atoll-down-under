import {test,expect} from '@playwright/test';

test('long-fin full poses freeze when paused or reduced and use bounded repeating deformation frames',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 const result=await page.evaluate(async()=>{
  const {SPECIES}=await import('/src/data.js'),{ArticulatedSprites}=await import('/src/articulated-motion.js'),r=window.atoll.renderer;
  const c=document.createElement('canvas');c.width=600;c.height=350;const ctx=c.getContext('2d'),results=[];
  for(const id of [4,11,13,20,40,55,56,58]){
   const e={id:'fin-test-'+id,species:SPECIES[id],x:300,y:175,angle:0,facing:1,activity:'cruising'},paint=(time,dt)=>{ctx.clearRect(0,0,600,350);r.articulation?.beginFrame(Infinity);r.drawCreature(ctx,e,time,dt,1,320);return c.toDataURL();};
   r.reducedMotion=false;paint(1,1/60);const paused=paint(2,0)===paint(8,0);
   r.reducedMotion=true;const reduced=paint(3,1/60)===paint(9,1/60);
   // These species pass through the real cyclic cache, including fin and streamer
   // deformation. The repeated phase must not allocate a second sequence.
   const cache=new ArticulatedSprites(),im=r.sprites[id],draw=t=>{cache.beginFrame(Infinity);cache.draw(ctx,im,e.species,320,320*im.height/im.width,t,.5,{});};
   const frequency=(await import('/src/animal-profiles.js')).ANIMAL_PROFILES[e.species.id].frequency;
   for(let i=0;i<24;i++)draw((i+.1)/24/frequency);const first=cache.misses;
   for(let i=0;i<24;i++)draw((i+.1)/24/frequency+1/frequency);
   results.push({id,paused,reduced,first,second:cache.misses,pixels:cache.pixels,max:cache.maxPixels});
  }
  r.reducedMotion=false;return results;
 });
 for(const r of result){expect(r.paused).toBe(true);expect(r.reduced).toBe(true);expect(r.first).toBe(24);expect(r.second).toBe(r.first);expect(r.pixels).toBeLessThanOrEqual(r.max);}
});
