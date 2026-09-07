import {chromium} from '@playwright/test';import fs from 'node:fs';import {clickButton} from './ui-actions.mjs';
const output=process.argv[2]||'artifacts/specialist-motion';fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch(),page=await browser.newPage(),errors=[];try{page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.atoll?.renderer.ready);
const result=await page.evaluate(async()=>{
 const {Simulation}=await import('/src/simulation.js'),{sitesFor,useContext}=await import('/src/adventures.js'),{creatureFrame}=await import('/src/geometry.js'),r=window.atoll.renderer,images=[],evidence=[];
 function sheet(title){const c=document.createElement('canvas');c.width=2000;c.height=850;const ctx=c.getContext('2d');ctx.fillStyle='#123e47';ctx.fillRect(0,0,2000,850);ctx.fillStyle='#f4edda';ctx.font='26px sans-serif';ctx.fillText(title,25,38);return {c,ctx};}
 {
  const {c,ctx}=sheet('Yellow seahorse · actual attached routine and meal · enlarged inspection'),s=new Simulation(42);s.start('practice','s1');s.current=6;const e=s.section.entities.find(e=>e.holdfast);s.section.entities=[e];s.player.x=40;s.player.y=40;let time=0,col=0;const originalFood=s.section.food;s.section.food=[];
  const sample=document.createElement('canvas');sample.width=500;sample.height=340;const sc=sample.getContext('2d'),width=250*r.bounds[44].w/r.bounds[44].h;
  const step=()=>{s.stepNpc(e,1/60);time+=1/60;sc.clearRect(0,0,500,340);const frame=creatureFrame(e),scale=width/frame.width;sc.save();sc.translate(250,155);sc.scale(scale,scale);sc.translate(-frame.x,-frame.y);r.articulation?.beginFrame(Infinity);r.drawCreature(sc,e,time,1/60);sc.restore();};
  const capture=(row,label)=>{ctx.drawImage(sample,col*500,60+row*380);ctx.fillStyle='#f4edda';ctx.font='19px sans-serif';ctx.fillText(label,col*500+20,408+row*380);evidence.push({id:'s44',label,holdfast:{...e.holdfast},x:e.x,y:e.y,meal:e.residentMeal?{...e.residentMeal}:null});col++;};
  for(const t of [.2,.7,1.3,2]){while(time<t)step();capture(0,'Attached rest · '+t+'s');}
  s.section.food=originalFood;col=0;
  for(let i=0;i<600&&col<4;i++){step();const a=e.residentMeal;if(col===0&&a&&!a.committed)capture(1,'Prepare');else if(col===1&&a?.committed)capture(1,'Contact');else if(col===2&&a?.elapsed>.45)capture(1,'Recover');else if(col===3&&!a&&e.satiated>0)capture(1,'Attached again');}
  if(col!==4)throw Error('seahorse meal incomplete');images.push({name:'seahorse-strip',png:c.toDataURL().split(',')[1]});
 }
 {
  const {c,ctx}=sheet('Cuttlefish · actual sand / reef blending and movement release · enlarged inspection');
  for(const [row,kind] of ['sand','reef'].entries()){
   const s=new Simulation(42);s.start('practice','s19');s.section.entities=[];s.section.food=[];const spot=sitesFor(s).find(x=>x.kind===kind);Object.assign(s.player,{x:spot.x,y:spot.y,angle:0,facing:1});s.point(spot.x,spot.y);useContext(s);r.poses?.clear();let time=0,col=0;
   const sample=document.createElement('canvas');sample.width=400;sample.height=330;const sc=sample.getContext('2d');
   const step=()=>{s.step(1/60);time+=1/60;sc.clearRect(0,0,400,330);sc.save();sc.translate(200-s.player.x,155-s.player.y);r.articulation?.beginFrame(Infinity);r.drawCreature(sc,s.player,s.time,1/60,1,320);sc.restore();};
   const capture=label=>{ctx.drawImage(sample,col*400,70+row*380);ctx.fillStyle='#f4edda';ctx.font='19px sans-serif';ctx.fillText(kind+' · '+label,col*400+20,408+row*380);evidence.push({id:'s19',kind,label,blend:s.player.blendTime,hidden:s.player.hidden,blending:s.player.blending});col++;};
   for(const t of [.05,.5,1.2,2.2]){while(time<t)step();capture(t+'s');}s.point(s.player.x+100,s.player.y);for(let i=0;i<30;i++)step();capture('movement release');
  }
  images.push({name:'cuttlefish-blend',png:c.toDataURL().split(',')[1]});
 }
 return {images,evidence};
});
for(const im of result.images)fs.writeFileSync(output+'/'+im.name+'.png',Buffer.from(im.png,'base64'));delete result.images;await page.close();
result.communities=[];fs.writeFileSync(output+'/report.json',JSON.stringify({...result,complete:false,errors},null,2));
for(const [width,height] of [[1600,900],[1024,768]]){
 const p=await browser.newPage({viewport:{width,height},recordVideo:{dir:output+'/video'}});p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4173');await p.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(p,{name:/Practice Choose/});await p.getByRole('searchbox').fill('Foxface');await p.getByRole('option').first().click();await clickButton(p,{name:'Enter the reef'});
 const target=await p.evaluate(async()=>{const {creatureFrame}=await import('/src/geometry.js'),s=window.atoll.simulation;s.transition(-1,0);s.transition(0,1);const e=s.section.entities.find(e=>e.holdfast),frame=creatureFrame(e);return {id:e.id,x:frame.x,y:frame.y-frame.height*.3,count:s.section.entities.length,anchor:{...e.holdfast}};});
 const box=await p.locator('#reef').boundingBox();await p.mouse.move(box.x+box.width*.55,box.y+box.height*.5);await p.waitForTimeout(2200);if(!await p.evaluate(()=>window.atoll.simulation.paused))await p.keyboard.press('Escape');const pick=await p.evaluate(async id=>{const {creatureFrame}=await import('/src/geometry.js'),s=window.atoll.simulation,e=s.section.entities.find(e=>e.id===id),f=creatureFrame(e);for(const v of [-.3,-.2,-.4,0,.2])for(const u of [0,.2,-.2]){const q={x:f.x+u*f.width,y:f.y+v*f.height};if(s.findAt(q.x,q.y)?.id===id)return q;}throw Error('Seahorse is covered in this paused community; no selectable point.');},target.id);await p.mouse.click(box.x+pick.x/1600*box.width,box.y+(pick.y+55)/900*box.height);await p.waitForFunction(()=>document.querySelector('.inspect-card h3')?.textContent.includes('Yellow seahorse'));
 await p.screenshot({path:output+'/seahorse-gameplay-'+width+'.png'});result.communities.push(await p.evaluate(target=>({before:target.count,count:window.atoll.simulation.section.entities.length,anchor:window.atoll.simulation.section.entities.find(e=>e.id===target.id).holdfast,initialAnchor:target.anchor}),target));await p.close();
}
result.complete=true;result.errors=errors;fs.writeFileSync(output+'/report.json',JSON.stringify(result,null,2));console.log(JSON.stringify({phases:result.evidence.length,communities:result.communities.length,errors}));if(errors.length)process.exitCode=1;

}finally{await browser.close();}
