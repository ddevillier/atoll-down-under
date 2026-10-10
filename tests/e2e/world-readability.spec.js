import {test,expect} from '@playwright/test';
test('world labels clear each other and the player, remain legible, and freeze during inspection',async({page})=>{
 for(const [width,height] of [[1600,900],[1024,768]]){
  await page.setViewportSize({width,height});await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
  const result=await page.evaluate(async()=>{
   const {Simulation}=await import('/src/simulation.js'),{REEFS}=await import('/src/data.js'),{overlaps}=await import('/src/world-labels.js');
   const s=new Simulation(42);s.start('practice','s2');s.paused=true;const r=window.atoll.renderer,site=REEFS[s.current].shelters[0],cleaner=s.section.entities.find(e=>e.species.ability==='clean');
   if(!cleaner)throw Error('Expected a generated cleaner');Object.assign(cleaner,{x:site.x,y:site.y-site.r+14});Object.assign(s.player,{x:site.x+55,y:site.y-site.r-25});
   r.syncScene(s);r.inspect=true;r.hover=cleaner;r.draw(s,0);const first=JSON.stringify({marker:r.playerMarker,labels:r.labelLayout});r.draw(s,0);const second=JSON.stringify({marker:r.playerMarker,labels:r.labelLayout});
   const labels=r.labelLayout,m=r.playerMarker;return {same:first===second,count:labels.length,cleaner:labels.some(l=>l.text.startsWith('Cleaner')),shelter:labels.some(l=>l.text.startsWith('Shelter')),collisions:labels.flatMap((l,i)=>labels.slice(i+1).filter(o=>overlaps(l,o))).length,playerCovered:labels.some(l=>overlaps(l,m)||overlaps(l,m.body)),pixelFont:15*r.uiUnit*r.canvas.getBoundingClientRect().width/1600,inside:labels.every(l=>l.x>=0&&l.y>=0&&l.x+l.width<=1600&&l.y+l.height<=745)};
  });
  expect(result.same).toBe(true);expect(result.cleaner).toBe(true);expect(result.shelter).toBe(true);expect(result.count).toBeGreaterThan(2);expect(result.collisions).toBe(0);expect(result.playerCovered).toBe(false);expect(result.pixelFont).toBeGreaterThanOrEqual(14.9);expect(result.inside).toBe(true);
 }
});

test('inspecting a natural feeding pair keeps labels off both companions',async({page})=>{
 for(const [width,height] of [[1600,900],[1024,768]]){
  await page.setViewportSize({width,height});await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
  const result=await page.evaluate(async()=>{
   const {Simulation}=await import('/src/simulation.js'),{overlaps}=await import('/src/world-labels.js'),s=new Simulation(42),r=window.atoll.renderer;s.start('practice','s8');s.current=0;for(let i=0;i<645;i++)s.step(1/60);s.paused=true;const fish=s.section.entities.find(e=>e.id===1),partner=s.section.entities.find(e=>e.id===fish.ecology?.partner);if(!partner)throw Error('Expected an existing linked pair');r.syncScene(s);r.inspect=true;r.hover=fish;r.draw(s,0);const bodies=[fish,partner].map(e=>r.labelObstacles.find(b=>b.id===e.id));return {protected:bodies.every(Boolean),clear:bodies.every(b=>b&&r.labelLayout.every(l=>!overlaps(l,b))),named:r.labelLayout.some(l=>l.text===fish.species.name)};
  });expect(result.protected).toBe(true);expect(result.clear).toBe(true);expect(result.named).toBe(true);
 }
});
