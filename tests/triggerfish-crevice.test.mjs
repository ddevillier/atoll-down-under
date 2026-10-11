import test from 'node:test';
import assert from 'node:assert/strict';
import {SPECIES,REEFS} from '../src/data.js';
import {CREVICES,CREVICE_REEF,crevicePosition,creviceOptions,creviceFit,crevicePose,initStory,validStory,validStoryPlayer,storyAction,storyPlayer,tickStory,storyPointer,stopStory,storySafety,storyView,storyNPC} from '../src/triggerfish-crevice.js';
import {Simulation} from '../src/simulation.js';
import {beginStory,storyAction as dispatchAction} from '../src/reef-stories.js';

function scene(){
 const p={id:'player',incarnation:0,species:SPECIES[24],alive:true,health:76,energy:63,x:800,y:300,angle:0,facing:1,vx:0,vy:0};
 const sim={player:p,current:CREVICE_REEF,phase:'playing',paused:false,sections:REEFS.map(()=>({entities:[]})),reefStories:{version:1,active:'crevice',crevice:null},events:[],pointer:{x:p.x,y:p.y},event(type,text,extra={}){this.events.push({type,text,...extra});},setDestination(reef){this.destination=reef;}};
 initStory(sim);return sim;
}
const state=sim=>sim.reefStories.crevice;
function tick(sim,seconds){for(let i=0;i<Math.ceil(seconds*60);i++){storyPlayer(sim,1/60);tickStory(sim,1/60);}}
function approach(sim){storyAction(sim,'crevice-choose',1);tick(sim,20);assert.equal(creviceFit(sim).fits,true);}
function enter(sim){approach(sim);storyAction(sim,'crevice-enter');tick(sim,5);assert.equal(state(sim).stage,'inside');}
function lock(sim){enter(sim);storyAction(sim,'crevice-lock');tick(sim,1);assert.equal(state(sim).stage,'locked');}
const clone=s=>JSON.parse(JSON.stringify(s));

test('three openings compare actual body clearance and a live occupied cavity',()=>{
 const sim=scene(),options=creviceOptions(sim);assert.equal(options.length,3);assert.deepEqual(options.map(o=>o.fits),[false,true,false]);
 assert.match(options[0].reason,/narrow/);assert.match(options[2].reason,/open to brace/);
 storyAction(sim,'crevice-choose',0);assert.equal(state(sim).stage,'choose');assert.match(sim.events.at(-1).text,/narrow/);
 storyAction(sim,'crevice-choose',2);assert.equal(state(sim).stage,'choose');assert.match(sim.events.at(-1).text,/open to brace/);
 const npc={id:17,alive:true,species:SPECIES[1],...crevicePosition(CREVICES[1],1)};sim.sections[4].entities.push(npc);
 assert.equal(creviceOptions(sim)[1].occupied,true);storyAction(sim,'crevice-choose',1);assert.equal(state(sim).stage,'choose');assert.match(sim.events.at(-1).text,/Another fish/);
 npc.alive=false;assert.equal(creviceOptions(sim)[1].fits,true);assert.equal(sim.sections[4].entities.length,1);
});

test('range, angle, clearance and true interior placement gate entry and locking',()=>{
 const sim=scene();storyAction(sim,'crevice-choose',1);assert.equal(storySafety(sim),null);
 storyAction(sim,'crevice-enter');assert.equal(state(sim).stage,'approach');assert.match(sim.events.at(-1).text,/Align|entrance/);
 Object.assign(sim.player,crevicePosition(CREVICES[1],0),{angle:CREVICES[1].angle+Math.PI/2});
 assert.equal(creviceFit(sim).fits,false);storyAction(sim,'crevice-enter');assert.match(sim.events.at(-1).text,/Align/);
 Object.assign(sim.player,{angle:CREVICES[1].angle,y:sim.player.y+9});assert.equal(creviceFit(sim).fits,false);storyAction(sim,'crevice-enter');assert.match(sim.events.at(-1).text,/clearance/);
 Object.assign(sim.player,crevicePosition(CREVICES[1],0),{angle:CREVICES[1].angle});assert.equal(creviceFit(sim).fits,true);
 const validX=sim.player.x;sim.player.x=NaN;assert.equal(creviceFit(sim).fits,false);sim.player.x=validX;
 storyAction(sim,'crevice-lock');assert.equal(state(sim).stage,'approach');storyAction(sim,'crevice-enter');
 assert.equal(state(sim).stage,'entering');assert.equal(storySafety(sim)?.holdNeeds,true);assert.equal(sim.player.triggerfishSpine,0);
 const before=sim.player.x;tick(sim,.5);assert.ok(sim.player.x>before&&sim.player.x<crevicePosition(CREVICES[1],1).x);assert.equal(state(sim).entered,false);
 storyAction(sim,'crevice-lock');assert.equal(state(sim).stage,'entering');tick(sim,5);assert.equal(creviceFit(sim,1,{inside:true}).fits,true);
});

test('physical enter-lock-release-backout awards exactly one discovery without calories or population changes',()=>{
 const sim=scene(),start={energy:sim.player.energy,health:sim.player.health,population:sim.sections.flatMap(s=>s.entities).length};
 lock(sim);const pose=crevicePose(sim);assert.equal(pose.spine,1);assert.deepEqual(pose.spineTip,pose.spineContact);assert.ok(Math.hypot(pose.spineContact.x-pose.upperEdge.x,pose.spineContact.y-pose.upperEdge.y)<1e-9);
 assert.equal(sim.player.angle,CREVICES[1].angle);assert.equal(sim.player.crevicePose.rotation,CREVICES[1].angle);
 assert.equal(state(sim).completed,false);assert.equal(sim.events.filter(e=>e.type==='discovery').length,0);
 const inside={x:sim.player.x,y:sim.player.y};storyAction(sim,'crevice-release');tick(sim,.2);assert.equal(state(sim).stage,'releasing');assert.ok(state(sim).spine>0&&state(sim).spine<1);assert.deepEqual({x:sim.player.x,y:sim.player.y},inside);
 tick(sim,.4);assert.equal(state(sim).spine,0);assert.equal(state(sim).stage,'exiting');tick(sim,5);assert.equal(state(sim).stage,'complete');assert.equal(storyView(sim).complete,true);assert.equal(storySafety(sim),null);assert.equal(sim.player.triggerfishSpine,0);
 assert.ok(Math.hypot(sim.player.x-crevicePosition(CREVICES[1],0).x,sim.player.y-crevicePosition(CREVICES[1],0).y)<.001);
 for(let i=0;i<4;i++){storyAction(sim,'crevice-lock');storyAction(sim,'crevice-release');storyAction(sim,'crevice-choose',1);tick(sim,5);}
 assert.equal(sim.events.filter(e=>e.type==='discovery'&&e.value==='triggerfish-crevice').length,1);assert.equal(sim.player.energy,start.energy);assert.equal(sim.player.health,start.health);assert.equal(sim.sections.flatMap(s=>s.entities).length,start.population);assert.equal(validStory(state(sim)),true);
});

test('pointer, stop and cancel immediately fold the spine and restore free movement without awarding an escape',()=>{
 for(const cancellation of [sim=>storyPointer(sim,50,50),sim=>stopStory(sim),sim=>storyAction(sim,'crevice-cancel')]){
  const sim=scene();lock(sim);const before={x:sim.player.x,y:sim.player.y};cancellation(sim);
  assert.equal(state(sim).stage,'choose');assert.equal(state(sim).spine,0);assert.equal(state(sim).depth,0);assert.equal(sim.player.triggerfishSpine,0);assert.equal(sim.player.crevicePose,null);assert.equal(storySafety(sim),null);assert.equal(storyPlayer(sim,1/60),false);assert.deepEqual({x:sim.player.x,y:sim.player.y},before);assert.equal(sim.events.filter(e=>e.type==='discovery').length,0);
  approach(sim);assert.equal(validStory(state(sim)),true);
 }
 const sim=scene();approach(sim);storyAction(sim,'crevice-enter');tick(sim,1);storyPointer(sim,20,20);assert.equal(storyPlayer(sim,1/60),false);assert.equal(state(sim).entered,false);
});

test('pause and offscreen visits freeze every held phase without unseen lock or completion',()=>{
 const sim=scene();approach(sim);storyAction(sim,'crevice-enter');tick(sim,1);
 for(const pause of ['paused','offscreen']){
  const before=clone(state(sim)),player={x:sim.player.x,y:sim.player.y};if(pause==='paused')sim.paused=true;else sim.current=5;
  tick(sim,20);assert.deepEqual(state(sim),before);assert.deepEqual({x:sim.player.x,y:sim.player.y},player);assert.equal(sim.events.filter(e=>e.type==='discovery').length,0);sim.paused=false;sim.current=4;
 }
 tick(sim,5);storyAction(sim,'crevice-lock');tick(sim,.2);sim.paused=true;const locking=clone(state(sim));tick(sim,10);assert.deepEqual(state(sim),locking);sim.paused=false;tick(sim,1);storyAction(sim,'crevice-release');tick(sim,.15);sim.current=5;const releasing=clone(state(sim));tick(sim,10);assert.deepEqual(state(sim),releasing);sim.current=4;tick(sim,6);assert.equal(state(sim).completed,true);
});

test('all persisted phases resume against the same actual actor pose without duplicating discovery',()=>{
 const sim=scene(),snapshots=[];
 const snapshot=()=>{assert.equal(validStory(state(sim)),true);snapshots.push({state:clone(state(sim)),player:{...sim.player,crevicePose:undefined}});};
 snapshot();approach(sim);snapshot();storyAction(sim,'crevice-enter');tick(sim,1);snapshot();tick(sim,4);snapshot();storyAction(sim,'crevice-lock');tick(sim,.2);snapshot();tick(sim,1);snapshot();storyAction(sim,'crevice-release');tick(sim,.2);snapshot();tick(sim,.4);snapshot();tick(sim,5);snapshot();
 assert.deepEqual(snapshots.map(s=>s.state.stage),['choose','approach','entering','inside','locking','locked','releasing','exiting','complete']);
 for(const saved of snapshots){const restored=scene();restored.player={...saved.player};restored.reefStories.crevice=clone(saved.state);initStory(restored);assert.deepEqual(state(restored),saved.state);assert.equal(validStory(state(restored)),true);if(saved.state.stage==='locked'){assert.equal(storySafety(restored)?.holdNeeds,true);storyAction(restored,'crevice-release');tick(restored,6);assert.equal(restored.events.filter(e=>e.type==='discovery').length,1);}if(saved.state.completed){tick(restored,20);assert.equal(restored.events.filter(e=>e.type==='discovery').length,0);}}
});

test('forged and contradictory saves are rejected, actual misplaced loads release safely',()=>{
 const sim=scene();lock(sim);const saved=clone(state(sim));
 const cases=[{spine:2},{depth:-.1},{stage:'unknown'},{actor:{...saved.actor,species:'s1'}},{completed:true},{depth:.4},{spine:0},{entered:false},{lockedOnce:false},{crevice:0},{crevice:4},{extra:{unbounded:true}}];
 for(const patch of cases)assert.equal(validStory({...saved,...patch}),false,JSON.stringify(patch));
 for(const patch of [{x:700,y:100},{angle:Math.PI},{incarnation:1}]){const restored=scene();restored.reefStories.crevice=clone(saved);Object.assign(restored.player,crevicePosition(CREVICES[1],1),{angle:CREVICES[1].angle},patch);initStory(restored);assert.equal(state(restored).stage,'choose');assert.equal(restored.player.triggerfishSpine,0);assert.equal(storySafety(restored),null);assert.equal(storyPlayer(restored,1/60),false);}
 const reincarnated=scene();reincarnated.reefStories.crevice=clone(saved);reincarnated.player.incarnation=1;initStory(reincarnated);storyAction(reincarnated,'crevice-choose',1);assert.equal(state(reincarnated).stage,'approach');assert.equal(state(reincarnated).actor.incarnation,1);
});

test('invalid species and inactive stories cannot own movement; accepted cavities keep their owner',()=>{
 const wrong=scene();wrong.player.species=SPECIES[1];assert.equal(initStory(wrong),false);assert.equal(storyAction(wrong,'crevice-choose',1),false);assert.equal(storyPlayer(wrong,.05),false);assert.equal(storySafety(wrong),null);
 const sim=scene();lock(sim);sim.player.species=SPECIES[1];sim.paused=true;tickStory(sim);assert.equal(state(sim).stage,'choose');assert.equal(sim.player.crevicePose,null);
 const inactive=scene();lock(inactive);inactive.reefStories.active=null;tickStory(inactive);assert.equal(inactive.player.triggerfishSpine,0);assert.equal(storyPlayer(inactive,.05),false);
 const occupied=scene();enter(occupied);occupied.sections[4].entities.push({id:17,alive:true,species:SPECIES[1],...crevicePosition(CREVICES[1],1)});storyAction(occupied,'crevice-lock');assert.equal(state(occupied).stage,'locking');assert.ok(occupied.player.crevicePose);assert.equal(storySafety(occupied)?.holdNeeds,true);assert.equal(occupied.events.filter(e=>e.type==='discovery').length,0);
 // Restore retains accepted cavity ownership despite that same traffic; its
 // actual body pose and identity must still match the saved phase.
 assert.equal(validStoryPlayer(occupied),true);
 const restored=scene();restored.player={...occupied.player};restored.sections=clone(occupied.sections);restored.reefStories.crevice=clone(state(occupied));initStory(restored);assert.deepEqual(state(restored),state(occupied));
});

test('corrected painted hinge stays authoritative while the tip reaches the same upper edge',()=>{
 const sim=scene();lock(sim);const p=sim.player,pose=crevicePose(sim),axis=CREVICES[1].angle;
 assert.equal(pose.width,100);assert.ok(Math.abs(pose.height-100*219/355)<1e-9);
 const dx=pose.spineRoot.x-p.x,dy=pose.spineRoot.y-p.y;
 assert.ok(Math.abs(dx*Math.cos(axis)+dy*Math.sin(axis)-pose.width*.197)<1e-9);
 assert.ok(Math.abs(-dx*Math.sin(axis)+dy*Math.cos(axis)+pose.height*.244)<1e-9);
 assert.ok(Math.hypot(pose.spineTip.x-pose.upperEdge.x,pose.spineTip.y-pose.upperEdge.y)<1e-9);
 storyAction(sim,'crevice-release');tick(sim,.6);const folded=crevicePose(sim),fx=folded.spineTip.x-p.x,fy=folded.spineTip.y-p.y;
 assert.equal(folded.spine,0);assert.ok(Math.abs(fx*Math.cos(axis)+fy*Math.sin(axis)+5)<1e-9);assert.ok(Math.abs(-fx*Math.sin(axis)+fy*Math.cos(axis)+14.5)<1e-9);
});

test('restore hook rejects spoofed held poses and identities without mutating their save',()=>{
 const sim=scene();lock(sim);assert.equal(validStoryPlayer(sim),true);
 for(const patch of [{x:sim.player.x+50},{x:sim.player.x+.2},{x:NaN},{angle:NaN},{angle:sim.player.angle+.01},{angle:Math.PI},{incarnation:1},{species:SPECIES[1]}]){
  const restored=scene();restored.reefStories.crevice=clone(state(sim));restored.player={...sim.player,...patch};
  const before=clone(state(restored)),position={x:restored.player.x,y:restored.player.y};assert.equal(validStoryPlayer(restored),false);assert.deepEqual(state(restored),before);assert.deepEqual({x:restored.player.x,y:restored.player.y},position);assert.equal(storySafety(restored),null);
 }
 const offscreen=scene();offscreen.reefStories.crevice=clone(state(sim));offscreen.current=5;assert.equal(validStoryPlayer(offscreen),true);assert.equal(storySafety(offscreen),null);
});

test('entrance tolerance eases physically to exact body and roof contact without snapping',()=>{
 const sim=scene();approach(sim);const entrance=crevicePosition(CREVICES[1],0),axis=CREVICES[1].angle;
 Object.assign(sim.player,{x:entrance.x-1.4*Math.cos(axis),y:entrance.y-1.4*Math.sin(axis)});
 assert.equal(creviceFit(sim).fits,true);storyAction(sim,'crevice-enter');
 const before={x:sim.player.x,y:sim.player.y};storyPlayer(sim,1/60);assert.ok(Math.hypot(sim.player.x-before.x,sim.player.y-before.y)<=32/60+1e-9);
 tick(sim,5);assert.equal(state(sim).stage,'inside');assert.deepEqual({x:sim.player.x,y:sim.player.y},crevicePosition(CREVICES[1],1));
 storyAction(sim,'crevice-lock');tick(sim,1);const pose=crevicePose(sim);assert.ok(Math.hypot(pose.spineTip.x-pose.upperEdge.x,pose.spineTip.y-pose.upperEdge.y)<1e-9);
});

test('ordinary swimmer turns at the claimed cavity without teleporting, consuming or changing identity and needs',()=>{
 const sim=scene();lock(sim);const site=CREVICES[1],at=crevicePosition(site,.2);
 const npc={id:17,incarnation:2,species:SPECIES[3],alive:true,health:82,energy:41,target:90,x:at.x,y:at.y,angle:site.angle};
 sim.sections[4].entities.push(npc);const before=clone(npc);assert.equal(storyNPC(sim,npc,1/60),true);
 assert.ok(Math.hypot(npc.x-before.x,npc.y-before.y)<=npc.species.speed*.45/60+1e-9);
 for(const field of ['id','incarnation','health','energy','target'])assert.equal(npc[field],before[field]);
 assert.equal(sim.sections[4].entities.length,1);assert.equal(state(sim).stage,'locked');assert.ok(crevicePose(sim));
 sim.paused=true;const frozen=clone(npc);assert.equal(storyNPC(sim,npc,1/60),false);assert.deepEqual(npc,frozen);
 sim.paused=false;stopStory(sim);assert.equal(storyNPC(sim,npc,1/60),false);
});

test('live seeded reef traffic cannot cancel an accepted sequence or detach exact roof contact',()=>{
 // Seed49's real gramma crosses the entrance during easing in the old policy.
 const sim=new Simulation(49);sim.start('practice','s24',null,{adventureKey:'crevice'});beginStory(sim,'crevice');dispatchAction(sim,'crevice-choose',1);
 for(let i=0;i<1200&&!creviceFit(sim).fits;i++)sim.step(1/60);
 assert.equal(creviceFit(sim).fits,true);dispatchAction(sim,'crevice-enter');
 const population=sim.sections.map(s=>s.entities.length);let locked=false,held=0,released=false;
 for(let i=0;i<1800&&state(sim).stage!=='complete';i++){
  sim.step(1/60);assert.notEqual(state(sim).stage,'choose');assert.equal(validStoryPlayer(sim),true);
  if(state(sim).stage==='inside')dispatchAction(sim,'crevice-lock');
  if(state(sim).stage==='locked'){
   locked=true;held++;const pose=crevicePose(sim);assert.ok(Math.hypot(pose.spineTip.x-pose.upperEdge.x,pose.spineTip.y-pose.upperEdge.y)<1e-9);
   if(held===300){dispatchAction(sim,'crevice-release');released=true;}
  }
 }
 assert.equal(locked,true);assert.equal(released,true);assert.equal(state(sim).stage,'complete');assert.deepEqual(sim.sections.map(s=>s.entities.length),population);
 assert.equal(sim.events.filter(e=>e.type==='discovery'&&e.value==='triggerfish-crevice').length,1);
});
