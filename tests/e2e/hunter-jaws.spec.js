import {test,expect} from '@playwright/test';

test('hunter feeding moves lower lips while eyes stay fixed and the cavity preserves painted alpha',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 const results=await page.evaluate(async()=>{
  const {PaintedParts}=await import('/src/part-motion.js'),{ANIMAL_RIGS}=await import('/src/animal-rigs.js'),parts=new PaintedParts(),r=window.atoll.renderer,results=[];
  for(const n of [16,21,38,39,54,59]){
   const id='s'+n,im=r.sprites[n],w=400,h=w*im.height/im.width,c=document.createElement('canvas');c.width=600;c.height=400;const ctx=c.getContext('2d');
   const paint=feed=>{ctx.clearRect(0,0,600,400);ctx.save();ctx.translate(300,200);parts.draw(ctx,im,id,w,h,.2,0,{feed});ctx.restore();return ctx.getImageData(0,0,600,400).data;};
   const a=paint(0),b=paint(1),[ex,ey]=ANIMAL_RIGS[id].eye;let eyeChanged=0,mouthChanged=0;
   for(let y=0;y<400;y++)for(let x=0;x<600;x++){
    const i=(y*600+x)*4,changed=[0,1,2,3].some(k=>a[i+k]!==b[i+k]);if(!changed)continue;
    const u=(x-100)/w,v=(y-200+h/2)/h;
    if(Math.abs(u-ex)<.025&&Math.abs(v-ey)<.035)eyeChanged++;
    if(u>.82&&u<1.08&&v>.49&&v<.93)mouthChanged++;
   }
   const p=parts.prepare(im,id).pieces.find(p=>p.mode==='jaw'),pa=p.canvas.getContext('2d').getImageData(0,0,p.canvas.width,p.canvas.height).data,ca=p.cavityCanvas.getContext('2d').getImageData(0,0,p.canvas.width,p.canvas.height).data;
   let alphaMismatch=0;for(let i=3;i<pa.length;i+=4)if(pa[i]!==ca[i])alphaMismatch++;
   results.push({id,eyeChanged,mouthChanged,alphaMismatch});
  }
  return results;
 });
 for(const r of results){expect(r.eyeChanged,r.id+' eye').toBe(0);expect(r.mouthChanged,r.id+' lower lip').toBeGreaterThan(100);expect(r.alphaMismatch,r.id+' cavity outline').toBe(0);}
 await page.goto('/scripts/motion-preview.html');await page.waitForFunction(()=>window.motionPreview);await page.evaluate(()=>{window.motionPreview.setPaused(true);window.motionPreview.setTime(3.24);});await page.selectOption('#animals','hunters');await expect(page.locator('#meal')).toBeEnabled();
 const closed=await page.locator('canvas').evaluate(c=>c.toDataURL());await page.check('#meal');await expect(page.locator('#status')).toContainText('feeding gesture');expect(await page.locator('canvas').evaluate(c=>c.toDataURL())).not.toBe(closed);
});
