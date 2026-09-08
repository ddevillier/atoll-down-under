import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import {ADVENTURES} from '../src/adventures.js';
const catalog=JSON.parse(fs.readFileSync('src/activity-narration.json')),manifest=JSON.parse(fs.readFileSync('assets/audio/narration/activities/manifest.json'));
assert.deepEqual(Object.keys(catalog).sort(),Object.keys(ADVENTURES).sort());assert.deepEqual(Object.keys(manifest.clips).sort(),Object.keys(catalog).sort());
// Written forms only: these variants sound the same. No word substitutions allowed.
const normalize=t=>t.toLowerCase().replace(/\bpencilled\b/g,'penciled').replace(/\b2\b/g,'two').replace(/[^a-z0-9]/g,'');
const clips=[];
for(const [id,text] of Object.entries(catalog)){
 const c=manifest.clips[id];assert.equal(c.text,text);assert.equal(c.model,'gpt-4o-mini-tts-2025-12-15');assert.equal(c.voice,'marin');assert.equal(c.transcriptionModel,'whisper-1');assert.equal(normalize(c.transcription),normalize(text),id+' transcription differs');
 const file='assets/audio/narration/activities/'+c.file;assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),c.audioHash);
 const pcm=execFileSync('ffmpeg',['-v','error','-i',file,'-f','s16le','-ar','24000','-ac','1','pipe:1'],{maxBuffer:8*1024*1024});let peak=0,sum=0,quiet=0,longest=0;
 for(let i=0;i<pcm.length;i+=2){const v=Math.abs(pcm.readInt16LE(i))/32768;peak=Math.max(peak,v);sum+=v*v;quiet=v<.002?quiet+1:0;longest=Math.max(longest,quiet);}
 const rms=Math.sqrt(sum/(pcm.length/2)),seconds=pcm.length/48000;assert.ok(seconds>=15&&seconds<=65,id+' duration');assert.ok(peak>.1&&peak<.95,id+' peak');assert.ok(rms>.015,id+' silence');assert.ok(longest/24000<4,id+' long silence');clips.push({id,seconds,peak,rms,longestSilence:longest/24000});
}
const report={clips:clips.length,allActivitiesCovered:true,hashesMatch:true,allDecode:true,signalChecksPassed:true,independentTranscriptsMatch:true,transcriptNormalization:'Punctuation, case, pencilled/penciled spelling, and 2/two only.',humanListeningApproval:false,totalSeconds:clips.reduce((n,c)=>n+c.seconds,0),details:clips};
fs.writeFileSync('artifacts/activity-narration-qa.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,details:undefined}));
