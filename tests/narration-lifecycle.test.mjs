import test from 'node:test';
import assert from 'node:assert/strict';
import {Soundscape} from '../src/audio.js';
const flush=()=>new Promise(r=>setImmediate(r));
function fixture(play){const original=globalThis.Audio,clips=[];globalThis.Audio=class{constructor(src){this.src=src;this.paused=true;clips.push(this);}pause(){this.paused=true;}play(){return play.call(this);}};const audio=new Soundscape();audio.music={volume:.42};return {audio,clips,restore(){audio.stopNarration();globalThis.Audio=original;}};}
test('automatic speech cannot replace a guide request, but guide requests interrupt it',async()=>{
 const f=fixture(function(){this.paused=false;return Promise.resolve();});try{
  await f.audio.playNarration('s1');assert.equal(await f.audio.playNarration('discoveries/a',{source:'automatic'}),false);assert.equal(f.clips.length,1);assert.equal(f.audio.narrationId,'s1');
  f.audio.stopNarration();await f.audio.playNarration('discoveries/a',{source:'automatic'});const automatic=f.audio.narration;await f.audio.playNarration('s2');assert.equal(automatic.paused,true);assert.equal(f.audio.narrationSource,'manual');assert.equal(f.audio.narrationId,'s2');
 }finally{f.restore();}
});
test('cancelled pending browser play resolves immediately and late success stays cancelled',async()=>{
 const f=fixture(function(){return new Promise(resolve=>{this.resolve=()=>{this.paused=false;resolve();};});});try{
  const started=f.audio.playNarration('discoveries/a',{source:'automatic'});await flush();const clip=f.clips[0];f.audio.stopNarration();assert.equal(await started,false);assert.equal(f.audio.music.volume,.42);clip.resolve();await flush();assert.equal(clip.paused,true);assert.equal(f.audio.narration,null);
 }finally{f.restore();}
});
test('a missing or stalled clip times out and restores music without waiting for browser play',async()=>{
 const f=fixture(function(){return new Promise(()=>{});});try{assert.equal(await f.audio.playNarration('discoveries/a',{source:'automatic',loadTimeoutMs:10}),false);assert.equal(f.audio.narrationState,'unavailable');assert.equal(f.audio.narration,null);assert.equal(f.audio.music.volume,.42);}finally{f.restore();}
});
test('automatic duration guard releases music if a media element never emits ended',async()=>{
 const f=fixture(function(){this.paused=false;return Promise.resolve();});try{assert.equal(await f.audio.playNarration('discoveries/a',{source:'automatic',maxDurationMs:10}),true);assert.equal(f.audio.music.volume,.42*.28);await new Promise(r=>setTimeout(r,25));assert.equal(f.audio.narration,null);assert.equal(f.audio.music.volume,.42);assert.equal(f.clips[0].paused,true);}finally{f.restore();}
});
test('zero volume cannot report successful narration and opt-out cancels automatic speech only',async()=>{
 const f=fixture(function(){this.paused=false;return Promise.resolve();});try{
  f.audio.update({narrationVolume:0});assert.equal(await f.audio.playNarration('s1'),false);assert.equal(f.audio.narrationState,'muted');assert.equal(f.clips.length,0);
  f.audio.update({narrationVolume:.7});await f.audio.playNarration('discoveries/a',{source:'automatic'});f.audio.update({automaticNarration:false,narrationVolume:.7});assert.equal(f.audio.narration,null);assert.equal(f.audio.music.volume,.42);
  await f.audio.playNarration('s1');f.audio.update({automaticNarration:false,narrationVolume:.7});assert.equal(f.audio.narrationId,'s1');assert.equal(f.audio.narration.volume,.7);f.audio.update({narrationVolume:0});assert.equal(f.audio.narration,null);
 }finally{f.restore();}
});
test('invalid offline paths and audio constructor failures remain a silent fallback',async()=>{
 const f=fixture(function(){return Promise.resolve();});try{assert.equal(await f.audio.playNarration('../secret'),false);assert.equal(f.clips.length,0);globalThis.Audio=class{constructor(){throw Error('no audio');}};assert.equal(await f.audio.playNarration('s1'),false);assert.equal(f.audio.narrationState,'unavailable');assert.equal(f.audio.music.volume,.42);}finally{f.restore();}
});
