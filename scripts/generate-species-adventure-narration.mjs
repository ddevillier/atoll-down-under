import {loadNarrationCredential} from './narration-credentials.mjs';
import {REEF_STORIES,STORY_REFLECTIONS} from '../src/reef-story-data.js';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync,spawnSync} from 'node:child_process';

// Operator-only production generation. Packaged play uses the offline OGG
// files and never needs credentials, the speech service, or these WAV masters.
const model='gpt-4o-mini-tts-2025-12-15',voice='marin';
const instructions='Read the supplied reef commentary or game instructions exactly once. Use a warm, calm, clear conversational adult voice for a parent and child exploring together. Quiet wonder, gentle natural expression, comfortable conversational pace. Do not add words, greetings, music, sound effects or character voices. Do not whisper. Say the E key as the letter E. Pronounce gramma as GRAM-uh, Anomalops as uh-NOM-uh-lops, and katoptron as kuh-TOP-tron.';
const help={
 housekeeper:'Inspect the branching colony. Choose a dusty pocket and a direction that carries the sediment toward open water. Approach and clear it, then try the other pocket. Inspect the uncovered branches below the colony. Moving the pointer lets you swim away.',
 lookout:'Meet a free rabbitfish on Sunlit Crest and choose Watch together. Choose a grazing ledge and swim to its lookout circle. Press E to watch. Notice passing movement, then hold here or move over. Let your companion graze, wait for it to take the lookout, then click real algae for your turn.',
 walker:'Choose the high or low shelves around the sponge. Plant your fins at the first foothold. Choose a connected shelf, or press E for your next step. Settle at the lookout to inspect the view. Moving the pointer releases your fins so you can swim freely.',
 nest:'Take the optional role of a nesting male royal gramma. Inspect either ledge from below. Pick up the loose algae tuft with your mouth and carry it back. Choose the left or right entrance edge for the lining. Clear the entrance silt, then inspect your finished nest. Moving the pointer lets you steer freely.',
 crevice:'Compare the three openings. Choose one with room for your body and an upper edge close enough to brace your spine. Ease inside, then lock the dorsal spine. Release it before backing out. Point elsewhere at any time to release and swim freely.',
 shade:'Follow the quiet pulse or its visible ripple toward the shaded opening. Inspect the neighbor and watch how it turns and gives space. Choose the neighboring alcove or a wider gap. Swim to your chosen place, let the neighbor settle, then inspect both resting places. The sound has no translated words.',
 lantern:'Swim near two free flashlightfish at night in Quiet Grotto. Choose a route above or below the outcrop. Swim through the left marker, then lead the bend at the school’s pace. Press E to show or hide your light organ. The rock blocks sight, so circle back if you lose contact.'
};
const dir='assets/audio/narration/discoveries',artifacts='artifacts/species-adventures',manifestPath='assets/audio/narration/species-adventures-provenance.json';
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const only=process.argv.find(arg=>arg.startsWith('--only='))?.slice(7).split(',');
const regenerate=process.argv.includes('--regenerate');
if(regenerate&&!only)throw Error('Use --only=<clip-id> when deliberately regenerating a production take');
const jobs=Object.entries(help).flatMap(([key,text])=>[
 {key,story:REEF_STORIES[key].id,kind:'reflection',text:STORY_REFLECTIONS[key]},
 {key,story:REEF_STORIES[key].id,kind:'help',text}
]).map(job=>({...job,id:job.story+'-'+job.kind,scriptHash:hash(JSON.stringify({model,voice,instructions,input:job.text,response_format:'wav',speed:1}))})).filter(job=>!only||only.includes(job.id));
console.log(JSON.stringify({execute:process.argv.includes('--execute'),model,voice,clips:jobs.length,words:jobs.reduce((n,job)=>n+job.text.split(/\s+/).length,0)}));
fs.mkdirSync(artifacts,{recursive:true});
const snippet={discoveries:{},help:{}};
for(const [key,text] of Object.entries(help)){
 const story=REEF_STORIES[key],base={species:story.species,reference:'src/reef-story-data.js#'+story.id};
 snippet.discoveries[story.id]={id:'discoveries/'+story.id+'-reflection',text:STORY_REFLECTIONS[key],kind:'recorded gameplay and sourced natural history',...base};
 snippet.help[key]={id:'discoveries/'+story.id+'-help',text,kind:'optional game instructions',...base};
}
fs.writeFileSync(artifacts+'/audio-catalog-snippet.json',JSON.stringify(snippet,null,2)+'\n');
if(!process.argv.includes('--execute'))process.exit(0);
loadNarrationCredential();
if(!process.env.OPENAI_API_KEY)throw Error('Operator API credential unavailable');
fs.mkdirSync(dir,{recursive:true});
const manifest=fs.existsSync(manifestPath)?JSON.parse(fs.readFileSync(manifestPath,'utf8')):{version:1,model,voice,instructions,provenance:{pipeline:'scripts/generate-discovery-narration.mjs',documentation:'https://developers.openai.com/api/docs/guides/text-to-speech',offline:true},qualityScope:'Full OGG decode, level measurement and independent speech transcription. No human listening approval has been performed.',clips:{}};
function save(){fs.writeFileSync(manifestPath+'.tmp',JSON.stringify(manifest,null,2)+'\n');fs.renameSync(manifestPath+'.tmp',manifestPath);}
async function request(endpoint,body,json=false){
 for(let attempt=0;attempt<5;attempt++){
  let response;
  try{response=await fetch('https://api.openai.com/v1/audio/'+endpoint,{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,...(json?{'Content-Type':'application/json'}:{})},body:json?JSON.stringify(body):body,signal:AbortSignal.timeout(90000)});}
  catch{if(attempt===4)throw Error('Audio service connection failed after retries');await new Promise(resolve=>setTimeout(resolve,1500*2**attempt));continue;}
  if(response.ok)return response;
  if((response.status===429||response.status>=500)&&attempt<4){await new Promise(resolve=>setTimeout(resolve,1500*2**attempt));continue;}
  // Deliberately omit service response bodies: credentials and operator context
  // are not part of public production provenance or diagnostic logs.
  throw Error('Audio '+endpoint+' request failed: HTTP '+response.status);
 }
}
const normalize=text=>text.toLowerCase().replace(/\bneighbours\b/g,'neighbors').replace(/\bgrama\b/g,'gramma').replace(/[^a-z0-9]/g,'');
function command(tool,args,options={}){return execFileSync(tool,args,{encoding:'utf8',stdio:'pipe',...options});}
let next=0;
async function worker(){while(next<jobs.length){const job=jobs[next++];try{
 const wav=artifacts+'/audio-'+job.id+'-'+job.scriptHash.slice(0,12)+'.wav',ogg=dir+'/'+job.id+'.ogg',decoded=artifacts+'/audio-'+job.id+'-decoded.wav';
 let clip=manifest.clips[job.id];
 if(!regenerate&&clip?.scriptHash===job.scriptHash&&clip.transcriptMatches&&clip.decodeVerified&&fs.existsSync(ogg)&&hash(fs.readFileSync(ogg))===clip.audioHash){console.log('Cached '+job.id);continue;}
 const previousTakes=[...(clip?.previousTakes||[]),...(regenerate&&clip?[{audioHash:clip.audioHash,transcription:clip.transcription,taxonomyCheck:clip.taxonomyCheck,transcriptMatches:clip.transcriptMatches}]:[])];
 if(regenerate||!fs.existsSync(wav)){
  const response=await request('speech',{model,voice,instructions,input:job.text,response_format:'wav',speed:1},true),bytes=Buffer.from(await response.arrayBuffer());
  if(bytes.length<10000||bytes.toString('ascii',0,4)!=='RIFF')throw Error('Invalid WAV response');fs.writeFileSync(wav,bytes);
 }
 command('ffmpeg',['-v','error','-y','-i',wav,'-af','loudnorm=I=-20:TP=-2:LRA=7','-c:a','libvorbis','-q:a','4',ogg]);
 const probe=JSON.parse(command('ffprobe',['-v','error','-show_entries','format=duration:stream=codec_name,channels,sample_rate','-of','json',ogg])),duration=Number(probe.format.duration);
 if(!Number.isFinite(duration)||duration<3||duration>(job.kind==='reflection'?24:65))throw Error('Unexpected duration '+duration);
 // Transcription hears the decoded packaged file, not the original script or
 // the uncompressed TTS master. No prompt or reference text is supplied.
 command('ffmpeg',['-v','error','-xerror','-y','-i',ogg,'-c:a','pcm_s16le','-ar','24000',decoded]);
 const levels=spawnSync('ffmpeg',['-hide_banner','-i',ogg,'-af','loudnorm=I=-20:TP=-2:LRA=7:print_format=json','-f','null','-'],{encoding:'utf8'});
 if(levels.status!==0)throw Error('Decoded audio level measurement failed');
 const loudness=JSON.parse(levels.stderr.match(/\{[\s\S]*?\}/)?.[0]||'{}');
 if(!Number.isFinite(Number(loudness.input_i))||Number(loudness.input_tp)>-.5)throw Error('Audio level outside safe production bounds');
 clip={file:ogg,id:'discoveries/'+job.id,kind:job.kind,key:job.key,story:job.story,scriptHash:job.scriptHash,audioHash:hash(fs.readFileSync(ogg)),duration,text:job.text,generatedAt:new Date().toISOString(),model,voice,humanReviewed:false,decodeVerified:true,codec:probe.streams[0],loudness,...(previousTakes.length?{previousTakes}:{})};manifest.clips[job.id]=clip;save();
 const form=new FormData();form.append('file',new Blob([fs.readFileSync(decoded)],{type:'audio/wav'}),job.id+'.wav');form.append('model','whisper-1');form.append('language','en');
 const transcription=await(await request('transcriptions',form)).json();clip.transcription=transcription.text;clip.transcriptionModel='whisper-1';clip.transcriptionInput='decoded packaged OGG; no text prompt';clip.transcriptMatches=normalize(job.text)===normalize(clip.transcription);save();
 if(!clip.transcriptMatches){
  // A second independent decoder gets only uncommon species vocabulary,
  // never the narration script. Preserve the first result for auditability.
  const check=new FormData();check.append('file',new Blob([fs.readFileSync(decoded)],{type:'audio/wav'}),job.id+'.wav');check.append('model','whisper-1');check.append('language','en');check.append('prompt','Reef fish vocabulary: royal gramma; Anomalops katoptron.');
  const secondary=await(await request('transcriptions',check)).json();clip.taxonomyCheck={transcription:secondary.text,model:'whisper-1',prompt:'Reef fish vocabulary: royal gramma; Anomalops katoptron.'};clip.transcriptMatches=normalize(job.text)===normalize(secondary.text);save();
 }
 console.log(JSON.stringify({id:job.id,duration,transcriptMatches:clip.transcriptMatches,...(!clip.transcriptMatches?{expected:job.text,transcribed:clip.transcription}:{})}));
 }catch(error){console.error(job.id+': '+String(error.message).slice(0,200));process.exitCode=1;}}}
await Promise.all([worker(),worker()]);
fs.writeFileSync(artifacts+'/audio-quality-report.json',JSON.stringify({generatedAt:new Date().toISOString(),scope:manifest.qualityScope,clips:Object.values(manifest.clips).map(({id,duration,decodeVerified,transcriptMatches,humanReviewed,loudness})=>({id,duration,decodeVerified,transcriptMatches,humanReviewed,integratedLUFS:Number(loudness.input_i),truePeakDBTP:Number(loudness.input_tp)}))},null,2)+'\n');
