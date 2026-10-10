import test from 'node:test';
import assert from 'node:assert/strict';
import {skinPixel,artistSprite,appearanceFor,drawStory} from '../src/disappearing-artist-render.js';

const brightness=rgb=>rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
test('sand, shadow and mottled pigments are visibly distinct at the same painted pose',()=>{
 const means={};
 for(const pattern of ['sand','shadow','mottled']){
  let sum=0;for(let y=0;y<164;y+=3)for(let x=0;x<345;x+=3)sum+=brightness(skinPixel(pattern,x,y,345,164,[142,112,77]));
  means[pattern]=sum/(55*115);
 }
 assert.ok(means.sand-means.shadow>90,'sand must be much lighter than shadow');
 assert.ok(means.mottled-means.shadow>35,'mottled must remain distinct from shadow');
 assert.ok(means.sand-means.mottled>35,'sand must remain distinct from mottled');
 assert.deepEqual(skinPixel('sand',257,33,345,164,[234,188,33]),[234,188,33],'painted eye retains identity');
 assert.deepEqual(skinPixel('reef',80,90,345,164,[142,112,77]),skinPixel('mottled',80,90,345,164,[142,112,77]));
});
test('repaint keeps every source alpha and caches a stable image for articulation',()=>{
 const source={width:3,height:2,data:new Uint8ClampedArray([100,90,70,0,140,115,80,31,170,150,110,255,130,100,80,104,200,190,160,240,50,40,30,255])};
 const previous=globalThis.document;
 globalThis.document={createElement(){
  const canvas={width:0,height:0,data:null};
  canvas.getContext=()=>({drawImage(image){canvas.data=new Uint8ClampedArray(image.data);},getImageData(){return {data:new Uint8ClampedArray(canvas.data)};},putImageData(image){canvas.data=image.data;}});
  return canvas;
 }};
 try{
  const a=artistSprite({},source,'sand');
  assert.equal(artistSprite({},source,'sand'),a);
  assert.notEqual(artistSprite({},source,'shadow'),a);
  for(let i=3;i<source.data.length;i+=4)assert.equal(a.data[i],source.data[i]);
  assert.deepEqual([...source.data.slice(0,4)],[100,90,70,0]);
 }finally{globalThis.document=previous;}
});
test('presentation reads active disguise without awarding or mutating story progress',()=>{
 const player={species:{id:'s19'},x:100,y:200,blending:{kind:'sand'}};
 const story={phase:'passing',reef:3,anchor:{x:100,y:200},pattern:'shadow',match:.16,settle:1.48,successes:[],observer:null};
 const sim={player,current:3,reefStories:{active:'artist',artist:story},section:{entities:[]}};
 const before=JSON.stringify(sim);
 assert.deepEqual(appearanceFor(sim,player),{pattern:'shadow',strength:.74});
 drawStory({ctx:{},uiUnit:1},sim,20);
 assert.equal(JSON.stringify(sim),before);
 player.x=104;assert.equal(appearanceFor(sim,player),null);
 player.x=100;sim.reefStories.active='other';assert.equal(appearanceFor(sim,player),null);
});

