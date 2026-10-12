import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {clickButton} from '../../scripts/ui-actions.mjs';

// All story progress in the acceptance runs comes from the normal frame loop
// and actual mouse/E/buttons. The hooks below observe real bites; they never
// assign position, appetite, story state, food amount or completion.
test.use({video:'on'});
const evidenceDir=path.resolve('artifacts/species-adventures');
async function world(page,p,click=false){const b=await page.locator('#reef').boundingBox();const x=b.x+p.x/1600*b.width,y=b.y+(p.y+55)/900*b.height;await page.mouse[click?'click':'move'](x,y);}
async function read(page){return page.evaluate(()=>{const s=window.atoll.simulation,n=s.reefStories.lookout,b=n?.buddy&&s.sections[n.buddy.reef].entities.find(e=>e.id===n.buddy.id&&(e.incarnation||0)===n.buddy.incarnation),pass=n?.passer&&s.sections[n.passer.reef].entities.find(e=>e.id===n.passer.id&&(e.incarnation||0)===n.passer.incarnation);return {reef:s.current,paused:s.paused,time:s.time,player:{x:s.player.x,y:s.player.y,health:s.player.health,energy:s.player.energy,target:s.player.target,activity:s.player.activity},story:structuredClone(n),buddy:b&&{id:b.id,incarnation:b.incarnation||0,x:b.x,y:b.y,target:b.target,feeding:structuredClone(b.feeding),satiated:b.satiated,rest:b.rest,activity:b.activity,health:b.health},passer:pass&&{id:pass.id,x:pass.x,y:pass.y},bites:window.__lookoutBites||[],journal:window.atoll.journal.discoveries,legacyBuddy:structuredClone(s.adventure.buddy),roster:s.sections.map(r=>r.entities.map(e=>({id:e.id,incarnation:e.incarnation||0,partner:e.ecology?.partner??null,alive:e.alive})))};});}
test.afterEach(async({page},testInfo)=>{
 if(testInfo.status===testInfo.expectedStatus)return;
 try{await testInfo.attach('lookout-failure-state',{body:JSON.stringify(await read(page),null,2),contentType:'application/json'});}catch(error){await testInfo.attach('lookout-failure-read',{body:String(error),contentType:'text/plain'});}
});
async function phase(page,wanted,timeout=16000){await expect.poll(async()=>(await read(page)).story?.phase,{timeout,message:'Actual lookout phase '+wanted}).toBe(wanted);}
async function swim(page,p,timeout=18000){await world(page,p);await expect.poll(async()=>{const q=(await read(page)).player;return Math.hypot(q.x-p.x,q.y-p.y);},{timeout,message:'Physical pointer-steered arrival'}).toBeLessThan(18);}
async function capture(page,name){await mkdir(evidenceDir,{recursive:true});await page.screenshot({path:path.join(evidenceDir,'lookout-'+name+'.png')});}
async function safetyProof(page){return page.evaluate(async()=>{const {canPredate,isProtectedActor}=await import('/src/adventure-safety.js'),s=window.atoll.simulation,z=s.storySafety,h=s.section.entities.filter(e=>e.alive&&e.species.diet.includes('fish')&&e.species.ability!=='clean'),distance=e=>Math.hypot(e.x-z.x,e.y-z.y),nearest=h.toSorted((a,b)=>distance(a)-distance(b))[0],outside=h.find(e=>distance(e)>z.radius&&!isProtectedActor(s,e)),prey=outside&&s.section.entities.find(e=>e!==outside&&e.alive&&distance(e)>z.radius&&!isProtectedActor(s,e));return {zone:structuredClone(z),nearest:nearest&&{id:nearest.id,name:nearest.species.name,x:nearest.x,y:nearest.y,distance:distance(nearest),behavior:nearest.behavior},playerProtected:nearest&&!canPredate(s,nearest,s.player),outsideAllowed:!!(outside&&prey&&canPredate(s,outside,prey)),hunters:h.map(e=>({id:e.id,name:e.species.name,x:e.x,y:e.y,behavior:e.behavior,activity:e.activity,health:e.health,satiated:e.satiated}))};});}
async function liveFinFrames(page,name,{pauseAfter=false}={}){
 await page.evaluate(async()=>{const {appearanceFor}=await import('/src/rabbitfish-lookout-render.js'),r=window.atoll.renderer,s=window.atoll.simulation,c=appearanceFor(r,s,s.player,r.clock).sprite;window.__lookoutFrame={time:r.clock,pixels:c.getContext('2d').getImageData(0,0,c.width,c.height),pose:s.reefStories.lookout.phase};});
 await page.waitForTimeout(320);
 await page.evaluate(async()=>{const {appearanceFor}=await import('/src/rabbitfish-lookout-render.js'),r=window.atoll.renderer,s=window.atoll.simulation,c=appearanceFor(r,s,s.player,r.clock).sprite;window.__lookoutFrameSecond={time:r.clock,pixels:c.getContext('2d').getImageData(0,0,c.width,c.height),pose:s.reefStories.lookout.phase};});
 // Both samples come from the live frame loop. Evidence encoding and disk
 // writes are read-only work and must not spend the encounter's response time.
 if(pauseAfter){await page.keyboard.press('p');expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(true);}
 const proof=await page.evaluate(()=>{const a=window.__lookoutFrame,z=window.__lookoutFrameSecond,b=z.pixels;let changed=0;for(let i=0;i<b.data.length;i+=4)if(Math.max(...[0,1,2,3].map(k=>Math.abs(b.data[i+k]-a.pixels.data[i+k])))>12)changed++;const gallery=document.createElement('canvas');gallery.width=800;gallery.height=250;const g=gallery.getContext('2d'),old=document.createElement('canvas'),next=document.createElement('canvas');old.width=a.pixels.width;old.height=a.pixels.height;old.getContext('2d').putImageData(a.pixels,0,0);next.width=b.width;next.height=b.height;next.getContext('2d').putImageData(b,0,0);g.fillStyle='#eff0de';g.fillRect(0,0,800,250);g.fillStyle='#183d41';g.font='16px sans-serif';g.fillText('Actual rendered fin frame '+a.time.toFixed(2),15,25);g.fillText('Actual rendered fin frame '+z.time.toFixed(2),415,25);g.drawImage(old,20,40,360,180);g.drawImage(next,420,40,360,180);return {changed,elapsed:z.time-a.time,firstPhase:a.pose,secondPhase:z.pose,gallery:gallery.toDataURL()};});
 expect(proof.elapsed).toBeGreaterThan(.1);expect(proof.changed,'actual held fish fin motion changes native painted pixels').toBeGreaterThan(12);await writeFile(path.join(evidenceDir,'lookout-'+name+'-live-fin-frames.png'),Buffer.from(proof.gallery.split(',')[1],'base64'));delete proof.gallery;return proof;
}
async function begin(page,id,seed){
 await page.addInitScript(seed=>{Date.now=()=>seed;},seed);
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill(id==='s8'?'Foxface':'Pencilled');await page.locator(`[role="option"][data-species="${id}"]`).click();await page.locator('[data-action="guided-story"][data-story-key="lookout"]').click();
 await expect(page.locator('#reef-story')).toContainText('Your Turn to Look');const before=await read(page);
 expect((await read(page)).reef).toBe(0);
 await observeBites(page);
 return before;
}
async function observeBites(page){
 await page.evaluate(async()=>{
  const {contactGap}=await import('/src/feeding-contact.js'),s=window.atoll.simulation;window.__lookoutBites=[];
  const npc=s.stepNpc.bind(s);s.stepNpc=(e,dt,plan)=>{const n=s.reefStories.lookout,f=e.target&&s.section.food.find(f=>f.id===e.target),before=f?.amount;const was=n?.partnerMeal;npc(e,dt,plan);if(!was&&n?.partnerMeal)window.__lookoutBites.push({who:'buddy',id:e.id,incarnation:e.incarnation||0,food:f?.id,before,after:f?.amount,committed:!!e.feeding?.committed,gap:f&&contactGap(e,f),x:e.x,y:e.y,time:s.time});};
  const consume=s.consume.bind(s);s.consume=f=>{const before=f.amount,gap=contactGap(s.player,f),committed=!!s.player.feeding?.committed,n=s.reefStories.lookout,was=n?.playerMeal;consume(f);if(!was&&n?.playerMeal)window.__lookoutBites.push({who:'player',food:f.id,before,after:f.amount,committed,gap,x:s.player.x,y:s.player.y,time:s.time});};
 });
}
async function checkpoint(page){
 await page.keyboard.press('p');expect((await read(page)).paused).toBe(true);const before=await read(page);await page.waitForTimeout(450);const frozen=await read(page);expect(frozen.story).toEqual(before.story);expect(frozen.time).toBe(before.time);expect(frozen.buddy).toEqual(before.buddy);
 const lifecycle=await page.evaluate(async()=>{
  const {Simulation}=await import('/src/simulation.js'),{exportDive,importDive}=await import('/src/save-files.js'),{tickStories,stopStory,storyAction}=await import('/src/reef-stories.js');const s=window.atoll.simulation,portable=exportDive(s,'Lookout checkpoint'),saved=s.serialize(),restored=importDive(portable).simulation;
  const equal=JSON.stringify(restored.reefStories.lookout)===JSON.stringify(s.reefStories.lookout),paused=restored.paused,before=restored.serialize();restored.step(.05);const pauseFrozen=restored.serialize()===before;
  const off=Simulation.restore(saved);off.paused=false;off.current=1;const n=JSON.stringify(off.reefStories.lookout);for(let i=0;i<60;i++)off.step(1/60);const offscreenFrozen=n===JSON.stringify(off.reefStories.lookout);
  const stopped=Simulation.restore(saved);stopped.paused=false;stopStory(stopped);const stopState=stopped.reefStories.lookout,stopBefore=JSON.stringify(stopState);for(let i=0;i<60;i++)stopped.step(1/60);
  const replaced=Simulation.restore(saved);replaced.paused=false;const b=replaced.sections[0].entities.find(e=>e.id===replaced.reefStories.lookout.buddy.id);b.incarnation=(b.incarnation||0)+1;tickStories(replaced,1/60);const lost=structuredClone(replaced.reefStories.lookout);storyAction(replaced,'retry');
  const busy=Simulation.restore(saved);busy.paused=false;const care=busy.sections[0].entities.find(e=>e.id===busy.reefStories.lookout.buddy.id);care.cleanTime=1;tickStories(busy,1/60);
  return {equal,paused,pauseFrozen,offscreenFrozen,stoppedActive:stopped.reefStories.active,stoppedRole:stopState.role,stoppedFrozen:stopBefore===JSON.stringify(stopState),lost,retry:replaced.reefStories.lookout,busy:busy.reefStories.lookout};
 });
 expect(lifecycle.equal).toBe(true);expect(lifecycle.paused).toBe(true);expect(lifecycle.pauseFrozen).toBe(true);expect(lifecycle.offscreenFrozen).toBe(true);expect(lifecycle.stoppedActive).toBeNull();expect(lifecycle.stoppedRole).toBe('none');expect(lifecycle.stoppedFrozen).toBe(true);expect(lifecycle.lost.phase).toBe('unavailable');expect(lifecycle.lost.status).toBe('partner-away');expect(lifecycle.lost.partnerMeal).toBe(false);expect(lifecycle.retry.buddy).toBeNull();expect(lifecycle.busy.partnerMeal).toBe(false);expect(lifecycle.busy.status).toBe('busy');
 await page.keyboard.press('Control+s');await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:'Saved dives',exact:true});await page.locator('[data-action="load-0"]').click();expect((await read(page)).story).toEqual(before.story);expect((await read(page)).paused).toBe(true);await observeBites(page);return lifecycle;
}
async function respondFromPausedCapture(page,response){
 const before=await page.evaluate(()=>{const s=window.atoll.simulation,n=s.reefStories.lookout;return {paused:s.paused,time:s.time,phase:n.phase,cueClicked:n.cueClicked,responded:n.responded,passer:structuredClone(n.passer)};});
 expect(before.paused).toBe(true);expect(before.phase).toBe('signal');expect(before.cueClicked).toBe(true);expect(before.responded).toBe(false);
 const button=page.locator(`[data-story-action="${response}"]`);await expect(button).toBeVisible();
 const target=await button.evaluate(e=>{const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return {x,y,hit:document.elementFromPoint(x,y)?.closest('button')?.dataset.storyAction};});expect(target.hit).toBe(response);
 await page.mouse.move(target.x,target.y);await page.keyboard.press('p');await page.mouse.click(target.x,target.y);
 await expect.poll(async()=>page.evaluate(()=>{const n=window.atoll.simulation.reefStories.lookout;return {phase:n.phase,response:n.response,responded:n.responded};}),{timeout:4000,message:'Actual visible response button acknowledges the restored passing encounter'}).toEqual({phase:response==='hold'?'partner-feed':'relocating',response,responded:true});
 const after=await page.evaluate(()=>{const s=window.atoll.simulation,n=s.reefStories.lookout;return {paused:s.paused,time:s.time,phase:n.phase,response:n.response,responded:n.responded,passer:structuredClone(n.passer)};});expect(after.paused).toBe(false);expect(after.passer).toEqual(before.passer);return {before,target,after};
}
async function meet(page){
 const candidate=await page.evaluate(async()=>{const {admissionFor}=await import('/src/adventure-admission.js');return admissionFor(window.atoll.simulation,'lookout');});
 expect(candidate.available,JSON.stringify(candidate)).toBe(true);
 const p=await page.evaluate(id=>{const e=window.atoll.simulation.section.entities.find(e=>e.id===id);return {x:e.x,y:e.y};},candidate.participants[0].id);
 const player=(await read(page)).player;if(Math.hypot(player.x-p.x,player.y-p.y)>=280)await swim(page,p);await page.locator('[data-story-action="invite"]').click();expect((await read(page)).story.buddy.id).toBe(candidate.participants[0].id);
}
async function takeWatch(page,site='crest-open'){
 await page.locator(`[data-story-action="site"][data-value="${site}"]`).click();
 const p=site==='crest-open'?{x:240,y:370}:{x:410,y:485};await swim(page,p);
 const ready=await read(page);if(ready.buddy.satiated>0){await expect(page.locator('#story-detail')).toContainText('digesting');await expect.poll(async()=>(await read(page)).buddy.satiated,{timeout:5000,message:'Initial digestion clears through ordinary live physiology'}).toBeLessThanOrEqual(0);}
 await page.keyboard.press('e');
 await expect.poll(async()=>(await read(page)).story.phase,{timeout:8000}).toMatch(/^(watch|signal)$/);return p;
}
async function notice(page){
 await phase(page,'signal');expect((await read(page)).story.responded).toBe(false);await expect(page.locator('[data-story-action="hold"]')).toHaveCount(0);
 // Sample the moving actor and canvas geometry together immediately before
 // actual mouse input. Reading the full roster and then fetching bounds in
 // separate browser calls made this a stale-coordinate click on slower CI.
 const attempts=[];let initialPointerHit,identity;
 for(let attempt=0;attempt<3;attempt++){
  const target=await page.evaluate(()=>{
   const s=window.atoll.simulation,n=s.reefStories.lookout,p=n?.passer,e=p&&s.sections[p.reef].entities.find(e=>e.alive&&e.id===p.id&&(e.incarnation||0)===p.incarnation),r=document.querySelector('#reef').getBoundingClientRect();
   if(!e)return null;const x=r.x+e.x/1600*r.width,y=r.y+(e.y+55)/900*r.height,hit=document.elementFromPoint(x,y);
   return {identity:{id:e.id,incarnation:e.incarnation||0},x,y,time:s.time,phase:n.phase,responded:n.responded,player:{x:s.player.x,y:s.player.y},hit:{tag:hit?.tagName,id:hit?.id,story:!!hit?.closest('#reef-story')}};
  });
  expect(target).toBeTruthy();identity??=target.identity;expect(target.identity).toEqual(identity);expect(target.phase).toBe('signal');expect(target.responded).toBe(false);initialPointerHit??=target.hit;
  await page.mouse.click(target.x,target.y);
  const observed=await page.evaluate(()=>{const s=window.atoll.simulation,n=s.reefStories.lookout;return {time:s.time,phase:n.phase,cueClicked:n.cueClicked,responded:n.responded,player:{x:s.player.x,y:s.player.y},passer:n.passer};});
  attempts.push({target,observed});expect(target.hit.story,'Physical passing fish remains exposed to actual pointer input').toBe(false);expect(target.hit.id).toBe('reef');
  expect(Math.hypot(observed.player.x-target.player.x,observed.player.y-target.player.y),'Actual attention keeps the player anchored').toBeLessThan(3.1);
  if(observed.cueClicked)break;
  expect(observed.phase,'A real click must retain this live encounter: '+JSON.stringify(attempts)).toBe('signal');expect(observed.responded).toBe(false);
 }
 expect(attempts.at(-1).observed.cueClicked,'Actual mouse attention is acknowledged: '+JSON.stringify(attempts)).toBe(true);await expect(page.locator('[data-story-action="hold"]')).toBeVisible();
 const aimed=await read(page);expect(aimed.story.cueClicked).toBe(true);expect(aimed.story.responded).toBe(false);expect(aimed.story.passer.id).toBe(identity.id);expect(aimed.story.passer.incarnation).toBe(identity.incarnation);return {...aimed,initialPointerHit,attentionAttempts:attempts};
}

test('fresh admission preserves adult slots and existing bonds for previously blocked rabbitfish seeds',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 const rows=await page.evaluate(async()=>{
  const {Simulation}=await import('/src/simulation.js'),{admissionFor}=await import('/src/adventure-admission.js'),{beginStory}=await import('/src/reef-stories.js');
  return [['s8',9],['s8',11],['s8',26],['s8',28],['s8',33],['s52',1]].map(([id,seed])=>{
   const s=new Simulation(seed);s.start('practice',id);const inventory=()=>s.sections.map(r=>r.entities.map(e=>({id:e.id,incarnation:e.incarnation||0,partner:e.ecology?.partner??null,satiated:e.satiated,rest:e.rest}))),before=inventory(),a=admissionFor(s,'lookout'),buddy=a.participants?.[0]&&s.sections[0].entities.find(e=>e.id===a.participants[0].id);
   const started=beginStory(s,'lookout');return {id,seed,a,started,buddy:buddy&&{partner:buddy.ecology?.partner??null,target:buddy.target,feeding:buddy.feeding,satiated:buddy.satiated,rest:buddy.rest,health:buddy.health},preserved:JSON.stringify(before)===JSON.stringify(inventory()),rosters:s.sections.map(r=>r.entities.length)};
  });
 });
 for(const row of rows){expect(row.a.available,JSON.stringify(row)).toBe(true);expect(row.started).toBe(true);expect(row.preserved).toBe(true);expect(row.buddy.partner).toBeNull();expect(row.buddy.target).toBeNull();expect(row.buddy.feeding??null).toBeNull();expect(row.buddy.health).toBeGreaterThan(0);expect(row.buddy.satiated).toBeLessThanOrEqual(8);expect(row.buddy.rest||0).toBe(0);}
 await mkdir(evidenceDir,{recursive:true});await writeFile(path.join(evidenceDir,'lookout-admission.json'),JSON.stringify(rows,null,2));
});

for(const [id,width,height,response]of [['s8',1600,900,'hold'],['s8',1024,768,'move'],['s52',1600,900,'move'],['s52',1024,768,'hold']])test(`Your Turn to Look ${id} ${width}: actual attention, ${response}, two physical bites and visible role exchange`,async({page},testInfo)=>{
 test.setTimeout(140000);await page.setViewportSize({width,height});const errors=[];page.on('pageerror',e=>errors.push(e.message));const initial=await begin(page,id,id==='s8'?9:1);await meet(page);
 // A distant Take lookout command and remote food click cannot award a turn.
 await page.locator('[data-story-action="site"][data-value="crest-open"]').click();await swim(page,{x:650,y:300});await page.locator('[data-story-action="watch"]').click();expect((await read(page)).story.role).toBe('none');expect((await read(page)).story.partnerMeal).toBe(false);
 const anchor=await takeWatch(page),watchBefore=await read(page);await world(page,{x:anchor.x+450,y:anchor.y-70});await page.waitForTimeout(350);const watchAfter=await read(page);expect(Math.hypot(watchAfter.player.x-watchBefore.player.x,watchAfter.player.y-watchBefore.player.y)).toBeLessThan(3.1);expect(watchAfter.story.aim).not.toBe(watchBefore.story.aim);
 const pose=await page.evaluate(async()=>{const {poseFor,appearanceFor,LOOKOUT_RABBITFISH_ASSET}=await import('/src/rabbitfish-lookout-render.js');const s=window.atoll.simulation,e=s.section.entities.find(e=>e.id===s.reefStories.lookout.buddy.id),r=window.atoll.renderer;return {player:poseFor(r,s,s.player,r.clock),buddy:poseFor(r,s,e,r.clock),corrected:appearanceFor(r,s,s.player,r.clock)?.sprite!==r.sprites[s.player.species.index],asset:LOOKOUT_RABBITFISH_ASSET};});
 expect(pose.player.role).toBe('watch');expect(Math.abs(pose.player.rotation)).toBeGreaterThan(.8);expect(pose.buddy.rotation).toBe(0);if(id==='s52')expect(pose.corrected).toBe(true);
 const safetyStart=await safetyProof(page);expect(safetyStart.playerProtected).toBe(true);expect(safetyStart.hunters.length).toBeGreaterThan(0);
 // Autonomous hunters keep swimming while screenshots, input and browser
 // work take place. Their distance is not an authored story condition.
 // Require a real hunter in the visible reef, then prove its movement and
 // ordinary outside-scene predation below rather than imposing a 400px timer.
 expect(safetyStart.nearest.x).toBeGreaterThanOrEqual(0);expect(safetyStart.nearest.x).toBeLessThanOrEqual(1600);expect(safetyStart.nearest.y).toBeGreaterThanOrEqual(0);expect(safetyStart.nearest.y).toBeLessThanOrEqual(740);
 await capture(page,`${id}-${width}-upright`);const finFrames=await liveFinFrames(page,`${id}-${width}`);const noticed=await notice(page);const lifecycle=id==='s8'&&width===1600?await checkpoint(page):null;
 if(!lifecycle)await page.keyboard.press('p');expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(true);
 await capture(page,`${id}-${width}-attention`);await page.keyboard.press('p');const signalFinFrames=await liveFinFrames(page,`${id}-${width}-signal`,{pauseAfter:true});expect(signalFinFrames.firstPhase).toBe('signal');expect(signalFinFrames.secondPhase).toBe('signal');const responseInput=await respondFromPausedCapture(page,response);
 if(response==='move'){await phase(page,'relocating');const relocating=await read(page);expect(relocating.story.site).toBe('crest-sheltered');expect(relocating.story.partnerMeal).toBe(false);await capture(page,`${id}-${width}-departure`);await swim(page,{x:410,y:485});await page.keyboard.press('e');}
 await phase(page,'partner-feed',8000);const grazingStart=await read(page);await capture(page,`${id}-${width}-grazing-approach`);
 await expect.poll(async()=>(await read(page)).story.partnerMeal,{timeout:16000,message:'Normal hungry companion takes a committed real bite'}).toBe(true);
 const riseStart=await read(page);expect(riseStart.story.playerMeal).toBe(false);expect(riseStart.story.role).toBe('partner');await capture(page,`${id}-${width}-rise-start`);
 await phase(page,'player-feed',9000);const watching=await read(page);await capture(page,`${id}-${width}-roles-swapped`);const site=watching.story.site==='crest-open'?{x:240,y:370,food:{x:190,y:460}}:{x:410,y:485,food:{x:360,y:575}};expect(Math.hypot(watching.buddy.x-site.x,watching.buddy.y-site.y)).toBeLessThanOrEqual(18);
 const swappedPose=await page.evaluate(async()=>{const {poseFor}=await import('/src/rabbitfish-lookout-render.js'),s=window.atoll.simulation,r=window.atoll.renderer,e=s.section.entities.find(e=>e.id===s.reefStories.lookout.buddy.id);return {buddy:poseFor(r,s,e,r.clock),player:poseFor(r,s,s.player,r.clock)};});expect(swappedPose.buddy.role).toBe('watch');expect(Math.abs(swappedPose.buddy.rotation)).toBeGreaterThan(.8);expect(swappedPose.player.role).toBe('graze');expect(swappedPose.player.rotation).toBe(0);
 if(id==='s52'&&width===1024){
  await page.locator('[data-action="settings"]').click();await page.locator('[data-setting="reducedMotion"]').check();await page.locator('[data-setting="sound"]').uncheck();await page.getByRole('button',{name:'Done',exact:true}).click();
  const reduced=await page.evaluate(async()=>{const {poseFor}=await import('/src/rabbitfish-lookout-render.js'),s=window.atoll.simulation,r=window.atoll.renderer,b=s.section.entities.find(e=>e.id===s.reefStories.lookout.buddy.id);return {enabled:r.reducedMotion,buddy:poseFor(r,s,b,r.clock),player:poseFor(r,s,s.player,r.clock)};});expect(reduced.enabled).toBe(true);expect(reduced.buddy.role).toBe('watch');expect(Math.abs(reduced.buddy.rotation)).toBeGreaterThan(.8);expect(reduced.player.role).toBe('graze');await capture(page,`${id}-${width}-reduced-motion-roles`);
 }
 expect(Math.hypot(watching.buddy.x-grazingStart.buddy.x,watching.buddy.y-grazingStart.buddy.y)).toBeGreaterThan(30);expect(watching.bites).toHaveLength(1);expect(watching.bites[0].before-watching.bites[0].after).toBe(12);expect(watching.bites[0].committed).toBe(true);expect(watching.bites[0].gap).toBeLessThanOrEqual(3.1);
 // Selection only begins a real feeding approach: completion still requires contact.
 const safetyEnd=await safetyProof(page);expect(safetyEnd.outsideAllowed,'Actual outside-scene predator/prey eligibility continues').toBe(true);expect(safetyStart.hunters.some(a=>safetyEnd.hunters.some(b=>a.id===b.id&&Math.hypot(a.x-b.x,a.y-b.y)>10))).toBe(true);
 await world(page,site.food,true);const requested=await read(page);expect(requested.story.playerMeal).toBe(false);expect(requested.story.phase).toBe('player-feed');
 await expect.poll(async()=>(await read(page)).player.y,{timeout:4000,message:'Player physically swims below watcher toward real algae'}).toBeGreaterThan(site.food.y-40);await capture(page,`${id}-${width}-player-grazing`);
 await phase(page,'complete',9000);await expect(page.locator('#story-record')).toHaveText('Discovered');await expect.poll(async()=>(await read(page)).journal.filter(x=>x==='rabbitfish-lookout').length).toBe(1);
 const done=await read(page);expect(done.bites).toHaveLength(2);expect(done.bites[1].before-done.bites[1].after).toBe(35);expect(done.bites[1].committed).toBe(true);expect(done.bites[1].gap).toBeLessThanOrEqual(3.1);expect(done.story.buddy).toEqual(watchBefore.story.buddy);expect(done.legacyBuddy).toEqual(initial.legacyBuddy);expect(done.journal).not.toContain(id==='s8'?'foxface-companion':'rabbitfish-companion');expect(done.roster.flat().map(e=>e.id).sort()).toEqual(initial.roster.flat().map(e=>e.id).sort());expect(done.roster.flat()).toHaveLength(initial.roster.flat().length);for(const pair of initial.roster.flat().filter(e=>e.partner!==null)){const living=done.roster.flat().find(e=>e.id===pair.id&&e.alive&&e.incarnation===pair.incarnation);if(living)expect(living.partner).toBe(pair.partner);}
 expect(await page.locator('body').evaluate(e=>e.scrollWidth<=window.innerWidth+1)).toBe(true);const bounds=await page.locator('#reef-story').boundingBox();expect(bounds.x+bounds.width).toBeLessThanOrEqual(width+1);expect(bounds.y+bounds.height).toBeLessThanOrEqual(height+1);await capture(page,`${id}-${width}-complete`);
 await page.locator('[data-story-action="retry"]').click();expect((await read(page)).story.logged).toBe(true);expect((await read(page)).journal.filter(x=>x==='rabbitfish-lookout')).toHaveLength(1);expect(errors).toEqual([]);
 await writeFile(path.join(evidenceDir,`lookout-${id}-${width}-motion.json`),JSON.stringify({pose,swappedPose,finFrames,signalFinFrames,safetyStart,safetyEnd,lifecycle,noticed,responseInput,watchBefore,grazingStart,riseStart,watching,done},null,2));
 testInfo.attach('lookout-motion-evidence',{path:path.join(evidenceDir,`lookout-${id}-${width}-motion.json`),contentType:'application/json'});
});

test('Your Turn to Look actual stop releases swimming and leaves no bite or discovery',async({page})=>{
 test.setTimeout(45000);await page.setViewportSize({width:1600,height:900});await begin(page,'s8',9);await meet(page);await takeWatch(page);const held=await read(page);expect(held.story.role).toBe('player');await page.locator('[data-action="story-stop"]').click();await expect(page.locator('#reef-story')).toHaveCount(0);const stopped=await read(page);expect(stopped.story.role).toBe('none');expect(stopped.story.partnerMeal).toBe(false);expect(stopped.story.playerMeal).toBe(false);expect(stopped.journal).not.toContain('rabbitfish-lookout');expect(await page.evaluate(()=>window.atoll.simulation.reefStories.active)).toBeNull();await swim(page,{x:650,y:480});const moved=await read(page);expect(Math.hypot(moved.player.x-held.player.x,moved.player.y-held.player.y)).toBeGreaterThan(350);expect(moved.story).toEqual(stopped.story);expect(moved.bites).toHaveLength(0);expect(moved.journal).not.toContain('rabbitfish-lookout');await capture(page,'actual-stop');await writeFile(path.join(evidenceDir,'lookout-actual-stop.json'),JSON.stringify({held,stopped,moved},null,2));
});
