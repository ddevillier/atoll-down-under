import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {walkLandmarks} from '../src/frogfish-walk-render.js';
import {WALK_GRAPH,initStory,validStory,storyAction,storyClick,storyPointer,storyPlayer,tickStory,walkerPose,walkBodyClear,walkSweepClear,canWalkEdge,safety,stopStory,storyMeal,storyNPC,validStoryPlayer,storyView} from '../src/frogfish-walk.js';

const node=id=>WALK_GRAPH.nodes.find(n=>n.id===id);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function scene(){const sim=new Simulation(123);sim.start('practice','s54');sim.reefStories.active='walker';initStory(sim);return sim;}
function frame(sim,dt=1/60){const owned=storyPlayer(sim,dt);tickStory(sim,dt);return owned;}
function plant(sim){assert.equal(storyAction(sim,'walker-plant'),true);for(let i=0;i<1800&&sim.reefStories.walker.phase==='approach';i++)frame(sim);assert.equal(sim.reefStories.walker.phase,'stance');}
function finishStep(sim,to,inspect=()=>{}){assert.equal(storyAction(sim,'walker-step',to),true);for(let i=0;i<1200&&sim.reefStories.walker.gait;i++){frame(sim);inspect(sim);}assert.equal(sim.reefStories.walker.node,to);}

test('remote planting really swims to support with bounded motion and no meal',()=>{
 const sim=scene(),origin={x:sim.player.x,y:sim.player.y},food=structuredClone(sim.section.food),energy=sim.player.energy;
 assert.equal(storyAction(sim,'walker-plant'),true);assert.deepEqual({x:sim.player.x,y:sim.player.y},origin);assert.equal(walkerPose(sim),null);
 let previous=origin;
 for(let i=0;i<1800&&sim.reefStories.walker.phase==='approach';i++){
  assert.equal(frame(sim),true);assert.ok(dist(previous,sim.player)<=sim.player.species.speed/60+.501);assert.ok(walkBodyClear(sim.player));previous={x:sim.player.x,y:sim.player.y};
 }
 assert.equal(sim.reefStories.walker.phase,'stance');assert.ok(dist(sim.player,{x:node('start').x,y:node('start').y-32})<.001);
 assert.equal(sim.player.energy,energy);assert.deepEqual(sim.section.food,food);assert.equal(storyMeal(sim,sim.section.food[0]),false);assert.equal(storyNPC(sim,sim.section.entities[0],.05),false);
});

test('planted contacts stay world-locked while the body carries weight; swings replant before transfer',()=>{
 const sim=scene();plant(sim);let anchoredFrames=0,swingFrames=0,previous=walkerPose(sim);
 finishStep(sim,'lower',()=>{
  const pose=walkerPose(sim);assert.ok(walkBodyClear(pose.body));
  const moved=dist(previous.body,pose.body)>1e-8;
  if(moved){anchoredFrames++;assert.ok(pose.contacts.filter(c=>c.planted).length>=2);for(const c of pose.contacts){const old=previous.contacts.find(p=>p.id===c.id);assert.ok(dist(c,old)<1e-8,'body transfer must not slide a planted contact');}}
  else if(pose.contacts.some(c=>!c.planted)){
   swingFrames++;for(const c of pose.contacts.filter(c=>c.planted)){assert.ok(dist(c,previous.contacts.find(p=>p.id===c.id))<1e-8);}
  }
  previous=pose;
 });
 assert.ok(anchoredFrames>80);assert.ok(swingFrames>80);assert.equal(sim.reefStories.walker.steps,1);
});

test('the diagonal gap and disconnected targets cannot reach or teleport; full body sweep detects an obstacle between clear endpoints',()=>{
 const sim=scene();plant(sim);const origin={x:sim.player.x,y:sim.player.y};
 assert.equal(storyAction(sim,'walker-step','upper-lookout'),false);assert.deepEqual({x:sim.player.x,y:sim.player.y},origin);assert.equal(canWalkEdge('upper','lower-lookout'),false);
 const obstacle=[{x:200,y:200,radius:10}],a={x:120,y:200},b={x:280,y:200};
 assert.equal(walkBodyClear(a,obstacle),true);assert.equal(walkBodyClear(b,obstacle),true);assert.equal(walkSweepClear(a,b,obstacle),false);
 assert.equal(walkBodyClear({x:200,y:225},obstacle),false,'clear center is insufficient when the body overlaps');
 assert.equal(canWalkEdge('start','lower',[{x:840,y:588,radius:4}]),false);
 assert.ok(WALK_GRAPH.nodes.length>=4&&WALK_GRAPH.nodes.length<=6);assert.ok(WALK_GRAPH.edges.length<=8);
});

test('both choices produce different actual lookouts in two transfers, with one discovery through replay',()=>{
 const sim=scene(),endpoints=[];plant(sim);
 for(const choice of ['upper','lower']){
  assert.equal(storyAction(sim,'walker-route',choice),true);finishStep(sim,choice);finishStep(sim,choice+'-lookout');
  assert.equal(sim.reefStories.walker.steps,2);assert.equal(sim.reefStories.walker.stage,'settle');assert.equal(sim.reefStories.walker.complete,choice==='lower');
  assert.equal(storyAction(sim,'context'),true);for(let i=0;i<80;i++)frame(sim);
  assert.equal(sim.reefStories.walker.stage,'done');assert.equal(sim.reefStories.walker.complete,true);endpoints.push({x:sim.player.x,y:sim.player.y});
  assert.equal(storyAction(sim,'walker-restart'),true);plant(sim);
 }
 assert.ok(dist(endpoints[0],endpoints[1])>60);assert.equal(sim.events.filter(e=>e.type==='discovery'&&e.value==='frogfish-walk').length,1);
});

test('every saved gait phase resumes without jumping, pause and offscreen visits freeze state',()=>{
 const sim=scene();plant(sim);assert.equal(storyAction(sim,'walker-step','upper'),true);const phases=new Set();
 for(let i=0;i<450&&sim.reefStories.walker.gait;i++){
  frame(sim);const s=sim.reefStories.walker;if(!s.gait)break;
  if(phases.has(s.phase))continue;phases.add(s.phase);assert.equal(validStory(s),true);
  const saved=JSON.stringify(s),body={x:sim.player.x,y:sim.player.y},pose=walkerPose(sim);
  sim.paused=true;for(let j=0;j<10;j++)frame(sim,.05);assert.equal(JSON.stringify(s),saved);assert.deepEqual({x:sim.player.x,y:sim.player.y},body);sim.paused=false;
  sim.current=5;for(let j=0;j<10;j++)frame(sim,.05);assert.equal(JSON.stringify(s),saved);sim.current=4;
  sim.reefStories.walker=JSON.parse(saved);assert.deepEqual(walkerPose(sim),pose);frame(sim);assert.ok(dist(sim.player,body)<2);
 }
 assert.equal(phases.size,5);
});

test('mouse movement and stop release assistance at the physical body position, and explicit target clicks can plant again',()=>{
 const sim=scene();plant(sim);assert.equal(storyAction(sim,'walker-step','upper'),true);
 for(let i=0;i<100&&sim.player.x===node('start').x;i++)frame(sim);
 const physical={x:sim.player.x,y:sim.player.y};assert.ok(physical.x<node('start').x);
 storyPointer(sim,900,300);assert.deepEqual({x:sim.player.x,y:sim.player.y},physical);assert.equal(walkerPose(sim),null);assert.equal(frame(sim),false);assert.equal(safety(sim),null);
 plant(sim);assert.equal(storyClick(sim,node('upper').x,node('upper').y),true);assert.ok(sim.reefStories.walker.gait);
 for(let i=0;i<45;i++)frame(sim);const current={x:sim.player.x,y:sim.player.y};assert.equal(stopStory(sim),true);assert.deepEqual({x:sim.player.x,y:sim.player.y},current);assert.equal(frame(sim),false);
});

test('bounded save validation rejects impossible graph ownership, nonfinite clocks and unbounded strides',()=>{
 const sim=scene();plant(sim);assert.equal(storyAction(sim,'walker-step','upper'),true);const good=structuredClone(sim.reefStories.walker);assert.equal(validStory(good),true);
 const bad=[{node:'missing'},{selected:'lower-lookout'},{steps:4},{reef:5},{settled:NaN},{complete:1},{stage:'done'},{extra:1},{gait:{...good.gait,stride:1000}},{gait:{...good.gait,elapsed:Infinity}},{gait:{...good.gait,to:'lower-lookout'}},{gait:null}];
 for(const patch of bad)assert.equal(validStory({...good,...patch}),false,JSON.stringify(patch));assert.equal(validStory(null),true);
});

test('safety binds only the local activity while needs are held, without altering health or hunger',()=>{
 const sim=scene(),before={health:sim.player.health,energy:sim.player.energy};assert.equal(safety(sim),null);
 storyAction(sim,'walker-plant');assert.equal(safety(sim).holdNeeds,false);for(let i=0;i<1800&&sim.reefStories.walker.phase==='approach';i++)frame(sim);assert.equal(sim.reefStories.walker.phase,'stance');
 const area=safety(sim);assert.equal(area.reef,4);assert.equal(area.holdNeeds,true);assert.ok(area.radius<200);assert.deepEqual(area.participants,[]);assert.deepEqual({health:sim.player.health,energy:sim.player.energy},before);
 storyAction(sim,'walker-swim');assert.equal(safety(sim),null);
});

test('both complete routes place painted toes on actual stone roofs, with bounded anatomical reach and no body clipping',()=>{
 const surfaces=[...WALK_GRAPH.nodes,...WALK_GRAPH.edges].map(n=>n.surface);
 const onSurface=c=>surfaces.some(([x1,y1,x2,y2])=>{
  if(c.x<Math.min(x1,x2)-1e-6||c.x>Math.max(x1,x2)+1e-6)return false;
  return Math.abs(c.y-(y1+(y2-y1)*(c.x-x1)/(x2-x1)))<1e-6;
 });
 for(const choice of ['upper','lower']){
  const sim=scene();plant(sim);let previous=walkerPose(sim),inclined=false;
  const inspect=()=>{
   const pose=walkerPose(sim);assert.ok(walkBodyClear(pose.body));assert.ok(dist(previous.body,pose.body)<2);
   for(const contact of pose.contacts.filter(c=>c.planted)){
    assert.ok(onSurface(contact),'a planted toe must lie on a real finite roof');
    const old=previous.contacts.find(c=>c.id===contact.id);
    if(dist(previous.body,pose.body)>1e-8)assert.ok(dist(contact,old)<1e-6,'grounded toe cannot move during a body transfer');
   }
   for(const limb of walkLandmarks(pose,pose.width,pose.height))assert.ok(dist(limb.root,limb.tip)<=50.1,'the actual painted fin root must reach its toe');
   inclined||=Math.abs(pose.body.rotation)>.1;previous=pose;
  };
  finishStep(sim,choice,inspect);finishStep(sim,choice+'-lookout',inspect);assert.ok(inclined||choice==='lower');
 }
 assert.equal(walkBodyClear({x:800,y:620}),false,'the center cannot enter a filled plinth');
 assert.equal(walkBodyClear({x:760,y:608}),false,'the body cannot enter a filled sloping ramp');
 assert.equal(walkBodyClear({x:710,y:578}),false,'a body above the shelf still fails when its belly intersects the stone');
});

test('turning left rotates the body gradually over fixed feet and completed labels follow the physical lookout',()=>{
 const sim=scene();plant(sim);const original=walkerPose(sim);assert.equal(storyAction(sim,'walker-step','upper'),true);let facing=1,turnFrames=0;
 for(let i=0;i<80&&sim.reefStories.walker.phase==='turn';i++){
  frame(sim);const pose=walkerPose(sim);assert.ok(dist(pose.body,original.body)<1e-8);for(const c of pose.contacts)assert.ok(dist(c,original.contacts.find(p=>p.id===c.id))<1e-8);
  assert.ok(Math.abs(pose.facing-facing)<.1);facing=pose.facing;turnFrames++;
 }
 assert.ok(turnFrames>30);assert.equal(facing,-1);for(let i=0;i<1200&&sim.reefStories.walker.gait;i++)frame(sim);assert.equal(sim.reefStories.walker.node,'upper');
 finishStep(sim,'upper-lookout');assert.equal(storyAction(sim,'walker-route','lower'),false);storyAction(sim,'walker-settle');for(let i=0;i<80;i++)frame(sim);
 assert.equal(storyView(sim).step,'The high lookout');assert.ok(!storyView(sim).actions.some(a=>a.id==='walker-route'));storyAction(sim,'walker-swim');assert.equal(storyView(sim).step,'The high lookout');
});

test('real save restoration preserves every walking phase and rejects a player moved away from its planted pose',()=>{
 const sim=scene();plant(sim);storyAction(sim,'walker-step','upper');const seen=new Set();
 for(let i=0;i<450&&sim.reefStories.walker.gait;i++){
  frame(sim);if(!sim.reefStories.walker.gait)break;const phase=sim.reefStories.walker.phase;if(seen.has(phase))continue;seen.add(phase);
  assert.equal(validStoryPlayer(sim),true);const raw=sim.serialize(),restored=Simulation.restore(raw);
  assert.deepEqual(walkerPose(restored),walkerPose(sim));assert.equal(restored.paused,true);
  const bad=JSON.parse(raw);bad.player.x+=20;assert.throws(()=>Simulation.restore(JSON.stringify(bad)),/adventure pose/);
  const tilted=JSON.parse(raw);tilted.player.angle+=.2;assert.throws(()=>Simulation.restore(JSON.stringify(tilted)),/adventure pose/);
 }
 assert.equal(seen.size,5);
});
