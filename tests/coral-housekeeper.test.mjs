import test from 'node:test';
import assert from 'node:assert/strict';
import {BY_ID} from '../src/data.js';
import {Simulation} from '../src/simulation.js';
import {beginStory,storyAction as dispatchAction,stopStory as dispatchStop,storySafety} from '../src/reef-stories.js';
import {isProtectedActor,canPredate} from '../src/adventure-safety.js';
import {mouthPoint} from '../src/feeding-contact.js';
import {COLONY,initStory,validStory,storyAction,storyClick,storyPointer,storyPlayer,tickStory,storyMeal,storyNPC,storyView,stopStory,safety,housekeeperPose} from '../src/coral-housekeeper.js';

function scene(){
 const sim={mode:'practice',trial:false,phase:'playing',paused:false,current:4,reefStories:{version:1,active:'housekeeper'},
  player:{id:'player',species:BY_ID.s30,x:880,y:300,angle:0,facing:1,energy:72,health:84,alive:true,still:0,target:null,feeding:null},
  pointer:{x:880,y:300},section:{entities:[],food:[{id:'coral',food:'coral',amount:100},{id:'plankton',food:'plankton',amount:100}]},events:[],
  event(type,text,extra={}){this.events.push({type,text,...extra});}};
 initStory(sim);return sim;
}
const state=s=>s.reefStories.housekeeper;
function advance(s,until,limit=1600){
 for(let i=0;i<limit&&!until();i++){storyPlayer(s,.05);tickStory(s,.05);assert.equal(validStory(state(s)),true,'valid at every movement/contact frame');}
 assert.ok(until(),'actual swimming reaches the intended state');
}
function inspect(s){assert.equal(storyAction(s,'housekeeper-inspect'),true);advance(s,()=>state(s).inspected);}
function clear(s,id,dir=COLONY.pockets[id].outward){
 assert.equal(storyAction(s,'housekeeper-pocket',id),true);assert.equal(storyAction(s,'housekeeper-direction',dir),true);
 assert.equal(storyAction(s,'housekeeper-clear'),true);advance(s,()=>state(s).intent===null);
}
function both(){const s=scene();inspect(s);clear(s,0);clear(s,1);return s;}

test('typed authored colony has two actual sediment contacts and a bounded initial record',()=>{
 const s=scene(),before=JSON.stringify(s.section),values=[s.player.energy,s.player.health];
 assert.equal(COLONY.taxon,'Pocillopora damicornis');assert.equal(COLONY.reef,4);assert.equal(COLONY.pockets.length,2);assert.equal(Object.isFrozen(COLONY.branches[0]),true);
 assert.equal(validStory(state(s)),true);assert.equal(initStory(s),state(s));assert.equal(storyMeal(s,s.section.food[0]),false);assert.equal(storyNPC(s,{},.05),false);
 for(let i=0;i<100;i++)tickStory(s,.05);
 assert.deepEqual(state(s).mask,[0,0]);assert.equal(state(s).complete,false);assert.equal(JSON.stringify(s.section),before);assert.deepEqual([s.player.energy,s.player.health],values);
 assert.equal(storyAction(s,'housekeeper-clear'),false);assert.equal(storyAction(s,'housekeeper-pocket',0),false);
});

test('far colony click approaches to inspect and never changes sediment or grants a remote discovery',()=>{
 const s=scene(),before={x:s.player.x,y:s.player.y};
 assert.equal(storyClick(s,COLONY.pockets[0].x,COLONY.pockets[0].y),true);assert.deepEqual({x:s.player.x,y:s.player.y},before);
 assert.equal(state(s).phase,'approach');tickStory(s,.05);assert.equal(state(s).inspected,false);assert.deepEqual(state(s).mask,[0,0]);
 advance(s,()=>state(s).inspected);assert.ok(Math.hypot(s.player.x-COLONY.inspect.x,s.player.y-COLONY.inspect.y)<3);assert.equal(state(s).phase,'choose');assert.equal(s.events.length,0);
 assert.equal(storyClick(s,1300,50),false);assert.equal(storyClick(s,NaN,50),false);
});

test('direction choices produce physically different mouth approaches and actual outward sediment removal',()=>{
 const s=scene();inspect(s);const p=COLONY.pockets[0],nutrition=[s.player.energy,s.player.health],food=JSON.stringify(s.section.food);
 storyAction(s,'housekeeper-pocket',0);storyAction(s,'housekeeper-direction','left');storyAction(s,'housekeeper-clear');
 const start={x:s.player.x,y:s.player.y};tickStory(s,.05);assert.deepEqual(state(s).mask,[0,0]);assert.deepEqual({x:s.player.x,y:s.player.y},start);
 advance(s,()=>state(s).phase==='clear');assert.ok(s.player.x>p.x);assert.equal(s.player.facing,-1);assert.ok(Math.hypot(mouthPoint(s.player).x-p.x,mouthPoint(s.player).y-p.y)<=3);
 const pose=housekeeperPose(s);assert.equal(pose.rotation,0);assert.equal(pose.facing,-1);assert.ok(pose.progress>=0&&pose.progress<1);
 advance(s,()=>state(s).mask[0]===1);assert.equal(state(s).plumePocket,0);assert.equal(state(s).plumeDirection,'left');assert.equal(state(s).plume,1.6);assert.equal(state(s).complete,false);
 clear(s,1,'right');assert.ok(s.player.x<COLONY.pockets[1].x);assert.equal(s.player.facing,1);assert.deepEqual(state(s).mask,[1,1]);assert.equal(state(s).phase,'review');
 assert.deepEqual([s.player.energy,s.player.health],nutrition);assert.equal(JSON.stringify(s.section.food),food);assert.equal(s.section.entities.length,0);assert.equal(s.events.filter(e=>e.type==='discovery').length,0);
});

test('an inward choice visibly moves particles into shelter and cannot clear or finish by repeated remote actions',()=>{
 const s=scene();inspect(s);clear(s,0,'right');assert.deepEqual(state(s).mask,[0,0]);assert.equal(state(s).plumePocket,0);assert.equal(state(s).plumeDirection,'right');assert.ok(s.player.x<COLONY.pockets[0].x);
 assert.match(s.events.at(-1).text,/sheltered branches/);assert.equal(state(s).complete,false);
 assert.equal(storyAction(s,'housekeeper-direction','up'),false);assert.equal(storyAction(s,'housekeeper-pocket',2),false);
 clear(s,0,'left');assert.deepEqual(state(s).mask,[1,0]);assert.equal(storyAction(s,'housekeeper-pocket',0),false);assert.equal(storyAction(s,'housekeeper-clear'),false);
});

test('finishing requires deliberate physical inspection of retained detail and discovery is deduplicated on resume',()=>{
 const s=both();assert.equal(state(s).complete,false);assert.equal(storyView(s).complete,false);
 for(let i=0;i<60;i++)tickStory(s,.05);assert.equal(state(s).complete,false);
 assert.equal(storyAction(s,'housekeeper-inspect'),true);advance(s,()=>state(s).phase==='review'&&state(s).intent==='review');
 assert.ok(Math.hypot(s.player.x-COLONY.inspect.x,s.player.y-COLONY.inspect.y)<3);assert.equal(state(s).complete,false);
 advance(s,()=>state(s).complete);assert.equal(state(s).phase,'complete');assert.equal(s.events.filter(e=>e.value==='coral-housekeeper').length,1);
 const saved=JSON.parse(JSON.stringify(state(s)));assert.equal(validStory(saved),true);s.reefStories.housekeeper=saved;
 stopStory(s);s.reefStories.active=null;tickStory(s,.05);s.reefStories.active='housekeeper';initStory(s);
 storyAction(s,'housekeeper-inspect');advance(s,()=>state(s).intent===null);assert.equal(s.events.filter(e=>e.value==='coral-housekeeper').length,1);assert.deepEqual(state(s).mask,[1,1]);
});

test('pointer cancellation releases movement instantly while preserving completed pockets',()=>{
 const s=scene();inspect(s);clear(s,0);storyAction(s,'housekeeper-pocket',1);storyAction(s,'housekeeper-direction','right');storyAction(s,'housekeeper-clear');
 advance(s,()=>state(s).phase==='clear');for(let i=0;i<5;i++){storyPlayer(s,.05);tickStory(s,.05);}assert.ok(state(s).elapsed>0);
 assert.equal(storyPointer(s,1400,200),false);assert.equal(state(s).intent,null);assert.equal(state(s).elapsed,0);assert.deepEqual(state(s).mask,[1,0]);assert.equal(housekeeperPose(s),null);
 const before={x:s.player.x,y:s.player.y};assert.equal(storyPlayer(s,.05),false);tickStory(s,.05);assert.deepEqual({x:s.player.x,y:s.player.y},before);
 assert.deepEqual(s.pointer,before);assert.equal(state(s).complete,false);assert.equal(storyAction(s,'housekeeper-clear'),true);assert.equal(storyAction(s,'housekeeper-cancel'),true);assert.equal(storyPlayer(s,.05),false);
});

test('pause, offscreen reef and stopped stories freeze contact clocks, plumes and saved world change',()=>{
 const s=scene();inspect(s);clear(s,0);storyAction(s,'housekeeper-pocket',1);storyAction(s,'housekeeper-direction','right');storyAction(s,'housekeeper-clear');advance(s,()=>state(s).phase==='clear');
 for(const changes of [{paused:true},{current:5},{reefStories:{...s.reefStories,active:null}}]){
  const original={paused:s.paused,current:s.current,reefStories:s.reefStories};Object.assign(s,changes);const before=JSON.stringify(state(s)),position={x:s.player.x,y:s.player.y};
  assert.equal(storyPlayer(s,.05),false);tickStory(s,10);assert.equal(JSON.stringify(state(s)),before);assert.deepEqual({x:s.player.x,y:s.player.y},position);Object.assign(s,original);
 }
 advance(s,()=>state(s).mask[1]===1);const mask=structuredClone(state(s).mask);stopStory(s);assert.deepEqual(state(s).mask,mask);assert.equal(state(s).intent,null);
});

test('JSON persistence resumes pending physical contact and rejected saves cannot invent completed work',()=>{
 const s=scene();inspect(s);clear(s,0);storyAction(s,'housekeeper-pocket',1);storyAction(s,'housekeeper-direction','right');storyAction(s,'housekeeper-clear');advance(s,()=>state(s).phase==='clear');
 s.reefStories.housekeeper=JSON.parse(JSON.stringify(state(s)));assert.equal(validStory(state(s)),true);advance(s,()=>state(s).mask[1]===1);assert.equal(state(s).complete,false);
 const fresh=state(scene());assert.equal(validStory(null),true);
 for(const [k,v] of [['version',2],['reef',3],['site','generic-shelter'],['phase','growing'],['intent','feeding'],['direction','up'],['mask',[1,2]],['elapsed',Infinity],['plume',1.7],['plumePocket',0],['inspected','yes'],['complete',true],['unknown',0]]){const bad=structuredClone(fresh);bad[k]=v;assert.equal(validStory(bad),false,k);}
 for(const patch of [{mask:[1,0]},{phase:'clear',intent:'clear',selected:0},{phase:'review'},{phase:'approach'},{intent:'clear',selected:0},{elapsed:.1},{phase:'complete'}])assert.equal(validStory({...fresh,...patch}),false,JSON.stringify(patch));
});

test('clearing loses progress immediately when the authoritative mouth no longer touches sediment',()=>{
 const s=scene();inspect(s);storyAction(s,'housekeeper-pocket',0);storyAction(s,'housekeeper-direction','left');storyAction(s,'housekeeper-clear');advance(s,()=>state(s).phase==='clear');
 for(let i=0;i<10;i++){storyPlayer(s,.05);tickStory(s,.05);}assert.ok(state(s).elapsed>0);s.player.y+=40;tickStory(s,.05);
 assert.equal(state(s).elapsed,0);assert.equal(state(s).phase,'approach');assert.deepEqual(state(s).mask,[0,0]);assert.equal(validStory(state(s)),true);
});

test('peaceful safety applies only to the active local area and holds needs only for actual required poses',()=>{
 const s=scene();assert.equal(safety(s),null);inspect(s);let safe=safety(s);assert.equal(safe.reef,4);assert.deepEqual(safe.participants,[]);assert.equal(safe.holdNeeds,false);
 storyAction(s,'housekeeper-pocket',0);storyAction(s,'housekeeper-direction','left');storyAction(s,'housekeeper-clear');advance(s,()=>state(s).phase==='clear');assert.equal(safety(s).holdNeeds,true);
 stopStory(s);assert.equal(safety(s).holdNeeds,false);s.reefStories.active=null;assert.equal(safety(s),null);assert.equal(storyClick(s,578,321),false);
 s.reefStories.active='housekeeper';s.player.species=BY_ID.s2;assert.equal(storyPlayer(s,.05),false);assert.equal(storyAction(s,'context'),false);assert.equal(safety(s),null);
});

test('context keyboard equivalents can inspect, choose both remaining pockets and review the outcome',()=>{
 const s=scene();assert.equal(storyAction(s,'context'),true);advance(s,()=>state(s).inspected);
 assert.equal(storyAction(s,'context'),true);advance(s,()=>state(s).mask.some(Boolean));
 const first=state(s).mask.slice();assert.equal(storyAction(s,'context'),true);advance(s,()=>state(s).mask.every(Boolean));assert.notDeepEqual(state(s).mask,first);
 assert.equal(storyAction(s,'context'),true);advance(s,()=>state(s).complete);assert.equal(s.events.filter(e=>e.value==='coral-housekeeper').length,1);
});

test('contact routes finish from different starting headings and edges without teleportation',()=>{
 for(const [x,y,angle] of [[50,50,Math.PI],[1550,680,0],[620,600,-Math.PI/2],[100,340,0],[620,70,Math.PI/2],[800,330,Math.PI]]){
  const s=scene();Object.assign(s.player,{x,y,angle});storyAction(s,'housekeeper-inspect');let frames=0;
  while(!state(s).inspected&&frames++<1600){const before={x:s.player.x,y:s.player.y};storyPlayer(s,.05);tickStory(s,.05);assert.ok(Math.hypot(s.player.x-before.x,s.player.y-before.y)<=s.player.species.speed*.05+.001);}
  assert.equal(state(s).inspected,true,`start ${x}, ${y}, ${angle}`);clear(s,0);clear(s,1);storyAction(s,'housekeeper-inspect');advance(s,()=>state(s).complete);assert.equal(validStory(state(s)),true);
 }
});

test('pause retains exactly the same authoritative contact pose and invalid clock values do no work',()=>{
 const s=scene();inspect(s);storyAction(s,'context');advance(s,()=>state(s).phase==='clear');const pose=housekeeperPose(s),before=JSON.stringify(state(s));
 s.paused=true;assert.deepEqual(housekeeperPose(s),pose);storyPlayer(s,5);tickStory(s,5);assert.equal(JSON.stringify(state(s)),before);
 s.paused=false;for(const dt of [0,-1,Infinity,NaN]){assert.equal(storyPlayer(s,dt),false);tickStory(s,dt);assert.equal(JSON.stringify(state(s)),before);}
});

function swimIntegrated(s,until,limit=1800){
 for(let i=0;i<limit&&!until();i++)s.step(.05);
 assert.ok(until(),'integrated Simulation input reaches the intended Housekeeper state');
 assert.equal(validStory(state(s)),true);
}
function integratedClear(s,id){
 assert.equal(dispatchAction(s,'housekeeper-pocket',id),true);
 assert.equal(dispatchAction(s,'housekeeper-direction',COLONY.pockets[id].outward),true);
 assert.equal(dispatchAction(s,'housekeeper-clear'),true);
 swimIntegrated(s,()=>state(s).mask[id]===1);
}

test('integrated generated dives complete by real click, contextual actions and swimming with unchanged population',()=>{
 for(const seed of [42,1,9]){
  const s=new Simulation(seed);s.start('practice','s30');assert.equal(beginStory(s,'housekeeper'),true);
  const roster=s.sections.map(section=>section.entities.map(e=>[e.id,e.incarnation||0,e.species.id]));
  const before={x:s.player.x,y:s.player.y},energy=s.player.energy;
  assert.equal(s.eatAt(COLONY.x,COLONY.y),true);assert.deepEqual({x:s.player.x,y:s.player.y},before);assert.deepEqual(state(s).mask,[0,0]);
  swimIntegrated(s,()=>state(s).inspected);integratedClear(s,0);integratedClear(s,1);
  assert.equal(state(s).complete,false);assert.equal(dispatchAction(s,'housekeeper-inspect'),true);swimIntegrated(s,()=>state(s).complete);
  assert.equal(s.player.energy,energy);assert.equal(s.events.filter(e=>e.type==='eat').length,0);assert.equal(s.events.filter(e=>e.value==='coral-housekeeper').length,1);
  assert.deepEqual(s.sections.map(section=>section.entities.map(e=>[e.id,e.incarnation||0,e.species.id])),roster);
  const restored=Simulation.restore(s.serialize());assert.deepEqual(state(restored).mask,[1,1]);assert.equal(state(restored).complete,true);
  const saved=restored.serialize();restored.step(.05);assert.equal(restored.serialize(),saved);restored.paused=false;
  assert.equal(dispatchAction(restored,'housekeeper-inspect'),true);swimIntegrated(restored,()=>state(restored).intent===null);assert.equal(restored.events.filter(e=>e.value==='coral-housekeeper').length,0);
 }
});

test('paused restored safety is read-only and dispatcher stop releases the held pose with safe re-entry',()=>{
 const s=new Simulation(42);s.start('practice','s30');beginStory(s,'housekeeper');dispatchAction(s,'housekeeper-inspect');swimIntegrated(s,()=>state(s).inspected);
 dispatchAction(s,'housekeeper-pocket',0);dispatchAction(s,'housekeeper-direction','left');dispatchAction(s,'housekeeper-clear');swimIntegrated(s,()=>state(s).phase==='clear');
 s.protected=false;const needs={energy:s.player.energy,health:s.player.health};s.step(.05);assert.equal(s.player.energy,needs.energy);assert.equal(s.player.health,needs.health);
 const restored=Simulation.restore(s.serialize()),before=restored.serialize(),safe=storySafety(restored);
 assert.equal(restored.paused,true);assert.equal(safe.holdNeeds,true);assert.equal(isProtectedActor(restored,restored.player),true);
 assert.deepEqual(safety(restored),safe);assert.deepEqual(storySafety(restored),safe);assert.equal(restored.serialize(),before);
 const hunter={id:1001,incarnation:0,species:BY_ID.s16,x:restored.player.x+20,y:restored.player.y,alive:true};
 assert.equal(canPredate(restored,hunter,restored.player),false);
 assert.equal(dispatchStop(restored),true);assert.equal(restored.reefStories.active,null);assert.equal(state(restored).intent,null);assert.equal(state(restored).elapsed,0);
 assert.ok(restored.player.hurtGrace>0);assert.equal(restored.riskCue.reason,'adventure');assert.equal(storySafety(restored),null);assert.equal(housekeeperPose(restored),null);
 restored.paused=false;const position={x:restored.player.x,y:restored.player.y};restored.point(position.x-100,position.y);restored.step(.05);
 assert.ok(Math.hypot(restored.player.x-position.x,restored.player.y-position.y)>0);assert.ok(restored.player.hurtGrace>0);assert.equal(state(restored).complete,false);
});

test('integrated pointer cancellation and reef travel retain completed work and resume from real body location',()=>{
 const s=new Simulation(1);s.start('practice','s30');beginStory(s,'housekeeper');dispatchAction(s,'housekeeper-inspect');swimIntegrated(s,()=>state(s).inspected);integratedClear(s,0);
 dispatchAction(s,'housekeeper-pocket',1);dispatchAction(s,'housekeeper-direction','right');dispatchAction(s,'housekeeper-clear');swimIntegrated(s,()=>state(s).phase==='clear');
 s.point(s.player.x+80,s.player.y+40);assert.equal(state(s).intent,null);assert.deepEqual(state(s).mask,[1,0]);s.step(.05);assert.equal(state(s).mask[1],0);
 const record=JSON.stringify(state(s));assert.equal(s.transition(1,0),true);for(let i=0;i<8;i++)s.step(.05);assert.equal(JSON.stringify(state(s)),record);
 assert.equal(s.transition(-1,0),true);assert.equal(s.current,4);assert.deepEqual(state(s).mask,[1,0]);
 const restored=Simulation.restore(s.serialize());restored.paused=false;integratedClear(restored,1);dispatchAction(restored,'housekeeper-inspect');swimIntegrated(restored,()=>state(restored).complete);
 assert.equal(restored.events.filter(e=>e.value==='coral-housekeeper').length,1);
});
