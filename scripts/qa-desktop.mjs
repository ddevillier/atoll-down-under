import {clickButton} from './ui-actions.mjs';
import {_electron as electron} from '@playwright/test';
import fs from 'node:fs';
const executable=process.argv[2];
const app=await electron.launch({...(executable?{executablePath:executable}:{args:['.']}),env:{...process.env,ATOLL_QA:'1'}});
const isolatedProfile=await app.evaluate(({app})=>/[\\/]atoll-qa-/.test(app.getPath('userData')));
if(!isolatedProfile){await app.close();throw new Error('Native QA must use isolated storage before it enters a dive.');}
const page=await app.firstWindow();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.waitForFunction(()=>window.atoll?.renderer.ready);await page.screenshot({path:'artifacts/desktop-splash.png'});await clickButton(page,{name:/Practice Choose/});await clickButton(page,{name:'Enter the reef'});await page.waitForFunction(()=>window.atoll.audio.music?.readyState>=3);
const report=await page.evaluate(()=>({origin:location.origin,ready:window.atoll.renderer.ready,splashReady:window.atoll.renderer.splash?.naturalWidth>1000,mode:window.atoll.simulation.mode,musicReady:window.atoll.audio.music.readyState,nodeExposed:typeof window.require!=='undefined',species:window.atoll.renderer.sprites.length}));
await page.screenshot({path:'artifacts/desktop-native.png'});console.log(JSON.stringify({report,isolatedProfile,errors}));fs.writeFileSync('artifacts/desktop-report.json',JSON.stringify({report,isolatedProfile,errors},null,2));await app.close();if(errors.length||!report.ready||!report.splashReady||report.musicReady<3||report.nodeExposed)process.exitCode=1;
