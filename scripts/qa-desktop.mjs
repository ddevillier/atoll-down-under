import {clickButton} from './ui-actions.mjs';
import {_electron as electron,expect} from '@playwright/test';
import fs from 'node:fs';
const executable=process.argv[2];
const app=await electron.launch({...(executable?{executablePath:executable}:{args:['.']}),env:{...process.env,ATOLL_QA:'1'}});
const isolatedProfile=await app.evaluate(({app})=>/[\\/]atoll-qa-/.test(app.getPath('userData')));
if(!isolatedProfile){await app.close();throw new Error('Native QA must use isolated storage before it enters a dive.');}
const page=await app.firstWindow();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.waitForFunction(()=>window.atoll?.renderer.ready);await page.screenshot({path:'artifacts/desktop-splash.png'});await clickButton(page,{name:/Practice Choose/});await clickButton(page,{name:'Enter the reef'});await page.waitForFunction(()=>window.atoll.audio.music?.readyState>=3);
const report=await page.evaluate(()=>({origin:location.origin,ready:window.atoll.renderer.ready,splashReady:window.atoll.renderer.splash?.naturalWidth>1000,mode:window.atoll.simulation.mode,musicReady:window.atoll.audio.music.readyState,nodeExposed:typeof window.require!=='undefined',species:window.atoll.renderer.sprites.length}));
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
await page.evaluate(()=>{
 const s=window.atoll.simulation,p=s.player,prototype=s.sections.flatMap(r=>r.entities).find(e=>e.species.id==='s50');
 const hunter=structuredClone(prototype);
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
console.log(JSON.stringify({report,isolatedProfile,errors}));fs.writeFileSync('artifacts/desktop-report.json',JSON.stringify({report,isolatedProfile,errors},null,2));await app.close();if(errors.length||!report.ready||!report.splashReady||report.musicReady<3||report.nodeExposed||!report.mouseSteeringVerified||!report.feedingFeedbackVerified||!report.edgeTravelVerified)process.exitCode=1;
