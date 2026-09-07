import {chromium} from '@playwright/test';import fs from 'node:fs';import {clickButton} from './ui-actions.mjs';
const output=process.argv[2]||'artifacts/refuge-scenes';fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1600,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill('Neon');await page.getByRole('option').first().click();await clickButton(page,{name:'Enter the reef'});
const results=[];
for(let reef=0;reef<9;reef++){
 results.push(await page.evaluate(async reef=>{const {Simulation}=await import('/src/simulation.js'),s=window.atoll.simulation,fresh=new Simulation(42);fresh.start('practice','s1');Object.assign(s,fresh);s.current=reef;s.player.x=1450;s.player.y=80;s.point(1450,80);s.protected=true;
  for(const e of s.section.entities){e.satiated=120;e.health=100;}
  for(let i=0;i<45*30;i++)s.step(1/30);s.paused=true;window.atoll.renderer.inspect=true;
  return {reef,count:s.section.entities.length,residents:s.section.entities.filter(e=>e.ecology?.home).map(e=>({id:e.id,species:e.species.name,activity:e.activity,home:e.ecology.home,x:e.x,y:e.y,host:e.ecology.host}))};
 },reef));await page.waitForTimeout(120);await page.screenshot({path:output+'/reef-'+reef+'.png'});
}
const gallery=await page.evaluate(async()=>{
 const {Simulation}=await import('/src/simulation.js'),{SPECIES}=await import('/src/data.js'),{localRoutine}=await import('/src/ecology.js'),{creatureFrame}=await import('/src/geometry.js'),{refugeLayers}=await import('/src/refuge-motion.js');const r=window.atoll.renderer,canvas=document.createElement('canvas');canvas.width=1600;canvas.height=900;const c=canvas.getContext('2d');c.fillStyle='#123e47';c.fillRect(0,0,1600,900);const cases=[];
 for(const [col,kind] of ['anemone','shadow'].entries()){
  const s=new Simulation(42);s.start('practice',kind==='shadow'?'s40':'s1');s.section.food=[];s.player.x=800;s.player.y=350;s.point(800,350);
  const fish=kind==='anemone'?[7,7,7,63]:[41];s.section.entities=fish.map((id,i)=>({...structuredClone(s.player),id:900+i,species:SPECIES[id],x:730+i*30,y:400,health:100,satiated:120,angle:0}));
  if(kind==='anemone'){s.player.x=1400;s.player.y=100;s.point(1400,100);s.section.entities[3].x=800;s.section.entities[3].y=450;}
  // Fixed anemone for this controlled close-up; the ordinary reef captures use
  // real substrate placement. Other subjects execute their actual routines.
  for(let i=0;i<35*60;i++)for(const e of s.section.entities.filter(e=>e.species.id!=='s63')){const speed=localRoutine(s,e,1/60,e.species.speed*.35);e.x+=Math.cos(e.angle)*speed/60;e.y+=Math.sin(e.angle)*speed/60;e.facing=Math.cos(e.angle)>=0?1:-1;}
  const actors=kind==='anemone'?refugeLayers(s.section.entities):[...refugeLayers(s.section.entities),s.player],frames=actors.map(e=>creatureFrame(e));const left=Math.min(...frames.map(f=>f.x-f.width/2)),right=Math.max(...frames.map(f=>f.x+f.width/2)),top=Math.min(...frames.map(f=>f.y-f.height/2)),bottom=Math.max(...frames.map(f=>f.y+f.height/2)),scale=Math.min(3.5,680/(right-left),560/(bottom-top));
  c.fillStyle='#f2eedb';c.font='25px sans-serif';c.fillText(kind==='anemone'?'Distinct places around an anemone':'Trumpetfish behind a compatible neighbor',col*800+30,65);
  c.save();c.translate(col*800+400,460);c.scale(scale,scale);c.translate(-(left+right)/2,-(top+bottom)/2);r.articulation?.beginFrame(Infinity);const runtime=r.canvas;r.canvas={width:1600*scale};for(const e of actors)r.drawCreature(c,{...e,id:kind+'-'+e.id},1,0);r.canvas=runtime;c.restore();
  cases.push({kind,actors:actors.map(e=>({species:e.species.name,activity:e.activity,host:e.ecology?.host}))});
 }
 return {image:canvas.toDataURL('image/png').split(',')[1],cases};
});fs.writeFileSync(output+'/partnerships.png',Buffer.from(gallery.image,'base64'));delete gallery.image;
await browser.close();const report={scope:'All nine existing seeded communities after 45 seconds; satiation and health held initially high for resting review. Controlled partnership close-ups separately.',results,...gallery,errors};fs.writeFileSync(output+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({reefs:results.length,cases:gallery.cases,errors}));if(errors.length)process.exitCode=1;
