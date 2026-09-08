import {test,expect} from '@playwright/test';import {clickButton} from '../../scripts/ui-actions.mjs';
for(const [id,name,width,height] of [['s6','Longnose butterflyfish',1600,900],['s27','Blue-spotted stingray',1024,768],['s24','Clown triggerfish',1024,768],['s4','Moorish idol',1600,900],['s25','Regal angelfish',1024,768]])test(name+' completes its generated foraging trip with mouse controls',async({page})=>{
 test.setTimeout(80000);await page.setViewportSize({width,height});await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill(name);await page.getByRole('option',{name:new RegExp('^'+name)}).click();await clickButton(page,{name:'Try adventure',exact:true});await page.keyboard.press('Escape');
 const initial=await page.evaluate(async id=>{const {Simulation}=await import('/src/simulation.js'),{FORAGING_JOURNEYS}=await import('/src/foraging-journeys.js'),s=new Simulation(42);s.start('practice',id);s.paused=true;s.adventure.visible=true;Object.assign(window.atoll.simulation,s);return {count:s.section.entities.length,discovery:FORAGING_JOURNEYS[id].id};},id);
 const box=await page.locator('#reef').boundingBox(),screen=p=>({x:box.x+p.x/1600*box.width,y:box.y+(p.y+55)/900*box.height});await page.keyboard.press('Escape');
 for(let i=0;i<2;i++){
  const f=await page.evaluate(async()=>{const {foragingSites}=await import('/src/foraging-journeys.js'),{edible}=await import('/src/simulation.js'),s=window.atoll.simulation;const f=foragingSites(s).map(x=>x.food).find(f=>f&&edible(s.player,f));return f?{x:f.x,y:f.y}:null;});expect(f).not.toBeNull();const q=screen(f);await page.mouse.click(q.x,q.y);
  if(i===0&&!['s4','s25'].includes(id)){await expect(page.locator('#adventure-step')).toContainText(/Opening a shell|Inspecting a feeding patch/);}
  await page.waitForFunction(i=>(window.atoll.simulation.adventure.foragingJourney?.meals.length||0)>i,i,{timeout:25000});
 }
 if(['s4','s25'].includes(id)){
  await expect(page.locator('#adventure-step')).toContainText(id==='s4'?'fellow idol':'shelter');
  for(let i=0;i<30;i++){if(await page.evaluate(()=>window.atoll.simulation.adventure.complete))break;const p=await page.evaluate(async id=>{const s=window.atoll.simulation,{REEFS}=await import('/src/data.js');const a=id==='s4'?s.section.entities.filter(e=>e.alive&&e.species.id===id):REEFS[s.current].shelters;const t=[...a].sort((a,b)=>Math.hypot(a.x-s.player.x,a.y-s.player.y)-Math.hypot(b.x-s.player.x,b.y-s.player.y))[0];return {x:t.x,y:t.y};},id);const q=screen(p);await page.mouse.move(q.x,q.y);await page.waitForTimeout(500);}
 }
 await page.waitForFunction(()=>window.atoll.simulation.adventure.complete,null,{timeout:15000});await expect(page.locator('#adventure-step')).toContainText('begin another trip');await page.keyboard.press('Escape');expect(await page.evaluate(()=>window.atoll.journal.discoveries)).toContain(initial.discovery);expect(await page.evaluate(()=>window.atoll.simulation.section.entities.length)).toBe(initial.count);await page.screenshot({path:`artifacts/foraging-journey-${id}-${width}.png`});
});
