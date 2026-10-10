import {loadNarrationCredential} from './narration-credentials.mjs';
// Operator-only: the key is read in memory from the existing phonics convention.
import fs from 'node:fs';import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';
const catalog=JSON.parse(fs.readFileSync('src/activity-narration.json','utf8'));
const model='gpt-4o-mini-tts-2025-12-15',voice='marin';
const instructions='Read the supplied game instructions exactly, in a warm, calm, conversational voice for a child exploring a reef with a parent. Quiet curiosity, clear words, comfortable natural pauses. Say the E key as the letter E. Do not add greetings, closing remarks, music or sound effects. Do not whisper or act out characters.';
const dir='assets/audio/narration/activities',masters='artifacts/activity-narration-masters',manifestPath=dir+'/manifest.json';
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const manifest=fs.existsSync(manifestPath)?JSON.parse(fs.readFileSync(manifestPath)):{version:1,model,voice,instructions,clips:{}};
const only=process.argv.find(x=>x.startsWith('--only='))?.slice(7).split(',');
const jobs=Object.entries(catalog).filter(([id])=>!only||only.includes(id)).map(([id,text])=>({id,text,scriptHash:hash(JSON.stringify({model,voice,instructions,input:text,response_format:'wav',speed:1}))}));
console.log(JSON.stringify({execute:process.argv.includes('--execute'),model,voice,clips:jobs.length,words:jobs.reduce((n,j)=>n+j.text.split(/\s+/).length,0)}));
if(!process.argv.includes('--execute'))process.exit(0);
loadNarrationCredential();
if(!process.env.OPENAI_API_KEY)throw Error('Operator API credential unavailable');
fs.mkdirSync(dir,{recursive:true});fs.mkdirSync(masters,{recursive:true});
function save(){fs.writeFileSync(manifestPath+'.tmp',JSON.stringify(manifest,null,2)+'\n');fs.renameSync(manifestPath+'.tmp',manifestPath);}
async function request(endpoint,body,json=false){
 for(let attempt=0;attempt<3;attempt++){
  const response=await fetch('https://api.openai.com/v1/audio/'+endpoint,{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,...(json?{'Content-Type':'application/json'}:{})},body:json?JSON.stringify(body):body,signal:AbortSignal.timeout(90000)});
  if(response.ok)return response;
  if((response.status===429||response.status>=500)&&attempt<2){await new Promise(r=>setTimeout(r,2000*2**attempt));continue;}
  throw Error('Audio '+endpoint+' request failed: HTTP '+response.status);
 }
}
let next=0;async function worker(){while(next<jobs.length){const job=jobs[next++];try{
 const wav=masters+'/'+job.id+'-'+job.scriptHash.slice(0,12)+'.wav',ogg=dir+'/'+job.id+'.ogg';let clip=manifest.clips[job.id];
 if(clip?.scriptHash===job.scriptHash&&clip.transcription&&fs.existsSync(ogg)&&hash(fs.readFileSync(ogg))===clip.audioHash){console.log('Cached '+job.id);continue;}
 if(!fs.existsSync(wav)){
  const response=await request('speech',{model,voice,instructions,input:job.text,response_format:'wav',speed:1},true);
  const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length<10000||bytes.toString('ascii',0,4)!=='RIFF')throw Error('Invalid WAV response');fs.writeFileSync(wav,bytes);
 }
 execFileSync('ffmpeg',['-v','error','-y','-i',wav,'-af','loudnorm=I=-20:TP=-2:LRA=7','-c:a','libvorbis','-q:a','4',ogg],{stdio:'pipe'});
 const duration=Number(JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','json',ogg],{encoding:'utf8'})).format.duration);
 if(!Number.isFinite(duration)||duration<15||duration>65)throw Error('Unexpected duration '+duration);
 clip={file:job.id+'.ogg',scriptHash:job.scriptHash,audioHash:hash(fs.readFileSync(ogg)),duration,text:job.text,generatedAt:new Date().toISOString(),model,voice,humanReviewed:false};manifest.clips[job.id]=clip;save();
 const form=new FormData();form.append('file',new Blob([fs.readFileSync(wav)],{type:'audio/wav'}),job.id+'.wav');form.append('model','whisper-1');form.append('language','en');
 const transcription=await (await request('transcriptions',form)).json();clip.transcription=transcription.text;clip.transcriptionModel='whisper-1';clip.transcriptionUsage=transcription.usage;
 const normalize=t=>t.toLowerCase().replace(/[^a-z0-9]/g,'');clip.transcriptMatches=normalize(clip.text)===normalize(clip.transcription);save();
 console.log(JSON.stringify({id:job.id,duration,transcriptMatches:clip.transcriptMatches,...(!clip.transcriptMatches?{expected:job.text,transcribed:clip.transcription}:{})}));
 }catch(e){console.error(job.id+': '+String(e.message).slice(0,250));process.exitCode=1;}}}
await Promise.all([worker(),worker()]);
