import {chromium} from '@playwright/test';import fs from 'node:fs';import {execFileSync} from 'node:child_process';
const out='artifacts/animation-pose-contract';fs.mkdirSync(out,{recursive:true});
// Immutable pre-scheduler implementation, loaded beside the current renderer.
const baseline='bcf022e';fs.writeFileSync(out+'/baseline.mjs',execFileSync('git',['show',baseline+':src/articulated-motion.js'],{encoding:'utf8'}).replaceAll("from './","from '/src/"));
const browser=await chromium.launch();try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 const results=await page.evaluate(async()=>{
  const {ArticulatedSprites:Before}=await import('/artifacts/animation-pose-contract/baseline.mjs'),{ArticulatedSprites:After}=await import('/src/articulated-motion.js'),{SPECIES}=await import('/src/data.js'),{ANIMAL_PROFILES}=await import('/src/animal-profiles.js'),r=window.atoll.renderer,old=new Before(),now=new After(),a=document.createElement('canvas'),b=document.createElement('canvas');a.width=b.width=700;a.height=b.height=700;const results=[];
  for(const id of [4,13,19,20,22,24,26,37,40,44,45,46,47,48,56,60,61,62,63]){
   let compared=0,equal=0;
   const times=[47,62,63].includes(id)?[.125,.5,.875].map(phase=>(phase+1e-8)/ANIMAL_PROFILES['s'+id].frequency):[.13,.44,.89];
   for(const time of times)for(const effort of [0,1]){
    const state={feed:effort?.8:0,turn:effort?-.66:0,retract:effort?.4:0,puff:id===22&&effort?.6:0,heading:Math.PI,feedAngle:Math.PI};
    for(const [cache,canvas]of [[old,a],[now,b]]){const ctx=canvas.getContext('2d'),im=r.sprites[id];ctx.clearRect(0,0,700,700);ctx.save();ctx.translate(350,350);cache.beginFrame(Infinity);cache.draw(ctx,im,SPECIES[id],240,240*im.height/im.width,time,effort,state);ctx.restore();}
    compared++;if(a.toDataURL()===b.toDataURL())equal++;
   }
   results.push({id,compared,equal});
  }
  return results;
 });
 fs.writeFileSync(out+'/report.json',JSON.stringify({baseline,scope:'Exact rendered-pixel equality for six poses per remaining mesh species at 240 world pixels. Radial samples use shared old/new phase-grid positions; other species, including cuttlefish, use unchanged arbitrary times. Scheduling and radial cadence are tested separately.',results},null,2));console.log(JSON.stringify(results));if(results.some(r=>r.equal!==r.compared))process.exitCode=1;
}finally{await browser.close();}
