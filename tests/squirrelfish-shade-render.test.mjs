import test from 'node:test';
import assert from 'node:assert/strict';
import {SPECIES} from '../src/data.js';
import {shadeSite} from '../src/squirrelfish-shade.js';
import {appearanceFor,poseFor,ledgeAlpha,drawStory} from '../src/squirrelfish-shade-render.js';

function fixture(){
 const shade={version:1,reef:8,site:0,stage:'inspect',neighbor:{id:81,incarnation:2,species:'s12'},observed:false,crowded:true,reacted:false,crowdAt:{x:332,y:230},crowdPlayer:{x:410,y:270},choice:null,selected:null,response:'orienting',pulse:0,pulseClock:0,settled:0,complete:false};
 const site=shadeSite(shade),neighbor={id:81,incarnation:2,species:SPECIES[12],...site.home,facing:1,angle:0,alive:true,health:100,activity:'cruising'};
 const player={id:'player',species:SPECIES[12],x:site.inspect.x,y:site.inspect.y,facing:-1,alive:true,health:100};
 return {player,current:8,phase:'playing',paused:false,section:{entities:[neighbor]},reefStories:{active:'shade',shade}};
}
function painter(reducedMotion=false){
 const marks=[],labels=[],stack=[];
 const ctx={globalAlpha:1,save(){stack.push(this.globalAlpha);},restore(){this.globalAlpha=stack.pop();},beginPath(){},rect(...args){marks.push(['clip-bound',...args]);},clip(){},moveTo(x,y){marks.push(['move',x,y]);},lineTo(x,y){marks.push(['line',x,y]);},quadraticCurveTo(...args){marks.push(['curve',...args]);},arc(...args){marks.push(['arc',...args,this.globalAlpha]);},stroke(){marks.push(['stroke',this.strokeStyle,this.lineWidth,this.globalAlpha]);},drawImage(...args){marks.push(['image',...args]);}};
 return {ctx,marks,labels,reducedMotion,uiUnit:1,tag(c,x,y,text,alpha,priority){labels.push({x,y,text,alpha,priority});}};
}

test('real same-incarnation neighbor owns the side-on and resting presentation',()=>{
 const sim=fixture(),neighbor=sim.section.entities[0],r=painter();
 const oriented=appearanceFor(r,sim,neighbor,30);assert.ok(oriented.pose.brake>.7);assert.ok(oriented.pose.effort>.1);assert.ok(oriented.rotation<0);
 assert.equal(appearanceFor(r,sim,{...neighbor}),null,'an unrelated object cannot inherit the pose');
 assert.equal(appearanceFor(r,sim,sim.player),null,'normal pointer swimming keeps its ordinary posture');
 sim.reefStories.shade.response='settled';sim.reefStories.shade.stage='settle';sim.reefStories.shade.choice='alcove';sim.reefStories.shade.selected=shadeSite(sim).alcove;
 Object.assign(sim.player,sim.reefStories.shade.selected);
 const resting=appearanceFor(r,sim,neighbor);assert.ok(resting.pose.effort<oriented.pose.effort);assert.ok(Math.abs(resting.rotation)<Math.abs(oriented.rotation));
 assert.ok(appearanceFor(r,sim,sim.player).pose.brake>.4);assert.deepEqual(poseFor(r,sim,neighbor),resting.pose);
 neighbor.incarnation++;assert.equal(appearanceFor(r,sim,neighbor),null);
});

test('sound is a short directional ripple with a persistent visual caption in muted play',()=>{
 const sim=fixture(),r=painter();sim.sound=false;const before=JSON.stringify(sim);drawStory(r,sim,1);
 assert.equal(JSON.stringify(sim),before);assert.equal(r.ctx.globalAlpha,1);
 assert.ok(r.labels.some(l=>l.text==='Pulse in the shade'));
 const arcs=r.marks.filter(m=>m[0]==='arc');assert.equal(arcs.length,4);
 assert.ok(arcs.every(m=>m[3]<40&&m[5]-m[4]<Math.PI),'clue uses local directed crescents, not circles');
 const right=arcs[0];sim.player.x=sim.section.entities[0].x-75;const left=painter();drawStory(left,sim,1);
 assert.ok(Math.abs(left.marks.find(m=>m[0]==='arc')[4]-right[4])>1,'ripple points toward the real observer');
 assert.ok(r.marks.some(m=>m[0]==='line'),'the actual fish gets a local eye/fin orientation cue');
});

test('pause and reduced motion preserve essential clues without advancing a presentation clock',()=>{
 const sim=fixture();sim.paused=true;sim.reefStories.shade.pulse=.7;
 const a=painter(),b=painter();drawStory(a,sim,1);drawStory(b,sim,900);assert.deepEqual(a.marks,b.marks);assert.deepEqual(a.labels,b.labels);
 const c=painter(true),d=painter(true);drawStory(c,sim,1);sim.reefStories.shade.pulse=.1;drawStory(d,sim,900);
 assert.deepEqual(c.marks.filter(m=>m[0]==='arc').map(m=>m.slice(0,-1)),d.marks.filter(m=>m[0]==='arc').map(m=>m.slice(0,-1)));
 assert.ok(c.labels.some(l=>l.text==='Pulse in the shade'));
});

test('both spatial choices stay readable and completion quiets the sound cue',()=>{
 const sim=fixture(),s=sim.reefStories.shade;s.observed=true;s.stage='space';s.choice='alcove';s.selected=shadeSite(sim).alcove;
 const r=painter();drawStory(r,sim,2);assert.deepEqual(r.labels.map(l=>l.text),['Pulse in the shade','Your resting place','More room']);
 assert.ok(r.labels.every(l=>Number.isFinite(l.x)&&Number.isFinite(l.y)));
 s.complete=true;s.stage='complete';s.response='settled';const done=painter();done.inspect=true;drawStory(done,sim,90);
 assert.deepEqual(done.labels.map(l=>l.text),['Resting separately']);assert.equal(done.marks.filter(m=>m[0]==='arc').length,0);
});

test('missing, unavailable, distant, offscreen and inactive neighbors have no invented cues',()=>{
 for(const modify of [sim=>sim.section.entities[0].incarnation++,sim=>sim.section.entities[0].hidden=true,sim=>sim.player.x=1500,sim=>sim.current=7,sim=>sim.reefStories.active=null]){
  const sim=fixture();modify(sim);const r=painter();drawStory(r,sim,1);assert.equal(r.marks.length,0);assert.equal(r.labels.length,0);assert.equal(appearanceFor(r,sim,sim.section.entities[0]),null);
 }
});

test('foreground alpha follows original rock/coral colors and leaves the turquoise cavity open',()=>{
 assert.equal(ledgeAlpha(6,17,23),0);assert.ok(ledgeAlpha(78,87,45)>240);assert.ok(ledgeAlpha(121,58,51)>240);
 assert.ok(ledgeAlpha(7,83,108)<ledgeAlpha(78,87,45),'blue cavity pixels must not turn into an opaque veil');
});

test('painted ledge occlusion reuses actual source pixels at the exact background coordinate',()=>{
 const previous=globalThis.document,canvases=[],source={width:1672,height:941};
 globalThis.document={createElement(){
  const canvas={width:0,height:0,sourceDraw:null,data:null};canvases.push(canvas);
  canvas.getContext=()=>({drawImage(...args){canvas.sourceDraw=args;},getImageData(x,y,w,h){const data=new Uint8ClampedArray(w*h*4);for(let i=0;i<data.length;i+=4)data.set(i%8?[6,17,23,255]:[78,87,45,255],i);return {data};},putImageData(image){canvas.data=image.data;}});return canvas;
 }};
 try{
  const sim=fixture(),r=painter();r.reefs=[];r.reefs[8]=source;const before=JSON.stringify(sim);drawStory(r,sim,10);drawStory(r,sim,90);
  assert.equal(JSON.stringify(sim),before);assert.equal(canvases.length,1,'small matte is cached, never re-extracted per frame');
  const image=r.marks.find(m=>m[0]==='image'),canvas=canvases[0],x=image[2],y=image[3];assert.equal(image[1],canvas);
  assert.equal(x,shadeSite(sim).home.x-100);assert.equal(y,shadeSite(sim).home.y+4,'eye and dorsal remain outside the lower foreground crop');
  assert.equal(canvas.sourceDraw[1],x*1672/1600);assert.equal(canvas.sourceDraw[2],(y+55)*941/900);
  assert.ok(canvas.data.some((n,i)=>i%4===3&&n===255));assert.ok(canvas.data.some((n,i)=>i%4===3&&n===0));
  for(let i=0;i<canvas.data.length;i+=4)assert.ok(canvas.data[i]===78||canvas.data[i]===6,'matte preserves the original painted pigment');
 }finally{globalThis.document=previous;}
});
