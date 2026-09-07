import {test,expect} from '@playwright/test';
import {clickButton} from '../../scripts/ui-actions.mjs';

test('streamlined swimmer full poses freeze when paused or reduced and use bounded repeating deformation frames',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 const result=await page.evaluate(async()=>{
  const {SPECIES}=await import('/src/data.js'),{ArticulatedSprites}=await import('/src/articulated-motion.js'),r=window.atoll.renderer;
  const c=document.createElement('canvas');c.width=600;c.height=350;const ctx=c.getContext('2d'),results=[];
  for(const id of [0,17,18,28,32,33,34,35,42,49]){
   const e={id:'swim-test-'+id,species:SPECIES[id],x:300,y:175,angle:0,facing:1,activity:'cruising'},paint=(time,dt)=>{ctx.clearRect(0,0,600,350);r.articulation?.beginFrame(Infinity);r.drawCreature(ctx,e,time,dt,1,320);return c.toDataURL();};
   r.reducedMotion=false;paint(1,1/60);const paused=paint(2,0)===paint(8,0);
   r.reducedMotion=true;const reduced=paint(3,1/60)===paint(9,1/60);
   // These species pass through the real cyclic cache, including posterior body and caudal-fin
   // deformation. The repeated phase must not allocate a second sequence.
   const cache=new ArticulatedSprites(),im=r.sprites[id],draw=t=>{cache.beginFrame(Infinity);cache.draw(ctx,im,e.species,320,320*im.height/im.width,t,.5,{});};
   const frequency=(await import('/src/animal-profiles.js')).ANIMAL_PROFILES[e.species.id].frequency;
   for(let i=0;i<24;i++)draw((i+.1)/24/frequency);const first=cache.misses;
   for(let i=0;i<24;i++)draw((i+.1)/24/frequency+1/frequency);
   results.push({id,paused,reduced,first,second:cache.misses,pixels:cache.pixels,max:cache.maxPixels});
  }
  r.reducedMotion=false;return results;
 });
 for(const r of result){expect(r.paused).toBe(true);expect(r.reduced).toBe(true);expect(r.first).toBe(24);expect(r.second).toBe(r.first);expect(r.pixels).toBeLessThanOrEqual(r.max);}
});

test('a real NPC glides with reduced tail effort, resumes and freezes mid-glide',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 const result=await page.evaluate(async()=>{
  const {Simulation}=await import('/src/simulation.js'),{SPECIES}=await import('/src/data.js'),{swimmingDrive}=await import('/src/swim-motion.js'),r=window.atoll.renderer,s=new Simulation(42);s.start('practice','s1');s.protected=true;s.player.x=40;s.player.y=40;s.section.food=[];
  const e={...structuredClone(s.section.entities.find(e=>e.species.food==='fish')),id:'coast-browser',species:SPECIES[32],x:900,y:300,angle:0,facing:1,satiated:100,rest:0,stun:0,target:null,actionTime:0,ecology:null};s.section.entities=[e];
  const c=document.createElement('canvas');c.width=600;c.height=350;const ctx=c.getContext('2d'),paint=dt=>{ctx.clearRect(0,0,600,350);ctx.save();ctx.translate(300-e.x,175-e.y);r.articulation?.beginFrame(Infinity);r.drawCreature(ctx,e,s.time,dt,1,300);ctx.restore();},samples=[];let glide=null,resumed=false;
  for(let i=0;i<1500;i++){s.step(1/60);paint(1/60);const pose=r.poses.get(e.id),drive=swimmingDrive(e);if(pose.activity>.25&&drive<.05&&pose.propulsion<pose.activity*.3&&!glide){glide={x:e.x,y:e.y,activity:pose.activity,propulsion:pose.propulsion};paint(0);const a=c.toDataURL();paint(0);glide.paused=a===c.toDataURL();samples.push(glide);}if(glide&&drive>.95&&pose.propulsion>pose.activity*.85){resumed=true;break;}}
  return {glide,resumed,healthy:s.player.health===100};
 });expect(result.glide).not.toBeNull();expect(result.glide.paused).toBe(true);expect(result.resumed).toBe(true);expect(result.healthy).toBe(true);
});

test('mouse feeding catches a slower fleeing goby and commits one meal',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill('Rainbow runner');await page.getByRole('option').first().click();await clickButton(page,{name:'Enter the reef',exact:true});
 await page.evaluate(async()=>{const {SPECIES}=await import('/src/data.js'),s=window.atoll.simulation;Object.assign(s.player,{x:600,y:400,angle:0,facing:1,energy:60});s.point(600,400);s.section.food=[];s.section.entities=[{...structuredClone(s.player),id:'browser-fleeing-goby',species:SPECIES[2],x:800,y:400,angle:0,facing:1,health:100,energy:100,satiated:60,target:null,think:0}];window.chaseMeals=0;const consume=s.consume;s.consume=function(e){window.chaseMeals++;return consume.call(this,e);};});
 const box=await page.locator('#reef').boundingBox();await page.mouse.click(box.x+800/1600*box.width,box.y+455/900*box.height);await page.waitForFunction(()=>window.chaseMeals===1,null,{timeout:6000});expect(await page.evaluate(()=>window.atoll.simulation.player.energy)).toBeGreaterThan(60);expect(await page.evaluate(()=>window.atoll.simulation.player.target)).toBeNull();
});
