import {chromium} from '@playwright/test';
import fs from 'node:fs';
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1600,height:900}});
try{
 await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 const results=await page.evaluate(async()=>{
  const {Simulation}=await import('/src/simulation.js'),{ArticulatedSprites}=await import('/src/articulated-motion.js'),{PaintedParts,PART_RIGS}=await import('/src/part-motion.js');
  const r=window.atoll.renderer,rigs={...PART_RIGS},results=[];
  for(const mode of ['previous mesh','painted parts']){
   if(mode==='previous mesh')for(const id of Object.keys(PART_RIGS))delete PART_RIGS[id];else Object.assign(PART_RIGS,rigs);
   const s=new Simulation(42);s.start('practice','s32');s.point(1400,350);r.poses?.clear();r.articulation=new ArticulatedSprites();r.parts=new PaintedParts();
   let sharkRequests=0,sharkDeferred=0;const mesh=r.articulation.draw,parts=r.parts.draw;
   r.articulation.draw=function(ctx,im,sp,...args){const before=this.deferred;const out=mesh.call(this,ctx,im,sp,...args);if(sp.id==='s32'){sharkRequests++;sharkDeferred+=this.deferred-before;}return out;};
   r.parts.draw=function(ctx,im,id,...args){if(id==='s32')sharkRequests++;return parts.call(this,ctx,im,id,...args);};
   const durations=[];
   for(let i=0;i<240;i++){s.step(1/60);const t=performance.now();r.draw(s,1/60);durations.push(performance.now()-t);}
   const sorted=durations.slice().sort((a,b)=>a-b);results.push({mode,frames:durations.length,sharkRequests,sharkDeferred,partsPrepared:r.parts.prepared,partsDraws:r.parts.draws,meanMs:durations.reduce((a,b)=>a+b,0)/durations.length,p95Ms:sorted[Math.floor(sorted.length*.95)],maxMs:sorted.at(-1),meshDeferred:r.articulation.deferred});
  }
  Object.assign(PART_RIGS,rigs);return results;
 });
 fs.mkdirSync('artifacts/motion-visibility',{recursive:true});fs.writeFileSync('artifacts/motion-visibility/renderer-comparison.json',JSON.stringify({environment:'Headless Chromium, synchronous seeded 240-frame scene; not native frame-pacing acceptance',results},null,2));console.log(results);
}finally{await browser.close();}
