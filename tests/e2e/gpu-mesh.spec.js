import {test,expect} from '@playwright/test';
import fs from 'node:fs';

test('GPU mesh preserves painted coverage, color and orientation against the Canvas fallback',async({page})=>{
 test.setTimeout(120000);await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 const results=await page.evaluate(async()=>{
  const {ArticulatedSprites}=await import('/src/articulated-motion.js'),{SPECIES}=await import('/src/data.js'),r=window.atoll.renderer,gpu=new ArticulatedSprites(),cpu=new ArticulatedSprites();
  cpu.rasterizer={render:()=>null};const output=[],sheet=document.createElement('canvas');sheet.width=1200;sheet.height=560;const sc=sheet.getContext('2d');sc.fillStyle='#123b47';sc.fillRect(0,0,1200,560);const review=[4,19,37,44,61,63];
  for(const id of [4,13,19,20,22,24,26,37,40,44,45,46,47,48,56,60,61,62,63])for(const time of [.13,.71]){
   const canvases=[gpu,cpu].map(cache=>{const c=document.createElement('canvas');c.width=c.height=400;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.translate(200,200);const im=r.sprites[id];cache.beginFrame();cache.draw(ctx,im,SPECIES[id],200,200*im.height/im.width,time,.5,{feed:.4});return c;});
   const [a,b]=canvases.map(c=>c.getContext('2d').getImageData(0,0,400,400).data);let opaque=0,missing=0,error=0,common=0;
   for(let i=0;i<a.length;i+=4){if(b[i+3]>250){opaque++;if(a[i+3]<200)missing++;}if(a[i+3]>250&&b[i+3]>250){common++;error+=Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);}}
   output.push({id,time,opaque,missing:missing/Math.max(1,opaque),colorError:error/Math.max(1,common*3)});
   if(review.includes(id)&&time===.71){const i=review.indexOf(id),x=i%3*400,y=Math.floor(i/3)*280;sc.fillStyle='#fff5d8';sc.font='16px sans-serif';sc.fillText(SPECIES[id].name,x+12,y+22);sc.font='12px sans-serif';sc.fillText('GPU',x+80,y+46);sc.fillText('Canvas fallback',x+250,y+46);sc.drawImage(canvases[0],x,y+55,200,200);sc.drawImage(canvases[1],x+200,y+55,200,200);}
  }
  return {gpu:gpu.rasterizer.available,output,review:sheet.toDataURL()};
 });
 expect(results.gpu,'test actually exercised WebGL').toBe(true);
 for(const r of results.output){expect(r.opaque).toBeGreaterThan(20);expect(r.missing,'s'+r.id+' retains silhouette').toBeLessThan(.02);expect(r.colorError,'s'+r.id+' retains paint colors').toBeLessThan(8);}
 fs.writeFileSync('artifacts/gpu-mesh-comparison.png',Buffer.from(results.review.split(',')[1],'base64'));fs.writeFileSync('artifacts/gpu-mesh-pixel-report.json',JSON.stringify(results.output,null,2));
});

test('context loss falls back to Canvas and keeps generating live poses',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 const result=await page.evaluate(async()=>{
  const {ArticulatedSprites}=await import('/src/articulated-motion.js'),{SPECIES}=await import('/src/data.js'),r=window.atoll.renderer,m=new ArticulatedSprites(),im=r.sprites[19],c=document.createElement('canvas');c.width=c.height=400;const ctx=c.getContext('2d');
  const paint=t=>{ctx.clearRect(0,0,400,400);ctx.save();ctx.translate(200,200);m.beginFrame();m.draw(ctx,im,SPECIES[19],200,200*im.height/im.width,t,.5);ctx.restore();return c.toDataURL();};
  paint(.1);const wasGPU=m.rasterizer.available;m.rasterizer.gl.getExtension('WEBGL_lose_context').loseContext();await new Promise(resolve=>setTimeout(resolve,30));
  const first=paint(.4),second=paint(.7);return {wasGPU,fallback:!m.rasterizer.available,moving:first!==second,misses:m.misses};
 });
 expect(result.wasGPU).toBe(true);expect(result.fallback).toBe(true);expect(result.moving).toBe(true);expect(result.misses).toBe(3);
});
