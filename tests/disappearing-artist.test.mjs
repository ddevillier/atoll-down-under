import test from 'node:test';
import assert from 'node:assert/strict';
import {SPECIES} from '../src/data.js';
import {ARTIST_SITES,artistSites,artistMatch,initStory,tickStory,storyAction,storyNPC,storyMeal,storyView,validStory} from '../src/disappearing-artist.js';

function fixture(reef=7){
 const player={id:'player',species:SPECIES[19],x:800,y:300,alive:true,health:100,energy:100,abilityTime:0,target:null,blending:null,hidden:false,stun:0};
 const observer={id:14,incarnation:0,species:SPECIES[14],x:230,y:315,alive:true,health:100,energy:100,angle:0,facing:1,target:null,stun:0,activity:'cruising'};
 const sim={player,current:reef,phase:'playing',paused:false,pointer:{x:800,y:300},section:{entities:[observer],food:[]},reefStories:{version:1,active:'artist',artist:null},events:[],event(type,text,extra={}){this.events.push({type,text,...extra});}};
 assert.equal(initStory(sim),true);return sim;
}
function placeAt(sim,id,pattern){
 const site=ARTIST_SITES.find(s=>s.id===id);sim.current=site.reef;
 assert.equal(storyAction(sim,'site',id),true);sim.player.x=site.x;sim.player.y=site.y;
 const observer=sim.section.entities[0];observer.x=site.x-220;observer.y=site.y+80;observer.behavior='Cruising';observer.activity='cruising';
 assert.equal(storyAction(sim,'pattern',pattern),true);return site;
}
function advance(sim,seconds){for(let t=0;t<seconds;t+=.05){for(const e of sim.section.entities)storyNPC(sim,e,.05);tickStory(sim,.05);}}

test('new story remains optional, pure meal hook and bounded old-save-compatible validator',()=>{
 assert.equal(validStory(null),true);assert.equal(validStory(undefined),true);
 const sim=fixture();assert.equal(validStory(sim.reefStories.artist),true);
 assert.equal(sim.reefStories.artist.pattern,null);assert.equal(sim.reefStories.artist.phase,'choose');
 const before=structuredClone({player:sim.player,reefStories:sim.reefStories});storyMeal(sim,{kind:'food',food:'shrimp'});assert.deepEqual(sim.player,before.player);assert.deepEqual(sim.reefStories,before.reefStories);
 sim.reefStories.active=null;assert.equal(storyAction(sim,'context'),false);advance(sim,20);assert.equal(sim.reefStories.artist.attempts,0);
});

test('patch action routes actual movement and requires explicit pattern near the local surface',()=>{
 const sim=fixture();const site=artistSites(sim).find(s=>s.kind==='sand');
 storyAction(sim,'site',site.id);assert.deepEqual(sim.pointer,{x:site.x,y:site.y});assert.equal(sim.reefStories.artist.pattern,null);
 assert.equal(storyAction(sim,'pattern','sand'),false);assert.equal(sim.player.blending,null);
 sim.player.x=site.x;sim.player.y=site.y;storyAction(sim,'context');assert.equal(sim.reefStories.artist.phase,'waiting');
 // The previous explicit selection was retained, even though swimming was required.
 assert.equal(sim.reefStories.artist.pattern,'sand');assert.equal(artistMatch(sim),1);
 sim.player.x=site.x+site.r;assert.equal(artistMatch(sim),.75);sim.player.x+=.1;assert.equal(artistMatch(sim),0);
 assert.equal(storyAction(sim,'site','fan-shadow'),false);assert.equal(storyAction(sim,'pattern','invented'),false);
});

test('mismatched selected skin is seen by an actual passing live observer and offers a quiet retry',()=>{
 const sim=fixture();placeAt(sim,'pearl-sand','shadow');assert.ok(artistMatch(sim)<.2);
 advance(sim,2.1);assert.equal(sim.reefStories.artist.phase,'passing');assert.equal(sim.reefStories.artist.observer.id,14);
 const startX=sim.section.entities[0].x;advance(sim,12);
 assert.ok(sim.section.entities[0].x>startX);assert.equal(sim.reefStories.artist.phase,'noticed');assert.equal(sim.reefStories.artist.pass.seen,true);
 assert.deepEqual(sim.reefStories.artist.successes,[]);assert.equal(sim.player.hidden,false);assert.equal(sim.events.some(e=>e.type==='discovery'),false);
 assert.match(storyView(sim).detail,/no penalty/i);storyAction(sim,'retry');assert.equal(sim.reefStories.artist.phase,'pattern');assert.equal(sim.reefStories.artist.observer,null);
});

test('three spatially distinct real background matches earn one discovery only after live passes',()=>{
 const sim=fixture(),count=sim.section.entities.length;
 for(const [id,pattern] of [['pearl-sand','sand'],['pearl-shadow','shadow'],['pearl-rock','mottled']]){
  placeAt(sim,id,pattern);advance(sim,2.1);assert.equal(sim.reefStories.artist.phase,'passing');assert.equal(sim.player.hidden,true);
  assert.equal(sim.reefStories.artist.successes.length,sim.reefStories.artist.attempts-1);
  advance(sim,14);assert.equal(sim.reefStories.artist.pass.seen,false);assert.ok(sim.reefStories.artist.pass.closest<=145);assert.equal(validStory(sim.reefStories.artist),true);
 }
 assert.equal(sim.reefStories.artist.phase,'complete');assert.equal(storyView(sim).complete,true);assert.deepEqual(sim.reefStories.artist.successes,['sand','shadow','mottled']);
 assert.equal(sim.player.blending.story,'artist');assert.equal(sim.player.hidden,true);assert.equal(sim.section.entities.length,count);assert.equal(sim.events.filter(e=>e.type==='discovery'&&e.value==='disappearing-artist').length,1);
 placeAt(sim,'pearl-sand','sand');advance(sim,16);assert.equal(sim.events.filter(e=>e.type==='discovery').length,1);assert.equal(validStory(sim.reefStories.artist),true);
});

test('timers alone, dead animals, hunters, and busy swimmers cannot award a pass',()=>{
 const sim=fixture();sim.section.entities.push({...sim.section.entities[0],id:90,species:SPECIES[51],x:400,y:400});
 sim.section.entities[0].target='meal';placeAt(sim,'pearl-sand','sand');advance(sim,50);assert.equal(sim.reefStories.artist.phase,'waiting');assert.equal(sim.reefStories.artist.outcome,'unavailable');assert.deepEqual(sim.reefStories.artist.successes,[]);
 sim.section.entities[0].target=null;advance(sim,.1);assert.equal(sim.reefStories.artist.phase,'passing');assert.equal(sim.reefStories.artist.observer.id,14);
 const hunter=sim.section.entities[1],before={x:hunter.x,y:hunter.y};assert.equal(storyNPC(sim,hunter,.05),false);assert.deepEqual({x:hunter.x,y:hunter.y},before);
 sim.section.entities[0].alive=false;advance(sim,.1);assert.equal(sim.reefStories.artist.phase,'pattern');assert.equal(sim.reefStories.artist.outcome,'unavailable');
});

test('movement exposes immediately including NPC-before-story tick; pause and serialized identity are stable',()=>{
 const sim=fixture();placeAt(sim,'pearl-sand','sand');advance(sim,4);assert.equal(sim.reefStories.artist.phase,'passing');
 const saved=structuredClone(sim.reefStories.artist),observerPos={x:sim.section.entities[0].x,y:sim.section.entities[0].y};
 sim.paused=true;advance(sim,5);assert.deepEqual(sim.reefStories.artist,saved);assert.deepEqual({x:sim.section.entities[0].x,y:sim.section.entities[0].y},observerPos);assert.equal(storyAction(sim,'retry'),false);
 sim.paused=false;sim.reefStories.artist=JSON.parse(JSON.stringify(saved));assert.equal(validStory(sim.reefStories.artist),true);
 sim.player.x+=4;advance(sim,.05);assert.equal(sim.player.hidden,false);assert.equal(sim.player.blending,null);assert.equal(sim.reefStories.artist.outcome,'moved');assert.deepEqual(sim.reefStories.artist.successes,[]);
});

test('observer incarnation, reef travel, ink and invalid persisted state safely release the attempt',()=>{
 for(const interrupt of [sim=>sim.section.entities[0].incarnation++,sim=>sim.current=3,sim=>sim.player.abilityTime=3]){
  const sim=fixture();placeAt(sim,'pearl-sand','sand');advance(sim,2.2);interrupt(sim);advance(sim,.1);assert.equal(sim.player.blending,null);assert.deepEqual(sim.reefStories.artist.successes,[]);assert.notEqual(sim.reefStories.artist.phase,'passing');
 }
 const sim=fixture(),s=sim.reefStories.artist;
 for(const corrupted of [{...s,attempts:1000},{...s,successes:['sand','sand']},{...s,site:'missing'},{...s,phase:'passing'},{...s,logged:true},{...s,match:Infinity},{...s,anchor:{x:1601,y:1}}])assert.equal(validStory(corrupted),false);
});


test('an observer that actually sees the disguise and then naturally avoids still records noticed',()=>{
 const sim=fixture();placeAt(sim,'pearl-sand','shadow');advance(sim,4);
 assert.equal(sim.reefStories.artist.phase,'passing');assert.equal(sim.reefStories.artist.pass.seen,true);
 const e=sim.section.entities[0];e.activity='avoiding';e.behavior='Moving away from Cuttlefish';tickStory(sim,.05);
 assert.equal(sim.reefStories.artist.phase,'noticed');assert.equal(sim.reefStories.artist.outcome,'noticed');assert.equal(sim.reefStories.artist.observer.id,e.id);assert.deepEqual(sim.reefStories.artist.successes,[]);
});

