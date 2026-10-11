import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {SPECIES} from '../src/data.js';
import {COLONY,initStory} from '../src/coral-housekeeper.js';
import {mouthPoint,displayedMouthPoint} from '../src/feeding-contact.js';
import {creatureFrame,setCreatureDisplayFrame} from '../src/geometry.js';
import {HOUSEKEEPER_ASSET,COLONY_PAINT,loadHousekeeperArt,sedimentPixel,drawStory,poseFor,appearanceFor,plumeParticles} from '../src/coral-housekeeper-render.js';

function scene(){
 const player={id:'player',species:SPECIES[30],x:500,y:320,facing:-1,angle:Math.PI,alive:true,health:90,energy:70};
 const sim={player,current:4,mode:'practice',phase:'playing',paused:false,reefStories:{active:'housekeeper'}};
 const story=initStory(sim);story.inspected=true;story.phase='clear';story.intent='clear';story.selected=0;story.direction='left';story.approach='contact';story.elapsed=.6;
 const mouth=mouthPoint(player);player.x+=COLONY.pockets[0].x-mouth.x;player.y+=COLONY.pockets[0].y-mouth.y;
 return {sim,story,player};
}
function recording(){
 const calls=[],values={};
 const ctx=new Proxy(values,{get:(target,key)=>target[key]??((...args)=>calls.push([key,...args])),set:(target,key,value)=>(target[key]=value,true)});
 return {renderer:{ctx,uiUnit:1,reducedMotion:false,extractCell:image=>image,tag:(...args)=>calls.push(['tag',...args])},calls};
}
async function withArt(renderer,fn){
 const oldImage=globalThis.Image,oldDocument=globalThis.document;let canvases=0;
 globalThis.Image=class{width=1400;height=1050;set src(value){this.path=value;queueMicrotask(()=>this.onload());}};
 globalThis.document={createElement(){
  canvases++;const canvas={width:0,height:0},ctx={drawImage(){},getImageData(){const data=new Uint8ClampedArray(canvas.width*canvas.height*4);for(let i=0;i<data.length;i+=4)data.set([170,105,85,255],i);return {data};},createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(value){canvas.pixels=value.data;}};
  canvas.getContext=()=>ctx;return canvas;
 }};
 try{await loadHousekeeperArt(renderer);await fn(()=>canvases);}
 finally{globalThis.Image=oldImage;globalThis.document=oldDocument;}
}

test('dedicated painted colony preserves alpha and covers both authored pocket contacts',async()=>{
 const {data,info}=await sharp(HOUSEKEEPER_ASSET).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert.ok(info.width>=1000&&info.height>=700,'detailed source painting ships in the project');
 let clear=0,opaque=0;for(let i=3;i<data.length;i+=4){if(data[i]===0)clear++;if(data[i]>220)opaque++;}
 assert.ok(clear>info.width*info.height*.12,'water outside colony remains transparent');
 assert.ok(opaque>info.width*info.height*.4,'real colony has a substantial painted silhouette');
 for(const p of COLONY.pockets){
  const x=Math.floor((p.x-COLONY_PAINT.x)/COLONY_PAINT.width*info.width),y=Math.floor((p.y-COLONY_PAINT.y)/COLONY_PAINT.height*info.height);
  assert.ok(data[(y*info.width+x)*4+3]>150,'mouth contact lands on actual coral artwork');
 }
});

test('dust is bounded by painted alpha; a clearing swath reveals existing surfaces',()=>{
 const p=COLONY.pockets[0];let initial=0,half=0,done=0;
 for(let y=p.y-30;y<=p.y+30;y++)for(let x=p.x-30;x<=p.x+30;x++){
  initial+=sedimentPixel([180,100,90,255],x,y,p,0)[3];half+=sedimentPixel([180,100,90,255],x,y,p,.5)[3];done+=sedimentPixel([180,100,90,255],x,y,p,1)[3];
 }
 assert.ok(initial>100000&&half>0&&half<initial*.7);assert.equal(done,0);
 assert.equal(sedimentPixel([180,100,90,0],p.x,p.y,p,0)[3],0);
 assert.equal(sedimentPixel([180,100,90,70],p.x,p.y,p,0)[3]<=70,true);
 assert.equal(sedimentPixel([180,100,90,255],p.x+40,p.y,p,0)[3],0);
});

test('clearing pose uses the actual fish; pause and reduced motion keep mouth/fin articulation',()=>{
 const {sim,player}=scene();
 const pose=poseFor(sim,player);assert.equal(pose.rotation,0);assert.equal(pose.facing,-1);assert.ok(pose.feed>0&&pose.effort>0&&pose.anchored);
 sim.paused=true;assert.deepEqual(poseFor(sim,player),pose);
 assert.deepEqual(appearanceFor({reducedMotion:true},sim,player,0),appearanceFor({reducedMotion:true},sim,player,400));
 assert.equal(poseFor(sim,{...player}),null,'an NPC cannot borrow the player clearing rig');
 player.x+=50;assert.equal(poseFor(sim,player),null,'lost contact releases the visual pose');
});

test('particles originate at displayed mouth and follow the selected exit direction',()=>{
 const {sim,story,player}=scene(),frame=creatureFrame(player);setCreatureDisplayFrame(player,{...frame,x:frame.x+2});
 const mouth=displayedMouthPoint(player),left=plumeParticles(sim);
 assert.ok(left.length>4);assert.ok(left.every(p=>p.x<mouth.x),'left blow carries every emitted grain left of mouth');
 story.direction='right';story.selected=1;player.facing=1;player.angle=0;
 const m=mouthPoint(player);player.x+=COLONY.pockets[1].x-m.x;player.y+=COLONY.pockets[1].y-m.y;
 setCreatureDisplayFrame(player,creatureFrame(player));const right=plumeParticles(sim);
 assert.ok(right.length>4&&right.every(p=>p.x>displayedMouthPoint(player).x));
 assert.deepEqual(plumeParticles(sim,true),plumeParticles(sim,true),'reduced motion conveys the same exit with a small static spray');
});

test('draw remains pure, retains changed colony when stopped, and caches bounded mask frames',async()=>{
 const {sim,story}=scene(),{renderer,calls}=recording();
 await withArt(renderer,async count=>{
  const before=JSON.stringify(sim);drawStory(renderer,sim,0);const built=count();
  calls.length=0;drawStory(renderer,sim,200);assert.equal(count(),built,'same mask phase reuses raster');assert.equal(JSON.stringify(sim),before);
  assert.equal(calls.filter(c=>c[0]==='save').length,calls.filter(c=>c[0]==='restore').length);
  story.mask=[1,0];story.phase='choose';story.intent=null;story.elapsed=0;sim.reefStories.active=null;
  calls.length=0;drawStory(renderer,sim,0);
  assert.equal(calls.filter(c=>c[0]==='drawImage').length,2,'clean colony and exactly one remaining dust mask survive Stop');
  assert.equal(calls.filter(c=>c[0]==='tag').length,0,'inactive story has no action labels');
  sim.current=5;calls.length=0;drawStory(renderer,sim,0);assert.equal(calls.length,0);
 });
});

test('reduced motion preserves clearing matte and pose while removing decorative travel',async()=>{
 const {sim}=scene(),{renderer,calls}=recording();renderer.reducedMotion=true;
 await withArt(renderer,async()=>{
  drawStory(renderer,sim,0);const first=calls.splice(0);drawStory(renderer,sim,450);
  assert.deepEqual(calls,first);assert.ok(calls.some(c=>c[0]==='ellipse'),'compact direction cue stays visible');
 });
});

test('habitat and effects layers keep the fish visible above coral and spray above mouth',async()=>{
 const {sim}=scene(),{renderer,calls}=recording();
 await withArt(renderer,async()=>{
  drawStory(renderer,sim,0,{layer:'habitat'});
  assert.equal(calls.filter(c=>c[0]==='drawImage').length,3);
  assert.equal(calls.filter(c=>c[0]==='ellipse').length,0);
  assert.equal(calls.filter(c=>c[0]==='tag').length,0);
  calls.length=0;drawStory(renderer,sim,0,{layer:'effects'});
  assert.equal(calls.filter(c=>c[0]==='drawImage').length,0);
  assert.ok(calls.some(c=>c[0]==='ellipse'));
 });
});

test('asset failure rejects load explicitly instead of drawing substitute coral geometry',async()=>{
 const previous=globalThis.Image;globalThis.Image=class{set src(v){queueMicrotask(()=>this.onerror());}};
 try{await assert.rejects(loadHousekeeperArt({}),/Could not load painted Pocillopora/);}
 finally{globalThis.Image=previous;}
});
