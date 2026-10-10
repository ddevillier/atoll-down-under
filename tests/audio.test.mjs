import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {Soundscape} from '../src/audio.js';
const flush=()=>new Promise(r=>setImmediate(r));
test('blocked same-track audio retries on interaction; mute survives track changes',async()=>{
 const original=globalThis.Audio;let blocked=true,calls=0;
 globalThis.Audio=class{constructor(src){this.src=src;this.paused=true;}pause(){this.paused=true;}async play(){calls++;if(blocked)throw Error('blocked');this.paused=false;}};
 const a=new Soundscape();try{a.setTrack('blue-passage');await flush();assert.equal(a.blocked,true);const music=a.music;blocked=false;a.unlock();await flush();assert.equal(a.music,music);assert.equal(music.paused,false);assert.equal(a.blocked,false);assert.equal(calls,2);a.update({sound:false,musicVolume:.2});assert.equal(music.volume,0);assert.equal(music.paused,true);a.setTrack('glasswater');await flush();assert.equal(calls,2);a.update({sound:true,musicVolume:.2});await flush();assert.equal(a.music.volume,.2);assert.equal(a.music.paused,false);}finally{clearInterval(a.fade);globalThis.Audio=original;}
});

test('live effects follow volume and mute; cancelled playback cannot restart after unmuting',async()=>{
 const original=globalThis.Audio,clips=[];
 globalThis.Audio=class{constructor(src){this.src=src;this.paused=true;clips.push(this);}pause(){this.paused=true;}play(){this.paused=false;return new Promise(resolve=>{this.finishPlay=()=>{this.paused=false;resolve();};});}};
 try{
  const a=new Soundscape();a.unlocked=true;a.effect('ui',.5);a.effect('meal');
  a.update({effectsVolume:.2});assert.equal(clips[0].volume,.1);assert.equal(clips[1].volume,.2);
  a.update({sound:false});for(const clip of clips){assert.equal(clip.paused,true);assert.equal(clip.volume,0);assert.equal(clip.onended,null);assert.equal(clip.onerror,null);}assert.equal(a.effects.size,0);
  a.effect('ui');assert.equal(clips.length,2);a.update({sound:true});
  for(const clip of clips)clip.finishPlay();await flush();
  for(const clip of clips){assert.equal(clip.paused,true);assert.equal(clip.volume,0);}
  a.effect('ui');assert.equal(clips.length,3);assert.equal(clips[2].paused,false);clips[2].finishPlay();await flush();a.stopEffects();
 }finally{globalThis.Audio=original;}
});

test('finished, failed and blocked effects release their lifecycle references',async()=>{
 const original=globalThis.Audio,clips=[];let reject=false;
 globalThis.Audio=class{constructor(src){this.src=src;clips.push(this);}pause(){}play(){return reject?Promise.reject(Error('blocked')):Promise.resolve();}};
 try{
  const a=new Soundscape();a.unlocked=true;a.effect('ui');await flush();clips[0].onended();assert.equal(a.effects.size,0);assert.equal(clips[0].onerror,null);
  a.effect('meal');await flush();clips[1].onerror();assert.equal(a.effects.size,0);assert.equal(clips[1].onended,null);
  reject=true;a.effect('ui');await flush();assert.equal(a.effects.size,0);assert.equal(clips[2].onended,null);assert.equal(clips[2].onerror,null);
 }finally{globalThis.Audio=original;}
});

test('recovery and false-cleaner bite events use existing packaged effects',async()=>{
 const original=globalThis.Audio,clips=[];
 globalThis.Audio=class{constructor(src){this.src=src;clips.push(this);}pause(){}play(){return Promise.resolve();}};
 try{
  const a=new Soundscape();a.unlocked=true;a.effect('recover');a.effect('mimic-bite');await flush();
  assert.deepEqual(clips.map(c=>c.src),['assets/audio/clean.ogg','assets/audio/bite.ogg']);
  for(const clip of clips)assert.ok(existsSync(new URL('../'+clip.src,import.meta.url)),clip.src);a.stopEffects();
 }finally{globalThis.Audio=original;}
});
