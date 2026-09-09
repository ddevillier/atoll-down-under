import {_electron as electron} from '@playwright/test';import fs from 'node:fs';import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';import {clickButton} from './ui-actions.mjs';
const out=process.argv[2]||'artifacts/roster-native-performance',quick=process.argv.includes('--quick');fs.mkdirSync(out,{recursive:true});
const option=name=>process.argv.find(a=>a.startsWith('--'+name+'='))?.split('=')[1];
const widths=option('width')?[Number(option('width'))]:quick?[1600]:[1600,1024],players=option('player')?option('player').split(','):['s1','s13'],reefs=option('reefs')?option('reefs').split(',').map(Number):quick?[4]:[0,1,2,3,4,5,6,7,8],duration=Number(option('seconds')||2.4)*1000;
const app=await electron.launch({...(option('executable')?{executablePath:option('executable')}:{args:['.']}),env:{...process.env,ATOLL_QA:'1'}}),errors=[],results=[];
try{
 const page=await app.firstWindow();page.on('pageerror',e=>errors.push(e.message));
 const platform=await app.evaluate(({app,BrowserWindow})=>{if(!/[\\/]atoll-qa-/.test(app.getPath('userData')))throw Error('Expected isolated QA storage');const w=BrowserWindow.getAllWindows()[0];w.webContents.setBackgroundThrottling(false);w.setFullScreen(false);return {versions:process.versions,platform:process.platform,gpu:app.getGPUFeatureStatus(),visible:w.isVisible()};});
 await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:/Practice Choose/});await clickButton(page,{name:'Enter the reef'});
 platform.initialGpu=platform.gpu;
 Object.assign(platform,await app.evaluate(async({app})=>({gpu:app.getGPUFeatureStatus(),gpuInfo:await app.getGPUInfo('complete')})));
 await page.evaluate(async()=>{
  const r=window.atoll.renderer,{ArticulatedSprites}=await import(new URL('src/articulated-motion.js',location.href)),originalDraw=r.draw,originalCreature=r.drawCreature;
  r.articulation=new ArticulatedSprites();window.perfProbe={active:false,times:[],intervals:[],animals:new Map(),last:0};const probe=window.perfProbe,mesh=r.articulation,originalMesh=mesh.draw;
  r.drawCreature=function(ctx,e,...args){probe.entity=e;return originalCreature.call(this,ctx,e,...args);};
  mesh.draw=function(ctx,image,species,...args){
   if(!probe.active)return originalMesh.call(this,ctx,image,species,...args);
   const e=probe.entity,key=e.id,now=performance.now();let a=probe.animals.get(key);if(!a){a={id:key,species:species.id,requests:0,deferred:0,changes:0,maxHoldMs:0,lastChange:now,lastImage:null};probe.animals.set(key,a);}
   const before=this.deferred,drawImage=ctx.drawImage;let painted;
   ctx.drawImage=function(image,...args){painted=image;return drawImage.call(this,image,...args);};
   try{return originalMesh.call(this,ctx,image,species,...args);}finally{ctx.drawImage=drawImage;a.requests++;a.deferred+=this.deferred-before;if(painted!==a.lastImage){a.maxHoldMs=Math.max(a.maxHoldMs,now-a.lastChange);a.lastChange=now;a.lastImage=painted;a.changes++;}else a.maxHoldMs=Math.max(a.maxHoldMs,now-a.lastChange);}
  };
  r.draw=function(...args){const start=performance.now();originalDraw.apply(this,args);if(probe.active){probe.times.push(performance.now()-start);if(probe.last)probe.intervals.push(start-probe.last);probe.last=start;}};
 });
 if(option('budget'))await page.evaluate(budget=>{const m=window.atoll.renderer.articulation,begin=m.beginFrame;m.beginFrame=function(value){return begin.call(this,value===Infinity?value:budget);};},Number(option('budget')));
 for(const width of widths)for(const species of players){
  await app.evaluate(({BrowserWindow},{width,height})=>BrowserWindow.getAllWindows()[0].setContentSize(width,height),{width,height:Number(option('height')||(width>=1600?Math.round(width*9/16):768))});
  await page.evaluate(async species=>{const {Simulation}=await import(new URL('src/simulation.js',location.href)),s=new Simulation(42);s.start('practice',species);Object.assign(window.atoll.simulation,s);window.atoll.renderer.poses=new Map();},species);
  for(const reef of reefs){
   await page.evaluate(reef=>{const s=window.atoll.simulation;s.current=reef;s.player.x=800;s.player.y=370;s.point(800,370);s.paused=false;const p=window.perfProbe;p.active=false;p.times=[];p.intervals=[];p.animals.clear();p.last=0;},reef);
   await page.waitForTimeout(400);await page.evaluate(()=>{window.perfProbe.active=true;});await page.waitForTimeout(duration);
   const stats=await page.evaluate(()=>{
    const p=window.perfProbe;p.active=false;const r=window.atoll.renderer,s=window.atoll.simulation,summary=values=>{const v=[...values].sort((a,b)=>a-b);return {n:v.length,mean:v.reduce((a,b)=>a+b,0)/v.length,p50:v[Math.floor(v.length*.5)],p95:v[Math.floor(v.length*.95)],max:v.at(-1)};};
    return {reef:s.current,count:s.section.entities.filter(e=>e.alive).length,canvas:[r.canvas.width,r.canvas.height],drawMs:summary(p.times),intervalMs:summary(p.intervals),mesh:[...p.animals.values()].map(({lastImage,lastChange,...a})=>a),meshBackend:r.articulation.rasterizer?.available?'webgl':'canvas',cachePixels:r.articulation.pixels,cacheFrames:r.articulation.cache.size,partPixels:r.parts?.preparedPixels||0};
   });
   results.push({width,player:species,...stats});console.log(JSON.stringify({width,player:species,reef:stats.reef,drawP95:stats.drawMs.p95,intervalP95:stats.intervalMs.p95,worstHold:Math.max(0,...stats.mesh.map(a=>a.maxHoldMs)),deferred:stats.mesh.reduce((n,a)=>n+a.deferred,0)}));
  }
 }
 const metrics=await app.evaluate(({app})=>app.getAppMetrics().map(p=>({type:p.type,memory:p.memory,cpu:p.cpu})));
 const sourceHashes=Object.fromEntries(fs.readdirSync('src').filter(f=>f.endsWith('.js')).map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync('src/'+f)).digest('hex')]));
 platform.finalGpu=await app.evaluate(({app})=>app.getGPUFeatureStatus());
 fs.writeFileSync(out+'/report.json',JSON.stringify({scope:'Native Windows Electron in isolated QA storage with background throttling disabled, real requestAnimationFrame loop and generated day/night communities. GPU status is sampled before readiness, after asset loading, and at completion. Measures renderer CPU and callback cadence, not monitor presentation. Mesh canvas-identity instrumentation is included in cost.',budgetOverride:option('budget')||null,revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceHashes,platform,metrics,results,errors},null,2));
 if(errors.length||results.some(r=>r.drawMs.n<20))process.exitCode=1;
}finally{await app.close();}
