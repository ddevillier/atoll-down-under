import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {clickButton} from '../../scripts/ui-actions.mjs';

const evidence=path.resolve('artifacts/species-adventures');
async function ready(page,quiet=false){
 if(quiet)await page.addInitScript(()=>localStorage.setItem('atoll-settings',JSON.stringify({sound:false,automaticNarration:false,reducedMotion:true,reducedFlash:true})));
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready,null,{timeout:30000});
}
async function begin(page,quiet=false){
 await ready(page,quiet);await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill('Flashlight fish');await page.locator('[role="option"][data-species="s53"]').click();
 const guided=page.locator('[data-action="guided-story"][data-story-key="lantern"]');
 if(await guided.count()&&await guided.isVisible())await guided.click();
 else{await page.locator('[data-action="begin-practice"]').click();await clickButton(page,{name:'Activity',exact:true});await clickButton(page,{name:/Begin .*Lantern Company/});}
 await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.reefStories?.active)).toBe('lantern');
 for(let leg=0;leg<4&&await page.evaluate(()=>window.atoll.simulation.current)!==8;leg++){
  const next=await page.evaluate(async()=>{const {routeBetween}=await import('/src/reef-map.js'),s=window.atoll.simulation,n=routeBetween(s.current,8)[0];return {...n,x:n.dx>0?1600:n.dx<0?0:s.player.x,y:n.dy>0?740:n.dy<0?0:s.player.y};});
  await point(page,next);await page.waitForFunction(reef=>window.atoll.simulation.current===reef,next.to,{timeout:40000});
 }
 await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.current)).toBe(8);
}
async function point(page,p){const b=await page.locator('#reef').boundingBox(),x=Math.max(1,Math.min(1599,p.x));await page.mouse.move(b.x+x/1600*b.width,b.y+(p.y+55)/900*b.height);}
async function snapshot(page){return page.evaluate(()=>{const s=window.atoll.simulation,q=s.reefStories.lantern;return {story:structuredClone(q),current:s.current,paused:s.paused,player:{x:s.player.x,y:s.player.y,angle:s.player.angle,energy:s.player.energy,health:s.player.health,abilityTime:s.player.abilityTime},actors:s.sections.flatMap((r,reef)=>r.entities.map(e=>({reef,id:e.id,incarnation:e.incarnation||0,species:e.species.id,x:e.x,y:e.y,angle:e.angle,energy:e.energy,health:e.health,satiated:e.satiated,alive:e.alive,target:e.target,feeding:e.feeding,activity:e.activity,behavior:e.behavior,hidden:e.hidden,stun:e.stun,actionTime:e.actionTime}))),discoveries:window.atoll.journal.discoveries};});}
async function freeze(page){if(!await page.evaluate(()=>window.atoll.simulation.paused))await page.keyboard.press('Escape');await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.paused)).toBe(true);}
async function resume(page){if(await page.evaluate(()=>window.atoll.simulation.paused))await page.keyboard.press('Escape');}
async function screenshot(page,name){await mkdir(evidence,{recursive:true});await page.screenshot({path:path.join(evidence,name)});}
async function beginRecording(page){await page.evaluate(()=>{const stream=document.querySelector('#reef').captureStream(20);window.__lanternVideo={chunks:[],stream};const recorder=new MediaRecorder(stream,{mimeType:'video/webm'});window.__lanternVideo.recorder=recorder;recorder.ondataavailable=e=>{if(e.data.size)window.__lanternVideo.chunks.push(e.data);};recorder.start();});}
async function endRecording(page,name){const base64=await page.evaluate(async()=>{const v=window.__lanternVideo;await new Promise(resolve=>{v.recorder.onstop=resolve;v.recorder.stop();});v.stream.getTracks().forEach(t=>t.stop());const blob=new Blob(v.chunks,{type:'video/webm'}),buffer=await blob.arrayBuffer();let text='';for(const n of new Uint8Array(buffer))text+=String.fromCharCode(n);delete window.__lanternVideo;return btoa(text);});await writeFile(path.join(evidence,name),Buffer.from(base64,'base64'));}
async function choose(page,route){await page.locator(`[data-story-action="lantern-${route}"]`).click();try{await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.reefStories.lantern.stage)).toBe('route');}catch(error){await mkdir(evidence,{recursive:true});await writeFile(path.join(evidence,`lantern-${route}-admission-failure.json`),JSON.stringify(await snapshot(page),null,2));await screenshot(page,`lantern-${route}-admission-failure.png`);throw error;}}
async function lead(page,route,callback){const points=[{x:610,y:360},{x:720,y:route==='upper'?190:530},{x:910,y:route==='upper'?190:530},{x:1010,y:360}];
 for(let i=0;i<points.length;i++){
  await point(page,points[i]);
  await page.waitForFunction(({p,gate})=>{const s=window.atoll.simulation,q=s.reefStories.lantern;return q.complete||q.stage==='route'&&Math.hypot(s.player.x-p.x,s.player.y-p.y)<15&&q.participants.some(m=>m.gate>=gate);},{p:points[i],gate:i+1},{timeout:40000});
  if(callback)await callback(i);
 }
 await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.reefStories.lantern.complete),{timeout:35000}).toBe(true);
}

for(const {width,height,route,quiet} of [{width:1600,height:900,route:'upper',quiet:false},{width:1024,height:768,route:'lower',quiet:true}])test(`Lantern Company real controls complete ${route} at ${width} with physical formation turns`,async({page})=>{
 test.setTimeout(210000);await page.setViewportSize({width,height});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await begin(page,quiet);await point(page,{x:610,y:360});await page.waitForFunction(()=>{const p=window.atoll.simulation.player;return Math.hypot(p.x-610,p.y-360)<25;},null,{timeout:30000});
 if(width===1600)await page.waitForTimeout(10000);const before=await snapshot(page);await choose(page,route);await point(page,before.player);await page.keyboard.press('e');await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.reefStories.lantern.organShown)).toBe(true);await page.keyboard.press('e');await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.reefStories.lantern.organShown)).toBe(false);await page.locator('[data-story-action="lantern-light"]').click();await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.reefStories.lantern.organShown)).toBe(true);
 const chosen=await snapshot(page);expect(chosen.story.participants.length).toBeGreaterThanOrEqual(2);expect(chosen.story.participants.length).toBeLessThanOrEqual(3);
 const identities=a=>a.map(e=>`${e.reef}:${e.id}:${e.incarnation}:${e.species}`).sort();expect(identities(chosen.actors)).toEqual(identities(before.actors));
 await screenshot(page,`lantern-route-${width}.png`);await beginRecording(page);
 await lead(page,route,async i=>{if(i===1){await screenshot(page,`lantern-turn-${width}.png`);await endRecording(page,`lantern-formation-${width}.webm`);}});
 await freeze(page);const finished=await snapshot(page);expect(finished.story.playerTravel).toBeGreaterThanOrEqual(450);expect(finished.story.playerGate).toBe(4);
 expect(finished.story.participants.some(m=>m.gate===4&&m.travel>=420&&m.response&&m.contact)).toBe(true);expect(identities(finished.actors)).toEqual(identities(before.actors));expect(finished.discoveries.filter(x=>x==='lantern-company')).toHaveLength(1);
 const bounds=await page.locator('#reef-story').evaluate(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,bottom:r.bottom,overflow:e.scrollWidth>e.clientWidth+1};});expect(bounds.overflow).toBe(false);expect(bounds.right).toBeLessThanOrEqual(width);expect(bounds.bottom).toBeLessThanOrEqual(height);
 await page.locator('#reef-story .activity-details > summary').click();await expect(page.locator('#story-detail')).toContainText('Anomalops katoptron');await screenshot(page,`lantern-complete-${width}.png`);
 await page.keyboard.press('Control+s');await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:'Saved dives',exact:true});await page.locator('[data-action="load-0"]').click();await expect(page.locator('#story-record')).toHaveText('Discovered');
 expect((await snapshot(page)).discoveries.filter(x=>x==='lantern-company')).toHaveLength(1);await page.locator('#reef-story .activity-details > summary').click();await page.locator('[data-action="story-stop"]').click();expect(await page.evaluate(()=>window.atoll.simulation.reefStories.active)).toBeNull();expect(errors).toEqual([]);
 await writeFile(path.join(evidence,`lantern-real-controls-${width}.json`),JSON.stringify({before,chosen,finished,errors,bounds},null,2));
});

test('Lantern pause, idle blink, Space, valid save and replaced identity are honest',async({page})=>{
 test.setTimeout(100000);await begin(page,true);await point(page,{x:610,y:360});await page.waitForFunction(()=>{const p=window.atoll.simulation.player;return Math.hypot(p.x-610,p.y-360)<25;},null,{timeout:30000});await choose(page,'upper');await point(page,await page.evaluate(()=>{const p=window.atoll.simulation.player;return {x:p.x,y:p.y};}));
 await page.keyboard.press('Space');await page.waitForTimeout(6500);let s=await snapshot(page);expect(s.story.organShown).toBe(false);expect(s.story.complete).toBe(false);expect(s.story.participants.some(m=>m.response)).toBe(false);
 await page.keyboard.press('e');await point(page,{x:720,y:190});await page.waitForFunction(()=>{const q=window.atoll.simulation.reefStories.lantern;return q.playerGate>=2&&q.participants.some(m=>m.gate>=2&&m.response);},null,{timeout:30000});await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.paused)).toBe(true);const frozen=await snapshot(page);expect(frozen.story.playerTravel).toBeGreaterThan(100);await page.keyboard.press('e');await page.waitForTimeout(250);expect((await snapshot(page)).story).toEqual(frozen.story);
 await page.keyboard.press('Control+s');const saved=await page.evaluate(()=>JSON.parse(JSON.parse(localStorage.getItem('atoll-save-0')).state).reefStories.lantern);await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:'Saved dives',exact:true});await page.locator('[data-action="load-0"]').click();await freeze(page);const loaded=(await snapshot(page)).story;expect(loaded.route).toBe(saved.route);expect(loaded.participants.map(m=>[m.id,m.incarnation,m.response])).toEqual(saved.participants.map(m=>[m.id,m.incarnation,m.response]));expect(loaded.playerTravel).toBeGreaterThanOrEqual(saved.playerTravel);expect(loaded.playerTravel-saved.playerTravel).toBeLessThan(12);expect(loaded.complete).toBe(false);
 await resume(page);await page.evaluate(()=>{const s=window.atoll.simulation,m=s.reefStories.lantern.participants[0],e=s.section.entities.find(e=>e.id===m.id);e.incarnation=(e.incarnation||0)+1;});await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.reefStories.lantern.stage)).toBe('gather');expect((await snapshot(page)).story.participants).toEqual([]);
});

test('gather phase survives blur and save and stops immediately through its visible control',async({page})=>{
 await begin(page,true);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await freeze(page);const gathered=await snapshot(page);expect(gathered.story.stage).toBe('gather');await page.waitForTimeout(200);expect(await snapshot(page)).toEqual(gathered);await page.keyboard.press('Control+s');await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:'Saved dives',exact:true});await page.locator('[data-action="load-0"]').click();await freeze(page);const loaded=await snapshot(page);expect(loaded.story.stage).toBe('gather');expect(loaded.story.participants).toEqual([]);expect(loaded.story.complete).toBe(false);
 await page.locator('[data-action="story-stop"]').click();expect(await page.evaluate(()=>window.atoll.simulation.reefStories.active)).toBeNull();await clickButton(page,{name:/Continue .*Lantern Company/});await expect(page.locator('#story-step')).toHaveText('Meet the living lights');await screenshot(page,'lantern-gather-reloaded.png');
});

test('Lantern population allocation, busy admission, LOS and offscreen lifecycle remain bounded',async({page})=>{
 await ready(page);const result=await page.evaluate(async()=>{
  const {Simulation}=await import('/src/simulation.js'),story=await import('/src/lantern-company.js'),{beginStory}=await import('/src/reef-stories.js');
  const reports=[];for(const seed of [1,2,9,11,26,28,33,73]){const s=new Simulation(seed);s.start('practice','s53',null,{adventureKey:'lantern'});const ids=()=>s.sections.flatMap((r,i)=>r.entities.map(e=>[i,e.id,e.incarnation||0,e.species.id]));const before=ids(),needs={energy:s.player.energy,health:s.player.health};beginStory(s,'lantern');const afterNeeds={energy:s.player.energy,health:s.player.health};for(let i=0;i<600;i++)s.step(1/60);story.storyAction(s,'lantern-upper');const fish=s.section.entities.filter(e=>e.species.id==='s53'&&e.alive);reports.push({seed,count:fish.length,unchanged:JSON.stringify(ids())===JSON.stringify(before),needs,afterNeeds,afterReading:s.reefStories.lantern.stage});}
  const s=new Simulation(1);s.start('practice','s53',null,{adventureKey:'lantern'});beginStory(s,'lantern');for(const e of s.section.entities.filter(e=>e.species.id==='s53')){e.actionTime=10;}
  story.storyAction(s,'lantern-upper');const busy=structuredClone(s.reefStories.lantern),recovery=[];
  for(const problem of ['missing','replaced','busy']){const dive=new Simulation(1);dive.start('practice','s53',null,{adventureKey:'lantern'});beginStory(dive,'lantern');story.storyAction(dive,'lantern-upper');const bound=dive.reefStories.lantern.participants[0],fish=dive.section.entities.find(e=>e.id===bound.id),count=dive.section.entities.length;if(problem==='missing')dive.section.entities=dive.section.entities.filter(e=>e!==fish);if(problem==='replaced')fish.incarnation=(fish.incarnation||0)+1;if(problem==='busy')fish.actionTime=5;dive.step(1/60);recovery.push({problem,count,after:dive.section.entities.length,story:structuredClone(dive.reefStories.lantern)});}
  return {reports,busy,recovery,blocked:story.lanternLineVisible({x:670,y:360},{x:925,y:360}),open:story.lanternLineVisible({x:720,y:190},{x:910,y:190})};
 });
 expect(result.reports.every(r=>r.count>=2&&r.unchanged&&JSON.stringify(r.needs)===JSON.stringify(r.afterNeeds)&&r.afterReading==='route')).toBe(true);expect(result.busy.stage).toBe('gather');expect(result.busy.participants).toEqual([]);expect(result.blocked).toBe(false);expect(result.open).toBe(true);for(const r of result.recovery){expect(r.story.stage).toBe('gather');expect(r.story.participants).toEqual([]);expect(r.story.complete).toBe(false);expect(r.after).toBe(r.count-(r.problem==='missing'?1:0));}
 await mkdir(evidence,{recursive:true});await writeFile(path.join(evidence,'lantern-admission-recovery.json'),JSON.stringify(result,null,2));
});

test('active Lantern bend permits physical reef exit, freezes offscreen and resumes same identities',async({page})=>{
 test.setTimeout(90000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await begin(page,true);await choose(page,'upper');await page.keyboard.press('e');await point(page,{x:720,y:190});await page.waitForFunction(()=>{const q=window.atoll.simulation.reefStories.lantern;return q.playerGate>=2&&q.participants.some(m=>m.gate>=2&&m.response);},null,{timeout:30000});const before=await snapshot(page);
 await page.keyboard.press('m');await page.locator('[data-action="map-select"][data-reef="7"]').click();await page.locator('[data-action="map-route"]').click();await point(page,{x:0,y:190});
 try{await page.waitForFunction(()=>window.atoll.simulation.current===7,null,{timeout:22000});}catch(error){await screenshot(page,'lantern-reef-exit-failure.png');await writeFile(path.join(evidence,'lantern-reef-exit-failure.json'),JSON.stringify(await snapshot(page),null,2));throw error;}
 const offscreen=await snapshot(page);await page.waitForTimeout(650);expect((await snapshot(page)).story).toEqual(offscreen.story);expect(offscreen.story.complete).toBe(false);
 await point(page,{x:1600,y:190});await page.waitForFunction(()=>window.atoll.simulation.current===8,null,{timeout:12000});await freeze(page);const returned=await snapshot(page);expect(returned.story.route).toBe(before.story.route);expect(returned.story.participants.map(m=>[m.id,m.incarnation])).toEqual(before.story.participants.map(m=>[m.id,m.incarnation]));expect(returned.story.playerGate).toBeGreaterThanOrEqual(before.story.playerGate);expect(returned.story.complete).toBe(false);
 await screenshot(page,'lantern-return-paused.png');await page.locator('[data-action="story-stop"]').click();expect(await page.evaluate(()=>window.atoll.simulation.reefStories.active)).toBeNull();expect(await page.evaluate(()=>window.atoll.simulation.player.lanternCaseStudy)).toBeUndefined();expect(errors).toEqual([]);await writeFile(path.join(evidence,'lantern-offscreen-recovery.json'),JSON.stringify({before,offscreen,returned,errors},null,2));
});

test('named case-study painting exposes the actual subocular organ locally and articulates separate fins',async({page})=>{
 await ready(page);await mkdir(evidence,{recursive:true});
 const result=await page.evaluate(async()=>{
  const art=await import('/src/lantern-company-render.js'),r=window.atoll.renderer;await art.loadLanternArt(r);
  const e={id:'player',species:{id:'s53'},alive:true,health:100,hidden:false,lanternCaseStudy:'Anomalops katoptron',lanternOrganShown:false,lanternLight:0};
  const sim={player:e,current:8,mode:'practice',reefStories:{active:'lantern',lantern:{stage:'route',route:'upper',playerGate:0,organShown:false,complete:false,participants:[]}}};
  const capture=t=>{const a=art.appearanceFor(r,sim,e,t),c=document.createElement('canvas');c.width=a.sprite.width;c.height=a.sprite.height;c.getContext('2d').drawImage(a.sprite,0,0);return c;};
  r.reducedMotion=false;r.reducedFlash=false;const hidden=capture(0);e.lanternOrganShown=true;e.lanternLight=1;const shown=capture(0),moving=capture(.2);r.reducedMotion=true;const stable=capture(2);
  const a=hidden.getContext('2d').getImageData(0,0,hidden.width,hidden.height).data,b=shown.getContext('2d').getImageData(0,0,shown.width,shown.height).data,d=moving.getContext('2d').getImageData(0,0,moving.width,moving.height).data;
  const organ=art.LANTERN_ORGAN,rw=hidden.width*organ.width*.5,rh=hidden.height*organ.height*.5,supportX=Math.hypot(rw*2.3*Math.cos(organ.angle),rh*2.5*Math.sin(organ.angle))+2,supportY=Math.hypot(rw*2.3*Math.sin(organ.angle),rh*2.5*Math.cos(organ.angle))+2;
  let changed=0,outside=0,finChanged=0,eyeChanged=0;for(let y=0;y<hidden.height;y++)for(let x=0;x<hidden.width;x++){const i=(y*hidden.width+x)*4,delta=[0,1,2,3].some(k=>a[i+k]!==b[i+k]);if(delta){changed++;if(Math.abs(x-hidden.width*organ.x)>supportX||Math.abs(y-hidden.height*organ.y)>supportY)outside++;if(x/hidden.width>.80&&x/hidden.width<.94&&y/hidden.height>.32&&y/hidden.height<.50)eyeChanged++;}if([0,1,2,3].some(k=>b[i+k]!==d[i+k]))finChanged++;}
  const gallery=document.createElement('canvas');gallery.width=hidden.width*2;gallery.height=hidden.height*2;const c=gallery.getContext('2d');for(const [i,frame]of [hidden,shown,moving,stable].entries())c.drawImage(frame,(i%2)*hidden.width,Math.floor(i/2)*hidden.height);
  const movie=document.createElement('canvas');movie.width=720;movie.height=360;const mc=movie.getContext('2d'),stream=movie.captureStream(20),chunks=[],recorder=new MediaRecorder(stream,{mimeType:'video/webm'});recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};recorder.start();r.reducedMotion=false;r.reducedFlash=false;
  const start=performance.now();await new Promise(resolve=>{const frame=now=>{const elapsed=(now-start)/1000;e.lanternOrganShown=elapsed<2.8;e.lanternLight=(1+Math.cos(elapsed*Math.PI/1.5))*.5;mc.clearRect(0,0,720,360);mc.fillStyle='#123641';mc.fillRect(0,0,720,360);const pose=art.appearanceFor(r,sim,e,elapsed);mc.drawImage(pose.sprite,0,24,720,311);if(elapsed<3)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});await new Promise(resolve=>{recorder.onstop=resolve;recorder.stop();});stream.getTracks().forEach(track=>track.stop());const videoBytes=new Uint8Array(await new Blob(chunks,{type:'video/webm'}).arrayBuffer());let binary='';for(const value of videoBytes)binary+=String.fromCharCode(value);
  return {changed,outside,finChanged,eyeChanged,width:hidden.width,height:hidden.height,gallery:gallery.toDataURL('image/png'),video:btoa(binary),asset:art.LANTERN_ASSET};
 });
 await writeFile(path.join(evidence,'lantern-organ-art-proof.png'),Buffer.from(result.gallery.split(',')[1],'base64'));await writeFile(path.join(evidence,'lantern-local-organ.webm'),Buffer.from(result.video,'base64'));delete result.gallery;delete result.video;await writeFile(path.join(evidence,'lantern-organ-art-proof.json'),JSON.stringify(result,null,2));
 expect(result.asset).toContain('anomalops-katoptron');expect(result.changed).toBeGreaterThan(30);expect(result.changed/(result.width*result.height)).toBeLessThan(.025);expect(result.outside).toBe(0);expect(result.eyeChanged).toBe(0);expect(result.finChanged).toBeGreaterThan(200);
});
