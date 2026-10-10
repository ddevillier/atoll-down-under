import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {extractFile,listPackage} from '@electron/asar';
const archive=process.argv[2]||'dist/Atoll Down Under-win32-x64/resources/app.asar',output=process.argv[3]||'artifacts/packaged-source-report.json',files=[];
const excluded=file=>file.replaceAll('\\','/').startsWith('scripts/original_re/')||file.replaceAll('\\','/')==='docs/ORIGINAL-REVERSE-ENGINEERING.md'||file.endsWith('.wav');
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(excluded(file))continue;if(e.isDirectory())walk(file);else files.push(file);}}
for(const dir of ['src','desktop','assets','docs','scripts'])walk(dir);
files.push('index.html','README.md','PRODUCT.md','CONTRIBUTING.md','LICENSE');
for(const file of files)if(!fs.readFileSync(file).equals(extractFile(archive,file)))throw Error('Stale packaged file: '+file);
const source=JSON.parse(fs.readFileSync('package.json')),packed=JSON.parse(extractFile(archive,'package.json'));
for(const key of ['name','version','description','type','main'])if(source[key]!==packed[key])throw Error('Stale package metadata: '+key);
const entries=listPackage(archive),forbidden=entries.filter(file=>/^\/(?:win16-rebuild|artifacts|tests|tmp|\.git|\.impeccable|scripts\/original_re)(?:\/|$)|^\/docs\/ORIGINAL-REVERSE-ENGINEERING\.md$|(?:^|\/)\.env(?:\.|$)|^\/assets\/audio\/.*\.wav$/.test(file.replaceAll('\\','/')));
if(forbidden.length)throw Error('Excluded development payload was packaged: '+forbidden.join(', '));
// Electron Packager excludes dependency lockfiles from runtime payloads. Bind
// the install input separately instead of claiming it lives inside app.asar.
const buildInputHashes={'package-lock.json':crypto.createHash('sha256').update(fs.readFileSync('package-lock.json')).digest('hex')};
const report={archive,filesMatched:files.length,packageMetadataMatched:true,excludedDevelopmentPayloadsVerified:true,buildInputHashes,sourceHashes:Object.fromEntries(files.map(file=>[file.replaceAll('\\','/'),crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')])),appAsarSha256:crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex')};
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));console.log(JSON.stringify({archive,filesMatched:report.filesMatched,packageMetadataMatched:true,excludedDevelopmentPayloadsVerified:true,appAsarSha256:report.appAsarSha256}));
