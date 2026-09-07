import test from 'node:test';
import assert from 'node:assert/strict';
import {Soundscape} from '../src/audio.js';
const flush=()=>new Promise(r=>setImmediate(r));
test('blocked same-track audio retries on interaction; mute survives track changes',async()=>{
 const original=globalThis.Audio;let blocked=true,calls=0;
 globalThis.Audio=class{constructor(src){this.src=src;this.paused=true;}pause(){this.paused=true;}async play(){calls++;if(blocked)throw Error('blocked');this.paused=false;}};
 const a=new Soundscape();try{a.setTrack('blue-passage');await flush();assert.equal(a.blocked,true);const music=a.music;blocked=false;a.unlock();await flush();assert.equal(a.music,music);assert.equal(music.paused,false);assert.equal(a.blocked,false);assert.equal(calls,2);a.update({sound:false,musicVolume:.2});assert.equal(music.volume,0);assert.equal(music.paused,true);a.setTrack('glasswater');await flush();assert.equal(calls,2);a.update({sound:true,musicVolume:.2});await flush();assert.equal(a.music.volume,.2);assert.equal(a.music.paused,false);}finally{clearInterval(a.fade);globalThis.Audio=original;}
});
