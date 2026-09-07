import {test,expect} from '@playwright/test';import {clickButton} from '../../scripts/ui-actions.mjs';

test('mouse-driven goatfish meal engages barbels, freezes on pause, and releases after swimming away',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill('Yellow goatfish');await page.getByRole('option').first().click();await clickButton(page,{name:'Enter the reef'});await page.keyboard.press('Escape');
 const meal=await page.evaluate(()=>{const s=window.atoll.simulation;s.player.energy=60;const f=s.section.food.filter(f=>['shrimp','worm'].includes(f.food)&&f.regrow<=0).sort((a,b)=>Math.hypot(a.x-s.player.x,a.y-s.player.y)-Math.hypot(b.x-s.player.x,b.y-s.player.y))[0];return {x:f.x,y:f.y};});const rect=await page.locator('#reef').boundingBox();
 await page.keyboard.press('Escape');await page.mouse.click(rect.x+meal.x/1600*rect.width,rect.y+(meal.y+55)/900*rect.height);await page.waitForFunction(()=>window.atoll.simulation.player.activity==='probing');await page.keyboard.press('Escape');
 const result=await page.evaluate(()=>{const {simulation:s,renderer:r}=window.atoll,states=[],original=r.parts.draw;r.parts.draw=function(c,im,id,w,h,t,effort,state){if(id==='s9')states.push(state.probe);return original.call(this,c,im,id,w,h,t,effort,state);};try{r.draw(s,0);}finally{r.parts.draw=original;}const pose=r.poses.get('player'),a={probe:pose.probe,time:pose.motionTime};r.draw(s,0);return {states,a,b:{probe:pose.probe,time:pose.motionTime}};});
 expect(result.states.some(n=>n>0)).toBe(true);expect(result.b).toEqual(result.a);
 await page.keyboard.press('Escape');await page.mouse.move(rect.x+rect.width*.2,rect.y+rect.height*.25);await page.waitForFunction(()=>window.atoll.simulation.player.target===null&&window.atoll.renderer.poses.get('player').probe<.03);expect(await page.evaluate(()=>window.atoll.simulation.player.activity)).not.toBe('probing');
});

test('a generated inspecting goatfish has a readable activity label clear of its body at both desktop sizes',async({page})=>{
 for(const [width,height] of [[1600,900],[1024,768]]){
  await page.setViewportSize({width,height});await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
  const result=await page.evaluate(async()=>{const {Simulation}=await import('/src/simulation.js'),s=new Simulation(2),r=window.atoll.renderer;s.start('practice','s9');s.point(s.player.x,s.player.y);let e;for(let i=0;i<3600;i++){s.step(1/60);e=s.section.entities.find(e=>e.alive&&e.species.id==='s9'&&e.activity==='probing');if(e)break;}if(!e)throw Error('No natural probing event');s.paused=true;r.hover=e;r.draw(s,1/60);const obstacle=r.labelObstacles.find(o=>o.id===e.id),label=r.labelLayout.find(l=>l.text.includes('Inspecting a meal'));if(!obstacle||!label)return {obstacle:!!obstacle,label:!!label,overlap:Infinity};return {obstacle:true,label:true,overlap:Math.max(0,Math.min(obstacle.x+obstacle.width,label.x+label.width)-Math.max(obstacle.x,label.x))*Math.max(0,Math.min(obstacle.y+obstacle.height,label.y+label.height)-Math.max(obstacle.y,label.y))};});
  expect(result.obstacle).toBe(true);expect(result.label).toBe(true);expect(result.overlap).toBe(0);
 }
});
