import {clickButton} from './ui-actions.mjs';
import {_electron as electron,expect} from '@playwright/test';
import fs from 'node:fs';
const executable=process.argv[2];
const app=await electron.launch({...(executable?{executablePath:executable}:{args:['.']}),env:{...process.env,ATOLL_QA:'1'}});
try{
const isolatedProfile=await app.evaluate(({app})=>/[\\/]atoll-qa-/.test(app.getPath('userData')));
if(!isolatedProfile){throw new Error('Native QA must use isolated storage before it enters a dive.');}
const page=await app.firstWindow();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.waitForFunction(()=>window.atoll?.renderer.ready);
const fullscreenStartup=await app.evaluate(({BrowserWindow,screen})=>{const w=BrowserWindow.getAllWindows()[0],b=w.getBounds(),d=screen.getDisplayMatching(b).bounds;return {active:w.isFullScreen(),bounds:b,display:d,coversDisplay:b.x===d.x&&b.y===d.y&&b.width===d.width&&b.height===d.height};});
await page.keyboard.press('F11');
await expect.poll(()=>app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].isFullScreen())).toBe(false);
await expect(page.locator('[data-action="fullscreen"]')).toHaveText('Fullscreen');
await clickButton(page,{name:'Fullscreen',exact:true});
await expect.poll(()=>app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].isFullScreen())).toBe(true);
await expect(page.locator('[data-action="fullscreen"]')).toHaveText('Leave fullscreen');
await page.waitForFunction(()=>window.atoll?.renderer.ready);await page.screenshot({path:'artifacts/desktop-splash.png'});await clickButton(page,{name:/Practice Choose/});await clickButton(page,{name:'Enter the reef'});await page.waitForFunction(()=>window.atoll.audio.music?.readyState>=3);
const report=await page.evaluate(()=>({origin:location.origin,ready:window.atoll.renderer.ready,splashReady:window.atoll.renderer.splash?.naturalWidth>1000,mode:window.atoll.simulation.mode,musicReady:window.atoll.audio.music.readyState,nodeExposed:typeof window.require!=='undefined',species:window.atoll.renderer.sprites.length}));
report.fullscreenStartup=fullscreenStartup;
const revision=await page.evaluate(async()=>{
 const {NATURAL_HISTORY}=await import(new URL('src/natural-history.js',location.href).href);
 const {POPULATIONS}=await import(new URL('src/populations.js',location.href).href);
 const {Simulation}=await import(new URL('src/simulation.js',location.href).href);
 const s=window.atoll.simulation,counts=s.sections.map(r=>r.entities.length);
 const scored=new Simulation(42);scored.start('practice','s1');scored.mode='tournament';scored.score=9000;scored.stageScore=4900;
 scored.consume(scored.section.food.find(f=>f.food==='sponge'));
 return {factCount:Object.keys(NATURAL_HISTORY).length,counts,outerBlueChance:POPULATIONS[2].secondHunter,
  factsVerified:Object.keys(NATURAL_HISTORY).length===64,
  populationsVerified:counts[8]<counts[4]&&counts[7]<counts[1]&&POPULATIONS[2].secondHunter===.45,
  scoringVerified:scored.score===8500&&scored.stageScore===4400};
});
Object.assign(report,revision);
await page.keyboard.press('Escape');
report.fullscreenVerified=fullscreenStartup.active&&fullscreenStartup.coversDisplay&&await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].isFullScreen());
await page.keyboard.press('Escape');
await page.screenshot({path:'artifacts/desktop-native.png'});
// Verify mouse steering through the packaged app, in the isolated QA dive.
const target=await page.evaluate(()=>{
 const s=window.atoll.simulation,f=s.section.food.find(f=>f.food==='algae');
 s.section.entities=[];s.section.food=[f];f.x=300;f.y=300;
 Object.assign(s.player,{x:800,y:300,angle:Math.PI});s.point(800,300);
 return f.id;
});
const box=await page.locator('#reef').boundingBox();
await page.mouse.click(box.x+300/1600*box.width,box.y+355/900*box.height);
await page.waitForFunction(id=>window.atoll.simulation.player.target===id,target);
await expect(page.locator('.diet-reminder')).toContainText('Plankton · Algae');
await expect(page.locator('#state-badge')).toContainText('Approaching Algae');
report.feedingFeedbackVerified=true;
await page.mouse.move(box.x+1100/1600*box.width,box.y+355/900*box.height);
await page.waitForFunction(()=>window.atoll.simulation.player.target===null&&window.atoll.simulation.player.x>850);
report.mouseSteeringVerified=true;
// Exercise the visible edge target and following animal in the packaged build.
await page.evaluate(async()=>{
 const {BY_ID}=await import(new URL('src/data.js',location.href).href);
 const s=window.atoll.simulation,p=s.player,prototype=s.sections.flatMap(r=>r.entities).find(e=>e.species.diet.includes('fish'));
 const hunter=structuredClone(prototype);
 hunter.species=BY_ID.s50;
 for(const section of s.sections){section.entities=[];section.food=[];}
 s.current=4;s.protected=false;
 Object.assign(p,{x:1480,y:350,angle:Math.PI*10,health:100,energy:100,biteDamage:0,poisonDamage:0});s.point(p.x,p.y);
 Object.assign(hunter,{id:'travel-hunter',x:1260,y:350,angle:0,target:'player',pursuit:0,satiated:0,rest:0,think:1,health:100,alive:true});s.section.entities=[hunter];
 const transition=Object.getPrototypeOf(s).transition;
 s.transition=function(dx,dy){
  const before=Math.hypot(hunter.x-p.x,hunter.y-p.y),changed=transition.call(this,dx,dy);
  if(changed)window.travelCrossing={before,after:Math.hypot(hunter.x-p.x,hunter.y-p.y),entering:hunter.entering};
  return changed;
 };
});
await page.mouse.move(box.x+1586/1600*box.width,box.y+405/900*box.height);
await page.waitForFunction(()=>window.atoll.simulation.current===5);
await page.keyboard.press('Escape');
report.edgeTravelVerified=await page.evaluate(()=>{const s=window.atoll.simulation,c=window.travelCrossing;return s.paused&&s.player.biteDamage===0&&c?.entering===true&&c.after>180&&Math.abs(c.after-c.before)<1e-8;});
await page.screenshot({path:'artifacts/desktop-travel.png'});
// Check the new feeding choices through the native menus and ordinary click.
await clickButton(page,{name:'Atoll',exact:true});await clickButton(page,{name:/Practice Choose/});
await page.getByRole('searchbox').fill('Spotted pufferfish');await page.getByRole('option').click();await clickButton(page,{name:'Enter the reef'});
const shell=await page.evaluate(()=>{
 const s=window.atoll.simulation,crab=s.section.entities.find(e=>e.species.id==='s46');
 s.section.entities=[crab];s.section.food=[];Object.assign(s.player,{x:crab.x-160,y:crab.y,angle:0,energy:40});s.point(s.player.x,s.player.y);
 return {id:crab.id,x:crab.x,y:crab.y};
});
await page.mouse.click(box.x+shell.x/1600*box.width,box.y+(shell.y+55)/900*box.height);
await page.waitForFunction(id=>!window.atoll.simulation.section.entities.find(e=>e.id===id).alive,shell.id,{timeout:15000});
report.shellfishFeedingVerified=await page.evaluate(()=>window.atoll.simulation.player.energy>48);
await clickButton(page,{name:'Atoll',exact:true});await clickButton(page,{name:/Practice Choose/});
await page.getByRole('searchbox').fill('Clown triggerfish');await page.getByRole('option').click();await clickButton(page,{name:'Enter the reef'});
await expect(page.locator('.passive-ability')).toContainText('Always active');await expect(page.locator('[data-action="ability"]')).toHaveCount(0);
await page.keyboard.press('Space');await expect(page.locator('.toast')).toContainText('Crushing jaws are always available');
report.passiveJawsVerified=await page.evaluate(()=>{const s=window.atoll.simulation;return s.protected&&s.player.energy===100&&s.player.cooldown===0;});
await page.screenshot({path:'artifacts/desktop-feeding-adaptations.png'});
// The optional map plans a route without taking over the fish's movement.
await page.getByRole('button',{name:/Open reef map/}).click();
await expect(page.locator('.reef-map-tile')).toHaveCount(9);
const mapBefore=await page.evaluate(()=>{const s=window.atoll.simulation;return {current:s.current,x:s.player.x,y:s.player.y};});
const destination=(mapBefore.current+1)%9;
await page.locator(`.reef-map-tile[data-reef="${destination}"]`).click();
await page.screenshot({path:'artifacts/desktop-reef-map.png'});
await clickButton(page,{name:'Guide my swim'});
report.reefMapVerified=await page.evaluate(({mapBefore,destination})=>{const s=window.atoll.simulation;return s.destination===destination&&s.current===mapBefore.current&&s.player.x===mapBefore.x&&s.player.y===mapBefore.y;},{mapBefore,destination});
await expect(page.locator('#state-badge')).toContainText('Swim');
await page.keyboard.press('m');await clickButton(page,{name:'Clear route'});
report.reefMapVerified&&=await page.evaluate(()=>window.atoll.simulation.destination===null);
await page.keyboard.press('Escape');await expect(page.locator('#reef')).toBeFocused();
console.log(JSON.stringify({report,isolatedProfile,errors}));fs.writeFileSync('artifacts/desktop-report.json',JSON.stringify({report,isolatedProfile,errors},null,2));if(errors.length||!report.fullscreenVerified||!report.ready||!report.splashReady||report.musicReady<3||report.nodeExposed||!report.mouseSteeringVerified||!report.feedingFeedbackVerified||!report.edgeTravelVerified||!report.shellfishFeedingVerified||!report.passiveJawsVerified||!report.reefMapVerified||!report.factsVerified||!report.populationsVerified||!report.scoringVerified)process.exitCode=1;

}finally{await app.close();}
