import {test,expect} from '@playwright/test';
import {clickButton} from '../../scripts/ui-actions.mjs';

async function ready(page){await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready,null,{timeout:20000});}
async function begin(page){
 await ready(page);await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill('Yellow goatfish');await page.locator('[role="option"][data-species="s9"]').click();
 await page.locator('[data-action="begin-practice"]').click();await clickButton(page,{name:'Activity',exact:true});await clickButton(page,{name:/Begin .*Whisker Detective/});
 await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.reefStories?.active)).toBe('detective');
}
async function point(page,p,click=false){const b=await page.locator('#reef').boundingBox(),x=b.x+p.x/1600*b.width,y=b.y+(p.y+55)/900*b.height;if(click)await page.mouse.click(x,y);else await page.mouse.move(x,y);}
async function patch(page){return page.evaluate(async()=>{const s=window.atoll.simulation,{feedingApproach}=await import('/src/feeding-contact.js'),q=s.reefStories.detective.patches.find(p=>!p.found),f=s.section.food.find(f=>f.id===q.id);return {...q,dock:feedingApproach(s.player,f)};});}
async function uncover(page,p){
 await point(page,p.dock);await page.waitForFunction(p=>{const s=window.atoll.simulation;return Math.hypot(s.player.x-p.x,s.player.y-p.y)<12;},p.dock,{timeout:30000});
 await page.keyboard.press('e');await page.waitForFunction(()=>window.atoll.simulation.player.sandProbe?.elapsed>.2);
 await page.waitForFunction(id=>window.atoll.simulation.reefStories.detective.patches.find(p=>p.id===id).found,p.id,{timeout:12000});
}

for(const width of [1600,1024])test(`Whisker Detective has unmarked buried food and a real pauseable probe at ${width}`,async({page})=>{
 test.setTimeout(90000);await page.setViewportSize({width,height:width===1600?900:768});const errors=[];page.on('pageerror',e=>errors.push(e.message));await begin(page);
 const p=await patch(page);
 const hidden=await page.evaluate(async id=>{const s=window.atoll.simulation,{nearbyFoodHints}=await import('/src/food-hints.js'),r=window.atoll.renderer,paint=[],tags=[],rings=[],draw=r.drawFood,tag=r.tag,ellipse=r.ctx.ellipse;r.ctx.ellipse=function(x,y,...args){rings.push({x,y});return ellipse.call(this,x,y,...args);};r.drawFood=function(c,f,...args){paint.push(f.id);return draw.call(this,c,f,...args);};r.tag=function(c,x,y,text,...args){tags.push({x,y,text});return tag.call(this,c,x,y,text,...args);};try{r.foodHints=true;r.draw(s,0);}finally{r.drawFood=draw;r.tag=tag;r.ctx.ellipse=ellipse;}return {picked:s.findAt(s.reefStories.detective.patches.find(p=>p.id===id).x,s.reefStories.detective.patches.find(p=>p.id===id).y)?.id,paint,rings,hints:nearbyFoodHints(s).map(f=>f.id),tags,patches:s.reefStories.detective.patches};},p.id);
 expect(hidden.picked).not.toBe(p.id);for(const q of hidden.patches){expect(hidden.paint).not.toContain(q.id);expect(hidden.hints).not.toContain(q.id);expect(hidden.rings.some(t=>Math.hypot(t.x-q.x,t.y-q.y)<.01)).toBe(false);expect(hidden.tags.some(t=>Math.hypot(t.x-q.x,t.y-q.y)<35)).toBe(false);}
 await point(page,p,true);expect(await page.evaluate(()=>window.atoll.simulation.player.target)).not.toBe(p.id);
 await point(page,p.dock);await page.waitForFunction(d=>Math.hypot(window.atoll.simulation.player.x-d.x,window.atoll.simulation.player.y-d.y)<12,p.dock,{timeout:30000});await page.keyboard.press('e');await page.waitForFunction(()=>window.atoll.simulation.player.sandProbe?.elapsed>.2);await expect(page.locator('#story-step')).toContainText('Probing');await page.keyboard.press('Escape');
 const held=await page.evaluate(()=>{const s=window.atoll.simulation;return {probe:s.player.sandProbe,story:s.reefStories.detective,time:s.time};});expect(held.probe.elapsed).toBeLessThan(1.5);expect(held.story.patches.find(q=>q.id===p.id).found).toBe(false);await page.waitForTimeout(250);expect(await page.evaluate(()=>{const s=window.atoll.simulation;return {probe:s.player.sandProbe,story:s.reefStories.detective,time:s.time};})).toEqual(held);
 await page.keyboard.press('Control+s');const saved=await page.evaluate(()=>JSON.parse(JSON.parse(localStorage.getItem('atoll-save-0')).state));expect(saved.paused).toBe(true);expect(saved.player.sandProbe).toEqual(held.probe);expect(saved.reefStories.detective).toEqual(held.story);await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:'Saved dives'});await clickButton(page,{name:'Load dive'});
 const restored=await page.evaluate(()=>{const s=window.atoll.simulation;return {probe:s.player.sandProbe,story:s.reefStories.detective,time:s.time,paused:s.paused};});expect(restored.probe.food).toBe(held.probe.food);expect(restored.probe.reef).toBe(held.probe.reef);expect(restored.probe.elapsed).toBeGreaterThanOrEqual(held.probe.elapsed);expect(restored.story.patches).toEqual(held.story.patches);expect(restored.time).toBeGreaterThanOrEqual(held.time);expect(restored.paused).toBe(true);await page.waitForTimeout(300);expect(await page.evaluate(()=>{const s=window.atoll.simulation;return {probe:s.player.sandProbe,story:s.reefStories.detective,time:s.time,paused:s.paused};})).toEqual(restored);await clickButton(page,{name:'Resume',exact:true});expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(false);
 await page.waitForFunction(id=>window.atoll.simulation.reefStories.detective.patches.find(q=>q.id===id).found,p.id);expect(await page.evaluate(id=>window.atoll.simulation.section.food.find(f=>f.id===id).uncovered,p.id)).toBeGreaterThan(0);
 await expect(page.locator('[data-action="story-action"][data-story-action="eat"]')).toBeVisible();await expect(page.locator('[data-action="story-action"][data-story-action="leave"]')).toBeVisible();expect(errors).toEqual([]);
});

test('Whisker Detective Eat nourishes and Leave completes only after a generated neighbor takes an observed bite',async({page})=>{
 test.setTimeout(120000);await begin(page);const p=await patch(page),before=await page.evaluate(()=>window.atoll.simulation.section.entities.map(e=>e.id));await uncover(page,p);
 await page.evaluate(()=>{window.atoll.simulation.player.energy=45;});const amount=await page.evaluate(id=>window.atoll.simulation.section.food.find(f=>f.id===id).amount,p.id);await page.locator('[data-action="story-action"][data-story-action="eat"]').click();
 await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.player.energy),{timeout:12000}).toBeGreaterThan(50);await expect.poll(()=>page.evaluate(id=>window.atoll.simulation.section.food.find(f=>f.id===id).amount,p.id)).toBeLessThan(amount);
 expect(await page.evaluate(()=>window.atoll.simulation.reefStories.detective.complete)).toBe(false);await page.locator('[data-action="story-action"][data-story-action="leave"]').click();
 const left=await page.evaluate(id=>{const s=window.atoll.simulation,q=s.reefStories.detective;return {amount:s.section.food.find(f=>f.id===id).amount,neighbor:q.neighbor,complete:q.complete,energy:s.player.energy};},p.id);expect(left.complete).toBe(false);
 await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.reefStories.detective.neighbor),{timeout:90000,intervals:[500,1000]}).not.toBeNull();
 await expect.poll(()=>page.evaluate(()=>window.atoll.simulation.reefStories.detective.complete),{timeout:90000,intervals:[500,1000]}).toBe(true);
 const finish=await page.evaluate(id=>{const s=window.atoll.simulation,q=s.reefStories.detective,f=s.section.food.find(f=>f.id===id),n=s.section.entities.find(e=>e.id===q.neighbor?.id);return {amount:f.amount,foodSource:f.sandSource,selectedNeighbor:q.neighbor,witnessed:q.witnessed,ids:s.section.entities.map(e=>e.id),neighbor:n&&{id:n.id,incarnation:n.incarnation||0,satiated:n.satiated,target:n.target,gap:Math.hypot(n.x-f.x,n.y-f.y)},playerGap:Math.hypot(s.player.x-f.x,s.player.y-f.y)};},p.id);
 expect(finish.amount).toBeLessThan(left.amount);expect(finish.witnessed).toBe(true);expect(finish.ids).toEqual(before);expect(finish.neighbor.satiated).toBeGreaterThan(0);expect(finish.foodSource).toBe('player');expect(finish.neighbor.id).toBe(finish.selectedNeighbor.id);expect(finish.neighbor.incarnation).toBe(finish.selectedNeighbor.incarnation);expect(finish.neighbor.target).not.toBe(p.id);expect(finish.playerGap).toBeLessThan(260);
});

test('Whisker Detective seed layouts vary and remote sand exposes no clue',async({page})=>{
 await ready(page);const report=await page.evaluate(async()=>{const {Simulation}=await import('/src/simulation.js'),{beginStory}=await import('/src/reef-stories.js'),{storyCue}=await import('/src/whisker-detective.js');return [1,2,3,4,5,17,41,73].map(seed=>{const s=new Simulation(seed);s.start('practice','s9');const before=s.section.entities.length;beginStory(s);s.player.x=1550;s.player.y=40;s.player.angle=0;const cue=storyCue(s);return {seed,before,after:s.section.entities.length,positions:s.reefStories.detective.patches.map(p=>[p.x,p.y]),remoteStrength:cue.strength};});});
 expect(new Set(report.map(r=>JSON.stringify(r.positions))).size).toBeGreaterThan(3);for(const r of report){expect(r.after).toBe(r.before);expect(r.positions).toHaveLength(2);expect(r.remoteStrength).toBe(0);}
});








test('Leave immediately invites a recently fed existing neighbor and preserves its digestion',async({page})=>{
 test.setTimeout(60000);await page.addInitScript(()=>{Date.now=()=>42;});await begin(page);const p=await patch(page);await uncover(page,p);await clickButton(page,{name:'Pause',exact:true});
 const prior=await page.evaluate(async id=>{
  const {animalProfile}=await import('/src/animal-profiles.js'),{parasiteDamage}=await import('/src/player-cleaner.js'),{contactGap}=await import('/src/feeding-contact.js'),s=window.atoll.simulation,f=s.section.food.find(f=>f.id===id);
  // Feed every genuinely available existing candidate. The UI chooses the nearest
  // visitor at click time; it does not promise a paused snapshot's arbitrary ID.
  // No animal position, target, feeding state or care/danger priority is changed.
  const eligible=e=>e.alive&&e.health>0&&!e.hidden&&!(e.stun>0)&&!e.groundRoute&&!e.holdfast&&e.species.speed>0&&(!e.feeding||!e.feeding.committed&&e.feeding.target===f.id)&&!e.cleanTime&&!e.cleanerTarget&&parasiteDamage(e)<=35&&e.activity!=='avoiding'&&!e.behavior?.startsWith('Moving away')&&e.species.ability!=='clean'&&['probe-sand','sand','pick','bottom-forage'].includes(animalProfile(e.species).routine)&&e.species.diet.includes(f.food)&&(!e.target||e.target===f.id);
  const candidates=s.section.entities.filter(eligible);if(!candidates.length)throw Error('No available generated snack visitor');for(const e of candidates){e.satiated=80;e.rest=8;}
  const snapshot=e=>({id:e.id,incarnation:e.incarnation||0,x:e.x,y:e.y,satiated:e.satiated,rest:e.rest});
  const ids=()=>s.section.entities.map(e=>e.id);
  // Observe the same real DOM click before and after the game's handler. These
  // snapshots cannot drift while Playwright waits for a subsequent evaluation.
  document.addEventListener('click',event=>{if(event.target.closest('[data-story-action=leave]')&&!s.paused){window.__snackBefore={time:s.time,amount:f.amount,food:{x:f.x,y:f.y},ids:ids(),candidates:s.section.entities.map(snapshot)};}},true);
  document.addEventListener('click',event=>{if(event.target.closest('[data-story-action=leave]')&&!s.paused){const chosen=s.reefStories.detective.neighbor,e=s.section.entities.find(e=>e.id===chosen?.id);window.__snackOffered={chosen,complete:s.reefStories.detective.complete,time:s.time,amount:f.amount,food:{x:f.x,y:f.y},ids:ids(),neighbor:e&&snapshot(e)};}});
  // Observe the first actual completion frame, keeping the real simulation and
  // anatomical bite gate intact. Never fast-forward or award progress in the test.
  const step=s.step;s.step=function(dt){const result=step.call(this,dt);if(this.reefStories.detective.complete&&!window.__snackBite){const chosen=this.reefStories.detective.neighbor,e=this.section.entities.find(e=>e.id===chosen?.id);window.__snackBite={time:this.time,chosen,neighbor:snapshot(e),amount:f.amount,food:{x:f.x,y:f.y},ids:ids(),gap:contactGap(e,f),feedingCommitted:e.feeding?.committed,witnessed:this.reefStories.detective.witnessed};}return result;};
  return {candidates:candidates.map(snapshot),amount:f.amount,food:{x:f.x,y:f.y},ids:ids(),time:s.time};
 },p.id);
 const frozen=await page.evaluate(()=>window.atoll.simulation.serialize());await page.locator('[data-story-action=leave]').click();expect(await page.evaluate(()=>window.atoll.simulation.serialize())).toBe(frozen);await clickButton(page,{name:'Resume',exact:true});await page.locator('[data-story-action=leave]').click();
 const {before,offered}=await page.evaluate(()=>({before:window.__snackBefore,offered:window.__snackOffered}));
 expect(offered.chosen).not.toBeNull();const fed=prior.candidates.find(e=>e.id===offered.chosen.id&&e.incarnation===offered.chosen.incarnation);expect(fed).toBeTruthy();const immediate=before.candidates.find(e=>e.id===offered.chosen.id);expect(immediate.satiated).toBeGreaterThan(0);expect(immediate.rest).toBeGreaterThan(0);
 expect(offered.complete).toBe(false);expect(offered.time).toBe(before.time);expect(offered.neighbor).toEqual(immediate);expect(offered.amount).toBe(prior.amount);expect(offered.food).toEqual(prior.food);expect(offered.ids).toEqual(prior.ids);expect(before.ids).toEqual(prior.ids);
 // Ordinary ticks before the invitation may decay these timers, never erase them.
 expect(immediate.satiated).toBeCloseTo(80-(before.time-prior.time),5);expect(immediate.rest).toBeCloseTo(8-(before.time-prior.time),5);
 await page.waitForFunction(()=>window.__snackBite,null,{timeout:30000});const bite=await page.evaluate(()=>window.__snackBite);expect(bite.chosen).toEqual(offered.chosen);expect(bite.neighbor.id).toBe(fed.id);expect(bite.neighbor.incarnation).toBe(fed.incarnation);expect(bite.amount).toBe(prior.amount-12);expect(bite.food).toEqual(prior.food);expect(bite.ids).toEqual(prior.ids);expect(bite.neighbor.satiated).toBeGreaterThan(50);expect(bite.time-before.time).toBeLessThan(30);expect(bite.neighbor.satiated).toBeCloseTo(immediate.satiated-(bite.time-before.time),5);expect(bite.gap).toBeLessThanOrEqual(3);expect(bite.feedingCommitted).toBe(true);expect(bite.witnessed).toBe(true);expect(Math.hypot(bite.neighbor.x-immediate.x,bite.neighbor.y-immediate.y)).toBeGreaterThan(1);
});
