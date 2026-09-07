import {chromium} from '@playwright/test';import fs from 'node:fs';import {clickButton} from './ui-actions.mjs';
const output=process.argv[2]||'artifacts/cleaner-motion';fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1600,height:1050}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.atoll?.renderer.ready);
const gallery=process.argv.includes('--ordinary-only')?{images:[],results:[]}:await page.evaluate(async()=>{
 const {Simulation}=await import('/src/simulation.js'),{SPECIES}=await import('/src/data.js'),{creatureFrame}=await import('/src/geometry.js'),{cleanerInspection}=await import('/src/cleaner-motion.js');
 const r=window.atoll.renderer,images=[],results=[];
 for(const index of [43,45]){
  const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1050;const ctx=canvas.getContext('2d');ctx.fillStyle='#123e47';ctx.fillRect(0,0,1600,1050);ctx.fillStyle='#f3efdc';ctx.font='24px sans-serif';ctx.fillText(SPECIES[index].name+' · actual inspection states',24,38);
  for(const [row,id] of ['s1','s16','s26'].entries()){
   const s=new Simulation(42);s.start('practice',id);const c=s.section.entities.find(e=>e.species.ability==='clean');Object.assign(c,{species:SPECIES[index],x:700,y:300,station:{x:700,y:300}});s.section.entities=[c];s.section.food=[];
   Object.assign(s.player,{x:500,y:300,angle:0,facing:1,health:40});s.requestCleaning(c);const states=[];
   for(let frame=0;frame<15*60&&states.length<3;frame++){s.step(1/60);if(s.player.cleanTime<=0)continue;const plan=cleanerInspection(c,s.player);if(plan.stage===states.length&&plan.gap<3&&c.actionTime>.08)states.push({client:structuredClone(s.player),cleaner:structuredClone(c),plan});}
   results.push({cleaner:SPECIES[index].name,client:s.player.species.name,stages:states.length});
   for(const [col,state] of states.entries()){
    const a=creatureFrame(state.client),b=creatureFrame(state.cleaner),left=Math.min(a.x-a.width/2,b.x-b.width/2),right=Math.max(a.x+a.width/2,b.x+b.width/2),top=Math.min(a.y-a.height/2,b.y-b.height/2),bottom=Math.max(a.y+a.height/2,b.y+b.height/2),scale=Math.min(4,450/(right-left),205/(bottom-top));
    const x=col*533,y=65+row*325;ctx.fillStyle='#f3efdc';ctx.font='18px sans-serif';ctx.fillText(s.player.species.name,x+20,y+20);ctx.font='14px sans-serif';ctx.fillText(['Gill-side inspection','Middle flank','Rear flank'][col]+' · '+Math.round(state.client.health)+' health',x+20,y+46);
    ctx.save();ctx.translate(x+266,y+173);ctx.scale(scale,scale);ctx.translate(-(left+right)/2,-(top+bottom)/2);r.articulation?.beginFrame(Infinity);
    const runtimeCanvas=r.canvas;r.canvas={width:1600*scale};
    r.drawCreature(ctx,{...state.client,id:'client-'+index+'-'+row+'-'+col},1,0);r.drawCreature(ctx,{...state.cleaner,id:'cleaner-'+index+'-'+row+'-'+col},1,0);r.canvas=runtimeCanvas;ctx.restore();
   }
  }
  images.push(canvas.toDataURL('image/png').split(',')[1]);
 }
 return {images,results};
});
for(let i=0;i<gallery.images.length;i++)fs.writeFileSync(output+'/inspection-'+i+'.png',Buffer.from(gallery.images[i],'base64'));delete gallery.images;await page.close();
const ordinary=[];
for(const species of ['Coral grouper','Flashlight fish'])for(const viewport of [{width:1600,height:900},{width:1024,height:768}]){
 const p=await browser.newPage({viewport,recordVideo:{dir:output+'/video'}});p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4173');await p.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(p,{name:/Practice Choose/});await p.getByRole('searchbox').fill(species);await p.getByRole('option').first().click();await clickButton(p,{name:'Enter the reef'});
 await p.evaluate(()=>{const s=window.atoll.simulation;Object.assign(s.player,{health:55,biteDamage:15,energy:45,recoveryDelay:60});s.protected=true;const step=s.step;s.step=function(dt){step.call(this,dt);if(this.player.cleanTime>.95)this.paused=true;};});
 await p.getByRole('button',{name:'Visit cleaner',exact:true}).click();
 try{await p.waitForFunction(()=>window.atoll.simulation.player.cleanTime>.95,null,{timeout:25000});}
 catch(error){console.log(JSON.stringify(await p.evaluate(()=>{const s=window.atoll.simulation;return {phase:s.phase,paused:s.paused,time:s.time,current:s.current,status:s.cleaningStatus,player:s.player,cleaner:s.section.entities.find(e=>e.species.ability==='clean'),pointer:s.pointer};})));await browser.close();throw error;}
 await p.screenshot({path:output+'/'+species.replaceAll(' ','-')+'-'+viewport.width+'.png'});
 ordinary.push(await p.evaluate(()=>{const s=window.atoll.simulation;return {species:s.player.species.name,health:s.player.health,cleanTime:s.player.cleanTime,population:s.section.entities.length};}));const video=p.video();await p.close();await video.saveAs(output+'/'+species.replaceAll(' ','-')+'-'+viewport.width+'.webm');
}
await browser.close();const report={...gallery,ordinary,errors};fs.writeFileSync(output+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(errors.length||gallery.results.some(r=>r.stages!==3))process.exitCode=1;
