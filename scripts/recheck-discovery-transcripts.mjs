import {loadNarrationCredential} from './narration-credentials.mjs';
// Independent second transcription of only mismatched clips. A taxonomy word
// list supplies spelling context, never the expected sentence or its phrasing.
import fs from 'node:fs';
const file='assets/audio/narration/discoveries/manifest.json';
const manifest=JSON.parse(fs.readFileSync(file,'utf8'));
const normalize=text=>text.toLowerCase().replace(/\bpencilled\b/g,'penciled').replace(/\bneighbours\b/g,'neighbors').replace(/\bharbour\b/g,'harbor').replace(/[^a-z0-9]/g,'');
const jobs=Object.entries(manifest.clips).filter(([,clip])=>!clip.transcriptMatches&&!clip.recheckTranscription);
const prompt='Reef vocabulary: silver sprat, royal gramma, peach fairy basslet, wrasse, Moorish idol, palette surgeonfish, pencilled rabbitfish, purple anthias, fusilier, humbug damselfish, wobbegong, whitetip, blacktip, emperor, trevally, moray, coral goby, devil scorpionfish, sweetlip, feeding patch. British and American spelling are both used.';
console.log(JSON.stringify({mismatches:jobs.length}));
if(!process.argv.includes('--execute'))process.exit(0);
loadNarrationCredential();
if(!process.env.OPENAI_API_KEY)throw Error('Operator API credential unavailable');
let index=0;
async function worker(){while(index<jobs.length){const[id,clip]=jobs[index++];try{
 const form=new FormData();form.append('file',new Blob([fs.readFileSync('assets/audio/narration/discoveries/'+clip.file)],{type:'audio/ogg'}),clip.file);form.append('model','whisper-1');form.append('language','en');form.append('prompt',prompt);
 const response=await fetch('https://api.openai.com/v1/audio/transcriptions',{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY},body:form,signal:AbortSignal.timeout(90000)});
 if(!response.ok)throw Error('Recheck failed HTTP '+response.status);
 const {text}=await response.json();clip.recheckTranscription=text;clip.recheckPrompt=prompt;clip.recheckMatches=normalize(text)===normalize(clip.text);
 fs.writeFileSync(file+'.tmp',JSON.stringify(manifest,null,2)+'\n');fs.renameSync(file+'.tmp',file);
 console.log(JSON.stringify({id,recheckMatches:clip.recheckMatches,...(!clip.recheckMatches?{expected:clip.text,transcribed:text}:{})}));
 }catch(error){console.error(id+': '+String(error.message).slice(0,120));process.exitCode=1;}}}
await Promise.all(Array.from({length:3},worker));
