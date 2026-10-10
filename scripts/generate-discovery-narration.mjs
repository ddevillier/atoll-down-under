import {loadNarrationCredential} from './narration-credentials.mjs';
// Operator-only generation. The packaged game reads OGG files; it never uses
// credentials, an API connection, or the phonics development environment.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const catalog=JSON.parse(fs.readFileSync('src/discovery-narration-catalog.json','utf8'));
const model='gpt-4o-mini-tts-2025-12-15',voice='marin';
const instructions='Read the supplied short reef commentary exactly once. Use a warm, calm, clear conversational adult voice for a parent and child exploring together. Quiet wonder, gentle natural expression, comfortable conversational pace. Do not add words, greetings, music, sound effects or character voices. Do not whisper. Pronounce Moorish as MOOR-ish, wrasse as rass, fusilier as fyoo-zuh-LEER, and wobbegong as WOB-ee-gong.';
const dir='assets/audio/narration/discoveries',masters='artifacts/discovery-narration-masters',manifestPath=dir+'/manifest.json';
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
let manifest=fs.existsSync(manifestPath)?JSON.parse(fs.readFileSync(manifestPath,'utf8')):{version:1,model,voice,instructions,provenance:{phonics:'scripts/generate-moonroot-experimental-narration.mjs',documentation:'https://developers.openai.com/api/docs/guides/text-to-speech',offline:true},clips:{}};
const only=process.argv.find(a=>a.startsWith('--only='))?.slice(7).split(',');
const jobs=['introductions','discoveries','achievements'].flatMap(kind=>Object.entries(catalog[kind]).map(([key,cue])=>({kind,key,id:cue.id.split('/').at(-1),text:cue.text}))).filter(job=>!only||only.includes(job.id)).map(job=>({...job,scriptHash:hash(JSON.stringify({model,voice,instructions,input:job.text,response_format:'wav',speed:1}))}));
console.log(JSON.stringify({execute:process.argv.includes('--execute'),model,voice,clips:jobs.length,words:jobs.reduce((n,j)=>n+j.text.split(/\s+/).length,0)}));
if(!process.argv.includes('--execute'))process.exit(0);
loadNarrationCredential();
if(!process.env.OPENAI_API_KEY)throw Error('Operator API credential unavailable');
fs.mkdirSync(dir,{recursive:true});fs.mkdirSync(masters,{recursive:true});
function save(){fs.writeFileSync(manifestPath+'.tmp',JSON.stringify(manifest,null,2)+'\n');fs.renameSync(manifestPath+'.tmp',manifestPath);}
async function request(endpoint,body,json=false){
 for(let attempt=0;attempt<4;attempt++){
  let response;
  try{response=await fetch('https://api.openai.com/v1/audio/'+endpoint,{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,...(json?{'Content-Type':'application/json'}:{})},body:json?JSON.stringify(body):body,signal:AbortSignal.timeout(90000)});}catch{if(attempt===3)throw Error('Audio service connection failed after retries');await new Promise(resolve=>setTimeout(resolve,1500*2**attempt));continue;}
  if(response.ok)return response;
  if((response.status===429||response.status>=500)&&attempt<3){await new Promise(resolve=>setTimeout(resolve,1500*2**attempt));continue;}
  throw Error('Audio '+endpoint+' request failed: HTTP '+response.status);
 }
}
let next=0;
async function worker(){while(next<jobs.length){const job=jobs[next++];try{
 const wav=masters+'/'+job.id+'-'+job.scriptHash.slice(0,12)+'.wav',ogg=dir+'/'+job.id+'.ogg';let clip=manifest.clips[job.id];
 if(clip?.scriptHash===job.scriptHash&&clip.transcription&&fs.existsSync(ogg)&&hash(fs.readFileSync(ogg))===clip.audioHash){console.log('Cached '+job.id);continue;}
 if(!fs.existsSync(wav)){
  const response=await request('speech',{model,voice,instructions,input:job.text,response_format:'wav',speed:1},true);
  const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length<10000||bytes.toString('ascii',0,4)!=='RIFF')throw Error('Invalid WAV response');fs.writeFileSync(wav,bytes);
 }
 execFileSync('ffmpeg',['-v','error','-y','-i',wav,'-af','loudnorm=I=-20:TP=-2:LRA=7','-c:a','libvorbis','-q:a','4',ogg],{stdio:'pipe'});
 const duration=Number(JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','json',ogg],{encoding:'utf8'})).format.duration);
 if(!Number.isFinite(duration)||duration<2||duration>14)throw Error('Unexpected duration '+duration);
 clip={file:job.id+'.ogg',kind:job.kind,key:job.key,scriptHash:job.scriptHash,audioHash:hash(fs.readFileSync(ogg)),duration,text:job.text,generatedAt:new Date().toISOString(),model,voice,humanReviewed:false};manifest.clips[job.id]=clip;save();
 const form=new FormData();form.append('file',new Blob([fs.readFileSync(wav)],{type:'audio/wav'}),job.id+'.wav');form.append('model','whisper-1');form.append('language','en');
 const transcription=await(await request('transcriptions',form)).json();clip.transcription=transcription.text;clip.transcriptionModel='whisper-1';
 const normalize=text=>text.toLowerCase().replace(/\bpencilled\b/g,'penciled').replace(/\bneighbours\b/g,'neighbors').replace(/\bharbour\b/g,'harbor').replace(/[^a-z0-9]/g,'');clip.transcriptMatches=normalize(job.text)===normalize(clip.transcription);save();
 console.log(JSON.stringify({id:job.id,duration,transcriptMatches:clip.transcriptMatches,...(!clip.transcriptMatches?{expected:job.text,transcribed:clip.transcription}:{})}));
 }catch(error){console.error(job.id+': '+String(error.message).slice(0,200));process.exitCode=1;}}}
await Promise.all(Array.from({length:4},worker));
