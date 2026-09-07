import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {REEFS,SPECIES} from '../src/data.js';
import sharp from 'sharp';
import {SPECIES_SPRITES} from '../src/sprite-assets.js';
test('all nine backgrounds exist and are unique images',()=>{const hashes=[];for(const r of REEFS){const b=fs.readFileSync(r.image);assert.ok(b.length>100000);assert.equal(b.toString('ascii',1,4),'PNG');hashes.push(crypto.createHash('sha256').update(b).digest('hex'));}assert.equal(new Set(hashes).size,9);});
test('four RGBA sprite atlases cover every defined species',()=>{for(let i=0;i<4;i++){const b=fs.readFileSync(`assets/creatures/fish-atlas-${i}.png`);assert.equal(b[25],6);assert.ok(b.length>100000);}assert.ok(SPECIES.every(s=>s.atlas<4&&s.cell<16));});
test('standalone species illustrations have real transparency rather than a painted background',async()=>{
 for(const [index,file] of Object.entries(SPECIES_SPRITES)){
  assert.ok(SPECIES[Number(index)],`Unknown sprite index ${index}`);
  const im=sharp(file),meta=await im.metadata();
  assert.ok(meta.hasAlpha,`${file} needs a real alpha channel`);
  assert.ok(meta.width>=1000&&meta.height>=1000,`${file} needs a high-resolution source`);
  const {data,info}=await im.ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let transparent=0,solid=0,edgeSolid=0,edgeCount=0;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
   const a=data[(y*info.width+x)*info.channels+info.channels-1];
   if(a<5)transparent++;if(a>200)solid++;
   if(x===0||y===0||x===info.width-1||y===info.height-1){edgeCount++;if(a>40)edgeSolid++;}
  }
  const area=info.width*info.height;
  assert.ok(transparent/area>.1&&solid/area>.1,`${file} needs both clear background and visible animal`);
  assert.ok(edgeSolid/edgeCount<.01,`${file} touches too much of its image boundary`);
 }
});
test('original music and effect assets have playable masters and compressed files',()=>{const m=JSON.parse(fs.readFileSync('assets/audio/manifest.json','utf8'));assert.equal(m.music.length,3);assert.ok(m.effects.length>=24);for(const e of [...m.music,...m.effects]){const b=fs.readFileSync('assets/audio/'+e.file);assert.equal(b.toString('ascii',0,4),'OggS');assert.ok(e.peak>0&&e.peak<=.71);assert.ok(e.rms>0.001);const w=fs.readFileSync('assets/audio/'+e.file.replace('.ogg','.wav'));assert.equal(w.toString('ascii',0,4),'RIFF');}for(const t of m.music)assert.ok(t.duration>=90);});
