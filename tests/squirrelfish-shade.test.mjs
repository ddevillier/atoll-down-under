import test from 'node:test';
import assert from 'node:assert/strict';
import {SPECIES} from '../src/data.js';
import {initStory,validStory,storyAction,tickStory,storyNPC,storyView,storyMeal,storyClick,storyPointer,storyPlayer,stopStory,safety,shadeScene,shadeSite,shadeNeighbor} from '../src/squirrelfish-shade.js';
import {Simulation} from '../src/simulation.js';
import {beginStory,storySafety,stopStory as stopActiveStory} from '../src/reef-stories.js';
import {exportDive,importDive} from '../src/save-files.js';

function fixture(){
 const player={id:'player',species:SPECIES[12],x:700,y:280,angle:0,facing:1,alive:true,health:81,energy:79,stun:0,target:null,vx:0,vy:0};
 const e={id:913,incarnation:4,species:SPECIES[12],x:332,y:230,angle:Math.PI,facing:-1,alive:true,health:71,energy:84,satiated:57,rest:11,stun:0,target:null,feeding:null,cleanTime:0,activity:'at-home'};
 const sim={player,current:8,phase:'playing',paused:false,section:{entities:[e],food:[]},reefStories:{version:1,active:'shade',shade:null},events:[],pointer:{x:700,y:280},event(type,text,extra={}){this.events.push({type,text,...extra});},point(x,y){storyPointer(this,x,y);this.pointer={x,y};this.player.target=null;},setDestination(id){this.destination=id;}};
 assert.equal(initStory(sim),true);return {sim,e,s:sim.reefStories.shade,site:shadeSite(sim)};
}
function at(sim,p){Object.assign(sim.player,p,{vx:0,vy:0});sim.pointer={...p};}
function advance(sim,seconds,{swim=false,npc=true}={}){
 for(let elapsed=0;elapsed<seconds;elapsed+=.05){
  if(swim&&!sim.paused){const p=sim.player,dx=sim.pointer.x-p.x,dy=sim.pointer.y-p.y,d=Math.hypot(dx,dy),step=Math.min(d,100*.05);p.vx=d?dx/d*step/.05:0;p.vy=d?dy/d*step/.05:0;p.x+=p.vx*.05;p.y+=p.vy*.05;}
  if(npc)for(const e of sim.section.entities)storyNPC(sim,e,.05);tickStory(sim,.05);
 }
}
function inspect(f){at(f.sim,f.site.inspect);advance(f.sim,.7);assert.equal(storyAction(f.sim,'shade-inspect'),true);assert.equal(f.s.observed,true);assert.equal(f.s.stage,'space');assert.equal(f.s.crowded,true);}
function finish(f,choice='alcove'){
 inspect(f);storyAction(f.sim,'shade-choose',choice);advance(f.sim,7,{swim:true});
 assert.equal(f.s.stage,'settle');assert.equal(f.s.response,'settled');assert.equal(storyAction(f.sim,'shade-inspect'),true);assert.equal(f.s.complete,true);
}

test('initial encounter binds an existing uncommitted incarnation without changing needs, home or population',()=>{
 const f=fixture();assert.equal(validStory(f.s),true);assert.deepEqual(f.s.neighbor,{id:913,incarnation:4,species:'s12'});assert.equal(f.sim.section.entities.length,1);assert.equal(f.e.satiated,57);assert.equal(f.e.rest,11);assert.equal(f.e.health,71);assert.deepEqual({x:f.e.x,y:f.e.y},{x:332,y:230});assert.equal(storyPlayer(f.sim,.1),false);
 const prior=structuredClone({player:f.sim.player,state:f.s,neighbor:f.e});storyMeal(f.sim,{food:'shrimp'});assert.deepEqual({player:f.sim.player,state:f.s,neighbor:f.e},prior);
 assert.equal(validStory(null),true);assert.equal(validStory(undefined),true);assert.equal(initStory(f.sim),true);assert.equal(f.sim.reefStories.shade,f.s);
});

test('source pulse is local directional sound design with a persistent visual equivalent; no remote observation',()=>{
 const f=fixture();at(f.sim,{x:1200,y:500});advance(f.sim,15);assert.equal(f.s.stage,'listen');assert.equal(f.s.observed,false);assert.equal(f.sim.events.some(e=>e.type==='shade-pulse'),false);
 storyAction(f.sim,'shade-inspect');assert.deepEqual(f.sim.pointer,f.site.inspect);assert.equal(f.s.observed,false);advance(f.sim,1);assert.equal(f.s.observed,false);
 at(f.sim,{x:f.site.x+190,y:f.site.y+100});advance(f.sim,4.2);const event=f.sim.events.find(e=>e.type==='shade-pulse');assert.ok(event);assert.ok(event.pan<0&&event.gain<=.14);assert.equal(event.value,'squirrelfish-shade');assert.ok(shadeScene(f.sim).pulse>0);assert.match(storyView(f.sim).detail,/muted/);assert.equal(f.s.observed,false);
});

test('each real spatial choice produces a different live resting position and exactly one discovery',()=>{
 const outcomes=[];
 for(const choice of ['alcove','space']){
  const f=fixture(),start={x:f.e.x,y:f.e.y};finish(f,choice);assert.ok(Math.hypot(f.e.x-start.x,f.e.y-start.y)>=18);assert.ok(Math.hypot(f.e.x-f.sim.player.x,f.e.y-f.sim.player.y)>=150);assert.equal(f.e.activity,'at-home');assert.ok(Number.isFinite(f.e.angle));assert.equal(f.e.facing,Math.cos(f.e.angle)>=0?1:-1);assert.equal(f.s.reacted,true);assert.equal(validStory(f.s),true);assert.equal(storyView(f.sim).complete,true);
  assert.equal(f.sim.events.filter(e=>e.type==='discovery'&&e.value==='squirrelfish-shade').length,1);const saved=JSON.parse(JSON.stringify(f.s));f.sim.reefStories.shade=saved;advance(f.sim,10);storyAction(f.sim,'context');assert.equal(f.sim.events.filter(e=>e.type==='discovery').length,1);assert.equal(validStory(saved),true);outcomes.push({x:f.e.x,px:f.sim.player.x});
 }
 assert.ok(Math.abs(outcomes[0].x-outcomes[1].x)>55);assert.ok(Math.abs(outcomes[0].px-outcomes[1].px)>350);
});

test('live close approach turns and moves the actual neighbor before inspection; no timer can substitute for response',()=>{
 const f=fixture(),startX=f.e.x;at(f.sim,f.site.inspect);advance(f.sim,.7);assert.equal(f.s.response,'giving-space');assert.ok(f.e.x<startX);assert.equal(f.s.reacted,true);assert.ok(Math.cos(f.e.angle)<-.8);
 storyAction(f.sim,'shade-inspect');storyAction(f.sim,'shade-choose','alcove');at(f.sim,f.site.alcove);advance(f.sim,30,{npc:false});assert.equal(f.s.complete,false);assert.notEqual(f.s.stage,'settle');storyAction(f.sim,'shade-inspect');assert.equal(f.sim.events.some(e=>e.type==='discovery'),false);
 const remote=fixture();advance(remote.sim,80);assert.equal(remote.s.observed,false);assert.equal(remote.s.choice,null);assert.equal(remote.s.complete,false);
});

test('world clicks only select local approaches; pointer steering overrides immediately and keeps the choice',()=>{
 const f=fixture();assert.equal(storyClick(f.sim,f.site.inspect.x,f.site.inspect.y),true);assert.deepEqual(f.sim.pointer,f.site.inspect);assert.equal(f.s.observed,false);inspect(f);
 assert.equal(storyClick(f.sim,f.site.alcove.x,f.site.alcove.y),true);assert.equal(f.s.choice,'alcove');assert.equal(f.s.complete,false);f.sim.point(800,100);const pointer=structuredClone(f.sim.pointer);advance(f.sim,2);assert.deepEqual(f.sim.pointer,pointer);assert.equal(f.s.choice,'alcove');assert.equal(f.s.settled,0);assert.equal(storyClick(f.sim,1500,10),false);assert.equal(storyAction(f.sim,'shade-choose','invented'),false);
});

test('pause, offscreen and inactive hooks freeze state and actor movement including pulses',()=>{
 const f=fixture();inspect(f);storyAction(f.sim,'shade-choose','space');advance(f.sim,.3);const saved=structuredClone(f.s),actor=structuredClone(f.e);
 for(const field of ['paused','current','active']){
  const prior={paused:f.sim.paused,current:f.sim.current,active:f.sim.reefStories.active};if(field==='paused')f.sim.paused=true;if(field==='current')f.sim.current=7;if(field==='active')f.sim.reefStories.active=null;
  advance(f.sim,15);assert.deepEqual(f.s,saved);assert.deepEqual(f.e,actor);assert.equal(storyAction(f.sim,'shade-inspect'),false);Object.assign(f.sim,{paused:prior.paused,current:prior.current});f.sim.reefStories.active=prior.active;
 }
 f.sim.reefStories.shade=JSON.parse(JSON.stringify(saved));assert.equal(validStory(f.sim.reefStories.shade),true);
});

test('missing neighbor waits, then a free replacement requires its own observation',()=>{
 const f=fixture();inspect(f);const old={...f.s.neighbor};f.e.incarnation++;f.e.target='committed-meal';advance(f.sim,.1);assert.equal(shadeNeighbor(f.sim),null);assert.equal(f.s.observed,true);assert.equal(f.s.reacted,false);assert.equal(f.s.neighbor,null);assert.equal(validStory(f.s),true);assert.match(storyView(f.sim).step,/No available/);
 const replacement={...f.e,id:'next-squirrel',incarnation:1,target:null,x:f.site.home.x,y:f.site.home.y};f.sim.section.entities.push(replacement);advance(f.sim,.1);assert.notDeepEqual(f.s.neighbor,old);assert.equal(f.s.neighbor.id,replacement.id);assert.equal(f.s.observed,false);assert.equal(f.s.stage,'inspect');assert.equal(f.s.choice,null);assert.equal(f.s.selected,null);assert.match(storyView(f.sim).step,/Follow the pulse/);assert.equal(f.s.complete,false);assert.equal(f.sim.section.entities.length,2);
 const complete=fixture();finish(complete);complete.e.alive=false;const earned=structuredClone(complete.s);advance(complete.sim,5);assert.deepEqual(complete.s,earned);assert.equal(validStory(complete.s),true);
});

test('busy, paired, caring, defending and endangered fish retain their targets and positions',()=>{
 for(const patch of [{target:'meal'},{feeding:{target:'meal',committed:true}},{cleanTime:1},{cleanerTarget:42},{service:{client:4}},{stun:1},{actionTime:1},{abilityTime:1},{hidden:true},{ecology:{partner:99}},{activity:'avoiding'},{behavior:'Moving away from grouper'}]){
  const f=fixture();Object.assign(f.e,patch);at(f.sim,f.site.inspect);const prior=structuredClone(f.e);assert.equal(storyNPC(f.sim,f.e,.1),false);tickStory(f.sim,.1);assert.deepEqual(f.e,prior);assert.equal(f.s.complete,false);
 }
 const f=fixture();f.sim.section.entities.push({id:23,species:SPECIES[38],alive:true,x:f.e.x+30,y:f.e.y,satiated:0,target:f.e.id});at(f.sim,f.site.inspect);const before=structuredClone(f.e);assert.equal(storyNPC(f.sim,f.e,.1),false);assert.deepEqual(f.e,before);
});

test('stopping releases actor behavior and free control; safety is explicitly bounded to the local scene',()=>{
 const f=fixture();inspect(f);assert.ok(safety(f.sim));assert.equal(safety(f.sim).radius,300);assert.deepEqual(safety(f.sim).participants,[f.s.neighbor]);assert.equal(safety(f.sim).holdNeeds,false);storyAction(f.sim,'shade-choose','alcove');stopStory(f.sim);assert.equal(f.e.behavior,'Cruising');assert.equal(f.e.activity,'cruising');assert.equal(f.s.pulse,0);assert.equal(f.s.observed,true);assert.equal(f.s.choice,'alcove');assert.equal(storyPlayer(f.sim,.1),false);at(f.sim,{x:1400,y:100});assert.equal(safety(f.sim),null);
});

test('local protection permits a calm spacing response beside a hunter while busy priority remains intact',()=>{
 const f=fixture();at(f.sim,f.site.inspect);f.sim.section.entities.push({id:24,species:SPECIES[38],alive:true,x:f.e.x+25,y:f.e.y,satiated:0,target:f.e.id});
 f.sim.storyProtected=e=>e===f.e&&!!safety(f.sim);assert.equal(storyNPC(f.sim,f.e,.1),true);assert.equal(f.s.crowded,true);f.e.target='actual-meal';const before=structuredClone(f.e);assert.equal(storyNPC(f.sim,f.e,.1),false);assert.deepEqual(f.e,before);
 f.e.target=null;at(f.sim,{x:1500,y:80});assert.equal(f.sim.storyProtected(f.e),false);assert.equal(storyNPC(f.sim,f.e,.1),false);
});

test('a new neighbor at a different ledge clears the old resting selection without invalid coordinates',()=>{
 const f=fixture();inspect(f);storyAction(f.sim,'shade-choose','alcove');f.e.alive=false;advance(f.sim,.1);const next={...f.e,id:915,incarnation:0,alive:true,x:1080,y:405};f.sim.section.entities.push(next);storyAction(f.sim,'shade-retry');assert.equal(f.s.site,1);assert.equal(f.s.observed,false);assert.equal(f.s.choice,null);assert.equal(f.s.selected,null);assert.equal(validStory(f.s),true);
 assert.equal(storyNPC(f.sim,next,Infinity),false);const saved=structuredClone(f.s);tickStory(f.sim,Infinity);assert.deepEqual(f.s,saved);
});

test('strict saved state rejects forged credit, unknown keys and invalid geometry or references',()=>{
 const f=fixture();assert.equal(validStory(f.s),true);
 for(const patch of [{version:2},{stage:'unknown'},{pulse:2},{pulseClock:Infinity},{settled:3},{site:999},{reef:99},{neighbor:{id:'player',incarnation:0,species:'s12'}},{neighbor:{id:3,incarnation:-1,species:'s12'}},{neighbor:{id:3,incarnation:0,species:'s14'}},{crowded:true},{reacted:true},{choice:'alcove',selected:{x:1,y:1}},{observed:true},{stage:'complete',complete:true},{unknown:1}])assert.equal(validStory({...structuredClone(f.s),...patch}),false,JSON.stringify(patch));
 finish(f);for(const patch of [{complete:false},{reacted:false},{observed:false},{crowded:false},{neighbor:null},{response:'hidden'},{settled:0},{selected:{x:f.site.alcove.x+1,y:f.site.alcove.y}}])assert.equal(validStory({...structuredClone(f.s),...patch}),false);
});

test('new encounters prefer grotto but can bind existing reachable fish without spawning or stealing a pair',()=>{
 const f=fixture();f.sim.reefStories.shade=null;f.e.ecology={partner:99};f.sim.sections=Array.from({length:9},()=>({entities:[]}));const other={...f.e,id:800,ecology:null,x:1010,y:430};f.sim.sections[7].entities=[other];assert.equal(initStory(f.sim),true);assert.equal(f.sim.reefStories.shade.reef,7);assert.equal(f.sim.destination,7);assert.equal(f.sim.reefStories.shade.neighbor.id,800);assert.equal(f.e.ecology.partner,99);assert.equal(validStory(f.sim.reefStories.shade),true);
 const empty=fixture();empty.sim.section.entities=[];empty.sim.reefStories.shade=null;initStory(empty.sim);assert.equal(empty.sim.reefStories.shade.neighbor,null);advance(empty.sim,30);assert.equal(empty.sim.reefStories.shade.complete,false);assert.match(storyView(empty.sim).detail,/fresh adventure dive/);
});

test('paused saved encounter keeps local safety until cancellation grants player and same-neighbor exit grace',()=>{
 const sim=new Simulation(42);sim.start('practice','s12',null,{adventureKey:'shade'});assert.equal(beginStory(sim,'shade'),true);
 const descriptor=storySafety(sim);assert.ok(descriptor);sim.paused=true;const checkpoint=structuredClone(sim.reefStories.shade);assert.deepEqual(storySafety(sim),descriptor);
 const loaded=importDive(exportDive(sim,'Paused shaded encounter')).simulation;assert.equal(loaded.paused,true);assert.deepEqual(storySafety(loaded),descriptor);const neighbor=shadeNeighbor(loaded);assert.ok(neighbor);loaded.player.hurtGrace=0;neighbor.hurtGrace=0;
 const actor={x:neighbor.x,y:neighbor.y,health:neighbor.health,satiated:neighbor.satiated},player={x:loaded.player.x,y:loaded.player.y,health:loaded.player.health,energy:loaded.player.energy};tickStory(loaded,2);assert.equal(storyNPC(loaded,neighbor,.1),false);assert.deepEqual(loaded.reefStories.shade,checkpoint);
 assert.equal(stopActiveStory(loaded),true);assert.equal(storySafety(loaded),null);assert.ok(loaded.player.hurtGrace>0);assert.ok(neighbor.hurtGrace>0);assert.deepEqual({x:neighbor.x,y:neighbor.y,health:neighbor.health,satiated:neighbor.satiated},actor);assert.deepEqual({x:loaded.player.x,y:loaded.player.y,health:loaded.player.health,energy:loaded.player.energy},player);
});

test('busy neighbor shows recovery controls and rebinds a free fish without interrupting the actual meal',()=>{
 const f=fixture();inspect(f);f.e.target='actual-meal';f.e.feeding={target:'actual-meal',committed:true};const prior=structuredClone(f.e);assert.equal(storyView(f.sim).step,'Your neighbor is busy');assert.deepEqual(storyView(f.sim).actions,[{id:'shade-retry',label:'Check for a free neighbor'}]);assert.equal(storyView(f.sim).needsFreshDive,true);
 const next={...f.e,id:917,incarnation:0,target:null,feeding:null,x:1080,y:405};f.sim.section.entities.push(next);storyAction(f.sim,'shade-retry');assert.equal(f.s.neighbor.id,next.id);assert.equal(f.s.observed,false);assert.equal(f.s.stage,'listen');assert.deepEqual(f.e,prior);assert.equal(validStory(f.s),true);
});

test('recovery routes to an existing reachable neighbor and reverse pair links exclude recruitment',()=>{
 const f=fixture();inspect(f);f.sim.mode='practice';f.sim.period='night';f.e.target='actual-meal';f.sim.sections=Array.from({length:9},()=>({entities:[],food:[]}));f.sim.sections[8]=f.sim.section;
 const remote={...f.e,id:920,incarnation:2,target:null,x:1010,y:430};f.sim.sections[7].entities.push(remote);assert.equal(storyView(f.sim).needsFreshDive,false);storyAction(f.sim,'shade-retry');assert.equal(f.s.reef,7);assert.equal(f.s.neighbor.id,remote.id);assert.equal(f.sim.destination,7);assert.equal(f.s.observed,false);assert.equal(validStory(f.s),true);
 const paired=fixture();paired.sim.section.entities.push({...paired.e,id:925,ecology:{partner:paired.e.id}});const before=structuredClone(paired.e);at(paired.sim,paired.site.inspect);assert.equal(storyNPC(paired.sim,paired.e,.1),false);assert.deepEqual(paired.e,before);
});


test('a replacement after a resting choice requires its own live observation and remains finishable',()=>{
 const f=fixture();inspect(f);storyAction(f.sim,'shade-choose','alcove');at(f.sim,f.site.alcove);
 f.e.alive=false;const next={...f.e,id:930,incarnation:0,alive:true,target:null,x:f.site.home.x,y:f.site.home.y};f.sim.section.entities.push(next);tickStory(f.sim,.05);
 assert.equal(f.s.neighbor.id,next.id);assert.equal(f.s.observed,false);assert.equal(f.s.choice,null);assert.equal(f.s.selected,null);assert.equal(f.s.complete,false);assert.equal(validStory(f.s),true);
 assert.deepEqual(storyView(f.sim).actions,[{id:'shade-inspect',label:'Inspect the shaded opening'}]);
 assert.equal(storyAction(f.sim,'shade-choose','alcove'),false);assert.equal(f.sim.events.some(e=>e.type==='discovery'),false);
 finish(f,'space');assert.equal(f.s.complete,true);assert.equal(f.sim.events.filter(e=>e.type==='discovery').length,1);assert.equal(f.s.neighbor.id,next.id);
});


test('an older saved replacement state with observation but no reaction offers a physical recovery approach',()=>{
 const f=fixture();inspect(f);f.s.reacted=false;f.s.crowded=false;f.s.crowdAt=null;f.s.crowdPlayer=null;f.s.stage='space';assert.equal(validStory(f.s),true);
 assert.deepEqual(storyView(f.sim).actions,[{id:'shade-inspect',label:'Inspect the shaded opening'}]);
 storyAction(f.sim,'shade-inspect');assert.deepEqual(f.sim.pointer,f.site.inspect);advance(f.sim,.8,{swim:true});assert.equal(f.s.reacted,true);
 storyAction(f.sim,'shade-choose','space');advance(f.sim,7,{swim:true});storyAction(f.sim,'shade-inspect');assert.equal(f.s.complete,true);
});


test('both resting choices remain finishable when the original close approach was near the chosen opening',()=>{
 for(const choice of ['alcove','space']){
  const f=fixture(),close=choice==='alcove'?{x:460,y:260}:{x:250,y:325};Object.assign(f.e,choice==='alcove'?{x:400,y:230}:{x:270,y:270});at(f.sim,close);
  advance(f.sim,.7);assert.equal(f.s.crowded,true);assert.equal(f.s.reacted,true);assert.ok(Math.hypot(f.e.x-f.s.crowdAt.x,f.e.y-f.s.crowdAt.y)>=18);
  storyAction(f.sim,'shade-inspect');assert.equal(f.s.observed,true);storyAction(f.sim,'shade-choose',choice);advance(f.sim,7,{swim:true});
  assert.equal(f.s.stage,'settle');assert.equal(f.s.response,'settled');assert.equal(f.s.settled,1);assert.ok(Math.hypot(f.sim.player.x-f.e.x,f.sim.player.y-f.e.y)>=150);
  assert.ok(Math.hypot(f.sim.player.x-f.s.crowdPlayer.x,f.sim.player.y-f.s.crowdPlayer.y)<90,'this valid resting place does not require an arbitrary 90-unit retreat');
  assert.equal(f.s.complete,false);storyAction(f.sim,'shade-inspect');assert.equal(f.s.complete,true);assert.equal(f.sim.events.filter(e=>e.type==='discovery').length,1);assert.equal(validStory(f.s),true);
 }
});
