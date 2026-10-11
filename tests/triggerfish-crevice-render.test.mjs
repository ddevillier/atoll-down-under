import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {SPECIES} from '../src/data.js';
import {CREVICES,crevicePosition,crevicePose} from '../src/triggerfish-crevice.js';
import {CREVICE_FISH_ASSET,CREVICE_FISH_FRAME,loadCreviceArt,SPINE_ART,appearanceFor,spineTransform,drawCreviceCreature,drawStory} from '../src/triggerfish-crevice-render.js';

function fixture(stage='locked',spine=1){
 const point=crevicePosition(CREVICES[1],1),player={id:'player',incarnation:0,species:SPECIES[24],alive:true,...point,angle:CREVICES[1].angle,facing:1};
 const choose=stage==='choose',crevice={version:1,reef:4,actor:{id:'player',incarnation:0,species:'s24'},stage,crevice:choose?null:1,depth:choose?0:1,spine,entered:!choose,lockedOnce:['locked','releasing','exiting'].includes(stage),completed:false};
 const sections=[];sections[4]={entities:[]};return {current:4,phase:'playing',player,sections,section:sections[4],reefStories:{active:'crevice',crevice}};
}
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} differs from ${b}`);
function painted(){
 const operations=[];
 const context=()=>({globalAlpha:1,save(){},restore(){},translate(...a){operations.push(['translate',...a]);},rotate(...a){operations.push(['rotate',...a]);},scale(...a){operations.push(['scale',...a]);},drawImage(...a){operations.push(['image',...a]);},beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},stroke(){operations.push(['stroke']);},fill(){operations.push(['erase',this.globalCompositeOperation]);},getImageData(x,y,w,h){const data=new Uint8ClampedArray(w*h*4);data.fill(120);return {data,width:w,height:h};},putImageData(image){operations.push(['pixels',image]);}});
 const document={createElement(){const c={width:0,height:0},ctx=context();c.getContext=()=>ctx;return c;}};
 const renderer={ctx:context(),sprites:[],reefs:[],reducedMotion:false,uiUnit:1,tag(){}};renderer.sprites[24]={width:355,height:219};renderer.reefs[4]={width:1672,height:941};
 return {renderer,operations,document};
}

test('the painted spine endpoint agrees with physical contact throughout locking and release',()=>{
 for(const spine of [0,.2,.5,.85,1]){
  const sim=fixture(spine===1?'locked':'locking',spine),pose=crevicePose(sim),hinge=spineTransform(pose);
  const ox=(SPINE_ART.tip[0]-SPINE_ART.root[0])*pose.width,oy=(SPINE_ART.tip[1]-SPINE_ART.root[1])*pose.height;
  const x=hinge.root.x+hinge.scale*(ox*Math.cos(hinge.angle)-oy*Math.sin(hinge.angle));
  const y=hinge.root.y+hinge.scale*(ox*Math.sin(hinge.angle)+oy*Math.cos(hinge.angle));
  near(pose.x+x*Math.cos(pose.rotation)-y*Math.sin(pose.rotation),pose.spineTip.x);
  near(pose.y+x*Math.sin(pose.rotation)+y*Math.cos(pose.rotation),pose.spineTip.y);
  if(spine===1){near(pose.spineTip.x,pose.spineContact.x);near(pose.spineTip.y,pose.spineContact.y);}
 }
});

test('pause and reduced motion preserve the authoritative braced pose without state writes',()=>{
 const sim=fixture(),before=JSON.stringify(sim),renderer={reducedMotion:false};
 const moving=appearanceFor(renderer,sim,sim.player,1);sim.paused=true;renderer.reducedMotion=true;
 const held=appearanceFor(renderer,sim,sim.player,200);
 assert.deepEqual(held,moving);assert.equal(held.physical,true);assert.equal(held.rotation,CREVICES[1].angle);
 delete sim.paused;assert.equal(JSON.stringify(sim),before);
 assert.equal(appearanceFor(renderer,sim,{...sim.player}),null);
 sim.current=3;assert.equal(appearanceFor(renderer,sim,sim.player),null);
});

test('one painted spine is removed from the body before its separately posed draw',()=>{
 const previous=globalThis.document,{renderer,operations,document}=painted();globalThis.document=document;
 try{
  const sim=fixture(),before=JSON.stringify(sim);
  assert.equal(drawCreviceCreature(renderer.ctx,renderer,sim,sim.player),true);
  assert.equal(operations.filter(o=>o[0]==='erase'&&o[1]==='destination-out').length,1);
  const draws=operations.filter(o=>o[0]==='image');
  assert.notEqual(draws.at(-1)[1],draws.at(-2)[1],'the articulated spine and spineless body use separate paintings');
  assert.equal(JSON.stringify(sim),before);
  const count=operations.length;assert.equal(drawCreviceCreature(renderer.ctx,renderer,sim,{...sim.player}),false);assert.equal(operations.length,count);
 }finally{globalThis.document=previous;}
});

test('painted rocks bracket the same clearance used for body fit and stay frozen',()=>{
 const previous=globalThis.document,{renderer,operations,document}=painted();globalThis.document=document;
 try{
  const sim=fixture('choose',0),before=JSON.stringify(sim);drawStory(renderer,sim,1,'back');drawStory(renderer,sim,1,'front');
  const front=operations.filter(o=>o[0]==='image'&&o.length===6&&o[4]===224&&o[5]===60);
  assert.equal(front.length,6,'each of three openings owns two real painted edges');
  for(let i=0;i<3;i++){near(front[i*2][3]+58,-CREVICES[i].gap/2);near(front[i*2+1][3]+2,CREVICES[i].gap/2);}
  const baseline=operations.length;renderer.reducedMotion=true;sim.paused=true;drawStory(renderer,sim,200,'front');
  assert.ok(operations.length>baseline);delete sim.paused;assert.equal(JSON.stringify(sim),before);
 }finally{globalThis.document=previous;}
});

test('painted opening mattes erase crop corners and preserve the contact clearance without box outlines',()=>{
 const previous=globalThis.document,{renderer,operations,document}=painted();globalThis.document=document;
 try{
  const sim=fixture('choose',0);drawStory(renderer,sim,0,'back');drawStory(renderer,sim,0,'front');
  const mattes=operations.filter(o=>o[0]==='pixels').map(o=>o[1]);
  const cavity=mattes.find(m=>m.width===280),alpha=(m,x,y)=>m.data[(y*m.width+x)*4+3];
  for(const [x,y] of [[0,0],[279,0],[0,179],[279,179],[22,22],[257,157]])assert.equal(alpha(cavity,x,y),0);
  assert.equal(alpha(cavity,140,90),120,'the actual painted recess stays visible');
  const edges=mattes.filter(m=>m.width===224);assert.equal(edges.length,6);
  for(let i=0;i<6;i++){
   const edge=edges[i],upper=i%2===0;
   assert.equal(alpha(edge,97,upper?57:3),120,'contact column remains fully painted');
   assert.equal(alpha(edge,97,upper?58:2),0,'contact terminates at the authoritative roof/floor');
   for(let x=0;x<224;x++)assert.equal(alpha(edge,x,upper?58:2),0,'paint relief always recedes outside the clearance');
   assert.equal(alpha(edge,20,upper?57:3),0,'painted relief differs from a straight slab');
  }
  assert.equal(operations.filter(o=>o[0]==='stroke').length,0,'choose view has no box-shaped entrance strokes');
 }finally{globalThis.document=previous;}
});

test('named clown illustration keeps its alpha and the agreed physical frame',async()=>{
 const image=sharp(CREVICE_FISH_ASSET),meta=await image.metadata();
 assert.equal(meta.width,CREVICE_FISH_FRAME.width);assert.equal(meta.height,CREVICE_FISH_FRAME.height);assert.equal(meta.hasAlpha,true);
 const {data,info}=await image.raw().toBuffer({resolveWithObject:true});let clear=0,white=0,dark=0,gold=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
  const n=(y*info.width+x)*4,[r,g,b,a]=data.subarray(n,n+4);
  if(a<5)clear++;if(a<200)continue;
  if(y>info.height*.45&&y<info.height*.90&&x>info.width*.22){if(r>195&&g>190&&b>170)white++;if(Math.max(r,g,b)<85)dark++;}
  if(y<info.height*.48&&r>150&&g>110&&b<90)gold++;
 }
 assert.ok(clear>info.width*info.height*.25,'transparent reef space remains real alpha');
 assert.ok(white>1800&&dark>4000,'lower flank retains white markings against a dark body');assert.ok(gold>800,'gold upper saddle retains species identity');
});

test('catalog loader preserves padded fin clearance instead of trimming the physical frame',async()=>{
 const previous=globalThis.Image;let loads=0;
 globalThis.Image=class{width=355;height=219;set src(value){loads++;this.path=value;queueMicrotask(()=>this.onload());}};
 try{
  const renderer={sprites:[],bounds:[],extractCell(){throw new Error('Physical frame must not be trimmed');}};
  const a=loadCreviceArt(renderer),b=loadCreviceArt(renderer);assert.equal(a,b);await a;assert.equal(loads,1);
  assert.equal(renderer.sprites[24].path,CREVICE_FISH_ASSET);assert.deepEqual(renderer.bounds[24],{x:0,y:0,w:355,h:219});
 }finally{globalThis.Image=previous;}
});

test('wrong-size replacement art rejects instead of silently changing body clearance',async()=>{
 const previous=globalThis.Image;globalThis.Image=class{width=400;height=400;set src(value){queueMicrotask(()=>this.onload());}};
 try{const renderer={sprites:[],bounds:[]};await assert.rejects(loadCreviceArt(renderer),/physical frame/);assert.equal(renderer.sprites[24],undefined);}
 finally{globalThis.Image=previous;}
});
