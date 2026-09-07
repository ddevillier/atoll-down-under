import {test,expect} from '@playwright/test';

test('a tight shared pose budget keeps every animal moving regardless of draw order',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 const result=await page.evaluate(async()=>{
  const {ArticulatedSprites}=await import('/src/articulated-motion.js'),{SPECIES}=await import('/src/data.js'),r=window.atoll.renderer,cache=new ArticulatedSprites(),ctx=document.createElement('canvas').getContext('2d'),ids=[4,19,44,63],tracks=ids.map(id=>({id,changes:0,hold:0,maxHold:0,last:null}));
  for(let frame=0;frame<120;frame++){
   cache.beginFrame(.000001);
   for(const [i,id]of ids.entries()){
    const draw=ctx.drawImage;let image;ctx.drawImage=function(im,...args){image=im;return draw.call(this,im,...args);};
    const im=r.sprites[id];cache.draw(ctx,im,SPECIES[id],180,180*im.height/im.width,frame/60,.5,{instance:id});ctx.drawImage=draw;
    const t=tracks[i];if(image!==t.last){t.changes++;t.hold=0;t.last=image;}else t.hold++;t.maxHold=Math.max(t.maxHold,t.hold);
   }
  }
  return {tracks:tracks.map(({last,...t})=>t),pending:cache.pending.size,pixels:cache.pixels,max:cache.maxPixels};
 });
 for(const t of result.tracks){expect(t.changes,'s'+t.id+' advances').toBeGreaterThan(10);expect(t.maxHold,'s'+t.id+' no starvation').toBeLessThan(18);}
 expect(result.pending).toBeLessThanOrEqual(4);expect(result.pixels).toBeLessThanOrEqual(result.max);
});

test('deferred work replaces obsolete states for an individual and remains bounded',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 const result=await page.evaluate(async()=>{
  const {ArticulatedSprites}=await import('/src/articulated-motion.js'),{SPECIES}=await import('/src/data.js'),r=window.atoll.renderer,cache=new ArticulatedSprites(),fresh=new ArticulatedSprites(),a=document.createElement('canvas'),b=document.createElement('canvas');a.width=b.width=600;a.height=b.height=500;
  const paint=(cache,canvas,feed,instance)=>{const ctx=canvas.getContext('2d');ctx.clearRect(0,0,600,500);ctx.save();ctx.translate(300,250);cache.draw(ctx,r.sprites[19],SPECIES[19],240,240*r.sprites[19].height/r.sprites[19].width,.25,.5,{feed,instance});ctx.restore();};
  cache.beginFrame(0);for(const feed of [.2,.4,.6,.8])paint(cache,a,feed,'client');const pending=cache.pending.size;
  cache.beginFrame(Infinity);paint(cache,a,.8,'client');fresh.beginFrame(Infinity);paint(fresh,b,.8,'client');const match=a.toDataURL()===b.toDataURL(),misses=cache.misses;
  cache.beginFrame(0);for(let i=0;i<1000;i++)paint(cache,a,.4,'superseded-'+i);
  return {pending,match,misses,bounded:cache.pending.size};
 });
 expect(result.pending).toBe(1);expect(result.match).toBe(true);expect(result.misses).toBe(1);expect(result.bounded).toBeLessThanOrEqual(128);
});

test('slow radial loops change their rendered pose regularly without speeding up their cycle',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 const results=await page.evaluate(async()=>{
  const {ArticulatedSprites}=await import('/src/articulated-motion.js'),{SPECIES}=await import('/src/data.js'),r=window.atoll.renderer,canvas=document.createElement('canvas');canvas.width=canvas.height=400;const ctx=canvas.getContext('2d'),results=[];
  for(const id of [47,62,63]){
   const cache=new ArticulatedSprites(),im=r.sprites[id];let previous='',changes=0,hold=0,maxHold=0;
   for(let frame=0;frame<120;frame++){ctx.clearRect(0,0,400,400);ctx.save();ctx.translate(200,200);cache.beginFrame(Infinity);cache.draw(ctx,im,SPECIES[id],200,200*im.height/im.width,frame/60*.55,0);ctx.restore();const png=canvas.toDataURL();if(png!==previous){changes++;hold=0;}else hold++;maxHold=Math.max(maxHold,hold);previous=png;}
   results.push({id,changes,maxHold});
  }
  return results;
 });
 for(const r of results){expect(r.changes,'s'+r.id+' regular visible poses').toBeGreaterThan(15);expect(r.maxHold).toBeLessThan(10);}
});
