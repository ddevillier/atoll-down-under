import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
import {SPECIES} from '../src/data.js';
import {mouthPoint} from '../src/feeding-contact.js';
import {initStory,storyAction,nestPhysicalPose,NEST_LEDGES} from '../src/gramma-nest.js';
import {drawStory,appearanceFor,materialFrame,jawOpening,NEST_JAW,NEST_LEDGE_ASSET} from '../src/gramma-nest-render.js';

function fixture(){
 const player={id:'player',species:SPECIES[3],x:620,y:370,facing:1,angle:0,health:100,energy:100,alive:true};
 const sim={player,current:4,phase:'playing',reefStories:{active:'nest'},point(x,y){this.pointer={x,y};},event(){}};
 initStory(sim);storyAction(sim,'nest-role');
 return {sim,s:sim.reefStories.nest};
}
function painter(reducedMotion=false){
 const paint=[],stack=[];
 const ctx={globalAlpha:1,save(){stack.push(this.globalAlpha);},restore(){this.globalAlpha=stack.pop();},beginPath(){},closePath(){},fill(){},stroke(){},lineTo(){},moveTo(){},scale(){},rotate(rotation){paint.push({kind:'rotate',rotation});},translate(x,y){paint.push({kind:'translate',x,y});},drawImage(sprite,...args){paint.push({kind:'image',sprite,args});},ellipse(x,y,rx,ry){paint.push({kind:'grain',x,y,rx,ry});}};
 return {ctx,paint,reducedMotion,foodSprites:[{width:100,height:120}],sprites:[],poses:new Map(),tag(){}};
}

test('carried painting meets the authoritative mouth upright and belly-up from both sides',()=>{
 const {sim,s}=fixture();s.ledge=0;s.stage='carry';s.material.carried=true;
 for(const facing of [-1,1]){
  sim.player.facing=facing;const p=painter();p.poses.set('player',{frame:{x:100,y:100,rotation:.3,facing:.25}});
  let frame=materialFrame(sim),physical=nestPhysicalPose(sim),mouth=mouthPoint(sim.player,physical);
  assert.equal(frame.x,mouth.x);assert.equal(frame.y,mouth.y);assert.equal(frame.rotation,0);assert.equal(frame.facing,facing);
  // A deliberate placement uses the same underside mouth, without decorative yaw.
  const side=facing===1?'left':'right';storyAction(sim,'nest-place',side);
  frame=materialFrame(sim);physical=nestPhysicalPose(sim);mouth=mouthPoint(sim.player,physical);
  assert.equal(physical.rotation,Math.PI);assert.equal(frame.x,mouth.x);assert.equal(frame.y,mouth.y);assert.equal(frame.facing,physical.facing);
  const app=appearanceFor(p,sim,sim.player,1);assert.equal(app.rotation,Math.PI);assert.equal(app.physical,true);assert.equal(app.pose.turn,0);
  storyAction(sim,'nest-cancel');
 }
});

test('reduced motion preserves physical orientation and material while removing decorative sway',()=>{
 const {sim,s}=fixture();s.ledge=0;s.stage='carry';s.material.carried=true;storyAction(sim,'nest-place','left');
 const a=painter(true),b=painter(true);drawStory(a,sim,1);drawStory(b,sim,100);assert.deepEqual(a.paint,b.paint);
 assert.equal(appearanceFor(a,sim,sim.player,1).rotation,Math.PI);
 assert.deepEqual(appearanceFor(a,sim,sim.player,1),appearanceFor(b,sim,sim.player,100));
 assert.ok(a.paint.some(p=>p.kind==='image'),'the carried painting is never removed');
});

test('left and right choices change the attached painting and persist after story stop',()=>{
 const {sim,s}=fixture();s.ledge=0;s.stage='complete';s.completed=s.inspected=s.cleared=true;s.material.placed=true;s.side='left';Object.assign(s.material,NEST_LEDGES[0].sockets.left);sim.reefStories.active=null;
 const before=JSON.stringify(sim),left=materialFrame(sim),a=painter();drawStory(a,sim,1);assert.equal(JSON.stringify(sim),before);
 assert.equal(a.paint.filter(p=>p.kind==='image').length,1);assert.equal(a.paint.filter(p=>p.kind==='grain').length,28);
 assert.ok(a.paint.filter(p=>p.kind==='grain').every(p=>Math.hypot(p.x-NEST_LEDGES[0].clear.x,p.y-NEST_LEDGES[0].clear.y)>40),'cleared sediment stays outside the entrance');
 s.side='right';Object.assign(s.material,NEST_LEDGES[0].sockets.right);const right=materialFrame(sim),b=painter();drawStory(b,sim,1);
 assert.equal(right.x-left.x,86);assert.equal(right.facing,-left.facing);assert.equal(right.rotation,-left.rotation);assert.notDeepEqual(a.paint,b.paint);
 assert.equal(appearanceFor(a,sim,sim.player,1),null);
 sim.current=0;const away=painter();drawStory(away,sim,1);assert.equal(away.paint.length,0);
});

test('jaw work is local to the painted mandible and only responds to real handling',()=>{
 const {sim}=fixture();assert.equal(jawOpening({material:{carried:false},job:null},1),0);
 const scene={material:{carried:false},job:{kind:'clear',contact:.3}};
 assert.notEqual(jawOpening(scene,1),jawOpening(scene,1.2));assert.equal(jawOpening(scene,1,true),jawOpening(scene,50,true));
 assert.ok(NEST_JAW.polygon.every(([,y])=>y>.49),'the physical upper lip stays outside the jaw mask');
 assert.ok(NEST_JAW.polygon.every(([,y])=>y>.38),'the protected eye stays outside the jaw mask');
 assert.equal(appearanceFor(painter(),sim,{...sim.player},1),null);
});

test('shipped overhang has real alpha water and rich painted pixels',async()=>{
 const {data,info}=await sharp(fileURLToPath(new URL('../'+NEST_LEDGE_ASSET,import.meta.url))).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const alpha=(u,v)=>data[(Math.floor(v*info.height)*info.width+Math.floor(u*info.width))*4+3];
 assert.ok(info.width>1000&&info.height>500);assert.equal(alpha(.5,.65),0,'the cave opening is transparent water');assert.ok(alpha(.5,.28)>200,'the roof is painted');
 const colors=new Set();for(let i=0;i<data.length;i+=4)if(data[i+3]>200)colors.add(data[i]+','+data[i+1]+','+data[i+2]);assert.ok(colors.size>10000,'ledge detail must come from painting');
});
