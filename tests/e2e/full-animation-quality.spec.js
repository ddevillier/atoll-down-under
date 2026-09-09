import {test,expect} from '@playwright/test';

test('default quality supplies current poses for slow residents and mesh fish without budget deferrals',async({page})=>{
 test.setTimeout(120000);
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 const result=await page.evaluate(async()=>{
  const {ArticulatedSprites}=await import('/src/articulated-motion.js'),{SPECIES}=await import('/src/data.js'),r=window.atoll.renderer;
  const cache=new ArticulatedSprites(),ctx=document.createElement('canvas').getContext('2d');
  const tracks=[4,13,19,20,26,37,44,45,46,47,60,61,62,63].map(id=>({id,changes:0,hold:0,maxHold:0,last:null}));
  for(let frame=0;frame<120;frame++){
   cache.beginFrame();
   for(const t of tracks){
    const im=r.sprites[t.id],draw=ctx.drawImage;let painted;
    ctx.drawImage=function(image,...args){painted=image;return draw.call(this,image,...args);};
    cache.draw(ctx,im,SPECIES[t.id],100,100*im.height/im.width,frame/60*.55,0,{instance:t.id});ctx.drawImage=draw;
    if(painted!==t.last){t.changes++;t.hold=0;t.last=painted;}else t.hold++;
    t.maxHold=Math.max(t.maxHold,t.hold);
   }
  }
  return {tracks:tracks.map(({last,...t})=>t),deferred:cache.deferred,pending:cache.pending.size,pixels:cache.pixels,maxPixels:cache.maxPixels,frames:cache.cache.size,maxFrames:cache.maxFrames};
 });
 expect(result.deferred).toBe(0);expect(result.pending).toBe(0);
 for(const t of result.tracks){expect(t.changes,'s'+t.id+' samples a slow cycle densely').toBeGreaterThanOrEqual(47);expect(t.maxHold,'s'+t.id+' does not retain a pose beyond its sample interval').toBeLessThanOrEqual(2);}
 expect(result.pixels).toBeLessThanOrEqual(result.maxPixels);expect(result.frames).toBeLessThanOrEqual(result.maxFrames);
});
