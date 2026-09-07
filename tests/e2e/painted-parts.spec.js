import {test,expect} from '@playwright/test';

test('cropped fin canvases preserve full-canvas placement through folded poses',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 const results=await page.evaluate(async()=>{
  const {PaintedParts,PART_RIGS}=await import('/src/part-motion.js'),r=window.atoll.renderer,parts=new PaintedParts(),results=[];
  const make=()=>{const c=document.createElement('canvas');c.width=600;c.height=400;return c;},a=make(),b=make();
  for(const id of Object.keys(PART_RIGS)){
   const im=r.sprites[Number(id.slice(1))],prepared=parts.prepare(im,id),original=prepared.pieces;
   const expand=(part,p)=>{if(!part)return undefined;const canvas=document.createElement('canvas');canvas.width=im.width;canvas.height=im.height;canvas.getContext('2d').drawImage(part,p.left,p.top);return canvas;};
   const full=original.map(p=>({...p,canvas:expand(p.canvas,p),cavityCanvas:expand(p.cavityCanvas,p),left:0,top:0}));
   let worst=0;
   for(const width of [60,260])for(const time of [0,.21,.6]){
    for(const [canvas,pieces] of [[a,original],[b,full]]){prepared.pieces=pieces;const c=canvas.getContext('2d');c.clearRect(0,0,600,400);c.save();c.translate(300,200);parts.draw(c,im,id,width,width*im.height/im.width,time,.7,{brake:.4,turn:.3,feed:time});c.restore();}
    const x=a.getContext('2d').getImageData(0,0,600,400).data,y=b.getContext('2d').getImageData(0,0,600,400).data;let visible=0,changed=0;
    for(let i=0;i<x.length;i+=4){if(x[i+3]||y[i+3])visible++;if(Math.max(...[0,1,2,3].map(k=>Math.abs(x[i+k]-y[i+k])))>8)changed++;}
    worst=Math.max(worst,changed/Math.max(1,visible));
   }
   prepared.pieces=original;results.push({id,worst,cropped:original.reduce((n,p)=>n+p.canvas.width*p.canvas.height,0),full:im.width*im.height*original.length});
  }
  return results;
 });
 for(const r of results){expect(r.worst,r.id+' crop alignment').toBeLessThan(.03);expect(r.cropped,r.id+' cropped allocation').toBeLessThan(r.full);}
});

test('painted parts keep moving with the mesh budget exhausted and freeze on pause/reduced motion',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 const results=await page.evaluate(async()=>{
  const {SPECIES}=await import('/src/data.js'),{ArticulatedSprites}=await import('/src/articulated-motion.js'),r=window.atoll.renderer;
  r.articulation=new ArticulatedSprites();const c=document.createElement('canvas');c.width=600;c.height=350;const ctx=c.getContext('2d'),results=[];
  for(const id of [0,1,2,3,5,6,7,8,9,10,11,12,14,15,16,17,18,21,23,25,27,28,29,30,31,32,33,34,35,36,38,39,41,42,49,50,51,52,53,54,55,57,58,59]){
   const e={id:'parts-'+id,species:SPECIES[id],x:300,y:175,angle:0,facing:1,activity:'cruising'};
   const paint=(time,dt)=>{ctx.clearRect(0,0,600,350);r.articulation.beginFrame(0);r.drawCreature(ctx,e,time,dt,1,260);return c.toDataURL();};
   r.reducedMotion=false;paint(1,1/60);const still=paint(2,0),paused=still===paint(8,0);let changes=0,previous=still;
   for(let i=0;i<30;i++){const now=paint(2+i/60,1/60);if(now!==previous)changes++;previous=now;}
   r.reducedMotion=true;const reduced=paint(3,1/60)===paint(9,1/60);results.push({id,paused,reduced,changes});
  }
  r.reducedMotion=false;return {results,prepared:r.parts.prepared,meshMisses:r.articulation.misses,meshDeferred:r.articulation.deferred};
 });
 expect(results.prepared).toBe(44);expect(results.meshMisses).toBe(0);expect(results.meshDeferred).toBe(0);
 for(const r of results.results){expect(r.paused).toBe(true);expect(r.reduced).toBe(true);expect(r.changes).toBeGreaterThan(25);}
});

test('the live comparison offers pause, gameplay size and reduced-motion defaults',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/scripts/motion-preview.html');await page.waitForFunction(()=>window.motionPreview);
 await expect(page.getByRole('button',{name:'Play motion',exact:true})).toBeVisible();await expect(page.locator('#size')).toHaveValue('1');
 const before=await page.locator('canvas').evaluate(c=>c.toDataURL());await page.waitForTimeout(150);expect(await page.locator('canvas').evaluate(c=>c.toDataURL())).toBe(before);
 await page.getByRole('button',{name:'Play motion',exact:true}).click();await page.waitForTimeout(150);expect(await page.locator('canvas').evaluate(c=>c.toDataURL())).not.toBe(before);await page.getByRole('button',{name:'Pause motion',exact:true}).click();
 await page.selectOption('#animals','sharks');await expect(page.locator('canvas')).toHaveAttribute('aria-label',/Great white shark/);
 await page.selectOption('#size','2.4');await page.waitForTimeout(100);
 await page.evaluate(()=>{const r=window.motionPreview.renderer,resize=r.resize;window.previewResizes=0;r.resize=function(){window.previewResizes++;return resize.call(this);};});await page.waitForTimeout(150);expect(await page.evaluate(()=>window.previewResizes)).toBe(0);
});
