import {test,expect} from '@playwright/test';import {clickButton} from '../../scripts/ui-actions.mjs';
async function start(page,name='Bluestreak cleaner wrasse'){
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);await clickButton(page,{name:/Practice Choose/});await page.getByRole('searchbox').fill(name);await page.getByRole('option').click();await clickButton(page,{name:'Show goal',exact:true});
}
test('spoken activity pauses safely, uses real offline audio, supports stop/replay and returns to play at both sizes',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await start(page);expect(await page.evaluate(()=>window.atoll.audio.narrationSource)).not.toBe('manual');
 for(const [width,height] of [[1600,900],[1024,768]]){
  await page.setViewportSize({width,height});await page.screenshot({path:`artifacts/activity-audio-card-${width}.png`});await clickButton(page,{name:'Hear this activity',exact:true});
  await expect.poll(()=>page.evaluate(()=>window.atoll.audio.narrationState)).toBe('playing');expect(await page.evaluate(()=>window.atoll.audio.narrationId)).toBe('activities/s43');
  const state=await page.evaluate(()=>({time:window.atoll.simulation.time,paused:window.atoll.simulation.paused,ducked:window.atoll.audio.music.volume<window.atoll.audio.musicVolume*.3,ready:window.atoll.audio.narration.readyState}));expect(state.paused).toBe(true);expect(state.ducked).toBe(true);expect(state.ready).toBeGreaterThanOrEqual(3);await page.waitForTimeout(200);expect(await page.evaluate(()=>window.atoll.simulation.time)).toBe(state.time);
  await expect(page.getByRole('dialog')).toContainText('Cleaning does not repair bite wounds or poison');expect(await page.locator('.panel-body').evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true);await page.screenshot({path:`artifacts/activity-audio-help-${width}.png`});
  await clickButton(page,{name:'Stop',exact:true});expect(await page.evaluate(()=>window.atoll.audio.narration)).toBeNull();await clickButton(page,{name:'Play activity',exact:true});await expect.poll(()=>page.evaluate(()=>window.atoll.audio.narrationState)).toBe('playing');
  expect(await page.evaluate(()=>{window.__replayedActivityClip=window.atoll.audio.narration;return {id:window.atoll.audio.narrationId,source:window.atoll.audio.narrationSource,paused:window.__replayedActivityClip.paused};})).toEqual({id:'activities/s43',source:'manual',paused:false});
  await page.keyboard.press('Escape');
  // Closing instructions must stop that exact manual clip. Free exploration may
  // immediately resume a queued, independently earned automatic cue.
  const closed=await page.evaluate(()=>{
   const {audio,discoveryNarration,journal,simulation}=window.atoll,oldClip=window.__replayedActivityClip,catalog=discoveryNarration.catalog;
   const matches=(kind,key)=>{const cue=catalog[kind]?.[key];return (typeof cue==='string'?cue:cue?.id)===audio.narrationId;};
   const allowedAutomatic=matches('introductions',simulation.player.species.id)||journal.discoveries.some(id=>matches('discoveries',id))||Object.keys(journal.earned).some(id=>matches('achievements',id));
   return {oldPaused:oldClip.paused,oldStillCurrent:audio.narration===oldClip,replacementAllowed:!audio.narration||audio.narrationSource==='automatic'&&allowedAutomatic,paused:simulation.paused};
  });
  expect(closed).toEqual({oldPaused:true,oldStillCurrent:false,replacementAllowed:true,paused:false});
 }
 expect(errors).toEqual([]);
});
test('unavailable activity audio retains readable instructions and muted playback can be recovered',async({page})=>{
 await start(page,'Cuttlefish');await page.route('**/assets/audio/narration/activities/s19.ogg',r=>r.abort());await clickButton(page,{name:'Hear this activity',exact:true});await expect(page.locator('#narration-status')).toContainText('Audio unavailable');await expect(page.locator('.guide-narration p')).toContainText('cuttlefish');await clickButton(page,{name:'Return to the reef',exact:true});await page.unroute('**/assets/audio/narration/activities/s19.ogg');
 await clickButton(page,{name:'Settings',exact:true});await page.getByLabel('Enable audio', {exact:true}).uncheck();await clickButton(page,{name:'Done',exact:true});await clickButton(page,{name:'Hear this activity',exact:true});await expect(page.locator('#narration-status')).toContainText('Enable audio');await clickButton(page,{name:'Return to the reef',exact:true});await clickButton(page,{name:'Settings',exact:true});await page.getByLabel('Enable audio',{exact:true}).check();await clickButton(page,{name:'Done',exact:true});await clickButton(page,{name:'Hear this activity',exact:true});await expect.poll(()=>page.evaluate(()=>window.atoll.audio.narrationState)).toBe('playing');await clickButton(page,{name:'Return to the reef',exact:true});
});
