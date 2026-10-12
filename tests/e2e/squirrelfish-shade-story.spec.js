import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {clickButton} from '../../scripts/ui-actions.mjs';

// Generated population and ordinary UI input throughout the successful dives.
// Failure cases mark existing fish busy/missing; they never spawn or position fish.
const out='artifacts/species-adventures';
const action=(page,id,value)=>page.locator(`[data-action="story-action"][data-story-action="${id}"]${value===undefined?'':`[data-value="${value}"]`}`);
test.use({video:'on'});
test.afterEach(async({page},testInfo)=>{if(testInfo.status!=='passed'){await testInfo.attach('shade-failure-state',{body:JSON.stringify(await facts(page).catch(()=>null)),contentType:'application/json'});return;}const video=page.video(),label=testInfo.title.includes('at 1600')?'1600':testInfo.title.includes('at 1024')?'1024':testInfo.title.includes('generated nearby')?'real-predator':'missing-busy';await page.close();await video.saveAs(resolve(out,`shade-${label}-motion.webm`));});
async function facts(page){return page.evaluate(async()=>{
 const s=window.atoll.simulation,{shadeSite,shadeNeighbor,shadeScene}=await import('/src/squirrelfish-shade.js'),{edible}=await import('/src/diet.js'),e=shadeNeighbor(s);
 return {reef:s.current,paused:s.paused,pointer:{...s.pointer},story:structuredClone(s.reefStories.shade),site:shadeSite(s),scene:shadeScene(s)?{available:shadeScene(s).available}:null,
 player:{x:s.player.x,y:s.player.y,vx:s.player.vx,vy:s.player.vy,energy:s.player.energy,health:s.player.health,ability:s.player.abilityTime},
 neighbor:e?{id:e.id,incarnation:e.incarnation||0,species:e.species.id,x:e.x,y:e.y,angle:e.angle,health:e.health,injury:e.biteDamage||0,poison:e.poisonDamage||0,behavior:e.behavior,hidden:e.hidden,target:e.target,feeding:e.feeding}:null,
 safety:s.storySafety,predators:s.section.entities.filter(p=>p.alive&&e&&edible(p,e)).map(p=>({id:p.id,species:p.species.id,x:p.x,y:p.y,health:p.health,target:p.target,behavior:p.behavior,satiated:p.satiated})),
 journal:window.atoll.journal.discoveries,roster:s.sections.map(r=>r.entities.map(e=>({id:e.id,incarnation:e.incarnation||0,species:e.species.id})))};
});}
async function move(page,p,click=false){const box=await page.locator('#reef').boundingBox();const x=box.x+p.x/1600*box.width,y=box.y+(p.y+55)/900*box.height;await page.mouse.move(x,y);if(click)await page.mouse.click(x,y);}
async function swimRoute(page,destination){
 for(let leg=0;leg<6;leg++){
  const route=await page.evaluate(async destination=>{const s=window.atoll.simulation,{routeBetween}=await import('/src/reef-map.js'),leg=routeBetween(s.current,destination)[0];return leg?{to:leg.to,x:leg.dx>0?1599:leg.dx<0?1:s.player.x,y:leg.dy>0?738:leg.dy<0?25:s.player.y}:null;},destination);
  if(!route)return;await move(page,route);await page.waitForFunction(to=>window.atoll.simulation.current===to,route.to,{timeout:60000});
 }
 expect((await facts(page)).reef).toBe(destination);
}
async function ready(page,width,height,{muted=true,reduced=true,seed=42}={}){
 await page.addInitScript(seed=>{Date.now=()=>seed;},seed);await page.setViewportSize({width,height});await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill('Squirrelfish');await page.locator('[role="option"][data-species="s12"]').click();
 // Capture generation and real courtesy as they happen. Settings and rendering
 // readiness can take long enough for an autonomous hunter to leave the ledge.
 await page.evaluate(async()=>{
  const {shadeSite,shadeNeighbor}=await import('/src/squirrelfish-shade.js'),{edible}=await import('/src/diet.js');
  window.shadeEncounterObservation={initial:null,courtesy:[]};
  const observe=()=>{const s=window.atoll?.simulation,n=s&&shadeNeighbor(s),site=s&&shadeSite(s);if(!n||!site)return;const o=window.shadeEncounterObservation,predators=s.section.entities.filter(e=>e.alive&&edible(e,n));
   if(!o.initial)o.initial={site,predators:predators.map(e=>({id:e.id,species:e.species.id,x:e.x,y:e.y}))};
   for(const e of predators)if(e.behavior==='Swimming around the occupied adventure'&&!o.courtesy.includes(e.id))o.courtesy.push(e.id);
  };
  window.addEventListener('click',observe);window.shadeObservationTimer=setInterval(observe,50);
 });
 await page.locator('[data-action="guided-story"][data-story-key="shade"]').click();
 await page.locator('[data-action="settings"]').click();if(muted)await page.locator('[data-setting="sound"]').uncheck();await page.locator('[data-setting="reducedMotion"]').setChecked(reduced);await page.locator('[data-setting="automaticNarration"]').uncheck();await page.getByRole('button',{name:'Done',exact:true}).click();
 await page.waitForFunction(()=>window.atoll.simulation.reefStories?.shade);expect((await facts(page)).reef).toBe(8);
 await page.evaluate(()=>{const audio=window.atoll.audio,original=audio.playShadePulse;window.shadeAudioSamples=[];audio.playShadePulse=async function(options){const played=await original.call(this,options);window.shadeAudioSamples.push({...options,played,enabled:this.enabled,quietGain:.07*this.effectsVolume*options.gain,context:this.shadeContext?.state});return played;};});return (await facts(page)).roster;
}
async function pause(page){if(!(await facts(page)).paused)await page.keyboard.press('Escape');expect((await facts(page)).paused).toBe(true);}
async function resume(page){if((await facts(page)).paused)await page.keyboard.press('Escape');expect((await facts(page)).paused).toBe(false);}
async function saveLoad(page,label,width){
 await pause(page);const before=await facts(page);await page.keyboard.press('Control+s');
 const saved=await page.evaluate(()=>JSON.parse(JSON.parse(localStorage.getItem('atoll-save-0')).state));expect(saved.reefStories.shade).toEqual(before.story);
 await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:'Saved dives',exact:true});await page.locator('[data-action="load-0"]').click();await pause(page);
 const after=await facts(page);expect(after.story).toMatchObject({neighbor:before.story.neighbor,observed:before.story.observed,choice:before.story.choice,complete:before.story.complete});
 expect(after.roster).toEqual(before.roster);expect(after.journal.filter(id=>id==='squirrelfish-shade').length).toBe(before.journal.filter(id=>id==='squirrelfish-shade').length);
 await page.screenshot({path:`${out}/shade-${width}-${label}-saved.png`});await resume(page);
}
async function frozen(page){await pause(page);const before=await facts(page);await page.waitForTimeout(300);expect(await facts(page)).toEqual(before);expect(await page.evaluate(()=>window.atoll.audio.shadePulses.size)).toBe(0);await resume(page);}
// Headless browser tabs do not emit OS window blur on bringToFront. Deliver the
// native lifecycle event to the application's listener; no simulation writes.
async function blurred(page){await page.evaluate(()=>window.dispatchEvent(new Event('blur')));expect((await facts(page)).paused).toBe(true);const before=await facts(page);await page.waitForTimeout(200);expect(await facts(page)).toEqual(before);await resume(page);}
async function paintedOcclusion(page){return page.evaluate(async()=>{
 const s=window.atoll.simulation,r=window.atoll.renderer,{shadeScene}=await import('/src/squirrelfish-shade.js'),{ledgeAlpha}=await import('/src/squirrelfish-shade-render.js'),{creaturePickFrame}=await import('/src/geometry.js'),scene=shadeScene(s),f=creaturePickFrame(scene.neighbor),source=r.reefs[scene.reef];
 const image=document.createElement('canvas');image.width=1600;image.height=900;const c=image.getContext('2d',{willReadFrequently:true});c.drawImage(source,0,0,1600,900);const pixels=c.getImageData(0,0,1600,900).data;
 const patch={x:Math.max(0,Math.round(scene.home.x-100)),y:Math.max(0,Math.round(scene.home.y+4)),width:180,height:85};let foreground=0,open=0,bodyOverlap=0;
 for(let y=Math.floor(f.y);y<f.y+f.height*.4;y++)for(let x=Math.floor(f.x-f.width*.35);x<f.x+f.width*.35;x++){if(x<patch.x||x>=patch.x+patch.width||y<patch.y||y>=patch.y+patch.height)continue;const i=((y+55)*1600+x)*4,a=ledgeAlpha(pixels[i],pixels[i+1],pixels[i+2]);bodyOverlap++;if(a>128)foreground++;if(a<64)open++;}
 return {neighbor:scene.neighbor.id,frame:f,patch,bodyOverlap,foreground,open,headAbovePatch:f.y-f.height*.25<patch.y};
});}
async function stopped(page){const before=await facts(page);await page.locator('#reef-story .activity-details > summary').click();await page.locator('[data-action="story-stop"]').click();
 expect(await page.evaluate(()=>window.atoll.simulation.reefStories.active)).toBeNull();await page.waitForTimeout(300);
 const after=await facts(page);expect(after.story.observed).toBe(before.story.observed);expect(after.story.choice).toBe(before.story.choice);expect(after.story.complete).toBe(before.story.complete);
 await page.locator('.story-invitation > summary').click();await page.locator('[data-action="story-begin"]').click();expect(await page.evaluate(()=>window.atoll.simulation.reefStories.active)).toBe('shade');
}
async function inspectReal(page){
 const site=(await facts(page)).site;await action(page,'shade-inspect').click();await move(page,site.inspect);
 await page.waitForFunction(()=>{const s=window.atoll.simulation,n=s.reefStories.shade;return n.crowded&&n.reacted;},null,{timeout:45000});
 await page.keyboard.press('e');await page.waitForFunction(()=>window.atoll.simulation.reefStories.shade.observed);
}

for(const [width,height,choice,muted] of [[1600,900,'alcove',true],[1024,768,'space',false]])test(`shade uses real posture and separation at ${width}`,async({page,context},testInfo)=>{
 test.setTimeout(360000);await mkdir(out,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));const roster=await ready(page,width,height,{muted,reduced:true});
 const admission=await facts(page);expect(admission.roster).toEqual(roster);expect(admission.neighbor?.species).toBe('s12');expect(admission.story.complete).toBe(false);
 const ring={x:Math.min(1550,admission.site.x+245),y:Math.min(680,admission.site.y+110)};await move(page,ring);await expect.poll(async()=>{const f=await facts(page);return Math.hypot(f.player.x-ring.x,f.player.y-ring.y)<20&&!!f.neighbor&&Math.hypot(f.neighbor.x-f.site.home.x,f.neighbor.y-f.site.home.y)<4;},{timeout:45000}).toBe(true);
 await page.waitForFunction(()=>window.shadeAudioSamples.length>0,null,{timeout:6000});const sound=await page.evaluate(()=>window.shadeAudioSamples);expect(sound.every(p=>p.pan>=-1&&p.pan<=1&&p.quietGain<=.12)).toBe(true);expect(sound.some(p=>p.played)).toBe(!muted);if(!muted)expect(sound.some(p=>p.context==='running'&&p.pan<0)).toBe(true);
 await pause(page);const occlusion=await paintedOcclusion(page);await writeFile(`${out}/shade-${width}-occlusion.json`,JSON.stringify({occlusion,state:await facts(page)},null,2));await page.screenshot({path:`${out}/shade-${width}-hidden-neighbor.png`});expect(occlusion.bodyOverlap).toBeGreaterThan(0);expect(occlusion.foreground,'actual painted foreground intersects the lower live fish').toBeGreaterThan(0);expect(occlusion.headAbovePatch,'head stays visible above the ledge matte').toBe(true);await resume(page);
 // A remote inspect can guide the approach but cannot award observation.
 const far=admission.site;await move(page,{x:far.inspect.x,y:far.inspect.y},true);expect((await facts(page)).story.observed).toBe(false);expect((await facts(page)).journal).not.toContain('squirrelfish-shade');
 await frozen(page);await blurred(page,context);await saveLoad(page,'listen',width);await stopped(page);
 const initial=await facts(page);await move(page,initial.site.inspect);
 const frames=[];for(let i=0;i<14;i++){await page.waitForTimeout(250);frames.push(await facts(page));if(frames.at(-1).story.reacted)break;}
 await inspectReal(page);const observed=await facts(page);expect(observed.story.crowded).toBe(true);expect(observed.story.reacted).toBe(true);expect(Math.hypot(observed.neighbor.x-observed.story.crowdAt.x,observed.neighbor.y-observed.story.crowdAt.y)).toBeGreaterThanOrEqual(18);
 expect(observed.story.neighbor).toEqual(admission.story.neighbor);expect(observed.player.ability).toBe(0);await page.screenshot({path:`${out}/shade-${width}-crowd-response.png`});
 await frozen(page);await blurred(page,context);await saveLoad(page,'observed',width);await stopped(page);
 // Offscreen progression is suspended, reached with real movement over map edges.
 const origin=(await facts(page)).reef,destination=origin===8?7:8,beforeAway=(await facts(page)).story;await swimRoute(page,destination);const offscreen=(await facts(page)).story;await page.waitForTimeout(350);expect((await facts(page)).story).toEqual(offscreen);expect(offscreen.observed).toBe(beforeAway.observed);expect(offscreen.complete).toBe(false);await swimRoute(page,origin);
 // A real neighbor may have been replaced during free travel. Observe that
 // individual's physical response rather than reuse another fish's progress.
 if(!(await facts(page)).story.reacted)await inspectReal(page);
 await action(page,'shade-choose',choice).click();await move(page,(await facts(page)).site[choice]);
 await page.waitForFunction(()=>window.atoll.simulation.reefStories.shade.stage==='settle'&&window.atoll.simulation.reefStories.shade.settled>=1,null,{timeout:45000});
 const settled=await facts(page);expect(settled.story.complete).toBe(false);expect(settled.story.response).toBe('settled');expect(Math.abs(settled.neighbor.x-(settled.site.home.x+(choice==='alcove'?-32:32))),'choice changes the real neighbor resting route').toBeLessThanOrEqual(4);expect(Math.hypot(settled.player.x-settled.neighbor.x,settled.player.y-settled.neighbor.y)).toBeGreaterThanOrEqual(150);
 expect(settled.story.reacted).toBe(true);expect(Math.hypot(settled.player.x-settled.story.selected.x,settled.player.y-settled.story.selected.y),'player actually rests at the chosen opening').toBeLessThan(45);expect(Math.hypot(settled.player.vx,settled.player.vy),'player is quiet while settling').toBeLessThan(16);
 await page.screenshot({path:`${out}/shade-${width}-separate-positions.png`});await frozen(page);await blurred(page,context);await saveLoad(page,'settled',width);await stopped(page);
 await move(page,(await facts(page)).site[choice]);await page.waitForFunction(()=>window.atoll.simulation.reefStories.shade.settled>=1);await page.keyboard.press('e');
 await expect.poll(async()=>(await facts(page)).journal.includes('squirrelfish-shade')).toBe(true);expect((await facts(page)).story.complete).toBe(true);
 await frozen(page);await blurred(page,context);await saveLoad(page,'complete',width);await page.keyboard.press('e');await page.keyboard.press('e');expect((await facts(page)).journal.filter(id=>id==='squirrelfish-shade')).toHaveLength(1);await stopped(page);expect((await facts(page)).journal.filter(id=>id==='squirrelfish-shade')).toHaveLength(1);
 const final=await facts(page);
 // Ordinary ecology continues during this entire dive: unrelated animals can
 // die and return in their original population slots. Actual paused save/load
 // checks above require exact incarnations; this journey checks the same slots.
 const slots=reefs=>reefs.map(reef=>reef.map(({id,species})=>({id,species})));
 expect(slots(final.roster)).toEqual(slots(roster));
 for(const [reefIndex,reef] of final.roster.entries())for(const [slot,e] of reef.entries())expect(e.incarnation).toBeGreaterThanOrEqual(roster[reefIndex][slot].incarnation);
 expect(final.story.neighbor).toEqual(settled.story.neighbor);expect(final.neighbor).toMatchObject(settled.story.neighbor);
 const bounds=await page.locator('#reef-story').evaluate(e=>({overflow:e.scrollWidth>e.clientWidth+1,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right,bottom:e.getBoundingClientRect().bottom}));expect(bounds.overflow).toBe(false);expect(bounds.left).toBeGreaterThanOrEqual(0);expect(bounds.right).toBeLessThanOrEqual(width);expect(bounds.bottom).toBeLessThanOrEqual(height);
 await page.screenshot({path:`${out}/shade-${width}-complete.png`});await writeFile(`${out}/shade-${width}-evidence.json`,JSON.stringify({type:'automated-real-ui',seed:42,viewport:{width,height},choice,muted,reducedMotion:true,blurVerification:'Native DOM blur dispatched to application listener; headless tabs do not emit OS blur',admission,frames,sound,occlusion,observed,settled,final,video:resolve(out,`shade-${width}-motion.webm`)},null,2));expect(errors).toEqual([]);
});

test('missing and busy real squirrelfish cannot remotely award and retry preserves identity rules',async({page})=>{
 test.setTimeout(180000);await mkdir(out,{recursive:true});await ready(page,1024,768);await pause(page);const before=await facts(page);
 // Bounded invalidation fixtures against existing identities only.
 await page.evaluate(()=>{const s=window.atoll.simulation;window.shadeBusy=s.sections.flatMap(r=>r.entities).filter(e=>e.species.id==='s12').map(e=>({e,stun:e.stun}));for(const {e} of window.shadeBusy)e.stun=99;});await resume(page);await page.keyboard.press('e');expect((await facts(page)).story.observed).toBe(false);expect((await facts(page)).story.complete).toBe(false);await expect(action(page,'shade-retry')).toBeVisible();await action(page,'shade-retry').click();expect((await facts(page)).story.neighbor).toEqual(before.story.neighbor);
 await pause(page);await page.evaluate(()=>{for(const {e,stun} of window.shadeBusy)e.stun=stun;const s=window.atoll.simulation,n=s.reefStories.shade.neighbor;window.shadeMissing=s.section.entities.find(e=>e.id===n.id);window.shadeMissing.alive=false;});await resume(page);await page.waitForTimeout(250);expect((await facts(page)).story.complete).toBe(false);expect((await facts(page)).journal).not.toContain('squirrelfish-shade');
 const missing=await facts(page);if(missing.story.neighbor)expect(missing.story.neighbor).not.toEqual(before.story.neighbor);
 await pause(page);await page.evaluate(()=>{window.shadeMissing.alive=true;window.shadeMissing.incarnation=(window.shadeMissing.incarnation||0)+1;});await resume(page);
 await page.waitForFunction(()=>!!window.atoll.simulation.reefStories.shade.neighbor,null,{timeout:5000});const recovered=await facts(page);if(recovered.story.neighbor?.id===before.story.neighbor.id)expect(recovered.story.neighbor.incarnation).not.toBe(before.story.neighbor.incarnation);
 expect(recovered.story.complete).toBe(false);expect(recovered.journal).not.toContain('squirrelfish-shade');await writeFile(`${out}/shade-missing-busy-evidence.json`,JSON.stringify({before,missing,recovered},null,2));
});

test('a generated nearby predator keeps its presence while the local encounter stays peaceful',async({page})=>{
 test.setTimeout(90000);await mkdir(out,{recursive:true});const roster=await ready(page,1600,900,{seed:4});const before=await facts(page);
 const generated=await page.evaluate(()=>window.shadeEncounterObservation.initial),hunter=generated.predators.find(e=>Math.hypot(e.x-generated.site.x,e.y-generated.site.y)<320);expect(hunter,'seed4 starts with a real electric ray near the ledge').toBeTruthy();expect(hunter.species).toBe('s37');
 await page.waitForFunction(id=>window.shadeEncounterObservation.courtesy.includes(id),hunter.id,{timeout:10000});
 await inspectReal(page);const crowded=await facts(page);expect(crowded.player.health).toBe(before.player.health);expect(crowded.neighbor.injury).toBe(before.neighbor.injury);expect(crowded.neighbor.poison).toBe(before.neighbor.poison);expect(crowded.roster).toEqual(roster);expect(crowded.safety.radius).toBe(300);
 await action(page,'shade-choose','space').click();await move(page,crowded.site.space);await page.waitForFunction(()=>window.atoll.simulation.reefStories.shade.settled>=1,null,{timeout:30000});await page.keyboard.press('e');await expect.poll(async()=>(await facts(page)).story.complete).toBe(true);
 const complete=await facts(page);expect(complete.neighbor.injury).toBe(before.neighbor.injury);expect(complete.neighbor.poison).toBe(before.neighbor.poison);expect(complete.predators.some(e=>e.id===hunter.id)).toBe(true);expect(Math.hypot(complete.predators.find(e=>e.id===hunter.id).x-hunter.x,complete.predators.find(e=>e.id===hunter.id).y-hunter.y)).toBeGreaterThan(10);
 await page.locator('[data-action="story-stop"]').click();expect(await page.evaluate(()=>window.atoll.simulation.storySafety)).toBeNull();expect(await page.evaluate(()=>window.atoll.simulation.player.hurtGrace)).toBeGreaterThan(0);
 await page.waitForFunction(id=>window.atoll.simulation.section.entities.find(e=>e.id===id)?.behavior!=='Swimming around the occupied adventure',hunter.id,{timeout:12000});const released=await facts(page);expect(released.roster).toEqual(roster);expect(released.story.complete).toBe(true);
 await page.screenshot({path:`${out}/shade-real-predator-release.png`});await writeFile(`${out}/shade-real-predator-evidence.json`,JSON.stringify({seed:4,generated,courtesy:await page.evaluate(()=>window.shadeEncounterObservation.courtesy),before,crowded,complete,released,video:resolve(out,'shade-real-predator-motion.webm')},null,2));
});
