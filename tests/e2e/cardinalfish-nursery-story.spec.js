import {test,expect} from '@playwright/test';
import {clickButton} from '../../scripts/ui-actions.mjs';

async function ready(page){await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);}

// These deterministic browser fixtures use the production story dispatcher,
// Simulation.step and .atoll importer. Habitat neighbors are controlled so the
// tests can distinguish quiet care from elapsed wall time without random AI.
test('nursery care requires settled cover, survives interruption and round-trips every stage',async({page})=>{
 await ready(page);
 const evidence=await page.evaluate(async()=>{
  const {Simulation}=await import('/src/simulation.js'),{REEFS}=await import('/src/data.js');
  const {beginStory,storyAction,tickStories}=await import('/src/reef-stories.js');
  const {nurseryOptions}=await import('/src/cardinalfish-nursery.js');
  const {exportDive,importDive}=await import('/src/save-files.js');
  const s=new Simulation(73013);s.start('practice','s13');s.current=6;s.section.entities=[];s.section.food=[];
  const covers=REEFS[6].shelters,place=p=>{Object.assign(s.player,{x:p.x,y:p.y,vx:0,vy:0,target:null,feeding:null,cleanerTarget:null,cleanTime:0,stun:0});s.pointer={x:p.x,y:p.y};};
  place(covers[0]);beginStory(s);
  const snapshots=[],snapshot=()=>{const n=s.reefStories.nursery,restored=importDive(exportDive(s,'Nursery checkpoint')).simulation;snapshots.push({stage:n.stage,before:JSON.stringify(n),after:JSON.stringify(restored.reefStories.nursery)});};
  const advance=seconds=>{for(let i=0;i<Math.ceil(seconds*60);i++)tickStories(s,1/60);};
  snapshot();
  // Three real swimming reef fish make one cover busy, while the other remains quiet.
  s.section.entities=Array.from({length:3},(_,i)=>({id:'traffic-'+i,species:s.player.species,alive:true,x:covers[0].x+i*3,y:covers[0].y,vx:20,vy:0}));
  const options=nurseryOptions(s);storyAction(s,'nursery-choose',0);const refused=s.reefStories.nursery.stage;
  s.section.entities=[];storyAction(s,'nursery-choose',0);snapshot();storyAction(s,'nursery-settle');snapshot();
  s.pointer={x:s.player.x+80,y:s.player.y};advance(40);const movingProgress=s.reefStories.nursery.progress;
  place(covers[0]);advance(5);const cared=s.reefStories.nursery.progress;
  place({x:covers[0].x-240,y:covers[0].y});advance(30);const outsideProgress=s.reefStories.nursery.progress;snapshot();
  place(covers[0]);s.paused=true;advance(40);const pausedProgress=s.reefStories.nursery.progress;s.paused=false;
  // Use the actual simulation integration for the remaining brood, with the
  // father's pointer at his real center and all ordinary physiology active.
  for(let i=0;i<1900&&s.reefStories.nursery.stage==='brooding';i++)s.step(1/60);
  const released=s.reefStories.nursery.stage;snapshot();const earlyCheck=storyAction(s,'nursery-check'),earlyStage=s.reefStories.nursery.stage;
  advance(10);storyAction(s,'nursery-check');snapshot();
  return {options,refused,movingProgress,cared,outsideProgress,pausedProgress,released,earlyCheck,earlyStage,final:s.reefStories.nursery.stage,snapshots};
 });
 expect(evidence.options[0].safe).toBe(false);expect(evidence.options[0].traffic).toBe(3);expect(evidence.options[1].safe).toBe(true);
 expect(evidence.refused).toBe('choose');expect(evidence.movingProgress).toBe(0);expect(evidence.cared).toBeGreaterThan(1);
 expect(evidence.outsideProgress).toBe(evidence.cared);expect(evidence.pausedProgress).toBe(evidence.cared);expect(evidence.released).toBe('released');
 expect(evidence.earlyStage).toBe('released');expect(evidence.final).toBe('complete');
 expect(new Set(evidence.snapshots.map(s=>s.stage))).toEqual(new Set(['choose','ready','brooding','released','complete']));
 for(const checkpoint of evidence.snapshots)expect(checkpoint.after,checkpoint.stage+' exported save').toBe(checkpoint.before);
});

test('four distinct young seek their own cover and repeat visits cannot inflate the adult roster',async({page})=>{
 await ready(page);
 const evidence=await page.evaluate(async()=>{
  const {Simulation}=await import('/src/simulation.js'),{REEFS,SPECIES,PRACTICE_SPECIES}=await import('/src/data.js');
  const {beginStory,storyAction,tickStories,stopStory}=await import('/src/reef-stories.js');
  const s=new Simulation(73014);s.start('practice','s13');s.current=6;
  // Keep every generated resident and food entry; move residents away from
  // the candidate shelters without changing population or roster identity.
  const original=s.sections.map(section=>({entities:section.entities.map(e=>e.id),foods:section.food.map(f=>f.id)}));
  for(const e of s.section.entities){e.x=100;e.y=100;e.vx=0;e.vy=0;e.target=null;}
  const cover=REEFS[6].shelters[0];Object.assign(s.player,{x:cover.x,y:cover.y,vx:0,vy:0});s.pointer={x:cover.x,y:cover.y};beginStory(s);storyAction(s,'nursery-choose',0);storyAction(s,'nursery-settle');
  const advance=seconds=>{for(let i=0;i<Math.ceil(seconds*60);i++)tickStories(s,1/60);};advance(28);
  const born=structuredClone(s.reefStories.nursery.juveniles);s.player.x=cover.x-300;s.pointer={x:s.player.x,y:s.player.y};advance(12);
  const sheltered=structuredClone(s.reefStories.nursery.juveniles);storyAction(s,'nursery-check');const distantStage=s.reefStories.nursery.stage;
  s.player.x=cover.x;s.player.y=cover.y;storyAction(s,'nursery-check');
  for(let i=0;i<5;i++){stopStory(s);beginStory(s);storyAction(s,'nursery-settle');storyAction(s,'nursery-check');advance(5);}
  return {born,sheltered,distantStage,stage:s.reefStories.nursery.stage,juveniles:s.reefStories.nursery.juveniles,cover,populationUnchanged:JSON.stringify(original)===JSON.stringify(s.sections.map(section=>({entities:section.entities.map(e=>e.id),foods:section.food.map(f=>f.id)}))),species:SPECIES.length,playable:PRACTICE_SPECIES.length,discoveries:s.events.filter(e=>e.type==='discovery'&&e.value==='cardinalfish-nursery').length};
 });
 expect(evidence.born).toHaveLength(4);expect(new Set(evidence.born.map(j=>j.id)).size).toBe(4);expect(new Set(evidence.born.map(j=>j.phase)).size).toBe(4);
 for(const young of evidence.sheltered){expect(Math.hypot(young.x-evidence.cover.x,young.y-evidence.cover.y)).toBeLessThan(evidence.cover.r);expect(young.age).toBeGreaterThan(6);}
 expect(evidence.distantStage).toBe('released');expect(evidence.stage).toBe('complete');expect(evidence.juveniles).toHaveLength(4);expect(evidence.populationUnchanged).toBe(true);
 expect(evidence.species).toBe(64);expect(evidence.playable).toBe(57);expect(evidence.discoveries).toBe(1);
});

for(const [width,height]of [[1600,900],[1024,768]])test(`Dad's Big Mouth is reachable, visible and rewarding through real controls at ${width}`,async({page})=>{
 test.setTimeout(70000);await page.setViewportSize({width,height});const savedPaused=width===1024,errors=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);
 await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill('Banggai cardinalfish');await page.locator('[role="option"][data-species="s13"]').click();await page.locator('[data-action="begin-practice"]').click();
 // Existing exploration begins with its optional goal folded away. The story
 // entry must be reachable through the same Activity disclosure.
 await page.locator('[data-action="adventure-toggle"]').click();
 await page.locator('.story-invitation > summary').click();await expect(page.locator('[data-action="story-begin"]')).toBeVisible();await page.locator('[data-action="story-begin"]').click();
 await expect(page.locator('#reef-story')).toContainText('Dad’s Big Mouth');await expect(page.locator('#story-step')).toContainText('Visit Seagrass Meadow');
 // Controlled local habitat entry keeps UI actions real while avoiding a
 // random journey to a distant map edge in this focused nursery test.
 await page.evaluate(async()=>{const {REEFS}=await import('/src/data.js'),s=window.atoll.simulation,c=REEFS[6].shelters[0];s.current=6;s.destination=null;s.section.entities=[];s.section.food=[];Object.assign(s.player,{x:c.x,y:c.y,vx:0,vy:0});s.pointer={x:c.x,y:c.y};});
 await expect(page.locator('[data-story-action="nursery-choose"]')).toHaveCount(2);await page.locator('[data-story-action="nursery-choose"][data-value="0"]').click();await page.locator('[data-story-action="nursery-settle"]').click();
 await expect(page.locator('#story-step')).toContainText('Mouthbrooding');
 const brood=await page.evaluate(()=>{const s=window.atoll.simulation;for(let i=0;i<360;i++)s.step(1/60);return {stage:s.reefStories.nursery.stage,progress:s.reefStories.nursery.progress,pose:s.player.broodPose};});expect(brood.stage).toBe('brooding');expect(brood.progress).toBeGreaterThan(2);expect(brood.pose).toBeGreaterThan(.65);
  const visual=await page.evaluate(async()=>{
  const {deformPoint}=await import('/src/articulated-motion.js'),{animalProfile}=await import('/src/animal-profiles.js'),{ANIMAL_RIGS}=await import('/src/animal-rigs.js');
  const r=window.atoll.renderer,s=window.atoll.simulation,p=animalProfile(s.player.species),eye=ANIMAL_RIGS.s13.eye;
  const ordinary=deformPoint(p,...eye,1.25,.3,{brood:0}),brooding=deformPoint(p,...eye,1.25,.3,{brood:.8});
  const width=56.5,proof=document.createElement('canvas');proof.width=180;proof.height=160;const c=proof.getContext('2d'),h=width*r.bounds[13].h/r.bounds[13].w;
  const paint=brood=>{c.clearRect(0,0,180,160);r.articulation?.beginFrame(Infinity);r.drawSprite(c,s.player.species,90,80,width,1,1.25,1,.3,null,{brood});return c.getImageData(0,0,180,160).data;};
  const a=paint(0),b=paint(.8);let jaw=0,other=0;for(let y=0;y<160;y++)for(let x=0;x<180;x++){const i=(y*180+x)*4,d=Math.max(...[0,1,2,3].map(k=>Math.abs(a[i+k]-b[i+k])));if(d<=8)continue;if(x>90+width*.23&&y>80-h*.04)jaw++;else other++;}
  const gallery=document.createElement('canvas');gallery.width=760;gallery.height=460;const g=gallery.getContext('2d');g.fillStyle='#f4f0df';g.fillRect(0,0,760,460);g.fillStyle='#163c43';g.font='20px sans-serif';g.fillText('Same phase and effort: ordinary',25,32);g.fillText('Mouthbrooding',420,32);
  r.articulation?.beginFrame(Infinity);r.drawSprite(g,s.player.species,180,225,310,1,1.25,1,.3,null,{brood:0});r.drawSprite(g,s.player.species,565,225,310,1,1.25,1,.3,null,{brood:.8});
  return {jaw,other,eyeShift:Math.hypot(ordinary.x-brooding.x,ordinary.y-brooding.y),gallery:gallery.toDataURL()};
 });
 console.log('Nursery mouth proof',JSON.stringify({width,jawPixels:visual.jaw,otherPixels:visual.other,eyeShift:visual.eyeShift}));
 expect(visual.jaw,'brood-only lower mouth pixel changes at native size').toBeGreaterThan(2);expect(visual.eyeShift,'mouthbrooding preserves the eye landmark').toBeLessThan(1e-9);
 await (await import('node:fs/promises')).writeFile((await import('node:path')).join((await import('node:os')).tmpdir(),`atoll-nursery-mouth-proof-${width}.png`),Buffer.from(visual.gallery.split(',')[1],'base64'));
 // Cover both saved intentions: the wider dive keeps swimming, while the
 // narrower dive explicitly pauses and later resumes through the visible UI.
 if(savedPaused)await clickButton(page,{name:'Pause',exact:true});expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(savedPaused);
 await page.keyboard.press('Control+s');await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('atoll-save-0')).state.includes('nursery'))).toBe(true);
 expect(await page.evaluate(()=>JSON.parse(JSON.parse(localStorage.getItem('atoll-save-0')).state).paused)).toBe(savedPaused);
 await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:'Saved dives',exact:true});await page.locator('[data-action="load-0"]').click();
 await expect(page.locator('#story-step')).toContainText('Mouthbrooding');expect(await page.evaluate(()=>window.atoll.simulation.reefStories.nursery.progress)).toBeGreaterThanOrEqual(brood.progress);
 expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(savedPaused);
 if(savedPaused){const frozen=await page.evaluate(()=>{const s=window.atoll.simulation,before=s.serialize();for(let i=0;i<60;i++)s.step(1/60);return {before,after:s.serialize()};});expect(frozen.after).toBe(frozen.before);}
 await page.locator('#reef-story .activity-details > summary').click();await expect(page.locator('#story-detail')).toContainText('Biological time is compressed');
 const bounds=await page.locator('#reef-story').evaluate(e=>({overflow:e.scrollWidth>e.clientWidth+1,rect:{left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right,bottom:e.getBoundingClientRect().bottom}}));expect(bounds.overflow).toBe(false);expect(bounds.rect.right).toBeLessThanOrEqual(width);expect(bounds.rect.bottom).toBeLessThanOrEqual(height);
 await page.screenshot({path:(await import('node:path')).join((await import('node:os')).tmpdir(),`atoll-nursery-brooding-${width}.png`)});
 if(savedPaused)await clickButton(page,{name:'Resume',exact:true});expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(false);
 await page.evaluate(()=>{const s=window.atoll.simulation;for(let i=0;i<2100&&s.reefStories.nursery.stage==='brooding';i++)s.step(1/60);});await expect(page.locator('#story-step')).toContainText('Young seeking shelter');
 await page.evaluate(()=>{const s=window.atoll.simulation;for(let i=0;i<650;i++)s.step(1/60);});await page.locator('[data-story-action="nursery-check"]').click();await expect(page.locator('#story-record')).toHaveText('Discovered');
 await expect.poll(()=>page.evaluate(()=>window.atoll.journal.discoveries.includes('cardinalfish-nursery'))).toBe(true);await expect(page.locator('#story-detail')).toContainText('independently');
 await page.screenshot({path:(await import('node:path')).join((await import('node:os')).tmpdir(),`atoll-nursery-complete-${width}.png`)});
 await page.locator('[data-action="story-stop"]').click();expect(await page.evaluate(()=>window.atoll.simulation.reefStories.active)).toBeNull();
 const background=await page.evaluate(()=>{const s=window.atoll.simulation,n=s.reefStories.nursery,before=n.juveniles.map(j=>({x:j.x,y:j.y}));for(let i=0;i<300;i++)s.step(1/60);return {count:n.juveniles.length,moved:n.juveniles.some((j,i)=>Math.hypot(j.x-before[i].x,j.y-before[i].y)>1)};});expect(background.count).toBe(4);expect(background.moved).toBe(true);
 expect(errors).toEqual([]);
});


