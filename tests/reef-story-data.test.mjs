import test from 'node:test';
import assert from 'node:assert/strict';
import {SPECIES,PRACTICE_SPECIES} from '../src/data.js';
import {REEF_STORIES,STORY_IDS,STORY_REFLECTIONS,storyKeysFor,storyKeyFor,storyCompatible} from '../src/reef-story-data.js';
import {NATURAL_HISTORY} from '../src/natural-history.js';

const expected={
 clinic:['reef-clinic',['s43','s45']],artist:['disappearing-artist',['s19']],
 engineer:['sandcastle-engineer',['s15']],detective:['whisker-detective',['s9']],nursery:['cardinalfish-nursery',['s13']],
 housekeeper:['coral-housekeeper',['s30']],lookout:['rabbitfish-lookout',['s8','s52']],
 walker:['frogfish-walk',['s54']],nest:['gramma-nest',['s3']],crevice:['triggerfish-crevice',['s24']],
 shade:['squirrelfish-shade',['s12']],lantern:['lantern-company',['s53']]
};

test('story keys and discovery IDs are unique and match the declared species contracts',()=>{
 assert.deepEqual(Object.keys(REEF_STORIES),Object.keys(expected));
 assert.deepEqual(STORY_IDS,Object.values(expected).map(([id])=>id));
 assert.equal(new Set(STORY_IDS).size,STORY_IDS.length);
 const playable=new Set(PRACTICE_SPECIES.map(s=>s.id));
 for(const [key,[id,species]] of Object.entries(expected)){
  const story=REEF_STORIES[key];
  assert.equal(story.id,id,key);
  assert.deepEqual(story.species,species,key);
  assert.equal(new Set(story.species).size,story.species.length,key);
  assert.ok(story.species.every(s=>playable.has(s)),`${key} admits only playable creatures`);
  assert.ok(story.name.trim()&&story.description.trim(),key);
 }
});

test('every species lists all compatible stories and preserves its first default',()=>{
 for(const species of SPECIES){
  const matching=Object.keys(REEF_STORIES).filter(key=>REEF_STORIES[key].species.includes(species.id));
  assert.deepEqual(storyKeysFor(species.id),matching,species.id);
  assert.equal(storyKeyFor(species.id),matching[0]??null,species.id);
  for(const key of Object.keys(REEF_STORIES))assert.equal(storyCompatible(species.id,key),matching.includes(key),`${species.id}/${key}`);
 }
 for(const id of [null,undefined,'','unknown','s64']){
  assert.deepEqual(storyKeysFor(id),[]);
  assert.equal(storyKeyFor(id),null);
  assert.equal(storyCompatible(id,'lookout'),false);
 }
 for(const key of [null,undefined,'unknown','toString','constructor','__proto__'])assert.equal(storyCompatible('s8',key),false);
 const list=storyKeysFor('s8');list.push('invalid');assert.deepEqual(storyKeysFor('s8'),['lookout']);
});

test('a later second story is discoverable without replacing an existing default',()=>{
 REEF_STORIES.registryTest={id:'registry-test',name:'Registry test',species:['s19'],description:'Test fixture.'};
 try{
  assert.deepEqual(storyKeysFor('s19'),['artist','registryTest']);
  assert.equal(storyKeyFor('s19'),'artist');
  assert.equal(storyCompatible('s19','registryTest'),true);
  assert.equal(storyCompatible('s8','registryTest'),false);
 }finally{delete REEF_STORIES.registryTest;}
});

test('every story has one brief reflection and new biological roles stay explicit',()=>{
 assert.deepEqual(Object.keys(STORY_REFLECTIONS),Object.keys(REEF_STORIES));
 for(const key of Object.keys(REEF_STORIES))assert.ok(typeof STORY_REFLECTIONS[key]==='string'&&STORY_REFLECTIONS[key].trim().length>0&&STORY_REFLECTIONS[key].length<260,key);
 assert.match(STORY_REFLECTIONS.nest,/nesting male/);
 assert.match(STORY_REFLECTIONS.lantern,/Anomalops katoptron case study/);
 assert.match(STORY_REFLECTIONS.lookout,/Researchers observed/);
});

test('new behavior sources retain the catalog identity and document its limits',()=>{
 assert.equal(NATURAL_HISTORY.s53.scientific,'Anomalopidae (flashlight fishes; family)');
 assert.match(NATURAL_HISTORY.s53.limit,/case study/);
 for(const id of ['s30','s8','s52','s54','s3','s24','s12','s53']){
  const h=NATURAL_HISTORY[id];
  assert.ok(h.storySources.length>0,id);
  for(const source of h.storySources){assert.ok(source.source.trim(),id);assert.equal(new URL(source.url).protocol,'https:',id);}
 }
});
