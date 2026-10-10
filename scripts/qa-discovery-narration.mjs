import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {PRACTICE_SPECIES} from '../src/data.js';
import {DISCOVERIES} from '../src/adventures.js';
import {BADGES} from '../src/journal.js';
const catalog=JSON.parse(fs.readFileSync('src/discovery-narration-catalog.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('assets/audio/narration/discoveries/manifest.json','utf8'));
const guides=JSON.parse(fs.readFileSync('src/narration-catalog.json','utf8'));
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const sorted=keys=>[...keys].sort();
assert.deepEqual(sorted(Object.keys(catalog.introductions)),sorted(PRACTICE_SPECIES.map(s=>s.id)),'every playable species has a short introduction');
assert.deepEqual(sorted(Object.keys(catalog.discoveries)),sorted(DISCOVERIES),'every discovery has a reflection');
assert.deepEqual(sorted(Object.keys(catalog.achievements)),sorted(BADGES.map(b=>b.id)),'every accomplishment has a cue');
const cues=['introductions','discoveries','achievements'].flatMap(kind=>Object.entries(catalog[kind]).map(([key,value])=>({...value,kind,key})));
assert.equal(new Set(cues.map(cue=>cue.id)).size,cues.length,'unique audio IDs');
assert.deepEqual(sorted(Object.keys(manifest.clips)),sorted(cues.map(cue=>cue.id.split('/').at(-1))),'generated clip coverage');
// No substitutions: spelling/punctuation/case only. Common phonetic name
// recognizer errors need an explicit, independently reviewed exception below.
const normalize=text=>text.toLowerCase().replace(/\bpencilled\b/g,'penciled').replace(/\bneighbours\b/g,'neighbors').replace(/\bharbour\b/g,'harbor').replace(/\b10\b/g,'ten').replace(/\b15\b/g,'fifteen').replace(/[^a-z0-9]/g,'');
const details=[];
for(const cue of cues){
 const id=cue.id.split('/').at(-1),clip=manifest.clips[id];
 assert.equal(clip.text,cue.text,id+' approved script');assert.equal(clip.kind,cue.kind);assert.equal(clip.key,cue.key);
 if(cue.kind==='introductions')assert.equal(cue.source,guides[cue.key].source,id+' sourced introduction');
 assert.equal(clip.scriptHash,hash(JSON.stringify({model:clip.model,voice:clip.voice,instructions:manifest.instructions,input:cue.text,response_format:'wav',speed:1})),id+' exact request provenance');
 assert.equal(clip.model,'gpt-4o-mini-tts-2025-12-15');assert.equal(clip.voice,'marin');assert.equal(clip.transcriptionModel,'whisper-1');
 const primaryMatches=normalize(clip.transcription)===normalize(cue.text),recheckMatches=typeof clip.recheckTranscription==='string'&&normalize(clip.recheckTranscription)===normalize(cue.text);
 assert.ok(primaryMatches||recheckMatches,id+' independently transcribed content');
 const file='assets/audio/narration/discoveries/'+clip.file;
 assert.equal(hash(fs.readFileSync(file)),clip.audioHash,id+' audio hash');
 const pcm=execFileSync('ffmpeg',['-v','error','-i',file,'-f','s16le','-ar','24000','-ac','1','pipe:1'],{maxBuffer:2*1024*1024});
 let peak=0,sum=0,quiet=0,longest=0;
 for(let offset=0;offset<pcm.length;offset+=2){const amplitude=Math.abs(pcm.readInt16LE(offset))/32768;peak=Math.max(peak,amplitude);sum+=amplitude*amplitude;quiet=amplitude<.002?quiet+1:0;longest=Math.max(longest,quiet);}
 const duration=pcm.length/48000,rms=Math.sqrt(sum/(pcm.length/2));
 assert.ok(duration>=2&&duration<=14,id+' brief duration');assert.ok(peak>.1&&peak<.95,id+' unclipped signal');assert.ok(rms>.015,id+' non-silent signal');assert.ok(longest/24000<2.5,id+' excessive silence');
 details.push({id,kind:cue.kind,key:cue.key,duration,peak,rms,longestSilence:longest/24000,primaryTranscriptMatches:primaryMatches,vocabularyContextRecheckUsed:!primaryMatches&&recheckMatches});
}
const report={introductions:Object.keys(catalog.introductions).length,discoveries:Object.keys(catalog.discoveries).length,achievements:Object.keys(catalog.achievements).length,clips:details.length,model:manifest.model,voice:manifest.voice,allRequestedCategoriesCovered:true,allAudioHashesMatch:true,allDecode:true,allSignalsPassed:true,allIndependentTranscriptionsMatch:true,primaryTranscriptMatches:details.filter(clip=>clip.primaryTranscriptMatches).length,vocabularyContextRechecks:details.filter(clip=>clip.vocabularyContextRecheckUsed).length,transcriptNormalization:'Punctuation, case, pencilled/penciled, neighbours/neighbors, harbour/harbor, 10/ten, and 15/fifteen only. Rechecks supply a vocabulary list, never expected sentences.',humanListeningApproval:false,totalSeconds:details.reduce((n,clip)=>n+clip.duration,0),maximumSeconds:Math.max(...details.map(clip=>clip.duration)),details};
fs.writeFileSync('artifacts/discovery-narration-qa.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,details:undefined}));
