import {test,expect} from '@playwright/test';import {clickButton} from '../../scripts/ui-actions.mjs';
for(const [name,id,width,height,discovery] of [['Peach fairy basslet','s11',1600,900,'basslet-feeding-wave'],['Purple anthias','s58',1024,768,'anthias-feeding-wave']])test(name+' shares plankton and regroups through mouse controls',async({page})=>{
 test.setTimeout(90000);await page.setViewportSize({width,height});await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill(name);await page.getByRole('option').click();await clickButton(page,{name:'Try adventure',exact:true});await page.keyboard.press('Escape');
 await page.evaluate(async id=>{const {Simulation}=await import('/src/simulation.js'),s=new Simulation(42);s.start('practice',id);s.paused=true;s.adventure.visible=true;Object.assign(window.atoll.simulation,s);},id);
 const count=await page.evaluate(()=>window.atoll.simulation.section.entities.length),box=await page.locator('#reef').boundingBox(),screen=p=>({x:box.x+p.x/1600*box.width,y:box.y+(p.y+55)/900*box.height});await page.keyboard.press('Escape');let captured=false,complete=false;
 const end=Date.now()+75000;
 while(Date.now()<end){
  const state=await page.evaluate(async()=>{const {schoolNeighbors}=await import('/src/school-activity.js'),s=window.atoll.simulation,p=s.player,group=s.section.entities.filter(e=>e.alive&&e.species.id===p.species.id),trip=s.adventure.school;
   if(s.adventure.complete)return {complete:true};
   if(group.length&&(trip?.neighborMeal||!trip&&!p.target&&schoolNeighbors(s).length<2))return {action:'move',x:group.reduce((n,e)=>n+e.x,0)/group.length,y:group.reduce((n,e)=>n+e.y,0)/group.length,trip};
   if(trip){const f=s.section.food.find(f=>f.id===trip.patch);return {action:'move',x:f.x,y:f.y,trip};}
   if(!p.target){const f=s.section.food.filter(f=>f.food==='plankton'&&f.regrow<=0).sort((a,b)=>group.filter(e=>Math.hypot(e.x-b.x,e.y-b.y)<240).length-group.filter(e=>Math.hypot(e.x-a.x,e.y-a.y)<240).length||Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(p.x-b.x,p.y-b.y))[0];if(f)return {action:'eat',x:f.x,y:f.y};}return {};
  });
  if(state.complete){complete=true;break;}
  if(state.trip&&!captured){await page.keyboard.press('Escape');await page.screenshot({path:`artifacts/school-${id}-${width}-meal.png`});await page.keyboard.press('Escape');captured=true;}
  if(state.action){const pt=screen(state);if(state.action==='eat')await page.mouse.click(pt.x,pt.y);else await page.mouse.move(pt.x,pt.y);}
  await page.waitForTimeout(500);
 }
 expect(complete).toBe(true);await page.keyboard.press('Escape');const result=await page.evaluate(()=>({count:window.atoll.simulation.section.entities.length,trip:window.atoll.simulation.adventure.school,journal:window.atoll.journal.discoveries}));expect(result.count).toBe(count);expect(result.trip.neighborMeal).toBe(true);expect(result.journal).toContain(discovery);await page.screenshot({path:`artifacts/school-${id}-${width}-complete.png`});
});
