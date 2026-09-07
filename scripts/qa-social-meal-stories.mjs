import fs from 'node:fs';
import {chromium} from '@playwright/test';
import {Simulation} from '../src/simulation.js';
import {creatureWidth} from '../src/geometry.js';
import {clickButton} from './ui-actions.mjs';
const output=process.argv[2]||'artifacts/social-meal-stories';fs.mkdirSync(output,{recursive:true});
const stories=[];
for(const species of ['s42','s8','s48','s53']){
 let story=null;
 search:for(const seed of [42,123,2]){
  const base=new Simulation(seed);base.start('practice',species);
  const reefs=base.sections.map((r,i)=>({i,n:r.entities.filter(e=>e.species.id===species).length})).filter(r=>r.n>=2).sort((a,b)=>b.n-a.n);
  for(const {i:reef} of reefs){
   const s=new Simulation(seed);s.start('practice',species);s.current=reef;const count=s.section.entities.length,tracks=new Map();
   const snapshot=(e,stage)=>({stage,time:s.time,actor:e.id,x:e.x,y:e.y,activity:e.activity,behavior:e.behavior,partner:e.ecology?.partner,meal:e.feeding?.target||e.target,checkpoint:s.serialize()});
   for(let frame=0;frame<90*60;frame++){
    s.step(1/60);
    for(const e of s.section.entities.filter(e=>e.alive&&e.species.id===species)){
     let track=tracks.get(e.id);
     if(e.feeding&&!e.feeding.committed&&!track){track=[snapshot(e,'approach')];tracks.set(e.id,track);}
     if(track?.length===1&&e.feeding?.committed)track.push(snapshot(e,'meal'));
     if(track?.length===2&&!e.feeding&&!e.target&&e.satiated>0){
      const partner=s.section.entities.find(b=>b.alive&&b.id===e.ecology?.partner);
      const rejoined=e.activity==='schooling'||partner&&!partner.target&&Math.hypot(e.x-partner.x,e.y-partner.y)<creatureWidth(e.species)*2;
      if(rejoined){track.push(snapshot(e,'rejoined'));story={species,seed,reef,count,finalCount:s.section.entities.length,frames:track};break search;}
     }
     if(track?.length===1&&!e.feeding)tracks.delete(e.id);
    }
   }
  }
 }
 if(!story)throw Error('No natural feeding/rejoining story for '+species);stories.push(story);
}
fs.writeFileSync(`${output}/stories.json`,JSON.stringify(stories,null,2));
const browser=await chromium.launch(),errors=[],captures=[];
try{for(const [width,height] of [[1600,900],[1024,768]]){
 const page=await browser.newPage({viewport:{width,height}});page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:/Practice Choose/});await clickButton(page,{name:'Enter the reef'});await page.keyboard.press('Escape');await page.waitForTimeout(4500);
 for(const story of stories)for(const frame of story.frames){
  await page.evaluate(async frame=>{const {Simulation}=await import('/src/simulation.js'),{creatureFrame}=await import('/src/geometry.js');const s=Simulation.restore(frame.checkpoint),r=window.atoll.renderer;Object.assign(window.atoll.simulation,s);window.atoll.simulation.paused=true;r.poses.clear();for(let i=0;i<2;i++)document.dispatchEvent(new KeyboardEvent('keydown',{key:'p',bubbles:true}));r.draw(window.atoll.simulation,0);const e=s.section.entities.find(e=>e.id===frame.actor);window.storyFrame=creatureFrame(e);},frame);
  const box=await page.locator('#reef').boundingBox(),point=await page.evaluate(()=>window.storyFrame);await page.mouse.move(box.x+point.x/1600*box.width,box.y+(point.y+55)/900*box.height);
  const stem=`${story.species}-${width}-${frame.stage}`;await page.screenshot({path:`${output}/${stem}.png`});captures.push({stem,width,stage:frame.stage,actor:frame.actor,time:frame.time});
 }await page.close();
}
 const report={scope:'Four selected natural meal/rejoin sequences from generated communities, with no injected animals, food, hunger, protection or positions. Existing habitat selected by harness; 60 Hz simulation until events. Screenshots restore exact event checkpoints and show paused states, not continuous video.',stories:stories.map(s=>({...s,frames:s.frames.map(({checkpoint,...f})=>f)})),captures,errors};fs.writeFileSync(`${output}/report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(errors.length)process.exitCode=1;
}finally{await browser.close();}
