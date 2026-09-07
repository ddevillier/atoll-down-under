import {chromium} from '@playwright/test';import fs from 'node:fs';import {clickButton} from './ui-actions.mjs';
const out=process.argv[2]||'artifacts/cleaner-parts',browser=await chromium.launch(),errors=[],results=[];fs.mkdirSync(out,{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:1600,height:900}});page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 const gallery=await page.evaluate(async()=>{
  const {Simulation}=await import('/src/simulation.js'),{cleanerInspection}=await import('/src/cleaner-motion.js'),{creatureFrame}=await import('/src/geometry.js'),{PaintedParts}=await import('/src/part-motion.js');
  const r=window.atoll.renderer,canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1080;const ctx=canvas.getContext('2d');ctx.fillStyle='#123e47';ctx.fillRect(0,0,1600,1080);const rows=[];
  for(const [row,[id,facing]]of [['s1',1],['s1',-1],['s16',1],['s16',-1]].entries()){
   const s=new Simulation(42);s.start('practice',id);const c=s.section.entities.find(e=>e.species.ability==='clean');s.section.entities=[c];s.section.food=[];Object.assign(s.player,{x:c.station.x+35,y:c.station.y,angle:facing<0?Math.PI:0,facing,health:40,biteDamage:15,recoveryDelay:60});s.requestCleaning(c);r.poses=new Map();let count=0;
   const scratch=document.createElement('canvas').getContext('2d');
   for(let i=0;i<15*60&&count<3;i++){
    s.step(1/60);r.articulation?.beginFrame(Infinity);r.drawCreature(scratch,s.player,s.time,1/60);r.drawCreature(scratch,c,s.time,1/60);
    if(s.player.cleanTime<=0)continue;const p=cleanerInspection(c,s.player);if(p.stage!==count||p.gap>=3||c.actionTime<.1)continue;
    const a=creatureFrame(s.player),b=creatureFrame(c),left=Math.min(a.x-a.width/2,b.x-b.width/2),right=Math.max(a.x+a.width/2,b.x+b.width/2),top=Math.min(a.y-a.height/2,b.y-b.height/2),bottom=Math.max(a.y+a.height/2,b.y+b.height/2),scale=Math.min(5,470/(right-left),170/(bottom-top));
    const x=count*533,y=row*270;ctx.fillStyle='#fff6da';ctx.font='18px sans-serif';ctx.fillText(s.player.species.name+' · '+(facing<0?'left':'right'),x+15,y+28);ctx.fillText(['Gill-side picking','Middle flank','Rear flank'][count],x+15,y+52);
    ctx.save();ctx.translate(x+266,y+158);ctx.scale(scale,scale);ctx.translate(-(left+right)/2,-(top+bottom)/2);r.drawCreature(ctx,s.player,s.time,0);r.drawCreature(ctx,c,s.time,0);ctx.restore();count++;
   }
   rows.push({id,facing,stages:count});
  }
  const strip=document.createElement('canvas');strip.width=1600;strip.height=420;const q=strip.getContext('2d');q.fillStyle='#123e47';q.fillRect(0,0,1600,420);const parts=new PaintedParts(),im=r.sprites[43];
  for(const [i,[time,effort,feed]]of [[.05,1,0],[.20,1,0],[.4,0,.9],[.6,0,0]].entries()){q.save();q.translate(i*400+200,190);parts.draw(q,im,'s43',370,370*im.height/im.width,time,effort,{feed});q.restore();q.fillStyle='#fff6da';q.font='20px sans-serif';q.fillText(['Swim A','Swim B','Picking','Station hover'][i],i*400+20,310);}
  return {images:[canvas.toDataURL().split(',')[1],strip.toDataURL().split(',')[1]],rows};
 });
 for(const [i,name]of ['inspection.png','phases.png'].entries())fs.writeFileSync(out+'/'+name,Buffer.from(gallery.images[i],'base64'));results.push(...gallery.rows);await page.close();
 for(const [width,height]of process.argv.includes('--gallery-only')?[]:[[1600,900],[1024,768]]){
  const p=await browser.newPage({viewport:{width,height}});p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4173');await p.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(p,{name:/Practice Choose/});await p.getByRole('searchbox').fill('Coral grouper');await p.getByRole('option').first().click();await clickButton(p,{name:'Enter the reef'});
  await p.evaluate(()=>{const s=window.atoll.simulation;Object.assign(s.player,{health:55,biteDamage:15,energy:45,recoveryDelay:60});s.protected=true;const step=s.step;s.step=function(dt){step.call(this,dt);if(this.player.cleanTime>.95)this.paused=true;};});await p.getByRole('button',{name:'Visit cleaner',exact:true}).click();await p.waitForFunction(()=>window.atoll.simulation.player.cleanTime>.95,null,{timeout:25000});await p.screenshot({path:out+'/gameplay-'+width+'.png'});results.push(await p.evaluate(width=>({width,cleanTime:window.atoll.simulation.player.cleanTime,count:window.atoll.simulation.section.entities.length}),width));await p.close();
 }
 fs.writeFileSync(out+'/report.json',JSON.stringify({scope:'Actual treatment galleries with isolated clients and prepared health; ordinary UI visits preserve generated communities with prepared parasite/bite damage and protection.',results,errors},null,2));console.log(JSON.stringify({results,errors}));if(errors.length||results.some(r=>r.stages!=null&&r.stages!==3))process.exitCode=1;
}finally{await browser.close();}
