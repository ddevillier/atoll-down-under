import {chromium} from '@playwright/test';import fs from 'node:fs';import {clickButton} from './ui-actions.mjs';
const output=process.argv[2]||'artifacts/resident-motion';fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch(),page=await browser.newPage(),errors=[],results=[];
page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.atoll?.renderer.ready);
for(const id of ['s46','s60','s61']){
 const result=await page.evaluate(async id=>{
  const {Simulation}=await import('/src/simulation.js'),{SPECIES}=await import('/src/data.js'),{creatureFrame}=await import('/src/geometry.js'),r=window.atoll.renderer;
  const sheet=document.createElement('canvas');sheet.width=2000;sheet.height=1600;const ctx=sheet.getContext('2d');ctx.fillStyle='#123e47';ctx.fillRect(0,0,2000,1600);ctx.fillStyle='#f4edda';ctx.font='28px sans-serif';ctx.fillText(SPECIES.find(s=>s.id===id).name+' · full renderer / actual resident routine · inspection scale',25,40);
  const sample=document.createElement('canvas');sample.width=500;sample.height=340;const c=sample.getContext('2d'),evidence=[];
  for(const [row,kind] of ['travel','settle','passer response','feeding'].entries()){
   const s=new Simulation(42);s.start('practice','s38');s.current=4;const e=s.section.entities.find(e=>e.species.id===id);s.section.entities=[e];s.player.x=40;s.player.y=40;
   if(kind!=='feeding'){s.section.food=[];e.satiated=100;}r.poses?.clear();let elapsed=0,col=0;
   function draw(dt){const b=creatureFrame(e,320);c.clearRect(0,0,500,340);c.save();c.translate(250-b.x,155-b.y);c.strokeStyle='#437078';c.lineWidth=1;c.beginPath();c.moveTo(e.x-240,e.y);c.lineTo(e.x+240,e.y);c.stroke();r.articulation?.beginFrame(Infinity);r.drawCreature(c,e,elapsed,dt,1,320);c.restore();}
   function step(){s.stepNpc(e,1/60);elapsed+=1/60;draw(1/60);}
   function capture(label){ctx.drawImage(sample,col*500,75+row*380);ctx.fillStyle='#f4edda';ctx.font='19px sans-serif';ctx.fillText(kind+' · '+label,col*500+20,420+row*380);evidence.push({kind,label,activity:e.activity,facing:e.facing,retract:e.retract,meal:e.residentMeal?{...e.residentMeal}:null,x:e.x,y:e.y});col++;}
   if(kind==='feeding'){
    for(let i=0;i<100*60&&col<4;i++){step();const a=e.residentMeal;if(col===0&&a&&!a.committed)capture('prepare');else if(col===1&&a?.committed)capture('contact');else if(col===2&&a?.elapsed>.45)capture('recover');else if(col===3&&!a&&e.satiated>0)capture('resumed');}
   }else{
    for(let i=0;i<60;i++)step();const start=elapsed;
    if(kind==='settle')e.actionTime=2;
    if(kind==='passer response'){s.player.x=e.x;s.player.y=e.y-10;}
    for(const t of [0,.4,.9,1.8]){while(elapsed<start+t){if(kind==='passer response'&&elapsed-start>.6){s.player.x=40;s.player.y=40;}step();}capture(t.toFixed(1)+'s');}
   }
   if(col!==4)throw Error(id+' incomplete '+kind+': '+col);
  }
  return {id,evidence,image:sheet.toDataURL().split(',')[1]};
 },id);
 fs.writeFileSync(output+'/'+id+'-strip.png',Buffer.from(result.image,'base64'));delete result.image;results.push(result);
}
await page.close();
if(!process.argv.includes('--strips-only'))for(const [width,height] of [[1600,900],[1024,768]]){
 const p=await browser.newPage({viewport:{width,height},recordVideo:{dir:output+'/video'}});p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4173');await p.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(p,{name:/Practice Choose/});await p.getByRole('searchbox').fill('Flashlight fish');await p.getByRole('option').first().click();await clickButton(p,{name:'Enter the reef'});
 const initial=await p.evaluate(()=>window.atoll.simulation.section.entities.length),box=await p.locator('#reef').boundingBox();await p.mouse.move(box.x+box.width*.7,box.y+box.height*.6);await p.waitForTimeout(2500);await p.keyboard.press('Escape');await p.screenshot({path:output+'/community-'+width+'.png'});
 results.push(await p.evaluate(initial=>({initial,count:window.atoll.simulation.section.entities.length,residents:window.atoll.simulation.section.entities.filter(e=>['s45','s46','s60','s61'].includes(e.species.id)).map(e=>({id:e.species.id,x:e.x,y:e.y,activity:e.activity}))}),initial));await p.close();
}
await browser.close();fs.writeFileSync(output+'/report.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({scenes:results.length,errors}));if(errors.length)process.exitCode=1;
