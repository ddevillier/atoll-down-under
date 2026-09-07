// Operator-only generator. Credentials are never written into the Atoll project.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const catalog=JSON.parse(fs.readFileSync('src/narration-catalog.json','utf8'));
const output='assets/audio/narration',masters='artifacts/narration-masters';
const model=process.env.ATOLL_NARRATION_MODEL||'gpt-realtime-2.1-mini',voice='marin';
const instructions='You are a warm, calm naturalist sharing a reef discovery with an adult and a child. Speak conversationally with quiet curiosity, clear consonants and natural pauses. No character voices, music, sound effects, or extra words. Read the supplied text exactly. Pronounce fish names carefully. Acropora is ah-KROP-or-ah; cephalopod is SEF-uh-luh-pod.';
const hash=text=>crypto.createHash('sha256').update(text).digest('hex');
const manifestPath=path.join(output,'manifest.json');let manifest=fs.existsSync(manifestPath)?JSON.parse(fs.readFileSync(manifestPath,'utf8')):{version:1,model,voice,clips:{}};
const only=process.argv.find(a=>a.startsWith('--only='))?.slice(7).split(',');
const jobs=Object.entries(catalog).filter(([id])=>!only||only.includes(id)).map(([id,n])=>({id,...n,hash:hash(JSON.stringify({text:n.text,model,voice,instructions}))})).filter(j=>!manifest.clips[j.id]?.transcriptFromService||manifest.clips[j.id]?.scriptHash!==j.hash||!fs.existsSync(path.join(output,j.id+'.ogg')));
console.log(JSON.stringify({mode:process.argv.includes('--execute')?'generate':'dry run',clips:jobs.length,words:jobs.reduce((n,j)=>n+j.text.split(/\s+/).length,0),model,voice}));
if(!process.argv.includes('--execute'))process.exit(0);
if(!process.env.OPENAI_API_KEY){const envFile=process.env.ATOLL_NARRATION_ENV||'C:/Users/Daniel/Desktop/phonics/.env.local';if(fs.existsSync(envFile))process.loadEnvFile(envFile);}
if(!process.env.OPENAI_API_KEY)throw Error('OPENAI_API_KEY is unavailable in the operator environment.');
fs.mkdirSync(output,{recursive:true});fs.mkdirSync(masters,{recursive:true});
function wavFile(pcm){const h=Buffer.alloc(44);h.write('RIFF',0);h.writeUInt32LE(pcm.length+36,4);h.write('WAVEfmt ',8);h.writeUInt32LE(16,16);h.writeUInt16LE(1,20);h.writeUInt16LE(1,22);h.writeUInt32LE(24000,24);h.writeUInt32LE(48000,28);h.writeUInt16LE(2,32);h.writeUInt16LE(16,34);h.write('data',36);h.writeUInt32LE(pcm.length,40);return Buffer.concat([h,pcm]);}
async function renderRealtime(text){
 const operatorRequire=createRequire(path.join(process.env.ATOLL_PHONICS_ROOT||'C:/Users/Daniel/Desktop/phonics','packages/content/package.json'));
 const {RealtimeAgent,RealtimeSession}=operatorRequire('@openai/agents/realtime');
 const agent=new RealtimeAgent({name:'Atoll fixed narration',instructions});
 const session=new RealtimeSession(agent,{model,transport:'websocket',tracingDisabled:true,historyStoreAudio:false,config:{outputModalities:['audio'],audio:{output:{format:'pcm16',voice}}}});
 let transcript='',size=0;const chunks=[];let timer;
 try{await session.connect({apiKey:process.env.OPENAI_API_KEY});return await new Promise((resolve,reject)=>{
 timer=setTimeout(()=>reject(Error('Narration generation timed out.')),75000);
 session.on('audio',e=>{size+=e.data.byteLength;if(size>24000*2*70){reject(Error('Narration exceeded capture limit.'));return;}chunks.push(Buffer.from(e.data));});
 session.on('transport_event',e=>{if(e.type.includes('transcript')){const raw=e.data||e;if(typeof raw.delta==='string')transcript+=raw.delta;if(typeof raw.transcript==='string')transcript=raw.transcript;}});
 session.on('history_updated',history=>{const item=history.filter(i=>i.role==='assistant').at(-1);const spoken=item?.content?.filter(c=>c.transcript).map(c=>c.transcript).join(' ');if(spoken)transcript=spoken;});
 session.on('audio_stopped',()=>setTimeout(()=>chunks.length?resolve({wav:wavFile(Buffer.concat(chunks)),transcript}):reject(Error('No narration audio returned.')),150));
 session.on('error',()=>reject(Error('Realtime narration service rejected the request.')));
 session.sendMessage('Read the following passage exactly, without any added introduction or closing words. '+text);
 });}finally{clearTimeout(timer);session.close();}
}
let next=0,failed=false;
async function worker(){while(next<jobs.length&&!failed){const job=jobs[next++];try{
 const wav=path.join(masters,job.id+'.wav'),ogg=path.join(output,job.id+'.ogg');
 const rendered=await renderRealtime(job.text);fs.writeFileSync(wav,rendered.wav);
 const normalize=t=>t.toLowerCase().replace(/[^a-z0-9]/g,'');if(!rendered.transcript||normalize(rendered.transcript)!==normalize(job.text)){fs.writeFileSync(path.join(masters,job.id+'-mismatch.json'),JSON.stringify({expected:job.text,spoken:rendered.transcript},null,2));throw Error('Spoken transcript differs from approved script: '+job.id);}
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',wav,'-af','loudnorm=I=-20:TP=-2:LRA=7','-c:a','libvorbis','-q:a','4',ogg],{stdio:'pipe'});
 const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','json',ogg],{encoding:'utf8'}));const duration=Number(probe.format.duration);
 if(!Number.isFinite(duration)||duration<8||duration>65)throw Error('Narration duration outside expected bounds: '+job.id);
 manifest.clips[job.id]={file:job.id+'.ogg',scriptHash:job.hash,audioHash:hash(fs.readFileSync(ogg)),duration,generatedAt:new Date().toISOString(),source:job.source,transcript:rendered.transcript||job.text,transcriptFromService:!!rendered.transcript};
 fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');console.log('Recorded '+job.id+' '+job.name+' ('+duration.toFixed(1)+'s)');
 }catch(e){failed=true;console.error(String(e.message).slice(0,650));process.exitCode=1;}}}
await Promise.all([worker(),worker()]);
