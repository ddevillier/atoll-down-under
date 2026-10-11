import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const fail=message=>{console.error('Setup check failed: '+message);process.exit(1);};
const [major,minor]=process.versions.node.split('.').map(Number);
if(major<22||major===22&&minor<18)fail('Use Node.js 22.18.0 or later; .nvmrc pins the verified version.');
for(const file of ['node_modules/electron/package.json','node_modules/@electron/packager/package.json','node_modules/@playwright/test/package.json','node_modules/sharp/package.json'])if(!fs.existsSync(path.join(root,file)))fail('Dependency installation is incomplete. Run npm ci.');
const electronDir=path.join(root,'node_modules/electron');
if(!fs.existsSync(path.join(electronDir,'path.txt')))fail('Electron runtime is missing. Run npm run setup:electron, or npm ci without --ignore-scripts.');
const binary=fs.readFileSync(path.join(electronDir,'path.txt'),'utf8').trim();
if(!fs.existsSync(path.join(electronDir,'dist',binary)))fail('Electron binary is missing. Run npm run setup:electron with Electron downloads enabled.');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/ASSET-MANIFEST.json'),'utf8'));
let bytes=0;
for(const item of manifest){
 const target=path.resolve(root,item.path);
 if(!item.path.startsWith('assets/')||!target.startsWith(path.join(root,'assets')+path.sep))fail('Invalid asset manifest path.');
 if(!fs.existsSync(target))fail('Missing '+item.path+'. Obtain the complete repository including assets.');
 const data=fs.readFileSync(target);bytes+=data.length;
 if(data.length!==item.bytes||crypto.createHash('sha256').update(data).digest('hex')!==item.sha256)fail('Changed or incomplete '+item.path+'. Restore it, or regenerate the asset manifest after an intentional asset edit.');
}
const voiceManifests=[
 ...['assets/audio/narration','assets/audio/narration/activities','assets/audio/narration/discoveries'].map(dir=>({file:dir+'/manifest.json',dir})),
 {file:'assets/audio/narration/species-adventures-provenance.json',dir:null}
];
const narrationRoot=path.join(root,'assets/audio/narration'),spokenFiles=new Set();
for(const {file,dir} of voiceManifests){
 if(!fs.existsSync(path.join(root,file)))fail('Missing narration provenance '+file+'. Obtain the complete repository including assets.');
 const voiceManifest=JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
 for(const [id,clip] of Object.entries(voiceManifest.clips)){
  if(typeof clip.file!=='string'||!clip.file.endsWith('.ogg'))fail('Invalid narration file for '+id+' in '+file+'.');
  // Legacy manifests use a filename relative to their own directory; the
  // adventure provenance records the canonical repository-relative path.
  const target=path.resolve(root,dir?path.join(dir,clip.file):clip.file);
  if(!target.startsWith(narrationRoot+path.sep))fail('Invalid narration provenance path for '+id+'.');
  if(!fs.existsSync(target))fail('Missing offline narration '+path.relative(root,target)+'.');
  const data=fs.readFileSync(target);
  if(data.toString('ascii',0,4)!=='OggS'||crypto.createHash('sha256').update(data).digest('hex')!==clip.audioHash)fail('Changed or incomplete offline narration '+path.relative(root,target)+'. Restore it, or regenerate its provenance after an intentional narration edit.');
  spokenFiles.add(target);
 }
}
for(const file of fs.readdirSync(narrationRoot,{recursive:true}).filter(file=>file.endsWith('.ogg'))){
 if(!spokenFiles.has(path.resolve(narrationRoot,file)))fail('Offline narration has no provenance: '+file+'.');
}
const spokenClips=spokenFiles.size;
console.log(JSON.stringify({node:process.version,verifiedNode:fs.readFileSync(path.join(root,'.nvmrc'),'utf8').trim(),assets:manifest.length,assetBytes:bytes,spokenClips,apiKeyRequired:false,ready:true}));

