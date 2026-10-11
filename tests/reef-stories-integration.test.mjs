import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {beginStory,stopStory,storyAction,tickStories,activeStory,freshStories,validStories,admissionFor,storyClick,storyPointer,storyPlayer,storyMeal,storySafety,validStoryPlayer,storyView} from '../src/reef-stories.js';
import {storyKeyFor,REEF_STORIES} from '../src/reef-story-data.js';
import {exportDive,importDive} from '../src/save-files.js';
import {freshJournal,recordProgress,validateJournal} from '../src/journal.js';
import {PRACTICE_SPECIES,REEFS} from '../src/data.js';
import {animalProfile} from '../src/animal-profiles.js';
import {deformPoint} from '../src/articulated-motion.js';
import {rigFor} from '../src/animal-rigs.js';
import {beginAmbush,ambushSites} from '../src/ambush-activity.js';
import {useEscortContext} from '../src/escort-journeys.js';
const make=id=>{const s=new Simulation(42);s.start('practice',id);return s;};
const cards=[['s30','housekeeper',4],['s8','lookout',0],['s52','lookout',0],['s54','walker',4],['s3','nest',4],['s24','crevice',4],['s12','shade',8],['s53','lantern',8]];
const guided=(id,key,seed=42)=>{const s=new Simulation(seed);s.start('practice',id,null,{adventureKey:key});return s;};
test('all six featured species enter optional stories, keep every habitat and resume their portable state',()=>{for(const id of ['s43','s45','s19','s15','s9','s13']){const s=make(id),ids=s.sections.flatMap(r=>r.entities.map(e=>e.id));assert.equal(s.reefStories.active,null);assert.equal(beginStory(s),true);const key=storyKeyFor(id);assert.equal(activeStory(s),key);assert.equal(s.sections.length,9);assert.deepEqual(s.sections.flatMap(r=>r.entities.map(e=>e.id)),ids);const loaded=importDive(exportDive(s,'Optional adventure')).simulation;assert.deepEqual(loaded.reefStories,s.reefStories);const saved=structuredClone(s.reefStories[key]);stopStory(s);beginStory(s);assert.deepEqual(s.reefStories[key],saved);}assert.equal(PRACTICE_SPECIES.length,57);assert.equal(REEFS.length,9);});
test('a pending shrimp clinic follows real travel and initializes in the right reef',()=>{const s=make('s45');beginStory(s);assert.equal(s.current,4);assert.equal(s.reefStories.clinic,null);assert.equal(s.destination,8);assert.equal(s.transition(1,0),true);assert.equal(s.transition(0,1),true);tickStories(s,.05);assert.equal(s.current,8);assert.equal(s.reefStories.clinic.reef,8);});
test('story checkpoints freeze on pause and invalid role/unknown state cannot import',()=>{for(const id of ['s43','s45','s19','s15','s9','s13']){const s=make(id);beginStory(s);s.paused=true;const before=s.serialize();tickStories(s,.05);assert.equal(s.serialize(),before);assert.equal(storyAction(s,'context'),false);const bad=JSON.parse(exportDive(s,'Bad'));bad.state.reefStories.active=storyKeyFor(id)==='engineer'?'nursery':'engineer';assert.throws(()=>importDive(JSON.stringify(bad)));const unknown=JSON.parse(s.serialize());unknown.reefStories.injected=true;assert.throws(()=>Simulation.restore(unknown));}});
test('existing dive and journal formats migrate without losing progress or changing free exploration',()=>{const s=make('s2'),old=JSON.parse(s.serialize());delete old.reefStories;const restored=Simulation.restore(old);assert.equal(restored.reefStories.active,null);assert.equal(beginStory(restored),false);const journal=freshJournal();recordProgress(journal,'activity','meal');for(const story of Object.values(REEF_STORIES)){recordProgress(journal,'discovery',story.id);recordProgress(journal,'discovery',story.id);}const loaded=validateJournal(journal);assert.equal(loaded.discoveries.length,Object.keys(REEF_STORIES).length);assert.ok(loaded.earned.meal);assert.ok(loaded.earned.discovery5);});
test('Banggai brood deforms the lower mouth while protecting the painted eye',()=>{const p=animalProfile(PRACTICE_SPECIES.find(s=>s.id==='s13')),eye=rigFor(p).eye;assert.deepEqual(deformPoint(p,...eye,0,.2,{brood:1}),deformPoint(p,...eye,0,.2,{brood:0}));const jaw=[.94,.64],normal=deformPoint(p,...jaw,0,.2,{brood:0}),brood=deformPoint(p,...jaw,0,.2,{brood:1});assert.ok(brood.y-normal.y>.025);});

test('a saved clinic cannot silently switch its cleaner species',()=>{const s=make('s43');beginStory(s);const raw=JSON.parse(s.serialize());raw.reefStories.clinic.species='s45';raw.reefStories.clinic.reef=8;assert.throws(()=>Simulation.restore(raw),/does not match/);});

test('seven stories start explicitly in their habitats without changing an admitted population or appetite',()=>{
 for(const [id,key,reef] of cards){
  const s=guided(id,key),before=s.sections.map(section=>structuredClone(section.entities));
  assert.equal(s.current,reef,`${id} guided habitat`);
  assert.equal(admissionFor(s,key).available,true,`${id} admission`);
  assert.equal(beginStory(s,key),true,id);assert.equal(activeStory(s),key,id);
  assert.deepEqual(s.sections.map(section=>section.entities),before,`${id} Begin does not alter actors`);
  assert.equal(validStories(s.reefStories),true,id);assert.equal(validStoryPlayer(s),true,id);
  assert.equal(storyView(s).key,key,id);
  const saved=structuredClone(s.reefStories[key]),loaded=importDive(exportDive(s,'New adventure')).simulation;
  assert.deepEqual(loaded.reefStories[key],saved,id);assert.equal(activeStory(loaded),key,id);
  assert.equal(beginStory(loaded,key),true,`${id} paused Continue`);
  assert.deepEqual(loaded.reefStories[key],saved,`${id} Continue preserves checkpoint`);
 }
});

test('old five-slot story records import while unknown keys and malformed new records fail',()=>{
 const oldKeys=['clinic','artist','engineer','detective','nursery'];
 for(const id of ['s43','s45','s19','s15','s9','s13']){
  const s=make(id);assert.equal(beginStory(s),true);
  const raw=JSON.parse(s.serialize());for(const key of Object.keys(REEF_STORIES))if(!oldKeys.includes(key))delete raw.reefStories[key];
  assert.equal(validStories(raw.reefStories),true);
  assert.deepEqual(Simulation.restore(raw).reefStories[storyKeyFor(id)],s.reefStories[storyKeyFor(id)]);
 }
 assert.equal(validStories(undefined),true);assert.equal(validStories(null),false);
 for(const active of ['constructor','__proto__','coral-housekeeper','unknown',{}])assert.equal(validStories({...freshStories(),active}),false);
 assert.equal(validStories({...freshStories(),unexpected:{}}),false);
 for(const [id,key] of cards){
  const s=guided(id,key);beginStory(s,key);const raw=JSON.parse(s.serialize());raw.reefStories[key].version=999;
  assert.equal(validStories(raw.reefStories),false,key);assert.throws(()=>Simulation.restore(raw),/reef adventures/,key);
 }
});

test('wrong explicit keys reject before changing an active checkpoint or population',()=>{
 const s=guided('s30','housekeeper');beginStory(s,'housekeeper');const before=s.serialize();
 for(const key of ['lookout','coral-housekeeper','constructor','unknown']){
  assert.equal(admissionFor(s,key).available,false,key);assert.equal(beginStory(s,key),false,key);assert.equal(s.serialize(),before,key);
 }
 for(const malformed of [false,0,'damaged']){
  const damaged=guided('s30','housekeeper');damaged.reefStories.housekeeper=malformed;const saved=damaged.serialize();
  assert.equal(admissionFor(damaged,'housekeeper').available,false);assert.equal(beginStory(damaged,'housekeeper'),false);assert.equal(damaged.serialize(),saved);
 }
});

test('unavailable fresh encounters explain their missing actors without fabricating them',()=>{
 for(const [id,key] of [['s8','lookout'],['s52','lookout'],['s12','shade'],['s53','lantern']]){
  const s=guided(id,key);for(const section of s.sections)for(const e of section.entities)if(e.species.id===id)e.alive=false;
  const before=s.serialize(),result=admissionFor(s,key);
  assert.equal(result.available,false,id);assert.ok(result.reason.trim(),id);assert.equal(result.needsFreshDive,true,id);
  assert.equal(beginStory(s,key),false,id);assert.equal(s.serialize(),before,`${id} admission is read-only`);
 }
});

test('Continue retains a saved school route even while its original participants are busy or missing',()=>{
 const s=guided('s53','lantern');beginStory(s,'lantern');assert.equal(storyAction(s,'lantern-upper'),true);
 const saved=structuredClone(s.reefStories.lantern);assert.ok(saved.participants.length>=2);
 stopStory(s);
 // Restoring the saved checkpoint models an existing paused dive whose actors
 // became unavailable. Admission must not silently select different fish.
 s.reefStories.lantern=saved;
 for(const ref of saved.participants){const e=s.sections[8].entities.find(e=>e.id===ref.id);e.target='already-owned-meal';e.feeding={target:e.target,committed:true};}
 assert.equal(admissionFor(s,'lantern').available,true);assert.equal(beginStory(s,'lantern'),true);
 assert.deepEqual(s.reefStories.lantern,saved);
 s.reefStories.active=null;for(const ref of saved.participants)s.sections[8].entities.find(e=>e.id===ref.id).alive=false;
 assert.equal(admissionFor(s,'lantern').available,true);assert.equal(beginStory(s,'lantern'),true);assert.deepEqual(s.reefStories.lantern,saved);
});

test('paused optional input and movement hooks freeze every new checkpoint',()=>{
 for(const [id,key] of cards){const s=guided(id,key);beginStory(s,key);s.paused=true;const before=s.serialize();
  assert.equal(storyAction(s,'context'),false,id);assert.equal(storyClick(s,400,400),false,id);assert.equal(storyPointer(s,600,500),false,id);assert.equal(storyPlayer(s,.05),false,id);
  storyMeal(s,s.section.food[0]);tickStories(s,.05);assert.equal(s.serialize(),before,id);
 }
});

test('NPC meal receipts cannot advance any of the five older player-only stories',()=>{
 for(const id of ['s43','s45','s19','s15','s9','s13']){const s=make(id);beginStory(s);const before=structuredClone(s.reefStories);assert.equal(storyMeal(s,s.section.food[0],s.section.entities[0]),false,id);assert.deepEqual(s.reefStories,before,id);}
});

test('planted walking releases its physical pose before safety ends, including paused cancellation',()=>{
 const s=guided('s54','walker');beginStory(s,'walker');assert.equal(storyAction(s,'walker-plant'),true);
 for(let i=0;i<800&&s.reefStories.walker.phase==='approach';i++)storyPlayer(s,.05);
 assert.equal(s.reefStories.walker.phase,'stance');assert.equal(validStoryPlayer(s),true);
 const saved=JSON.parse(s.serialize());saved.player.x+=12;assert.throws(()=>Simulation.restore(saved),/adventure|walking|pose/);
 s.player.hurtGrace=0;s.paused=true;const safety=storySafety(s);assert.ok(safety);assert.equal(safety.holdNeeds,true);
 assert.equal(stopStory(s),true);assert.equal(s.reefStories.walker.phase,'detached');assert.equal(s.reefStories.active,null);assert.equal(storySafety(s),null);
 assert.ok(s.player.hurtGrace>0);assert.deepEqual(s.pointer,{x:s.player.x,y:s.player.y});
});

test('locked crevice saves validate their actual actor and release the spine before paused exit grace',()=>{
 const s=guided('s24','crevice');beginStory(s,'crevice');assert.equal(storyAction(s,'crevice-choose',1),true);
 for(let i=0;i<300;i++)storyPlayer(s,.05);
 assert.equal(storyAction(s,'crevice-enter'),true);for(let i=0;i<100;i++)storyPlayer(s,.05);
 assert.equal(storyAction(s,'crevice-lock'),true);for(let i=0;i<20;i++)storyPlayer(s,.05);
 assert.equal(s.reefStories.crevice.stage,'locked');assert.equal(validStoryPlayer(s),true);
 const saved=JSON.parse(s.serialize());
 for(const change of [raw=>raw.player.x+=30,raw=>raw.player.angle+=.2,raw=>raw.reefStories.crevice.actor.incarnation++]){
  const damaged=structuredClone(saved);change(damaged);assert.throws(()=>Simulation.restore(damaged),/adventure/);
 }
 const loaded=importDive(exportDive(s,'Locked crevice')).simulation;assert.equal(loaded.paused,true);
 assert.deepEqual(loaded.reefStories.crevice,s.reefStories.crevice);assert.equal(storySafety(loaded)?.holdNeeds,true);
 loaded.player.hurtGrace=0;assert.equal(stopStory(loaded),true);
 assert.equal(loaded.reefStories.crevice.stage,'choose');assert.equal(loaded.reefStories.crevice.spine,0);
 assert.equal(loaded.player.triggerfishSpine,0);assert.equal(loaded.player.crevicePose,null);assert.equal(storySafety(loaded),null);assert.ok(loaded.player.hurtGrace>0);
});

test('paused school safety retains exact participant identities through portable restore and stop',()=>{
 const s=guided('s53','lantern');beginStory(s,'lantern');storyAction(s,'lantern-upper');
 const refs=s.reefStories.lantern.participants;assert.ok(refs.length>=2);
 const loaded=importDive(exportDive(s,'School bend')).simulation,safety=storySafety(loaded);
 assert.ok(safety);assert.deepEqual(safety.participants,refs.map(({id,incarnation})=>({id,incarnation,species:'s53'})));
 const actors=safety.participants.map(ref=>loaded.sections[8].entities.find(e=>e.id===ref.id));
 loaded.player.hurtGrace=0;for(const e of actors)e.hurtGrace=0;
 assert.equal(stopStory(loaded),true);assert.equal(storySafety(loaded),null);assert.ok(loaded.player.hurtGrace>0);
 for(const e of actors)assert.ok(e.hurtGrace>0);
});

test('fresh story activation releases exploration assists while same-checkpoint Continue preserves its meal',()=>{
 const walker=guided('s54','walker');beginAmbush(walker,ambushSites(walker)[0]);assert.ok(walker.player.ambush);
 assert.equal(beginStory(walker,'walker'),true);assert.equal(walker.player.ambush,null);assert.equal(walker.player.hidden,false);
 assert.equal(storyPlayer(walker,.05),false);walker.step(.05);assert.equal(walker.player.ambush,null);

 const school=guided('s53','lantern');assert.equal(useEscortContext(school),true);assert.equal(school.adventure.escortJourney.following,true);
 assert.equal(beginStory(school,'lantern'),true);assert.equal(school.adventure.escortJourney.following,false);
 assert.equal(storyPlayer(school,.05),false);

 const home=guided('s30','housekeeper'),meal=home.section.food.find(f=>f.food==='plankton');assert.ok(meal);
 assert.equal(home.eatAt(meal.x,meal.y),true);assert.equal(home.player.target,meal.id);
 for(let i=0;i<800&&!home.player.feeding;i++)home.step(.05);
 assert.ok(home.player.feeding);assert.equal(home.player.feeding.committed,false);
 assert.equal(beginStory(home,'housekeeper'),true);assert.equal(home.player.target,null);assert.equal(home.player.feeding,null);
 assert.deepEqual(home.pointer,{x:home.player.x,y:home.player.y});
 assert.equal(home.eatAt(meal.x,meal.y),true);const state=structuredClone(home.reefStories.housekeeper),pointer=structuredClone(home.pointer);
 home.paused=true;assert.equal(beginStory(home,'housekeeper'),true);assert.equal(home.player.target,meal.id);
 assert.deepEqual(home.reefStories.housekeeper,state);assert.deepEqual(home.pointer,pointer);
});

test('saved missing lookout and school casts render honest recovery without replacing actors or resetting appetite',()=>{
 for(const [id,key] of [['s8','lookout'],['s52','lookout'],['s53','lantern']]){
  const s=guided(id,key);beginStory(s,key);
  storyAction(s,key==='lookout'?'invite':'lantern-upper');
  assert.ok(key==='lookout'?s.reefStories.lookout.buddy:s.reefStories.lantern.participants.length>=2);
  for(const e of s.section.entities)if(e.species.id===id)e.alive=false;
  tickStories(s,.05);assert.equal(key==='lookout'?s.reefStories.lookout.phase:s.reefStories.lantern.stage,key==='lookout'?'unavailable':'gather');
  const loaded=importDive(exportDive(s,'Missing neighbors')).simulation,before=loaded.serialize(),view=storyView(loaded);
  assert.equal(view.needsFreshDive,true,id);assert.match(view.detail,/no eligible|paired, busy|digesting|grazing patch/i,id);
  assert.equal(loaded.serialize(),before,`${id} recovery view is read-only`);
  assert.equal(admissionFor(loaded,key).available,true,`${id} existing Continue remains available`);
  assert.equal(beginStory(loaded,key),true);assert.equal(loaded.serialize(),before,`${id} Continue does not replace the cast`);
 }
 const choosing=guided('s8','lookout');beginStory(choosing,'lookout');
 for(const e of choosing.section.entities)if(e.species.id==='s8')e.alive=false;
 const before=choosing.serialize();assert.equal(storyView(choosing).needsFreshDive,true);assert.equal(choosing.serialize(),before);
 const stale=guided('s8','lookout');beginStory(stale,'lookout');storyAction(stale,'invite');
 const original=structuredClone(stale.reefStories.lookout.buddy),reused=stale.section.entities.find(e=>e.id===original.id);reused.incarnation=(reused.incarnation||0)+1;
 tickStories(stale,.05);assert.equal(stale.reefStories.lookout.phase,'unavailable');
 const saved=stale.serialize(),view=storyView(stale);assert.notEqual(view.needsFreshDive,true);assert.match(view.detail,/original companion is away/);
 assert.deepEqual(stale.reefStories.lookout.buddy,original);assert.equal(stale.serialize(),saved,'A stale reference is not silently rebound to its replacement');
});

test('a released original lookout meal reports waiting instead of offering a false fresh dive',()=>{
 const s=guided('s8','lookout',9);beginStory(s,'lookout');storyAction(s,'invite');storyAction(s,'site','crest-open');
 const buddy=s.section.entities.find(e=>e.id===s.reefStories.lookout.buddy.id);
 const until=check=>{for(let i=0;i<3000&&!check();i++)s.step(1/60);assert.equal(check(),true,JSON.stringify(s.reefStories.lookout));};
 until(()=>buddy.satiated<=0);storyAction(s,'watch');until(()=>s.reefStories.lookout.phase==='signal');
 const passer=s.section.entities.find(e=>e.id===s.reefStories.lookout.passer.id);s.point(passer.x,passer.y);s.eatAt(passer.x,passer.y);storyAction(s,'hold');
 until(()=>s.reefStories.lookout.phase==='swap');assert.equal(buddy.feeding.committed,true);
 assert.notEqual(storyView(s).needsFreshDive,true);storyAction(s,'leave');assert.equal(s.reefStories.lookout.phase,'unavailable');
 const loaded=importDive(exportDive(s,'Finishing a bite')).simulation,before=loaded.serialize(),view=storyView(loaded);
 assert.equal(view.needsFreshDive,false);assert.match(view.detail,/finishing its meal/);assert.equal(loaded.serialize(),before);
});
