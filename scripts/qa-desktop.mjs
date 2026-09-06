import {_electron as electron} from '@playwright/test';
import fs from 'node:fs';
const executable=process.argv[2];
const app=await electron.launch({...(executable?{executablePath:executable}:{args:['.']}),env:{...process.env,ATOLL_QA:'1'}});
const page=await app.firstWindow();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.waitForFunction(()=>window.atoll?.renderer.ready);await page.getByRole('button',{name:/Practice Choose/}).click();await page.getByRole('button',{name:'Enter the reef'}).click();await page.waitForFunction(()=>window.atoll.audio.music?.readyState>=3);
const report=await page.evaluate(()=>({origin:location.origin,ready:window.atoll.renderer.ready,mode:window.atoll.simulation.mode,musicReady:window.atoll.audio.music.readyState,nodeExposed:typeof window.require!=='undefined',species:window.atoll.renderer.sprites.length}));
await page.screenshot({path:'artifacts/desktop-native.png'});console.log(JSON.stringify({report,errors}));fs.writeFileSync('artifacts/desktop-report.json',JSON.stringify({report,errors},null,2));await app.close();if(errors.length||!report.ready||report.musicReady<3||report.nodeExposed)process.exitCode=1;
