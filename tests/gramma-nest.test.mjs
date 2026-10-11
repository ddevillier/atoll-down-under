import test from 'node:test';
import assert from 'node:assert/strict';
import {SPECIES,REEFS} from '../src/data.js';
import {mouthPoint} from '../src/feeding-contact.js';
import {Simulation} from '../src/simulation.js';
import {beginStory,storyAction as dispatchAction,stopStory as dispatchStop,storySafety} from '../src/reef-stories.js';
import {initStory,validStory,storyAction,storyClick,storyPlayer,storyPointer,tickStory,storyMeal,storyNPC,storyView,stopStory,nestScene,nestPhysicalPose,nestMouth,safety,NEST_REEF,NEST_LEDGES} from '../src/gramma-nest.js';

function scene(){
 const player={id:'player',species:SPECIES[3],x:800,y:140,angle:0,facing:1,vx:0,vy:0,health:81,energy:63,alive:true};
 const sim={player,current:NEST_REEF,phase:'playing',paused:false,pointer:{x:player.x,y:player.y},events:[],sections:REEFS.map(()=>({food:[],entities:[]})),reefStories:{version:1,active:'nest',nest:null},
  event(type,text,extra={}){this.events.push({type,text,...extra});},point(x,y){storyPointer(this,x,y);this.pointer={x,y};this.player.target=null;this.player.feeding=null;},setDestination(reef){this.destination=reef;}};
 initStory(sim);return sim;
}
const saved=sim=>sim.reefStories.nest;
function near(sim,target,side=-1){Object.assign(sim.player,{x:target.x+side*55,y:target.y+20,vx:0,vy:0});sim.point(sim.player.x,sim.player.y);}
function tick(sim,seconds=3){for(let i=0;i<Math.ceil(seconds*60);i++){storyPlayer(sim,1/60);tickStory(sim,1/60);}}
function choose(sim,index=0){storyAction(sim,'nest-role');near(sim,NEST_LEDGES[index].inspect);assert.equal(storyAction(sim,'nest-choose',index),true);tick(sim);assert.equal(saved(sim).stage,'gather');}
function pickup(sim){near(sim,saved(sim).material);assert.equal(storyAction(sim,'nest-pickup'),true);tick(sim);assert.equal(saved(sim).stage,'carry');}
function place(sim,side='left'){near(sim,NEST_LEDGES[saved(sim).ledge].sockets[side]);storyAction(sim,'nest-place',side);tick(sim);assert.equal(saved(sim).stage,'clear');}
function clear(sim){near(sim,NEST_LEDGES[saved(sim).ledge].clear);storyAction(sim,'nest-clear');tick(sim,5);assert.equal(saved(sim).stage,'inspect');}
function inspect(sim){near(sim,NEST_LEDGES[saved(sim).ledge].inspect);storyAction(sim,'nest-inspect');tick(sim);assert.equal(saved(sim).stage,'complete');}

test('the nesting-male role is explicit and remote clicks only choose a travel destination',()=>{
 const sim=scene(),s=saved(sim),l=NEST_LEDGES[1];
 assert.equal(s.stage,'role');assert.equal(s.role,null);assert.match(storyView(sim).detail,/nesting male/);
 assert.equal(storyClick(sim,l.x,l.openingY),false);tick(sim,30);assert.equal(s.stage,'role');
 storyAction(sim,'nest-role');assert.equal(s.role,'nesting-male');
 assert.equal(storyClick(sim,l.x,l.openingY),true);assert.equal(s.stage,'choose');assert.equal(storyPlayer(sim,1/60),false);assert.notDeepEqual(sim.pointer,{x:800,y:140});
 tick(sim,30);assert.equal(s.ledge,null);assert.equal(s.stage,'choose');
 near(sim,l.inspect);storyClick(sim,l.x,l.openingY);tick(sim);assert.equal(s.ledge,1);assert.equal(s.stage,'gather');
 const material=s.material;sim.player.x=1400;sim.player.y=120;storyClick(sim,material.x,material.y);tick(sim,30);assert.equal(s.material.carried,false);assert.equal(s.stage,'gather');
});

test('both entrance choices physically carry one nonfood tuft and leave different persistent arrangements',()=>{
 for(const side of ['left','right']){
  const sim=scene(),food={id:'ordinary-algae',kind:'food',food:'algae',amount:100,x:470,y:450};sim.sections[NEST_REEF].food.push(food);
  const energy=sim.player.energy,health=sim.player.health;choose(sim,side==='left'?0:1);pickup(sim);
  assert.equal(saved(sim).material.carried,true);assert.equal(nestScene(sim).material.available,false);
  assert.deepEqual({x:nestScene(sim).material.x,y:nestScene(sim).material.y},nestMouth(sim));
  sim.point(sim.player.x+120,sim.player.y);assert.equal(storyPlayer(sim,1/60),false);assert.equal(saved(sim).material.carried,true);
  sim.player.x+=80;assert.deepEqual({x:nestScene(sim).material.x,y:nestScene(sim).material.y},nestMouth(sim));
  assert.equal(storyMeal(sim,food),false);assert.equal(storyNPC(sim,{},1),false);assert.equal(food.amount,100);
  place(sim,side);assert.equal(saved(sim).side,side);assert.deepEqual({x:saved(sim).material.x,y:saved(sim).material.y},NEST_LEDGES[saved(sim).ledge].sockets[side]);
  assert.equal(sim.player.energy,energy);assert.equal(sim.player.health,health);assert.equal(sim.sections[NEST_REEF].entities.length,0);assert.equal(validStory(saved(sim)),true);
 }
});

test('contact pose and mouth geometry agree from both sides for pickup and belly-up deposition',()=>{
 for(const side of [-1,1]){
  const sim=scene();choose(sim);near(sim,saved(sim).material,side);storyAction(sim,'nest-pickup');
  assert.equal(nestPhysicalPose(sim).rotation,0);tick(sim,.4);assert.equal(saved(sim).material.carried,false,'travel alone does not acquire material');tick(sim);
  const l=NEST_LEDGES[0];near(sim,l.sockets.right,side);storyAction(sim,'nest-place','right');
  assert.equal(nestPhysicalPose(sim).rotation,Math.PI);const facing=nestPhysicalPose(sim).facing;
  for(let i=0;i<120&&saved(sim).stage==='carry';i++){
   storyPlayer(sim,1/60);const pose=nestPhysicalPose(sim);assert.equal(pose.rotation,Math.PI);assert.equal(pose.facing,facing);
   assert.deepEqual(nestMouth(sim),mouthPoint(sim.player,pose));tickStory(sim,1/60);
  }
  assert.equal(saved(sim).material.placed,true);
  const contact=mouthPoint(sim.player,{rotation:Math.PI,facing});assert.ok(Math.hypot(contact.x-l.sockets.right.x,contact.y-l.sockets.right.y)<=3);
 }
});

test('silt must be lifted at the entrance and physically taken outside before final nearby inspection',()=>{
 const sim=scene();choose(sim);pickup(sim);place(sim);near(sim,NEST_LEDGES[0].clear);storyAction(sim,'nest-clear');
 tick(sim,1.9);assert.equal(nestScene(sim).job.kind,'release');assert.equal(saved(sim).cleared,false);
 const before=saved(sim).stage;sim.point(100,100);tick(sim,10);assert.equal(saved(sim).stage,before);assert.equal(saved(sim).cleared,false);
 clear(sim);assert.equal(saved(sim).cleared,true);assert.equal(sim.events.filter(e=>e.value==='gramma-nest-clear').length,1);
 sim.player.x=1500;sim.player.y=100;storyAction(sim,'nest-inspect');tick(sim,30);assert.equal(saved(sim).completed,false);
 inspect(sim);assert.equal(saved(sim).inspected,true);assert.equal(storyView(sim).complete,true);assert.equal(validStory(saved(sim)),true);
 storyAction(sim,'nest-inspect');storyAction(sim,'context');tick(sim,20);assert.equal(sim.events.filter(e=>e.type==='discovery'&&e.value==='gramma-nest').length,1);
 stopStory(sim);sim.reefStories.active=null;const sceneAfter=nestScene(sim);assert.equal(sceneAfter.state.cleared,true);assert.equal(sceneAfter.material.placed,true);assert.equal(sceneAfter.job,null);assert.equal(sceneAfter.pose,null);
});

test('cancel and stop restore steering while preserving the carried piece or dropping it nearby for resume',()=>{
 const sim=scene();choose(sim);pickup(sim);const held=structuredClone(saved(sim));
 near(sim,NEST_LEDGES[0].sockets.left);storyAction(sim,'nest-place','left');storyPlayer(sim,1/60);sim.point(100,120);
 assert.equal(storyPlayer(sim,1/60),false);assert.equal(nestScene(sim).job,null);assert.equal(saved(sim).material.carried,true);assert.equal(saved(sim).stage,'carry');
 stopStory(sim);assert.equal(saved(sim).stage,'gather');assert.equal(saved(sim).material.carried,false);assert.ok(Math.hypot(saved(sim).material.x-sim.player.x,saved(sim).material.y-sim.player.y)<40);assert.equal(validStory(saved(sim)),true);
 sim.reefStories.active=null;assert.equal(storyPlayer(sim,1/60),false);assert.equal(safety(sim),null);assert.equal(nestScene(sim).material.available,true);
 sim.reefStories.active='nest';pickup(sim);assert.equal(saved(sim).material.id,held.material.id);
});

test('pause, offscreen travel and reload freeze work without losing completed beats or held material',()=>{
 const sim=scene();choose(sim);pickup(sim);near(sim,NEST_LEDGES[0].sockets.left);storyAction(sim,'nest-place','left');tick(sim,.1);
 const snapshot=structuredClone(saved(sim)),position={x:sim.player.x,y:sim.player.y};sim.paused=true;tick(sim,30);
 assert.deepEqual(saved(sim),snapshot);assert.deepEqual({x:sim.player.x,y:sim.player.y},position);
 sim.paused=false;sim.current=8;tick(sim,30);assert.deepEqual(saved(sim),snapshot);assert.equal(nestScene(sim),null);assert.equal(storyPlayer(sim,1/60),false);
 const resumed=scene();resumed.reefStories.nest=JSON.parse(JSON.stringify(snapshot));initStory(resumed);assert.deepEqual(saved(resumed),snapshot);assert.equal(nestScene(resumed).material.carried,true);assert.equal(nestScene(resumed).job,null);
 place(resumed);clear(resumed);const ready=structuredClone(saved(resumed));resumed.current=1;tick(resumed,40);assert.deepEqual(saved(resumed),ready);resumed.current=4;inspect(resumed);
 const complete=JSON.parse(JSON.stringify(saved(resumed))),again=scene();again.reefStories.nest=complete;initStory(again);tick(again,30);assert.equal(again.events.length,0);assert.equal(validStory(complete),true);
});

test('strict stage validation rejects counterfeit material, out of bounds state and premature completion',()=>{
 const sim=scene();const stages=[];stages.push(structuredClone(saved(sim)));storyAction(sim,'nest-role');stages.push(structuredClone(saved(sim)));choose(sim);stages.push(structuredClone(saved(sim)));pickup(sim);stages.push(structuredClone(saved(sim)));place(sim);stages.push(structuredClone(saved(sim)));clear(sim);stages.push(structuredClone(saved(sim)));inspect(sim);stages.push(structuredClone(saved(sim)));
 for(const s of stages){assert.equal(validStory(s),true);const unknown=structuredClone(s);unknown.eggs=[];assert.equal(validStory(unknown),false);}
 assert.equal(validStory(null),true);
 for(const patch of [{completed:false},{inspected:false},{cleared:false},{side:null},{ledge:2},{role:'female'},{reef:3}])assert.equal(validStory({...saved(sim),...patch}),false);
 for(const patch of [{id:'food-algae'},{x:NaN},{y:900},{carried:true},{placed:false},{x:saved(sim).material.x+1}])assert.equal(validStory({...saved(sim),material:{...saved(sim).material,...patch}}),false);
});

test('local safety holds actual needs only during controlled contact and disappears on cancellation or completion',()=>{
 const sim=scene();assert.equal(safety(sim),null);choose(sim);near(sim,saved(sim).material);assert.equal(safety(sim).holdNeeds,false);
 storyAction(sim,'nest-pickup');assert.equal(safety(sim).holdNeeds,true);assert.equal(safety(sim).reef,NEST_REEF);assert.deepEqual(safety(sim).participants,[]);
 sim.point(100,100);assert.equal(safety(sim).holdNeeds,false);sim.player.x=1500;sim.player.y=20;assert.equal(safety(sim),null);
 sim.reefStories.active=null;assert.equal(storyAction(sim,'nest-pickup'),false);sim.reefStories.active='nest';sim.player.species=SPECIES[1];assert.equal(initStory(sim),false);assert.equal(storyAction(sim,'nest-pickup'),false);
});

test('the real pointer dispatcher cancels the nest approach and immediately receives the new destination',()=>{
 const sim=new Simulation(42);sim.start('practice','s3');assert.equal(beginStory(sim,'nest'),true);dispatchAction(sim,'nest-role');
 const l=NEST_LEDGES[0];Object.assign(sim.player,{x:l.inspect.x-55,y:l.inspect.y+20});sim.point(sim.player.x,sim.player.y);
 dispatchAction(sim,'nest-choose',0);sim.step(1/60);assert.equal(nestScene(sim).job.kind,'choose');
 sim.point(150,160);assert.deepEqual(sim.pointer,{x:150,y:160});assert.equal(nestScene(sim).job,null);assert.equal(storyPlayer(sim,1/60),false);
 const previous={x:sim.player.x,y:sim.player.y};for(let i=0;i<90;i++)sim.step(1/60);
 assert.ok(Math.hypot(sim.player.x-previous.x,sim.player.y-previous.y)>20,'normal simulation steering starts on that pointer event');
 assert.equal(saved(sim).stage,'choose');assert.equal(saved(sim).ledge,null);
});

test('paused imported carrying state derives local protection and stopping releases the pose before exit grace',()=>{
 const source=scene();choose(source);pickup(source);
 const sim=new Simulation(7);sim.start('practice','s3');beginStory(sim,'nest');
 sim.reefStories.nest=structuredClone(saved(source));const l=NEST_LEDGES[0];Object.assign(sim.player,{x:l.x-50,y:l.openingY+15});sim.point(sim.player.x,sim.player.y);
 dispatchAction(sim,'nest-place','left');sim.step(1/60);assert.equal(nestPhysicalPose(sim).rotation,Math.PI);
 sim.paused=true;const before=sim.serialize();sim.step(1);assert.equal(sim.serialize(),before,'pause freezes every saved value');
 assert.equal(storySafety(sim).holdNeeds,true);const restored=Simulation.restore(sim.serialize());assert.equal(restored.paused,true);
 assert.equal(saved(restored).material.carried,true);assert.equal(nestScene(restored).job,null);assert.equal(storySafety(restored).holdNeeds,false);
 assert.equal(nestPhysicalPose(restored).rotation,0,'unsaved assisted pose is released; the saved tuft stays at an upright mouth');
 assert.equal(dispatchStop(restored),true);assert.equal(saved(restored).stage,'gather');assert.equal(saved(restored).material.carried,false);
 assert.equal(nestPhysicalPose(restored),null);assert.equal(nestScene(restored).job,null);assert.equal(storyPlayer(restored,1/60),false);assert.equal(storySafety(restored),null);
 assert.ok(restored.player.hurtGrace>0);assert.equal(restored.riskCue.reason,'adventure');assert.equal(validStory(saved(restored)),true);
});
