import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {clickButton} from '../../scripts/ui-actions.mjs';

// Fixed generated-world seed; no visitor, relationship, completed goal, or
// service progress is fabricated. All clinic decisions use visible controls.
const out='artifacts/reef-stories';
const action=(page,id,value)=>page.locator('[data-action="story-action"][data-story-action="'+id+'"]'+(value===undefined?'':'[data-value="'+value+'"]'));
async function ready(page,id,width=1600,height=900){
 await page.addInitScript(()=>{Date.now=()=>42;});
 await page.setViewportSize({width,height});
 await page.goto('/');
 await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:/Practice Choose/});
 await page.getByRole('searchbox').fill(id==='s43'?'Bluestreak cleaner wrasse':'Banded coral shrimp');
 await page.locator('[role="option"][data-species="'+id+'"]').click();
 await page.locator('[data-action="begin-practice"]').click();
 await page.locator('[data-action="adventure-toggle"]').click();
 await page.locator('.story-invitation > summary').click();
 await expect(page.locator('[data-action="story-begin"]')).toBeVisible();
 const roster=await page.evaluate(()=>window.atoll.simulation.sections.map(r=>r.entities.map(e=>e.id)));
 await page.locator('[data-action="story-begin"]').click();
 await swimRoute(page,id==='s43'?4:8);
 await page.waitForFunction(()=>window.atoll.simulation.reefStories?.clinic);
 expect(await page.evaluate(()=>window.atoll.simulation.reefStories.active)).toBe('clinic');
 expect(await page.evaluate(()=>window.atoll.simulation.current)).toBe(id==='s43'?4:8);
 return roster;
}
async function swimRoute(page,destination){
 for(let leg=0;leg<4;leg++){
  const route=await page.evaluate(async destination=>{
   const s=window.atoll.simulation;
   const {routeBetween}=await import('/src/reef-map.js');
   const leg=routeBetween(s.current,destination)[0];
   return leg?{from:s.current,to:leg.to,x:leg.dx>0?1599:leg.dx<0?1:s.player.x,y:leg.dy>0?718:leg.dy<0?22:s.player.y}:null;
  },destination);
  if(!route)return;
  const box=await page.locator('#reef').boundingBox();
  await page.mouse.move(box.x+route.x/1600*box.width,box.y+(route.y+55)/900*box.height);
  await page.waitForFunction(to=>window.atoll.simulation.current===to,route.to,{timeout:60000});
 }
 expect(await page.evaluate(()=>window.atoll.simulation.current)).toBe(destination);
}
async function patient(page,entityId){
 return page.evaluate(async entityId=>{
  const s=window.atoll.simulation,c=s.section.entities.find(e=>String(e.id)===String(entityId));
  const {parasiteDamage}=await import('/src/player-cleaner.js');
  return {id:c.id,species:c.species.id,incarnation:c.incarnation||0,x:c.x,y:c.y,health:c.health,parasites:parasiteDamage(c),injury:c.biteDamage||0,poison:c.poisonDamage||0};
 },entityId);
}
async function choose(page,entityId){
 await action(page,'clinic-choose',entityId).click();
 await page.waitForFunction(id=>String(window.atoll.simulation.reefStories.clinic.appointment?.id)===String(id),entityId);
}
async function approach(page){
 const gentle=action(page,'clinic-gentle');
 if(await gentle.count())await gentle.click();
 await expect(action(page,'clinic-care')).toBeVisible({timeout:90000});
}
async function paintMotion(page){
 await page.evaluate(()=>{
  const r=window.atoll.renderer,s=window.atoll.simulation,f=r.poses.get(s.player.id).frame;
  const rect={x:Math.max(0,Math.floor((f.x-f.width/2-4)/1600*r.canvas.width)),y:Math.max(0,Math.floor((f.y-f.height/2+51)/900*r.canvas.height)),w:Math.ceil((f.width+8)/1600*r.canvas.width),h:Math.ceil((f.height+8)/900*r.canvas.height)};
  const digest=()=>{const data=r.ctx.getImageData(rect.x,rect.y,rect.w,rect.h).data;let hash=2166136261;for(const byte of data)hash=Math.imul(hash^byte,16777619)>>>0;return hash;};
  const check={original:r.drawSprite,samples:[],first:digest(),digest,rect};
  window.clinicPaintCheck=check;
  r.drawSprite=function(...args){if(args[10]?.instance===s.player.id)check.samples.push({clock:args[6],feed:args[10].feed});return check.original.apply(this,args);};
 });
 let result;
 try{
  await page.waitForTimeout(250);
  result=await page.evaluate(()=>{
   const c=window.clinicPaintCheck;
   return {samples:c.samples,firstPixels:c.first,lastPixels:c.digest(),rect:c.rect};
  });
 }finally{
  await page.evaluate(()=>{window.atoll.renderer.drawSprite=window.clinicPaintCheck.original;delete window.clinicPaintCheck;});
 }
 expect(result.samples.length).toBeGreaterThan(1);
 expect(Math.max(...result.samples.map(s=>s.clock))-Math.min(...result.samples.map(s=>s.clock))).toBeGreaterThan(0);
 expect(Math.max(...result.samples.map(s=>s.feed))-Math.min(...result.samples.map(s=>s.feed))).toBeGreaterThan(.02);
 expect(result.lastPixels).not.toBe(result.firstPixels);
 return result;
}
async function beginCare(page){
 await action(page,'clinic-care').click();
 await page.waitForFunction(()=>window.atoll.simulation.player.service?.elapsed>.2,null,{timeout:30000});
 const touching=await page.evaluate(async()=>{
  const s=window.atoll.simulation,a=s.reefStories.clinic.appointment,c=s.section.entities.find(e=>e.id===a.id);
  const {cleanerInspection}=await import('/src/cleaner-motion.js');
  return {gap:cleanerInspection(s.player,c).gap,removed:s.player.service?.removed,visits:s.reefStories.clinic.relationships.length};
 });
 expect(touching.gap).toBeLessThanOrEqual(8);
 expect(touching.removed).toBeGreaterThan(0);
 touching.motion=await paintMotion(page);
 return touching;
}
async function finishCare(page,count){
 await page.waitForFunction(count=>window.atoll.simulation.reefStories.clinic.relationships.filter(r=>r.visits>0).length===count,count,{timeout:30000});
 expect(await page.evaluate(()=>window.atoll.simulation.player.service)).toBeNull();
}
async function assertRoster(page,roster){
 expect(await page.evaluate(()=>window.atoll.simulation.sections.flatMap(r=>r.entities.map(e=>e.id)).sort())).toEqual(roster.flat().sort());
}
async function freeze(page){
 if(!await page.evaluate(()=>window.atoll.simulation.paused))await page.keyboard.press('Escape');
 expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(true);
}

for(const [id,width,height] of [['s43',1600,900],['s45',1024,768]])test(id+' clinic earns care through contact and recognizes a returning individual',async({page})=>{
 test.setTimeout(240000);
 await mkdir(out,{recursive:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const roster=await ready(page,id,width,height);
 expect(await page.evaluate(()=>window.atoll.journal.discoveries)).toEqual([]);
 const first=action(page,'clinic-choose').filter({hasText:'nervous'}).first();
 await expect(first).toBeVisible();
 const firstId=await first.getAttribute('data-value');
 const before=await patient(page,firstId);
 await choose(page,firstId);
 expect(await page.evaluate(()=>window.atoll.simulation.reefStories.clinic.appointment.gentle)).toBe(false);
 await expect(action(page,'clinic-care')).toHaveCount(0);
 await page.waitForTimeout(350);
 const waiting=await page.evaluate(()=>{
  const s=window.atoll.simulation,a=s.reefStories.clinic.appointment,c=s.section.entities.find(e=>e.id===a.id);
  return {phase:a.phase,removed:a.removed,service:s.player.service,behavior:c.behavior,relationships:s.reefStories.clinic.relationships};
 });
 expect(waiting.phase).toBe('approach');
 expect(waiting.removed).toBe(0);
 expect(waiting.service??null).toBeNull();
 expect(waiting.relationships).toEqual([]);
 expect(waiting.behavior).toBe('Waiting for your gentle approach');
 await approach(page);
 expect((await patient(page,firstId)).health).toBeLessThanOrEqual(before.health+.01);
 const firstContact=await beginCare(page);
 await freeze(page);
 const held=await page.evaluate(()=>window.atoll.simulation.serialize());
 await page.waitForTimeout(200);
 expect(await page.evaluate(()=>window.atoll.simulation.serialize())).toBe(held);
 await page.screenshot({path:out+'/clinic-'+id+'-'+width+'-care.png'});
 await page.keyboard.press('Escape');
 await finishCare(page,1);
 const cared=await patient(page,firstId);
 expect(cared.parasites).toBeLessThan(1);
 expect(cared.injury).toBe(before.injury);
 expect(cared.poison).toBe(before.poison);
 const firstRelationship=await page.evaluate(()=>structuredClone(window.atoll.simulation.reefStories.clinic.relationships[0]));
 expect(firstRelationship).toMatchObject({id:before.id,species:before.species,incarnation:before.incarnation,visits:1,returned:false});
 expect(firstRelationship.removed).toBeGreaterThanOrEqual(before.parasites-1);
 expect(await page.evaluate(()=>window.atoll.simulation.reefStories.clinic.completed)).toBe(false);
 const returnButton=action(page,'clinic-return',firstId);
 await expect(returnButton).toBeVisible({timeout:10000});
 await returnButton.click();
 if(await action(page,'clinic-gentle').count())await action(page,'clinic-gentle').click();
 await expect(action(page,'clinic-welcome')).toBeVisible({timeout:90000});
 const welcomeBefore=await patient(page,firstId),energyBefore=await page.evaluate(()=>window.atoll.simulation.player.energy);
 await action(page,'clinic-welcome').click();
 const welcomed=await patient(page,firstId);
 expect(welcomed.health).toBeLessThanOrEqual(welcomeBefore.health+.01);
 expect(await page.evaluate(()=>window.atoll.simulation.player.energy)).toBeLessThanOrEqual(energyBefore+.01);
 expect(await page.evaluate(()=>window.atoll.simulation.reefStories.clinic.relationships[0])).toMatchObject({id:before.id,visits:1,returned:true,removed:firstRelationship.removed});
 expect(await page.evaluate(()=>window.atoll.simulation.reefStories.clinic.completed)).toBe(false);
 const second=action(page,'clinic-choose').first();
 await expect(second).toBeVisible();
 const secondId=await second.getAttribute('data-value');
 const secondBefore=await patient(page,secondId);
 expect(secondBefore.id).not.toBe(before.id);
 if(id==='s45')expect(secondBefore.species).toBe(before.species);
 await choose(page,secondId);await approach(page);await beginCare(page);await finishCare(page,2);
 await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.reefStories.clinic.completed)).toBe(true);
 await expect.poll(()=>page.evaluate(()=>window.atoll.journal.discoveries)).toContain('reef-clinic');
 expect(await page.evaluate(()=>window.atoll.journal.discoveries.filter(id=>id==='reef-clinic').length)).toBe(1);
 await assertRoster(page,roster);
 await freeze(page);
 const result=await page.evaluate(()=>({clinic:window.atoll.simulation.reefStories.clinic,journal:window.atoll.journal.discoveries,memories:window.atoll.simulation.reefMemory.entries}));
 expect(result.clinic.relationships.map(r=>r.id).sort()).toEqual([before.id,secondBefore.id].sort());
 if(id==='s45'){
  const familiarLabels=await action(page,'clinic-return').evaluateAll(buttons=>buttons.map(b=>b.textContent.trim()));
  expect(familiarLabels).toHaveLength(2);
  expect(new Set(familiarLabels).size).toBe(2);
 }
 expect(result.memories.some(m=>m.kind==='reunion'&&/same.*clinic/i.test(m.text))).toBe(true);
 expect(await page.locator('.adventure-note').evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true);
 await page.screenshot({path:out+'/clinic-'+id+'-'+width+'-complete.png'});
 await writeFile(out+'/clinic-'+id+'-'+width+'.json',JSON.stringify({type:'automated-ui',seed:42,viewport:{width,height},before,secondBefore,motion:firstContact.motion,...result},null,2));
 expect(errors).toEqual([]);
});

test('partial clinic care survives a real save load and steering cancels without awarding a visit',async({page})=>{
 test.setTimeout(180000);await mkdir(out,{recursive:true});
 const roster=await ready(page,'s43',1024,768);
 const choice=action(page,'clinic-choose').filter({hasText:'nervous'}).first();
 const entityId=await choice.getAttribute('data-value');
 // One generated visitor receives a bounded mixed-health fixture so this
 // browser check can distinguish parasite removal from repairing other harm.
 await page.evaluate(id=>{
  const c=window.atoll.simulation.section.entities.find(e=>String(e.id)===String(id));
  c.biteDamage=(c.biteDamage||0)+4;c.poisonDamage=(c.poisonDamage||0)+3;c.health-=7;
 },entityId);
 await choose(page,entityId);await approach(page);await beginCare(page);await freeze(page);
 const checkpoint=await page.evaluate(()=>({clinic:structuredClone(window.atoll.simulation.reefStories.clinic),service:structuredClone(window.atoll.simulation.player.service)}));
 await page.locator('[data-action="saves"]').click();
 await page.locator('[data-action="save-1"]').click();
 const slot=await page.evaluate(()=>JSON.parse(JSON.parse(localStorage.getItem('atoll-save-1')).state));
 expect(slot.reefStories.clinic).toEqual(checkpoint.clinic);
 expect(slot.player.service).toEqual(checkpoint.service);
 await page.locator('[data-action="load-1"]').click();await freeze(page);
 const loaded=await page.evaluate(()=>({clinic:structuredClone(window.atoll.simulation.reefStories.clinic),service:structuredClone(window.atoll.simulation.player.service)}));
 expect(loaded.clinic.appointment).toMatchObject({id:checkpoint.clinic.appointment.id,incarnation:checkpoint.clinic.appointment.incarnation,phase:'care'});
 expect(loaded.service.client).toBe(checkpoint.service.client);
 expect(loaded.service.removed).toBeGreaterThanOrEqual(checkpoint.service.removed);
 expect(loaded.service.removed).toBeLessThan(loaded.service.total);
 const partial=await patient(page,entityId);
 await page.keyboard.press('Escape');
 const box=await page.locator('#reef').boundingBox();
 await page.mouse.move(box.x+box.width*.85,box.y+box.height*.55);
 await page.waitForFunction(()=>!window.atoll.simulation.player.service&&!window.atoll.simulation.reefStories.clinic.appointment);
 expect(await page.evaluate(()=>window.atoll.simulation.reefStories.clinic.relationships)).toEqual([]);
 expect(await page.evaluate(()=>window.atoll.simulation.reefStories.clinic.completed)).toBe(false);
 expect(await page.evaluate(()=>window.atoll.journal.discoveries)).not.toContain('reef-clinic');
 const cancelled=await patient(page,entityId);
 expect(cancelled.parasites).toBeGreaterThan(1);
 expect(cancelled.parasites).toBeLessThanOrEqual(partial.parasites+.1);
 await page.waitForTimeout(180);
 expect((await patient(page,entityId)).health).toBeLessThanOrEqual(cancelled.health+.01);
 expect(cancelled.injury).toBe(4);expect(cancelled.poison).toBe(3);
 await assertRoster(page,roster);
 await page.screenshot({path:out+'/clinic-cancel-save-1024.png'});
});

test('clinic stays optional and the original cleaner goal remains available',async({page})=>{
 await ready(page,'s43',1024,768);
 const choices=action(page,'clinic-choose');
 expect(await choices.count()).toBeGreaterThan(0);
 const chosen=await choices.first().getAttribute('data-value');
 await choose(page,chosen);
 await action(page,'clinic-cancel').click();
 expect(await page.evaluate(()=>window.atoll.simulation.reefStories.clinic.relationships)).toEqual([]);
 await action(page,'clinic-close').click();
 await expect(action(page,'clinic-open')).toBeVisible();
 await page.locator('#reef-story .activity-details > summary').click();
 await page.locator('[data-action="story-stop"]').click();
 expect(await page.evaluate(()=>window.atoll.simulation.reefStories.active)).toBeNull();
 await expect(page.locator('[data-action="adventure-toggle"]')).toBeVisible();
 if(!await page.locator('#optional-goal-step').isVisible())await page.locator('[data-action="adventure-toggle"]').click();
 await expect(page.locator('.adventure-note')).toContainText(/helping fin|different species/i);
 expect(await page.evaluate(()=>window.atoll.journal.discoveries)).toEqual([]);
 await expect(page.locator('[data-action="reef-map"]')).toBeEnabled();
});





