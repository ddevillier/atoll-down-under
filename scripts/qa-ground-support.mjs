import {chromium} from '@playwright/test';import fs from 'node:fs';import {clickButton} from './ui-actions.mjs';
const out=process.argv[2]||'artifacts/ground-support',browser=await chromium.launch(),errors=[];fs.mkdirSync(out,{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:1600,height:900}});page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:/Practice Choose/});await clickButton(page,{name:'Enter the reef'});
 const results=[];
 for(let reef=0;reef<9;reef++){
  const data=await page.evaluate(async({reef,guides})=>{
   const {Simulation}=await import('/src/simulation.js'),{REEFS}=await import('/src/data.js'),s=new Simulation(42),r=window.atoll.renderer;s.start('practice',reef===6?'s1':'s13');s.current=reef;s.paused=true;s.player.x=1450;s.player.y=70;Object.assign(window.atoll.simulation,s);r.poses=new Map();r.hover=null;r.inspect=false;r.draw(s,0);
   if(guides){const c=r.ctx;c.save();c.setTransform(r.canvas.width/1600,0,0,r.canvas.height/900,0,0);c.translate(0,55);for(const [i,route]of REEFS[reef].bottomRoutes.entries()){c.strokeStyle=['#fff8bb','#a9ffff','#ff9ce7'][i];c.lineWidth=3;c.beginPath();route.forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));c.stroke();for(const [x,y]of route){c.fillStyle=c.strokeStyle;c.beginPath();c.arc(x,y,4,0,Math.PI*2);c.fill();}}c.restore();}
   return {png:r.canvas.toDataURL().split(',')[1],reef,name:REEFS[reef].name,count:s.section.entities.length,residents:s.section.entities.filter(e=>e.groundRoute||e.holdfast).map(e=>({species:e.species.id,x:e.x,y:e.y,route:e.groundRoute,holdfast:e.holdfast}))};
  },{reef,guides:!process.argv.includes('--no-guides')});fs.writeFileSync(out+'/reef-'+reef+'.png',Buffer.from(data.png,'base64'));delete data.png;results.push(data);
 }
 fs.writeFileSync(out+'/report.json',JSON.stringify({scope:'Generated seed-42 communities; nighttime residents except meadow day seahorse; paused initial placement. Optional route guides show authored support coordinates, not added game art.',results,errors},null,2));console.log(JSON.stringify({scenes:results.length,errors}));
}finally{await browser.close();}
