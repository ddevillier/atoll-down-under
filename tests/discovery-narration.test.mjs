import test from 'node:test';
import assert from 'node:assert/strict';
import {DiscoveryNarration} from '../src/discovery-narration.js';
const flush=()=>new Promise(r=>setImmediate(r));
function fixture(){
 let time=0;const calls=[],audio={enabled:true,narrationVolume:.85,unlocked:true,narration:null,narrationSource:null,async playNarration(id,{source}){calls.push(id);this.narration={id};this.narrationSource=source;return true;},stopNarration(){this.narration=null;this.narrationSource=null;}};
 const catalog={introductions:{s1:{id:'discoveries/intro-s1'},s2:'discoveries/intro-s2'},discoveries:Object.fromEntries(['a','b','c','d','e','f'].map(id=>[id,'discoveries/'+id])),achievements:{meal:'discoveries/meal'}};
 const controller=new DiscoveryNarration({audio,catalog,now:()=>time});const state={home:false,modal:null,paused:false,alive:true,trial:false,settings:{sound:true,narrationVolume:.85,automaticNarration:true}};
 return {audio,controller,state,calls,setTime:value=>time=value,tick:()=>controller.update(state)};
}
test('journal seeding and import synchronization never replay past discoveries or achievements',async()=>{
 const f=fixture();f.controller.syncJournal({discoveries:['a'],earned:{meal:'date'}});assert.equal(f.controller.discover('a',{fresh:true}),false);assert.equal(f.controller.achievement('meal',{fresh:true}),false);
 f.controller.discover('b',{fresh:true});f.tick();await flush();assert.deepEqual(f.calls,['discoveries/b']);f.audio.stopNarration();f.setTime(50000);f.tick();
 f.controller.syncJournal({discoveries:['c'],earned:{}});assert.equal(f.controller.discover('c',{fresh:true}),false);assert.equal(f.controller.discover('b',{fresh:true}),false);assert.equal(f.controller.discover('d'),false);assert.equal(f.controller.queue.length,0);
});
test('introductions wait for settling, occur once per session, and save loads stay quiet',async()=>{
 const f=fixture();assert.equal(f.controller.enterSpecies('s1'),true);f.tick();await flush();assert.equal(f.calls.length,0);f.setTime(2000);f.tick();await flush();assert.deepEqual(f.calls,['discoveries/intro-s1']);assert.ok(f.controller.introductions.has('s1'));
 assert.equal(f.controller.enterSpecies('s1'),false);assert.equal(f.controller.enterSpecies('s2',{resume:true}),false);f.audio.stopNarration();f.setTime(50000);f.tick();await flush();assert.equal(f.calls.length,1);
});
test('muted and disabled preferences neither speak nor count an introduction as heard',async()=>{
 for(const settings of [{sound:false},{narrationVolume:0},{automaticNarration:false}]){
  const f=fixture();Object.assign(f.state.settings,settings);f.controller.enterSpecies('s1');f.controller.discover('a',{fresh:true});f.setTime(2000);f.tick();await flush();assert.equal(f.calls.length,0);assert.equal(f.controller.introductions.size,0);assert.equal(f.controller.attemptedIntroductions.size,0);assert.equal(f.controller.queue.length,0);
  Object.assign(f.state.settings,{sound:true,narrationVolume:.85,automaticNarration:true});f.tick();assert.equal(f.controller.enterSpecies('s1'),true);f.setTime(4000);f.tick();await flush();assert.deepEqual(f.calls,['discoveries/intro-s1']);assert.equal(f.controller.discover('a',{fresh:true}),false);
 }
});
test('meaningful discoveries precede introductions and bounded overflow drops stale chatter',async()=>{
 const f=fixture();f.controller.enterSpecies('s1');for(const id of ['a','b','c','d','e','f'])f.controller.discover(id,{fresh:true});assert.equal(f.controller.queue.length,4);assert.deepEqual(f.controller.queue.map(c=>c.key),['a','b','c','d']);f.tick();await flush();assert.deepEqual(f.calls,['discoveries/a']);f.audio.stopNarration();f.setTime(35000);f.tick();await flush();assert.equal(f.calls.length,1);assert.equal(f.controller.queue.length,0);
});
test('pause and menus stop automatic speech, defer pending discoveries, and respect quiet spacing',async()=>{
 const f=fixture();f.controller.discover('a',{fresh:true});f.tick();await flush();f.controller.discover('b',{fresh:true});f.state.paused=true;f.tick();assert.equal(f.audio.narration,null);f.setTime(3000);f.tick();await flush();assert.equal(f.calls.length,1);
 f.state.paused=false;f.tick();await flush();assert.equal(f.calls.length,1);f.setTime(12000);f.tick();await flush();assert.deepEqual(f.calls,['discoveries/a','discoveries/b']);f.state.modal='guide';f.tick();assert.equal(f.audio.narration,null);
});
test('explicit guide speech wins and is never stopped by automatic cancellation',async()=>{
 const f=fixture();f.audio.narration={id:'s1'};f.audio.narrationSource='manual';f.controller.discover('a',{fresh:true});f.tick();await flush();assert.equal(f.calls.length,0);f.state.modal='guide';f.tick();assert.equal(f.audio.narration.id,'s1');f.state.home=true;f.tick();assert.equal(f.audio.narration.id,'s1');assert.equal(f.controller.queue.length,0);
});
test('home, death, trial and audio opt-out discard outstanding automatic cues',async()=>{
 for(const patch of [{home:true},{alive:false},{trial:true},{settings:{automaticNarration:false}}]){
  const f=fixture();f.controller.discover('a',{fresh:true});f.tick();await flush();f.controller.discover('b',{fresh:true});Object.assign(f.state,patch);f.tick();assert.equal(f.audio.narration,null);assert.equal(f.controller.queue.length,0);
 }
});
test('cancelled asynchronous start cannot consume a muted introduction or restart speech',async()=>{
 const f=fixture();f.controller.enterSpecies('s1');f.setTime(2000);f.tick();f.state.settings.narrationVolume=0;f.tick();await flush();assert.equal(f.calls.length,0);assert.equal(f.controller.introductions.size,0);assert.equal(f.controller.attemptedIntroductions.size,0);
});
test('blocked or missing offline clips never retry every frame or block another discovery',async()=>{
 const f=fixture();f.audio.playNarration=async id=>{f.calls.push(id);return false;};f.controller.enterSpecies('s1');f.setTime(2000);f.tick();await flush();assert.equal(f.controller.enterSpecies('s1'),false);assert.equal(f.controller.introductions.size,0);f.controller.discover('a',{fresh:true});for(let i=0;i<10;i++)f.tick();await flush();assert.equal(f.calls.length,1);f.setTime(15000);f.tick();await flush();assert.deepEqual(f.calls,['discoveries/intro-s1','discoveries/a']);assert.equal(f.controller.current,null);
});
test('unknown clips, malformed paths, repeat badges and routine events cannot create speech',async()=>{
 const f=fixture();f.controller.catalog.discoveries.bad='../secret';assert.equal(f.controller.discover('bad',{fresh:true}),false);assert.equal(f.controller.enterSpecies('unknown'),false);assert.equal(f.controller.achievement('meal',{fresh:true}),true);assert.equal(f.controller.achievement('meal',{fresh:true}),false);f.tick();await flush();assert.deepEqual(f.calls,['discoveries/meal']);
});
test('entering another dive cancels old speech and queued discoveries; imported records clear pending repeats',async()=>{
 const f=fixture();f.controller.discover('a',{fresh:true});f.tick();await flush();f.controller.discover('b',{fresh:true});f.controller.enterSpecies('s2');assert.equal(f.audio.narration,null);assert.deepEqual(f.controller.queue.map(c=>c.key),['s2']);
 f.controller.discover('c',{fresh:true});f.controller.syncJournal({discoveries:['c']});assert.deepEqual(f.controller.queue.map(c=>c.key),['s2']);f.setTime(2000);f.tick();await flush();assert.deepEqual(f.calls,['discoveries/a']);f.setTime(12000);f.tick();await flush();assert.deepEqual(f.calls,['discoveries/a','discoveries/intro-s2']);
});
