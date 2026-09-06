import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else files.push(file);}}
walk('assets');
const manifest=[];
for(const file of files.sort()){
 const bytes=fs.readFileSync(file);
 const item={path:file.replaceAll('\\','/'),bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
 if(file.endsWith('.png')){const meta=await sharp(bytes).metadata();Object.assign(item,{width:meta.width,height:meta.height,alpha:meta.hasAlpha});}
 manifest.push(item);
}
fs.writeFileSync('docs/ASSET-MANIFEST.json',JSON.stringify(manifest,null,2)+'\n');
console.log(`Recorded ${manifest.length} source assets.`);
