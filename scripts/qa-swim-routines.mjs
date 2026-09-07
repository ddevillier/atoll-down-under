import {chromium} from '@playwright/test';import fs from 'node:fs';
const output='artifacts/swim-routines';fs.mkdirSync(output,{recursive:true});const b=await chromium.launch();try{const page=await b.newPage();await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.atoll?.renderer.ready);
const report=await page.evaluate(async()=>{
 const {Simulation}=await import('/src/simulation.js'),{SPECIES}=await import('/src/data.js'),{swimmingDrive}=await import('/src/swim-motion.js'),r=window.atoll.renderer,c=document.createElement('canvas');c.width=2000;c.height=1500;const ctx=c.getContext('2d');ctx.fillStyle='#123e47';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#f4edda';ctx.font='26px sans-serif';ctx.fillText('Four shark routines · actual NPC drive, quiet interval and resumption',25,38);const records=[];
 for(const [row,id] of [32,33,34,35].entries()){
  const s=new Simulation(42);s.start('practice','s1');s.protected=true;s.player.x=20;s.player.y=30;s.section.food=[];const e={...structuredClone(s.section.entities.find(e=>e.species.food==='fish')),id:'routine-'+id,species:SPECIES[id],x:1000,y:350,angle:0,facing:1,satiated:0,rest:0,stun:0,target:null,actionTime:0,ecology:null};s.section.entities=[e];r.poses?.clear();
  const sample=document.createElement('canvas');sample.width=500;sample.height=300;const sc=sample.getContext('2d');let col=0,quietTime=0;
  for(let i=0;i<3600&&col<4;i++){
   s.step(1/60);sc.clearRect(0,0,500,300);sc.save();sc.translate(250-e.x,145-e.y);r.articulation?.beginFrame(Infinity);r.drawCreature(sc,e,s.time,1/60,1,320);sc.restore();const pose=r.poses.get(e.id),quiet=id===33?e.activity==='at-home'&&pose.activity<.02:swimmingDrive(e)<.05&&pose.propulsion<pose.activity*.3;
   let label=null;if(col===0&&pose.activity>.05&&pose.propulsion>pose.activity*.85)label='Active travel';else if(col===1&&i>30&&quiet){label=id===33?'Settled at refuge':'Glide · tail eased';quietTime=s.time;}else if(col===2&&s.time>quietTime+.13&&quiet)label=id===33?'Rest continues':'Glide continues';else if(col===3&&s.time>quietTime+.3&&pose.activity>.05&&pose.propulsion>pose.activity*.85&&!quiet)label='Travel resumes';
   if(label){ctx.drawImage(sample,col*500,65+row*355);ctx.fillStyle='#f4edda';ctx.font='18px sans-serif';ctx.fillText(SPECIES[id].name+' · '+label,col*500+20,377+row*355);records.push({id:'s'+id,label,time:s.time,activity:e.activity,movement:pose.activity,propulsion:pose.propulsion,drive:swimmingDrive(e),home:e.ecology?.home});col++;}
  }
  if(col!==4)throw Error('s'+id+' incomplete routine: '+col);
 }
 return {image:c.toDataURL().split(',')[1],records};
});fs.writeFileSync(output+'/shark-routines.png',Buffer.from(report.image,'base64'));delete report.image;fs.writeFileSync(output+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({frames:report.records.length}));}finally{await b.close();}
