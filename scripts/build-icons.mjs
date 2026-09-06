import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import fs from 'node:fs';
await sharp('assets/icon.svg').resize(256,256).png().toFile('assets/icon.png');
fs.writeFileSync('assets/icon.ico',await pngToIco('assets/icon.png'));
const chunks=[];
for(const [size,type] of [[256,'ic08'],[512,'ic09'],[1024,'ic10']]){const b=await sharp('assets/icon.svg').resize(size,size).png().toBuffer();const header=Buffer.alloc(8);header.write(type,0);header.writeUInt32BE(b.length+8,4);chunks.push(header,b);}
const payload=Buffer.concat(chunks),header=Buffer.alloc(8);header.write('icns',0);header.writeUInt32BE(payload.length+8,4);fs.writeFileSync('assets/icon.icns',Buffer.concat([header,payload]));
console.log('Built original application icons.');
