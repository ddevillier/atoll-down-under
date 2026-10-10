import test from 'node:test';
import assert from 'node:assert/strict';
import {COSMETIC_PALETTES,cosmeticsForJournal,matchingCosmetic,applyCosmetic,cosmeticPicker} from '../src/cosmetics.js';
import {DEFAULT_BLUEPRINT,blueprint,newCreation,validateCreation} from '../src/creations.js';
import {freshJournal,recordProgress,validateJournal,mergeJournals} from '../src/journal.js';
import {Simulation} from '../src/simulation.js';
import {createSpecies,PRACTICE_SPECIES,REEFS} from '../src/data.js';
import {creationTrial} from '../src/creation-trial.js';
import {exportDive,importDive} from '../src/save-files.js';
import {DISCOVERIES} from '../src/adventures.js';

function earnedJournal(){
 const j=freshJournal();
 for(const activity of ['meal','clean','helper','shelter','night'])recordProgress(j,'activity',activity);
 for(const s of PRACTICE_SPECIES.slice(0,3))recordProgress(j,'cared',s.id);
 for(const r of [0,1,2])recordProgress(j,'habitat',r);
 for(const discovery of DISCOVERIES.slice(0,15))recordProgress(j,'discovery',discovery);
 return j;
}
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');

test('recipes unlock only for recorded badges, including restored and merged journals',()=>{
 const j=freshJournal();assert.deepEqual(cosmeticsForJournal(j),[]);
 j.activities.push('meal');assert.deepEqual(cosmeticsForJournal(j),[]);
 recordProgress(j,'activity','meal');assert.deepEqual(cosmeticsForJournal(j).map(p=>p.id),['sunlit']);
 const restored=validateJournal(JSON.parse(JSON.stringify(earnedJournal())));
 assert.equal(cosmeticsForJournal(mergeJournals(j,restored)).length,COSMETIC_PALETTES.length);
 assert.deepEqual(cosmeticsForJournal({earned:{meal:'invalid',night:false}}),[]);
 assert.deepEqual(cosmeticsForJournal(null),[]);
 assert.throws(()=>applyCosmetic(DEFAULT_BLUEPRINT,'moonbeam',j),/not been earned/);
});

test('every earned recipe is distinct and preserves anatomy, abilities, diet, cost and stats',()=>{
 const j=earnedJournal(),original=structuredClone(DEFAULT_BLUEPRINT),base=createSpecies(original);
 assert.equal(new Set(COSMETIC_PALETTES.map(p=>JSON.stringify(p.colors))).size,COSMETIC_PALETTES.length);
 for(const palette of cosmeticsForJournal(j)){
  const next=applyCosmetic(original,palette.id,j),species=createSpecies(next);
  assert.equal(matchingCosmetic(next,j),palette.id);
  assert.deepEqual(blueprint(next),next);
  assert.deepEqual(Object.keys(next),Object.keys(original));
  for(const key of ['name','size','speed','endurance','agility','ability','active','diet','body','shapeMode','bodyLength','bodyDepth','tail','dorsal','pectoral','mouth'])assert.deepEqual(next[key],original[key]);
  for(const key of ['size','speed','endurance','agility','ability','active','diet','cost','atlas','cell','habitat'])assert.deepEqual(species[key],base[key]);
  for(const key of ['color','finColor','markingColor'])assert.match(next[key],/^#[0-9a-f]{6}$/);
 }
 assert.deepEqual(original,DEFAULT_BLUEPRINT);
 assert.notEqual(applyCosmetic(original,'',j),original);
 assert.deepEqual(applyCosmetic(original,'',j),original);
 assert.equal(PRACTICE_SPECIES.length,57);assert.equal(REEFS.length,9);
});

test('earned colors stay editable and saved appearances never require owning their recipe',()=>{
 const j=earnedJournal(),next=applyCosmetic(DEFAULT_BLUEPRINT,'twilight',j);
 assert.equal(matchingCosmetic({...next,finColor:'#102030'},j),'');
 assert.equal(matchingCosmetic({...next,marking:'plain'},j),'');
 assert.equal(matchingCosmetic(next,freshJournal()),'');
 const free=blueprint({...next,color:'#102030',finColor:'#405060',markingColor:'#708090'});
 assert.equal(free.color,'#102030');assert.equal(free.finColor,'#405060');
 assert.deepEqual(validateCreation(newCreation(next)).blueprint,next);
});

test('each recipe paints the same saved appearance through test, keep, portable import and resume',()=>{
 const j=earnedJournal();
 for(const p of cosmeticsForJournal(j)){
  const next=applyCosmetic(DEFAULT_BLUEPRINT,p.id,j),trial=creationTrial(next);
  assert.equal(trial.trial,true);assert.deepEqual(trial.creation.blueprint,next);
  const kept=new Simulation(16);kept.start('create','custom',next);
  const restored=Simulation.restore(kept.serialize()),imported=importDive(exportDive(kept,'Colors')).simulation;
  for(const sim of [trial,kept,restored,imported]){
   assert.equal(sim.player.species.color,p.colors.color);
   assert.equal(sim.player.species.appearance.finColor,p.colors.finColor);
   assert.equal(sim.player.species.appearance.markingColor,p.colors.markingColor);
   assert.equal(sim.player.species.appearance.marking,p.colors.marking);
   assert.equal(sim.creation.blueprint.diet,DEFAULT_BLUEPRINT.diet);
  }
  assert.equal(restored.creation.id,kept.creation.id);assert.equal(imported.creation.id,kept.creation.id);
 }
});

test('quiet picker offers earned recipes and keeps unearned criteria behind a disclosure',()=>{
 const empty=cosmeticPicker(DEFAULT_BLUEPRINT,freshJournal(),escape);
 assert.match(empty,/<option value="">Custom<\/option>/);
 assert.equal((empty.match(/<option /g)||[]).length,1);
 assert.match(empty,/<details class="cosmetic-criteria"><summary>Earn more colors<\/summary>/);
 assert.doesNotMatch(empty,/<details[^>]* open/);
 const j=earnedJournal(),full=cosmeticPicker(applyCosmetic(DEFAULT_BLUEPRINT,'pearl',j),j,escape);
 assert.equal((full.match(/<option /g)||[]).length,COSMETIC_PALETTES.length+1);
 assert.match(full,/<option value="pearl" selected>Pearl<\/option>/);
 assert.doesNotMatch(full,/cosmetic-criteria/);
});

test('discoveries earn color recipes exactly at their varied thresholds without repeats',()=>{
 const j=freshJournal();
 for(let i=0;i<15;i++){
  recordProgress(j,'discovery',DISCOVERIES[i]);
  assert.deepEqual(cosmeticsForJournal(j).map(p=>p.id),i>=14?['lagoon','copper-reef','deep-current']:i>=4?['lagoon','copper-reef']:['lagoon']);
  recordProgress(j,'discovery',DISCOVERIES[i]);assert.equal(j.discoveries.length,i+1);
 }
});
