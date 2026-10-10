import {test,expect} from '@playwright/test';
import {clickButton} from '../../scripts/ui-actions.mjs';
import {Simulation} from '../../src/simulation.js';
import {exportDive} from '../../src/save-files.js';
test.describe.configure({mode:'parallel'});

async function ready(page,settings={}){
 await page.addInitScript(settings=>{if(!localStorage.getItem('atoll-settings'))localStorage.setItem('atoll-settings',JSON.stringify(settings));},settings);
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready&&window.atoll.discoveryNarration);
 await watch(page);
}
async function watch(page){await page.evaluate(()=>{
 window.__automaticSpeech=[];const audio=window.atoll.audio,play=audio.playNarration;
 audio.playNarration=async function(id,options={}){const started=await play.call(this,id,options);window.__automaticSpeech.push({id,source:options.source||'manual',started});return started;};
});}
async function practice(page,name='Orange coral goby'){
 await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill(name);await page.getByRole('option').first().click();await clickButton(page,{name:'Explore freely',exact:true});
}
async function restored(page){
 const sim=new Simulation(8201);sim.start('practice','s2');
 await clickButton(page,{name:'Saved dives',exact:true});await page.locator('#dive-file').setInputFiles({name:'automatic-audio.atoll',mimeType:'application/json',buffer:Buffer.from(exportDive(sim,'Quiet restore'))});await clickButton(page,{name:'Open dive',exact:true});
}
async function playing(page,{source='automatic',id}={}){
 await expect.poll(()=>page.evaluate(({source,id})=>{const a=window.atoll.audio,c=a.narration;return a.narrationSource===source&&(!id||a.narrationId===id)&&a.narrationState==='playing'&&c instanceof HTMLAudioElement&&!c.paused&&c.readyState>=3&&c.currentTime>0&&c.volume>0;},{source,id}),{timeout:25000}).toBe(true);
}
async function manifestId(page,kind,key){return page.evaluate(({kind,key})=>{const value=window.atoll.discoveryNarration.catalog[kind]?.[key];return typeof value==='string'?value:value?.id;},{kind,key});}
async function earnedDiscovery(page,id='coral-home'){
 // Inject a semantic earned event to isolate the presentation boundary. Journey
 // completion mechanics are covered separately; media playback remains real.
 await page.evaluate(id=>window.atoll.simulation.event('discovery','A home discovered',{value:id}),id);
 await expect.poll(()=>page.evaluate(id=>window.atoll.journal.discoveries.includes(id),id)).toBe(true);
}
async function count(page,source='automatic'){return page.evaluate(source=>window.__automaticSpeech.filter(c=>c.source===source).length,source);}

for(const [width,height] of [[1600,900],[1024,768]])test(`brief species introduction plays real offline audio during free exploration at ${width}`,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width,height});await ready(page);expect(await page.evaluate(()=>window.atoll.state.settings.automaticNarration)).toBe(true);
 const id=await manifestId(page,'introductions','s2');expect(id).toBeTruthy();const response=await page.request.get('/assets/audio/narration/'+id+'.ogg');expect(response.ok()).toBe(true);expect((await response.body()).subarray(0,4).toString()).toBe('OggS');
 await practice(page);await playing(page,{id});const before=await page.evaluate(()=>({time:window.atoll.simulation.time,paused:window.atoll.simulation.paused,music:window.atoll.audio.music.volume,expected:window.atoll.audio.musicVolume*.28}));expect(before.paused).toBe(false);expect(before.music).toBeCloseTo(before.expected,6);
 await page.waitForTimeout(300);expect(await page.evaluate(()=>window.atoll.simulation.time)).toBeGreaterThan(before.time);await expect(page.locator('.toast')).toHaveCount(0);await expect(page.locator('#narration-status')).toHaveCount(0);
 await expect.poll(()=>page.evaluate(()=>window.atoll.audio.narration),{timeout:20000}).toBeNull();expect(await page.evaluate(()=>window.atoll.audio.music.volume)).toBeCloseTo(await page.evaluate(()=>window.atoll.audio.musicVolume),6);expect(await count(page)).toBe(1);expect(await page.evaluate(()=>window.atoll.discoveryNarration.introductions.has('s2'))).toBe(true);expect(errors).toEqual([]);
});

test('a fresh discovery speaks once; routine events, repeated completion, save restore and journal import stay quiet',async({page})=>{
 test.setTimeout(90000);await ready(page);await restored(page);expect(await count(page)).toBe(0);const id=await manifestId(page,'discoveries','coral-home');expect(id).toBeTruthy();await earnedDiscovery(page);await playing(page,{id});
 await page.evaluate(()=>{const s=window.atoll.simulation;for(let i=0;i<5;i++)s.event('discovery','Already found',{value:'coral-home'});s.event('activity-step','Keep exploring');s.event('observation','A fish moved');s.event('eat','A meal eaten');});await page.waitForTimeout(250);expect(await page.evaluate(()=>window.atoll.discoveryNarration.queue.length)).toBe(0);
 await expect.poll(()=>page.evaluate(()=>window.atoll.audio.narration),{timeout:20000}).toBeNull();expect(await count(page)).toBe(1);
 const journal=await page.evaluate(()=>window.atoll.journal);await clickButton(page,{name:'Field guide',exact:true});await clickButton(page,{name:'Family journal',exact:true});await page.locator('#journal-file').setInputFiles({name:'family.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(journal))});await clickButton(page,{name:'Return',exact:true});expect(await page.evaluate(()=>window.atoll.discoveryNarration.queue.length)).toBe(0);
 await clickButton(page,{name:'Atoll',exact:true});await restored(page);await earnedDiscovery(page);await page.waitForTimeout(14000);expect(await count(page)).toBe(1);
 await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready&&window.atoll.discoveryNarration);await watch(page);await restored(page);await earnedDiscovery(page);await page.waitForTimeout(2500);expect(await count(page)).toBe(0);expect(await page.evaluate(()=>window.atoll.discoveryNarration.queue.length)).toBe(0);
});

test('manual guide speech interrupts automatic introduction and keeps priority through modal lifecycle',async({page})=>{
 await ready(page);await practice(page);await playing(page);await page.evaluate(()=>{window.__oldAutomatic=window.atoll.audio.narration;window.__oldAutomatic.playbackRate=.25;});await earnedDiscovery(page);
 await clickButton(page,{name:'Field guide',exact:true});expect(await page.evaluate(()=>window.__oldAutomatic.paused)).toBe(true);await clickButton(page,{name:'Play introduction',exact:true});await playing(page,{source:'manual',id:'s2'});await page.waitForTimeout(300);expect(await page.evaluate(()=>window.atoll.audio.narrationId)).toBe('s2');expect(await count(page,'manual')).toBe(1);
 await clickButton(page,{name:'Return',exact:true});expect(await page.evaluate(()=>window.atoll.audio.narration)).toBeNull();expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(false);expect(await page.evaluate(()=>window.atoll.audio.music.volume)).toBeCloseTo(await page.evaluate(()=>window.atoll.audio.musicVolume),6);
});

test('new recorded accomplishment speaks its real badge clip once without routine progress chatter',async({page})=>{
 await ready(page);await restored(page);const id=await manifestId(page,'achievements','meal');expect(id).toBeTruthy();await page.evaluate(()=>window.atoll.simulation.event('progress','',{kind:'activity',value:'meal'}));await expect.poll(()=>page.evaluate(()=>!!window.atoll.journal.earned.meal)).toBe(true);await playing(page,{id});
 await page.evaluate(()=>{const s=window.atoll.simulation;for(let i=0;i<5;i++)s.event('progress','',{kind:'activity',value:'meal'});});await page.waitForTimeout(250);expect(await count(page)).toBe(1);expect(await page.evaluate(()=>window.atoll.discoveryNarration.queue.length)).toBe(0);await expect(page.locator('.toast')).toHaveCount(0);await page.keyboard.press('Escape');expect(await page.evaluate(()=>window.atoll.audio.narration)).toBeNull();expect(await page.evaluate(()=>window.atoll.audio.music.volume)).toBeCloseTo(await page.evaluate(()=>window.atoll.audio.musicVolume),6);
});

test('pause, menus and home cancel automatic speech and stop stale cues from following a different dive',async({page})=>{
 await ready(page);await practice(page);await playing(page);await page.evaluate(()=>{window.__interrupted=window.atoll.audio.narration;window.__interrupted.playbackRate=.25;});await page.keyboard.press('Escape');await expect.poll(()=>page.evaluate(()=>window.atoll.audio.narration)).toBeNull();expect(await page.evaluate(()=>window.__interrupted.paused)).toBe(true);expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(true);
 await clickButton(page,{name:'Settings',exact:true});await page.getByLabel('Discovery commentary',{exact:true}).uncheck();await clickButton(page,{name:'Done',exact:true});await page.keyboard.press('Escape');await earnedDiscovery(page);await page.waitForTimeout(250);expect(await page.evaluate(()=>window.atoll.discoveryNarration.queue.length)).toBe(0);
 await clickButton(page,{name:'Atoll',exact:true});await practice(page,'Cuttlefish');await page.waitForTimeout(2500);expect(await count(page)).toBe(1);expect(await page.evaluate(()=>window.atoll.state.settings.automaticNarration)).toBe(false);expect(await page.evaluate(()=>window.atoll.audio.narration)).toBeNull();
});

test('zero narration volume does not consume an introduction and turning it up allows a later dive introduction',async({page})=>{
 await ready(page,{narrationVolume:0,automaticNarration:true});await practice(page);await page.waitForTimeout(2500);expect(await count(page)).toBe(0);expect(await page.evaluate(()=>window.atoll.discoveryNarration.introductions.has('s2'))).toBe(false);expect(await page.evaluate(()=>window.atoll.discoveryNarration.attemptedIntroductions.has('s2'))).toBe(false);
 await clickButton(page,{name:'Settings',exact:true});const volume=page.getByRole('slider',{name:'Narration volume',exact:true});await volume.focus();await volume.press('End');await clickButton(page,{name:'Done',exact:true});await clickButton(page,{name:'Atoll',exact:true});await practice(page);await playing(page);expect(await count(page)).toBe(1);expect(await page.evaluate(()=>window.atoll.discoveryNarration.introductions.has('s2'))).toBe(true);
});

test('missing automatic audio releases music without pausing play or retrying each frame',async({page})=>{
 await ready(page);const id=await manifestId(page,'introductions','s2');expect(id).toBeTruthy();await page.route('**/assets/audio/narration/'+id+'.ogg',route=>route.abort());await practice(page);await expect.poll(()=>count(page),{timeout:15000}).toBe(1);expect(await page.evaluate(()=>window.__automaticSpeech[0].started)).toBe(false);expect(await page.evaluate(()=>window.atoll.audio.narration)).toBeNull();expect(await page.evaluate(()=>window.atoll.simulation.paused)).toBe(false);expect(await page.evaluate(()=>window.atoll.audio.music.volume)).toBeCloseTo(await page.evaluate(()=>window.atoll.audio.musicVolume),6);const time=await page.evaluate(()=>window.atoll.simulation.time);await page.waitForTimeout(500);expect(await page.evaluate(()=>window.atoll.simulation.time)).toBeGreaterThan(time);expect(await count(page)).toBe(1);await expect(page.locator('.toast')).toHaveCount(0);
});
test('an existing commentary opt-out survives reload and still allows explicitly requested guide narration',async({page})=>{
 await ready(page,{automaticNarration:false});await practice(page);await earnedDiscovery(page);await page.waitForTimeout(2500);expect(await count(page)).toBe(0);expect(await page.evaluate(()=>window.atoll.discoveryNarration.queue.length)).toBe(0);await clickButton(page,{name:'Field guide',exact:true});await clickButton(page,{name:'Play introduction',exact:true});await playing(page,{source:'manual',id:'s2'});
 await page.reload();await page.waitForFunction(()=>window.atoll?.renderer.ready&&window.atoll.discoveryNarration);await watch(page);expect(await page.evaluate(()=>window.atoll.state.settings.automaticNarration)).toBe(false);await practice(page);await earnedDiscovery(page);await page.waitForTimeout(2500);expect(await count(page)).toBe(0);expect(await page.evaluate(()=>window.atoll.discoveryNarration.introductions.size)).toBe(0);
});
// Media decoding/currentTime/volume are checked here. Speaker audibility and
// listening quality require a separate listening review of the generated clips.
