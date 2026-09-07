// Batched anatomical contact review. Gallery states come from real simulation
// actions; labels describe the rendered phase rather than declaring acceptance.
import {chromium} from '@playwright/test';import fs from 'node:fs';
import {clickButton} from './ui-actions.mjs';
const output=process.argv[2]||'artifacts/feeding-contact';fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1600,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.atoll?.renderer.ready);
const gallery=await page.evaluate(async()=>{
 const {Simulation,edible}=await import('/src/simulation.js'),{SPECIES}=await import('/src/data.js'),{feedingApproach}=await import('/src/feeding-contact.js'),{creatureWidth,creatureFrame}=await import('/src/geometry.js');
 const r=window.atoll.renderer,results=[];
 for(const species of SPECIES.filter(s=>s.ability!=='clean')){
  const s=new Simulation(42);s.start('practice',species.playable?species.id:species.id==='s44'?'s1':'s53');s.protected=true;let e,f;
  if(species.playable){
   e=s.player;f=[...s.section.food,...s.section.entities].find(f=>f.alive!==false&&!f.species?.poison&&edible(e,f));s.section.food=f.kind==='food'?[f]:[];s.section.entities=f.kind==='food'?[]:[f];f.x=800;f.y=360;if(f.species){f.stun=30;f.satiated=100;}
   const a=feedingApproach(e,f);e.x=a.x-a.facing*15;e.y=a.y-5;e.facing=a.facing;e.angle=a.facing===1?0:Math.PI;s.eatAt(f.x,f.y);s.protected=true;
  }else{s.current=species.id==='s44'?6:4;e=s.section.entities.find(e=>e.species.id===species.id);s.section.entities=[e];}
  const states=[];
  for(let frame=0;frame<30*200&&states.length<3;frame++){
   if(species.playable)s.step(1/30);else s.stepNpc(e,1/30);
   const a=e.feeding||e.residentMeal;if(!a)continue;
   const t=a.contactAt||.22,stage=!a.committed&&a.elapsed>=t*.5?0:a.committed&&a.elapsed<t+.12?1:a.committed&&a.elapsed>=t+.20?2:-1;
   if(stage===states.length){
    f??=s.section.food.find(f=>f.id===a.target);states.push({e:structuredClone(e),f:structuredClone(f)});
   }
  }
  results.push({id:species.id,name:species.name,states,complete:states.length===3});
 }
 const images=[];
 for(let batch=0;batch<Math.ceil(results.length/8);batch++){
  const c=document.createElement('canvas');c.width=1600;c.height=900;const ctx=c.getContext('2d');ctx.fillStyle='#123e47';ctx.fillRect(0,0,c.width,c.height);
  ctx.fillStyle='#f0efda';ctx.font='22px sans-serif';ctx.fillText('Feeding contact · actual simulation phases · '+(batch+1),24,32);
  for(let cell=0;cell<8;cell++){
   const entry=results[batch*8+cell];if(!entry)continue;const x=cell%4*400,y=60+Math.floor(cell/4)*415;
   ctx.fillStyle='#f0efda';ctx.font='17px sans-serif';ctx.fillText(entry.id+' '+entry.name,x+12,y+20);
   for(let j=0;j<entry.states.length;j++){
    const {e,f}=entry.states[j],body=creatureFrame(e),food=f.species?creatureFrame(f):{...f,width:60,height:68};
    const left=Math.min(body.x-body.width/2,food.x-food.width/2),right=Math.max(body.x+body.width/2,food.x+food.width/2),top=Math.min(body.y-body.height/2,food.y-food.height/2),bottom=Math.max(body.y+body.height/2,food.y+food.height/2),scale=Math.min(2.7,340/(right-left),90/(bottom-top));
    ctx.fillStyle='#bad8d6';ctx.font='12px sans-serif';ctx.fillText(['Prepare','Contact','Recover'][j],x+12,y+45+j*117);
    ctx.save();ctx.beginPath();ctx.rect(x+5,y+48+j*117,390,100);ctx.clip();ctx.translate(x+200,y+97+j*117);ctx.scale(scale,scale);ctx.translate(-(left+right)/2,-(top+bottom)/2);
    r.articulation?.beginFrame(Infinity);
    // Draw full poses, not only drawSprite. Unique IDs isolate each snapshot.
    if(f.kind==='food')r.drawFood(ctx,f,1);else if(f.alive)r.drawCreature(ctx,{...f,id:'meal-'+entry.id+'-'+j},1,0);
    r.drawCreature(ctx,{...e,id:'eater-'+entry.id+'-'+j},1,0);
    ctx.restore();
   }
  }
  images.push(c.toDataURL('image/png').split(',')[1]);
 }
 return {images,results:results.map(({states,...item})=>item)};
});
for(let i=0;i<gallery.images.length;i++)fs.writeFileSync(`${output}/roster-${i}.png`,Buffer.from(gallery.images[i],'base64'));delete gallery.images;
await page.close();
for(const viewport of [{width:1600,height:900},{width:1024,height:768}]){
 const p=await browser.newPage({viewport});p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4173');await p.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(p,{name:/Practice Choose/});await p.getByRole('searchbox').fill('Yellow goatfish');await p.getByRole('option').first().click();await clickButton(p,{name:'Enter the reef'});
 const food=await p.evaluate(()=>{const s=window.atoll.simulation,f=s.section.food.find(f=>f.food==='worm');s.protected=true;
  const step=s.step;s.step=function(dt){step.call(this,dt);if(this.player.feeding?.committed)this.paused=true;};return {id:f.id,x:f.x,y:f.y};});
 const box=await p.locator('#reef').boundingBox();await p.mouse.click(box.x+food.x/1600*box.width,box.y+(food.y+55)/900*box.height);
 await p.waitForFunction(()=>window.atoll.simulation.paused,{timeout:20000});await p.screenshot({path:`${output}/goatfish-meal-${viewport.width}.png`});await p.close();
}
await browser.close();fs.writeFileSync(`${output}/report.json`,JSON.stringify({...gallery,errors},null,2));
console.log(JSON.stringify({species:gallery.results.length,incomplete:gallery.results.filter(r=>!r.complete),errors}));if(errors.length||gallery.results.some(r=>!r.complete))process.exitCode=1;
