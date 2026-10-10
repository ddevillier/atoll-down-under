import {packager} from '@electron/packager';
import {downloadArtifact} from '@electron/get';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
const platform=process.argv[2]||'win32';
const output=process.argv[3]||'dist';
if(platform==='darwin'&&process.platform==='win32'){
 const electronVersion=JSON.parse(fs.readFileSync('node_modules/electron/package.json','utf8')).version;
 const zip=await downloadArtifact({version:electronVersion,platform:'darwin',arch:'arm64',artifactName:'electron'});
 const asar='dist/Atoll Down Under-win32-x64/resources/app.asar';
 if(!fs.existsSync(asar))throw new Error('Package Windows first to create the platform-independent application archive.');
 execFileSync(process.env.ATOLL_PYTHON||'python',['scripts/package-mac-zip.py',zip,asar],{stdio:'inherit'});
 process.exit(0);
}
const result=await packager({dir:'.',name:'Atoll Down Under',platform,arch:platform==='darwin'?'arm64':'x64',out:output,overwrite:false,asar:true,prune:true,icon:'assets/icon',ignore:[/^\/\.github($|\/)/,/^\/\.nvmrc$/,/^\/artifacts($|\/)/,/^\/tests($|\/)/,/^\/dist($|\/)/,/^\/test-results($|\/)/,/^\/tmp($|\/)/,/^\/win16-rebuild($|\/)/,/^\/scripts\/original_re($|\/)/,/^\/docs\/ORIGINAL-REVERSE-ENGINEERING\.md$/,/^\/\.impeccable($|\/)/,/^\/\.env(?:\.|$)/,/^\/\.git($|\/)/,/^\/assets\/audio\/.*\.wav$/],appCopyright:'Atoll Down Under — original game project',appVersion:JSON.parse(fs.readFileSync('package.json','utf8')).version});
console.log(result.join('\n'));
