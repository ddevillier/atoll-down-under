import {test,expect} from '@playwright/test';
import {clickButton} from '../../scripts/ui-actions.mjs';

test('settings update and mute a real playing effect without reviving it on unmute',async({page})=>{
 test.setTimeout(30000);
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/');await page.waitForFunction(()=>window.atoll?.renderer.ready);
 await clickButton(page,{name:'Settings',exact:true});
 await expect(page.getByLabel('Enable audio',{exact:true})).toBeChecked();
 // Use the production effect path and packaged recovery clip. Slowing this one
 // clip keeps it alive across UI actions without looping it or mocking Audio.
 await page.evaluate(()=>{
  const audio=window.atoll.audio;audio.effect('recover',.5);
  const clip=[...audio.effects.keys()].find(a=>a.src.endsWith('/clean.ogg'));
  if(!clip)throw Error('Recovery effect was not created');
  clip.playbackRate=.25;window.__audit27Clip=clip;
 });
 await expect.poll(()=>page.evaluate(()=>{
  const clip=window.__audit27Clip;
  return clip instanceof HTMLAudioElement&&!clip.paused&&clip.readyState>=3&&clip.currentTime>0;
 })).toBe(true);
 expect(await page.evaluate(()=>window.__audit27Clip.volume)).toBeCloseTo(.275,6);

 const volume=page.getByRole('slider',{name:'Sound effects',exact:true});
 await volume.focus();await volume.press('Home');await volume.press('ArrowRight');
 await expect(volume).toHaveValue('0.01');
 await expect.poll(()=>page.evaluate(()=>window.__audit27Clip.volume)).toBeCloseTo(.005,6);
 expect(await page.evaluate(()=>window.__audit27Clip.paused)).toBe(false);

 await page.getByLabel('Enable audio',{exact:true}).uncheck();
 const stopped=await page.evaluate(()=>({paused:window.__audit27Clip.paused,volume:window.__audit27Clip.volume,time:window.__audit27Clip.currentTime,count:window.atoll.audio.effects.size}));
 expect(stopped.paused).toBe(true);expect(stopped.volume).toBe(0);expect(stopped.count).toBe(0);
 await page.getByLabel('Enable audio',{exact:true}).check();
 await page.waitForTimeout(150);
 expect(await page.evaluate(()=>window.__audit27Clip.paused)).toBe(true);
 expect(await page.evaluate(()=>window.__audit27Clip.currentTime)).toBe(stopped.time);

 await page.evaluate(()=>{
  const audio=window.atoll.audio;audio.effect('mimic-bite');
  window.__audit27Next=[...audio.effects.keys()].find(a=>a.src.endsWith('/bite.ogg'));
  if(!window.__audit27Next)throw Error('Fresh bite effect was not created');
  window.__audit27Next.playbackRate=.25;
 });
 await expect.poll(()=>page.evaluate(()=>{
  const clip=window.__audit27Next;
  return clip instanceof HTMLAudioElement&&!clip.paused&&clip.readyState>=3&&clip.currentTime>0;
 })).toBe(true);
 await page.evaluate(()=>window.atoll.audio.stopEffects());
 expect(errors).toEqual([]);
 // These assertions verify browser media state and decoding, not perceptual
 // listening quality or whether the host's physical speakers are audible.
});
