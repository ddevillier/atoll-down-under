import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {SPECIES} from '../src/data.js';
import {beginStory,storyAction as dispatchStoryAction} from '../src/reef-stories.js';
import {detectiveSandFood,detectiveBuriedCandidates} from '../src/detective-substrate.js';
import {feedingApproach} from '../src/feeding-contact.js';
import {tickSandProbe} from '../src/sand-search.js';
import {initStory,tickStory,storyAction,storyMeal,storyNPC,storyView,validStory,storyCue,storyFoodHidden,storyFoodReserved} from '../src/whisker-detective.js';

function scene(seed=42,reef=7){const sim=new Simulation(seed);sim.start('practice','s9');sim.current=reef;sim.section.entities=[];sim.reefStories={version:1,active:'detective',clinic:null,artist:null,engineer:null,detective:null,nursery:null};assert.equal(initStory(sim),true);sim.events=[];return sim;}
const story=sim=>sim.reefStories.detective;
const food=(sim,index=0)=>sim.section.food.find(f=>f.id===story(sim).patches[index].id);
function position(actor,target){const dock=feedingApproach(actor,target);Object.assign(actor,{x:dock.x,y:dock.y,angle:dock.facing>0?0:Math.PI,facing:dock.facing});}
function reveal(sim,index=0){const f=food(sim,index);position(sim.player,f);assert.equal(storyAction(sim,'context'),true);for(let i=0;i<100;i++){tickSandProbe(sim,1/60);tickStory(sim,1/60);}assert.equal(story(sim).patches[index].found,true);return f;}
function neighbor(sim,f,x=f.x+200){const e={...structuredClone(sim.player),species:SPECIES[10],id:900,incarnation:0,x,y:f.y,angle:Math.PI,facing:-1,sandProbe:null,target:null,feeding:null,satiated:0,rest:0,cleanTime:0,stun:0,actionTime:0,biteCooldown:0,alive:true,hidden:false};sim.section.entities=[e];return e;}

 test('seeded unmarked existing meals are concealed; habitat/species restrictions hold',()=>{
 const a=scene(42),b=scene(42),c=scene(43),count=a.section.food.length;
 assert.deepEqual(story(a),story(b));assert.notDeepEqual(story(a).patches,story(c).patches);
 const marked=new Set(a.section.food.filter(f=>['worm','shrimp'].includes(f.food)).slice(0,2).map(f=>f.id));
 for(const p of story(a).patches){assert.ok(!marked.has(p.id));const f=food(a,story(a).patches.indexOf(p));assert.equal(f.x,p.x);assert.equal(f.y,p.y);assert.equal(storyFoodHidden(a,f),true);}
 const checkpoint=JSON.stringify(story(a)),seedBefore=a.seed;assert.equal(initStory(a),true);assert.equal(JSON.stringify(story(a)),checkpoint);assert.equal(a.seed,seedBefore);assert.equal(a.section.food.length,count);assert.equal(a.section.entities.length,0);assert.equal(validStory(story(a)),true);
 const meadow=scene(42,6);assert.equal(story(meadow).reef,6);
 a.current=4;assert.equal(initStory(a),true);a.reefStories.detective=null;assert.equal(initStory(a),false);a.current=7;a.player.species=SPECIES[10];assert.equal(initStory(a),false);
});

test('barbel detection is genuinely local and strengthens with distance without exposing a distant position',()=>{
 const sim=scene(),f=food(sim);sim.player.x=1500;sim.player.y=40;
 let cue=storyCue(sim);assert.equal(cue.strength,0);assert.equal(cue.dx,0);assert.equal(cue.dy,0);assert.equal(cue.found,null);assert.match(storyView(sim).detail,/No nearby taste/);assert.equal(storyView(sim).step,'Explore the sand');
 const dock=feedingApproach(sim.player,f);sim.player.x=dock.x-160;sim.player.y=dock.y;sim.player.facing=dock.facing;let faint=storyCue(sim).strength;assert.equal(storyView(sim).step,'Your barbels feel a trace');
 position(sim.player,f);cue=storyCue(sim);assert.ok(cue.strength>faint);assert.equal(cue.contact,true);assert.equal(cue.found,null);assert.equal(storyView(sim).step,'Sweep the sand with E');
 const nearDock=feedingApproach(sim.player,f);sim.player.x=nearDock.x-nearDock.facing*66;sim.player.y=nearDock.y;assert.equal(storyView(sim).step,'A strong trace nearby');position(sim.player,f);storyAction(sim,'context');assert.equal(storyView(sim).step,'Probing beneath your barbels');storyAction(sim,'context');
 sim.player.x=1500;sim.player.y=40;storyAction(sim,'context');assert.ok(sim.player.sandProbe==null);assert.equal(f.uncovered,undefined);assert.equal(story(sim).stage,'search');
});

test('real contact probe reveals a meal without consuming it; interrupting cannot grant a discovery',()=>{
 const sim=scene(),f=food(sim),amount=f.amount;position(sim.player,f);storyAction(sim,'context');
 for(let i=0;i<30;i++){tickSandProbe(sim,1/60);tickStory(sim,1/60);}assert.ok(sim.player.sandProbe);assert.equal(story(sim).patches[0].found,false);assert.equal(storyFoodHidden(sim,f),true);
 sim.point(1200,100);tickStory(sim,1/60);assert.equal(story(sim).probe,null);assert.equal(f.amount,amount);assert.equal(story(sim).complete,false);
 reveal(sim);assert.equal(f.amount,amount);assert.equal(storyFoodHidden(sim,f),false);assert.equal(f.sandSource,sim.player.id);assert.ok(f.uncovered>0);assert.ok(storyCue(sim).found);assert.equal(story(sim).stage,'choice');
});

test('the eat choice uses actual consumption and keeps a real remainder to share',()=>{
 const sim=scene(),f=reveal(sim),amount=f.amount;storyAction(sim,'eat');assert.equal(sim.player.target,f.id);assert.equal(f.amount,amount);assert.equal(story(sim).complete,false);
 sim.consume(f);storyMeal(sim,f);assert.equal(f.amount,amount-35);assert.equal(story(sim).patches[0].choice,'ate');assert.equal(story(sim).complete,false);assert.ok(storyView(sim).actions.some(a=>a.id==='leave'));
});

test('sharing needs an available existing neighbor to make an anatomical contact bite while watched',()=>{
 const sim=scene(),f=reveal(sim),amount=f.amount,e=neighbor(sim,f),count=sim.section.entities.length;assert.equal(storyFoodReserved(sim,f,e),true);assert.equal(storyFoodReserved(sim,f,sim.player),false);storyAction(sim,'leave');assert.equal(story(sim).stage,'watch');
 for(let i=0;i<600;i++)tickStory(sim,1/60);assert.equal(story(sim).complete,false);assert.equal(f.amount,amount);assert.equal(e.x,f.x+200);
 assert.equal(storyFoodReserved(sim,f,e),false);assert.equal(storyFoodReserved(sim,f,{...e,id:901}),true);const before=e.x;storyNPC(sim,e,1/60);assert.notEqual(e.x,before);assert.equal(f.amount,amount);assert.equal(story(sim).complete,false);
 position(e,f);for(let i=0;i<60&&!story(sim).complete;i++)storyNPC(sim,e,1/60);
 assert.equal(f.amount,amount-12);assert.ok(e.satiated>=45);assert.equal(story(sim).complete,true);assert.equal(story(sim).witnessed,true);assert.equal(storyFoodHidden(sim,food(sim,1)),true);assert.equal(sim.section.entities.length,count);assert.ok(story(sim).shareReveal>0);assert.equal(validStory(story(sim)),true);
 for(let i=0;i<200;i++){tickStory(sim,1/60);storyNPC(sim,e,1/60);}assert.equal(sim.events.filter(e=>e.type==='discovery'&&e.value==='whisker-detective').length,1);assert.equal(story(sim).shareReveal,0);
});

test('busy or absent visitors and unwitnessed bites cannot complete the story',()=>{
 const sim=scene(),f=reveal(sim),e=neighbor(sim,f);e.satiated=20;e.cleanTime=1;storyAction(sim,'leave');assert.equal(story(sim).neighbor,null);assert.match(storyView(sim).detail,/busy/);
 tickStory(sim,1/60);assert.equal(story(sim).neighbor,null);e.cleanTime=0;tickStory(sim,1/60);assert.equal(story(sim).neighbor.id,e.id);
 position(e,f);sim.player.x=1500;sim.player.y=40;for(let i=0;i<60;i++)storyNPC(sim,e,1/60);assert.equal(f.amount,88);assert.equal(story(sim).complete,false);assert.equal(story(sim).stage,'choice');
});

test('bounded checkpoint state allows migration null, rejects corrupt progress, and pauses timers',()=>{
 const sim=scene(),f=reveal(sim);assert.equal(validStory(null),true);assert.equal(validStory(undefined),true);assert.equal(validStory(story(sim)),true);
 for(const change of [{cue:2},{reef:4},{current:9},{stage:'complete',complete:true,witnessed:false},{reveal:Infinity},{neighbor:{id:900,incarnation:-1}},{patches:[]}])assert.equal(validStory({...structuredClone(story(sim)),...change}),false);
 const bad=structuredClone(story(sim));bad.patches[0].x=-1;assert.equal(validStory(bad),false);
 sim.paused=true;const before=JSON.stringify(story(sim));tickStory(sim,5);assert.equal(JSON.stringify(story(sim)),before);sim.paused=false;
 const checkpoint=structuredClone(story(sim));const restored=scene();restored.reefStories.detective=checkpoint;assert.equal(validStory(restored.reefStories.detective),true);
 sim.current=6;tickStory(sim,1/60);assert.equal(story(sim).cue,0);assert.equal(storyFoodHidden(sim,f),false);assert.match(storyView(sim).detail,/Pearl Sands/);
});



test('simulation checkpoints resume local probing deterministically and reject damaged detective saves',()=>{
 const sim=scene(),f=food(sim);position(sim.player,f);storyAction(sim,'context');for(let i=0;i<25;i++)sim.step(1/60);
 const restored=Simulation.restore(sim.serialize());assert.equal(restored.paused,true);const paused=restored.serialize();restored.step(5);assert.equal(restored.serialize(),paused);restored.paused=false;
 for(let i=0;i<125;i++){sim.step(1/60);restored.step(1/60);}assert.equal(restored.serialize(),sim.serialize());assert.equal(story(sim).patches[0].found,true);
 const bad=JSON.parse(sim.serialize());bad.reefStories.detective.current=3;assert.throws(()=>Simulation.restore(bad),/adventure/);
 const legacy=JSON.parse(sim.serialize());delete legacy.reefStories;const migrated=Simulation.restore(legacy);assert.equal(migrated.reefStories.active,null);assert.equal(migrated.reefStories.detective,null);
});






test('authored sand eligibility rejects coral-covered and resident-relocated meals without moving them',()=>{
 const meal=(food,x,y)=>({id:'sand-check',kind:'food',food,x,y,amount:100,regrow:0});
 for(const [x,y] of [[430,445],[620,600],[680,400]])assert.equal(detectiveSandFood(7,meal('worm',x,y))||detectiveSandFood(7,meal('shrimp',x,y)),true);
 for(const f of [meal('worm',670,250),meal('worm',250,680),meal('shrimp',1100,665),meal('shrimp',980,380),meal('shrimp',555.811,567.664)])assert.equal(detectiveSandFood(7,f),false);
 for(const f of [meal('worm',1000,330),meal('worm',520,670),meal('shrimp',900,245),meal('shrimp',220,580)])assert.equal(detectiveSandFood(6,f),true);
 const sim=new Simulation(42);sim.start('practice','s9');for(const reef of [6,7]){const section=sim.sections[reef],positions=section.food.map(f=>[f.id,f.x,f.y]),candidates=detectiveBuriedCandidates(section,reef),neighbor=section.entities[0];assert.ok(candidates.length>=2);assert.ok(candidates.some(f=>Math.hypot(neighbor.x-f.x,neighbor.y-f.y)<150));assert.deepEqual(section.food.map(f=>[f.id,f.x,f.y]),positions);}
});

test('natural sandy worlds share an actual discovered meal across nine seeds in both habitats',()=>{
 for(const reef of [7,6])for(const seed of [1,2,3,4,5,17,41,73,123456]){
  const sim=new Simulation(seed);sim.start('practice','s9');if(reef===6)sim.transition(-1,0);
  const roster=sim.section.entities.map(e=>e.id),coordinates=sim.section.food.map(f=>[f.id,f.x,f.y]);assert.equal(beginStory(sim),true);
  const s=story(sim),patch=s.patches[0],f=sim.section.food.find(f=>f.id===patch.id),dock=feedingApproach(sim.player,f);assert.ok(s.patches.every(p=>detectiveSandFood(reef,sim.section.food.find(f=>f.id===p.id))));
  sim.point(dock.x,dock.y);for(let i=0;i<3600&&Math.hypot(sim.player.x-dock.x,sim.player.y-dock.y)>=12;i++)sim.step(1/60);
  assert.equal(sim.useContext(),true);for(let i=0;i<1800&&!patch.found;i++)sim.step(1/60);assert.equal(patch.found,true,`reef ${reef}, seed ${seed}: actual probe`);assert.equal(f.amount,100);
  dispatchStoryAction(sim,'leave');let shareSeconds=0;for(let i=0;i<2400&&!s.complete;i++){sim.step(1/60);shareSeconds+=1/60;}assert.ok(shareSeconds<40,`reef ${reef}, seed ${seed}: invitation took ${shareSeconds}s`);
  assert.equal(s.complete,true,`reef ${reef}, seed ${seed}: actual share`);assert.equal(f.amount,88);assert.equal(s.witnessed,true);assert.deepEqual(sim.section.entities.map(e=>e.id),roster);assert.deepEqual(sim.section.food.map(f=>[f.id,f.x,f.y]),coordinates);
 }
});

test('a Leave invitation lets a distant hungry existing forager swim to the real meal',()=>{
 const sim=scene(),f=reveal(sim),e=neighbor(sim,f,f.x+500),startX=e.x;storyAction(sim,'leave');assert.equal(story(sim).neighbor.id,e.id);assert.equal(e.x,startX);assert.equal(f.amount,100);assert.equal(story(sim).complete,false);
 for(let i=0;i<1200&&!story(sim).complete;i++){storyNPC(sim,e,1/60);tickStory(sim,1/60);}assert.equal(story(sim).complete,true);assert.equal(f.amount,88);assert.ok(Math.abs(e.x-startX)>300);
});

test('a recently fed neighbor accepts a real snack without losing its appetite or rest timers',()=>{
 const sim=scene(),f=reveal(sim),e=neighbor(sim,f);e.satiated=80;e.rest=4;const origin={x:e.x,y:e.y},count=sim.section.entities.length;
 assert.equal(dispatchStoryAction(sim,'leave'),true);assert.equal(story(sim).neighbor.id,e.id);assert.equal(e.satiated,80);assert.equal(e.rest,4);assert.deepEqual({x:e.x,y:e.y},origin);assert.equal(f.amount,100);
 let elapsed=0;while(!story(sim).complete&&elapsed<20){sim.step(1/60);elapsed+=1/60;}
 assert.equal(story(sim).complete,true);assert.ok(elapsed<20);assert.equal(f.amount,88);assert.equal(sim.section.entities.length,count);assert.ok(Math.abs(e.satiated-Math.max(80-elapsed,45))<1e-8);assert.ok(Math.abs(e.rest-Math.max(4-elapsed,0))<1e-8);
});

test('snack invitations do not interrupt care, threats or another committed meal',()=>{
 const sim=scene(),f=reveal(sim),e=neighbor(sim,f),baseline=structuredClone(e);
 for(const busy of [{cleanTime:1},{cleanerTarget:123},{stun:1},{health:30},{behavior:'Moving away from a hunter'},{target:'other',feeding:{target:'other',committed:true}},{target:null,feeding:{target:'other',committed:true}},{target:'other'},{groundRoute:{}},{holdfast:{}},{alive:false},{hidden:true}]){
  Object.assign(e,structuredClone(baseline),{satiated:80,rest:8,groundRoute:null,holdfast:null,cleanerTarget:null},busy);story(sim).stage='choice';story(sim).neighbor=null;const before={x:e.x,y:e.y,target:e.target,feeding:structuredClone(e.feeding)};
  assert.equal(storyAction(sim,'leave'),true);assert.equal(story(sim).neighbor,null);tickStory(sim,1/60);assert.equal(story(sim).neighbor,null);assert.equal(e.satiated,80);assert.equal(e.rest,8);assert.deepEqual({x:e.x,y:e.y,target:e.target,feeding:e.feeding},before);assert.equal(f.amount,100);assert.equal(story(sim).complete,false);
 }
});

test('a digesting snack approach pauses and restores without resetting digestion',()=>{
 const sim=scene(),f=reveal(sim),e=neighbor(sim,f);e.satiated=90;e.rest=12;dispatchStoryAction(sim,'leave');for(let i=0;i<60;i++)sim.step(1/60);assert.equal(story(sim).complete,false);
 const restored=Simulation.restore(sim.serialize()),frozen=restored.serialize();restored.step(10);assert.equal(restored.serialize(),frozen);restored.paused=false;
 for(let i=0;i<900&&!story(sim).complete;i++){sim.step(1/60);restored.step(1/60);}assert.equal(story(sim).complete,true);assert.equal(restored.serialize(),sim.serialize());assert.ok(e.satiated>70);
});
