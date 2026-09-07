import {chromium} from '@playwright/test';import fs from 'node:fs';import {clickButton} from './ui-actions.mjs';
import {SPECIES} from '../src/data.js';
const output=process.argv[2]||'artifacts/fin-motion';fs.mkdirSync(output,{recursive:true});
const ids=process.argv.find(a=>a.startsWith('--species='))?.slice(10).split(',')||['s4','s11','s13','s20','s40','s55','s56','s58'];
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1600,height:900}}),errors=[],results=[];
try{page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.atoll?.renderer.ready);
for(const id of process.argv.includes('--gameplay-only')?[]:ids){
 const result=await page.evaluate(async id=>{
  const {Simulation,edible}=await import('/src/simulation.js'),{SPECIES,FOODS}=await import('/src/data.js'),{turningPose}=await import('/src/turn-motion.js'),r=window.atoll.renderer;
  const sheet=document.createElement('canvas');sheet.width=2000;sheet.height=1600;const ctx=sheet.getContext('2d');ctx.fillStyle='#123e47';ctx.fillRect(0,0,sheet.width,sheet.height);ctx.fillStyle='#f4edda';ctx.font='28px sans-serif';ctx.fillText(SPECIES.find(s=>s.id===id).name+' · full renderer / actual simulation · inspection scale',25,40);
  const sample=document.createElement('canvas');sample.width=500;sample.height=340;const c=sample.getContext('2d'),evidence=[];const bounds=r.bounds[SPECIES.find(s=>s.id===id).index],inspectionWidth=Math.min(320,270*bounds.w/bounds.h);
  for(const [row,kind] of ['cruise','settle','turn','feeding'].entries()){
   const s=new Simulation(42);s.start('practice',id);const prey=s.section.entities.find(e=>!e.species.poison&&e.species.ability!=='clean'&&edible(s.player,e));s.section.entities=[];s.section.food=[];s.protected=true;Object.assign(s.player,{x:650,y:350,angle:0,facing:1,energy:60});s.point(1300,350);r.poses?.clear();
   function draw(dt){c.clearRect(0,0,500,340);c.save();const pose=r.poses?.get(s.player.id),pivot=pose?turningPose(pose,s.player,0).pivot*inspectionWidth:0;c.translate(250-s.player.x-pivot,170-s.player.y);r.articulation?.beginFrame(Infinity);r.drawCreature(c,s.player,s.time,dt,1,inspectionWidth);c.restore();}
   function step(){s.step(1/60);draw(1/60);}
   for(let i=0;i<84;i++)step();let col=0;
   function capture(label){ctx.drawImage(sample,col*500,75+row*380);ctx.fillStyle='#f4edda';ctx.font='19px sans-serif';ctx.fillText(kind+' · '+label,col*500+20,420+row*380);evidence.push({kind,label,facing:s.player.facing,angle:s.player.angle,feeding:s.player.feeding?{...s.player.feeding}:null});col++;}
   if(kind==='feeding'){
    const food=s.player.species.diet.find(f=>FOODS[f]);const meal=food?{id:'fin-meal',kind:'food',food,name:FOODS[food].name,x:s.player.x+65,y:s.player.y,size:22,amount:100,regrow:0,phase:0}:prey;if(!meal)throw Error(id+' has no available meal');if(food)s.section.food=[meal];else{Object.assign(meal,{x:s.player.x+65,y:s.player.y,stun:30,satiated:100});s.section.entities=[meal];}s.eatAt(meal.x,meal.y);
    for(let i=0;i<12*60&&col<4;i++){
     step();const f=s.player.feeding;
     if(col===0&&f&&!f.committed)capture('prepare');
     else if(col===1&&f?.committed)capture('contact / meal taken');
     else if(col===2&&f?.committed&&f.elapsed>f.contactAt+.12)capture('recover 0.12s');
     else if(col===3&&!f&&s.player.energy>60)capture('recovered');
    }
    if(col!==4)throw Error(id+' feeding samples incomplete: '+col);
   }else{
    if(kind==='settle')s.point(s.player.x,s.player.y);if(kind==='turn')s.point(200,s.player.y);
    const times=kind==='cruise'?[.15,.4,.65,.9]:kind==='settle'?[0,.25,.6,1.2]:[.30,.55,.90,1.40];let elapsed=0;
    for(const t of times){while(elapsed<t){step();elapsed+=1/60;}capture(t.toFixed(2)+'s');}
   }
  }
  return {inspectionWidth,image:sheet.toDataURL('image/png').split(',')[1],id,evidence};
 },id);
 fs.writeFileSync(output+'/'+id+'-strip.png',Buffer.from(result.image,'base64'));delete result.image;results.push(result);
}
await page.close();
for(const name of process.argv.includes('--strips-only')?[]:ids.map(id=>SPECIES.find(s=>s.id===id).name))for(const [width,height] of [[1600,900],[1024,768]]){
 const p=await browser.newPage({viewport:{width,height},recordVideo:{dir:output+'/video'}});p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4173');await p.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(p,{name:/Practice Choose/});await p.getByRole('searchbox').fill(name);await p.getByRole('option').first().click();await clickButton(p,{name:'Enter the reef'});
 const b=await p.locator('#reef').boundingBox();await p.mouse.move(b.x+b.width*.72,b.y+b.height*.43);await p.waitForTimeout(1700);await p.mouse.move(b.x+b.width*.35,b.y+b.height*.48);await p.waitForTimeout(1300);
 const meal=await p.evaluate(async()=>{const {edible}=await import('/src/simulation.js'),{creatureFrame}=await import('/src/geometry.js'),s=window.atoll.simulation;s.player.energy=60;const f=[...s.section.food,...s.section.entities].filter(f=>f.alive!==false&&!f.species?.poison&&f.species?.ability!=='clean'&&!(f.regrow>0)&&edible(s.player,f)).sort((a,b)=>Math.hypot(a.x-s.player.x,a.y-s.player.y)-Math.hypot(b.x-s.player.x,b.y-s.player.y))[0];if(!f)throw Error('No edible target in generated community');const point=f.species?creatureFrame(f):f;return {id:f.id,name:f.name||f.species?.name,x:point.x,y:point.y,amount:f.amount,count:s.section.entities.length};});
 console.log(JSON.stringify({species:name,width,meal}));await p.mouse.click(b.x+meal.x/1600*b.width,b.y+(meal.y+55)/900*b.height);try{await p.waitForFunction(()=>window.atoll.simulation.player.energy>65,null,{timeout:20000});}catch(error){console.log(JSON.stringify(await p.evaluate(()=>({player:window.atoll.simulation.player,events:window.atoll.simulation.events.slice(-8)}))));throw error;}
 await p.mouse.move(b.x+700/1600*b.width,b.y+460/900*b.height);await p.waitForFunction(()=>Math.hypot(window.atoll.simulation.player.x-700,window.atoll.simulation.player.y-405)<20,null,{timeout:12000});await p.waitForTimeout(1500);await p.keyboard.press('Escape');
 const id=await p.evaluate(()=>window.atoll.simulation.player.species.id);await p.screenshot({path:output+'/'+id+'-gameplay-'+width+'.png'});
 results.push(await p.evaluate(({id,width,meal})=>{const s=window.atoll.simulation;return {id,width,meal,energy:s.player.energy,count:s.section.entities.length};},{id,width,meal}));
 const video=p.video();await p.close();await video.saveAs(output+'/'+id+'-'+width+'.webm');
}
fs.writeFileSync(output+'/report.json',JSON.stringify({scope:'Actual-simulation inspection strips; ordinary generated Practice communities with mouse movement and a chosen meal, energy set to 60 for feeding feedback. Videos are captured separately.',results,errors},null,2));console.log(JSON.stringify({scenes:results.length,errors}));if(errors.length)process.exitCode=1;

}finally{await browser.close();}
