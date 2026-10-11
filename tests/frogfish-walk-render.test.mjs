import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {SPECIES} from '../src/data.js';
import {walkerPose,initStory,WALK_GRAPH,walkBodyClear} from '../src/frogfish-walk.js';
import {appearanceFor,drawCreature,drawStory,walkLandmarks,finPlacement} from '../src/frogfish-walk-render.js';

function simulation(phase='shift-front',elapsed=.1){
 const start=WALK_GRAPH.nodes.find(n=>n.id==='start'),edge=WALK_GRAPH.edges.find(e=>e.from===start.id&&WALK_GRAPH.nodes.find(n=>n.id===e.to).x>start.x);
 const player={id:'walker-render',incarnation:4,species:SPECIES[54],x:start.x,y:start.y-32,facing:1,health:100,energy:100};
 const sim={mode:'practice',phase:'playing',current:4,player,reefStories:{active:'walker'}};
 const s=initStory(sim);Object.assign(s,{stage:'walk',phase,facing:1,node:start.id,selected:edge.to,gait:{from:start.id,to:edge.to,phase,stride:0,elapsed}});
 return sim;
}
function paintedToe(limb){const [a,b,c,d,x,y]=limb.matrix,dx=limb.sourceTip.x-limb.sourceRoot.x,dy=limb.sourceTip.y-limb.sourceRoot.y;return {x:a*dx+c*dy+x,y:b*dx+d*dy+y};}
function context(){const calls=[];return {calls,globalAlpha:1,save(){},restore(){},translate(){},rotate(){},scale(){},transform(...matrix){calls.push({type:'transform',matrix});},drawImage(image,...args){calls.push({type:'image',image,args});},beginPath(){},ellipse(...args){calls.push({type:'shadow',args});},fill(){},moveTo(){},lineTo(){},stroke(){}};}
function renderer(){const ctx=context(),image={width:343,height:243},parts=['tail','anal','pectoral','pelvic','lure','jaw'].map(name=>({name,canvas:{name,width:50,height:50},left:0,top:0})),body={name:'body'};
 return {ctx,sprites:{54:image},poses:new Map(),reducedMotion:false,walkerParts:{prepare(){return {body,pieces:parts};}}};}

test('actual affine painted toes stay planted while the shoulders and body transfer',()=>{
 const sim=simulation('shift-front',.02),a=walkerPose(sim,sim.player),first=walkLandmarks(a,81.25,81.25*243/343);
 sim.reefStories.walker.gait.elapsed=.24;
 const b=walkerPose(sim,sim.player),second=walkLandmarks(b,81.25,81.25*243/343);
 assert.ok(b.body.x>a.body.x+1.5,'weight transfer must move the body');
 for(let i=0;i<first.length;i++){
  assert.equal(first[i].planted,true);assert.ok(Math.hypot(paintedToe(first[i]).x-paintedToe(second[i]).x,paintedToe(first[i]).y-paintedToe(second[i]).y)<1e-8);
  assert.ok(second[i].root.x>first[i].root.x+1.5,'actual fin shoulder travels over the fixed toe');
  assert.ok(Math.hypot(paintedToe(first[i]).x-first[i].tip.x,paintedToe(first[i]).y-first[i].tip.y)<1e-9);
 }
});
test('a swinging painted pectoral fin lifts before replant and keeps its root attached',()=>{
 const sim=simulation('swing-front',.125),pose=walkerPose(sim,sim.player),limbs=walkLandmarks(pose,81.25,57.56),ground=WALK_GRAPH.nodes.find(n=>n.id==='start').y;
 for(const limb of limbs){assert.ok(Number.isFinite(limb.matrix.reduce((a,b)=>a+b,0)));assert.ok(Math.hypot(paintedToe(limb).x-limb.tip.x,paintedToe(limb).y-limb.tip.y)<1e-8);if(limb.kind==='pectoral'){assert.equal(limb.planted,false);assert.ok(limb.tip.y<ground-4);}else assert.equal(limb.planted,true);}
});
test('the world rig paints exactly four actual walking fins and no duplicate swimming fins',()=>{
 const sim=simulation(),r=renderer(),snapshot=JSON.stringify(sim);assert.equal(drawCreature(r,sim,sim.player,10),true);
 const images=r.ctx.calls.filter(c=>c.type==='image');
 assert.equal(images.filter(c=>c.image.name==='pectoral').length,2);
 assert.equal(images.filter(c=>c.image.name==='pelvic').length,2);
 assert.equal(images.filter(c=>c.image.name==='body').length,1);
 assert.equal(r.ctx.calls.filter(c=>c.type==='transform').length,4);
 assert.equal(r.poses.get(sim.player.id).walkingLimbs.length,4);
 assert.ok(r.poses.get(sim.player.id).walkingLimbs.every(limb=>limb.painted===true));
 assert.equal(JSON.stringify(sim),snapshot,'presentation cannot advance mechanics or awards');
});
test('reduced motion retains necessary mechanical poses and pause frames ignore render clock',()=>{
 const sim=simulation(),r=renderer();r.reducedMotion=true;sim.paused=true;
 drawCreature(r,sim,sim.player,1);const first=JSON.stringify(r.ctx.calls);r.ctx.calls.length=0;
 drawCreature(r,sim,sim.player,999);assert.equal(JSON.stringify(r.ctx.calls),first);
 assert.equal(appearanceFor(r,sim,sim.player,999).physical,true);
});
test('detachment and unrelated fish immediately return to ordinary creature drawing',()=>{
 const sim=simulation(),r=renderer();sim.reefStories.walker.phase='detached';sim.reefStories.walker.gait=null;
 assert.equal(drawCreature(r,sim,sim.player),false);assert.equal(r.ctx.calls.length,0);
 sim.reefStories.walker.phase='stance';assert.equal(drawCreature(r,sim,{...sim.player,id:'neighbor'}),false);
});
test('ordinary display picking without a simulation has no walking appearance',()=>{
 const r=renderer(),fish=simulation().player;
 assert.equal(appearanceFor(r,undefined,fish),null);assert.equal(appearanceFor(r,null,fish),null);
 assert.equal(drawCreature(r,undefined,fish),false);assert.equal(r.ctx.calls.length,0);
});
test('terrain draws painted ramps and supports with no render-time story mutation',()=>{
 const sim=simulation(),r=renderer();r.walkerArt={ledge:{name:'ledge'},sponge:{name:'sponge'}};const before=JSON.stringify(sim);
 drawStory(r,sim,999);assert.equal(JSON.stringify(sim),before);
 assert.equal(r.ctx.calls.filter(c=>c.type==='image'&&c.image.name==='ledge').length,WALK_GRAPH.nodes.length+WALK_GRAPH.edges.length);
 assert.equal(r.ctx.calls.filter(c=>c.type==='image'&&c.image.name==='sponge').length,1);
});
test('painted fin toes stay exact through body inclination and a planted yaw turn',()=>{
 for(const rotation of [-.65,0,.42])for(const facing of [-1,-.25,0,.25,1])for(const kind of ['pectoral','pelvic']){
  const contact={id:kind+'-near',kind,x:804,y:620,planted:true},pose={body:{x:800,y:588,rotation,facing}},limb=finPlacement(pose,contact,81.25,57.56),toe=paintedToe(limb);
  assert.ok(Number.isFinite(limb.matrix.reduce((a,b)=>a+b,0)));
  assert.ok(Math.hypot(toe.x-contact.x,toe.y-contact.y)<1e-8);
 }
});
test('both complete routes keep actual painted feet supported and the moving body clear',()=>{
 for(const edge of WALK_GRAPH.edges){
  const a=WALK_GRAPH.nodes.find(n=>n.id===edge.from),b=WALK_GRAPH.nodes.find(n=>n.id===edge.to),count=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/14),facing=a.id==='start'?1:Math.sign(a.x-800);
  const roof=x=>{const [x1,y1,x2,y2]=edge.surface,t=Math.max(0,Math.min(1,(x-x1)/(x2-x1)));return y1+(y2-y1)*t;};
  for(let stride=0;stride<count;stride++)for(const phase of ['swing-front','shift-front','swing-rear','shift-rear']){
   let first=null,last=null;
   for(const fraction of [0,.25,.5,.75,1]){
    const sim=simulation(),s=sim.reefStories.walker;Object.assign(s,{node:a.id,selected:b.id,facing,phase,gait:{from:a.id,to:b.id,stride,phase,elapsed:fraction*(phase.startsWith('swing')?.25:.3)}});
    const pose=walkerPose(sim,sim.player),limbs=walkLandmarks(pose,81.25,81.25*243/343);assert.equal(walkBodyClear(pose.body),true,edge.to+' '+phase+' body must clear every painted solid');
    for(const limb of limbs){
     const toe=paintedToe(limb);assert.ok(Math.hypot(toe.x-limb.tip.x,toe.y-limb.tip.y)<1e-8);
     assert.ok(Math.hypot(limb.root.x-toe.x,limb.root.y-toe.y)<=50.1,'painted fin reach must remain within the physical bound');
     if(limb.planted)assert.ok(Math.abs(toe.y-roof(toe.x))<1e-8,'painted planted toe must sit on its actual flat or inclined support');
    }
    first??=limbs;last=limbs;
   }
   if(phase.startsWith('shift'))for(let i=0;i<first.length;i++)assert.ok(Math.hypot(paintedToe(first[i]).x-paintedToe(last[i]).x,paintedToe(first[i]).y-paintedToe(last[i]).y)<1e-8,'all planted painted toes remain fixed throughout body transfer');
  }
 }
});
test('painted terrain assets retain transparency and recorded built-in provenance',async()=>{
 const provenance=JSON.parse(await readFile(new URL('../assets/story-walker/provenance.json',import.meta.url),'utf8'));
 assert.equal(provenance.tool,'built-in image_gen.imagegen');
 for(const asset of ['limestone-ledge-v1.png','orange-sponge-v1.png']){const buffer=await readFile(new URL('../assets/story-walker/'+asset,import.meta.url));assert.equal(buffer.subarray(1,4).toString(),'PNG');assert.equal(buffer[25],6,'RGBA source must preserve generated transparency');}
});
