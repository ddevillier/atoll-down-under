import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {REEFS,SPECIES} from '../src/data.js';
test('all nine backgrounds exist and are unique images',()=>{const hashes=[];for(const r of REEFS){const b=fs.readFileSync(r.image);assert.ok(b.length>100000);assert.equal(b.toString('ascii',1,4),'PNG');hashes.push(crypto.createHash('sha256').update(b).digest('hex'));}assert.equal(new Set(hashes).size,9);});
test('four RGBA sprite atlases cover every defined species',()=>{for(let i=0;i<4;i++){const b=fs.readFileSync(`assets/creatures/fish-atlas-${i}.png`);assert.equal(b[25],6);assert.ok(b.length>100000);}assert.ok(SPECIES.every(s=>s.atlas<4&&s.cell<16));});
test('original music and effect assets have playable masters and compressed files',()=>{const m=JSON.parse(fs.readFileSync('assets/audio/manifest.json','utf8'));assert.equal(m.music.length,3);assert.ok(m.effects.length>=24);for(const e of [...m.music,...m.effects]){const b=fs.readFileSync('assets/audio/'+e.file);assert.equal(b.toString('ascii',0,4),'OggS');assert.ok(e.peak>0&&e.peak<=.71);assert.ok(e.rms>0.001);const w=fs.readFileSync('assets/audio/'+e.file.replace('.ogg','.wav'));assert.equal(w.toString('ascii',0,4),'RIFF');}for(const t of m.music)assert.ok(t.duration>=90);});
