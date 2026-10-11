import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {clickButton} from '../../scripts/ui-actions.mjs';

const artifacts=process.env.ATOLL_ARTIST_ARTIFACTS||'artifacts/reef-stories';
const evidence={story:'The Disappearing Artist',tests:[],renders:[]};
test.describe.configure({mode:'serial'});
test.beforeAll(async()=>mkdir(artifacts,{recursive:true}));
test.afterAll(async()=>writeFile(`${artifacts}/artist-review.json`,JSON.stringify(evidence,null,2)));
async function snapshot(page){return page.evaluate(()=>{const s=window.atoll.simulation,a=s.reefStories.artist,e=s.section.entities.find(e=>e.id===a.observer?.id);return {artist:structuredClone(a),player:{x:s.player.x,y:s.player.y,hidden:s.player.hidden,blending:s.player.blending,energy:s.player.energy,health:s.player.health},observer:e?{id:e.id,x:e.x,y:e.y,diet:e.species.diet,behavior:e.behavior}:null,paused:s.paused,time:s.time,motionTime:window.atoll.renderer.poses.get('player')?.motionTime};});}
async function action(page,id,value){await page.locator(`[data-action="story-action"][data-story-action="${id}"]${value?`[data-value="${value}"]`:''}`).click();}
async function begin(page){
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:/Practice Choose/});await page.locator('[role="option"][data-species="s19"]').click();await page.locator('[data-action="begin-practice"]').click();await clickButton(page,{name:'Activity',exact:true});
 const before=await page.evaluate(()=>window.atoll.simulation.section.entities.map(e=>e.id));await clickButton(page,{name:'Begin The Disappearing Artist',exact:true});
 await expect(page.locator('#reef-story')).toContainText('The Disappearing Artist');expect(await page.evaluate(()=>window.atoll.simulation.reefStories.active)).toBe('artist');expect(await page.evaluate(()=>window.atoll.simulation.section.entities.map(e=>e.id))).toEqual(before);
 return page.evaluate(async()=>{const {artistSites}=await import('/src/disappearing-artist.js');return artistSites(window.atoll.simulation);});
}
async function chooseSite(page,site){
 const origin=await page.evaluate(()=>({x:window.atoll.simulation.player.x,y:window.atoll.simulation.player.y}));await action(page,'site',site.id);
 await expect.poll(()=>page.evaluate(site=>Math.hypot(window.atoll.simulation.player.x-site.x,window.atoll.simulation.player.y-site.y),site),{timeout:30000}).toBeLessThan(9);
 const actual=await page.evaluate(()=>({x:window.atoll.simulation.player.x,y:window.atoll.simulation.player.y}));if(Math.hypot(origin.x-site.x,origin.y-site.y)>30)expect(Math.hypot(actual.x-origin.x,actual.y-origin.y)).toBeGreaterThan(20);
}
async function point(page,p){const b=await page.locator('#reef').boundingBox();await page.mouse.move(b.x+p.x/1600*b.width,b.y+(p.y+55)/900*b.height);}
async function passing(page,pattern){
 for(let attempt=0;attempt<3;attempt++){
  try{await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.reefStories.artist.phase),{timeout:8000}).toBe('passing');const state=await snapshot(page);expect(state.observer).not.toBeNull();expect(state.observer.diet).not.toContain('fish');return state;}
  catch(error){const failed=await snapshot(page);if(pattern&&failed.artist.phase==='pattern'&&failed.artist.outcome==='unavailable'&&attempt<2){(evidence.interruptions??=[]).push(failed);await action(page,'pattern',pattern);continue;}console.log('Artist failed pass',JSON.stringify(failed));evidence.failure=failed;await capture(page,'failed-pass');throw error;}
 }
}
async function finish(page,kind){
 await expect.poll(async()=>{const s=await snapshot(page);if(s.artist.phase==='pattern'&&s.artist.outcome==='unavailable'){(evidence.interruptions??=[]).push(s);await action(page,'pattern',kind);return 'retrying';}return s.artist.phase;},{timeout:65000}).toBe(kind==='mottled'?'complete':'overlooked');
}
async function capture(page,name){const path=`${artifacts}/artist-${name}.png`;await page.screenshot({path});evidence.renders.push(path);return path;}

// The primary evidence uses only visible controls and normal swimming; state is read,
// never rewritten to award a success, place the animal, or advance an observer.
test('spatial choice, live mismatch notice, quiet retry and movement reveal',async({page})=>{
 test.setTimeout(120000);const errors=[];page.on('pageerror',e=>errors.push(e.message));const sites=await begin(page),sand=sites.find(s=>s.kind==='sand');expect(new Set(sites.map(s=>s.kind)).size).toBe(3);
 // Choosing a skin outside a patch cannot substitute for swimming there.
 await action(page,'site',sand.id);await action(page,'pattern','shadow');expect((await snapshot(page)).artist.phase).toBe('pattern');await chooseSite(page,sand);await action(page,'pattern','shadow');const initial=await passing(page,'shadow');
 expect(initial.artist.match).toBeLessThan(.72);expect(initial.player.hidden).toBe(false);
 await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.reefStories.artist.pass?.seen||window.atoll.simulation.reefStories.artist.phase==='noticed'),{timeout:60000}).toBe(true);await capture(page,'mismatch-observer');
 await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.reefStories.artist.phase),{timeout:60000}).toBe('noticed');const noticed=await snapshot(page);expect(noticed.artist.successes).toEqual([]);expect(noticed.player.health).toBe(initial.player.health);expect(noticed.player.energy).toBe(initial.player.energy);await expect(page.locator('#story-detail')).toContainText('no penalty');
 await action(page,'retry');await action(page,'pattern','sand');await passing(page,'sand');await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.player.hidden)).toBe(true);const concealed=await snapshot(page);await point(page,{x:concealed.player.x+80,y:concealed.player.y});
 await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.reefStories.artist.outcome)).toBe('moved');expect((await snapshot(page)).player.hidden).toBe(false);expect((await snapshot(page)).artist.successes).toEqual([]);await capture(page,'movement-reveal');expect(errors).toEqual([]);
 evidence.tests.push({name:'spatial-mismatch-retry-movement',status:'passed',initial,noticed,revealed:await snapshot(page),errors});
});

test('three skins render distinctly and real observer departures complete the story; pause/save/resume keeps a live pass',async({page})=>{
 test.setTimeout(240000);const errors=[];page.on('pageerror',e=>errors.push(e.message));const sites=await begin(page),passes=[];
 for(const kind of ['sand','shadow','mottled']){
  const site=sites.find(s=>s.kind===kind);await chooseSite(page,site);await action(page,'pattern',kind);const initial=await passing(page,kind);expect(initial.artist.match).toBeGreaterThanOrEqual(.72);expect(initial.player.hidden).toBe(true);
  await page.waitForTimeout(700);const advanced=await snapshot(page);expect(Math.hypot(initial.observer.x-advanced.observer.x,initial.observer.y-advanced.observer.y)).toBeGreaterThan(8);expect(advanced.artist.successes.length).toBe(passes.length);expect(advanced.motionTime).toBeGreaterThan(initial.motionTime);await capture(page,`${kind}-passing`);
  if(kind==='shadow'){
   await page.keyboard.press('Escape');const held=await snapshot(page);await page.waitForTimeout(300);expect(await snapshot(page)).toEqual(held);await page.keyboard.press('Control+s');const saved=await page.evaluate(()=>JSON.parse(JSON.parse(localStorage.getItem('atoll-save-0')).state));expect(saved.reefStories.artist.phase).toBe('passing');expect(saved.reefStories.artist.successes).toEqual(['sand']);
   expect(saved.paused).toBe(true);
   await page.locator('[data-action="home"]').click();await clickButton(page,{name:'Saved dives',exact:true});await page.locator('[data-action="load-0"]').click();const restored=await snapshot(page);expect(restored.artist.pattern).toBe('shadow');expect(restored.artist.observer.id).toBe(held.artist.observer.id);expect(restored.artist.successes).toEqual(['sand']);expect(restored.paused).toBe(true);expect(Math.hypot(restored.player.x-held.player.x,restored.player.y-held.player.y)).toBeLessThan(1);
   await page.waitForTimeout(300);const frozen=await snapshot(page);expect(frozen.artist).toEqual(restored.artist);expect(frozen.player).toEqual(restored.player);expect(frozen.observer).toEqual(restored.observer);expect(frozen.time).toBe(restored.time);
   await clickButton(page,{name:'Resume',exact:true});const resumed=await snapshot(page);expect(resumed.paused).toBe(false);expect(resumed.artist.observer.id).toBe(held.artist.observer.id);expect(resumed.artist.successes).toEqual(['sand']);passes.push({kind,initial,advanced,pauseSaveResume:{held,restored,frozen,resumed}});
  }else passes.push({kind,initial,advanced});
  await finish(page,kind);expect((await snapshot(page)).artist.successes).toContain(kind);passes.at(-1).finished=await snapshot(page);if(kind==='sand'){await clickButton(page,{name:'Return to free exploration',exact:true});expect(await page.evaluate(()=>window.atoll.simulation.reefStories.active)).toBeNull();await clickButton(page,{name:'Continue The Disappearing Artist',exact:true});expect((await snapshot(page)).artist.successes).toEqual(['sand']);}
 }
 await expect(page.locator('#story-step')).toContainText('disappearing artist');await expect.poll(()=>page.evaluate(()=>window.atoll.journal.discoveries)).toContain('disappearing-artist');await capture(page,'complete');
 // Compare the three actual renderer pigments at one fixed pose and animation time.
 // World screenshots above independently prove the same skins in live gameplay.
 const skins=await page.evaluate(()=>{const r=window.atoll.renderer,s=window.atoll.simulation.player.species,images=[];for(const pattern of ['sand','shadow','mottled']){const c=document.createElement('canvas');c.width=360;c.height=220;const ctx=c.getContext('2d');r.drawSprite(ctx,s,180,110,240,1,0,1,.5,pattern,{instance:'player'});const p=ctx.getImageData(0,0,360,220).data;let count=0,sum=[0,0,0],hash=2166136261;for(let i=0;i<p.length;i+=4){if(p[i+3]){count++;for(let j=0;j<3;j++)sum[j]+=p[i+j];}for(let j=0;j<4;j++)hash=Math.imul(hash^p[i+j],16777619)>>>0;}images.push({pattern,count,mean:sum.map(v=>v/count),hash,url:c.toDataURL()});}return images;});
 expect(new Set(skins.map(s=>s.hash)).size).toBe(3);expect(new Set(skins.map(s=>s.count)).size).toBe(1);expect(skins.find(s=>s.pattern==='sand').mean.reduce((a,b)=>a+b)).toBeGreaterThan(skins.find(s=>s.pattern==='shadow').mean.reduce((a,b)=>a+b)+100);
 for(const skin of skins){const path=`${artifacts}/artist-skin-${skin.pattern}.png`;await writeFile(path,Buffer.from(skin.url.split(',')[1],'base64'));delete skin.url;evidence.renders.push(path);}
 await page.waitForTimeout(4300);for(const [width,height] of [[1600,900],[1024,768]]){await page.setViewportSize({width,height});const b=await page.locator('#reef-story').boundingBox();expect(b.x).toBeGreaterThanOrEqual(0);expect(b.x+b.width).toBeLessThanOrEqual(width);expect(b.y+b.height).toBeLessThanOrEqual(height);expect(await page.locator('#reef-story').evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true);await capture(page,`complete-${width}`);}
 expect(errors).toEqual([]);evidence.tests.push({name:'three-live-passes-render-save-resume',status:'passed',passes,skins,errors});
});





