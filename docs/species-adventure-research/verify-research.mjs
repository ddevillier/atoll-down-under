import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {SPECIES,PRACTICE_SPECIES} from '../../src/data.js';
const dir=path.dirname(fileURLToPath(import.meta.url));
const coverage=JSON.parse(fs.readFileSync(path.join(dir,'coverage.json'),'utf8'));
const failures=[];
const review=JSON.parse(fs.readFileSync(path.join(dir,'review-assignments.json'),'utf8'));
if(review.assignments.length!==20||new Set(review.assignments.map(r=>r.agent)).size!==20)failures.push('Expected twenty distinct reviewers');
if(review.assignments.some(r=>r.status!=='research review complete'))failures.push('Incomplete research review');
const seen=new Set();
const reports=new Set();
for(const row of coverage.coverage){
 if(seen.has(row.id))failures.push(`Duplicate ${row.id}`);
 seen.add(row.id);reports.add(row.report);
 const species=SPECIES.find(s=>s.id===row.id);
 if(!species||species.name!==row.name)failures.push(`Roster mismatch ${row.id}`);
 const role=PRACTICE_SPECIES.some(s=>s.id===row.id)?'playable':'resident';
 if(role!==row.role)failures.push(`Role mismatch ${row.id}`);
 const report=path.join(dir,row.report);
 if(!fs.existsSync(report))failures.push(`Missing report ${row.report}`);
 else if(!fs.readFileSync(report,'utf8').includes(row.id))failures.push(`Report omits ${row.id}`);
}
for(const s of SPECIES)if(!seen.has(s.id))failures.push(`Uncovered ${s.id}`);
if(reports.size!==20)failures.push(`Expected 20 reports, found ${reports.size}`);
if(new Set(review.assignments.map(r=>r.report)).size!==20||review.assignments.some(r=>!reports.has(r.report)))failures.push('Reviewer/report coverage mismatch');
const docs=[...reports].map(r=>path.join(dir,r));
docs.push(path.join(dir,'README.md'),path.join(dir,'../SPECIES-ADVENTURE-SPRINT-PLAN.md'),path.join(dir,'../SPECIES-ADVENTURE-RESEARCH-SYNTHESIS.md'));
const external=new Set();let localLinks=0;
for(const file of docs){
 const text=fs.readFileSync(file,'utf8');
 for(const match of text.matchAll(/\]\(([^\s)]+)\)/g)){
  const target=match[1];
  if(/^https?:\/\//.test(target)){external.add(target);continue;}
  if(target.startsWith('#')||/^[a-z]+:/i.test(target))continue;
  const name=decodeURIComponent(target.split('#')[0]);
  if(!name)continue;
  localLinks++;
  if(!fs.existsSync(path.resolve(path.dirname(file),name)))failures.push(`Broken link ${path.basename(file)} -> ${target}`);
 }
}
const result={researchAssignments:review.assignments.length,distinctReviewers:new Set(review.assignments.map(r=>r.agent)).size,reports:reports.size,rosterCovered:seen.size,practicePlayable:PRACTICE_SPECIES.length,residents:SPECIES.length-PRACTICE_SPECIES.length,uniqueExternalReferences:external.size,localMarkdownLinksChecked:localLinks,failures,runtimeTestsRun:false,runtimeImplementationPerformedByResearchRefresh:false,notes:'Coverage and local link checks only. Biology verification and access limits are documented in each report; game ideas and pending drafts are not claimed shipped or playtested.'};
fs.writeFileSync(path.join(dir,'verification.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
if(failures.length)process.exitCode=1;
