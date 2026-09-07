// Final visual evidence at both real display scales. Controlled locomotion
// exercises the full creature renderer; this is not a natural-community test.
import {chromium} from '@playwright/test';
import fs from 'node:fs';
import crypto from 'node:crypto';
const output=process.argv[2]||'artifacts/roster-final-poses';
fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1600,height:900}}),errors=[],results=[];
try{
 page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 for(let batch=0;batch<8;batch++){
  const result=await page.evaluate(async batch=>{
   const {SPECIES}=await import('/src/data.js'),{creatureWidth,creatureFrame}=await import('/src/geometry.js'),{BOTTOM_RESIDENTS,groundSpeed}=await import('/src/ground-motion.js'),{turnDuration}=await import('/src/turn-motion.js');
   const r=window.atoll.renderer;r.reducedMotion=false;r.poses??=new Map();if(window.atoll.simulation)window.atoll.simulation.paused=true;
   const sheet=document.createElement('canvas');sheet.width=1920;sheet.height=2250;const ctx=sheet.getContext('2d');ctx.fillStyle='#123d48';ctx.fillRect(0,0,sheet.width,sheet.height);ctx.fillStyle='#fff4d5';ctx.font='23px sans-serif';ctx.fillText(`Roster ${batch+1}/8 · full renderer · 60 Hz pose updates · two display scales`,20,32);ctx.font='15px sans-serif';ctx.fillText('Each cell: 1600-wide game size above, 1024-wide game size below. Root travel removed. Three cruise phases, then three turn phases (residents: quiet phases).',20,57);
   const rows=[];
   for(let row=0;row<8;row++){
    const species=SPECIES[batch*8+row],e={id:'final-'+species.id,species,x:700,y:350,angle:0,facing:1,alive:true,activity:'cruising',satiated:60};
    if(BOTTOM_RESIDENTS.has(species.id)){e.groundRoute=[[0,350],[1600,350]];e.groundDirection=1;e.groundDistance=700;}
    if(species.id==='s44')e.holdfast={x:700,y:350};
    const width=creatureWidth(species),height=creatureFrame(e).height,canvas=document.createElement('canvas');canvas.width=440;canvas.height=360;const c=canvas.getContext('2d');let time=0;const frames=[];
    r.poses.delete(e.id);
    function draw(dt,moving=true){
     if(dt){time+=dt;if(moving&&!e.holdfast)e.x+=(e.groundRoute?groundSpeed(e):species.speed)*dt*(e.facing||1);}
     c.clearRect(0,0,440,360);c.save();const frame=creatureFrame(e);c.translate(220-frame.x,180-frame.y);r.articulation.beginFrame(Infinity);r.drawCreature(c,e,time,dt);c.restore();
    }
    function advance(seconds,moving=true){for(let i=0;i<Math.round(seconds*60);i++)draw(1/60,moving);}
    function capture(label){
     const col=frames.length,x=col*320,y=82+row*270;ctx.fillStyle=row%2?'#194651':'#153f4a';ctx.fillRect(x,y,319,268);ctx.fillStyle='#fff4d5';ctx.font='14px sans-serif';ctx.fillText(col===0?species.id+' '+species.name:label,x+10,y+20);
     ctx.drawImage(canvas,x-60,y-85);ctx.save();ctx.translate(x+160,y+206);ctx.scale(.64,.64);ctx.drawImage(canvas,-220,-180);ctx.restore();
     ctx.fillStyle='#b9d6d4';ctx.font='12px sans-serif';ctx.fillText(label,x+10,y+258);
     const data=c.getImageData(0,0,440,360).data;let pixels=0,clipped=0;for(let p=0;p<data.length;p+=4)if(data[p+3]>10){pixels++;const px=p/4%440,py=Math.floor(p/4/440);if(px<3||px>436||py<3||py>356)clipped++;}
     frames.push({label,image:canvas.toDataURL(),pixels,clipped,time,activity:r.poses.get(e.id).activity});
    }
    advance(1.5);capture('Cruise +0.00 s');advance(.15);capture('Cruise +0.15 s');advance(.15);capture('Cruise +0.30 s');
    if(e.groundRoute||e.holdfast){advance(.5,false);capture('Quiet +0.50 s');advance(.5,false);capture('Quiet +1.00 s');advance(.5,false);capture('Quiet +1.50 s');}
    else {e.facing=-1;e.angle=Math.PI;const duration=turnDuration(species);advance(duration*.2);capture('Turn 20%');advance(duration*.6);capture('Turn 80%');advance(duration*.3);capture('Turn complete');}
    rows.push({id:species.id,name:species.name,width,height,changedCruise:frames[0].image!==frames[1].image&&frames[1].image!==frames[2].image,frames:frames.map(({image,...frame})=>frame)});
   }
   return {image:sheet.toDataURL('image/png').split(',')[1],rows};
  },batch);
  fs.writeFileSync(`${output}/batch-${batch}.png`,Buffer.from(result.image,'base64'));results.push(...result.rows);
 }
 const hashes=Object.fromEntries(fs.readdirSync('src').filter(f=>f.endsWith('.js')).map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync('src/'+f)).digest('hex')]));
 const report={scope:'Controlled full-renderer locomotion and turns at 60 Hz; real 1600/1024 display widths shown together. Root movement removed to expose local movement. Separate simulation/browser and natural-community evidence required.',results,errors,hashes};fs.writeFileSync(`${output}/report.json`,JSON.stringify(report,null,2));
 console.log(JSON.stringify({species:results.length,changedCruise:results.filter(r=>r.changedCruise).length,clipped:results.filter(r=>r.frames.some(f=>f.clipped)).map(r=>r.id),errors}));if(errors.length)process.exitCode=1;
}finally{await browser.close();}
