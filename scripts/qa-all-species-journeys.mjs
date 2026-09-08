import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import {SPECIES,PRACTICE_SPECIES} from '../src/data.js';import {ADVENTURES,JOURNEYS} from '../src/adventures.js';
const jobs=[
 ['qa-original-journeys.mjs','original-journeys-generated.json',19],
 ['qa-home-journeys.mjs','home-journeys-generated.json',24],
 ['qa-foraging-journeys.mjs','foraging-journeys-generated.json',30],
 ['qa-patrol-journeys.mjs','patrol-generated.json',27],
 ['qa-watch-journeys.mjs','watch-generated.json',21],
 ['qa-final-playable-journeys.mjs','final-playable-generated.json',12],
 ['qa-resident-journeys.mjs','resident-journeys-generated.json',21]
];
const reports=[],covered=new Set();
for(const [script,file,count] of jobs){try{execFileSync(process.execPath,['scripts/'+script],{stdio:'pipe',maxBuffer:8*1024*1024});}catch(e){console.error(e.stdout?.toString(),e.stderr?.toString());throw Error(script+' failed; see its diagnostic above');}const r=JSON.parse(fs.readFileSync('artifacts/'+file));assert.equal(r.cases,count);assert.equal(r.completed,count);assert.equal(r.results.length,count);for(const row of r.results){assert.equal(row.complete,true);covered.add(row.id);}reports.push({script,file,cases:count,scope:r.scope});console.log(script+': '+count+' complete');}
assert.deepEqual([...covered].sort(),SPECIES.map(s=>s.id).sort());assert.deepEqual(Object.keys(ADVENTURES).sort(),PRACTICE_SPECIES.map(s=>s.id).sort());assert.deepEqual(Object.keys(JOURNEYS).sort(),SPECIES.map(s=>s.id).sort());assert.equal(new Set(Object.values(JOURNEYS).map(j=>j.id)).size,64);
const sources=Object.fromEntries(fs.readdirSync('src').filter(f=>f.endsWith('.js')||f==='activity-narration.json').sort().map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync('src/'+f)).digest('hex')]));
const result={generatedAt:new Date().toISOString(),playable:57,residents:7,uniqueJourneyIds:64,speciesWithCompletedPaths:covered.size,completedCases:reports.reduce((n,r)=>n+r.cases,0),scope:'Complete generated paths for every catalog species. Existing 19 journeys use seed 42; 45 new roles use seeds 2, 42 and 57. Driver transitions and steering are documented per report. No population, appetite, food or position replacement in these acceptance drivers.',reports,sources};fs.writeFileSync('artifacts/all-species-journeys-verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify({...result,reports:undefined,sources:undefined}));
