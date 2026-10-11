import test from 'node:test';
import assert from 'node:assert/strict';
import {SPECIES} from '../src/data.js';
import {poseFor,appearanceFor,drawStory,loadLookoutArt,LOOKOUT_RABBITFISH_ASSET} from '../src/rabbitfish-lookout-render.js';
import {PART_RIGS,partTransform,bodyPoint} from '../src/part-motion.js';
import {mouthPoint,displayedMouthPoint} from '../src/feeding-contact.js';
import {creatureFrame} from '../src/geometry.js';
import {rigFor} from '../src/animal-rigs.js';
import {readFile} from 'node:fs/promises';
import {ReefRenderer} from '../src/render.js';
import {SPRITE_DIMENSIONS} from '../src/sprite-metrics.js';

function fixture(index=8){
 const species=SPECIES[index],player={id:'player',species,alive:true,health:80,x:240,y:370,facing:1};
 const buddy={id:91,incarnation:3,species,alive:true,health:80,x:190,y:460,facing:-1};
 const passer={id:20,incarnation:4,species:SPECIES[0],alive:true,health:80,x:270,y:350,facing:1};
 const story={reef:0,site:'crest-open',phase:'signal',role:'player',aim:-Math.PI/2,cueClicked:true,buddy:{reef:0,id:91,incarnation:3,species:species.id},passer:{reef:0,id:20,incarnation:4,species:'s0'},status:null};
 const sim={current:0,player,section:{entities:[buddy,passer]},reefStories:{active:'lookout',lookout:story}};
 return {sim,story,player,buddy,passer,renderer:{reducedMotion:false}};
}
test('both rabbitfish have upright lookout and lower level grazing on the real ledge',()=>{
 for(const index of [8,52]){
  const {sim,story,player,buddy,renderer}=fixture(index);
  const watch=poseFor(renderer,sim,player,2),graze=poseFor(renderer,sim,buddy,2);
  assert.equal(watch.role,'watch');assert.ok(watch.rotation<-1);assert.equal(watch.feed,0);
  assert.equal(graze.rotation,0);assert.equal(graze.role,'graze');assert.ok(buddy.y>player.y);
  player.facing=-1;assert.ok(poseFor(renderer,sim,player,2).rotation>1,'facing-left head still points up');
  story.role='partner';story.phase='swap';buddy.y=445;
  const rising=poseFor(renderer,sim,buddy,2);buddy.x=240;buddy.y=370;
  const arrived=poseFor(renderer,sim,buddy,2);assert.ok(arrived.rise>rising.rise);assert.ok(arrived.rotation>1);
  story.phase='player-feed';assert.equal(poseFor(renderer,sim,player,2).rotation,0);
 }
});
test('a real committed graze retains exact authoritative mouth geometry',()=>{
 for(const index of [8,52]){
  const {sim,story,player,buddy,renderer}=fixture(index);
  for(const fish of [player,buddy]){
   story.role=fish===player?'partner':'player';story.phase=fish===player?'player-feed':'partner-feed';
   fish.feeding={elapsed:.1,delay:.3,committed:true};
   const p=poseFor(renderer,sim,fish,1.8);assert.equal(p.rotation,0);
   assert.deepEqual(displayedMouthPoint(fish,creatureFrame(fish,undefined,p.rotation)),mouthPoint(fish));
   const [ex,ey]=rigFor({id:fish.species.id}).eye;
   assert.deepEqual(bodyPoint(fish.species.id,ex,ey,2,.8,{turn:1}),{x:ex,y:ey});
  }
 }
});
test('painted pectoral signal changes independently while its two hinge contacts remain fixed',()=>{
 for(const index of [8,52]){
  const {sim,player,renderer}=fixture(index),id=player.species.id,part=PART_RIGS[id].parts.find(p=>p.name==='pectoral');
  const sample=t=>{const p=poseFor(renderer,sim,player,t);return partTransform(id,part,360,230,p.finClock,.8,{brake:.06,turn:p.turn});};
  const a=sample(.06),b=sample(.22);assert.notDeepEqual(a.matrix,b.matrix);
  for(const m of [a,b])for(const [hx,hy] of part.hinge){
   const dx=hx*360-m.ax,dy=hy*230-m.ay;
   assert.ok(Math.hypot(m.matrix[0]*dx+m.matrix[2]*dy+m.matrix[4]-hx*360,m.matrix[1]*dx+m.matrix[3]*dy+m.matrix[5]-hy*230)<1e-8);
  }
 }
});
test('missing, replaced and unrelated actors never acquire a lookout role',()=>{
 const {sim,story,player,buddy,passer,renderer}=fixture();
 assert.equal(poseFor(renderer,sim,passer,1),null);
 for(const patch of [{incarnation:4},{alive:false},{hidden:true},{health:0},{stun:1},{cleanTime:1},{activity:'avoiding'}]){
  const original={...buddy};Object.assign(buddy,patch);assert.equal(poseFor(renderer,sim,player,1),null);Object.assign(buddy,original);
 }
 sim.current=1;assert.equal(poseFor(renderer,sim,player,1),null);sim.current=0;
 sim.reefStories.active='artist';assert.equal(poseFor(renderer,sim,player,1),null);sim.reefStories.active='lookout';
 story.phase='unavailable';assert.equal(poseFor(renderer,sim,player,1),null);
});
test('reduced motion preserves gaze, roles and signal without decoration clocks or story mutation',()=>{
 const {sim,player,renderer}=fixture();renderer.reducedMotion=true;
 const calls=[],ctx=new Proxy({}, {get:(o,k)=>o[k]??((...args)=>calls.push([k,...args])),set:(o,k,v)=>(o[k]=v,true)});
 renderer.ctx=ctx;renderer.uiUnit=1;renderer.tag=(...args)=>calls.push(['tag',...args.slice(1)]);
 const before=JSON.stringify(sim),a=poseFor(renderer,sim,player,0);
 assert.deepEqual(poseFor(renderer,sim,player,100),a);assert.ok(a.signal&&a.rotation<-1);
 drawStory(renderer,sim,0);const first=calls.splice(0);drawStory(renderer,sim,100);assert.deepEqual(calls,first);
 assert.equal(calls.filter(c=>c[0]==='save').length,calls.filter(c=>c[0]==='restore').length);
 assert.equal(JSON.stringify(sim),before);
 const frame=appearanceFor(renderer,sim,player,100);assert.equal(frame.physical,true);assert.equal(frame.rotation,a.rotation);
});
test('corrected doliatus is a bundled alpha PNG with an explicit provenance record',async()=>{
 const bytes=await readFile(new URL('../'+LOOKOUT_RABBITFISH_ASSET,import.meta.url));
 assert.equal(bytes.subarray(1,4).toString(),'PNG');assert.equal(bytes[25],6,'RGBA source, rather than an opaque backdrop');
 const provenance=await readFile(new URL('../assets/story-lookout/PROVENANCE.md',import.meta.url),'utf8');
 assert.match(provenance,/Siganus doliatus/);assert.match(provenance,/built-in ImageGen/);assert.match(provenance,/Final prompt/);
});
test('awaited correction replaces catalog portraits once as well as global world appearance',async()=>{
 const OriginalImage=globalThis.Image,corrected={width:1737,height:830};let loads=0;
 globalThis.Image=class{set src(path){assert.equal(path,LOOKOUT_RABBITFISH_ASSET);loads++;queueMicrotask(()=>this.onload());}};
 try{
  const renderer={sprites:[],bounds:[],extractCell:()=>corrected};
  const first=loadLookoutArt(renderer);assert.equal(loadLookoutArt(renderer),first);await first;
  assert.equal(loads,1);assert.equal(renderer.sprites[52],corrected);assert.equal(renderer.bounds[52].w,1737);
  const {sim,buddy}=fixture(52);sim.reefStories.active='';
  assert.equal(appearanceFor(renderer,sim,buddy,4).sprite,corrected);
 }finally{if(OriginalImage===undefined)delete globalThis.Image;else globalThis.Image=OriginalImage;}
});

test('the integrated renderer preserves exact watcher and committed grazer frames through turns and reduced motion',()=>{
 for(const index of [8,52])for(const reducedMotion of [false,true]){
  const {sim,story,player,buddy}=fixture(index),paint=[];
  const ctx=new Proxy({}, {get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
  const renderer=Object.assign(Object.create(ReefRenderer.prototype),{ctx,currentSimulation:sim,reducedMotion,poses:new Map(),sprites:[],bounds:[],canvas:{width:1600,height:900}});
  renderer.drawSprite=(...args)=>paint.push(args);
  for(const facing of [1,-1]){
   player.facing=facing;story.phase='partner-feed';story.role='player';buddy.feeding={elapsed:.1,delay:.3,committed:true};
   for(const fish of [player,buddy]){
    renderer.drawCreature(ctx,fish,2,1/60);
    const frame=renderer.poses.get(fish.id).frame,expected=poseFor(renderer,sim,fish,2);
    assert.equal(frame.x,fish.x);assert.equal(frame.y,fish.y);assert.equal(frame.facing,fish.facing);
    assert.equal(frame.rotation,expected.rotation);assert.ok(frame.width>0);
    if(fish===buddy)assert.deepEqual(displayedMouthPoint(fish,frame),mouthPoint(fish));
   }
  }
  assert.equal(paint.length,4);
 }
 assert.deepEqual(SPRITE_DIMENSIONS[52],[1737,830]);
 assert.deepEqual(rigFor(SPECIES[52]).mouth,[.998,.548]);
});

test('the integrated sprite override keeps its native aspect and skips duplicate articulation',()=>{
 const draws=[],ctx=new Proxy({drawImage:(...args)=>draws.push(args)}, {get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 const renderer=Object.assign(Object.create(ReefRenderer.prototype),{reducedMotion:false,bounds:[],sprites:[],canvas:{width:1600,height:900},parts:{draw(){assert.fail('A precomposed painting must not be articulated twice');}}});
 renderer.bounds[52]={x:0,y:0,w:353,h:222};renderer.sprites[52]={width:353,height:222};
 const painting={width:1737,height:830};
 renderer.drawSprite(ctx,SPECIES[52],0,0,120,-1,3,1,.5,null,{sprite:painting,articulated:true});
 assert.equal(draws[0][0],painting);assert.equal(draws[0][8],120*830/1737);
 renderer.drawSprite(ctx,SPECIES[52],0,0,120,1,3,1,.5,null,{sprite:painting,lantern:true,heightRatio:.62});
 assert.equal(draws[1][8],120*.62);
});
