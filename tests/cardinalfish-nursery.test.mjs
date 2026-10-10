import test from 'node:test';
import assert from 'node:assert/strict';
import {REEFS,SPECIES} from '../src/data.js';
import {initStory,tickStory,tickBackground,storyAction,storyView,nurseryOptions,validStory,BROOD_SECONDS,MAX_JUVENILES} from '../src/cardinalfish-nursery.js';

function scene(){
 const cover=REEFS[6].shelters[0],p={id:'player',species:SPECIES[13],x:cover.x,y:cover.y,vx:0,vy:0,facing:1,alive:true,health:100};
 const sim={player:p,current:6,phase:'playing',paused:false,pointer:{x:p.x,y:p.y},events:[],sections:REEFS.map(()=>({entities:[]})),reefStories:{version:1,active:'nursery',nursery:null},
  event(type,text,extra={}){this.events.push({type,text,...extra});},point(x,y){this.pointer={x,y};this.player.target=null;},setDestination(id){this.destination=id;}};
 initStory(sim);return sim;
}
const nursery=s=>s.reefStories.nursery;
function tick(sim,seconds){for(let i=0;i<Math.ceil(seconds*60);i++)tickStory(sim,1/60);}
function begin(sim){assert.equal(storyAction(sim,'nursery-choose',0),true);assert.equal(nursery(sim).stage,'ready');assert.equal(storyAction(sim,'nursery-settle'),true);}
function hunter(sim,index=0){const c=REEFS[6].shelters[index];return {id:17,species:SPECIES[16],alive:true,x:c.x,y:c.y,vx:35,vy:0};}

 test('actual cover and live traffic make meadow nursery choices meaningful',()=>{
 const sim=scene(),busy=hunter(sim);sim.sections[6].entities.push(busy);
 const [a,b]=nurseryOptions(sim);assert.equal(a.safe,false);assert.equal(a.threats,1);assert.equal(a.traffic,1);assert.equal(b.safe,true);
 storyAction(sim,'nursery-choose',0);assert.equal(nursery(sim).stage,'choose');assert.match(sim.events.at(-1).text,/hunter/);
 busy.alive=false;assert.equal(nurseryOptions(sim)[0].safe,true);
 Object.assign(sim.player,{x:800,y:100});storyAction(sim,'nursery-choose');assert.equal(nursery(sim).nursery,null);assert.match(sim.events.at(-1).text,/Open water/);
 storyAction(sim,'nursery-choose',1);assert.deepEqual(sim.pointer,{x:b.x,y:b.y});assert.equal(nursery(sim).stage,'choose');
 Object.assign(sim.player,{x:b.x,y:b.y});storyAction(sim,'nursery-choose',1);assert.equal(nursery(sim).nursery.index,1);
});

test('busy non-hunting neighbors count while dead animals and bottom residents do not',()=>{
 const sim=scene(),c=REEFS[6].shelters[0];
 sim.sections[6].entities=Array.from({length:3},(_,i)=>({id:i,species:SPECIES[1],alive:true,x:c.x+i*12,y:c.y,vx:20,vy:0}));
 assert.equal(nurseryOptions(sim)[0].safe,false);sim.sections[6].entities[0].alive=false;assert.equal(nurseryOptions(sim)[0].safe,true);
 for(let i=0;i<6;i++)sim.sections[6].entities.push({id:100+i,species:SPECIES[46],alive:true,x:c.x,y:c.y,vx:20});
 assert.equal(nurseryOptions(sim)[0].traffic,2);assert.equal(nurseryOptions(sim)[0].safe,true);
});

test('mouthbrooding visibly progresses and a disturbance pauses without losing the brood',()=>{
 const sim=scene();begin(sim);tick(sim,10);const before=nursery(sim).progress;
 assert.ok(before>6&&before<8);assert.equal(sim.player.cardinalBrooding,true);assert.ok(sim.player.broodPose>.65);assert.equal(sim.player.activity,'brooding');
 sim.sections[6].entities.push(hunter(sim));tick(sim,4);assert.equal(nursery(sim).progress,before);assert.equal(nursery(sim).calmTime,0);assert.match(storyView(sim).detail,/saved/);
 sim.sections[6].entities=[];tick(sim,2);assert.equal(nursery(sim).progress,before);tick(sim,2);assert.ok(nursery(sim).progress>before);
 sim.current=4;tick(sim,10);const paused=nursery(sim).progress;assert.match(storyView(sim).detail,/saved/);tick(sim,5);assert.equal(nursery(sim).progress,paused);
 sim.current=6;sim.paused=true;tick(sim,5);assert.equal(nursery(sim).progress,paused);sim.paused=false;tick(sim,30);assert.equal(nursery(sim).stage,'released');assert.equal(sim.player.cardinalBrooding,false);
});

test('released young are capped, autonomous, and complete with one nearby follow-up',()=>{
 const sim=scene();begin(sim);const adults=sim.sections[6].entities.length;tick(sim,28);const s=nursery(sim),c=s.nursery;
 assert.equal(s.stage,'released');assert.equal(s.progress,BROOD_SECONDS);assert.equal(s.juveniles.length,MAX_JUVENILES);assert.equal(sim.sections[6].entities.length,adults);
 storyAction(sim,'nursery-check');assert.equal(s.completed,false);
 const positions=s.juveniles.map(j=>({x:j.x,y:j.y}));tick(sim,8);
 for(let i=0;i<MAX_JUVENILES;i++){assert.ok(Math.hypot(s.juveniles[i].x-positions[i].x,s.juveniles[i].y-positions[i].y)>1);assert.ok(Math.hypot(s.juveniles[i].x-c.x,s.juveniles[i].y-c.y)<c.r);assert.ok(Math.hypot(s.juveniles[i].vx,s.juveniles[i].vy)<=24.001);}
 Object.assign(sim.player,{x:300,y:100});storyAction(sim,'nursery-check');assert.equal(s.completed,false);Object.assign(sim.player,{x:c.x,y:c.y});storyAction(sim,'nursery-check');assert.equal(s.completed,true);
 storyAction(sim,'nursery-check');storyAction(sim,'nursery-settle');tick(sim,100);
 assert.equal(sim.events.filter(e=>e.type==='discovery'&&e.value==='cardinalfish-nursery').length,1);assert.equal(s.juveniles.length,4);assert.equal(storyView(sim).complete,true);assert.equal(validStory(s),true);
});

test('every persisted stage validates and resumes without resetting or duplicating release',()=>{
 const sim=scene();assert.equal(validStory(null),true);assert.equal(validStory(nursery(sim)),true);
 storyAction(sim,'nursery-choose',0);assert.equal(validStory(nursery(sim)),true);storyAction(sim,'nursery-settle');tick(sim,11);
 const snapshot=JSON.parse(JSON.stringify(nursery(sim))),resumed=scene();resumed.reefStories.nursery=snapshot;initStory(resumed);assert.deepEqual(nursery(resumed),snapshot);assert.equal(validStory(snapshot),true);
 tick(resumed,20);assert.equal(nursery(resumed).stage,'released');assert.equal(validStory(nursery(resumed)),true);const released=JSON.parse(JSON.stringify(nursery(resumed)));
 resumed.reefStories.nursery=released;initStory(resumed);tick(resumed,8);assert.equal(nursery(resumed).juveniles.length,4);storyAction(resumed,'nursery-check');assert.equal(validStory(nursery(resumed)),true);
 const bad=structuredClone(nursery(resumed));bad.juveniles.push({...bad.juveniles[0],id:'extra'});assert.equal(validStory(bad),false);
 const misplaced=structuredClone(snapshot);misplaced.nursery.x+=1;assert.equal(validStory(misplaced),false);
 const invalid=structuredClone(snapshot);invalid.progress=NaN;assert.equal(validStory(invalid),false);
 const duplicate=structuredClone(released);duplicate.juveniles[1].id=duplicate.juveniles[0].id;assert.equal(validStory(duplicate),false);
 const premature=structuredClone(snapshot);premature.stage='complete';premature.completed=true;assert.equal(validStory(premature),false);
});

test('story remains optional and unrelated fish cannot operate it',()=>{
 const sim=scene();sim.reefStories.active='clinic';assert.equal(storyAction(sim,'nursery-choose',0),false);tick(sim,30);assert.equal(nursery(sim).stage,'choose');
 sim.reefStories.active='nursery';sim.player.species=SPECIES[1];assert.equal(storyAction(sim,'nursery-settle'),false);assert.equal(initStory(sim),false);
 sim.player.species=SPECIES[13];sim.current=4;initStory(sim);assert.equal(sim.destination,6);assert.equal(sim.current,4);
});


test('released young keep their cover routine after stopping the story, but pause and offscreen remain frozen',()=>{
 const sim=scene();begin(sim);tick(sim,28);const s=nursery(sim);
 sim.reefStories.active=null;sim.player.cardinalBrooding=false;sim.player.broodPose=0;
 const before=structuredClone(s.juveniles),events=sim.events.length;
 for(let i=0;i<60;i++)tickBackground(sim,1/60);
 assert.ok(s.juveniles.some((j,i)=>Math.hypot(j.x-before[i].x,j.y-before[i].y)>1));
 assert.equal(sim.player.cardinalBrooding,false);assert.equal(sim.player.broodPose,0);assert.equal(sim.events.length,events);assert.equal(s.stage,'released');
 const paused=structuredClone(s.juveniles);sim.paused=true;tickBackground(sim,1);assert.deepEqual(s.juveniles,paused);
 sim.paused=false;sim.current=4;tickBackground(sim,1);assert.deepEqual(s.juveniles,paused);
 sim.current=6;for(let i=0;i<60;i++)tickBackground(sim,1/60);assert.ok(s.juveniles.some((j,i)=>j.x!==paused[i].x||j.y!==paused[i].y));assert.equal(validStory(s),true);
 const unstarted=scene();unstarted.reefStories.active=null;tickBackground(unstarted,1);assert.equal(nursery(unstarted).stage,'choose');assert.equal(nursery(unstarted).juveniles.length,0);
});
