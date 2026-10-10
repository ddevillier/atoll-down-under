import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync,execFileSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));process.chdir(root);
if(process.platform!=='win32')throw new Error('The supported desktop build runs on Windows x64. Use the GitHub Windows workflow from another system.');
const args=process.argv.slice(2);
if(args.length&&!(args.length===2&&args[0]==='--out'))throw new Error('Usage: npm run build:win -- --out dist/NEW-FOLDER');
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const output=path.resolve(root,args[1]||'dist/windows-'+stamp),dist=path.join(root,'dist');
if(!output.startsWith(dist+path.sep))throw new Error('Output must be a new directory inside this checkout’s dist/ folder.');
if(fs.existsSync(output))throw new Error('Output already exists; choose a fresh --out directory. Previous builds are preserved.');
function run(script,...values){const r=spawnSync(process.execPath,[script,...values],{stdio:'inherit',cwd:root});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status||1);}
run('scripts/check-setup.mjs');
run('scripts/package.mjs','win32',output);
const folder=path.join(output,'Atoll Down Under-win32-x64'),archive=path.join(folder,'resources/app.asar'),sourceReport=path.join(output,'packaged-source.json');
run('scripts/qa-package.mjs',archive,sourceReport);
let revision=null,dirty=null;try{revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();dirty=execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim().length>0;}catch{}
const pkg=JSON.parse(fs.readFileSync('package.json','utf8')),source=JSON.parse(fs.readFileSync(sourceReport,'utf8'));
const report={schema:'atoll-windows-build-v1',builtFolder:folder,executable:path.join(folder,'Atoll Down Under.exe'),sourceReport,node:process.version,electron:JSON.parse(fs.readFileSync('node_modules/electron/package.json','utf8')).version,version:pkg.version,revision,dirty,appAsarSha256:source.appAsarSha256,buildInputHashes:source.buildInputHashes,packagedSourceFiles:source.filesMatched};
fs.writeFileSync(path.join(output,'build.json'),JSON.stringify(report,null,2)+'\n');
console.log('Verified Windows build: '+report.executable);console.log('Build receipt: '+path.join(output,'build.json'));

