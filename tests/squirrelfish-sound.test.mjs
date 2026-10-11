import test from 'node:test';
import assert from 'node:assert/strict';
import {playShadePulse} from '../src/squirrelfish-sound.js';
import {Soundscape} from '../src/audio.js';
function context({state='running',stereo=true,fail=false}={}){
 const nodes=[],parameter=()=>({events:[],setValueAtTime(...a){this.events.push(['set',...a]);},linearRampToValueAtTime(...a){this.events.push(['linear',...a]);},exponentialRampToValueAtTime(...a){this.events.push(['exponential',...a]);}});
 const node=kind=>{const n={kind,connections:[],disconnected:0,connect(target){if(fail)throw Error('Unavailable output');this.connections.push(target);},disconnect(){this.disconnected++;},gain:parameter(),frequency:parameter(),Q:parameter(),pan:parameter(),start(t){this.started=t;},stop(t){this.stopped=t;}};nodes.push(n);return n;};
 const ctx={state,currentTime:5,nodes,destination:{},createOscillator:()=>node('oscillator'),createBiquadFilter:()=>node('filter'),createGain:()=>node('gain')};
 if(stereo)ctx.createStereoPanner=()=>node('panner');return ctx;
}
test('pulse has bounded quiet output, spatial position and brief release',()=>{
 const ctx=context(),pulse=playShadePulse(ctx,{pan:9,gain:1}),[osc,filter,gain,panner]=ctx.nodes;
 assert.ok(pulse);assert.equal(pulse.node,gain);assert.equal(panner.pan.events[0][1],1);assert.equal(gain.gain.events[1][1],.12);assert.equal(osc.stopped,5.24);assert.equal(filter.type,'lowpass');assert.equal(gain.gain.events.at(-1)[1],0);
 osc.onended();for(const n of ctx.nodes)assert.equal(n.disconnected,1);assert.equal(osc.onended,null);pulse.cleanup();for(const n of ctx.nodes)assert.equal(n.disconnected,1);
});
test('muted or unavailable context cannot allocate or start an audible node',()=>{
 for(const opts of [{state:'suspended'},{state:'closed'}]){const ctx=context(opts);assert.equal(playShadePulse(ctx),null);assert.equal(ctx.nodes.length,0);}
 const ctx=context();for(const gain of [0,-1,NaN])assert.equal(playShadePulse(ctx,{gain}),null);assert.equal(ctx.nodes.length,0);assert.equal(playShadePulse(null),null);
});
test('very low effects gain never rises above its requested peak during release',()=>{
 const ctx=context(),pulse=playShadePulse(ctx,{gain:.00001}),events=pulse.node.gain.events;assert.ok(events[2][1]<events[1][1]);pulse.cleanup();
});
test('cancellation releases every node and mono fallback stays usable',()=>{
 const ctx=context({stereo:false}),pulse=playShadePulse(ctx);assert.ok(pulse);assert.equal(ctx.nodes.length,3);assert.equal(pulse.node.connections[0],ctx.destination);pulse.cleanup();for(const n of ctx.nodes)assert.equal(n.disconnected,1);
 const failed=context({fail:true});assert.equal(playShadePulse(failed),null);for(const n of failed.nodes)assert.equal(n.disconnected,1);
});
function soundscapeFixture({pending=false}={}){
 const originalContext=globalThis.AudioContext,originalAudio=globalThis.Audio,contexts=[];
 globalThis.Audio=class{constructor(){this.paused=true;}play(){this.paused=false;return Promise.resolve();}pause(){this.paused=true;}};
 globalThis.AudioContext=class{constructor(){Object.assign(this,context({state:pending?'suspended':'running'}));contexts.push(this);}resume(){if(pending)return new Promise(resolve=>{this.finishResume=()=>{this.state='running';resolve();};});this.state='running';return Promise.resolve();}suspend(){this.state='suspended';return Promise.resolve();}};
 const audio=new Soundscape();audio.setTrack('glasswater');
 return {audio,contexts,restore(){audio.stopEffects();audio.music?.pause();clearInterval(audio.fade);globalThis.AudioContext=originalContext;globalThis.Audio=originalAudio;}};
}
test('Soundscape requires an actual unlock gesture and applies effects gain and pan',async()=>{
 const f=soundscapeFixture();try{
  await Promise.resolve();await Promise.resolve();assert.equal(await f.audio.playShadePulse(),false);assert.equal(f.contexts.length,0);
  f.audio.unlock();f.audio.update({effectsVolume:.2});assert.equal(f.contexts.length,0);assert.equal(await f.audio.playShadePulse({pan:-.75}),true);
  const ctx=f.contexts[0];assert.ok(Math.abs(ctx.nodes[2].gain.events[1][1]-.014)<1e-10);assert.equal(ctx.nodes[3].pan.events[0][1],-.75);assert.equal(f.audio.shadePulses.size,1);
  f.audio.stopEffects();assert.equal(f.audio.shadePulses.size,0);assert.equal(ctx.state,'suspended');for(const n of ctx.nodes)assert.equal(n.disconnected,1);
 }finally{f.restore();}
});
test('mute, zero effects and pause cancel pulses; resume never replays an old cue',async()=>{
 const f=soundscapeFixture();try{
  f.audio.unlock();assert.equal(await f.audio.playShadePulse(),true);f.audio.update({sound:false});assert.equal(await f.audio.playShadePulse(),false);assert.equal(f.audio.shadePulses.size,0);
  f.audio.update({sound:true,effectsVolume:0});assert.equal(await f.audio.playShadePulse(),false);f.audio.update({effectsVolume:.55});assert.equal(await f.audio.playShadePulse(),true);
  f.audio.setPaused(true);assert.equal(f.audio.shadePulses.size,0);assert.equal(await f.audio.playShadePulse(),false);f.audio.setPaused(false);assert.equal(f.audio.shadePulses.size,0);assert.equal(await f.audio.playShadePulse(),true);
 }finally{f.restore();}
});
test('a pending context resume cannot start after mute even if it resolves late',async()=>{
 const f=soundscapeFixture({pending:true});try{
  f.audio.unlock();const start=f.audio.playShadePulse();const ctx=f.contexts[0];f.audio.update({sound:false});ctx.finishResume();assert.equal(await start,false);assert.equal(ctx.nodes.length,0);assert.equal(ctx.state,'suspended');
 }finally{f.restore();}
});
test('event gain conversion respects effects volume and the synthesized peak cap',async()=>{
 const f=soundscapeFixture();try{
  f.audio.unlock();assert.equal(await f.audio.playShadePulse({gain:.09/.07}),true);assert.ok(Math.abs(f.contexts[0].nodes[2].gain.events[1][1]-.09*.55)<1e-10);
  f.audio.update({effectsVolume:1});assert.equal(await f.audio.playShadePulse({gain:.14/.07}),true);assert.equal(f.contexts[0].nodes[6].gain.events[1][1],.12);
 }finally{f.restore();}
});
test('pausing effects permits manual help narration in its modal',async()=>{
 const f=soundscapeFixture();try{f.audio.unlock();f.audio.setPaused(true);assert.equal(await f.audio.playNarration('discoveries/coral-housekeeper-help',{source:'manual'}),true);assert.equal(f.audio.narrationSource,'manual');f.audio.stopNarration();}finally{f.restore();}
});
test('paused settings preserve real effect playback, live volume and mute cancellation',async()=>{
 const f=soundscapeFixture();try{
  f.audio.unlock();f.audio.effect('recover',.5);await Promise.resolve();const clip=[...f.audio.effects.keys()][0];assert.ok(clip);assert.equal(clip.paused,false);
  f.audio.setPaused(true);assert.equal(clip.paused,false);assert.equal(f.audio.effects.size,1);assert.equal(await f.audio.playShadePulse(),false);
  f.audio.update({effectsVolume:.01});assert.equal(clip.volume,.005);assert.equal(clip.paused,false);
  f.audio.update({sound:false});assert.equal(clip.paused,true);assert.equal(clip.volume,0);assert.equal(f.audio.effects.size,0);
  f.audio.update({sound:true,effectsVolume:.01});assert.equal(clip.paused,true);f.audio.effect('mimic-bite');await Promise.resolve();const fresh=[...f.audio.effects.keys()][0];assert.ok(fresh);assert.equal(fresh.paused,false);assert.equal(fresh.volume,.01);
 }finally{f.restore();}
});
