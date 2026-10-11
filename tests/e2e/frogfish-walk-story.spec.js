import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {clickButton} from '../../scripts/ui-actions.mjs';

const directory='artifacts/species-adventures';
const evidence={story:'A Walk Along the Reef',method:'Normal Practice menu, story buttons, E and pointer. Simulation state is read only; restore tests use independent save copies.',tests:[],images:[]};
test.describe.configure({mode:'serial'});
test.beforeAll(()=>mkdir(directory,{recursive:true}));
test.afterAll(()=>writeFile(process.env.WALKER_EVIDENCE_FILE||`${directory}/walker-review.json`,JSON.stringify(evidence,null,2)));
const gap=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
async function action(page,id,value){await page.locator(`[data-action="story-action"][data-story-action="${id}"]${value===undefined?'':`[data-value="${value}"]`}`).click();}
async function capture(page,name){const path=`${directory}/walker-${name}.png`;await page.screenshot({path});evidence.images.push(path);}
async function installObserver(page){
 await page.evaluate(async()=>{
  const walk=await import('/src/frogfish-walk.js'),paint=await import('/src/frogfish-walk-render.js');
  window.walkerQA={graph:structuredClone(walk.WALK_GRAPH),frames:[],recording:false};const toeSourceCache={};
  window.walkerQA.read=()=>{
   const s=window.atoll.simulation,r=window.atoll.renderer,p=s.player,pose=walk.walkerPose(s),im=r.sprites[p.species.index];
   const limbs=pose?paint.walkLandmarks(pose,pose.width,pose.width*im.height/im.width):[];
   const painted=r.poses.get(p.id),prepared=r.walkerParts?.prepare(im,'s54');
   const toes=limbs.map(l=>{
    const dx=l.sourceTip.x-l.sourceRoot.x,dy=l.sourceTip.y-l.sourceRoot.y,m=l.matrix;
    const piece=prepared?.pieces.find(a=>a.name===l.kind);
    const sx=Math.round(l.sourceTip.x/pose.width*im.width)-(piece?.left||0),sy=Math.round(l.sourceTip.y/(pose.width*im.height/im.width)*im.height)-(piece?.top||0);
    const alpha=piece?(toeSourceCache[l.kind]??(toeSourceCache[l.kind]=sx>=0&&sy>=0&&sx<piece.canvas.width&&sy<piece.canvas.height?piece.canvas.getContext('2d').getImageData(sx,sy,1,1).data[3]:0)):0;
    return {...l,transformedTip:{x:m[0]*dx+m[2]*dy+m[4],y:m[1]*dx+m[3]*dy+m[5]},sourceAlpha:alpha,sourceImage:{width:im.width,height:im.height},sourceSample:{x:sx,y:sy,left:piece?.left,top:piece?.top,width:piece?.canvas.width,height:piece?.canvas.height}};
   });
   return {time:s.time,paused:s.paused,current:s.current,active:s.reefStories.active,story:structuredClone(s.reefStories.walker),player:{x:p.x,y:p.y,angle:p.angle,energy:p.energy,health:p.health,biteDamage:p.biteDamage,stun:p.stun,activity:p.activity,ambush:structuredClone(p.ambush),abilityTime:p.abilityTime},pose:structuredClone(pose),painted:painted?{frame:structuredClone(painted.frame),walking:painted.walking,limbs:structuredClone(painted.walkingLimbs)}:null,toes,clear:pose?walk.walkBodyClear(pose.body):null,roster:s.sections.map(a=>a.entities.map(e=>({id:e.id,incarnation:e.incarnation,species:e.species.id,alive:e.alive}))),nearby:s.section.entities.filter(e=>e.alive&&Math.hypot(e.x-p.x,e.y-p.y)<240).map(e=>({id:e.id,species:e.species.id,x:e.x,y:e.y,diet:e.species.diet,activity:e.activity,target:e.target})),discoveries:[...window.atoll.journal.discoveries]};
  };
  const sample=()=>{if(window.walkerQA.recording){const {time,story,player,pose,painted,toes,clear,nearby}=window.walkerQA.read();window.walkerQA.frames.push({time,story,player,pose,painted,toes,clear,nearby});}requestAnimationFrame(sample);};requestAnimationFrame(sample);
 });
}
async function snapshot(page){return page.evaluate(()=>window.walkerQA.read());}
async function observeClick(page,selector,perform){
 await page.evaluate(selector=>{
  window.walkerQA.clickTransition=null;
  const matches=e=>e.target.closest(selector);
  const before=e=>{if(matches(e)){window.walkerQA.clickTransition={before:window.walkerQA.read()};document.removeEventListener('click',before,true);}};
  const after=e=>{if(matches(e)){window.walkerQA.clickTransition.after=window.walkerQA.read();document.removeEventListener('click',after);}};
  document.addEventListener('click',before,true);document.addEventListener('click',after);
 },selector);
 await perform();return page.evaluate(()=>window.walkerQA.clickTransition);
}
async function saveCheckpoint(page,label){
 await page.keyboard.press('Control+s');const result=await page.evaluate(async()=>{const {Simulation}=await import('/src/simulation.js'),raw=JSON.parse(localStorage.getItem('atoll-save-0')).state,saved=JSON.parse(raw),restored=Simulation.restore(raw);return {saved:saved.reefStories.walker,restored:structuredClone(restored.reefStories.walker),body:{x:restored.player.x,y:restored.player.y}};});expect(result.restored).toEqual(result.saved);(evidence.checkpoints??=[]).push({label,...result});return result;
}
async function begin(page,width=1600,height=900){
 await page.setViewportSize({width,height});await page.addInitScript(()=>{Date.now=()=>42;});
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:/Practice Choose/});await page.locator('[role="option"][data-species="s54"]').click();await page.locator('[data-action="begin-practice"]').click();
 await clickButton(page,{name:'Activity',exact:true});await clickButton(page,{name:'Begin A Walk Along the Reef',exact:true});
 await expect(page.locator('#reef-story')).toContainText('A Walk Along the Reef');await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.reefStories.active)).toBe('walker');
 await installObserver(page);
 await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.current),{timeout:45000}).toBe(4);
 return snapshot(page);
}
async function point(page,p,click=false){const b=await page.locator('#reef').boundingBox(),x=b.x+p.x/1600*b.width,y=b.y+(p.y+55)/900*b.height;await page.mouse.move(x,y);if(click)await page.mouse.click(x,y);}
async function stance(page,node){await expect.poll(()=>page.evaluate(()=>({phase:window.atoll.simulation.reefStories.walker.phase,node:window.atoll.simulation.reefStories.walker.node})),{timeout:25000}).toEqual({phase:'stance',node});}
async function plant(page){await page.keyboard.press('e');await stance(page,'start');}
async function pausePhase(page,phase){
 for(let attempt=0;attempt<8;attempt++){
  await page.waitForFunction(phase=>{const w=window.atoll.simulation.reefStories.walker;return w.phase===phase&&(w.gait?.elapsed??0)<(phase==='turn'?.7:.12);},phase,{timeout:12000});
  await page.keyboard.press('Escape');const state=await snapshot(page);
  if(state.story.phase===phase)return state;
  await page.keyboard.press('Escape');
 }
 throw new Error(`Could not pause an actual ${phase} stride`);
}
async function recordTransfer(page,to,name){
 const before=await snapshot(page);await page.evaluate(()=>{window.walkerQA.frames=[];window.walkerQA.recording=true;});
 await page.keyboard.press('e');
 for(const phase of ['swing-front','shift-front','swing-rear','shift-rear']){
  const imageState=await pausePhase(page,phase);await capture(page,`${name}-${phase}`);(evidence.imageStates??=[]).push({name:`${name}-${phase}`,state:imageState});await page.keyboard.press('Escape');
 }
 await stance(page,to);await page.evaluate(()=>window.walkerQA.recording=false);
 const frames=await page.evaluate(()=>window.walkerQA.frames),after=await snapshot(page),trace={name,passed:false,before,after,frames};evidence.tests.push(trace);
 expect(frames.length).toBeGreaterThan(40);expect(gap(before.player,after.player)).toBeGreaterThan(25);
 expect(after.player.energy).toBe(before.player.energy);expect(after.player.health).toBe(before.player.health);expect(after.player.biteDamage).toBe(before.player.biteDamage);
 let plantedTravel=0,swingLift=0;const violations=[];const check=(condition,frame,detail)=>{if(!condition&&violations.length<20)violations.push({frame,detail});};
 for(let i=1;i<frames.length;i++){
  const a=frames[i-1],b=frames[i];if(!a.pose||!b.pose)continue;
  check(b.clear,i,'actual body collision');check(gap(a.player,b.player)<3,i,'body teleport');
  check(!b.nearby.some(e=>e.diet.includes('fish')&&e.target==='player'),i,'nearby predator targeted held player');
  check(gap(b.pose.body,b.player)<.001,i,'physical body differs from simulation');check(b.painted?.walking===true,i,'walking rig was not painted');check(b.painted?.limbs?.length===4,i,'four actual fins were not painted');check(b.painted?.limbs?.every(l=>l.painted),i,'draw invocation missing');check(gap(b.painted.frame,b.pose.body)<1,i,'painted torso differs from physical body');
  for(const limb of b.toes){check(gap(limb.tip,limb.transformedTip)<.000001,i,`${limb.id} affine toe misses contact`);check(limb.sourceAlpha>200,i,`${limb.id} source alpha ${limb.sourceAlpha}: ${JSON.stringify(limb.sourceSample)}`);check(gap(limb.tip,b.painted.limbs.find(l=>l.id===limb.id).tip)<2,i,`${limb.id} painted toe differs from simulation contact`);}
  if(a.story.gait?.phase===b.story.gait?.phase&&a.story.gait?.stride===b.story.gait?.stride){
   const planted=b.toes.filter(l=>l.planted);
   if(gap(a.player,b.player)>.01){check(planted.length===4,i,'body moved before four contacts planted');for(const l of planted){const prior=a.toes.find(p=>p.id===l.id);check(gap(prior.tip,l.tip)<.001,i,`${l.id} skated while torso moved`);}plantedTravel++;}
   if(b.toes.some(l=>!l.planted)&&gap(a.toes.find(l=>!l.planted)?.tip||a.player,b.toes.find(l=>!l.planted)?.tip||b.player)>.01)swingLift++;
  }
 }
 expect(violations,JSON.stringify(violations)).toEqual([]);expect(plantedTravel).toBeGreaterThan(5);expect(swingLift).toBeGreaterThan(5);
 for(const phase of ['swing-front','shift-front','swing-rear','shift-rear'])expect(frames.some(f=>f.story.phase===phase)).toBe(true);
 await saveCheckpoint(page,name);Object.assign(trace,{passed:true,plantedTravel,swingLift});return after;
}

test('both real terrain routes use painted fins to transfer weight, block the gap and record once at both sizes',async({page})=>{
 test.setTimeout(500000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const [width,height] of [[1600,900],[1024,768]]){
  const initial=await begin(page,width,height);await capture(page,`inspect-${width}`);await saveCheckpoint(page,`inspect-${width}`);
  // A distant shelf cannot plant or advance the player.
  const far=await page.evaluate(()=>window.walkerQA.graph.nodes.find(n=>n.id==='upper-lookout'));
  await point(page,far,true);expect((await snapshot(page)).story.steps).toBe(0);expect((await snapshot(page)).story.phase).toBe('detached');
  await page.keyboard.press('e');await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.reefStories.walker.phase)).toBe('approach');await saveCheckpoint(page,`approach-${width}`);await stance(page,'start');const held=await snapshot(page);expect(held.pose.contacts.every(c=>c.planted)).toBe(true);await saveCheckpoint(page,`stance-${width}`);
  await action(page,'walker-route','upper');await recordTransfer(page,'upper',`high-${width}-shelf`);
  const gapTarget=await page.evaluate(()=>window.walkerQA.graph.nodes.find(n=>n.id==='lower-lookout'));
  // Pause before aiming so ordinary pointermove cannot release the stance;
  // resume at that canvas coordinate, then pointerdown tests the gap hotspot.
  await page.keyboard.press('Escape');await point(page,gapTarget);await page.keyboard.press('Escape');const beforeGap=await snapshot(page);await page.mouse.down();await page.mouse.up();const blocked=await snapshot(page);
  expect(blocked.story.node).toBe('upper');expect(blocked.story.gait).toBeNull();expect(gap(beforeGap.player,blocked.player)).toBeLessThan(1);await capture(page,`blocked-gap-${width}`);
  await recordTransfer(page,'upper-lookout',`high-${width}-lookout`);expect((await snapshot(page)).story.complete).toBe(false);await page.keyboard.press('e');await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.reefStories.walker.complete)).toBe(true);
  await capture(page,`high-complete-${width}`);await saveCheckpoint(page,`high-done-${width}`);const high=await snapshot(page);expect(high.discoveries.filter(x=>x==='frogfish-walk')).toHaveLength(1);
  await action(page,'walker-restart');const restarted=await snapshot(page);expect(gap(high.player,restarted.player)).toBeLessThan(1);await action(page,'walker-route','lower');await plant(page);
  await recordTransfer(page,'lower',`low-${width}-shelf`);const lower=await recordTransfer(page,'lower-lookout',`low-${width}-lookout`);
  expect(lower.player.y-high.player.y).toBeGreaterThan(50);await page.keyboard.press('e');await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.reefStories.walker.stage)).toBe('done');await capture(page,`low-complete-${width}`);
  await saveCheckpoint(page,`low-done-${width}`);const finished=await snapshot(page);expect(finished.discoveries.filter(x=>x==='frogfish-walk')).toHaveLength(1);expect(finished.roster.map(r=>r.map(e=>e.id))).toEqual(initial.roster.map(r=>r.map(e=>e.id)));
  const box=await page.locator('#reef-story').boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThanOrEqual(height);expect(box.x+box.width).toBeLessThanOrEqual(width);expect(await page.locator('#reef-story').evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true);
  await action(page,'walker-restart');const lowRestart=await snapshot(page);expect(gap(finished.player,lowRestart.player)).toBeLessThan(1);await plant(page);await capture(page,`restart-from-low-${width}`);
  evidence.tests.push({name:`both-routes-${width}`,passed:true,initial,held,blocked,high,lower,finished});
 }
 expect(errors).toEqual([]);
});

test('every gait phase saves valid contact geometry; pause freezes and native background delivery is diagnosed; invalid graphs and body poses reject',async({page,context})=>{
 test.setTimeout(150000);await begin(page);await plant(page);await page.keyboard.press('e');const saves=[];
 for(const phase of ['turn','swing-front','shift-front','swing-rear','shift-rear']){
  await pausePhase(page,phase);await page.waitForTimeout(80);const frozen=await snapshot(page),serialized=await page.evaluate(()=>window.atoll.simulation.serialize()),paintedFrame=await page.locator('#reef').evaluate(c=>c.toDataURL());
  await page.waitForTimeout(200);expect(await page.evaluate(()=>window.atoll.simulation.serialize())).toBe(serialized);expect(await page.locator('#reef').evaluate(c=>c.toDataURL())).toBe(paintedFrame);expect((await snapshot(page)).pose).toEqual(frozen.pose);await capture(page,`saved-${phase}`);await page.keyboard.press('Control+s');
  const validation=await page.evaluate(async()=>{
   const {Simulation}=await import('/src/simulation.js'),{walkerPose}=await import('/src/frogfish-walk.js'),raw=JSON.parse(localStorage.getItem('atoll-save-0')).state,saved=JSON.parse(raw),restored=Simulation.restore(raw);
   const rejects=[];for(const [field,value] of [['node','missing'],['selected','missing'],['steps',99],['phase','hovering'],['reef',2]]){const bad=structuredClone(saved);bad.reefStories.walker[field]=value;try{Simulation.restore(bad);rejects.push({field,rejected:false});}catch{rejects.push({field,rejected:true});}}
   for(const [field,value] of [['x',saved.player.x+200],['y',saved.player.y+150]]){const bad=structuredClone(saved);bad.player[field]=value;try{Simulation.restore(bad);rejects.push({field:'player.'+field,rejected:false});}catch{rejects.push({field:'player.'+field,rejected:true});}}
   const bad=structuredClone(saved);bad.reefStories.walker.gait.to='lower-lookout';try{Simulation.restore(bad);rejects.push({field:'disconnected gait',rejected:false});}catch{rejects.push({field:'disconnected gait',rejected:true});}
   return {saved:saved.reefStories.walker,restored:restored.reefStories.walker,body:{x:restored.player.x,y:restored.player.y},pose:walkerPose(restored),rejects};
  });
  expect(validation.saved.phase).toBe(phase);expect(validation.restored).toEqual(validation.saved);expect(gap(validation.body,validation.pose.body)).toBeLessThan(.001);expect(validation.rejects.every(r=>r.rejected),JSON.stringify(validation.rejects)).toBe(true);saves.push({phase,frozen,validation});await page.keyboard.press('Escape');
 }
 await stance(page,'upper');await page.keyboard.press('Escape');await page.keyboard.press('Control+s');const frozen=await snapshot(page);await page.locator('[data-action="home"]').click();await clickButton(page,{name:'Saved dives',exact:true});await page.locator('[data-action="load-0"]').click();await installObserver(page);const resumed=await snapshot(page);expect(resumed.story.node).toBe('upper');expect(gap(frozen.player,resumed.player)).toBeLessThan(1);await capture(page,'loaded-stance');
 await page.bringToFront();await page.locator('#reef').focus();await expect.poll(()=>page.evaluate(()=>document.hasFocus())).toBe(true);
 if((await snapshot(page)).paused)await page.keyboard.press('Escape');expect((await snapshot(page)).paused).toBe(false);
 const focusState=()=>page.evaluate(()=>({hidden:document.hidden,focused:document.hasFocus(),paused:window.atoll.simulation.paused}));
 evidence.offscreenStates={before:await focusState()};const other=await context.newPage();await other.goto('about:blank');await other.bringToFront();await page.waitForTimeout(100);evidence.offscreenStates.after=await focusState();
 const delivered=evidence.offscreenStates.after.hidden||!evidence.offscreenStates.after.focused||evidence.offscreenStates.after.paused;
 evidence.offscreenStates.nativeTransitionDelivered=delivered;
 if(delivered){await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.paused)).toBe(true);const offscreen=await page.evaluate(()=>window.atoll.simulation.serialize());await page.waitForTimeout(350);expect(await page.evaluate(()=>window.atoll.simulation.serialize())).toBe(offscreen);}
 else evidence.offscreenStates.limitation='Headless browser delivered no native focus/visibility transition; background pause requires separate native desktop evidence.';
 await other.close();await page.bringToFront();if(!(await snapshot(page)).paused)await page.keyboard.press('Escape');await capture(page,'blur-diagnostic');
 evidence.tests.push({name:'all-phases-save-pause-blur-invalid',passed:true,saves,frozen,resumed});
});

test('mid-transfer swim and stop release immediately without teleport; lure and ambush remain usable',async({page})=>{
 test.setTimeout(240000);await begin(page);await plant(page);await page.keyboard.press('e');await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.reefStories.walker.phase),{intervals:[10]}).toBe('shift-front');await page.waitForTimeout(150);
 const swimTransition=await observeClick(page,'[data-story-action="walker-swim"]',()=>action(page,'walker-swim')),before=swimTransition.before,released=swimTransition.after;expect(released.story.phase).toBe('detached');expect(released.pose).toBeNull();expect(gap(before.player,released.player)).toBeLessThan(.001);await point(page,{x:released.player.x+100,y:released.player.y-90});await page.waitForTimeout(500);const swam=await snapshot(page);expect(gap(released.player,swam.player)).toBeGreaterThan(8);await capture(page,'ordinary-swim-after-release');
 await action(page,'walker-plant','start');await stance(page,'start');await page.keyboard.press('e');await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.reefStories.walker.phase),{intervals:[10]}).toBe('shift-rear');const stopTransition=await observeClick(page,'[data-action="story-stop"]',()=>clickButton(page,{name:'Return to free exploration',exact:true})),stopBefore=stopTransition.before,stopped=stopTransition.after;expect(stopped.active).toBeNull();expect(stopped.pose).toBeNull();expect(gap(stopBefore.player,stopped.player)).toBeLessThan(.001);
 await page.locator('#reef').focus();await page.keyboard.press('Space');await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.player.abilityTime)).toBeGreaterThan(0);const lure=await snapshot(page);expect(lure.story.steps).toBe(0);await capture(page,'lure-after-stop');
 // Existing ambush entry uses an authored site chosen from the live reef;
 // no generated fish are moved, removed, made hungry or forced to cooperate.
 const chooseSite=()=>page.evaluate(async()=>{const {sitesFor}=await import('/src/adventures.js'),{edible}=await import('/src/simulation.js'),s=window.atoll.simulation,score=p=>s.section.entities.filter(e=>e.alive&&!e.hidden&&edible(s.player,e)&&!e.species.poison&&Math.hypot(e.x-p.x,e.y-p.y)<340).length;return sitesFor(s).sort((a,b)=>score(b)-score(a)||Math.hypot(a.x-s.player.x,a.y-s.player.y)-Math.hypot(b.x-s.player.x,b.y-s.player.y))[0];});
 let site=await chooseSite();
 await point(page,site);await expect.poll(()=>page.evaluate(site=>Math.hypot(window.atoll.simulation.player.x-site.x,window.atoll.simulation.player.y-site.y),site),{timeout:30000}).toBeLessThan(25);await page.keyboard.press('e');await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.player.ambush?.settled),{timeout:10000}).toBe(2);const ambush=await snapshot(page);expect(ambush.story.complete).toBe(false);await capture(page,'existing-ambush-after-walk');
 const attempts=[],deadline=Date.now()+120000;let reassessAt=ambush.time+20,complete=false;
 while(Date.now()<deadline){
  const state=await page.evaluate(async site=>{const {edible}=await import('/src/simulation.js'),{creaturePickFrame}=await import('/src/geometry.js'),{defended}=await import('/src/ability-rules.js'),s=window.atoll.simulation,p=s.player,candidates=s.section.entities.filter(e=>e.alive&&!e.hidden&&!e.stun&&!e.species.poison&&!defended(e)&&edible(p,e)&&Math.hypot(p.x-e.x,p.y-e.y)<=105).sort((a,b)=>Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(p.x-b.x,p.y-b.y)),e=candidates.find(e=>{const f=creaturePickFrame(e);return s.findAt(f.x,f.y)===e;});return {complete:s.adventure.complete,caught:s.adventure.ambushCatch,time:s.time,ambush:p.ambush,near:Math.hypot(p.x-site.x,p.y-site.y)<25,prey:e?{id:e.id,...creaturePickFrame(e),aligned:Math.cos(p.angle-Math.atan2(e.y-p.y,e.x-p.x))>.97}:null};},site);
  if(state.complete&&state.caught){complete=true;break;}
  if(state.time>=reassessAt&&!(state.ambush?.strike>0)){if(state.ambush)await page.keyboard.press('e');site=await chooseSite();await point(page,site);reassessAt=state.time+20;}
  else if(!state.ambush){if(state.near)await page.keyboard.press('e');else await point(page,site);}
  else if(state.ambush.settled>=2&&!state.ambush.strike&&state.prey){await point(page,state.prey);if(state.prey.aligned){await page.mouse.down();await page.mouse.up();attempts.push({time:state.time,prey:state.prey});}}
  await page.waitForTimeout(100);
 }
 const caught=await snapshot(page);evidence.tests.push({name:'release-stop-existing-lure-ambush',passed:complete,before,released,swam,stopBefore,stopped,lure,ambush,attempts,caught});await capture(page,'existing-real-catch-after-walk');expect(complete,JSON.stringify({attempts,caught})).toBe(true);expect(caught.discoveries).toContain('frogfish-ambush');expect(caught.story.complete).toBe(false);
});
