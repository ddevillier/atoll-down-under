import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {extractFile} from '@electron/asar';
const archive='dist/Atoll Down Under-win32-x64/resources/app.asar',files=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory())walk(file);else if(!file.endsWith('.wav'))files.push(file);}}
for(const dir of ['src','desktop','assets','docs'])walk(dir);
files.push('index.html','README.md','PRODUCT.md');
for(const file of files)if(!fs.readFileSync(file).equals(extractFile(archive,file)))throw Error('Stale packaged file: '+file);
const source=JSON.parse(fs.readFileSync('package.json')),packed=JSON.parse(extractFile(archive,'package.json'));
for(const key of ['name','version','description','type','main'])if(source[key]!==packed[key])throw Error('Stale package metadata: '+key);
const report={filesMatched:files.length,packageMetadataMatched:true,appAsarSha256:crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex')};
fs.mkdirSync('artifacts',{recursive:true});fs.writeFileSync('artifacts/packaged-source-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
