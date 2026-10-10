import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {PRACTICE_SPECIES,REEFS} from '../src/data.js';
import {ADVENTURES,DISCOVERIES} from '../src/adventures.js';
import {beginResidentObservation} from '../src/resident-journeys.js';
import {optionalJourney,optionalObservation,explorationGoals} from '../src/exploration-goals.js';
import {badgeProgress,freshJournal,recordProgress,reconcileJournal,validateJournal,mergeJournals,persistJournal} from '../src/journal.js';
const date='2026-10-10T12:00:00.000Z';
const dive=id=>{const s=new Simulation(42);s.start('practice',id);return s;};

test('discoveries award persistent accomplishments once, including resident discoveries',()=>{
 const j=freshJournal();
 assert.deepEqual(recordProgress(j,'discovery','not-real',date),[]);
 assert.deepEqual(recordProgress(j,'discovery',DISCOVERIES[0],date).map(b=>b.id),['discovery1']);
 for(const id of DISCOVERIES.slice(1,15))recordProgress(j,'discovery',id,date);
 assert.equal(j.discoveries.length,15);
 for(const id of ['discovery1','discovery5','discovery15'])assert.equal(j.earned[id],date);
 assert.deepEqual(recordProgress(j,'discovery',DISCOVERIES[0],date),[]);
 assert.deepEqual(validateJournal(JSON.parse(JSON.stringify(j))),j);
 const resident=DISCOVERIES.at(-1);recordProgress(j,'discovery',resident,date);
 assert.equal(j.discoveries.at(-1),resident);
});
test('old recorded discoveries reconcile once without inventing species play or habitat access',()=>{
 const old=freshJournal();old.discoveries=DISCOVERIES.slice(0,5);
 const j=validateJournal(old);assert.deepEqual(j.earned,{});
 assert.deepEqual(reconcileJournal(j,date).map(b=>b.id),['discovery1','discovery5']);
 assert.deepEqual(reconcileJournal(j,'2026-10-11T00:00:00Z'),[]);
 assert.deepEqual([j.played,j.cared,j.habitats,j.activities],[[],[],[],[]]);
 assert.deepEqual(j.discoveries,old.discoveries);assert.deepEqual(old.earned,{});
});
test('independent discoveries merge into milestone and stale writes preserve earliest award',()=>{
 const a=freshJournal(),b=freshJournal();
 for(const id of DISCOVERIES.slice(0,3))recordProgress(a,'discovery',id,date);
 for(const id of DISCOVERIES.slice(3,5))recordProgress(b,'discovery',id,'2026-10-11T00:00:00Z');
 const merged=mergeJournals(a,b);
 assert.equal(merged.discoveries.length,5);assert.equal(merged.earned.discovery1,date);assert.ok(merged.earned.discovery5);
 assert.deepEqual(mergeJournals(merged,a),merged);
 let raw=JSON.stringify(merged);const storage={getItem:()=>raw,setItem:(_,v)=>{raw=v;}};
 const persisted=persistJournal(a,storage);assert.deepEqual(persisted,merged);
 assert.deepEqual(JSON.parse(raw),merged);
});
test('invalid event kinds, invalid award dates and oversized discoveries cannot damage a journal',()=>{
 const j=freshJournal(),before=structuredClone(j);
 assert.deepEqual(recordProgress(j,'unknown','meal',date),[]);
 assert.deepEqual(recordProgress(j,'discovery',DISCOVERIES[0],'invalid'),[]);
 assert.deepEqual(recordProgress(j,'cared','s1',Infinity),[]);
 assert.deepEqual(j,before);
 assert.throws(()=>validateJournal({...j,discoveries:Array(DISCOVERIES.length+1).fill(DISCOVERIES[0])}));
});
test('badge progress is measured from unique recorded outcomes, not arbitrary dive stages',()=>{
 const j=freshJournal();assert.deepEqual(badgeProgress(j,'discovery5'),{current:0,target:5,complete:false,eligible:false});
 recordProgress(j,'discovery',DISCOVERIES[0],date);
 assert.deepEqual(badgeProgress(j,'discovery5'),{current:1,target:5,complete:false,eligible:false});
 assert.equal(badgeProgress(j,'unknown'),null);
 assert.equal(badgeProgress(j,'discovery1').complete,true);
 assert.deepEqual(badgeProgress({...j,discoveries:[DISCOVERIES[0],DISCOVERIES[0]]},'discovery5').current,1);
});
test('every Practice species has optional exploration guidance without modifying the simulation',()=>{
 assert.equal(PRACTICE_SPECIES.length,57);
 for(const species of PRACTICE_SPECIES){
  const s=dive(species.id),before=s.serialize(),j=freshJournal(),goal=optionalJourney(s,j);
  assert.equal(goal.id,ADVENTURES[species.id].id);assert.equal(goal.optional,true);assert.equal(goal.complete,false);assert.equal(goal.recorded,false);
  assert.ok(goal.step.length>0&&goal.step.length<60,species.id+' '+goal.step);
  assert.ok(goal.instruction.length>0);assert.deepEqual(explorationGoals(s,j),[goal]);
  assert.equal(s.serialize(),before);
 }
});
test('recorded journeys remain playable and do not masquerade as completed new dives',()=>{
 const s=dive('s1'),j=freshJournal();recordProgress(j,'discovery',ADVENTURES.s1.id,date);
 const goal=optionalJourney(s,j);assert.equal(goal.status,'recorded');assert.equal(goal.complete,false);assert.equal(s.adventure.complete,false);
 s.adventure.complete=true;assert.equal(optionalJourney(s,j).status,'complete');
 const playableIds=PRACTICE_SPECIES.map(s=>s.id),reefIds=REEFS.map(r=>r.id);
 for(const species of PRACTICE_SPECIES){const fresh=dive(species.id);assert.equal(fresh.player.species.id,species.id);}
 assert.deepEqual(PRACTICE_SPECIES.map(s=>s.id),playableIds);assert.deepEqual(REEFS.map(r=>r.id),reefIds);
});
test('optional goals exclude scored modes and unsaved creation trials',()=>{
 const s=dive('s1'),j=freshJournal();s.mode='challenge';assert.equal(optionalJourney(s,j),null);assert.deepEqual(explorationGoals(s,j),[]);
 s.mode='practice';s.trial=true;assert.equal(optionalJourney(s,j),null);
 assert.equal(optionalJourney(null,j),null);
});
test('school guidance follows a committed meal, neighbor consumption, then reunion',()=>{
 const s=dive('s0'),j=freshJournal();assert.equal(optionalJourney(s,j).step,'Feed near your school');
 s.adventure.school={reef:s.current,patch:'f1',neighborMeal:false,joined:0};
 assert.equal(optionalJourney(s,j).step,'Let a schoolmate feed');
 s.adventure.school.neighborMeal=true;assert.equal(optionalJourney(s,j).step,'Rejoin your school');
 s.adventure.school.joined=3;assert.equal(optionalJourney(s,j).step,'Together again');
});
test('cleaner counters track unique actual clients, not repeated visits or general health',()=>{
 const s=dive('s43'),j=freshJournal();s.adventure.clients=['s1','s1','s2'];
 assert.deepEqual(optionalJourney(s,j).counter,{current:2,target:3,unit:'kinds of visitor'});
 assert.equal(optionalJourney(s,j).complete,false);
});
test('resident guidance respects identity loss, habitat changes and recorded-vs-completed state',()=>{
 const s=dive('s1'),j=freshJournal();
 const e=s.sections.flatMap(section=>section.entities).find(e=>e.species.id==='s46');assert.ok(e);
 s.current=s.sections.findIndex(section=>section.entities.includes(e));
 beginResidentObservation(s,e);const initial=optionalObservation(s,j);
 assert.equal(initial.step,'Watch a meal');assert.equal(initial.complete,false);
 s.residentJourneys.s46.meal=true;assert.equal(optionalObservation(s,j).step,'Watch it carry on');
 recordProgress(j,'discovery',initial.id,date);assert.equal(optionalObservation(s,j).status,'recorded');assert.equal(optionalObservation(s,j).complete,false);
 e.alive=false;assert.equal(optionalObservation(s,j).step,'Find another resident');e.alive=true;
 s.current=(s.current+1)%9;assert.equal(optionalObservation(s,j).step,'Return to this resident’s habitat');
 s.residentJourneys.s46.complete=true;assert.equal(optionalObservation(s,j).complete,true);
});
