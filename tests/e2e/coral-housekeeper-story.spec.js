import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {clickButton} from '../../scripts/ui-actions.mjs';
import {COLONY,initStory,validStory} from '../../src/coral-housekeeper.js';

const artifactRoot=path.resolve('artifacts/species-adventures');
const action=(page,id,value)=>page.locator(`[data-story-action="${id}"]${value===undefined?'':`[data-value="${value}"]`}`);
const read=page=>page.evaluate(()=>structuredClone(window.atoll.simulation.reefStories.housekeeper));
async function worldPoint(page,p,click=false){const box=await page.locator('#reef').boundingBox(),x=box.x+p.x/1600*box.width,y=box.y+(p.y+55)/900*box.height;await page.mouse[click?'click':'move'](x,y);}
async function near(page,p,r=25){await worldPoint(page,p);await expect.poll(()=>page.evaluate(p=>Math.hypot(window.atoll.simulation.player.x-p.x,window.atoll.simulation.player.y-p.y),p),{timeout:25000}).toBeLessThan(r);}
async function start(page,width){
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill('Humbug');await page.locator('[role="option"][data-species="s30"]').click();if(width===1024){await page.locator('[data-action="guided-story"][data-story-key="housekeeper"]').click();}else{await page.locator('[data-action="begin-practice"]').click();
 await page.locator('[data-action="adventure-toggle"]').click();await page.locator('.story-invitation > summary').click();
 const choice=page.locator('[data-action="story-select"][data-story="housekeeper"], [data-action="story-select"][data-value="housekeeper"]');if(await choice.count())await choice.click();
 await page.locator('[data-action="story-begin"]').click();}await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.reefStories.active)).toBe('housekeeper');
 await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.current),{timeout:60000}).toBe(COLONY.reef);
}
async function checkpoint(page,label,evidence){
 if(!await page.evaluate(()=>window.atoll.simulation.paused))await page.locator('[data-action="pause"]').click();const before=await read(page);
 await page.keyboard.press('Control+s');await expect.poll(()=>page.evaluate(()=>!!localStorage.getItem('atoll-save-0'))).toBe(true);
 await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:'Saved dives',exact:true});await page.locator('[data-action="load-0"]').click();
 expect(await read(page),label+' resumed state').toEqual(before);evidence.checkpoints.push({label,state:before});
 if(await page.evaluate(()=>window.atoll.simulation.paused))await page.locator('[data-action="pause"]').click();
}
async function freeze(page){await page.locator('[data-action="pause"]').click();const frozen=await read(page);await page.waitForTimeout(300);expect(await read(page)).toEqual(frozen);await page.locator('[data-action="pause"]').click();}
async function screenshot(page,folder,name){await page.screenshot({path:path.join(folder,name+'.png')});const state=await page.evaluate(async()=>{const s=window.atoll.simulation,{creaturePickFrame}=await import('/src/geometry.js');return {time:s.time,current:s.current,paused:s.paused,phase:s.phase,player:{x:s.player.x,y:s.player.y,angle:s.player.angle,facing:s.player.facing,hidden:s.player.hidden,activity:s.player.activity,energy:s.player.energy,health:s.player.health},display:creaturePickFrame(s.player),stories:structuredClone(s.reefStories),care:structuredClone(s.careProgress)};});await writeFile(path.join(folder,name+'.json'),JSON.stringify(state,null,2));}

test('fixture validation: Housekeeper rejects invented clearing and impossible completed state',()=>{
 const s={player:{species:{id:'s30'}},reefStories:{}};const state=initStory(s);expect(validStory(state)).toBe(true);
 for(const edit of [s=>s.mask[0]=2,s=>s.complete=true,s=>s.site='generic-coral',s=>s.direction='up',s=>s.elapsed=99]){const fixture=structuredClone(state);edit(fixture);expect(validStory(fixture)).toBe(false);}
});

for(const [width,height] of [[1600,900],[1024,768]])test(`Housekeeper full real controls, physical work and saved colony at ${width}`,async({page})=>{
 test.setTimeout(240000);await page.setViewportSize({width,height});const errors=[];page.on('pageerror',e=>errors.push(e.message));const folder=path.join(artifactRoot,`housekeeper-${width}`);await mkdir(folder,{recursive:true});const evidence={width,height,checkpoints:[],motion:[]};
 await start(page,width);const initialNutrition=await page.evaluate(()=>window.atoll.simulation.careProgress.nourishment||0);await checkpoint(page,'initial-inspection',evidence);await screenshot(page,folder,'01-dusted-colony');
 await action(page,'housekeeper-inspect').click();await expect.poll(async()=>(await read(page)).inspected,{timeout:20000}).toBe(true);await checkpoint(page,'choose-pocket',evidence);
 await near(page,{x:1000,y:430});const initial=await read(page);await worldPoint(page,COLONY.pockets[0],true);expect((await read(page)).mask).toEqual(initial.mask);expect((await read(page)).complete).toBe(false);
 await checkpoint(page,'remote-approach',evidence);await action(page,'housekeeper-cancel').click();expect((await read(page)).intent).toBeNull();
 await action(page,'housekeeper-pocket',0).click();await action(page,'housekeeper-direction','right').click();await action(page,'housekeeper-clear').click();await page.waitForFunction(()=>window.atoll.simulation.reefStories.housekeeper.phase==='clear');
 await freeze(page);await checkpoint(page,'inward-mouth-contact',evidence);
 await expect.poll(async()=>(await read(page)).plume,{timeout:10000}).toBeGreaterThan(0);expect((await read(page)).mask).toEqual([0,0]);expect((await read(page)).plumeDirection).toBe('right');await screenshot(page,folder,'02-inward-resettling');
 await action(page,'housekeeper-pocket',0).click();await action(page,'housekeeper-direction','left').click();await action(page,'housekeeper-clear').click();await page.waitForFunction(()=>window.atoll.simulation.reefStories.housekeeper.phase==='clear');
 for(let i=0;i<3;i++){await page.keyboard.press('Escape');expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(true);const sample=await page.evaluate(async()=>{const s=window.atoll.simulation,{mouthPoint,displayedMouthPoint}=await import('/src/feeding-contact.js'),{housekeeperPose}=await import('/src/coral-housekeeper.js'),{poseFor}=await import('/src/coral-housekeeper-render.js');return {rig:poseFor(s,s.player,s.time,false),time:s.time,player:{x:s.player.x,y:s.player.y,facing:s.player.facing},mouth:mouthPoint(s.player),displayedMouth:displayedMouthPoint(s.player),pose:housekeeperPose(s),state:structuredClone(s.reefStories.housekeeper)};});evidence.motion.push(sample);expect(Math.hypot(sample.mouth.x-COLONY.pockets[0].x,sample.mouth.y-COLONY.pockets[0].y)).toBeLessThanOrEqual(3);expect(Math.hypot(sample.displayedMouth.x-sample.mouth.x,sample.displayedMouth.y-sample.mouth.y)).toBeLessThan(3);await screenshot(page,folder,`03-outward-contact-frame-${i}`);await page.keyboard.press('Escape');await page.waitForTimeout(120);}
 expect(evidence.motion[2].rig.feed).not.toBe(evidence.motion[0].rig.feed);expect(evidence.motion[2].pose.progress).toBeGreaterThan(evidence.motion[0].pose.progress);await expect.poll(async()=>(await read(page)).mask[0]).toBe(1);await checkpoint(page,'one-pocket-clear',evidence);
 await action(page,'housekeeper-pocket',1).click();await action(page,'housekeeper-direction','right').click();await action(page,'housekeeper-clear').click();await page.waitForFunction(()=>window.atoll.simulation.reefStories.housekeeper.phase==='clear');
 await worldPoint(page,{x:890,y:410});expect((await read(page)).intent).toBeNull();expect((await read(page)).mask).toEqual([1,0]);
 await action(page,'housekeeper-clear').click();await expect.poll(async()=>(await read(page)).mask,{timeout:20000}).toEqual([1,1]);await checkpoint(page,'both-pockets-cleared',evidence);
 await near(page,{x:1100,y:440});await action(page,'housekeeper-inspect').click();expect((await read(page)).complete).toBe(false);await page.waitForFunction(()=>window.atoll.simulation.reefStories.housekeeper.phase==='review'&&window.atoll.simulation.reefStories.housekeeper.intent==='review');await checkpoint(page,'final-inspection-contact',evidence);
 await expect.poll(async()=>(await read(page)).complete).toBe(true);await checkpoint(page,'complete',evidence);await screenshot(page,folder,'04-cleared-colony');await expect(page.locator('#story-record')).toHaveText('Discovered');
 await page.locator('#reef-story .activity-details > summary').click();await expect(page.locator('#story-detail')).toContainText('no instant coral recovery');await page.locator('[data-action="story-stop"]').click();expect(await page.evaluate(()=>window.atoll.simulation.reefStories.active)).toBeNull();await screenshot(page,folder,'05-free-exploration-colony');
 const persisted=(await read(page)).mask;await worldPoint(page,{x:1599,y:430});await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.current),{timeout:20000}).not.toBe(COLONY.reef);const away=await read(page);await page.waitForTimeout(400);expect(await read(page)).toEqual(away);
 await worldPoint(page,{x:0,y:430});await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.current),{timeout:20000}).toBe(COLONY.reef);expect((await read(page)).mask).toEqual(persisted);await near(page,COLONY.inspect);await screenshot(page,folder,'06-returned-colony');
 await page.locator('.story-invitation > summary').click();await page.locator('[data-action="story-begin"]').click();await action(page,'housekeeper-inspect').click();await page.waitForTimeout(1600);expect(await page.evaluate(()=>window.atoll.journal.discoveries.filter(d=>d==='coral-housekeeper').length)).toBe(1);
 expect(await page.locator('body').evaluate(e=>e.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);expect(await page.evaluate(()=>window.atoll.simulation.careProgress.nourishment||0)).toBe(initialNutrition);evidence.final=await read(page);evidence.errors=errors;await writeFile(path.join(folder,'evidence.json'),JSON.stringify(evidence,null,2));
});
