import test from 'node:test';
import assert from 'node:assert/strict';
import {SPECIES} from '../src/data.js';
import {Simulation} from '../src/simulation.js';
import {beginStory as beginIntegratedStory,storyAction as integratedAction} from '../src/reef-stories.js';
import {initStory,storyAction,tickStory,storyNPC,storyPlayer,storyPointer,storyClick,storyMeal,validStory,lanternCue,lanternLineVisible,lanternOptions,stopStory,safety} from '../src/lantern-company.js';
const fish=(id,x,y)=>({id,incarnation:0,species:SPECIES[53],x,y,angle:0,vx:0,vy:0,alive:true,health:100,energy:100,target:null,hidden:false,abilityTime:0,stun:0,cleanTime:0});
function scene(){const player=fish('player',610,360),section={entities:[fish(1,555,335),fish(2,565,395),fish(3,490,370)],food:[]};const sim={player,sections:Array.from({length:9},(_,i)=>i===8?section:{entities:[],food:[]}),section,current:8,mode:'practice',period:'night',phase:'playing',paused:false,reefStories:{active:'lantern',lantern:null},pointer:{x:610,y:360},events:[],event(type,text,extra={}){this.events.push({type,text,...extra});},setDestination(reef){this.destination=reef;}};assert.equal(initStory(sim),true);return sim;}
const state=sim=>sim.reefStories.lantern;
function frame(sim,n=1){for(let i=0;i<n;i++){storyPlayer(sim,1/60);for(const e of sim.section.entities)storyNPC(sim,e,1/60);tickStory(sim,1/60);}}
function begin(sim,route='upper'){storyAction(sim,'lantern-route',route);assert.equal(state(sim).stage,'route');storyAction(sim,'lantern-show');frame(sim);}

test('case study recruits at most three existing living identities without spawning or changing food',()=>{const sim=scene(),before=sim.section.entities.map(e=>({id:e.id,incarnation:e.incarnation,x:e.x,y:e.y}));begin(sim);assert.equal(state(sim).participants.length,3);assert.deepEqual(sim.section.entities.map(e=>({id:e.id,incarnation:e.incarnation})),before.map(({id,incarnation})=>({id,incarnation})));assert.ok(sim.section.entities.every((e,i)=>Math.hypot(e.x-before[i].x,e.y-before[i].y)<3));assert.equal(sim.player.lanternCaseStudy,'Anomalops katoptron');assert.equal(sim.section.food.length,0);assert.equal(validStory(state(sim)),true);assert.equal(safety(sim).holdNeeds,true);});

test('light off prevents new heading observations; exposed organ changes real neighbor movement',()=>{
 const sim=scene();begin(sim);const s=state(sim),e=sim.section.entities[0];
 // Isolate one visual receiver: the other members are dark and out of range.
 for(const b of sim.section.entities.slice(1)){b.x=200;b.y=500;b.lanternOrganShown=false;}
 Object.assign(e,{x:560,y:360,angle:0});Object.assign(sim.player,{x:610,y:265,angle:-Math.PI/2});
 storyAction(sim,'lantern-hide');const initial=e.angle;storyNPC(sim,e,1/60);assert.equal(e.angle,initial);assert.equal(s.participants.find(m=>m.id===e.id).response,false);assert.match(e.behavior,/without/);
 storyAction(sim,'lantern-show');const old={x:e.x,y:e.y};storyNPC(sim,e,1/60);assert.ok(e.angle<initial);assert.ok(Math.hypot(e.x-old.x,e.y-old.y)>0);assert.equal(s.participants.find(m=>m.id===e.id).contact,true);
 assert.equal(sim.player.abilityTime,0);assert.equal(e.abilityTime,0);
 assert.equal(lanternLineVisible({x:660,y:360},{x:940,y:360}),false);assert.equal(lanternLineVisible({x:720,y:190},{x:910,y:190}),true);
});

test('blinking and waiting cannot finish a bend, and Space ability does not reveal the social organ',()=>{const sim=scene();begin(sim);storyAction(sim,'lantern-hide');sim.player.abilityTime=4;frame(sim,900);assert.equal(state(sim).complete,false);assert.equal(state(sim).playerTravel,0);assert.equal(state(sim).organShown,false);assert.equal(state(sim).participants.some(m=>m.response),false);assert.equal(storyMeal(sim,{food:'plankton'}),false);});

test('the outcrop blocks exposed light from steering a receiver on the far side',()=>{const sim=scene();begin(sim);const e=sim.section.entities[0],m=state(sim).participants[0];Object.assign(e,{x:670,y:360,angle:-Math.PI/2});Object.assign(sim.player,{x:925,y:360,angle:0});for(const b of sim.section.entities.slice(1)){b.x=100;b.y=100;b.lanternOrganShown=false;}m.contact=false;const heading=e.angle;storyNPC(sim,e,1/60);assert.equal(e.angle,heading);assert.equal(m.contact,false);assert.equal(m.response,false);assert.equal(lanternCue(sim).participants[0].visible,false);});

test('a hidden player cannot change receiver speed through an otherwise visible peer',()=>{
 const outcomes=[];
 for(const playerX of [590,1100]){const sim=scene();begin(sim);storyAction(sim,'lantern-hide');sim.player.x=playerX;const e=sim.section.entities[0],peer=sim.section.entities[1];Object.assign(e,{x:555,y:335,angle:0});Object.assign(peer,{x:565,y:395,angle:0,lanternOrganShown:true});sim.section.entities[2].lanternOrganShown=false;const old={x:e.x,y:e.y};storyNPC(sim,e,1/60);outcomes.push({dx:e.x-old.x,dy:e.y-old.y,angle:e.angle});}
 assert.deepEqual(outcomes[0],outcomes[1]);
});

test('a missing real cohort gives an honest opportunity hint without substituting another species',()=>{const sim=scene();sim.section.entities[1].species=SPECIES[12];sim.section.entities[2].alive=false;const before=sim.section.entities.length;storyAction(sim,'lantern-upper');assert.equal(state(sim).stage,'gather');assert.equal(state(sim).participants.length,0);assert.equal(sim.section.entities.length,before);assert.match(sim.events.at(-1).text,/already living/);});

test('gather safety honors only live exact initial reservations without holding their needs or assigning a route',()=>{
 const sim=scene(),before=sim.section.entities.map(e=>({id:e.id,x:e.x,y:e.y,health:e.health,satiated:e.satiated,target:e.target}));
 for(const e of sim.section.entities)e.adventureReservation={key:'lantern',reef:8,remaining:60,incarnation:e.incarnation,species:'s53',x:e.x,y:e.y};
 assert.deepEqual(safety(sim).participants,sim.section.entities.map(e=>({id:e.id,incarnation:0,species:'s53'})));assert.equal(safety(sim).holdNeeds,false);assert.equal(state(sim).participants.length,0);
 sim.section.entities[0].adventureReservation.incarnation=1;sim.section.entities[1].adventureReservation.remaining=0;assert.deepEqual(safety(sim).participants,[{id:3,incarnation:0,species:'s53'}]);
 assert.deepEqual(sim.section.entities.map(e=>({id:e.id,x:e.x,y:e.y,health:e.health,satiated:e.satiated,target:e.target})),before);
});

test('pause and offscreen time freeze the encounter; return preserves actual traversal evidence',()=>{const sim=scene();begin(sim);storyPointer(sim,720,190);frame(sim,60);const snapshot=structuredClone(state(sim)),positions=sim.section.entities.map(e=>({x:e.x,y:e.y}));sim.paused=true;frame(sim,120);assert.deepEqual(state(sim),snapshot);assert.deepEqual(sim.section.entities.map(e=>({x:e.x,y:e.y})),positions);sim.paused=false;sim.current=4;frame(sim,120);assert.deepEqual(state(sim),snapshot);sim.current=8;frame(sim);assert.equal(state(sim).stage,'route');assert.equal(state(sim).route,snapshot.route);assert.ok(state(sim).playerTravel>=snapshot.playerTravel);assert.equal(state(sim).participants.length,3);});

test('reincarnated or missing selected fish never inherit turn evidence',()=>{const sim=scene();begin(sim);const selected=state(sim).participants[0];selected.response=true;selected.contact=true;selected.gate=3;selected.travel=500;sim.section.entities.find(e=>e.id===selected.id).incarnation++;frame(sim);assert.equal(state(sim).stage,'gather');assert.equal(state(sim).participants.length,0);assert.equal(state(sim).complete,false);storyAction(sim,'lantern-route','lower');assert.equal(state(sim).participants.find(m=>m.id===selected.id).incarnation,1);assert.equal(state(sim).participants.every(m=>!m.response&&m.travel===0),true);});

test('restored route preserves committed evidence without pending observations; validators bound counts and completion',()=>{const sim=scene();begin(sim);storyPointer(sim,720,190);frame(sim,160);const saved=structuredClone(state(sim)),restored=scene();restored.player=structuredClone(sim.player);restored.section.entities=structuredClone(sim.section.entities);restored.pointer={x:restored.player.x,y:restored.player.y};restored.reefStories.lantern=saved;initStory(restored);assert.deepEqual(state(restored),saved);assert.equal(state(restored).stage,'route');assert.ok(state(restored).playerTravel>0);assert.equal(restored.player.lanternCaseStudy,'Anomalops katoptron');assert.equal(validStory(state(restored)),true);frame(restored);assert.equal(state(restored).playerTravel,saved.playerTravel);assert.equal(state(restored).playerGate,saved.playerGate);const missing=scene();missing.reefStories.lantern=structuredClone(saved);missing.section.entities[0].incarnation++;initStory(missing);assert.equal(state(missing).stage,'gather');assert.equal(state(missing).participants.length,0);const bad=structuredClone(state(sim));bad.participants.push({...bad.participants[0],id:4});assert.equal(validStory(bad),false);bad.participants.pop();bad.caseStudy='Anomalopidae';assert.equal(validStory(bad),false);bad.caseStudy='Anomalops katoptron';bad.stage='complete';bad.complete=true;assert.equal(validStory(bad),false);bad.stage='route';bad.complete=false;bad.playerTravel=Infinity;assert.equal(validStory(bad),false);});

test('pointer chooses real swimming; the solid outcrop rejects a straight shortcut',()=>{const sim=scene();begin(sim);const before=sim.player.x;assert.equal(storyClick(sim,1010,360),true);frame(sim,350);assert.ok(sim.player.x>before);assert.ok(sim.player.x<690);assert.equal(state(sim).playerGate,1);assert.equal(state(sim).complete,false);assert.equal(sim.player.y,360);});

for(const routeId of ['upper','lower'])test(`the player and same living schoolmate physically cross the ${routeId} bend before discovery`,()=>{
 const sim=scene();begin(sim,routeId);const route=lanternOptions().find(r=>r.id===routeId).points,population=sim.section.entities.map(e=>({id:e.id,incarnation:e.incarnation}));
 // Lead gently, using small destinations on the actual bend. No coordinate
 // writes, route-follow command to the NPCs, meals, or fabricated responses.
 let playerDistance=0,neighborDistance=0,old={x:sim.player.x,y:sim.player.y},oldNeighbor={x:sim.section.entities[0].x,y:sim.section.entities[0].y};
 for(let waypoint=1;waypoint<route.length;waypoint++){
  storyPointer(sim,route[waypoint].x,route[waypoint].y);
  for(let i=0;i<1400;i++){
   frame(sim);playerDistance+=Math.hypot(sim.player.x-old.x,sim.player.y-old.y);old={x:sim.player.x,y:sim.player.y};neighborDistance+=Math.hypot(sim.section.entities[0].x-oldNeighbor.x,sim.section.entities[0].y-oldNeighbor.y);oldNeighbor={x:sim.section.entities[0].x,y:sim.section.entities[0].y};
   if(Math.hypot(sim.player.x-route[waypoint].x,sim.player.y-route[waypoint].y)<15&&state(sim).participants.some(m=>m.gate>=waypoint+1))break;
  }
 }
 frame(sim,900);
 assert.equal(state(sim).stage,'complete',JSON.stringify(lanternCue(sim)));assert.ok(playerDistance>=450);assert.ok(neighborDistance>=420);assert.equal(state(sim).participants.some(m=>m.gate===4&&m.response&&m.contact),true);assert.equal(validStory(state(sim)),true);assert.deepEqual(sim.section.entities.map(e=>({id:e.id,incarnation:e.incarnation})),population);assert.equal(sim.events.filter(e=>e.type==='discovery').length,1);frame(sim,200);assert.equal(sim.events.filter(e=>e.type==='discovery').length,1);stopStory(sim);assert.equal(sim.player.lanternCaseStudy,undefined);
});

test('actual Simulation save resumes a mid-bend school and completes with the original actors',()=>{
 let sim=new Simulation(42);sim.start('practice','s53',null,{adventureKey:'lantern'});assert.equal(beginIntegratedStory(sim,'lantern'),true);assert.equal(integratedAction(sim,'lantern-upper'),true);integratedAction(sim,'lantern-show');
 const route=lanternOptions()[0].points,identities=state(sim).participants.map(({id,incarnation})=>({id,incarnation}));
 sim.point(route[1].x,route[1].y);
 for(let i=0;i<1400;i++){sim.step(1/60);if(Math.hypot(sim.player.x-route[1].x,sim.player.y-route[1].y)<15&&state(sim).participants.some(m=>m.gate>=2))break;}
 assert.equal(state(sim).stage,'route');assert.ok(state(sim).playerTravel>150);assert.ok(state(sim).participants.some(m=>m.response));
 const saved=structuredClone(state(sim));sim=Simulation.restore(sim.serialize());assert.equal(sim.paused,true);assert.deepEqual(state(sim),saved);const freeze=sim.serialize();sim.step(1);assert.equal(sim.serialize(),freeze);sim.paused=false;
 for(let waypoint=2;waypoint<route.length;waypoint++){
  sim.point(route[waypoint].x,route[waypoint].y);
  for(let i=0;i<1400;i++){sim.step(1/60);if(state(sim).complete||Math.hypot(sim.player.x-route[waypoint].x,sim.player.y-route[waypoint].y)<15&&state(sim).participants.some(m=>m.gate>=waypoint+1))break;}
 }
 for(let i=0;i<900&&!state(sim).complete;i++)sim.step(1/60);
 assert.equal(state(sim).complete,true,JSON.stringify(lanternCue(sim)));assert.deepEqual(state(sim).participants.map(({id,incarnation})=>({id,incarnation})),identities);assert.equal(sim.events.filter(e=>e.type==='discovery'&&e.value==='lantern-company').length,1);assert.equal(validStory(state(sim)),true);
});

test('an active bend permits actual edge travel and offscreen checkpoints remain frozen',()=>{
 const sim=new Simulation(42);sim.start('practice','s53',null,{adventureKey:'lantern'});beginIntegratedStory(sim,'lantern');integratedAction(sim,'lantern-upper');integratedAction(sim,'lantern-show');sim.point(720,190);
 for(let i=0;i<400;i++)sim.step(1/60);
 assert.equal(state(sim).stage,'route');sim.point(0,190);
 for(let i=0;i<1600&&sim.current===8;i++)sim.step(1/60);
 assert.equal(sim.current,7,'ordinary pointer swimming must cross the left reef edge');assert.equal(state(sim).stage,'route');
 const checkpoint=structuredClone(state(sim)),positions=sim.sections[8].entities.filter(e=>checkpoint.participants.some(m=>m.id===e.id)).map(e=>({id:e.id,x:e.x,y:e.y}));
 sim.point(800,190);for(let i=0;i<180;i++)sim.step(1/60);assert.deepEqual(state(sim),checkpoint);assert.deepEqual(sim.sections[8].entities.filter(e=>checkpoint.participants.some(m=>m.id===e.id)).map(e=>({id:e.id,x:e.x,y:e.y})),positions);
});

test('guided cohorts remain claimable after reading, and route handoff preserves actual needs',()=>{
 for(const seed of [28,33]){
  const sim=new Simulation(seed);sim.start('practice','s53',null,{adventureKey:'lantern'});assert.equal(beginIntegratedStory(sim,'lantern'),true);
  const original=sim.section.entities.filter(e=>e.adventureReservation?.key==='lantern').map(e=>({id:e.id,incarnation:e.incarnation||0}));assert.equal(original.length,3);
  for(let i=0;i<1200;i++)sim.step(1/60);
  assert.equal(state(sim).stage,'gather');const before=sim.section.entities.filter(e=>original.some(m=>m.id===e.id)).map(e=>({id:e.id,incarnation:e.incarnation||0,x:e.x,y:e.y,health:e.health,energy:e.energy,satiated:e.satiated,rest:e.rest,target:e.target}));
  assert.equal(integratedAction(sim,'lantern-upper'),true);assert.equal(state(sim).stage,'route',`seed ${seed} must permit a local route after twenty active seconds`);assert.deepEqual(state(sim).participants.map(({id,incarnation})=>({id,incarnation})).sort((a,b)=>a.id-b.id),original.sort((a,b)=>a.id-b.id));
  assert.deepEqual(sim.section.entities.filter(e=>original.some(m=>m.id===e.id)).map(e=>({id:e.id,incarnation:e.incarnation||0,x:e.x,y:e.y,health:e.health,energy:e.energy,satiated:e.satiated,rest:e.rest,target:e.target})),before,'claim must not reset actual needs or teleport actors');
  for(const e of sim.section.entities.filter(e=>original.some(m=>m.id===e.id)))assert.ok(e.adventureReservation,'assignment alone retains the invitation');sim.step(1/60);
  for(const e of sim.section.entities.filter(e=>original.some(m=>m.id===e.id)))assert.equal(e.adventureReservation,undefined,'actual owned NPC movement completes the handoff');assert.equal(state(sim).stage,'route');
 }
});
