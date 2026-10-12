import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {clickButton} from '../../scripts/ui-actions.mjs';

const evidenceDir='artifacts/species-adventures';
test.use({video:{mode:'on',size:{width:1600,height:900}}});
test.afterEach(async({page},info)=>{
 await mkdir(evidenceDir,{recursive:true});
 if(info.status!==info.expectedStatus&&!page.isClosed()){
  const stem=info.title.replace(/[^a-z0-9]+/gi,'-').toLowerCase();await page.screenshot({path:`${evidenceDir}/crevice-failed-${stem}.png`});
  await writeFile(`${evidenceDir}/crevice-failed-${stem}.json`,JSON.stringify(await state(page),null,2));
  await writeFile(`${evidenceDir}/crevice-transitions-${stem}.json`,JSON.stringify(await page.evaluate(()=>window.creviceQAObservations||[]),null,2));
 }
 const video=page.video();await page.close();
 if(video)await video.saveAs(`${evidenceDir}/crevice-${info.title.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}.webm`);
});
async function ready(page){await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);}
async function begin(page,seed=4){
 if(seed!==undefined)await page.addInitScript(seed=>{Date.now=()=>seed;},seed);
 await ready(page);await clickButton(page,{name:/Practice Choose/});
 await page.getByRole('searchbox').fill('Clown triggerfish');await page.locator('[role="option"][data-species="s24"]').click();
 await page.locator('[data-action="guided-story"][data-story-key="crevice"]').click();
 await expect(page.locator('#reef-story')).toContainText('The Just-Right Crevice');
 await page.evaluate(()=>{window.creviceQAObservations=[];let last='';function record(){const s=window.atoll.simulation,q=s.reefStories.crevice;const stage=q?.stage;if(stage!==last){window.creviceQAObservations.push({time:s.time,stage,story:structuredClone(q),player:{x:s.player.x,y:s.player.y,angle:s.player.angle},pointer:structuredClone(s.pointer),npc:s.section.entities.filter(e=>Math.hypot(e.x-1030,e.y-492)<260).map(e=>({id:e.id,species:e.species.id,x:e.x,y:e.y,angle:e.angle,vx:e.vx,vy:e.vy,behavior:e.behavior})),text:document.querySelector('#ui')?.textContent});last=stage;}requestAnimationFrame(record);}requestAnimationFrame(record);});
}
async function state(page){return page.evaluate(()=>{const s=window.atoll.simulation,p=s.player;return {story:structuredClone(s.reefStories.crevice),x:p.x,y:p.y,angle:p.angle,energy:p.energy,health:p.health,spine:p.triggerfishSpine,pose:structuredClone(p.crevicePose),protected:s.protected,paused:s.paused,counts:s.sections.map(r=>r.entities.length),discoveries:window.atoll.journal.discoveries.filter(x=>x==='triggerfish-crevice').length};});}
async function phase(page,stage){await page.waitForFunction(stage=>window.atoll.simulation.reefStories.crevice?.stage===stage,stage,{polling:16,timeout:18000});}
async function action(page,id,index){await page.locator(`[data-story-action="${id}"]${index!==undefined?`[data-value="${index}"]`:''}`).click();}
async function mouseWorld(page,x,y){const b=await page.locator('#reef').boundingBox();await page.mouse.move(b.x+x/1600*b.width,b.y+(y+55)/900*b.height);}
async function screenshot(page,name){await mkdir(evidenceDir,{recursive:true});await page.screenshot({path:`${evidenceDir}/crevice-${name}.png`});}
async function waitForFit(page){await expect.poll(()=>page.evaluate(async()=>{const {creviceFit}=await import('/src/triggerfish-crevice.js');return creviceFit(window.atoll.simulation).fits;}),{timeout:18000,intervals:[50]}).toBe(true);}
async function releaseInitialWatching(page){
 const meal=await page.evaluate(async()=>{const {edible}=await import('/src/diet.js');const {creaturePickFrame}=await import('/src/geometry.js');const {CREVICES}=await import('/src/triggerfish-crevice.js');const s=window.atoll.simulation;const food=[...s.section.food.filter(f=>f.regrow<=0),...s.section.entities.filter(e=>e.alive)].filter(f=>edible(s.player,f)&&CREVICES.every(c=>Math.hypot(f.x-c.x,f.y-c.y)>75)).sort((a,b)=>Math.hypot(a.x-s.player.x,a.y-s.player.y)-Math.hypot(b.x-s.player.x,b.y-s.player.y))[0];if(!food)throw new Error('This generated reef has no visible edible meal to release initial Practice protection');const frame=food.species?creaturePickFrame(food):food;return {x:frame.x,y:frame.y};});
 const b=await page.locator('#reef').boundingBox();await page.mouse.click(b.x+meal.x/1600*b.width,b.y+(meal.y+55)/900*b.height);await expect.poll(async()=>(await state(page)).protected).toBe(false);
}
async function enter(page){
 await expect.poll(()=>page.evaluate(async()=>{const {creviceOptions}=await import('/src/triggerfish-crevice.js');return creviceOptions(window.atoll.simulation)[1].fits;}),{timeout:18000,intervals:[50]}).toBe(true);
 await action(page,'crevice-choose',1);await phase(page,'approach');
 // An early context action must not teleport the player into the opening.
 await page.keyboard.press('e');expect((await state(page)).story.stage).toBe('approach');
 await waitForFit(page);
 const beforeE=await page.evaluate(async()=>{const {creviceFit}=await import('/src/triggerfish-crevice.js');return {fit:creviceFit(window.atoll.simulation),state:window.atoll.simulation.reefStories.crevice,player:{x:window.atoll.simulation.player.x,y:window.atoll.simulation.player.y,angle:window.atoll.simulation.player.angle},focus:document.activeElement?.tagName};});
 await page.keyboard.press('e');const afterE=await state(page);await writeFile(`${evidenceDir}/crevice-entry-input.json`,JSON.stringify({beforeE,afterE},null,2));await phase(page,'entering');
}
async function lock(page){await enter(page);await phase(page,'inside');await page.keyboard.press('e');await phase(page,'locked');}
async function checkpoint(page,stage){
 await phase(page,stage);await page.keyboard.press('Escape');const frozen=await state(page);expect(frozen.paused).toBe(true);expect(frozen.story.stage).toBe(stage);
 await page.waitForTimeout(180);const after=await state(page);expect(after.story).toEqual(frozen.story);expect(after.x).toBe(frozen.x);expect(after.y).toBe(frozen.y);
 const roundtrip=await page.evaluate(async()=>{
  const {exportDive,importDive}=await import('/src/save-files.js');const s=window.atoll.simulation,text=exportDive(s,'Crevice phase');
  const restored=importDive(text).simulation,before=structuredClone(restored.reefStories.crevice);
  const original=JSON.parse(text).state.reefStories.crevice;
  // This copy tests offscreen ownership; the live player never changes reefs or pose through script.
  restored.current=5;restored.paused=false;for(let i=0;i<120;i++)restored.step(1/60);
  const legacy=JSON.parse(text);delete legacy.state.reefStories;const oldDive=importDive(JSON.stringify(legacy)).simulation;
  return {original,before,offscreen:restored.reefStories.crevice,legacy:{species:oldDive.player.species.id,active:oldDive.reefStories.active,counts:oldDive.sections.map(r=>r.entities.length)}};
 });
 expect(roundtrip.before,stage+' portable importer').toEqual(roundtrip.original);expect(roundtrip.offscreen,stage+' offscreen freeze').toEqual(roundtrip.before);
 expect(roundtrip.legacy.species).toBe('s24');expect(roundtrip.legacy.active).toBeNull();expect(roundtrip.legacy.counts).toEqual(frozen.counts);
 await page.keyboard.press('Escape');return frozen;
}

for(const [width,height]of [[1600,900],[1024,768]])test(`real controls fit contact retract and journal at ${width}`,async({page})=>{
 test.setTimeout(100000);await page.setViewportSize({width,height});const errors=[];page.on('pageerror',e=>errors.push(e.message));await begin(page,width===1600?110:4);
 await page.getByRole('button',{name:'Fullscreen',exact:true}).click();await page.waitForFunction(()=>!!document.fullscreenElement);
 if(width===1600)await releaseInitialWatching(page);
 const initial=await state(page);await action(page,'crevice-choose',0);expect((await state(page)).story.stage).toBe('choose');await action(page,'crevice-choose',2);expect((await state(page)).story.stage).toBe('choose');
 const choices=await page.evaluate(async()=>{const {creviceOptions}=await import('/src/triggerfish-crevice.js');const {creatureFrame}=await import('/src/geometry.js');const s=window.atoll.simulation;return {options:creviceOptions(s),height:creatureFrame(s.player).height};});
 expect(choices.options[0].gap).toBeLessThan(choices.height+4);expect(choices.options[2].gap).toBeGreaterThan(choices.height+15);expect(choices.options[0].fits).toBe(false);expect(choices.options[2].fits).toBe(false);
 await expect(page.locator('[data-story-action="crevice-choose"][data-value="0"]')).toContainText(choices.options[0].occupied?'occupied':'too narrow');await expect(page.locator('[data-story-action="crevice-choose"][data-value="2"]')).toContainText(choices.options[2].occupied?'occupied':'too wide');
 await screenshot(page,`openings-${width}`);await enter(page);const entering=await state(page);expect(entering.pose.spine).toBe(0);expect(entering.story.depth).toBeLessThan(1);expect(entering.story.completed).toBe(false);
 if(width===1600){
  expect(entering.protected).toBe(false);expect(entering.energy).toBeGreaterThan(0);expect(entering.energy).toBeLessThan(100);
  let policy;await expect.poll(async()=>{policy=await page.evaluate(async()=>{const {canPredate,isProtectedActor}=await import('/src/adventure-safety.js');const {edible}=await import('/src/diet.js');const s=window.atoll.simulation,z=s.storySafety;const hunters=s.section.entities.filter(e=>e.alive&&edible(e,s.player));const outside=s.section.entities.filter(e=>e.alive&&Math.hypot(e.x-z.x,e.y-z.y)>z.radius+40);const pair=outside.flatMap(h=>outside.filter(p=>h!==p&&edible(h,p)).map(p=>({hunter:h.id,prey:p.id,allowed:canPredate(s,h,p)})))[0];return {safety:z,playerProtected:isProtectedActor(s,s.player),hunters:hunters.map(e=>({id:e.id,species:e.species.id,x:e.x,y:e.y,behavior:e.behavior,distance:Math.hypot(e.x-z.x,e.y-z.y),playerAllowed:canPredate(s,e,s.player)})),outsidePair:pair};});return policy.hunters.some(h=>h.distance<260&&h.behavior==='Swimming around the occupied adventure');},{timeout:12000,intervals:[50]}).toBe(true);
  expect(policy.playerProtected).toBe(true);expect(policy.hunters.some(h=>h.distance<260&&h.behavior==='Swimming around the occupied adventure'),'a live edible-player predator physically follows the local courtesy around the held cavity').toBe(true);for(const hunter of policy.hunters)expect(hunter.playerAllowed).toBe(false);expect(policy.outsidePair?.allowed).toBe(true);await writeFile(`${evidenceDir}/crevice-local-policy.json`,JSON.stringify(policy,null,2));
 }
 await phase(page,'inside');const inside=await state(page);expect(Math.hypot(inside.x-entering.x,inside.y-entering.y)).toBeGreaterThan(100);expect(inside.pose.occluded).toBe(true);expect(Math.abs(inside.angle-.12)).toBeLessThan(.055);expect(inside.discoveries).toBe(0);

 await screenshot(page,`inside-${width}`);await page.keyboard.press('e');await phase(page,'locking');await screenshot(page,`raising-${width}`);await phase(page,'locked');const locked=await state(page);
 expect(locked.energy).toBe(inside.energy);expect(locked.health).toBe(inside.health);expect(locked.spine).toBe(1);expect(Math.hypot(locked.pose.spineTip.x-locked.pose.upperEdge.x,locked.pose.spineTip.y-locked.pose.upperEdge.y)).toBeLessThan(.001);expect(locked.discoveries).toBe(0);

 await page.waitForTimeout(1000);const held=await state(page);expect(held.energy,'required held pose preserves current energy').toBe(locked.energy);expect(held.health,'required held pose preserves current health').toBe(locked.health);
 await screenshot(page,`locked-${width}`);
 const bounds=await page.locator('#reef-story').evaluate(e=>({left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right,bottom:e.getBoundingClientRect().bottom,overflow:e.scrollWidth>e.clientWidth+1}));expect(bounds.left).toBeGreaterThanOrEqual(0);expect(bounds.right).toBeLessThanOrEqual(width);expect(bounds.bottom).toBeLessThanOrEqual(height);expect(bounds.overflow).toBe(false);
 await page.keyboard.press('e');await phase(page,'releasing');await page.waitForTimeout(150);const releasing=await state(page);expect(releasing.spine).toBeGreaterThan(0);expect(releasing.spine).toBeLessThan(1);expect(releasing.x).toBe(locked.x);expect(releasing.y).toBe(locked.y);await screenshot(page,`retracting-${width}`);
 // The spine finishes folding on the first exiting frame; backward movement
 // starts on the following simulation step. Observe that physical work.
 await page.waitForFunction(()=>{const q=window.atoll.simulation.reefStories.crevice;return q.stage==='exiting'&&q.depth>0&&q.depth<1;},null,{polling:16,timeout:18000});
 const exiting=await state(page);expect(exiting.spine).toBe(0);expect(exiting.story.depth).toBeLessThan(1);expect(Math.hypot(exiting.x-locked.x,exiting.y-locked.y)).toBeGreaterThan(0);await phase(page,'complete');await expect(page.locator('#story-record')).toHaveText('Discovered');const complete=await state(page);expect(complete.discoveries).toBe(1);expect(complete.counts).toEqual(initial.counts);expect(complete.pose).toBeNull();expect(complete.spine).toBe(0);
 await page.keyboard.press('e');await page.waitForTimeout(250);expect((await state(page)).discoveries).toBe(1);await screenshot(page,`complete-${width}`);
 await writeFile(`${evidenceDir}/crevice-geometry-${width}.json`,JSON.stringify({initial,entering,inside,locked,releasing,exiting,complete,bounds,errors},null,2));expect(errors).toEqual([]);
});

test('all nine phases pause export import and offscreen freeze through real input',async({page})=>{
 test.setTimeout(100000);await begin(page);const checkpoints=[];checkpoints.push(await checkpoint(page,'choose'));await action(page,'crevice-choose',1);checkpoints.push(await checkpoint(page,'approach'));
 await waitForFit(page);await page.keyboard.press('e');checkpoints.push(await checkpoint(page,'entering'));checkpoints.push(await checkpoint(page,'inside'));
 await page.keyboard.press('e');checkpoints.push(await checkpoint(page,'locking'));checkpoints.push(await checkpoint(page,'locked'));
 // Exercise the actual local save menu and reload while the spine is held.
 await page.keyboard.press('Escape');await page.keyboard.press('Control+s');await expect.poll(()=>page.evaluate(()=>{const saved=JSON.parse(localStorage.getItem('atoll-save-0')).state;return (typeof saved==='string'?JSON.parse(saved):saved).reefStories.crevice.stage==='locked';})).toBe(true);
 await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:'Saved dives',exact:true});await page.locator('[data-action="load-0"]').click();await phase(page,'locked');expect((await state(page)).spine).toBe(1);
 if((await state(page)).paused)await page.keyboard.press('Escape');
 await page.keyboard.press('e');checkpoints.push(await checkpoint(page,'releasing'));checkpoints.push(await checkpoint(page,'exiting'));checkpoints.push(await checkpoint(page,'complete'));
 expect(checkpoints.map(c=>c.story.stage)).toEqual(['choose','approach','entering','inside','locking','locked','releasing','exiting','complete']);await writeFile(`${evidenceDir}/crevice-phase-checkpoints.json`,JSON.stringify(checkpoints,null,2));
});

test('locked pointer cancellation folds immediately and restores actual mouse swimming',async({page})=>{
 test.setTimeout(60000);await begin(page);await lock(page);const locked=await state(page);await mouseWorld(page,locked.x-220,locked.y-80);
 await expect.poll(async()=>(await state(page)).story.stage).toBe('choose');const cancelled=await state(page);expect(cancelled.spine).toBe(0);expect(cancelled.pose).toBeNull();expect(cancelled.discoveries).toBe(0);
 await page.waitForFunction(p=>{const a=window.atoll.simulation.player;return Math.hypot(a.x-p.x,a.y-p.y)>35;},locked);await screenshot(page,'cancelled-free-control');
});

test('a naturally generated occupant prevents claiming its opening',async({page})=>{
 test.setTimeout(45000);await begin(page,1);
 await expect(page.locator('[data-story-action="crevice-choose"][data-value="1"]')).toContainText('occupied');
 const before=await state(page);await action(page,'crevice-choose',1);const after=await state(page);expect(after.story.stage).toBe('choose');expect(after.story.crevice).toBeNull();expect(after.spine).toBe(0);expect(after.discoveries).toBe(0);expect(after.counts).toEqual(before.counts);
 await screenshot(page,'naturally-occupied');
});
