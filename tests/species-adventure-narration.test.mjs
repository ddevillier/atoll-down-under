import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {REEF_STORIES,STORY_REFLECTIONS} from '../src/reef-story-data.js';
import {DiscoveryNarration} from '../src/discovery-narration.js';
const catalog=JSON.parse(fs.readFileSync(new URL('../src/discovery-narration-catalog.json',import.meta.url)));
const provenance=JSON.parse(fs.readFileSync(new URL('../assets/audio/narration/species-adventures-provenance.json',import.meta.url)));
const keys=['housekeeper','lookout','walker','nest','crevice','shade','lantern'];
test('all seven story reflections and manual instructions resolve to verified offline speech',()=>{
 const ids=[];
 for(const key of keys){
  const story=REEF_STORIES[key],reflection=catalog.discoveries[story.id],help=catalog.help[key];assert.equal(reflection.text,STORY_REFLECTIONS[key]);assert.ok(help.text.length>50);assert.deepEqual(reflection.species,story.species);
  for(const cue of [reflection,help]){
   ids.push(cue.id);const clip=provenance.clips[cue.id.split('/').at(-1)];assert.equal(clip.text,cue.text);assert.equal(cue.audioHash,clip.audioHash);assert.equal(cue.duration,clip.duration);assert.equal(cue.provenance,'assets/audio/narration/species-adventures-provenance.json');assert.equal(clip.model,'gpt-4o-mini-tts-2025-12-15');assert.equal(clip.voice,'marin');assert.equal(clip.decodeVerified,true);assert.equal(clip.transcriptMatches,true);assert.equal(clip.humanReviewed,false);
   const bytes=fs.readFileSync(new URL('../assets/audio/narration/'+cue.id+'.ogg',import.meta.url));assert.equal(bytes.toString('ascii',0,4),'OggS');assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),clip.audioHash);
  }
 }
 assert.equal(new Set(ids).size,14);
});
test('earned stories queue their reflection while manual instructions never enter automatic commentary',()=>{
 const audio={enabled:true,narrationVolume:.85},controller=new DiscoveryNarration({audio,catalog,now:()=>0,maxQueue:10});
 for(const key of keys){const id=REEF_STORIES[key].id;assert.equal(controller.discover(id,{fresh:true}),true);assert.equal(controller.discover(id,{fresh:true}),false);}
 assert.equal(controller.queue.length,7);assert.ok(controller.queue.every(cue=>cue.id.endsWith('-reflection')));assert.equal(controller.discover('housekeeper',{fresh:true}),false);
});
