import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const destination=path.resolve(process.env.LIVING_ROSTER_OUTPUT_DIR||'artifacts/living-reef/roster/attempt4');
for(const cohort of ['powered','remaining']){
for(const viewport of [{width:1600,height:900},{width:1024,height:768}]){
 test(cohort+' roster at '+viewport.width+' keeps its painted joints and readable actions',async({browser})=>{
  test.setTimeout(150000);
  const folder=cohort==='powered'?destination:path.join(destination,'supplemental');
  await fs.mkdir(folder,{recursive:true});
  const context=await browser.newContext({viewport,recordVideo:{dir:folder,size:viewport}}),page=await context.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
  await page.evaluate(async(cohort)=>{
   const {Simulation}=await import('/src/simulation.js'),{ReefRenderer}=await import('/src/render.js'),{SPECIES}=await import('/src/data.js'),{PART_RIGS,SWIMMING_PART_IDS,partPose}=await import('/src/part-motion.js'),{creatureWidth}=await import('/src/geometry.js'),{mouthPoint,feedingSurface}=await import('/src/feeding-contact.js'),{feedingEnvelope}=await import('/src/feeding-motion.js'),{edible}=await import('/src/diet.js');
   const {ANIMAL_PROFILES}=await import('/src/animal-profiles.js');
   const source=window.atoll.renderer;
   // Deliberately isolated pose gallery: players originate from real generated
   // dives, with crowds removed so every body is visible. Ordinary point/eatAt
   // controls still run the full simulation. This is not a populated-reef test.
   document.body.innerHTML='';document.body.style.cssText='margin:0;overflow:hidden;background:#123e47';
   const canvas=document.createElement('canvas');canvas.style.cssText='display:block;width:100vw;height:100vh';document.body.append(canvas);
   const renderer=new ReefRenderer(canvas);Object.assign(renderer,{ready:true,sprites:source.sprites,bounds:source.bounds,reefs:source.reefs,foodSprites:source.foodSprites,creationArt:source.creationArt});
   source.ready=false;
   const ctx=canvas.getContext('2d'),results=[],shots=[],groups=[];
   function pixelProof(actor){
    const {id,p}=actor,rig=PART_RIGS[id]||{frequency:ANIMAL_PROFILES[id].frequency,parts:[]},scale=canvas.width/1600,width=creatureWidth(p.species)*scale,image=source.sprites[p.species.index],height=width*image.height/image.width;
    const proof=document.createElement('canvas');proof.width=Math.ceil(Math.max(400*scale,width*1.8));proof.height=Math.ceil(Math.max(260*scale,height*1.8));const c=proof.getContext('2d'),cx=proof.width/2,cy=proof.height/2;
    const paint=(time,feed=0)=>{c.clearRect(0,0,proof.width,proof.height);renderer.drawSprite(c,p.species,cx,cy,width,1,time,1,.8,null,{feed});return c.getImageData(0,0,proof.width,proof.height).data;};
    const a=paint(.05/rig.frequency),first=proof.toDataURL(),b=paint(.30/rig.frequency),second=proof.toDataURL();
    let tailChanged=0,headChanged=0,clipped=0;
    for(let y=0;y<proof.height;y++)for(let x=0;x<proof.width;x++){
     const n=(y*proof.width+x)*4,changed=Math.max(...[0,1,2,3].map(k=>Math.abs(a[n+k]-b[n+k])))>5;
     if(changed&&x<cx-width*.15)tailChanged++;
     // The skull above the mouth stays fixed. A goatfish's barbels are real
     // movable appendages below it, so they do not belong in the skull region.
     if(changed&&x>cx+width*.4&&y<cy+height*.08)headChanged++;
     if((x===0||y===0||x===proof.width-1||y===proof.height-1)&&Math.max(a[n+3],b[n+3])>5)clipped++;
    }
    const closed=paint(.3/rig.frequency),closedImage=proof.toDataURL(),open=paint(.3/rig.frequency,1),openImage=proof.toDataURL();let jawChanged=0;
    for(let y=0;y<proof.height;y++)for(let x=0;x<proof.width;x++){const n=(y*proof.width+x)*4;if(x>cx+width*.32&&Math.max(...[0,1,2,3].map(k=>Math.abs(closed[n+k]-open[n+k])))>5)jawChanged++;}
    actor.result.pixelProof={tailChanged,headChanged,jawChanged,clipped,width,height};
    shots.push({id,label:'stroke-a',data:first},{id,label:'stroke-b',data:second});
    if(rig.parts.some(part=>part.mode==='jaw'))shots.push({id,label:'jaw-closed',data:closedImage},{id,label:'jaw-open',data:openImage});
   }
   const ids=cohort==='powered'?SWIMMING_PART_IDS:['s4','s13','s20','s22','s23','s24','s40','s48','s54','s56'];
   for(let i=0;i<ids.length;i+=8)groups.push(ids.slice(i,i+8));
   function make(id,index){
    const sim=new Simulation(4200+index);sim.start('practice',id);const p=sim.player;
    const targets=[...sim.section.food,...sim.section.entities].filter(target=>edible(p,target)&&target.species?.ability!=='clean');
    const target=p.species.ability==='clean'?sim.section.entities.find(t=>t.species.parasites&&t.species.ability!=='clean'&&t.health<90):targets.find(t=>t.kind==='food')||targets.find(t=>t.species?.size<sim.player.species.size*.6);
    sim.section.entities=[];sim.section.food=[];sim.point(1250,p.y);
    return {id,sim,p,target,index,stage:0,result:{id,name:p.species.name,poweredRig:SWIMMING_PART_IDS.includes(id),paintedTail:!!PART_RIGS[id]?.parts.some(part=>part.name==='tail'),gameplayWidth:creatureWidth(p.species),mealTarget:target?.kind==='food'?target.food:target?.species?.id,tailScales:[],jawAngles:[],centers:[],mealContacts:0,preparationContact:0,treatmentActive:false,cancelled:false,snapshots:[]}};
   }
   let group=0,actors=groups[0].map(make),time=0,previous=null,started=null,elapsed=0,activeWallElapsed=0,done=false;
   actors.forEach(pixelProof);
   function addMeal(actor,distance=0){
    const {sim,p}=actor;if(!actor.target)return false;
    const target=structuredClone(actor.target);target.id='gallery-meal-'+actor.id+'-'+actor.stage;
    const mouth=mouthPoint(p),surface=feedingSurface(target,p.facing),targetX=mouth.x-(surface.x-target.x)+p.facing*distance,targetY=mouth.y-(surface.y-target.y);
    Object.assign(target,{x:targetX,y:targetY,regrow:0,amount:100,alive:true,health:100,stun:10,think:100,satiated:100,vx:0,vy:0});
    if(p.species.ability==='clean')Object.assign(target,{health:65,stun:0,rest:10});
    if(target.species){delete target.groundRoute;delete target.holdfast;sim.section.entities=[target];}else sim.section.food=[target];
    sim.eatAt(target.x,target.y);return true;
   }
   function capture(actor,label,replace=false){
    const index=actor.index,col=index%4,row=Math.floor(index/4),crop=document.createElement('canvas'),header=canvas.height*.1,height=canvas.height*.45;crop.width=canvas.width/4;crop.height=height;
    crop.getContext('2d').drawImage(canvas,col*canvas.width/4,header+row*height,canvas.width/4,height,0,0,crop.width,crop.height);
    const shot={id:actor.id,label,data:crop.toDataURL()},old=replace?shots.findIndex(s=>s.id===actor.id&&s.label===label):-1;
    if(old>=0)shots[old]=shot;else{shots.push(shot);actor.result.snapshots.push(label);}
   }
   function frame(now){
    // RAF's frame timestamp can precede performance.now() after heavy setup.
    // Use one clock throughout, and never pass a negative step to simulation.
    started??=now;const wallDt=previous===null?0:Math.max(0,(now-previous)/1000),dt=Math.min(.10,wallDt);previous=now;time+=dt;elapsed+=dt;activeWallElapsed+=wallDt;
    ctx.setTransform(canvas.width/1600,0,0,canvas.height/900,0,0);ctx.fillStyle='#123e47';ctx.fillRect(0,0,1600,900);
    ctx.fillStyle='#e5eed9';ctx.font='24px sans-serif';ctx.fillText('Living reef — isolated pose gallery at normal speed',32,35);ctx.font='16px sans-serif';ctx.fillText('Generated players · point / eatAt controls · gameplay sizes · group '+(group+1)+' of '+groups.length,32,65);
    for(const actor of actors){
     const {p,sim,result}=actor,index=actor.index,col=index%4,row=Math.floor(index/4),cx=col*400+200,cy=90+row*405+195;
     const stage=time<1.2?0:time<3.1?1:time<4.2?2:time<6.4?3:time<6.9?4:5;
     if(stage!==actor.stage){
      actor.stage=stage;
      if(stage===1)sim.point(150,p.y);
      if(stage===2)sim.point(p.x,p.y);
      if(stage===3)addMeal(actor);
      if(stage===4){addMeal(actor,150);sim.step(1/60);sim.point(p.x-100,p.y);result.cancelled=p.target===null&&p.feeding===null&&p.foragingPrep==null;}
      if(stage===5)sim.point(1250,p.y);
     }
     sim.step(dt);
     // Shell opening consumes through foragingPrep after 1.5 seconds of real
     // mouth contact, without creating the brief ordinary feeding state.
     // Count simulation consumption events for both paths, never a mock pose.
     result.mealContacts=sim.events.filter(event=>event.type==='eat').length;
     result.preparationContact=Math.max(result.preparationContact,p.foragingPrep?.elapsed||0);
     if(p.service?.elapsed>0)result.treatmentActive=true;
     ctx.save();ctx.translate(cx-p.x,cy-p.y);renderer.drawCreature(ctx,p,sim.time,dt);ctx.restore();
     const pose=renderer.poses.get(p.id),tail=PART_RIGS[actor.id]?.parts.find(part=>part.name==='tail');
     // Each player has the same public id in its own simulation. The gallery
     // keys renderer slots per actor without changing saved creature identity.
     if(tail)result.tailScales.push(partPose(actor.id,tail.name,pose.motionTime,pose.propulsion||pose.activity,{brake:pose.brake}).scale);
     const jaw=PART_RIGS[actor.id]?.parts.find(part=>part.mode==='jaw');if(jaw)result.jawAngles.push(partPose(actor.id,jaw.name,pose.motionTime,pose.propulsion||pose.activity,{feed:feedingEnvelope(p)}).angle);
     result.centers.push({time,yaw:pose.yaw,x:pose.frame.x-p.x,facing:pose.frame.facing});
     ctx.fillStyle='#e5eed9';ctx.font='17px sans-serif';ctx.fillText(p.species.name,col*400+20,90+row*405+25);
     ctx.font='14px sans-serif';ctx.fillStyle='#a5d2cb';ctx.fillText(['Swimming right','Turn and swim left','Stopping',p.species.ability==='clean'?'Inspection and care':'Meal contact','Cancelled approach','Recovery'][stage],col*400+20,90+row*405+380);
     if(stage===0&&time>.85&&!result.snapshots.includes('right'))capture(actor,'right');
     if(stage===0&&time>1.05&&!result.snapshots.includes('stroke'))capture(actor,'stroke');
     if(stage===1&&Math.abs(pose.yaw)<1&&Math.abs(pose.yaw)<(result.closestMidpointYaw??Infinity)){
      result.closestMidpointYaw=Math.abs(pose.yaw);capture(actor,'midturn',true);
     }
     if(stage===1&&p.facing<0&&Math.abs(pose.yaw)===1&&!result.snapshots.includes('left'))capture(actor,'left');
     if(stage===2&&time>4.0&&!result.snapshots.includes('stop'))capture(actor,'stop');
     if(stage===3&&(p.feeding||p.foragingPrep?.elapsed>.25||p.service?.elapsed>0)&&!result.snapshots.includes('contact'))capture(actor,'contact');
     if(stage===4&&!result.snapshots.includes('cancel'))capture(actor,'cancel');
     if(stage===5&&time>7.65&&!result.snapshots.includes('recovery'))capture(actor,'recovery');
    }
    if(time>8.1){
     for(const actor of actors){const pose=maps.get(actor.p).get(actor.p.id);actor.result.finalPose={activity:pose.activity,propulsion:pose.propulsion,brake:pose.brake};results.push(actor.result);}
     group++;if(group===groups.length){done=true;window.livingRoster={done,results,shots,simulationElapsed:elapsed,activeWallElapsed,wallElapsed:(now-started)/1000};return;}
     actors=groups[group].map(make);actors.forEach(pixelProof);time=0;previous=null;
    }
    requestAnimationFrame(frame);
   }
   // Separate renderer maps allow every isolated player's "player" id to keep
   // its own animation state across successive draws.
   const originalDraw=renderer.drawCreature.bind(renderer),maps=new WeakMap();
   renderer.drawCreature=(context,entity,...args)=>{let map=maps.get(entity);if(!map){map=new Map();maps.set(entity,map);}renderer.poses=map;return originalDraw(context,entity,...args);};
   requestAnimationFrame(frame);window.livingRoster={done:false};
  },cohort);
  await page.waitForFunction(()=>window.livingRoster.done,null,{timeout:120000});
  const packet=await page.evaluate(()=>window.livingRoster);
  for(const shot of packet.shots)await fs.writeFile(path.join(folder,viewport.width+'-'+shot.id+'-'+shot.label+'.png'),Buffer.from(shot.data.split(',')[1],'base64'));
  const results=packet.results.map(result=>({...result,tailRange:result.tailScales.length?Math.max(...result.tailScales)-Math.min(...result.tailScales):null,jawRange:result.jawAngles.length?Math.max(...result.jawAngles)-Math.min(...result.jawAngles):null,tailScales:undefined,jawAngles:undefined}));
  await fs.writeFile(path.join(folder,viewport.width+'-results.json'),JSON.stringify({scope:'isolated generated-player pose gallery; not populated gameplay',cohort,viewport,errors,simulationElapsed:packet.simulationElapsed,activeWallElapsed:packet.activeWallElapsed,wallElapsed:packet.wallElapsed,results},null,2));
  const video=page.video();await context.close();await video.saveAs(path.join(folder,viewport.width+'-normal-speed.webm'));
  expect(errors).toEqual([]);expect(results).toHaveLength(cohort==='powered'?42:10);
  expect(packet.simulationElapsed/packet.activeWallElapsed).toBeGreaterThan(.95);
  for(const result of results){if(result.paintedTail)expect(result.tailRange,result.id+' actual tail range').toBeGreaterThan(.02);expect(result.pixelProof.tailChanged,result.id+' rendered tail changes').toBeGreaterThan(0);if(result.poweredRig)expect(result.pixelProof.headChanged,result.id+' rigid head').toBe(0);expect(result.pixelProof.clipped,result.id+' uncut painting').toBe(0);expect(result.cancelled,result.id+' steer-away cancellation').toBe(true);expect(result.snapshots,result.id+' action captures').toEqual(expect.arrayContaining(['right','left','midturn','stop','contact','cancel','recovery']));if(result.id==='s43')expect(result.treatmentActive).toBe(true);else expect(result.mealContacts,result.id+' exactly one real meal').toBe(1);if(['s32','s33','s34','s35'].includes(result.id))expect(result.pixelProof.jawChanged,result.id+' actual jaw painting moves').toBeGreaterThan(0);}
 });
}
}
